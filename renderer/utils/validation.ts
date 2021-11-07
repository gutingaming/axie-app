export const testRoninAddress = (address: string) => {
  return /^ronin:/.test(address) && address.length === 46;
};

export const testPrivateKey = (privateKey: string) => {
  return /^0x/.test(privateKey) && privateKey.length === 66;
};
