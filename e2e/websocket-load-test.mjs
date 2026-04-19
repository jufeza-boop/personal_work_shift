/* eslint-disable no-console */
/**
 * WebSocket Load Test for Supabase Realtime Connections
 *
 * Simulates multiple concurrent WebSocket connections subscribing to
 * realtime event changes. This validates the server can handle the
 * expected number of simultaneous family members connected to the
 * calendar realtime feed.
 *
 * Usage:
 *   SUPABASE_URL=<url> SUPABASE_ANON_KEY=<key> node e2e/websocket-load-test.mjs
 *
 * Environment variables:
 *   SUPABASE_URL        - The Supabase project URL
 *   SUPABASE_ANON_KEY   - The Supabase anon/public key
 *   WS_CONCURRENT       - Number of concurrent connections (default: 50)
 *   WS_DURATION_MS       - How long to keep connections alive in ms (default: 30000)
 */

const SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "test-anon-key";
const CONCURRENT = Number(process.env.WS_CONCURRENT) || 50;
const DURATION_MS = Number(process.env.WS_DURATION_MS) || 30_000;

// Derive the WebSocket URL from the Supabase URL
function getWsUrl(supabaseUrl) {
  const url = new URL(supabaseUrl);
  const protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${url.host}/realtime/v1/websocket?apikey=${SUPABASE_ANON_KEY}&vsn=1.0.0`;
}

const wsUrl = getWsUrl(SUPABASE_URL);

const stats = {
  attempted: 0,
  connected: 0,
  failed: 0,
  messagesReceived: 0,
  errors: [],
};

async function createConnection(id) {
  stats.attempted++;

  return new Promise((resolve) => {
    let resolved = false;

    // Dynamic import for environments that have WebSocket (Node 22+)
    // or use ws package as fallback
    let WS;
    try {
      WS = globalThis.WebSocket;
    } catch {
      // Will fail gracefully
    }

    if (!WS) {
      stats.failed++;
      stats.errors.push(`Connection ${id}: WebSocket not available`);
      resolve({ id, status: "no-websocket" });
      return;
    }

    try {
      const ws = new WS(wsUrl);
      let messageCount = 0;

      ws.onopen = () => {
        stats.connected++;

        // Send a Phoenix-style join message for the realtime channel
        const joinMsg = JSON.stringify({
          topic: `realtime:public:events`,
          event: "phx_join",
          payload: {},
          ref: String(id),
        });
        ws.send(joinMsg);
      };

      ws.onmessage = () => {
        messageCount++;
        stats.messagesReceived++;
      };

      ws.onerror = (error) => {
        if (!resolved) {
          stats.failed++;
          stats.errors.push(
            `Connection ${id}: ${error.message || "WebSocket error"}`,
          );
        }
      };

      ws.onclose = () => {
        if (!resolved) {
          resolved = true;
          resolve({ id, status: "closed", messages: messageCount });
        }
      };

      // Close the connection after the test duration
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          try {
            ws.close();
          } catch {
            // ignore
          }
          resolve({ id, status: "completed", messages: messageCount });
        }
      }, DURATION_MS);
    } catch (error) {
      stats.failed++;
      stats.errors.push(`Connection ${id}: ${error.message}`);
      resolve({ id, status: "error" });
    }
  });
}

async function runLoadTest() {
  console.log("=== WebSocket Load Test ===");
  console.log(`Target:       ${wsUrl}`);
  console.log(`Concurrent:   ${CONCURRENT}`);
  console.log(`Duration:     ${DURATION_MS}ms`);
  console.log("");

  const startTime = Date.now();

  // Create all connections concurrently
  const promises = Array.from({ length: CONCURRENT }, (_, i) =>
    createConnection(i + 1),
  );

  const results = await Promise.all(promises);
  const elapsed = Date.now() - startTime;

  // Report results
  console.log("=== Results ===");
  console.log(`Duration:           ${elapsed}ms`);
  console.log(`Attempted:          ${stats.attempted}`);
  console.log(`Connected:          ${stats.connected}`);
  console.log(`Failed:             ${stats.failed}`);
  console.log(`Messages received:  ${stats.messagesReceived}`);
  console.log(
    `Success rate:       ${((stats.connected / stats.attempted) * 100).toFixed(1)}%`,
  );

  if (stats.errors.length > 0) {
    console.log(`\nFirst 5 errors:`);
    stats.errors.slice(0, 5).forEach((err) => console.log(`  - ${err}`));
  }

  const completed = results.filter((r) => r.status === "completed").length;
  console.log(`\nCompleted normally: ${completed}/${CONCURRENT}`);

  // Exit with error if success rate is below 80%
  const successRate = stats.connected / stats.attempted;
  if (successRate < 0.8) {
    console.error(
      `\n❌ FAIL: Success rate ${(successRate * 100).toFixed(1)}% is below 80% threshold`,
    );
    process.exit(1);
  } else {
    console.log(
      `\n✅ PASS: Success rate ${(successRate * 100).toFixed(1)}% meets 80% threshold`,
    );
  }
}

runLoadTest().catch((error) => {
  console.error("Load test failed:", error);
  process.exit(1);
});
