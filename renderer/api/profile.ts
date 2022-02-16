import { API_URL } from "../constants/server";

type Payload = { accessToken: string };

const profile = async ({
  accessToken,
}: Payload): Promise<{
  success?: boolean;
  error?: string;
  details?: { code: string }[];
}> => {
  return fetch(`${API_URL}/profile`, {
    method: "POST",
    body: JSON.stringify({
      accessToken,
    }),
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((json) => json);
};

export default profile;
