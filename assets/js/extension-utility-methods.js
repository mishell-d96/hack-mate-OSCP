const noCodeAvailable = "# no code available"
const noCodeAvailableLanguage = "language-bash"

const bash = "language-bash"
const powershell = "language-powershell"


/**
 * createElement()
 *
 * Creates an element with the specified classes.
 *
 * @param {string} elementName - The name of the element to create.
 * @param {string[]} classes - An array of class names to add to the element.
 * @returns {HTMLElement} The created element with the specified classes.
 */
function createElement(elementName, classes) {
    const e = document.createElement(elementName);
    for (let index = 0; index < classes.length; index++) {
        e.classList.add(classes[index]);
    }
    return e;
}


/**
 * generateDynamicId()
 *
 * Generates a unique dynamic ID string.
 *
 * This function creates a random ID by combining:
 * - Random numbers between 1 and 1,000,000
 * - Random alphanumeric strings
 *
 * The resulting ID is highly unlikely to duplicate,
 * making it suitable for use as a unique identifier.
 *
 * @returns {string} A unique dynamically generated ID
 */
function generateDynamicId() {
    return `${Math.floor((Math.random() * 999999) + 1)}${Math.random().toString(36)}${Math.floor((Math.random() * 999999) + 1)}${Math.random().toString(36)}${Math.floor((Math.random() * 999999) + 1)}`
}


/**
 * searchTable()
 *
 * Searches for a specific value in a table. The number of columns or rows does not matter.
 *
 * This function adds a 'keyup' event listener to the input field with the specified ID.
 * When the user enters text, the value is compared to the text in each row of the table.
 * Rows containing the entered value are displayed, while others are hidden.
 *
 * @param {string} inputFieldId - The ID of the input field (without a hashtag).
 * @param {string} tableId - The ID of the table (without a hashtag).
 */
function searchTable(inputFieldId, tableId) {
    $(document).ready(function () {
        $(`#${inputFieldId}`).on("keyup", function () {
            var value = $(this).val().toLowerCase();
            $(`#${tableId} tbody tr`).filter(function () {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        });
    });
}

/**
 * searchList : searches for a value specific in a list.
 *
 * @param {*} inputFieldId id of the input field (no hashtag)
 * @param {*} listId id of the list (no hashtag)
 */
function searchList(inputFieldId, listId) {
    $(document).ready(function () {
        $(`#${inputFieldId}`).on("keyup", function () {
            var value = $(this).val().toLowerCase();
            $(`#${listId} li`).filter(function () {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        });
    });
}

/**
 * initTableSortable()
 *
 * adds the possibility to sort ascending or descending based on a table column
 */
function initTableSortable() {
    let currentSortColumn = null;
    let sortDirection = 1; // 1 for ascending, -1 for descending

    // Function to sort the table
    function sortTable(table, columnIndex) {
        const rows = Array.from(table.tBodies[0].rows);

        if (currentSortColumn === columnIndex) {
            sortDirection *= -1; // Reverse sort direction
        } else {
            sortDirection = 1; // Default to ascending
        }

        currentSortColumn = columnIndex;

        rows.sort((rowA, rowB) => {
            const cellA = rowA.cells[columnIndex].innerText;
            const cellB = rowB.cells[columnIndex].innerText;

            if (!isNaN(cellA) && !isNaN(cellB)) {
                return (cellA - cellB) * sortDirection;
            }

            return cellA.localeCompare(cellB) * sortDirection;
        });

        // Update the table with sorted rows
        const tbody = table.tBodies[0];
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }

        tbody.append(...rows);

        // Update sort icons
        updateSortIcons(table, columnIndex);
    }

    // Function to update sort icons
    function updateSortIcons(table, columnIndex) {
        const headers = table.querySelectorAll("th .sort-icon");
        headers.forEach((icon, index) => {
            if (index === columnIndex) {
                icon.innerHTML = sortDirection === 1 ? "&#9650;" : "&#9660;";
            } else {
                icon.innerHTML = "&#9650;"; // Default to ascending icon
            }
        });
    }

    // Initialize the sorting functionality on all tables
    document.querySelectorAll("table").forEach(table => {
        table.querySelectorAll("th").forEach((header, index) => {
            // Add a span for the sort icon if not already present
            if (!header.querySelector(".sort-icon")) {
                const sortIcon = document.createElement("span");
                sortIcon.className = "sort-icon";
                sortIcon.innerHTML = "&#9650;"; // Default to ascending icon
                header.appendChild(sortIcon);
            }
            header.addEventListener("click", () => sortTable(table, index));
        });
    });
}

/**
 * escapeHTML()
 *
 * Escapes special HTML characters in a string to their corresponding HTML entities.
 *
 * @param {string} str - The string to escape.
 * @returns {string} - The escaped string.
 */
function escapeHTML(str) {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
}

/**
 * buildDisabledSelectOption()
 *
 * Builds a disabled select option element with the specified text content.
 *
 * @param textContent
 * @returns {HTMLOptionElement}
 */
function buildDisabledSelectOption(textContent) {
    const option = new Option(textContent, "", true, true);
    option.disabled = true;
    return option;
}


/**
 * captureAndCopyCodeElementToClipboard()
 *
 * screenshot an code element with html2canvas
 */
function captureAndCopyCodeElementToClipboard(element, language) {
    // Create a deep clone of the original element
    const clone = buildCodeElement(element, language);
    clone.classList.remove("p-2")
    clone.classList.add("p-0")

    // Apply styles to the clone to ensure all content is visible
    clone.style.position += 'fixed';
    clone.style.top += '0';
    clone.style.left += '0';
    clone.style.overflow += 'visible'; // Ensure no content is hidden
    clone.style.zIndex += '-9999'; // Make sure the clone doesn't interfere with the layout
    clone.style.whiteSpace = 'pre-wrap'; // Preserve whitespace and wrap long lines

    // Append the clone to the body (off-screen)
    document.body.appendChild(clone);

    // Use html2canvas to capture the clone
    html2canvas(clone, {
        height: clone.scrollHeight
    }).then(function (canvas) {
        // Convert the canvas to a Blob
        canvas.toBlob(function (blob) {
            // Use the Clipboard API to write the Blob to the clipboard
            navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]).then(function () {
                createToast('Image has been copied succesfully!', 3000);
                console.log('Image copied to clipboard');
            }).catch(function (error) {
                createToast('Failed to copy image to clipboard!', 3000, "error");
                console.error('Error copying image to clipboard:', error);
            });
        });

        // Remove the clone after capturing
        document.body.removeChild(clone);
    }).catch(function (error) {
        createToast('Failed to copy image to clipboard!', 3000, "error");
        console.error('Error capturing the element:', error);

        // Ensure the clone is removed even in case of an error
        document.body.removeChild(clone);
    });
};

/**
 * dispatchInputEvent()
 *
 * Dispatches an input event on the specified element.
 */
function dispatchInputEvent(element) {
    element.dispatchEvent(new Event("input", {bubbles: true, cancelable: true}));
}

/**
 * dispatchChangeEvent()
 *
 * Dispatches an input event on the specified element.
 */
function dispatchChangeEvent(element) {
    const event = new Event("change", {bubbles: true, cancelable: true});
    element.dispatchEvent(event);
}

/**
 * dispatchChangeEvent()
 *
 * Dispatches an input event on the specified element.
 */
function dispatchClickEvent(element) {
    const event = new Event("click", {bubbles: true, cancelable: true});
    element.dispatchEvent(event);
}

// START MONITOR LOAD
/**
 * event-feed.js
 * =============
 * Generic, self-contained event feed renderer.
 *
 * Usage:
 *   renderEventFeed(dataArray, containerId, countId, config)
 *
 * The `config` object teaches the renderer how to map your data shape to the UI.
 * Two ready-made configs are exported at the bottom:
 *   - EventFeedConfig.postMessage
 *   - EventFeedConfig.cookie
 *
 * Example:
 *   renderEventFeed(
 *       message.postMessage[currentTab?.href],
 *       "postmessage-monitor-table-table-body",
 *       "enum-tooling-postmessage-monitor-count",
 *       EventFeedConfig.postMessage
 *   );
 *
 *   renderEventFeed(
 *       cookieChangesJson[currentDomain],
 *       "cookie-monitor-feed",
 *       "enum-tooling-cookie-monitor-count",
 *       EventFeedConfig.cookie
 *   );
 *
 * ── Config shape ──────────────────────────────────────────────────────────────
 * {
 *   getPillInfo(item)  → { label: string, variant: "success" | "danger" | "warn" | "info" }
 *   getEndpoint(item)  → string          — shown in purple in the header
 *   getPath(item)      → string | null   — dim gray, shown before timestamp
 *   getTimestamp(item) → string | null   — dim gray, right-aligned in header
 *   getFields(item)    → object          — key/value pairs shown in the card body
 * }
 */

// ── Variant palette ──────────────────────────────────────────────────────────
/**
 * event-feed.js
 * =============
 * Generic, self-contained event feed renderer.
 *
 * Usage:
 *   renderEventFeed(dataArray, containerId, countId, config)
 *
 * The `config` object teaches the renderer how to map your data shape to the UI.
 * Two ready-made configs are exported at the bottom:
 *   - EventFeedConfig.postMessage
 *   - EventFeedConfig.cookie
 *
 * Example:
 *   renderEventFeed(
 *       message.postMessage[currentTab?.href],
 *       "postmessage-monitor-table-table-body",
 *       "enum-tooling-postmessage-monitor-count",
 *       EventFeedConfig.postMessage
 *   );
 *
 *   renderEventFeed(
 *       cookieChangesJson[currentDomain],
 *       "cookie-monitor-feed",
 *       "enum-tooling-cookie-monitor-count",
 *       EventFeedConfig.cookie
 *   );
 *
 * ── Config shape ──────────────────────────────────────────────────────────────
 * {
 *   getPillInfo(item)  → { label: string, variant: "success" | "danger" | "warn" | "info" }
 *   getEndpoint(item)  → string          — shown in purple in the header
 *   getPath(item)      → string | null   — dim gray, shown before timestamp
 *   getTimestamp(item) → string | null   — dim gray, right-aligned in header
 *   getFields(item)    → object          — key/value pairs shown in the card body
 * }
 */

// ── Variant palette ──────────────────────────────────────────────────────────
const _EF_VARIANTS = {
    success: { color: "#3fb950", bg: "rgba(63,185,80,0.12)",   border: "rgba(63,185,80,0.30)"  },
    danger:  { color: "#f85149", bg: "rgba(248,81,73,0.12)",   border: "rgba(248,81,73,0.30)"  },
    warn:    { color: "#e3b341", bg: "rgba(227,179,65,0.12)",  border: "rgba(227,179,65,0.30)" },
    info:    { color: "#58a6ff", bg: "rgba(88,166,255,0.12)",  border: "rgba(88,166,255,0.30)" },
};

// ── Style injection (once per page) ─────────────────────────────────────────
function _efInjectStyles() {
    if (document.getElementById("ef-styles")) return;
    const s = document.createElement("style");
    s.id = "ef-styles";
    s.textContent = `
        /* ── Wrapper ───────────────────────────────────────── */
        .ef-wrapper {
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
            box-sizing: border-box;
            font-family: consolas, monospace;
        }

        /* ── Toolbar ───────────────────────────────────────── */
        .ef-toolbar {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 5px 6px;
            background: #1e1e1e;
            border-bottom: 1px solid #3e3e42;
            box-sizing: border-box;
            flex-shrink: 0;  /* never shrinks — always visible */
        }
        .ef-search-input {
            flex: 1;
            min-width: 0;
            background: #252526;
            border: 1px solid #3e3e42;
            border-radius: 3px;
            color: #c9d1d9;
            font-family: consolas, monospace;
            font-size: 13px;
            padding: 6px 10px;
            outline: none;
        }
        .ef-search-input:focus         { border-color: #007acc; }
        .ef-search-input::placeholder  { color: #484f58; }
        .ef-search-count {
            font-size: 12px;
            font-weight: bold;
            color: #6e7681;
            flex-shrink: 0;
            white-space: nowrap;
            min-width: 52px;
            text-align: right;
        }

        /* Pause / Resume */
        .ef-pause-btn {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 3px 8px;
            font-family: consolas, monospace;
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 0.04em;
            border-radius: 3px;
            border: 1px solid;
            cursor: pointer;
            user-select: none;
        }
        .ef-pause-btn--live   { color:#3fb950; border-color:rgba(63,185,80,0.35); background:rgba(63,185,80,0.08); }
        .ef-pause-btn--live:hover   { background:rgba(63,185,80,0.16); }
        .ef-pause-btn--paused { color:#f85149; border-color:rgba(248,81,73,0.35); background:rgba(248,81,73,0.08); }
        .ef-pause-btn--paused:hover { background:rgba(248,81,73,0.16); }

        /* ── Feed area ─────────────────────────────────────── */
        .ef-feed {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 6px 0;
            flex: 1;
            overflow-y: auto;   /* feed scrolls, toolbar stays put */
            box-sizing: border-box;
        }

        /* Empty / loading states */
        .ef-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            height: 120px;
            font-size: 11px;
            letter-spacing: 0.07em;
            text-transform: uppercase;
        }
        .ef-state--empty   { color: #3a3a3a; }
        .ef-state--loading { color: #484f58; }
        .ef-state-icon     { font-size: 22px; opacity: 0.3; }
        .ef-spinner {
            width: 18px;
            height: 18px;
            border: 2px solid #3e3e42;
            border-top-color: #007acc;
            border-radius: 50%;
            animation: ef-spin 0.7s linear infinite;
        }
        @keyframes ef-spin { to { transform: rotate(360deg); } }

        /* ── Cards ─────────────────────────────────────────── */
        .ef-card {
            background: #252526;
            border: 1px solid #3e3e42;
            border-left-width: 3px;
            border-radius: 3px;
            overflow: hidden;
            font-size: 11px;
            animation: ef-slide-in 0.15s ease both;
        }
        @keyframes ef-slide-in {
            from { opacity:0; transform:translateY(-3px); }
            to   { opacity:1; transform:translateY(0); }
        }
        .ef-card--hidden { display: none; }
        .ef-card:hover   { background:#2d2d30; border-color:#007acc; border-left-color:inherit; }

        /* Card header */
        .ef-card-header {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 4px 8px;
            background: #1e1e1e;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            overflow: hidden;
        }
        .ef-pill {
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 0.08em;
            padding: 2px 0;
            border-radius: 2px;
            flex-shrink: 0;
            width: 64px;
            text-align: center;
            border: 1px solid;
        }
        .ef-endpoint {
            color: #d2a8ff;
            font-size: 11px;
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 0;
        }
        .ef-meta        { display:flex; align-items:center; gap:8px; flex-shrink:0; }
        .ef-meta-path   { color:#484f58; font-size:10px; white-space:nowrap; }
        .ef-meta-ts     { color:#484f58; font-size:10px; white-space:nowrap; }

        /* Card body */
        .ef-card-body {
            padding: 4px 8px 5px 10px;
            display: flex;
            flex-direction: column;
        }
        .ef-field-table {
            display: grid;
            grid-template-columns: max-content 24px 1fr;
        }
        .ef-field-key {
            color: #79c0ff;
            font-size: 11px;
            padding: 2px 0;
            border-bottom: 1px solid rgba(255,255,255,0.03);
            white-space: nowrap;
        }
        .ef-field-sep {
            color: #3e3e42;
            font-size: 11px;
            padding: 2px 0;
            text-align: center;
            border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .ef-field-val {
            color: #ce9178;
            font-size: 11px;
            padding: 2px 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .ef-field-key:nth-last-child(3),
        .ef-field-sep:nth-last-child(2),
        .ef-field-val:last-child { border-bottom: none; }

        /* Expand hidden fields */
        .ef-hidden-fields       { display: none; }
        .ef-hidden-fields--open { display: contents; }
        .ef-expand-btn {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-top: 4px;
            padding: 2px 0;
            font-size: 10px;
            color: #007acc;
            cursor: pointer;
            user-select: none;
            background: none;
            border: none;
            font-family: consolas, monospace;
            letter-spacing: 0.03em;
            grid-column: 1 / -1;
        }
        .ef-expand-btn:hover { color: #4fc3f7; }
        .ef-expand-chevron {
            display: inline-block;
            transition: transform 0.15s ease;
            font-size: 13px;
            line-height: 1;
        }
        .ef-empty-body { color:#3a3a3a; font-style:italic; font-size:10px; padding:2px 0; }
    `;
    document.head.appendChild(s);
}

// ── Main renderer ─────────────────────────────────────────────────────────────
function renderEventFeed(dataArray, containerId, countId, config) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (container.getAttribute("data-control-update") !== "true") return;
    if (container._efPaused === true) return;

    _efInjectStyles();

    // Update external count badge if provided
    const countEl = document.getElementById(countId);
    if (countEl) countEl.innerText = Array.isArray(dataArray) ? dataArray.length : 0;

    // Preserve search state across re-renders
    const prevQuery = container._efSearchQuery || "";

    container.innerHTML = "";
    container.classList.add("ef-wrapper");

    // ── Toolbar ───────────────────────────────────────────────────────────────
    const toolbar = document.createElement("div");
    toolbar.className = "ef-toolbar";

    const searchInput = document.createElement("input");
    searchInput.className = "ef-search-input";
    searchInput.type = "text";
    searchInput.placeholder = "Filter by key or value...";
    searchInput.setAttribute("spellcheck", "false");
    searchInput.value = prevQuery;

    const searchCount = document.createElement("span");
    searchCount.className = "ef-search-count";

    const pauseBtn = document.createElement("button");
    pauseBtn.className = "ef-pause-btn ef-pause-btn--live";
    pauseBtn.innerHTML = "&#9679; LIVE";
    pauseBtn.title = "Pause automatic refresh";
    pauseBtn.addEventListener("click", () => {
        container._efPaused = !container._efPaused;
        if (container._efPaused) {
            pauseBtn.className = "ef-pause-btn ef-pause-btn--paused";
            pauseBtn.innerHTML = "&#9646;&#9646; PAUSED";
            pauseBtn.title = "Resume automatic refresh";
        } else {
            pauseBtn.className = "ef-pause-btn ef-pause-btn--live";
            pauseBtn.innerHTML = "&#9679; LIVE";
            pauseBtn.title = "Pause automatic refresh";
        }
    });

    toolbar.appendChild(searchInput);
    toolbar.appendChild(searchCount);
    toolbar.appendChild(pauseBtn);
    container.appendChild(toolbar);

    // ── Feed ──────────────────────────────────────────────────────────────────
    const feed = document.createElement("div");
    feed.className = "ef-feed";
    container.appendChild(feed);

    // Loading state (null = not yet received)
    if (dataArray === null || dataArray === undefined) {
        if (!container._efLoadingTimer) {
            container._efLoadingTimer = setTimeout(() => {
                const feedEl = container.querySelector(".ef-feed");
                if (feedEl && feedEl.children.length === 0) {
                    feedEl.appendChild(_efStateEl("loading"));
                }
            }, 1000);
        }
        _efUpdateCount(searchCount, 0, 0);
        return;
    }

    if (container._efLoadingTimer) {
        clearTimeout(container._efLoadingTimer);
        container._efLoadingTimer = null;
    }

    // Empty state (received but no items)
    if (dataArray.length === 0) {
        feed.appendChild(_efStateEl("empty"));
        _efUpdateCount(searchCount, 0, 0);
        return;
    }

    // Render cards
    const cards = [];
    [...dataArray].reverse().forEach((item, index) => {
        const card = _efBuildCard(item, index, config);
        feed.appendChild(card);
        cards.push({ el: card, item });
    });

    _efApplyFilter(cards, prevQuery, searchCount, config);

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();
        container._efSearchQuery = query;
        _efApplyFilter(cards, query, searchCount, config);
    });
}

// ── Card builder ──────────────────────────────────────────────────────────────
function _efBuildCard(item, index, config) {
    const pillInfo  = config.getPillInfo(item);
    const variant   = _EF_VARIANTS[pillInfo.variant] || _EF_VARIANTS.info;
    const endpoint  = config.getEndpoint(item) || "-";
    const path      = config.getPath(item) || null;
    const ts        = config.getTimestamp(item) || null;
    const fields    = Object.entries(config.getFields(item) || {});

    const card = document.createElement("div");
    card.className = "ef-card";
    card.style.borderLeftColor = variant.color;
    card.style.animationDelay  = `${index * 0.03}s`;

    // Header
    const header = document.createElement("div");
    header.className = "ef-card-header";

    const pill = document.createElement("span");
    pill.className = "ef-pill";
    pill.innerText = pillInfo.label;
    pill.style.color       = variant.color;
    pill.style.background  = variant.bg;
    pill.style.borderColor = variant.border;

    const endpointEl = document.createElement("span");
    endpointEl.className = "ef-endpoint";
    endpointEl.innerText  = endpoint;
    endpointEl.title      = endpoint;

    const meta = document.createElement("span");
    meta.className = "ef-meta";

    if (path) {
        const p = document.createElement("span");
        p.className = "ef-meta-path";
        p.innerText = path;
        meta.appendChild(p);
    }
    if (ts) {
        const t = document.createElement("span");
        t.className = "ef-meta-ts";
        t.innerText = ts;
        meta.appendChild(t);
    }

    header.appendChild(pill);
    header.appendChild(endpointEl);
    header.appendChild(meta);

    // Body
    const body = document.createElement("div");
    body.className = "ef-card-body";

    if (fields.length === 0) {
        const e = document.createElement("span");
        e.className = "ef-empty-body";
        e.innerText = "empty payload";
        body.appendChild(e);
    } else {
        const PREVIEW = 2;
        const preview = fields.slice(0, PREVIEW);
        const hidden  = fields.slice(PREVIEW);

        const table = document.createElement("div");
        table.className = "ef-field-table";
        preview.forEach(([k, v]) => _efAppendCells(table, k, v));

        if (hidden.length > 0) {
            const hiddenWrap = document.createElement("div");
            hiddenWrap.className = "ef-hidden-fields";
            hiddenWrap.style.display = "none";
            hidden.forEach(([k, v]) => _efAppendCells(hiddenWrap, k, v));

            const btn     = document.createElement("button");
            btn.className = "ef-expand-btn";

            const chevron = document.createElement("span");
            chevron.className = "ef-expand-chevron";
            chevron.innerHTML = "&#8250;";

            const label   = document.createElement("span");
            const labelText = (n, open) =>
                open ? "hide fields" : `show ${n} more field${n !== 1 ? "s" : ""}`;
            label.innerText = labelText(hidden.length, false);

            btn.appendChild(chevron);
            btn.appendChild(label);
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const open = hiddenWrap.classList.contains("ef-hidden-fields--open");
                hiddenWrap.classList.toggle("ef-hidden-fields--open", !open);
                hiddenWrap.style.display = open ? "none" : "contents";
                chevron.style.transform  = open ? "" : "rotate(90deg)";
                label.innerText          = labelText(hidden.length, !open);
            });

            table.appendChild(hiddenWrap);
            table.appendChild(btn);
        }

        body.appendChild(table);
    }

    card.appendChild(header);
    card.appendChild(body);
    return card;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function _efAppendCells(parent, key, value) {
    const str = typeof value === "object" && value !== null
        ? JSON.stringify(value) : String(value);

    const k = document.createElement("span");
    k.className = "ef-field-key";
    k.innerText = key;
    k.title     = key;

    const sep = document.createElement("span");
    sep.className = "ef-field-sep";
    sep.innerText = ":";

    const v = document.createElement("span");
    v.className = "ef-field-val";
    v.innerText = str;
    v.title     = str;

    parent.appendChild(k);
    parent.appendChild(sep);
    parent.appendChild(v);
}

function _efApplyFilter(cards, query, countEl, config) {
    let visible = 0;
    cards.forEach(({ el, item }) => {
        const fields = config.getFields(item) || {};
        const haystack = [
            config.getEndpoint(item) || "",
            config.getPath(item)     || "",
            config.getTimestamp(item)|| "",
            config.getPillInfo(item).label,
            ...Object.keys(fields),
            ...Object.values(fields).map(v =>
                typeof v === "object" ? JSON.stringify(v) : String(v)
            )
        ].join(" ").toLowerCase();

        const match = !query || haystack.includes(query);
        el.classList.toggle("ef-card--hidden", !match);
        if (match) visible++;
    });
    _efUpdateCount(countEl, visible, cards.length);
}

function _efUpdateCount(el, visible, total) {
    el.innerText = visible === total
        ? `${total} event${total !== 1 ? "s" : ""}`
        : `${visible} / ${total}`;
}

function _efStateEl(type) {
    const wrap = document.createElement("div");
    wrap.className = `ef-state ef-state--${type}`;
    if (type === "loading") {
        wrap.innerHTML = `<div class="ef-spinner"></div><span>Waiting for events...</span>`;
    } else {
        wrap.innerHTML = `<span class="ef-state-icon">&#9671;</span><span>No events captured</span>`;
    }
    return wrap;
}

// ── Ready-made configs ────────────────────────────────────────────────────────
const EventFeedConfig = {

    /**
     * Config for postMessage events captured by monitor-script.js
     */
    postMessage: {
        getPillInfo(item) {
            return item.hasOwnProperty("targetOrigin")
                ? { label: "SENT",  variant: "danger"  }
                : { label: "RECV",  variant: "success" };
        },
        getEndpoint(item)  { return item.targetOrigin || item.origin || "-"; },
        getPath(item)      { return item.path || null; },
        getTimestamp(item) {
            return item.timestamp
                ? item.timestamp.replace("T", " ").replace("Z", "").split(".")[0]
                : null;
        },
        getFields(item) {
            const raw = item.message;
            if (raw && typeof raw.cm_wrap === "object") return raw.cm_wrap;
            if (raw && typeof raw === "object")         return raw;
            return {};
        }
    },

    /**
     * Config for stack trace events captured by stacktrace-monitor.js
     */
    stackTrace: {
        getPillInfo(item) {
            return item.operation === "set"
                ? { label: "SET", variant: "warn" }
                : { label: "GET", variant: "info" };
        },
        getEndpoint(item)  { return item.path; },
        getPath(item)      {
            try { return item.pageUrl ? new URL(item.pageUrl).pathname : null; }
            catch (_) { return null; }
        },
        getTimestamp(item) {
            return item.timestamp
                ? item.timestamp.replace("T", " ").replace("Z", "").split(".")[0]
                : null;
        },
        getFields(item) {
            const fields = { newValue: item.newValue };
            if (item.operation === "set" && item.oldValue !== undefined) {
                fields.oldValue = item.oldValue;
            }
            (item.stack || []).forEach((frame, i) => {
                fields[`  #${String(i).padStart(2, "0")}`] = frame;
            });
            return fields;
        }
    },

    /**
     * Config for cookie changes captured by initCookieMonitor()
     */
    cookie: {
        getPillInfo(item) {
            return item.removed
                ? { label: "REMOVED", variant: "danger" }
                : { label: "SET",     variant: "success" };
        },
        getEndpoint(item)  { return item.domain || "-"; },
        getPath(item)      { return item.path   || null; },
        getTimestamp(item) { return item.timestamp || null; },
        getFields(item) {
            return {
                name:     item.name,
                value:    item.value,
                cause:    item.cause,
                httpOnly: item.httpOnly,
                secure:   item.secure,
                samesite: item.samesite,
            };
        }
    }
};
// END MONITOR LOAD

/**
 * initVirtualSelect()
 *
 * initialize the virtual select element
 */
function initVirtualSelect() {
    VirtualSelect.init({ele: '.virtual-select-google-dork'});
    VirtualSelect.init({ele: '.virtual-select-general'});

    // initialize the tab search
    initVirtualSelectTabSearch();

    // add event listener to all virtual select elements to dispatch a change event on change
    // for the pentest parameters:
    pentestParametersEventListenerMultiple();
}

function initVirtualSelectTabSearch() {
    // use the tabsSorted for lookup in order to open the correct tab
    let tabsVsSorted = getTabsVsSorted()

    // initialize the virtual select element
    VirtualSelect.init({
        ele: '#cm-search-tab-general',
        options: tabsVsSorted["options"],
        search: true,
        labelRenderer: imageRendererTabs,
        selectedLabelRenderer: imageRendererTabs,
        placeholder: 'Select a tab to navigate...',
    });

    document.getElementById("cm-search-tab-general").addEventListener("change", function () {
        let selectedValue = this.value;

        // lookup the corresponding tab structure
        let tabstructure = lookupTabById(selectedValue)

        // open the bootstrap modal 1-by-1
        if (tabstructure["layer_1"] !== "") {
            let buttonL1 = document.querySelector("a[data-bs-toggle='tab'][href='#" + tabstructure["layer_1"].substring(1) + "']")
            dispatchClickEvent(buttonL1);

            if (tabstructure["layer_2"] !== "") {
                let buttonL2 = document.querySelector("a[data-bs-toggle='tab'][href='#" + tabstructure["layer_2"].substring(1) + "']")
                dispatchClickEvent(buttonL2);

                if (tabstructure["layer_3"] !== "") {
                    let buttonL3 = document.querySelector("a[data-bs-toggle='tab'][href='#" + tabstructure["layer_3"].substring(1) + "']")
                    dispatchClickEvent(buttonL3);
                }
            }
        }
    })

}

function imageRendererTabs(data) {
    let prefix = '';

    const img_path = data.customData?.img_path?.toLowerCase();
    const label = data.customData?.label?.toLowerCase();

    // Create a temporary container to parse the HTML string
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = `
                    <div> 
                        <img src="${img_path}" style="width:20px;height:20px;margin-right:8px;vertical-align:middle;"> 
                        <span>${label}</span>
                    </div>
                `;

    // Get the complete prefix (now with highlighted code)
    prefix = tempContainer.innerHTML;

    return `${prefix}${data.label}`;
}

/**
 * initToolTip()
 *
 * initializes the bootstrap tooltip
 */
function initTooltip() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
            delay: {"show": 50, "hide": 50}
        });
    });

    document.addEventListener('show.bs.tooltip', function () {
        var activeTooltips = document.querySelectorAll('.tooltip.show');
        activeTooltips.forEach(function (tooltip) {
            tooltip.tooltip('hide');
        });
    });
}


/**
 * initRefreshControl()
 *
 * add an event listener to all elements with the class 'refresh-control'
 */
function initRefreshControl() {
    document.querySelectorAll(".refresh-control").forEach(element => {
        // Add event listener to each element
        element.addEventListener("click", function () {
            let controlRefreshState = element.getAttribute("data-control-refresh-active");
            let controlRefreshTbody = document.getElementById(element.value)

            if (controlRefreshState === "true") {
                element.classList.remove("btn-outline-danger")
                element.classList.add("btn-outline-primary")
                element.innerText = "Start refresh"
                element.setAttribute("data-control-refresh-active", "false");
                controlRefreshTbody.setAttribute("data-control-update", "false")

            } else if (controlRefreshState === "false") {
                element.classList.remove("btn-outline-primary")
                element.classList.add("btn-outline-danger")
                element.innerText = "Stop refresh"
                element.setAttribute("data-control-refresh-active", "true");
                controlRefreshTbody.setAttribute("data-control-update", "true")

            }
        });
    });
}

/**
 * initReplaceHover()
 *
 * sets all the nav left menu items to have a hover effect
 */
function initReplaceHoverApp() {
    replaceHover("tab-1-img", "assets/icons/navbar/", "tab-1-gen-tooling.png", "tab-1-gen-tooling-hover.png")
    replaceHover("tab-2-img", "assets/icons/navbar/", "tab-2-enum-tooling.png", "tab-2-enum-tooling-hover.png")
    replaceHover("tab-3-img", "assets/icons/navbar/", "tab-3-exploit-assistant.png", "tab-3-exploit-assistant-hover.png")
    replaceHover("tab-4-img", "assets/icons/navbar/", "tab-4-shell-assistant.png", "tab-4-shell-assistant-hover.png")
    replaceHover("tab-5-img", "assets/icons/navbar/", "tab-5-checklist-assistant.png", "tab-5-checklist-assistant-hover.png")
    replaceHover("tab-6-img", "assets/icons/navbar/", "tab-6-useful-commands.png", "tab-6-useful-commands-hover.png")
    replaceHover("tab-7-img", "assets/icons/navbar/", "tab-7-resources.png", "tab-7-resources-hover.png")

    replaceHoverByClass("info-icon", "assets/icons/general/", "info.png", "info-hover.png")
}

/**
 * replaceHover()
 *
 * @param elementId id of the element that should be replaced (img element)
 * @param prefix prefix for where to find the images
 * @param image image to use
 * @param replaceImage onhover image to use
 */
function replaceHover(elementId, prefix, image, replaceImage) {
    // add onmouseenter (hover image)
    document.getElementById(elementId).addEventListener("mouseenter", function () {
        document.getElementById(elementId).src = `${prefix}${replaceImage}`
    })

    // add onmouseleave (standard image)
    document.getElementById(elementId).addEventListener("mouseleave", function () {
        document.getElementById(elementId).src = `${prefix}${image}`
    })
}

function replaceHoverByClass(className, prefix, image, replaceImage) {
    document.querySelectorAll(`.${className}`).forEach(element => {
        // add onmouseenter (hover image)
        element.addEventListener("mouseenter", function () {
            element.src = `${prefix}${replaceImage}`
            // update the pointer to indicate that it is clickable
            element.style.cursor = "pointer";
        })

        // add onmouseleave (standard image)
        element.addEventListener("mouseleave", function () {
            element.src = `${prefix}${image}`
            // reset the pointer to default
            element.style.cursor = "default";
        })
    })
}

/**
 * copyContentByClass()
 *
 * Copy content from elements using the 'copy-icon' and 'copy-icon-code' classes
 *
 */
function initCopyContentByClass() {
    document.addEventListener('click', function (event) {
            if (event.target.classList.contains('copy-icon') || event.target.classList.contains('copy-icon-code')) {
                if (activeCopyIcon) {
                    activeCopyIcon.src = "assets/icons/general/copy.png";
                }

                let img = event.target;
                activeCopyIcon = img;

                // Maintain the current position and other styles
                img.style.pointerEvents = "none";

                let container = event.target.closest('div');
                if (container) {
                    if (img.classList.contains('copy-icon')) {
                        let textarea = container.querySelector('textarea');
                        if (textarea) {
                            let textAreaText = textarea.value;
                            if (textAreaText.length === 0) {
                                createToast('Failed to copy - empty content', 3000, "error");
                            } else {
                                navigator.clipboard.writeText(textAreaText).then(() => {
                                    console.log('[*] Code copied to clipboard');
                                    createToast('Content has been copied successfully!', 3000);
                                }).catch(err => {
                                    console.error('[*] Could not copy code:', err);
                                });
                            }
                        }
                    } else if (img.classList.contains('copy-icon-code')) {
                        let preElement = container.querySelector('pre');
                        if (preElement) {
                            let codeElement = preElement.querySelector('code');
                            if (codeElement) {
                                // Check if line numbers are present (hljs-ln-code elements)
                                let codeLines = codeElement.querySelectorAll('.hljs-ln-code');
                                let codeText;

                                if (codeLines.length > 0) {
                                    // Extract text only from code lines, excluding line numbers
                                    codeText = Array.from(codeLines)
                                        .map(line => line.textContent)
                                        .join('\n');
                                } else {
                                    // Fallback to innerText if no line numbers present
                                    codeText = codeElement.innerText;
                                }

                                if (codeText.length === 0) {
                                    createToast('Failed to copy - empty content', 3000, "error");
                                    return;
                                } else {
                                    navigator.clipboard.writeText(codeText).then(() => {
                                        console.log('[*] Code copied to clipboard');
                                        createToast('Content has been copied successfully!', 3000);
                                    }).catch(err => {
                                        console.error('[*] Could not copy code:', err);
                                    });
                                }
                            }
                        }

                    }

                    img.src = "assets/icons/general/copy-success.png";
                    setTimeout(function () {
                        if (activeCopyIcon === img) {
                            img.src = "assets/icons/general/copy.png";
                            img.style.pointerEvents = "";
                            activeCopyIcon = null;
                        }
                    }, 2000);
                }
            }
        }
    )
    ;
}

let activeCopyIcon = null;


/**
 * initCopyContentByClass
 *
 * reset the content given in by class
 */
function initResetContentByClass() {
    document.querySelectorAll(".reset-button").forEach(element => {

        // retrieve the img element inside the 'element'
        let imgElement = element.querySelector('img');
        if (!imgElement) return; // Ensure img element exists before continuing

        // add an event listener for when it is clicked
        element.addEventListener("click", function () {
            browser.runtime.sendMessage({command: imgElement.getAttribute("data-reset-command")});

            if (imgElement.hasAttribute("data-reset-target")) {
                document.getElementById(imgElement.getAttribute("data-reset-target")).innerHTML = "";
            }

            if (imgElement.hasAttribute("data-reset-count-target")) {
                document.getElementById(imgElement.getAttribute("data-reset-count-target")).innerHTML = 0;
            }
        });

        // replace the image when a user enters
        element.addEventListener("mouseenter", function () {
            imgElement.src = "assets/icons/general/reset-hover.png";
        });

        // replace the image when a user leaves
        element.addEventListener("mouseout", function () {
            imgElement.src = "assets/icons/general/reset.png";
        });
    });
}

/**
 * initApplyPentestParameters()
 *
 * Initializes the "Apply Changes" button for pentest parameters.
 */
function initApplyPentestParameters() {
    // save the button as a local variable
    let button = document.getElementById(pentestParameterUpdateButtonId);

    // Add an event listener to the apply changes button
    button.addEventListener("click", function () {

        // save the original content of the button
        let originalContent = button.innerHTML;

        // change the content of the button to indicate that it is updating
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'
        button.setAttribute("disabled", "true");

        // wait 1.5 seconds before updating the button content
        setTimeout(() => {
            button.innerHTML = "Updated!";
            // wait another second before resetting the button content and removing the disabled attribute
            setTimeout(() => {
                button.innerHTML = originalContent;
                button.removeAttribute("disabled");
            }, 1000);
        }, 1500);
    })
}

/**
 * replacePentestParameters()
 *
 * replaces the pentest parameters in the given text with the values from localStorage
 * @param text
 * @returns {*}
 */
function replacePentestParameters(text) {
    // loop over pentest parameters
    Object.entries(pentestParameters).forEach(([id, placeholder]) => {
        text = text.replaceAll(placeholder, (localStorage.getItem(id) === "" ? placeholder : localStorage.getItem(id)));
    });
    return text
}

/**
 * Creates and displays a Bootstrap toast with the given message and options.
 *
 * @param {string} message - The message to be displayed inside the toast.
 * @param {number} [delay=3000] - The optional delay before the toast disappears (in milliseconds).
 */
function createToast(message, delay = 3000, icon = "success") {
    // Ensure there's a container for toasts at the bottom-right of the page
    let toastContainer = document.getElementById('toast-container');

    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'absolute';
        toastContainer.style.top = '20px';
        toastContainer.style.width = 'fit-content'; // Set width to fit content
        toastContainer.style.zIndex = '1050';
        toastContainer.style.left = '50%'; // Center horizontally
        toastContainer.style.transform = 'translateX(-50%)'; // Adjust for centering

        document.body.appendChild(toastContainer);
    }

    // Create a unique ID for the toast
    const toastId = `toast-${Date.now()}`;
    let usedIcon = icon === "success" ? "assets/icons/general/coloured/success-toast-icon.png" : "assets/icons/general/coloured/error-toast-icon.png";

    // Toast HTML structure
    const toastHTML = `
    <div id="${toastId}" 
         class="toast" 
         role="alert" 
         aria-live="assertive" 
         aria-atomic="true" 
         data-bs-delay="${delay}" 
         style="border-radius: 4px;">
        <div class="toast-header background-toast-header w-100">
            <div style="word-wrap: break-word; overflow-wrap: break-word;">
                <img src="${usedIcon}" alt="icon" style="width:20px;height:20px; margin-right:8px; vertical-align:middle;">
                ${message}
            </div>
        </div>
    </div>
`;

    // Append the toast to the container
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    // Initialize the toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);

    // Show the toast
    toast.show();

    // Automatically remove the toast after it disappears
    setTimeout(() => {
        toastElement.remove();
    }, delay);
}
