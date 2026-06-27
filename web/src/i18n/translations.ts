export type Lang = "es" | "en";

export const LANGS: { code: Lang; label: string; name: string }[] = [
  { code: "es", label: "ES", name: "Español" },
  { code: "en", label: "EN", name: "English" },
];

interface Feature {
  title: string;
  body: string;
}

export interface Dict {
  nav: { home: string; api: string; mcp: string; usage: string; pricing: string };
  common: { live: string; copy: string; copied: string };
  footer: { terms: string; privacy: string };
  home: {
    badge: string;
    titleA: string;
    titleHighlight: string;
    subtitle: string;
    exploreApi: string;
    getMcp: string;
    features: { payments: Feature; speed: Feature; multi: Feature };
    network: string;
    node: { title: string; body: string; points: string[] };
    footer: string;
  };
  api: {
    title: string;
    subtitle: string;
    toolTax: string;
    toolBank: string;
    toolIban: string;
    region: string;
    type: string;
    typeAuto: string;
    value: string;
    valuePlaceholder: string;
    examples: string;
    rulesEngine: string;
    unitCost: string;
    latency: string;
    free: string;
    request: string;
    response: string;
    execute: string;
    executing: string;
    valid: string;
    invalid: string;
    normalized: string;
    awaiting: string;
    copy: string;
    copied: string;
    paidMode: string;
    freeMode: string;
    paymentRequired: string;
    paymentRequiredBody: string;
    rules: {
      esTax: string;
      coTax: string;
      arTax: string;
      esBank: string;
      arBank: string;
      iban: string;
    };
  };
  mcp: {
    badge: string;
    title: string;
    subtitle: string;
    serverConfig: string;
    remoteUrl: string;
    localStdio: string;
    exposedTools: string;
    ready: string;
    integrationGuide: string;
    steps: { title: string; body: string }[];
    invokeHint: string;
    cliTitle: string;
    cliHint: string;
    toolTags: Record<string, string>;
    toolDesc: Record<string, string>;
  };
  usage: {
    title: string;
    subtitle: string;
    paidCallsSub: string;
    revenueSub: string;
    agentsSub: string;
    activitySub: string;
    spanUnits: { min: string; h: string; d: string };
    endpoints: string;
    emptyEndpoints: string;
    feed: string;
    feedCols: { time: string; endpoint: string; agent: string; amount: string; tx: string };
    emptyFeed: string;
    loadError: string;
    freeModeNote: string;
    quickAction: string;
    quickActionBody: string;
    triggerTest: string;
    testing: string;
    testOk: string;
    testFail: string;
  };
  pricing: {
    title: string;
    subtitle: string;
    defaultPrice: string;
    perCall: string;
    paidMode: string;
    freeMode: string;
    scheme: string;
    network: string;
    howTitle: string;
    steps: { title: string; body: string }[];
    endpointsTitle: string;
    endpoints: { path: string; label: string }[];
    headerTitle: string;
    tryApi: string;
    statusHint: string;
  };
  legal: {
    back: string;
    terms: { title: string; updated: string; sections: { title: string; body: string }[] };
    privacy: { title: string; updated: string; sections: { title: string; body: string }[] };
  };
}

const es: Dict = {
  nav: { home: "Inicio", api: "API", mcp: "MCP", usage: "Uso", pricing: "Precios" },
  common: {
    live: "EN VIVO",
    copy: "Copiar",
    copied: "Copiado",
  },
  home: {
    badge: "Estado de la infraestructura · En vivo",
    titleA: "Validación para la",
    titleHighlight: "economía de agentes",
    subtitle:
      "Validación fiscal y bancaria por uso para España, Colombia y Argentina. Sin claves, sin registros, con pagos vía x402 / MPP sobre Tempo.",
    exploreApi: "Explorar la API",
    getMcp: "Obtener servidor MCP",
    features: {
      payments: {
        title: "Pagos sin fricción",
        body: "Micropagos por petición. Sin cuentas ni compromisos.",
      },
      speed: {
        title: "Velocidad algorítmica",
        body: "Motor de validación en menos de 50 ms, basado en reglas de alto rendimiento.",
      },
      multi: {
        title: "Cobertura multipaís",
        body: "Cobertura fiscal nativa para España (DNI/NIE), Colombia (NIT) y Argentina (CUIT).",
      },
    },
    network: "Red",
    node: {
      title: "Conexión universal de nodos",
      body: "El protocolo Avala conecta a los agentes de IA con los sistemas bancarios reales. Mediante conexiones de bajo coste, garantizamos que cada transacción sea verificable dentro y fuera de la cadena de forma simultánea.",
      points: [
        "Liquidación instantánea en Tempo",
        "Túneles cifrados x402",
        "Pruebas de validación atómicas",
      ],
    },
    footer: "© 2026 Avala Protocol. Todos los derechos reservados.",
  },
  api: {
    title: "Interfaz HTTP x402",
    subtitle:
      "Protocolo de validación de credenciales de alto rendimiento con liquidación de micropagos integrada. Arquitectura de pago por verificación para agentes de identidad soberana.",
    toolTax: "Identificador fiscal",
    toolBank: "Cuenta bancaria",
    toolIban: "IBAN",
    region: "Región",
    type: "Tipo",
    typeAuto: "Auto",
    value: "Valor",
    valuePlaceholder: "Introduce el identificador…",
    examples: "Ejemplos",
    rulesEngine: "Motor de reglas",
    unitCost: "Coste unitario",
    latency: "Latencia",
    free: "gratis (modo dev)",
    request: "Petición",
    response: "Respuesta",
    execute: "Ejecutar validación",
    executing: "Validando…",
    valid: "Válido",
    invalid: "Inválido",
    normalized: "Normalizado",
    awaiting: "Ejecuta una validación para ver la respuesta.",
    copy: "Copiar",
    copied: "Copiado",
    paidMode: "Modo de pago activo",
    freeMode: "Modo gratuito (desarrollo)",
    paymentRequired: "Pago requerido (HTTP 402)",
    paymentRequiredBody:
      "El servidor exige 0,002 pathUSD por llamada. Transfiere en Tempo Moderato y reintenta con la cabecera X-Payment: txHash:42431. Ver docs/MONETIZATION.md.",
    rules: {
      esTax: "DNI/NIE: letra de control (módulo 23) · CIF: dígito o letra de control.",
      coTax: "NIT: dígito de verificación (DIAN) · Cédula: validación de formato.",
      arTax: "CUIT/CUIL: dígito verificador (módulo 11) · DNI: validación de formato.",
      esBank: "IBAN de España: norma ISO 13616 (módulo 97).",
      arBank: "CBU: dos dígitos de control ponderados (bloques de banco y cuenta).",
      iban: "IBAN: ISO 13616 (módulo 97) — 2 letras de país + 2 de control + BBAN.",
    },
  },
  mcp: {
    badge: "Model Context Protocol",
    title: "Potencia tus agentes",
    subtitle:
      "Avala está diseñado para impulsar Cursor, Claude o ChatGPT mediante el Model Context Protocol. Conecta la validación directamente en tu entorno de desarrollo con IA.",
    serverConfig: "Configuración del servidor",
    remoteUrl: "Remoto (Streamable HTTP)",
    localStdio: "Local (stdio)",
    exposedTools: "Herramientas expuestas",
    ready: "Listo para MCP",
    integrationGuide: "Guía de integración",
    steps: [
      {
        title: "Abre la configuración MCP",
        body: "En Cursor o Claude Desktop, ve a Ajustes → MCP y añade un nuevo servidor.",
      },
      {
        title: "Pega la configuración",
        body: "Usa la URL remota o el bloque stdio local según tu entorno.",
      },
      {
        title: "Invoca las herramientas",
        body: "Pide al agente: «Valida este DNI con Avala» o «Comprueba este IBAN».",
      },
    ],
    invokeHint: "Ejemplo: «Valida el NIF 12345678Z con Avala»",
    cliTitle: "Línea de comandos",
    cliHint: "Servidor MCP local por stdio (desde la raíz del proyecto):",
    toolTags: {
      validate_tax_id: "ID",
      validate_bank_account: "FINANZAS",
      validate_iban: "BANCO",
    },
    toolDesc: {
      validate_tax_id:
        "Valida identificadores fiscales: ES (DNI/NIE/CIF), CO (NIT/cédula), AR (CUIT/CUIL/DNI).",
      validate_bank_account: "Verifica cuentas bancarias: ES (IBAN) y AR (CBU) con dígitos de control.",
      validate_iban: "Valida cualquier IBAN con el algoritmo ISO 13616 (módulo 97).",
    },
  },
  usage: {
    title: "Uso",
    subtitle: "Métricas en vivo del servicio desde GET /stats.",
    paidCallsSub: "Llamadas pagadas",
    revenueSub: "Ingresos (pathUSD)",
    agentsSub: "Agentes únicos",
    activitySub: "Ventana de actividad",
    spanUnits: { min: "min", h: "h", d: "d" },
    endpoints: "Llamadas por endpoint",
    emptyEndpoints: "Sin llamadas pagadas todavía.",
    feed: "Pagos recientes",
    feedCols: { time: "Cuándo", endpoint: "Endpoint", agent: "Agente", amount: "Importe", tx: "Tx" },
    emptyFeed: "Aún no hay pagos registrados.",
    loadError: "No se pudieron cargar las métricas. Comprueba que el backend esté en marcha.",
    freeModeNote: "Modo libre activo: las métricas de ingresos aparecerán cuando PAY_TO esté configurado.",
    quickAction: "Acción rápida",
    quickActionBody: "Ejecuta una petición real al nodo para medir latencia.",
    triggerTest: "Probar nodo",
    testing: "Probando…",
    testOk: "Nodo operativo",
    testFail: "Nodo no disponible",
  },
  pricing: {
    title: "Precios",
    subtitle: "Pago por llamada en pathUSD sobre Tempo Moderato. Sin suscripciones ni mínimos.",
    defaultPrice: "0.002 pathUSD",
    perCall: "por validación",
    paidMode: "Modo de pago activo",
    freeMode: "Modo gratuito (desarrollo)",
    scheme: "tempo-tip20",
    network: "Red",
    howTitle: "Cómo pagar",
    steps: [
      {
        title: "Llama sin cabecera de pago",
        body: "POST a /v1/* devuelve HTTP 402 con destino, importe y red.",
      },
      {
        title: "Transfiere pathUSD en Tempo Moderato",
        body: "Envía el importe indicado a la dirección payTo del bloque payment.",
      },
      {
        title: "Reintenta con X-Payment",
        body: "Incluye la cabecera X-Payment: txHash:42431 con el hash de tu transacción.",
      },
    ],
    endpointsTitle: "Endpoints de pago",
    endpoints: [
      { path: "POST /v1/validate-tax-id", label: "Identificador fiscal" },
      { path: "POST /v1/validate-bank-account", label: "Cuenta bancaria" },
      { path: "POST /v1/validate-iban", label: "IBAN" },
      { path: "POST /mcp (tools/call)", label: "Invocación MCP" },
    ],
    headerTitle: "Cabecera de pago",
    tryApi: "Probar en la API",
    statusHint: "Estado en vivo:",
  },
  legal: {
    back: "Volver",
    terms: {
      title: "Términos de uso",
      updated: "Última actualización: junio 2026",
      sections: [
        {
          title: "Servicio",
          body: "Avala ofrece validación algorítmica de identificadores fiscales y cuentas bancarias para España, Colombia y Argentina. El servicio se presta por API HTTP y MCP.",
        },
        {
          title: "Sin verificación oficial",
          body: "Los resultados validan formato y dígitos de control según reglas públicas. No sustituyen verificación ante autoridades fiscales, bancos ni registros oficiales.",
        },
        {
          title: "Pagos",
          body: "Las llamadas de pago requieren transferencia on-chain de pathUSD en Tempo. Los importes y condiciones se publican en /payments/status y /services.json.",
        },
        {
          title: "Limitación de responsabilidad",
          body: "El servicio se ofrece «tal cual». No garantizamos disponibilidad continua ni ausencia de errores en validaciones edge-case.",
        },
      ],
    },
    privacy: {
      title: "Privacidad",
      updated: "Última actualización: junio 2026",
      sections: [
        {
          title: "Datos que envías",
          body: "Las peticiones de validación contienen los identificadores que tú envías. Avala no persiste esos valores en base de datos; se procesan en memoria para responder.",
        },
        {
          title: "Pagos on-chain",
          body: "Las transacciones pathUSD son públicas en la blockchain de Tempo. Tu wallet y hashes de transacción son visibles on-chain.",
        },
        {
          title: "Logs del servidor",
          body: "El operador del despliegue puede registrar metadatos técnicos (IP, timestamps, códigos HTTP) para operación y seguridad. No vendemos datos personales.",
        },
        {
          title: "Cookies",
          body: "La interfaz web no usa cookies de seguimiento. Solo preferencias locales (idioma) en tu navegador.",
        },
      ],
    },
  },
  footer: { terms: "Términos", privacy: "Privacidad" },
};

const en: Dict = {
  nav: { home: "Home", api: "API", mcp: "MCP", usage: "Usage", pricing: "Pricing" },
  common: {
    live: "LIVE",
    copy: "Copy",
    copied: "Copied",
  },
  home: {
    badge: "Infrastructure status · Live",
    titleA: "Validation for the",
    titleHighlight: "Agent Economy",
    subtitle:
      "Pay-per-call fiscal & bank validation for Spain, Colombia and Argentina. No keys, no signups, powered by x402 / MPP over Tempo.",
    exploreApi: "Explore API",
    getMcp: "Get MCP Server",
    features: {
      payments: {
        title: "Zero-friction payments",
        body: "Streaming micro-payments per request. No accounts, no commitments.",
      },
      speed: {
        title: "Algorithmic speed",
        body: "Sub-50ms validation engine powered by high-performance base rules.",
      },
      multi: {
        title: "Multi-country support",
        body: "Native fiscal coverage for Spain (DNI/NIE), Colombia (NIT) and Argentina (CUIT).",
      },
    },
    network: "Network",
    node: {
      title: "Universal Node Connection",
      body: "The Avala protocol bridges the gap between AI agents and real-world banking rails. By leveraging low-cost connections, we ensure every transaction is verifiable on-chain and off-chain simultaneously.",
      points: [
        "Instant Tempo Settlement",
        "x402 Encrypted Tunnels",
        "Atomic Validation Proofs",
      ],
    },
    footer: "© 2026 Avala Protocol. All rights reserved.",
  },
  api: {
    title: "HTTP x402 Interface",
    subtitle:
      "High-throughput credential validation protocol with integrated micropayment settlement. Pay-per-verification architecture for sovereign identity agents.",
    toolTax: "Tax / national ID",
    toolBank: "Bank account",
    toolIban: "IBAN",
    region: "Region",
    type: "Type",
    typeAuto: "Auto",
    value: "Value",
    valuePlaceholder: "Enter the identifier…",
    examples: "Examples",
    rulesEngine: "Rules engine",
    unitCost: "Unit cost",
    latency: "Latency",
    free: "free (dev mode)",
    request: "Request",
    response: "Response",
    execute: "Execute Validation",
    executing: "Validating…",
    valid: "Valid",
    invalid: "Invalid",
    normalized: "Normalized",
    awaiting: "Run a validation to see the response.",
    copy: "Copy",
    copied: "Copied",
    paidMode: "Paid mode active",
    freeMode: "Free mode (development)",
    paymentRequired: "Payment required (HTTP 402)",
    paymentRequiredBody:
      "The server requires 0.002 pathUSD per call. Transfer on Tempo Moderato and retry with header X-Payment: txHash:42431. See docs/MONETIZATION.md.",
    rules: {
      esTax: "DNI/NIE: control letter (modulo 23) · CIF: control digit or letter.",
      coTax: "NIT: verification digit (DIAN) · Cédula: format validation.",
      arTax: "CUIT/CUIL: check digit (modulo 11) · DNI: format validation.",
      esBank: "Spanish IBAN: ISO 13616 standard (modulo 97).",
      arBank: "CBU: two weighted check digits (bank and account blocks).",
      iban: "IBAN: ISO 13616 (modulo 97) — 2-letter country + 2 check + BBAN.",
    },
  },
  mcp: {
    badge: "Model Context Protocol",
    title: "Power your Agents",
    subtitle:
      "Avala is built to fuel Cursor, Claude or ChatGPT via the Model Context Protocol. Connect validation directly into your AI development environment.",
    serverConfig: "Server configuration",
    remoteUrl: "Remote (Streamable HTTP)",
    localStdio: "Local (stdio)",
    exposedTools: "Exposed tools",
    ready: "Ready for MCP",
    integrationGuide: "Integration guide",
    steps: [
      {
        title: "Open MCP settings",
        body: "In Cursor or Claude Desktop, go to Settings → MCP and add a new server.",
      },
      {
        title: "Paste the configuration",
        body: "Use the remote URL or the local stdio block depending on your environment.",
      },
      {
        title: "Invoke the tools",
        body: "Ask the agent: “Validate this DNI with Avala” or “Check this IBAN”.",
      },
    ],
    invokeHint: "Example: “Validate NIF 12345678Z with Avala”",
    cliTitle: "Command line",
    cliHint: "Local MCP server over stdio (from the project root):",
    toolTags: {
      validate_tax_id: "ID",
      validate_bank_account: "FINANCE",
      validate_iban: "BANK",
    },
    toolDesc: {
      validate_tax_id:
        "Validate tax IDs: ES (DNI/NIE/CIF), CO (NIT/cédula), AR (CUIT/CUIL/DNI).",
      validate_bank_account: "Verify bank accounts: ES (IBAN) and AR (CBU) with checksums.",
      validate_iban: "Validate any IBAN using the ISO 13616 mod-97 algorithm.",
    },
  },
  usage: {
    title: "Usage",
    subtitle: "Live service metrics from GET /stats.",
    paidCallsSub: "Paid calls",
    revenueSub: "Revenue (pathUSD)",
    agentsSub: "Unique agents",
    activitySub: "Activity window",
    spanUnits: { min: "min", h: "h", d: "d" },
    endpoints: "Calls by endpoint",
    emptyEndpoints: "No paid calls yet.",
    feed: "Recent payments",
    feedCols: { time: "When", endpoint: "Endpoint", agent: "Agent", amount: "Amount", tx: "Tx" },
    emptyFeed: "No payments recorded yet.",
    loadError: "Could not load metrics. Check that the backend is running.",
    freeModeNote: "Free mode active: revenue metrics appear once PAY_TO is configured.",
    quickAction: "Quick action",
    quickActionBody: "Run a real request against the node to measure latency.",
    triggerTest: "Test node",
    testing: "Testing…",
    testOk: "Node operational",
    testFail: "Node unavailable",
  },
  pricing: {
    title: "Pricing",
    subtitle: "Pay-per-call in pathUSD on Tempo Moderato. No subscriptions or minimums.",
    defaultPrice: "0.002 pathUSD",
    perCall: "per validation",
    paidMode: "Paid mode active",
    freeMode: "Free mode (development)",
    scheme: "tempo-tip20",
    network: "Network",
    howTitle: "How to pay",
    steps: [
      {
        title: "Call without payment header",
        body: "POST to /v1/* returns HTTP 402 with destination, amount and network.",
      },
      {
        title: "Transfer pathUSD on Tempo Moderato",
        body: "Send the indicated amount to the payTo address in the payment block.",
      },
      {
        title: "Retry with X-Payment",
        body: "Include header X-Payment: txHash:42431 with your transaction hash.",
      },
    ],
    endpointsTitle: "Paid endpoints",
    endpoints: [
      { path: "POST /v1/validate-tax-id", label: "Tax / national ID" },
      { path: "POST /v1/validate-bank-account", label: "Bank account" },
      { path: "POST /v1/validate-iban", label: "IBAN" },
      { path: "POST /mcp (tools/call)", label: "MCP invocation" },
    ],
    headerTitle: "Payment header",
    tryApi: "Try in the API",
    statusHint: "Live status:",
  },
  legal: {
    back: "Back",
    terms: {
      title: "Terms of use",
      updated: "Last updated: June 2026",
      sections: [
        {
          title: "Service",
          body: "Avala provides algorithmic validation of tax IDs and bank accounts for Spain, Colombia and Argentina via HTTP API and MCP.",
        },
        {
          title: "Not official verification",
          body: "Results validate format and checksums using public rules. They do not replace verification with tax authorities, banks or official registries.",
        },
        {
          title: "Payments",
          body: "Paid calls require on-chain pathUSD transfers on Tempo. Amounts and conditions are published at /payments/status and /services.json.",
        },
        {
          title: "Limitation of liability",
          body: "The service is provided as-is. We do not guarantee continuous availability or absence of errors in edge-case validations.",
        },
      ],
    },
    privacy: {
      title: "Privacy",
      updated: "Last updated: June 2026",
      sections: [
        {
          title: "Data you send",
          body: "Validation requests contain the identifiers you submit. Avala does not persist those values in a database; they are processed in memory to respond.",
        },
        {
          title: "On-chain payments",
          body: "pathUSD transactions are public on the Tempo blockchain. Your wallet and transaction hashes are visible on-chain.",
        },
        {
          title: "Server logs",
          body: "The deployment operator may log technical metadata (IP, timestamps, HTTP codes) for operations and security. We do not sell personal data.",
        },
        {
          title: "Cookies",
          body: "The web UI does not use tracking cookies. Only local preferences (language) in your browser.",
        },
      ],
    },
  },
  footer: { terms: "Terms", privacy: "Privacy" },
};

export const translations: Record<Lang, Dict> = { es, en };
