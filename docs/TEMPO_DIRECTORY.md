# Registro en el directorio de pagos de Tempo

Guía para que agentes y clientes descubran Avala una vez desplegado.

## Prerrequisitos

- Avala desplegado con URL pública (ver [DEPLOY.md](DEPLOY.md))
- Pagos activos (`PAY_TO` configurado)
- `GET /services.json` accesible y con bloque `pricing` correcto

## Verificar catálogo

```bash
curl -s https://TU-URL.up.railway.app/services.json | jq .
```

Debe incluir:

```json
{
  "name": "avala",
  "version": "0.1.0",
  "pricing": {
    "enabled": true,
    "model": "per-call",
    "amount": "0.002 pathUSD",
    "scheme": "tempo-tip20",
    "network": "eip155:42431",
    "paymentHeader": "X-Payment",
    "paymentHeaderFormat": "txHash:chainId"
  }
}
```

## Datos para el registro

Copia esta plantilla con tu URL real:

| Campo | Valor |
| ----- | ----- |
| **Nombre** | avala |
| **Descripción** | Validación fiscal y bancaria por uso (ES, CO, AR) |
| **URL API** | `https://TU-URL.up.railway.app/` |
| **URL MCP** | `https://TU-URL.up.railway.app/mcp` |
| **Manifiesto MPP** | `https://TU-URL.up.railway.app/.well-known/mpp.json` |
| **Catálogo** | `https://TU-URL.up.railway.app/services.json` |
| **Health** | `https://TU-URL.up.railway.app/healthz` |
| **Red** | `eip155:42431` (Tempo Moderato) |
| **Token** | pathUSD `0x20c0000000000000000000000000000000000000` |
| **Esquema** | `tempo-tip20` |
| **Cabecera** | `X-Payment: <txHash>:42431` |
| **Precio** | 0,002 pathUSD por llamada |

> El servicio expone un **manifiesto de descubrimiento MPP** (OpenAPI 3.1 con
> `x-service-info` y `x-payment-info`) en `/.well-known/mpp.json`. Los registros
> lo importan automáticamente, así que basta con dar la URL del sitio.

## Dónde registrar

El directorio de pagos de Tempo es ahora el **MPP (Machine Payments Protocol)**.
Hay tres canales, de menor a mayor esfuerzo:

1. **MPPScan** — [mppscan.com/register](https://www.mppscan.com/register).
   Permisivo e inmediato, sin revisión. Pega la URL del servicio.
2. **MPP Registry** — [mpp.directory/v1/services/submit](https://mpp.directory/v1/services/submit).
   Self-serve oficial. En "Import well-known manifest" pega la URL del manifiesto
   (`…/.well-known/mpp.json`); lo importa y encola la verificación.
3. **Lista curada `mpp.dev/services`** — PR a
   [tempoxyz/mpp](https://github.com/tempoxyz/mpp) editando `schemas/services.ts`.
   Requiere revisión (servicios "live y production-ready").

## Checklist post-registro

- [ ] URL pública responde `200` en `/healthz`
- [ ] `POST /v1/validate-tax-id` sin pago devuelve `402`
- [ ] Pago con `X-Payment` devuelve `200`
- [ ] MCP `tools/list` gratuito; `tools/call` requiere pago
- [ ] `services.json` accesible sin autenticación
- [ ] Pantalla Precios en la web muestra el importe correcto

## Actualizar tras cambios

Si cambias precio, red o wallet:

1. Actualiza variables en Railway
2. Redeploy
3. Verifica `/payments/status` y `/services.json`
4. Actualiza la entrada en el directorio Tempo
