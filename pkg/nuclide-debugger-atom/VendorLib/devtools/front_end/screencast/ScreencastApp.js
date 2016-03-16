// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @constructor
 * @implements {WebInspector.App}
 * @implements {WebInspector.TargetManager.Observer}
 */
WebInspector.ScreencastApp = function()
{
    this._enabledSetting = WebInspector.settings.createSetting("screencastEnabled", true);
    this._toggleButton = new WebInspector.StatusBarButton(WebInspector.UIString("Toggle screencast."), "screencast-status-bar-item");
    this._toggleButton.setToggled(this._enabledSetting.get());
    this._toggleButton.addEventListener("click", this._toggleButtonClicked, this);
    WebInspector.targetManager.observeTargets(this);
};

WebInspector.ScreencastApp.prototype = {
    /**
     * @param {!Document} document
     * @override
     */
    presentUI: function(document)
    {
        var rootView = new WebInspector.RootView();

        this._rootSplitView = new WebInspector.SplitView(false, true, "InspectorView.screencastSplitViewState", 300, 300);
        this._rootSplitView.setVertical(true);
        this._rootSplitView.setSecondIsSidebar(true);
        this._rootSplitView.show(rootView.element);
        this._rootSplitView.hideMain();

        this._rootSplitView.setSidebarView(WebInspector.inspectorView);
        WebInspector.inspectorView.showInitialPanel();
        rootView.attachToDocument(document);
    },

    /**
     * @override
     * @param {!WebInspector.Target} target
     */
    targetAdded: function(target)
    {
        if (this._target)
            return;
        this._target = target;
        if (target.hasCapability(WebInspector.Target.Capabilities.CanScreencast)) {
            this._screencastView = new WebInspector.ScreencastView(target);
            this._rootSplitView.setMainView(this._screencastView);
            this._screencastView.initialize();
        } else {
            this._toggleButton.setEnabled(false);
        }
        this._onScreencastEnabledChanged();
    },

    /**
     * @override
     * @param {!WebInspector.Target} target
     */
    targetRemoved: function(target)
    {
        if (this._target === target) {
            delete this._target;
            if (!this._screencastView)
                return;
            this._toggleButton.setEnabled(false);
            this._screencastView.detach();
            delete this._screencastView;
            this._onScreencastEnabledChanged();
        }
    },

    _toggleButtonClicked: function()
    {
        var enabled = !this._toggleButton.toggled();
        this._enabledSetting.set(enabled);
        this._onScreencastEnabledChanged();
    },

    _onScreencastEnabledChanged: function()
    {
        if (!this._rootSplitView)
            return;
        var enabled = this._enabledSetting.get() && this._screencastView;
        this._toggleButton.setToggled(enabled);
        if (enabled)
            this._rootSplitView.showBoth();
        else
            this._rootSplitView.hideMain();
    }
};


/** @type {!WebInspector.ScreencastApp} */
WebInspector.ScreencastApp._appInstance;

/**
 * @return {!WebInspector.ScreencastApp}
 */
WebInspector.ScreencastApp._instance = function()
{
    if (!WebInspector.ScreencastApp._appInstance)
        WebInspector.ScreencastApp._appInstance = new WebInspector.ScreencastApp();
    return WebInspector.ScreencastApp._appInstance;
};

/**
 * @constructor
 * @implements {WebInspector.StatusBarItem.Provider}
 */
WebInspector.ScreencastApp.StatusBarButtonProvider = function()
{
}

WebInspector.ScreencastApp.StatusBarButtonProvider.prototype = {
    /**
     * @override
     * @return {?WebInspector.StatusBarItem}
     */
    item: function()
    {
        return WebInspector.ScreencastApp._instance()._toggleButton;
    }
}

/**
 * @constructor
 * @implements {WebInspector.AppProvider}
 */
WebInspector.ScreencastAppProvider = function()
{
};

WebInspector.ScreencastAppProvider.prototype = {
    /**
     * @override
     * @return {!WebInspector.App}
     */
    createApp: function()
    {
        return WebInspector.ScreencastApp._instance();
    }
};
