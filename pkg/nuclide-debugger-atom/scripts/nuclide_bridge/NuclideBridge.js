'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import Emitter from './Emitter';
import Multimap from '../../lib/Multimap';
import ipc from 'ipc';
import {
  beginTimerTracking,
  endTimerTracking,
} from '../../lib/AnalyticsHelper';

const WebInspector: typeof WebInspector = window.WebInspector;
// Re-use 'watch-group' since some backends throw when they encounted an unrecognized object group.
const NUCLIDE_DEBUGGER_OBJECT_GROUP = 'watch-group';

const DebuggerSettingsChangedEvent = 'debugger-settings-updated';

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
  _settings: Object;

  constructor() {
    this._allBreakpoints = [];
    this._unresolvedBreakpoints = new Multimap();
    this._emitter = new Emitter();
    this._debuggerPausedCount = 0;
    this._suppressBreakpointNotification = false;
    this._settings = {};

    ipc.on('command', this._handleIpcCommand.bind(this));

    WebInspector.targetManager.addModelListener(
      WebInspector.DebuggerModel,
      WebInspector.DebuggerModel.Events.CallFrameSelected,
      this._handleCallFrameSelected,
      this);

    WebInspector.targetManager.addModelListener(
      WebInspector.DebuggerModel,
      WebInspector.DebuggerModel.Events.ClearInterface,
      this._handleClearInterface,
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

    (this: any)._handleSettingsUpdated = this._handleSettingsUpdated.bind(this);
    this._customizeWebInspector();
    window.runOnWindowLoad(this._handleWindowLoad.bind(this));
  }

  /**
   * Override and customize some functionalities of WebInspector.
   * Deliberately suppress any flow errors in this method.
   */
  _customizeWebInspector() {
    // $FlowFixMe.
    WebInspector.ObjectPropertyTreeElement._populate =
      function(treeElement, value, skipProto, emptyPlaceholder) {
        /**
         * @param {?Array.<!WebInspector.RemoteObjectProperty>} properties
         * @param {?Array.<!WebInspector.RemoteObjectProperty>} internalProperties
         */
        function callback(properties, internalProperties) {
          treeElement.removeChildren();
          if (!properties) {
            return;
          }
          // $FlowFixMe.
          WebInspector.ObjectPropertyTreeElement.populateWithProperties(
            treeElement,
            properties,
            internalProperties,
            skipProto,
            value,
            emptyPlaceholder
          );
        }
        // $FlowFixMe.
        WebInspector.RemoteObject.loadFromObjectPerProto(value, callback);
      };

    // $FlowFixMe.
    WebInspector.ObjectPropertiesSection.prototype.update =
      function() {
        /**
         * @param {?Array.<!WebInspector.RemoteObjectProperty>} properties
         * @param {?Array.<!WebInspector.RemoteObjectProperty>} internalProperties
         * @this {WebInspector.ObjectPropertiesSection}
         */
        function callback(properties, internalProperties) {
          if (!properties) {
            return;
          }
          this.updateProperties(properties, internalProperties);
        }
        // $FlowFixMe.
        WebInspector.RemoteObject.loadFromObject(
          this.object,
          Boolean(this.ignoreHasOwnProperty),
          callback.bind(this)
        );
      };
  }

  selectThread(threadId: string) {
    const target = WebInspector.targetManager.mainTarget();
    if (target != null) {
      target.debuggerModel.selectThread(threadId);
    }
  }

  _handleWindowLoad() {
    ipc.sendToHost('notification', 'ready');
  }

  _handleIpcCommand(command: string, ...args: any[]) {
    switch (command) {
      case 'UpdateSettings':
        this._handleSettingsUpdated(args[0]);
        break;
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
      case 'evaluateOnSelectedCallFrame':
        this._evaluateOnSelectedCallFrame(args[0]);
        break;
      case 'getProperties':
        this._getProperties(args[0]);
        break;
      case 'triggerDebuggerAction':
        this._triggerDebuggerAction(args[0]);
    }
  }

  getSettings(): Object {
    return this._settings;
  }

  _handleSettingsUpdated(settingsData: string): void {
    this._settings = JSON.parse(settingsData);
    this._emitter.emit(DebuggerSettingsChangedEvent, null);
  }

  onDebuggerSettingsChanged(callback: () => void): IDisposable {
    return this._emitter.on(DebuggerSettingsChangedEvent, callback);
  }

  _handleCallFrameSelected(event: WebInspector.Event) {
    const frame: WebInspector$CallFrame = event.data;
    const uiLocation =
      WebInspector.debuggerWorkspaceBinding.rawLocationToUILocation(frame.location());
    ipc.sendToHost('notification', 'CallFrameSelected', {
      sourceURL: uiLocation.uiSourceCode.uri(),
      lineNumber: uiLocation.lineNumber,
    });
  }

  _handleOpenSourceLocation(event: WebInspector.Event) {
    const eventData = event.data;
    this.sendOpenSourceLocation(eventData.url, eventData.lineNumber);
  }

  sendOpenSourceLocation(sourceURL: string, line: number) {
    ipc.sendToHost('notification', 'OpenSourceLocation', {
      sourceURL,
      lineNumber: line,
    });
  }

  _getProperties(objectId: string): void {
    const mainTarget = WebInspector.targetManager.mainTarget();
    if (mainTarget == null) {
      return;
    }
    const runtimeAgent = mainTarget.runtimeAgent();
    if (runtimeAgent == null) {
      return;
    }
    runtimeAgent.getProperties(
      objectId,
      false, // ownProperties
      false, // accessorPropertiesOnly
      false, // generatePreview
      (error, properties, internalProperties) => {
        ipc.sendToHost('notification', 'GetPropertiesResponse', {
          result: properties,
          error,
          objectId,
        });
      },
    );
  }

  _evaluateOnSelectedCallFrame(expression: string): void {
    const mainTarget = WebInspector.targetManager.mainTarget();
    if (mainTarget == null) {
      return;
    }
    mainTarget.debuggerModel.evaluateOnSelectedCallFrame(
      expression,
      NUCLIDE_DEBUGGER_OBJECT_GROUP,
      false, /* includeCommandLineAPI */
      true, /* doNotPauseOnExceptionsAndMuteConsole */
      false,  /* returnByValue */
      false, /* generatePreview */
      (remoteObject, wasThrown, error) => {
        ipc.sendToHost('notification', 'ExpressionEvaluationResponse', {
          result: wasThrown ? null : remoteObject,
          error: wasThrown ? error : null,
          expression,
        });
      },
    );
  }

  _triggerDebuggerAction(actionId: string): void {
    switch (actionId) {
      case 'debugger.toggle-pause':
      case 'debugger.step-over':
      case 'debugger.step-into':
      case 'debugger.step-out':
      case 'debugger.run-snippet':
        WebInspector.actionRegistry.execute(actionId);
        break;
      default:
        /* eslint-disable no-console */
        // console.error because throwing can fatal the Chrome dev tools.
        console.error('_triggerDebuggerAction: unrecognized actionId', actionId);
        /* eslint-enable no-console */
        break;
    }
  }

  _handleDebuggerPaused(event: WebInspector$Event) {
    endTimerTracking();
    ++this._debuggerPausedCount;
    if (this._debuggerPausedCount === 1) {
      ipc.sendToHost('notification', 'LoaderBreakpointHit', {});
      this._handleLoaderBreakpoint();
    } else {
      ipc.sendToHost('notification', 'NonLoaderDebuggerPaused', {});
    }
  }

  _handleLoaderBreakpoint() {
    // Sync any initial breakpoints to engine during loader breakpoint
    // and continue from it.
    this._syncBreakpoints();

    // If we were to continue synchronously here, the debugger would no longer be paused when the
    // remaining subscribers' callbacks were invoked. That's a violation of a pretty basic
    // assumption (that the debugger will be paused when your paused event callback is called) so
    // instead we wait until the next tick. If the debugger is still paused then, we continue. Not
    // doing this results in an "Runtime.getProperties failed" error in node-inspector since that
    // call is only valid during a paused state.
    process.nextTick(() => {
      const targetManager = WebInspector != null ? WebInspector.targetManager : null;
      const mainTarget = targetManager != null ? targetManager.mainTarget() : null;
      const debuggerModel = mainTarget != null ? mainTarget.debuggerModel : null;
      const stillPaused = debuggerModel != null && debuggerModel.isPaused();
      if (stillPaused) {
        this._continue();
      }
    });

    ipc.sendToHost('notification', 'LoaderBreakpointResumed', {});
  }

  _handleDebuggerResumed(event: WebInspector$Event) {
    ipc.sendToHost('notification', 'DebuggerResumed', {});
  }

  _handleClearInterface(event: WebInspector$Event) {
    ipc.sendToHost('notification', 'ClearInterface', {});
  }

  _handleBreakpointAdded(event: WebInspector$Event) {
    const location = event.data.uiLocation;
    this._sendBreakpointNotification(location, 'BreakpointAdded');
  }

  _handleBreakpointRemoved(event: WebInspector$Event) {
    const location = event.data.uiLocation;
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

  // TODO[jeffreytan]: this is a hack to enable hhvm/lldb debugger
  // setting breakpoints in non-parsed files.
  // Open issues:
  // Any breakpoints in this list will shown as bound/resolved;
  // needs to revisit the unresolved breakpoints detection logic.
  _parseBreakpointSources() {
    this._allBreakpoints.forEach(breakpoint => {
      const sourceUrl = breakpoint.sourceURL;
      if (sourceUrl.endsWith('.php') ||
          sourceUrl.endsWith('.hh') ||
          sourceUrl.endsWith('.c') ||
          sourceUrl.endsWith('.cpp') ||
          sourceUrl.endsWith('.h') ||
          sourceUrl.endsWith('.hpp') ||
          sourceUrl.endsWith('.m') ||
          sourceUrl.endsWith('.mm')) {
        const source = WebInspector.workspace.uiSourceCodeForOriginURL(sourceUrl);
        if (!source) {
          const target = WebInspector.targetManager.mainTarget();
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

      const newBreakpointSet = new Set(this._allBreakpoints.map(breakpoint =>
        formatBreakpointKey(breakpoint.sourceURL, breakpoint.lineNumber)));

      // Removing unlisted breakpoints and mark the ones that already exist.
      const unchangedBreakpointSet = new Set();
      const existingBreakpoints = WebInspector.breakpointManager.allBreakpoints();
      existingBreakpoints.forEach(existingBreakpoint => {
        const source = existingBreakpoint.uiSourceCode();
        if (source) {
          const key = formatBreakpointKey(source.uri(), existingBreakpoint.lineNumber());
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
        const key = formatBreakpointKey(breakpoint.sourceURL, breakpoint.lineNumber);
        if (!unchangedBreakpointSet.has(key)) {
          const source = WebInspector.workspace.uiSourceCodeForOriginURL(breakpoint.sourceURL);
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
    const target = WebInspector.targetManager.mainTarget();
    if (target) {
      beginTimerTracking('nuclide-debugger-atom:continue');
      target.debuggerModel.resume();
    }
  }

  _stepOver(): void {
    const target = WebInspector.targetManager.mainTarget();
    if (target) {
      beginTimerTracking('nuclide-debugger-atom:stepOver');
      target.debuggerModel.stepOver();
    }
  }

  _stepInto(): void {
    const target = WebInspector.targetManager.mainTarget();
    if (target) {
      beginTimerTracking('nuclide-debugger-atom:stepInto');
      target.debuggerModel.stepInto();
    }
  }

  _stepOut(): void {
    const target = WebInspector.targetManager.mainTarget();
    if (target) {
      beginTimerTracking('nuclide-debugger-atom:stepOut');
      target.debuggerModel.stepOut();
    }
  }

  _handleUISourceCodeAdded(event: Object) {
    const source = event.data;
    this._unresolvedBreakpoints.get(source.uri()).forEach(line => {
      WebInspector.breakpointManager.setBreakpoint(source, line, 0, '', true);
    });
    if (this._unresolvedBreakpoints.deleteAll(source.uri())) {
      this._emitter.emit('unresolved-breakpoints-changed', null);
    }
  }

  onUnresolvedBreakpointsChanged(callback: () => void): IDisposable {
    return this._emitter.on('unresolved-breakpoints-changed', callback);
  }

  getUnresolvedBreakpointsList(): {url: string; line: number}[] {
    const result = [];
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
