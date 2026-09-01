#!/usr/bin/env python3
"""
Agente semanal de vigilancia de literatura para guiadeinjertos.com

Qué hace:
1. Busca en PubMed artículos publicados en los últimos 8 días sobre los temas
   de la app (LCA, LCP, colateral interno/externo, técnicas de injerto).
2. Para cada artículo nuevo, pide a Claude que arme un resumen en español
   siguiendo el mismo formato que usa el array PAPERS de la app.
3. Crea un GitHub Issue con los borradores para que José los revise.

Nada se publica automáticamente. El resultado es SIEMPRE un borrador
para revisión humana.
"""

import os
import json
import time
import urllib.request
import urllib.parse

PUBMED_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

# Términos de búsqueda: uno por tema de la app. Ajustá esta lista cuando
# quieras que el agente cubra más o menos temas.
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

# Autores a seguir de cerca: se buscan TODOS sus artículos nuevos en PubMed,
# sin importar el tema (a diferencia de SEARCH_TERMS, que busca por tema
# sin importar el autor). Formato PubMed: "Apellido Iniciales[Author]".
AUTHOR_SEARCHES = [
    # Equipo propio / región
    'Alvarez-Salinas E[Author]',
    'Canuto SMG[Author]',
    'Helito CP[Author]',  # Camilo Helito (Brasil) — InternalBrace, isquiotibiales
    # Referentes internacionales — cada uno referente en su sub-especialidad
    'LaPrade RF[Author]',        # Colateral externo / esquina posterolateral, MCL
    'Sonnery-Cottet B[Author]',  # LCA, refuerzo extra-articular (Lemaire/LET)
    'Musahl V[Author]',          # Biomecánica de LCA, rotación
    'Getgood A[Author]',         # LCA + LET (estudio STABILITY)
    'Siebold R[Author]',         # LCP, técnicas de doble haz
    'Zaffagnini S[Author]',      # LCA/LCP, cinemática de rodilla
]

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
GITHUB_REPOSITORY = os.environ.get("GITHUB_REPOSITORY")  # "owner/repo"


def pubmed_search(term, days_back=8):
    """Busca IDs de artículos publicados en los últimos N días para un término
    o una búsqueda de autor (ej: 'Canuto SMG[Author]')."""
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
    """Trae título, revista y fecha de un artículo por su PMID."""
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
    """Pide a Claude un resumen en español, en el formato de la app."""
    if not ANTHROPIC_API_KEY:
        # Sin API key configurada: devolvemos el dato crudo para revisión manual.
        return {
            **article,
            "resumen_borrador": "[Falta ANTHROPIC_API_KEY — agregar resumen a mano]",
        }

    prompt = f"""Este es un paper médico real de PubMed:

Título: {article['titulo_original']}
Revista: {article['revista']}
Fecha: {article['fecha']}

Tarea: escribí SOLO un resumen de 1-2 oraciones en español, tono técnico,
para instrumentadores quirúrgicos y cirujanos ortopédicos de Latinoamérica.
Enfocate en el hallazgo concreto y su implicancia práctica (un número, una
indicación, un cambio de conducta). Si el abstract no está disponible y no
podés inferir el hallazgo con confianza, respondé exactamente:
"[Revisar manualmente: sin abstract disponible]"

No inventes datos que no estén en el título. No agregues nada más que el
resumen."""

    body = json.dumps(
        {
            "model": "claude-haiku-4-5-20251001",
            "max_tokens": 300,
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
        resumen = result["content"][0]["text"].strip()
    except Exception as e:
        resumen = f"[Error generando resumen: {e}]"

    return {**article, "resumen_borrador": resumen}


def create_github_issue(drafts):
    """Crea un Issue en el repo con todos los borradores de esta corrida."""
    if not drafts:
        print("Sin papers nuevos esta semana. No se crea Issue.")
        return

    body_lines = [
        "Borradores generados automáticamente. **Nada se publicó** — revisá,",
        "corregí y agregá manualmente los que valgan la pena al array PAPERS",
        "de `App.jsx`.\n",
    ]
    for d in drafts:
        body_lines.append(f"## {d['titulo_original']}")
        if d.get("fuente"):
            body_lines.append(f"- **⭐ {d['fuente']}**")
        body_lines.append(f"- **Revista:** {d['revista']} ({d['fecha']})")
        body_lines.append(f"- **Link:** {d['url']}")
        body_lines.append(f"- **Resumen borrador:** {d['resumen_borrador']}")
        body_lines.append("")

    payload = json.dumps(
        {
            "title": f"📄 Papers nuevos para revisar — {time.strftime('%Y-%m-%d')}",
            "body": "\n".join(body_lines),
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
    drafts = []

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
                drafts.append(draft_with_claude(article))
            except Exception as e:
                print(f"Error procesando PMID {pmid}: {e}")
            time.sleep(0.5)  # respetar rate limits de PubMed

    # Búsqueda por autor: plazo más amplio (30 días) porque publican con
    # menos frecuencia que "todo lo nuevo sobre LCA en general".
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
                article["fuente"] = f"Autor seguido: {author_term}"
                drafts.append(draft_with_claude(article))
            except Exception as e:
                print(f"Error procesando PMID {pmid}: {e}")
            time.sleep(0.5)

    create_github_issue(drafts)


if __name__ == "__main__":
    main()
