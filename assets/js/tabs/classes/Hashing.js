class Hashing {

    // method to hash using md5
    static hashMD5(input) {
        return CryptoJS.MD5(input).toString(CryptoJS.enc.Hex);
    }

    // method to hash using bcrypt
    static hashBcrypt(input) {
        return dcodeIO.bcrypt.hashSync(input, 10);
    }

    static hashNTLM(input) {
        // Ensure input is a string
        if (!input) input = '';
        input = String(input);

        // Generate NTLM hash - convert to UTF-16LE byte array
        let utf16leBytes = [];
        for (let i = 0; i < input.length; i++) {
            let charCode = input.charCodeAt(i);
            utf16leBytes.push(charCode & 0xFF);        // Low byte
            utf16leBytes.push((charCode >> 8) & 0xFF); // High byte
        }

        // Use md4 from js-md4 library (not CryptoJS)
        let ntlm = md4(new Uint8Array(utf16leBytes)).toUpperCase();

        // Generate LM hash
        const magic = "KGS!@#$%";
        let password = input.toUpperCase();

        if (password.length < 14) {
            password = password + '\0'.repeat(14 - password.length);
        } else {
            password = password.substring(0, 14);
        }

        let half1 = password.substring(0, 7);
        let half2 = password.substring(7, 14);
        let hash1 = this.desEncrypt(half1, magic);
        let hash2 = this.desEncrypt(half2, magic);
        let lm = (hash1 + hash2).toUpperCase();

        // Return in LM:NT format
        return `${lm}:${ntlm}`;
    }

    // Helper methods (keep your existing ones)
    static desEncrypt(key, plaintext) {
        let desKey = this.createDESKey(key);
        let encrypted = CryptoJS.DES.encrypt(
            CryptoJS.enc.Latin1.parse(plaintext),
            CryptoJS.enc.Hex.parse(desKey),
            {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.NoPadding
            }
        );
        return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    }

    static createDESKey(str) {
        let bytes = [];
        for (let i = 0; i < 7; i++) {
            bytes.push(str.charCodeAt(i));
        }

        let key = [];
        key.push(bytes[0] >> 1);
        key.push(((bytes[0] & 0x01) << 6) | (bytes[1] >> 2));
        key.push(((bytes[1] & 0x03) << 5) | (bytes[2] >> 3));
        key.push(((bytes[2] & 0x07) << 4) | (bytes[3] >> 4));
        key.push(((bytes[3] & 0x0F) << 3) | (bytes[4] >> 5));
        key.push(((bytes[4] & 0x1F) << 2) | (bytes[5] >> 6));
        key.push(((bytes[5] & 0x3F) << 1) | (bytes[6] >> 7));
        key.push(bytes[6] & 0x7F);

        for (let i = 0; i < key.length; i++) {
            key[i] = (key[i] << 1);
            let parity = 0;
            for (let j = 0; j < 8; j++) {
                if (key[i] & (1 << j)) parity++;
            }
            if (parity % 2 === 0) key[i] |= 1;
        }

        return key.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Method to hash using SHA-1
    static hashSHA1(input) {
        return CryptoJS.SHA1(input).toString(CryptoJS.enc.Hex);
    }

    // Method to hash using SHA-224
    static hashSHA224(input) {
        return CryptoJS.SHA224(input).toString(CryptoJS.enc.Hex);
    }

    // Method to hash using SHA-256
    static hashSHA256(input) {
        return CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
    }

    // Method to hash using SHA-384
    static hashSHA384(input) {
        return CryptoJS.SHA384(input).toString(CryptoJS.enc.Hex);
    }

    // Method to hash using SHA-512
    static hashSHA512(input) {
        return CryptoJS.SHA512(input).toString(CryptoJS.enc.Hex);
    }
}