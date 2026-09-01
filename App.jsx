import React, { useState, useMemo } from "react";
import { Home, Layers, Ruler, BookOpen, FlaskConical, ChevronDown, ChevronRight, Tag, ExternalLink, Menu, X } from "lucide-react";

const COLORS = {
  bg: "#0F2624",
  surface: "#17362F",
  surface2: "#1F423B",
  border: "#2C5A4F",
  text: "#EDE7DA",
  textDim: "#93AFA4",
  blue: "#63A9AE",
  rust: "#C4693F",
  bone: "#D9CFB8",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

const LIGAMENTOS = [
  { id: "todos", label: "Todos" },
  { id: "lca", label: "LCA" },
  { id: "lcp", label: "LCP" },
  { id: "lci", label: "Colateral interno" },
  { id: "lce", label: "Colateral externo" },
  { id: "otras", label: "Otras aumentaciones" },
];

function Stitch() {
  return (
    <svg width="100%" height="14" viewBox="0 0 400 14" preserveAspectRatio="none" style={{ display: "block", opacity: 0.55 }}>
      <line x1="0" y1="7" x2="400" y2="7" stroke={COLORS.blue} strokeWidth="1" strokeDasharray="10 8" />
      {Array.from({ length: 20 }).map((_, i) => (
        <line key={i} x1={i * 21 + 4} y1="2" x2={i * 21} y2="12" stroke={COLORS.rust} strokeWidth="1.2" />
      ))}
    </svg>
  );
}

const GRAFTS = [
  {
    id: "hth",
    ligamentos: ["lca", "lcp"],
    nombre: "Hueso-Tendón-Hueso (HTH / BTB)",
    diametro: "9–10 mm",
    resumen: "Injerto autólogo del tercio central del tendón rotuliano con dos tacos óseos. Uso principal: LCA, también en LCP.",
    pasos: [
      "Medir el tercio central del tendón rotuliano: si el ancho total es <30 mm, tomar un tercio de ese ancho; si supera 30 mm, tomar 10 mm fijos (evidencia 2025-2026).",
      "Tallar los tacos óseos trapezoidales, 25 mm de largo x 9-10 mm de ancho, con sierra oscilante a ~45-70° según el lado (patelar/tibial).",
      "Preservar el paratendón para reparar el sitio donante al cierre — se asocia a menor dolor anterior de rodilla al arrodillarse.",
      "Verificar el diámetro final con bloque calibrador de 10 mm antes de pasar a la mesa de preparación.",
    ],
    tip: "Variante BTA (bone-tendon-autograft, sin taco patelar): si el constructo mide ≥70 mm de longitud total, se puede omitir el taco óseo patelar y usar solo electrocauterio en el polo inferior — reduce el riesgo de fractura patelar perioperatoria. Cuando el tendón entre tacos óseos es largo, la literatura describe reforzar la fijación distal con un anclaje SwivelLock de 4.75 mm (o tornillo interferencial retrógrado si el tendón supera ~55 mm) para asegurar mejor interferencia y ligamentización posterior. Alternativa reciente (técnica 'BPTB-plus', 2024): en vez de reforzar la fijación, se aumenta el propio injerto sumando un gracilis autólogo o contralateral, abordando la variabilidad de espesor del BTB en vez de la longitud. [VERIFICAR: confirmá el umbral exacto que usás vos — en tu práctica lo aplicás a partir de 4 cm entre tacos — y si preferís reforzar fijación (SwivelLock) o aumentar el injerto (BPTB-plus) en esos casos].",
  },
  {
    id: "sherman-rp",
    ligamentos: ["lca"],
    nombre: "Preservación de remanente (Sherman I / II) con isquiotibiales",
    diametro: "según preparación estándar de isquiotibiales (8–9 mm)",
    resumen: "Técnica que conserva el remanente tibial del LCA nativo al pasar el injerto, en vez de desbridarlo por completo — busca preservar mecanorreceptores y favorecer revascularización.",
    pasos: [
      "Clasificar el remanente según Sherman (tipo I: remanente funcional largo: tipo II: remanente corto/parcial) antes de definir el abordaje.",
      "En Sherman I, reinsertar el fascículo posterolateral nativo y aumentar con injerto de isquiotibiales para restaurar la huella femoral completa.",
      "Posicionar el túnel tibial dentro de los límites del remanente nativo, avanzando el escariador con cuidado para no lesionarlo.",
      "Pasar el injerto a través del remanente tibial compactándolo (técnica 'belt-buckle' o equivalente) y fijar según el sistema elegido.",
    ],
    tip: "Evidencia de seguimiento a 10 años (2025) muestra mejor supervivencia del injerto y estabilidad rotacional con preservación de remanente, sin diferencias significativas en resultados reportados por el paciente. Para la aumentación, isquiotibiales es la preferencia — según el remanente disponible, puede alcanzar con semitendinoso o gracilis (recto interno) solo, sin necesidad de ambos.",
  },
  {
    id: "isq",
    ligamentos: ["lca", "lcp", "lci", "lce"],
    nombre: "Isquiotibiales (Semitendinoso + Gracilis)",
    diametro: "8–9 mm",
    resumen: "Injerto de 4 fascículos, el más versátil: LCA, LCP, y también fuente de injerto libre para aumentación de colaterales.",
    pasos: [
      "Extraer semitendinoso y gracilis con stripper, preservando longitud útil ≥ 24 cm.",
      "Limpiar tejido muscular residual antes de plegar los fascículos.",
      "Plegar en cuatro fascículos y suturar extremos con técnica whipstitch (Krackow o similar).",
      "Tensionar en mesa de preparación 10–15 min antes de la fijación definitiva.",
    ],
    tip: "Si el diámetro combinado no alcanza 8 mm, considerar agregar una hebra de refuerzo o pasar a injerto cuádruple reforzado.",
  },
  {
    id: "cuad",
    ligamentos: ["lca", "lcp"],
    nombre: "Tendón Cuadricipital",
    diametro: "9–10 mm",
    resumen: "Injerto con o sin pastilla ósea, cada vez más usado por su grosor y baja morbilidad. Uso principal en LCA, también en LCP.",
    pasos: [
      "Definir espesor de toma (habitualmente 8–10 mm de ancho, 6–7 mm de profundidad).",
      "Decidir si se incluye pastilla ósea patelar según técnica de fijación planificada.",
      "Suturar el extremo libre con whipstitch para fijación por suspensión.",
      "Confirmar diámetro cilíndrico con bloque calibrador tras el modelado.",
    ],
    tip: "El injerto sin pastilla ósea permite fijación por suspensión en ambos túneles, útil en revisiones.",
  },
  {
    id: "alo",
    ligamentos: ["lca", "lcp", "lce", "otras"],
    nombre: "Aloinjerto (Tendón de Aquiles / Tibial posterior / Peroneo largo)",
    diametro: "según banco de tejidos",
    resumen: "Tejido de banco, útil en revisiones, cirugías multiligamentarias y reconstrucción de esquina posterolateral (colateral externo).",
    pasos: [
      "Verificar cadena de frío y documentación del banco de tejidos al recibir el injerto.",
      "Rehidratar según protocolo del banco antes de manipular.",
      "Recalibrar diámetro en mesa: el tejido de banco puede variar respecto a lo declarado.",
      "Suturar extremos y ajustar longitud a la técnica de fijación elegida.",
    ],
    tip: "Siempre recalibrar en mesa — el diámetro declarado por el banco es orientativo, no definitivo.",
  },
  {
    id: "lci-aum",
    ligamentos: ["lci"],
    nombre: "Reparación primaria + aumentación (Colateral interno / LCM)",
    diametro: "según técnica",
    resumen: "En lesiones grado III o crónicas, reparación primaria del ligamento reforzada con injerto de isquiotibiales o gracilis.",
    pasos: [
      "Evaluar si la lesión es reparable en agudo o requiere aumentación por cronicidad.",
      "Si se aumenta, preparar el injerto (gracilis o semitendinoso) con whipstitch en ambos extremos.",
      "Fijar el injerto siguiendo el trayecto anatómico del ligamento colateral medial.",
      "Verificar estabilidad en valgo a 0° y 30° de flexión tras la fijación.",
    ],
    tip: "La reparación primaria aislada suele bastar en lesiones agudas aisladas; la aumentación se reserva para lesiones crónicas o combinadas.",
  },
  {
    id: "lce-recon",
    ligamentos: ["lce"],
    nombre: "Reconstrucción de esquina posterolateral (Colateral externo / LCL)",
    diametro: "FCL ~9 mm · popliteofibular ~7 mm (según técnica LaPrade con aloinjerto)",
    resumen: "Técnica anatómica LaPrade: reconstruye los 3 estabilizadores (LCL, poplíteo, poplíteo-peroneo), considerada el estándar actual. Alternativa con autoinjerto de peroneo largo en Y cuando no hay aloinjerto disponible.",
    pasos: [
      "Confirmar los 3 componentes a reconstruir: ligamento colateral fibular (FCL), tendón poplíteo y ligamento poplíteo-peroneo.",
      "Con aloinjerto de Aquiles: tallar segmento de 9 mm de diámetro para el FCL y 7 mm para el poplíteo-peroneo.",
      "Con autoinjerto (cuando no hay banco de tejidos): usar peroneo largo en constructo en Y — requiere ≥250 mm de longitud total, o isquiotibiales con injerto doble.",
      "Confirmar isometría del injerto en arco de movilidad antes de la fijación definitiva.",
      "Verificar estabilidad en varo y rotación externa tras la fijación.",
    ],
    tip: "El posicionamiento del túnel femoral es el punto más sensible a errores — la referencia anatómica del epicóndilo lateral y el surco poplíteo debe confirmarse antes de perforar. [VERIFICAR: ¿usás LaPrade con aloinjerto o la variante de peroneo largo autólogo?]",
  },
  {
    id: "recto-ant-lcp",
    ligamentos: ["lcp"],
    nombre: "Recto anterior (Rectus Femoris) para LCP",
    diametro: "8.5–9 mm (cosechado con stripper)",
    resumen: "Injerto de tendón puro (sin taco óseo) cada vez más usado en LCP: se cosecha con stripper de 8.5-9 mm, se pliega y el largo total resultante se ajusta bien al recorrido de los túneles tibial y femoral de LCP, más extensos que los de LCA.",
    pasos: [
      "Identificar el plano entre el tendón del recto anterior y el vasto intermedio, 3-4 cm proximal al borde superior de la rótula.",
      "Cosechar con stripper de 8.5-9 mm, extendiendo la disección hasta obtener longitud suficiente para plegar.",
      "Plegar el injerto y confirmar que el largo total cubre el recorrido combinado de ambos túneles (tibial + femoral), más extensos que en LCA.",
      "Definir sistema de fijación (botón suspensorio o tornillos) según la longitud final y el diámetro de los túneles.",
    ],
    tip: "A diferencia de HTH o isquiotibiales, no tiene grandes variantes de técnica — es tendón puro en toda su extensión. La literatura reciente lo describe también en reconstrucción de LCP con doble haz combinando recto anterior y semitendinoso. [VERIFICAR: ¿lo usás como injerto único plegado o combinado con semitendinoso para el doble haz?]",
  },
  {
    id: "aug-cinta",
    ligamentos: ["otras", "lca"],
    nombre: "Aumentación con cinta de sutura (InternalBrace / SwivelLock)",
    diametro: "no aplica (cinta, no injerto biológico)",
    resumen: "Refuerzo sintético sobre reparación primaria o injerto biológico (autoinjerto o BTB), fijado con anclaje SwivelLock de 4.75 mm. No reemplaza al ligamento nativo ni al injerto — es un estabilizador secundario.",
    pasos: [
      "Confirmar que el ligamento nativo o el injerto tiene calidad suficiente para ser reforzado (no reemplazado) — indicado sobre todo en roturas proximales con remanente reducible.",
      "Posicionar la cinta (FiberTape o equivalente) siguiendo el trayecto anatómico del ligamento nativo o paralelo al injerto.",
      "Fijar con anclaje SwivelLock de 4.75 mm en la tibia proximal, distal a la entrada del túnel tibial.",
      "Tensionar el injerto de forma independiente a la cinta — la cinta se fija con la rodilla en extensión completa para reflejar la longitud terminal del LCA.",
      "Documentar el uso del implante sintético en el parte quirúrgico.",
    ],
    tip: "La tensión debe fijarse independiente del injerto: si la cinta se tensa junto con el injerto, puede generar stress shielding y limitar la ligamentización natural. Consenso internacional (Sonnery-Cottet et al., Arthroscopy 2025, 53 expertos): 'fuertemente recomendado' en pacientes jóvenes/activos con injerto de isquiotibiales, pivote grado III, hiperextensión de rodilla y pacientes esqueléticamente inmaduros; 'recomendado' en revisión y LCA crónico. Un metaanálisis 2026 con el equipo de Helito confirma menor tasa de falla con isquiotibiales + InternalBrace vs. isquiotibiales solo.",
  },
  {
    id: "larson-mod",
    ligamentos: ["lce"],
    nombre: "Larson modificada (alternativa a LaPrade para colateral externo)",
    diametro: "según técnica (injerto único de semitendinoso, dos fascículos)",
    resumen: "Reconstrucción con un solo injerto de semitendinoso dividido en dos fascículos (uno para LCL, otro para poplíteo-peroneo), reproduciendo el patrón de carga fisiológico entre ambos. Técnicamente más simple que LaPrade de 3 estructuras.",
    pasos: [
      "Cosechar semitendinoso completo — un fascículo reconstruye el ligamento poplíteo-peroneo (PFL) y el otro el colateral externo (LCL).",
      "Crear túneles femorales para LCL y tendón poplíteo en sus inserciones anatómicas.",
      "Crear túnel fibular desde la inserción anatómica del LCL hasta la porción posteromedial proximal de la cabeza del peroné (inserción del PFL).",
      "Fijar cada fascículo de forma independiente con tornillo interferencial pequeño intrafibular, con la tensión y el ángulo de flexión correspondiente a cada uno.",
    ],
    tip: "Estudios biomecánicos no encontraron diferencias en laxitud varo/rotación externa entre Larson, Larson modificada y LaPrade — es una alternativa válida cuando se busca simplicidad técnica con un solo injerto. Búsqueda honesta: no encontré en la literatura un criterio duro de cuándo elegir una sobre otra más allá de disponibilidad de injerto (LaPrade con aloinjerto necesita más tejido) y preferencia/experiencia del cirujano. [VERIFICAR: ¿tu criterio de elección es la disponibilidad de aloinjerto, la complejidad del caso, u otro factor?]",
  },
  {
    id: "lemaire-mod",
    ligamentos: ["otras", "lca"],
    nombre: "Refuerzo extra-articular tipo Lemaire modificada (LET)",
    diametro: "franja de banda iliotibial de ~8 cm x 1 cm",
    resumen: "Tenodesis lateral extra-articular con banda iliotibial, como refuerzo asociado a la reconstrucción de LCA — reduce inestabilidad rotatoria anterolateral y fuerza sobre el injerto, con menor tasa de re-ruptura reportada en estudios recientes.",
    pasos: [
      "Incisión lateral desde el nivel de la inserción femoral del LCL, extendida 5 cm proximal.",
      "Cosechar una franja central de banda iliotibial de ~8 cm x 1 cm, dejándola fija distalmente al tubérculo de Gerdy.",
      "Pasar la franja profundo al ligamento colateral externo y fijar en el fémur, evitando convergencia con el túnel femoral del LCA (dirigir el socket 30° proximal y ≥20° anterior).",
      "Tensionar con la rodilla en 60-90° de flexión y rotación neutra/interna leve antes de la fijación definitiva.",
    ],
    tip: "El riesgo principal es la convergencia de túneles con el LCA — según estudios de tomografía, puede llegar al 70% si no se angula correctamente el socket femoral. Consenso internacional 2025 (Sonnery-Cottet): ya no se indica de rutina, sino selectivamente en pacientes de 14-25 años con ≥2 de estos factores: retorno a deporte de contacto/pivote, pivot-shift grado ≥2, o hiperlaxitud generalizada/hiperextensión >10°. También indicada en fractura de Segond, LCA crónico, o signo de muesca femoral lateral en radiografía.",
  },
  {
    id: "lcp-no-anat",
    ligamentos: ["lcp"],
    nombre: "Tenodesis posterolateral no anatómica para aumentación de LCP",
    diametro: "según injerto elegido (isquiotibiales habitual)",
    resumen: "Técnica no anatómica descrita por Álvarez Salinas, Civetta y colaboradores (Arthroscopy Techniques, 2024). Indicada en inestabilidad de colateral externo asociada, pacientes hiperlaxos y cirugías de revisión — el concepto es análogo al del refuerzo tipo Lemaire modificada.",
    pasos: [
      "Confirmar indicación: inestabilidad de colateral externo concomitante, hiperlaxitud del paciente, o revisión de LCP previa.",
      "Preparar el injerto de aumentación (isquiotibiales) con whipstitch en extremos libres.",
      "Pasar el refuerzo por detrás del intercóndilo — este paso es el más desafiante técnicamente y requiere instrumental adaptado a la anatomía del caso.",
      "Posicionar la tenodesis posterolateral como refuerzo complementario a la reconstrucción primaria del LCP, sin buscar replicar la inserción anatómica exacta.",
      "Fijar y verificar reducción del cajón posterior residual antes de cerrar.",
    ],
    tip: "El pasaje del refuerzo por detrás del intercóndilo es el punto técnico que más se sigue afinando en la práctica — el instrumental estándar no siempre se adapta bien a esta maniobra. Técnica de autores hispanohablantes (Argentina/España) publicada en 2024, directamente del equipo con el que trabajás.",
  },
];

const IMPLANTES = [
  {
    nombre: "Tornillo interferencial metálico",
    fijacion: "Aperture (en la entrada del túnel)",
    ventajas: "Alta resistencia inicial, técnica muy difundida, costo moderado",
    consideraciones: "Artefacto en RMN/TC, riesgo de daño al injerto durante la inserción",
    uso: "LCA y LCP primarios, fijación femoral y tibial",
  },
  {
    nombre: "Tornillo interferencial bioabsorbible",
    fijacion: "Aperture",
    ventajas: "Sin artefacto radiológico significativo, se reabsorbe con el tiempo",
    consideraciones: "Resistencia inicial algo menor, posible reacción a cuerpo extraño",
    uso: "LCA/LCP primarios, pacientes con seguimiento por imágenes frecuente",
  },
  {
    nombre: "Botón cortical (suspensorio)",
    fijacion: "Cortical (suspensión en la corteza ósea)",
    ventajas: "Fijación muy firme en hueso cortical, ideal para túneles cortos",
    consideraciones: "Efecto \"bungee\" por elongación del lazo, requiere ajuste de longitud preciso",
    uso: "Fijación femoral en isquiotibiales y cuádriceps, también en colaterales",
  },
  {
    nombre: "Sistema híbrido (botón + tornillo)",
    fijacion: "Cortical + aperture combinada",
    ventajas: "Combina fijación primaria firme con relleno del túnel",
    consideraciones: "Mayor tiempo quirúrgico, más pasos técnicos",
    uso: "Revisiones o túneles de diámetro irregular",
  },
  {
    nombre: "Ancla de sutura con cinta (InternalBrace)",
    fijacion: "Cortical, punto a punto",
    ventajas: "Permite aumentación sin injerto biológico adicional, técnica rápida",
    consideraciones: "No sustituye a un injerto cuando hay pérdida de sustancia relevante",
    uso: "Aumentación de LCA agudo y de ligamentos colaterales",
  },
  {
    nombre: "Grapa (staple) ósea",
    fijacion: "Cortical externa",
    ventajas: "Simple, económica, fácil de retirar si es necesario",
    consideraciones: "Menor uso actual, prominencia de partes blandas",
    uso: "Fijación tibial complementaria o de refuerzo",
  },
];

const PAPERS = [
  {
    titulo: "Comparación de diámetro de injerto y tasa de re-ruptura en LCA con isquiotibiales",
    revista: "AJSM",
    fecha: "Ago 2026",
    tags: ["LCA", "diámetro", "isquiotibiales"],
    nuevo: true,
    resumen: "Cohorte multicéntrica que asocia diámetros de injerto menores a 7 mm con mayor tasa de re-ruptura a 2 años, reforzando la importancia de la medición intraoperatoria.",
  },
  {
    titulo: "Fijación por suspensión vs. interferencial en reconstrucción de LCA: resultados a 5 años",
    revista: "Arthroscopy",
    fecha: "Jul 2026",
    tags: ["fijación", "botón cortical", "seguimiento"],
    nuevo: true,
    resumen: "Ensayo aleatorizado sin diferencias significativas en laxitud a 5 años entre ambos sistemas de fijación femoral.",
  },
  {
    titulo: "Tendón cuadricipital sin pastilla ósea: técnica y curva de aprendizaje",
    revista: "KSSTA",
    fecha: "Jun 2026",
    tags: ["cuádriceps", "técnica quirúrgica", "LCA"],
    nuevo: false,
    resumen: "Serie de casos que describe la técnica de toma y los primeros 50 casos de una curva de aprendizaje institucional.",
  },
  {
    titulo: "Aloinjertos irradiados en reconstrucción ligamentaria: revisión sistemática",
    revista: "JBJS",
    fecha: "May 2026",
    tags: ["aloinjerto", "banco de tejidos"],
    nuevo: false,
    resumen: "Revisión que compara tasas de falla entre aloinjertos irradiados y no irradiados en reconstrucciones primarias y de revisión.",
  },
  {
    titulo: "Resultados a mediano plazo de la reconstrucción de LCP con técnica de doble haz",
    revista: "Journal of ISAKOS",
    fecha: "Jul 2026",
    tags: ["LCP", "técnica quirúrgica"],
    nuevo: true,
    resumen: "Serie prospectiva que compara doble haz contra haz único en LCP, con mejores puntajes funcionales en el grupo de doble haz a 3 años.",
  },
  {
    titulo: "Aumentación con cinta de sutura en lesiones de colateral interno grado III",
    revista: "KSSTA",
    fecha: "Jun 2026",
    tags: ["colateral interno", "aumentación", "InternalBrace"],
    nuevo: true,
    resumen: "Estudio de cohorte que muestra menor laxitud residual en valgo cuando la reparación primaria se refuerza con cinta de sutura.",
  },
  {
    titulo: "Preparación de aloinjerto hueso-tendón-hueso: técnica reproducible para reducir tiempo quirúrgico",
    revista: "Video Journal of Sports Medicine",
    fecha: "2025",
    tags: ["LCA", "HTH", "técnica quirúrgica"],
    nuevo: true,
    resumen: "Describe el tallado de tacos óseos a 25-30 mm con sierra angulada (70° tibial, 45° patelar) hasta calibrar el injerto en un medidor de 10 mm por ambos lados.",
  },
  {
    titulo: "Reconstrucción anatómica de esquina posterolateral: conceptos actuales de manejo y rehabilitación",
    revista: "J Arthrosc Surg Sports Med",
    fecha: "2025",
    tags: ["colateral externo", "técnica quirúrgica", "LCL"],
    nuevo: true,
    resumen: "Revisión de la técnica LaPrade y sus variantes con autoinjerto de peroneo largo, con referencias anatómicas precisas para el túnel femoral del complejo posterolateral.",
  },
  {
    titulo: "La preservación de remanente mejora la supervivencia del injerto a 10 años y la estabilidad rotacional en reconstrucción con isquiotibiales",
    revista: "Arthroscopy (ScienceDirect)",
    fecha: "2025",
    tags: ["LCA", "preservación de remanente", "isquiotibiales"],
    nuevo: true,
    resumen: "Seguimiento a 10 años que muestra mejor supervivencia del injerto y estabilidad rotacional con preservación de remanente, sin diferencias significativas en resultados reportados por el paciente ni progresión de artrosis.",
  },
  {
    titulo: "Reparación de LCA con aumentación de InternalBrace: guía de técnica",
    revista: "Video Journal of Sports Medicine",
    fecha: "Nov 2025",
    tags: ["LCA", "InternalBrace", "técnica quirúrgica"],
    nuevo: true,
    resumen: "Describe la aumentación con cinta de sutura en roturas proximales de LCA con remanente reducible, fijada con anclaje SwivelLock, como refuerzo de la ligamentización y estabilizador secundario.",
  },
  {
    titulo: "Reconstrucción de LCP con doble haz usando injertos de recto anterior y semitendinoso",
    revista: "Arthroscopy Techniques",
    fecha: "2025",
    tags: ["LCP", "recto anterior", "técnica quirúrgica"],
    nuevo: true,
    resumen: "Describe la técnica de doble haz combinando tendón del recto anterior (cuádriceps superficial) con semitendinoso, aprovechando el mayor largo disponible para cubrir túneles de LCP más extensos que los de LCA.",
  },
  {
    titulo: "Larson modificada: reconstrucción de esquina posterolateral reproduciendo el patrón de tensión fisiológica de LCL y ligamento poplíteo-peroneo",
    revista: "BMC Sports Science, Medicine and Rehabilitation",
    fecha: "2012 (referencia histórica vigente)",
    tags: ["colateral externo", "Larson", "técnica quirúrgica"],
    nuevo: false,
    resumen: "Estudios biomecánicos posteriores no encontraron diferencias en laxitud entre Larson, Larson modificada y LaPrade, validando la modificada como alternativa técnicamente más simple.",
  },
  {
    titulo: "Tenodesis lateral extra-articular modificada de Lemaire: fijación con técnica inlay y ancla sin nudos",
    revista: "Arthroscopy Techniques",
    fecha: "2023",
    tags: ["LCA", "Lemaire", "LET", "técnica quirúrgica"],
    nuevo: false,
    resumen: "Describe una modificación de fijación proximal que reduce el riesgo de convergencia con el túnel femoral del LCA, manteniendo bajo perfil óseo.",
  },
  {
    titulo: "Técnica modificada de reconstrucción combinada de colateral interno profundo y superficial (Lind modificada)",
    revista: "Arthroscopy Techniques",
    fecha: "Ene 2025",
    tags: ["colateral interno", "técnica quirúrgica"],
    nuevo: true,
    resumen: "Un estudio biomecánico no publicado citado en el artículo muestra que esta técnica restaura la cinemática de rodilla intacta tras inestabilidad simulada, algo que una reconstrucción de un solo fascículo no lograba.",
  },
  {
    titulo: "Tenodesis posterolateral no anatómica para aumentación de reconstrucción de LCP",
    revista: "Arthroscopy Techniques",
    fecha: "Ago 2024",
    tags: ["LCP", "no anatómica", "técnica quirúrgica"],
    nuevo: true,
    resumen: "Álvarez-Salinas, Civetta, Reparaz y colaboradores describen esta técnica de aumentación ante la laxitud residual documentada hasta en 26% de las reconstrucciones de LCP con cajón posterior grado I-II.",
  },
  {
    titulo: "Indicaciones para procedimientos extra-articulares laterales en LCA: consenso internacional (Parte I)",
    revista: "Arthroscopy",
    fecha: "Sep 2025",
    tags: ["LCA", "Lemaire", "LET", "InternalBrace"],
    nuevo: true,
    resumen: "Sonnery-Cottet y 53 expertos internacionales definen por consenso Delphi cuándo el refuerzo extra-articular es 'fuertemente recomendado', 'recomendado' o 'a considerar' — deja de ser un add-on de rutina y pasa a indicación selectiva por factores de riesgo.",
  },
  {
    titulo: "InternalBrace con isquiotibiales reduce la tasa de falla manteniendo resultados funcionales similares",
    revista: "Am J Sports Med",
    fecha: "2026",
    tags: ["LCA", "InternalBrace", "isquiotibiales"],
    nuevo: true,
    resumen: "Metaanálisis con Camilo Helito como coautor: la aumentación con cinta de sutura sobre injerto de isquiotibiales muestra menor tasa de falla que la técnica sin aumentar, con tasas de complicación similares.",
  },
// AGENTE: agregar nuevos papers arriba de esta línea
  ];

  function Sidebar({ view, setView, mobileOpen, setMobileOpen }) {
  const items = [
    { id: "inicio", label: "Inicio", icon: Home },
    { id: "tecnicas", label: "Técnicas de injerto", icon: Layers },
    { id: "calculadora", label: "Calculadora de diámetro", icon: Ruler },
    { id: "implantes", label: "Comparador de implantes", icon: FlaskConical },
    { id: "papers", label: "Papers y actualizaciones", icon: BookOpen },
  ];
  return (
    <div
      className={`flex flex-col fixed md:static top-0 left-0 h-full md:h-auto z-20 transition-transform duration-200 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
      style={{ width: "260px", background: COLORS.surface, borderRight: `1px solid ${COLORS.border}` }}
    >
      <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.05rem", color: COLORS.text }}>
            Injerta
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.68rem", color: COLORS.textDim, letterSpacing: "0.04em" }}>
            GUÍA TÉCNICA · LIGAMENTOS
          </div>
        </div>
        <button className="md:hidden" onClick={() => setMobileOpen(false)} style={{ color: COLORS.textDim }}>
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {items.map((it) => {
          const Icon = it.icon;
          const active = view === it.id;
          return (
            <button
              key={it.id}
              onClick={() => {
                setView(it.id);
                setMobileOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors"
              style={{
                background: active ? COLORS.surface2 : "transparent",
                color: active ? COLORS.bone : COLORS.textDim,
                fontFamily: "'IBM Plex Sans',sans-serif",
                fontSize: "0.88rem",
                fontWeight: active ? 600 : 500,
                border: active ? `1px solid ${COLORS.border}` : "1px solid transparent",
              }}
            >
              <Icon size={17} style={{ color: active ? COLORS.blue : COLORS.textDim, flexShrink: 0 }} />
              {it.label}
            </button>
          );
        })}
      </nav>
      <div className="p-4" style={{ borderTop: `1px solid ${COLORS.border}` }}>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.62rem", color: COLORS.textDim, lineHeight: 1.5 }}>
          LCA · LCP · Colateral interno y externo · Otras aumentaciones.
          <br />
          Verificar siempre con el protocolo institucional.
        </div>
      </div>
    </div>
  );
}

function Inicio({ setView }) {
  const cards = [
    { id: "tecnicas", label: "Técnicas de injerto", desc: "LCA, LCP, colaterales y otras aumentaciones, con pasos de preparación y tips de armado.", icon: Layers },
    { id: "calculadora", label: "Calculadora de diámetro", desc: "Estimá el diámetro combinado según fascículos y grosor.", icon: Ruler },
    { id: "implantes", label: "Comparador de implantes", desc: "Sistemas de fijación lado a lado: ventajas y consideraciones.", icon: FlaskConical },
    { id: "papers", label: "Papers y actualizaciones", desc: "Últimos artículos académicos resumidos, filtrables por ligamento y tema.", icon: BookOpen },
  ];
  return (
    <div>
      <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.9rem", color: COLORS.text }}>
        Guía técnica de plásticas ligamentarias
      </h1>
      <p style={{ fontFamily: "'IBM Plex Sans',sans-serif", color: COLORS.textDim, marginTop: "0.5rem", maxWidth: "640px", lineHeight: 1.6 }}>
        LCA, LCP, colateral interno, colateral externo y otras aumentaciones: técnicas de armado de injerto, medidas de referencia, comparación de implantes y literatura académica actualizada, en un solo lugar.
      </p>
      <div className="my-6">
        <Stitch />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => setView(c.id)}
              className="text-left p-5 rounded-xl transition-transform hover:-translate-y-0.5"
              style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
            >
              <Icon size={20} style={{ color: COLORS.blue }} />
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "1.05rem", color: COLORS.text, marginTop: "0.75rem" }}>
                {c.label}
              </div>
              <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: "0.85rem", color: COLORS.textDim, marginTop: "0.35rem", lineHeight: 1.5 }}>
                {c.desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LigamentoTabs({ selected, setSelected }) {
  return (
    <div className="flex flex-wrap gap-2 mt-5">
      {LIGAMENTOS.map((l) => (
        <button
          key={l.id}
          onClick={() => setSelected(l.id)}
          className="px-3 py-1.5 rounded-full"
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: "0.72rem",
            background: selected === l.id ? COLORS.blue : COLORS.surface,
            color: selected === l.id ? COLORS.bg : COLORS.textDim,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

function Tecnicas() {
  const [open, setOpen] = useState("hth");
  const [ligamento, setLigamento] = useState("todos");

  const filtered = useMemo(() => {
    if (ligamento === "todos") return GRAFTS;
    return GRAFTS.filter((g) => g.ligamentos.includes(ligamento));
  }, [ligamento]);

  return (
    <div>
      <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.6rem", color: COLORS.text }}>
        Técnicas de armado de injerto
      </h1>
      <p style={{ fontFamily: "'IBM Plex Sans',sans-serif", color: COLORS.textDim, marginTop: "0.35rem" }}>
        Pasos de preparación en mesa y diámetro objetivo, por tipo de injerto y ligamento.
      </p>
      <LigamentoTabs selected={ligamento} setSelected={setLigamento} />
      <div className="flex flex-col gap-3 mt-5">
        {filtered.map((g) => {
          const isOpen = open === g.id;
          return (
            <div key={g.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${COLORS.border}`, background: COLORS.surface }}>
              <button
                onClick={() => setOpen(isOpen ? null : g.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, color: COLORS.text, fontSize: "1rem" }}>
                    {g.nombre}
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: "0.82rem", color: COLORS.textDim, marginTop: "0.2rem" }}>
                    {g.resumen}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontSize: "0.75rem",
                      color: COLORS.blue,
                      background: COLORS.surface2,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      border: `1px solid ${COLORS.border}`,
                    }}
                  >
                    ⌀ {g.diametro}
                  </span>
                  {isOpen ? <ChevronDown size={18} color={COLORS.textDim} /> : <ChevronRight size={18} color={COLORS.textDim} />}
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-5" style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.68rem", color: COLORS.textDim, marginTop: "0.9rem", letterSpacing: "0.04em" }}>
                    PASOS DE PREPARACIÓN
                  </div>
                  <ol className="mt-2 flex flex-col gap-2">
                    {g.pasos.map((p, i) => (
                      <li key={i} className="flex gap-3" style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: "0.87rem", color: COLORS.text, lineHeight: 1.5 }}>
                        <span style={{ color: COLORS.rust, fontFamily: "'IBM Plex Mono',monospace", flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
                        {p}
                      </li>
                    ))}
                  </ol>
                  <div
                    className="mt-4 p-3 rounded-lg"
                    style={{ background: COLORS.surface2, border: `1px solid ${COLORS.border}`, fontFamily: "'IBM Plex Sans',sans-serif", fontSize: "0.83rem", color: COLORS.bone, lineHeight: 1.5 }}
                  >
                    <span style={{ color: COLORS.blue, fontWeight: 600 }}>Tip: </span>
                    {g.tip}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Calculadora() {
  const [strands, setStrands] = useState(4);
  const [diameter, setDiameter] = useState(5.5);

  const { area, combined, suggested } = useMemo(() => {
    const singleArea = Math.PI * Math.pow(diameter / 2, 2);
    const totalArea = singleArea * strands;
    const combinedDiameter = 2 * Math.sqrt(totalArea / Math.PI);
    return {
      area: totalArea,
      combined: combinedDiameter,
      suggested: Math.round((combinedDiameter + 0.5) * 2) / 2,
    };
  }, [strands, diameter]);

  const maxPx = 130;
  const pxPerMm = maxPx / 12;
  const r = Math.min((combined / 2) * pxPerMm, maxPx);

  return (
    <div>
      <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.6rem", color: COLORS.text }}>
        Calculadora de diámetro de injerto
      </h1>
      <p style={{ fontFamily: "'IBM Plex Sans',sans-serif", color: COLORS.textDim, marginTop: "0.35rem", maxWidth: "560px", lineHeight: 1.5 }}>
        Estimación orientativa del diámetro combinado a partir del número de fascículos y su grosor promedio medido en mesa. Aplica a injertos de isquiotibiales usados en LCA, LCP o como fuente de aumentación en colaterales.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="p-5 rounded-xl" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.68rem", color: COLORS.textDim, letterSpacing: "0.04em" }}>
            FASCÍCULOS: {strands}
          </div>
          <input
            type="range"
            min="2"
            max="6"
            step="1"
            value={strands}
            onChange={(e) => setStrands(Number(e.target.value))}
            className="w-full mt-2"
            style={{ accentColor: COLORS.blue }}
          />
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.68rem", color: COLORS.textDim, letterSpacing: "0.04em", marginTop: "1.3rem" }}>
            GROSOR PROMEDIO POR HEBRA: {diameter.toFixed(1)} mm
          </div>
          <input
            type="range"
            min="3.5"
            max="8"
            step="0.1"
            value={diameter}
            onChange={(e) => setDiameter(Number(e.target.value))}
            className="w-full mt-2"
            style={{ accentColor: COLORS.blue }}
          />

          <div className="mt-6 flex flex-col gap-2">
            <Row label="Área total combinada" value={`${area.toFixed(1)} mm²`} />
            <Row label="Diámetro combinado estimado" value={`${combined.toFixed(1)} mm`} highlight />
            <Row label="Túnel sugerido (+0.5 mm)" value={`${suggested.toFixed(1)} mm`} />
          </div>
        </div>

        <div className="p-5 rounded-xl flex flex-col items-center justify-center" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
          <svg width="280" height="280" viewBox="0 0 280 280">
            <circle cx="140" cy="140" r="130" fill="none" stroke={COLORS.border} strokeWidth="1" strokeDasharray="3 6" />
            <circle cx="140" cy="140" r={r} fill={COLORS.surface2} stroke={COLORS.blue} strokeWidth="2" />
            <text x="140" y="136" textAnchor="middle" fill={COLORS.text} fontSize="26" fontFamily="'Space Grotesk',sans-serif" fontWeight="700">
              {combined.toFixed(1)}
            </text>
            <text x="140" y="158" textAnchor="middle" fill={COLORS.textDim} fontSize="12" fontFamily="'IBM Plex Mono',monospace">
              mm ⌀
            </text>
          </svg>
          <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: "0.78rem", color: COLORS.textDim, textAlign: "center", marginTop: "0.5rem" }}>
            Círculo exterior punteado = referencia de 26 mm de diámetro
          </div>
        </div>
      </div>
      <div
        className="mt-5 p-3 rounded-lg"
        style={{ background: COLORS.surface2, border: `1px solid ${COLORS.border}`, fontFamily: "'IBM Plex Sans',sans-serif", fontSize: "0.8rem", color: COLORS.textDim, lineHeight: 1.5, maxWidth: "700px" }}
      >
        Cálculo orientativo por suma de áreas circulares. Siempre confirmar el diámetro real con bloque calibrador en mesa antes de definir el túnel.
      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
      <span style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: "0.83rem", color: COLORS.textDim }}>{label}</span>
      <span
        style={{
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: highlight ? "1rem" : "0.85rem",
          fontWeight: 600,
          color: highlight ? COLORS.rust : COLORS.text,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Implantes() {
  return (
    <div>
      <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.6rem", color: COLORS.text }}>
        Comparador de sistemas de fijación
      </h1>
      <p style={{ fontFamily: "'IBM Plex Sans',sans-serif", color: COLORS.textDim, marginTop: "0.35rem" }}>
        Sistemas de fijación lado a lado, con uso típico en LCA, LCP y aumentación de colaterales.
      </p>
      <div className="flex flex-col gap-3 mt-6">
        {IMPLANTES.map((imp, i) => (
          <div key={i} className="p-4 rounded-xl grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_1.4fr] gap-3" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, color: COLORS.text, fontSize: "0.95rem" }}>{imp.nombre}</div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: "0.68rem",
                  color: COLORS.blue,
                  marginTop: "0.4rem",
                  display: "inline-block",
                  background: COLORS.surface2,
                  padding: "2px 7px",
                  borderRadius: "5px",
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                {imp.fijacion}
              </div>
              <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: "0.75rem", color: COLORS.textDim, marginTop: "0.5rem" }}>{imp.uso}</div>
            </div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.6rem", color: COLORS.textDim, letterSpacing: "0.04em" }}>VENTAJAS</div>
              <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: "0.83rem", color: COLORS.text, marginTop: "0.25rem", lineHeight: 1.5 }}>{imp.ventajas}</div>
            </div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.6rem", color: COLORS.textDim, letterSpacing: "0.04em" }}>CONSIDERACIONES</div>
              <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: "0.83rem", color: COLORS.text, marginTop: "0.25rem", lineHeight: 1.5 }}>{imp.consideraciones}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Papers() {
  const allTags = useMemo(() => {
    const s = new Set();
    PAPERS.forEach((p) => p.tags.forEach((t) => s.add(t)));
    return Array.from(s);
  }, []);
  const [filter, setFilter] = useState(null);
  const filtered = filter ? PAPERS.filter((p) => p.tags.includes(filter)) : PAPERS;

  return (
    <div>
      <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.6rem", color: COLORS.text }}>
        Papers y actualizaciones
      </h1>
      <p style={{ fontFamily: "'IBM Plex Sans',sans-serif", color: COLORS.textDim, marginTop: "0.35rem" }}>
        Resúmenes de literatura reciente sobre LCA, LCP, colaterales y otras aumentaciones. En producción, este feed se alimentaría automáticamente desde PubMed.
      </p>
      <div className="flex flex-wrap gap-2 mt-5">
        <button
          onClick={() => setFilter(null)}
          className="px-3 py-1 rounded-full"
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: "0.72rem",
            background: filter === null ? COLORS.blue : COLORS.surface,
            color: filter === null ? COLORS.bg : COLORS.textDim,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          todos
        </button>
        {allTags.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className="px-3 py-1 rounded-full"
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: "0.72rem",
              background: filter === t ? COLORS.blue : COLORS.surface,
              color: filter === t ? COLORS.bg : COLORS.textDim,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 mt-5">
        {filtered.map((p, i) => (
          <div key={i} className="p-4 rounded-xl" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <div className="flex items-start justify-between gap-3">
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, color: COLORS.text, fontSize: "0.98rem", lineHeight: 1.4 }}>
                {p.titulo}
              </div>
              {p.nuevo && (
                <span
                  className="flex-shrink-0"
                  style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: "0.62rem",
                    color: COLORS.bg,
                    background: COLORS.rust,
                    padding: "2px 7px",
                    borderRadius: "5px",
                    fontWeight: 600,
                  }}
                >
                  NUEVO
                </span>
              )}
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.72rem", color: COLORS.blue, marginTop: "0.4rem" }}>
              {p.revista} · {p.fecha}
            </div>
            <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: "0.85rem", color: COLORS.textDim, marginTop: "0.5rem", lineHeight: 1.55 }}>
              {p.resumen}
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-1.5 flex-wrap">
                {p.tags.map((t) => (
                  <span key={t} className="flex items-center gap-1" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.65rem", color: COLORS.textDim }}>
                    <Tag size={10} /> {t}
                  </span>
                ))}
              </div>
              <span className="flex items-center gap-1" style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: "0.75rem", color: COLORS.blue }}>
                Ver original <ExternalLink size={12} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("inicio");
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderView = () => {
    switch (view) {
      case "tecnicas":
        return <Tecnicas />;
      case "calculadora":
        return <Calculadora />;
      case "implantes":
        return <Implantes />;
      case "papers":
        return <Papers />;
      default:
        return <Inicio setView={setView} />;
    }
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: "600px", fontFamily: "'IBM Plex Sans',sans-serif" }} className="flex relative">
      <style>{FONTS}</style>
      <Sidebar view={view} setView={setView} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-10 md:hidden" onClick={() => setMobileOpen(false)} />}
      <div className="flex-1 min-w-0">
        <div className="md:hidden flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
          <button onClick={() => setMobileOpen(true)} style={{ color: COLORS.text }}>
            <Menu size={22} />
          </button>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: COLORS.text, fontSize: "0.95rem" }}>
            Injerta
          </span>
          <div style={{ width: "22px" }} />
        </div>
        <div className="p-6 md:p-10 max-w-4xl">{renderView()}</div>
      </div>
    </div>
  );
}
