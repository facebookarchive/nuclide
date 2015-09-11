/*
 * Copyright (C) 2007 Apple Inc.  All rights reserved.
 * Copyright (C) 2009 Joseph Pecoraro
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @extends {WebInspector.ElementsSidebarPane}
 */
WebInspector.ComputedStyleSidebarPane = function()
{
    WebInspector.ElementsSidebarPane.call(this, WebInspector.UIString("Computed Style"));
    this.registerRequiredCSS("elements/computedStyleSidebarPane.css");
    this._alwaysShowComputedProperties = { "display": true, "height": true, "width": true };

    var inheritedCheckBox = WebInspector.SettingsUI.createSettingCheckbox(WebInspector.UIString("Show inherited properties"), WebInspector.settings.showInheritedComputedStyleProperties, true);
    inheritedCheckBox.classList.add("checkbox-with-label");
    this.bodyElement.appendChild(inheritedCheckBox);
    this.bodyElement.classList.add("computed-style-sidebar-pane");
    WebInspector.settings.showInheritedComputedStyleProperties.addChangeListener(this._showInheritedComputedStyleChanged.bind(this));

    this._propertiesContainer = this.bodyElement.createChild("div", "monospace");
    this._propertiesContainer.classList.add("computed-properties");
    this._onTracePropertyBound = this._onTraceProperty.bind(this);
}

WebInspector.ComputedStyleSidebarPane._propertySymbol = Symbol("property");

WebInspector.ComputedStyleSidebarPane.prototype = {
    /**
     * @param {!Event} event
     */
    _onTraceProperty: function(event)
    {
        var item = event.target.enclosingNodeOrSelfWithClass("computed-style-property");
        var property = item && item[WebInspector.ComputedStyleSidebarPane._propertySymbol];
        if (!property)
            return;
        this._stylesSidebarPane.tracePropertyName(property.name);
    },

    _showInheritedComputedStyleChanged: function()
    {
        this.update();
    },

    /**
     * @override
     * @param {?WebInspector.DOMNode} node
     */
    setNode: function(node)
    {
        if (node)
            this._target = node.target();
        WebInspector.ElementsSidebarPane.prototype.setNode.call(this, node);
    },

    /**
     * @override
     * @param {!WebInspector.Throttler.FinishCallback} finishedCallback
     */
    doUpdate: function(finishedCallback)
    {
        var promises = [
            this._stylesSidebarPane._fetchComputedStyle(),
            this._stylesSidebarPane._fetchMatchedCascade()
        ];
        Promise.all(promises)
            .spread(this._innerRebuildUpdate.bind(this))
            .then(finishedCallback);
    },

    /**
     * @param {string} text
     * @return {!Node}
     */
    _processColor: function(text)
    {
        var color = WebInspector.Color.parse(text);
        if (!color)
            return createTextNode(text);
        var swatch = WebInspector.ColorSwatch.create();
        swatch.setColorText(text);
        return swatch;
    },

    /**
     * @param {?WebInspector.CSSStyleDeclaration} computedStyle
       @param {?{matched: !WebInspector.SectionCascade, pseudo: !Map.<number, !WebInspector.SectionCascade>}} cascades
     */
    _innerRebuildUpdate: function(computedStyle, cascades)
    {
        this._propertiesContainer.removeChildren();
        if (!computedStyle || !cascades)
            return;

        var uniqueProperties = computedStyle.allProperties.slice();
        uniqueProperties.sort(propertySorter);

        var showInherited = WebInspector.settings.showInheritedComputedStyleProperties.get();
        for (var i = 0; i < uniqueProperties.length; ++i) {
            var property = uniqueProperties[i];
            var inherited = this._isPropertyInherited(cascades.matched, property.name);
            if (!showInherited && inherited && !(property.name in this._alwaysShowComputedProperties))
                continue;
            var canonicalName = WebInspector.CSSMetadata.canonicalPropertyName(property.name);
            if (property.name !== canonicalName && property.value === computedStyle.getPropertyValue(canonicalName))
                continue;
            var item = this._propertiesContainer.createChild("div", "computed-style-property");
            item[WebInspector.ComputedStyleSidebarPane._propertySymbol] = property;
            item.classList.toggle("computed-style-property-inherited", inherited);
            var renderer = new WebInspector.StylesSidebarPropertyRenderer(null, this.node(), property.name, property.value);
            renderer.setColorHandler(this._processColor.bind(this));

            if (!inherited) {
                var traceButton = item.createChild("div", "computed-style-trace-button");
                traceButton.createChild("div", "glyph");
                traceButton.addEventListener("click", this._onTracePropertyBound, false);
            }
            item.appendChild(renderer.renderName());
            item.appendChild(createTextNode(": "));
            item.appendChild(renderer.renderValue());
            item.appendChild(createTextNode(";"));
            this._propertiesContainer.appendChild(item);
        }

        /**
         * @param {!WebInspector.CSSProperty} a
         * @param {!WebInspector.CSSProperty} b
         */
        function propertySorter(a, b)
        {
            var canonicalName = WebInspector.CSSMetadata.canonicalPropertyName;
            return canonicalName(a.name).compareTo(canonicalName(b.name));
        }
    },

    /**
     * @param {!WebInspector.SectionCascade} matchedCascade
     * @param {string} propertyName
     */
    _isPropertyInherited: function(matchedCascade, propertyName)
    {
        var canonicalName = WebInspector.CSSMetadata.canonicalPropertyName(propertyName);
        return !matchedCascade.allUsedProperties().has(canonicalName);
    },

    /**
     * @param {?RegExp} regex
     */
    _updateFilter: function(regex)
    {
        for (var i = 0; i < this._propertiesContainer.children.length; ++i) {
            var item = this._propertiesContainer.children[i];
            var property = item[WebInspector.ComputedStyleSidebarPane._propertySymbol];
            var matched = !regex || regex.test(property.name) || regex.test(property.value);
            item.classList.toggle("hidden", !matched);
        }
    },

    /**
     * @param {!WebInspector.StylesSidebarPane} pane
     */
    setHostingPane: function(pane)
    {
        this._stylesSidebarPane = pane;
    },

    /**
     * @param {!Element} element
     */
    setFilterBoxContainer: function(element)
    {
        element.appendChild(WebInspector.StylesSidebarPane.createPropertyFilterElement(WebInspector.UIString("Filter"), filterCallback.bind(this)));

        /**
         * @param {?RegExp} regex
         * @this {WebInspector.ComputedStyleSidebarPane}
         */
        function filterCallback(regex)
        {
            this._filterRegex = regex;
            this._updateFilter(regex);
        }
    },

    __proto__: WebInspector.ElementsSidebarPane.prototype
}
