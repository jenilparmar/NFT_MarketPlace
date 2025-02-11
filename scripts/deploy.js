const hre = require("hardhat"); // Import HRE

async function main() {
  const Lock = await hre.ethers.getContractFactory("NFT");
  const lock = await Lock.deploy();

  await lock.waitForDeployment();
  console.log("Lock deployed to:", lock.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
