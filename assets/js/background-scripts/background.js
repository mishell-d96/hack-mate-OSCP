let cookieChangesJson = {};
let currentTabOpened = null;
let currentDomainOpened = null;

// ── Message listener ─────────────────────────────────────────────────────────

browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) return;

    if (message.command === "background-ping") {
        try {
            currentTabOpened = new URL(tabs[0].url);
            currentDomainOpened = currentTabOpened.hostname;
        } catch (e) {
            // Ongeldige URL, skippen
        }

    } else if (message.command === "background-reset-cookies") {
        cookieChangesJson = {};

    } else {
        const activeTabId = tabs[0].id;
        const msg = message.hasOwnProperty("value")
            ? { command: message.command, id: message.id, value: message.value, targetSelectValue: message.targetSelectValue }
            : { command: message.command, id: message.id, messageData: message.messageData };

        browser.tabs.sendMessage(activeTabId, msg).catch(() => {});
    }
});

// ── Cookie monitor ───────────────────────────────────────────────────────────

browser.cookies.onChanged.addListener(async (changeInfo) => {
    const { cookie, removed, cause } = changeInfo;
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) return;

    let currentDomain;
    try {
        currentDomain = new URL(tabs[0].url).hostname;
    } catch (e) {
        return;
    }

    const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', '');

    if (!cookieChangesJson[currentDomain]) {
        cookieChangesJson[currentDomain] = [];
    }

    cookieChangesJson[currentDomain].unshift({
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        samesite: cookie.sameSite,
        cause,
        removed,
        timestamp
    });

    if (cookieChangesJson[currentDomain].length > 1000) {
        cookieChangesJson[currentDomain] = cookieChangesJson[currentDomain].slice(0, 1000);
    }
});

// ── Polling: stuur cookie updates naar de popup ──────────────────────────────

(function sendBackgroundMessage() {
    try {
        if (currentDomainOpened && cookieChangesJson[currentDomainOpened]?.length > 0) {
            browser.runtime.sendMessage({
                id: "enum-tooling-altered-cookie-messages",
                cookieChange: {
                    [currentDomainOpened]: cookieChangesJson[currentDomainOpened]
                }
            }).catch(() => {
                // Popup is gesloten, negeren
            });
        }
    } catch (e) {
        console.log(e);
    } finally {
        setTimeout(sendBackgroundMessage, 5000);
    }
})();