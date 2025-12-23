from typing import List

from .models import Finding


def scan_content(path: str, content: str) -> List[Finding]:
  findings: List[Finding] = []
  for idx, line in enumerate(content.splitlines(), start=1):
    lower = line.lower()
    if "todo" in lower or "fixme" in lower:
      findings.append(Finding(severity="info", line=idx, message="TODO/FIXME left in code"))
    if "console.log" in lower:
      findings.append(Finding(severity="warning", line=idx, message="console.log present"))
    if "eval(" in lower:
      findings.append(Finding(severity="error", line=idx, message="Avoid eval; security risk"))
    if len(line) > 160:
      findings.append(Finding(severity="info", line=idx, message="Very long line; consider wrapping"))
  if not findings:
    findings.append(Finding(severity="info", line=0, message="No obvious issues in sampled file"))
  return findings
