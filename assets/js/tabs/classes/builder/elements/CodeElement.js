class CodeElement {


    /**
     * constructor for setting up a code element
     *
     * @param idCode id of the code element
     * @param language language of the code (specified by highlight.js standards): language-bash, language-powershell, language-python etc.
     * @param code code to be displayed in the code area
     * @param copyButton boolean to indicate if a copy button should be added to the code element
     * @param codeElementHeight height of the code element in lines, default is 5
     */
    constructor(idCode, language, code, copyButton = true, codeElementHeight = 5) {
        this.idCode = idCode;
        this.codeElementHeight = codeElementHeight;
        this.p = createElement('pre', ["p-0", "m-0", "w-100"]);
        this.c = createElement('code', [language, "p-2", "me-2", "rounded"]);
        this.copyButton = copyButton;

        if (idCode != null) {
            this.p.setAttribute("id", idCode);
        }

        this.imgSrc = 'assets/icons/general/copy.png'
        this.language = language;
        this.code = code;
        this.idCodeContainer = `${idCode}-container`
        this.language = language
        this.pentestParameters = pentestParameters
    }

    /**
     * buildCodeElement()
     *
     * builds a code element and returns it
     */
    buildCodeElement(maxHeight = true) {
        this.maxHeight = maxHeight;
        this.containerDiv = createElement("div", ["d-flex", "justify-content-between", "rounded", "h-100", "border-vscode-blue", "bg-code-4"])
        this.containerDiv.setAttribute("id", this.idCodeContainer);

        this.c.textContent = this.#editedCode()


        this.c.style.cssText = 'white-space: pre-wrap; min-height: 100%; overflow-y: auto;min-height: 100%;';


        this.p.appendChild(this.c);
        this.containerDiv.appendChild(this.p)

        if (this.copyButton) {
            this.containerDiv.appendChild(this.#buildCopyButton())
        }

        this.#highlightCode();

        // return the pre element with the code element nested inside it
        return this.containerDiv
    }

    // highlight the code using highlight.js
    #highlightCode() {
        hljs.highlightElement(this.c);
        hljs.lineNumbersBlock(this.c);
    }

    #buildCopyButton() {
        let a = createElement("a", [])
        a.setAttribute("href", "#");

        let img = createElement("img", ["copy-icon-code", "m-2"]);
        img.src = this.imgSrc;
        img.style.cssText = `position: absolute; bottom: ${this.codeElementHeight}px; right: 5px;height: 25px; width: 25px;`;
        img.setAttribute("alt", "Copy");

        a.appendChild(img);
        return a
    }

    /**
     * #editedCode()
     *
     * replaces the placeholders in the code with the values from localStorage when the plugin is started
     * @returns {*}
     */
    #editedCode() {
        // loop over the pentest parameters
        let editedCode = this.code;

        // 1) Build a map of only the placeholders that actually have values
        const replacements = Object.entries(this.pentestParameters).reduce((map, [id, placeholder]) => {
            const v = localStorage.getItem(id);
            if (v) map[placeholder] = v;
            return map;
        }, {});

        // 2) If there’s nothing to replace, skip the regex work
        if (Object.keys(replacements).length > 0) {
            // 3) Escape each placeholder for regex, join with ‘|’ to make one big pattern
            const pattern = Object.keys(replacements)
                .map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                .join('|');
            const re = new RegExp(pattern, 'g');

            // 4) One replace over the entire code string
            editedCode = editedCode.replace(re, match => replacements[match]);
        }

        return editedCode
    }

    /**
     * applyCustomEventListener()
     *
     * updates the code to the value of 'pentest parameter'
     * NOTE: Should only be used on standalone code elments (not larger datasets such as exploit assistant/ checklist assistant)
     */
    applyCustomEventListener() {
        const applyButton = document.getElementById(pentestParameterUpdateButtonId);
        applyButton.addEventListener("click", () => {
            // let localStorage finish updating
            // build the replacement code element
            let newCodeEl = new CodeElement(
                this.idCode,
                this.language,
                this.code,
                this.copyButton
            ).buildCodeElement(this.maxHeight);

            // replace the old code element with the new one
            if (this.idCode !== null) {
                document.getElementById(this.idCodeContainer).replaceWith(newCodeEl);
            }
        });
    }
}