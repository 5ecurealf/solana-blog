import { useMemo } from "react";
import { BlogProvider } from "src/context/Blog";
import { Router } from "src/router";
import "./App.css";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

export const App = () => {
  const endpoint =
    "https://billowing-fabled-sailboat.solana-devnet.quiknode.pro/bebf42c7c404396271a59508b1767d67b1362ef2/";
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <BlogProvider>
          <Router />
        </BlogProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
