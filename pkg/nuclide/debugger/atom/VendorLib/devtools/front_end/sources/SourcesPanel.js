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
 * @extends {WebInspector.Panel}
 * @implements {WebInspector.ContextMenu.Provider}
 * @param {!WebInspector.Workspace=} workspaceForTest
 */
WebInspector.SourcesPanel = function(workspaceForTest)
{
    WebInspector.Panel.call(this, "sources");
    this.registerRequiredCSS("sources/sourcesPanel.css");
    new WebInspector.DropTarget(this.element, [WebInspector.DropTarget.Types.Files], WebInspector.UIString("Drop workspace folder here"), this._handleDrop.bind(this));

    this._workspace = workspaceForTest || WebInspector.workspace;
    this._networkMapping = WebInspector.networkMapping;

    this._debugToolbar = this._createDebugToolbar();
    this._debugToolbarDrawer = this._createDebugToolbarDrawer();

    const initialDebugSidebarWidth = 225;
    this._splitView = new WebInspector.SplitView(true, true, "sourcesPanelSplitViewState", initialDebugSidebarWidth);
    this._splitView.enableShowModeSaving();
    this._splitView.show(this.element);

    // Create scripts navigator
    const initialNavigatorWidth = 225;
    this.editorView = new WebInspector.SplitView(true, false, "sourcesPanelNavigatorSplitViewState", initialNavigatorWidth);
    this.editorView.enableShowModeSaving();
    this.editorView.element.tabIndex = 0;
    this._splitView.setMainView(this.editorView);

    this._navigator = new WebInspector.SourcesNavigator(this._workspace);
    this._navigator.view.setMinimumSize(100, 25);
    this.editorView.setSidebarView(this._navigator.view);
    this._navigator.addEventListener(WebInspector.SourcesNavigator.Events.SourceSelected, this._sourceSelected, this);
    this._navigator.addEventListener(WebInspector.SourcesNavigator.Events.SourceRenamed, this._sourceRenamed, this);

    this._sourcesView = new WebInspector.SourcesView(this._workspace, this);
    this._sourcesView.addEventListener(WebInspector.SourcesView.Events.EditorSelected, this._editorSelected.bind(this));
    this._sourcesView.addEventListener(WebInspector.SourcesView.Events.EditorClosed, this._editorClosed.bind(this));
    this._sourcesView.registerShortcuts(this.registerShortcuts.bind(this));
    this.editorView.setMainView(this._sourcesView);

    this._debugSidebarResizeWidgetElement = createElement("div");
    this._debugSidebarResizeWidgetElement.id = "scripts-debug-sidebar-resizer-widget";
    this._splitView.addEventListener(WebInspector.SplitView.Events.ShowModeChanged, this._updateDebugSidebarResizeWidget, this);
    this._updateDebugSidebarResizeWidget();
    this._splitView.installResizer(this._debugSidebarResizeWidgetElement);

    this.sidebarPanes = {};
    this.sidebarPanes.threads = new WebInspector.ThreadsSidebarPane();
    this.sidebarPanes.watchExpressions = new WebInspector.WatchExpressionsSidebarPane();
    this.sidebarPanes.callstack = new WebInspector.CallStackSidebarPane();
    this.sidebarPanes.callstack.addEventListener(WebInspector.CallStackSidebarPane.Events.CallFrameSelected, this._callFrameSelectedInSidebar.bind(this));
    this.sidebarPanes.callstack.addEventListener(WebInspector.CallStackSidebarPane.Events.RevealHiddenCallFrames, this._hiddenCallFramesRevealedInSidebar.bind(this));
    this.sidebarPanes.callstack.registerShortcuts(this.registerShortcuts.bind(this));

    this.sidebarPanes.scopechain = new WebInspector.ScopeChainSidebarPane();
    if (Runtime.experiments.isEnabled("serviceWorkersInPageFrontend"))
        this.sidebarPanes.serviceWorkers = new WebInspector.ServiceWorkersSidebarPane();
    this.sidebarPanes.jsBreakpoints = new WebInspector.JavaScriptBreakpointsSidebarPane(WebInspector.breakpointManager, this.showUISourceCode.bind(this));
    this.sidebarPanes.domBreakpoints = WebInspector.domBreakpointsSidebarPane.createProxy(this);
    this.sidebarPanes.xhrBreakpoints = new WebInspector.XHRBreakpointsSidebarPane();
    this.sidebarPanes.eventListenerBreakpoints = new WebInspector.EventListenerBreakpointsSidebarPane();
    if (Runtime.experiments.isEnabled("stepIntoAsync"))
        this.sidebarPanes.asyncOperationBreakpoints = new WebInspector.AsyncOperationsSidebarPane();

    this._lastSelectedTabSetting = WebInspector.settings.createSetting("lastSelectedSourcesSidebarPaneTab", this.sidebarPanes.scopechain.title());

    this._installDebuggerSidebarController();

    WebInspector.dockController.addEventListener(WebInspector.DockController.Events.DockSideChanged, this._dockSideChanged.bind(this));
    WebInspector.settings.splitVerticallyWhenDockedToRight.addChangeListener(this._dockSideChanged.bind(this));
    this._dockSideChanged();

    this._updateDebuggerButtons();
    this._pauseOnExceptionEnabledChanged();
    WebInspector.settings.pauseOnExceptionEnabled.addChangeListener(this._pauseOnExceptionEnabledChanged, this);
    this._setTarget(WebInspector.context.flavor(WebInspector.Target));
    WebInspector.breakpointManager.addEventListener(WebInspector.BreakpointManager.Events.BreakpointsActiveStateChanged, this._breakpointsActiveStateChanged, this);
    WebInspector.context.addFlavorChangeListener(WebInspector.Target, this._onCurrentTargetChanged, this);
    WebInspector.targetManager.addModelListener(WebInspector.DebuggerModel, WebInspector.DebuggerModel.Events.DebuggerWasEnabled, this._debuggerWasEnabled, this);
    WebInspector.targetManager.addModelListener(WebInspector.DebuggerModel, WebInspector.DebuggerModel.Events.DebuggerWasDisabled, this._debuggerReset, this);
    WebInspector.targetManager.addModelListener(WebInspector.DebuggerModel, WebInspector.DebuggerModel.Events.DebuggerPaused, this._debuggerPaused, this);
    WebInspector.targetManager.addModelListener(WebInspector.DebuggerModel, WebInspector.DebuggerModel.Events.DebuggerResumed, this._debuggerResumed, this);
    WebInspector.targetManager.addModelListener(WebInspector.DebuggerModel, WebInspector.DebuggerModel.Events.CallFrameSelected, this._callFrameSelected, this);
    WebInspector.targetManager.addModelListener(WebInspector.DebuggerModel, WebInspector.DebuggerModel.Events.ConsoleCommandEvaluatedInSelectedCallFrame, this._consoleCommandEvaluatedInSelectedCallFrame, this);
    WebInspector.targetManager.addModelListener(WebInspector.DebuggerModel, WebInspector.DebuggerModel.Events.GlobalObjectCleared, this._debuggerReset, this);
    new WebInspector.WorkspaceMappingTip(this, this._workspace);
    WebInspector.extensionServer.addEventListener(WebInspector.ExtensionServer.Events.SidebarPaneAdded, this._extensionSidebarPaneAdded, this);
}

WebInspector.SourcesPanel.minToolbarWidth = 215;

WebInspector.SourcesPanel.prototype = {
    /**
     * @param {?WebInspector.Target} target
     */
    _setTarget: function(target)
    {
        if (!target)
            return;

        if (target.debuggerModel.isPaused()) {
            this._showDebuggerPausedDetails(/** @type {!WebInspector.DebuggerPausedDetails} */ (target.debuggerModel.debuggerPausedDetails()));
            var callFrame = target.debuggerModel.selectedCallFrame();
            if (callFrame)
                this._selectCallFrame(callFrame);
        } else {
            this._paused = false;
            this._clearInterface();
            this._toggleDebuggerSidebarButton.disabled = false;
        }
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _onCurrentTargetChanged: function(event)
    {
        var target = /** @type {?WebInspector.Target} */ (event.data);
        this._setTarget(target);
    },

    /**
     * @override
     * @return {!Element}
     */
    defaultFocusedElement: function()
    {
        return this._sourcesView.defaultFocusedElement();
    },

    /**
     * @return {boolean}
     */
    paused: function()
    {
        return this._paused;
    },

    wasShown: function()
    {
        WebInspector.context.setFlavor(WebInspector.SourcesPanel, this);
        WebInspector.Panel.prototype.wasShown.call(this);
    },

    willHide: function()
    {
        WebInspector.Panel.prototype.willHide.call(this);
        WebInspector.context.setFlavor(WebInspector.SourcesPanel, null);
    },

    /**
     * @override
     * @return {!WebInspector.SearchableView}
     */
    searchableView: function()
    {
        return this._sourcesView.searchableView();
    },

    _consoleCommandEvaluatedInSelectedCallFrame: function(event)
    {
        var target = /** @type {!WebInspector.Target} */  (event.target.target());
        if (WebInspector.context.flavor(WebInspector.Target) !== target)
            return;
        this.sidebarPanes.scopechain.update(target.debuggerModel.selectedCallFrame());
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _debuggerPaused: function(event)
    {
        var details = /** @type {!WebInspector.DebuggerPausedDetails} */ (event.data);
        if (!this._paused)
            WebInspector.inspectorView.setCurrentPanel(this);

        if (WebInspector.context.flavor(WebInspector.Target) === details.target())
            this._showDebuggerPausedDetails(details);
        else if (!this._paused)
            WebInspector.context.setFlavor(WebInspector.Target, details.target());
    },

    /**
     * @param {!WebInspector.DebuggerPausedDetails} details
     */
    _showDebuggerPausedDetails: function(details)
    {
        this._paused = true;
        this._updateDebuggerButtons();

        this.sidebarPanes.callstack.update(details);

        /**
         * @param {!Element} element
         * @this {WebInspector.SourcesPanel}
         */
        function didCreateBreakpointHitStatusMessage(element)
        {
            this.sidebarPanes.callstack.setStatus(element);
        }

        /**
         * @param {!WebInspector.UILocation} uiLocation
         * @this {WebInspector.SourcesPanel}
         */
        function didGetUILocation(uiLocation)
        {
            var breakpoint = WebInspector.breakpointManager.findBreakpointOnLine(uiLocation.uiSourceCode, uiLocation.lineNumber);
            if (!breakpoint)
                return;
            this.sidebarPanes.jsBreakpoints.highlightBreakpoint(breakpoint);
            this.sidebarPanes.callstack.setStatus(WebInspector.UIString("Paused on a JavaScript breakpoint."));
        }

        if (details.reason === WebInspector.DebuggerModel.BreakReason.DOM) {
            WebInspector.domBreakpointsSidebarPane.highlightBreakpoint(details.auxData);
            WebInspector.domBreakpointsSidebarPane.createBreakpointHitStatusMessage(details, didCreateBreakpointHitStatusMessage.bind(this));
        } else if (details.reason === WebInspector.DebuggerModel.BreakReason.EventListener) {
            var eventName = details.auxData["eventName"];
            var targetName = details.auxData["targetName"];
            this.sidebarPanes.eventListenerBreakpoints.highlightBreakpoint(eventName, targetName);
            var eventNameForUI = WebInspector.EventListenerBreakpointsSidebarPane.eventNameForUI(eventName, details.auxData);
            this.sidebarPanes.callstack.setStatus(WebInspector.UIString("Paused on a \"%s\" Event Listener.", eventNameForUI));
        } else if (details.reason === WebInspector.DebuggerModel.BreakReason.XHR) {
            this.sidebarPanes.xhrBreakpoints.highlightBreakpoint(details.auxData["breakpointURL"]);
            this.sidebarPanes.callstack.setStatus(WebInspector.UIString("Paused on a XMLHttpRequest."));
        } else if (details.reason === WebInspector.DebuggerModel.BreakReason.Exception) {
            this.sidebarPanes.callstack.setStatus(WebInspector.UIString("Paused on exception: '%s'.", details.auxData["description"].split("\n", 1)[0]));
        } else if (details.reason === WebInspector.DebuggerModel.BreakReason.PromiseRejection) {
            this.sidebarPanes.callstack.setStatus(WebInspector.UIString("Paused on promise rejection: '%s'.", details.auxData["description"].split("\n", 1)[0]));
        } else if (details.reason === WebInspector.DebuggerModel.BreakReason.Assert) {
            this.sidebarPanes.callstack.setStatus(WebInspector.UIString("Paused on assertion."));
        } else if (details.reason === WebInspector.DebuggerModel.BreakReason.CSPViolation) {
            this.sidebarPanes.callstack.setStatus(WebInspector.UIString("Paused on a script blocked due to Content Security Policy directive: \"%s\".", details.auxData["directiveText"]));
        } else if (details.reason === WebInspector.DebuggerModel.BreakReason.DebugCommand) {
            this.sidebarPanes.callstack.setStatus(WebInspector.UIString("Paused on a debugged function."));
        } else if (details.reason === WebInspector.DebuggerModel.BreakReason.AsyncOperation) {
            if (Runtime.experiments.isEnabled("stepIntoAsync")) {
                var operationId = details.auxData["operationId"];
                var operation = this.sidebarPanes.asyncOperationBreakpoints.operationById(details.target(), operationId);
                var description = (operation && operation.description) || WebInspector.UIString("<unknown>");
                this.sidebarPanes.callstack.setStatus(WebInspector.UIString("Paused on a \"%s\" async operation.", description));
                this.sidebarPanes.asyncOperationBreakpoints.highlightBreakpoint(operationId);
            }
        } else {
            if (details.callFrames.length)
                WebInspector.debuggerWorkspaceBinding.createCallFrameLiveLocation(details.callFrames[0], didGetUILocation.bind(this));
            else
                console.warn("ScriptsPanel paused, but callFrames.length is zero."); // TODO remove this once we understand this case better
        }

        this._splitView.showBoth(true);
        this._toggleDebuggerSidebarButton.disabled = true;
        window.focus();
        InspectorFrontendHost.bringToFront();
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _debuggerResumed: function(event)
    {
        var target = /** @type {!WebInspector.Target} */  (event.target.target());
        if (WebInspector.context.flavor(WebInspector.Target) !== target)
            return;
        this._paused = false;
        this._clearInterface();
        this._toggleDebuggerSidebarButton.disabled = false;
        this._switchToPausedTargetTimeout = setTimeout(this._switchToPausedTarget.bind(this), 500);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _debuggerWasEnabled: function(event)
    {
        var target = /** @type {!WebInspector.Target} */  (event.target.target());
        if (WebInspector.context.flavor(WebInspector.Target) !== target)
            return;

        this._updateDebuggerButtons();
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _debuggerReset: function(event)
    {
        this._debuggerResumed(event);
    },

    /**
     * @return {!WebInspector.View}
     */
    get visibleView()
    {
        return this._sourcesView.visibleView();
    },

    /**
     * @param {!WebInspector.UISourceCode} uiSourceCode
     * @param {number=} lineNumber 0-based
     * @param {number=} columnNumber
     */
    showUISourceCode: function(uiSourceCode, lineNumber, columnNumber)
    {
        this._showEditor();
        this._sourcesView.showSourceLocation(uiSourceCode, lineNumber, columnNumber);
    },

    _showEditor: function()
    {
        WebInspector.inspectorView.setCurrentPanel(this);
    },

    /**
     * @param {!WebInspector.UILocation} uiLocation
     */
    showUILocation: function(uiLocation)
    {
        this.showUISourceCode(uiLocation.uiSourceCode, uiLocation.lineNumber, uiLocation.columnNumber);
    },

    /**
     * @param {!WebInspector.UISourceCode} uiSourceCode
     */
    _revealInNavigator: function(uiSourceCode)
    {
        this._navigator.revealUISourceCode(uiSourceCode);
    },

    /**
     * @param {boolean} ignoreExecutionLineEvents
     */
    setIgnoreExecutionLineEvents: function(ignoreExecutionLineEvents)
    {
        this._ignoreExecutionLineEvents = ignoreExecutionLineEvents;
    },

    /**
     * @param {!WebInspector.UILocation} uiLocation
     */
    _executionLineChanged: function(uiLocation)
    {
        this._sourcesView.clearCurrentExecutionLine();
        this._sourcesView.setExecutionLine(uiLocation);
        if (this._ignoreExecutionLineEvents)
            return;
        this._sourcesView.showSourceLocation(uiLocation.uiSourceCode, uiLocation.lineNumber, uiLocation.columnNumber, undefined, true);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _callFrameSelected: function(event)
    {
        var callFrame = /** @type {?WebInspector.DebuggerModel.CallFrame} */ (event.data);

        if (!callFrame || callFrame.target() !== WebInspector.context.flavor(WebInspector.Target))
            return;

        this._selectCallFrame(callFrame);
    },

    /**
     * @param {!WebInspector.DebuggerModel.CallFrame}  callFrame
     */
    _selectCallFrame: function(callFrame)
    {
        this.sidebarPanes.scopechain.update(callFrame);
        this.sidebarPanes.watchExpressions.refreshExpressions();
        this.sidebarPanes.callstack.setSelectedCallFrame(callFrame);
        WebInspector.debuggerWorkspaceBinding.createCallFrameLiveLocation(callFrame, this._executionLineChanged.bind(this));
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _sourceSelected: function(event)
    {
        var uiSourceCode = /** @type {!WebInspector.UISourceCode} */ (event.data.uiSourceCode);
        this._sourcesView.showSourceLocation(uiSourceCode, undefined, undefined, !event.data.focusSource)
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _sourceRenamed: function(event)
    {
        var uiSourceCode = /** @type {!WebInspector.UISourceCode} */ (event.data);
        this._sourcesView.sourceRenamed(uiSourceCode);
    },

    _pauseOnExceptionEnabledChanged: function()
    {
        var enabled = WebInspector.settings.pauseOnExceptionEnabled.get();
        this._pauseOnExceptionButton.setToggled(enabled);
        this._pauseOnExceptionButton.setTitle(WebInspector.UIString(enabled ? "Don't pause on exceptions." : "Pause on exceptions."));
        this._debugToolbarDrawer.classList.toggle("expanded", enabled);
    },

    _updateDebuggerButtons: function()
    {
        var currentTarget = WebInspector.context.flavor(WebInspector.Target);
        if (!currentTarget)
            return;

        if (this._paused) {
            this._updateButtonTitle(this._pauseButton, WebInspector.UIString("Resume script execution (%s)."));
            this._pauseButton.setToggled(true);
            this._pauseButton.setLongClickOptionsEnabled((function() { return [ this._longResumeButton ]; }).bind(this));

            this._pauseButton.setEnabled(true);
            this._stepOverButton.setEnabled(true);
            this._stepIntoButton.setEnabled(true);
            this._stepOutButton.setEnabled(true);
        } else {
            this._updateButtonTitle(this._pauseButton, WebInspector.UIString("Pause script execution (%s)."))
            this._pauseButton.setToggled(false);
            this._pauseButton.setLongClickOptionsEnabled(null);

            this._pauseButton.setEnabled(!currentTarget.debuggerModel.isPausing());
            this._stepOverButton.setEnabled(false);
            this._stepIntoButton.setEnabled(false);
            this._stepOutButton.setEnabled(false);
        }
    },

    _clearInterface: function()
    {
        this.sidebarPanes.callstack.update(null);
        this.sidebarPanes.scopechain.update(null);
        this.sidebarPanes.jsBreakpoints.clearBreakpointHighlight();
        WebInspector.domBreakpointsSidebarPane.clearBreakpointHighlight();
        this.sidebarPanes.eventListenerBreakpoints.clearBreakpointHighlight();
        this.sidebarPanes.xhrBreakpoints.clearBreakpointHighlight();
        if (Runtime.experiments.isEnabled("stepIntoAsync"))
            this.sidebarPanes.asyncOperationBreakpoints.clearBreakpointHighlight();

        this._sourcesView.clearCurrentExecutionLine();
        this._updateDebuggerButtons();

        if (this._switchToPausedTargetTimeout)
            clearTimeout(this._switchToPausedTargetTimeout);
    },

    _switchToPausedTarget: function()
    {
        delete this._switchToPausedTargetTimeout;
        if (this._paused)
            return;
        var target = WebInspector.context.flavor(WebInspector.Target);
        if (target && target.debuggerModel.isPaused())
            return;
        var targets = WebInspector.targetManager.targets();
        for (var i = 0; i < targets.length; ++i) {
            if (targets[i].debuggerModel.isPaused()) {
                WebInspector.context.setFlavor(WebInspector.Target, targets[i]);
                break;
            }
        }
    },

    _togglePauseOnExceptions: function()
    {
        WebInspector.settings.pauseOnExceptionEnabled.set(!this._pauseOnExceptionButton.toggled());
    },

    /**
     * @return {boolean}
     */
    _runSnippet: function()
    {
        var uiSourceCode = this._sourcesView.currentUISourceCode();
        if (uiSourceCode.project().type() !== WebInspector.projectTypes.Snippets)
            return false;

        var currentExecutionContext = WebInspector.context.flavor(WebInspector.ExecutionContext);
        if (!currentExecutionContext)
            return false;

        WebInspector.scriptSnippetModel.evaluateScriptSnippet(currentExecutionContext, uiSourceCode);
        return true;
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _editorSelected: function(event)
    {
        var uiSourceCode = /** @type {!WebInspector.UISourceCode} */ (event.data);
        this._editorChanged(uiSourceCode);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _editorClosed: function(event)
    {
        var wasSelected = /** @type {boolean} */ (event.data.wasSelected);
        if (wasSelected)
            this._editorChanged(null);
    },

    /**
     * @param {?WebInspector.UISourceCode} uiSourceCode
     */
    _editorChanged: function(uiSourceCode)
    {
        var isSnippet = uiSourceCode && uiSourceCode.project().type() === WebInspector.projectTypes.Snippets;
        this._runSnippetButton.element.classList.toggle("hidden", !isSnippet);
    },

    /**
     * @return {boolean}
     */
    togglePause: function()
    {
        var target = WebInspector.context.flavor(WebInspector.Target);
        if (!target)
            return true;

        if (this._paused) {
            this._paused = false;
            target.debuggerModel.resume();
        } else {
            // Make sure pauses didn't stick skipped.
            target.debuggerModel.pause();
        }

        this._clearInterface();
        return true;
    },

    /**
     * @return {?WebInspector.DebuggerModel}
     */
    _prepareToResume: function()
    {
        if (!this._paused)
            return null;

        this._paused = false;

        this._clearInterface();
        var target = WebInspector.context.flavor(WebInspector.Target);
        return target ? target.debuggerModel : null;
    },

    /**
     * @return {boolean}
     */
    _longResume: function()
    {
        var debuggerModel = this._prepareToResume();
        if (!debuggerModel)
            return true;

        debuggerModel.skipAllPausesUntilReloadOrTimeout(500);
        debuggerModel.resume();
        return true;
    },

    /**
     * @return {boolean}
     */
    _stepOverClicked: function()
    {
        var debuggerModel = this._prepareToResume();
        if (!debuggerModel)
            return true;

        debuggerModel.stepOver();
        return true;
    },

    /**
     * @return {boolean}
     */
    _stepIntoClicked: function()
    {
        var debuggerModel = this._prepareToResume();
        if (!debuggerModel)
            return true;

        debuggerModel.stepInto();
        return true;
    },

    /**
     * @return {boolean}
     */
    _stepIntoAsyncClicked: function()
    {
        var debuggerModel = this._prepareToResume();
        if (!debuggerModel)
            return true;

        debuggerModel.stepIntoAsync();
        return true;
    },

    /**
     * @return {boolean}
     */
    _stepOutClicked: function()
    {
        var debuggerModel = this._prepareToResume();
        if (!debuggerModel)
            return true;

        debuggerModel.stepOut();
        return true;
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _callFrameSelectedInSidebar: function(event)
    {
        var callFrame = /** @type {!WebInspector.DebuggerModel.CallFrame} */ (event.data);
        callFrame.target().debuggerModel.setSelectedCallFrame(callFrame);
    },

    _hiddenCallFramesRevealedInSidebar: function()
    {
        if (Runtime.experiments.isEnabled("stepIntoAsync"))
            this.sidebarPanes.asyncOperationBreakpoints.revealHiddenCallFrames(WebInspector.context.flavor(WebInspector.Target));
    },

    /**
     * @param {!WebInspector.DebuggerModel.Location} rawLocation
     */
    continueToLocation: function(rawLocation)
    {
        if (!this._prepareToResume())
            return;

        rawLocation.continueToLocation();
    },

    _toggleBreakpointsClicked: function(event)
    {
        WebInspector.breakpointManager.setBreakpointsActive(!WebInspector.breakpointManager.breakpointsActive());
    },

    _breakpointsActiveStateChanged: function(event)
    {
        var active = event.data;
        this._toggleBreakpointsButton.setToggled(!active);
        this.sidebarPanes.jsBreakpoints.listElement.classList.toggle("breakpoints-list-deactivated", !active);
        this._sourcesView.toggleBreakpointsActiveState(active);
        if (active)
            this._toggleBreakpointsButton.setTitle(WebInspector.UIString("Deactivate breakpoints."));
        else
            this._toggleBreakpointsButton.setTitle(WebInspector.UIString("Activate breakpoints."));
    },

    /**
     * @return {!WebInspector.StatusBar}
     */
    _createDebugToolbar: function()
    {
        var debugToolbar = new WebInspector.StatusBar();
        debugToolbar.element.classList.add("scripts-debug-toolbar");

        var title, handler;

        // Run snippet.
        title = WebInspector.UIString("Run snippet (%s).");
        handler = this._runSnippet.bind(this);
        this._runSnippetButton = this._createButtonAndRegisterShortcutsForAction("play-status-bar-item", title, "debugger.run-snippet");
        debugToolbar.appendStatusBarItem(this._runSnippetButton);
        this._runSnippetButton.element.classList.add("hidden");

        // Continue.
        this._pauseButton = this._createButtonAndRegisterShortcutsForAction("pause-status-bar-item", "", "debugger.toggle-pause");
        debugToolbar.appendStatusBarItem(this._pauseButton);

        // Long resume.
        title = WebInspector.UIString("Resume with all pauses blocked for 500 ms");
        this._longResumeButton = new WebInspector.StatusBarButton(title, "play-status-bar-item");
        this._longResumeButton.addEventListener("click", this._longResume.bind(this), this);

        // Step over.
        title = WebInspector.UIString("Step over next function call (%s).");
        this._stepOverButton = this._createButtonAndRegisterShortcutsForAction("step-over-status-bar-item", title, "debugger.step-over");
        debugToolbar.appendStatusBarItem(this._stepOverButton);

        // Step into.
        title = WebInspector.UIString("Step into next function call (%s).");
        this._stepIntoButton = this._createButtonAndRegisterShortcutsForAction("step-in-status-bar-item", title, "debugger.step-into");
        debugToolbar.appendStatusBarItem(this._stepIntoButton);

        // Step out.
        title = WebInspector.UIString("Step out of current function (%s).");
        this._stepOutButton = this._createButtonAndRegisterShortcutsForAction("step-out-status-bar-item", title, "debugger.step-out");
        debugToolbar.appendStatusBarItem(this._stepOutButton);

        // Toggle Breakpoints
        this._toggleBreakpointsButton = new WebInspector.StatusBarButton(WebInspector.UIString("Deactivate breakpoints."), "breakpoint-status-bar-item");
        this._toggleBreakpointsButton.setToggled(false);
        this._toggleBreakpointsButton.addEventListener("click", this._toggleBreakpointsClicked, this);
        debugToolbar.appendStatusBarItem(this._toggleBreakpointsButton);

        // Pause on Exception
        this._pauseOnExceptionButton = new WebInspector.StatusBarButton("", "pause-on-exceptions-status-bar-item");
        this._pauseOnExceptionButton.addEventListener("click", this._togglePauseOnExceptions, this);
        debugToolbar.appendStatusBarItem(this._pauseOnExceptionButton);

        return debugToolbar;
    },

    _createDebugToolbarDrawer: function()
    {
        var debugToolbarDrawer = createElementWithClass("div", "scripts-debug-toolbar-drawer");

        var label = WebInspector.UIString("Pause On Caught Exceptions");
        var setting = WebInspector.settings.pauseOnCaughtException;
        debugToolbarDrawer.appendChild(WebInspector.SettingsUI.createSettingCheckbox(label, setting, true));

        return debugToolbarDrawer;
    },

    /**
     * @param {!WebInspector.StatusBarButton} button
     * @param {string} buttonTitle
     */
    _updateButtonTitle: function(button, buttonTitle)
    {
        var hasShortcuts = button._shortcuts && button._shortcuts.length;
        if (hasShortcuts)
            button.setTitle(String.vsprintf(buttonTitle, [button._shortcuts[0].name]));
        else
            button.setTitle(buttonTitle);
    },

    /**
     * @param {string} buttonId
     * @param {string} buttonTitle
     * @param {string} actionId
     * @return {!WebInspector.StatusBarButton}
     */
    _createButtonAndRegisterShortcutsForAction: function(buttonId, buttonTitle, actionId)
    {
        function handler()
        {
            WebInspector.actionRegistry.execute(actionId);
        }
        var button = new WebInspector.StatusBarButton(buttonTitle, buttonId);
        button.element.addEventListener("click", handler, false);
        button._shortcuts = WebInspector.shortcutRegistry.shortcutDescriptorsForAction(actionId);
        this._updateButtonTitle(button, buttonTitle);
        return button;
    },

    addToWatch: function(expression)
    {
        this.sidebarPanes.watchExpressions.addExpression(expression);
    },

    _installDebuggerSidebarController: function()
    {
        this.editorView.displayShowHideSidebarButton("navigator");
        this._toggleDebuggerSidebarButton = this._splitView.displayShowHideSidebarButton("debugger", "scripts-debugger-show-hide-button");
        this._sourcesView.element.appendChild(this._debugSidebarResizeWidgetElement);
    },

    _updateDebugSidebarResizeWidget: function()
    {
        this._debugSidebarResizeWidgetElement.classList.toggle("hidden", this._splitView.showMode() !== WebInspector.SplitView.ShowMode.Both);
    },

    /**
     * @param {!WebInspector.UISourceCode} uiSourceCode
     */
    _showLocalHistory: function(uiSourceCode)
    {
        WebInspector.RevisionHistoryView.showHistory(uiSourceCode);
    },

    /**
     * @override
     * @param {!Event} event
     * @param {!WebInspector.ContextMenu} contextMenu
     * @param {!Object} target
     */
    appendApplicableItems: function(event, contextMenu, target)
    {
        this._appendUISourceCodeItems(event, contextMenu, target);
        this._appendRemoteObjectItems(contextMenu, target);
        this._appendNetworkRequestItems(contextMenu, target);
    },

    _suggestReload: function()
    {
        if (window.confirm(WebInspector.UIString("It is recommended to restart inspector after making these changes. Would you like to restart it?")))
            WebInspector.reload();
    },

    /**
     * @param {!WebInspector.UISourceCode} uiSourceCode
     */
    mapFileSystemToNetwork: function(uiSourceCode)
    {
        WebInspector.SelectUISourceCodeForProjectTypesDialog.show(uiSourceCode.name(), [WebInspector.projectTypes.Network, WebInspector.projectTypes.ContentScripts], mapFileSystemToNetwork.bind(this), this._sourcesView.element);

        /**
         * @param {?WebInspector.UISourceCode} networkUISourceCode
         * @this {WebInspector.SourcesPanel}
         */
        function mapFileSystemToNetwork(networkUISourceCode)
        {
            if (!networkUISourceCode)
                return;
            this._networkMapping.addMapping(networkUISourceCode, uiSourceCode, WebInspector.fileSystemWorkspaceBinding);
            this._suggestReload();
        }
    },

    /**
     * @param {!WebInspector.UISourceCode} networkUISourceCode
     */
    mapNetworkToFileSystem: function(networkUISourceCode)
    {
        WebInspector.SelectUISourceCodeForProjectTypesDialog.show(networkUISourceCode.name(), [WebInspector.projectTypes.FileSystem], mapNetworkToFileSystem.bind(this), this._sourcesView.element);

        /**
         * @param {?WebInspector.UISourceCode} uiSourceCode
         * @this {WebInspector.SourcesPanel}
         */
        function mapNetworkToFileSystem(uiSourceCode)
        {
            if (!uiSourceCode)
                return;
            this._networkMapping.addMapping(networkUISourceCode, uiSourceCode, WebInspector.fileSystemWorkspaceBinding);
            this._suggestReload();
        }
    },

    /**
     * @param {!WebInspector.UISourceCode} uiSourceCode
     */
    _removeNetworkMapping: function(uiSourceCode)
    {
        if (confirm(WebInspector.UIString("Are you sure you want to remove network mapping?"))) {
            this._networkMapping.removeMapping(uiSourceCode);
            this._suggestReload();
        }
    },

    /**
     * @param {!WebInspector.ContextMenu} contextMenu
     * @param {!WebInspector.UISourceCode} uiSourceCode
     */
    _appendUISourceCodeMappingItems: function(contextMenu, uiSourceCode)
    {
        if (uiSourceCode.project().type() === WebInspector.projectTypes.FileSystem) {
            var hasMappings = !!this._networkMapping.networkURL(uiSourceCode);
            if (!hasMappings)
                contextMenu.appendItem(WebInspector.UIString.capitalize("Map to ^network ^resource\u2026"), this.mapFileSystemToNetwork.bind(this, uiSourceCode));
            else
                contextMenu.appendItem(WebInspector.UIString.capitalize("Remove ^network ^mapping"), this._removeNetworkMapping.bind(this, uiSourceCode));
        }

        /**
         * @param {!WebInspector.Project} project
         */
        function filterProject(project)
        {
            return project.type() === WebInspector.projectTypes.FileSystem;
        }

        if (uiSourceCode.project().type() === WebInspector.projectTypes.Network || uiSourceCode.project().type() === WebInspector.projectTypes.ContentScripts) {
            if (!this._workspace.projects().filter(filterProject).length)
                return;
            var networkURL = this._networkMapping.networkURL(uiSourceCode);
            if (this._networkMapping.uiSourceCodeForURLForAnyTarget(networkURL) === uiSourceCode)
                contextMenu.appendItem(WebInspector.UIString.capitalize("Map to ^file ^system ^resource\u2026"), this.mapNetworkToFileSystem.bind(this, uiSourceCode));
        }
    },

    /**
     * @param {!Event} event
     * @param {!WebInspector.ContextMenu} contextMenu
     * @param {!Object} target
     */
    _appendUISourceCodeItems: function(event, contextMenu, target)
    {
        if (!(target instanceof WebInspector.UISourceCode))
            return;

        var uiSourceCode = /** @type {!WebInspector.UISourceCode} */ (target);
        var projectType = uiSourceCode.project().type();
        if (projectType !== WebInspector.projectTypes.FileSystem)
            contextMenu.appendItem(WebInspector.UIString.capitalize("Local ^modifications\u2026"), this._showLocalHistory.bind(this, uiSourceCode));
        this._appendUISourceCodeMappingItems(contextMenu, uiSourceCode);

        var contentType = uiSourceCode.contentType();
        if ((contentType === WebInspector.resourceTypes.Script || contentType === WebInspector.resourceTypes.Document) && projectType !== WebInspector.projectTypes.Snippets) {
            var networkURL = this._networkMapping.networkURL(uiSourceCode);
            var url = projectType === WebInspector.projectTypes.Formatter ? uiSourceCode.originURL() : networkURL;
            this.sidebarPanes.callstack.appendBlackboxURLContextMenuItems(contextMenu, url, projectType === WebInspector.projectTypes.ContentScripts);
        }

        if (projectType !== WebInspector.projectTypes.Debugger && !event.target.isSelfOrDescendant(this._navigator.view.element)) {
            contextMenu.appendSeparator();
            contextMenu.appendItem(WebInspector.UIString.capitalize("Reveal in ^navigator"), this._handleContextMenuReveal.bind(this, uiSourceCode));
        }
    },

    /**
     * @param {!WebInspector.UISourceCode} uiSourceCode
     */
    _handleContextMenuReveal: function(uiSourceCode)
    {
        this.editorView.showBoth();
        this._revealInNavigator(uiSourceCode);
    },

    /**
     * @param {!WebInspector.ContextMenu} contextMenu
     * @param {!Object} target
     */
    _appendRemoteObjectItems: function(contextMenu, target)
    {
        if (!(target instanceof WebInspector.RemoteObject))
            return;
        var remoteObject = /** @type {!WebInspector.RemoteObject} */ (target);
        contextMenu.appendItem(WebInspector.UIString.capitalize("Store as ^global ^variable"), this._saveToTempVariable.bind(this, remoteObject));
        if (remoteObject.type === "function")
            contextMenu.appendItem(WebInspector.UIString.capitalize("Show ^function ^definition"), this._showFunctionDefinition.bind(this, remoteObject));
        if (remoteObject.subtype === "generator")
            contextMenu.appendItem(WebInspector.UIString.capitalize("Show ^generator ^location"), this._showGeneratorLocation.bind(this, remoteObject));
    },

    /**
     * @param {!WebInspector.ContextMenu} contextMenu
     * @param {!Object} target
     */
    _appendNetworkRequestItems: function(contextMenu, target)
    {
        if (!(target instanceof WebInspector.NetworkRequest))
            return;
        var request = /** @type {!WebInspector.NetworkRequest} */ (target);
        var uiSourceCode = this._networkMapping.uiSourceCodeForURLForAnyTarget(request.url);
        if (!uiSourceCode)
            return;
        var openText = WebInspector.UIString.capitalize("Open in Sources ^panel");
        contextMenu.appendItem(openText, this.showUILocation.bind(this, uiSourceCode.uiLocation(0, 0)));
    },

    /**
     * @param {!WebInspector.RemoteObject} remoteObject
     */
    _saveToTempVariable: function(remoteObject)
    {
        var currentExecutionContext = WebInspector.context.flavor(WebInspector.ExecutionContext);
        if (!currentExecutionContext)
            return;

        currentExecutionContext.globalObject("", false, false, didGetGlobalObject);
        /**
         * @param {?WebInspector.RemoteObject} global
         * @param {boolean=} wasThrown
         */
        function didGetGlobalObject(global, wasThrown)
        {
            /**
             * @suppressReceiverCheck
             * @this {Window}
             */
            function remoteFunction(value)
            {
                var prefix = "temp";
                var index = 1;
                while ((prefix + index) in this)
                    ++index;
                var name = prefix + index;
                this[name] = value;
                return name;
            }

            if (wasThrown || !global)
                failedToSave(global);
            else
                global.callFunction(remoteFunction, [WebInspector.RemoteObject.toCallArgument(remoteObject)], didSave.bind(null, global));
        }

        /**
         * @param {!WebInspector.RemoteObject} global
         * @param {?WebInspector.RemoteObject} result
         * @param {boolean=} wasThrown
         */
        function didSave(global, result, wasThrown)
        {
            global.release();
            if (wasThrown || !result || result.type !== "string")
                failedToSave(result);
            else
                WebInspector.ConsoleModel.evaluateCommandInConsole(currentExecutionContext, result.value);
        }

        /**
         * @param {?WebInspector.RemoteObject} result
         */
        function failedToSave(result)
        {
            var message = WebInspector.UIString("Failed to save to temp variable.");
            if (result) {
                message += " " + result.description;
                result.release();
            }
            WebInspector.console.error(message);
        }
    },

    /**
     * @param {!WebInspector.RemoteObject} remoteObject
     */
    _showFunctionDefinition: function(remoteObject)
    {
        var debuggerModel = remoteObject.target().debuggerModel;
        debuggerModel.functionDetails(remoteObject, this._didGetFunctionOrGeneratorObjectDetails.bind(this));
    },

    /**
     * @param {!WebInspector.RemoteObject} remoteObject
     */
    _showGeneratorLocation: function(remoteObject)
    {
        var debuggerModel = remoteObject.target().debuggerModel;
        debuggerModel.generatorObjectDetails(remoteObject, this._didGetFunctionOrGeneratorObjectDetails.bind(this));
    },

    /**
     * @param {?{location: ?WebInspector.DebuggerModel.Location}} response
     */
    _didGetFunctionOrGeneratorObjectDetails: function(response)
    {
        if (!response || !response.location)
            return;

        var location = response.location;
        if (!location)
            return;

        var uiLocation = WebInspector.debuggerWorkspaceBinding.rawLocationToUILocation(location);
        if (uiLocation)
            this.showUILocation(uiLocation);
    },

    showGoToSourceDialog: function()
    {
        this._sourcesView.showOpenResourceDialog();
    },

    _dockSideChanged: function()
    {
        var vertically = WebInspector.dockController.isVertical() && WebInspector.settings.splitVerticallyWhenDockedToRight.get();
        this._splitVertically(vertically);
    },

    /**
     * @param {boolean} vertically
     */
    _splitVertically: function(vertically)
    {
        if (this.sidebarPaneView && vertically === !this._splitView.isVertical())
            return;

        if (this.sidebarPaneView)
            this.sidebarPaneView.detach();

        this._splitView.setVertical(!vertically);
        this._splitView.element.classList.toggle("sources-split-view-vertical", vertically);

        if (!vertically)
            this._splitView.uninstallResizer(this._sourcesView.statusBarContainerElement());
        else
            this._splitView.installResizer(this._sourcesView.statusBarContainerElement());

        // Create vertical box with stack.
        var vbox = new WebInspector.VBox();
        vbox.element.appendChild(this._debugToolbarDrawer);
        vbox.element.appendChild(this._debugToolbar.element);
        vbox.setMinimumAndPreferredSizes(25, 25, WebInspector.SourcesPanel.minToolbarWidth, 100);
        var sidebarPaneStack = new WebInspector.SidebarPaneStack();
        sidebarPaneStack.element.classList.add("flex-auto");
        sidebarPaneStack.show(vbox.element);

        if (!vertically) {
            // Populate the only stack.
            for (var pane in this.sidebarPanes)
                sidebarPaneStack.addPane(this.sidebarPanes[pane]);
            this._extensionSidebarPanesContainer = sidebarPaneStack;
            this.sidebarPaneView = vbox;

            this.sidebarPanes.scopechain.expand();
            if (WebInspector.settings.watchExpressions.get().length > 0)
                this.sidebarPanes.watchExpressions.expand();
        } else {
            var splitView = new WebInspector.SplitView(true, true, "sourcesPanelDebuggerSidebarSplitViewState", 0.5);
            splitView.setMainView(vbox);

            // Populate the left stack.
            sidebarPaneStack.addPane(this.sidebarPanes.threads);
            sidebarPaneStack.addPane(this.sidebarPanes.callstack);
            sidebarPaneStack.addPane(this.sidebarPanes.jsBreakpoints);
            sidebarPaneStack.addPane(this.sidebarPanes.domBreakpoints);
            sidebarPaneStack.addPane(this.sidebarPanes.xhrBreakpoints);
            sidebarPaneStack.addPane(this.sidebarPanes.eventListenerBreakpoints);
            if (Runtime.experiments.isEnabled("stepIntoAsync"))
                sidebarPaneStack.addPane(this.sidebarPanes.asyncOperationBreakpoints);

            var tabbedPane = new WebInspector.SidebarTabbedPane();
            splitView.setSidebarView(tabbedPane);
            tabbedPane.addPane(this.sidebarPanes.scopechain);
            tabbedPane.addPane(this.sidebarPanes.watchExpressions);
            if (this.sidebarPanes.serviceWorkers)
                tabbedPane.addPane(this.sidebarPanes.serviceWorkers);
            tabbedPane.selectTab(this._lastSelectedTabSetting.get());
            tabbedPane.addEventListener(WebInspector.TabbedPane.EventTypes.TabSelected, this._tabSelected, this);
            this._extensionSidebarPanesContainer = tabbedPane;
            this.sidebarPaneView = splitView;
        }

        var extensionSidebarPanes = WebInspector.extensionServer.sidebarPanes();
        for (var i = 0; i < extensionSidebarPanes.length; ++i)
            this._addExtensionSidebarPane(extensionSidebarPanes[i]);

        this._splitView.setSidebarView(this.sidebarPaneView);
        this.sidebarPanes.threads.expand();
        this.sidebarPanes.jsBreakpoints.expand();
        this.sidebarPanes.callstack.expand();
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _tabSelected: function(event)
    {
        this._lastSelectedTabSetting.set(event.data.tabId);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _extensionSidebarPaneAdded: function(event)
    {
        var pane = /** @type {!WebInspector.ExtensionSidebarPane} */ (event.data);
        this._addExtensionSidebarPane(pane);
    },

    /**
     * @param {!WebInspector.ExtensionSidebarPane} pane
     */
    _addExtensionSidebarPane: function(pane)
    {
        if (pane.panelName() === this.name) {
            this.setHideOnDetach();
            this._extensionSidebarPanesContainer.addPane(pane);
        }
    },

    /**
     * @return {!WebInspector.SourcesView}
     */
    sourcesView: function()
    {
        return this._sourcesView;
    },

    /**
     * @param {!DataTransfer} dataTransfer
     */
    _handleDrop: function(dataTransfer)
    {
        var items = dataTransfer.items;
        if (!items.length)
            return;
        var entry = items[0].webkitGetAsEntry();
        if (!entry.isDirectory)
            return;
        InspectorFrontendHost.upgradeDraggedFileSystemPermissions(entry.filesystem);
    },

    __proto__: WebInspector.Panel.prototype
}

/**
 * @constructor
 * @implements {WebInspector.ContextMenu.Provider}
 */
WebInspector.SourcesPanel.ContextMenuProvider = function()
{
}

WebInspector.SourcesPanel.ContextMenuProvider.prototype = {
    /**
     * @override
     * @param {!Event} event
     * @param {!WebInspector.ContextMenu} contextMenu
     * @param {!Object} target
     */
    appendApplicableItems: function(event, contextMenu, target)
    {
        WebInspector.SourcesPanel.instance().appendApplicableItems(event, contextMenu, target);
    }
}

/**
 * @constructor
 * @implements {WebInspector.Revealer}
 */
WebInspector.SourcesPanel.UILocationRevealer = function()
{
}

WebInspector.SourcesPanel.UILocationRevealer.prototype = {
    /**
     * @override
     * @param {!Object} uiLocation
     * @return {!Promise}
     */
    reveal: function(uiLocation)
    {
        if (!(uiLocation instanceof WebInspector.UILocation))
            return Promise.reject(new Error("Internal error: not a ui location"));
        WebInspector.SourcesPanel.instance().showUILocation(uiLocation);
        return Promise.resolve();
    }
}

/**
 * @constructor
 * @implements {WebInspector.Revealer}
 */
WebInspector.SourcesPanel.UISourceCodeRevealer = function()
{
}

WebInspector.SourcesPanel.UISourceCodeRevealer.prototype = {
    /**
     * @override
     * @param {!Object} uiSourceCode
     * @return {!Promise}
     */
    reveal: function(uiSourceCode)
    {
        if (!(uiSourceCode instanceof WebInspector.UISourceCode))
            return Promise.reject(new Error("Internal error: not a ui source code"));
        WebInspector.SourcesPanel.instance().showUISourceCode(uiSourceCode);
        return Promise.resolve();
    }
}

/**
 * @constructor
 * @implements {WebInspector.Revealer}
 */
WebInspector.SourcesPanel.DebuggerPausedDetailsRevealer = function()
{
}

WebInspector.SourcesPanel.DebuggerPausedDetailsRevealer.prototype = {
    /**
     * @override
     * @param {!Object} object
     * @return {!Promise}
     */
    reveal: function(object)
    {
        WebInspector.inspectorView.setCurrentPanel(WebInspector.SourcesPanel.instance());
        return Promise.resolve();
    }
}

/**
 * @constructor
 * @implements {WebInspector.ActionDelegate}
 */
WebInspector.SourcesPanel.ShowGoToSourceDialogActionDelegate = function() {}

WebInspector.SourcesPanel.ShowGoToSourceDialogActionDelegate.prototype = {
    /**
     * @override
     * @return {boolean}
     */
    handleAction: function()
    {
        var panel = WebInspector.SourcesPanel.instance();
        WebInspector.inspectorView.setCurrentPanel(panel);
        panel.showGoToSourceDialog();
        return true;
    }
}

/**
 * @constructor
 * @implements {WebInspector.ActionDelegate}
 */
WebInspector.SourcesPanel.TogglePauseActionDelegate = function()
{
}

WebInspector.SourcesPanel.TogglePauseActionDelegate.prototype = {
    /**
     * @override
     * @return {boolean}
     */
    handleAction: function()
    {
        var panel = WebInspector.SourcesPanel.instance();
        WebInspector.inspectorView.setCurrentPanel(panel);
        panel.togglePause();
        return true;
    }
}

/**
 * @constructor
 * @implements {WebInspector.ActionDelegate}
 * @param {function(this:WebInspector.SourcesPanel):boolean} handler
 */
WebInspector.SourcesPanel.BaseActionDelegate = function(handler)
{
    this._handler = handler;
}

WebInspector.SourcesPanel.BaseActionDelegate.prototype = {
    /**
     * @override
     * @return {boolean}
     */
    handleAction: function()
    {
        return this._handler.call(WebInspector.SourcesPanel.instance());
    }
}

/**
 * @constructor
 * @extends {WebInspector.SourcesPanel.BaseActionDelegate}
 */
WebInspector.SourcesPanel.StepOverActionDelegate = function()
{
    WebInspector.SourcesPanel.BaseActionDelegate.call(this, WebInspector.SourcesPanel.prototype._stepOverClicked);
}

WebInspector.SourcesPanel.StepOverActionDelegate.prototype = {
    __proto__: WebInspector.SourcesPanel.BaseActionDelegate.prototype
}

/**
 * @constructor
 * @extends {WebInspector.SourcesPanel.BaseActionDelegate}
 */
WebInspector.SourcesPanel.StepIntoActionDelegate = function()
{
    WebInspector.SourcesPanel.BaseActionDelegate.call(this, WebInspector.SourcesPanel.prototype._stepIntoClicked);
}

WebInspector.SourcesPanel.StepIntoActionDelegate.prototype = {
    __proto__: WebInspector.SourcesPanel.BaseActionDelegate.prototype
}

/**
 * @constructor
 * @extends {WebInspector.SourcesPanel.BaseActionDelegate}
 */
WebInspector.SourcesPanel.StepIntoAsyncActionDelegate = function()
{
    WebInspector.SourcesPanel.BaseActionDelegate.call(this, WebInspector.SourcesPanel.prototype._stepIntoAsyncClicked);
}

WebInspector.SourcesPanel.StepIntoAsyncActionDelegate.prototype = {
    __proto__: WebInspector.SourcesPanel.BaseActionDelegate.prototype
}

/**
 * @constructor
 * @extends {WebInspector.SourcesPanel.BaseActionDelegate}
 */
WebInspector.SourcesPanel.StepOutActionDelegate = function()
{
    WebInspector.SourcesPanel.BaseActionDelegate.call(this, WebInspector.SourcesPanel.prototype._stepOutClicked);
}

WebInspector.SourcesPanel.StepOutActionDelegate.prototype = {
    __proto__: WebInspector.SourcesPanel.BaseActionDelegate.prototype
}

/**
 * @constructor
 * @extends {WebInspector.SourcesPanel.BaseActionDelegate}
 */
WebInspector.SourcesPanel.RunSnippetActionDelegate = function()
{
    WebInspector.SourcesPanel.BaseActionDelegate.call(this, WebInspector.SourcesPanel.prototype._runSnippet);
}

WebInspector.SourcesPanel.RunSnippetActionDelegate.prototype = {
    __proto__: WebInspector.SourcesPanel.BaseActionDelegate.prototype
}

WebInspector.SourcesPanel.show = function()
{
    WebInspector.inspectorView.setCurrentPanel(WebInspector.SourcesPanel.instance());
}

/**
 * @return {!WebInspector.SourcesPanel}
 */
WebInspector.SourcesPanel.instance = function()
{
    if (!WebInspector.SourcesPanel._instanceObject)
        WebInspector.SourcesPanel._instanceObject = new WebInspector.SourcesPanel();
    return WebInspector.SourcesPanel._instanceObject;
}

/**
 * @constructor
 * @implements {WebInspector.PanelFactory}
 */
WebInspector.SourcesPanelFactory = function()
{
}

WebInspector.SourcesPanelFactory.prototype = {
    /**
     * @override
     * @return {!WebInspector.Panel}
     */
    createPanel: function()
    {
        return WebInspector.SourcesPanel.instance();
    }
}
