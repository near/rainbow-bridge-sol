
// File: ../nearprover/contracts/INearProver.sol

pragma solidity ^0.5.0;

interface INearProver {
    function proveOutcome(bytes calldata proofData, uint64 blockHeight) external view returns(bool);
}

// File: contracts/NearProverRejectMock.sol

pragma solidity ^0.5.0;



contract NearProverRejectMock is INearProver {
    function proveOutcome(bytes memory proofData, uint64 blockHeight) public view returns(bool) {
        return false;
    }
}
