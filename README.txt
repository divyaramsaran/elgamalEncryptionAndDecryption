# ElGamal Cryptosystem Implementation

A modern JavaScript implementation of the ElGamal public-key cryptosystem, supporting both browser and Node.js environments. This implementation provides secure asymmetric encryption for text messages using modular arithmetic.

## Features

- **Dual Environment Support**: Works seamlessly in both browser and Node.js
- **Flexible Input Formats**: Supports multiple ciphertext input formats including JSON
- **Large Number Support**: Handles prime numbers > 255 for full ASCII character encoding
- **Interactive Mode**: Browser-based prompt interface for easy testing
- **Command Line Interface**: Scriptable Node.js interface for automation

## Mathematical Background

The ElGamal cryptosystem is based on the difficulty of the discrete logarithm problem and consists of three main components:

1. **Key Generation**:
   - Choose a large prime `p` and primitive root `g`
   - Select private key `x` where 1 < x < p-1
   - Compute public key `h = g^x mod p`

2. **Encryption**:
   - Choose random `k` where 1 < k < p-1
   - Compute `c1 = g^k mod p`
   - Compute `c2 = m * h^k mod p` for message `m`

3. **Decryption**:
   - Compute `m = c2 * (c1^x)^(-1) mod p`

## Usage

### Browser Interface

```javascript
// Open in browser and select operation:
// 1. Encrypt: Enter p, g, x, and message
// 2. Decrypt: Enter p, x, and ciphertext
```

### Command Line Interface

```bash
# Encryption
node elgamal.js encrypt <message> <p> <g> <x>

# Decryption
node elgamal.js decrypt "<ciphertextJSON>" <p> <x>
```

## Security Considerations

- Uses proper modular exponentiation for large number calculations
- Implements secure parameter validation
- Supports primes > 255 for full ASCII character encoding
- Includes warnings for insecure parameter choices

## Implementation Details

- Custom modular exponentiation implementation for precision
- Extended Euclidean algorithm for modular inverse calculations
- Flexible ciphertext parsing with JSON support
- Automatic parameter validation and security checks

## Limitations

- Not suitable for production cryptographic use without additional hardening
- Uses JavaScript Number type (consider BigInt for production)
- Prime numbers ≤ 255 limit character encoding capabilities

## Example

```javascript
// Sample encryption with p=65537 (prime), g=3 (primitive root)
const message = "Hello, World!";
const p = 65537;
const g = 3;
const x = 1234;  // private key

// Returns ciphertext array of {c1, decryptedText} pairs
// Can be decrypted using private key x
```

## Contributing

Feel free to submit issues and enhancement requests!