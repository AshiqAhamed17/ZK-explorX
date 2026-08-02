// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IHonkVerifier} from "../../ProofRegistry.sol";

/// @notice Test double for the UltraHonk verifier: returns a settable result so
///         `ProofRegistry`'s own logic (revert-on-false, record-on-true) can be
///         unit-tested without generating a real proof. End-to-end verification
///         against the real `HonkVerifier` is exercised via the deployed
///         contract in the app / deploy flow.
contract MockHonkVerifier is IHonkVerifier {
    bool public result;

    function setResult(bool _result) external {
        result = _result;
    }

    function verify(bytes calldata, bytes32[] calldata) external view returns (bool) {
        return result;
    }
}
