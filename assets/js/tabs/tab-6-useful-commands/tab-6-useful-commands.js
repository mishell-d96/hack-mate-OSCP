/**
 * initUsefulCommandListContent()
 */
var usefullCommandList = {}

// stores all the commands for the searchbar
var usefullCommandsSearchList = []

function initUsefulCommandListContent() {
    new UsefulCommandList(usefullCommandList.linux_vs_windows, "list-useful-commands-linux-vs-windows").buildUsefulCommandList(true)
    new UsefulCommandList(usefullCommandList.adds, "list-useful-commands-adds").buildUsefulCommandList(false)
    new UsefulCommandList(usefullCommandList.pentest_tools, "list-useful-tools-pentesting").buildUsefulCommandList(false)
    new UsefulCommandList(usefullCommandList.ad_techniques, "list-useful-ad-techniques").buildUsefulCommandList(false)

    // build the search list
    addUsefullCommandsSearchListEventListener(usefullCommandsSearchList)
    UC_buildSyncTimeWithDcExplanationModal()
    UC_commandConverterEventListener()
}

/**
 * UC_buildSyncTimeWithDcExplanationModal()
 *
 * build a modal that explains on how to temporary sync your time to the domain controller
 */
function UC_buildSyncTimeWithDcExplanationModal() {
    const elements = document.querySelectorAll(".useful-command-sync-time-explanation");

    elements.forEach(element => {
        let syncTimeExplanationCodeElementClass = new CodeElement('useful-command-sync-time-explanation-code-element', "language-bash", `##### Synchronize time utilizing 'rdate' and 'faketime' #####
faketime "$(rdate -n {{RHOST}} -p | awk '{print $2, $3, $4}' | date -f - "+%Y-%m-%d %H:%M:%S")" zsh
        
##### Synchronize time utilizing 'ntpdate' and 'timedatectl' #####
# 1. Disable automatic time synchronization to allow manual adjustments
timedatectl set-ntp 0

# 2. Manually sync time with the domain controller
timedatectl set-time "$( ntpdate -q {{DOMAIN}}.{{ROOTDNS}} | awk '{print $1,$2}' | cut -d'.' -f1 )"

# 3. Re-enable automatic time synchronization for long-term accuracy
timedatectl set-ntp 1
`)
        let syncTimeExplanationCodeElement = syncTimeExplanationCodeElementClass.buildCodeElement();
        syncTimeExplanationCodeElementClass.applyCustomEventListener();

        let modalButton = new Modal('useful-command-sync-time-explanation', 'assets/icons/navbar/tab-6-useful-commands/sync-time.png', 'assets/icons/navbar/tab-6-useful-commands/sync-time-hover.png', '22', '22', 'Synchronize your time to a domain controllers time').buildModal(syncTimeExplanationCodeElement);
        element.appendChild(modalButton);
    });
}

/**
 * UC_commandConverterEventListener()
 *
 * Event listener for the command converter input field
 * @constructor
 */
function UC_commandConverterEventListener() {
    let input = document.getElementById("useful-commands-command-converter-input");
    let output = document.getElementById("useful-commands-command-converter-output");
    let pentestParameterApplyButton = document.getElementById(pentestParameterUpdateButtonId);

    // add an event listener for updating the output field
    input.addEventListener("input", updateCommandConverterOutput)
    pentestParameterApplyButton.addEventListener("click", updateCommandConverterOutput)

    function updateCommandConverterOutput() {
        let inputValue = input.value
        let outputValue = ""

        // loop over the pentestParameters map
        Object.entries(pentestParameters).forEach(([id, placeholder]) => {
            if (outputValue !== "") {
                outputValue = outputValue.replaceAll(placeholder, (localStorage.getItem(id) === "" ? placeholder : localStorage.getItem(id)));
            } else {
                outputValue = inputValue.replaceAll(placeholder, (localStorage.getItem(id) === "" ? placeholder : localStorage.getItem(id)));
            }
        });

        output.value = outputValue;
    }

    setTimeout(function () {
        dispatchInputEvent(input);
    }, 50)
}

/**
 * addUsefullCommandsSearchListEventListener()
 *
 * Add event listener to the useful commands search input field, so that it filters the commands and shows the results in a dropdown
 *
 * @param commandsSearchList
 */
function addUsefullCommandsSearchListEventListener(commandsSearchList) {
    let optionsArray = [];

    // Generate options for VirtualSelect
    commandsSearchList.forEach(item => {
        optionsArray.push({
            // label: item.command,
            value: item.modalId,
            alias: item.command,
            customData: {     // ← store your extra data here
                type: item.type,
                command: item.command
            }
        });
    });

    // Init Virtual Select with image renderer
    VirtualSelect.init({
        ele: "#useful-commands-search-input",
        options: optionsArray,
        search: true,
        additionalClasses: 'rounded',
        labelRenderer: imageRendererUsefulCommands,
        selectedLabelRenderer: imageRendererUsefulCommands,
        placeholder: `Search through ${commandsSearchList.length}-ish tools, techniques and more`,
    });

    function imageRendererUsefulCommands(data) {
        let prefix = '';

        if (!data.isCurrentNew && !data.isNew) {

            const type = data.customData?.type?.toLowerCase();
            const command = data.customData?.command?.toLowerCase();

            let imgSrc = "";
            if (type === "pentest") {
                imgSrc = "assets/icons/general/coloured/tools-coloured.png";
            } else if (type === "windows") {
                imgSrc = "assets/icons/general/coloured/windows-coloured.png";
            } else if (type === "linux") {
                imgSrc = "assets/icons/general/coloured/linux-coloured.png";
            }

            // check if a command can be splitted using #
            let commandSplit1 = command.split('#')[0];
            let commandSplit2 = command.split('#')[1] === undefined ? "" : "# " + command.split('#')[1];

            if (imgSrc) {
                // Create a temporary container to parse the HTML string
                const tempContainer = document.createElement('div');
                tempContainer.innerHTML = `
                    <div class="d-flex align-items-center">
                        <img src="${imgSrc}" style="width:20px;height:20px;">
                        <span class="ms-2 me-2">${commandSplit1}</span>
                        <code class="m-0 p-0 bg-transparent text-white language-bash">${commandSplit2}</code>
                    </div>
                `;

                // Get the code element and highlight it
                const codeElement = tempContainer.querySelector('code');
                hljs.highlightElement(codeElement);

                // Get the complete prefix (now with highlighted code)
                prefix = tempContainer.innerHTML;
            }
        }

        return `${prefix}${data.label}`;
    }

    document.getElementById("useful-commands-search-input")
        .addEventListener('change', function (e) {
            const selectedModalId = e.target.value;
            const modalElement = document.getElementById(selectedModalId);

            if (modalElement) {
                new bootstrap.Modal(modalElement).show();
            }
        });
}
