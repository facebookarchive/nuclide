// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @constructor
 * @extends {WebInspector.VBox}
 * @param {!WebInspector.ServiceWorkerCacheModel} model
 * @param {!WebInspector.ServiceWorkerCacheModel.CacheId} cacheId
 * @param {!WebInspector.ServiceWorkerCacheModel.Cache} cache
 */
WebInspector.ServiceWorkerCacheView = function(model, cacheId, cache)
{
    WebInspector.VBox.call(this);
    this.registerRequiredCSS("resources/serviceWorkerCacheViews.css");

    this._model = model;
    this._cacheId = cacheId;

    this.element.classList.add("service-worker-cache-data-view");
    this.element.classList.add("storage-view");

    this._createEditorToolbar();

    this._refreshButton = new WebInspector.StatusBarButton(WebInspector.UIString("Refresh"), "refresh-status-bar-item");
    this._refreshButton.addEventListener("click", this._refreshButtonClicked, this);

    this._pageSize = 50;
    this._skipCount = 0;

    this.update(cache);
    this._entries = [];
}

WebInspector.ServiceWorkerCacheView.prototype = {
    /**
     * @return {!WebInspector.DataGrid}
     */
    _createDataGrid: function()
    {
        var columns = [];
        columns.push({id: "number", title: WebInspector.UIString("#"), width: "50px"});
        columns.push({id: "request", title: WebInspector.UIString("Request")});
        columns.push({id: "response", title: WebInspector.UIString("Response")});

        var dataGrid = new WebInspector.DataGrid(columns);
        return dataGrid;
    },

    _createEditorToolbar: function()
    {
        var editorToolbar = new WebInspector.StatusBar(this.element);
        editorToolbar.element.classList.add("data-view-toolbar");

        this._pageBackButton = new WebInspector.StatusBarButton(WebInspector.UIString("Show previous page."), "play-backwards-status-bar-item");
        this._pageBackButton.addEventListener("click", this._pageBackButtonClicked, this);
        editorToolbar.appendStatusBarItem(this._pageBackButton);

        this._pageForwardButton = new WebInspector.StatusBarButton(WebInspector.UIString("Show next page."), "play-status-bar-item");
        this._pageForwardButton.setEnabled(false);
        this._pageForwardButton.addEventListener("click", this._pageForwardButtonClicked, this);
        editorToolbar.appendStatusBarItem(this._pageForwardButton);
    },

    _pageBackButtonClicked: function()
    {
        this._skipCount = Math.max(0, this._skipCount - this._pageSize);
        this._updateData(false);
    },

    _pageForwardButtonClicked: function()
    {
        this._skipCount = this._skipCount + this._pageSize;
        this._updateData(false);
    },

    /**
     * @param {!WebInspector.ServiceWorkerCacheModel.Cache} cache
     */
    update: function(cache)
    {
        this._cache = cache;

        if (this._dataGrid)
            this._dataGrid.detach();
        this._dataGrid = this._createDataGrid();
        this._dataGrid.show(this.element);

        this._skipCount = 0;
        this._updateData(true);
    },

    /**
     * @param {boolean} force
     */
    _updateData: function(force)
    {
        var pageSize = this._pageSize;
        var skipCount = this._skipCount;
        this._refreshButton.setEnabled(false);

        if (!force && this._lastPageSize === pageSize && this._lastSkipCount === skipCount)
            return;

        if (this._lastPageSize !== pageSize) {
            skipCount = 0;
            this._skipCount = 0;
        }
        this._lastPageSize = pageSize;
        this._lastSkipCount = skipCount;

        /**
         * @param {!Array.<!WebInspector.ServiceWorkerCacheModel.Entry>} entries
         * @param {boolean} hasMore
         * @this {WebInspector.ServiceWorkerCacheView}
         */
        function callback(entries, hasMore)
        {
            this._refreshButton.setEnabled(true);
            this.clear();
            this._entries = entries;
            for (var i = 0; i < entries.length; ++i) {
                var data = {};
                data["number"] = i + skipCount;
                data["request"] = entries[i].request;
                data["response"] = entries[i].response;

                var node = new WebInspector.SWCacheDataGridNode(data);
                this._dataGrid.rootNode().appendChild(node);
            }

            this._pageBackButton.setEnabled(!!skipCount);
            this._pageForwardButton.setEnabled(hasMore);
        }

        this._model.loadCacheData(this._cacheId, skipCount, pageSize, callback.bind(this));
    },

    _refreshButtonClicked: function(event)
    {
        this._updateData(true);
    },

    /**
     * @return {!Array.<!WebInspector.StatusBarItem>}
     */
    statusBarItems: function()
    {
        return [this._refreshButton];
    },

    clear: function()
    {
        this._dataGrid.rootNode().removeChildren();
        this._entries = [];
    },

    __proto__: WebInspector.VBox.prototype
}

/**
 * @constructor
 * @extends {WebInspector.DataGridNode}
 * @param {!Object.<string, *>} data
 */
WebInspector.SWCacheDataGridNode = function(data)
{
    WebInspector.DataGridNode.call(this, data, false);
    this.selectable = false;
}

WebInspector.SWCacheDataGridNode.prototype = {
    /**
     * @override
     * @return {!Element}
     */
    createCell: function(columnIdentifier)
    {
        var cell = WebInspector.DataGridNode.prototype.createCell.call(this, columnIdentifier);
        var value = this.data[columnIdentifier];

        switch (columnIdentifier) {
        case "request":
        case "response":
            cell.removeChildren();
            this._formatValue(cell, value);
            break;
        default:
        }

        return cell;
    },

    _formatValue: function(cell, value)
    {
        var valueElement = WebInspector.ObjectPropertiesSection.createValueElement(value, false, cell);
        valueElement.classList.add("source-code");
        if (value.type === "object") {
            var section = new WebInspector.ObjectPropertiesSection(value, valueElement);
            section.editable = false;
            section.skipProto();
            cell.appendChild(section.element);
        } else {
            valueElement.classList.add("primitive-value");
            cell.appendChild(valueElement);
        }
    },

    __proto__: WebInspector.DataGridNode.prototype
}
