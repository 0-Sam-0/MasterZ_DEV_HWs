// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IBlacklist {
    function getBlackListStatus(address _maker) external view returns (bool);
    function addBlackList (address _evilUser) external;
    function removeBlackList (address _clearedUser) external;
}