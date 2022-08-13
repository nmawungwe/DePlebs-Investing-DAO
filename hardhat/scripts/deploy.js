const { ethers } = require("hardhat");
const {DEPLEBS_NFT_CONTRACT_ADDRESS} = require("../constants");

async function main() {

  // Deploying the FakeNFTMarketplace contract first
  const FakeNFTMarketplace = await ethers.getContractFactory(
    "FakeNFTMarketplace"
  );
  const fakeNFTMarketplace = await FakeNFTMarketplace.deploy(
    {
      // Deploying the FakeNFTMarketplace with 0.5ETH
      value: ethers.utils.parseEther("0.5"),
    }
  );
  await fakeNFTMarketplace.deployed();

  console.log("FakeNFTMarketplace deployed to: ", fakeNFTMarketplace.address)

  // Now deploying the DeplebsDAO contract 
  const DeplebsDAO = await ethers.getContractFactory("DePlebsDAO");
  const deplebsDAO = await DeplebsDAO.deploy(
    DEPLEBS_NFT_CONTRACT_ADDRESS,
    fakeNFTMarketplace.address,
    {
      // Deploying the DeplebsDAO contract with some 0.5ETH 
      value: ethers.utils.parseEther("0.5"),
    }
  );
  await deplebsDAO.deployed();

  console.log("DeplebsDAO deployed to: ", deplebsDAO.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })