const randomStringAlphabet =
  "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM0123456789";
export const randomString = (length = 6) => {
  let result = "";

  for (let i = 0; i < length; i++) {
    result +=
      randomStringAlphabet[
        Math.floor(Math.random() * randomStringAlphabet.length)
      ];
  }

  return result;
};
