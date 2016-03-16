// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

WebInspector.Streams = {};

WebInspector.Streams._lastStreamId = 0;
/** @type {!Object.<number, !WebInspector.OutputStream>} */
WebInspector.Streams._boundStreams = {};

/**
 * @param {!WebInspector.OutputStream} stream
 * @return {number}
 */
WebInspector.Streams.bindOutputStream = function(stream)
{
    WebInspector.Streams._boundStreams[++WebInspector.Streams._lastStreamId] = stream;
    return WebInspector.Streams._lastStreamId;
}

/**
 * @param {number} id
 */
WebInspector.Streams.discardOutputStream = function(id)
{
    WebInspector.Streams._boundStreams[id].close();
    delete WebInspector.Streams._boundStreams[id];
}

/**
 * @param {number} id
 * @param {string} chunk
 */
WebInspector.Streams.streamWrite = function(id, chunk)
{
    WebInspector.Streams._boundStreams[id].write(chunk);
}

/**
 * @interface
 */
WebInspector.OutputStream = function()
{
}

WebInspector.OutputStream.prototype = {
    /**
     * @param {string} data
     * @param {function(!WebInspector.OutputStream)=} callback
     */
    write: function(data, callback) { },

    close: function() { }
}

/**
 * @constructor
 * @implements {WebInspector.OutputStream}
 */
WebInspector.StringOutputStream = function()
{
    this._data = "";
}

WebInspector.StringOutputStream.prototype = {
    /**
     * @override
     * @param {string} chunk
     * @param {function(!WebInspector.OutputStream)=} callback
     */
    write: function(chunk, callback)
    {
        this._data += chunk;
    },

    /**
     * @override
     */
    close: function()
    {
    },

    /**
     * @return {string}
     */
    data: function()
    {
        return this._data;
    }
}