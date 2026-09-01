#!/usr/bin/env python3
"""
Agente semanal de vigilancia de literatura para guiadeinjertos.com

Qué hace:
1. Busca en PubMed artículos nuevos por tema y por autores seguidos.
2. Para cada uno, pide a Claude un borrador estructurado (título en español,
   resumen, tags) en el mismo formato que usa el array PAPERS de la app.
3. Crea UN GitHub Issue POR PAPER, con los datos en un bloque JSON oculto.

Nada se publica solo. Recién cuando José comenta "ok" en un Issue,
el workflow aprobar-paper.yml toma ese paper puntual y lo agrega a la app.
"""

import os
import json
import time
import re
import urllib.request
import urllib.parse

PUBMED_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

SEARCH_TERMS = [
    "ACL graft diameter",
    "ACL reconstruction technique",
    "PCL reconstruction graft",
    "medial collateral ligament reconstruction",
    "lateral collateral ligament reconstruction",
    "posterolateral corner reconstruction",
    "lateral extra-articular tenodesis",
    "internal brace ACL",
    "remnant preservation ACL",
]

AUTHOR_SEARCHES = [
    'Alvarez-Salinas E[Author]',
    'Canuto SMG[Author]',
    'Helito CP[Author]',
    'LaPrade RF[Author]',
    'Sonnery-Cottet B[Author]',
    'Musahl V[Author]',
    'Getgood A[Author]',
    'Siebold R[Author]',
    'Zaffagnini S[Author]',
]

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
GITHUB_REPOSITORY = os.environ.get("GITHUB_REPOSITORY")


def pubmed_search(term, days_back=8):
    params = {
        "db": "pubmed",
        "term": f"{term} AND (\"last {days_back} days\"[dp])",
        "retmax": "5",
        "retmode": "json",
    }
    url = f"{PUBMED_BASE}/esearch.fcgi?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url) as resp:
        data = json.loads(resp.read())
    return data.get("esearchresult", {}).get("idlist", [])


def pubmed_summary(pmid):
    params = {"db": "pubmed", "id": pmid, "retmode": "json"}
    url = f"{PUBMED_BASE}/esummary.fcgi?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url) as resp:
        data = json.loads(resp.read())
    doc = data.get("result", {}).get(pmid, {})
    return {
        "pmid": pmid,
        "titulo_original": doc.get("title", ""),
        "revista": doc.get("fulljournalname", doc.get("source", "")),
        "fecha": doc.get("pubdate", ""),
        "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
    }


def draft_with_claude(article):
    """Pide a Claude un objeto JSON estructurado, listo para insertar en la app."""
    fallback = {
        "titulo": article["titulo_original"],
        "resumen": "[Revisar manualmente: falta ANTHROPIC_API_KEY o hubo un error]",
        "tags": [],
    }
    if not ANTHROPIC_API_KEY:
        return {**article, **fallback}

    prompt = f"""Paper real de PubMed:

Título original: {article['titulo_original']}
Revista: {article['revista']}
Fecha: {article['fecha']}

Devolvé SOLO un objeto JSON (sin markdown, sin explicación, sin ```), con
estas claves exactas:
- "titulo": el título adaptado al español, tono técnico, para instrumentadores
  quirúrgicos y cirujanos ortopédicos de Latinoamérica. Podés reformular
  para que suene natural, pero sin inventar hallazgos que no estén en el
  título original.
- "resumen": 1-2 oraciones en español con el hallazgo concreto y su
  implicancia práctica. Si no podés inferir el hallazgo con confianza,
  usá el texto exacto "[Revisar manualmente: sin abstract disponible]".
- "tags": lista de 2-4 palabras clave en español en minúscula (ej:
  ["LCA", "diámetro", "isquiotibiales"]).

No inventes datos que no estén en el título. Respondé solo el JSON."""

    body = json.dumps(
        {
            "model": "claude-haiku-4-5-20251001",
            "max_tokens": 400,
            "messages": [{"role": "user", "content": prompt}],
        }
    ).encode()

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=body,
        headers={
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
        raw = result["content"][0]["text"].strip()
        raw = re.sub(r"^```json\s*|\s*```$", "", raw.strip())
        parsed = json.loads(raw)
        return {
            **article,
            "titulo": parsed.get("titulo", article["titulo_original"]),
            "resumen": parsed.get("resumen", ""),
            "tags": parsed.get("tags", []),
        }
    except Exception as e:
        return {**article, **fallback, "resumen": f"[Error generando resumen: {e}]"}


def create_issue_for_paper(paper, fuente_autor=None):
    """Crea un Issue individual para un paper, con el JSON embebido para aprobación."""
    paper_data = {
        "titulo": paper["titulo"],
        "revista": paper["revista"],
        "fecha": paper["fecha"],
        "tags": paper["tags"],
        "resumen": paper["resumen"],
        "nuevo": True,
    }

    estrella = f"⭐ **Autor seguido: {fuente_autor}**\n\n" if fuente_autor else ""

    body = f"""{estrella}**Título:** {paper['titulo']}
**Revista:** {paper['revista']} ({paper['fecha']})
**Link original:** {paper['url']}
**Resumen:** {paper['resumen']}
**Tags:** {', '.join(paper['tags'])}

---
Para aprobar y publicar este paper en la app automáticamente, comentá **ok**
en este Issue. Para descartarlo, no hagas nada (o cerralo sin comentar).

<!-- PAPER_DATA_START -->
```json
{json.dumps(paper_data, ensure_ascii=False, indent=2)}
```
<!-- PAPER_DATA_END -->
"""

    payload = json.dumps(
        {
            "title": f"📄 Revisar: {paper['titulo'][:80]}",
            "body": body,
            "labels": ["papers-borrador"],
        }
    ).encode()

    req = urllib.request.Request(
        f"https://api.github.com/repos/{GITHUB_REPOSITORY}/issues",
        data=payload,
        headers={
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "Accept": "application/vnd.github+json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        print("Issue creado:", json.loads(resp.read())["html_url"])


def main():
    seen_pmids = set()

    for term in SEARCH_TERMS:
        try:
            ids = pubmed_search(term, days_back=8)
        except Exception as e:
            print(f"Error buscando '{term}': {e}")
            continue
        for pmid in ids:
            if pmid in seen_pmids:
                continue
            seen_pmids.add(pmid)
            try:
                article = pubmed_summary(pmid)
                paper = draft_with_claude(article)
                create_issue_for_paper(paper)
            except Exception as e:
                print(f"Error procesando PMID {pmid}: {e}")
            time.sleep(0.5)

    for author_term in AUTHOR_SEARCHES:
        try:
            ids = pubmed_search(author_term, days_back=30)
        except Exception as e:
            print(f"Error buscando autor '{author_term}': {e}")
            continue
        for pmid in ids:
            if pmid in seen_pmids:
                continue
            seen_pmids.add(pmid)
            try:
                article = pubmed_summary(pmid)
                paper = draft_with_claude(article)
                create_issue_for_paper(paper, fuente_autor=author_term)
            except Exception as e:
                print(f"Error procesando PMID {pmid}: {e}")
            time.sleep(0.5)

    if not seen_pmids:
        print("Sin papers nuevos esta semana.")


if __name__ == "__main__":
    main()
