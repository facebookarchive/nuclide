/*
 * Copyright (C) 2013 Google Inc. All rights reserved.
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
 *     * Neither the name of Google Inc. nor the names of its
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
 * @extends {WebInspector.TimelineOverviewBase}
 * @param {!WebInspector.TimelineModel} model
 */
WebInspector.TimelineEventOverview = function(model)
{
    WebInspector.TimelineOverviewBase.call(this, model);
    this.element.id = "timeline-overview-events";

    this._fillStyles = {};
    var categories = WebInspector.TimelineUIUtils.categories();
    for (var category in categories) {
        this._fillStyles[category] = categories[category].fillColorStop1;
        categories[category].addEventListener(WebInspector.TimelineCategory.Events.VisibilityChanged, this._onCategoryVisibilityChanged, this);
    }

    this._disabledCategoryFillStyle = "hsl(0, 0%, 67%)";
}

/** @const */
WebInspector.TimelineEventOverview._mainStripHeight = 16;
/** @const */
WebInspector.TimelineEventOverview._smallStripHeight = 8;
/** @const */
WebInspector.TimelineEventOverview._maxNetworkStripHeight = 32;

WebInspector.TimelineEventOverview.prototype = {
    /**
     * @override
     */
    dispose: function()
    {
        var categories = WebInspector.TimelineUIUtils.categories();
        for (var category in categories)
            categories[category].removeEventListener(WebInspector.TimelineCategory.Events.VisibilityChanged, this._onCategoryVisibilityChanged, this);
    },

    /**
     * @override
     */
    update: function()
    {
        var /** @const */ padding = 2;
        this.resetCanvas();
        var threads = this._model.virtualThreads();
        var mainThreadEvents = this._model.mainThreadEvents();
        var estimatedHeight = padding + WebInspector.TimelineEventOverview._smallStripHeight;
        estimatedHeight += padding + WebInspector.TimelineEventOverview._mainStripHeight + 2 * WebInspector.TimelineEventOverview._smallStripHeight;
        estimatedHeight += padding + WebInspector.TimelineEventOverview._maxNetworkStripHeight;
        this._canvas.height = estimatedHeight * window.devicePixelRatio;
        this._canvas.style.height = estimatedHeight + "px";
        var position = padding;
        if (Runtime.experiments.isEnabled("inputEventsOnTimelineOverview")) {
            position += this._drawInputEvents(mainThreadEvents, position);
            position += padding;
        }
        position += this._drawNetwork(mainThreadEvents, position);
        position += padding;
        this._drawEvents(mainThreadEvents, position, WebInspector.TimelineEventOverview._mainStripHeight);
        position += WebInspector.TimelineEventOverview._mainStripHeight;
        for (var thread of threads.filter(function(thread) { return !thread.isWorker(); }))
            this._drawEvents(thread.events, position, WebInspector.TimelineEventOverview._smallStripHeight);
        position += WebInspector.TimelineEventOverview._smallStripHeight;
        var workersHeight = 0;
        for (var thread of threads.filter(function(thread) { return thread.isWorker(); }))
            workersHeight = Math.max(workersHeight, this._drawEvents(thread.events, position, WebInspector.TimelineEventOverview._smallStripHeight));
        position += workersHeight;
        console.assert(position <= estimatedHeight);
        this.element.style.flexBasis = position + "px";
    },

    /**
     * @param {!Array.<!WebInspector.TracingModel.Event>} events
     * @param {number} position
     * @return {number}
     */
    _drawInputEvents: function(events, position)
    {
        var descriptors = WebInspector.TimelineUIUtils.eventDispatchDesciptors();
        /** @type {!Map.<string,!WebInspector.TimelineUIUtils.EventDispatchTypeDescriptor>} */
        var descriptorsByType = new Map();
        var maxPriority = -1;
        for (var descriptor of descriptors) {
            for (var type of descriptor.eventTypes)
                descriptorsByType.set(type, descriptor);
            maxPriority = Math.max(maxPriority, descriptor.priority);
        }

        var /** @const */ minWidth = 2 * window.devicePixelRatio;
        var stripHeight = WebInspector.TimelineEventOverview._smallStripHeight;
        var timeOffset = this._model.minimumRecordTime();
        var timeSpan = this._model.maximumRecordTime() - timeOffset;
        var canvasWidth = this._canvas.width;
        var scale = canvasWidth / timeSpan;
        var drawn = false;

        for (var priority = 0; priority <= maxPriority; ++priority) {
            for (var i = 0; i < events.length; ++i) {
                var event = events[i];
                if (event.name !== WebInspector.TimelineModel.RecordType.EventDispatch)
                    continue;
                var descriptor = descriptorsByType.get(event.args["data"]["type"]);
                if (!descriptor || descriptor.priority !== priority)
                    continue;
                var start = Number.constrain(Math.floor((event.startTime - timeOffset) * scale), 0, canvasWidth);
                var end = Number.constrain(Math.ceil((event.endTime - timeOffset) * scale), 0, canvasWidth);
                var width = Math.max(end - start, minWidth);
                this._renderBar(start, start + width, position, stripHeight, descriptor.color);
                drawn = true;
            }
        }

        return drawn ? stripHeight : 0;
    },

    /**
     * @param {!Array.<!WebInspector.TracingModel.Event>} events
     * @param {number} position
     * @return {number}
     */
    _drawNetwork: function(events, position)
    {
        var /** @const */ maxBandHeight = 4;
        var bandsCount = WebInspector.TimelineUIUtils.calculateNetworkBandsCount(events);
        var bandInterval = Math.min(maxBandHeight, WebInspector.TimelineEventOverview._maxNetworkStripHeight / (bandsCount || 1));
        var bandHeight = Math.ceil(bandInterval);
        var timeOffset = this._model.minimumRecordTime();
        var timeSpan = this._model.maximumRecordTime() - timeOffset;
        var canvasWidth = this._canvas.width;
        var scale = canvasWidth / timeSpan;
        var loadingCategory = WebInspector.TimelineUIUtils.categories()["loading"];
        var waitingColor = loadingCategory.backgroundColor;
        var processingColor = loadingCategory.fillColorStop1;

        /**
         * @param {number} band
         * @param {number} startTime
         * @param {number} endTime
         * @param {?WebInspector.TracingModel.Event} event
         * @this {WebInspector.TimelineEventOverview}
         */
        function drawBar(band, startTime, endTime, event)
        {
            var start = Number.constrain((startTime - timeOffset) * scale, 0, canvasWidth);
            var end = Number.constrain((endTime - timeOffset) * scale, 0, canvasWidth);
            var color = !event ||
                event.name === WebInspector.TimelineModel.RecordType.ResourceReceiveResponse ||
                event.name === WebInspector.TimelineModel.RecordType.ResourceSendRequest ? waitingColor : processingColor;
            this._renderBar(Math.floor(start), Math.ceil(end), Math.floor(position + band * bandInterval), bandHeight, color);
        }

        WebInspector.TimelineUIUtils.iterateNetworkRequestsInRoundRobin(events, bandsCount, drawBar.bind(this));
        return Math.ceil(bandInterval * bandsCount);
    },

    /**
     * @param {!Array.<!WebInspector.TracingModel.Event>} events
     * @param {number} position
     * @param {number} stripHeight
     * @return {number}
     */
    _drawEvents: function(events, position, stripHeight)
    {
        var /** @const */ padding = 1;
        var visualHeight = stripHeight - padding;
        var timeOffset = this._model.minimumRecordTime();
        var timeSpan = this._model.maximumRecordTime() - timeOffset;
        var scale = this._canvas.width / timeSpan;
        var ditherer = new WebInspector.Dithering();
        var categoryStack = [];
        var lastX = 0;
        var drawn = false;

        /**
         * @param {!WebInspector.TimelineCategory} category
         * @return {string}
         * @this {WebInspector.TimelineEventOverview}
         */
        function categoryColor(category)
        {
            return category.hidden ? this._disabledCategoryFillStyle : this._fillStyles[category.name];
        }

        /**
         * @param {!WebInspector.TracingModel.Event} e
         * @this {WebInspector.TimelineEventOverview}
         */
        function onEventStart(e)
        {
            var pos = (e.startTime - timeOffset) * scale;
            if (categoryStack.length) {
                var category = categoryStack.peekLast();
                var bar = ditherer.appendInterval(category, lastX, pos);
                if (bar) {
                    this._renderBar(bar.start, bar.end, position, visualHeight, categoryColor.call(this, category));
                    drawn = true;
                }
            }
            categoryStack.push(WebInspector.TimelineUIUtils.eventStyle(e).category);
            lastX = pos;
        }

        /**
         * @param {!WebInspector.TracingModel.Event} e
         * @this {WebInspector.TimelineEventOverview}
         */
        function onEventEnd(e)
        {
            var category = categoryStack.pop();
            var pos = (e.endTime - timeOffset) * scale;
            var bar = ditherer.appendInterval(category, lastX, pos);
            if (bar) {
                this._renderBar(bar.start, bar.end, position, visualHeight, categoryColor.call(this, category));
                drawn = true;
            }
            lastX = pos;
        }

        WebInspector.TimelineModel.forEachEvent(events, onEventStart.bind(this), onEventEnd.bind(this));
        return drawn ? stripHeight : 0;
    },

    _onCategoryVisibilityChanged: function()
    {
        this.update();
    },

    /**
     * @param {number} begin
     * @param {number} end
     * @param {number} position
     * @param {number} height
     * @param {string} color
     */
    _renderBar: function(begin, end, position, height, color)
    {
        var x = begin;
        var y = position * window.devicePixelRatio;
        var width = end - begin;
        this._context.fillStyle = color;
        this._context.fillRect(x, y, width, height * window.devicePixelRatio);
    },

    __proto__: WebInspector.TimelineOverviewBase.prototype
}

/**
 * @constructor
 * @template T
 */
WebInspector.Dithering = function()
{
    /** @type {!Map.<?T,number>} */
    this._groupError = new Map();
    this._position = 0;
    this._lastReportedPosition = 0;
}

WebInspector.Dithering.prototype = {
    /**
     * @param {!T} group
     * @param {number} start
     * @param {number} end
     * @return {?{start: number, end: number}}
     * @template T
     */
    appendInterval: function(group, start, end)
    {
        this._innerAppend(null, start); // Append an empty space before.
        return this._innerAppend(group, end); // Append the interval itself.
    },

    /**
     * @param {?T} group
     * @param {number} position
     * @return {?{start: number, end: number}}
     * @template T
     */
    _innerAppend: function(group, position)
    {
        if (position < this._position)
            return null;
        var result = null;
        var length = position - this._position;
        length += this._groupError.get(group) || 0;
        if (length >= 1) {
            if (!group)
                length -= this._distributeExtraAmount(length - 1);
            var newReportedPosition = this._lastReportedPosition + Math.floor(length);
            result = { start: this._lastReportedPosition, end: newReportedPosition };
            this._lastReportedPosition = newReportedPosition;
            length %= 1;
        }
        this._groupError.set(group, length);
        this._position = position;
        return result;
    },

    /**
     * @param {number} amount
     * @return {number}
     */
    _distributeExtraAmount: function(amount)
    {
        var canConsume = 0;
        for (var g of this._groupError.keys()) {
            if (g)
                canConsume += 1 - this._groupError.get(g);
        }
        var toDistribute = Math.min(amount, canConsume);
        if (toDistribute <= 0)
            return 0;
        var ratio = toDistribute / canConsume;
        for (var g of this._groupError.keys()) {
            if (!g)
                continue;
            var value = this._groupError.get(g);
            value += (1 - value) * ratio;
            this._groupError.set(g, value);
        }
        return toDistribute;
    }
}
