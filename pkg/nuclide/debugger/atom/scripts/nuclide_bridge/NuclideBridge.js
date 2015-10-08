'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var Emitter = require('./Emitter');
var Multimap = require('../../lib/Multimap');
var ipc = require('ipc');

var WebInspector: typeof WebInspector = window.WebInspector;

/**
  * Generates a string from a breakpoint that can be used in hashed
  * containers.
  */
function formatBreakpointKey(url: string, line: number): string {
  return url + ':' + line;
}

type BreakpointNotificationType = 'BreakpointAdded' | 'BreakpointRemoved';

class NuclideBridge {
  _allBreakpoints: {sourceURL: string; lineNumber: number}[];
  _unresolvedBreakpoints: Multimap<string, number>;
  _emitter: Emitter;
  _debuggerPausedCount: number;
  _suppressBreakpointNotification: boolean;

  constructor() {
    this._allBreakpoints = [];
    this._unresolvedBreakpoints = new Multimap();
    this._emitter = new Emitter();
    this._debuggerPausedCount = 0;
    this._suppressBreakpointNotification = false;

    ipc.on('command', this._handleIpcCommand.bind(this));

    WebInspector.targetManager.addModelListener(
      WebInspector.DebuggerModel,
      WebInspector.DebuggerModel.Events.CallFrameSelected,
      this._handleCallFrameSelected,
      this);

    WebInspector.targetManager.addModelListener(
      WebInspector.DebuggerModel,
      WebInspector.DebuggerModel.Events.DebuggerResumed,
      this._handleDebuggerResumed,
      this);

    WebInspector.targetManager.addModelListener(
      WebInspector.DebuggerModel,
      WebInspector.DebuggerModel.Events.DebuggerPaused,
      this._handleDebuggerPaused,
      this);

    WebInspector.workspace.addEventListener(
      WebInspector.Workspace.Events.UISourceCodeAdded,
      this._handleUISourceCodeAdded,
      this);

    WebInspector.notifications.addEventListener(
      WebInspector.UserMetrics.UserAction,
      function(event: WebInspector.Event) {
        if (event.data.action === 'openSourceLink') {
          this._handleOpenSourceLocation(event);
        }
      },
      this);

    WebInspector.breakpointManager.addEventListener(
      WebInspector.BreakpointManager.Events.BreakpointAdded,
      this._handleBreakpointAdded,
      this);

    WebInspector.breakpointManager.addEventListener(
      WebInspector.BreakpointManager.Events.BreakpointRemoved,
      this._handleBreakpointRemoved,
      this);

    window.runOnWindowLoad(this._handleWindowLoad.bind(this));
  }

  _handleWindowLoad() {
    ipc.sendToHost('notification', 'ready');
  }

  _handleIpcCommand(command: string, ...args: any[]) {
    switch (command) {
      case 'SyncBreakpoints':
        this._allBreakpoints = args[0];
        this._syncBreakpoints();
        break;
      case 'Continue':
        this._continue();
        break;
      case 'StepOver':
        this._stepOver();
        break;
      case 'StepInto':
        this._stepInto();
        break;
      case 'StepOut':
        this._stepOut();
        break;
    }
  }

  _handleCallFrameSelected(event: WebInspector.Event) {
    var frame: WebInspector$CallFrame = event.data;
    var uiLocation =
      WebInspector.debuggerWorkspaceBinding.rawLocationToUILocation(frame.location());
    ipc.sendToHost('notification', 'CallFrameSelected', {
      sourceURL: uiLocation.uiSourceCode.uri(),
      lineNumber: uiLocation.lineNumber,
    });
  }

  _handleOpenSourceLocation(event: WebInspector.Event) {
    var eventData = event.data;
    this.sendOpenSourceLocation(eventData.url, eventData.lineNumber);
  }

  sendOpenSourceLocation(sourceURL: string, line: number) {
    ipc.sendToHost('notification', 'OpenSourceLocation', {
      sourceURL: sourceURL,
      lineNumber: line,
    });
  }

  _handleDebuggerPaused(event: WebInspector$Event) {
    ++this._debuggerPausedCount;
    if (this._debuggerPausedCount === 1) {
      this._handleLoaderBreakpoint();
    }
  }

  _handleLoaderBreakpoint() {
    // Sync any initial breakpoints to engine during loader breakpoint
    // and continue from it.
    this._syncBreakpoints();
    this._continue();
  }

  _handleDebuggerResumed(event: WebInspector$Event) {
    ipc.sendToHost('notification', 'DebuggerResumed', {});
  }

  _handleBreakpointAdded(event: WebInspector$Event) {
    var location = event.data.uiLocation;
    this._sendBreakpointNotification(location, 'BreakpointAdded');
  }

  _handleBreakpointRemoved(event: WebInspector$Event) {
    var location = event.data.uiLocation;
    this._sendBreakpointNotification(location, 'BreakpointRemoved');
  }

  _sendBreakpointNotification(location: WebInspector$UILocation, type: BreakpointNotificationType) {
    if (!this._suppressBreakpointNotification) {
      ipc.sendToHost('notification', type, {
        sourceURL: location.uiSourceCode.uri(),
        lineNumber: location.lineNumber,
      });
    }
  }

  // TODO[jeffreytan]: this is a hack to enable hhvm debugger
  // setting breakpoints in non-parsed files.
  // Open issues:
  // Any breakpoints in php file will shown as bound/resolved;
  // needs to revisit the unresolved breakpoints detection logic.
  _parseBreakpointSources() {
    this._allBreakpoints.forEach(breakpoint => {
      var sourceUrl = breakpoint.sourceURL;
      // TODO[jeffreytan]: investigate if we need to do the same for LLDB or not.
      if (sourceUrl.endsWith('.php') || sourceUrl.endsWith('.hh')) {
        var source = WebInspector.workspace.uiSourceCodeForOriginURL(sourceUrl);
        if (!source) {
          var target = WebInspector.targetManager.mainTarget();
          if (target) {
            target.debuggerModel._parsedScriptSource(
              sourceUrl,
              sourceUrl,
            );
          }
        }
      }
    });
  }

  // Synchronizes nuclide BreakpointStore and BreakpointManager
  _syncBreakpoints() {
    try {
      this._suppressBreakpointNotification = true;
      this._unresolvedBreakpoints = new Multimap();

      var newBreakpointSet = new Set(this._allBreakpoints.map(breakpoint =>
        formatBreakpointKey(breakpoint.sourceURL, breakpoint.lineNumber)));

      // Removing unlisted breakpoints and mark the ones that already exist.
      var unchangedBreakpointSet = new Set();
      var existingBreakpoints = WebInspector.breakpointManager.allBreakpoints();
      existingBreakpoints.forEach(existingBreakpoint => {
        var source = existingBreakpoint.uiSourceCode();
        if (source) {
          var key = formatBreakpointKey(source.uri(), existingBreakpoint.lineNumber());
          if (newBreakpointSet.has(key)) {
            unchangedBreakpointSet.add(key);
            return;
          }
        }
        existingBreakpoint.remove(false);
      });

      this._parseBreakpointSources();

      // Add the ones that don't.
      this._allBreakpoints.forEach(breakpoint => {
        var key = formatBreakpointKey(breakpoint.sourceURL, breakpoint.lineNumber);
        if (!unchangedBreakpointSet.has(key)) {
          var source = WebInspector.workspace.uiSourceCodeForOriginURL(breakpoint.sourceURL);
          if (source) {
            WebInspector.breakpointManager.setBreakpoint(
              source,
              breakpoint.lineNumber,
              0,
              '',
              true);
          } else {
            // No API exists for adding breakpoints to source files that are not
            // yet known, store it locally and try to add them later.
            this._unresolvedBreakpoints.set(breakpoint.sourceURL, breakpoint.lineNumber);
          }
        }
      });

      this._emitter.emit('unresolved-breakpoints-changed', null);
    } finally {
      this._suppressBreakpointNotification = false;
    }
  }

  _continue(): void {
    var target = WebInspector.targetManager.mainTarget();
    if (target) {
      target.debuggerModel.resume();
    }
  }

  _stepOver(): void {
    var target = WebInspector.targetManager.mainTarget();
    if (target) {
      target.debuggerModel.stepOver();
    }
  }

  _stepInto(): void {
    var target = WebInspector.targetManager.mainTarget();
    if (target) {
      target.debuggerModel.stepInto();
    }
  }

  _stepOut(): void {
    var target = WebInspector.targetManager.mainTarget();
    if (target) {
      target.debuggerModel.stepOut();
    }
  }

  _handleUISourceCodeAdded(event: Object) {
    var source = event.data;
    this._unresolvedBreakpoints.get(source.uri()).forEach(line => {
      WebInspector.breakpointManager.setBreakpoint(source, line , 0, '', true);
    });
    if (this._unresolvedBreakpoints.deleteAll(source.uri())) {
      this._emitter.emit('unresolved-breakpoints-changed', null);
    }
  }

  onUnresolvedBreakpointsChanged(callback: () => void): atom$Disposable {
    return this._emitter.on('unresolved-breakpoints-changed', callback);
  }

  getUnresolvedBreakpointsList(): {url: string; line: number}[] {
    var result = [];
    this._unresolvedBreakpoints.forEach((line, url) => {
      result.push({url, line});
    });
    result.sort((a, b) => {
      if (a.url < b.url) {
        return -1;
      } else if (a.url > b.url) {
        return 1;
      } else {
        return a.line - b.line;
      }
    });
    return result;
  }
}

module.exports = new NuclideBridge();
