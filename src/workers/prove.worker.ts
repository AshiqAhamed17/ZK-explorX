import { generateRangeProof, verifyRangeProof } from "@/lib/circuits/proof";
import type { WorkerRequest, WorkerResponse } from "./prove.worker.types";

/**
 * Runs ZK proof generation/verification off the main thread. The UI never
 * blocks while the WASM prover works, even though the underlying APIs have
 * no built-in progress callback — this worker relays the coarse stage
 * markers `proof.ts` reports instead.
 */

function post(message: WorkerResponse) {
  self.postMessage(message);
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const msg = event.data;

  try {
    if (msg.type === "prove") {
      const proof = await generateRangeProof(msg.input, (stage) =>
        post({ type: "stage", id: msg.id, stage }),
      );
      post({ type: "prove-result", id: msg.id, proof });
      return;
    }

    if (msg.type === "verify") {
      const verified = await verifyRangeProof(msg.proof, (stage) =>
        post({ type: "stage", id: msg.id, stage }),
      );
      post({ type: "verify-result", id: msg.id, verified });
      return;
    }
  } catch (err) {
    post({
      type: "error",
      id: msg.id,
      message: err instanceof Error ? err.message : String(err),
    });
  }
};
