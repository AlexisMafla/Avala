# Monetización · Fase 2

Guía para activar los pagos por uso (**Tempo TIP-20 / HTTP 402**) sobre **Tempo Moderato** (testnet).

## Resumen

| Modo | Cuándo | Comportamiento |
| ---- | ------ | -------------- |
| **Gratis (dev)** | `PAY_TO` vacío | Todas las validaciones son gratuitas |
| **De pago** | `PAY_TO` configurado | `/v1/*` y `tools/call` en MCP requieren pago on-chain |

Avala verifica transferencias **pathUSD** directamente en la cadena (sin facilitator externo). Esquema: **`tempo-tip20`**.

Precio por defecto: **0,002 pathUSD** por llamada (`PRICE_ATOMIC=2000`, 6 decimales).

---

## Paso 1 · Wallet con MetaMask

Usaremos **MetaMask** como wallet de auto-custodia EVM. Es la opción más acorde para Avala: controlas tu dirección `0x…`, puedes añadir Tempo Moderato como red personalizada y esa dirección será tu `PAY_TO`.

> **Importante:** Binance (exchange) **no sirve** para esto. Necesitas una wallet donde tú controles las claves (MetaMask). `PAY_TO` es solo tu dirección **pública**; nunca pongas la frase semilla ni la clave privada en `.env`.

### 1.1 Instalar y crear wallet

1. Instala [MetaMask](https://metamask.io/) (extensión de navegador o app móvil).
2. Crea una **wallet nueva dedicada a Avala** (no mezcles con fondos personales).
3. Guarda la **frase semilla** en papel, offline. No la compartas ni la guardes en la nube.

### 1.2 Obtener tu `PAY_TO`

1. Abre MetaMask.
2. Haz clic en el nombre de la cuenta (arriba) → **Copiar dirección**.
3. Verás algo como `0xAbCdEf1234567890…` (42 caracteres, empieza por `0x`).
4. Esa dirección es tu **`PAY_TO`** — donde Avala recibirá los cobros.

### 1.3 Añadir la red Tempo Moderato (testnet)

En MetaMask: **Redes** (o el selector de red) → **Añadir red** → **Añadir red manualmente**.

| Campo | Valor |
| ----- | ----- |
| **Nombre de la red** | Tempo Moderato |
| **URL RPC** | `https://rpc.moderato.tempo.xyz` |
| **ID de cadena** | `42431` |
| **Símbolo de moneda** | pathUSD |
| **URL del explorador** | `https://explore.moderato.tempo.xyz` |

Guarda y cambia a la red **Tempo Moderato**.

### 1.4 Fondear con pathUSD de testnet

Sustituye `0xTU_DIRECCION` por la dirección que copiaste en el paso 1.2:

```bash
curl -X POST "https://rpc.moderato.tempo.xyz" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tempo_fundAddress","params":["0xTU_DIRECCION"],"id":1}'
```

Esto acredita tokens de prueba en Moderato. En MetaMask, con la red Tempo Moderato seleccionada, deberías ver saldo de pathUSD (puede tardar unos segundos; a veces hay que **importar el token** manualmente si no aparece).

**Token pathUSD (por si MetaMask no lo muestra):**

| Campo | Valor |
| ----- | ----- |
| Dirección del contrato | `0x20c0000000000000000000000000000000000000` |
| Decimales | `6` |
| Símbolo | pathUSD |

En MetaMask: **Importar tokens** → pegar la dirección del contrato.

Los **clientes** que paguen deben transferir pathUSD en Moderato y reintentar con la cabecera `X-Payment: <txHash>:42431`.

---

## Paso 2 · Configurar `.env`

```bash
cp .env.example .env
```

Edita `.env`:

```bash
PAY_TO=0xTU_DIRECCION_METAMASK
TEMPO_RPC_URL=https://rpc.moderato.tempo.xyz
X402_NETWORK=eip155:42431
X402_ASSET=0x20c0000000000000000000000000000000000000
X402_ASSET_DECIMALS=6
PRICE_ATOMIC=2000
```

> Solo `PAY_TO` es obligatorio para activar pagos.

---

## Paso 3 · Verificar configuración

```bash
npm run payments:check
```

Debe mostrar `Mode: PAID`, `Ready: true`, `Scheme: tempo-tip20` y RPC reachability **OK**.

También puedes consultar:

```bash
curl http://localhost:8787/payments/status
```

---

## Paso 4 · Reiniciar el servidor

```bash
npm run dev
```

En consola deberías ver:

```
[avala] Payments ENABLED (tempo-tip20) -> payTo=0x… network=eip155:42431 price=0.002 pathUSD
```

---

## Paso 5 · Probar el flujo 402

Sin cabecera de pago, una validación debe devolver **402 Payment Required**:

```bash
curl -i -X POST http://localhost:8787/v1/validate-tax-id \
  -H "content-type: application/json" \
  -d '{"country":"ES","value":"12345678Z"}'
```

La respuesta incluye `payment` con destino, importe y cadena. El cliente transfiere pathUSD y reintenta con:

```
X-Payment: 0x<txHash>:42431
```

**PowerShell** (sin escapar JSON manualmente):

```powershell
$body = '{"country":"ES","value":"12345678Z"}'
Invoke-WebRequest -Uri "http://localhost:8787/v1/validate-tax-id" -Method POST -ContentType "application/json" -Body $body
# StatusCode 402 = correcto
```

Endpoints **gratuitos** (sin pago): `GET /`, `GET /healthz`, `GET /services.json`, `GET /payments/status`, MCP `initialize` y `tools/list`.

---

## Paso 6 · Flujo verificado (testnet)

El flujo completo ha sido probado en Tempo Moderato:

1. `POST /v1/validate-tax-id` sin cabecera → **HTTP 402** con bloque `payment`
2. Transferir **0,002 pathUSD** a `PAY_TO` en MetaMask
3. Reintentar con `X-Payment: <txHash>:42431` → **HTTP 200** con resultado de validación

Script de prueba automatizado:

```powershell
# Con hash conocido
.\scripts\test-paid-call.ps1 -TxHash 0xabc...def

# Esperar nueva transferencia y probar automáticamente
.\scripts\test-paid-call.ps1 -Wait
```

---

## Descubrimiento para agentes

Con pagos activos, `GET /services.json` expone el bloque `pricing` con:

- `scheme`, `network`, `asset`, `priceAtomic`, `payTo`

Úsalo para registrar Avala en el **directorio de pagos de Tempo** cuando tengas URL pública.

Plantilla de registro (rellenar al desplegar):

| Campo | Valor |
| ----- | ----- |
| Nombre | avala |
| URL API | `https://tu-dominio.com` |
| URL MCP | `https://tu-dominio.com/mcp` |
| Catálogo | `https://tu-dominio.com/services.json` |
| Red | `eip155:42431` |
| Token | pathUSD `0x20c0…0000` |

---

## Ajustar el precio

`PRICE_ATOMIC` está en unidades atómicas del token (6 decimales para pathUSD):

| PRICE_ATOMIC | Precio |
| ------------ | ------ |
| 1000 | 0,001 pathUSD |
| 2000 | 0,002 pathUSD |
| 10000 | 0,01 pathUSD |

---

## Solución de problemas

| Síntoma | Causa probable | Acción |
| ------- | -------------- | ------ |
| MetaMask no muestra pathUSD | Token no importado o red incorrecta | Red Tempo Moderato + importar contrato pathUSD |
| Sigue en modo gratis | `.env` no cargado o `PAY_TO` vacío | `npm run payments:check` |
| HTTP 500 en `/v1/*` | Servidor sin reiniciar tras cambiar `.env` | Reiniciar `npm run dev` |
| 402 pero verificación falla | Transferencia incorrecta o tx ya usada | Revisar importe, destino y cabecera `X-Payment` |
| RPC FAILED | `TEMPO_RPC_URL` incorrecta | Probar `https://rpc.moderato.tempo.xyz` |
| WARN en PAY_TO | Dirección mal formada | Debe ser `0x` + 40 hex |

---

## Próximo hito (Fase 2 → 3)

- [x] Flujo de pago verificado en testnet
- [ ] Desplegar con URL pública (ver `docs/DEPLOY.md`)
- [ ] Registrar en directorio Tempo (ver `docs/TEMPO_DIRECTORY.md`)
- [ ] Primera transacción real de un agente externo
- [x] Página pública de precios y términos de uso (interfaz web)
