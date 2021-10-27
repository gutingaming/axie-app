import RoninChain from "../utils/RoninChain";

type TransferSlpPayload = { fromAddress: string; toAddress: string; privateKey: string; balance: number; };

const transferSlp = async ({ fromAddress, toAddress, privateKey, balance }: TransferSlpPayload): Promise<{
  from: string;
  to: string;
  transactionHash?: string;
}> => {
  const from_address = fromAddress.replace(/ronin:/gi, "0x");
  const to_address = toAddress.replace(/ronin:/gi, "0x");

  const receipt = await RoninChain.transferSlp(
    from_address,
    to_address,
    balance,
    privateKey
  );

  return receipt;
};

type TransferAllSlpPayload = { fromAddress: string; toAddress: string; privateKey: string };

const transferAllSlp = async ({ fromAddress, toAddress, privateKey }: TransferAllSlpPayload): Promise<{
  transactionHash?: string;
}> => {
  const from_address = fromAddress.replace(/ronin:/gi, "0x");
  const to_address = toAddress.replace(/ronin:/gi, "0x");

  const balance = await RoninChain.getSlpBalance(from_address);
  const receipt = await RoninChain.transferSlp(
    from_address,
    to_address,
    balance,
    privateKey
  );

  return receipt;
};

export {
  transferSlp,
  transferAllSlp,
};
