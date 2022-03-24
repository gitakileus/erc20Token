import React, { useEffect, useState } from "react";
import { ethers, utils } from "ethers";

import toast, { Toaster } from "react-hot-toast";
import Token from "./artifacts/contracts/StandardToken.sol/StandardToken.json";
import { StandardToken } from "./types/StandardToken";

const tokenAddress = import.meta.env.VITE_TOKEN_ADDRESS;

declare global {
  interface Window {
    ethereum: any;
  }
}

function App() {
  // 
  const [walletAccount, setWalletAccount] = useState<string | null>();
  //
  const [contract, setContract] = useState<any | ethers.Contract>();
  // basic info contract
  const [btnNewContract, setbtnNewContract] = useState("New Contract")
  const [contractAddress, setContractAddressValue] = useState<string>("")
  // store user address in local state
  const [userAddress, setUserAddressValue] = useState<string>("")
  const [addrCheck, setcheckBalanceAddr] = useState<string>("")
  // store amount in local state
  const [amount, setAmountValue] = useState<number>(0);
  // provider 
  const [provider, setProvider] = useState<ethers.providers.JsonRpcProvider>();

  const [btnconnect, setbtnconnect] = useState("Connect Metamask")
  // request access to the user's MetaMask account
  const connectWalletHandler = () => {

    if (window.ethereum?.request){
      // connect to metamask
			window.ethereum.request({ method: 'eth_requestAccounts'})
			.then((result: any) => {
				setbtnconnect('MetaMask Connected');
				setWalletAccount(result[0]);
			})
			.catch((error:any) => {
				alert('Please install MetaMask browser extension to interact');
			});

    }else{
        alert("Missing install Metamask. Please access https://metamask.io/ to install extension on your browser")
      }
  }

  // -------------------------------
  // send a transaction to the token contract
  async function sendNativeToken() {
    if (!walletAccount || !amount) return;
    if(provider !== undefined && window.ethereum){
      const signer = provider.getSigner();
      const tx = {
        to: userAddress,
        value: amount,
      }
      signer.sendTransaction(tx)
      .then((result: any) => {
        alert(`Transaction hash: ${result.hash}`)
        provider.getBalance(walletAccount)
        .then((balance)=>{
          toast.success(`Balance after: ${ethers.utils.formatEther(balance)}`);
        });
      })
      .catch((error: any) => {
        alert(`Fail Send Token ${error}`)
        // If the request fails, the Promise will reject with an error.
      });

      // const gasPrice = '0x9184e72a000' // 10000000000000 Gas Price
      // const amountHex = (amount * Math.pow(10,18)).toString(16)
      // const tx = {
      //   from: walletAccount,
      //   to: userAddress,
      //   gasPrice: gasPrice, // 21000 Gas Price
      //   value: amountHex,
      // }
      // // a Signer from MetaMask can send transactions and sign messages but cannot sign a transaction
      // // https://docs.ethers.io/v5/api/signer/#signers
      // window.ethereum.request({
      //   method: 'eth_sendTransaction',
      //   params: [tx],
      // })
      // .then((result: any) => {
      //   alert(`Transaction hash: ${result}`)
      //   provider.getBalance(walletAccount)
      //   .then((balance)=>{
      //     toast.success(`Balance after: ${ethers.utils.formatEther(balance)}`);
      //   });
      // })
      // .catch((error: any) => {
      //   alert(`Fail Send Token ${error}`)
      //   // If the request fails, the Promise will reject with an error.
      // });
        
    }else{
      alert('Create new provider instant!')
    }
  }

   // get balance native token
   const nativeBalance = async () => {
    if(provider != undefined){
      const nativebalance = await provider.getBalance(addrCheck);
      toast.success(`native balance: ${ethers.utils.formatEther(nativebalance)}`);
    }else{
      alert('Create new provider instant!')
    }
  }
  // ----------------------------Smart Contract
  // get balance of the token contract
  const checkBalance = async () => {
    if(contract != undefined){
      const balance = await contract.balanceOf(addrCheck);
      toast.success(`balance: ${balance.toString()}`);
    }else{
      alert('Create new contract instant!')
    }
  }

  const newContractInstant = async () => {
    if(provider !== undefined && walletAccount !== null && contractAddress){
      const iContract = new ethers.Contract(contractAddress, Token.abi, provider)
      setContract(iContract);
      //
      const symbol = await iContract.symbol();
      const name = await iContract.name();
      const decimal = await iContract.decimals();
      const balance = await iContract.balanceOf(walletAccount);
      // const symbol = 'hello'
      setbtnNewContract("Created New Contract")
      toast.success(`New Contract: ${name} - ${symbol} - ${decimal} - ${utils.formatUnits(balance.toString())}`);
    }else{
      alert("Please check provider or request Account or Contract address Empty")
    }
  }

  // send a transaction to the token contract
  async function sendToken() {
    if (!walletAccount || !amount) return;

    if(provider !== undefined && contractAddress){
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        Token.abi,
        signer
      ) as StandardToken;
      const transaction = await contract.transfer(userAddress, utils.parseUnits(amount.toString()));
      // Wait for the transaction to be mined...
      const transaction_info =  await transaction.wait();
      alert(`[Success] Transaction Hash: ${transaction_info.blockHash}`)
      const balance = await contract.balanceOf(walletAccount);
      toast.success(`balance: ${balance.toString()}`);
    }
  }

useEffect(() => {
  setProvider(new ethers.providers.Web3Provider(window.ethereum));
  connectWalletHandler();

}, [])

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="mt-10 relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 flex flex-col">
          <button
              className="btn btn-green mt-1"
              type="button"
              onClick={connectWalletHandler}
            >
            {btnconnect}
          </button>
        </div>
      </div>

      {/* ----------------------------------------- */}

      
      <div className="mt-10 relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="lg:flex md:flex text-xl justify-center items-center mx-auto border-orange-500 max-w-2xl py-4 px-4">
          <div className="font-semibold p-2">
            <span className="text-gray-800">Transfer ETH</span>
          </div>
        </div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 flex flex-col">
          <input
            type="text"
            onChange={(e) => setUserAddressValue(e.target.value)}
            placeholder="To"
          />
          <input
            type="number"
            onChange={(e) => setAmountValue(Number(e.target.value))}
            placeholder="Amount (ETH)"
          />
          <button
            className="btn btn-green mt-1"
            type="button"
            onClick={sendNativeToken}
          >
            Send token
          </button>
          <hr className="mt-4" />
          <input
            type="text"
            onChange={(e) => setcheckBalanceAddr(e.target.value)}
            placeholder="Address (native)"
          />
          <button
            className="btn btn-green mt-1"
            type="button"
            onClick={nativeBalance}
          >
            Get Balance
          </button>
        </div>
      </div>

      {/* ----------------------------------------- */}

      <div className="mt-10 relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="lg:flex md:flex text-xl justify-center items-center mx-auto border-orange-500 max-w-2xl py-4 px-4">
          <div className="font-semibold p-2">
            <span className="text-gray-800">Transfer Token</span>
          </div>
        </div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 flex flex-col">

          <input
            type="text"
            onChange={(e) => setContractAddressValue(e.target.value)}
            placeholder="Contract Address"
          />
          <button
            className="btn btn-green mt-1"
            type="button"
            onClick={newContractInstant}
          >
            {btnNewContract}
          </button>
          

          <hr className="mt-4" />

          <input
            type="text"
            onChange={(e) => setUserAddressValue(e.target.value)}
            placeholder="To"
          />
          <input
            type="text"
            onChange={(e) => setAmountValue(Number(e.target.value))}
            placeholder="Amount"
          />
          <button
            className="btn btn-green mt-1"
            type="button"
            onClick={sendToken}
          >
            Send token
          </button>
          <hr className="mt-4" />
          <input
            type="text"
            onChange={(e) => setcheckBalanceAddr(e.target.value)}
            placeholder="Address"
          />
          <button
            className="btn btn-green mt-1"
            type="button"
            onClick={checkBalance}
          >
            Get Balance
          </button>
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}

export default App;
