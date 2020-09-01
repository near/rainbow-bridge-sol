pragma solidity ^0.5.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";


contract MyERC20 is ERC20, ERC20Detailed {
    constructor() ERC20Detailed("Rainbow", "RAIN", 0) public {
        _mint(msg.sender, 1000000000);
    }
}
