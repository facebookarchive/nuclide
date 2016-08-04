var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Emitter2;

function _Emitter() {
  return _Emitter2 = _interopRequireDefault(require('./Emitter'));
}

var _libMultimap2;

function _libMultimap() {
  return _libMultimap2 = _interopRequireDefault(require('../../lib/Multimap'));
}

var _ipc2;

function _ipc() {
  return _ipc2 = _interopRequireDefault(require('ipc'));
}

var _libAnalyticsHelper2;

function _libAnalyticsHelper() {
  return _libAnalyticsHelper2 = require('../../lib/AnalyticsHelper');
}

var _libWebInspector2;

function _libWebInspector() {
  return _libWebInspector2 = _interopRequireDefault(require('../../lib/WebInspector'));
}

var NUCLIDE_DEBUGGER_CONSOLE_OBJECT_GROUP = 'console';
var DebuggerSettingsChangedEvent = 'debugger-settings-updated';

/**
  * Generates a string from a breakpoint that can be used in hashed
  * containers.
  */
function formatBreakpointKey(url, line) {
  return url + ':' + line;
}

var NuclideBridge = (function () {
  function NuclideBridge() {
    _classCallCheck(this, NuclideBridge);

    this._allBreakpoints = [];
    this._unresolvedBreakpoints = new (_libMultimap2 || _libMultimap()).default();
    this._emitter = new (_Emitter2 || _Emitter()).default();
    this._debuggerPausedCount = 0;
    this._suppressBreakpointNotification = false;
    this._settings = {};

    (_ipc2 || _ipc()).default.on('command', this._handleIpcCommand.bind(this));

    (_libWebInspector2 || _libWebInspector()).default.targetManager.addModelListener((_libWebInspector2 || _libWebInspector()).default.DebuggerModel, (_libWebInspector2 || _libWebInspector()).default.DebuggerModel.Events.CallFrameSelected, this._handleCallFrameSelected, this);

    (_libWebInspector2 || _libWebInspector()).default.targetManager.addModelListener((_libWebInspector2 || _libWebInspector()).default.DebuggerModel, (_libWebInspector2 || _libWebInspector()).default.DebuggerModel.Events.ClearInterface, this._handleClearInterface, this);

    (_libWebInspector2 || _libWebInspector()).default.targetManager.addModelListener((_libWebInspector2 || _libWebInspector()).default.DebuggerModel, (_libWebInspector2 || _libWebInspector()).default.DebuggerModel.Events.DebuggerResumed, this._handleDebuggerResumed, this);

    (_libWebInspector2 || _libWebInspector()).default.targetManager.addModelListener((_libWebInspector2 || _libWebInspector()).default.DebuggerModel, (_libWebInspector2 || _libWebInspector()).default.DebuggerModel.Events.DebuggerPaused, this._handleDebuggerPaused, this);

    (_libWebInspector2 || _libWebInspector()).default.targetManager.addModelListener((_libWebInspector2 || _libWebInspector()).default.DebuggerModel, (_libWebInspector2 || _libWebInspector()).default.DebuggerModel.Events.ThreadsUpdateIPC, this._handleThreadsUpdated, this);

    (_libWebInspector2 || _libWebInspector()).default.targetManager.addModelListener((_libWebInspector2 || _libWebInspector()).default.DebuggerModel, (_libWebInspector2 || _libWebInspector()).default.DebuggerModel.Events.StopThreadSwitched, this._handleStopThreadSwitched, this);

    (_libWebInspector2 || _libWebInspector()).default.workspace.addEventListener((_libWebInspector2 || _libWebInspector()).default.Workspace.Events.UISourceCodeAdded, this._handleUISourceCodeAdded, this);

    (_libWebInspector2 || _libWebInspector()).default.notifications.addEventListener((_libWebInspector2 || _libWebInspector()).default.UserMetrics.UserAction, function (event) {
      if (event.data.action === 'openSourceLink') {
        this._handleOpenSourceLocation(event);
      }
    }, this);

    (_libWebInspector2 || _libWebInspector()).default.breakpointManager.addEventListener((_libWebInspector2 || _libWebInspector()).default.BreakpointManager.Events.BreakpointAdded, this._handleBreakpointAdded, this);

    (_libWebInspector2 || _libWebInspector()).default.breakpointManager.addEventListener((_libWebInspector2 || _libWebInspector()).default.BreakpointManager.Events.BreakpointRemoved, this._handleBreakpointRemoved, this);

    this._handleSettingsUpdated = this._handleSettingsUpdated.bind(this);
    this._customizeWebInspector();
    window.runOnWindowLoad(this._handleWindowLoad.bind(this));
  }

  /**
   * Override and customize some functionalities of WebInspector.
   * Deliberately suppress any flow errors in this method.
   */

  _createClass(NuclideBridge, [{
    key: '_customizeWebInspector',
    value: function _customizeWebInspector() {
      // $FlowFixMe.
      (_libWebInspector2 || _libWebInspector()).default.ObjectPropertyTreeElement._populate = function (treeElement, value, skipProto, emptyPlaceholder) {
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
          (_libWebInspector2 || _libWebInspector()).default.ObjectPropertyTreeElement.populateWithProperties(treeElement, properties, internalProperties, skipProto, value, emptyPlaceholder);
        }
        // $FlowFixMe.
        (_libWebInspector2 || _libWebInspector()).default.RemoteObject.loadFromObjectPerProto(value, callback);
      };

      // $FlowFixMe.
      (_libWebInspector2 || _libWebInspector()).default.ObjectPropertiesSection.prototype.update = function () {
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
          var neededProperties = properties.map(function (_ref) {
            var name = _ref.name;
            var value = _ref.value;
            var type = value.type;
            var subtype = value.subtype;
            var objectId = value.objectId;
            var innerValue = value.value;
            var description = value.description;

            return {
              name: name,
              value: {
                type: type,
                subtype: subtype,
                objectId: objectId,
                value: innerValue,
                description: description
              }
            };
          });
          (_ipc2 || _ipc()).default.sendToHost('notification', 'LocalsUpdate', neededProperties);
        }
        // $FlowFixMe.
        (_libWebInspector2 || _libWebInspector()).default.RemoteObject.loadFromObject(this.object, Boolean(this.ignoreHasOwnProperty), callback.bind(this));
      };
    }
  }, {
    key: 'selectThread',
    value: function selectThread(threadId) {
      var target = (_libWebInspector2 || _libWebInspector()).default.targetManager.mainTarget();
      if (target != null) {
        target.debuggerModel.selectThread(threadId);
      }
    }
  }, {
    key: '_handleWindowLoad',
    value: function _handleWindowLoad() {
      (_ipc2 || _ipc()).default.sendToHost('notification', 'ready');
    }
  }, {
    key: '_handleIpcCommand',
    value: function _handleIpcCommand(command) {
      switch (command) {
        case 'UpdateSettings':
          this._handleSettingsUpdated(arguments[1]);
          break;
        case 'SyncBreakpoints':
          this._allBreakpoints = arguments[1];
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
          this._evaluateOnSelectedCallFrame(arguments[1], arguments[2]);
          break;
        case 'runtimeEvaluate':
          this._runtimeEvaluate(arguments[1]);
          break;
        case 'getProperties':
          this._getProperties(arguments[1]);
          break;
        case 'triggerDebuggerAction':
          this._triggerDebuggerAction(arguments[1]);
          break;
        case 'setPauseOnException':
          this._setPauseOnException(arguments[1]);
          break;
        case 'setPauseOnCaughtException':
          this._setPauseOnCaughtException(arguments[1]);
          break;
        case 'selectThread':
          this.selectThread(arguments[1]);
          break;
      }
    }
  }, {
    key: 'getSettings',
    value: function getSettings() {
      return this._settings;
    }
  }, {
    key: '_handleSettingsUpdated',
    value: function _handleSettingsUpdated(settingsData) {
      this._settings = JSON.parse(settingsData);
      this._emitter.emit(DebuggerSettingsChangedEvent, null);
    }
  }, {
    key: 'onDebuggerSettingsChanged',
    value: function onDebuggerSettingsChanged(callback) {
      return this._emitter.on(DebuggerSettingsChangedEvent, callback);
    }
  }, {
    key: '_handleCallFrameSelected',
    value: function _handleCallFrameSelected(event) {
      // TODO(jonaldislarry): Extend chrome protocol as per t12187369.
      if (this._debuggerPausedCount <= 1) {
        return;
      }
      var frame = event.data;
      var uiLocation = (_libWebInspector2 || _libWebInspector()).default.debuggerWorkspaceBinding.rawLocationToUILocation(frame.location());
      (_ipc2 || _ipc()).default.sendToHost('notification', 'CallFrameSelected', {
        sourceURL: uiLocation.uiSourceCode.uri(),
        lineNumber: uiLocation.lineNumber
      });
    }
  }, {
    key: '_handleOpenSourceLocation',
    value: function _handleOpenSourceLocation(event) {
      // TODO(jonaldislarry): Extend chrome protocol as per t12187369.
      if (this._debuggerPausedCount <= 1) {
        return;
      }
      var eventData = event.data;
      this.sendOpenSourceLocation(eventData.url, eventData.lineNumber);
    }
  }, {
    key: 'sendOpenSourceLocation',
    value: function sendOpenSourceLocation(sourceURL, line) {
      (_ipc2 || _ipc()).default.sendToHost('notification', 'OpenSourceLocation', {
        sourceURL: sourceURL,
        lineNumber: line
      });
    }
  }, {
    key: '_sendCallstack',
    value: function _sendCallstack() {
      var target = (_libWebInspector2 || _libWebInspector()).default.targetManager.mainTarget();
      if (target == null) {
        return;
      }
      var model = target.debuggerModel;
      if (model == null) {
        return;
      }
      var callFrames = model.callFrames;
      if (callFrames == null) {
        return;
      }
      var callstack = callFrames.map(function (callFrame) {
        var location = callFrame.location();
        /* names anonymous functions "(anonymous function)" */
        var functionName = (_libWebInspector2 || _libWebInspector()).default.beautifyFunctionName(callFrame.functionName);
        return {
          name: functionName,
          location: {
            path: callFrame.script.sourceURL,
            column: location.columnNumber,
            line: location.lineNumber
          }
        };
      });
      (_ipc2 || _ipc()).default.sendToHost('notification', 'CallstackUpdate', callstack);
    }
  }, {
    key: '_getProperties',
    value: function _getProperties(objectId) {
      var mainTarget = (_libWebInspector2 || _libWebInspector()).default.targetManager.mainTarget();
      if (mainTarget == null) {
        return;
      }
      var runtimeAgent = mainTarget.runtimeAgent();
      if (runtimeAgent == null) {
        return;
      }
      runtimeAgent.getProperties(objectId, false, // ownProperties
      false, // accessorPropertiesOnly
      false, // generatePreview
      function (error, properties, internalProperties) {
        (_ipc2 || _ipc()).default.sendToHost('notification', 'GetPropertiesResponse', {
          result: properties,
          error: error,
          objectId: objectId
        });
      });
    }
  }, {
    key: '_evaluateOnSelectedCallFrame',
    value: function _evaluateOnSelectedCallFrame(expression, objectGroup) {
      var mainTarget = (_libWebInspector2 || _libWebInspector()).default.targetManager.mainTarget();
      if (mainTarget == null) {
        return;
      }
      mainTarget.debuggerModel.evaluateOnSelectedCallFrame(expression, objectGroup, false, /* includeCommandLineAPI */
      true, /* doNotPauseOnExceptionsAndMuteConsole */
      false, /* returnByValue */
      false, /* generatePreview */
      function (remoteObject, wasThrown, error) {
        (_ipc2 || _ipc()).default.sendToHost('notification', 'ExpressionEvaluationResponse', {
          result: wasThrown ? null : remoteObject,
          error: wasThrown ? error : null,
          expression: expression
        });
      });
    }
  }, {
    key: '_runtimeEvaluate',
    value: function _runtimeEvaluate(expression) {
      var mainTarget = (_libWebInspector2 || _libWebInspector()).default.targetManager.mainTarget();
      if (mainTarget == null) {
        return;
      }
      var executionContexts = mainTarget.runtimeModel.executionContexts();
      if (executionContexts.length === 0) {
        return;
      }
      var firstContext = executionContexts[0];
      firstContext.evaluate(expression, NUCLIDE_DEBUGGER_CONSOLE_OBJECT_GROUP, false, /* includeCommandLineAPI */
      true, /* doNotPauseOnExceptionsAndMuteConsole */
      false, /* returnByValue */
      false, /* generatePreview */
      function (remoteObject, wasThrown, error) {
        (_ipc2 || _ipc()).default.sendToHost('notification', 'ExpressionEvaluationResponse', {
          result: wasThrown ? null : remoteObject,
          error: wasThrown ? error : null,
          expression: expression
        });
      });
    }
  }, {
    key: '_setPauseOnException',
    value: function _setPauseOnException(pauseOnExceptionEnabled) {
      (_libWebInspector2 || _libWebInspector()).default.settings.pauseOnExceptionEnabled.set(pauseOnExceptionEnabled);
    }
  }, {
    key: '_setPauseOnCaughtException',
    value: function _setPauseOnCaughtException(pauseOnCaughtExceptionEnabled) {
      (_libWebInspector2 || _libWebInspector()).default.settings.pauseOnCaughtException.set(pauseOnCaughtExceptionEnabled);
    }
  }, {
    key: '_triggerDebuggerAction',
    value: function _triggerDebuggerAction(actionId) {
      switch (actionId) {
        case 'debugger.toggle-pause':
        case 'debugger.step-over':
        case 'debugger.step-into':
        case 'debugger.step-out':
        case 'debugger.run-snippet':
          (_libWebInspector2 || _libWebInspector()).default.actionRegistry.execute(actionId);
          break;
        default:
          // console.error because throwing can fatal the Chrome dev tools.
          // eslint-disable-next-line no-console
          console.error('_triggerDebuggerAction: unrecognized actionId', actionId);
          break;
      }
    }
  }, {
    key: '_handleDebuggerPaused',
    value: function _handleDebuggerPaused(event) {
      (0, (_libAnalyticsHelper2 || _libAnalyticsHelper()).endTimerTracking)();
      ++this._debuggerPausedCount;
      if (this._debuggerPausedCount === 1) {
        (_ipc2 || _ipc()).default.sendToHost('notification', 'LoaderBreakpointHit', {});
        this._handleLoaderBreakpoint();
      } else {
        (_ipc2 || _ipc()).default.sendToHost('notification', 'NonLoaderDebuggerPaused', {});
      }
      this._sendCallstack();
    }
  }, {
    key: '_handleLoaderBreakpoint',
    value: function _handleLoaderBreakpoint() {
      var _this = this;

      // Sync any initial breakpoints to engine during loader breakpoint
      // and continue from it.
      this._syncBreakpoints();

      // If we were to continue synchronously here, the debugger would no longer be paused when the
      // remaining subscribers' callbacks were invoked. That's a violation of a pretty basic
      // assumption (that the debugger will be paused when your paused event callback is called) so
      // instead we wait until the next tick. If the debugger is still paused then, we continue. Not
      // doing this results in an "Runtime.getProperties failed" error in node-inspector since that
      // call is only valid during a paused state.
      process.nextTick(function () {
        var targetManager = (_libWebInspector2 || _libWebInspector()).default != null ? (_libWebInspector2 || _libWebInspector()).default.targetManager : null;
        var mainTarget = targetManager != null ? targetManager.mainTarget() : null;
        var debuggerModel = mainTarget != null ? mainTarget.debuggerModel : null;
        var stillPaused = debuggerModel != null && debuggerModel.isPaused();
        if (stillPaused) {
          _this._continue();
        }
      });

      (_ipc2 || _ipc()).default.sendToHost('notification', 'LoaderBreakpointResumed', {});
    }
  }, {
    key: '_handleDebuggerResumed',
    value: function _handleDebuggerResumed(event) {
      (_ipc2 || _ipc()).default.sendToHost('notification', 'DebuggerResumed', {});
    }
  }, {
    key: '_handleClearInterface',
    value: function _handleClearInterface(event) {
      (_ipc2 || _ipc()).default.sendToHost('notification', 'ClearInterface', {});
    }
  }, {
    key: '_handleBreakpointAdded',
    value: function _handleBreakpointAdded(event) {
      var location = event.data.uiLocation;
      this._sendBreakpointNotification(location, 'BreakpointAdded');
    }
  }, {
    key: '_handleBreakpointRemoved',
    value: function _handleBreakpointRemoved(event) {
      var location = event.data.uiLocation;
      this._sendBreakpointNotification(location, 'BreakpointRemoved');
    }
  }, {
    key: '_sendBreakpointNotification',
    value: function _sendBreakpointNotification(location, type) {
      if (!this._suppressBreakpointNotification) {
        (_ipc2 || _ipc()).default.sendToHost('notification', type, {
          sourceURL: location.uiSourceCode.uri(),
          lineNumber: location.lineNumber
        });
      }
    }

    // TODO[jeffreytan]: this is a hack to enable hhvm/lldb debugger
    // setting breakpoints in non-parsed files.
    // Open issues:
    // Any breakpoints in this list will shown as bound/resolved;
    // needs to revisit the unresolved breakpoints detection logic.
  }, {
    key: '_parseBreakpointSources',
    value: function _parseBreakpointSources() {
      this._allBreakpoints.forEach(function (breakpoint) {
        var sourceUrl = breakpoint.sourceURL;
        if (sourceUrl.endsWith('.php') || sourceUrl.endsWith('.hh') || sourceUrl.endsWith('.c') || sourceUrl.endsWith('.cpp') || sourceUrl.endsWith('.h') || sourceUrl.endsWith('.hpp') || sourceUrl.endsWith('.m') || sourceUrl.endsWith('.mm')) {
          var source = (_libWebInspector2 || _libWebInspector()).default.workspace.uiSourceCodeForOriginURL(sourceUrl);
          if (!source) {
            var target = (_libWebInspector2 || _libWebInspector()).default.targetManager.mainTarget();
            if (target) {
              target.debuggerModel._parsedScriptSource(sourceUrl, sourceUrl);
            }
          }
        }
      });
    }

    // Synchronizes nuclide BreakpointStore and BreakpointManager
  }, {
    key: '_syncBreakpoints',
    value: function _syncBreakpoints() {
      var _this2 = this;

      try {
        (function () {
          _this2._suppressBreakpointNotification = true;
          _this2._unresolvedBreakpoints = new (_libMultimap2 || _libMultimap()).default();

          var newBreakpointSet = new Set(_this2._allBreakpoints.map(function (breakpoint) {
            return formatBreakpointKey(breakpoint.sourceURL, breakpoint.lineNumber);
          }));

          // Removing unlisted breakpoints and mark the ones that already exist.
          var unchangedBreakpointSet = new Set();
          var existingBreakpoints = (_libWebInspector2 || _libWebInspector()).default.breakpointManager.allBreakpoints();
          existingBreakpoints.forEach(function (existingBreakpoint) {
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

          _this2._parseBreakpointSources();

          // Add the ones that don't.
          _this2._allBreakpoints.forEach(function (breakpoint) {
            var key = formatBreakpointKey(breakpoint.sourceURL, breakpoint.lineNumber);
            if (!unchangedBreakpointSet.has(key)) {
              var source = (_libWebInspector2 || _libWebInspector()).default.workspace.uiSourceCodeForOriginURL(breakpoint.sourceURL);
              if (source) {
                (_libWebInspector2 || _libWebInspector()).default.breakpointManager.setBreakpoint(source, breakpoint.lineNumber, 0, '', true);
              } else {
                // No API exists for adding breakpoints to source files that are not
                // yet known, store it locally and try to add them later.
                _this2._unresolvedBreakpoints.set(breakpoint.sourceURL, breakpoint.lineNumber);
              }
            }
          });

          _this2._emitter.emit('unresolved-breakpoints-changed', null);
        })();
      } finally {
        this._suppressBreakpointNotification = false;
      }
    }
  }, {
    key: '_continue',
    value: function _continue() {
      var target = (_libWebInspector2 || _libWebInspector()).default.targetManager.mainTarget();
      if (target) {
        (0, (_libAnalyticsHelper2 || _libAnalyticsHelper()).beginTimerTracking)('nuclide-debugger-atom:continue');
        target.debuggerModel.resume();
      }
    }
  }, {
    key: '_stepOver',
    value: function _stepOver() {
      var target = (_libWebInspector2 || _libWebInspector()).default.targetManager.mainTarget();
      if (target) {
        (0, (_libAnalyticsHelper2 || _libAnalyticsHelper()).beginTimerTracking)('nuclide-debugger-atom:stepOver');
        target.debuggerModel.stepOver();
      }
    }
  }, {
    key: '_stepInto',
    value: function _stepInto() {
      var target = (_libWebInspector2 || _libWebInspector()).default.targetManager.mainTarget();
      if (target) {
        (0, (_libAnalyticsHelper2 || _libAnalyticsHelper()).beginTimerTracking)('nuclide-debugger-atom:stepInto');
        target.debuggerModel.stepInto();
      }
    }
  }, {
    key: '_stepOut',
    value: function _stepOut() {
      var target = (_libWebInspector2 || _libWebInspector()).default.targetManager.mainTarget();
      if (target) {
        (0, (_libAnalyticsHelper2 || _libAnalyticsHelper()).beginTimerTracking)('nuclide-debugger-atom:stepOut');
        target.debuggerModel.stepOut();
      }
    }
  }, {
    key: '_handleUISourceCodeAdded',
    value: function _handleUISourceCodeAdded(event) {
      var source = event.data;
      this._unresolvedBreakpoints.get(source.uri()).forEach(function (line) {
        (_libWebInspector2 || _libWebInspector()).default.breakpointManager.setBreakpoint(source, line, 0, '', true);
      });
      if (this._unresolvedBreakpoints.deleteAll(source.uri())) {
        this._emitter.emit('unresolved-breakpoints-changed', null);
      }
    }
  }, {
    key: 'onUnresolvedBreakpointsChanged',
    value: function onUnresolvedBreakpointsChanged(callback) {
      return this._emitter.on('unresolved-breakpoints-changed', callback);
    }
  }, {
    key: 'getUnresolvedBreakpointsList',
    value: function getUnresolvedBreakpointsList() {
      var result = [];
      this._unresolvedBreakpoints.forEach(function (line, url) {
        result.push({ url: url, line: line });
      });
      result.sort(function (a, b) {
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
  }, {
    key: '_handleThreadsUpdated',
    value: function _handleThreadsUpdated(event) {
      (_ipc2 || _ipc()).default.sendToHost('notification', 'ThreadsUpdate', event.data);
    }
  }, {
    key: '_handleStopThreadSwitched',
    value: function _handleStopThreadSwitched(event) {
      if (this._debuggerPausedCount <= 1) {
        return;
      }
      var uiLocation = (_libWebInspector2 || _libWebInspector()).default.debuggerWorkspaceBinding.rawLocationToUILocation(event.data.location);
      (_ipc2 || _ipc()).default.sendToHost('notification', 'StopThreadSwitch', {
        sourceURL: uiLocation.uiSourceCode.uri(),
        lineNumber: uiLocation.lineNumber,
        message: event.data.message
      });
    }
  }]);

  return NuclideBridge;
})();

module.exports = new NuclideBridge();