/**
 * logAllChanges()
 *
 * Function to log all changes to cookies and postMessage events every 3 seconds
 */
async function logAllChanges() {
    try {
        postMessageEventsJson = JSON.parse(window.getPostMessageEvents());

        if (postMessageEventsJson.length > 0) {
            let msg = {
                postMessage: {
                    [`${window.location.href}`]: postMessageEventsJson
                },
                id: "enum-tooling-intercepted-post-messages"
            }
            browser.runtime.sendMessage(msg);
        }

    } catch (error) {

    }

    setTimeout(logAllChanges, 5000);
}

// Start logging changes every 3 seconds
logAllChanges();

/**
 * interceptPostMessages()
 *
 * intercept all POST messages that can be retrieved from the current URL the user is on
 *
 */
(function interceptPostMessages() {
    const originalPostMessage = window.postMessage;
    console.log('[*][CM] Postmessage monitor initialized');

    // Array to store postMessage events
    const postMessageEvents = [];

    window.postMessage = function (message, targetOrigin, transfer) {
        const sanitizedMessage = sanitizeMessage(message);
        const eventDetails = {
            message: sanitizedMessage,
            targetOrigin: targetOrigin,
            transfer: transfer,
            path: location.pathname,
            timestamp: new Date().toISOString()
        };
        postMessageEvents.push(eventDetails);

        // Call the original postMessage function
        return originalPostMessage.apply(this, arguments);
    };

    // Intercept received messages
    window.addEventListener("message", function (event) {
        const sanitizedMessage = sanitizeMessage(event.data);
        const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', '');
        const eventDetails = {
            message: sanitizedMessage,
            timestamp: timestamp
        };
        postMessageEvents.push(eventDetails);
    });

    // Expose function to get all postMessage events as a JSON string
    window.getPostMessageEvents = function () {
        return JSON.stringify(postMessageEvents, getCircularReplacer(), 2);
    };
})();

/**
 * getCircularReplacer()
 *
 * Function to handle circular references in objects
 */
function getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
}

/**
 * sanitizeMessage()
 *
 * Function to sanitize messages by removing any properties that might cause cross-origin issues
 */
function sanitizeMessage(message) {
    if (typeof message !== "object" || message === null) {
        message = {message}
    }

    const sanitized = {cm_wrap: {}};
    for (const key in message) {
        if (message.hasOwnProperty(key)) {
            try {
                sanitized.cm_wrap[key] = message[key];
            } catch (e) {
                console.warn(`Unable to access property ${key}:`, e);
            }
        }
    }
    return sanitized;
}

