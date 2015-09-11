// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


/**
 * @constructor
 * @extends {WebInspector.SDKModel}
 * @param {!WebInspector.Target} target
 */
WebInspector.AnimationModel = function(target)
{
    WebInspector.SDKModel.call(this, WebInspector.AnimationModel, target);
    this._agent = target.animationAgent();
    target.registerAnimationDispatcher(new WebInspector.AnimationDispatcher(this));
}

WebInspector.AnimationModel.Events = {
    AnimationPlayerCreated: "AnimationPlayerCreated",
    AnimationPlayerCanceled: "AnimationPlayerCanceled"
}

WebInspector.AnimationModel.prototype = {
    /**
     * @param {!DOMAgent.NodeId} nodeId
     * @param {boolean} showSubtreeAnimations
     * @param {function(?Array.<!WebInspector.AnimationModel.AnimationPlayer>)} userCallback
     */
    getAnimationPlayers: function(nodeId, showSubtreeAnimations, userCallback)
    {
        /**
         * @param {?Protocol.Error} error
         * @param {!Array.<!AnimationAgent.AnimationPlayer>} payloads
         * @this {WebInspector.AnimationModel}
         */
        function resultCallback(error, payloads)
        {
            if (error) {
                userCallback(null);
                return;
            }
            userCallback(payloads.map(WebInspector.AnimationModel.AnimationPlayer.parsePayload.bind(null, this.target())));
        }

        this._agent.getAnimationPlayersForNode(nodeId, showSubtreeAnimations, resultCallback.bind(this));
    },

    /**
     * @param {!AnimationAgent.AnimationPlayer} payload
     * @param {boolean} resetTimeline
     */
    animationPlayerCreated: function(payload, resetTimeline)
    {
        var player = WebInspector.AnimationModel.AnimationPlayer.parsePayload(this.target(), payload);
        this.dispatchEventToListeners(WebInspector.AnimationModel.Events.AnimationPlayerCreated, { "player": player, "resetTimeline": resetTimeline });
    },

    /**
     * @param {string} playerId
     */
    animationPlayerCanceled: function(playerId)
    {
        this.dispatchEventToListeners(WebInspector.AnimationModel.Events.AnimationPlayerCanceled, { "playerId": playerId });
    },

    ensureEnabled: function()
    {
        if (this._enabled)
            return;
        this._agent.enable();
        this._enabled = true;
    },

    __proto__: WebInspector.SDKModel.prototype
}

/**
 * @constructor
 * @extends {WebInspector.SDKObject}
 * @param {!WebInspector.Target} target
 * @param {!AnimationAgent.AnimationPlayer} payload
 */
WebInspector.AnimationModel.AnimationPlayer = function(target, payload)
{
    WebInspector.SDKObject.call(this, target);
    this._payload = payload;
    this._source = new WebInspector.AnimationModel.AnimationNode(this.target(), this._payload.source);
}

/**
 * @param {!WebInspector.Target} target
 * @param {!AnimationAgent.AnimationPlayer} payload
 * @return {!WebInspector.AnimationModel.AnimationPlayer}
 */
WebInspector.AnimationModel.AnimationPlayer.parsePayload = function(target, payload)
{
    return new WebInspector.AnimationModel.AnimationPlayer(target, payload);
}

WebInspector.AnimationModel.AnimationPlayer.prototype = {
    /**
     * @return {!AnimationAgent.AnimationPlayer}
     */
    payload: function()
    {
        return this._payload;
    },

    /**
     * @return {string}
     */
    id: function()
    {
        return this._payload.id;
    },

    /**
     * @return {string}
     */
    name: function()
    {
        return this.source().name();
    },

    /**
     * @return {boolean}
     */
    paused: function()
    {
        return this._payload.pausedState;
    },

    /**
     * @return {string}
     */
    playState: function()
    {
        return this._playState || this._payload.playState;
    },

    /**
     * @param {string} playState
     */
    setPlayState: function(playState)
    {
        this._playState = playState;
    },

    /**
     * @return {number}
     */
    playbackRate: function()
    {
        return this._payload.playbackRate;
    },

    /**
     * @return {number}
     */
    startTime: function()
    {
        return this._payload.startTime;
    },

    /**
     * @return {number}
     */
    endTime: function()
    {
        if (!this.source().iterations)
            return Infinity;
        return this.startTime() + this.source().delay() + this.source().duration() * this.source().iterations() + this.source().endDelay();
    },

    /**
     * @return {number}
     */
    currentTime: function()
    {
        return this._payload.currentTime;
    },

    /**
     * @return {!WebInspector.AnimationModel.AnimationNode}
     */
    source: function()
    {
        return this._source;
    },

    /**
     * @return {string}
     */
    type: function()
    {
        return this._payload.type;
    },

    /**
     * @param {!WebInspector.AnimationModel.AnimationPlayer} animation
     * @return {boolean}
     */
    overlaps: function(animation)
    {
        // Infinite animations
        if (!this.source().iterations() || !animation.source().iterations())
            return true;

        var firstAnimation = this.startTime() < animation.startTime() ? this : animation;
        var secondAnimation = firstAnimation === this ? animation : this;
        return firstAnimation.endTime() >= secondAnimation.startTime();
    },

    __proto__: WebInspector.SDKObject.prototype
}

/**
 * @constructor
 * @extends {WebInspector.SDKObject}
 * @param {!WebInspector.Target} target
 * @param {!AnimationAgent.AnimationNode} payload
 */
WebInspector.AnimationModel.AnimationNode = function(target, payload)
{
    WebInspector.SDKObject.call(this, target);
    this._payload = payload;
    if (payload.keyframesRule)
        this._keyframesRule = new WebInspector.AnimationModel.KeyframesRule(target, payload.keyframesRule);
    this._delay = this._payload.delay;
    this._duration = this._payload.duration;
}

WebInspector.AnimationModel.AnimationNode.prototype = {
    /**
     * @return {number}
     */
    delay: function()
    {
        return this._delay;
    },

    /**
     * @param {number} delay
     */
    setDelay: function(delay)
    {
        this._delay = delay;
    },

    /**
     * @return {number}
     */
    endDelay: function()
    {
        return this._payload.endDelay;
    },

    /**
     * @return {number}
     */
    playbackRate: function()
    {
        return this._payload.playbackRate;
    },

    /**
     * @return {number}
     */
    iterationStart: function()
    {
        return this._payload.iterationStart;
    },

    /**
     * @return {number}
     */
    iterations: function()
    {
        return this._payload.iterations || Infinity;
    },

    /**
     * @return {number}
     */
    duration: function()
    {
        return this._duration;
    },

    setDuration: function(duration)
    {
        this._duration = duration;
    },

    /**
     * @return {string}
     */
    direction: function()
    {
        return this._payload.direction;
    },

    /**
     * @return {string}
     */
    fill: function()
    {
        return this._payload.fill;
    },

    /**
     * @return {string}
     */
    name: function()
    {
        return this._payload.name;
    },

    /**
     * @return {!WebInspector.DeferredDOMNode}
     */
    deferredNode: function()
    {
        return new WebInspector.DeferredDOMNode(this.target(), this.backendNodeId());
    },

    /**
     * @return {number}
     */
    backendNodeId: function()
    {
        return this._payload.backendNodeId;
    },

    /**
     * @return {?WebInspector.AnimationModel.KeyframesRule}
     */
    keyframesRule: function()
    {
        return this._keyframesRule;
    },

    /**
     * @return {string}
     */
    easing: function()
    {
        return this._payload.easing;
    },

    __proto__: WebInspector.SDKObject.prototype
}

/**
 * @constructor
 * @extends {WebInspector.SDKObject}
 * @param {!WebInspector.Target} target
 * @param {!AnimationAgent.KeyframesRule} payload
 */
WebInspector.AnimationModel.KeyframesRule = function(target, payload)
{
    WebInspector.SDKObject.call(this, target);
    this._payload = payload;
    this._keyframes = this._payload.keyframes.map(function (keyframeStyle) {
        return new WebInspector.AnimationModel.KeyframeStyle(target, keyframeStyle);
    });
}

WebInspector.AnimationModel.KeyframesRule.prototype = {
    /**
     * @param {!Array.<!AnimationAgent.KeyframeStyle>} payload
     */
    _setKeyframesPayload: function(payload)
    {
        this._keyframes = payload.map(function (keyframeStyle) {
            return new WebInspector.AnimationModel.KeyframeStyle(this._target, keyframeStyle);
        });
    },

    /**
     * @return {string|undefined}
     */
    name: function()
    {
        return this._payload.name;
    },

    /**
     * @return {!Array.<!WebInspector.AnimationModel.KeyframeStyle>}
     */
    keyframes: function()
    {
        return this._keyframes;
    },

    __proto__: WebInspector.SDKObject.prototype
}

/**
 * @constructor
 * @extends {WebInspector.SDKObject}
 * @param {!WebInspector.Target} target
 * @param {!AnimationAgent.KeyframeStyle} payload
 */
WebInspector.AnimationModel.KeyframeStyle = function(target, payload)
{
    WebInspector.SDKObject.call(this, target);
    this._payload = payload;
    this._style = WebInspector.CSSStyleDeclaration.parsePayload(this.target().cssModel, payload.style);
    this._offset = this._payload.offset;
}

WebInspector.AnimationModel.KeyframeStyle.prototype = {
    /**
     * @return {string}
     */
    offset: function()
    {
        return this._offset;
    },

    /**
     * @param {number} offset
     */
    setOffset: function(offset)
    {
        this._offset = offset * 100 + "%";
    },

    /**
     * @return {number}
     */
    offsetAsNumber: function()
    {
        return parseFloat(this._offset) / 100;
    },

    /**
     * @return {!WebInspector.CSSStyleDeclaration}
     */
    style: function()
    {
        return this._style;
    },

    /**
     * @return {string}
     */
    easing: function()
    {
        return this._payload.easing;
    },

    __proto__: WebInspector.SDKObject.prototype
}

/**
 * @constructor
 * @implements {AnimationAgent.Dispatcher}
 */
WebInspector.AnimationDispatcher = function(animationModel)
{
    this._animationModel = animationModel;
}

WebInspector.AnimationDispatcher.prototype = {
    /**
     * @override
     * @param {!AnimationAgent.AnimationPlayer} payload
     * @param {boolean} resetTimeline
     */
    animationPlayerCreated: function(payload, resetTimeline)
    {
        this._animationModel.animationPlayerCreated(payload, resetTimeline);
    },

    /**
     * @override
     * @param {string} playerId
     */
    animationPlayerCanceled: function(playerId)
    {
        this._animationModel.animationPlayerCanceled(playerId);
    }
}
