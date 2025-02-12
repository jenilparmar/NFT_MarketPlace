"use client";
import { useState, useEffect } from "react";
import { provider } from "../../../utils/connectchain";
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
      const nftData = await contract.getNFTs(); // Fetch NFTs from blockchain

      const owners = nftData[0]; // List of NFT owners
      const imageHashes = nftData[1]; // IPFS hashes of images

      // Fetch NFT details from database
      const dbResponse = await fetch("/api/GetNFTs");
      const allNFTs = await dbResponse.json();

      console.log("Blockchain Data:", { owners, imageHashes });
      console.log("Database Response:", allNFTs);

      // Map blockchain NFTs with database data
      const nftList = owners.map((owner, index) => {
        // Convert both owner addresses to lowercase for comparison
        const matchingDbEntry = allNFTs.find(
          (entry) => entry.userMetaMaskId.toLowerCase() === owner.toLowerCase()
        );

        let nftDetails = { name: "Unknown NFT", price: "N/A" };

        if (matchingDbEntry && matchingDbEntry.nfts.length > 0) {
          nftDetails = {
            name: matchingDbEntry.nfts[0].name || "Unknown NFT",
            price: matchingDbEntry.nfts[0].price || "N/A",
          };
        }

        return {
          owner,
          imageUrl: `https://gateway.pinata.cloud/ipfs/${imageHashes[index]}`,
          ...nftDetails,
        };
      });

      setNfts(nftList);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, []);

  return (
    <div
      className="min-h-screen p-6 w-full"
      style={{
        backgroundImage: "url(/bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
      <h1 className="text-3xl font-bold text-center text-red-500 mb-6">
        NFT Gallery
      </h1>
      {nfts.length === 0 ? (
        <p className="text-center text-red-600">No NFTs found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {nfts.map((nft, index) => (
            <div
              key={index}
              className="bg-transparent border-2 hover:scale-105 duration-150 transition-all border-red-500  shadow-lg rounded-xl p-4">
              <img
                src={nft.imageUrl}
                alt={nft.name}
                className="w-full h-48 bg-white object-cover rounded-lg"
              />
              <p className="mt-3 text-red-500">
                <span className="font-semibold">Name:</span> {nft.name}
              </p>
              <p className="text-red-500">
                <span className="font-semibold">Price:</span> {nft.price} ETH
              </p>
              <p className="text-red-500 truncate">
                <span className="font-semibold ">Owner:</span> {nft.owner}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
