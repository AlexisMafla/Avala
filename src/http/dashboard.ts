/**
 * Self-contained HTML dashboard for the service owner.
 *
 * Renders live data from GET /stats with no build step or framework. Served at
 * GET /dashboard. Uses the Avala brand palette to stay visually consistent with
 * the web UI.
 */
export function dashboardHtml(): string {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Avala · Panel de métricas</title>
<link rel="icon" href="/favicon.svg" />
<style>
  :root {
    --base:#070b14; --surface:#0d1320; --surface2:#121a2b; --line:#1e2a40;
    --mint:#34d399; --mint2:#10b981; --iris:#818cf8;
    --ink:#f1f5f9; --ink2:#94a3b8; --ink3:#64748b; --warn:#fbbf24;
    --sans:"Inter",system-ui,-apple-system,"Segoe UI",sans-serif;
    --mono:"JetBrains Mono","SFMono-Regular",Consolas,monospace;
    --display:"Space Grotesk","Inter",system-ui,sans-serif;
  }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--base); color:var(--ink); font-family:var(--sans);
    -webkit-font-smoothing:antialiased; min-height:100vh; }
  .wrap { max-width:980px; margin:0 auto; padding:24px 20px 64px; }
  header { display:flex; align-items:center; justify-content:space-between; gap:12px;
    flex-wrap:wrap; margin-bottom:28px; }
  .brand { display:flex; align-items:center; gap:10px; }
  .brand svg { width:26px; height:26px; }
  .brand b { font-family:var(--display); font-size:18px; letter-spacing:.18em; }
  .badge { display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:600;
    padding:5px 11px; border-radius:999px; border:1px solid var(--line); color:var(--ink2); }
  .dot { width:7px; height:7px; border-radius:999px; background:var(--mint);
    box-shadow:0 0 0 0 var(--mint); animation:pulse 2s infinite; }
  @keyframes pulse { 0%{box-shadow:0 0 0 0 rgba(52,211,153,.5);} 70%{box-shadow:0 0 0 7px rgba(52,211,153,0);} 100%{box-shadow:0 0 0 0 rgba(52,211,153,0);} }
  h1 { font-family:var(--display); font-size:13px; text-transform:uppercase; letter-spacing:.14em;
    color:var(--ink3); margin:0 0 12px; font-weight:600; }
  .grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:28px; }
  @media(max-width:680px){ .grid{ grid-template-columns:repeat(2,1fr);} }
  .card { background:var(--surface); border:1px solid var(--line); border-radius:16px; padding:18px; }
  .stat .v { font-family:var(--display); font-size:30px; font-weight:700; line-height:1; }
  .stat .v.mint { color:var(--mint); }
  .stat .l { margin-top:8px; font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:var(--ink3); }
  .bars { display:flex; flex-direction:column; gap:12px; }
  .bar-row .top { display:flex; justify-content:space-between; font-size:13px; margin-bottom:5px; }
  .bar-row .top .ep { font-family:var(--mono); color:var(--ink); font-size:12px; }
  .bar-row .top .n { color:var(--ink2); }
  .track { height:8px; border-radius:999px; background:var(--surface2); overflow:hidden; }
  .fill { height:100%; border-radius:999px; background:linear-gradient(90deg,var(--mint2),var(--mint)); transition:width .5s; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th { text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:.08em; color:var(--ink3);
    padding:10px 12px; border-bottom:1px solid var(--line); font-weight:600; }
  td { padding:10px 12px; border-bottom:1px solid var(--line); }
  tr:last-child td { border-bottom:0; }
  td.mono, .mono { font-family:var(--mono); font-size:12px; }
  .amt { color:var(--mint); font-weight:600; }
  a { color:var(--iris); text-decoration:none; }
  a:hover { text-decoration:underline; }
  .empty { text-align:center; color:var(--ink3); padding:32px 12px; font-size:14px; }
  .muted { color:var(--ink3); font-size:12px; }
  .row { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .pill { font-size:11px; font-weight:600; padding:3px 9px; border-radius:999px; border:1px solid var(--line); }
  .pill.ok { color:var(--mint); border-color:color-mix(in srgb,var(--mint) 35%,transparent); }
  .pill.warn { color:var(--warn); border-color:color-mix(in srgb,var(--warn) 35%,transparent); }
  button { font-family:var(--sans); font-size:12px; font-weight:600; color:var(--ink2);
    background:var(--surface2); border:1px solid var(--line); border-radius:9px; padding:7px 13px; cursor:pointer; }
  button:hover { color:var(--ink); }
  .section { margin-bottom:28px; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="brand">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2.5 4 6v6c0 4.6 3.2 7.9 8 9.5 4.8-1.6 8-4.9 8-9.5V6l-8-3.5Z" stroke="#34d399" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="m8.5 12 2.5 2.5 5-5" stroke="#34d399" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <b>AVALA</b>
      <span class="muted">· Panel de métricas</span>
    </div>
    <div class="row">
      <span id="mode" class="pill">…</span>
      <span class="badge"><span class="dot"></span><span id="updated">en vivo</span></span>
      <button id="refresh" type="button">Actualizar</button>
    </div>
  </header>

  <div class="grid">
    <div class="card stat"><div class="v" id="calls">–</div><div class="l">Llamadas pagadas</div></div>
    <div class="card stat"><div class="v mint" id="revenue">–</div><div class="l">Ingresos (pathUSD)</div></div>
    <div class="card stat"><div class="v" id="agents">–</div><div class="l">Agentes únicos</div></div>
    <div class="card stat"><div class="v" id="span">–</div><div class="l">Actividad</div></div>
  </div>

  <div class="section">
    <h1>Llamadas por endpoint</h1>
    <div class="card"><div class="bars" id="bars"><div class="empty">Sin datos todavía</div></div></div>
  </div>

  <div class="section">
    <h1>Pagos recientes</h1>
    <div class="card" style="padding:0;overflow:hidden">
      <div id="recent"><div class="empty">Aún no hay pagos registrados. Cuando un agente pague, aparecerá aquí.</div></div>
    </div>
  </div>

  <p class="muted">Datos de <span class="mono">/stats</span> · se actualiza cada 10 s · esta página es pública (no indexada).</p>
</div>

<script>
const fmtTime = (ts) => { try { return new Date(ts).toLocaleString(); } catch { return String(ts); } };
const shortHash = (h) => h && h.length > 14 ? h.slice(0,8)+"…"+h.slice(-6) : (h||"");
const shortAddr = (a) => a && a.length > 12 ? a.slice(0,6)+"…"+a.slice(-4) : (a||"—");
const relSpan = (first, last) => {
  if (!first || !last) return "—";
  const mins = Math.round((last - first)/60000);
  if (mins < 60) return mins + " min";
  const hrs = Math.round(mins/60);
  if (hrs < 48) return hrs + " h";
  return Math.round(hrs/24) + " d";
};

async function load() {
  try {
    const r = await fetch("/stats", { cache: "no-store" });
    const s = await r.json();
    document.getElementById("calls").textContent = s.totalCalls ?? 0;
    document.getElementById("revenue").textContent = s.totalRevenue ?? "0";
    document.getElementById("agents").textContent = s.uniqueAgents ?? 0;
    document.getElementById("span").textContent = relSpan(s.firstAt, s.lastAt);

    const mode = document.getElementById("mode");
    if (s.enabled) { mode.textContent = "Pagos activos"; mode.className = "pill ok"; }
    else { mode.textContent = "Modo libre"; mode.className = "pill warn"; }

    const entries = Object.entries(s.byEndpoint || {}).sort((a,b)=>b[1]-a[1]);
    const bars = document.getElementById("bars");
    if (entries.length === 0) {
      bars.innerHTML = '<div class="empty">Sin datos todavía</div>';
    } else {
      const max = Math.max(...entries.map(e=>e[1]));
      bars.innerHTML = entries.map(([ep,n]) =>
        '<div class="bar-row"><div class="top"><span class="ep">'+ep+'</span><span class="n">'+n+'</span></div>'+
        '<div class="track"><div class="fill" style="width:'+Math.round(n/max*100)+'%"></div></div></div>'
      ).join("");
    }

    const recent = document.getElementById("recent");
    const rows = s.recent || [];
    if (rows.length === 0) {
      recent.innerHTML = '<div class="empty">Aún no hay pagos registrados. Cuando un agente pague, aparecerá aquí.</div>';
    } else {
      recent.innerHTML =
        '<table><thead><tr><th>Cuándo</th><th>Endpoint</th><th>Agente</th><th>Importe</th><th>Tx</th></tr></thead><tbody>'+
        rows.map(e =>
          '<tr><td class="mono">'+fmtTime(e.ts)+'</td>'+
          '<td class="mono">'+(e.endpoint||"")+'</td>'+
          '<td class="mono">'+shortAddr(e.from)+'</td>'+
          '<td class="amt">'+(e.amount||"0")+'</td>'+
          '<td class="mono">'+shortHash(e.txHash)+'</td></tr>'
        ).join("")+
        '</tbody></table>';
    }

    document.getElementById("updated").textContent = "actualizado " + new Date().toLocaleTimeString();
  } catch (err) {
    document.getElementById("updated").textContent = "error al cargar";
  }
}

document.getElementById("refresh").addEventListener("click", load);
load();
setInterval(load, 10000);
</script>
</body>
</html>`;
}
