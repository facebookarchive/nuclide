/*
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @extends {WebInspector.SidebarPane}
 */
WebInspector.ScopeChainSidebarPane = function()
{
    WebInspector.SidebarPane.call(this, WebInspector.UIString("Scope"));
    this._sections = [];
    /** @type {!Set.<?string>} */
    this._expandedSections = new Set();
    /** @type {!Set.<string>} */
    this._expandedProperties = new Set();
}

WebInspector.ScopeChainSidebarPane.prototype = {
    /**
     * @param {?WebInspector.DebuggerModel.CallFrame} callFrame
     */
    update: function(callFrame)
    {
        this.bodyElement.removeChildren();

        if (!callFrame) {
            var infoElement = createElement("div");
            infoElement.className = "info";
            infoElement.textContent = WebInspector.UIString("Not Paused");
            this.bodyElement.appendChild(infoElement);
            return;
        }

        for (var i = 0; i < this._sections.length; ++i) {
            var section = this._sections[i];
            if (!section.title)
                continue;
            if (section.expanded)
                this._expandedSections.add(section.title);
            else
                this._expandedSections.delete(section.title);
        }

        this._sections = [];

        var foundLocalScope = false;
        var scopeChain = callFrame.scopeChain();
        for (var i = 0; i < scopeChain.length; ++i) {
            var scope = scopeChain[i];
            var title = null;
            var emptyPlaceholder = null;
            var extraProperties = [];

            switch (scope.type()) {
            case DebuggerAgent.ScopeType.Local:
                foundLocalScope = true;
                title = WebInspector.UIString("Local");
                emptyPlaceholder = WebInspector.UIString("No Variables");
                var thisObject = callFrame.thisObject();
                if (thisObject)
                    extraProperties.push(new WebInspector.RemoteObjectProperty("this", thisObject));
                if (i == 0) {
                    var details = callFrame.target().debuggerModel.debuggerPausedDetails();
                    if (!callFrame.isAsync()) {
                        var exception = details.exception();
                        if (exception)
                            extraProperties.push(new WebInspector.RemoteObjectProperty("<exception>", exception));
                    }
                    var returnValue = callFrame.returnValue();
                    if (returnValue)
                        extraProperties.push(new WebInspector.RemoteObjectProperty("<return>", returnValue));
                }
                break;
            case DebuggerAgent.ScopeType.Closure:
                title = WebInspector.UIString("Closure");
                emptyPlaceholder = WebInspector.UIString("No Variables");
                break;
            case DebuggerAgent.ScopeType.Catch:
                title = WebInspector.UIString("Catch");
                break;
            case DebuggerAgent.ScopeType.Block:
                title = WebInspector.UIString("Block");
                break;
            case DebuggerAgent.ScopeType.Script:
                title = WebInspector.UIString("Script");
                break;
            case DebuggerAgent.ScopeType.With:
                title = WebInspector.UIString("With Block");
                break;
            case DebuggerAgent.ScopeType.Global:
                title = WebInspector.UIString("Global");
                break;
            }

            var subtitle = scope.description();
            if (!title || title === subtitle)
                subtitle = undefined;

            var section = new WebInspector.ObjectPropertiesSection(scope.object(), title, subtitle, emptyPlaceholder, true, extraProperties);
            section.propertiesTreeOutline.addEventListener(TreeOutline.Events.ElementAttached, this._elementAttached, this);
            section.propertiesTreeOutline.addEventListener(TreeOutline.Events.ElementExpanded, this._elementExpanded, this);
            section.propertiesTreeOutline.addEventListener(TreeOutline.Events.ElementCollapsed, this._elementCollapsed, this);
            section.editInSelectedCallFrameWhenPaused = true;
            section.pane = this;

            if (scope.type() === DebuggerAgent.ScopeType.Global)
                section.collapse();
            else if (!foundLocalScope || scope.type() === DebuggerAgent.ScopeType.Local || this._expandedSections.has(title))
                section.expand();

            this._sections.push(section);
            this.bodyElement.appendChild(section.element);
        }
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _elementAttached: function(event)
    {
        var element = /** @type {!WebInspector.ObjectPropertyTreeElement} */ (event.data);
        if (element.isExpandable() && this._expandedProperties.has(this._propertyPath(element)))
            element.expand();
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _elementExpanded: function(event)
    {
        var element = /** @type {!WebInspector.ObjectPropertyTreeElement} */ (event.data);
        this._expandedProperties.add(this._propertyPath(element));
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _elementCollapsed: function(event)
    {
        var element = /** @type {!WebInspector.ObjectPropertyTreeElement} */ (event.data);
        this._expandedProperties.delete(this._propertyPath(element));
    },

    /**
     * @param {!WebInspector.ObjectPropertyTreeElement} treeElement
     * @return {string}
     */
    _propertyPath: function(treeElement)
    {
        var section = treeElement.treeOutline.section;
        return section.title + ":" + (section.subtitle ? section.subtitle + ":" : "") + WebInspector.ObjectPropertyTreeElement.prototype.propertyPath.call(treeElement);
    },

    __proto__: WebInspector.SidebarPane.prototype
}
