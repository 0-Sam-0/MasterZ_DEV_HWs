// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Raccoons is ERC1155Supply, Ownable {
    
    uint256 public constant RACCOON1 = 1;
    uint256 public constant RACCOON2 = 2;
    uint256 public constant RACCOON3 = 3;
    uint256 public constant RACCOON4 = 4;
    uint256 public constant RACCOON5 = 5;
    uint256 public constant RACCOON6 = 6;
    uint256 public constant FOOD = 7;
    uint256 public constant GLASSES = 8;

    // tokenId => tokenUri
    mapping (uint256 => string) public _uris;

    /**
     * @notice contract constructor with ipfs link to metadata
     */
    constructor() ERC1155("ipfs://QmeWA1kKqux979q7cYDGrWM1a3BS5NRiXZvHW6TNH7yHPy/{id}.json") {}

    /**
     * @dev mint a new token with id, amount, data
     * @param to recipient address
     * @param id token-id
     * @param amount token_amount
     * @param data token_data
     */
    function mint(address to, uint256 id, uint256 amount, bytes memory data) external onlyOwner {
        _mint(to, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) external onlyOwner{
        _mintBatch(to, ids, amounts, data);
    }

    function setTokenUri(uint256 tokenId, string calldata tokenUri) external onlyOwner {
        _uris[tokenId] = tokenUri;
    }

    function getTokenUri(uint256 tokenId) external view returns(string memory) {
        return _uris[tokenId];
    }

    // contract deployed on mumbai testnet
    //  https://mumbai.polygonscan.com/address/0xf747F6F1FeF1a590407EDF789085c90b71ddabd8

    // testnet opensea collection
    // https://testnets.opensea.io/collection/unidentified-contract-22e0e108-bd4b-47b9-ba2a-d025
}
