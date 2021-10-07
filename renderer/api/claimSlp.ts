type Payload = { address: string; accessToken: string };

const claimSlp = async ({
  address,
  accessToken,
}: Payload): Promise<{
  error?: string;
  details?: { code: string }[];
}> => {
  const fetchRes = await fetch(
    `https://game-api.skymavis.com/game-api/clients/${address}/items/1/claim`,
    {
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
