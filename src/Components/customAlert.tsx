import { Container, ModalContent, ModalOverlay, ModalHeader, ModalCloseButton, ModalBody, Alert, AlertIcon, AlertTitle, AlertDescription, ModalFooter, Button, Modal, useDisclosure, Spinner, useBreakpointValue } from "@chakra-ui/react";
import { useState } from "react";

interface CustomAlertProp {
    isSuccessful: boolean;
    //  onClose: () => void;
    header: string;
    innerHeaderText: string;
    bodyText: string;
    enableSpinner: boolean
    onCloseDialog: () => void;
    isClosable?: boolean

}

export default function CustomAlert({ isSuccessful, header, innerHeaderText, bodyText, enableSpinner, onCloseDialog, isClosable }: CustomAlertProp) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [modalDialog, setModalDialog] = useState(true);
    const sizeAlert = useBreakpointValue({ base: "xs", sm: "md", md: "lg", lg: "xl" });





    function handleDialog(event: any) {
        setModalDialog(false)
        onCloseDialog()
    }

    return (
        <Container maxW={800}>

            <Modal onClose={onClose} isOpen={modalDialog} isCentered size={sizeAlert}>
                <ModalOverlay />
                <ModalContent
                    containerProps={{
                        justifyContent: "flex-end",
                        padding: "2rem",
                    }}
                >
                    <ModalHeader> {header}</ModalHeader>
                    {isClosable && isClosable === true ? (
                        <ModalCloseButton onClick={handleDialog} />
                    ) : null}

                    <ModalBody
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {enableSpinner ? (
                            <Spinner
                                thickness="4px"
                                margin={50}
                                speed="0.65s"
                                emptyColor="gray.200"
                                color="blue.500"
                                size="xl"
                            />
                        ) : (
                            <Alert
                                status={isSuccessful === true ? "success" : 'error'}
                                variant="subtle"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                textAlign="center"
                                height="200px"
                            >
                                <AlertIcon boxSize="40px" mr={0} />
                                <AlertTitle mt={4} mb={1} fontSize="lg">
                                    {innerHeaderText}
                                </AlertTitle>
                                <AlertDescription maxWidth="sm">
                                    {bodyText}
                                </AlertDescription>
                            </Alert>
                        )
                        }
                    </ModalBody>
                    <ModalFooter>

                        {isClosable && isClosable === true ? (
                            <Button onClick={handleDialog}>Close</Button>
                        ) : null}
                    </ModalFooter>
                </ModalContent>
            </Modal>


        </Container>
    )


}