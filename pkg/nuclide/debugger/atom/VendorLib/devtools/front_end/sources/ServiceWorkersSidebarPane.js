// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @constructor
 * @extends {WebInspector.SidebarPane}
 * @implements {WebInspector.TargetManager.Observer}
 */
WebInspector.ServiceWorkersSidebarPane = function()
{
    WebInspector.SidebarPane.call(this, WebInspector.UIString("\u2699 Service Workers"));
    this.registerRequiredCSS("sources/serviceWorkersSidebar.css");
    this.setVisible(false);

    /** @type {?WebInspector.ServiceWorkerManager} */
    this._manager = null;
    WebInspector.targetManager.observeTargets(this);
}

WebInspector.ServiceWorkersSidebarPane.prototype = {
    /**
     * @override
     * @param {!WebInspector.Target} target
     */
    targetAdded: function(target)
    {
        if (this._manager || !target.isPage())
            return;
        this._manager = target.serviceWorkerManager;
        this._updateVisibility();
        target.serviceWorkerManager.addEventListener(WebInspector.ServiceWorkerManager.Events.WorkersUpdated, this._update, this);
    },

    /**
     * @override
     * @param {!WebInspector.Target} target
     */
    targetRemoved: function(target)
    {
        if (target.isPage())
            target.serviceWorkerManager.removeEventListener(WebInspector.ServiceWorkerManager.Events.WorkersUpdated, this._update, this);
        this._updateVisibility();
    },

    _update: function()
    {
        this._updateVisibility();

        if (!this.isShowing() || !this._manager || !this._manager.hasWorkers())
            return;

        this.bodyElement.removeChildren();
        for (var worker of this._manager.workers()) {
            var workerElement = this.bodyElement.createChild("div", "service-worker");
            workerElement.createChild("span").textContent = worker.name();
            workerElement.createChild("span", "service-worker-scope").textContent = " \u2014 " + worker.scope();
            var stopButton = workerElement.createChild("div", "service-worker-stop");
            stopButton.title = WebInspector.UIString("Stop");
            stopButton.addEventListener("click", worker.stop.bind(worker), false);
        }
    },

    _updateVisibility: function()
    {
        this.setVisible(!!this._manager && this._manager.hasWorkers());
    },

    wasShown: function()
    {
        this._update();
    },

    __proto__: WebInspector.SidebarPane.prototype
}
