/**
 * spiderWebsite()
 *
 * method that is used for spidering the current website
 *
 * @param startUrl url where to start spidering from
 * @param maxDepth the depth the spider should go
 * @returns {Promise<{simpleTree: {}, siteTree: {}}>} JSON object with a simpletree and the siteTree JSON objects.
 */
async function spiderWebsite(startUrl, maxDepth = 2) {
    const visited = new Set();
    const siteTree = {};

    function addUrlToTree(tree, url, formInfo) {
        const urlObj = new URL(url);
        const pathSegments = urlObj.pathname.split('/').filter(Boolean);
        let currentLevel = tree;

        pathSegments.forEach((segment, index) => {
            const fullPath = urlObj.origin + '/' + pathSegments.slice(0, index + 1).join('/');
            if (!currentLevel[fullPath]) {
                currentLevel[fullPath] = {totalForms: 0, forms: []};
            }
            if (index === pathSegments.length - 1) {
                currentLevel[fullPath].totalForms = formInfo.totalForms;
                currentLevel[fullPath].forms = formInfo.forms;
            }
            currentLevel = currentLevel[fullPath];
        });
    }

    async function visitPage(currentUrl, depth) {
        if (depth > maxDepth || visited.has(currentUrl)) {
            return;
        }

        visited.add(currentUrl);

        try {
            const response = await fetch(currentUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${currentUrl}: ${response.statusText}`);
            }
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');

            const links = Array.from(doc.querySelectorAll('a[href]'))
                .map(link => link.getAttribute('href'))
                .map(href => new URL(href, currentUrl).href);

            const filteredLinks = links.filter(link => {
                const normalizedLink = new URL(link).href;
                return normalizedLink.startsWith(startUrl) && !visited.has(normalizedLink);
            });

            const uniqueFilteredLinks = [...new Set(filteredLinks)];

            const forms = doc.querySelectorAll('form');
            const formTags = Array.from(forms).map(form => form.outerHTML.match(/<form[^>]*>/)[0]);
            const formInfo = {totalForms: forms.length, forms: formTags};

            addUrlToTree(siteTree, currentUrl, formInfo);

            for (const link of uniqueFilteredLinks) {
                await visitPage(link, depth + 1);
            }
        } catch (error) {
            console.error(`Error visiting ${currentUrl}: ${error.message}`);
        }
    }

    await visitPage(startUrl, 0);

    const simpleTree = buildSimpleTree(siteTree, startUrl);

    return {simpleTree, siteTree};
}

/**
 * buildSimpleTree()
 *
 * build a simple tree structure, used by spiderWebsite() async method
 *
 */
function buildSimpleTree(tree, rootUrl) {
    const simpleTree = {};
    const rootDomain = new URL(rootUrl).origin;

    function traverse(node, currentPath) {
        for (const key in node) {
            if (typeof node[key] === 'object' && !Array.isArray(node[key])) {
                const newPath = key;
                const domainRoot = currentPath === '' ? rootDomain : currentPath;
                simpleTree[domainRoot] = simpleTree[domainRoot] || [];
                simpleTree[domainRoot].push(newPath);
                traverse(node[key], newPath);
            }
        }
    }

    traverse(tree, '');

    return simpleTree;
}

/**
 * initSpider()
 *
 * Initialize the spider and return the spider result. This will always start from the window.location.origin domain (root)
 * @returns {Promise<string>} returns a JSON string with a simplified tree structure and an detailed, also with associated forms.
 */
async function initSpider() {
    const startUrl = window.location.origin; // Use the domain as the starturl
    const {simpleTree, siteTree} = await spiderWebsite(startUrl, 2);

    // Convert the tree structure to a JSON string
    return JSON.stringify({simpleTree, siteTree}, null, 2); // Logs the JSON string of the site tree structure
}

/**
 * extractCommentsFromCurrentPage()
 *
 * Extract all the comments, multiline or singleline, in javascript or html from the current page
 *
 * @returns {string}
 */
function extractCommentsAsJson() {
    // Get the HTML content of the current page
    const htmlString = document.documentElement.outerHTML;
    const urlPath = window.location.href;

    // Regular expressions to match HTML and JavaScript comments
    const htmlCommentRegex = /<!--[\s\S]*?-->/g;
    const jsCommentRegex = /\/\*[\s\S]*?\*\/|\/\/[^\n]*$/gm;

    // Extract comments
    const htmlComments = [...htmlString.matchAll(htmlCommentRegex)];
    const scriptTagContent = htmlString.match(/<script[\s\S]*?>[\s\S]*?<\/script>/gi) || [];

    let comments = [];

    // Extract JS comments from script tags
    scriptTagContent.forEach(scriptTag => {
        comments = comments.concat([...scriptTag.matchAll(jsCommentRegex)]);
    });

    // Combine HTML and JS comments
    const allComments = htmlComments.concat(comments);

    if (allComments.length === 0) {
        return `no comments can be found for ${urlPath}`;
    }

    // Function to get the line number of a comment
    function getLineNumber(comment) {
        const beforeComment = htmlString.substring(0, comment.index);
        return beforeComment.split('\n').length;
    }

    // Map comments to objects with line number and content
    const commentsWithLineNumbers = allComments.map(comment => {
        const lineNumber = getLineNumber(comment);
        return {lineNumber, comment: comment[0].trim()};
    });

    // Sort comments by line number
    commentsWithLineNumbers.sort((a, b) => a.lineNumber - b.lineNumber);

    // Format comments as a JSON object
    const formattedComments = commentsWithLineNumbers.reduce((acc, curr) => {
        acc[curr.lineNumber] = curr.comment;
        return acc;
    }, {});

    return JSON.stringify(formattedComments, null, 2);
}

/**
 * extractFormsAsJson()
 *
 * extract all froms from the current page
 * @returns {string} returns a JSON object, where the key = the line number, and the value is the entire html form
 */
function extractFormsAsJson() {
    const forms = document.querySelectorAll('form');
    const results = [];

    function rebuild(el) {
        const tag = el.tagName.toLowerCase();
        const a = [...el.attributes].map(a => `${a.name}='${a.value}'`).join(' ');
        const selfClosing = ['input', 'br', 'hr', 'img'].includes(tag);

        if (tag === 'select') {
            const opts = [...el.options].map(o =>
                `<option value='${o.value}'${o.selected ? ' selected' : ''}>${o.textContent.trim()}</option>`
            ).join('');
            return `<${tag} ${a}>${opts}</${tag}>`;
        }

        if (selfClosing) return `<${tag} ${a}>`;
        const text = (tag === 'label' || tag === 'button') ? el.textContent.trim() : '';
        return `<${tag} ${a}>${text}</${tag}>`;
    }

    forms.forEach(form => {
        const a = [...form.attributes].map(a => `${a.name}='${a.value}'`).join(' ');
        results.push({
            form: `<form ${a}>`,
            fields: [...form.querySelectorAll('input, textarea, select, button, label')].map(rebuild)
        });
    });

    return JSON.stringify(results, null, 2);
}

/**
 * extractUrlsAsJson()
 *
 * extract all internal and external URLS from a page
 * @returns {string} the JSON object with external and internal URLS
 */
function extractUrlsAsJson() {
    const urlDetails = {
        internal: {},
        external: {}
    };

    // Get the HTML source of the entire page
    const htmlSource = document.documentElement.outerHTML;
    const lines = htmlSource.split('\n');

    // Helper function to determine if a URL is internal
    function isInternalUrl(url) {
        const pageHost = window.location.hostname;
        const link = document.createElement('a');
        link.href = url;
        return link.hostname === pageHost || !link.hostname;
    }

    // Extract URLs from anchor tags, script sources, and other tags
    const urlSelectors = [
        'a[href]:not([href^="javascript:"])',
        'script[src]',
        'link[href]',
        'iframe[src]',
        'audio[src]',
        'video[src]',
        'source[src]',
        'embed[src]',
        'object[data]'
    ];

    urlSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            let url = element.getAttribute('href') || element.getAttribute('src') || element.getAttribute('data');
            if (!url) return; // Skip if there's no URL

            // Remove invisible characters and trim spaces
            url = url.replace(/[\t\n\r]+/g, ' ').replace(/\s{2,}/g, ' ').trim();

            // Get the line number of the URL
            const htmlFragment = element.outerHTML.split(/[\t\n\r]/g).join(' ');
            let urlStartIndex = -1;

            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(htmlFragment.substring(0, 30))) {
                    urlStartIndex = i + 1;
                    break;
                }
            }

            if (urlStartIndex !== -1) {
                const key = urlStartIndex;
                const value = url;
                if (isInternalUrl(url)) {
                    urlDetails.internal[key] = value;
                } else {
                    urlDetails.external[key] = value;
                }
            }
        });
    });

    return JSON.stringify(urlDetails, null, 2);
}

/**
 * extractHeadersAsJson()
 *
 * extract the headers from the current URL you are on.
 * @returns {Promise<string>} This will return the header key, value and explanation as a JSON string.
 */
async function extractHeadersAsJson() {
    const url = window.location.href;
    const response = await fetch(url, {method: 'HEAD'});

    const headers = [];
    const interestingHeaders = [
        'access-control-allow-credentials',
        'access-control-allow-headers',
        'access-control-allow-methods',
        'access-control-allow-origin',
        'authorization',
        'clear-site-data',
        'content-security-policy',
        'content-security-policy-report-only',
        'cookie',
        'cross-origin-embedder-policy',
        'cross-origin-opener-policy',
        'cross-origin-resource-policy',
        'expect-ct',
        'nel',
        'origin',
        'permissions-policy',
        'referer',
        'referrer-policy',
        'set-cookie',
        'strict-transport-security',
        'upgrade-insecure-requests',
        'x-content-type-options',
        'x-dns-prefetch-control',
        'x-forwarded-for',
        'x-forwarded-host',
        'x-forwarded-proto',
        'x-frame-options',
        'x-xss-protection',
        'www-authenticate',
        'public-key-pins',
        'feature-policy',
        'cache-control',
        'expires',
        'pragma',
        'last-modified',
        'etag',
        'if-modified-since',
        'if-none-match',
        'server',
        'via',
        'warning',
        'x-originating-ip',
        'x-forwarded',
        'forwarded-for',
        'x-remote-ip',
        'x-remote-addr',
        'x-proxyuser-ip',
        'x-original-url',
        'client-ip',
        'x-client-ip',
        'x-host',
        'true-client-ip',
        'cluster-client-ip',
        'connection'
    ];


    const headerExplanations = {
        'accept': 'Informs the server about the types of data that can be sent back.',
        'accept-ch': '[EXPERIMENTAL] Indicates the headers client wants the server to use in a response.',
        'accept-charset': 'Indicates what character encodings the client can understand.',
        'accept-encoding': 'Indicates what content-encodings the client can understand.',
        'accept-language': 'Indicates the natural languages that the client prefers.',
        'accept-patch': 'Specifies which patch document formats this server supports.',
        'accept-post': '[NON-STANDARD] Specifies which media types are accepted by the server for POST requests.',
        'accept-ranges': 'Indicates if the server supports range requests.',
        'access-control-allow-credentials': '[SECURITY RISK] Indicates whether the response to the request can be exposed when the credentials flag is true.',
        'access-control-allow-headers': '[SECURITY RISK] Used in response to a preflight request to indicate which HTTP headers can be used during the actual request.',
        'access-control-allow-methods': '[SECURITY RISK] Specifies the method or methods allowed when accessing the resource in response to a preflight request.',
        'access-control-allow-origin': '[SECURITY RISK] Indicates whether the response can be shared with resources with the given origin.',
        'access-control-expose-headers': 'Indicates which headers can be exposed as part of the response by listing their names.',
        'access-control-max-age': 'Indicates how long the results of a preflight request can be cached.',
        'access-control-request-headers': 'Used when issuing a preflight request to let the server know which HTTP headers will be used when the actual request is made.',
        'access-control-request-method': 'Used when issuing a preflight request to let the server know which HTTP method will be used when the actual request is made.',
        'age': 'The age the object has been in a proxy cache in seconds.',
        'allow': 'Lists the set of methods supported by the resource.',
        'alt-svc': 'Used to list alternative services.',
        'alt-used': 'Specifies the alternative host and port used to obtain the response.',
        'attribution-reporting-eligible': '[EXPERIMENTAL] Indicates if the response is eligible for attribution reporting.',
        'attribution-reporting-register-source': '[EXPERIMENTAL] Registers a source for event-level reports.',
        'attribution-reporting-register-trigger': '[EXPERIMENTAL] Registers a trigger for event-level reports.',
        'authorization': '[SECURITY RISK] Contains the credentials to authenticate a user-agent with a server.',
        'cache-control': 'Directives for caching mechanisms in both requests and responses.',
        'clear-site-data': '[SECURITY RISK] Clears browsing data (e.g., cookies, storage, cache) associated with the requesting website.',
        'connection': 'Controls whether the network connection stays open after the current transaction finishes.',
        'content-digest': '[EXPERIMENTAL] Provides a digest of the response body.',
        'content-disposition': 'Indicates if the content is expected to be displayed inline in the browser or as an attachment.',
        'content-dpr': '[NON-STANDARD][DEPRECATED] Gives the device pixel ratio of the resource.',
        'content-encoding': 'Used to compress the media-type.',
        'content-language': 'Describes the language intended for the audience.',
        'content-length': 'The size of the resource in bytes.',
        'content-location': 'Indicates an alternate location for the returned data.',
        'content-range': 'Where in the full body this partial message belongs.',
        'content-security-policy': '[SECURITY RISK] Controls resources the user agent is allowed to load for a given page.',
        'content-security-policy-report-only': '[SECURITY RISK] Allows web developers to experiment with policies by monitoring, but not enforcing, their effects.',
        'content-type': 'Indicates the media type of the resource.',
        'cookie': '[SECURITY RISK] Contains stored HTTP cookies previously sent by the server with the Set-Cookie header.',
        'critical-ch': '[EXPERIMENTAL] Indicates critical client hints that should be sent.',
        'cross-origin-embedder-policy': '[SECURITY RISK] Prevents other domains from loading cross-origin resources without permission.',
        'cross-origin-opener-policy': '[SECURITY RISK] Allows a web page to control the way it is shared with other browsing contexts.',
        'cross-origin-resource-policy': '[SECURITY RISK] Prevents other domains from reading the response of the request.',
        'date': 'The date and time at which the message was originated.',
        'device-memory': '[EXPERIMENTAL] Provides the device memory in gigabytes.',
        'digest': '[NON-STANDARD][DEPRECATED] Provides a digest of the request body.',
        'dnt': '[NON-STANDARD][DEPRECATED] Indicates the user’s tracking preference.',
        'downlink': '[EXPERIMENTAL] Provides the client’s maximum downlink speed.',
        'dpr': '[NON-STANDARD][DEPRECATED] Gives the device pixel ratio of the client.',
        'early-data': '[EXPERIMENTAL] Indicates whether the request is in early data.',
        'ect': '[EXPERIMENTAL] Indicates the effective connection type.',
        'etag': 'A unique identifier for a specific version of a resource.',
        'expect': 'Indicates that particular server behaviors are required by the client.',
        'expect-ct': '[SECURITY RISK] Informs the server about the client’s Certificate Transparency policy.',
        'expires': 'Gives the date/time after which the response is considered stale.',
        'forwarded': '[SECURITY RISK] Discloses original information of a client connecting to a web server through an HTTP proxy.',
        'from': 'Contains an Internet email address for a human user who controls the requesting user agent.',
        'host': 'Specifies the domain name of the server and the TCP port number.',
        'if-match': 'Makes the request method conditional on the recipient’s current representations of the target resource.',
        'if-modified-since': 'Makes the request method conditional on the recipient’s modification date of the target resource.',
        'if-none-match': 'Makes the request method conditional on the absence of any current representations of the target resource.',
        'if-range': 'Makes the request method conditional on the recipient’s current representations of the target resource being equivalent to that given by the client.',
        'if-unmodified-since': 'Makes the request method conditional on the recipient’s modification date of the target resource being before the specified date.',
        'keep-alive': 'Allows the sender to hint about how the connection may be used to set a timeout and a maximum number of requests.',
        'last-modified': 'Indicates the date and time at which the server believes the resource was last modified.',
        'link': 'Used to specify relationships between the current document and an external resource.',
        'location': 'Indicates the URL to redirect a page to.',
        'max-forwards': 'Provides a mechanism with the TRACE and OPTIONS methods to limit the number of times that the request is forwarded through proxies or gateways.',
        'nel': '[SECURITY RISK][EXPERIMENTAL] Instructs the browser to report network errors to a specified reporting endpoint.',
        'no-vary-search': '[EXPERIMENTAL] Indicates the parts of the URL to ignore when determining if two requests match.',
        'observe-browsing-topics': '[EXPERIMENTAL][NON-STANDARD] Indicates whether the browser should consider the page when determining browsing topics for advertising.',
        'origin': '[SECURITY RISK] Indicates the origin(s) that are permitted to see the response.',
        'origin-agent-cluster': '[EXPERIMENTAL] Instructs the browser to apply the Origin-Agent-Cluster policy.',
        'permissions-policy': '[SECURITY RISK] Allows a site to control which features and APIs can be used in the browser.',
        'pragma': '[DEPRECATED] Implementation-specific fields that may have various effects anywhere along the request-response chain.',
        'priority': '[EXPERIMENTAL] Indicates the priority of the resource.',
        'proxy-authenticate': 'Demands authentication to access the proxy.',
        'proxy-authorization': 'Contains the credentials to authenticate a user agent with a proxy server.',
        'range': 'Indicates the part of a document that the server should return.',
        'referer': '[SECURITY RISK] The address of the previous web page from which a link to the currently requested page was followed.',
        'referrer-policy': '[SECURITY RISK] Governs which referrer information should be included with requests.',
        'reporting-endpoints': '[EXPERIMENTAL] Indicates the endpoints to which the browser should send reports.',
        'repr-digest': '[EXPERIMENTAL] Provides a digest of a representation.',
        'retry-after': 'Indicates how long the user agent should wait before making a follow-up request.',
        'rtt': '[EXPERIMENTAL] Provides the round-trip time of the client.',
        'save-data': '[EXPERIMENTAL] Indicates the client’s preference for reduced data usage.',
        'sec-browsing-topics': '[EXPERIMENTAL][NON-STANDARD] Indicates the browser’s preferences for browsing topics.',
        'sec-ch-prefers-color-scheme': '[EXPERIMENTAL] Indicates the client’s preference for a color scheme.',
        'sec-ch-prefers-reduced-motion': '[EXPERIMENTAL] Indicates the client’s preference for reduced motion.',
        'sec-ch-prefers-reduced-transparency': '[EXPERIMENTAL] Indicates the client’s preference for reduced transparency.',
        'sec-ch-ua': '[EXPERIMENTAL] Provides information about the client’s user agent.',
        'sec-ch-ua-arch': '[EXPERIMENTAL] Provides information about the client’s architecture.',
        'sec-ch-ua-bitness': '[EXPERIMENTAL] Provides information about the client’s bitness.',
        'sec-ch-ua-full-version': '[DEPRECATED] Provides the full version of the client’s user agent.',
        'sec-ch-ua-full-version-list': '[EXPERIMENTAL] Provides a list of full versions of the client’s user agent.',
        'sec-ch-ua-mobile': '[EXPERIMENTAL] Indicates whether the client is on a mobile device.',
        'sec-ch-ua-model': '[EXPERIMENTAL] Provides information about the client’s device model.',
        'sec-ch-ua-platform': '[EXPERIMENTAL] Provides information about the client’s platform.',
        'sec-ch-ua-platform-version': '[EXPERIMENTAL] Provides the version of the client’s platform.',
        'sec-fetch-dest': 'Indicates the destination of the fetch request.',
        'sec-fetch-mode': 'Indicates the mode of the fetch request.',
        'sec-fetch-site': 'Indicates the site sending the fetch request.',
        'sec-fetch-user': 'Indicates whether the request is initiated by user activation.',
        'sec-gpc': '[EXPERIMENTAL][NON-STANDARD] Indicates the user’s Global Privacy Control preference.',
        'sec-purpose': 'Indicates the purpose of the fetch request.',
        'sec-websocket-accept': 'Used in the WebSocket opening handshake.',
        'server': 'Contains information about the software used by the origin server to handle the request.',
        'server-timing': 'Communicates one or more metrics and descriptions for the given request-response cycle.',
        'service-worker-navigation-preload': 'Indicates if navigation preload is enabled in Service Workers.',
        'set-cookie': '[SECURITY RISK] Sends cookies from the server to the user agent.',
        'set-login': '[EXPERIMENTAL] Indicates whether the user has logged in.',
        'sourcemap': 'Provides a source map for JavaScript debugging.',
        'speculation-rules': '[EXPERIMENTAL] Allows the server to provide hints for resource preloading.',
        'strict-transport-security': '[SECURITY RISK] Enforces secure (HTTP over SSL/TLS) connections to the server.',
        'supports-loading-mode': '[EXPERIMENTAL] Indicates the loading mode supported by the client.',
        'te': 'Indicates the transfer encodings the user agent is willing to accept.',
        'timing-allow-origin': 'Specifies origins that are allowed to see timing resources via the Resource Timing API.',
        'tk': '[NON-STANDARD][DEPRECATED] Indicates the tracking status that applies to the request.',
        'trailer': 'Indicates that the given set of header fields is present in the trailer of a message.',
        'transfer-encoding': 'Specifies the form of encoding used to safely transfer the payload body to the user.',
        'upgrade': 'Asks the server to upgrade to another protocol.',
        'upgrade-insecure-requests': '[SECURITY RISK] Sends a signal to the server expressing the client’s preference for an encrypted and authenticated response.',
        'user-agent': 'Contains a characteristic string that allows the network protocol peers to identify the application type, operating system, software vendor, or software version of the requesting software user agent.',
        'vary': 'Determines how to match future request headers to decide whether a cached response can be used rather than requesting a fresh one from the origin server.',
        'via': 'Added by proxies, both forward and reverse proxies, and can appear in the request headers and the response headers.',
        'viewport-width': '[NON-STANDARD][DEPRECATED] Indicates the width of the client’s viewport.',
        'want-content-digest': '[EXPERIMENTAL] Indicates the type of digest the client wants in the response.',
        'want-digest': '[NON-STANDARD][DEPRECATED] Indicates the types of digests the client wants in the response.',
        'want-repr-digest': '[EXPERIMENTAL] Indicates the types of digests the client wants in the representation.',
        'warning': '[DEPRECATED] Carries additional information about the status or transformation of a message that might not be reflected in the message.',
        'width': '[NON-STANDARD][DEPRECATED] Indicates the width of the client’s display.',
        'www-authenticate': '[SECURITY RISK] Defines the authentication method that should be used to gain access to a resource.',
        'x-content-type-options': '[SECURITY RISK] Protects against MIME type sniffing.',
        'x-dns-prefetch-control': '[SECURITY RISK] Controls DNS prefetching.',
        'x-forwarded-for': '[SECURITY RISK] Identifies the originating IP address of a client connecting to a web server through an HTTP proxy or load balancer.',
        'x-forwarded-host': '[SECURITY RISK] Identifies the original host requested by the client in the Host HTTP request header.',
        'x-forwarded-proto': '[SECURITY RISK] Identifies the protocol (HTTP or HTTPS) that a client used to connect to your proxy or load balancer.',
        'x-frame-options': '[SECURITY RISK] Provides clickjacking protection by preventing the page from being framed.',
        'x-xss-protection': '[SECURITY RISK] Enables cross-site scripting filtering.'
    }

    let foundInteresting = false;
    let foundExplanation = false;

    response.headers.forEach((value, name) => {
        let lowerName = name.toLowerCase();
        let headerValue = value;
        if (interestingHeaders.includes(lowerName)) {
            headerValue += ' [[ INTERESTING ]]';
            foundInteresting = true;
        }
        if (headerExplanations[lowerName]) {
            foundExplanation = true;
        }

        headers.push({
            name: name,
            value: headerValue,
            explanation: headerExplanations[lowerName] || 'N/A.'
        })
    });

    if (foundExplanation) {
        headers.push({
            name: "Additional information",
            value: "https://book.hacktricks.xyz/network-services-pentesting/pentesting-web/special-http-headers",
            explanation: "A reference guide for special HTTP headers."
        })
    }

    return JSON.stringify(headers, null, 2);
}