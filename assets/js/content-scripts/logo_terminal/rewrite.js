var characters =
    // ASCII Printable Characters (32-126)
    " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~" +

    // Extended ASCII Characters (128-255)
    "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥©§«»ÁÂÀ©±" +

    // More Unicode symbols and special characters
    "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ"

// Helper function to get text nodes within an element
function getTextNodes(element) {
    var textNodes = [];
    var walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while (node = walker.nextNode()) {
        if (node.nodeValue.trim().length > 0) {
            textNodes.push(node);
        }
    }
    return textNodes;
}

// Select half of the text nodes randomly
function selectRandomHalf(nodes) {
    let halfCount = Math.floor(nodes.length / 2);
    let selectedNodes = [];

    while (selectedNodes.length < halfCount) {
        let randomIndex = Math.floor(Math.random() * nodes.length);
        let node = nodes.splice(randomIndex, 1)[0]; // Remove the node and add it to selected
        selectedNodes.push(node);
    }

    return selectedNodes;
}

// Typewriter effect function with improved character matching
function typeWriter(txt, node, speed, a = 0, c = 0) {
    if (c >= txt.length) {
        return; // Completed typing
    }

    // Find the index of the current character in the characters string
    let charIndex = characters.indexOf(txt[c]);

    if (charIndex !== -1 && characters[a] === txt[c]) {
        // Character matched, so type it
        node.nodeValue += characters[a];
        setTimeout(() => typeWriter(txt, node, speed, 0, ++c), speed);
    } else if (charIndex === -1) {
        // Character not found in the character set, directly add it
        node.nodeValue += txt[c];
        setTimeout(() => typeWriter(txt, node, speed, 0, ++c), speed);
    } else {
        // Keep searching for the matching character
        a = (a + 1) % characters.length; // Iterate circularly through characters
        node.nodeValue += characters[a];
        setTimeout(() => {
            node.nodeValue = node.nodeValue.slice(0, -1);
            typeWriter(txt, node, speed, a, c);
        }, speed);
    }
}

// Main function to execute typewriter effect on half the text nodes
function startRandomTypewriterEffect(speed) {
    var allTextNodes = getTextNodes(document.body);

    if (allTextNodes.length === 0) return;

    var selectedNodes = selectRandomHalf(allTextNodes);

    // Iterate over selected nodes, saving their original text and applying typewriter effect
    selectedNodes.forEach(function (node) {
        var originalText = node.nodeValue;
        node.nodeValue = ''; // Clear the text
        typeWriter(originalText, node, speed); // Apply typewriter effect with the original text
    });
}
