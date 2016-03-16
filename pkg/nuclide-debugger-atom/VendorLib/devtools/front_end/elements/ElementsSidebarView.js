// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @interface
 */
WebInspector.ElementsSidebarView = function()
{
}

WebInspector.ElementsSidebarView.prototype = {
    /**
     * @param {?WebInspector.DOMNode} node
     */
    setNode: function(node) { },

    /**
     * @return {!WebInspector.View}
     */
    view: function() { }
}

/**
 * @constructor
 * @extends {WebInspector.SidebarPane}
 * @param {string} title
 * @param {!WebInspector.View} view
 */
WebInspector.ElementsSidebarViewWrapperPane = function(title, view)
{
    WebInspector.SidebarPane.call(this, title);
    view.show(this.element);
}

WebInspector.ElementsSidebarViewWrapperPane.prototype = {
    __proto__: WebInspector.SidebarPane.prototype
}
