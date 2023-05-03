import { ethers } from "ethers";
import { useState } from "react";

export default function SimpleStorage() {
  let signer = null;
  let provider = null;

  const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [connButtonText, setConnButtonText] = useState("Connect Wallet");

  const connectWalletHandler = async () => {
    if (window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((result) => {
          accountChangedHandler(result[0]);
          setConnButtonText("Wallet Connected");
        })
        .catch((error) => {
          setErrorMessage(error.message);
        });
    } else {
      console.log("Need to install MetaMask");
      setErrorMessage("Please install MetaMask browser extension to interact");
    }
  };

  const accountChangedHandler = (account) => {
    setDefaultAccount(account);
  };

  return (
    <div>
      <h3>Address: {defaultAccount}</h3>
      <button onClick={connectWalletHandler}>{connButtonText}</button>
    </div>
  );
}
