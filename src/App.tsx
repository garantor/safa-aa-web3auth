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
export const App = () => (
  <ChakraProvider theme={theme}>
    <GoogleOAuthProvider clientId="213296331271-r8g8mb5kdo3fc7p0v3vbf7c0c0c7kscn.apps.googleusercontent.com">
      <AppContextProvider>
        <Box textAlign="center" fontSize="xl">
          <ConnectWallet />
        </Box>


      </AppContextProvider>

    </GoogleOAuthProvider>
   
  
  </ChakraProvider>
)
