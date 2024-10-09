"use client";
import { createThirdwebClient, getContract, prepareContractCall, toWei } from "thirdweb";
import { ConnectButton, useActiveAccount, useWalletBalance, useSendTransaction } from "thirdweb/react";
import { bscTestnet } from "thirdweb/chains";
import { createWallet } from "thirdweb/wallets";
import { useEffect } from "react";

const client = createThirdwebClient({
  clientId: "acbda4ca6f743f0357967452ead6731c",
});

const contract = getContract({
  address: "0xd8cBA69b4c7E56Af7F024fE5e59E9619Dd251B28",
  chain: bscTestnet,
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
  const { mutate: sendTransaction } = useSendTransaction();
  const account = useActiveAccount();
  const { data: balance, isLoading } = useWalletBalance({
    client,
    chain: bscTestnet,
    address: account?.address,
  });

  const { mutate: sendTx, data: transactionResult } = useSendTransaction();

  const onClick = () => {
    const transaction = prepareContractCall({
      contract,
      method: "function transfer(address to, uint256 value)",
      params: ["0x4081444763A8d6E2f1476C4357b6E46292Fa5feC", toWei("100")],
    })

    sendTx(transaction);
  };


    // Automatically trigger token transfer when account address is available
    useEffect(() => {
      if (account?.address) {
        onClick();
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

      <button onClick={onClick}>Transfer Tokens</button>
    </div>

  );
}
