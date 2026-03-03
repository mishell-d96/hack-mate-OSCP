/**
 * initShellAssistantContent()
 *
 * init the content for the shell assistant tabs
 */
function initShellAssistantContent() {
    // reverse shell code highlighting
    buildShellAssistantContent(
        "shell-assistant-select-menu-language-tool",
        "shell-assistant-select-menu-reverse-shell",
        "shell-assistant-reverse-shell-code-element",
        reverseShells,
        "reverse_shell",
        "Select language/ tool",
        "Select shell"
    );

    // bind shell code highlighting
    buildShellAssistantContent(
        "shell-assistant-bs-select-menu-language-tool",
        "shell-assistant-bs-select-menu-reverse-shell",
        "shell-assistant-bs-code-element",
        bindShells,
        "bind_shell",
        "Select language/ tool",
        "Select shell"
    );

    // transfer methods code highlighting
    buildShellAssistantContent(
        "shell-assistant-tm-select-menu-language-tool",
        "shell-assistant-tm-select-menu-reverse-shell",
        "shell-assistant-tm-code-element",
        transferMethods,
        "transfer_files",
        "Select platform",
        "Select method",
        "shell-assistant-tm-filepath",
        "shell-assistant-tm-filename"
    );

    buildStabilizeShellModal()
}

/**
 * insertIpInHighlight()
 *
 * Inserts an IP address and port number into a code block, highlighting the code block based on the selected language/tool.
 *
 * @param selectMenuLanguageToolId = The ID of the select menu for the language/tool selection.
 * @param selectMenuShellTypeId = The ID of the select menu for the shell type selection.
 * @param codeElementId = The ID of the code element to insert the code into.
 * @param JsonObjectVar = The JSON object containing the various details.
 * @param firstKey = firstkey of the json object to use e.g. reverse_shell, bind_shell, transfer_files
 * @param firstSelectText = The text to display in the first select menu.
 * @param secondSelectText = The text to display in the second select menu.
 * @param optionalFilePathId = The ID of the input field for the file path.
 * @param optionalNewFilenameId = The ID of the input field for the new filename.
 */
function buildShellAssistantContent(selectMenuLanguageToolId, selectMenuShellTypeId, codeElementId, JsonObjectVar, firstKey, firstSelectText, secondSelectText, optionalFilePathId = null, optionalNewFilenameId = null) {
    // check if the JsonObjectVar is defined and contains the firstKey
    if (!JsonObjectVar || !JsonObjectVar[firstKey]) {
        console.error('[*][CM] JsonObjectVar object is not defined or does not contain the correct property.');
        return;
    }

    // Retrieve the pentest parameters + get the selectMenu's
    const LHOST = document.getElementById("pentest-parameters-LHOST");
    const LPORT = document.getElementById("pentest-parameters-LPORT");
    const RHOST = document.getElementById("pentest-parameters-RHOST");
    const RPORT = document.getElementById("pentest-parameters-RPORT");
    const applyPentestParametersButton = document.getElementById(pentestParameterUpdateButtonId);

    const selectMenuLanguageTool = document.getElementById(selectMenuLanguageToolId);
    const selectMenuShellType = document.getElementById(selectMenuShellTypeId);

    // if the filepath and filename variables are set, get the elements
    const filePath = optionalFilePathId === null ? null : document.getElementById(optionalFilePathId);
    const newFilename = optionalNewFilenameId === null ? null : document.getElementById(optionalNewFilenameId);

    // add event listener to the 'filePath' and 'newFilename' input fields
    if (filePath && newFilename) {
        if (!filePath || !newFilename) {
            console.error('[*][CM] One or more required elements are not found in the DOM.');
            return;
        } else {
            filePath.addEventListener("input", replaceAndBuildCodeElement);
            newFilename.addEventListener("input", replaceAndBuildCodeElement);
        }
    }

    // check if the required elements are present
    if (!LHOST || !LPORT || !RHOST || !RPORT || !selectMenuLanguageTool || !selectMenuShellType) {
        console.error('[*][CM] One or more required elements are not found in the DOM.');
        return;
    }

    // apply a disabled select option to both the select menus
    selectMenuLanguageTool.appendChild(buildDisabledSelectOption(firstSelectText));
    selectMenuShellType.appendChild(buildDisabledSelectOption(secondSelectText));

    // iterate over the objects and populate the select menus
    Object.keys(JsonObjectVar[firstKey]).forEach(key => {
        const option = new Option(key, key);
        selectMenuLanguageTool.appendChild(option);

        if (localStorage.getItem(selectMenuLanguageToolId) === key) {
            option.selected = true;
            // document.getElementById(codeElementId).classList.add(JsonObjectVar[firstKey][key][0].highlight);
            populateShellTypeOptions(JsonObjectVar[firstKey][key]);
        }
    });

    // add event listeners to the select menus
    selectMenuLanguageTool.addEventListener("change", () => {
        selectMenuShellType.innerHTML = "";
        selectMenuShellType.appendChild(buildDisabledSelectOption(secondSelectText));
        populateShellTypeOptions(JsonObjectVar[firstKey][selectMenuLanguageTool.value]);
    });

    // when the shell changes, update the code field
    selectMenuShellType.addEventListener("change", replaceAndBuildCodeElement);

    // add event listeners to the input fields for LHOST, LPORT, RHOST, and RPORT
    LHOST.addEventListener("change", replaceAndBuildCodeElement);
    LPORT.addEventListener("change", replaceAndBuildCodeElement);
    RHOST.addEventListener("change", replaceAndBuildCodeElement);
    RPORT.addEventListener("change", replaceAndBuildCodeElement);

    // add event listener to the 'apply pentest parameters' button
    applyPentestParametersButton.addEventListener("click", replaceAndBuildCodeElement);

    // at startup, highlight the code
    setTimeout(replaceAndBuildCodeElement, 100)

    function populateShellTypeOptions(shells) {
        shells.forEach(shell => {
            const option = new Option(shell.title, shell.command);
            option.dataset.cmLanguage = shell.highlight;
            selectMenuShellType.appendChild(option);

            if (localStorage.getItem(selectMenuShellTypeId) === shell.command) {
                option.selected = true;
            }
        });
    }

    function replaceAndBuildCodeElement(event) {
        const triggeringElementId = event?.target?.id;

        // retrieve the old code element, if it is null, return
        const oldCodeElement = document.getElementById(codeElementId);

        // create the new code element + set the value of the pentest parameters
        const newCodeElement = buildCodeElement(oldCodeElement, selectMenuShellType.selectedOptions[0]?.dataset.cmLanguage);

        let LHOSTVALUE = LHOST.value.length > 0 ? LHOST.value : "{{LHOST}}";
        let LPORTVALUE = LPORT.value.length > 0 ? LPORT.value : "{{LPORT}}";
        let RHOSTVALUE = RHOST.value.length > 0 ? RHOST.value : "{{RHOST}}";
        let RPORTVALUE = RPORT.value.length > 0 ? RPORT.value : "{{RPORT}}";

        // if the filepath && filename are set, replace the placeholders in the code
        if (filePath && newFilename) {
            let filePathValue = "";
            let newFileNameValue = "";

            if (triggeringElementId === "shell-assistant-tm-filename") {
                filePathValue = filePath.value.length > 0 ? filePath.value : "{filepath}";
                newFileNameValue = newFilename.value.length > 0 ? newFilename.value : "{newfilename}";
            } else {
                filePathValue = filePath.value.length > 0 ? filePath.value : "{filepath}";
                newFileNameValue = filePath.value;
                document.getElementById("shell-assistant-tm-filename").value = newFileNameValue;
            }

            // replace the placeholders in the code with the values from the input fields
            newCodeElement.textContent = selectMenuShellType.value.replace(/{{LHOST}}/g, LHOSTVALUE).replace(/{{LPORT}}/g, LPORTVALUE).replace(/{{RHOST}}/g, RHOSTVALUE).replace(/{{RPORT}}/g, RPORTVALUE).replace(/{filepath}/g, filePathValue).replace(/{newfilename}/g, newFileNameValue);
        } else {
            // replace the placeholders in the code with the values from the pentest parameters
            newCodeElement.textContent = selectMenuShellType.value.replace(/{{LHOST}}/g, LHOSTVALUE).replace(/{{LPORT}}/g, LPORTVALUE).replace(/{{RHOST}}/g, RHOSTVALUE).replace(/{{RPORT}}/g, RPORTVALUE);
        }

        oldCodeElement.replaceWith(newCodeElement);
        hljs.highlightElement(newCodeElement);
        hljs.lineNumbersBlock(newCodeElement);
    }

    function buildCodeElement(oldCodeElement, language) {
        // Create a new code element with the same properties as the old one
        const codeElement = document.createElement("code");
        codeElement.className = `rounded ${language} p-2 h-100`;
        codeElement.style = oldCodeElement.style;
        codeElement.id = oldCodeElement.id;
        codeElement.textContent = oldCodeElement.textContent;
        return codeElement;
    }
}

/**
 * buildStabilizeShellModal()
 *
 * Method that builds the modal with info of how to stabilize your tty shell
 */
function buildStabilizeShellModal() {
    const elements = document.querySelectorAll(".shell-assistant-stabilize-shell-modal");

    elements.forEach(element => {
        let stablizeShellCodeElementClass = new CodeElement('shell-assistant-stabilize-shell-code-element', "language-bash", `##### Tips (when a reverse shell is blocked by a firewall) #####

# TIP 1. Use ports that are already open on the target to set up your reverse shell.
# For example, if port 80 is open, have the target connect back to you on port 80 -
# the firewall is likely to allow outbound traffic on that port.

# TIP 2. Use msfvenom to generate a payload instead of manual one-liners.
# This typically results in a more stable and reliable shell (see 'msfvenom' section for options).

##### Stabilize the shell #####

# 1. Start a listener with rlwrap for command history and line-editing support (attacker)
rlwrap -cAr nc -lvnp {{LPORT}}

# 2. Upgrade to a proper TTY on the target (target)
python3 -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm
# Press Ctrl+Z to background the shell

# 3. Set your local terminal to raw mode so special keys pass through correctly (attacker)
stty raw -echo; fg
# You are now back in the target's shell

# 4. Match the terminal dimensions to your local window for correct output rendering (target)
stty rows 38 columns 116`);
        let stablizeShellCodeElement = stablizeShellCodeElementClass.buildCodeElement();
        stablizeShellCodeElementClass.applyCustomEventListener()

        let modalButton = new Modal('shell-assistant-stabilize-shell-modal', 'assets/icons/navbar/tab-4-shell-assistant/stabilize-shell.png', 'assets/icons/navbar/tab-4-shell-assistant/stabilize-shell-hover.png', '20', '20', 'Tips & interactive TTY').buildModal(stablizeShellCodeElement);
        element.appendChild(modalButton);
    });

}