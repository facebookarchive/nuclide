// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Invariant: This model can only be constructed on a ServiceWorker target.
 * @constructor
 * @extends {WebInspector.SDKModel}
 */
WebInspector.ServiceWorkerCacheModel = function(target)
{
    WebInspector.SDKModel.call(this, WebInspector.ServiceWorkerCacheModel, target);

    /** @type {!Set.<string>} */
    this._cacheNames = new Set();

    this._agent = target.serviceWorkerCacheAgent();
}

WebInspector.ServiceWorkerCacheModel.EventTypes = {
    CacheAdded: "CacheAdded",
    CacheRemoved: "CacheRemoved",
}

WebInspector.ServiceWorkerCacheModel.prototype = {
    _reset: function()
    {
        this._updateCacheNames([]);
        this._loadCacheNames();
    },

    refreshCacheNames: function()
    {
        this._loadCacheNames();
    },

    /**
     * @param {!WebInspector.ServiceWorkerCacheModel.CacheId} cacheId
     */
    deleteCache: function(cacheId)
    {
        /**
         * @this {WebInspector.ServiceWorkerCacheModel}
         */
        function callback(error)
        {
            if (error) {
                console.error("ServiceWorkerCacheAgent error: ", error);
                return;
            }
            this._cacheRemoved(cacheId.name);
        }
        this._agent.deleteCache(cacheId.name, callback.bind(this));
    },

    /**
     * @param {!WebInspector.ServiceWorkerCacheModel.CacheId} cacheId
     * @param {number} skipCount
     * @param {number} pageSize
     * @param {function(!Array.<!WebInspector.ServiceWorkerCacheModel.Entry>, boolean)} callback
     */
    loadCacheData: function(cacheId, skipCount, pageSize, callback)
    {
        this._requestEntries(cacheId, cacheId.name, skipCount, pageSize, callback);
    },

    /**
     * @return {!Array.<!WebInspector.ServiceWorkerCacheModel.CacheId>}
     */
    caches: function()
    {
        var result = [];
        for (var cacheName of this._cacheNames) {
          result.push(new WebInspector.ServiceWorkerCacheModel.CacheId(cacheName));
        }
        return result;
    },

    dispose: function()
    {
        this._updateCacheNames([]);
    },

    _loadCacheNames: function()
    {
        /**
         * @param {?Protocol.Error} error
         * @param {!Array.<string>} cacheNames
         * @this {WebInspector.ServiceWorkerCacheModel}
         */
        function callback(error, cacheNames)
        {
            if (error) {
                console.error("ServiceWorkerCacheAgent error: ", error);
                return;
            }

            if (!this._cacheNames)
                return;
            this._updateCacheNames(cacheNames);
        }

        this._agent.requestCacheNames(callback.bind(this));
    },

    /**
     * @param {!Array.<string>} cacheNames
     */
    _updateCacheNames: function(cacheNames)
    {
        /** @type {!Set.<string>} */
        var newCacheNames = new Set(cacheNames);
        /** @type {!Set.<string>} */
        var oldCacheNames = this._cacheNames;

        this._cacheNames = new Set(cacheNames);

        for (var oldCacheName of oldCacheNames) {
            if (!newCacheNames[oldCacheName])
                this._cacheRemoved(oldCacheName);
        }
        for (var newCacheName of newCacheNames) {
            if (!oldCacheNames[newCacheName])
                this._cacheAdded(newCacheName);
        }
    },

    /**
     * @param {string} cacheName
     */
    _cacheAdded: function(cacheName)
    {
        var cacheId = new WebInspector.ServiceWorkerCacheModel.CacheId(cacheName);
        this.dispatchEventToListeners(WebInspector.ServiceWorkerCacheModel.EventTypes.CacheAdded, cacheId);
    },

    /**
     * @param {string} cacheName
     */
    _cacheRemoved: function(cacheName)
    {
        var cacheId = new WebInspector.ServiceWorkerCacheModel.CacheId(cacheName);
        this.dispatchEventToListeners(WebInspector.ServiceWorkerCacheModel.EventTypes.CacheRemoved, cacheId);
    },

    /**
     * @param {!WebInspector.ServiceWorkerCacheModel.CacheId} cacheId
     * @param {string} cacheName
     * @param {number} skipCount
     * @param {number} pageSize
     * @param {function(!Array.<!WebInspector.ServiceWorkerCacheModel.Entry>, boolean)} callback
     */
    _requestEntries: function(cacheId, cacheName, skipCount, pageSize, callback)
    {
        /**
         * @param {?Protocol.Error} error
         * @param {!Array.<!WebInspector.ServiceWorkerCacheModel.Entry>} dataEntries
         * @param {boolean} hasMore
         * @this {WebInspector.ServiceWorkerCacheModel}
         */
        function innerCallback(error, dataEntries, hasMore)
        {
            if (error) {
                console.error("ServiceWorkerCacheAgent error: ", error);
                return;
            }

            if (!this._cacheNames)
                return;
            var entries = [];
            for (var i = 0; i < dataEntries.length; ++i) {
                var request = WebInspector.RemoteObject.fromLocalObject(JSON.parse(dataEntries[i].request));
                var response = WebInspector.RemoteObject.fromLocalObject(JSON.parse(dataEntries[i].response));
                entries.push(new WebInspector.ServiceWorkerCacheModel.Entry(request, response));
            }
            callback(entries, hasMore);
        }

        this._agent.requestEntries(cacheName, skipCount, pageSize, innerCallback.bind(this));
    },

    __proto__: WebInspector.SDKModel.prototype
}

/**
 * @constructor
 * @param {!WebInspector.RemoteObject} request
 * @param {!WebInspector.RemoteObject} response
 */
WebInspector.ServiceWorkerCacheModel.Entry = function(request, response)
{
    this.request = request;
    this.response = response;
}

/**
 * @constructor
 * @param {string} name
 */
WebInspector.ServiceWorkerCacheModel.CacheId = function(name)
{
    this.name = name;
}

WebInspector.ServiceWorkerCacheModel.CacheId.prototype = {
    /**
     * @param {!WebInspector.ServiceWorkerCacheModel.CacheId} cacheId
     * @return {boolean}
     */
    equals: function(cacheId)
    {
        return this.name === cacheId.name;
    }
}

/**
 * @constructor
 * @param {!WebInspector.ServiceWorkerCacheModel.CacheId} cacheId
 */
WebInspector.ServiceWorkerCacheModel.Cache = function(cacheId)
{
    this.cacheId = cacheId;
}