// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @constructor
 * @extends {WebInspector.ThrottledElementsSidebarView}
 */
WebInspector.AccessibilitySidebarView = function()
{
    WebInspector.ThrottledElementsSidebarView.call(this);
}

WebInspector.AccessibilitySidebarView.prototype = {
    /**
     * @override
     * @param {!WebInspector.Throttler.FinishCallback} finishCallback
     * @protected
     */
    doUpdate: function(finishCallback)
    {
        /**
         * @param {?AccessibilityAgent.AXNode} accessibilityNode
         * @this {WebInspector.AccessibilitySidebarView}
         */
        function accessibilityNodeCallback(accessibilityNode)
        {
            this._setAXNode(accessibilityNode);
            finishCallback();
        }
        this.node().target().accessibilityModel.getAXNode(this.node().id, accessibilityNodeCallback.bind(this));
    },

    /**
     * @override
     */
    wasShown: function()
    {
        WebInspector.ElementsSidebarPane.prototype.wasShown.call(this);
        if (this._treeOutline)
            return;

        this._treeOutline = new TreeOutlineInShadow();
        this._rootElement = new TreeElement("Accessibility Node", true);
        this._rootElement.selectable = false;
        this._treeOutline.appendChild(this._rootElement);
        this.element.appendChild(this._treeOutline.element);
        this._rootElement.expand();

        WebInspector.targetManager.addModelListener(WebInspector.DOMModel, WebInspector.DOMModel.Events.AttrModified, this._onNodeChange, this);
        WebInspector.targetManager.addModelListener(WebInspector.DOMModel, WebInspector.DOMModel.Events.AttrRemoved, this._onNodeChange, this);
        WebInspector.targetManager.addModelListener(WebInspector.DOMModel, WebInspector.DOMModel.Events.CharacterDataModified, this._onNodeChange, this);
        WebInspector.targetManager.addModelListener(WebInspector.DOMModel, WebInspector.DOMModel.Events.ChildNodeCountUpdated, this._onNodeChange, this);
    },

    /**
     * @override
     */
    willHide: function()
    {
        WebInspector.targetManager.removeModelListener(WebInspector.DOMModel, WebInspector.DOMModel.Events.AttrModified, this._onNodeChange, this);
        WebInspector.targetManager.removeModelListener(WebInspector.DOMModel, WebInspector.DOMModel.Events.AttrRemoved, this._onNodeChange, this);
        WebInspector.targetManager.removeModelListener(WebInspector.DOMModel, WebInspector.DOMModel.Events.CharacterDataModified, this._onNodeChange, this);
        WebInspector.targetManager.removeModelListener(WebInspector.DOMModel, WebInspector.DOMModel.Events.ChildNodeCountUpdated, this._onNodeChange, this);
    },

    /**
     * @param {?AccessibilityAgent.AXNode} axNode
     */
    _setAXNode: function(axNode)
    {
        if (this._axNode === axNode)
            return;
        this._axNode = axNode;

        var rootElement = this._rootElement;
        rootElement.removeChildren();

        if (!axNode)
            return;

        var target = this.node().target();

        function addProperty(property)
        {
            rootElement.appendChild(new WebInspector.AXNodePropertyTreeElement(property, target));
        }

        addProperty({name: "role", value: axNode.role});

        for (var propertyName of ["name", "description", "help", "value"]) {
            if (propertyName in axNode)
                addProperty({name: propertyName, value: axNode[propertyName]});
        }

        var propertyMap = {};
        for (var property of axNode.properties)
            propertyMap[property.name] = property;

        for (var propertySet of [AccessibilityAgent.AXWidgetAttributes, AccessibilityAgent.AXWidgetStates, AccessibilityAgent.AXGlobalStates, AccessibilityAgent.AXLiveRegionAttributes, AccessibilityAgent.AXRelationshipAttributes]) {
            for (var propertyKey in propertySet) {
                var property = propertySet[propertyKey];
                if (property in propertyMap)
                    addProperty(propertyMap[property]);
            }
        }
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _onNodeChange: function(event)
    {
        var node = this._axNode;
        this._axNode = null;
        this._setAXNode(node);
    },

    __proto__: WebInspector.ThrottledElementsSidebarView.prototype
};

/**
 * @constructor
 * @extends {TreeElement}
 * @param {!AccessibilityAgent.AXProperty} property
 * @param {!WebInspector.Target} target
 */
WebInspector.AXNodePropertyTreeElement = function(property, target)
{
    this._property = property;
    this._target = target;

    // Pass an empty title, the title gets made later in onattach.
    TreeElement.call(this, "");
    this.toggleOnClick = true;
    this.selectable = false;
}

WebInspector.AXNodePropertyTreeElement.prototype = {
    /**
     * @override
     */
    onattach: function()
    {
        this._update();
    },


    _update: function()
    {
        this._nameElement = WebInspector.AXNodePropertyTreeElement.createNameElement(this._property.name);

        var value = this._property.value;
        if (this._property.name === "role" && value.value === "") {
            this._valueElement = createElement("span");
            this._valueElement.textContent = WebInspector.UIString("<No matching ARIA role>");
        } else if (value.type === "idref") {
            this._valueElement = WebInspector.AXNodePropertyTreeElement.createRelationshipValueElement(value, this._target);
        } else if (value.type === "idrefList") {
            var relatedNodes = value.relatedNodeArrayValue;
            var numNodes = relatedNodes.length;
            var description = "(" + numNodes + (numNodes == 1 ? " node" : " nodes") + ")";
            value.value = description;
            for (var i = 0; i < relatedNodes.length; i++) {
                var backendId = relatedNodes[i].backendNodeId;
                var deferredNode = new WebInspector.DeferredDOMNode(this._target, relatedNodes[i].backendNodeId);
                var child = new WebInspector.AXRelatedNodeTreeElement(deferredNode);
                this.appendChild(child);
            }
            this._valueElement = WebInspector.AXNodePropertyTreeElement.createValueElement(value, this.listItemElement);
        } else {
            this._valueElement = WebInspector.AXNodePropertyTreeElement.createValueElement(value, this.listItemElement);
        }

        var separatorElement = createElementWithClass("span", "separator");
        separatorElement.textContent = ": ";

        this.listItemElement.removeChildren();
        this.listItemElement.appendChildren(this._nameElement, separatorElement, this._valueElement);
    },

    __proto__: TreeElement.prototype
}

/**
 * @param {!TreeElement} treeNode
 * @param {?AccessibilityAgent.AXNode} axNode
 * @param {!WebInspector.Target} target
 */
WebInspector.AXNodePropertyTreeElement.populateWithNode = function(treeNode, axNode, target)
{
}

/**
 * @param {?string} name
 * @return {!Element}
 */
WebInspector.AXNodePropertyTreeElement.createNameElement = function(name)
{
    var nameElement = createElementWithClass("span", "name");
    if (/^\s|\s$|^$|\n/.test(name))
        nameElement.createTextChildren("\"", name.replace(/\n/g, "\u21B5"), "\"");
    else
        nameElement.textContent = name;
    return nameElement;
}

/**
 * @param {!AccessibilityAgent.AXValue} value
 * @param {!WebInspector.Target} target
 * @return {?Element}
 */
WebInspector.AXNodePropertyTreeElement.createRelationshipValueElement = function(value, target)
{
    var deferredNode = new WebInspector.DeferredDOMNode(target, value.relatedNodeValue.backendNodeId);
    var valueElement = createElement("span");

    /**
     * @param {?WebInspector.DOMNode} node
     */
    function onNodeResolved(node)
    {
        valueElement.appendChild(WebInspector.DOMPresentationUtils.linkifyNodeReference(node));
    }
    deferredNode.resolve(onNodeResolved);

    return valueElement;
}

/**
 * @param {!AccessibilityAgent.AXValue} value
 * @param {!Element} parentElement
 * @return {!Element}
 */
WebInspector.AXNodePropertyTreeElement.createValueElement = function(value, parentElement)
{
    var valueElement = createElementWithClass("span", "value");
    var type = value.type;
    var prefix;
    var valueText;
    var suffix;
    if (type === "string") {
        // Render \n as a nice unicode cr symbol.
        // TODO(aboxhall): overflow ellipsis style
        prefix = "\"";
        valueText = value.value.replace(/\n/g, "\u21B5");
        suffix = "\"";
        valueElement._originalTextContent = "\"" + value.value + "\"";
    } else {
        // TODO(aboxhall): styles for all value types
        valueText = String(value.value);
    }
    valueElement.setTextContentTruncatedIfNeeded(valueText || "");
    if (prefix)
        valueElement.insertBefore(createTextNode(prefix), valueElement.firstChild);
    if (suffix)
        valueElement.createTextChild(suffix);

    valueElement.title = String(value.value) || "";

    return valueElement;
}

/**
 * @constructor
 * @extends {TreeElement}
 * @param {!WebInspector.DeferredDOMNode} deferredNode
 */
WebInspector.AXRelatedNodeTreeElement = function(deferredNode)
{
    this._deferredNode = deferredNode;

    TreeElement.call(this, "");
};

WebInspector.AXRelatedNodeTreeElement.prototype = {
    onattach: function()
    {
        this._update();
    },

    _update: function()
    {
        var valueElement = createElement("div");
        this.listItemElement.appendChild(valueElement);

        /**
         * @param {?WebInspector.DOMNode} node
         */
        function onNodeResolved(node)
        {
            valueElement.appendChild(WebInspector.DOMPresentationUtils.linkifyNodeReference(node));
        }
        this._deferredNode.resolve(onNodeResolved);
    },

    __proto__: TreeElement.prototype
};
