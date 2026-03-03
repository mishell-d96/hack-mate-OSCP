class UsefulCommandList {
    constructor(jsonUsefulCommandList, containerId) {
        this.jsonUsefulCommandList = jsonUsefulCommandList;
        this.containerId = containerId;
    }

    /**
     * buildUsefulCommandList()
     *
     * build an entire UsefulCommandList using an bootstrap accordion structure
     */
    buildUsefulCommandList(linuxVsWindows = false) {
        let containerElement = document.getElementById(this.containerId)
        containerElement.classList.add("accordion");

        // loop through the UsefulCommandList for the number of chapters
        for (let i = 0; i < this.jsonUsefulCommandList.length; i++) {
            const chapter = this.jsonUsefulCommandList[i].chapter;
            const hashedChapter = Hashing.hashMD5(JSON.stringify(this.jsonUsefulCommandList[i]));

            // accordion item is build here
            let UsefulCommandListChapter = this.#buildUsefulCommandListChapter(hashedChapter, chapter)
            let UsefulCommandListContent = null

            // if it is a linux vs a windows equivalent, write it in the 'if', otherwise pass it to the else
            if (linuxVsWindows) {
                UsefulCommandListContent = this.#buildUsefulCommandListContentLinuxVsWindows(hashedChapter, chapter, this.jsonUsefulCommandList[i].chapter_commands)
            } else {
                UsefulCommandListContent = this.#buildUsefulCommandListContent(hashedChapter, chapter, this.jsonUsefulCommandList[i].chapter_commands)
            }

            // append the accordion item to the accordion container
            containerElement.appendChild(UsefulCommandListChapter);
            containerElement.appendChild(UsefulCommandListContent);
        }

        return containerElement
    }

    #buildUsefulCommandListChapter(hashedChapter, chapter) {
        // accordion item container
        let accordionItem = createElement("div", ["accordion-item", "border-vscode-blue", "rounded"]);

        // header if tge accordion item
        let accordionHeader = createElement("h2", ["accordion-header", "rounded"]);
        accordionHeader.setAttribute("id", `heading-${hashedChapter}`);

        // button to click on
        let accordionButton = createElement("button", ["accordion-button", "collapsed", "btn-outline-custom", "rounded"]);
        accordionButton.setAttribute("type", "button");
        accordionButton.setAttribute("data-bs-toggle", "collapse");
        accordionButton.setAttribute("data-bs-target", `#collapse-${hashedChapter}`);
        accordionButton.setAttribute("aria-expanded", "false");
        accordionButton.setAttribute("aria-controls", `collapse-${hashedChapter}`);
        accordionButton.style.cssText = "max-height: 36.6px; outline: none;";
        accordionButton.innerText = chapter;

        // append the button to the header
        accordionHeader.appendChild(accordionButton);
        accordionItem.appendChild(accordionHeader);

        // return the accordion header
        return accordionItem
    }

    // variation 1
    #buildUsefulCommandListContent(hashedChapter, chapter, chapterCommands) {
        let accordionCollapse = createElement("div", ["accordion-collapse", "collapse"]);
        accordionCollapse.setAttribute("id", `collapse-${hashedChapter}`);
        accordionCollapse.setAttribute("aria-labelledby", `heading-${hashedChapter}`);
        accordionCollapse.setAttribute("data-bs-parent", `#${this.containerId}`);

        let accordionBody = createElement("div", ["accordion-body"]);
        let listSearch = createElement("input", ["form-control", "bg-code-4", "border-vscode-blue", "text-white"])
        listSearch.type = "text"
        listSearch.placeholder = "Search command..."
        listSearch.setAttribute("id", `input-search-${hashedChapter}`)

        let listHeaders = createElement("div", ["d-flex", "justify-content-between", "mt-2", "mb-2"])
        let listHeader1 = createElement("span", ["font-weight-bold", "w-100", "me-1"]);
        listHeader1.innerHTML = "<strong>Command</strong>"
        listHeaders.appendChild(listHeader1)

        let ul = createElement("ul", ["border"]);
        ul.setAttribute("id", `table-search-${hashedChapter}`);

        // Apply styles to remove indentation
        ul.style.cssText = `
            list-style-position: inside;
            padding-left: 0;
            margin-left: 0;
            border: none !important;
        `;

        for (let i = 0; i < chapterCommands.length; i++) {
            ul.appendChild(this.#buildUsefulCommandElement(chapterCommands[i], hashedChapter, i + 1));
        }

        accordionBody.appendChild(listSearch)
        accordionBody.appendChild(listHeaders)
        accordionBody.appendChild(ul)
        accordionCollapse.appendChild(accordionBody);

        searchList(`input-search-${hashedChapter}`, `table-search-${hashedChapter}`)

        return accordionCollapse
    }

    // variation 2
    #buildUsefulCommandListContentLinuxVsWindows(hashedChapter, chapter, chapterCommands) {
        let accordionCollapse = createElement("div", ["accordion-collapse", "collapse"]);
        accordionCollapse.setAttribute("id", `collapse-${hashedChapter}`);
        accordionCollapse.setAttribute("aria-labelledby", `heading-${hashedChapter}`);
        accordionCollapse.setAttribute("data-bs-parent", `#${this.containerId}`);

        let accordionBody = createElement("div", ["accordion-body"]);
        let listSearch = createElement("input", ["form-control", "bg-code-4", "border-vscode-blue", "text-white"])
        listSearch.type = "text"
        listSearch.placeholder = "Search command..."
        listSearch.setAttribute("id", `input-search-${hashedChapter}`)

        let listHeaders = createElement("div", ["d-flex", "justify-content-between", "mt-2", "mb-2"])
        let listHeader1 = createElement("span", ["font-weight-bold", "w-50", "me-1"]);
        listHeader1.innerHTML = "<strong>Linux command</strong>"
        let listHeader2 = createElement("span", ["font-weight-bold", "w-50", "ms-1"]);
        listHeader2.innerHTML = "<strong>Windows equivalent</strong>"
        listHeader1.style.cssText = "border-bottom: 2px solid black;"
        listHeader2.style.cssText = "border-bottom: 2px solid black;"
        listHeaders.appendChild(listHeader1)
        listHeaders.appendChild(listHeader2)

        let ul = createElement("ul", ["border"]);
        ul.setAttribute("id", `table-search-${hashedChapter}`);

        // Apply styles to remove indentation
        ul.style.cssText = `
            list-style-position: inside;
            padding-left: 0;
            margin-left: 0;
            border: none !important;
        `;

        for (let i = 0; i < chapterCommands.length; i++) {
            ul.appendChild(this.#buildUsefulCommandElementLinuxVsWindows(chapterCommands[i], hashedChapter, i + 1));
        }

        accordionBody.appendChild(listSearch)
        accordionBody.appendChild(listHeaders)
        accordionBody.appendChild(ul)
        accordionCollapse.appendChild(accordionBody);

        searchList(`input-search-${hashedChapter}`, `table-search-${hashedChapter}`)

        return accordionCollapse
    }

    // variation 1
    #buildUsefulCommandElement(usefulChapterCommand, hashedChapter, index) {
        // Create the list item element
        let li = createElement("li", ["p-0", "m-0"]);
        li.style.cssText = "width: 100%;";

        let commandContainerDiv = createElement("div", ["d-flex", "justify-content-between"])

        // Create containers for Linux and Windows commands
        let commandContainer = createElement("div", ["pb-1"]);
        commandContainer.style.cssText = "width: 100%;height:100%;"

        // Build the code element (small)
        let codeElement = new CodeElement(
            `code-element-${hashedChapter}-${index}`,
            usefulChapterCommand.language,
            usefulChapterCommand.command,
            false
        ).buildCodeElement()

        codeElement.querySelector("code").style.cssText = "overflow-x: scroll; overflow-y: scroll;";

        // Build the large code element (if needed)
        let codeClassLarge = new CodeElement(
            `large-code-element-${hashedChapter}-${index}`,
            usefulChapterCommand.language,
            usefulChapterCommand.command_variation
        );
        let codeElementLarge = codeClassLarge.buildCodeElement(false);
        codeClassLarge.applyCustomEventListener()

        let codeElementModal = new Modal(`useful-command-modal-${hashedChapter}-${index}`, 'assets/icons/navbar/tab-5-checklist-assistant/general/code.png', 'assets/icons/navbar/tab-5-checklist-assistant/general/code-hover.png', 25, 25, `${usefulChapterCommand.explanation}`, `${usefulChapterCommand.title}`).buildModal(codeElementLarge);
        codeElementModal.classList.add("me-1")
        codeElementModal.classList.add("mt-1")

        // add basic command + modalId to the search array
        this.appendTousefullCommandsSearchList({ "command": usefulChapterCommand.command, "modalId": `useful-command-modal-${hashedChapter}-${index}`, "type": "pentest"})

        // Append code elements to their respective containers
        commandContainer.appendChild(codeElement);
        codeElement.appendChild(codeElementModal)

        commandContainerDiv.appendChild(commandContainer)

        // Append the command containers to the list item
        li.appendChild(commandContainer);

        // Return the list item element
        return li;
    }

    // variation 2
    #buildUsefulCommandElementLinuxVsWindows(usefulChapterCommand, hashedChapter, index) {

        // Create the list item element
        let li = createElement("li", ["p-0", "m-0"]);
        li.style.cssText = "width: 100%;";

        let commandContainer = createElement("div", ["d-flex", "justify-content-between"])

        // Create containers for Linux and Windows commands
        let linuxCommandContainer = createElement("div", ["pb-1"]);
        let windowsCommandContainer = createElement("div", ["pb-1"]);
        linuxCommandContainer.style.cssText = "width: 50%;"
        windowsCommandContainer.style.cssText = "width: 50%;"

        // Build the Linux code element
        let codeElementLinux = new CodeElement(
            `linux-code-element-${hashedChapter}-${index}`,
            usefulChapterCommand.linux_command_language,
            usefulChapterCommand.linux_basic_command,
            false
        ).buildCodeElement();

        codeElementLinux.querySelector("code").style.cssText = "overflow-x: scroll; overflow-y: scroll;";

        // Build the Windows code element
        let codeElementWindows = new CodeElement(
            `windows-code-element-${hashedChapter}-${index}`,
            usefulChapterCommand.windows_command_language,
            usefulChapterCommand.windows_basic_command,
            false
        ).buildCodeElement();

        codeElementWindows.querySelector("code").style.cssText = "overflow-x: scroll; overflow-y: scroll;";

        // Build the large Linux code element (if needed)
        let codeClassLinuxLarge = new CodeElement(
            `linux-large-code-element-${hashedChapter}-${index}`,
            usefulChapterCommand.linux_command_language,
            usefulChapterCommand.linux_variations_command
        )
        let codeElementLinuxLarge = codeClassLinuxLarge.buildCodeElement(false);
        codeClassLinuxLarge.applyCustomEventListener()

        let codeElementLinuxModal = new Modal(`useful-command-modal-${hashedChapter}-${index}-linux`, 'assets/icons/navbar/tab-5-checklist-assistant/general/code.png', 'assets/icons/navbar/tab-5-checklist-assistant/general/code-hover.png', 25, 25, `${usefulChapterCommand.linux_basic_command} - ${usefulChapterCommand.title}`).buildModal(codeElementLinuxLarge);
        codeElementLinuxModal.classList.add("me-1")
        codeElementLinuxModal.classList.add("mt-1")

        // Build the large Windows code element (if needed)
        let codeClassWindowsLarge = new CodeElement(
            `windows-large-code-element-${hashedChapter}-${index}`,
            usefulChapterCommand.windows_command_language,
            usefulChapterCommand.windows_variations_command
        )
        let codeElementWindowsLarge = codeClassWindowsLarge.buildCodeElement(false);
        codeClassWindowsLarge.applyCustomEventListener()

        let codeElementWindowsModal = new Modal(`useful-command-modal-${hashedChapter}-${index}-windows`, 'assets/icons/navbar/tab-5-checklist-assistant/general/code.png', 'assets/icons/navbar/tab-5-checklist-assistant/general/code-hover.png', 25, 25, `${usefulChapterCommand.windows_basic_command} - ${usefulChapterCommand.title}`).buildModal(codeElementWindowsLarge);
        codeElementWindowsModal.classList.add("me-1")
        codeElementWindowsModal.classList.add("mt-1")

        // add linux + windows basic command + modalId to the search array
        this.appendTousefullCommandsSearchList({ "command": usefulChapterCommand.linux_basic_command, "modalId": `useful-command-modal-${hashedChapter}-${index}-linux`,"type": "linux" })
        this.appendTousefullCommandsSearchList({ "command": usefulChapterCommand.windows_basic_command, "modalId": `useful-command-modal-${hashedChapter}-${index}-windows`, "type": "windows" })

        // Append code elements to their respective containers
        linuxCommandContainer.appendChild(codeElementLinux);
        codeElementLinux.appendChild(codeElementLinuxModal)

        windowsCommandContainer.appendChild(codeElementWindows);
        codeElementWindows.appendChild(codeElementWindowsModal);

        commandContainer.appendChild(linuxCommandContainer)
        commandContainer.appendChild(windowsCommandContainer)

        // Append the command containers to the list item
        li.appendChild(commandContainer);

        // Return the list item element
        return li;
    }

    /**
     * appendTousefullCommandsSearchList()
     *
     * append a command object to the usefullCommandsSearchList array, this consist out of the folluwing structure:
     *
     * { "command": "<command>", "modalId": "<modalId>" }
     *
     * @param commandObject
     */
    appendTousefullCommandsSearchList(commandObject) {
        usefullCommandsSearchList.push(commandObject)
    }
}
