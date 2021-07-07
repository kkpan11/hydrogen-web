export class HTMLParseResult {
    constructor(bodyNode) {
        this._bodyNode = bodyNode;
    }

    get rootNodes() {
        return Array.from(this._bodyNode.childNodes);
    }
    
    getChildNodes(node) {
        return Array.from(node.childNodes);
    }

    getAttributeNames(node) {
        return Array.from(node.getAttributeNames());
    }

    getAttributeValue(node, attr) {
        return node.getAttribute(attr);
    }

    isTextNode(node) { 
        return node.nodeType === Node.TEXT_NODE;
    }

    getNodeText(node) {
        return node.nodeValue;
    }

    isElementNode(node) {
        return node.nodeType === Node.ELEMENT_NODE;
    }

    getNodeElementName(node) {
        return node.tagName;
    }
}
