const extractPrimeRootPrivateKeys = () => {
  const prime = Number(prompt("Enter a prime number (p):"));
  const root = Number(prompt("Enter a primitive root (g):"));
  const privateKey = Number(prompt("Enter a private key (x):"));
  return { prime, root, privateKey };
};

const publicKeyGeneration = (prime, root, privateKey) => {
  const modPow = (base, exp, mod) => {
    base = base % mod;
    let result = 1;
    while (exp > 0) {
      if (exp % 2 === 1) result = (result * base) % mod;
      base = (base * base) % mod;
      exp = Math.floor(exp / 2);
    }
    return result;
  };
  const hyper = modPow(root, privateKey, prime);
  return { p: prime, g: root, h: hyper };
};

const encryptMessage = (publicKey, message) => {
  const { p, g, h } = publicKey;
  const k = Math.floor(Math.random() * (p - 2)) + 1;
  const modPow = (base, exp, mod) => {
    base = base % mod;
    let result = 1;
    while (exp > 0) {
      if (exp % 2 === 1) result = (result * base) % mod;
      base = (base * base) % mod;
      exp = Math.floor(exp / 2);
    }
    return result;
  };
  const a = modPow(g, k, p);
  const decryptedMessage = [];
  const messageToNumArray = message.split("").map((char) => char.charCodeAt(0));
  messageToNumArray.forEach((m) => {
    const b = (m * modPow(h, k, p)) % p;
    decryptedMessage.push(b);
  });
  return { a, decryptedMessage };
};

const decryptMessage = (privateKey, ciphertextArray, p) => {
  const egcd = (a, b) => {
    a = Number(a);
    b = Number(b);
    if (b === 0) return { g: a, x: 1, y: 0 };
    const { g, x: x1, y: y1 } = egcd(b, a % b);
    return { g, x: y1, y: x1 - Math.floor(a / b) * y1 };
  };
  const modInverse = (a, m) => {
    const { g, x } = egcd(a, m);
    if (g !== 1 && g !== -1) throw new Error("Inverse does not exist");
    return ((x % m) + m) % m;
  };
  const x = Number(privateKey);
  const pNum = Number(p);
  const numeric = [];
  for (const { c1, decryptedText } of ciphertextArray) {
    const s = Math.pow(Number(c1), x) % pNum;
    const inv = modInverse(s, pNum);
    const m = (Number(decryptedText) * inv) % pNum;
    numeric.push(m);
  }
  let text;
  if (pNum > 255) {
    text = String.fromCharCode(...numeric.map((n) => (n < 0 ? n + pNum : n)));
  } else {
    text = numeric
      .map((n) => {
        if (n >= 1 && n <= 26) return String.fromCharCode(96 + n);
        return "?";
      })
      .join("");
  }
  return { numeric, text };
};

const parseCiphertextString = (s) => {
  if (!s || typeof s !== "string")
    throw new Error("No ciphertext string provided");
  const trimmed = s.trim();
  try {
    return JSON.parse(trimmed);
  } catch (e) {}
  let t = trimmed.replace(/'/g, '"');
  t = t.replace(
    /([\{\[\,\s])([A-Za-z0-9_]+)\s*:/g,
    (m, p1, p2) => `${p1}\"${p2}\":`
  );
  try {
    return JSON.parse(t);
  } catch (err) {
    throw new Error(
      "Unable to parse ciphertext. Provide valid JSON or a format like [{c1:2,decryptedText:3},...]"
    );
  }
};

const main = () => {
  const isBrowser = typeof prompt !== "undefined";
  if (isBrowser) {
    const action = (prompt("Enter action (encrypt / decrypt):") || "")
      .trim()
      .toLowerCase();
    if (action === "encrypt") {
      let { prime, root, privateKey } = extractPrimeRootPrivateKeys();
      if (Number(prime) <= 255) {
        console.warn(
          "Prime p is too small to encode ASCII characters. Switching to demo prime p=65537 with g=3 to preserve text."
        );
        prime = 65537;
        root = 3;
        privateKey = Number(privateKey) % (prime - 1);
      }
      const publicKey = publicKeyGeneration(prime, root, privateKey);
      console.log("Public Key:", publicKey);
      const message = prompt("Enter a string message:");
      const { a, decryptedMessage } = encryptMessage(publicKey, message);
      const ciphertext = decryptedMessage.map((decryptedText) => ({
        c1: a,
        decryptedText: decryptedText,
      }));
      console.log("Ciphertext:", ciphertext);
      try {
        const { numeric, text } = decryptMessage(privateKey, ciphertext, prime);
        console.log("Decrypted numeric:", numeric);
        if (Number(prime) > 255) console.log("Decrypted text (ASCII):", text);
        else {
          console.log("Decrypted text (1->a mapping):", text);
          console.warn(
            "Warning: prime p <= 255 — original ASCII characters were reduced modulo p and cannot be uniquely recovered."
          );
        }
      } catch (err) {
        console.warn("Decryption failed:", err.message);
      }
    } else if (action === "decrypt") {
      const prime = Number(prompt("Enter a prime number (p):"));
      const privateKey = Number(prompt("Enter a private key (x):"));
      const cipherInput = prompt(
        "Enter ciphertext (JSON or format like [{c1:2,decryptedText:3},...]):"
      );
      let ciphertext;
      try {
        ciphertext = parseCiphertextString(cipherInput);
      } catch (err) {
        console.error("Invalid ciphertext input:", err.message);
        return;
      }
      try {
        const { numeric, text } = decryptMessage(privateKey, ciphertext, prime);
        console.log("Decrypted numeric:", numeric);
        if (Number(prime) > 255) console.log("Decrypted text (ASCII):", text);
        else {
          console.log("Decrypted text (1->a mapping):", text);
          console.warn(
            "Warning: prime p <= 255 — original ASCII characters were reduced modulo p and cannot be uniquely recovered."
          );
        }
      } catch (err) {
        console.warn("Decryption failed:", err.message);
      }
    } else {
      console.log('Action cancelled or invalid. Use "encrypt" or "decrypt".');
    }
  } else {
    const argv = (typeof process !== "undefined" && process.argv) || [];
    const cmd = argv[2];
    if (cmd === "encrypt") {
      const message = argv[3] || "Hello";
      let p = Number(argv[4]) || 65537;
      let g = Number(argv[5]) || 3;
      let x = Number(argv[6]) || 1234;
      if (p <= 255) {
        console.warn(
          "Prime p is too small to encode ASCII characters. Switching to demo prime p=65537 with g=3 to preserve text."
        );
        p = 65537;
        g = 3;
        x = x % (p - 1);
      }
      const publicKey = publicKeyGeneration(p, g, x);
      console.log("Public Key:", publicKey);
      const { a, decryptedMessage } = encryptMessage(publicKey, message);
      const ciphertext = decryptedMessage.map((decryptedText) => ({
        c1: a,
        decryptedText: decryptedText,
      }));
      console.log("Ciphertext:", JSON.stringify(ciphertext));
    } else if (cmd === "decrypt") {
      const cipherJson = argv[3];
      const p = Number(argv[4]);
      const x = Number(argv[5]);
      if (!cipherJson || isNaN(p) || isNaN(x)) {
        console.error(
          'Usage: node elgamal.js decrypt "<ciphertextJSON>" <p> <x>'
        );
        return;
      }
      let ciphertext;
      try {
        ciphertext = parseCiphertextString(cipherJson);
      } catch (err) {
        console.error("Invalid ciphertext input:", err.message);
        return;
      }
      try {
        const { numeric, text } = decryptMessage(x, ciphertext, p);
        console.log("Decrypted numeric:", numeric);
        if (p > 255) console.log("Decrypted text (ASCII):", text);
        else {
          console.log("Decrypted text (1->a mapping):", text);
          console.warn(
            "Warning: prime p <= 255 — original ASCII characters were reduced modulo p and cannot be uniquely recovered."
          );
        }
      } catch (err) {
        console.warn("Decryption failed:", err.message);
      }
    } else {
      console.log(
        'No action provided. Use: node elgamal.js encrypt <message> <p> <g> <x> OR node elgamal.js decrypt "<ciphertextJSON>" <p> <x>'
      );
    }
  }
};

main();
('Usage: node elgamal.js decrypt "[ {"c1":...,"decryptedText":...}, ...]" <p> <x>');
