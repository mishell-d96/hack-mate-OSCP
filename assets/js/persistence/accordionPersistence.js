function initAccordionPersistence() {
    const allAccordions = document.querySelectorAll('.accordion');

    function handleItemClick(event) {
        const button = event.currentTarget;
        const targetId = button.getAttribute('data-bs-target').replace('#', '');
        const targetItem = document.getElementById(targetId);
        const isActive = targetItem.classList.contains('show');

        if (isActive) {
            // If the item is currently open, we are about to close it, so clear the localStorage
            localStorage.removeItem('active-accordion-item');
        } else {

            // If the item is currently closed, we are about to open it, so set the localStorage
            if (localStorage.getItem('active-accordion-item')) {
                if (localStorage.getItem("active-accordion-item") === targetId) {
                    localStorage.removeItem('active-accordion-item');
                } else {
                    localStorage.setItem('active-accordion-item', targetId);
                }
            } else {
                localStorage.setItem('active-accordion-item', targetId);
            }
        }
    }

    function initializeAllAccordions() {
        const activeItemId = localStorage.getItem('active-accordion-item');
        if (activeItemId) {
            const activeItem = document.getElementById(activeItemId);
            if (activeItem) {
                new bootstrap.Collapse(activeItem, {toggle: true});
            }
        }

        allAccordions.forEach(accordion => {
            accordion.querySelectorAll('.accordion-button').forEach(button => {
                button.addEventListener('click', handleItemClick);
            });
        });
    }

    initializeAllAccordions();
}
