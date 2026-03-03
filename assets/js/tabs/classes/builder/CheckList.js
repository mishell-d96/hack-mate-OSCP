class CheckList {
    constructor(jsonChecklist, containerId, exportId, title = "") {
        this.jsonChecklist = jsonChecklist;
        this.containerId = containerId;
        this.exportId = exportId;
        this.checkboxId = "";
    }

    /**
     * buildChecklist()
     *
     * build an entire checklist using an bootstrap accordion structure
     */
    buildChecklist(language) {
        // programming language
        this.language = language

        // container element that contains the select elements and code element
        let containerElement = document.getElementById(this.containerId)
        containerElement.style.cssText = "min-height: 100%; max-height:100%; overflow-x: scroll; overflow-x: hidden;";

        // Add export button at the top
        let headerAndExportButtonContainer = createElement('div', ['d-flex', 'justify-content-start', 'align-items-center', "mb-2", "gap-2"]);

        let header = createElement('p', ["mb-0"]);
        header.innerText = "Checklist" + (this.exportId ? ` - ${this.exportId}` : "");
        let exportButton = this.buildExportButton();

        // Remove margin from export button to align properly
        exportButton.style.cssText = 'cursor: pointer;';

        headerAndExportButtonContainer.appendChild(header);
        headerAndExportButtonContainer.appendChild(exportButton);
        containerElement.appendChild(headerAndExportButtonContainer);

        // init both the select elements
        let selectElement_1 = this.#buildSelectElement1()
        let selectElement2WithCheckbox = this.#buildSelectElement2WithCheckbox(selectElement_1);
        let containerCodeElement = this.#buildCodeElement('# Please select a check from the dropdown to view the code.');

        // apply both select menu's to the event listener
        containerElement.appendChild(selectElement_1);
        containerElement.appendChild(selectElement2WithCheckbox);
        containerElement.appendChild(containerCodeElement);

        // add the event listeners to the select elements
        this.#SelectElement1EventListener()
        this.#SelectElement2EventListener()
        this.#pentestParametersEventListener()

        // Add the event listener to the code element
        dispatchChangeEvent(selectElement2WithCheckbox.querySelector("select"));
    }

    /**
     * buildExportButton()
     *
     * builds the export button with a dropdown menu to export the checklist in different formats
     * @returns {HTMLElement}
     */
    buildExportButton() {
        const wrapper = createElement('div', ['dropdown']);

        const exportButton = createElement('div', ['dropdown-toggle']);
        exportButton.style.cssText = 'cursor: pointer;';
        exportButton.setAttribute('data-bs-toggle', 'dropdown');
        exportButton.setAttribute('data-bs-auto-close', 'true');
        exportButton.setAttribute('title', `Export '${this.exportId}' checklist to Markdown`);

        const exportImage = createElement('img', []);
        exportImage.style.cssText = 'transition: all 0.3s ease; width: 25px; height: 25px;';
        exportImage.src = 'assets/icons/general/export.png';

        exportButton.addEventListener('mouseenter', () => {
            exportImage.src = 'assets/icons/general/export-hover.png';
        });

        exportButton.addEventListener('mouseleave', () => {
            exportImage.src = 'assets/icons/general/export.png';
        });

        const icon = (name) => `<img src="assets/icons/general/${name}.png" alt="${name}" style="width: 16px; height: 16px; margin-right: 8px;" />`;

        const dropdownMenu = createElement('ul', ['dropdown-menu', 'bg-code-3', 'border-vscode-blue']);
        dropdownMenu.innerHTML = `
        <li><h6 class="dropdown-header text-white-50">Copy current chapter</h6></li>
        <li><a class="dropdown-item text-white" href="#" data-scope="chapter" data-titles-only="false">${icon('export-full')}Complete chapter </a></li>
        <li><a class="dropdown-item text-white" href="#" data-scope="chapter" data-titles-only="true">${icon('export')}Titles only</a></li>
        <li><hr class="dropdown-divider border-secondary"></li>
        <li><h6 class="dropdown-header text-white-50">Export full checklist</h6></li>
        <li><a class="dropdown-item text-white" href="#" data-scope="all" data-titles-only="false">${icon('export-full')}Complete checklist</a></li>
        <li><a class="dropdown-item text-white" href="#" data-scope="all" data-titles-only="true">${icon('export')}Titles only</a></li>
    `;

        dropdownMenu.querySelectorAll('[data-scope]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const titlesOnly = item.dataset.titlesOnly === 'true';
                const chapterOnly = item.dataset.scope === 'chapter';
                const markdown = this.#generateMarkdown(titlesOnly, chapterOnly);

                if (chapterOnly) {
                    navigator.clipboard.writeText(markdown);
                    createToast('Content has been copied successfully!', 3000);
                } else {
                    this.#downloadMarkdown(markdown);
                }
            });
        });

        exportButton.appendChild(exportImage);
        wrapper.appendChild(exportButton);
        wrapper.appendChild(dropdownMenu);
        return wrapper;
    }

    /**
     * #getSelectedChapterIndex()
     *
     * Retrieves the index of the currently selected chapter based on the first select element's value.
     * @returns {*|number}
     */
    #getSelectedChapterIndex() {
        const selectElement1Id = Hashing.hashMD5(JSON.stringify(this.jsonChecklist)) + "-select-1";
        const selectElement1 = document.getElementById(selectElement1Id);
        if (!selectElement1) return -1;

        return this.jsonChecklist.findIndex(chapter =>
            Hashing.hashMD5(JSON.stringify(chapter.chapter)) === selectElement1.value
        );
    }

    /**
     * #generateMarkdown()
     *
     * Generates markdown content based on the checklist data. It can generate either the full checklist or just the titles, and can also be limited to the currently selected chapter.
     * @param titlesOnly
     * @param chapterOnly
     * @returns {string}
     */
    #generateMarkdown(titlesOnly = false, chapterOnly = false) {
        let markdown = '';
        const selectedIndex = chapterOnly ? this.#getSelectedChapterIndex() : -1;
        const chapters = chapterOnly && selectedIndex !== -1
            ? [{data: this.jsonChecklist[selectedIndex], index: selectedIndex}]
            : this.jsonChecklist.map((ch, i) => ({data: ch, index: i}));

        if (!chapterOnly) {
            markdown += `# Security Checklist\n`;
            markdown += `*Generated: ${new Date().toLocaleString()}*\n\n`;
        }

        chapters.forEach(({data: chapterObject, index: chapterIndex}) => {
            markdown += `## ${chapterObject.chapter}\n\n`;

            chapterObject.checks.forEach((check, checkIndex) => {
                const checkId = Hashing.hashMD5(check.title) + "-checkbox";
                const isChecked = localStorage.getItem(checkId) === "true";
                const checkboxSymbol = isChecked ? '- [x]' : '- [ ]';
                const itemNumber = checkIndex + 1;

                markdown += `${checkboxSymbol} **${chapterIndex + 1}.${itemNumber}. ${check.title}**\n`;

                if (check.description) {
                    markdown += `${check.description}\n\n`;
                }

                if (check.code && !titlesOnly) {
                    const codeLanguage = 'bash';
                    markdown += `\`\`\`${codeLanguage}\n`;
                    check.code.split('\n').forEach(line => {
                        markdown += replacePentestParameters(`${line}\n`);
                    });
                    markdown += `\`\`\`\n`;
                }

                markdown += `\n`;
            });
        });

        return markdown;
    }

    /**
     * #downloadMarkdown()
     *
     * Downloads the markdown content as a file
     * @param {string} content - the markdown content to download
     */
    #downloadMarkdown(content) {
        const blob = new Blob([content], {type: 'text/markdown'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        link.download = `checklist-export-${this.exportId}.md`;
        link.href = url;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the URL object
        URL.revokeObjectURL(url);
    }

    /**
     * #buildCheckbox()
     *
     * builds a bootstrap checkbox
     * @param id - the id of the checkbox
     * @param checked - whether the checkbox is checked or not
     * @returns {HTMLElement}  the checkbox element
     */
    #buildCheckbox(id, checked = false) {
        const containerCheckbox = createElement('div', ['d-flex', 'align-items-center']);
        containerCheckbox.style.cssText = 'margin-left: 12px; margin-right: 15px; margin-bottom: 7px;';
        this.checkboxId = id;

        // create Bootstrap checkbox
        const checkbox = createElement('input', ['form-check-input', 'border-vscode-blue']);
        checkbox.type = 'checkbox';

        // enlarge safely while keeping layout intact
        checkbox.style.transform = 'scale(2.25)';
        checkbox.style.transformOrigin = 'center';
        checkbox.style.cursor = 'pointer';
        checkbox.style.boxShadow = 'none'; // removes Bootstrap's glow shadow

        checkbox.setAttribute('id', id);

        if (checked === true || checked === "true") {
            checkbox.setAttribute("checked", "checked");
        } else {
            checkbox.removeAttribute("checked");
        }

        // alter border (Bootstrap uses custom vars, so we override them inline)
        containerCheckbox.appendChild(checkbox);
        return containerCheckbox;
    }

    /**
     * #replaceCheckbox()
     *
     * replaces the current checkbox with a new one
     * @param id - the id of the new checkbox
     */
    #replaceCheckbox(id) {
        let currentCheckbox = document.getElementById(this.checkboxId).closest("div");
        let newCheckbox = this.#buildCheckbox(id, localStorage.getItem(id) === "true");

        // replace the checkbox
        currentCheckbox.replaceWith(newCheckbox);

        // update the checkboxId
        this.checkboxId = id;
    }


    /**
     * #buildSelectElement1()
     *
     * build the first select element
     */
    #buildSelectElement1() {
        // create the first select element and add an unique ID to it
        let selectElement_1 = createElement("select", ["form-select", "mb-1"]);
        let selectElement_1Id = Hashing.hashMD5(JSON.stringify(this.jsonChecklist)) + "-select-1";
        selectElement_1.setAttribute("id", selectElement_1Id);

        // first option element contents
        for (let i = 0; i < this.jsonChecklist.length; i++) {
            const chapter = this.jsonChecklist[i].chapter;
            const hashedChapter = Hashing.hashMD5(JSON.stringify(this.jsonChecklist[i].chapter));
            const savedChapter = localStorage.getItem(selectElement_1Id);

            // create a new option element for the select dropdown
            let option_1 = createElement("option", []);
            option_1.innerText = chapter;
            option_1.value = hashedChapter;

            // if the first chapter is selected, set it as selected
            if (i === 0) {
                option_1.setAttribute("selected", "selected");
            }
            if (hashedChapter === savedChapter) {
                option_1.setAttribute("selected", "selected");
            }

            selectElement_1.appendChild(option_1);
        }
        return selectElement_1;
    }

    /**
     * #SelectElement1EventListener()
     *
     * adds an event listener to the first select element
     */
    #SelectElement1EventListener() {
        document.getElementById(Hashing.hashMD5(JSON.stringify(this.jsonChecklist)) + "-select-1").addEventListener("change", (e) => {
            // get the current value of the select element 1
            let selectElement_1Id = Hashing.hashMD5(JSON.stringify(this.jsonChecklist)) + "-select-1";
            let selectElement_1 = document.getElementById(selectElement_1Id);

            // when the first select element is changed, update the second select element
            document.getElementById(this.checkboxId).closest("div").remove()
            let select2CheckboxContainer = this.#buildSelectElement2WithCheckbox(selectElement_1);
            document.getElementById(Hashing.hashMD5(JSON.stringify(this.jsonChecklist)) + "-select-2").replaceWith(select2CheckboxContainer);

            // get the selected title from the first select element
            this.#SelectElement2EventListener()

            // // dispatch a change event to the new select element
            dispatchChangeEvent(select2CheckboxContainer.querySelector("select"));
        });
    }

    /**
     * #buildSelectElement2WithCheckbox()
     *
     * builds the second select element based on the first select element's value
     */
    #buildSelectElement2WithCheckbox(selectElement_1) {
        // build the container element where the select element 2 + checkbox element reside in
        let containerElement = createElement("div", ["d-flex", "align-items-center", "w-100"]);
        let selectElement_2 = createElement("select", ["form-select", "mb-1", "w-100"]);
        let selectElement_2Id = Hashing.hashMD5(JSON.stringify(this.jsonChecklist)) + "-select-2";
        selectElement_2.setAttribute("id", selectElement_2Id);
        let checkbox = ""

        // first option element contents
        for (let i = 0; i < this.jsonChecklist.length; i++) {
            // const chapter = this.jsonChecklist[i].chapter;
            const hashedChapter = Hashing.hashMD5(JSON.stringify(this.jsonChecklist[i].chapter));
            const savedChapter = selectElement_1.value

            if (hashedChapter === savedChapter) {
                let checks = this.jsonChecklist[i].checks;

                // loop over the checks and create an option element for each check
                checks.forEach((check, index) => {
                    // create the option element
                    const savedTitle = localStorage.getItem(selectElement_2Id);
                    let option_2 = createElement("option", []);
                    let itemNumber = index + 1;

                    // set the option element's text and value
                    option_2.innerText = `${itemNumber}. ${check.title}`;
                    option_2.value = Hashing.hashMD5(JSON.stringify(check.title));

                    // if the first check is selected, set it as selected
                    selectElement_2.appendChild(option_2);

                    // if the index is 0, set the first option as selected
                    if (index === 0) {
                        option_2.setAttribute("selected", "selected");
                        checkbox = this.#buildCheckbox(Hashing.hashMD5(check.title) + "-checkbox");
                    }

                    // if the saved title matches the current check's title, set it as selected
                    if (savedTitle === Hashing.hashMD5(JSON.stringify(check.title))) {
                        // if the title is saved, set it as selected
                        option_2.setAttribute("selected", "selected");
                        checkbox = this.#buildCheckbox(Hashing.hashMD5(check.title) + "-checkbox");
                    }
                })
            }
        }

        containerElement.appendChild(checkbox);
        containerElement.appendChild(selectElement_2);

        return containerElement;
    }

    /**
     * #SelectElement2EventListener()
     *
     * adds an event listener to the second select element
     */
    #SelectElement2EventListener() {
        document.getElementById(Hashing.hashMD5(JSON.stringify(this.jsonChecklist)) + "-select-2").addEventListener("change", (e) => {
            let selectedTitle = document.getElementById(Hashing.hashMD5(JSON.stringify(this.jsonChecklist)) + "-select-2").value;
            this.#replaceCheckbox(Hashing.hashMD5(selectedTitle) + "-checkbox")
            this.#getCheckCode(selectedTitle)

            let codeElementContainer = this.#buildCodeElement(this.currentCheckCode);

            document.getElementById(Hashing.hashMD5(JSON.stringify(this.jsonChecklist)) + "-code-element-container").remove()
            document.getElementById(this.containerId).appendChild(codeElementContainer);
        });
    }

    /**
     * #getCheckCode()
     *
     * Retrieves the code for the selected check based on its title.
     * @param selectedTitleCheckCode
     */
    #getCheckCode(selectedTitleCheckCode) {
        this.jsonChecklist.forEach((chapterObject => {
            chapterObject.checks.forEach((check) => {
                if (selectedTitleCheckCode === Hashing.hashMD5(JSON.stringify(check.title))) {
                    // update the code element with the selected check's code
                    this.currentCheckCode = check.code;
                }
            });
        }));
    }

    /**
     * #buildCodeElement()
     *
     * Builds the code element for the selected check.
     * @param code
     * @returns {HTMLElement}
     */
    #buildCodeElement(code) {
        // Create a new code element with the same properties as the old one
        let codeElement = new CodeElement(Hashing.hashMD5(JSON.stringify(this.jsonChecklist)) + "-code-element", this.language, code, true, 5).buildCodeElement(false);
        codeElement.style.cssText = "max-height: 321px; min-height: 321px; overflow-y: scroll; width: 100%; ";

        let codeElementContainer = createElement("div", ["mt-1"]);
        codeElementContainer.setAttribute("id", Hashing.hashMD5(JSON.stringify(this.jsonChecklist)) + "-code-element-container");
        codeElementContainer.appendChild(codeElement);

        return codeElementContainer;
    }

    /**
     * #pentestParametersEventListener()
     *
     * if the pentest parameters get changed, update the code element with the new parameters
     */
    #pentestParametersEventListener() {
        document.getElementById(pentestParameterUpdateButtonId).addEventListener("click", () => {
            dispatchChangeEvent(document.getElementById(Hashing.hashMD5(JSON.stringify(this.jsonChecklist)) + "-select-2"));
        })
    }
}

