"use client";
import { useState, useEffect } from "react";
import { provider, connectWallet } from "../../../utils/connectchain";
import { Contract } from "ethers";
import ABI from "../../../../artifacts/contracts/Lock.sol/NFT.json";

export default function NFTList() {
  const [nfts, setNfts] = useState([]);
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const getContract = async () => {
    const signer = await provider.getSigner();
    return new Contract(contractAddress, ABI.abi, signer);
  };

  const fetchNFTs = async () => {
    try {
      const contract = await getContract();
      const nftData = await contract.getNFTs(); // Assuming getNFT() returns two arrays

      const owners = nftData[0];
      const imageHashes = nftData[1];

      const nftList = owners.map((owner, index) => ({
        owner,
        imageUrl: `https://gateway.pinata.cloud/ipfs/${imageHashes[index]}`,
      }));

      setNfts(nftList);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        NFT Gallery
      </h1>
      {nfts.length === 0 ? (
        <p className="text-center text-gray-600">No NFTs found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {nfts.map((nft, index) => (
            <div key={index} className="bg-white shadow-lg rounded-xl p-4">
              <img
                src={nft.imageUrl}
                alt={`NFT ${index}`}
                className="w-full h-48 object-cover rounded-lg"
              />
              <p className="mt-3 text-gray-700">
                <span className="font-semibold">Owner:</span> {nft.owner}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
