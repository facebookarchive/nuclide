// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @constructor
 * @extends {WebInspector.ElementsSidebarPane}
 */
WebInspector.AnimationsSidebarPane = function()
{
    WebInspector.ElementsSidebarPane.call(this, WebInspector.UIString("Animations"));
    this._timeline = new WebInspector.AnimationTimeline();
    this._timeline.show(this.bodyElement);
}

WebInspector.AnimationsSidebarPane.prototype = {
    /**
     * @override
     * @param {?WebInspector.DOMNode} node
     */
    setNode: function(node)
    {
        WebInspector.ElementsSidebarPane.prototype.setNode.call(this, node);
        if (!node)
            return;
        this._updateTarget(node.target());
    },

    /**
     * @param {!WebInspector.Target} target
     */
    _updateTarget: function(target)
    {
        if (this._target === target)
            return;
        if (this._target) {
            this._target.animationModel.removeEventListener(WebInspector.AnimationModel.Events.AnimationPlayerCreated, this._animationPlayerCreated, this);
            this._target.animationModel.removeEventListener(WebInspector.AnimationModel.Events.AnimationPlayerCanceled, this._animationPlayerCanceled, this);
        }
        this._target = target;
        this._target.animationModel.addEventListener(WebInspector.AnimationModel.Events.AnimationPlayerCreated, this._animationPlayerCreated, this);
        this._target.animationModel.addEventListener(WebInspector.AnimationModel.Events.AnimationPlayerCanceled, this._animationPlayerCanceled, this);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _animationPlayerCreated: function(event)
    {
        this._timeline.addAnimation(/** @type {!WebInspector.AnimationModel.AnimationPlayer} */ (event.data.player), event.data.resetTimeline);
    },

    _animationPlayerCanceled: function(event)
    {
        this._timeline.cancelAnimation(/** @type {string} */ (event.data.playerId));
    },

    /**
     * @override
     * @param {!WebInspector.Throttler.FinishCallback} finishCallback
     * @protected
     */
    doUpdate: function(finishCallback)
    {
        if (!this.node()) {
            finishCallback();
            return;
        }

        this._target.animationModel.ensureEnabled();
        this._timeline.scheduleRedraw();
        finishCallback();
    },

    __proto__: WebInspector.ElementsSidebarPane.prototype
}

WebInspector.AnimationsSidebarPane.GlobalPlaybackRates = [0.1, 0.25, 0.5, 1.0];
