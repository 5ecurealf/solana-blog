import { createContext, useContext, useMemo } from "react";
import * as anchor from "@project-serum/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getAvatarUrl } from "src/functions/getAvatarUrl";
import { getRandomName } from "src/functions/getRandomName";
import idl from "src/idl.json";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";

const BlogContext = createContext();

// Get Program key
const PROGRAM_KEY = new PublicKey(idl.metadata.address);

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error("Parent must be wrapped inside PostsProvider");
  }

  return context;
};

export const BlogProvider = ({ children }) => {
  const user = {
    name: "Alfie",
    avatar:
      "https://img.freepik.com/free-vector/astronaut_53876-26804.jpg?w=826&t=st=1705517960~exp=1705518560~hmac=0190be558f9cc7c498158791068ad3aea054989af38ea13184d45d5a962190e7",
  };

  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  // console.log(publicKey.toString());
  const program = useMemo(() => {
    if (anchorWallet) {
      const provider = new anchor.AnchorProvider(
        connection,
        anchorWallet,
        anchor.AnchorProvider.defaultOptions
      );
      return new anchor.Program(idl, PROGRAM_KEY, provider);
    }
  }, [connection, anchorWallet]);

  console.log(program.account, "PROGRAM_HERE ");

  return (
    <BlogContext.Provider value={{ user }}>{children}</BlogContext.Provider>
  );
};
