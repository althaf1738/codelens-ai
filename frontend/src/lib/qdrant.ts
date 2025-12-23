import { QdrantClient } from "@qdrant/js-client-rest";
import { CodeChunk } from "./types";
import { cosineSimilarity } from "./utils";

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

function getClient() {
  if (!QDRANT_URL) return undefined;
  return new QdrantClient({ url: QDRANT_URL, apiKey: QDRANT_API_KEY });
}

export async function ensureCollection(name: string) {
  const client = getClient();
  if (!client) return;
  const existing = await client.getCollections();
  const present = existing.collections?.find((c) => c.name === name);
  if (!present) {
    await client.createCollection(name, {
      vectors: { size: 32, distance: "Cosine" }
    });
  }
}

export async function upsertChunks(collection: string, chunks: CodeChunk[]) {
  const client = getClient();
  if (!client) return;
  await ensureCollection(collection);
  await client.upsert(collection, {
    wait: true,
    points: chunks.map((chunk) => ({
      id: chunk.id,
      vector: chunk.embedding,
      payload: {
        path: chunk.path,
        startLine: chunk.startLine,
        endLine: chunk.endLine,
        lang: chunk.lang
      }
    }))
  });
}

interface RetrievalResult {
  chunk: CodeChunk;
  score: number;
}

export async function searchChunks(
  collection: string,
  needle: number[],
  stored: CodeChunk[],
  limit = 6
): Promise<RetrievalResult[]> {
  const client = getClient();
  if (client) {
    try {
      const res = await client.search(collection, {
        vector: needle,
        limit,
        with_payload: true
      });
      return res.map((item) => {
        const chunk = stored.find((c) => c.id === String(item.id));
        if (!chunk) {
          return {
            chunk: {
              id: String(item.id),
              projectId: "unknown",
              path: item.payload?.path as string,
              startLine: (item.payload?.startLine as number) ?? 0,
              endLine: (item.payload?.endLine as number) ?? 0,
              text: "",
              embedding: needle
            },
            score: item.score ?? 0
          };
        }
        return { chunk, score: item.score ?? 0 };
      });
    } catch (err) {
      console.error("Qdrant search failed, falling back to local similarity:", err);
    }
  }
  // Local similarity fallback
  return stored
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(needle, chunk.embedding)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
