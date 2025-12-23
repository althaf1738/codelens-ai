import fs from "fs";
import path from "path";
import { Project } from "./types";

const dataDir = path.join(process.cwd(), ".data");
const storeFile = path.join(dataDir, "store.json");

interface StoreShape {
  projects: Project[];
}

function ensureStore(): StoreShape {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(storeFile)) {
    const initial: StoreShape = { projects: [] };
    fs.writeFileSync(storeFile, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
  const raw = fs.readFileSync(storeFile, "utf-8");
  return JSON.parse(raw) as StoreShape;
}

function writeStore(store: StoreShape) {
  fs.writeFileSync(storeFile, JSON.stringify(store, null, 2), "utf-8");
}

export function listProjects(): Project[] {
  return ensureStore().projects;
}

export function findProject(id: string): Project | undefined {
  return ensureStore().projects.find((p) => p.id === id);
}

export function saveProject(project: Project) {
  const store = ensureStore();
  const idx = store.projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) {
    store.projects[idx] = project;
  } else {
    store.projects.push(project);
  }
  writeStore(store);
}
