export const formatAddress = (address: string, startChars = 6, endChars = 4): string => {
  if (!address || address.length < startChars + endChars) return address;
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

