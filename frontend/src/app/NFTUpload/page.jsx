"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import ABI from "../../../../artifacts/contracts/Lock.sol/NFT.json";
import { provider } from "../../../utils/connectchain";
import { Contract } from "ethers";

export default function NFTUploader() {
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [metaMaskID, setMetaMaskID] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
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

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setPreviewURL(URL.createObjectURL(selectedFile));
  };

  const sendToBlockChain = async (userMetaMaskId, imgHash) => {
    try {
      const contract = await getContract();

      const addNFTContract = await contract.addNFT(imgHash);

      await addNFTContract.wait();
      console.log("3");

      return true;
    } catch (e) {
      console.error("Error in BlockChain --->", e.message);
      return false;
    }
  };

  const uploadToIPFS = async () => {
    if (!file || !name || !price) {
      alert("Please fill in all fields and select an image!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
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

      console.log(
        `Uploaded File URL: https://gateway.pinata.cloud/ipfs/${ipfsHash}`
      );
      alert(metaMaskID, ipfsHash);
      const resFromBlockChain = await sendToBlockChain(metaMaskID, ipfsHash);
      if (!resFromBlockChain) {
        alert("Failed to add NFT on blockchain!");
        return;
      }

      try {
        const dbResponse = await axios.post("/api/NFT", {
          userMetaMaskId: metaMaskID,
          name: name,
          price: price,
          // Send IPFS hash to backend
        });

        if (dbResponse.status === 201) {
          alert("NFT successfully uploaded to blockchain and database!");
        }
      } catch (dbError) {
        console.error("Database Save Error:", dbError);
        alert("NFT added to blockchain but failed to save in database.");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Upload failed. Check console for details.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center  p-4 w-full"
      style={{
        backgroundImage: "url(/bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
      <div className="bg-transparent shadow-lg rounded-2xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Upload Your NFT
        </h1>

        {previewURL && (
          <img
            src={previewURL}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}

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
          className="w-full bg-transparent border-2 border-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition duration-300">
          Upload to IPFS
        </button>
      </div>
    </div>
  );
}
