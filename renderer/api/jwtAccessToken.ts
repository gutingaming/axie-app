import { API_URL } from "../constants/server";

type Payload = { address: string; privateKey: string; randomMessage: string };

const jwtAccessToken = async ({
  address,
  privateKey,
  randomMessage,
}: Payload): Promise<{ data: string }> => {
  return fetch(`${API_URL}/jwtAccessToken`, {
    method: "POST",
    body: JSON.stringify({
      address,
      privateKey,
      randomMessage,
    }),
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
      authorization: "",
      "content-type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((json) => json);
};

export default jwtAccessToken;
