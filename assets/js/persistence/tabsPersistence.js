/**
 * initTabPersistence()
 *
 * This function is responsible for maintaining the active tab state across pages.
 * Once a tab or subtab has been clicked, it should hold track of where the user is, using local storage, on restart of the plugin
 */
function initTabPersistence() {
    // activate the first tab by default, if it isn't already set in local storage
    const LAYER_1_TAB = "layer_1_tab"
    const LAYER_2_TAB = "layer_2_tab"
    const LAYER_3_TAB = "layer_3_tab"

    const mainTab = localStorage.getItem(LAYER_1_TAB) === null ? "#tab1" : localStorage.getItem(LAYER_1_TAB);

    if (mainTab) {
        activateTab(mainTab);
    }

    // Add event listener to all main nav links
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(navLink => {
        navLink.addEventListener('click', function (event) {
            event.preventDefault();

            // Save the active main tab to local storage
            const targetHref = event.target.closest('a').getAttribute("href");
            console.log(targetHref)

            if (targetHref) {
                Object.keys(tabsByLayer).forEach(function (key) {

                    // layer 1
                    if (tabsByLayer[key].includes(targetHref) && key === "layer_1") {
                        localStorage.setItem(LAYER_1_TAB, targetHref);
                        localStorage.setItem(LAYER_2_TAB, null);
                        localStorage.setItem(LAYER_3_TAB, null);

                        removeActiveClassFromTabs(tabsByLayer["layer_1"]);
                        removeActiveClassFromTabs(tabsByLayer["layer_2"]);
                        removeActiveClassFromTabs(tabsByLayer["layer_3"]);

                        activateTab(targetHref);
                    }

                    // layer 2
                    else if (tabsByLayer[key].includes(targetHref) && key === "layer_2") {
                        localStorage.setItem(LAYER_2_TAB, targetHref);
                        localStorage.setItem(LAYER_3_TAB, null);

                        removeActiveClassFromTabs(tabsByLayer["layer_2"]);
                        removeActiveClassFromTabs(tabsByLayer["layer_3"]);

                        activateTab(targetHref);
                    }

                    // layer 3
                    else if (tabsByLayer[key].includes(targetHref) && key === "layer_3") {
                        localStorage.setItem(LAYER_3_TAB, targetHref);

                        removeActiveClassFromTabs(tabsByLayer["layer_3"]);

                        activateTab(targetHref);
                    }
                });
            }
        });
    });

    // set the layer 1 tab if possible
    if (localStorage.getItem(LAYER_1_TAB) !== null && tabsByLayer["layer_1"].includes(localStorage.getItem(LAYER_1_TAB))) {
        activateTab(localStorage.getItem(LAYER_1_TAB));
    }

    // set the layer 2 tab if possible
    if (localStorage.getItem(LAYER_2_TAB) !== null && tabsByLayer["layer_2"].includes(localStorage.getItem(LAYER_2_TAB))) {
        activateTab(localStorage.getItem(LAYER_2_TAB));
    }

    // set the layer 3 tab if possible
    if (localStorage.getItem(LAYER_3_TAB) !== null && tabsByLayer["layer_3"].includes(localStorage.getItem(LAYER_3_TAB))) {
        activateTab(localStorage.getItem(LAYER_3_TAB));
    }
}

/**
 * activateTab()
 *
 * Activate a tab by tabId
 * @param tabId
 */
function activateTab(tabId) {
    let tabElement = document.querySelector(`a[href="${tabId}"]`);

    if (tabElement) {
        const tab = new bootstrap.Tab(tabElement);
        tab.show();
        tabElement.classList.add('active', 'border-vscode-blue');
    }
}

/**
 *
 * @type {{layer_3: string[], layer_2: string[], layer_1: string[]}}
 */
/**
 * removeActiveClassFromTabs()
 *
 * Remove active classes from tabs by tabIds
 * @param tabIds
 */
function removeActiveClassFromTabs(tabIds) {
    tabIds.forEach(tabId => {
        let tabElement = document.querySelector(`a[href="${tabId}"]`);
        if (tabElement) {
            tabElement.classList.remove('active', 'border-vscode-blue');
        }
    });
}

/**
 * getTabsByLayer()
 *
 * Get all tabs sorted by layer
 * @returns {{layer_3: *[], layer_2: *[], layer_1: *[]}}
 */
function getTabsByLayer() {
    let tabs = {
        "layer_1": [],
        "layer_2": ["#pentest-parameters-AD-content", "#pentest-parameters-general-content"],
        "layer_3": []
    }

    Object.keys(tabsSorted).forEach(function (key) {
            // layer 1
            tabs["layer_1"].push(key);

            // layer 2
            Object.keys(tabsSorted[key]).forEach(function (subkey) {
                if (subkey.startsWith("#")) {
                    tabs["layer_2"].push(subkey);

                    // layer 3
                    Object.keys(tabsSorted[key][subkey]).forEach(function (subsubkey) {
                        if (subsubkey.startsWith("#")) {
                            tabs["layer_3"].push(subsubkey);
                        }
                    });
                }
            });
        }
    );

    return tabs;
}

/**
 * getTabsVsSorted()
 *
 * Get all tabs sorted for VirtualSelect
 * @returns {{options: *[]}}
 */
function getTabsVsSorted() {
    let tabs = {
        options: [],
    }

    Object.keys(tabsSorted).forEach(function (key) {

        // layer 2
        Object.keys(tabsSorted[key]).forEach(function (subkey) {
            if (subkey.startsWith("#")) {
                let l2_object = {
                    // label: tabsSorted[key][subkey]["name"],
                    value: subkey,
                    alias: tabsSorted[key][subkey]["name"],
                    customData: {     // ← store your extra data here
                        label: tabsSorted[key][subkey]["name"],
                        img_path: tabsSorted[key][subkey]["img_path"]
                    }
                }
                tabs["options"].push(l2_object);

                // layer 3
                Object.keys(tabsSorted[key][subkey]).forEach(function (subsubkey) {
                    if (subsubkey.startsWith("#")) {
                        let l3_object = {
                            // label: tabsSorted[key][subkey][subsubkey]["name"],
                            value: subsubkey,
                            alias: tabsSorted[key][subkey][subsubkey]["name"],
                            customData: {     // ← store your extra data here
                                label: tabsSorted[key][subkey][subsubkey]["name"],
                                img_path: tabsSorted[key][subkey][subsubkey]["img_path"],

                            }
                        }

                        // add the L3 object
                        tabs["options"].push(l3_object);

                        // filter out the L2 object, since this will instantly activate the first l3 element
                        tabs["options"] = tabs["options"].filter(item => item.value !== subkey);
                    }
                });
            }
        });
    });
    return tabs;
}

/**
 * lookupTabById()
 *
 * Lookup the tab structure by tab id
 * @param selectedTab
 * @returns {{layer_3: string, layer_2: string, layer_1: string}}
 */
function lookupTabById(selectedTab) {
    let selectedTabStructure = {
        layer_1: "",
        layer_2: "",
        layer_3: ""
    }

    // lookup the tab structure based on the layer
    Object.keys(tabsSorted).forEach(function (key) {
        Object.keys(tabsSorted[key]).forEach(function (subkey) {
            if (subkey === selectedTab) {
                selectedTabStructure.layer_1 = key
                selectedTabStructure.layer_2 = subkey
            }

            Object.keys(tabsSorted[key][subkey]).forEach(function (subsubkey) {
                if (subsubkey === selectedTab) {
                    selectedTabStructure.layer_1 = key
                    selectedTabStructure.layer_2 = subkey
                    selectedTabStructure.layer_3 = subsubkey
                }
            })
        })
    })

    return selectedTabStructure
}

// Define the tabs for each layer
const tabsSorted = {
    "#tab1": {
        "name": "General Tooling",
        // subtabs

        "#encode_decode": {
            "name": "Encode / Decode",
            "img_path": "assets/icons/navbar/tab-1-gen-tooling/encode_decode.png"
        },
        "#hashing": {
            "name": "Hashing",
            "img_path": "assets/icons/navbar/tab-1-gen-tooling/hashing.png"
        },
        "#formatter": {
            "name": "Code formatter",
            "img_path": "assets/icons/navbar/tab-1-gen-tooling/formatter.png"
        },
        "#general-tooling-code-highlighter-content": {
            "name": "Code highlighter",
            "img_path": "assets/icons/navbar/tab-1-gen-tooling/code-highlighting.png"
        },
        "#general-tooling-code-obfuscation-content": {
            "name": "Code obfuscation",
            "img_path": "assets/icons/navbar/tab-1-gen-tooling/code-obfuscation.png"
        }
    },
    "#tab2": {
        "name": "Enumeration Tooling",
        // subtabs

        "#enum-tooling-spider": {
            "name": "Website spider",
            "img_path": "assets/icons/navbar/tab-2-enum-tooling/spider.png"
        },
        "#enum-tooling-toolbox": {
            "name": "Website enumeration toolbox",
            "img_path": "assets/icons/navbar/tab-2-enum-tooling/toolbox.png"
        },
        "#enum-tooling-iframe-checker": {
            "name": "iFrame Checker",
            "img_path": "assets/icons/navbar/tab-2-enum-tooling/frame.png"
        },
        "#enum-tooling-google-dork-content": {
            "name": "Google Dorking",
            "img_path": "assets/icons/navbar/tab-2-enum-tooling/google-dork.png"
        },
        "#enum-tooling-monitor": {
            "name": "Website monitoring",
            "img_path": "assets/icons/navbar/tab-2-enum-tooling/monitoring/monitor.png",

            "#enum-tooling-cookie-monitor-tab": {
                "name": "Cookie Monitor",
                "img_path": "assets/icons/navbar/tab-2-enum-tooling/subtab-5-monitor/cookie-monitor.png"
            },
            "#enum-tooling-postmessage-monitor-tab": {
                "name": "PostMessage Monitor",
                "img_path": "assets/icons/navbar/tab-2-enum-tooling/subtab-5-monitor/postmessage-monitor.png"
            },
        },

    },
    "#tab3": {
        "name": "Exploit Assistant",
        // subtabs
        "#exploit-assistant-sql-injection": {
            "name": "SQL Injection",
            "img_path": "assets/icons/navbar/tab-3-exploit-assistant/sql-injection.png",

            "#exploit-assistant-sqli-payloads-tab": {
                "name": "SQLi Payloads",
                "img_path": "assets/icons/navbar/tab-3-exploit-assistant/payload.png"
            },
            "#exploit-assistant-sqli-cheat-sheet-tab": {
                "name": "SQLi Cheat Sheet",
                "img_path": "assets/icons/navbar/tab-3-exploit-assistant/cheat-sheet.png"
            },

        },
        "#exploit-assistant-xss": {
            "name": "Cross-Site Scripting (XSS)",
            "img_path": "assets/icons/navbar/tab-3-exploit-assistant/xss.png",

            "#exploit-assistant-xss-cheat-sheet-tab": {
                "name": "XSS Cheat Sheet",
                "img_path": "assets/icons/navbar/tab-3-exploit-assistant/cheat-sheet.png"
            },
            "#exploit-assistant-xss-payloads-tab": {
                "name": "XSS Payloads",
                "img_path": "assets/icons/navbar/tab-3-exploit-assistant/payload.png"
            },
        },
        "#exploit-assistant-command-injection-fi": {
            "name": "Command Injection",
            "img_path": "assets/icons/navbar/tab-3-exploit-assistant/command-injection-fi.png",

            "#exploit-assistant-command-injection-fi-cheat-sheet-tab": {
                "name": "Command Injection Cheat Sheet",
                "img_path": "assets/icons/navbar/tab-3-exploit-assistant/cheat-sheet.png"
            },

        },
        "#exploit-assistant-forgery-checker": {
            "name": "Forgery assistant",
            "img_path": "assets/icons/navbar/tab-3-exploit-assistant/forgery.png",

            "#exploit-assistant-forgery-checker-ssrf-cheat-sheet-tab": {
                "name": "SSRF Cheat Sheet",
                "img_path": "assets/icons/navbar/tab-3-exploit-assistant/cheat-sheet.png"

            },

        },
        "#exploit-assistant-file-upload": {
            "name": "File Upload",
            "img_path": "assets/icons/navbar/tab-3-exploit-assistant/file-upload.png",

            "#exploit-assistant-file-upload-cheat-sheet-tab": {
                "name": "File Upload Cheat Sheet",
                "img_path": "assets/icons/navbar/tab-3-exploit-assistant/cheat-sheet.png"
            },
        },
    },
    "#tab4": {
        "name": "Shell Assistant",
        // subtabs
        "#shell-assistant-reverse-shells": {
            "name": "Reverse Shells",
            "img_path": "assets/icons/navbar/tab-4-shell-assistant/reverse-shell.png"
        },
        "#shell-assistant-bind-shells": {
            "name": "Bind Shells",
            "img_path": "assets/icons/navbar/tab-4-shell-assistant/bind-shell.png"
        },
        "#shell-assistant-transfer-methods": {
            "name": "File Transfer Methods",
            "img_path": "assets/icons/navbar/tab-4-shell-assistant/transfer-methods.png"
        }


    },
    "#tab5": {
        "name": "Checklist Assistant",
        // subtabs
        "#checklist-assistant-web-checklist": {
            "name": "Web Application Checklist",
            "img_path": "assets/icons/navbar/tab-5-checklist-assistant/general/protocols-general.png",

            "#checklist-assistant-protocol-general-check-content": {
                "name": "Checklist by Protocol",
                "img_path": "assets/icons/navbar/tab-5-checklist-assistant/protocols/protocols-checklist.png"
            },

            "#checklist-assistant-web-api-check-content": {
                "name": "API Checklist",
                "img_path": "assets/icons/navbar/tab-5-checklist-assistant/protocols/web-pentest-api.png"
            },
            "#checklist-assistant-web-general-check-content": {
                "name": "Web general Checklist",
                "img_path": "assets/icons/navbar/tab-5-checklist-assistant/protocols/web-pentest-general.png"
            },
        },
        "#checklist-assistant-linux-os-checklist": {
            "name": "Linux OS Checklist",
            "img_path": "assets/icons/navbar/tab-5-checklist-assistant/linux.png",

            "#checklist-assistant-linux-privesc-content": {
                "name": "Linux Privilege Escalation",
                "img_path": "assets/icons/navbar/tab-5-checklist-assistant/privesc.png"
            },
        },
        "#checklist-assistant-windows-os-checklist": {
            "name": "Windows OS Checklist",
            "img_path": "assets/icons/navbar/tab-5-checklist-assistant/windows.png",

            "#checklist-assistant-windows-privesc-content": {
                "name": "Windows privilege escalation checklist",
                "img_path": "assets/icons/navbar/tab-5-checklist-assistant/privesc.png"
            },

            "#checklist-assistant-windows-ad-content": {
                "name": "Windows Active Directory checklist",
                "img_path": "assets/icons/navbar/tab-5-checklist-assistant/windows/AD.png"
            },

            "#checklist-assistant-windows-post-exploitation-content": {
                "name": "Windows post-exploitation checklist",
                "img_path": "assets/icons/navbar/tab-5-checklist-assistant/windows/windows-post-exploitation.png"
            },
        },
        "#checklist-assistant-osint-checklist": {
            "name": "OSINT Checklist",
            "img_path": "assets/icons/navbar/tab-5-checklist-assistant/osint.png",

            "#checklist-assistant-osint-check-content": {
                "name": "OSINT General Checklist",
                "img_path": "assets/icons/navbar/tab-5-checklist-assistant/osint/web.png"
            },
            "#checklist-assistant-osint-dark-web-check-content": {
                "name": "Dark Web Checklist",
                "img_path": "assets/icons/navbar/tab-5-checklist-assistant/osint/dark-web.png"
            }
        },
        "#checklist-assistant-stuck-checklist": {
            "name": "I'm stuck Checklist",
            "img_path": "assets/icons/navbar/tab-5-checklist-assistant/stuck.png",

            "#checklist-assistant-stuck-content": {
                "name": "general 'I'm stuck' checklist",
                "img_path": "assets/icons/navbar/tab-5-checklist-assistant/stuck.png"
            },
        }
    },
    "#tab6":
        {
            "name":
                "Useful Commands & Tools",
            // subtabs

            "#useful-commands-linux-vs-windows-content":
                {
                    "name":
                        "Linux vs Windows Commands",
                    "img_path":
                        "assets/icons/navbar/tab-6-useful-commands/linux-vs-windows.png"
                }
            ,

            "#useful-commands-adds-techniques-content":
                {
                    "name":
                        "ADDS Techniques",
                    "img_path":
                        "assets/icons/navbar/tab-6-useful-commands/AD-techniques.png"
                }
            ,

            "#useful-commands-adds-content":
                {
                    "name":
                        "ADDS Commands",
                    "img_path":
                        "assets/icons/navbar/tab-6-useful-commands/AD.png"
                }
            ,

            "#useful-tools-pentesting-content":
                {
                    "name":
                        "Pentesting Tools",
                    "img_path":
                        "assets/icons/navbar/tab-6-useful-commands/pentest-tools.png"
                }
            ,

            "#useful-commands-command-converter-content":
                {
                    "name":
                        "Command Converter",
                    "img_path":
                        "assets/icons/navbar/tab-6-useful-commands/command-converter.png"
                }


        }
    ,
    "#tab7":
        {
            "name": "Resources",
            // subtabs
            "#resources-tab":
                {
                    "name": "Resources Overview",
                    "img_path": "assets/icons/navbar/tab-7-resources/tab-7-resources.png"

                }
        }
    ,
}
const tabsByLayer = getTabsByLayer();