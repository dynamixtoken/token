// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "./Uniswap.sol";
import "./Ownable.sol";
import "./SafeMath.sol";
import "./Address.sol";

contract Swap is Ownable {	
	using SafeMath for uint256;
	using Address for address;
	
	address public deadAddress = 0x000000000000000000000000000000000000dEaD;
	address payable public marketingAddress = payable(0x2833E4bF308462dC14233F771534924c339b78F0); 
	address payable public devAddress = payable(0x58009C6726C85F97704A5F8e0FD8fe9Ea0B29280); 

    IUniswapV2Router02 public immutable uniswapV2Router;
    address public immutable uniswapV2Pair;
	
	bool public autoSellEnabled = false;
    bool public autoBuyBackEnabled = false;
	
	uint256 public minimumTokensBeforeSell = 0;
	uint256 public minimumBNBBeforeBuyBack = 0;
	
	event autoSellChanged(
        bool enabled,
		uint256 minimumTokensBeforeSell
    );
	
	event autoBuyBackChanged(
        bool enabled,
		uint256 minimumBNBBeforeBuyBack
    );
	
	event TeamAddressChanged(
        address addr,
        string addrType
    );

	event BuyBackAndBurned(
        uint256 bnb,
        address[] path
    );
    
    event SwapTokensForBNB(
        uint256 amountIn,
        address to,
        address[] path
    );
		
	constructor(bool testnet) internal {
		IUniswapV2Router02 _uniswapV2Router;
		if(testnet)
			_uniswapV2Router = IUniswapV2Router02(0xD99D1c33F9fC3444f8101754aBC46c52416550D1);
		else
			_uniswapV2Router = IUniswapV2Router02(0x10ED43C718714eb63d5aA57B78B54704E256024E);

		uniswapV2Pair = IUniswapV2Factory(_uniswapV2Router.factory()).createPair(address(this), _uniswapV2Router.WETH());
		uniswapV2Router = _uniswapV2Router;
	}
	
	// Enable Auto Sell
	function enableAutoSell(uint256 tokensBeforeSell) external onlyOwner()  {
		autoSellEnabled = true;
		minimumTokensBeforeSell = tokensBeforeSell;
		
		emit autoSellChanged(autoSellEnabled, minimumTokensBeforeSell);
    }
	
	// Disable Auto Sell
	function disableAutoSell() external onlyOwner()  {
		autoSellEnabled = false;
		emit autoSellChanged(autoSellEnabled, minimumTokensBeforeSell);
    }
	
	// Enable Auto BuyBack and Burn
	function enableAutoBuy(uint256 bnbBeforeBuyBack) external onlyOwner()  {
		autoBuyBackEnabled = true;
		minimumBNBBeforeBuyBack = bnbBeforeBuyBack;
		
		emit autoBuyBackChanged(autoBuyBackEnabled, minimumBNBBeforeBuyBack);
    }
	
	// Disable Auto BuyBack and Burn
	function disableAutoBuy() external onlyOwner()  {
		autoBuyBackEnabled = false;
		emit autoBuyBackChanged(autoBuyBackEnabled, minimumBNBBeforeBuyBack);
    }
	
	// Swap Token to receive BNB
	function _swapTokensForBNB(address to, uint256 token) internal {
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = uniswapV2Router.WETH();

        uniswapV2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(
			token
			, 0
			, path
			, address(this)
			, block.timestamp
		);
        
        emit SwapTokensForBNB(token, to, path);
    }

	// Buy Back Token and burn them 
    function _buyBackAndBurnToken(uint256 bnb) internal {
        address[] memory path = new address[](2);
        path[0] = uniswapV2Router.WETH();
        path[1] = address(this);

        uniswapV2Router.swapExactETHForTokensSupportingFeeOnTransferTokens{value: bnb}(
			0
			, path
			, deadAddress // Tokens are burned
			, block.timestamp.add(300)
		);
        
        emit BuyBackAndBurned(bnb, path);
    }
	
	// Set Marketing Address
	function setMarketingAddress(address addr) external onlyOwner() {
        marketingAddress = payable(addr);
		TeamAddressChanged(addr, "Marketing Payable Address");
    }
	
	// Set Dev Address
	function setDevAddress(address addr) external onlyOwner() {
        devAddress = payable(addr);
		TeamAddressChanged(addr, "Dev Payable Address");
    }
}