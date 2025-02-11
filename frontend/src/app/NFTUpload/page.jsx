    "use client";
    import { useState } from "react";
    import axios from "axios";
    import ABI from "../../../../artifacts/contracts/Lock.sol/NFT.json";
    import { provider, connectWallet } from "../../../utils/connectchain";
    import { Contract, Signature } from "ethers";
    export default function NFTUploader() {
    const [file, setFile] = useState(null);
    const [previewURL, setPreviewURL] = useState(null);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [ipfsHash, setIpfsHash] = useState("");
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const getContract = async () => {
        const signer = await provider.getSigner();
        return new Contract(contractAddress, ABI.abi, signer);
    };
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        setPreviewURL(URL.createObjectURL(selectedFile)); // Show image preview
    };
    const sendToBlockChain = async (imgHash) => {
        try {
        const signer = await provider.getSigner();
        const userMetaMaskId = await signer.getAddress();
        const contract = await getContract();

        const addNFTContract = await contract.addNFT(userMetaMaskId,imgHash);

        return true;
        } catch (e) {
        console.error("Error in BlockChain --->", e.message);
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
        const resFromBlockChain = await sendToBlockChain(ipfsHash);
        if (resFromBlockChain) alert("Done Adding the NFT");
        } catch (error) {
        console.error("Upload Error:", error);
        alert("Upload failed. Check console for details.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-lg">
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Upload Your NFT
            </h1>

            {/* Image Preview */}
            {previewURL && (
            <img
                src={previewURL}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg mb-4"
            />
            )}

            {/* Name Input */}
            <input
            type="text"
            placeholder="NFT Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />

            {/* Price Input */}
            <input
            type="number"
            placeholder="NFT Price (ETH)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />

            {/* File Input */}
            <input
            type="file"
            onChange={handleFileChange}
            className="w-full mb-3 text-gray-700"
            />

            {/* Upload Button */}
            <button
            onClick={uploadToIPFS}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition duration-300">
            Upload to IPFS
            </button>

        </div>
        </div>
    );
    }
