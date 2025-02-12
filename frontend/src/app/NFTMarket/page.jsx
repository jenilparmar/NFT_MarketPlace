"use client";
import { useState, useEffect } from "react";
import { provider } from "../../../utils/connectchain";
import { Contract } from "ethers";
import ABI from "../../../../artifacts/contracts/Lock.sol/NFT.json";

export default function NFTList() {
  const [nfts, setNfts] = useState([]);
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const [metaMaskID, setMetaMaskID] = useState("");

  const getContract = async () => {
    const signer = await provider.getSigner();
    const metaId = await signer.getAddress();
    setMetaMaskID(metaId.toLowerCase()); // Convert to lowercase
    return new Contract(contractAddress, ABI.abi, signer);
  };

  const fetchNFTs = async () => {
    try {
      const contract = await getContract();
      const nftData = await contract.getNFTs(); // Ensure this function exists in your Solidity contract

      const owners = nftData[0].map((addr) => addr.toLowerCase()); // Convert owners to lowercase
      const imageHashes = nftData[1];

      // Fetch NFT details from database
      const dbResponse = await fetch("/api/GetNFTs");
      const allNFTs = await dbResponse.json();

      console.log("Blockchain Data:", { owners, imageHashes });
      console.log("Database Response:", allNFTs);

      // Map blockchain NFTs with database data
      const nftList = owners.map((owner, index) => {
        const matchingDbEntry = allNFTs.find(
          (entry) => entry.userMetaMaskId.toLowerCase() === owner
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
          imgHash: imageHashes[index],
        };
      });

      setNfts(nftList);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  };

  const handlePurchase = async (imgHash) => {
    try {
      const contract = await getContract();
      const transaction = await contract.changeOwnerShip(metaMaskID, imgHash);
          
      await transaction.wait(); // Wait for transaction to be mined


      alert("Ownership successfully changed!");
      fetchNFTs(); // Refresh NFT list after purchase
    } catch (error) {
      console.error("Purchase error:", error.message);
      alert("Transaction failed!");
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, [metaMaskID]); // Runs when MetaMask ID changes

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
              className="bg-transparent border-2 hover:scale-105 duration-150 transition-all border-red-500 shadow-lg rounded-xl p-4">
              <img
                src={nft.imageUrl}
                alt={nft.name}
                className="w-full h-48  object-contain rounded-lg"
              />
              <p className="mt-3 text-red-500">
                <span className="font-semibold">Name:</span> {nft.name}
              </p>
              <p className="text-red-500">
                <span className="font-semibold">Price:</span> {nft.price} ETH
              </p>
              <p className="text-red-500 truncate">
                <span className="font-semibold">Owner:</span> {nft.owner}
              </p>
              <button
                className="w-fit h-fit m-2 rounded-2xl active:scale-95 p-3 bg-red-500"
                onClick={() => {
                  if (metaMaskID !== nft.owner) {
                    handlePurchase(nft.imgHash);
                  } else {
                    alert("You are already the Owner!");
                  }
                }}>
                Purchase
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
