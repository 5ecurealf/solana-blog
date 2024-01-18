import { createContext, useContext, useEffect, useMemo, useState } from "react";
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
  const [user, setUser] = useState();
  const [initialised, setInitialised] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lastPostId, setLastPostId] = useState(0);
  const [posts, setPosts] = useState([]);

  // const user = {
  //   name: "Alfie",
  //   avatar:
  //     "https://img.freepik.com/free-vector/astronaut_53876-26804.jpg?w=826&t=st=1705517960~exp=1705518560~hmac=0190be558f9cc7c498158791068ad3aea054989af38ea13184d45d5a962190e7",
  // };

  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  console.log(publicKey);
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

  // console.log(program.account, "PROGRAM_HERE ");

  useEffect(() => {
    const start = async () => {
      if (program && publicKey) {
        try {
          const [userPda] = await findProgramAddressSync(
            [utf8.encode("user"), publicKey.toBuffer()],
            program.programId
          );
          const user = await program.account.userAccount.fetch(userPda);
          if (user) {
            setInitialised(true);
            setUser(user);
            setLastPostId(user.lastPostId);

            // console.log(program.account.postAccount);
            const postAccounts = await program.account.postAccount.all();
            setPosts(postAccounts);
          }
        } catch (error) {
          console.log(error);
          setInitialised(false);
        }
      }
    };

    start();
  }, [program, publicKey, transactionPending]);

  const initUser = async () => {
    if (program && publicKey) {
      try {
        setTransactionPending(true);
        const name = getRandomName();
        const avatar = getAvatarUrl(name);
        const [userPda] = await findProgramAddressSync(
          [utf8.encode("user"), publicKey.toBuffer()],
          program.programId
        );

        await program.methods
          .initUser(name, avatar)
          .accounts({
            userAccount: userPda,
            authority: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        setInitialised(true);
      } catch (error) {
        console.log(error);
      } finally {
        setTransactionPending(false);
      }
    }
  };

  const createPost = async (title, content) => {
    if (program && publicKey) {
      setTransactionPending(true);
      try {
        const [userPda] = await findProgramAddressSync(
          [utf8.encode("user"), publicKey.toBuffer()],
          program.programId
        );
        const [postPda] = findProgramAddressSync(
          [
            utf8.encode("post"),
            publicKey.toBuffer(),
            Uint8Array.from([lastPostId]),
          ],
          program.programId
        );

        await program.methods
          .createPost(title, content)
          .accounts({
            postAccount: postPda,
            userAccount: userPda,
            authority: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        setShowModal(false);
      } catch (error) {
        console.log(error);
      } finally {
        setTransactionPending(false);
      }
    }
  };

  return (
    <BlogContext.Provider
      value={{
        user,
        initialised,
        initUser,
        showModal,
        setShowModal,
        createPost,
        posts,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};
