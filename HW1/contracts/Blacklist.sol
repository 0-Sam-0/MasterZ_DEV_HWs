// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IBlacklist.sol";

contract Blacklist is Ownable, IBlacklist{

    mapping (address => bool) public isBlackListed;
    mapping (address => bool) public allowedTokens;

    event DestroyedBlackFunds(address _blackListedUser, uint _balance);

    event AddedBlackList(address _user);

    event RemovedBlackList(address _user);

    function allowToken(address token) external onlyOwner {
        if (token == address(0)){
            revert("Cannot allow the 0 address");
        }

        allowedTokens[token] = true;
    }

    function getBlackListStatus(address _maker) external view returns (bool) {
        return isBlackListed[_maker];
    }
    
    function addBlackList (address _evilUser) external {
        if (!allowedTokens[msg.sender]){
            revert("Address not allowed!");
        }
        isBlackListed[_evilUser] = true;
        emit AddedBlackList(_evilUser);
    }

    function removeBlackList (address _clearedUser) external{
        if (!allowedTokens[msg.sender]){
            revert("Address not allowed!");
        }
        isBlackListed[_clearedUser] = false;
        emit RemovedBlackList(_clearedUser);
    }
}
