import React, { useContext, useEffect, useState } from "react";
import { SafeAuthPack, SafeAuthConfig, SafeAuthInitOptions, SafeAuthSignInOptions } from "@safe-global/auth-kit";
import { ethers, BrowserProvider, Eip1193Provider } from "ethers";
import Safe, { EthersAdapter, SafeFactory } from "@safe-global/protocol-kit";
import CustomAlert from "../Components/customAlert";
import { AppContext } from "../Context";
import { Box, Button, Center, Flex, Spacer, useColorModeValue } from "@chakra-ui/react";
import { ColorModeSwitcher } from "../ColorModeSwitcher";
import { MetaTransactionData, MetaTransactionOptions } from '@safe-global/safe-core-sdk-types'
import { GelatoRelayPack } from '@safe-global/relay-kit'

const loadingNFTs = {
    isSuccessful: false,
    header: "Loading  ....",
    innerHeaderText: "Loading Transactions",
    bodyText:
        "Loading transaction ... ",
};


export default function ConnectWallet() {
    const [safeAuthInstance, setSafeAuthInstance] = useState<any>()
    const context = useContext(AppContext)
    const [btnLabel, setBtnLabel] = useState("Login")
    const [disableBtn, setDisableBtn] = useState(context.isInitialized)
    const [loading, setLoading] = useState(false)
    const [safeAddress, setSafeAddress] = useState<any>()
    const [provider, setProvider] = useState<any>()
    const [signerInstance, setSignerInstance] = useState<any>()




    useEffect(() => {
        console.log("this is initialized ")
        setLoading(true)

        const initializeSafeAuth = async () => {
            const safeAuthInitOptions: SafeAuthInitOptions = {
                showWidgetButton: false, // Set to true to show the SafeAuth widget button
                chainConfig: {
                    blockExplorerUrl: "https://etherscan.io", // The block explorer URL
                    chainId: "0x5", // The chain ID
                    displayName: "Ethereum Goerli", // The chain name
                    rpcTarget: "https://rpc.ankr.com/eth_goerli", // The RPC target
                    ticker: "ETH", // The chain ticker
                    tickerName: "Ethereum", // The chain ticker name
                },
            };

            const safeAuthPack = new SafeAuthPack();
            await safeAuthPack.init(safeAuthInitOptions);
            setSafeAuthInstance(safeAuthPack)
            context.setIsInitialized(true)
            context.setSafeAuthInstance(safeAuthPack)
            setLoading(false)

        }

        initializeSafeAuth();
    }, [])



    useEffect(() => {
        console.log("this is the status ", disableBtn)
        setDisableBtn(!disableBtn)


    }, [context.isInitialized])






    async function web3AuthConnect() {
        setLoading(true)
        console.log("got inside ")
        const sOption : SafeAuthSignInOptions = {
            loginProvider:"google"
        }
        const signin = await safeAuthInstance.signIn(sOption);
        console.log("this is the value of sign in ", signin)
        context.setUserPublicKey(signin?.eoa)
        setSafeAddress(signin?.safes[0] || "0x")
        console.log(signin)

        setBtnLabel(signin?.eoa)
        context.setIsConnected(true)
        setLoading(false)


        return signin

    }

    async function web3AuthLogout() {
        setLoading(true)
        console.log("got inside ")
        const signout = await safeAuthInstance.signOut();
        console.log("this is the value of sign in ", signout)
        setBtnLabel("Login")
        context.setIsInitialized(false)
        setLoading(false)

    }


    const safeAuthPack = context.safeAuthInstance



    async function createSafe() {

        setLoading(true)
        const provider = new BrowserProvider(safeAuthPack?.getProvider() as Eip1193Provider);
        const signer = await provider.getSigner();
        const ethAdapter = new EthersAdapter({
            ethers,
            signerOrProvider: signer,
        } as any);
        

        console.log("the provider ", provider)
        console.log("the signer; ", signer)

        const safeFactory = await SafeFactory.create({ ethAdapter });
        const safe = await safeFactory.deploySafe({
            safeAccountConfig: { threshold: 1, owners: [context.userPublicKey] },
        });
        console.log("SAFE Created!", await safe.getAddress());
        setSafeAddress(await safe.getAddress() || "0x")
        setLoading(false)
    }

    async function sendBasicSafeTx() {


        const provider = new BrowserProvider(safeAuthPack?.getProvider() as Eip1193Provider);
        const signer = await provider.getSigner();

        // Create the Safe EthersAdapter
        const ethAdapter = new EthersAdapter({
            ethers,
            signerOrProvider: signer || provider,
        });


        // Instantiate the protocolKit
        const protocolKit = await Safe.create({
            ethAdapter,
            safeAddress,
        });

        // Create a Safe transaction with the provided parameters
        const safeTransactionData: MetaTransactionData = {
            to: ethers.getAddress(context.userPublicKey),
            data: "0x",
            value: ethers.parseUnits("0.0047", "ether").toString(),
        };

        const safeTransaction = await protocolKit.createTransaction({
            transactions:[safeTransactionData],
        });

        // Sign transaction
        const tx = await protocolKit.signTransaction(safeTransaction);

        // Execute the transaction
        const txResult = await protocolKit.executeTransaction(tx);
        console.log("this is the transaction response: ", txResult)
        
    }


    async function sendSponsoredTransaction() {
        const provider = new BrowserProvider(safeAuthPack?.getProvider() as Eip1193Provider);
        const options : MetaTransactionOptions = {
            isSponsored: true
        }

        const signer = await provider.getSigner();

        const ethAdapter = new EthersAdapter({
            ethers,
            signerOrProvider: signer
        })

        const protocolKit = await Safe.create({
            ethAdapter,
            safeAddress
        })

        
        const safeSponsoredTransactionData: MetaTransactionData = {
            to: ethers.getAddress(context.userPublicKey),
            data: "0x",
            value: ethers.parseUnits("0.01", "ether").toString(),
        };

        const relayKit = new GelatoRelayPack({ apiKey: "Api_key", protocolKit })

        const safeTransaction = await relayKit.createRelayedTransaction({
            transactions: [safeSponsoredTransactionData],
            options
        })

        const signedSafeTransaction = await protocolKit.signTransaction(safeTransaction)

        const response = await relayKit.executeRelayTransaction(signedSafeTransaction, options)

        console.log(`Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response.taskId}`)
    }




    return (

        <Flex
            minH={"60px"}
            py={{ base: 2 }}
            px={{ base: 4 }}
            borderBottom={3}
            borderStyle={"solid"}
            borderColor={useColorModeValue("gray.200", "gray.900")}
            flex={{ base: 1, md: "auto" }}
            margin={2}
  
        >
            <Spacer />
            {context.isConnected === true ? (
                <>
                    <Button bg="green" onClick={createSafe} marginRight={5}> Create Safe </Button>
                    <Button bg="green" onClick={sendBasicSafeTx} marginRight={5}> Send Basic Tx </Button>
                    <Button bg="green" onClick={sendSponsoredTransaction} marginRight={5}> Send Sponsored Transaction </Button>
                
                </>
    
            ): null}


            <Button bg="green" onClick={btnLabel === "Login" ? web3AuthConnect : web3AuthLogout} isDisabled={disableBtn}> {btnLabel} </Button>
            <Center>
                <ColorModeSwitcher />

            </Center>

            {loading === true ? (
                <CustomAlert
                    isSuccessful={loadingNFTs.isSuccessful}
                    header={loadingNFTs.header}
                    innerHeaderText={loadingNFTs.innerHeaderText}
                    bodyText={loadingNFTs.bodyText}
                    enableSpinner={true}
                    onCloseDialog={() => ({})}
                    isClosable={false}
                />
            ) : null}

        </Flex>
    )

}