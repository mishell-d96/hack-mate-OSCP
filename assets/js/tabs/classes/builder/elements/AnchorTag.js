class AnchorTag{
    constructor(text, hrefLink, imgSrc, imgSrcHover, width, height){
        this.text = text;
        this.hrefLink = hrefLink;
        this.imgSrc = imgSrc;
        this.imgSrcHover = imgSrcHover;
        this.width = width;
        this.height = height;
    }


    /**
     * buildAnchorTagWithImageHover()
     *
     * builds an anchor tag with an image and returns it
     * @returns {HTMLElement}
     */
    buildAnchorTagWithImageHover(){
        let a = createElement("a", []);
        a.href = this.hrefLink
        a.style.cssText = `height: ${this.height}px; width: ${this.width}px;`;

        let img = createElement("img", []);
        img.src = this.imgSrc;
        img.style.cssText = `height: ${this.height}px; width: ${this.width}px;`;

        img.addEventListener('mouseover', () => {
            img.src = this.imgSrcHover;
        })

        img.addEventListener('mouseout', () => {
            img.src = this.imgSrc;
        })

        a.appendChild(img)
        return a;
    }

    /**
     * buildAnchorTag()
     *
     * builds an anchor tag and returns it
     */
    buildAnchorTag() {
        let a = createElement("a", []);
        a.href = this.hrefLink;
        a.textContent = this.text;
        return a;
    }
}