import { ethers } from "ethers";
import { useState } from "react";
import abi from "../abi/CrowdFunding.json";

export default function ConnectPage() {
  let signer = null;
  let provider = null;

  let cf = null;

  const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [contractOwner, setContractOwner] = useState(null);
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
      cf = new ethers.Contract(
        "0xdAA71FBBA28C946258DD3d5FcC9001401f72270F",
        abi,
        provider
      );
      console.log(await cf.getAllProjects());
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
