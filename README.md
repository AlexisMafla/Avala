# Avala

> Verifica antes de pagar. Por llamada, sin cuentas.

**Avala** es un servicio de **validación por uso** (pay-per-call) de identificadores fiscales y cuentas
bancarias para **España, Colombia y Argentina**. Está pensado para la economía de **pagos agénticos**:
cualquier agente de IA o app paga una fracción de céntimo por llamada vía **pagos TIP-20 sobre Tempo** (HTTP 402),
sin API keys ni registro.

El mismo núcleo de validación se expone de dos formas:

1. **API HTTP** monetizable con paywall **tempo-tip20** (verificación on-chain de pathUSD).
2. **MCP server** (Model Context Protocol) para que agentes como Cursor, Claude o ChatGPT lo usen como herramienta.

## Por qué este nicho

- **Coste casi cero**: las validaciones son algorítmicas (dígitos de control), sin GPU ni proxies → margen ~100%.
- **Baja competencia**: pocos servicios "agent-payable" cubren identificadores LATAM/España.
- **Escalable por replicación**: añadir más validaciones/países es barato y multiplica ingresos sin más infraestructura.

## Herramientas / endpoints

| Herramienta MCP        | Endpoint HTTP                 | Qué valida                                  |
| ---------------------- | ----------------------------- | ------------------------------------------- |
| `validate_tax_id`      | `POST /v1/validate-tax-id`    | ES: DNI/NIE/CIF · CO: NIT/cédula · AR: CUIT/CUIL/DNI |
| `validate_bank_account`| `POST /v1/validate-bank-account` | ES: IBAN · AR: CBU                       |
| `validate_iban`        | `POST /v1/validate-iban`      | Cualquier IBAN (ISO 13616 mod-97)           |

Endpoints gratuitos de descubrimiento: `GET /` , `GET /healthz`, `GET /services.json`,
`GET /openapi.json` y `GET /.well-known/mpp.json` (manifiesto MPP para registros de agentes).

Métricas del servicio: `GET /stats` (JSON con llamadas, ingresos y agentes) y
`GET /dashboard` (panel visual en vivo para el dueño).

Cada validación devuelve un objeto:

```json
{ "valid": true, "normalized": "20-12345678-6", "details": { "type": "CUIT/CUIL", "prefix": "20" } }
```

Cuando es inválido incluye un `reason` legible por máquina: `invalid_format`, `invalid_checksum` o `unsupported`.

## Requisitos

- Node.js >= 20

## Instalación

```bash
npm install
```

## Uso

### 1) API HTTP

```bash
# Modo desarrollo (sin pago, recarga en caliente)
npm run dev

# Producción
npm run build
npm start
```

Probar:

```bash
curl -X POST http://localhost:8787/v1/validate-tax-id \
  -H "content-type: application/json" \
  -d '{"country":"ES","value":"12345678Z"}'
```

### 2) MCP server

#### Local (stdio)

```bash
npm run mcp
```

Configuración para un cliente MCP local (p. ej. Cursor / Claude Desktop):

```json
{
  "mcpServers": {
    "avala": {
      "command": "npx",
      "args": ["tsx", "src/mcp/stdio.ts"],
      "cwd": "/ruta/al/proyecto"
    }
  }
}
```

#### Remoto (Streamable HTTP)

El mismo servidor HTTP expone MCP en `POST/GET/DELETE /mcp` (transporte Streamable HTTP).
La inicialización y el listado de herramientas son gratuitos; cada `tools/call` requiere pago on-chain
cuando `PAY_TO` está configurado.

```bash
npm run dev
```

Configuración para un cliente MCP remoto:

```json
{
  "mcpServers": {
    "avala": {
      "url": "http://localhost:8787/mcp"
    }
  }
}
```

En producción sustituye la URL por tu dominio público (p. ej. `https://avala.example.com/mcp`).

### 3) Interfaz web (playground)

```bash
cd web
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) con el backend en `:8787`. Ver [web/README.md](web/README.md).

## Activar los pagos (Tempo TIP-20 en Moderato)

Guía completa paso a paso: **[docs/MONETIZATION.md](docs/MONETIZATION.md)**

Verificar configuración:

```bash
npm run payments:check
```

Por defecto el servicio corre en **modo libre** (sin cobrar). Para monetizar, copia `.env.example` a `.env`
y rellena:

```bash
PAY_TO=0xTU_DIRECCION                    # wallet receptora en Tempo
TEMPO_RPC_URL=https://rpc.moderato.tempo.xyz
X402_NETWORK=eip155:42431                # Tempo Moderato (chain 42431)
X402_ASSET=0x20c0000000000000000000000000000000000000   # pathUSD
X402_ASSET_DECIMALS=6
PRICE_ATOMIC=2000                        # 0.002 pathUSD por llamada
```

Con `PAY_TO` definido, las rutas `/v1/*` y las invocaciones MCP (`tools/call` en `/mcp`) quedan protegidas:
una petición sin pago recibe `402 Payment Required`; el cliente transfiere pathUSD y reintenta con
`X-Payment: <txHash>:42431`.

Probar pago end-to-end (PowerShell):

```powershell
.\scripts\test-paid-call.ps1 -TxHash 0xTU_HASH_DE_TRANSACCION
```

## Despliegue

Guía completa: **[docs/DEPLOY.md](docs/DEPLOY.md)**

Build de producción (API + web en un solo servicio):

```bash
npm run build:all
NODE_ENV=production npm start
```

Recomendado para empezar: **Railway** con el [Dockerfile](Dockerfile) incluido.

Después, registra el servicio en el **directorio de pagos de Tempo** (ver `docs/MONETIZATION.md`).

## Estructura

```
src/
  core/        # validadores puros (iban, es, co, ar) + dispatchers
  tools/       # definiciones de herramientas compartidas (schema + handler)
  mcp/         # MCP server (stdio + HTTP remoto)
  http/        # servidor Hono con paywall tempo-tip20
web/           # playground React + Vite + Tailwind
test/          # tests de los validadores (vitest)
```

## Scripts

| Script            | Acción                                  |
| ----------------- | --------------------------------------- |
| `npm run dev`     | API HTTP con recarga en caliente        |
| `npm start`       | API HTTP compilada                      |
| `npm run mcp`     | MCP server por stdio                    |
| `npm run build`   | Compilar TypeScript a `dist/`           |
| `npm run build:all` | Compilar web + backend para producción |
| `npm run typecheck` | Verificación de tipos                 |
| `npm test`        | Tests con Vitest                        |
| `npm run payments:check` | Verificar config de pagos          |

## Roadmap

- [x] MCP remoto sobre HTTP (Streamable HTTP) con pago x402 por invocación.
- [x] Más validaciones: España (CIF), Colombia (cédula), Argentina (DNI).
- [x] Interfaz web (playground React).
- [x] Pagos tempo-tip20 verificados on-chain en Tempo Moderato.
- [x] Despliegue monolito (Docker + Railway).
- [ ] Más países (MX: CLABE/RFC/CURP; etc.).
- [ ] Métricas de uso e ingresos por endpoint.

## Licencia

MIT
