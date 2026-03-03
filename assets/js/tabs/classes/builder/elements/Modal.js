class Modal {
    constructor(modalId, imgSrc, imgSrcHover, width, height, hoverText, modalHeaderText = null) {
        this.modalId = modalId;
        this.imgSrc = imgSrc;
        this.imgSrcHover = imgSrcHover;
        this.width = width;
        this.height = height;
        this.hoverText = hoverText;
        this.modalHeaderText = modalHeaderText
    }

    /**
     * buildModalButton()
     *
     * build a modal using bootstrap modal structure
     */
    #buildModalButton() {
        let a = createElement("a", [])
        a.setAttribute("href", `#${this.modalId}`)
        a.setAttribute("data-bs-target", `#${this.modalId}`)
        a.setAttribute("data-bs-toggle", "modal")
        a.style.cssText = `height: ${this.height}px !important; width: ${this.width}px !important;`

        let img = createElement("img", [])
        img.setAttribute("src", this.imgSrc)
        img.style.cssText = `width: ${this.width}px !important; height: ${this.height}px !important;`

        if (this.hoverText) {
            img.setAttribute("data-bs-toggle", "tooltip")
            img.setAttribute("data-bs-placement", "right")
            img.setAttribute("title", this.hoverText)
        }

        img.addEventListener("mouseover", () => {
            img.src = this.imgSrcHover
        })
        img.addEventListener("mouseout", () => {
            img.src = this.imgSrc
        })

        a.appendChild(img)

        return a;
    }

    /**
     * buildModal()
     *
     * build a modal using bootstrap modal structure
     */
    buildModal(modalBodyContent) {
        let divContainer = createElement("div", ["modal", "fade"])
        let modalDialog = createElement("div", ["modal-dialog", "modal-dialog-centered"])
        let modalContent = createElement("div", ["modal-content"])
        let modalHeader = createElement("div", ["modal-header"])
        let modalBody = createElement("div", ["modal-body", "p-1"])
        let headerText = createElement("h5", ["modal-title"])
        let modalCloseBtn = createElement("button", ["btn-close", "btn-close-white"])

        divContainer.setAttribute("id", this.modalId)
        divContainer.setAttribute("tabindex", "-1")
        divContainer.setAttribute("aria-labelledby", `${this.modalId}-label`)
        divContainer.setAttribute("aria-hidden", "true")

        headerText.setAttribute("id", `${this.modalId}-label`)
        headerText.innerText = this.modalHeaderText == null ? this.hoverText : this.modalHeaderText;

        modalCloseBtn.setAttribute("type", "button")
        modalCloseBtn.setAttribute("data-bs-dismiss", "modal")
        modalCloseBtn.setAttribute("aria-label", "Close")

        // Set fullscreen styles (keeping rounded borders)
        modalDialog.style.maxWidth = "none"
        modalDialog.style.margin = "0"
        modalDialog.style.width = `${window.innerWidth}px`
        modalDialog.style.height = `${window.innerHeight}px`

        modalContent.style.width = "100%"
        modalContent.style.height = "100%"
        // borderRadius removed - keeps Bootstrap's default rounded corners

        modalBody.style.height = "calc(100% - 60px)" // Adjust based on header height
        modalBody.style.overflowY = "auto"

        modalBody.appendChild(modalBodyContent)
        modalHeader.appendChild(headerText)
        modalHeader.appendChild(modalCloseBtn)

        modalContent.appendChild(modalHeader)
        modalContent.appendChild(modalBody)

        modalDialog.appendChild(modalContent)
        divContainer.appendChild(modalDialog)

        document.getElementById("modal-container").appendChild(divContainer)
        this.#openModalEventListener(this.modalId);
        this.#closeModalEventListener(this.modalId);

        return this.#buildModalButton()
    }

    #openModalEventListener(modalId) {
        document.getElementById(modalId).addEventListener('shown.bs.modal', function () {
            localStorage.setItem('activeModal', modalId);
        });
    }

    #closeModalEventListener(modalId){
        document.getElementById(modalId).addEventListener('hidden.bs.modal', function () {
            localStorage.setItem('activeModal', "");
        });
    }

}