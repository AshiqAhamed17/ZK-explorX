/**
 * Deploy the ZK Proof Lab contracts to Ethereum Sepolia.
 *
 *   1. Libraries      (RelationsLib, ZKTranscriptLib) — the generated verifier
 *                      externalizes these to stay under the 24KB contract-size
 *                      limit, so they must be deployed and linked first.
 *   2. HonkVerifier   (generated UltraHonk verifier, linked against the libs)
 *   3. ProofRegistry  (wraps the verifier; constructor takes its address)
 *
 * Reads the deployer key from `.env.local` (gitignored) — a throwaway wallet
 * holding only Sepolia faucet ETH. The private key is NEVER logged; only the
 * derived address is printed.
 *
 * Run:  npm run deploy:sepolia
 *
 * Env (.env.local):
 *   PRIVATE_KEY       required — throwaway deployer key (0x-prefixed or not)
 *   PUBLIC_KEY        optional — cross-checked against the derived address
 *   SEPOLIA_RPC_URL   optional — defaults to a public Sepolia RPC
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  createPublicClient,
  createWalletClient,
  formatEther,
  http,
  isAddress,
  type Abi,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

process.loadEnvFile(resolve(process.cwd(), ".env.local"));

const RPC_URL = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const VERIFIER_ARTIFACT = "contracts/out/Verifier.sol/HonkVerifier.json";
const REGISTRY_ARTIFACT = "contracts/out/ProofRegistry.sol/ProofRegistry.json";

type Hex = `0x${string}`;

interface LinkRef {
  start: number;
  length: number;
}
type LinkReferences = Record<string, Record<string, LinkRef[]>>;

function normalizePrivateKey(raw: string | undefined): Hex {
  if (!raw) throw new Error("PRIVATE_KEY is missing in .env.local");
  const hex = raw.trim().startsWith("0x") ? raw.trim() : `0x${raw.trim()}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(hex)) throw new Error("PRIVATE_KEY must be a 32-byte hex string");
  return hex as Hex;
}

function readArtifact(relPath: string) {
  return JSON.parse(readFileSync(resolve(process.cwd(), relPath), "utf8"));
}

/** Splice deployed library addresses into a bytecode's link placeholders. */
function linkBytecode(bytecode: string, linkRefs: LinkReferences, addresses: Record<string, Hex>): Hex {
  let body = bytecode.startsWith("0x") ? bytecode.slice(2) : bytecode;
  for (const file of Object.keys(linkRefs)) {
    for (const lib of Object.keys(linkRefs[file])) {
      const addr = addresses[lib];
      if (!addr) throw new Error(`No deployed address for library ${lib}`);
      const clean = addr.toLowerCase().replace(/^0x/, "").padStart(40, "0");
      for (const { start, length } of linkRefs[file][lib]) {
        if (length !== 20) throw new Error(`Unexpected link length ${length} for ${lib}`);
        const pos = start * 2; // byte offset → hex char offset
        body = body.slice(0, pos) + clean + body.slice(pos + 40);
      }
    }
  }
  if (body.includes("__$")) throw new Error("Unlinked library placeholder remains after linking");
  return `0x${body}`;
}

async function main() {
  const account = privateKeyToAccount(normalizePrivateKey(process.env.PRIVATE_KEY));
  const wallet = createWalletClient({ account, chain: sepolia, transport: http(RPC_URL) });
  const publicClient = createPublicClient({ chain: sepolia, transport: http(RPC_URL) });

  console.log("Network : Sepolia (chainId", sepolia.id + ")");
  console.log("RPC     :", RPC_URL);
  console.log("Deployer:", account.address);

  const expected = process.env.PUBLIC_KEY?.trim();
  if (expected && isAddress(expected) && expected.toLowerCase() !== account.address.toLowerCase()) {
    throw new Error(`PRIVATE_KEY derives ${account.address}, but PUBLIC_KEY is ${expected}`);
  }

  const balance = await publicClient.getBalance({ address: account.address });
  console.log("Balance :", formatEther(balance), "ETH");
  if (balance === BigInt(0)) throw new Error("Deployer has 0 Sepolia ETH — fund it from a faucet first");

  const verifierArtifact = readArtifact(VERIFIER_ARTIFACT);
  const registryArtifact = readArtifact(REGISTRY_ARTIFACT);
  const linkRefs = (verifierArtifact.bytecode.linkReferences ?? {}) as LinkReferences;

  async function deploy(abi: Abi, bytecode: Hex, args: unknown[] = []) {
    const hash = await wallet.deployContract({ abi, bytecode, args } as never);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (!receipt.contractAddress) throw new Error("deployment produced no contract address");
    return { address: receipt.contractAddress as Hex, gas: receipt.gasUsed, block: Number(receipt.blockNumber), hash };
  }

  // 1. Deploy each library the verifier links against.
  const libAddresses: Record<string, Hex> = {};
  const libNames = new Set<string>();
  for (const file of Object.keys(linkRefs)) for (const n of Object.keys(linkRefs[file])) libNames.add(n);
  for (const name of libNames) {
    const art = readArtifact(`contracts/out/Verifier.sol/${name}.json`);
    console.log(`\nDeploying library ${name}…`);
    const d = await deploy(art.abi, art.bytecode.object as Hex);
    libAddresses[name] = d.address;
    console.log("  address:", d.address, `(gas ${d.gas})`);
  }

  // 2. Link + deploy the verifier.
  console.log("\nDeploying HonkVerifier…");
  const linked = linkBytecode(verifierArtifact.bytecode.object, linkRefs, libAddresses);
  const verifier = await deploy(verifierArtifact.abi, linked);
  console.log("  address:", verifier.address, `(gas ${verifier.gas})`);

  // 3. Deploy the registry, wired to the verifier.
  console.log("\nDeploying ProofRegistry…");
  const registry = await deploy(registryArtifact.abi, registryArtifact.bytecode.object as Hex, [verifier.address]);
  console.log("  address:", registry.address, `(gas ${registry.gas})`);

  // 4. Sanity: the registry must point at the verifier we deployed.
  const wired = (await publicClient.readContract({
    address: registry.address,
    abi: registryArtifact.abi,
    functionName: "verifier",
  })) as string;
  const ok = wired.toLowerCase() === verifier.address.toLowerCase();
  console.log("\nregistry.verifier() =", wired, ok ? "✓ matches" : "✗ MISMATCH");
  if (!ok) throw new Error("ProofRegistry is not wired to the deployed verifier");

  const summary = {
    chain: "sepolia",
    chainId: sepolia.id,
    deployer: account.address,
    proofRegistry: registry.address,
    honkVerifier: verifier.address,
    libraries: libAddresses,
    registryTx: registry.hash,
    verifierTx: verifier.hash,
    deployedAtBlock: registry.block,
  };
  console.log("\n=== DEPLOYED ===");
  console.log(JSON.stringify(summary, null, 2));
  console.log("\nEtherscan:");
  console.log("  ProofRegistry:", `https://sepolia.etherscan.io/address/${registry.address}`);
  console.log("  HonkVerifier :", `https://sepolia.etherscan.io/address/${verifier.address}`);
}

main().catch((err) => {
  console.error("\nDeploy failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
