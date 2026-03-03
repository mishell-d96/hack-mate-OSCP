/**
 * persistDataMonitor()
 *
 * Monitor the persist data switch and setup a mutation observer to save elements to local storage when they change.
 */
function initPersistDataMonitor() {
    const persistDataSwitch = document.getElementById("persist-data-checkbox");

    if (localStorage.getItem("persistDataSwitch") === "true") {
        persistDataSwitch.checked = true;
        loadElementsFromLocalStorage();
        setupMutationObserver();
    } else {
        removeElementsFromLocalStorage();
    }

    persistDataSwitch.addEventListener("change", function () {
        const isChecked = persistDataSwitch.checked;
        localStorage.setItem("persistDataSwitch", isChecked);
        if (isChecked) {
            setupMutationObserver();
        }
    });
}

/**
 * setupMutationObserver()
 *
 * Setup a mutation observer to save elements to local storage when they change.
 */
function setupMutationObserver() {
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'attributes' || mutation.type === 'characterData') {
                saveElementsToLocalStorage();
            }
        });
    });

    const config = {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true
    };

    document.querySelectorAll('textarea, input[type="checkbox"], button, select, code').forEach(function (element) {
        if (element.id !== 'persist-data-checkbox') {
            observer.observe(element, config);
        }
    });

    // Use addGlobalEventListener for dynamic elements
    addGlobalEventListener('change', 'input[type="checkbox"], select', saveElementsToLocalStorage);
    addGlobalEventListener('change', 'textarea', saveElementsToLocalStorage);
    addGlobalEventListener('input', 'textarea, button', saveElementsToLocalStorage);
    addGlobalEventListener('change', '.virtual-select-general', (event) => {
        localStorage.setItem(event.target.id, event.target.value)
    });
    addGlobalEventListener('change', '.virtual-select-google-dork', (event) => {
        localStorage.setItem(event.target.id, JSON.stringify(event.target.value))
    });
}

/**
 * removeElementsFromLocalStorage()
 *
 * Remove all elements from local storage.
 */
function removeElementsFromLocalStorage() {
    for (const key of Object.keys(localStorage)) {
        if (key !== "layer_1_tab" && key !== "layer_2_tab" && key !== "layer_3_tab" && key !== "persistDataSwitch") {
            localStorage.removeItem(key);
        }
    }
}

/**
 * loadElementsFromLocalStorage()
 *
 * load all elements from local storage
 */
function loadElementsFromLocalStorage() {
    const selectors = {
        'textarea': 'value',
        'input[type="checkbox"]:not(#persist-data-checkbox)': 'checked',
        'button': 'value',
        'select': 'value',
        'code': 'textContent',
        '.virtual-select-google-dork': 'value',
        '.virtual-select-general': 'value'
    };


    for (const selector in selectors) {
        document.querySelectorAll(selector).forEach(element => {

            const savedValue = localStorage.getItem(element.id);

            if (savedValue !== null) {
                if (selector === 'input[type="checkbox"]:not(#persist-data-checkbox)') {
                    element.checked = savedValue === 'true';
                } else if (element.classList.contains("virtual-select") && savedValue !== "") {
                    if (Formatter.isValidJSON(savedValue)) {
                        element.setValue(JSON.parse(savedValue))
                    }
                } else {
                    element[selectors[selector]] = savedValue;
                }
                if (selector === 'textarea' && Formatter.isValidJSON(savedValue)) {
                    element.value = Formatter.formatJSON(savedValue);
                }
            }
        });
    }
}

/**
 * saveElementsToLocalStorage()
 *
 * save all elements to local storage
 */
function saveElementsToLocalStorage() {
    const selectors = {
        'textarea': 'value',
        'input[type="checkbox"]:not(#persist-data-checkbox)': 'checked',
        'button': 'value',
        'select': 'value',
        'code': 'textContent'
    };

    for (const selector in selectors) {
        document.querySelectorAll(selector).forEach(element => {
            if (element.id.length > 0) {
                value = element[selectors[selector]];
                localStorage.setItem(element.id, value);
            }
        });
    }
}

/**
 * saveElementToLocalStorage()
 *
 * save a single element to local storage
 */
function saveElementToLocalStorage(id, value) {
    localStorage.setItem(id, value)
}

/**
 * addGlobalEventListener()
 *
 * global event listener that listens for a specific event type and selector, and executes a callback function
 * @param type the type of event, e.g.: click, change, input
 * @param selector the selector to match the target element e.g.: input[type="checkbox"]
 * @param callback the callback function to execute
 */
function addGlobalEventListener(type, selector, callback) {
    document.addEventListener(type, e => {
        if (e.target.matches(selector)) {
            callback(e);
        }
    });
}
