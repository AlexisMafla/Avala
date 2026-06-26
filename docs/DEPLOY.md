# Despliegue · Avala en Railway

Guía para publicar Avala como **monolito** (API + interfaz web en una sola URL).

## Requisitos

- Cuenta en [Railway](https://railway.app)
- Repositorio Git (GitHub o GitLab) con el código de Avala
- Wallet `PAY_TO` con pathUSD en Tempo Moderato (testnet)

## Arquitectura

```
https://tu-app.up.railway.app/
├── /                    → Interfaz web (React)
├── /v1/*                → API de validación (402 + pago)
├── /mcp                 → MCP remoto
├── /healthz             → Health check
├── /payments/status     → Estado de pagos
└── /services.json       → Catálogo para agentes
```

## Paso 1 · Subir el código a Git

```bash
git add .
git commit -m "Initial Avala release"
git remote add origin <tu-repo-url>
git push -u origin main
```

## Paso 2 · Crear proyecto en Railway

1. **New Project** → **Deploy from GitHub repo** (o GitLab)
2. Selecciona el repositorio Avala
3. Railway detectará el `Dockerfile` automáticamente

## Paso 3 · Variables de entorno

En Railway → tu servicio → **Variables**:

| Variable | Valor | Obligatorio |
| -------- | ----- | ----------- |
| `NODE_ENV` | `production` | Sí |
| `PAY_TO` | `0xTuWallet...` | Sí (para cobrar) |
| `TEMPO_RPC_URL` | `https://rpc.moderato.tempo.xyz` | Sí |
| `PRICE_ATOMIC` | `2000` | No (default 0.002 pathUSD) |
| `X402_NETWORK` | `eip155:42431` | No |
| `PORT` | *(Railway lo inyecta)* | Auto |

> **No** subas `.env` al repositorio. Configura las variables solo en Railway.

## Paso 4 · Desplegar

Railway construye la imagen Docker y ejecuta:

```bash
npm run build:all   # durante el build
node dist/http/server.js
```

Obtendrás una URL pública tipo `https://avala-production-xxxx.up.railway.app`.

## Paso 5 · Smoke tests

Desde tu máquina (sustituye la URL):

```powershell
$base = "https://tu-app.up.railway.app"

# Health
curl.exe -s "$base/healthz"

# Catálogo
curl.exe -s "$base/services.json"

# 402 sin pago
curl.exe -s -w "`nHTTP:%{http_code}" -X POST "$base/v1/validate-tax-id" `
  -H "content-type: application/json" `
  -d "{\"country\":\"ES\",\"value\":\"12345678Z\"}"

# Interfaz web
curl.exe -s -o NUL -w "HTTP:%{http_code}" -H "Accept: text/html" "$base/"
```

O usa el script incluido:

```powershell
.\scripts\smoke-test.ps1 -BaseUrl "https://tu-app.up.railway.app"
```

## Paso 6 · Probar pago en producción

```powershell
.\scripts\test-paid-call.ps1 -ApiUrl "https://tu-app.up.railway.app" -TxHash 0xTU_HASH
```

## Build local (sin Docker)

```bash
npm install
npm ci --prefix web
npm run build:all
NODE_ENV=production PAY_TO=0x... npm start
```

Abre `http://localhost:8787` en el navegador (la web se sirve desde el mismo puerto).

## Solución de problemas

| Síntoma | Causa | Acción |
| ------- | ----- | ------ |
| 502 en Railway | Build falló | Revisar logs de deploy |
| Web en blanco | `web/dist` no generado | Verificar `npm run build:all` en Dockerfile |
| Sigue en modo gratis | `PAY_TO` no configurado en Railway | Añadir variable y redeploy |
| API 402 pero web no carga | `Accept` header | La web usa `text/html` en `/` |
| CORS en dev local | Orígenes distintos | En prod misma URL = sin CORS |

## Siguiente paso

Registra el servicio en el directorio de pagos de Tempo: **[docs/TEMPO_DIRECTORY.md](TEMPO_DIRECTORY.md)**
