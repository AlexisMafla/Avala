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
| **Catálogo** | `https://TU-URL.up.railway.app/services.json` |
| **Health** | `https://TU-URL.up.railway.app/healthz` |
| **Red** | `eip155:42431` (Tempo Moderato) |
| **Token** | pathUSD `0x20c0000000000000000000000000000000000000` |
| **Esquema** | `tempo-tip20` |
| **Cabecera** | `X-Payment: <txHash>:42431` |
| **Precio** | 0,002 pathUSD por llamada |

## Dónde registrar

1. Consulta la documentación actual de [Tempo](https://docs.tempo.xyz) y su directorio de servicios de pago
2. Busca el foro o formulario de registro de agentes/servicios x402
3. En GitHub: [tempoxyz/tempo-apps discussions](https://github.com/tempoxyz/tempo-apps/discussions) (categoría explorer / payments)

> El proceso puede ser manual. No hay API automatizada en este repositorio.

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
