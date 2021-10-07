import RoninChain from "../utils/RoninChain";

type Payload = { roninAddress: string };

const balanceOfSlp = async ({
  roninAddress,
}: Payload): Promise<{ [key: string]: number }> => {
  const ronin_address = `${roninAddress}`.replace(/ronin:/gi, "0x");

  const balance = await RoninChain.getSlpBalance(ronin_address);

  return {
    [`${roninAddress}`]: balance,
  };
};

export default balanceOfSlp;
