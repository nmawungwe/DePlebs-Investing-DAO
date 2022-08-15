import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Contract, providers } from 'ethers'
import { useEffect, useRef, useState } from 'react'
import Web3Modal from 'web3modal';
import { formatEther } from 'ethers/lib/utils';
import {
  DEPLEBS_DAO_CONTRACT_ADDRESS,
  DEPLEBS_DAO_CONTRACT_ABI,
  DEPLEBS_NFT_CONTRACT_ADDRESS, 
  DEPLEBS_NFT_CONTRACT_ABI
} from '../constants'

export default function Home() {

   // True if user has connected their wallet, false otherwise
   const [walletConnected, setWalletConnected] = useState(false);
   const [unlockedNftBalance, setUnlockedNftBalance] = useState(0);
   const [lockedNftBalance, setLockedNftBalance] = useState(0);
   const [daoTreasuryBalance, setDaoTreasuryBalance] = useState("0");
   const [numberOfProposals, setNumberOfProposals] = useState(0);
   const web3ModalRef = useRef()

   // Helper function to connect wallet
   const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
   }

   const getProviderOrSigner = async (needSigner = false) => {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 4) {
        window.alert("Please switch to the Rinkeby network!");
        throw new Error("Please switch to the Rinkeby network");
      }

      if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }
      return web3Provider;
   }

  // piece of code that runs everytime the value of `walletConnected` changes
  // so when a wallet connects or disconnects
  // Prompts user to connect wallet if not connected
  // and then calls helper functions to fetch the
  // DAO Treasury Balance, User NFT Balance, and Number of Proposals in the DAO

  const getDaoContractInstance = (providerOrSigner) => {
      return new Contract(
        DEPLEBS_DAO_CONTRACT_ADDRESS,
        DEPLEBS_DAO_CONTRACT_ABI,
        providerOrSigner 
      );
  }

  const getNFTContractInstance = (providerOrSigner) => {
    return new Contract(
      DEPLEBS_NFT_CONTRACT_ADDRESS,
      DEPLEBS_NFT_CONTRACT_ABI,
      providerOrSigner
    );

}

const getUnlockedNftBalance = async () => {
  try {
    const signer = await getProviderOrSigner(true);
    const nftContract = getNFTContractInstance(signer);
    const unlockedNftBalance = await nftContract.balanceOf(signer.getAddress());
    setUnlockedNftBalance(parseInt(unlockedNftBalance.toString()));
  } catch (error) {
    console.error(error)
  }
}

  const getDaoTreasuryBalance = async () => {
    try {
      const provider = await getProviderOrSigner();
      const daoTreasuryBalance = await provider.getBalance(
        DEPLEBS_DAO_CONTRACT_ADDRESS
      );
      setDaoTreasuryBalance(daoTreasuryBalance.toString());    
    } catch (error) {
        console.error(error);
    }
  }

  const getNumberOfProposals = async () => {
    try {
        const provider = await getProviderOrSigner();
        const daoContract = getDaoContractInstance(provider);
        const numberOfProposals = await daoContract.numProposals();
        setNumberOfProposals(parseInt(numberOfProposals.toString()));
    } catch (error) {
        console.error(error);
    }
  }

  const getLockedNftBalance = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const daoContract = getDaoContractInstance(signer);
      const member = await daoContract.members(signer.getAddress());
      const parsedMember = {
        // joinedAt: new Date(parseInt(member.joinedAt.toString()) * 1000),
        joinedAt: member.joinedAt,
        lockedUpNFTs: member.lockedUpNFTs 
      }
      console.log(parsedMember);
    } catch (error) {
        console.error(error);
    }
  }

  const joinDAO = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const daoContract = getDaoContractInstance(signer);
      const nftContract = getNFTContractInstance(signer);
      const address = await signer.getAddress();
      const tokenIds = []
      if (unlockedNftBalance > 0) {
        let index = 0;
        for ( index; index < unlockedNftBalance; index++) {
          let tokenId = await nftContract.tokenOfOwnerByIndex(address, index)
          // console.log(tokenId.toString())
          tokenId = parseInt(tokenId.toString());
          const txn = await daoContract.onERC721Received(DEPLEBS_DAO_CONTRACT_ADDRESS,address,tokenId,[]);
          await txn.wait()
          // tokenIds.push(tokenId);  
        }
        window.alert("You have joined the DAO heheheh!")
        console.log(tokenIds);
      } else {
        console.log("")
      }

    } catch (error) {
        console.error(error);
    }
  }



   useEffect(() => {
      if(!walletConnected) {
        web3ModalRef.current = new Web3Modal({
          network: "rinkeby",
          providerOptions: {},
          disableInjectedProvider: false,
        });

        connectWallet().then(() => {
          getUnlockedNftBalance();
          getDaoTreasuryBalance();
          getNumberOfProposals();
          getLockedNftBalance()
          // joinDAO();
        });
      }
   }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>DePlebs DAO</title>
        <meta name="description" content="DePlebs DAO" />
        <link rel="icon" href="/DePleb.ico"/>
      </Head>
    
    
    <div className={styles.main}>
      <div>
        <h1 className={styles.title}>Welcome to DePlebs!</h1>
        <div className={styles.description}>Welcome to the DAO!</div>
        <div className={styles.description}>
            Your Unlocked DePlebs NFT Balance: {unlockedNftBalance}
            <br />
            Your Voting Power(Locked NFTs): {lockedNftBalance}
            <br />
            Treasury Balance: {formatEther(daoTreasuryBalance)} ETH
            <br />
            Total Number of Proposals: {numberOfProposals}
        </div>
        <div className={styles.flex}>
          <button
            className={styles.button}
            onClick={()=>{console.log("Create a proposal")}}
          >
            Create Proposal
          </button>
          <button
            className={styles.button}
            onClick={()=>{console.log("View proposals")}}
          >
            View Proposals
          </button>
          <button
            className={styles.button}
            onClick={() => {joinDAO()}}
          >
            Join DAO
          </button>
        </div>
        <div className={styles.description}>Going to render tabs</div>
      </div>
      <div>
        <img className={styles.image} src="/1.png"/>
      </div>
    </div>
    
    <footer className={styles.footer}>
      Made with &#10084; by Alisa
    </footer>
    </div>
  );
}
