# Avala Web Playground

Interfaz web para probar las validaciones de Avala contra la API HTTP.

## Requisitos

- Node.js >= 20
- Backend Avala corriendo (`npm run dev` en la raíz del proyecto)

## Instalación

```bash
cd web
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

Por defecto la UI llama a `http://localhost:8787`. Para apuntar a otra URL:

```bash
# .env.local
VITE_API_BASE=https://tu-servidor.example.com
```

## Build

```bash
npm run build
npm run preview
```
