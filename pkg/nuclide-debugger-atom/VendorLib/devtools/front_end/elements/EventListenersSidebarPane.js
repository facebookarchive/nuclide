/*
 * Copyright (C) 2007 Apple Inc.  All rights reserved.
 * Copyright (C) 2009 Joseph Pecoraro
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @extends {WebInspector.ElementsSidebarPane}
 */
WebInspector.EventListenersSidebarPane = function()
{
    WebInspector.ElementsSidebarPane.call(this, WebInspector.UIString("Event Listeners"));
    this.registerRequiredCSS("components/objectValue.css");
    this.bodyElement.classList.add("events-pane");

    this._treeOutline = new TreeOutline(true);
    this._treeOutline.element.classList.add("event-listener-tree", "outline-disclosure", "monospace");
    this.bodyElement.appendChild(this._treeOutline.element);

    var refreshButton = this.titleElement.createChild("button", "pane-title-button refresh");
    refreshButton.addEventListener("click", this.update.bind(this), false);
    refreshButton.title = WebInspector.UIString("Refresh");

    this.settingsSelectElement = this.titleElement.createChild("select", "select-filter");

    var option = this.settingsSelectElement.createChild("option");
    option.value = "all";
    option.label = WebInspector.UIString("All Nodes");

    option = this.settingsSelectElement.createChild("option");
    option.value = "selected";
    option.label = WebInspector.UIString("Selected Node Only");

    var filter = WebInspector.settings.eventListenersFilter.get();
    if (filter === "all")
        this.settingsSelectElement[0].selected = true;
    else if (filter === "selected")
        this.settingsSelectElement[1].selected = true;
    this.settingsSelectElement.addEventListener("click", consumeEvent, false);
    this.settingsSelectElement.addEventListener("change", this._changeSetting.bind(this), false);

    this._linkifier = new WebInspector.Linkifier();
}

WebInspector.EventListenersSidebarPane._objectGroupName = "event-listeners-sidebar-pane";

WebInspector.EventListenersSidebarPane.prototype = {
    /**
     * @override
     * @param {!WebInspector.Throttler.FinishCallback} finishCallback
     * @protected
     */
    doUpdate: function(finishCallback)
    {
        if (this._lastRequestedNode) {
            this._lastRequestedNode.target().runtimeAgent().releaseObjectGroup(WebInspector.EventListenersSidebarPane._objectGroupName);
            delete this._lastRequestedNode;
        }

        this._linkifier.reset();

        var body = this.bodyElement;
        body.removeChildren();
        this._treeOutline.removeChildren();

        var node = this.node();
        if (!node) {
            finishCallback();
            return;
        }

        this._lastRequestedNode = node;
        node.eventListeners(WebInspector.EventListenersSidebarPane._objectGroupName, this._onEventListeners.bind(this, finishCallback));
    },

    /**
     * @param {!WebInspector.Throttler.FinishCallback} finishCallback
     * @param {?Array.<!WebInspector.DOMModel.EventListener>} eventListeners
     */
    _onEventListeners: function(finishCallback, eventListeners)
    {
        if (!eventListeners) {
            finishCallback();
            return;
        }

        var body = this.bodyElement;
        var node = this.node();
        var selectedNodeOnly = "selected" === WebInspector.settings.eventListenersFilter.get();
        var treeItemMap = new Map();
        eventListeners.stableSort(compareListeners);

        /**
         * @param {!WebInspector.DOMModel.EventListener} a
         * @param {!WebInspector.DOMModel.EventListener} b
         * @return {number}
         */
        function compareListeners(a, b)
        {
            var aType = a.payload().type;
            var bType = b.payload().type;
            return aType === bType ? 0 :
                aType > bType ? 1 : -1;
        }

        for (var i = 0; i < eventListeners.length; ++i) {
            var eventListener = eventListeners[i];
            if (selectedNodeOnly && (node.id !== eventListener.payload().nodeId))
                continue;
            if (eventListener.location().script().isInternalScript())
                continue; // ignore event listeners generated by monitorEvent
            var type = eventListener.payload().type;
            var treeItem = treeItemMap.get(type);
            if (!treeItem) {
                treeItem = new WebInspector.EventListenersTreeElement(type, node.id, this._linkifier);
                treeItemMap.set(type, treeItem);
                this._treeOutline.appendChild(treeItem);
            }
            treeItem.addListener(eventListener);
        }
        if (treeItemMap.size === 0)
            body.createChild("div", "info").textContent = WebInspector.UIString("No Event Listeners");
        else
            body.appendChild(this._treeOutline.element);

        finishCallback();
    },

    _changeSetting: function()
    {
        var selectedOption = this.settingsSelectElement[this.settingsSelectElement.selectedIndex];
        WebInspector.settings.eventListenersFilter.set(selectedOption.value);
        this.update();
    },

    __proto__: WebInspector.ElementsSidebarPane.prototype
}

/**
 * @constructor
 * @extends {TreeElement}
 */
WebInspector.EventListenersTreeElement = function(title, nodeId, linkifier)
{
    this._nodeId = nodeId;
    this._linkifier = linkifier;

    TreeElement.call(this, title);
    this.toggleOnClick = true;
    this.selectable = false;
}

WebInspector.EventListenersTreeElement.prototype = {
    /**
     * @param {!WebInspector.DOMModel.EventListener} eventListener
     */
    addListener: function(eventListener)
    {
        var treeElement = new WebInspector.EventListenerBar(eventListener, this._nodeId, this._linkifier);
        this.appendChild(treeElement);
    },

    __proto__: TreeElement.prototype
}

/**
 * @constructor
 * @extends {TreeElement}
 * @param {!WebInspector.DOMModel.EventListener} eventListener
 * @param {!DOMAgent.NodeId} nodeId
 * @param {!WebInspector.Linkifier} linkifier
 */
WebInspector.EventListenerBar = function(eventListener, nodeId, linkifier)
{
    TreeElement.call(this, "", true);

    var target = eventListener.target();
    this._runtimeModel = target.runtimeModel;
    this._eventListener = eventListener;
    this._nodeId = nodeId;
    this._setNodeTitle(linkifier);
    this.editable = false;
}

WebInspector.EventListenerBar.prototype = {
    onpopulate: function()
    {
        /**
         * @param {?WebInspector.RemoteObject} nodeObject
         * @this {WebInspector.EventListenerBar}
         */
        function updateWithNodeObject(nodeObject)
        {
            var properties = [];
            var payload = this._eventListener.payload();

            properties.push(this._runtimeModel.createRemotePropertyFromPrimitiveValue("useCapture", payload.useCapture));
            properties.push(this._runtimeModel.createRemotePropertyFromPrimitiveValue("attachment", payload.isAttribute ? "attribute" : "script"));
            if (nodeObject)
                properties.push(new WebInspector.RemoteObjectProperty("node", nodeObject));
            if (typeof payload.handler !== "undefined") {
                var remoteObject = this._runtimeModel.createRemoteObject(payload.handler);
                properties.push(new WebInspector.RemoteObjectProperty("handler", remoteObject));
            }

            WebInspector.ObjectPropertyTreeElement.populateWithProperties(this, properties, [], true, null);
        }
        this._eventListener.node().resolveToObject(WebInspector.EventListenersSidebarPane._objectGroupName, updateWithNodeObject.bind(this));
    },

    /**
     * @param {!WebInspector.Linkifier} linkifier
     */
    _setNodeTitle: function(linkifier)
    {
        var node = this._eventListener.node();
        if (!node)
            return;

        this.listItemElement.removeChildren();
        var title = this.listItemElement.createChild("span");
        var subtitle = this.listItemElement.createChild("span", "event-listener-tree-subtitle");
        subtitle.appendChild(linkifier.linkifyRawLocation(this._eventListener.location(), this._eventListener.sourceName()));

        if (node.nodeType() === Node.DOCUMENT_NODE) {
            title.textContent = "document";
            return;
        }

        if (node.id === this._nodeId) {
            title.textContent = WebInspector.DOMPresentationUtils.simpleSelector(node);
            return;
        }

        title.appendChild(WebInspector.DOMPresentationUtils.linkifyNodeReference(node));
    },

    __proto__: TreeElement.prototype
}
