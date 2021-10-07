import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { accessToken } = req.body;

  const body = {
    operationName: "GetProfileBrief",
    variables: {},
    query:
      "query GetProfileBrief {  profile {    ...ProfileBrief    __typename  }}fragment ProfileBrief on AccountProfile {  accountId  addresses {    ...Addresses    __typename  }  email  activated  name  settings {    unsubscribeNotificationEmail    __typename  }  __typename}fragment Addresses on NetAddresses {  ethereum  tomo  loom  ronin  __typename}",
  };
  const fetchRes = await fetch(
    "https://axieinfinity.com/graphql-server-v2/graphql",
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
    }
  );
  const {
    data: { profile },
  } = await fetchRes.json();

  res.status(200).json({
    data: profile,
  });
}
