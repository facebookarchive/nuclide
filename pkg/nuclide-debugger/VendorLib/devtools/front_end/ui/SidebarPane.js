/*
 * Copyright (C) 2007 Apple Inc.  All rights reserved.
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
 * @extends {WebInspector.View}
 * @param {string} title
 */
WebInspector.SidebarPane = function(title)
{
    WebInspector.View.call(this);
    this.setMinimumSize(25, 0);
    this.element.className = "sidebar-pane"; // Override

    this.titleElement = createElementWithClass("div", "sidebar-pane-toolbar");
    this.bodyElement = this.element.createChild("div", "body");
    this._title = title;
    this._expandCallback = null;
    this._paneVisible = true;
}

WebInspector.SidebarPane.prototype = {
    /**
     * @return {string}
     */
    title: function()
    {
        return this._title;
    },

    expand: function()
    {
        this.onContentReady();
    },

    onContentReady: function()
    {
        if (this._expandCallback)
            this._expandCallback();
        else
            this._expandPending = true;
    },

    /**
     * @param {function(boolean)} setVisibleCallback
     * @param {function()} expandCallback
     */
    _attached: function(setVisibleCallback, expandCallback)
    {
        this._setVisibleCallback = setVisibleCallback;
        this._setVisibleCallback(this._paneVisible);

        this._expandCallback = expandCallback;
        if (this._expandPending) {
            delete this._expandPending;
            this._expandCallback();
        }
    },

    /**
     * @param {boolean} visible
     */
    setVisible: function(visible)
    {
        this._paneVisible = visible;
        if (this._setVisibleCallback)
            this._setVisibleCallback(visible)
    },

    __proto__: WebInspector.View.prototype
}

/**
 * @constructor
 * @param {!Element} container
 * @param {!WebInspector.SidebarPane} pane
 */
WebInspector.SidebarPaneTitle = function(container, pane)
{
    this._pane = pane;

    this.element = container.createChild("div", "sidebar-pane-title");
    this.element.textContent = pane.title();
    this.element.tabIndex = 0;
    this.element.addEventListener("click", this._toggleExpanded.bind(this), false);
    this.element.addEventListener("keydown", this._onTitleKeyDown.bind(this), false);
    this.element.appendChild(this._pane.titleElement);
}

WebInspector.SidebarPaneTitle.prototype = {
    _expand: function()
    {
        this.element.classList.add("expanded");
        this._pane.show(this.element.parentElement, /** @type {?Element} */ (this.element.nextSibling));
    },

    _collapse: function()
    {
        this.element.classList.remove("expanded");
        if (this._pane.element.parentNode == this.element.parentNode)
            this._pane.detach();
    },

    _toggleExpanded: function()
    {
        if (this.element.classList.contains("expanded"))
            this._collapse();
        else
            this._pane.expand();
    },

    /**
     * @param {!Event} event
     */
    _onTitleKeyDown: function(event)
    {
        if (isEnterKey(event) || event.keyCode === WebInspector.KeyboardShortcut.Keys.Space.code)
            this._toggleExpanded();
    }
}

/**
 * @constructor
 * @extends {WebInspector.View}
 */
WebInspector.SidebarPaneStack = function()
{
    WebInspector.View.call(this);
    this.setMinimumSize(25, 0);
    this.element.className = "sidebar-pane-stack"; // Override
    /** @type {!Map.<!WebInspector.SidebarPane, !WebInspector.SidebarPaneTitle>} */
    this._titleByPane = new Map();
}

WebInspector.SidebarPaneStack.prototype = {
    /**
     * @param {!WebInspector.SidebarPane} pane
     */
    addPane: function(pane)
    {
        var paneTitle = new WebInspector.SidebarPaneTitle(this.element, pane);
        this._titleByPane.set(pane, paneTitle);
        pane._attached(this._setPaneVisible.bind(this, pane), paneTitle._expand.bind(paneTitle));
    },

    /**
     * @param {!WebInspector.SidebarPane} pane
     * @param {boolean} visible
     */
    _setPaneVisible: function(pane, visible)
    {
        var title = this._titleByPane.get(pane);
        if (!title)
            return;

        title.element.classList.toggle("hidden", !visible);
        pane.element.classList.toggle("hidden", !visible);
    },

    __proto__: WebInspector.View.prototype
}

/**
 * @constructor
 * @extends {WebInspector.TabbedPane}
 */
WebInspector.SidebarTabbedPane = function()
{
    WebInspector.TabbedPane.call(this);
    this.setRetainTabOrder(true);
    this.element.classList.add("sidebar-tabbed-pane");
}

WebInspector.SidebarTabbedPane.prototype = {
    /**
     * @param {!WebInspector.SidebarPane} pane
     */
    addPane: function(pane)
    {
        var title = pane.title();
        this.appendTab(title, title, pane);
        pane.element.appendChild(pane.titleElement);
        pane._attached(this._setPaneVisible.bind(this, pane), this.selectTab.bind(this, title));
    },

    /**
     * @param {!WebInspector.SidebarPane} pane
     * @param {boolean} visible
     */
    _setPaneVisible: function(pane, visible)
    {
        var title = pane._title;
        if (visible) {
            if (!this.hasTab(title))
                this.appendTab(title, title, pane);
        } else {
            if (this.hasTab(title))
                this.closeTab(title);
        }
    },

    __proto__: WebInspector.TabbedPane.prototype
}
