import * as React from "react"
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import ConnectWallet from "./Pages/connect"
import AppContextProvider from "./Context"
import { GoogleOAuthProvider } from '@react-oauth/google';


console.log("this is the value ; ",process.env.REACT_APP_GOOGLE_ID as string)
export const App = () => (
  <ChakraProvider theme={theme}>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_ID as string}>
      <AppContextProvider>
        <Box textAlign="center" fontSize="xl">
          <ConnectWallet />
        </Box>


      </AppContextProvider>

    </GoogleOAuthProvider>
   
  
  </ChakraProvider>
)
