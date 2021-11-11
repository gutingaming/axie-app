type Payload = { address: string; accessToken: string };

const claimSlp = async ({
  address,
  accessToken,
}: Payload): Promise<{
  success?: boolean;
  blockchain_related?: {
    signature: Nullable<{
      amount: number;
      signature: string;
      timestamp: number;
    }>;
  };
  error?: string;
  details?: { code: string }[];
}> => {
  const converted = address.replace(/ronin:/gi, "0x");
  const fetchRes = await fetch(
    `https://game-api.skymavis.com/game-api/clients/${converted}/items/1/claim`,
    {
      method: "POST",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
        authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const json = await fetchRes.json();
  return json;
};

export default claimSlp;
