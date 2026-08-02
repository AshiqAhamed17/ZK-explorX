// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {ProofRegistry} from "../ProofRegistry.sol";
import {MockHonkVerifier} from "./mocks/MockHonkVerifier.sol";

contract ProofRegistryTest is Test {
    ProofRegistry internal registry;
    MockHonkVerifier internal verifier;

    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    // Mirrors ProofRegistry.ProofVerified for vm.expectEmit.
    event ProofVerified(address indexed prover, bytes32 proofHash, uint256 timestamp);

    function setUp() public {
        verifier = new MockHonkVerifier();
        registry = new ProofRegistry(verifier);
    }

    function _publicInputs() internal pure returns (bytes32[] memory pub) {
        pub = new bytes32[](2);
        pub[0] = bytes32(uint256(18)); // min
        pub[1] = bytes32(uint256(120)); // max
    }

    function test_constructor_setsVerifier() public view {
        assertEq(address(registry.verifier()), address(verifier));
    }

    function test_submitProof_validProof_recordsAndEmits() public {
        verifier.setResult(true);
        bytes memory proof = hex"deadbeef";
        bytes32[] memory pub = _publicInputs();

        vm.expectEmit(true, false, false, true, address(registry));
        emit ProofVerified(alice, keccak256(proof), block.timestamp);

        vm.prank(alice);
        bytes32 returnedHash = registry.submitProof(proof, pub);

        assertEq(returnedHash, keccak256(proof));
        assertEq(registry.proofCount(alice), 1);
        assertEq(registry.totalProofs(), 1);
    }

    function test_submitProof_invalidProof_reverts() public {
        verifier.setResult(false);
        bytes memory proof = hex"1234";
        bytes32[] memory pub = _publicInputs();

        vm.prank(alice);
        vm.expectRevert(ProofRegistry.InvalidProof.selector);
        registry.submitProof(proof, pub);

        assertEq(registry.totalProofs(), 0);
        assertEq(registry.proofCount(alice), 0);
    }

    function test_submitProof_tracksPerAccountAndTotal() public {
        verifier.setResult(true);
        bytes memory proof = hex"aa";
        bytes32[] memory pub = _publicInputs();

        vm.prank(alice);
        registry.submitProof(proof, pub);
        vm.prank(alice);
        registry.submitProof(proof, pub);
        vm.prank(bob);
        registry.submitProof(proof, pub);

        assertEq(registry.proofCount(alice), 2);
        assertEq(registry.proofCount(bob), 1);
        assertEq(registry.totalProofs(), 3);
    }
}
