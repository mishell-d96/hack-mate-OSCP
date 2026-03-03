// the extension-message-manager.js file is used to handle all the events that are global to the extension
// it works close together with: extension-main.js, background.js and the content scripts
let currentTab = null;
let currentDomain = null;

let loaderElementIds = ["enum-tooling-spider-start-button", "enum-tooling-extract-headers"]
let totalScriptsProcessing = 0;

// async event listener for the document to load, sets current domain and/or tab based on the
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Query the active tab in the current window
        const [tab] = await browser.tabs.query({active: true, currentWindow: true});

        // Create a new URL object from the tab's URL
        currentTab = new URL(tab.url);
        currentDomain = currentTab.hostname;  // Extract the hostname (domain)
        browser.runtime.sendMessage({command: "background-ping"});

        // Adjust the tab URL display
        document.querySelectorAll(".current-tab-url").forEach(function (element) {
            // Set the innerText of each element to the current URL as a string
            element.innerText = currentTab.href; // .href gives the full URL
        });

        document.querySelectorAll(".current-domain-url").forEach(function (element) {
            // Set the innerText of each element to the current URL as a string
            element.innerText = currentDomain; // .href gives the full URL
        });
    } catch (error) {
        console.error('Error querying active tab:', error);
    }
});

/**
 * initEventListeners()
 *
 * initializes all the event listeners - see extension-main.js
 */
function initEventListeners(methods) {
    methods.forEach(method => {
        method();
    });
}

/**
 * loaderCheck()
 *
 * checks if the loader element should be shown or should be hidden, based on the total scripts that are being processed.
 *
 * @param currentId
 * @param incrementTotalScriptsProcessing
 */
function loaderCheck(currentId, incrementTotalScriptsProcessing) {
    // loader element and see if there is a match
    let loaderElement = document.getElementById("loader")
    let match = loaderElementIds.includes(currentId)

    // decrement the total scripts processing | loader icon will hide if it reaches 0
    if (incrementTotalScriptsProcessing === false && match) {
        if (totalScriptsProcessing > 0) {
            totalScriptsProcessing -= 1;
            if (totalScriptsProcessing === 0) {
                loaderElement.classList.add("d-none")
            }
        }

        // increment the total scripts processing | loader icon will show if totalScriptsProcessing is >  0
    } else if (incrementTotalScriptsProcessing === true && match) {
        if (totalScriptsProcessing >= 0) {
            totalScriptsProcessing += 1
            loaderElement.classList.remove("d-none")
        }
    }
}

/**
 * sendMessageManager()
 *
 * Initialize the 'send' message manager for the extension
 */
function sendMessageManager() {
    // IDs of buttons to set event listeners on
    let browserRuntimeActionIdsClick = [
        // enum tooling start
        "enum-tooling-spider-start-button",
        "enum-tooling-highlight-forms-cp",
        "enum-tooling-highlight-inputs-cp",
        "enum-tooling-extract-comments-cp",
        "enum-tooling-extract-forms-cp",
        "enum-tooling-extract-url-cp",
        "enum-tooling-extract-headers",
        "enum-tooling-iframe-get-current-url",
        "enum-tooling-view-hidden-input",

        // exploit assistant start
        // "exploit-assistant-csrf-checker-load-form",
        // "exploit-assistant-xss-get-current-url",
        // "exploit-assistant-xss-execute"
    ];

    let browserRuntimeActionIdsOnInput = [
        "general-tooling-code-obfuscation-input",
    ]

    // Set event listeners for all enum-tooling on the toolbox page
    browserRuntimeActionIdsClick.forEach(id => {
        let tmpElement = document.getElementById(id);
        if (tmpElement) {
            tmpElement.addEventListener('click', () => {
                let messageValue = tmpElement.value
                console.log(messageValue)
                let messageData = tmpElement.hasAttribute("data-message-data") ? tmpElement.getAttribute("data-message-data") : "";
                browser.runtime.sendMessage({command: messageValue, id: id, messageData: messageData});

                // these are scripts that take longer to process, e.g. spidering a website, if so, the loading icon appears on the left bottom side
                loaderCheck(id, true)
            });
        }
    });
    browserRuntimeActionIdsOnInput.forEach(id => {
        let tmpElement = document.getElementById(id);

        if (tmpElement) {
            let targetSelect = document.getElementById(tmpElement.getAttribute("data-target-select"));
            let command = tmpElement.getAttribute("data-runtime-command");

            tmpElement.addEventListener('input', () => {
                browser.runtime.sendMessage({
                    command: command,
                    id: id,
                    value: tmpElement.value,
                    targetSelectValue: targetSelect.value
                });
                loaderCheck(id, true)
            });

            targetSelect.addEventListener("change", () => {
                browser.runtime.sendMessage({
                    command: command,
                    id: id,
                    value: tmpElement.value,
                    targetSelectValue: targetSelect.value
                });
                loaderCheck(id, true)
            })
        }
    });
}

/**
 * sendMessageManager()
 *
 * Initialize the 'receive' message manager for the extension
 */
function recieveMessageManager() {
    // Listen for messages from the background script
    browser.runtime.onMessage.addListener(async (message) => {

        // GENERAL SECTION START //
        loaderCheck(message.id, false);

        if (message.hasOwnProperty("currentUrlPath")) {
            let iframeCurrentUrlPath = document.getElementById("enum-tooling-iframe-url-input")
            iframeCurrentUrlPath.innerText = message.currentUrlPath;
            iframeCurrentUrlPath.value = message.currentUrlPath

            let xssCurrentUrlPath = document.getElementById("exploit-assistant-xss-target-url")
            xssCurrentUrlPath.innerText = message.currentUrlPath;
            xssCurrentUrlPath.value = message.currentUrlPath;

            dispatchInputEvent(iframeCurrentUrlPath);
            dispatchInputEvent(xssCurrentUrlPath);
        }
        // GENERAL SECTION END

        // ## TAB 1 'general tooling' START ## //
        if (message.hasOwnProperty("obfuscatedCode")) {
            let outputCodeElement = document.getElementById("general-tooling-code-obfuscation-output-code");

            outputCodeElement.value = message.obfuscatedCode;
            outputCodeElement.innerText = message.obfuscatedCode;

            saveElementToLocalStorage(outputCodeElement.id, outputCodeElement.value)
        }
        // ## TAB 1 'general tooling' END ## //

        // ## TAB 2 'enum tooling' START ## //
        if (message.hasOwnProperty("enumSpider")) {
            if (Formatter.isValidJSON(message.enumSpider)) {
                let simplified = JSON.stringify(JSON.parse(message.enumSpider).simpleTree)
                let detailed = JSON.stringify(JSON.parse(message.enumSpider).siteTree)
                let enumToolingSpiderOutput = document.getElementById("enum-tooling-spider-output-textarea");

                document.getElementById("enum-tooling-spider-simplified-view").value = Formatter.formatJSON(simplified);
                document.getElementById("enum-tooling-spider-detailed-view").value = Formatter.formatJSON(detailed);

                enumToolingSpiderOutput.innerText = Formatter.formatJSON(simplified)
                enumToolingSpiderOutput.value = Formatter.formatJSON(simplified)

                dispatchInputEvent(enumToolingSpiderOutput)
            }
        }

        if (message.hasOwnProperty("toolboxJson")) {
            if (Formatter.isValidJSON(message.toolboxJson)) {
                let enumToolingToolBoxJsonTextArea = document.getElementById("enum-tooling-output-textarea");

                enumToolingToolBoxJsonTextArea.innerText = Formatter.formatJSON(message.toolboxJson);
                enumToolingToolBoxJsonTextArea.value = Formatter.formatJSON(message.toolboxJson);

                dispatchInputEvent(enumToolingToolBoxJsonTextArea)
            }
        }

        if (message.hasOwnProperty("postMessage")) {
            renderEventFeed(
                message.postMessage[currentTab?.href],
                "postmessage-monitor-table-table-body",
                "enum-tooling-postmessage-monitor-count",
                EventFeedConfig.postMessage
            );
        }

        if (message.hasOwnProperty("cookieChange")) {
            renderEventFeed(
                message.cookieChange[currentDomain],
                "cookie-monitor-table-table-body",
                "enum-tooling-cookie-monitor-count",
                EventFeedConfig.cookie
            );
        }

        // ## TAB 2 'enum tooling' END ## //

        // ## TAB 3 'exploit assistant' END ## //
        // ## TAB 3 'exploit assistant' END ## //

        // ## TAB 4 'shell assistant' START ## //
        // ## TAB 4 'shell assistant' END ## //

        // ## TAB 5 'checklist assistant' START ## //
        // ## TAB 5 'checklist assistant' END ## //

        // ## TAB 6 'useful commands' START ## //
        // ## TAB 6 'useful commands' END ## //

    });
}











