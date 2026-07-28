"use client";

import type { ProofData } from "@aztec/bb.js";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProveStage, RangeProofInput } from "@/lib/circuits/proof";
import type { WorkerRequest, WorkerResponse } from "@/workers/prove.worker.types";

/**
 * Spawns the proving Web Worker on demand and exposes a promise-based API,
 * so the ZK Proof Lab UI never touches raw `postMessage` plumbing directly.
 */
export function useProveWorker() {
  const workerRef = useRef<Worker | null>(null);
  const pending = useRef(new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>());
  const [stage, setStage] = useState<ProveStage | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL("../../workers/prove.worker.ts", import.meta.url));
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data;
      if (msg.type === "stage") {
        setStage(msg.stage);
        return;
      }
      const entry = pending.current.get(msg.id);
      if (!entry) return;
      pending.current.delete(msg.id);

      if (msg.type === "prove-result") entry.resolve(msg.proof);
      else if (msg.type === "verify-result") entry.resolve(msg.verified);
      else if (msg.type === "error") entry.reject(new Error(msg.message));
    };
    workerRef.current = worker;
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const send = useCallback(<T,>(request: WorkerRequest): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const worker = workerRef.current;
      if (!worker) {
        reject(new Error("Proving worker is not ready yet."));
        return;
      }
      pending.current.set(request.id, { resolve: resolve as (v: unknown) => void, reject });
      worker.postMessage(request);
    });
  }, []);

  const prove = useCallback(
    (input: RangeProofInput) => {
      setStage(null);
      return send<ProofData>({ type: "prove", id: crypto.randomUUID(), input });
    },
    [send],
  );

  const verify = useCallback(
    (proof: ProofData) => {
      setStage(null);
      return send<boolean>({ type: "verify", id: crypto.randomUUID(), proof });
    },
    [send],
  );

  return { prove, verify, stage };
}
