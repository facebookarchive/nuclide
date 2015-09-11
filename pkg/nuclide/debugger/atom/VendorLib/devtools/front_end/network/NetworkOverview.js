// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @constructor
 * @extends {WebInspector.VBox}
 */
WebInspector.NetworkOverview = function()
{
    WebInspector.VBox.call(this);
    this.element.classList.add("network-overview");

    /** @type {!WebInspector.OverviewGrid} */
    this._overviewGrid = new WebInspector.OverviewGrid("network");
    /** @type {!Element} */
    this._overviewContainer = this._overviewGrid.element.createChild("div", "network-overview-canvas-container");
    this._overviewCanvas = this._overviewContainer.createChild("canvas", "network-overview-canvas");
    /** @type {!WebInspector.NetworkTransferTimeCalculator} */
    this._calculator = new WebInspector.NetworkTransferTimeCalculator();
    /** @type {number} */
    this._numBands = 1;
    /** @type {number} */
    this._windowStart = 0;
    /** @type {number} */
    this._windowEnd = 0;
    /** @type {boolean} */
    this._restoringWindow = false;
    /** @type {boolean} */
    this._updateScheduled = false;
    /** @type {number} */
    this._canvasWidth = 0;
    /** @type {number} */
    this._canvasHeight = 0;

    this._overviewGrid.addEventListener(WebInspector.OverviewGrid.Events.WindowChanged, this._onWindowChanged, this);
    this.element.appendChild(this._overviewGrid.element);
    WebInspector.targetManager.addModelListener(WebInspector.ResourceTreeModel, WebInspector.ResourceTreeModel.EventTypes.Load, this._loadEventFired, this);
    WebInspector.targetManager.addModelListener(WebInspector.ResourceTreeModel, WebInspector.ResourceTreeModel.EventTypes.DOMContentLoaded, this._domContentLoadedEventFired, this);

    this.reset();
}

/** @type {number} */
WebInspector.NetworkOverview._bandHeight = 3;

/** @type {number} */
WebInspector.NetworkOverview._dividersBarHeight = 20;

/** @enum {string} */
WebInspector.NetworkOverview.Events = {
    WindowChanged: "WindowChanged"
}

/** @typedef {{start: number, end: number}} */
WebInspector.NetworkOverview.Window;

WebInspector.NetworkOverview.prototype = {
    /**
     * @param {!WebInspector.Event} event
     */
    _onWindowChanged: function(event)
    {
        if (this._restoringWindow)
            return;
        var startTime = this._calculator.minimumBoundary();
        var totalTime = this._calculator.boundarySpan();
        var left = this._overviewGrid.windowLeft();
        var right = this._overviewGrid.windowRight();
        if (left === 0 && right === 1) {
            this._windowStart = 0;
            this._windowEnd = 0;
        } else {
            this._windowStart = startTime + left * totalTime;
            this._windowEnd = startTime + right * totalTime;
        }
        this.dispatchEventToListeners(WebInspector.NetworkOverview.Events.WindowChanged, {start: this._windowStart, end: this._windowEnd});
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _loadEventFired: function(event)
    {
        var data = /** @type {number} */ (event.data);
        if (data)
            this._loadEvents.push(data);
        this.scheduleUpdate();
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _domContentLoadedEventFired: function(event)
    {
        var data = /** @type {number} */ (event.data);
        if (data)
            this._domContentLoadedEvents.push(data);
        this.scheduleUpdate();
    },

    /**
     * @param {string} connectionId
     * @return {number}
     */
    _bandId: function(connectionId)
    {
        if (!connectionId || connectionId === "0")
            return -1;
        if (this._bandMap.has(connectionId))
            return /** @type {number} */ (this._bandMap.get(connectionId));
        var result = this._nextBand++;
        this._bandMap.set(connectionId, result);
        return result;
    },

    /**
     * @param {!WebInspector.NetworkRequest} request
     */
    updateRequest: function(request)
    {
        if (!this._requestsList.length) {
            // When events start coming in, we need to reset user-friendly 0 - 1000ms calculator.
            this._calculator.reset();
            this.onResize();
        }
        this._calculator.updateBoundaries(request);
        if (!this._requestsSet.has(request)) {
            this._requestsSet.add(request);
            this._requestsList.push(request);
        }
        this.scheduleUpdate();
    },

    /**
     * @override
     */
    wasShown: function()
    {
        this.onResize();
    },

    /**
     * @override
     */
    onResize: function()
    {
        var width = this._overviewContainer.offsetWidth;
        var height = this._overviewContainer.offsetHeight;
        this._calculator.setDisplayWindow(width);
        this._resetCanvas(width, height);
        var numBands = (((height - WebInspector.NetworkOverview._dividersBarHeight - 1) / WebInspector.NetworkOverview._bandHeight) - 1) | 0;
        this._numBands = (numBands > 0) ? numBands : 1;
        this.scheduleUpdate();
    },

    reset: function()
    {
        this._calculator.reset();
        this._calculator.setInitialUserFriendlyBoundaries();
        this._overviewGrid.reset();
        this._windowStart = 0;
        this._windowEnd = 0;

        /** @type {number} */
        this._span = 1;
        /** @type {!WebInspector.NetworkTimeBoundary} */
        this._lastBoundary = this._calculator.boundary();
        /** @type {number} */
        this._nextBand = 0;
        /** @type {!Map.<string, number>} */
        this._bandMap = new Map();
        /** @type {!Array.<!WebInspector.NetworkRequest>} */
        this._requestsList = [];
        /** @type {!Set.<!WebInspector.NetworkRequest>} */
        this._requestsSet = new Set();
        /** @type {!Array.<number>} */
        this._loadEvents = [];
        /** @type {!Array.<number>} */
        this._domContentLoadedEvents = [];

        // Clear screen.
        var width = this._overviewContainer.offsetWidth;
        var height = this._overviewContainer.offsetHeight;
        this._resetCanvas(width, height);
    },

    /**
     * @protected
     */
    scheduleUpdate: function()
    {
        if (this._updateScheduled || !this.isShowing())
            return;
        this._updateScheduled = true;
        this.element.window().requestAnimationFrame(this._update.bind(this));
    },

    _update: function()
    {
        this._updateScheduled = false;

        var newBoundary = this._calculator.boundary();
        if (!newBoundary.equals(this._lastBoundary)) {
            var span = this._calculator.boundarySpan();
            while (this._span < span)
                this._span *= 1.25;
            this._calculator.updateBoundariesForEventTime(this._calculator.minimumBoundary() + this._span);
            this._lastBoundary = this._calculator.boundary();
            this._overviewGrid.updateDividers(this._calculator);
            if (this._windowStart || this._windowEnd) {
                this._restoringWindow = true;
                var startTime = this._calculator.minimumBoundary();
                var totalTime = this._calculator.boundarySpan();
                var left = (this._windowStart - startTime) / totalTime;
                var right = (this._windowEnd - startTime) / totalTime;
                this._overviewGrid.setWindow(left, right);
                this._restoringWindow = false;
            }
        }

        var context = this._overviewCanvas.getContext("2d");
        var calculator = this._calculator;
        var linesByType = {};
        var paddingTop = WebInspector.NetworkOverview._dividersBarHeight;

        /**
         * @param {string} type
         * @param {string} strokeStyle
         */
        function drawLines(type, strokeStyle)
        {
            var lines = linesByType[type];
            if (!lines)
                return;
            var n = lines.length;
            context.beginPath();
            context.strokeStyle = strokeStyle;
            for (var i = 0; i < n;) {
                var y = lines[i++] * WebInspector.NetworkOverview._bandHeight + 2 + paddingTop;
                var startTime = lines[i++];
                var endTime = lines[i++];
                if (endTime === Number.MAX_VALUE)
                    endTime = calculator.maximumBoundary();
                context.moveTo(calculator.computePosition(startTime), y);
                context.lineTo(calculator.computePosition(endTime) + 1, y);
            }
            context.stroke();
        }

        /**
         * @param {string} type
         * @param {number} y
         * @param {number} start
         * @param {number} end
         */
        function addLine(type, y, start, end)
        {
            var lines = linesByType[type];
            if (!lines) {
                lines = [];
                linesByType[type] = lines;
            }
            lines.push(y, start, end);
        }

        var requests = this._requestsList;
        var n = requests.length;
        for (var i = 0; i < n; ++i) {
            var request = requests[i];
            var band = this._bandId(request.connectionId);
            var y = (band === -1) ? 0 : (band % this._numBands + 1);
            var timeRanges = WebInspector.RequestTimingView.calculateRequestTimeRanges(request);
            for (var j = 0; j < timeRanges.length; ++j) {
                var type = timeRanges[j].name;
                if (band !== -1 || type === WebInspector.RequestTimeRangeNames.Total)
                    addLine(type, y, timeRanges[j].start, timeRanges[j].end);
            }
        }

        context.clearRect(0, 0, this._overviewCanvas.width, this._overviewCanvas.height);
        context.save();
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
        context.fillStyle = "white";
        context.lineWidth = 0;
        context.fillRect(0, paddingTop, this._canvasWidth, this._canvasHeight - paddingTop);
        context.lineWidth = 2;
        drawLines(WebInspector.RequestTimeRangeNames.Total, "#CCCCCC");
        drawLines(WebInspector.RequestTimeRangeNames.Blocking, "#AAAAAA");
        drawLines(WebInspector.RequestTimeRangeNames.Connecting, "#FF9800");
        drawLines(WebInspector.RequestTimeRangeNames.ServiceWorker, "#FF9800");
        drawLines(WebInspector.RequestTimeRangeNames.ServiceWorkerPreparation, "#FF9800");
        drawLines(WebInspector.RequestTimeRangeNames.Proxy, "#A1887F");
        drawLines(WebInspector.RequestTimeRangeNames.DNS, "#009688");
        drawLines(WebInspector.RequestTimeRangeNames.SSL, "#9C27B0");
        drawLines(WebInspector.RequestTimeRangeNames.Sending, "#B0BEC5");
        drawLines(WebInspector.RequestTimeRangeNames.Waiting, "#00C853");
        drawLines(WebInspector.RequestTimeRangeNames.Receiving, "#03A9F4");

        context.lineWidth = 1;
        context.beginPath();
        context.strokeStyle = "#8080FF"; // Keep in sync with .network-blue-divider CSS rule.
        for (var i = this._domContentLoadedEvents.length; i >= 0; --i) {
            var x = Math.round(calculator.computePosition(this._domContentLoadedEvents[i]));
            context.moveTo(x + 0.5, 0);
            context.lineTo(x + 0.5, this._canvasHeight);
        }
        context.stroke();
        context.beginPath();
        context.strokeStyle = "#FF8080"; // Keep in sync with .network-red-divider CSS rule.
        for (var i = this._loadEvents.length; i >= 0; --i) {
            var x = Math.round(calculator.computePosition(this._loadEvents[i]));
            context.moveTo(x + 0.5, 0);
            context.lineTo(x + 0.5, this._canvasHeight);
        }
        context.stroke();

        context.restore();
    },

    /**
     * @param {number} width
     * @param {number} height
     */
    _resetCanvas: function(width, height)
    {
        this._canvasWidth = width;
        this._canvasHeight = height;
        this._overviewCanvas.width = width * window.devicePixelRatio;
        this._overviewCanvas.height = height * window.devicePixelRatio;
        this._overviewGrid.updateDividers(this._calculator);
    },

    __proto__: WebInspector.VBox.prototype
}
