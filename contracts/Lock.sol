// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract NFT {
    uint public NFTId;  // NFT counter

    struct NFTBlock {
        address ownerAddress;
        string imageHash;
    }

    mapping(uint => NFTBlock) public allNFTs;

    constructor() {
        NFTId = 0;
    }

    function addNFT(address _sender,string memory _imageHash) public {
        NFTId++;
        allNFTs[NFTId] = NFTBlock(_sender, _imageHash);
    }

    function getNFTs() public view returns (address[] memory, string[] memory) {
        require(NFTId > 0, "No NFTs available"); // Ensure there are NFTs

        address[] memory addresses = new address[](NFTId);
        string[] memory imageHashes = new string[](NFTId);

        for (uint i = 1; i <= NFTId; i++) {  // Start from 1 to match stored IDs
            addresses[i - 1] = allNFTs[i].ownerAddress;
            imageHashes[i - 1] = allNFTs[i].imageHash;
        }
        return (addresses, imageHashes);
    }
}
