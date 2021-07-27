// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "./Reward.sol";
import "./Fee.sol";
import "./Swap.sol";

contract TestReward is Reward {			
	constructor(uint256 totalSupply) public Reward(totalSupply) {
		
	}
		
	function balanceOf(address account) public view returns (uint256)  {
        if (_balances[account].excludedFromReward) 
			return _balances[account].token;
		
        return _rewardToToken(_balances[account].reward);
    }
	
	function transfer(address sender, address recipient, uint256 amount, uint256 fee) public returns (bool) {
        _transfer(sender, recipient, amount, fee);
        return true;
    }
}

contract TestFee is Fee {			
	constructor() public {
		
	}
		
	function isBuy(address sender) public view returns(bool) {
        return _isBuy(sender);
    }
	
	function isSell(address recipient) public view returns(bool) {
        return _isSell(recipient);
    }
	
	function getBuyFee(uint256 amount, uint256 holders) public view returns(uint256, uint256, uint256) {
		return _getBuyFee(amount, holders);
    }
	
	function getRewardFee(uint256 holders) public pure returns(uint256) {
		return _getRewardFee(holders);
    }
	
	function getSellFee(uint256 amount, uint timestamp) public view returns(uint256, uint256, uint256) {
		return _getSellFee(amount, timestamp);
    }
	
	function getHoldFee(uint timestamp) public view returns(uint256) {
		return _getHoldFee(timestamp);
    }
}

contract TestSwap is Swap(true) {			
	constructor() public {
		
	}
	
	function swapTokensForBNB(address to, uint256 token) public {
		_swapTokensForBNB(to, token);
    }

    function buyBackAndBurnToken(uint256 bnb) public {
		_buyBackAndBurnToken(bnb);
    }
}