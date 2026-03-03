// add all event listeners for the tab-1-tooling
document.addEventListener("DOMContentLoaded", function () {
    // Encoding tab
    GT_encoder();

    // Hashing tab
    GT_hashing();

    // Formatter tab
    GT_formatter();

    // Code Highlighter
    GT_buildCodeHighlighter();
});

function GT_encoder() {
    const encodingSelect = document.getElementById("encoding-select-technique");
    const encodingInput = document.getElementById("encoding-decoding-input-textarea");
    const encodingOutput = document.getElementById("encoding-decoding-output-textarea");

    const updateEncodingOutput = () => {
        const result = decideEncodingOrDecoding(encodingSelect.value, encodingInput.value);
        encodingOutput.innerText = result;
        encodingOutput.value = result;
    };

    encodingSelect.addEventListener("change", updateEncodingOutput);
    encodingInput.addEventListener("input", updateEncodingOutput);
}

function GT_hashing() {
    const hashSelect = document.getElementById("hash-select-algorithm");
    const hashGenInput = document.getElementById("hash-generate-input");
    const hashGenOutput = document.getElementById("hash-generate-output");

    const updateHashGenOutput = () => {
        const result = decideHashingAlgorithm(hashSelect.value, hashGenInput.value);
        hashGenOutput.innerText = result;
        hashGenOutput.value = result;
    };

    hashSelect.addEventListener("change", updateHashGenOutput);
    hashGenInput.addEventListener("input", updateHashGenOutput);
}

function GT_formatter() {
    const formatterButton = document.getElementById("general-tooling-input-formatter-button");
    const formatterTextarea = document.getElementById("general-tooling-input-formatter-text");
    const formatterSelect = document.getElementById("general-tooling-code-formatter-options")

    formatterButton.addEventListener("click", () => {
        formatterTextarea.value = decideFormatterAlgorithm(formatterSelect.value, formatterTextarea.value)
        dispatchInputEvent(formatterTextarea);
    });
}

function GT_buildCodeHighlighter() {
    const formatterButton = document.getElementById("general-tooling-input-formatter-button");
    const formatterTextarea = document.getElementById("general-tooling-input-formatter-text");
    const formatterSelect = document.getElementById("general-tooling-code-formatter-options")

    formatterButton.addEventListener("click", () => {
        formatterTextarea.value = decideFormatterAlgorithm(formatterSelect.value, formatterTextarea.value)
        dispatchInputEvent(formatterTextarea);
    });

    // Code Highlight
    const codeHighlightSelect = document.getElementById("general-tooling-code-highlighter-options");
    const codeHighlightInput = document.getElementById("general-tooling-code-highlighter-input");
    const codeHighlightOutput = document.getElementById("general-tooling-code-highlighter-output-pre");
    const screenshotElement = document.getElementById("general-tooling-code-highlighting-screenshot");

    const updateCodeHighlight = () => {
        updateCodeElement(codeHighlightOutput.querySelector("code"), codeHighlightInput.value, codeHighlightSelect);
    };

    codeHighlightInput.addEventListener("input", updateCodeHighlight);
    codeHighlightSelect.addEventListener("change", updateCodeHighlight);

    screenshotElement.addEventListener("click", () => {
        captureAndCopyCodeElementToClipboard(codeHighlightOutput.querySelector("code"), codeHighlightSelect.value);
        screenshotElement.src = "assets/icons/general/screenshot-success.png";
        screenshotElement.closest("a").classList.add("inactive-link");

        setTimeout(() => {
            screenshotElement.src = "assets/icons/general/screenshot.png";
            screenshotElement.closest("a").classList.remove("inactive-link");
        }, 2000);
    });

    updateCodeHighlight();
}

/**
 * updateCodeElement()
 *
 * update the old code element with the new code element
 *
 * @param oldCodeElement
 * @param codeHighlightInput
 * @param codeHighlightSelectMenu
 */
function updateCodeElement(oldCodeElement, codeHighlightInputValue, codeHighlightSelectMenu) {
    if (oldCodeElement) {
        oldCodeElement.textContent = codeHighlightInputValue
        let newCodeElement = buildCodeElement(oldCodeElement, codeHighlightSelectMenu.value)
        oldCodeElement.parentNode.replaceChild(newCodeElement, oldCodeElement)
    }
}

/**
 * buildCodeElement()
 *
 * build a new code element with the given language
 * @param oldCodeElement
 * @param language
 * @returns {HTMLElement}
 */
function buildCodeElement(oldCodeElement, language) {
    const codeElement = document.createElement("code");
    codeElement.className = `rounded ${language} p-2`;
    codeElement.textContent = oldCodeElement.innerText;
    hljs.highlightElement(codeElement);
    // hljs.lineNumbersBlock(codeElement);

    return codeElement;
}

function decideFormatterAlgorithm(algorithm, text) {
    switch (algorithm) {
        case "xml":
        case "html":
            return Formatter.formatHTML(text);
        case "javascript":
            return Formatter.formatJavaScript(text);
        case "sql":
            return Formatter.formatSQL(text);
        case "pgsql":
            return Formatter.formatSQL(text);
        case "json":
            return Formatter.formatJSON(text);
        case "css":
            return Formatter.formatCSS(text);
    }
}

/**
 * decideHashingAlgorithm()
 *
 * decides based off the input what hashing algorithm it should use
 *
 * @param algorithm algorithm to use
 * @param text text to hash
 * @returns {*|string} returns a hashed string
 */
function decideHashingAlgorithm(algorithm, text) {
    switch (algorithm) {
        case "md5":
            return Hashing.hashMD5(text);
        case "bcrypt":
            return Hashing.hashBcrypt(text);
        case "ntlmv1":
            return Hashing.hashNTLM(text);
        case "sha1":
            return Hashing.hashSHA1(text);
        case "sha224":
            return Hashing.hashSHA224(text);
        case "sha256":
            return Hashing.hashSHA256(text);
        case "sha384":
            return Hashing.hashSHA384(text);
        case "sha512":
            return Hashing.hashSHA512(text);
    }
}

/**
 * decideEncodingOrDecoding()
 *
 * decides based off the technique what encoding or decoding technique it should use, and it returns the
 *
 * @param technique
 * @param text
 * @returns {*|string}
 */
function decideEncodingOrDecoding(technique, text) {
    switch (technique) {
        case "b64-e":
            return EncoderDecoder.encodeBase64(text);
        case "b64-d":
            return EncoderDecoder.decodeBase64(text);
        case "b64-e-utf16le":
            return EncoderDecoder.encodeBase64(text, true);
        case "b64-d-utf16le":
            return EncoderDecoder.decodeBase64(text, true);
        case "uri-e":
            return EncoderDecoder.encodeURI(text);
        case "uri-d":
            return EncoderDecoder.decodeURI(text);
        case "decimal-e":
            return EncoderDecoder.encodeDecimal(text);
        case "decimal-d":
            return EncoderDecoder.decodeDecimal(text);
        case "hex-e":
            return EncoderDecoder.encodeHex(text);
        case "hex-d":
            return EncoderDecoder.decodeHex(text);
        case "html-e":
            return EncoderDecoder.encodeHTML(text);
        case "html-d":
            return EncoderDecoder.decodeHTML(text);
        case "unicode-e":
            return EncoderDecoder.encodeUnicode(text);
        case "unicode-d":
            return EncoderDecoder.decodeUnicode(text);
        case "hexjs-e":
            return EncoderDecoder.encodeHexJS(text);
        case "hexjs-d":
            return EncoderDecoder.decodeHexJS(text);
        default:
            return text;
    }
}