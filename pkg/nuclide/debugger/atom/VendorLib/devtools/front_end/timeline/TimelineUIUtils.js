/*
 * Copyright (C) 2013 Google Inc. All rights reserved.
 * Copyright (C) 2012 Intel Inc. All rights reserved.
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
 */
WebInspector.TimelineUIUtils = function() { }

/**
 * @constructor
 * @param {string} title
 * @param {!WebInspector.TimelineCategory} category
 * @param {boolean=} hidden
 */
WebInspector.TimelineRecordStyle = function(title, category, hidden)
{
    this.title = title;
    this.category = category;
    this.hidden = !!hidden;
}

/**
 * @return {!Object.<string, !WebInspector.TimelineRecordStyle>}
 */
WebInspector.TimelineUIUtils._initEventStyles = function()
{
    if (WebInspector.TimelineUIUtils._eventStylesMap)
        return WebInspector.TimelineUIUtils._eventStylesMap;

    var recordTypes = WebInspector.TimelineModel.RecordType;
    var categories = WebInspector.TimelineUIUtils.categories();

    var eventStyles = {};
    eventStyles[recordTypes.Task] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Task"), categories["other"]);
    eventStyles[recordTypes.Program] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Other"), categories["other"]);
    eventStyles[recordTypes.Animation] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Animation"), categories["rendering"]);
    eventStyles[recordTypes.EventDispatch] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Event"), categories["scripting"]);
    eventStyles[recordTypes.RequestMainThreadFrame] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Request Main Thread Frame"), categories["rendering"], true);
    eventStyles[recordTypes.BeginFrame] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Frame Start"), categories["rendering"], true);
    eventStyles[recordTypes.BeginMainThreadFrame] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Frame Start (main thread)"), categories["rendering"], true);
    eventStyles[recordTypes.DrawFrame] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Draw Frame"), categories["rendering"], true);
    eventStyles[recordTypes.ScheduleStyleRecalculation] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Schedule Style Recalculation"), categories["rendering"], true);
    eventStyles[recordTypes.RecalculateStyles] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Recalculate Style"), categories["rendering"]);
    eventStyles[recordTypes.InvalidateLayout] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Invalidate Layout"), categories["rendering"], true);
    eventStyles[recordTypes.Layout] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Layout"), categories["rendering"]);
    eventStyles[recordTypes.PaintSetup] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Paint Setup"), categories["painting"]);
    eventStyles[recordTypes.PaintImage] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Paint Image"), categories["painting"], true);
    eventStyles[recordTypes.UpdateLayer] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Update Layer"), categories["painting"], true);
    eventStyles[recordTypes.UpdateLayerTree] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Update Layer Tree"), categories["rendering"]);
    eventStyles[recordTypes.Paint] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Paint"), categories["painting"]);
    eventStyles[recordTypes.RasterTask] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Rasterize Paint"), categories["painting"]);
    eventStyles[recordTypes.ScrollLayer] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Scroll"), categories["rendering"]);
    eventStyles[recordTypes.CompositeLayers] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Composite Layers"), categories["painting"]);
    eventStyles[recordTypes.ParseHTML] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Parse HTML"), categories["loading"]);
    eventStyles[recordTypes.ParseAuthorStyleSheet] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Parse Author Style Sheet"), categories["loading"]);
    eventStyles[recordTypes.TimerInstall] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Install Timer"), categories["scripting"]);
    eventStyles[recordTypes.TimerRemove] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Remove Timer"), categories["scripting"]);
    eventStyles[recordTypes.TimerFire] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Timer Fired"), categories["scripting"]);
    eventStyles[recordTypes.XHRReadyStateChange] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("XHR Ready State Change"), categories["scripting"]);
    eventStyles[recordTypes.XHRLoad] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("XHR Load"), categories["scripting"]);
    eventStyles[recordTypes.EvaluateScript] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Evaluate Script"), categories["scripting"]);
    eventStyles[recordTypes.MarkLoad] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Load event"), categories["scripting"], true);
    eventStyles[recordTypes.MarkDOMContent] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("DOMContentLoaded event"), categories["scripting"], true);
    eventStyles[recordTypes.MarkFirstPaint] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("First paint"), categories["painting"], true);
    eventStyles[recordTypes.TimeStamp] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Timestamp"), categories["scripting"]);
    eventStyles[recordTypes.ConsoleTime] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Console Time"), categories["scripting"]);
    eventStyles[recordTypes.ResourceSendRequest] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Send Request"), categories["loading"]);
    eventStyles[recordTypes.ResourceReceiveResponse] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Receive Response"), categories["loading"]);
    eventStyles[recordTypes.ResourceFinish] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Finish Loading"), categories["loading"]);
    eventStyles[recordTypes.ResourceReceivedData] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Receive Data"), categories["loading"]);
    eventStyles[recordTypes.FunctionCall] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Function Call"), categories["scripting"]);
    eventStyles[recordTypes.GCEvent] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("GC Event"), categories["scripting"]);
    eventStyles[recordTypes.JSFrame] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("JS Frame"), categories["scripting"]);
    eventStyles[recordTypes.RequestAnimationFrame] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Request Animation Frame"), categories["scripting"]);
    eventStyles[recordTypes.CancelAnimationFrame] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Cancel Animation Frame"), categories["scripting"]);
    eventStyles[recordTypes.FireAnimationFrame] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Animation Frame Fired"), categories["scripting"]);
    eventStyles[recordTypes.WebSocketCreate] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Create WebSocket"), categories["scripting"]);
    eventStyles[recordTypes.WebSocketSendHandshakeRequest] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Send WebSocket Handshake"), categories["scripting"]);
    eventStyles[recordTypes.WebSocketReceiveHandshakeResponse] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Receive WebSocket Handshake"), categories["scripting"]);
    eventStyles[recordTypes.WebSocketDestroy] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Destroy WebSocket"), categories["scripting"]);
    eventStyles[recordTypes.EmbedderCallback] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Embedder Callback"), categories["scripting"]);
    eventStyles[recordTypes.DecodeImage] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Image Decode"), categories["painting"]);
    eventStyles[recordTypes.ResizeImage] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Image Resize"), categories["painting"]);
    eventStyles[recordTypes.GPUTask] = new WebInspector.TimelineRecordStyle(WebInspector.UIString("GPU"), categories["gpu"]);
    WebInspector.TimelineUIUtils._eventStylesMap = eventStyles;
    return eventStyles;
}

WebInspector.TimelineUIUtils._coalescableRecordTypes = {};
WebInspector.TimelineUIUtils._coalescableRecordTypes[WebInspector.TimelineModel.RecordType.Layout] = 1;
WebInspector.TimelineUIUtils._coalescableRecordTypes[WebInspector.TimelineModel.RecordType.Paint] = 1;
WebInspector.TimelineUIUtils._coalescableRecordTypes[WebInspector.TimelineModel.RecordType.RasterTask] = 1;
WebInspector.TimelineUIUtils._coalescableRecordTypes[WebInspector.TimelineModel.RecordType.DecodeImage] = 1;
WebInspector.TimelineUIUtils._coalescableRecordTypes[WebInspector.TimelineModel.RecordType.ResizeImage] = 1;

/**
 * @param {string} recordType
 * @return {boolean}
 */
WebInspector.TimelineUIUtils.isCoalescable = function(recordType)
{
    return !!WebInspector.TimelineUIUtils._coalescableRecordTypes[recordType];
}

/**
 * @param {!WebInspector.TimelineModel.Record} record
 * @param {!RegExp} regExp
 * @return {boolean}
 */
WebInspector.TimelineUIUtils.testContentMatching = function(record, regExp)
{
    var traceEvent = record.traceEvent();
    var title = WebInspector.TimelineUIUtils.eventStyle(traceEvent).title;
    var tokens = [title];
    if (traceEvent.url)
        tokens.push(traceEvent.url);
    for (var argName in traceEvent.args) {
        var argValue = traceEvent.args[argName];
        for (var key in argValue)
            tokens.push(argValue[key]);
    }
    return regExp.test(tokens.join("|"));
}

/**
 * @param {!WebInspector.TimelineModel.Record} record
 * @return {!WebInspector.TimelineCategory}
 */
WebInspector.TimelineUIUtils.categoryForRecord = function(record)
{
    return WebInspector.TimelineUIUtils.eventStyle(record.traceEvent()).category;
}

/**
 * @param {!WebInspector.TracingModel.Event} event
 * @return {!{title: string, category: !WebInspector.TimelineCategory}}
 */
WebInspector.TimelineUIUtils.eventStyle = function(event)
{
    var eventStyles = WebInspector.TimelineUIUtils._initEventStyles();
    if (event.category === WebInspector.TracingModel.ConsoleEventCategory)
        return { title: event.name, category: WebInspector.TimelineUIUtils.categories()["scripting"] };

    var result = eventStyles[event.name];
    if (!result) {
        result = new WebInspector.TimelineRecordStyle(WebInspector.UIString("Unknown: %s", event.name),  WebInspector.TimelineUIUtils.categories()["other"], true);
        eventStyles[event.name] = result;
    }
    return result;
}

/**
 * @param {!WebInspector.TracingModel.Event} event
 * @return {string}
 */
WebInspector.TimelineUIUtils.eventTitle = function(event)
{
    var title = WebInspector.TimelineUIUtils.eventStyle(event).title;
    if (event.category === WebInspector.TracingModel.ConsoleEventCategory)
        return title;
    if (event.name === WebInspector.TimelineModel.RecordType.TimeStamp)
        return WebInspector.UIString("%s: %s", title, event.args["data"]["message"]);
    if (event.name === WebInspector.TimelineModel.RecordType.Animation && event.args["data"] && event.args["data"]["name"])
        return WebInspector.UIString("%s: %s", title, event.args["data"]["name"]);
    return title;
}

/**
 * @param {!WebInspector.TracingModel.Event} event
 * @return {boolean}
 */
WebInspector.TimelineUIUtils.isMarkerEvent = function(event)
{
    var recordTypes = WebInspector.TimelineModel.RecordType;
    switch (event.name) {
    case recordTypes.TimeStamp:
    case recordTypes.MarkFirstPaint:
        return true;
    case recordTypes.MarkDOMContent:
    case recordTypes.MarkLoad:
        return event.args["data"]["isMainFrame"];
    default:
        return false;
    }
}

/**
 * @param {!WebInspector.TracingModel.Event} event
 * @param {?WebInspector.Target} target
 * @return {?string}
 */
WebInspector.TimelineUIUtils.buildDetailsTextForTraceEvent = function(event, target)
{
    var recordType = WebInspector.TimelineModel.RecordType;
    var detailsText;
    var eventData = event.args["data"];
    switch (event.name) {
    case recordType.GCEvent:
        var delta = event.args["usedHeapSizeBefore"] - event.args["usedHeapSizeAfter"];
        detailsText = WebInspector.UIString("%s collected", Number.bytesToString(delta));
        break;
    case recordType.TimerFire:
        detailsText = eventData["timerId"];
        break;
    case recordType.FunctionCall:
        detailsText = linkifyLocationAsText(eventData["scriptId"], eventData["scriptLine"], 0);
        break;
    case recordType.JSFrame:
        detailsText = WebInspector.beautifyFunctionName(eventData["functionName"]);
        break;
    case recordType.FireAnimationFrame:
        detailsText = eventData["id"];
        break;
    case recordType.EventDispatch:
        detailsText = eventData ? eventData["type"] : null;
        break;
    case recordType.Paint:
        var width = WebInspector.TimelineUIUtils.quadWidth(eventData.clip);
        var height = WebInspector.TimelineUIUtils.quadHeight(eventData.clip);
        if (width && height)
            detailsText = WebInspector.UIString("%d\u2009\u00d7\u2009%d", width, height);
        break;
    case recordType.TimerInstall:
    case recordType.TimerRemove:
        detailsText = linkifyTopCallFrameAsText() || eventData["timerId"];
        break;
    case recordType.RequestAnimationFrame:
    case recordType.CancelAnimationFrame:
        detailsText = linkifyTopCallFrameAsText() || eventData["id"];
        break;
    case recordType.ParseHTML:
    case recordType.RecalculateStyles:
        detailsText = linkifyTopCallFrameAsText();
        break;
    case recordType.EvaluateScript:
        var url = eventData["url"];
        if (url)
            detailsText = url + ":" + eventData["lineNumber"];
        break;
    case recordType.XHRReadyStateChange:
    case recordType.XHRLoad:
    case recordType.ResourceSendRequest:
        var url = eventData["url"];
        if (url)
            detailsText = WebInspector.displayNameForURL(url);
        break;
    case recordType.ResourceReceivedData:
    case recordType.ResourceReceiveResponse:
    case recordType.ResourceFinish:
        var initiator = event.initiator;
        if (initiator) {
            var url = initiator.args["data"]["url"];
            if (url)
                detailsText = WebInspector.displayNameForURL(url);
        }
        break;
    case recordType.EmbedderCallback:
        detailsText = eventData["callbackName"];
        break;

    case recordType.PaintImage:
    case recordType.DecodeImage:
    case recordType.ResizeImage:
    case recordType.DecodeLazyPixelRef:
            var url = event.url;
            if (url)
                detailsText = WebInspector.displayNameForURL(url);
        break;

    case recordType.Animation:
        detailsText = eventData && eventData["name"];
        break;

    default:
        if (event.category === WebInspector.TracingModel.ConsoleEventCategory)
            detailsText = null;
        else
            detailsText = linkifyTopCallFrameAsText();
        break;
    }

    return detailsText;

    /**
     * @param {string} scriptId
     * @param {number} lineNumber
     * @param {number=} columnNumber
     * @return {?string}
     */
    function linkifyLocationAsText(scriptId, lineNumber, columnNumber)
    {
        // FIXME(62725): stack trace line/column numbers are one-based.
        var rawLocation = target && !target.isDetached() && scriptId ? target.debuggerModel.createRawLocationByScriptId(scriptId, lineNumber - 1, (columnNumber || 1) - 1) : null;
        if (!rawLocation)
            return null;
        var uiLocation = WebInspector.debuggerWorkspaceBinding.rawLocationToUILocation(rawLocation);
        return uiLocation.toUIString();
    }

    /**
     * @return {?string}
     */
    function linkifyTopCallFrameAsText()
    {
        var stackTrace = event.stackTrace;
        if (!stackTrace) {
            var initiator = event.initiator;
            if (initiator)
                stackTrace = initiator.stackTrace;
        }
        if (!stackTrace || !stackTrace.length)
            return null;
        var callFrame = stackTrace[0];
        return linkifyLocationAsText(callFrame.scriptId, callFrame.lineNumber, callFrame.columnNumber);
    }
}

/**
 * @param {!WebInspector.TracingModel.Event} event
 * @param {?WebInspector.Target} target
 * @param {!WebInspector.Linkifier} linkifier
 * @return {?Node}
 */
WebInspector.TimelineUIUtils.buildDetailsNodeForTraceEvent = function(event, target, linkifier)
{
    var recordType = WebInspector.TimelineModel.RecordType;
    var details;
    var detailsText;
    var eventData = event.args["data"];
    switch (event.name) {
    case recordType.GCEvent:
    case recordType.TimerFire:
    case recordType.FireAnimationFrame:
    case recordType.EventDispatch:
    case recordType.Paint:
    case recordType.PaintImage:
    case recordType.DecodeImage:
    case recordType.ResizeImage:
    case recordType.DecodeLazyPixelRef:
    case recordType.Animation:
    case recordType.XHRReadyStateChange:
    case recordType.XHRLoad:
    case recordType.ResourceSendRequest:
    case recordType.ResourceReceivedData:
    case recordType.ResourceReceiveResponse:
    case recordType.ResourceFinish:
    case recordType.EmbedderCallback:
        detailsText = WebInspector.TimelineUIUtils.buildDetailsTextForTraceEvent(event, target);
        break;
    case recordType.FunctionCall:
        details = linkifyLocation(eventData["scriptId"], eventData["scriptName"], eventData["scriptLine"], 0);
        break;
    case recordType.JSFrame:
        details = createElement("span");
        details.createTextChild(WebInspector.beautifyFunctionName(eventData["functionName"]));
        var location = linkifyLocation(eventData["scriptId"], eventData["url"], eventData["lineNumber"], eventData["columnNumber"]);
        if (location) {
           details.createTextChild(" @ ");
           details.appendChild(location);
        }
        break;
    case recordType.TimerInstall:
    case recordType.TimerRemove:
        details = linkifyTopCallFrame();
        detailsText = eventData["timerId"];
        break;
    case recordType.RequestAnimationFrame:
    case recordType.CancelAnimationFrame:
        details = linkifyTopCallFrame();
        detailsText = eventData["id"];
        break;
    case recordType.ParseHTML:
    case recordType.RecalculateStyles:
        details = linkifyTopCallFrame();
        break;
    case recordType.EvaluateScript:
        var url = eventData["url"];
        if (url)
            details = linkifyLocation("", url, eventData["lineNumber"], 0);
        break;
    default:
        if (event.category === WebInspector.TracingModel.ConsoleEventCategory)
            detailsText = null;
        else
            details = linkifyTopCallFrame();
        break;
    }

    if (!details && detailsText)
        details = createTextNode(detailsText);
    return details;

    /**
     * @param {string} scriptId
     * @param {string} url
     * @param {number} lineNumber
     * @param {number=} columnNumber
     */
    function linkifyLocation(scriptId, url, lineNumber, columnNumber)
    {
        if (!url)
            return null;

        // FIXME(62725): stack trace line/column numbers are one-based.
        return linkifier.linkifyScriptLocation(target, scriptId, url, lineNumber - 1, (columnNumber ||1) - 1, "timeline-details");
    }

    /**
     * @return {?Element}
     */
    function linkifyTopCallFrame()
    {
        var stackTrace = event.stackTrace;
        if (!stackTrace) {
            var initiator = event.initiator;
            if (initiator)
                stackTrace = initiator.stackTrace;
        }
        if (!stackTrace || !stackTrace.length)
            return null;
        return linkifier.linkifyConsoleCallFrame(target, stackTrace[0], "timeline-details");
    }
}

/**
 * @param {!WebInspector.TracingModel.Event} event
 * @param {!WebInspector.TimelineModel} model
 * @param {!WebInspector.Linkifier} linkifier
 * @param {function(!DocumentFragment)} callback
 */
WebInspector.TimelineUIUtils.buildTraceEventDetails = function(event, model, linkifier, callback)
{
    var target = model.target();
    if (!target) {
        callbackWrapper();
        return;
    }
    var relatedNodes = null;
    var barrier = new CallbackBarrier();
    if (!event.previewElement) {
        if (event.url)
            WebInspector.DOMPresentationUtils.buildImagePreviewContents(target, event.url, false, barrier.createCallback(saveImage));
        else if (event.picture)
            WebInspector.TimelineUIUtils.buildPicturePreviewContent(event, target, barrier.createCallback(saveImage));
    }
    var nodeIdsToResolve = new Set();
    if (event.backendNodeId)
        nodeIdsToResolve.add(event.backendNodeId);
    if (event.invalidationTrackingEvents)
        WebInspector.TimelineUIUtils._collectInvalidationNodeIds(nodeIdsToResolve, event.invalidationTrackingEvents);
    if (nodeIdsToResolve.size)
        target.domModel.pushNodesByBackendIdsToFrontend(nodeIdsToResolve, barrier.createCallback(setRelatedNodeMap));
    barrier.callWhenDone(callbackWrapper);

    /**
     * @param {!Element=} element
     */
    function saveImage(element)
    {
        event.previewElement = element || null;
    }

    /**
     * @param {?Map<number, ?WebInspector.DOMNode>} nodeMap
     */
    function setRelatedNodeMap(nodeMap)
    {
        relatedNodes = nodeMap;
    }

    function callbackWrapper()
    {
        callback(WebInspector.TimelineUIUtils._buildTraceEventDetailsSynchronously(event, model, linkifier, relatedNodes));
    }
}

/**
 * @param {!WebInspector.TracingModel.Event} event
 * @param {!WebInspector.TimelineModel} model
 * @param {!WebInspector.Linkifier} linkifier
 * @param {?Map<number, ?WebInspector.DOMNode>} relatedNodesMap
 * @return {!DocumentFragment}
 */
WebInspector.TimelineUIUtils._buildTraceEventDetailsSynchronously = function(event, model, linkifier, relatedNodesMap)
{
    var fragment = createDocumentFragment();
    var stats = {};
    var recordTypes = WebInspector.TimelineModel.RecordType;

    // This message may vary per event.name;
    var relatedNodeLabel;

    var contentHelper = new WebInspector.TimelineDetailsContentHelper(model.target(), linkifier, relatedNodesMap, true);
    contentHelper.appendTextRow(WebInspector.UIString("Type"), WebInspector.TimelineUIUtils.eventTitle(event));
    contentHelper.appendTextRow(WebInspector.UIString("Total Time"), Number.millisToString(event.duration || 0, true));
    contentHelper.appendTextRow(WebInspector.UIString("Self Time"), Number.millisToString(event.selfTime, true));
    if (event.previewElement)
        contentHelper.appendElementRow(WebInspector.UIString("Preview"), event.previewElement);

    var eventData = event.args["data"];
    var initiator = event.initiator;

    switch (event.name) {
    case recordTypes.GCEvent:
        var delta = event.args["usedHeapSizeBefore"] - event.args["usedHeapSizeAfter"];
        contentHelper.appendTextRow(WebInspector.UIString("Collected"), Number.bytesToString(delta));
        break;
    case recordTypes.TimerFire:
    case recordTypes.TimerInstall:
    case recordTypes.TimerRemove:
        contentHelper.appendTextRow(WebInspector.UIString("Timer ID"), eventData["timerId"]);
        if (event.name === recordTypes.TimerInstall) {
            contentHelper.appendTextRow(WebInspector.UIString("Timeout"), Number.millisToString(eventData["timeout"]));
            contentHelper.appendTextRow(WebInspector.UIString("Repeats"), !eventData["singleShot"]);
        }
        break;
    case recordTypes.FireAnimationFrame:
        contentHelper.appendTextRow(WebInspector.UIString("Callback ID"), eventData["id"]);
        break;
    case recordTypes.FunctionCall:
        if (eventData["scriptName"])
            contentHelper.appendLocationRow(WebInspector.UIString("Location"), eventData["scriptName"], eventData["scriptLine"]);
        break;
    case recordTypes.ResourceSendRequest:
    case recordTypes.ResourceReceiveResponse:
    case recordTypes.ResourceReceivedData:
    case recordTypes.ResourceFinish:
        var url = (event.name === recordTypes.ResourceSendRequest) ? eventData["url"] : initiator && initiator.args["data"]["url"];
        if (url)
            contentHelper.appendElementRow(WebInspector.UIString("Resource"), WebInspector.linkifyResourceAsNode(url));
        if (eventData["requestMethod"])
            contentHelper.appendTextRow(WebInspector.UIString("Request Method"), eventData["requestMethod"]);
        if (typeof eventData["statusCode"] === "number")
            contentHelper.appendTextRow(WebInspector.UIString("Status Code"), eventData["statusCode"]);
        if (eventData["mimeType"])
            contentHelper.appendTextRow(WebInspector.UIString("MIME Type"), eventData["mimeType"]);
        if (eventData["encodedDataLength"])
            contentHelper.appendTextRow(WebInspector.UIString("Encoded Data Length"), WebInspector.UIString("%d Bytes", eventData["encodedDataLength"]));
        break;
    case recordTypes.EvaluateScript:
        var url = eventData["url"];
        if (url)
            contentHelper.appendLocationRow(WebInspector.UIString("Script"), url, eventData["lineNumber"]);
        break;
    case recordTypes.Paint:
        var clip = eventData["clip"];
        contentHelper.appendTextRow(WebInspector.UIString("Location"), WebInspector.UIString("(%d, %d)", clip[0], clip[1]));
        var clipWidth = WebInspector.TimelineUIUtils.quadWidth(clip);
        var clipHeight = WebInspector.TimelineUIUtils.quadHeight(clip);
        contentHelper.appendTextRow(WebInspector.UIString("Dimensions"), WebInspector.UIString("%d × %d", clipWidth, clipHeight));
        // Fall-through intended.

    case recordTypes.PaintSetup:
    case recordTypes.Rasterize:
    case recordTypes.ScrollLayer:
        relatedNodeLabel = WebInspector.UIString("Layer root");
        break;
    case recordTypes.PaintImage:
    case recordTypes.DecodeLazyPixelRef:
    case recordTypes.DecodeImage:
    case recordTypes.ResizeImage:
    case recordTypes.DrawLazyPixelRef:
        relatedNodeLabel = WebInspector.UIString("Owner element");
        if (event.url)
            contentHelper.appendElementRow(WebInspector.UIString("Image URL"), WebInspector.linkifyResourceAsNode(event.url));
        break;
    case recordTypes.ParseAuthorStyleSheet:
        var url = eventData["styleSheetUrl"];
        if (url)
            contentHelper.appendElementRow(WebInspector.UIString("Stylesheet URL"), WebInspector.linkifyResourceAsNode(url));
        break;
    case recordTypes.RecalculateStyles: // We don't want to see default details.
        contentHelper.appendTextRow(WebInspector.UIString("Elements affected"), event.args["elementCount"]);
        break;
    case recordTypes.Layout:
        var beginData = event.args["beginData"];
        contentHelper.appendTextRow(WebInspector.UIString("Nodes that need layout"), beginData["dirtyObjects"]);
        contentHelper.appendTextRow(WebInspector.UIString("Layout tree size"), beginData["totalObjects"]);
        contentHelper.appendTextRow(WebInspector.UIString("Layout scope"),
                                    beginData["partialLayout"] ? WebInspector.UIString("Partial") : WebInspector.UIString("Whole document"));
        relatedNodeLabel = WebInspector.UIString("Layout root");
        break;
    case recordTypes.ConsoleTime:
        contentHelper.appendTextRow(WebInspector.UIString("Message"), event.name);
        break;
    case recordTypes.WebSocketCreate:
    case recordTypes.WebSocketSendHandshakeRequest:
    case recordTypes.WebSocketReceiveHandshakeResponse:
    case recordTypes.WebSocketDestroy:
        var initiatorData = initiator ? initiator.args["data"] : eventData;
        if (typeof initiatorData["webSocketURL"] !== "undefined")
            contentHelper.appendTextRow(WebInspector.UIString("URL"), initiatorData["webSocketURL"]);
        if (typeof initiatorData["webSocketProtocol"] !== "undefined")
            contentHelper.appendTextRow(WebInspector.UIString("WebSocket Protocol"), initiatorData["webSocketProtocol"]);
        if (typeof eventData["message"] !== "undefined")
            contentHelper.appendTextRow(WebInspector.UIString("Message"), eventData["message"]);
        break;
    case recordTypes.EmbedderCallback:
        contentHelper.appendTextRow(WebInspector.UIString("Callback Function"), eventData["callbackName"]);
        break;
    case recordTypes.Animation:
        if (event.phase === WebInspector.TracingModel.Phase.NestableAsyncInstant)
            contentHelper.appendTextRow(WebInspector.UIString("State"), eventData["state"]);
        break;
    default:
        var detailsNode = WebInspector.TimelineUIUtils.buildDetailsNodeForTraceEvent(event, model.target(), linkifier);
        if (detailsNode)
            contentHelper.appendElementRow(WebInspector.UIString("Details"), detailsNode);
        break;
    }

    var relatedNode = contentHelper.nodeForBackendId(event.backendNodeId);
    if (relatedNode)
        contentHelper.appendElementRow(relatedNodeLabel || WebInspector.UIString("Related node"), WebInspector.DOMPresentationUtils.linkifyNodeReference(relatedNode));

    if (eventData && eventData["scriptName"] && event.name !== recordTypes.FunctionCall)
        contentHelper.appendLocationRow(WebInspector.UIString("Function Call"), eventData["scriptName"], eventData["scriptLine"]);

    var warning = event.warning;
    if (warning) {
        var div = createElement("div");
        div.textContent = warning;
        contentHelper.appendElementRow(WebInspector.UIString("Warning"), div);
    }

    var hasChildren = WebInspector.TimelineUIUtils._aggregatedStatsForTraceEvent(stats, model, event);
    if (hasChildren) {
        var pieChart = WebInspector.TimelineUIUtils.generatePieChart(stats, WebInspector.TimelineUIUtils.eventStyle(event).category, event.selfTime);
        contentHelper.appendElementRow(WebInspector.UIString("Aggregated Time"), pieChart);
    }

    if (event.stackTrace || (event.initiator && event.initiator.stackTrace) || event.invalidationTrackingEvents)
        WebInspector.TimelineUIUtils._generateCauses(event, model.target(), contentHelper);

    fragment.appendChild(contentHelper.element);

    return fragment;
}

/**
 * @param {!WebInspector.TracingModel.Event} event
 * @param {?WebInspector.Target} target
 * @param {!WebInspector.TimelineDetailsContentHelper} contentHelper
 */
WebInspector.TimelineUIUtils._generateCauses = function(event, target, contentHelper)
{
    var recordTypes = WebInspector.TimelineModel.RecordType;

    var callSiteStackLabel;
    var stackLabel;
    var initiator = event.initiator;

    switch (event.name) {
    case recordTypes.TimerFire:
        callSiteStackLabel = WebInspector.UIString("Timer installed");
        break;
    case recordTypes.FireAnimationFrame:
        callSiteStackLabel = WebInspector.UIString("Animation frame requested");
        break;
    case recordTypes.RecalculateStyles:
        stackLabel = WebInspector.UIString("Recalculation was forced");
        break;
    case recordTypes.Layout:
        callSiteStackLabel = WebInspector.UIString("First layout invalidation");
        stackLabel = WebInspector.UIString("Layout forced");
        break;
    }

    // Direct cause.
    if (event.stackTrace)
        contentHelper.appendStackTrace(stackLabel || WebInspector.UIString("Stack trace"), event.stackTrace);

    // Indirect causes.
    if (event.invalidationTrackingEvents) { // Full invalidation tracking (experimental).
        WebInspector.TimelineUIUtils._generateInvalidations(event, target, contentHelper);
    } else if (initiator && initiator.stackTrace) { // Partial invalidation tracking.
        contentHelper.appendStackTrace(callSiteStackLabel || WebInspector.UIString("First invalidated"), initiator.stackTrace);
    }
}

/**
 * @param {!WebInspector.TracingModel.Event} event
 * @param {?WebInspector.Target} target
 * @param {!WebInspector.TimelineDetailsContentHelper} contentHelper
 */
WebInspector.TimelineUIUtils._generateInvalidations = function(event, target, contentHelper)
{
    if (!event.invalidationTrackingEvents)
        return;

    var invalidations = {};
    event.invalidationTrackingEvents.forEach(function(invalidation) {
        if (!invalidations[invalidation.type])
            invalidations[invalidation.type] = [invalidation];
        else
            invalidations[invalidation.type].push(invalidation);
    });

    Object.keys(invalidations).forEach(function(type) {
        WebInspector.TimelineUIUtils._generateInvalidationsForType(
            type, target, invalidations[type], contentHelper);
    });
}

/**
 * @param {string} type
 * @param {?WebInspector.Target} target
 * @param {!Array.<!WebInspector.InvalidationTrackingEvent>} invalidations
 * @param {!WebInspector.TimelineDetailsContentHelper} contentHelper
 */
WebInspector.TimelineUIUtils._generateInvalidationsForType = function(type, target, invalidations, contentHelper)
{
    var title;
    switch (type) {
    case WebInspector.TimelineModel.RecordType.StyleRecalcInvalidationTracking:
        title = WebInspector.UIString("Style invalidations");
        break;
    case WebInspector.TimelineModel.RecordType.LayoutInvalidationTracking:
        title = WebInspector.UIString("Layout invalidations");
        break;
    default:
        title = WebInspector.UIString("Other invalidations");
        break;
    }

    var detailsNode = createElementWithClass("div", "timeline-details-view-row");
    var titleElement = detailsNode.createChild("span", "timeline-details-view-row-title");
    titleElement.textContent = WebInspector.UIString("%s: ", title);
    var eventsList = detailsNode.createChild("div", "timeline-details-view-row-value");
    var invalidationGroups = groupInvalidationsByCause(invalidations);
    invalidationGroups.forEach(function(group) {
        appendInvalidationGroup(eventsList, group);
    });
    contentHelper.element.appendChild(detailsNode);

    /**
     * @param {!Array.<!WebInspector.InvalidationTrackingEvent>} invalidations
     */
    function groupInvalidationsByCause(invalidations)
    {
        var causeToInvalidationMap = {};
        for (var index = 0; index < invalidations.length; index++) {
            var invalidation = invalidations[index];
            var causeKey = "";
            if (invalidation.cause.reason)
                causeKey += invalidation.cause.reason + ".";
            if (invalidation.cause.stackTrace) {
                invalidation.cause.stackTrace.forEach(function(stackFrame) {
                    causeKey += stackFrame["functionName"] + ".";
                    causeKey += stackFrame["scriptId"] + ".";
                    causeKey += stackFrame["url"] + ".";
                    causeKey += stackFrame["lineNumber"] + ".";
                    causeKey += stackFrame["columnNumber"] + ".";
                });
            }

            if (causeToInvalidationMap[causeKey])
                causeToInvalidationMap[causeKey].push(invalidation);
            else
                causeToInvalidationMap[causeKey] = [ invalidation ];
        }
        return Object.values(causeToInvalidationMap);
    }

    /**
     * @param {!Element} parentElement
     * @param {!Array.<!WebInspector.InvalidationTrackingEvent>} invalidations
     */
    function appendInvalidationGroup(parentElement, invalidations)
    {
        if (!target)
            return;

        var row = parentElement.createChild("div", "invalidations-group section");
        var header = row.createChild("div", "header");
        header.addEventListener("click", function() {
            toggleDetails(header, invalidations);
        });

        var first = invalidations[0];
        var reason = first.cause.reason;
        var topFrame = first.cause.stackTrace && first.cause.stackTrace[0];

        if (reason)
            header.createTextChild(WebInspector.UIString("%s for ", reason));
        else
            header.createTextChild(WebInspector.UIString("Unknown cause for "));

        appendTruncatedNodeList(header, invalidations);

        if (topFrame && contentHelper.linkifier()) {
            header.createTextChild(WebInspector.UIString(". "));
            var stack = header.createChild("span", "monospace");

            stack.createChild("span").textContent = WebInspector.beautifyFunctionName(topFrame.functionName);
            stack.createChild("span").textContent = " @ ";
            stack.createChild("span").appendChild(contentHelper.linkifier().linkifyConsoleCallFrame(target, topFrame));
        }
    }

    /**
     * @param {!WebInspector.InvalidationTrackingEvent} invalidation
     * @param {boolean} showUnknownNodes
     */
    function createInvalidationNode(invalidation, showUnknownNodes)
    {
        var node = contentHelper.nodeForBackendId(invalidation.nodeId);
        if (node)
            return WebInspector.DOMPresentationUtils.linkifyNodeReference(node);
        if (invalidation.nodeName) {
            var nodeSpan = createElement("span");
            nodeSpan.textContent = WebInspector.UIString("[ %s ]", invalidation.nodeName);
            return nodeSpan;
        }
        if (showUnknownNodes) {
            var nodeSpan = createElement("span");
            return nodeSpan.createTextChild(WebInspector.UIString("[ unknown node ]"));
        }
    }

    /**
     * @param {!Element} parentElement
     * @param {!Array.<!WebInspector.InvalidationTrackingEvent>} invalidations
     */
    function appendTruncatedNodeList(parentElement, invalidations)
    {
        var invalidationNodes = [];
        var invalidationNodeIdMap = {};
        for (var i = 0; i < invalidations.length; i++) {
            var invalidation = invalidations[i];
            var invalidationNode = createInvalidationNode(invalidation, false);
            if (invalidationNode && !invalidationNodeIdMap[invalidation.nodeId]) {
                invalidationNodes.push(invalidationNode);
                invalidationNodeIdMap[invalidation.nodeId] = true;
            }
        }

        if (invalidationNodes.length === 1) {
            parentElement.appendChild(invalidationNodes[0]);
        } else if (invalidationNodes.length === 2) {
            parentElement.appendChild(invalidationNodes[0]);
            parentElement.createTextChild(WebInspector.UIString(" and "));
            parentElement.appendChild(invalidationNodes[1]);
        } else if (invalidationNodes.length >= 3) {
            parentElement.appendChild(invalidationNodes[0]);
            parentElement.createTextChild(WebInspector.UIString(", "));
            parentElement.appendChild(invalidationNodes[1]);
            parentElement.createTextChild(WebInspector.UIString(", and %s others", invalidationNodes.length - 2));
        }
    }

    /**
     * @param {!Element} header
     * @param {!Array.<!WebInspector.InvalidationTrackingEvent>} invalidations
     */
    function toggleDetails(header, invalidations)
    {
        var wasExpanded = header.classList.contains("expanded");
        header.classList.toggle("expanded", !wasExpanded);
        header.parentElement.classList.toggle("expanded", !wasExpanded);

        if (wasExpanded) {
            var content = header.nextElementSibling;
            if (content)
                content.remove();
        } else {
            createInvalidationGroupDetails(header.parentElement, invalidations);
        }
    }

    /**
     * @param {!Element} parentElement
     * @param {!Array.<!WebInspector.InvalidationTrackingEvent>} invalidations
     */
    function createInvalidationGroupDetails(parentElement, invalidations)
    {
        var content = parentElement.createChild("div", "content");

        var first = invalidations[0];
        if (first.cause.stackTrace) {
            var stack = content.createChild("div");
            stack.createTextChild(WebInspector.UIString("Stack trace:"));
            contentHelper.createChildStackTraceElement(stack, first.cause.stackTrace);
        }

        content.createTextChild(invalidations.length > 1 ? WebInspector.UIString("Nodes:") : WebInspector.UIString("Node:"));
        var nodeList = content.createChild("div", "node-list timeline-details-view-row-stack-trace");
        appendDetailedNodeList(nodeList, invalidations);
    }

    /**
     * @param {!Element} parentElement
     * @param {!Array.<!WebInspector.InvalidationTrackingEvent>} invalidations
     */
    function appendDetailedNodeList(parentElement, invalidations)
    {
        var firstNode = true;
        for (var i = 0; i < invalidations.length; i++) {
            var invalidation = invalidations[i];
            var invalidationNode = createInvalidationNode(invalidation, true);
            if (invalidationNode) {
                if (!firstNode)
                    parentElement.createTextChild(WebInspector.UIString(", "));
                firstNode = false;

                parentElement.appendChild(invalidationNode);

                var extraData = invalidation.extraData ? ", " + invalidation.extraData : "";
                if (invalidation.changedId) {
                    parentElement.createTextChild(WebInspector.UIString("(changed id to \"%s\"%s)", invalidation.changedId, extraData));
                } else if (invalidation.changedClass) {
                    parentElement.createTextChild(WebInspector.UIString("(changed class to \"%s\"%s)", invalidation.changedClass, extraData));
                } else if (invalidation.changedAttribute) {
                    parentElement.createTextChild(WebInspector.UIString("(changed attribute to \"%s\"%s)", invalidation.changedAttribute, extraData));
                } else if (invalidation.changedPseudo) {
                    parentElement.createTextChild(WebInspector.UIString("(changed pesudo to \"%s\"%s)", invalidation.changedPseudo, extraData));
                } else if (invalidation.selectorPart) {
                    parentElement.createTextChild(WebInspector.UIString("(changed \"%s\"%s)", invalidation.selectorPart, extraData));
                }
            }
        }
    }
}

/**
 * @param {!Set<number>} nodeIds
 * @param {!WebInspector.InvalidationTrackingEvent} invalidations
 */
WebInspector.TimelineUIUtils._collectInvalidationNodeIds = function(nodeIds, invalidations)
{
    for (var i = 0; i < invalidations.length; ++i) {
        if (invalidations[i].nodeId)
            nodeIds.add(invalidations[i].nodeId);
    }
}

/**
 * @param {!Object} total
 * @param {!WebInspector.TimelineModel.Record} record
 */
WebInspector.TimelineUIUtils.aggregateTimeForRecord = function(total, record)
{
    var traceEvent = record.traceEvent();
    var model = record.timelineModel();
    WebInspector.TimelineUIUtils._aggregatedStatsForTraceEvent(total, model, traceEvent);
}

/**
 * @param {!Object} total
 * @param {!WebInspector.TimelineModel} model
 * @param {!WebInspector.TracingModel.Event} event
 * @return {boolean}
 */
WebInspector.TimelineUIUtils._aggregatedStatsForTraceEvent = function(total, model, event)
{
    var events = model.inspectedTargetEvents();
    /**
     * @param {number} startTime
     * @param {!WebInspector.TracingModel.Event} e
     * @return {number}
     */
    function eventComparator(startTime, e)
    {
        return startTime - e.startTime;
    }
    var index = events.binaryIndexOf(event.startTime, eventComparator);
    // Not a main thread event?
    if (index < 0)
        return false;
    var hasChildren = false;
    var endTime = event.endTime;
    if (endTime) {
        for (var i = index; i < events.length; i++) {
            var nextEvent = events[i];
            if (nextEvent.startTime >= endTime)
                break;
            if (!nextEvent.selfTime)
                continue;
            if (nextEvent.thread !== event.thread)
                continue;
            if (i > index)
                hasChildren = true;
            var categoryName = WebInspector.TimelineUIUtils.eventStyle(nextEvent).category.name;
            total[categoryName] = (total[categoryName] || 0) + nextEvent.selfTime;
        }
    }
    if (WebInspector.TracingModel.isAsyncPhase(event.phase)) {
        if (event.endTime) {
            var aggregatedTotal = 0;
            for (var categoryName in total)
                aggregatedTotal += total[categoryName];
            total["idle"] = Math.max(0, event.endTime - event.startTime - aggregatedTotal);
        }
        return false;
    }
    return hasChildren;
}

/**
 * @param {!WebInspector.TracingModel.Event} event
 * @param {!WebInspector.Target} target
 * @param {function(!Element=)} callback
 */
WebInspector.TimelineUIUtils.buildPicturePreviewContent = function(event, target, callback)
{

    new WebInspector.LayerPaintEvent(event, target).loadSnapshot(onSnapshotLoaded);
    /**
     * @param {?Array.<number>} rect
     * @param {?WebInspector.PaintProfilerSnapshot} snapshot
     */
    function onSnapshotLoaded(rect, snapshot)
    {
        if (!snapshot) {
            callback();
            return;
        }
        snapshot.requestImage(null, null, 1, onGotImage);
        snapshot.dispose();
    }

    /**
     * @param {string=} imageURL
     */
    function onGotImage(imageURL)
    {
        if (!imageURL) {
            callback();
            return;
        }
        var container = createElement("div");
        container.classList.add("image-preview-container", "vbox", "link");
        var img = container.createChild("img");
        img.src = imageURL;
        var paintProfilerButton = container.createChild("a");
        paintProfilerButton.textContent = WebInspector.UIString("Paint Profiler");
        container.addEventListener("click", showPaintProfiler, false);
        callback(container);
    }

    function showPaintProfiler()
    {
        WebInspector.TimelinePanel.instance().select(WebInspector.TimelineSelection.fromTraceEvent(event), WebInspector.TimelinePanel.DetailsTab.PaintProfiler);
    }
}

/**
 * @param {string} recordType
 * @param {?string} title
 * @param {number} position
 * @return {!Element}
 */
WebInspector.TimelineUIUtils.createEventDivider = function(recordType, title, position)
{
    var eventDivider = createElement("div");
    eventDivider.className = "resources-event-divider";
    var recordTypes = WebInspector.TimelineModel.RecordType;

    if (recordType === recordTypes.MarkDOMContent)
        eventDivider.className += " resources-blue-divider";
    else if (recordType === recordTypes.MarkLoad)
        eventDivider.className += " resources-red-divider";
    else if (recordType === recordTypes.MarkFirstPaint)
        eventDivider.className += " resources-green-divider";
    else if (recordType === recordTypes.TimeStamp || recordType === recordTypes.ConsoleTime)
        eventDivider.className += " resources-orange-divider";
    else if (recordType === recordTypes.BeginFrame)
        eventDivider.className += " timeline-frame-divider";

    if (title)
        eventDivider.title = title;
    eventDivider.style.left = position + "px";
    return eventDivider;
}

/**
 * @param {!WebInspector.TimelineModel.Record} record
 * @param {number} position
 * @return {!Element}
 */
WebInspector.TimelineUIUtils.createDividerForRecord = function(record, position)
{
    var startTime = Number.millisToString(record.startTime() - record.timelineModel().minimumRecordTime());
    var title = WebInspector.UIString("%s at %s", WebInspector.TimelineUIUtils.eventTitle(record.traceEvent()), startTime);
    return WebInspector.TimelineUIUtils.createEventDivider(record.type(), title, position);
}

/**
 * @return {!Array.<string>}
 */
WebInspector.TimelineUIUtils._visibleTypes = function()
{
    var eventStyles = WebInspector.TimelineUIUtils._initEventStyles();
    var result = [];
    for (var name in eventStyles) {
        if (!eventStyles[name].hidden)
            result.push(name);
    }
    return result;
}

/**
 * @return {!WebInspector.TimelineModel.Filter}
 */
WebInspector.TimelineUIUtils.visibleRecordsFilter = function()
{
    return new WebInspector.TimelineVisibleRecordsFilter(WebInspector.TimelineUIUtils._visibleTypes());
}

/**
 * @return {!WebInspector.TraceEventFilter}
 */
WebInspector.TimelineUIUtils.hiddenEventsFilter = function()
{
    return new WebInspector.InclusiveTraceEventNameFilter(WebInspector.TimelineUIUtils._visibleTypes());
}

/**
 * @return {!Object.<string, !WebInspector.TimelineCategory>}
 */
WebInspector.TimelineUIUtils.categories = function()
{
    if (WebInspector.TimelineUIUtils._categories)
        return WebInspector.TimelineUIUtils._categories;
    WebInspector.TimelineUIUtils._categories = {
        loading: new WebInspector.TimelineCategory("loading", WebInspector.UIString("Loading"), true, "hsl(214, 53%, 58%)", "hsl(214, 67%, 90%)", "hsl(214, 67%, 74%)", "hsl(214, 67%, 66%)"),
        scripting: new WebInspector.TimelineCategory("scripting", WebInspector.UIString("Scripting"), true, "hsl(43, 90%, 45%)", "hsl(43, 83%, 90%)", "hsl(43, 83%, 72%)", "hsl(43, 83%, 64%) "),
        rendering: new WebInspector.TimelineCategory("rendering", WebInspector.UIString("Rendering"), true, "hsl(256, 50%, 60%)", "hsl(256, 67%, 90%)", "hsl(256, 67%, 76%)", "hsl(256, 67%, 70%)"),
        painting: new WebInspector.TimelineCategory("painting", WebInspector.UIString("Painting"), true, "hsl(109, 33%, 47%)", "hsl(109, 33%, 90%)", "hsl(109, 33%, 64%)", "hsl(109, 33%, 55%)"),
        gpu: new WebInspector.TimelineCategory("gpu", WebInspector.UIString("GPU"), false, "hsl(240, 24%, 45%)", "hsl(240, 24%, 90%)", "hsl(240, 24%, 73%)", "hsl(240, 24%, 66%)"),
        other: new WebInspector.TimelineCategory("other", WebInspector.UIString("Other"), false, "hsl(0, 0%, 73%)", "hsl(0, 0%, 90%)", "hsl(0, 0%, 87%)", "hsl(0, 0%, 79%)"),
        idle: new WebInspector.TimelineCategory("idle", WebInspector.UIString("Idle"), false, "hsl(0, 0%, 87%)", "hsl(0, 100%, 100%)", "hsl(0, 100%, 100%)", "hsl(0, 100%, 100%)")
    };
    return WebInspector.TimelineUIUtils._categories;
};

/**
 * @constructor
 * @param {string} title
 */
WebInspector.AsyncEventGroup = function(title)
{
    this.title = title;
}

/**
 * @return {!Object<string, !WebInspector.AsyncEventGroup>}
 */
WebInspector.TimelineUIUtils.asyncEventGroups = function()
{
    if (WebInspector.TimelineUIUtils._asyncEventGroups)
        return WebInspector.TimelineUIUtils._asyncEventGroups;
    WebInspector.TimelineUIUtils._asyncEventGroups = {
        console: new WebInspector.AsyncEventGroup(WebInspector.UIString("Console"))
    };
    return WebInspector.TimelineUIUtils._asyncEventGroups;
}

/**
 * @param {!WebInspector.TimelineModel} model
 * @param {!{name: string, tasks: !Array.<!WebInspector.TimelineModel.Record>, firstTaskIndex: number, lastTaskIndex: number}} info
 * @return {!Element}
 */
WebInspector.TimelineUIUtils.generateMainThreadBarPopupContent = function(model, info)
{
    var firstTaskIndex = info.firstTaskIndex;
    var lastTaskIndex = info.lastTaskIndex;
    var tasks = info.tasks;
    var messageCount = lastTaskIndex - firstTaskIndex + 1;
    var cpuTime = 0;

    for (var i = firstTaskIndex; i <= lastTaskIndex; ++i) {
        var task = tasks[i];
        cpuTime += task.endTime() - task.startTime();
    }
    var startTime = tasks[firstTaskIndex].startTime();
    var endTime = tasks[lastTaskIndex].endTime();
    var duration = endTime - startTime;

    var contentHelper = new WebInspector.TimelinePopupContentHelper(info.name);
    var durationText = WebInspector.UIString("%s (at %s)", Number.millisToString(duration, true),
        Number.millisToString(startTime - model.minimumRecordTime(), true));
    contentHelper.appendTextRow(WebInspector.UIString("Duration"), durationText);
    contentHelper.appendTextRow(WebInspector.UIString("CPU time"), Number.millisToString(cpuTime, true));
    contentHelper.appendTextRow(WebInspector.UIString("Message Count"), messageCount);
    return contentHelper.contentTable();
}

/**
 * @param {!Object} aggregatedStats
 * @param {!WebInspector.TimelineCategory=} selfCategory
 * @param {number=} selfTime
 * @return {!Element}
 */
WebInspector.TimelineUIUtils.generatePieChart = function(aggregatedStats, selfCategory, selfTime)
{
    var element = createElementWithClass("div", "timeline-details-view-pie-chart-wrapper hbox");

    var total = 0;
    for (var categoryName in aggregatedStats)
        total += aggregatedStats[categoryName];
    /**
     * @param {number} value
     * @return {string}
     */
    function formatter(value)
    {
        return Number.millisToString(value, true);
    }
    var pieChart = new WebInspector.PieChart(100, formatter);
    pieChart.element.classList.add("timeline-details-view-pie-chart");
    pieChart.setTotal(total);
    element.appendChild(pieChart.element);
    var footerElement = element.createChild("div", "timeline-aggregated-info timeline-aggregated-info-legend");
    var rowElement = footerElement.createChild("div");
    rowElement.createTextChild(formatter(total));

    // In case of self time, first add self, then children of the same category.
    if (selfCategory) {
        if (selfTime) {
            pieChart.addSlice(selfTime, selfCategory.fillColorStop1);
            rowElement = footerElement.createChild("div");
            rowElement.createChild("div", "timeline-aggregated-category timeline-" + selfCategory.name);
            rowElement.createTextChild(WebInspector.UIString("%s %s (Self)", formatter(selfTime), selfCategory.title));
        }
        // Children of the same category.
        var categoryTime = aggregatedStats[selfCategory.name];
        var value = categoryTime - selfTime;
        if (value > 0) {
            pieChart.addSlice(value, selfCategory.fillColorStop0);
            rowElement = footerElement.createChild("div");
            rowElement.createChild("div", "timeline-aggregated-category timeline-" + selfCategory.name);
            rowElement.createTextChild(WebInspector.UIString("%s %s (Children)", formatter(value), selfCategory.title));
        }
    }

    // Add other categories.
    for (var categoryName in WebInspector.TimelineUIUtils.categories()) {
        var category = WebInspector.TimelineUIUtils.categories()[categoryName];
         if (category === selfCategory)
             continue;
         var value = aggregatedStats[category.name];
         if (!value)
             continue;
         pieChart.addSlice(value, category.fillColorStop0);
         rowElement = footerElement.createChild("div");
         rowElement.createChild("div", "timeline-aggregated-category timeline-" + category.name);
         rowElement.createTextChild(WebInspector.UIString("%s %s", formatter(value), category.title));
    }
    return element;
}

/**
 * @param {!WebInspector.TimelineFrameModelBase} frameModel
 * @param {!WebInspector.TimelineFrame} frame
 * @return {!Element}
 */
WebInspector.TimelineUIUtils.generateDetailsContentForFrame = function(frameModel, frame)
{
    var durationInMillis = frame.endTime - frame.startTime;
    var durationText = WebInspector.UIString("%s (at %s)", Number.millisToString(frame.endTime - frame.startTime, true),
        Number.millisToString(frame.startTimeOffset, true));
    var pieChart = WebInspector.TimelineUIUtils.generatePieChart(frame.timeByCategory);
    var contentHelper = new WebInspector.TimelineDetailsContentHelper(null, null, null, true);
    contentHelper.appendTextRow(WebInspector.UIString("Duration"), durationText);
    contentHelper.appendTextRow(WebInspector.UIString("FPS"), Math.floor(1000 / durationInMillis));
    contentHelper.appendTextRow(WebInspector.UIString("CPU time"), Number.millisToString(frame.cpuTime, true));
    contentHelper.appendElementRow(WebInspector.UIString("Aggregated Time"), pieChart);
    if (Runtime.experiments.isEnabled("layersPanel") && frame.layerTree) {
        contentHelper.appendElementRow(WebInspector.UIString("Layer tree"),
                                       WebInspector.Linkifier.linkifyUsingRevealer(frame.layerTree, WebInspector.UIString("show")));
    }
    return contentHelper.element;
}

/**
 * @param {!CanvasRenderingContext2D} context
 * @param {number} width
 * @param {number} height
 * @param {string} color0
 * @param {string} color1
 * @param {string} color2
 * @return {!CanvasGradient}
 */
WebInspector.TimelineUIUtils.createFillStyle = function(context, width, height, color0, color1, color2)
{
    var gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, color0);
    gradient.addColorStop(0.25, color1);
    gradient.addColorStop(0.75, color1);
    gradient.addColorStop(1, color2);
    return gradient;
}

/**
 * @param {!CanvasRenderingContext2D} context
 * @param {number} width
 * @param {number} height
 * @param {!WebInspector.TimelineCategory} category
 * @return {!CanvasGradient}
 */
WebInspector.TimelineUIUtils.createFillStyleForCategory = function(context, width, height, category)
{
    return WebInspector.TimelineUIUtils.createFillStyle(context, width, height, category.fillColorStop0, category.fillColorStop1, category.borderColor);
}

/**
 * @param {!WebInspector.TimelineCategory} category
 * @return {string}
 */
WebInspector.TimelineUIUtils.createStyleRuleForCategory = function(category)
{
    var selector = ".timeline-category-" + category.name + " .timeline-graph-bar, " +
        ".panel.timeline .timeline-filters-header .filter-checkbox-filter.filter-checkbox-filter-" + category.name + " .checkbox-filter-checkbox, " +
        ".timeline-details-view .timeline-" + category.name + ", " +
        ".timeline-category-" + category.name + " .timeline-tree-icon";

    return selector + " { background-image: linear-gradient(" +
       category.fillColorStop0 + ", " + category.fillColorStop1 + " 25%, " + category.fillColorStop1 + " 25%, " + category.fillColorStop1 + ");" +
       " border-color: " + category.borderColor +
       "}";
}

/**
 * @param {!Array.<number>} quad
 * @return {number}
 */
WebInspector.TimelineUIUtils.quadWidth = function(quad)
{
    return Math.round(Math.sqrt(Math.pow(quad[0] - quad[2], 2) + Math.pow(quad[1] - quad[3], 2)));
}

/**
 * @param {!Array.<number>} quad
 * @return {number}
 */
WebInspector.TimelineUIUtils.quadHeight = function(quad)
{
    return Math.round(Math.sqrt(Math.pow(quad[0] - quad[6], 2) + Math.pow(quad[1] - quad[7], 2)));
}

/**
 * @param {!Array.<!WebInspector.TracingModel.Event>} events
 * @return {number}
 */
WebInspector.TimelineUIUtils.calculateNetworkBandsCount = function(events)
{
    var openBands = new Set();
    var maxBands = 0;
    for (var i = 0; i < events.length; ++i) {
        var e = events[i];
        switch (e.name) {
        case WebInspector.TimelineModel.RecordType.ResourceSendRequest:
            var reqId = e.args["data"]["requestId"];
            openBands.add(reqId);
            maxBands = Math.max(maxBands, openBands.size);
            break;
        case WebInspector.TimelineModel.RecordType.ResourceReceiveResponse:
        case WebInspector.TimelineModel.RecordType.ResourceReceivedData:
        case WebInspector.TimelineModel.RecordType.ResourceFinish:
            var reqId = e.args["data"]["requestId"];
            if (!openBands.has(reqId)) {
                openBands.add(reqId);
                ++maxBands;
            }
            if (e.name === WebInspector.TimelineModel.RecordType.ResourceFinish)
                openBands.delete(reqId);
            break;
        }
    }
    return maxBands;
}

/**
 * @param {!Array.<!WebInspector.TracingModel.Event>} events
 * @param {number} bandsCount
 * @param {function(number, number, number, ?WebInspector.TracingModel.Event)} callback
 */
WebInspector.TimelineUIUtils.iterateNetworkRequestsInRoundRobin = function(events, bandsCount, callback)
{
    var bandsInUse = new Array(bandsCount);
    var requestsInFlight = new Map();
    var lastBand = -1;

    // Invoke synthetic calls for events that are missing ResourceSendRequest
    var requestsWithSend = new Set();
    for (var i = 0; i < events.length; ++i) {
        var event = events[i];
        switch (event.name) {
        case WebInspector.TimelineModel.RecordType.ResourceSendRequest:
            var reqId = event.args["data"]["requestId"];
            requestsWithSend.add(reqId);
            break;
        case WebInspector.TimelineModel.RecordType.ResourceReceivedData:
        case WebInspector.TimelineModel.RecordType.ResourceReceiveResponse:
        case WebInspector.TimelineModel.RecordType.ResourceFinish:
            var reqId = event.args["data"]["requestId"];
            if (!requestsWithSend.has(reqId)) {
                requestsWithSend.add(reqId);
                var reqInfo = new RequestInfo(seizeBand(), 0);
                requestsInFlight.set(reqId, reqInfo);
                callback(reqInfo.band, 0, 0, null);
            }
            if (event.name === WebInspector.TimelineModel.RecordType.ResourceFinish)
                requestsWithSend.delete(reqId);
            break;
        }
    }
    requestsWithSend = null;

    /**
     * @constructor
     * @param {number} band
     * @param {number} time
     */
    function RequestInfo(band, time)
    {
        this.band = band;
        this.time = time;
    }

    /**
     * @return {number}
     */
    function seizeBand()
    {
        var i = 0;
        do {
            lastBand = (lastBand + 1) % bandsInUse.length;
            console.assert(i++ < bandsInUse.length);
        } while (bandsInUse[lastBand]);
        bandsInUse[lastBand] = true;
        return lastBand;
    }

    /**
     * @param {number} band
     */
    function releaseBand(band)
    {
        bandsInUse[band] = false;
    }

    /**
     * @param {string} reqId
     * @param {?WebInspector.TracingModel.Event} event
     * @param {boolean} first
     * @return {!RequestInfo}
     */
    function getOrCreateRequestInfo(reqId, event, first)
    {
        var reqInfo = requestsInFlight.get(reqId);
        if (!reqInfo) {
            reqInfo = new RequestInfo(seizeBand(), event.startTime);
            requestsInFlight.set(reqId, reqInfo);
            if (!first)
                callback(reqInfo.band, 0, event.startTime, event);
        }
        return reqInfo;
    }

    for (var i = 0; i < events.length; ++i) {
        var event = events[i];
        switch (event.name) {
        case WebInspector.TimelineModel.RecordType.ResourceSendRequest:
            var reqId = event.args["data"]["requestId"];
            var reqInfo = getOrCreateRequestInfo(reqId, event, true);
            callback(reqInfo.band, reqInfo.time, event.startTime, event);
            break;
        case WebInspector.TimelineModel.RecordType.ResourceReceivedData:
        case WebInspector.TimelineModel.RecordType.ResourceReceiveResponse:
        case WebInspector.TimelineModel.RecordType.ResourceFinish:
            var reqId = event.args["data"]["requestId"];
            var reqInfo = getOrCreateRequestInfo(reqId, event, false);
            callback(reqInfo.band, reqInfo.time, event.startTime, event);
            if (event.name === WebInspector.TimelineModel.RecordType.ResourceFinish) {
                releaseBand(reqInfo.band);
                requestsInFlight.delete(reqId);
            } else {
                reqInfo.time = event.startTime;
            }
            break;
        }
    }

    for (var reqInfo of requestsInFlight.values())
        callback(reqInfo.band, reqInfo.time, Infinity, null);
}

/**
 * @constructor
 * @param {number} priority
 * @param {string} color
 * @param {!Array.<string>} eventTypes
 */
WebInspector.TimelineUIUtils.EventDispatchTypeDescriptor = function(priority, color, eventTypes)
{
    this.priority = priority;
    this.color = color;
    this.eventTypes = eventTypes;
}

/**
 * @return {!Array.<!WebInspector.TimelineUIUtils.EventDispatchTypeDescriptor>}
 */
WebInspector.TimelineUIUtils.eventDispatchDesciptors = function()
{
    if (WebInspector.TimelineUIUtils._eventDispatchDesciptors)
        return WebInspector.TimelineUIUtils._eventDispatchDesciptors;
    var lightOrange = "hsl(40,100%,80%)";
    var orange = "hsl(40,100%,50%)";
    var green = "hsl(90,100%,40%)";
    var purple = "hsl(256,100%,75%)";
    WebInspector.TimelineUIUtils._eventDispatchDesciptors = [
        new WebInspector.TimelineUIUtils.EventDispatchTypeDescriptor(1, lightOrange, ["mousemove", "mouseenter", "mouseleave", "mouseout", "mouseover"]),
        new WebInspector.TimelineUIUtils.EventDispatchTypeDescriptor(2, green, ["wheel"]),
        new WebInspector.TimelineUIUtils.EventDispatchTypeDescriptor(3, orange, ["click", "mousedown", "mouseup"]),
        new WebInspector.TimelineUIUtils.EventDispatchTypeDescriptor(3, orange, ["touchstart", "touchend", "touchmove", "touchcancel"]),
        new WebInspector.TimelineUIUtils.EventDispatchTypeDescriptor(3, purple, ["keydown", "keyup", "keypress"])
    ];
    return WebInspector.TimelineUIUtils._eventDispatchDesciptors;
}

/**
 * @constructor
 * @extends {WebInspector.Object}
 * @param {string} name
 * @param {string} title
 * @param {boolean} visible
 * @param {string} borderColor
 * @param {string} backgroundColor
 * @param {string} fillColorStop0
 * @param {string} fillColorStop1
 */
WebInspector.TimelineCategory = function(name, title, visible, borderColor, backgroundColor, fillColorStop0, fillColorStop1)
{
    this.name = name;
    this.title = title;
    this.visible = visible;
    this.borderColor = borderColor;
    this.backgroundColor = backgroundColor;
    this.fillColorStop0 = fillColorStop0;
    this.fillColorStop1 = fillColorStop1;
    this.hidden = false;
}

WebInspector.TimelineCategory.Events = {
    VisibilityChanged: "VisibilityChanged"
};

WebInspector.TimelineCategory.prototype = {
    /**
     * @return {boolean}
     */
    get hidden()
    {
        return this._hidden;
    },

    set hidden(hidden)
    {
        this._hidden = hidden;
        this.dispatchEventToListeners(WebInspector.TimelineCategory.Events.VisibilityChanged, this);
    },

    __proto__: WebInspector.Object.prototype
}

/**
 * @typedef {!{
 *     title: string,
 *     color: string,
 *     lineWidth: number,
 *     dashStyle: !Array.<number>,
 *     tall: boolean,
 *     lowPriority: boolean
 * }}
 */
WebInspector.TimelineMarkerStyle;

/**
 * @param {!WebInspector.TracingModel.Event} event
 * @return {!WebInspector.TimelineMarkerStyle}
 */
WebInspector.TimelineUIUtils.markerStyleForEvent = function(event)
{
    var red = "rgb(255, 0, 0)";
    var blue = "rgb(0, 0, 255)";
    var orange = "rgb(255, 178, 23)";
    var green = "rgb(0, 130, 0)";
    var tallMarkerDashStyle = [10, 5];

    var title = WebInspector.TimelineUIUtils.eventTitle(event)

    if (event.category === WebInspector.TracingModel.ConsoleEventCategory) {
        return {
            title: title,
            dashStyle: tallMarkerDashStyle,
            lineWidth: 0.5,
            color: orange,
            tall: false,
            lowPriority: false,
        };
    }
    var recordTypes = WebInspector.TimelineModel.RecordType;
    var tall = false;
    var color = green;
    switch (event.name) {
    case recordTypes.MarkDOMContent:
        color = blue;
        tall = true;
        break;
    case recordTypes.MarkLoad:
        color = red;
        tall = true;
        break;
    case recordTypes.MarkFirstPaint:
        color = green;
        tall = true;
        break;
    case recordTypes.TimeStamp:
        color = orange;
        break;
    }
    return {
        title: title,
        dashStyle: tallMarkerDashStyle,
        lineWidth: 0.5,
        color: color,
        tall: tall,
        lowPriority: false,
    };
}

/**
 * @return {!WebInspector.TimelineMarkerStyle}
 */
WebInspector.TimelineUIUtils.markerStyleForFrame = function()
{
    return {
        title: WebInspector.UIString("Frame"),
        color: "rgba(100, 100, 100, 0.4)",
        lineWidth: 3,
        dashStyle: [3],
        tall: true,
        lowPriority: true
    };
}

/**
 * @constructor
 * @param {string} title
 */
WebInspector.TimelinePopupContentHelper = function(title)
{
    this._contentTable = createElement("table");
    var titleCell = this._createCell(WebInspector.UIString("%s - Details", title), "timeline-details-title");
    titleCell.colSpan = 2;
    var titleRow = createElement("tr");
    titleRow.appendChild(titleCell);
    this._contentTable.appendChild(titleRow);
}

WebInspector.TimelinePopupContentHelper.prototype = {
    /**
     * @return {!Element}
     */
    contentTable: function()
    {
        return this._contentTable;
    },

    /**
     * @param {string|number} content
     * @param {string=} styleName
     */
    _createCell: function(content, styleName)
    {
        var text = createElement("label");
        text.createTextChild(String(content));
        var cell = createElement("td");
        cell.className = "timeline-details";
        if (styleName)
            cell.className += " " + styleName;
        cell.textContent = content;
        return cell;
    },

    /**
     * @param {string} title
     * @param {string|number} content
     */
    appendTextRow: function(title, content)
    {
        var row = createElement("tr");
        row.appendChild(this._createCell(title, "timeline-details-row-title"));
        row.appendChild(this._createCell(content, "timeline-details-row-data"));
        this._contentTable.appendChild(row);
    },

    /**
     * @param {string} title
     * @param {!Node|string} content
     */
    appendElementRow: function(title, content)
    {
        var row = createElement("tr");
        var titleCell = this._createCell(title, "timeline-details-row-title");
        row.appendChild(titleCell);
        var cell = createElement("td");
        cell.className = "details";
        if (content instanceof Node)
            cell.appendChild(content);
        else
            cell.createTextChild(content || "");
        row.appendChild(cell);
        this._contentTable.appendChild(row);
    }
}

/**
 * @constructor
 * @param {?WebInspector.Target} target
 * @param {?WebInspector.Linkifier} linkifier
 * @param {?Map<number, ?WebInspector.DOMNode>} relatedNodesMap
 * @param {boolean} monospaceValues
 */
WebInspector.TimelineDetailsContentHelper = function(target, linkifier, relatedNodesMap, monospaceValues)
{
    this._linkifier = linkifier;
    this._target = target;
    this._relatedNodesMap = relatedNodesMap;
    this.element = createElement("div");
    this.element.className = "timeline-details-view-block";
    this._monospaceValues = monospaceValues;
}

WebInspector.TimelineDetailsContentHelper.prototype = {
    /**
     * @return {?WebInspector.Linkifier}
     */
    linkifier: function()
    {
        return this._linkifier;
    },

    /**
     * @param {?number} backendNodeId
     * @return {?WebInspector.DOMNode}
     */
    nodeForBackendId: function(backendNodeId)
    {
        if (!backendNodeId || !this._relatedNodesMap)
            return null;
        return this._relatedNodesMap.get(backendNodeId) || null;
    },

    /**
     * @param {string} title
     * @param {string|number|boolean} value
     */
    appendTextRow: function(title, value)
    {
        var rowElement = this.element.createChild("div", "timeline-details-view-row");
        rowElement.createChild("div", "timeline-details-view-row-title").textContent = title;
        rowElement.createChild("div", "timeline-details-view-row-value" + (this._monospaceValues ? " monospace" : "")).textContent = value;
    },

    /**
     * @param {string} title
     * @param {!Node|string} content
     */
    appendElementRow: function(title, content)
    {
        var rowElement = this.element.createChild("div", "timeline-details-view-row");
        rowElement.createChild("div", "timeline-details-view-row-title").textContent = title;
        var valueElement = rowElement.createChild("div", "timeline-details-view-row-value timeline-details-view-row-details" + (this._monospaceValues ? " monospace" : ""));
        if (content instanceof Node)
            valueElement.appendChild(content);
        else
            valueElement.createTextChild(content || "");
    },

    /**
     * @param {string} title
     * @param {string} url
     * @param {number} line
     */
    appendLocationRow: function(title, url, line)
    {
        if (!this._linkifier || !this._target)
            return;
        this.appendElementRow(title, this._linkifier.linkifyScriptLocation(this._target, null, url, line - 1) || "");
    },

    /**
     * @param {string} title
     * @param {!Array.<!ConsoleAgent.CallFrame>} stackTrace
     */
    appendStackTrace: function(title, stackTrace)
    {
        if (!this._linkifier || !this._target)
            return;

        var rowElement = this.element.createChild("div", "timeline-details-view-row");
        rowElement.createChild("div", "timeline-details-view-row-title").textContent = title;
        this.createChildStackTraceElement(rowElement, stackTrace);
    },

    /**
     * @param {!Element} parentElement
     * @param {!Array.<!ConsoleAgent.CallFrame>} stackTrace
     */
    createChildStackTraceElement: function(parentElement, stackTrace)
    {
        if (!this._linkifier || !this._target)
            return;

        var stackTraceElement = parentElement.createChild("div", "timeline-details-view-row-value timeline-details-view-row-stack-trace monospace");

        var callFrameElem = WebInspector.DOMPresentationUtils.buildStackTracePreviewContents(this._target, this._linkifier, stackTrace);

        stackTraceElement.appendChild(callFrameElem);
    }

}
