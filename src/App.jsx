import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useState } from 'react';

function App() {
  const [userAddress, setUserAddress] = useState('');
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);
  const [walletConnected, setWalletConnected] = useState(false);

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        const config = {
          apiKey: 'FjVFScdDsyq-kQw6yzXyY7IEVSzutAgo',
          network: Network.ETH_MAINNET,
        };
        const alchemy = new Alchemy(config);
  
        // Try to resolve ENS name for connected address
        const ensName = await alchemy.core.lookupAddress(address);
  
        setUserAddress(ensName || address); // Use ENS name if available
        setWalletConnected(true);
      } catch (err) {
        console.error('MetaMask connection error:', err);
      }
    } else {
      alert('Please install MetaMask');
    }
  }

  function isValidEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  
  function isValidENSName(name) {
    return name.endsWith('.eth') && name.length > 4;
  }
 async function getTokenBalance() {
  if (!isValidEthereumAddress(userAddress) && !isValidENSName(userAddress)) {
    alert('Please enter a valid Ethereum address or ENS name.');
    return;
  }

  const config = {
    apiKey: 'FjVFScdDsyq-kQw6yzXyY7IEVSzutAgo',
    network: Network.ETH_MAINNET,
  };

  const alchemy = new Alchemy(config);

  let resolvedAddress = userAddress;
  if (isValidENSName(userAddress)) {
    try {
      const resolved = await alchemy.core.resolveName(userAddress);
      if (!resolved) {
        alert('Could not resolve ENS name to an address');
        return;
      }
      resolvedAddress = resolved;
    } catch (err) {
      console.error('Error resolving ENS name:', err);
      alert('Failed to resolve ENS name');
      return;
    }
  }

  try {
    const data = await alchemy.core.getTokenBalances(resolvedAddress);
    setResults(data);

    const tokenDataPromises = data.tokenBalances.map((token) =>
      alchemy.core.getTokenMetadata(token.contractAddress)
    );

    setTokenDataObjects(await Promise.all(tokenDataPromises));
    setHasQueried(true);
  } catch (err) {
    console.error('Error fetching token balances:', err);
    alert('Failed to fetch token balances. Please try again.');
  }
}
  return (
    <Box w="100vw">
      <Center>
        <Flex
          alignItems={'center'}
          justifyContent="center"
          flexDirection={'column'}
        >
          <Heading mb={0} fontSize={36}>
            ERC-20 Token Indexer
          </Heading>
          <Text>
            Plug in an address and this website will return all of its ERC-20
            token balances!
          </Text>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={'center'}
      >
        <Heading mt={42}>
          Get all the ERC-20 token balances of this address:
        </Heading>
        <Input
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
        />
        <Button onClick={connectWallet} fontSize={20} mt={36} colorScheme="blue">
          {walletConnected ? 'Wallet Connected' : 'Connect MetaMask'}
        </Button>
        <Button fontSize={20} onClick={getTokenBalance} mt={36} bgColor="blue">
          Check ERC-20 Token Balances
        </Button>

        <Heading my={36}>ERC-20 token balances:</Heading>

        {hasQueried ? (
          <SimpleGrid w={'90vw'} columns={4} spacing={24}>
            {results.tokenBalances.map((e, i) => {
              return (
                <Flex
                  flexDir={'column'}
                  color="white"
                  bg="blue"
                  w={'20vw'}
                  key={e.id}
                >
                  <Box>
                    <b>Symbol:</b> ${tokenDataObjects[i].symbol}&nbsp;
                  </Box>
                  <Box>
                    <b>Balance:</b>&nbsp;
                    {Utils.formatUnits(
                      e.tokenBalance,
                      tokenDataObjects[i].decimals
                    )}
                  </Box>
                  <Image src={tokenDataObjects[i].logo} />
                </Flex>
              );
            })}
          </SimpleGrid>
        ) : (
          'Please make a query! This may take a few seconds...'
        )}
      </Flex>
    </Box>
  );
}

export default App;

// There is no indication of a request in progress... that's bad UX! Do you think you can add some sort of indication of loading?
// Add some styling! 🎨
// The token balances can sometimes be a little long and break the outline of the page... can you fix that? 🔧
// There is no error-checking for wrongly formed requests, or really any error checking of any kind... can you add some in?
// The images and grid display could look better... anything you can do about that?
// There are ways to make this app faster... can you implement some of them? How can the query be made even quicker?
// Completely open-ended!! Use this as the base for your next hackathon project, dream company or personal expedition :)
