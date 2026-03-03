function initModalPersistence() {
    initStaticModalsEventListener();
    initActiveModal();
}

/**
 * initActiveModal()
 *
 * initializes the active modal if there is 1 set in the 'activeModal' localStorage key
 */
function initActiveModal() {
    let activeModalId = localStorage.getItem("activeModal");
    if (activeModalId) {
        let activeModalElement = document.getElementById(activeModalId);
        if (activeModalElement) {
            let modal = new bootstrap.Modal(activeModalElement);
            modal.show();
        }
    }
}

/**
 * initStaticModalsEventListener()
 *
 * Initializes event listeners for all statically written modals to track their open/close state in localStorage.
 *
 * NOTE: GENERATED MODALS ARE SAVED IN THE CLASS ITSELF, THIS FUNCTION ONLY HANDLES STATIC MODALS
 */
function initStaticModalsEventListener() {
    document.querySelectorAll('.static-modal').forEach(modalElement => {
        let modalId = modalElement.id;
        document.getElementById(modalId).addEventListener('shown.bs.modal', function () {
            localStorage.setItem('activeModal', modalId);
        });

        document.getElementById(modalId).addEventListener('hidden.bs.modal', function () {
            localStorage.setItem('activeModal', "");
        });
    });
}