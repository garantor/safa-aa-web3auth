import { ethers, BrowserProvider, Eip1193Provider } from "ethers";
import { EthersAdapter, SafeFactory } from "@safe-global/protocol-kit";
import { useContext } from "react";
import { AppContext } from "../Context";
import { Button } from "@chakra-ui/react";






async function CreateSafeAA() {
    const context = useContext(AppContext)
    const safeAuthPack = context.safeAuthInstance

    

    async function createSafe() {

        const provider = new BrowserProvider(safeAuthPack?.getProvider() as Eip1193Provider);
        const signer = await provider.getSigner();
        const ethAdapter = new EthersAdapter({
            ethers,
            signerOrProvider: signer,
        } as any);

        console.log("the provider ", provider)
        console.log("the signer; ", signer)

        // const safeFactory = await SafeFactory.create({ ethAdapter });
        // const safe = await safeFactory.deploySafe({
        //     safeAccountConfig: { threshold: 1, owners: [context.userPublicKey] },
        // });
        // console.log("SAFE Created!", await safe.getAddress());
    }


    return (
        <>
        <Button onClick={createSafe}> Create Safe </Button>
        </>
    )

}