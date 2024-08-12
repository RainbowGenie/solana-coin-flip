import React, { useState } from "react";
import {
  PublicKey,
  SystemProgram,
  Keypair,
  Connection,
  sendAndConfirmTransaction,
  sendTransaction,
  confirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import heads from "../public/heads.png"; // Adjust the import according to your file structure
import tails from "../public/tails.png"; // Adjust the import according to your file structure
import Coin from "./Coin";
import "./CoinToss.css";

// Get the 64-byte secret key (private key + public key)
const secretKey = keypair.secretKey;
const HOUSE_SECRET_KEY = new Uint8Array(secretKey); // Replace with actual secret key
const houseKeypair = Keypair.fromSecretKey(HOUSE_SECRET_KEY);

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// const COIN_FLIP_AMOUNT = 1000 * 1e5; // 0.01 SOL in lamports (1 SOL = 1,000,000,000 lamports)
const SOL_FLIP_AMOUNT = 0.01 * 1e9;
const HOUSE_PUBLIC_KEY = new PublicKey(
  "APu8XaL1L8vHFiBdcVWxDcU2uouFiWJFMG8ePTW8mBPz"
); // Replace with the house's public key

const CoinFlip = ({ coinFace = [heads, tails] }) => {
  // const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flipAnimation, setFlipAnimation] = useState(false);
  const [frontFace, setFrontFace] = useState(randomCoinFace());
  const [backFace, setBackFace] = useState(randomCoinFace());
  const [flips, setFlips] = useState(0);
  const [headsCount, setHeadsCount] = useState(0);
  const [tailsCount, setTailsCount] = useState(0);
  const [userBalance, setUserBalance] = useState();

  function randomCoinFace() {
    return coinFace[Math.floor(Math.random() * coinFace.length)];
  }

  const toss = () => {
    setFlipAnimation(true);

    const changeFace = randomCoinFace();

    setTimeout(() => {
      setFrontFace(changeFace === heads ? coinFace[0] : coinFace[1]);
      setBackFace(changeFace === heads ? coinFace[1] : coinFace[0]);
      setHeadsCount((prev) => (changeFace === heads ? prev + 1 : prev));
      setTailsCount((prev) => (changeFace === tails ? prev + 1 : prev));
      setFlips((prev) => prev + 1);
    }, 50);

    setTimeout(() => {
      setFlipAnimation(false);
    }, 500);
  };

  const reset = () => {
    setFlips(0);
    setHeadsCount(0);
    setTailsCount(0);
  };

  let flipCoinInner = "flip-coin-inner";

  if (flipAnimation) {
    flipCoinInner += " flip-animation";
  }

  const flipCoins = async () => {
    setFlipAnimation(true);

    const changeFace = randomCoinFace();

    setTimeout(() => {
      setFrontFace(changeFace === heads ? coinFace[0] : coinFace[1]);
      setBackFace(changeFace === heads ? coinFace[1] : coinFace[0]);
      setHeadsCount((prev) => (changeFace === heads ? prev + 1 : prev));
      setTailsCount((prev) => (changeFace === tails ? prev + 1 : prev));
      setFlips((prev) => prev + 1);
    }, 50);

    setTimeout(() => {
      setFlipAnimation(false);
    }, 500);
    if (!publicKey) {
      alert("Please connect your wallet!");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const isHeads = changeFace === heads;
      const fromPubkey = isHeads ? HOUSE_PUBLIC_KEY : publicKey; // House pays if the user wins
      const toPubkey = isHeads ? publicKey : HOUSE_PUBLIC_KEY; // User pays if they lose
      console.log("From Pubkey:", fromPubkey.toBase58());
      console.log("To Pubkey:", toPubkey.toBase58());

      // Check balances before attempting to send
      const fromBalance = await connection.getBalance(fromPubkey);
      const userWalletBalance = await connection.getBalance(publicKey);
      setUserBalance(userWalletBalance / 1e9);

      console.log(
        "From Pubkey Balance:",
        fromBalance / 1e9,
        userWalletBalance / 1e9,
        "SOL"
      );

      if (fromBalance < SOL_FLIP_AMOUNT) {
        throw new Error("Insufficient funds in the fromPubkey account.");
      }
      // Sign the transaction with the house's keypair if the house is sending SOL

      const signature = await sendTransaction(transaction, connection);
      const confirmation = await connection.confirmTransaction(
        signature,
        "processed"
      );
      // const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      //   connection,
      //   userPublicKey,
      //   bonkMintAddress,
      //   fromPubkey
      // );

      // const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      //   connection,
      //   userPublicKey,
      //   bonkMintAddress,
      //   toPubkey
      // );
      // const transferInstruction = createTransferInstruction(
      //   fromTokenAccount.address,
      //   toTokenAccount.address,
      //   fromPubkey,
      //   BONK_FLIP_AMOUNT,
      //   [],
      //   TOKEN_PROGRAM_ID
      // );

      // const transaction = new Transaction().add(transferInstruction);

      // const signature = await sendTransaction(transaction, connection);

      // await connection.confirmTransaction(signature, 'confirmed');
      if (confirmation.value.err) {
        throw new Error("Transaction confirmation failed");
      }

      setResult(isHeads ? "You win 0.01 SOL!" : "You lose 0.01 SOL.");
    } catch (error) {
      console.error("Transaction failed:", error);
      setResult("Transaction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div>
    //   <button onClick={flipCoin} disabled={loading}>
    //     {loading ? 'Flipping...' : 'Flip Coin'}
    //   </button>
    //   {result && <p>{result}</p>}
    // </div>
    <div className="CoinToss">
      <h1>Coin Toss</h1>

      <div className="flip-coin">
        <div className={flipCoinInner}>
          <div className="flip-coin-front">
            <Coin face={frontFace} />
          </div>
          <div className="flip-coin-back">
            <Coin face={backFace} />
          </div>
        </div>
      </div>
      <button disabled={loading} onClick={flipCoin}>
        {loading ? "Waiting..." : "Toss it!"}
      </button>
      <button onClick={reset}>Reset</button>
      <p>
        Out of {flips}, there has been {headsCount} heads and {tailsCount}{" "}
        tails.
      </p>

      {}
      {result && <p>{result}</p>}
    </div>
  );
};

export default CoinFlip;
