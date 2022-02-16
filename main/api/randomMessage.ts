import fetch from "isomorphic-fetch";

const randomMessage = async (): Promise<{ data: string }> => {
  const fetchRes = await fetch(
    "https://axieinfinity.com/graphql-server-v2/graphql",
    {
      method: "POST",
      body: JSON.stringify({
        operationName: "CreateRandomMessage",
        variables: {},
        query: "mutation CreateRandomMessage { createRandomMessage }",
      }),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
        authorization: "",
        "content-type": "application/json",
      },
    }
  );

  const {
    data: { createRandomMessage: randomMessage },
  } = await fetchRes.json();

  return {
    data: randomMessage,
  };
};

export default randomMessage;
