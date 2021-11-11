import claimSlp from "../api/claimSlp";
import randomMessageAPI from "../api/randomMessage";
import jwtAccessToken from "../api/jwtAccessToken";
import RoninChain from "../utils/RoninChain";

type Payload = {
  roninAddress: string;
  privateKey: string;
};

function useClaimSlp() {
  return async function ({ roninAddress, privateKey }: Payload) {
    if (roninAddress === "" || privateKey === "")
      return Promise.reject("roninAddress or privateKey is empty");

    const address = roninAddress;

    const { data: randomMessage } = await randomMessageAPI();
    const { data: accessToken } = await jwtAccessToken({
      address,
      privateKey,
      randomMessage,
    });

    const {
      success,
      blockchain_related: {
        signature: { amount, signature, timestamp },
      },
      error,
      details,
    } = await claimSlp({
      address,
      accessToken,
    });

    if (!success || error) {
      throw new Error(`${error}\n${details.map(({ code }) => code)}`);
    }

    const result = await RoninChain.checkpoint(
      address,
      privateKey,
      amount,
      timestamp,
      signature
    );
    console.log(result);
    return result;
  };
}

export default useClaimSlp;
