pragma solidity ^0.4.8;

import "../node_modules/zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract EcfenCoin is StandardToken {
	string public name = "EcfenCoin";
	string public symbol = "ECB";
	uint8 public decimals = 8;
	uint256 public INITIAL_SUPPLY = 66000000;
	function EcfenCoin() public {
		totalSupply_ = INITIAL_SUPPLY;
		balances[msg.sender] = INITIAL_SUPPLY;
	}
}