import { loadDotEnv } from "../src/load-env.js";
import {
  buildPaymentStatus,
  checkRpcReachable,
  loadPaymentConfig,
  validatePaymentConfig,
} from "../src/http/payments.js";

loadDotEnv();

async function main(): Promise<void> {
  const cfg = loadPaymentConfig();
  const status = buildPaymentStatus(cfg);
  const { warnings, missing } = validatePaymentConfig(cfg);

  console.log("\n=== Avala · Payment configuration check ===\n");
  console.log(`Mode:        ${status.mode.toUpperCase()}`);
  console.log(`Enabled:     ${status.enabled}`);
  console.log(`Ready:       ${status.ready}`);
  console.log(`Scheme:      ${status.scheme}`);
  console.log(`Price/call:  ${status.pricePerCall} (${status.priceAtomic} atomic)`);
  console.log(`Network:     ${status.network}`);
  console.log(`Asset:       ${status.asset}`);

  if (cfg.payTo) console.log(`Pay to:      ${cfg.payTo}`);
  console.log(`RPC:         ${cfg.rpcUrl}`);

  if (missing.length > 0) {
    console.log(`\nMissing env vars: ${missing.join(", ")}`);
    console.log("Copy .env.example → .env and set PAY_TO.");
  }

  if (warnings.length > 0) {
    console.log(`\nWarnings:`);
    for (const w of warnings) console.log(`  - ${w}`);
  }

  if (cfg.enabled) {
    process.stdout.write("\nTempo RPC reachability… ");
    const ok = await checkRpcReachable(cfg.rpcUrl);
    console.log(ok ? "OK" : "FAILED (check TEMPO_RPC_URL or network)");
    if (!ok) process.exitCode = 1;
  }

  if (!status.enabled) {
    console.log("\nPayments are in FREE/DEV mode. Set PAY_TO to enable.");
    process.exit(0);
  }

  if (!status.ready) {
    console.log("\nPayments enabled but config is not ready. Fix warnings above.");
    process.exit(1);
  }

  console.log("\nPayment config looks good. Restart the server to apply.");
  console.log("Test: POST /v1/validate-tax-id without X-Payment should return HTTP 402.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
