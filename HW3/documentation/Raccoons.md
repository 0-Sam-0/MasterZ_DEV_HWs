# Solidity API

## Raccoons


### RACCOON1

```solidity
uint256 RACCOON1
```


### RACCOON2

```solidity
uint256 RACCOON2
```


### RACCOON3

```solidity
uint256 RACCOON3
```


### RACCOON4

```solidity
uint256 RACCOON4
```


### RACCOON5

```solidity
uint256 RACCOON5
```


### RACCOON6

```solidity
uint256 RACCOON6
```


### FOOD

```solidity
uint256 FOOD
```


### GLASSES

```solidity
uint256 GLASSES
```


### _uris

```solidity
mapping(uint256 => string) _uris
```


### constructor

```solidity
constructor() public
```

contract constructor with ipfs link to metadata


### mint

```solidity
function mint(address to, uint256 id, uint256 amount, bytes data) external
```

_mint a new token with id, amount, data_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | recipient address |
| id | uint256 | token-id |
| amount | uint256 | token_amount |
| data | bytes | token_data |


### mintBatch

```solidity
function mintBatch(address to, uint256[] ids, uint256[] amounts, bytes data) external
```


### setTokenUri

```solidity
function setTokenUri(uint256 tokenId, string tokenUri) external
```


### getTokenUri

```solidity
function getTokenUri(uint256 tokenId) external view returns (string)
```



