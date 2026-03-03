class TextArea {
    constructor(id, rowCount) {
        this.id = id;
        this.imgSrc = 'assets/icons/general/copy.png';
        this.rowCount  = rowCount;
        this.textArea = createElement('textarea', ['form-control']);
    }

    buildTextArea(){
        let divContainer = createElement('div', ['form-group']);
        let divL1 = createElement('div', ["position-relative", "d-flex"]);

        this.textArea.rows = this.rowCount;
        this.textArea.style.cssText = 'width: 100%; padding-right:40px;';
        this.textArea.className = 'form-control';
        this.textArea.rows = this.rowCount;
        this.textArea.id = this.id;

        divL1.appendChild(this.textArea);
        divL1.appendChild(this.#buildCopyIcon());
        divContainer.appendChild(divL1);

        return divContainer;
    }

    #buildCopyIcon(){
        let a = createElement("a", [])
        let img = createElement("img", ["copy-icon"]);

        img.src = this.imgSrc;
        img.style.cssText = 'position: absolute; bottom: 5px; right: 5px;height: 25px; width: 25px;';
        img.setAttribute("alt", "Copy");

        a.appendChild(img);
        return a
    }
}