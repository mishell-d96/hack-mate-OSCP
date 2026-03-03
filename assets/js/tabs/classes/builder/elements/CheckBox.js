class CheckBox {
    constructor(id, labelText, toolTipText) {
        this.id = id;
        this.labelText = labelText;
        this.toolTipText = toolTipText
        this.divCheck = createElement('div', ["form-group", "form-check"]);
        this.check = createElement('input', ["form-check-input"]);
        this.label = createElement('label', ["form-check-label"]);
    }

    buildCheckBox(){
        this.check.type = "checkbox";
        this.check.id = this.id;

        this.label.setAttribute("data-bs-toggle", "tooltip")
        this.label.setAttribute("data-bs-placement", "top")
        this.label.setAttribute("title", this.toolTipText)

        this.label.htmlFor = this.id;
        this.label.innerText = this.labelText;

        this.divCheck.appendChild(this.check);
        this.divCheck.appendChild(this.label);

        return this.divCheck;
    }
}