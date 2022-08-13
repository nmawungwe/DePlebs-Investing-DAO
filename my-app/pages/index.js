import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Contract, providers } from 'ethers'
import { useEffect, useRef, useState } from 'react'
import Web3Modal from 'web3modal';
import {
  DEPLEBS_DAO_CONTRACT_ADDRESS,
  DEPLEBS_DAO_CONTRACT_ABI,
  DEPLEBS_NFT_CONTRACT_ADDRESS, 
  DEPLEBS_NFT_CONTRACT_ABI
} from '../constants'

export default function Home() {

   // True if user has connected their wallet, false otherwise
   const [walletConnected, setWalletConnected] = useState(false);
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

  const getDaoContractInstance = async(needSigner=false) => {
      const provider = await getProviderOrSigner();
      const daoContractInstanceProvider = new Contract(
        DEPLEBS_DAO_CONTRACT_ADDRESS,
        DEPLEBS_DAO_CONTRACT_ABI,
        provider 
      );
      if (needSigner) {
        const signer = await getProviderOrSigner(true);
        const daoContractInstanceSigner = new Contract(
          DEPLEBS_DAO_CONTRACT_ADDRESS,
          DEPLEBS_DAO_CONTRACT_ABI,
          signer
        )
        return daoContractInstanceSigner;
      }
      return daoContractInstanceProvider;
  }

  const getNFTContractInstance = async(needSigner=false) => {
    const provider = await getProviderOrSigner();
    const nftContractInstanceProvider = new Contract(
      DEPLEBS_NFT_CONTRACT_ADDRESS,
      DEPLEBS_NFT_CONTRACT_ABI,
      provider 
    );
    if (needSigner) {
      const signer = await getProviderOrSigner(true);
      const nftContractInstanceSigner = new Contract(
        DEPLEBS_NFT_CONTRACT_ADDRESS,
        DEPLEBS_NFT_CONTRACT_ABI,
        signer
      )
      return nftContractInstanceSigner;
    }
    return nftContractInstanceProvider;
}

   useEffect(() => {
      if(!walletConnected) {
        web3ModalRef.current = new Web3Modal({
          network: "rinkeby",
          providerOptions: {},
          disableInjectedProvider: false,
        });

        connectWallet().then(() => {
          console.log("connected hehehe");
        })
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
            Your DePlebs NFT Balance: TBD
            <br />
            Treasury Balance: TBD ETH
            <br />
            Total Number of Proposals: TBD
        </div>
        <div className={styles.flex}>
          <button
            className={styles.button}
            onClick={()=>{"Create a proposal"}}
          >
            Create Proposal
          </button>
          <button
            className={styles.button}
            onClick={()=>{"View proposals"}}
          >
            View Proposals
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
