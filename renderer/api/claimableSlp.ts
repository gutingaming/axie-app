type Payload = { address: string };

const claimableSlp = async ({
  address,
}: Payload): Promise<{
  [key: string]: {
    amount: number;
    isClaimable: boolean;
  };
}> => {
  const converted = address.replace(/ronin:/gi, "0x");
  const fetchRes = await fetch(
    `https://game-api.skymavis.com/game-api/clients/${converted}/items/1`
  );
  const {
    total,
    claimable_total,
    blockchain_related: { balance },
  } = await fetchRes.json();
  return {
    [address]: {
      amount: total - balance,
      isClaimable: claimable_total > 0 && total - balance > 0,
    },
  };
};

export default claimableSlp;
