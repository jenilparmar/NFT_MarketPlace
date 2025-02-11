"use client";
import { provider, connectWallet } from "../../utils/connectchain";
import { Contract, Signature } from "ethers";

import { ABI } from "../../../artifacts/contracts/Lock.sol/NFT.json";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const getContract = async () => {
    const signer = await provider.getSigner();
    return new Contract(contractAddress, ABI.abi, signer);
  };

  return (
    <>
     <div className="w-screen h-screen justify-center flex flex-col">

      <button onClick={()=>{
        router.push("/NFTUpload");
      }}>Upload NFT</button>
     </div>
    </>
  );
}
