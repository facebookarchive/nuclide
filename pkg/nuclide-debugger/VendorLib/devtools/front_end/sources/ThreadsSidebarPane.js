// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @constructor
 * @extends {WebInspector.SidebarPane}
 * @implements {WebInspector.TargetManager.Observer}
 */
WebInspector.ThreadsSidebarPane = function()
{
    WebInspector.SidebarPane.call(this, WebInspector.UIString("Threads"));
    this.setVisible(false);

    /** @type {!Map.<!WebInspector.Target, !WebInspector.UIList.Item>} */
    this._targetsToListItems = new Map();
    /** @type {!Map.<!WebInspector.UIList.Item, !WebInspector.Target>} */
    this._listItemsToTargets = new Map();
    /** @type {?WebInspector.UIList.Item} */
    this._selectedListItem = null;
    this.threadList = new WebInspector.UIList();
    this.threadList.show(this.bodyElement);
    WebInspector.targetManager.addModelListener(WebInspector.DebuggerModel, WebInspector.DebuggerModel.Events.DebuggerPaused, this._onDebuggerStateChanged, this);
    WebInspector.targetManager.addModelListener(WebInspector.DebuggerModel, WebInspector.DebuggerModel.Events.DebuggerResumed, this._onDebuggerStateChanged, this);
    WebInspector.context.addFlavorChangeListener(WebInspector.Target, this._targetChanged, this);
    WebInspector.targetManager.observeTargets(this);
}

WebInspector.ThreadsSidebarPane.prototype = {
    /**
     * @override
     * @param {!WebInspector.Target} target
     */
    targetAdded: function(target)
    {
        if (target.isServiceWorker()) {
            this._updateVisibility();
            return;
        }
        var listItem = new WebInspector.UIList.Item(target.name(), "");
        listItem.element.addEventListener("click", this._onListItemClick.bind(this, listItem), false);
        var currentTarget = WebInspector.context.flavor(WebInspector.Target);
        if (currentTarget === target)
            this._selectListItem(listItem);

        this._targetsToListItems.set(target, listItem);
        this._listItemsToTargets.set(listItem, target);
        this.threadList.addItem(listItem);
        this._updateDebuggerState(target);
        this._updateVisibility();
    },

    _updateVisibility: function()
    {
        this.setVisible(this._targetsToListItems.size > 1);
    },

    /**
     * @override
     * @param {!WebInspector.Target} target
     */
    targetRemoved: function(target)
    {
        var listItem = this._targetsToListItems.remove(target);
        if (listItem) {
            this._listItemsToTargets.remove(listItem);
            this.threadList.removeItem(listItem);
        }
        this._updateVisibility();
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _targetChanged: function(event)
    {
        var newTarget = /** @type {!WebInspector.Target} */(event.data);
        var listItem =  /** @type {!WebInspector.UIList.Item} */ (this._targetsToListItems.get(newTarget));
        this._selectListItem(listItem);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _onDebuggerStateChanged: function(event)
    {
        var debuggerModel = /** @type {!WebInspector.DebuggerModel} */ (event.target);
        this._updateDebuggerState(debuggerModel.target());
    },

    /**
     * @param {!WebInspector.Target} target
     */
    _updateDebuggerState: function(target)
    {
        var listItem = this._targetsToListItems.get(target);
        listItem.setSubtitle(WebInspector.UIString(target.debuggerModel.isPaused() ? "paused" : ""));
    },

    /**
     * @param {!WebInspector.UIList.Item} listItem
     */
    _selectListItem: function(listItem)
    {
        if (listItem === this._selectedListItem)
            return;

        if (this._selectedListItem)
            this._selectedListItem.setSelected(false);

        this._selectedListItem = listItem;
        listItem.setSelected(true);
    },

    /**
     * @param {!WebInspector.UIList.Item} listItem
     */
    _onListItemClick: function(listItem)
    {
        WebInspector.context.setFlavor(WebInspector.Target, this._listItemsToTargets.get(listItem));
        listItem.element.scrollIntoViewIfNeeded();
    },


    __proto__: WebInspector.SidebarPane.prototype
}
