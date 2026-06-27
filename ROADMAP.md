# Hoja de ruta · Avala

> Validación por uso de identificadores fiscales y cuentas bancarias (ES · CO · AR),
> monetizada con pagos TIP-20 sobre Tempo y expuesta como API HTTP y servidor MCP.

Documento vivo. Se actualiza a medida que avanzamos.
**Última actualización:** 2026-06-27 (Fase 3 en curso)

## Leyenda de estado

| Símbolo | Significado |
| ------- | ----------- |
| ✅ | Completado |
| 🟡 | En curso |
| ⬜ | Pendiente |

---

## Fase 0 · Base técnica — ✅ Completada

El núcleo del producto funciona y está probado.

- ✅ Motor de validación puro (ES: DNI/NIE/CIF · CO: NIT/cédula · AR: CUIT/CUIL/DNI/CBU · IBAN)
- ✅ API HTTP (Hono) con endpoints `/v1/*`
- ✅ Servidor MCP (stdio + HTTP remoto)
- ✅ Paywall Tempo TIP-20 on-chain
- ✅ Suite de pruebas automáticas (51 tests en verde)

## Fase 1 · Interfaz — 🟡 Casi completa

La app visual que ve el usuario y que sirve de escaparate (web/inversores).

- ✅ Sistema de diseño (tokens de color, tipografías, fuentes)
- ✅ Esqueleto + navegación de pestañas (Inicio · API · MCP · Uso · Precios)
- ✅ Internacionalización (español por defecto, multilenguaje ES/EN)
- ✅ Pantalla **Inicio** (propuesta de valor, features, red de nodos)
- ✅ Pantalla **API** (validador real conectado al motor + visor JSON)
- ✅ Pantalla **MCP** (herramientas expuestas + guía de integración)
- ✅ Pantalla **Uso** (métricas reales desde `/stats`; feed de pagos recientes)
- 🟡 Pulido responsive (móvil → escritorio) y accesibilidad

## Fase 2 · Monetización — ✅ Completada (testnet)

Encender los ingresos por uso.

- ✅ Infraestructura de activación (`/payments/status`, `services.json` enriquecido, validación de config)
- ✅ Script `npm run payments:check` + guía `docs/MONETIZATION.md`
- ✅ UI: modo gratis/de pago + manejo HTTP 402 en pantalla API
- ✅ Paywall Tempo TIP-20 on-chain (`tempo-tip20`, sin facilitator externo)
- ✅ `.env` con `PAY_TO` + HTTP 402 verificado en testnet
- ✅ Prueba de pago real end-to-end (transferir pathUSD + cabecera `X-Payment`)
- ✅ Store persistente de pagos (replay protection + métricas en `/stats`)
- ✅ Panel de métricas del dueño (`GET /dashboard`)
- 🟡 Página pública de precios y términos de uso
- 🟡 Publicar Avala en el directorio de pagos (✅ MPPScan testnet · ⬜ lista curada mpp.dev tras mainnet)

## Fase 3 · Lanzamiento público — 🟡 En curso

Sacar el producto al mundo.

- ✅ Despliegue en Railway (monolito API + web)
- ✅ Manifiesto de descubrimiento MPP (`/openapi.json` + `/.well-known/mpp.json`)
- ✅ Registrado en MPPScan (descubrible por agentes en testnet)
- ⬜ Dominio propio (opcional; URL de Railway por ahora)
- ✅ Landing de marketing (pantalla Inicio)
- 🟡 Documentación pública para desarrolladores (`docs/DEPLOY.md`)
- 🟡 Aviso legal, privacidad y cookies
- ⬜ Analítica básica (visitas, conversiones)

## Fase 4 · Crecimiento — ⬜ Pendiente

Escalar por replicación.

- ⬜ Nuevos países (México: CLABE/RFC/CURP; Chile; etc.)
- ✅ Métricas reales de uso e ingresos por endpoint (`/stats`, `/dashboard`)
- ✅ Panel de Uso con datos reales (pestaña web conectada a `/stats`)
- ⬜ Optimización de costes y caché
- ⬜ **Rediseño de identidad de marca**: nuevo logo y favicon (sustituir el rayo
  actual), paleta y aplicación en web (`BrandMark`) y `favicon.svg`

---

## Próximo paso inmediato

🟡 **Migración a mainnet** + envío del PR a la lista curada `mpp.dev/services`.
Avala ya está desplegado en Railway y registrado en MPPScan (testnet).

## Hitos clave (visión simple)

1. **Producto demostrable** (Fase 1) → poder enseñar la app completa.
2. **Primer ingreso real** (Fase 2) → cobrar una llamada de verdad. ✅
3. **Público** (Fase 3) → cualquiera puede usarlo y los agentes lo descubren.
4. **Escala** (Fase 4) → más países y datos reales de tracción.
