import React, { useState } from 'react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import heads from '../public/heads.png'; // Adjust the import according to your file structure
import tails from '../public/tails.png'; // Adjust the import according to your file structure
import Coin from './Coin';
import './CoinToss.css';


const COIN_FLIP_AMOUNT = 1000000000; // 1 SOL in lamports (1 SOL = 1,000,000,000 lamports)
const HOUSE_PUBLIC_KEY = new PublicKey('APu8XaL1L8vHFiBdcVWxDcU2uouFiWJFMG8ePTW8mBPz'); // Replace with the house's public key

const CoinFlip = ({ coinFace = [heads, tails] }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flipAnimation, setFlipAnimation] = useState(false);
  const [frontFace, setFrontFace] = useState(randomCoinFace());
  const [backFace, setBackFace] = useState(randomCoinFace());
  const [flips, setFlips] = useState(0);
  const [headsCount, setHeadsCount] = useState(0);
  const [tailsCount, setTailsCount] = useState(0);

  function randomCoinFace() {
    return coinFace[Math.floor(Math.random() * coinFace.length)];
  }

  const toss = () => {
    
    setFlipAnimation(true);

    const changeFace = randomCoinFace();

    setTimeout(() => {
      setFrontFace(changeFace === heads ? coinFace[0] : coinFace[1]);
      setBackFace(changeFace === heads ? coinFace[1] : coinFace[0]);
      setHeadsCount(prev => changeFace === heads ? prev + 1 : prev);
      setTailsCount(prev => changeFace === tails ? prev + 1 : prev);
      setFlips(prev => prev + 1);
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

  let flipCoinInner = 'flip-coin-inner';

  if (flipAnimation) {
    flipCoinInner += ' flip-animation';
  }

  const flipCoin = async () => {
    setFlipAnimation(true);

    const changeFace = randomCoinFace();

    setTimeout(() => {
      setFrontFace(changeFace === heads ? coinFace[0] : coinFace[1]);
      setBackFace(changeFace === heads ? coinFace[1] : coinFace[0]);
      setHeadsCount(prev => changeFace === heads ? prev + 1 : prev);
      setTailsCount(prev => changeFace === tails ? prev + 1 : prev);
      setFlips(prev => prev + 1);
    }, 50);

    setTimeout(() => {
      setFlipAnimation(false);
    }, 500);
    if (!publicKey) {
      alert('Please connect your wallet!');
      return;
    }

    setLoading(true);
    setResult(null);

    const isHeads = Math.random() < 0.5; // Randomly determine if the outcome is heads or tails

    try {
      const recipientPublicKey = isHeads ? publicKey : HOUSE_PUBLIC_KEY;
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPublicKey,
          lamports: COIN_FLIP_AMOUNT,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'processed');

      setResult(isHeads ? 'You win 1 SOL!' : 'You lose 1 SOL.');
    } catch (error) {
      console.error('Transaction failed:', error);
      setResult('Transaction failed. Please try again.');
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
        {loading ? 'Waiting...' : 'Toss it!'}
      </button>
      <button onClick={reset}>Reset</button>
      <p>
        Out of {flips}, there has been {headsCount} heads and {tailsCount} tails.
      </p>
      {}
      {result && <p>{result}</p>}
    </div>
  );
};

export default CoinFlip;