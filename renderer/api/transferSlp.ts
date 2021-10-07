import RoninChain from "../utils/RoninChain";

type Payload = { fromAddress: string; toAddress: string; privateKey: string };

const transferSlp = async ({ fromAddress, toAddress, privateKey }: Payload): Promise<{
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

export default transferSlp;
