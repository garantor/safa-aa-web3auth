import React, {createContext, useState } from 'react'



interface ContextState {
    isConnected:boolean;
    isInitialized:boolean;
    userPublicKey:string;
    safeAuthInstance:any;
    setSafeAuthInstance: (safeAuthInstance:any) => void;
    setUserPublicKey: (status: any) => void;
    setIsConnected: (status: boolean) => void;
    setIsInitialized: (status:boolean) => void;
}



export const AppContext = createContext<ContextState>({
    isConnected: false,
    isInitialized:false,
    userPublicKey: '',
    safeAuthInstance: '',
    setSafeAuthInstance: () => {},
    setUserPublicKey: () => {},
    setIsConnected: () => { },
    setIsInitialized: () => { }

})

export function AppContextProvider({ children } : {children: React.ReactNode}){
        const [isConnected, setIsConnected]= useState(false)
        const [isInitialized, setIsInitialized] = useState(false)
        const [userPublicKey, setUserPublicKey] = useState("")
    const [safeAuthInstance, setSafeAuthInstance] =useState('')




        const contextValue = {
            isConnected,
            isInitialized,
            userPublicKey,
            safeAuthInstance,
            setSafeAuthInstance,
            setUserPublicKey,
            setIsInitialized,
            setIsConnected
        }
        return (
            <AppContext.Provider value={contextValue}> {children}</AppContext.Provider>
        )
    }


export default AppContextProvider;