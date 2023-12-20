// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./PriceConsumer.sol";


contract Wallet is Ownable {
    uint public constant usdDecimals = 2;
    uint public constant nftDecimals = 18;
    
    uint public nftPrice;   // in ETH
    uint public ownerEthAmountToWithdraw;
    uint public ownerTokenAmountToWithdraw;

    address public oracleEthUsdPrice;
    address public oracleTokenEthPrice;

    PriceConsumerV3 public ethUsdContract;
    PriceConsumerV3 public tokenEthContract;

    mapping(address => uint256) public userEthDeposits;
    // user => token => amount
    mapping(address => mapping(address => uint256)) public userTokenDeposits;

    constructor(address clEthUsd, address clTokenUsd){
        oracleEthUsdPrice = clEthUsd;
        oracleTokenEthPrice = clTokenUsd;

        ethUsdContract = new PriceConsumerV3(oracleEthUsdPrice);
        tokenEthContract = new PriceConsumerV3(oracleTokenEthPrice);
    }

    
    /** Native coins (ETH, Matic, avax, ...) */
    receive() external payable {
        registerUserDeposit(msg.sender, msg.value);
    }

    function registerUserDeposit(address sender, uint256 value) internal {
        userEthDeposits[sender] += value;
    }

    function getNFTPrice() external view returns (uint256) {
        uint256 price;
        int iPrice;
        AggregatorV3Interface nftOraclePrice = AggregatorV3Interface(oracleTokenEthPrice);
        (, iPrice, , , ) = nftOraclePrice.latestRoundData();
        price = uint256(iPrice);
        return price;
    }

    function convertEthInUSD(address user) public view returns (uint) {
        uint ethPriceDecimals = ethUsdContract.getPriceDecimals();  // 8 decimali
        uint ethPrice = uint(ethUsdContract.getLatestPrice()); // scaled by 10^ethPriceDecimals(10^8)
        uint divDecs = 18 + ethPriceDecimals - usdDecimals;
        uint userUSDDeposit = userEthDeposits[user] * ethPrice / (10 ** divDecs);    // scaled by 10^26 / 10^24 = 10^2
        return userUSDDeposit;
    }

    function convertUSDinEth(uint usdAmount) public view returns (uint) {
        uint ethPriceDecimals = ethUsdContract.getPriceDecimals();
        uint ethPrice = uint(ethUsdContract.getLatestPrice());
        uint mulDecs = 18 + ethPriceDecimals - usdDecimals;
        uint convertAmountInEth = usdAmount * (10**mulDecs) / ethPrice;  // scaled by 10^26 / 10^8 = 10^18
        return convertAmountInEth;
    }

    function transferEthAmountOnBuy(uint nftNumber) public {
        uint calcTotalUSDAmount = nftPrice * nftNumber * (10 ** 2);   // in USD
        uint ethAmountForBuying = convertUSDinEth(calcTotalUSDAmount); // in ETH
        require(userEthDeposits[msg.sender] >= ethAmountForBuying, "not enough deposits by the user");
        ownerEthAmountToWithdraw += ethAmountForBuying;
        userEthDeposits[msg.sender] -= ethAmountForBuying;
    }

    /** Tokens */
    function userDeposit(address token, uint256 amount) external {
        // require(token != paymentToken, "Token not allowed");
        SafeERC20.safeTransferFrom(IERC20(token), msg.sender, address(this), amount);
        userTokenDeposits[msg.sender][token] += amount;
    }
    
    function convertNFTPriceInUSD() public view returns (uint) {
        uint tokenPriceDecimals = tokenEthContract.getPriceDecimals(); // 18
        uint tokenPrice = uint(tokenEthContract.getLatestPrice()); // scaled by 10^ethPriceDecimals (10^18)

        uint ethPriceDecimals = ethUsdContract.getPriceDecimals();
        uint ethPrice = uint(ethUsdContract.getLatestPrice());
        uint divDecs = tokenPriceDecimals + ethPriceDecimals - usdDecimals;

        uint tokeUSDPrice = tokenPrice * ethPrice / (10 ** divDecs); // 10^18 * 10^8 = 10^26 scaled by 10^26 / 10^24 = 10^2
        return tokeUSDPrice;
    }

    function convertUSDInNFTAmount(uint usdAmount) public view returns (uint, uint) {
        uint tokenPriceDecimals = tokenEthContract.getPriceDecimals(); // 18
        uint tokenPrice = uint(tokenEthContract.getLatestPrice());  // scaled by 10^ethPriceDecimals (10^18)
        
        uint ethPriceDecimals = ethUsdContract.getPriceDecimals();
        uint ethPrice = uint(ethUsdContract.getLatestPrice()); // scaled by 10^ethPriceDecimals (10^8)

        uint mulDecs = 18 - usdDecimals + ethPriceDecimals;
        uint convertAmountInETH = usdAmount * (10 ** mulDecs) / ethPrice;  // 10^26 / 10^8 = 10^18
        uint mulDecs2 = 18 - tokenPriceDecimals; 
        uint convertETHInTokens = convertAmountInETH /** * (10 ** 18) */ / tokenPrice * (10 ** mulDecs2);

        uint totalCosts = convertETHInTokens * tokenPrice * ethPrice / (10 ** mulDecs); // 10^0 * 10^18 * 10^8 / 10^24 = 10^2
        uint remainingUSD = usdAmount - totalCosts;

        return (convertETHInTokens, remainingUSD); 
    }

    function transferTokenAmountOnBuy(address token, uint nftNumber) public {
        uint calcTotalUSDAmount = nftPrice * nftNumber * (10 ** 2); // in USD
        uint tokenAmountForBuying;
        (tokenAmountForBuying,) = convertUSDInNFTAmount(calcTotalUSDAmount); // in ETH
        require(userTokenDeposits[msg.sender][token] >= tokenAmountForBuying, "not enough deposits by the user");
        ownerEthAmountToWithdraw += tokenAmountForBuying;
        userTokenDeposits[msg.sender][token] -= tokenAmountForBuying;
    }

    /** this balance in native coins and tokens */
    function getNativeCoinsBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getTokenBalance(address _token) external view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }

    /** Withdraws */
    function nativeCoinsWithdraw() external onlyOwner {
        require(ownerEthAmountToWithdraw > 0, "no eth to withdraw");
        uint256 tmpAmount = ownerEthAmountToWithdraw;
        ownerEthAmountToWithdraw = 0;
        (bool sent, ) = payable(_msgSender()).call{value: tmpAmount}("");
        require(sent, "!sent");
    }

    function userETHWithdraw() external {
        require(userEthDeposits[msg.sender] > 0, "no eth to withdraw");
        (bool sent, ) = payable(_msgSender()).call{value: userEthDeposits[msg.sender]}("");
        require(sent, "!sent");
        userEthDeposits[msg.sender] = 0;
    }

    function tokenWithdraw(address _token) external onlyOwner {
        require(ownerTokenAmountToWithdraw > 0, "no eth to withdraw");
        uint256 tmpAmount = ownerTokenAmountToWithdraw;
        ownerTokenAmountToWithdraw = 0;
        SafeERC20.safeTransfer(IERC20(_token), msg.sender, tmpAmount);    
    }

    function userTokenWithdraw(address _token) external {
        require(userTokenDeposits[msg.sender][_token] > 0, "no eth to withdraw");
        uint256 tmpAmount = userTokenDeposits[msg.sender][_token];
        userTokenDeposits[msg.sender][_token] = 0;
        SafeERC20.safeTransfer(IERC20(_token), msg.sender, tmpAmount);
    }
}