// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @constructor
 * @param {!WebInspector.RemoteObject} object
 * @param {!Array.<*>=} prefixML
 */
WebInspector.CustomPreviewSection = function(object, prefixML)
{
    this._sectionElement = createElement("span");
    this._object = object;
    this._expanded = false;
    this._cachedContent = null;
    var customPreview = object.customPreview();
    if (customPreview.hasBody) {
        this._sectionElement.classList.add("custom-expandable-section");
        this._sectionElement.addEventListener("click", this._onClick.bind(this), false);
    }
    if (prefixML)
        this._appendJsonMLTags(this._sectionElement, prefixML);

    try {
        var headerJSON = JSON.parse(customPreview.header);
    } catch (e) {
        WebInspector.console.error("Broken formatter: header is invalid json " + e);
        return;
    }
    var header = this._renderJSONMLTag(headerJSON);
    this._sectionElement.appendChild(header);
}

WebInspector.CustomPreviewSection._tagsWhiteList = new Set(["span", "div", "ol", "li","table", "tr", "td"]);

WebInspector.CustomPreviewSection._attributes = [
    "background-color",
    "color",
    "font-style",
    "list-style-type",
    "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
    "padding", "padding-top", "padding-right", "padding-bottom", "padding-left"];

WebInspector.CustomPreviewSection._attributesWhiteList = new Set(WebInspector.CustomPreviewSection._attributes);

WebInspector.CustomPreviewSection.prototype = {

    /**
     * @return {!Element}
     */
    element: function()
    {
        return this._sectionElement;
    },

    /**
     * @param {string} style
     * @return {boolean}
     */
    _validateStyleAttributes: function(style)
    {
        var valueRegEx = /^[\w\s()-,.#]*$/;
        var styleAttributes = style.split(";");
        for (var i = 0; i < styleAttributes.length; ++i) {
            var attribute = styleAttributes[i].trim();
            if (!attribute.length)
                continue;

            var pair = attribute.split(":");
            if (pair.length != 2) {
                WebInspector.console.error("Broken formatter: " + styleAttributes[i]);
                return false;
            }

            var key = pair[0].trim();
            var value = pair[1];
            if (!WebInspector.CustomPreviewSection._attributesWhiteList.has(key)) {
                WebInspector.console.error("Broken formatter: style attribute " + key + " is not allowed!");
                return false;
            }
            if (!value.match(valueRegEx)) {
                WebInspector.console.error("Broken formatter: style attribute value" + value + " is not allowed!");
                return false;
            }

        }
        return true;
    },

    /**
     * @param {*} jsonML
     * @return {!Node}
     */
    _renderJSONMLTag: function(jsonML)
    {
        if (!Array.isArray(jsonML))
            return createTextNode(jsonML + "");

        var array = /** @type {!Array.<*>} */(jsonML);
        if (array[0] === "object")
            return this._layoutObjectTag(array);
        else
            return this._renderElement(array);
    },

    /**
     *
     * @param {!Array.<*>} object
     * @return {!Node}
     */
    _renderElement: function(object)
    {
        var tagName = object.shift();
        if (!WebInspector.CustomPreviewSection._tagsWhiteList.has(tagName)) {
            WebInspector.console.error("Broken formatter: element " + tagName + " is not allowed!");
            return createElement("span");
        }
        var element = createElement(/** @type {string} */ (tagName));
        if ((typeof object[0] == "object") && !Array.isArray(object[0])) {
            var attributes = object.shift();
            for (var key in attributes) {
                var value = attributes[key];
                if ((key !== "style") || (typeof value !== "string") || !this._validateStyleAttributes(value))
                    continue;

                element.setAttribute(key, value);
            }
        }

        this._appendJsonMLTags(element, object);
        return element;
    },

    /**
     * @param {!Array.<*>} objectTag
     * @return {!Node}
     */
    _layoutObjectTag: function(objectTag)
    {
        objectTag.shift();
        var attributes = objectTag.shift();
        var remoteObject = this._object.target().runtimeModel.createRemoteObject(/** @type {!RuntimeAgent.RemoteObject} */ (attributes));
        if (!remoteObject.customPreview()) {
            var header = createElement("span");
            this._appendJsonMLTags(header, objectTag);
            var objectPropertiesSection = new WebInspector.ObjectPropertiesSection(remoteObject, header);
            return objectPropertiesSection.element;
        }

        var customSection = new WebInspector.CustomPreviewSection(remoteObject, objectTag);
        return customSection.element();
    },

    /**
     * @param {!Node} parentElement
     * @param {!Array.<*>} jsonMLTags
     */
    _appendJsonMLTags: function(parentElement, jsonMLTags)
    {
        for (var i = 0; i < jsonMLTags.length; ++i)
            parentElement.appendChild(this._renderJSONMLTag(jsonMLTags[i]));
    },

    _onClick: function()
    {
        if (this._cachedContent)
            this._toggleExpand();
        else
            this._loadBody();
    },

    _toggleExpand: function()
    {
        this._expanded = !this._expanded;
        this._sectionElement.classList.toggle("expanded", this._expanded);
        var parent = this._sectionElement.parentElement;
        if (this._expanded)
            parent.insertBefore(this._cachedContent, this._sectionElement.nextSibling);
        else
            parent.removeChild(this._cachedContent);
    },

    _loadBody: function()
    {
        /**
         * @suppressReceiverCheck
         * @suppressGlobalPropertiesCheck
         * @suppress {undefinedVars}
         * @this {?}
         */
        function load()
        {
            /**
             * @param {*} jsonMLObject
             * @throws {string} error message
             */
            function substituteObjectTagsInCustomPreview(jsonMLObject)
            {
                if (!jsonMLObject || (typeof jsonMLObject !== "object") || (typeof jsonMLObject.splice !== "function"))
                    return;

                var obj = jsonMLObject.length;
                if (!(typeof obj === "number" && obj >>> 0 === obj && (obj > 0 || 1 / obj > 0)))
                    return;

                var startIndex = 1;
                if (jsonMLObject[0] === "object") {
                    var attributes = jsonMLObject[1];
                    var originObject = attributes["object"];
                    if (typeof originObject === "undefined")
                        throw "Illegal format: obligatory attribute \"object\" isn't specified";

                    jsonMLObject[1] = bindRemoteObject(originObject, false, false, null, false);
                    startIndex = 2;
                }

                for (var i = startIndex; i < jsonMLObject.length; ++i)
                    substituteObjectTagsInCustomPreview(jsonMLObject[i]);
            }

            try {
                var formatter = window["devtoolsFormatter"];
                if (!formatter)
                    return null;

                var body = formatter.body(this);
                substituteObjectTagsInCustomPreview(body);
                return body;
            } catch (e) {
                console.error("Custom Formatter Failed: " + e);
                return null;
            }
        }

        this._object.callFunctionJSON(load, [], onBodyLoaded.bind(this));

        /**
         * @param {*} bodyJsonML
         * @this {WebInspector.CustomPreviewSection}
         */
        function onBodyLoaded(bodyJsonML)
        {
            if (!bodyJsonML)
                return;

            this._cachedContent = this._renderJSONMLTag(bodyJsonML);
            this._toggleExpand();
        }
    }
}
