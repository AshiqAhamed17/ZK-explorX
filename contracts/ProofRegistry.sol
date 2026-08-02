// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/// @notice Minimal interface for the Barretenberg-generated UltraHonk verifier
///         (`HonkVerifier` in Verifier.sol). Declared locally so this contract
///         only depends on the one function it calls, not the ~2,500-line
///         generated verifier.
interface IHonkVerifier {
    function verify(bytes calldata proof, bytes32[] calldata publicInputs)
        external
        view
        returns (bool);
}

/// @title  ProofRegistry
/// @notice A thin on-chain registry around the ZK range-proof verifier. It
///         turns "verify a proof" from a free `view` call into a real
///         state-changing transaction: the proof is verified, the submission is
///         recorded, and an event is emitted. This is the piece that makes the
///         Proof Lab's on-chain step a genuine transaction (requires a wallet,
///         costs gas) rather than a cosmetic read.
contract ProofRegistry {
    /// @notice The deployed UltraHonk verifier this registry checks against.
    IHonkVerifier public immutable verifier;

    /// @notice Count of proofs each address has successfully submitted.
    mapping(address prover => uint256 count) public proofCount;

    /// @notice Total proofs verified through this registry.
    uint256 public totalProofs;

    /// @notice Emitted when a submitted proof passes on-chain verification.
    /// @param prover    The account that submitted the proof.
    /// @param proofHash keccak256 of the proof bytes.
    /// @param timestamp Block timestamp of the submission.
    event ProofVerified(address indexed prover, bytes32 proofHash, uint256 timestamp);

    /// @notice Thrown when the submitted proof fails verification.
    error InvalidProof();

    /// @param _verifier Address of the deployed `HonkVerifier`.
    constructor(IHonkVerifier _verifier) {
        verifier = _verifier;
    }

    /// @notice Verify a ZK proof on-chain and record the successful submission.
    /// @dev Reverts with {InvalidProof} if verification fails, so a caller never
    ///      pays to record an invalid proof beyond the failed verification.
    /// @param proof        The UltraHonk proof bytes.
    /// @param publicInputs The circuit's public inputs, as field elements.
    /// @return proofHash   keccak256 of `proof`, for off-chain reference/lookup.
    function submitProof(bytes calldata proof, bytes32[] calldata publicInputs)
        external
        returns (bytes32 proofHash)
    {
        if (!verifier.verify(proof, publicInputs)) revert InvalidProof();

        proofHash = keccak256(proof);
        unchecked {
            ++proofCount[msg.sender];
            ++totalProofs;
        }
        emit ProofVerified(msg.sender, proofHash, block.timestamp);
    }
}
