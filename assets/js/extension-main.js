document.addEventListener('DOMContentLoaded', () => {

    // highlight all code elements if it is possible (those that do not require an event listener)
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll("pre code").forEach((block) => {
            hljs.highlightElement(block);
            hljs.lineNumbersBlock(block);
        });
    });

    // initialize the pentest parameters single select elements
    initPentestParametersMultiple()

    // init the virtual select elements
    initVirtualSelect();

    // init the event listeners
    initEventListeners([
        initReplaceHoverApp,
        initTabPersistence,
        initCopyContentByClass,
        initResetContentByClass,
        initRefreshControl,
        initApplyPentestParameters,
    ]);

    // init the message manager (global)
    sendMessageManager();
    recieveMessageManager();

    // init/build the content for the shell assistant tabs (reverse, bind, transfer)
    initShellAssistantContent();

    // init checklist assistant content
    initChecklistAssistantContent();

    // init usefull command list content
    initUsefulCommandListContent();

    // init the resources list
    initResourcesList();

    // make all tables sortable
    initTableSortable();

    // search functionality for tables
    searchTable("search-resource-input", "resources-table");

    // manage the state of all accordions
    initAccordionPersistence();

    // init/build the persistDataMonitor
    initPersistDataMonitor();

    // add bootstrap tooltip
    initTooltip()

    // init the active modal if there is anything saved
    initModalPersistence();
});

