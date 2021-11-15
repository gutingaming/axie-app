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
    blockchain_related: {
      signature: { timestamp },
    },
    last_claimed_item_at,
  } = await fetchRes.json();
  return {
    [address]: {
      amount: total - claimable_total,
      isClaimable: last_claimed_item_at < timestamp,
    },
  };
};

export default claimableSlp;
