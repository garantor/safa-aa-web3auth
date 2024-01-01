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

import ThresholdKey from "@tkey/core";
import SecurityQuestionsModule from "@tkey/security-questions";
import SFAServiceProvider from "@tkey/service-provider-sfa";
import TorusStorageLayer from "@tkey/storage-layer-torus";
import { ShareSerializationModule } from "@tkey/share-serialization";
import { WebStorageModule } from "@tkey/web-storage";
// import { ChromeExtensionStorageModule } from "@tkey/chrome-storage";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import ShareTransferModule from "@tkey/share-transfer";

import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { SfaServiceProvider } from "@tkey/service-provider-sfa";
import { jwtDecode } from "jwt-decode";




console.log(process.env.REACT_APP_CLIENT_ID)


const loadingNFTs = {
    isSuccessful: false,
    header: "Loading  ....",
    innerHeaderText: "Loading Transactions",
    bodyText:
        "Loading transaction ... ",
};


// const oAuth2Client = new OAuth2Client(
//     "213296331271-r8g8mb5kdo3fc7p0v3vbf7c0c0c7kscn.apps.googleusercontent.com",
//     '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',
//     'postmessage',
// );


const clientId = process.env.REACT_APP_CLIENT_ID 
// get from https://dashboard.web3auth.io

const chainConfig = {
    chainId: "0x1",
    rpcTarget: "https://rpc.ankr.com/eth",
    displayName: "mainnet",
    blockExplorer: "https://etherscan.io/",
    ticker: "ETH",
    tickerName: "Ethereum",
};

const web3AuthOptions: any = {
    clientId, // Get your Client ID from the Web3Auth Dashboard
    chainConfig,
    web3AuthNetwork: "sapphire_devnet", // ["sapphire_mainnet", "sapphire_devnet"]
};

// Configuration of Service Provider
const serviceProvider = new SFAServiceProvider({ web3AuthOptions });



const storageLayer = new TorusStorageLayer({ hostUrl: "https://metadata.tor.us" });

const webStorageModule = new WebStorageModule();
// const chromeStorageModule = new ChromeExtensionStorageModule();
// const shareTransferModule = new ShareTransferModule();


const tKeyInstance = new ThresholdKey({
    serviceProvider,
    storageLayer,
    modules: {
        webStorage:webStorageModule,
        // chromeStorageModule,
        // shareTransferModule,
    },
});




export const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
    config: {
        chainConfig,
    },
});


export default function ConnectWallet() {
    const [safeAuthInstance, setSafeAuthInstance] = useState<any>()
    const context = useContext(AppContext)
    const [btnLabel, setBtnLabel] = useState("Login")
    const [disableBtn, setDisableBtn] = useState(context.isInitialized)
    const [loading, setLoading] = useState(false)
    const [safeAddress, setSafeAddress] = useState<any>()
    const [googleAccessToken, setGoogleAccessToken] = useState<any>()
    const [googleUserInfo, setGoogleUserInfo] = useState<any>()
    const [userInfoTKey, setUserInfoTKey] = useState<any>()


    useEffect(() => {
        const init = async () => {
            // Initialization of Service Provider
            try {
                await (tKeyInstance.serviceProvider as any).init(ethereumPrivateKeyProvider);
                console.log("initialted successfully")
            } catch (error) {
                console.error(error);
            }
        };
        init();
    }, []);
    
    

    const getUserInfo = async () => {
        console.log("getting user details ")
        console.log(googleAccessToken)
        if (!googleAccessToken) return;
        try {
            const response = await fetch(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                {
                    headers: { Authorization: `Bearer ${googleAccessToken}` },
                }
            );

            const user = await response.json();
            console.log("this is he user info ", user)
            // await AsyncStorage.setItem("@user", JSON.stringify(user));
            setGoogleUserInfo(user);
            return user
        } catch (error) {
            console.log("This inside error ", error)
            // Add your own error handler here
        }
    };

    function login(){
        

    }








    


async function connectToWeb3Auth() {
    console.log("this firts", googleAccessToken)
    // const userDetails = await getUserInfo()
    const token:any = googleAccessToken
    const decodeAccess:any = jwtDecode(token)
    console.log(decodeAccess)
    // console.log(decodeAccess.email)
   


    // safe-auth-webApp
    
    try {
        const OAuthShareKey = await( tKeyInstance.serviceProvider as SfaServiceProvider).connect({
            verifier: "safe-auth-webApp", //verifier identifier from the web3auth network dashboard
            verifierId: decodeAccess.email,
            idToken: googleAccessToken,
        });
        console.log("this is the OAuthShare ", OAuthShareKey);
        let intize = await tKeyInstance.initialize();
        console.log(intize);
        let details = tKeyInstance.getKeyDetails();
        setUserInfoTKey(details)
        console.log(details)

    } catch (error) {
        console.log("this is the error ", error)

    }
    
}


async function reconstructPrivateKey(){
    
    const share = await (tKeyInstance.modules.webStorage as WebStorageModule).getDeviceShare();
    console.log("the web share ", share)
    await tKeyInstance.inputShareStoreSafe(share)
    let pKey = await tKeyInstance.reconstructKey()
    const keyDec = pKey.privKey.toString("hex");
    console.log("this is the private key instance ", pKey)
    console.log("this is the private key instance ", keyDec)

    
}



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

        const relayKit = new GelatoRelayPack({ apiKey: "mlRmRC3nFmDl_qMnKwuTQk91eE2uOafpll08Jnt_OFA_", protocolKit })

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
            <GoogleLogin
                onSuccess={credentialResponse => {
                    console.log(credentialResponse);
                    setGoogleAccessToken(credentialResponse.credential)
                }}
                onError={() => {
                    console.log('Login Failed');
                }}
            />





            <Button bg="green" onClick={reconstructPrivateKey} isDisabled={disableBtn}> Reconstruct Key </Button>


            <Button bg="green" onClick={connectToWeb3Auth} isDisabled={disableBtn}> Connect to Web3Auth </Button>



  
            <Spacer />
            {context.isConnected === true ? (
                <>
                    <Button bg="green" onClick={createSafe} marginRight={5}> Create Safe </Button>
                    <Button bg="green" onClick={sendBasicSafeTx} marginRight={5}> Send Basic Tx </Button>
                    <Button bg="green" onClick={sendSponsoredTransaction} marginRight={5}> Send Sponsored Transaction </Button>
                
                </>
    
            ): null}


            <Button bg="green" onClick={btnLabel === "Login" ? () => login() : web3AuthLogout} isDisabled={disableBtn}> {btnLabel} </Button>
            <Center>
                <ColorModeSwitcher />

            </Center>

            {loading === true ? (
                <>
                
               
                <CustomAlert
                    isSuccessful={loadingNFTs.isSuccessful}
                    header={loadingNFTs.header}
                    innerHeaderText={loadingNFTs.innerHeaderText}
                    bodyText={loadingNFTs.bodyText}
                    enableSpinner={true}
                    onCloseDialog={() => ({})}
                    isClosable={false}
                />
                </>

            ) : null}

        </Flex>
    )

}