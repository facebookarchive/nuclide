/*
 * Copyright (C) IBM Corp. 2009  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of IBM Corp. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @extends {WebInspector.SidebarPane}
 */
WebInspector.WatchExpressionsSidebarPane = function()
{
    WebInspector.SidebarPane.call(this, WebInspector.UIString("Watch"));

    this._requiresUpdate = true;
    /** @type {!Array.<!WebInspector.WatchExpression>} */
    this._watchExpressions = [];

    this.registerRequiredCSS("components/objectValue.css");
    this.bodyElement.classList.add("vbox", "watch-expressions");
    this.bodyElement.addEventListener("contextmenu", this._contextMenu.bind(this), false);

    var refreshButton = this.titleElement.createChild("button", "pane-title-button refresh");
    refreshButton.addEventListener("click", this._refreshButtonClicked.bind(this), false);
    refreshButton.title = WebInspector.UIString("Refresh");

    var addButton = this.titleElement.createChild("button", "pane-title-button add");
    addButton.addEventListener("click", this._addButtonClicked.bind(this), false);
    addButton.title = WebInspector.UIString("Add watch expression");
    WebInspector.context.addFlavorChangeListener(WebInspector.ExecutionContext, this.refreshExpressions, this);
}

WebInspector.WatchExpressionsSidebarPane.prototype = {
    wasShown: function()
    {
        this._refreshExpressionsIfNeeded();
    },

    refreshExpressions: function()
    {
        this._requiresUpdate = true;
        this._refreshExpressionsIfNeeded();
    },

    /**
     * @param {string} expressionString
     */
    addExpression: function(expressionString)
    {
        this.expand();
        if (this._requiresUpdate) {
            this._rebuildWatchExpressions();
            delete this._requiresUpdate;
        }
        this._createWatchExpression(expressionString);
        this._saveExpressions();
    },

    _saveExpressions: function()
    {
        var toSave = [];
        for (var i = 0; i < this._watchExpressions.length; i++)
            if (this._watchExpressions[i].expression())
                toSave.push(this._watchExpressions[i].expression());

        WebInspector.settings.watchExpressions.set(toSave);
    },

    _refreshExpressionsIfNeeded: function()
    {
        if (this._requiresUpdate && this.isShowing()) {
            this._rebuildWatchExpressions();
            delete this._requiresUpdate;
        } else
            this._requiresUpdate = true;
    },

    /**
     * @param {?Event} event
     */
    _addButtonClicked: function(event)
    {
        if (event)
            event.consume(true);
        this.expand();
        this._createWatchExpression(null).startEditing();
    },

    /**
     * @param {!Event} event
     */
    _refreshButtonClicked: function(event)
    {
        event.consume();
        this.refreshExpressions();
    },

    _rebuildWatchExpressions: function()
    {
        this.bodyElement.removeChildren();
        this._watchExpressions = [];
        this._emptyElement = this.bodyElement.createChild("div", "info");
        this._emptyElement.textContent = WebInspector.UIString("No Watch Expressions");
        var watchExpressionStrings = WebInspector.settings.watchExpressions.get();
        for (var i = 0; i < watchExpressionStrings.length; ++i) {
            var expression = watchExpressionStrings[i];
            if (!expression)
                continue;

            this._createWatchExpression(expression);
        }
    },

    /**
     * @param {?string} expression
     * @return {!WebInspector.WatchExpression}
     */
    _createWatchExpression: function(expression)
    {
        this._emptyElement.classList.add("hidden");
        var watchExpression = new WebInspector.WatchExpression(expression);
        watchExpression.addEventListener(WebInspector.WatchExpression.Events.ExpressionUpdated, this._watchExpressionUpdated.bind(this));
        this.bodyElement.appendChild(watchExpression.element());
        this._watchExpressions.push(watchExpression);
        return watchExpression;
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _watchExpressionUpdated: function(event)
    {
        var watchExpression = /** @type {!WebInspector.WatchExpression} */ (event.target);
        if (!watchExpression.expression()) {
            this._watchExpressions.remove(watchExpression);
            this.bodyElement.removeChild(watchExpression.element());
            this._emptyElement.classList.toggle("hidden", !!this._watchExpressions.length);
        }

        this._saveExpressions();
    },

    /**
     * @param {!Event} event
     */
    _contextMenu: function(event)
    {
        var contextMenu = new WebInspector.ContextMenu(event);
        this._populateContextMenu(contextMenu, event);
        contextMenu.show();
    },

    /**
     * @param {!WebInspector.ContextMenu} contextMenu
     * @param {!Event} event
     */
    _populateContextMenu: function(contextMenu, event)
    {
        var isEditing = false;
        for (var watchExpression of this._watchExpressions)
           isEditing |=  watchExpression.isEditing();

        if (!isEditing)
            contextMenu.appendItem(WebInspector.UIString.capitalize("Add ^watch ^expression"), this._addButtonClicked.bind(this));

        if (this._watchExpressions.length > 1)
            contextMenu.appendItem(WebInspector.UIString.capitalize("Delete ^all ^watch ^expressions"), this._deleteAllButtonClicked.bind(this));

        for (var watchExpression of this._watchExpressions)
            if (watchExpression.element().containsEventPoint(event))
                watchExpression._populateContextMenu(contextMenu, event);
    },

    _deleteAllButtonClicked: function()
    {
        this._watchExpressions = [];
        this._saveExpressions();
        this._rebuildWatchExpressions();
    },

    __proto__: WebInspector.SidebarPane.prototype
}

/**
 * @constructor
 * @extends {WebInspector.Object}
 * @param {?string} expression
 */
WebInspector.WatchExpression = function(expression)
{
    this._expression = expression;
    this._element = createElementWithClass("div", "watch-expression monospace");
    this._editing = false;

    this._createWatchExpression(null, false);
    this.update();
}

WebInspector.WatchExpression._watchObjectGroupId = "watch-group";

WebInspector.WatchExpression.Events = {
    ExpressionUpdated: "ExpressionUpdated"
}

WebInspector.WatchExpression.prototype = {

    /**
     * @return {!Element}
     */
    element: function()
    {
        return this._element;
    },

    /**
     * @return {?string}
     */
    expression: function()
    {
        return this._expression;
    },

    update: function()
    {
        var currentExecutionContext = WebInspector.context.flavor(WebInspector.ExecutionContext);
        if (currentExecutionContext && this._expression)
            currentExecutionContext.evaluate(this._expression, WebInspector.WatchExpression._watchObjectGroupId, false, true, false, false, this._createWatchExpression.bind(this));
    },

    startEditing: function()
    {
        this._editing = true;
        this._element.removeChild(this._objectPresentationElement);
        var newDiv = this._element.createChild("div");
        newDiv.textContent = this._nameElement.textContent;
        this._textPrompt = new WebInspector.ObjectPropertyPrompt();
        this._textPrompt.renderAsBlock();
        var proxyElement = this._textPrompt.attachAndStartEditing(newDiv, this._finishEditing.bind(this, this._expression));
        proxyElement.classList.add("watch-expression-text-prompt-proxy");
        proxyElement.addEventListener("keydown", this._promptKeyDown.bind(this), false);
        this._element.getComponentSelection().setBaseAndExtent(newDiv, 0, newDiv, 1);
    },

    /**
     * @return {boolean}
     */
    isEditing: function()
    {
        return !!this._editing;
    },

    /**
     * @param {?string} newExpression
     * @param {!Event} event
     */
    _finishEditing: function(newExpression, event)
    {
        if (event)
            event.consume(true);

        this._editing = false;
        this._textPrompt.detach();
        delete this._textPrompt;
        this._element.removeChildren();
        this._element.appendChild(this._objectPresentationElement);
        this._updateExpression(newExpression);
    },

    /**
     * @param {!Event} event
     */
    _dblClickOnWatchExpression: function(event)
    {
        event.consume();
        if (!this.isEditing())
            this.startEditing();
    },

    /**
     * @param {?string} newExpression
     */
    _updateExpression: function(newExpression)
    {
        this._expression = newExpression;
        this.update();
        this.dispatchEventToListeners(WebInspector.WatchExpression.Events.ExpressionUpdated);
    },

    /**
     * @param {!Event} event
     */
    _deleteWatchExpression: function(event)
    {
        event.consume(true);
        this._updateExpression(null);
    },

    /**
     * @param {?WebInspector.RemoteObject} result
     * @param {boolean} wasThrown
     */
    _createWatchExpression: function(result, wasThrown)
    {
        this._result = result;

        var titleElement = createElementWithClass("div", "watch-expression-title");
        this._nameElement = WebInspector.ObjectPropertiesSection.createNameElement(this._expression);
        if (wasThrown || !result) {
            this._valueElement = createElementWithClass("span", "error-message value");
            titleElement.classList.add("dimmed");
            this._valueElement.textContent = WebInspector.UIString("<not available>");
        } else {
            this._valueElement = WebInspector.ObjectPropertiesSection.createValueElement(result, wasThrown, titleElement);
        }
        var separatorElement = createElementWithClass("span", "separator");
        separatorElement.textContent = ": ";
        titleElement.appendChildren(this._nameElement, separatorElement, this._valueElement);

        if (!wasThrown && result && result.hasChildren) {
            var objectPropertiesSection = new WebInspector.ObjectPropertiesSection(result, titleElement);
            this._objectPresentationElement = objectPropertiesSection.element;
            objectPropertiesSection.headerElement.addEventListener("click", this._onSectionClick.bind(this, objectPropertiesSection), false);
            objectPropertiesSection.doNotExpandOnTitleClick();
            this._installHover(objectPropertiesSection.headerElement);
        } else {
            this._objectPresentationElement = this._element.createChild("div", "primitive-value");
            this._objectPresentationElement.appendChild(titleElement);
            this._installHover(this._objectPresentationElement);
        }

        this._element.removeChildren();
        this._element.appendChild(this._objectPresentationElement);
        this._element.addEventListener("dblclick", this._dblClickOnWatchExpression.bind(this));
    },

    /**
     * @param {!Element} hoverableElement
     */
    _installHover: function(hoverableElement)
    {
        var deleteButton = createElementWithClass("button", "delete-button");
        deleteButton.title = WebInspector.UIString("Delete watch expression");
        deleteButton.addEventListener("click", this._deleteWatchExpression.bind(this), false);
        hoverableElement.insertBefore(deleteButton, hoverableElement.firstChild);
    },

    /**
     * @param {!WebInspector.ObjectPropertiesSection} objectPropertiesSection
     * @param {!Event} event
     */
    _onSectionClick: function(objectPropertiesSection, event)
    {
        event.consume(true);
        if (event.detail == 1) {
            this._preventClickTimeout = setTimeout(handleClick, 333);
        } else {
            clearTimeout(this._preventClickTimeout);
            delete this._preventClickTimeout;
        }

        function handleClick()
        {
            if (objectPropertiesSection.expanded)
                objectPropertiesSection.collapse();
            else
                objectPropertiesSection.expand();
        }
    },

    /**
     * @param {!Event} event
     */
    _promptKeyDown: function(event)
    {
        if (isEnterKey(event)) {
            this._finishEditing(this._textPrompt.text(), event);
            return;
        }
        if (event.keyIdentifier === "U+001B") { // Esc
            this._finishEditing(this._expression, event);
            return;
        }
    },

    /**
     * @param {!WebInspector.ContextMenu} contextMenu
     * @param {!Event} event
     */
    _populateContextMenu: function(contextMenu, event)
    {
        if (!this.isEditing())
            contextMenu.appendItem(WebInspector.UIString.capitalize("Delete ^watch ^expression"), this._updateExpression.bind(this, null));

        if (!this.isEditing() && this._result && (this._result.type === "number" || this._result.type === "string"))
            contextMenu.appendItem(WebInspector.UIString.capitalize("Copy ^value"), this._copyValueButtonClicked.bind(this));

        if (this._valueElement.containsEventPoint(event))
            contextMenu.appendApplicableItems(this._result);
    },

    _copyValueButtonClicked: function()
    {
        InspectorFrontendHost.copyText(this._valueElement.textContent);
    },

    __proto__: WebInspector.Object.prototype
}
