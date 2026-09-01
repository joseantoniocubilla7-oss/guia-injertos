#!/usr/bin/env python3
"""
Se dispara cuando alguien comenta en un Issue con la etiqueta 'papers-borrador'.
Si el comentario es "ok" (sin importar mayúsculas/espacios), toma el bloque
JSON embebido en el cuerpo del Issue, lo agrega al array PAPERS de App.jsx,
hace commit a main, comenta la confirmación y cierra el Issue.

Si el comentario no es "ok", no hace nada.
"""

import os
import re
import json
import subprocess
import urllib.request

GITHUB_TOKEN = os.environ["GITHUB_TOKEN"]
GITHUB_REPOSITORY = os.environ["GITHUB_REPOSITORY"]
EVENT_PATH = os.environ["GITHUB_EVENT_PATH"]

APP_JSX_PATH = "App.jsx"
MARKER = "// AGENTE: agregar nuevos papers arriba de esta línea"


def api_request(url, method="GET", payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "Accept": "application/vnd.github+json",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read()) if resp.length != 0 else None


def run(cmd):
    subprocess.run(cmd, check=True)


def main():
    with open(EVENT_PATH) as f:
        event = json.load(f)

    comment_body = event["comment"]["body"].strip().lower()
    if comment_body != "ok":
        print(f"Comentario ignorado (no es 'ok'): {comment_body!r}")
        return

    issue = event["issue"]
    labels = [l["name"] for l in issue.get("labels", [])]
    if "papers-borrador" not in labels:
        print("El Issue no tiene la etiqueta 'papers-borrador'. Ignorado.")
        return

    issue_number = issue["number"]
    issue_body = issue["body"] or ""

    match = re.search(r"<!-- PAPER_DATA_START -->\s*```json\s*(.*?)\s*```\s*<!-- PAPER_DATA_END -->", issue_body, re.DOTALL)
    if not match:
        print("No se encontró el bloque JSON en el Issue. No se puede procesar.")
        return

    paper = json.loads(match.group(1))

    # Armar el bloque de texto JS para insertar en el array PAPERS
    tags_js = ", ".join(json.dumps(t, ensure_ascii=False) for t in paper.get("tags", []))
    entry = (
        "  {\n"
        f"    titulo: {json.dumps(paper['titulo'], ensure_ascii=False)},\n"
        f"    revista: {json.dumps(paper['revista'], ensure_ascii=False)},\n"
        f"    fecha: {json.dumps(paper['fecha'], ensure_ascii=False)},\n"
        f"    tags: [{tags_js}],\n"
        f"    nuevo: true,\n"
        f"    resumen: {json.dumps(paper['resumen'], ensure_ascii=False)},\n"
        "  },\n"
    )

    with open(APP_JSX_PATH, encoding="utf-8") as f:
        content = f.read()

    if MARKER not in content:
        api_request(
            f"https://api.github.com/repos/{GITHUB_REPOSITORY}/issues/{issue_number}/comments",
            method="POST",
            payload={
                "body": (
                    "⚠️ No encontré el marcador `" + MARKER + "` en App.jsx, "
                    "así que no pude agregar este paper automáticamente. "
                    "Agregalo a mano esta vez, y avisá para revisar el marcador."
                )
            },
        )
        return

    new_content = content.replace(MARKER, entry + "  " + MARKER)

    with open(APP_JSX_PATH, "w", encoding="utf-8") as f:
        f.write(new_content)

    run(["git", "config", "user.name", "agente-guiadeinjertos"])
    run(["git", "config", "user.email", "actions@github.com"])
    run(["git", "add", APP_JSX_PATH])
    run(["git", "commit", "-m", f"Agregar paper aprobado en Issue #{issue_number}"])
    run(["git", "push"])

    api_request(
        f"https://api.github.com/repos/{GITHUB_REPOSITORY}/issues/{issue_number}/comments",
        method="POST",
        payload={"body": "✅ Agregado a `App.jsx` y publicado. El sitio se va a actualizar solo en unos minutos."},
    )
    api_request(
        f"https://api.github.com/repos/{GITHUB_REPOSITORY}/issues/{issue_number}",
        method="PATCH",
        payload={"state": "closed"},
    )


if __name__ == "__main__":
    main()
