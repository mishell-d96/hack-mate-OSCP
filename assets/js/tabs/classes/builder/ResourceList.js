class ResourceList {
    constructor(jsonResourceList, containerId) {
        this.jsonResourceList = jsonResourceList;
        this.containerId = containerId;
        this.build();
    }

    build(){
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with ID ${this.containerId} not found.`);
            return;
        }
        let counter = 1;

        this.jsonResourceList.forEach(resource => {
            // Initialize all relevant variables
            let resourceTr = document.createElement('tr');
            let resourceTdIndex = document.createElement('td');
            let resourceTdDescription = document.createElement('td');
            let resourceTdRemoteLinks = document.createElement('td');
            let resourceUnorderedList = document.createElement('ul');
            resourceUnorderedList.classList.add('m-0', 'p-0', 'list-unstyled');
            resourceTdDescription.classList.add("w-50")

            // set the description
            resourceTdIndex.textContent = counter
            resourceTdDescription.textContent = resource.description;

            // loop over all links and create a link element for each
            resource["remote_links"].forEach(element => {
                let resourceListItem = document.createElement('li');
                let resourceLink = document.createElement('a');
                resourceLink.setAttribute("data-bs-toggle", "tooltip");
                resourceLink.setAttribute("data-bs-title", element.tooltip);

                resourceLink.textContent = element.name;
                resourceLink.href = element.url;

                resourceListItem.appendChild(resourceLink)
                resourceUnorderedList.appendChild(resourceListItem);
            })
            resourceTdRemoteLinks.appendChild(resourceUnorderedList);

            // apply all elements
            resourceTr.appendChild(resourceTdIndex);
            resourceTr.appendChild(resourceTdDescription);
            resourceTr.appendChild(resourceTdRemoteLinks);
            container.appendChild(resourceTr);
            counter += 1
        });
    }
}