import { API_URL } from "../constants/server";

const randomMessage = async (): Promise<{ data: string }> => {
  return fetch(`${API_URL}/randomMessage`)
    .then((res) => res.json())
    .then((json) => json);
};

export default randomMessage;
