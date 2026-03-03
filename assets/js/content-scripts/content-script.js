// script that gets injected in the specified urls (manifest.json)
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    // if there is no valid command message, return it.
    if (message.command === undefined) {
        return
    }

    // switch statement on the command
    switch (message.command) {
        // ## GENERAL START ## //
        case "harlem":
            harlemShake()
            break;

        case "rewrite":
            startRandomTypewriterEffect(1)
            break;

        case "getCurrentUrl":
            let currentUrlPath = location.href;
            browser.runtime.sendMessage({currentUrlPath: currentUrlPath, id: message.id});
            break;

        // ## GENERAL START ## //
        // ## TAB 1 'general tooling' START ## //
        case "obfuscateJavascript":
            if (message.hasOwnProperty("targetSelectValue") && message.hasOwnProperty("value")) {
                switch (message.targetSelectValue) {
                    case "js-obfuscate-obfuscator-io":
                        browser.runtime.sendMessage({
                            obfuscatedCode: JavaScriptObfuscator.obfuscate(message.value).getObfuscatedCode(),
                            id: message.id
                        });
                        break;

                    case "js-obfuscate-minimal-chars":
                        browser.runtime.sendMessage({
                            obfuscatedCode: obfuscateJavascriptMinimal(message.value),
                            id: message.id
                        });
                        break;
                }
            }
            break;
        // ## TAB 1 'general tooling' END ## //

        // ## TAB 2 'enum tooling' START ## //
        // website spider
        case "spiderCurrentWebsite":
            let spiderResult = await initSpider()
            browser.runtime.sendMessage({enumSpider: spiderResult, id: message.id})
            break;

        // toolbox
        case "highlightForms":
            document.querySelectorAll('form').forEach(form => form.style.border = '5px solid red');
            break;

        case "convertAndHighlightHiddenInputs":
            document.querySelectorAll('input[type=hidden]').forEach(input => {
                input.setAttribute('type', 'text');
                input.style.cssText = 'border: 10px dotted purple';
            });
            break;
        case "highlightInputs":
            document.querySelectorAll('input').forEach(input => input.style.border = '5px solid red');
            break;
        case "extractCommentsCP":
            let comments = extractCommentsAsJson();
            browser.runtime.sendMessage({toolboxJson: comments, id: message.id});
            break;
        case "extractFormsCP":
            let forms = extractFormsAsJson();
            browser.runtime.sendMessage({toolboxJson: forms, id: message.id});
            break;
        case "extractUrlsCP":
            let urls = extractUrlsAsJson();
            browser.runtime.sendMessage({toolboxJson: urls, id: message.id});
            break;
        case "extractHeaderCP":
            let headers = await extractHeadersAsJson();
            browser.runtime.sendMessage({toolboxJson: headers, id: message.id});
            break;

        // ## TAB 3 'exploit assistant' START ## //
        // ## TAB 3 'exploit assistant' END ## //

        // ## TAB 4 'shell assistant' START ## //
        // ## TAB 4 'shell assistant' END ## //

        // ## TAB 5 'checklist assistant' START ## //
        // ## TAB 5 'checklist assistant' END ## //

        // ## TAB 6 'useful commands' START ## //
        // ## TAB 6 'useful commands' END ## //
    }
});