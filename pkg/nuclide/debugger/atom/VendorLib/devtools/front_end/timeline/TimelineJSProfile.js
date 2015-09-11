// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


WebInspector.TimelineJSProfileProcessor = { };

/**
 * @param {!ProfilerAgent.CPUProfile} jsProfile
 * @param {!WebInspector.TracingModel.Thread} thread
 * @return {!Array.<!WebInspector.TracingModel.Event>}
 */
WebInspector.TimelineJSProfileProcessor.generateTracingEventsFromCpuProfile = function(jsProfile, thread)
{
    if (!jsProfile.samples)
        return [];
    var jsProfileModel = new WebInspector.CPUProfileDataModel(jsProfile);
    var idleNode = jsProfileModel.idleNode;
    var programNode = jsProfileModel.programNode;
    var gcNode = jsProfileModel.gcNode;
    var samples = jsProfileModel.samples;
    var timestamps = jsProfileModel.timestamps;
    var jsEvents = [];
    for (var i = 0; i < samples.length; ++i) {
        var node = jsProfileModel.nodeByIndex(i);
        if (node === programNode || node === gcNode || node === idleNode)
            continue;
        var stackTrace = node._stackTraceArray;
        if (!stackTrace) {
            stackTrace = /** @type {!ConsoleAgent.StackTrace} */ (new Array(node.depth + 1));
            node._stackTraceArray = stackTrace;
            for (var j = 0; node.parent; node = node.parent)
                stackTrace[j++] = /** @type {!ConsoleAgent.CallFrame} */ (node);
        }
        var jsEvent = new WebInspector.TracingModel.Event(WebInspector.TracingModel.DevToolsMetadataEventCategory, WebInspector.TimelineModel.RecordType.JSSample,
            WebInspector.TracingModel.Phase.Instant, timestamps[i], thread);
        jsEvent.args["data"] = { stackTrace: stackTrace };
        jsEvents.push(jsEvent);
    }
    return jsEvents;
}

/**
 * @param {!Array.<!WebInspector.TracingModel.Event>} events
 * @return {!Array.<!WebInspector.TracingModel.Event>}
 */
WebInspector.TimelineJSProfileProcessor.generateJSFrameEvents = function(events)
{
    /**
     * @param {!ConsoleAgent.CallFrame} frame1
     * @param {!ConsoleAgent.CallFrame} frame2
     * @return {boolean}
     */
    function equalFrames(frame1, frame2)
    {
        return frame1.scriptId === frame2.scriptId && frame1.functionName === frame2.functionName;
    }

    /**
     * @param {!WebInspector.TracingModel.Event} e
     * @return {number}
     */
    function eventEndTime(e)
    {
        return e.endTime || e.startTime;
    }

    /**
     * @param {!WebInspector.TracingModel.Event} e
     * @return {boolean}
     */
    function isJSInvocationEvent(e)
    {
        switch (e.name) {
        case WebInspector.TimelineModel.RecordType.FunctionCall:
        case WebInspector.TimelineModel.RecordType.EvaluateScript:
            return true;
        }
        return false;
    }

    var jsFrameEvents = [];
    var jsFramesStack = [];
    var coalesceThresholdMs = WebInspector.TimelineFlameChartDataProvider.JSFrameCoalesceThresholdMs;

    /**
     * @param {!WebInspector.TracingModel.Event} e
     */
    function onStartEvent(e)
    {
        extractStackTrace(e);
    }

    /**
     * @param {!WebInspector.TracingModel.Event} e
     * @param {?WebInspector.TracingModel.Event} top
     */
    function onInstantEvent(e, top)
    {
        if (e.name === WebInspector.TimelineModel.RecordType.JSSample && top && !isJSInvocationEvent(top))
            return;
        extractStackTrace(e);
    }

    /**
     * @param {!WebInspector.TracingModel.Event} e
     */
    function onEndEvent(e)
    {
        if (!isJSInvocationEvent(e))
            return;
        var eventData = e.args["data"] || e.args["beginData"];
        var stackTrace = eventData && eventData["stackTrace"];
        var stackLength = stackTrace ? stackTrace.length : 0;
        // FIXME: there shouldn't be such a case.
        // The current stack should never go beyond the parent event's stack.
        if (stackLength < jsFramesStack.length)
            jsFramesStack.length = stackLength;
    }

    /**
     * @param {!WebInspector.TracingModel.Event} e
     */
    function extractStackTrace(e)
    {
        while (jsFramesStack.length && eventEndTime(jsFramesStack.peekLast()) + coalesceThresholdMs <= e.startTime)
            jsFramesStack.pop();
        var eventData = e.args["data"] || e.args["beginData"];
        var stackTrace = eventData && eventData["stackTrace"];
        // GC events do not hold call stack, so make a copy of the current stack.
        if (e.name === WebInspector.TimelineModel.RecordType.GCEvent)
            stackTrace = jsFramesStack.map(function(frameEvent) { return frameEvent.args["data"]; }).reverse();
        if (!stackTrace)
            return;
        var endTime = eventEndTime(e);
        var numFrames = stackTrace.length;
        var minFrames = Math.min(numFrames, jsFramesStack.length);
        var j;
        for (j = 0; j < minFrames; ++j) {
            var newFrame = stackTrace[numFrames - 1 - j];
            var oldFrame = jsFramesStack[j].args["data"];
            if (!equalFrames(newFrame, oldFrame))
                break;
            jsFramesStack[j].setEndTime(Math.max(jsFramesStack[j].endTime, endTime));
        }
        jsFramesStack.length = j;
        for (; j < numFrames; ++j) {
            var frame = stackTrace[numFrames - 1 - j];
            var jsFrameEvent = new WebInspector.TracingModel.Event(WebInspector.TracingModel.DevToolsMetadataEventCategory, WebInspector.TimelineModel.RecordType.JSFrame,
                WebInspector.TracingModel.Phase.Complete, e.startTime, e.thread);
            jsFrameEvent.addArgs({ data: frame });
            jsFrameEvent.setEndTime(endTime);
            jsFramesStack.push(jsFrameEvent);
            jsFrameEvents.push(jsFrameEvent);
        }
    }

    WebInspector.TimelineModel.forEachEvent(events, onStartEvent, onEndEvent, onInstantEvent);
    return jsFrameEvents;
}
