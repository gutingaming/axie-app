import fetch from "isomorphic-fetch";
import Web3 from "web3";

const web3 = new Web3("https://api.roninchain.com/rpc");

type Payload = { address: string; privateKey: string; randomMessage: string };

const jwtAccessToken = async ({
  address,
  privateKey,
  randomMessage,
}: Payload): Promise<{ data: string }> => {
  const sig = web3.eth.accounts.sign(randomMessage, privateKey);
  const body = {
    operationName: "CreateAccessTokenWithSignature",
    variables: {
      input: {
        mainnet: "ronin",
        owner: "User's Eth Wallet Address",
        message: "User's Raw Message",
        signature: "User's Signed Message",
      },
    },
    query:
      "mutation CreateAccessTokenWithSignature($input: SignatureInput!) {  createAccessTokenWithSignature(input: $input) {    newAccount    result    accessToken    __typename  }}",
  };
  body.variables.input.signature = sig.signature;
  body.variables.input.message = randomMessage;
  body.variables.input.owner = address.replace(/ronin:/gi, "0x");
  const fetchRes = await fetch(
    "https://axieinfinity.com/graphql-server-v2/graphql",
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
        authorization: "",
        "content-type": "application/json",
      },
    }
  );
  const {
    data: {
      createAccessTokenWithSignature: { accessToken },
    },
  } = await fetchRes.json();

  return { data: accessToken };
};

export default jwtAccessToken;
