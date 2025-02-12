"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import ABI from "../../../../artifacts/contracts/Lock.sol/NFT.json";
import { provider } from "../../../utils/connectchain";
import { Contract } from "ethers";

export default function NFTUploader() {
  const [metaMaskID, setMetaMaskID] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [prompt, setPrompt] = useState("");
  const [imageBase64, setImageBase64] = useState(null);
  const [ipfsHash, setIpfsHash] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  useEffect(() => {
    const fetchMetaMaskID = async () => {
      try {
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        setMetaMaskID(userAddress);
      } catch (error) {
        console.error("MetaMask Connection Error:", error);
      }
    };
    fetchMetaMaskID();
  }, []);

  const getContract = async () => {
    const signer = await provider.getSigner();
    return new Contract(contractAddress, ABI.abi, signer);
  };

  const sendToBlockChain = async (userMetaMaskId, imgHash) => {
    try {
      const contract = await getContract();
      const addNFTContract = await contract.addNFT(imgHash);
      await addNFTContract.wait();
      return true;
    } catch (e) {
      console.error("Error in BlockChain --->", e.message);
      return false;
    }
  };

  const generateImage = async () => {
    if (!prompt) {
      alert("Please enter a prompt!");
      return;
    }

    try {
      const response = await fetch("/api/GenerateImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.base64Image) {
        setImageBase64(`data:image/png;base64,${data.base64Image}`);
      } else {
        alert("Failed to generate image.");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Error generating image!");
    }
  };

  const uploadToIPFS = async () => {
    if (!imageBase64 || !name || !price) {
      alert("Please fill in all fields and generate an image!");
      return;
    }

    try {
      // Convert Base64 to Blob
      const byteCharacters = atob(imageBase64.split(",")[1]);
      const byteArrays = [];
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }
      const byteArray = new Uint8Array(byteArrays);
      const blob = new Blob([byteArray], { type: "image/png" });

      const formData = new FormData();
      formData.append("file", blob, "nft.png");

      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
            pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      setIpfsHash(ipfsHash);
      console.log(`Uploaded to IPFS: https://gateway.pinata.cloud/ipfs/${ipfsHash}`);

      const resFromBlockChain = await sendToBlockChain(metaMaskID, ipfsHash);
      if (!resFromBlockChain) {
        alert("Failed to add NFT on blockchain!");
        return;
      }

      alert("NFT successfully uploaded to IPFS & Blockchain!");
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Upload failed. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 w-full"
      style={{ backgroundImage: "url(/bg.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="bg-transparent shadow-lg rounded-2xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Generate and Upload Your NFT</h1>
        {imageBase64 && (
          <img src={imageBase64} alt="Generated NFT" className="w-full h-48 object-contain rounded-lg my-4" />
        )}

        <input
          type="text"
          placeholder="Enter prompt for AI-generated image"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-3 mb-3 border text-white border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-transparent outline-none"
        />

        <button
          onClick={generateImage}
          className="w-full bg-transparent border-2 border-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition duration-300">
          Generate Image
        </button>

        <input
          type="text"
          placeholder="NFT Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 mb-3 border text-white border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-transparent outline-none"
        />

        <input
          type="number"
          placeholder="NFT Price (ETH)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-3 mb-3 border text-white border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-transparent outline-none"
        />

        <button
          onClick={uploadToIPFS}
          className="w-full bg-transparent border-2 border-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition duration-300">
          Upload to IPFS & Blockchain
        </button>
      </div>
    </div>
  );
}
