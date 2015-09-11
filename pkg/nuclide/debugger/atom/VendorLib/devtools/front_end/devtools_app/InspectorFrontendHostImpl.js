// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @constructor
 * @implements {InspectorFrontendHostAPI}
 */
WebInspector.InspectorFrontendHostImpl = function()
{
}

WebInspector.InspectorFrontendHostImpl.prototype = {
    /**
     * @override
     * @return {string}
     */
    getSelectionBackgroundColor: function()
    {
        return DevToolsHost.getSelectionBackgroundColor();
    },

    /**
     * @override
     * @return {string}
     */
    getSelectionForegroundColor: function()
    {
        return DevToolsHost.getSelectionForegroundColor();
    },

    /**
     * @override
     * @return {string}
     */
    platform: function()
    {
        return DevToolsHost.platform();
    },

    /**
     * @override
     */
    loadCompleted: function()
    {
        DevToolsAPI.sendMessageToEmbedder("loadCompleted", [], null);
    },

    /**
     * @override
     */
    bringToFront: function()
    {
        DevToolsAPI.sendMessageToEmbedder("bringToFront", [], null);
    },

    /**
     * @override
     */
    closeWindow: function()
    {
        DevToolsAPI.sendMessageToEmbedder("closeWindow", [], null);
    },

    /**
     * @override
     * @param {boolean} isDocked
     * @param {function()} callback
     */
    setIsDocked: function(isDocked, callback)
    {
        DevToolsAPI.sendMessageToEmbedder("setIsDocked", [isDocked], callback);
    },

    /**
     * Requests inspected page to be placed atop of the inspector frontend with specified bounds.
     * @override
     * @param {{x: number, y: number, width: number, height: number}} bounds
     */
    setInspectedPageBounds: function(bounds)
    {
        DevToolsAPI.sendMessageToEmbedder("setInspectedPageBounds", [bounds], null);
    },

    /**
     * @override
     */
    inspectElementCompleted: function()
    {
        DevToolsAPI.sendMessageToEmbedder("inspectElementCompleted", [], null);
    },

    /**
     * @override
     * @param {string} url
     * @param {string} headers
     * @param {number} streamId
     * @param {function(!InspectorFrontendHostAPI.LoadNetworkResourceResult)} callback
     */
    loadNetworkResource: function(url, headers, streamId, callback)
    {
        DevToolsAPI.sendMessageToEmbedder("loadNetworkResource", [url, headers, streamId], /** @type {function(?Object)} */ (callback));
    },

    /**
     * @override
     * @param {string} origin
     * @param {string} script
     */
    setInjectedScriptForOrigin: function(origin, script)
    {
        DevToolsHost.setInjectedScriptForOrigin(origin, script);
    },

    /**
     * @override
     * @param {string} url
     */
    inspectedURLChanged: function(url)
    {
        DevToolsAPI.sendMessageToEmbedder("inspectedURLChanged", [url], null);
    },

    /**
     * @override
     * @param {string} text
     */
    copyText: function(text)
    {
        DevToolsHost.copyText(text);
    },

    /**
     * @override
     * @param {string} url
     */
    openInNewTab: function(url)
    {
        DevToolsAPI.sendMessageToEmbedder("openInNewTab", [url], null);
    },

    /**
     * @override
     * @param {string} url
     * @param {string} content
     * @param {boolean} forceSaveAs
     */
    save: function(url, content, forceSaveAs)
    {
        DevToolsAPI.sendMessageToEmbedder("save", [url, content, forceSaveAs], null);
    },

    /**
     * @override
     * @param {string} url
     * @param {string} content
     */
    append: function(url, content)
    {
        DevToolsAPI.sendMessageToEmbedder("append", [url, content], null);
    },

    /**
     * @override
     * @param {string} message
     */
    sendMessageToBackend: function(message)
    {
        DevToolsHost.sendMessageToBackend(message);
    },

    /**
     * @override
     * @param {number} actionCode
     */
    recordActionTaken: function(actionCode)
    {
        DevToolsAPI.sendMessageToEmbedder("recordActionUMA", ["DevTools.ActionTaken", actionCode], null);
    },

    /**
     * @override
     * @param {number} panelCode
     */
    recordPanelShown: function(panelCode)
    {
        DevToolsAPI.sendMessageToEmbedder("recordActionUMA", ["DevTools.PanelShown", panelCode], null);
    },

    /**
     * @override
     */
    requestFileSystems: function()
    {
        DevToolsAPI.sendMessageToEmbedder("requestFileSystems", [], null);
    },

    /**
     * @override
     */
    addFileSystem: function()
    {
        DevToolsAPI.sendMessageToEmbedder("addFileSystem", [], null);
    },

    /**
     * @override
     * @param {string} fileSystemPath
     */
    removeFileSystem: function(fileSystemPath)
    {
        DevToolsAPI.sendMessageToEmbedder("removeFileSystem", [fileSystemPath], null);
    },

    /**
     * @override
     * @param {string} fileSystemId
     * @param {string} registeredName
     * @return {?DOMFileSystem}
     */
    isolatedFileSystem: function(fileSystemId, registeredName)
    {
        return DevToolsHost.isolatedFileSystem(fileSystemId, registeredName);
    },

    /**
     * @override
     * @param {!FileSystem} fileSystem
     */
    upgradeDraggedFileSystemPermissions: function(fileSystem)
    {
        DevToolsHost.upgradeDraggedFileSystemPermissions(fileSystem);
    },

    /**
     * @override
     * @param {number} requestId
     * @param {string} fileSystemPath
     */
    indexPath: function(requestId, fileSystemPath)
    {
        DevToolsAPI.sendMessageToEmbedder("indexPath", [requestId, fileSystemPath], null);
    },

    /**
     * @override
     * @param {number} requestId
     */
    stopIndexing: function(requestId)
    {
        DevToolsAPI.sendMessageToEmbedder("stopIndexing", [requestId], null);
    },

    /**
     * @override
     * @param {number} requestId
     * @param {string} fileSystemPath
     * @param {string} query
     */
    searchInPath: function(requestId, fileSystemPath, query)
    {
        DevToolsAPI.sendMessageToEmbedder("searchInPath", [requestId, fileSystemPath, query], null);
    },

    /**
     * @override
     * @return {number}
     */
    zoomFactor: function()
    {
        return DevToolsHost.zoomFactor();
    },

    /**
     * @override
     */
    zoomIn: function()
    {
        DevToolsAPI.sendMessageToEmbedder("zoomIn", [], null);
    },

    /**
     * @override
     */
    zoomOut: function()
    {
        DevToolsAPI.sendMessageToEmbedder("zoomOut", [], null);
    },

    /**
     * @override
     */
    resetZoom: function()
    {
        DevToolsAPI.sendMessageToEmbedder("resetZoom", [], null);
    },

    /**
     * @override
     * @param {string} shortcuts
     */
    setWhitelistedShortcuts: function(shortcuts)
    {
        DevToolsAPI.sendMessageToEmbedder("setWhitelistedShortcuts", [shortcuts], null);
    },

    /**
     * @override
     * @return {boolean}
     */
    isUnderTest: function()
    {
        return DevToolsHost.isUnderTest();
    },

    /**
     * @override
     * @param {boolean} enabled
     */
    setDevicesUpdatesEnabled: function(enabled)
    {
        DevToolsAPI.sendMessageToEmbedder("setDevicesUpdatesEnabled", [enabled], null);
    },

    /**
     * @override
     * @param {number} x
     * @param {number} y
     * @param {!Array.<!InspectorFrontendHostAPI.ContextMenuDescriptor>} items
     * @param {!Document} document
     */
    showContextMenuAtPoint: function(x, y, items, document)
    {
        DevToolsHost.showContextMenuAtPoint(x, y, items, document);
    },

    /**
     * @override
     * @return {boolean}
     */
    isHostedMode: function()
    {
        return DevToolsHost.isHostedMode();
    },

    /**
     * Support for legacy front-ends (<M41).
     * @return {string}
     */
    port: function()
    {
        return "unknown";
    },

    /**
     * Support for legacy front-ends (<M38).
     * @param {number} zoomFactor
     */
    setZoomFactor: function(zoomFactor)
    {
    },

    /**
     * Support for legacy front-ends (<M34).
     */
    sendMessageToEmbedder: function()
    {
    },

    /**
     * Support for legacy front-ends (<M34).
     * @param {string} dockSide
     */
    requestSetDockSide: function(dockSide)
    {
        DevToolsAPI.sendMessageToEmbedder("setIsDocked", [dockSide !== "undocked"], null);
    },

    /**
     * Support for legacy front-ends (<M34).
     * @return {boolean}
     */
    supportsFileSystems: function()
    {
        return true;
    },

    /**
     * Support for legacy front-ends (<M28).
     * @return {boolean}
     */
    canInspectWorkers: function()
    {
        return true;
    },

    /**
     * Support for legacy front-ends (<M28).
     * @return {boolean}
     */
    canSaveAs: function()
    {
        return true;
    },

    /**
     * Support for legacy front-ends (<M28).
     * @return {boolean}
     */
    canSave: function()
    {
        return true;
    },

    /**
     * Support for legacy front-ends (<M28).
     */
    loaded: function()
    {
    },

    /**
     * Support for legacy front-ends (<M28).
     * @return {string}
     */
    hiddenPanels: function()
    {
        return "";
    },

    /**
     * Support for legacy front-ends (<M28).
     * @return {string}
     */
    localizedStringsURL: function()
    {
        return "";
    },

    /**
     * Support for legacy front-ends (<M28).
     * @param {string} url
     */
    close: function(url)
    {
    }
}
