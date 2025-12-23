import os
from typing import List, Optional

import google.generativeai as genai
from openai import OpenAI
from anthropic import Anthropic

# Provider selection
_embedding_provider = os.getenv("EMBEDDING_PROVIDER", "").lower()
_llm_provider = os.getenv("LLM_PROVIDER", "").lower()

# Gemini
_gemini_configured = False
_gemini_embed_model = os.getenv("GEMINI_EMBED_MODEL")
_gemini_gen_models = [
  m.strip()
  for m in os.getenv("GEMINI_GEN_MODELS", "").split(",")
  if m.strip()
]

# OpenAI
_openai_embed_model = os.getenv("OPENAI_EMBED_MODEL")
_openai_llm_model = os.getenv("OPENAI_LLM_MODEL")

# Anthropic (Claude)
_claude_model = os.getenv("CLAUDE_MODEL")


def _get_gemini_key() -> Optional[str]:
  return os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")


def have_embedding_provider() -> bool:
  if _embedding_provider == "gemini":
    return bool(_get_gemini_key() and _gemini_embed_model)
  if _embedding_provider == "openai":
    return bool(os.getenv("OPENAI_API_KEY") and _openai_embed_model)
  return False


def have_llm_provider() -> bool:
  if _llm_provider == "gemini":
    return bool(_get_gemini_key() and _gemini_gen_models)
  if _llm_provider == "openai":
    return bool(os.getenv("OPENAI_API_KEY") and _openai_llm_model)
  if _llm_provider == "anthropic":
    return bool(os.getenv("ANTHROPIC_API_KEY") and _claude_model)
  return False


def _configure_gemini():
  global _gemini_configured
  if _gemini_configured:
    return
  api_key = _get_gemini_key()
  if api_key:
    genai.configure(api_key=api_key)
    _gemini_configured = True


def embed_with_provider(text: str) -> Optional[List[float]]:
  """
  Embed text using the configured provider/model from env.
  Supported: gemini, openai. Returns None if not configured or on failure.
  """
  if _embedding_provider == "gemini":
    if not have_embedding_provider():
      print("[gemini] embedding skipped: missing key or GEMINI_EMBED_MODEL")
      return None
    _configure_gemini()
    try:
      resp = genai.embed_content(
        model=_gemini_embed_model,
        content=text,
        task_type="retrieval_document",
      )
      return resp["embedding"]  # type: ignore[index]
    except Exception as exc:
      print(f"[gemini] embedding failed: {exc}")
      return None

  if _embedding_provider == "openai":
    if not have_embedding_provider():
      print("[openai] embedding skipped: missing OPENAI_API_KEY or OPENAI_EMBED_MODEL")
      return None
    try:
      client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
      resp = client.embeddings.create(model=_openai_embed_model, input=text)
      vec = resp.data[0].embedding  # type: ignore[assignment]
      return vec
    except Exception as exc:
      print(f"[openai] embedding failed: {exc}")
      return None

  print("[embed] no embedding provider configured (set EMBEDDING_PROVIDER).")
  return None


def generate_with_provider(prompt: str, system: str = "") -> Optional[str]:
  """
  Generate text using the configured provider/model from env.
  Supported: gemini, openai, anthropic. Returns None if not configured or on failure.
  """
  if _llm_provider == "gemini":
    if not have_llm_provider():
      print("[gemini] generation skipped: missing key or GEMINI_GEN_MODELS")
      return None
    _configure_gemini()
    for model_name in _gemini_gen_models:
      model = genai.GenerativeModel(model_name)
      try:
        resp = model.generate_content("\n\n".join([m for m in [system, prompt] if m]))
        return resp.text
      except Exception as exc:
        print(f"[gemini] generation failed for {model_name}: {exc}")
        continue
    return None

  if _llm_provider == "openai":
    if not have_llm_provider():
      print("[openai] generation skipped: missing OPENAI_API_KEY or OPENAI_LLM_MODEL")
      return None
    try:
      client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
      messages = []
      if system:
        messages.append({"role": "system", "content": system})
      messages.append({"role": "user", "content": prompt})
      resp = client.chat.completions.create(model=_openai_llm_model, messages=messages)
      return resp.choices[0].message.content  # type: ignore[return-value]
    except Exception as exc:
      print(f"[openai] generation failed: {exc}")
      return None

  if _llm_provider == "anthropic":
    if not have_llm_provider():
      print("[anthropic] generation skipped: missing ANTHROPIC_API_KEY or CLAUDE_MODEL")
      return None
    try:
      client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
      resp = client.messages.create(
        model=_claude_model,
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
        system=system or None,
      )
      # Anthropic returns a list of content blocks
      for block in resp.content:
        if hasattr(block, "text"):
          return block.text  # type: ignore[attr-defined]
      return None
    except Exception as exc:
      print(f"[anthropic] generation failed: {exc}")
      return None

  print("[llm] no LLM provider configured (set LLM_PROVIDER).")
  return None
