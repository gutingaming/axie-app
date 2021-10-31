import Web3 from "web3";
import { AbiItem } from "web3-utils/types";

import SLP_ABI from "../slp_abi.json";

const SLP_CONTRACT = "0xa8754b9fa15fc18bb59458815510e40a12cd2014";
const RONIN_PROVIDER_FREE = "https://proxy.roninchain.com/free-gas-rpc";
const RONIN_PROVIDER = "https://api.roninchain.com/rpc";
const CHAIN_ID = 2020;

const web3RoninProviderFree = new Web3(RONIN_PROVIDER_FREE);
const slpContract = new web3RoninProviderFree.eth.Contract(
  SLP_ABI as AbiItem[],
  SLP_CONTRACT
);

const web3RoninProvider = new Web3(RONIN_PROVIDER);
const slpContract2 = new web3RoninProvider.eth.Contract(
  SLP_ABI as AbiItem[],
  SLP_CONTRACT
);

export default class RoninChain {
  private static _transformToEthWallet = (roninWalletAddres: string) => {
    return roninWalletAddres.replace("ronin:", "0x");
  };

  private static _getTransactionCount = async (walletAddress: string) => {
    const finalWalletAddres = this._transformToEthWallet(walletAddress);
    const count = await web3RoninProviderFree.eth.getTransactionCount(
      finalWalletAddres
    );
    return count;
  };

  private static _signAndSendTransaction = async (
    from: string,
    to: string,
    privateKey: string,
    gas: number,
    transaction
  ) => {
    try {
      const signedTransaction = await web3RoninProviderFree.eth.accounts.signTransaction(
        {
          chainId: CHAIN_ID,
          data: transaction.encodeABI(),
          from: this._transformToEthWallet(from),
          gas,
          gasPrice: 0,
          nonce: await this._getTransactionCount(from),
          to: this._transformToEthWallet(to),
        },
        privateKey
      );

      const receipt = await web3RoninProviderFree.eth.sendSignedTransaction(
        signedTransaction.rawTransaction
      );
      return receipt.transactionHash;
    } catch (error) {
      console.error("RoninChain._signAndSendTransaction.error", error);
      throw error;
    }
  };

  static getSlpBalance = async (walletAddress: string) => {
    const finalWalletAddres = this._transformToEthWallet(walletAddress);
    const transaction = slpContract2.methods.balanceOf(finalWalletAddres);
    const balance = await transaction.call();
    return Number(balance);
  };

  static transferSlp = async (
    from: string,
    to: string,
    amount: number,
    privateKey: string
  ) => {
    try {
      if (amount <= 0 || !Number.isInteger(amount)) {
        throw new Error("RoninChain.transferSlp.error.invalidAmount");
      }

      const ethFrom = this._transformToEthWallet(from);
      const ethTo = this._transformToEthWallet(to);

      const transaction = slpContract.methods.transfer(ethTo, amount);

      const transactionHash = await RoninChain._signAndSendTransaction(
        ethFrom,
        SLP_CONTRACT,
        privateKey,
        100000,
        transaction
      );
      console.info("RoninChain.transferSlp.completed", {
        from,
        to,
        amount,
        transactionHash,
      });
      return { transactionHash, from, to, amount };
    } catch (error) {
      console.error("RoninChain.transferSlp.error", {
        from,
        to,
        amount,
        error,
      });
      throw error;
    }
  };

  static checkpoint = async (
    ronin_address: string,
    private_key: string,
    amount: number,
    timestamp: number,
    signature: string
  ) => {
    try {
      if (amount <= 0 || !Number.isInteger(amount)) {
        throw new Error("RoninChain.claimSlp.error.invalidAmount");
      }

    const ethAddress = this._transformToEthWallet(ronin_address);

      const transaction = slpContract.methods.checkpoint(
        ethAddress,
        amount,
        timestamp,
        signature
      );

      const transactionHash = await RoninChain._signAndSendTransaction(
        ethAddress,
        SLP_CONTRACT,
        private_key,
        1000000,
        transaction
      );
      console.info("RoninChain.claimSlp.completed", {
        ronin_address,
        amount,
        transactionHash,
      });
      return { transactionHash, ethAddress, amount };
    } catch (error) {
      console.error("RoninChain.claimSlp.error", {
        ronin_address,
        amount,
      });
      throw error;
    }
  };
}
