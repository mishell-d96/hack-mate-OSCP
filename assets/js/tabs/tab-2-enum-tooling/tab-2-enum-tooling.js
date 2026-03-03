document.addEventListener("DOMContentLoaded", function () {

    // build the spider tab
    ET_buildSpider()

    // build the iframe checker tab
    ET_buildIframeChecker();

    // build the googledork tab
    ET_buildGoogleDorkExplanationModal();
    ET_googleDorkQueryBuilder();
});

function ET_buildSpider() {
    // SPIDER tab
    const spiderSimplifiedButton = document.getElementById("enum-tooling-spider-simplified-view");
    const spiderDetailedButton = document.getElementById("enum-tooling-spider-detailed-view");
    const spiderOutputArea = document.getElementById("enum-tooling-spider-output-textarea");

    spiderSimplifiedButton.addEventListener("click", () => {
        spiderOutputArea.value = spiderSimplifiedButton.value;
    });

    spiderDetailedButton.addEventListener("click", () => {
        spiderOutputArea.value = spiderDetailedButton.value;
    });
}

function ET_buildIframeChecker() {
    const checkIframeButton = document.getElementById("enum-tooling-iframe-check-iframe-button");
    const iframeInputUrl = document.getElementById("enum-tooling-iframe-url-input");
    const iframeElement = document.getElementById("enum-tooling-iframe-check-iframe-element");

    checkIframeButton.addEventListener("click", () => {
        iframeElement.src = iframeInputUrl.value;
    });
}

/**
 * ET_buildGoogleDorkExplanationModal()
 *
 * build a modal with a list of google dorks and their explanations
 */
function ET_buildGoogleDorkExplanationModal() {
    const elements = document.querySelectorAll(".enum-tooling-google-dork-explanation");

    elements.forEach(element => {
        let codeClassGoogleDork = new CodeElement('enum-tooling-google-dork-explanation-code-element', "language-bash", `# Google Dork Parameters Explanation
# for more advanced google dorks - checkout: https://dorksearch.com/

# 1. site: - Restricts search results to a specific website
# Finds all pages indexed by example.com
site:example.com
       
# 2. inurl: - Searches for a specified term within the URL of a page
# Finds pages with "login" in the URL
inurl:login

# 3. intitle: - Searches for pages with specified terms in the title
# Finds directory listings
intitle:"index of"

# 4. filetype: - Searches for specific file types
# Finds PDF files containing "confidential"
filetype:pdf "confidential"

# 5. ext: - Similar to filetype, searches for specific file extensions
# Finds PHP files
ext:php

# 6. link: - Finds pages that link to a specified URL
# Finds pages linking to example.com
link:example.com

# 7. cache: - Shows Google's cached version of a specific page
# Shows Google's cached version of the NY Times homepage
cache:nytimes.com

# 8. allintext: - Searches for pages containing all the specified 
# terms in the text
# Finds pages with both "username" and "password"
allintext: username password

# 9. allinurl: - Finds pages with all the specified terms in the URL
# Finds .gov URLs containing both "gov" and "research"
allinurl:gov research

# 10. related: - Finds pages that are related to a specified URL
# Finds sites similar to GitHub
related:github.com
`);
        let codeElementGoogleDork = codeClassGoogleDork.buildCodeElement();
        codeClassGoogleDork.applyCustomEventListener();

        let modalButton = new Modal('enum-tooling-google-dork-explanation', 'assets/icons/navbar/tab-2-enum-tooling/subtab-4-google-dork/google-dork-modal.png', 'assets/icons/navbar/tab-2-enum-tooling/subtab-4-google-dork/google-dork-modal-hover.png', '22', '22', 'Google Dork queries & explanations').buildModal(codeElementGoogleDork);
        element.appendChild(modalButton);
    });
}

/**
 * ET_googleDorkQueryBuilder()
 *
 * function to build a google dork query from the input fields
 */
function ET_googleDorkQueryBuilder() {
    // save the variables of the in, output and the parameters select element
    let parametersSelect = document.getElementById("enum-tooling-google-dork-select-parameters");
    let queryOutput = document.getElementById("enum-tooling-google-dork-output-textarea");
    let modalBody = document.getElementById("enum-tooling-google-dork-parameters").querySelector(".modal-body");
    modalBody.classList.add("p-2")

    // parameter and the description
    const parametersRequiringInput = {
        "site:": {explanation: "Restricts results to those from a specific website or domain", example: "example.com"},
        "inurl:": {explanation: "Searches for a specified term within the URL of a page", example: "login"},
        "intitle:": {explanation: "Searches for pages with specified terms in the title", example: "login"},
        "filetype:": {explanation: "Searches for specific file types", example: "pdf"},
        "ext:": {explanation: "Similar to filetype, searches for specific file extensions", example: "php"},
        "link:": {explanation: "Finds pages that link to a specified URL", example: "example.com"},
        "cache:": {explanation: "Shows Google's cached version of a specific page", example: "example.com"},
        "allintext:": {
            explanation: "Searches for pages containing all the specified terms in the text",
            example: "username password"
        },
        "allinurl:": {explanation: "Finds pages with all the specified terms in the URL", example: "gov research"},
        "related:": {explanation: "Finds pages that are related to a specified URL", example: "example.com"},
    };

    // add an event listener for the multiselect options
    parametersSelect.addEventListener("change", function () {
        // reset the modal body 
        modalBody.innerHTML = "";

        // append the appropriate textArea's fields
        parametersSelect.value.forEach((element, index) => {
            if (parametersRequiringInput.hasOwnProperty(element)) {
                const tmpTextAreaContainer = new TextArea(`google-dork-query-parameter-${element}`, 1).buildTextArea();
                tmpTextAreaContainer.classList.add("mb-1");
                tmpTextAreaContainer.querySelector("textarea").setAttribute("data-google-dork-parameter", element);
                tmpTextAreaContainer.querySelector("textarea").setAttribute("placeholder", parametersRequiringInput[element]["example"]);

                const span = createElement("span", []);
                span.innerHTML = `${index + 1}. ${element}<br><small>${parametersRequiringInput[element]["explanation"]}</small>`;

                modalBody.appendChild(span);
                modalBody.appendChild(tmpTextAreaContainer);
            }
        });

        updateTextFields();
    })

    /**
     * updateTextFields()
     *
     * updates all the text fields in the modal
     */
    function updateTextFields() {
        // retrieve the value from the textarea output
        let modalBodyTextAreas = modalBody.querySelectorAll("textarea");
        let outputTextAreaValue = queryOutput.value;

        // check if there is indeed a value
        if (outputTextAreaValue.length > 0) {
            let splittedValues = outputTextAreaValue.split(" ");
            if (splittedValues.length > 0) {
                modalBodyTextAreas.forEach((element, index) => {
                    splittedValues.forEach((element2, index2) => {
                        if (element2.includes(element.getAttribute("data-google-dork-parameter"))) {
                            element.value = element2.split(":")[1];
                        }
                    })
                })
            }
        }
        updateOutputField();
    }

    function updateOutputField() {
        let modalBodyTextAreas = modalBody.querySelectorAll("textarea");
        let elements = {};

        modalBodyTextAreas.forEach((element) => {
            element.addEventListener("input", function () {
                elements[element.getAttribute("data-google-dork-parameter")] = element.value;
                updateQueryString();
            });
            elements[element.getAttribute("data-google-dork-parameter")] = element.value;
        });

        function updateQueryString() {
            let queryString = Object.keys(elements).map(key => `${key}${elements[key]}`).join(' ');
            queryOutput.value = queryString.trim();
        }
    }
}