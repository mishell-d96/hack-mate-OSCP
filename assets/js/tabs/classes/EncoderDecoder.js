class EncoderDecoder {

    static encodeBase64(str, utf16le = false) {
        if (utf16le) {
            // Create a buffer with UTF-16LE encoding
            const buffer = new ArrayBuffer(str.length * 2);
            const view = new DataView(buffer);

            // Write each character as UTF-16LE (little-endian)
            for (let i = 0; i < str.length; i++) {
                view.setUint16(i * 2, str.charCodeAt(i), true);
            }

            // Convert to base64
            const bytes = new Uint8Array(buffer);
            const binary = String.fromCharCode(...bytes);
            return btoa(binary);
        }

        return btoa(str);
    }

    static decodeBase64(str, utf16le = false) {
        if (utf16le) {
            // Decode base64 to binary string
            const binary = atob(str);

            // Convert binary string to byte array
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }

            // Read UTF-16LE encoded text
            const view = new DataView(bytes.buffer);
            let text = '';

            for (let i = 0; i < bytes.length; i += 2) {
                text += String.fromCharCode(view.getUint16(i, true));
            }

            return text;
        }

        return atob(str);
    }

    static encodeURI(str) {
        return encodeURIComponent(str);
    }

    static decodeURI(str) {
        return decodeURIComponent(str);
    }

    static encodeDecimal(str) {
        return str.split('').map(char => `&#${char.charCodeAt(0)};`).join('');
    }

    static decodeDecimal(str) {
        return str.match(/&#\d+;/g).map(entity => String.fromCharCode(parseInt(entity.slice(2, -1)))).join('');
    }

    static encodeHex(str) {
        return str.split('').map(char => `&#x${char.charCodeAt(0).toString(16)};`).join('');
    }

    static decodeHex(str) {
        return str.match(/&#x[\da-fA-F]+;/g).map(entity => String.fromCharCode(parseInt(entity.slice(3, -1), 16))).join('');
    }

    static encodeHTML(str) {
        return str.replace(/[&<>"']/g, function (m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    }

    static decodeHTML(str) {
        let txt = document.createElement("textarea");
        txt.innerHTML = str;
        return txt.value;
    }

    static encodeUnicode(str) {
        return str.split('').map(char => '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4)).join('');
    }

    static decodeUnicode(str) {
        return str.replace(/\\u[\dA-F]{4}/gi, match => String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16)));
    }

    static encodeHexJS(str) {
        return '\\x' + str.split('').map(char => ('0' + char.charCodeAt(0).toString(16)).slice(-2)).join('\\x');
    }

    static decodeHexJS(str) {
        return str.split('\\x').slice(1).map(hex => String.fromCharCode(parseInt(hex, 16))).join('');
    }
}