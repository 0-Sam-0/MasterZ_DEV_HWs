// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IBlacklist.sol";

contract Token is ERC20, Ownable {
    IBlacklist public bkltContract;
    constructor(string memory tokenName, string memory tokenSym, address bkltAddress)
    ERC20(tokenName, tokenSym){
        bkltContract = IBlacklist(bkltAddress);
    }

    function mint(address account, uint256 amount) external onlyOwner{
        _mint(account, amount);
    }

    function burn(uint256 amount) external{
        _burn(msg.sender, amount);
    }

    function insertInBklt(address badUser) external onlyOwner {
        bkltContract.addBlackList(badUser);
    }

    function removeFromBklt(address goodUser) external onlyOwner {
        bkltContract.removeBlackList(goodUser);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal view override {
        amount;
        if (bkltContract.getBlackListStatus(from) || bkltContract.getBlackListStatus(to)){
            revert("Blacklisted addresses");
        }
    }

}