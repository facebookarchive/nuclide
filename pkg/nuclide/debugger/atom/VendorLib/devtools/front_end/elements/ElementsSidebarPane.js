// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @constructor
 * @extends {WebInspector.SidebarPane}
 * @param {string} title
 */
WebInspector.ElementsSidebarPane = function(title)
{
    WebInspector.SidebarPane.call(this, title);
    this._node = null;
    this._updateController = new WebInspector.ElementsSidebarPane._UpdateController(this, this.doUpdate.bind(this));
}

WebInspector.ElementsSidebarPane.prototype = {
    /**
     * @return {?WebInspector.DOMNode}
     */
    node: function()
    {
        return this._node;
    },

    /**
     * @param {?WebInspector.DOMNode} node
     */
    setNode: function(node)
    {
        this._node = node;
        this.update();
    },

    /**
     * @param {!WebInspector.Throttler.FinishCallback} finishedCallback
     * @protected
     */
    doUpdate: function(finishedCallback)
    {
        finishedCallback();
    },

    update: function()
    {
        this._updateController.update();
    },

     wasShown: function()
    {
        WebInspector.SidebarPane.prototype.wasShown.call(this);
        this._updateController.viewWasShown();
    },

    __proto__: WebInspector.SidebarPane.prototype
}

/**
 * @constructor
 * @param {!WebInspector.View} view
 * @param {function(!WebInspector.Throttler.FinishCallback)} doUpdate
 */
WebInspector.ElementsSidebarPane._UpdateController = function(view, doUpdate)
{
    this._view = view;
    this._updateThrottler = new WebInspector.Throttler(100);
    this._updateWhenVisible = false;
    this._doUpdate = doUpdate;
}

WebInspector.ElementsSidebarPane._UpdateController.prototype = {
    update: function()
    {
        this._updateWhenVisible = !this._view.isShowing();
        if (this._updateWhenVisible)
            return;
        this._updateThrottler.schedule(innerUpdate.bind(this));

        /**
         * @param {!WebInspector.Throttler.FinishCallback} finishedCallback
         * @this {WebInspector.ElementsSidebarPane._UpdateController}
         */
        function innerUpdate(finishedCallback)
        {
            if (this._view.isShowing())
                this._doUpdate.call(null, finishedCallback);
            else
                finishedCallback();
        }
    },

    viewWasShown: function()
    {
        if (this._updateWhenVisible)
            this.update();
    }
}

/**
 * @constructor
 * @extends {WebInspector.View}
 * @implements {WebInspector.ElementsSidebarView}
 */
WebInspector.ThrottledElementsSidebarView = function()
{
    WebInspector.View.call(this);
    this._node = null;
    this._updateController = new WebInspector.ElementsSidebarPane._UpdateController(this, this.doUpdate.bind(this));
}

WebInspector.ThrottledElementsSidebarView.prototype = {
    /**
     * @return {?WebInspector.DOMNode}
     */
    node: function()
    {
        return this._node;
    },

    /**
     * @override
     * @param {?WebInspector.DOMNode} node
     */
    setNode: function(node)
    {
        this._node = node;
        this.update();
    },

    /**
     * @param {!WebInspector.Throttler.FinishCallback} finishedCallback
     * @protected
     */
    doUpdate: function(finishedCallback)
    {
        finishedCallback();
    },

    update: function()
    {
        this._updateController.update();
    },

    wasShown: function()
    {
        WebInspector.View.prototype.wasShown.call(this);
        this._updateController.viewWasShown();
    },

    /**
     * @override
     * @return {!WebInspector.View}
     */
    view: function()
    {
        return this;
    },

    __proto__: WebInspector.View.prototype
}
