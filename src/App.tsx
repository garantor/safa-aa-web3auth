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
export const App = () => (
  <ChakraProvider theme={theme}>
    <AppContextProvider>
      <Box textAlign="center" fontSize="xl">
        <ConnectWallet />
      </Box>


    </AppContextProvider>
  
  </ChakraProvider>
)
