// Load generator for E4 (DV-10). Wraps autocannon's programmatic API so that EVERY request carries
// unique text: "[<id>]" in the body template is replaced per request. With identical payloads the
// semantic layer's embedding cache would answer from memory after the first request and its cost
// would disappear, which real traffic never allows. (autocannon's CLI --idReplacement hung here.)
//
// Usage: node perf/load.mjs <url> <METHOD> <bodyTemplate> <connections> <seconds>
// Prints two JSON lines: a 10-second warmup, then the measured run.
import autocannon from "autocannon";

const [, , url, method, template, conc, secs] = process.argv;
let n = 0;
const run = (duration) =>
  new Promise((resolve, reject) => {
    autocannon(
      {
        // Per-request timeout 120 s, not autocannon's default 10 s (DV-13): Ollama serves one request
        // at a time, so at concurrency 8 an LLM layer queues requests for tens of seconds. That wait
        // is the result to measure, not a failure to discard.
        url, method, connections: Number(conc), duration: Number(duration), timeout: 120,
        headers: { "content-type": "application/json" },
        requests: [{
          method,
          setupRequest: (req) => {
            req.body = template.replace("[<id>]", `u${process.pid}x${n++}`);
            return req;
          },
        }],
      },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
  });

const warm = await run(10);
const main = await run(secs);
process.stdout.write(JSON.stringify(warm) + "\n" + JSON.stringify(main) + "\n");
