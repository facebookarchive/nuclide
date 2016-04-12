var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _libAnalyticsHelper = require('../../lib/AnalyticsHelper');

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

var WebInspector = window.WebInspector;
// Re-use 'watch-group' since some backends throw when they encounted an unrecognized object group.
var NUCLIDE_DEBUGGER_OBJECT_GROUP = 'watch-group';

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
    this._unresolvedBreakpoints = new Multimap();
    this._emitter = new Emitter();
    this._debuggerPausedCount = 0;
    this._suppressBreakpointNotification = false;

    ipc.on('command', this._handleIpcCommand.bind(this));

    WebInspector.targetManager.addModelListener(WebInspector.DebuggerModel, WebInspector.DebuggerModel.Events.CallFrameSelected, this._handleCallFrameSelected, this);

    WebInspector.targetManager.addModelListener(WebInspector.DebuggerModel, WebInspector.DebuggerModel.Events.ClearInterface, this._handleClearInterface, this);

    WebInspector.targetManager.addModelListener(WebInspector.DebuggerModel, WebInspector.DebuggerModel.Events.DebuggerResumed, this._handleDebuggerResumed, this);

    WebInspector.targetManager.addModelListener(WebInspector.DebuggerModel, WebInspector.DebuggerModel.Events.DebuggerPaused, this._handleDebuggerPaused, this);

    WebInspector.workspace.addEventListener(WebInspector.Workspace.Events.UISourceCodeAdded, this._handleUISourceCodeAdded, this);

    WebInspector.notifications.addEventListener(WebInspector.UserMetrics.UserAction, function (event) {
      if (event.data.action === 'openSourceLink') {
        this._handleOpenSourceLocation(event);
      }
    }, this);

    WebInspector.breakpointManager.addEventListener(WebInspector.BreakpointManager.Events.BreakpointAdded, this._handleBreakpointAdded, this);

    WebInspector.breakpointManager.addEventListener(WebInspector.BreakpointManager.Events.BreakpointRemoved, this._handleBreakpointRemoved, this);

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
      WebInspector.ObjectPropertyTreeElement._populate = function (treeElement, value, skipProto, emptyPlaceholder) {
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
          WebInspector.ObjectPropertyTreeElement.populateWithProperties(treeElement, properties, internalProperties, skipProto, value, emptyPlaceholder);
        }
        // $FlowFixMe.
        WebInspector.RemoteObject.loadFromObjectPerProto(value, callback);
      };

      // $FlowFixMe.
      WebInspector.ObjectPropertiesSection.prototype.update = function () {
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
        WebInspector.RemoteObject.loadFromObject(this.object, !!this.ignoreHasOwnProperty, callback.bind(this));
      };
    }
  }, {
    key: '_handleWindowLoad',
    value: function _handleWindowLoad() {
      ipc.sendToHost('notification', 'ready');
    }
  }, {
    key: '_handleIpcCommand',
    value: function _handleIpcCommand(command) {
      switch (command) {
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
          this._evaluateOnSelectedCallFrame(arguments[1]);
          break;
      }
    }
  }, {
    key: '_handleCallFrameSelected',
    value: function _handleCallFrameSelected(event) {
      var frame = event.data;
      var uiLocation = WebInspector.debuggerWorkspaceBinding.rawLocationToUILocation(frame.location());
      ipc.sendToHost('notification', 'CallFrameSelected', {
        sourceURL: uiLocation.uiSourceCode.uri(),
        lineNumber: uiLocation.lineNumber
      });
    }
  }, {
    key: '_handleOpenSourceLocation',
    value: function _handleOpenSourceLocation(event) {
      var eventData = event.data;
      this.sendOpenSourceLocation(eventData.url, eventData.lineNumber);
    }
  }, {
    key: 'sendOpenSourceLocation',
    value: function sendOpenSourceLocation(sourceURL, line) {
      ipc.sendToHost('notification', 'OpenSourceLocation', {
        sourceURL: sourceURL,
        lineNumber: line
      });
    }
  }, {
    key: '_evaluateOnSelectedCallFrame',
    value: function _evaluateOnSelectedCallFrame(expression) {
      var mainTarget = WebInspector.targetManager.mainTarget();
      if (mainTarget == null) {
        return;
      }
      mainTarget.debuggerModel.evaluateOnSelectedCallFrame(expression, NUCLIDE_DEBUGGER_OBJECT_GROUP, false, /* includeCommandLineAPI */
      true, /* doNotPauseOnExceptionsAndMuteConsole */
      false, /* returnByValue */
      false, /* generatePreview */
      function (remoteObject, wasThrown, error) {
        ipc.sendToHost('notification', 'ExpressionEvaluationResponse', {
          result: wasThrown ? null : remoteObject,
          error: wasThrown ? error : null,
          expression: expression
        });
      });
    }
  }, {
    key: '_handleDebuggerPaused',
    value: function _handleDebuggerPaused(event) {
      (0, _libAnalyticsHelper.endTimerTracking)();
      ipc.sendToHost('notification', 'DebuggerPaused', {});
      ++this._debuggerPausedCount;
      if (this._debuggerPausedCount === 1) {
        this._handleLoaderBreakpoint();
      }
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
        var targetManager = WebInspector != null ? WebInspector.targetManager : null;
        var mainTarget = targetManager != null ? targetManager.mainTarget() : null;
        var debuggerModel = mainTarget != null ? mainTarget.debuggerModel : null;
        var stillPaused = debuggerModel != null && debuggerModel.isPaused();
        if (stillPaused) {
          _this._continue();
        }
      });
    }
  }, {
    key: '_handleDebuggerResumed',
    value: function _handleDebuggerResumed(event) {
      ipc.sendToHost('notification', 'DebuggerResumed', {});
    }
  }, {
    key: '_handleClearInterface',
    value: function _handleClearInterface(event) {
      ipc.sendToHost('notification', 'ClearInterface', {});
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
        ipc.sendToHost('notification', type, {
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
          var source = WebInspector.workspace.uiSourceCodeForOriginURL(sourceUrl);
          if (!source) {
            var target = WebInspector.targetManager.mainTarget();
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
          _this2._unresolvedBreakpoints = new Multimap();

          var newBreakpointSet = new Set(_this2._allBreakpoints.map(function (breakpoint) {
            return formatBreakpointKey(breakpoint.sourceURL, breakpoint.lineNumber);
          }));

          // Removing unlisted breakpoints and mark the ones that already exist.
          var unchangedBreakpointSet = new Set();
          var existingBreakpoints = WebInspector.breakpointManager.allBreakpoints();
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
              var source = WebInspector.workspace.uiSourceCodeForOriginURL(breakpoint.sourceURL);
              if (source) {
                WebInspector.breakpointManager.setBreakpoint(source, breakpoint.lineNumber, 0, '', true);
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
      var target = WebInspector.targetManager.mainTarget();
      if (target) {
        (0, _libAnalyticsHelper.beginTimerTracking)('nuclide-debugger-atom:continue');
        target.debuggerModel.resume();
      }
    }
  }, {
    key: '_stepOver',
    value: function _stepOver() {
      var target = WebInspector.targetManager.mainTarget();
      if (target) {
        (0, _libAnalyticsHelper.beginTimerTracking)('nuclide-debugger-atom:stepOver');
        target.debuggerModel.stepOver();
      }
    }
  }, {
    key: '_stepInto',
    value: function _stepInto() {
      var target = WebInspector.targetManager.mainTarget();
      if (target) {
        (0, _libAnalyticsHelper.beginTimerTracking)('nuclide-debugger-atom:stepInto');
        target.debuggerModel.stepInto();
      }
    }
  }, {
    key: '_stepOut',
    value: function _stepOut() {
      var target = WebInspector.targetManager.mainTarget();
      if (target) {
        (0, _libAnalyticsHelper.beginTimerTracking)('nuclide-debugger-atom:stepOut');
        target.debuggerModel.stepOut();
      }
    }
  }, {
    key: '_handleUISourceCodeAdded',
    value: function _handleUISourceCodeAdded(event) {
      var source = event.data;
      this._unresolvedBreakpoints.get(source.uri()).forEach(function (line) {
        WebInspector.breakpointManager.setBreakpoint(source, line, 0, '', true);
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
  }]);

  return NuclideBridge;
})();

module.exports = new NuclideBridge();
//# sourceMappingURL=data:application/json;base64,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LENBQUMsZ0NBQWdDLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDckU7OztXQUUyQix3Q0FBa0M7QUFDNUQsVUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFLO0FBQ2pELGNBQU0sQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUgsR0FBRyxFQUFFLElBQUksRUFBSixJQUFJLEVBQUMsQ0FBQyxDQUFDO09BQzFCLENBQUMsQ0FBQztBQUNILFlBQU0sQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFLO0FBQ3BCLFlBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFO0FBQ2pCLGlCQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ1gsTUFBTSxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRTtBQUN4QixpQkFBTyxDQUFDLENBQUM7U0FDVixNQUFNO0FBQ0wsaUJBQU8sQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1NBQ3hCO09BQ0YsQ0FBQyxDQUFDO0FBQ0gsYUFBTyxNQUFNLENBQUM7S0FDZjs7O1NBM1lHLGFBQWE7OztBQThZbkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDIiwiZmlsZSI6Ik51Y2xpZGVCcmlkZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBFbWl0dGVyID0gcmVxdWlyZSgnLi9FbWl0dGVyJyk7XG5jb25zdCBNdWx0aW1hcCA9IHJlcXVpcmUoJy4uLy4uL2xpYi9NdWx0aW1hcCcpO1xuY29uc3QgaXBjID0gcmVxdWlyZSgnaXBjJyk7XG5pbXBvcnQge2JlZ2luVGltZXJUcmFja2luZywgZW5kVGltZXJUcmFja2luZ30gZnJvbSAnLi4vLi4vbGliL0FuYWx5dGljc0hlbHBlcic7XG5cbmNvbnN0IFdlYkluc3BlY3RvcjogdHlwZW9mIFdlYkluc3BlY3RvciA9IHdpbmRvdy5XZWJJbnNwZWN0b3I7XG4vLyBSZS11c2UgJ3dhdGNoLWdyb3VwJyBzaW5jZSBzb21lIGJhY2tlbmRzIHRocm93IHdoZW4gdGhleSBlbmNvdW50ZWQgYW4gdW5yZWNvZ25pemVkIG9iamVjdCBncm91cC5cbmNvbnN0IE5VQ0xJREVfREVCVUdHRVJfT0JKRUNUX0dST1VQID0gJ3dhdGNoLWdyb3VwJztcblxuLyoqXG4gICogR2VuZXJhdGVzIGEgc3RyaW5nIGZyb20gYSBicmVha3BvaW50IHRoYXQgY2FuIGJlIHVzZWQgaW4gaGFzaGVkXG4gICogY29udGFpbmVycy5cbiAgKi9cbmZ1bmN0aW9uIGZvcm1hdEJyZWFrcG9pbnRLZXkodXJsOiBzdHJpbmcsIGxpbmU6IG51bWJlcik6IHN0cmluZyB7XG4gIHJldHVybiB1cmwgKyAnOicgKyBsaW5lO1xufVxuXG50eXBlIEJyZWFrcG9pbnROb3RpZmljYXRpb25UeXBlID0gJ0JyZWFrcG9pbnRBZGRlZCcgfCAnQnJlYWtwb2ludFJlbW92ZWQnO1xuXG5jbGFzcyBOdWNsaWRlQnJpZGdlIHtcbiAgX2FsbEJyZWFrcG9pbnRzOiB7c291cmNlVVJMOiBzdHJpbmc7IGxpbmVOdW1iZXI6IG51bWJlcn1bXTtcbiAgX3VucmVzb2x2ZWRCcmVha3BvaW50czogTXVsdGltYXA8c3RyaW5nLCBudW1iZXI+O1xuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX2RlYnVnZ2VyUGF1c2VkQ291bnQ6IG51bWJlcjtcbiAgX3N1cHByZXNzQnJlYWtwb2ludE5vdGlmaWNhdGlvbjogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9hbGxCcmVha3BvaW50cyA9IFtdO1xuICAgIHRoaXMuX3VucmVzb2x2ZWRCcmVha3BvaW50cyA9IG5ldyBNdWx0aW1hcCgpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX2RlYnVnZ2VyUGF1c2VkQ291bnQgPSAwO1xuICAgIHRoaXMuX3N1cHByZXNzQnJlYWtwb2ludE5vdGlmaWNhdGlvbiA9IGZhbHNlO1xuXG4gICAgaXBjLm9uKCdjb21tYW5kJywgdGhpcy5faGFuZGxlSXBjQ29tbWFuZC5iaW5kKHRoaXMpKTtcblxuICAgIFdlYkluc3BlY3Rvci50YXJnZXRNYW5hZ2VyLmFkZE1vZGVsTGlzdGVuZXIoXG4gICAgICBXZWJJbnNwZWN0b3IuRGVidWdnZXJNb2RlbCxcbiAgICAgIFdlYkluc3BlY3Rvci5EZWJ1Z2dlck1vZGVsLkV2ZW50cy5DYWxsRnJhbWVTZWxlY3RlZCxcbiAgICAgIHRoaXMuX2hhbmRsZUNhbGxGcmFtZVNlbGVjdGVkLFxuICAgICAgdGhpcyk7XG5cbiAgICBXZWJJbnNwZWN0b3IudGFyZ2V0TWFuYWdlci5hZGRNb2RlbExpc3RlbmVyKFxuICAgICAgV2ViSW5zcGVjdG9yLkRlYnVnZ2VyTW9kZWwsXG4gICAgICBXZWJJbnNwZWN0b3IuRGVidWdnZXJNb2RlbC5FdmVudHMuQ2xlYXJJbnRlcmZhY2UsXG4gICAgICB0aGlzLl9oYW5kbGVDbGVhckludGVyZmFjZSxcbiAgICAgIHRoaXMpO1xuXG4gICAgV2ViSW5zcGVjdG9yLnRhcmdldE1hbmFnZXIuYWRkTW9kZWxMaXN0ZW5lcihcbiAgICAgIFdlYkluc3BlY3Rvci5EZWJ1Z2dlck1vZGVsLFxuICAgICAgV2ViSW5zcGVjdG9yLkRlYnVnZ2VyTW9kZWwuRXZlbnRzLkRlYnVnZ2VyUmVzdW1lZCxcbiAgICAgIHRoaXMuX2hhbmRsZURlYnVnZ2VyUmVzdW1lZCxcbiAgICAgIHRoaXMpO1xuXG4gICAgV2ViSW5zcGVjdG9yLnRhcmdldE1hbmFnZXIuYWRkTW9kZWxMaXN0ZW5lcihcbiAgICAgIFdlYkluc3BlY3Rvci5EZWJ1Z2dlck1vZGVsLFxuICAgICAgV2ViSW5zcGVjdG9yLkRlYnVnZ2VyTW9kZWwuRXZlbnRzLkRlYnVnZ2VyUGF1c2VkLFxuICAgICAgdGhpcy5faGFuZGxlRGVidWdnZXJQYXVzZWQsXG4gICAgICB0aGlzKTtcblxuICAgIFdlYkluc3BlY3Rvci53b3Jrc3BhY2UuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFdlYkluc3BlY3Rvci5Xb3Jrc3BhY2UuRXZlbnRzLlVJU291cmNlQ29kZUFkZGVkLFxuICAgICAgdGhpcy5faGFuZGxlVUlTb3VyY2VDb2RlQWRkZWQsXG4gICAgICB0aGlzKTtcblxuICAgIFdlYkluc3BlY3Rvci5ub3RpZmljYXRpb25zLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBXZWJJbnNwZWN0b3IuVXNlck1ldHJpY3MuVXNlckFjdGlvbixcbiAgICAgIGZ1bmN0aW9uKGV2ZW50OiBXZWJJbnNwZWN0b3IuRXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEuYWN0aW9uID09PSAnb3BlblNvdXJjZUxpbmsnKSB7XG4gICAgICAgICAgdGhpcy5faGFuZGxlT3BlblNvdXJjZUxvY2F0aW9uKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHRoaXMpO1xuXG4gICAgV2ViSW5zcGVjdG9yLmJyZWFrcG9pbnRNYW5hZ2VyLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBXZWJJbnNwZWN0b3IuQnJlYWtwb2ludE1hbmFnZXIuRXZlbnRzLkJyZWFrcG9pbnRBZGRlZCxcbiAgICAgIHRoaXMuX2hhbmRsZUJyZWFrcG9pbnRBZGRlZCxcbiAgICAgIHRoaXMpO1xuXG4gICAgV2ViSW5zcGVjdG9yLmJyZWFrcG9pbnRNYW5hZ2VyLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBXZWJJbnNwZWN0b3IuQnJlYWtwb2ludE1hbmFnZXIuRXZlbnRzLkJyZWFrcG9pbnRSZW1vdmVkLFxuICAgICAgdGhpcy5faGFuZGxlQnJlYWtwb2ludFJlbW92ZWQsXG4gICAgICB0aGlzKTtcblxuICAgIHRoaXMuX2N1c3RvbWl6ZVdlYkluc3BlY3RvcigpO1xuICAgIHdpbmRvdy5ydW5PbldpbmRvd0xvYWQodGhpcy5faGFuZGxlV2luZG93TG9hZC5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZSBhbmQgY3VzdG9taXplIHNvbWUgZnVuY3Rpb25hbGl0aWVzIG9mIFdlYkluc3BlY3Rvci5cbiAgICogRGVsaWJlcmF0ZWx5IHN1cHByZXNzIGFueSBmbG93IGVycm9ycyBpbiB0aGlzIG1ldGhvZC5cbiAgICovXG4gIF9jdXN0b21pemVXZWJJbnNwZWN0b3IoKSB7XG4gICAgLy8gJEZsb3dGaXhNZS5cbiAgICBXZWJJbnNwZWN0b3IuT2JqZWN0UHJvcGVydHlUcmVlRWxlbWVudC5fcG9wdWxhdGUgPVxuICAgICAgZnVuY3Rpb24odHJlZUVsZW1lbnQsIHZhbHVlLCBza2lwUHJvdG8sIGVtcHR5UGxhY2Vob2xkZXIpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7P0FycmF5LjwhV2ViSW5zcGVjdG9yLlJlbW90ZU9iamVjdFByb3BlcnR5Pn0gcHJvcGVydGllc1xuICAgICAgICAgKiBAcGFyYW0gez9BcnJheS48IVdlYkluc3BlY3Rvci5SZW1vdGVPYmplY3RQcm9wZXJ0eT59IGludGVybmFsUHJvcGVydGllc1xuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gY2FsbGJhY2socHJvcGVydGllcywgaW50ZXJuYWxQcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgdHJlZUVsZW1lbnQucmVtb3ZlQ2hpbGRyZW4oKTtcbiAgICAgICAgICBpZiAoIXByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gJEZsb3dGaXhNZS5cbiAgICAgICAgICBXZWJJbnNwZWN0b3IuT2JqZWN0UHJvcGVydHlUcmVlRWxlbWVudC5wb3B1bGF0ZVdpdGhQcm9wZXJ0aWVzKFxuICAgICAgICAgICAgdHJlZUVsZW1lbnQsXG4gICAgICAgICAgICBwcm9wZXJ0aWVzLFxuICAgICAgICAgICAgaW50ZXJuYWxQcm9wZXJ0aWVzLFxuICAgICAgICAgICAgc2tpcFByb3RvLFxuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBlbXB0eVBsYWNlaG9sZGVyXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICAvLyAkRmxvd0ZpeE1lLlxuICAgICAgICBXZWJJbnNwZWN0b3IuUmVtb3RlT2JqZWN0LmxvYWRGcm9tT2JqZWN0UGVyUHJvdG8odmFsdWUsIGNhbGxiYWNrKTtcbiAgICAgIH07XG5cbiAgICAvLyAkRmxvd0ZpeE1lLlxuICAgIFdlYkluc3BlY3Rvci5PYmplY3RQcm9wZXJ0aWVzU2VjdGlvbi5wcm90b3R5cGUudXBkYXRlID1cbiAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHs/QXJyYXkuPCFXZWJJbnNwZWN0b3IuUmVtb3RlT2JqZWN0UHJvcGVydHk+fSBwcm9wZXJ0aWVzXG4gICAgICAgICAqIEBwYXJhbSB7P0FycmF5LjwhV2ViSW5zcGVjdG9yLlJlbW90ZU9iamVjdFByb3BlcnR5Pn0gaW50ZXJuYWxQcm9wZXJ0aWVzXG4gICAgICAgICAqIEB0aGlzIHtXZWJJbnNwZWN0b3IuT2JqZWN0UHJvcGVydGllc1NlY3Rpb259XG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBjYWxsYmFjayhwcm9wZXJ0aWVzLCBpbnRlcm5hbFByb3BlcnRpZXMpIHtcbiAgICAgICAgICBpZiAoIXByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy51cGRhdGVQcm9wZXJ0aWVzKHByb3BlcnRpZXMsIGludGVybmFsUHJvcGVydGllcyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gJEZsb3dGaXhNZS5cbiAgICAgICAgV2ViSW5zcGVjdG9yLlJlbW90ZU9iamVjdC5sb2FkRnJvbU9iamVjdChcbiAgICAgICAgICB0aGlzLm9iamVjdCxcbiAgICAgICAgICAhIXRoaXMuaWdub3JlSGFzT3duUHJvcGVydHksXG4gICAgICAgICAgY2FsbGJhY2suYmluZCh0aGlzKVxuICAgICAgICApO1xuICAgICAgfTtcbiAgfVxuXG4gIF9oYW5kbGVXaW5kb3dMb2FkKCkge1xuICAgIGlwYy5zZW5kVG9Ib3N0KCdub3RpZmljYXRpb24nLCAncmVhZHknKTtcbiAgfVxuXG4gIF9oYW5kbGVJcGNDb21tYW5kKGNvbW1hbmQ6IHN0cmluZywgLi4uYXJnczogYW55W10pIHtcbiAgICBzd2l0Y2ggKGNvbW1hbmQpIHtcbiAgICAgIGNhc2UgJ1N5bmNCcmVha3BvaW50cyc6XG4gICAgICAgIHRoaXMuX2FsbEJyZWFrcG9pbnRzID0gYXJnc1swXTtcbiAgICAgICAgdGhpcy5fc3luY0JyZWFrcG9pbnRzKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnQ29udGludWUnOlxuICAgICAgICB0aGlzLl9jb250aW51ZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ1N0ZXBPdmVyJzpcbiAgICAgICAgdGhpcy5fc3RlcE92ZXIoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdTdGVwSW50byc6XG4gICAgICAgIHRoaXMuX3N0ZXBJbnRvKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnU3RlcE91dCc6XG4gICAgICAgIHRoaXMuX3N0ZXBPdXQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdldmFsdWF0ZU9uU2VsZWN0ZWRDYWxsRnJhbWUnOlxuICAgICAgICB0aGlzLl9ldmFsdWF0ZU9uU2VsZWN0ZWRDYWxsRnJhbWUoYXJnc1swXSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVDYWxsRnJhbWVTZWxlY3RlZChldmVudDogV2ViSW5zcGVjdG9yLkV2ZW50KSB7XG4gICAgY29uc3QgZnJhbWU6IFdlYkluc3BlY3RvciRDYWxsRnJhbWUgPSBldmVudC5kYXRhO1xuICAgIGNvbnN0IHVpTG9jYXRpb24gPVxuICAgICAgV2ViSW5zcGVjdG9yLmRlYnVnZ2VyV29ya3NwYWNlQmluZGluZy5yYXdMb2NhdGlvblRvVUlMb2NhdGlvbihmcmFtZS5sb2NhdGlvbigpKTtcbiAgICBpcGMuc2VuZFRvSG9zdCgnbm90aWZpY2F0aW9uJywgJ0NhbGxGcmFtZVNlbGVjdGVkJywge1xuICAgICAgc291cmNlVVJMOiB1aUxvY2F0aW9uLnVpU291cmNlQ29kZS51cmkoKSxcbiAgICAgIGxpbmVOdW1iZXI6IHVpTG9jYXRpb24ubGluZU51bWJlcixcbiAgICB9KTtcbiAgfVxuXG4gIF9oYW5kbGVPcGVuU291cmNlTG9jYXRpb24oZXZlbnQ6IFdlYkluc3BlY3Rvci5FdmVudCkge1xuICAgIGNvbnN0IGV2ZW50RGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgdGhpcy5zZW5kT3BlblNvdXJjZUxvY2F0aW9uKGV2ZW50RGF0YS51cmwsIGV2ZW50RGF0YS5saW5lTnVtYmVyKTtcbiAgfVxuXG4gIHNlbmRPcGVuU291cmNlTG9jYXRpb24oc291cmNlVVJMOiBzdHJpbmcsIGxpbmU6IG51bWJlcikge1xuICAgIGlwYy5zZW5kVG9Ib3N0KCdub3RpZmljYXRpb24nLCAnT3BlblNvdXJjZUxvY2F0aW9uJywge1xuICAgICAgc291cmNlVVJMOiBzb3VyY2VVUkwsXG4gICAgICBsaW5lTnVtYmVyOiBsaW5lLFxuICAgIH0pO1xuICB9XG5cbiAgX2V2YWx1YXRlT25TZWxlY3RlZENhbGxGcmFtZShleHByZXNzaW9uOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBtYWluVGFyZ2V0ID0gV2ViSW5zcGVjdG9yLnRhcmdldE1hbmFnZXIubWFpblRhcmdldCgpO1xuICAgIGlmIChtYWluVGFyZ2V0ID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbWFpblRhcmdldC5kZWJ1Z2dlck1vZGVsLmV2YWx1YXRlT25TZWxlY3RlZENhbGxGcmFtZShcbiAgICAgIGV4cHJlc3Npb24sXG4gICAgICBOVUNMSURFX0RFQlVHR0VSX09CSkVDVF9HUk9VUCxcbiAgICAgIGZhbHNlLCAvKiBpbmNsdWRlQ29tbWFuZExpbmVBUEkgKi9cbiAgICAgIHRydWUsIC8qIGRvTm90UGF1c2VPbkV4Y2VwdGlvbnNBbmRNdXRlQ29uc29sZSAqL1xuICAgICAgZmFsc2UsICAvKiByZXR1cm5CeVZhbHVlICovXG4gICAgICBmYWxzZSwgLyogZ2VuZXJhdGVQcmV2aWV3ICovXG4gICAgICAocmVtb3RlT2JqZWN0LCB3YXNUaHJvd24sIGVycm9yKSA9PiB7XG4gICAgICAgIGlwYy5zZW5kVG9Ib3N0KCdub3RpZmljYXRpb24nLCAnRXhwcmVzc2lvbkV2YWx1YXRpb25SZXNwb25zZScsIHtcbiAgICAgICAgICByZXN1bHQ6IHdhc1Rocm93biA/IG51bGwgOiByZW1vdGVPYmplY3QsXG4gICAgICAgICAgZXJyb3I6ICB3YXNUaHJvd24gPyBlcnJvciA6IG51bGwsXG4gICAgICAgICAgZXhwcmVzc2lvbixcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlRGVidWdnZXJQYXVzZWQoZXZlbnQ6IFdlYkluc3BlY3RvciRFdmVudCkge1xuICAgIGVuZFRpbWVyVHJhY2tpbmcoKTtcbiAgICBpcGMuc2VuZFRvSG9zdCgnbm90aWZpY2F0aW9uJywgJ0RlYnVnZ2VyUGF1c2VkJywge30pO1xuICAgICsrdGhpcy5fZGVidWdnZXJQYXVzZWRDb3VudDtcbiAgICBpZiAodGhpcy5fZGVidWdnZXJQYXVzZWRDb3VudCA9PT0gMSkge1xuICAgICAgdGhpcy5faGFuZGxlTG9hZGVyQnJlYWtwb2ludCgpO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVMb2FkZXJCcmVha3BvaW50KCkge1xuICAgIC8vIFN5bmMgYW55IGluaXRpYWwgYnJlYWtwb2ludHMgdG8gZW5naW5lIGR1cmluZyBsb2FkZXIgYnJlYWtwb2ludFxuICAgIC8vIGFuZCBjb250aW51ZSBmcm9tIGl0LlxuICAgIHRoaXMuX3N5bmNCcmVha3BvaW50cygpO1xuXG4gICAgLy8gSWYgd2Ugd2VyZSB0byBjb250aW51ZSBzeW5jaHJvbm91c2x5IGhlcmUsIHRoZSBkZWJ1Z2dlciB3b3VsZCBubyBsb25nZXIgYmUgcGF1c2VkIHdoZW4gdGhlXG4gICAgLy8gcmVtYWluaW5nIHN1YnNjcmliZXJzJyBjYWxsYmFja3Mgd2VyZSBpbnZva2VkLiBUaGF0J3MgYSB2aW9sYXRpb24gb2YgYSBwcmV0dHkgYmFzaWNcbiAgICAvLyBhc3N1bXB0aW9uICh0aGF0IHRoZSBkZWJ1Z2dlciB3aWxsIGJlIHBhdXNlZCB3aGVuIHlvdXIgcGF1c2VkIGV2ZW50IGNhbGxiYWNrIGlzIGNhbGxlZCkgc29cbiAgICAvLyBpbnN0ZWFkIHdlIHdhaXQgdW50aWwgdGhlIG5leHQgdGljay4gSWYgdGhlIGRlYnVnZ2VyIGlzIHN0aWxsIHBhdXNlZCB0aGVuLCB3ZSBjb250aW51ZS4gTm90XG4gICAgLy8gZG9pbmcgdGhpcyByZXN1bHRzIGluIGFuIFwiUnVudGltZS5nZXRQcm9wZXJ0aWVzIGZhaWxlZFwiIGVycm9yIGluIG5vZGUtaW5zcGVjdG9yIHNpbmNlIHRoYXRcbiAgICAvLyBjYWxsIGlzIG9ubHkgdmFsaWQgZHVyaW5nIGEgcGF1c2VkIHN0YXRlLlxuICAgIHByb2Nlc3MubmV4dFRpY2soKCkgPT4ge1xuICAgICAgY29uc3QgdGFyZ2V0TWFuYWdlciA9IFdlYkluc3BlY3RvciAhPSBudWxsID8gV2ViSW5zcGVjdG9yLnRhcmdldE1hbmFnZXIgOiBudWxsO1xuICAgICAgY29uc3QgbWFpblRhcmdldCA9IHRhcmdldE1hbmFnZXIgIT0gbnVsbCA/IHRhcmdldE1hbmFnZXIubWFpblRhcmdldCgpIDogbnVsbDtcbiAgICAgIGNvbnN0IGRlYnVnZ2VyTW9kZWwgPSBtYWluVGFyZ2V0ICE9IG51bGwgPyBtYWluVGFyZ2V0LmRlYnVnZ2VyTW9kZWwgOiBudWxsO1xuICAgICAgY29uc3Qgc3RpbGxQYXVzZWQgPSBkZWJ1Z2dlck1vZGVsICE9IG51bGwgJiYgZGVidWdnZXJNb2RlbC5pc1BhdXNlZCgpO1xuICAgICAgaWYgKHN0aWxsUGF1c2VkKSB7XG4gICAgICAgIHRoaXMuX2NvbnRpbnVlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfaGFuZGxlRGVidWdnZXJSZXN1bWVkKGV2ZW50OiBXZWJJbnNwZWN0b3IkRXZlbnQpIHtcbiAgICBpcGMuc2VuZFRvSG9zdCgnbm90aWZpY2F0aW9uJywgJ0RlYnVnZ2VyUmVzdW1lZCcsIHt9KTtcbiAgfVxuXG4gIF9oYW5kbGVDbGVhckludGVyZmFjZShldmVudDogV2ViSW5zcGVjdG9yJEV2ZW50KSB7XG4gICAgaXBjLnNlbmRUb0hvc3QoJ25vdGlmaWNhdGlvbicsICdDbGVhckludGVyZmFjZScsIHt9KTtcbiAgfVxuXG4gIF9oYW5kbGVCcmVha3BvaW50QWRkZWQoZXZlbnQ6IFdlYkluc3BlY3RvciRFdmVudCkge1xuICAgIGNvbnN0IGxvY2F0aW9uID0gZXZlbnQuZGF0YS51aUxvY2F0aW9uO1xuICAgIHRoaXMuX3NlbmRCcmVha3BvaW50Tm90aWZpY2F0aW9uKGxvY2F0aW9uLCAnQnJlYWtwb2ludEFkZGVkJyk7XG4gIH1cblxuICBfaGFuZGxlQnJlYWtwb2ludFJlbW92ZWQoZXZlbnQ6IFdlYkluc3BlY3RvciRFdmVudCkge1xuICAgIGNvbnN0IGxvY2F0aW9uID0gZXZlbnQuZGF0YS51aUxvY2F0aW9uO1xuICAgIHRoaXMuX3NlbmRCcmVha3BvaW50Tm90aWZpY2F0aW9uKGxvY2F0aW9uLCAnQnJlYWtwb2ludFJlbW92ZWQnKTtcbiAgfVxuXG4gIF9zZW5kQnJlYWtwb2ludE5vdGlmaWNhdGlvbihsb2NhdGlvbjogV2ViSW5zcGVjdG9yJFVJTG9jYXRpb24sIHR5cGU6IEJyZWFrcG9pbnROb3RpZmljYXRpb25UeXBlKSB7XG4gICAgaWYgKCF0aGlzLl9zdXBwcmVzc0JyZWFrcG9pbnROb3RpZmljYXRpb24pIHtcbiAgICAgIGlwYy5zZW5kVG9Ib3N0KCdub3RpZmljYXRpb24nLCB0eXBlLCB7XG4gICAgICAgIHNvdXJjZVVSTDogbG9jYXRpb24udWlTb3VyY2VDb2RlLnVyaSgpLFxuICAgICAgICBsaW5lTnVtYmVyOiBsb2NhdGlvbi5saW5lTnVtYmVyLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gVE9ET1tqZWZmcmV5dGFuXTogdGhpcyBpcyBhIGhhY2sgdG8gZW5hYmxlIGhodm0vbGxkYiBkZWJ1Z2dlclxuICAvLyBzZXR0aW5nIGJyZWFrcG9pbnRzIGluIG5vbi1wYXJzZWQgZmlsZXMuXG4gIC8vIE9wZW4gaXNzdWVzOlxuICAvLyBBbnkgYnJlYWtwb2ludHMgaW4gdGhpcyBsaXN0IHdpbGwgc2hvd24gYXMgYm91bmQvcmVzb2x2ZWQ7XG4gIC8vIG5lZWRzIHRvIHJldmlzaXQgdGhlIHVucmVzb2x2ZWQgYnJlYWtwb2ludHMgZGV0ZWN0aW9uIGxvZ2ljLlxuICBfcGFyc2VCcmVha3BvaW50U291cmNlcygpIHtcbiAgICB0aGlzLl9hbGxCcmVha3BvaW50cy5mb3JFYWNoKGJyZWFrcG9pbnQgPT4ge1xuICAgICAgY29uc3Qgc291cmNlVXJsID0gYnJlYWtwb2ludC5zb3VyY2VVUkw7XG4gICAgICBpZiAoc291cmNlVXJsLmVuZHNXaXRoKCcucGhwJykgfHxcbiAgICAgICAgICBzb3VyY2VVcmwuZW5kc1dpdGgoJy5oaCcpICB8fFxuICAgICAgICAgIHNvdXJjZVVybC5lbmRzV2l0aCgnLmMnKSB8fFxuICAgICAgICAgIHNvdXJjZVVybC5lbmRzV2l0aCgnLmNwcCcpIHx8XG4gICAgICAgICAgc291cmNlVXJsLmVuZHNXaXRoKCcuaCcpIHx8XG4gICAgICAgICAgc291cmNlVXJsLmVuZHNXaXRoKCcuaHBwJykgfHxcbiAgICAgICAgICBzb3VyY2VVcmwuZW5kc1dpdGgoJy5tJykgfHxcbiAgICAgICAgICBzb3VyY2VVcmwuZW5kc1dpdGgoJy5tbScpKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IFdlYkluc3BlY3Rvci53b3Jrc3BhY2UudWlTb3VyY2VDb2RlRm9yT3JpZ2luVVJMKHNvdXJjZVVybCk7XG4gICAgICAgIGlmICghc291cmNlKSB7XG4gICAgICAgICAgY29uc3QgdGFyZ2V0ID0gV2ViSW5zcGVjdG9yLnRhcmdldE1hbmFnZXIubWFpblRhcmdldCgpO1xuICAgICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICAgIHRhcmdldC5kZWJ1Z2dlck1vZGVsLl9wYXJzZWRTY3JpcHRTb3VyY2UoXG4gICAgICAgICAgICAgIHNvdXJjZVVybCxcbiAgICAgICAgICAgICAgc291cmNlVXJsLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vIFN5bmNocm9uaXplcyBudWNsaWRlIEJyZWFrcG9pbnRTdG9yZSBhbmQgQnJlYWtwb2ludE1hbmFnZXJcbiAgX3N5bmNCcmVha3BvaW50cygpIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50Tm90aWZpY2F0aW9uID0gdHJ1ZTtcbiAgICAgIHRoaXMuX3VucmVzb2x2ZWRCcmVha3BvaW50cyA9IG5ldyBNdWx0aW1hcCgpO1xuXG4gICAgICBjb25zdCBuZXdCcmVha3BvaW50U2V0ID0gbmV3IFNldCh0aGlzLl9hbGxCcmVha3BvaW50cy5tYXAoYnJlYWtwb2ludCA9PlxuICAgICAgICBmb3JtYXRCcmVha3BvaW50S2V5KGJyZWFrcG9pbnQuc291cmNlVVJMLCBicmVha3BvaW50LmxpbmVOdW1iZXIpKSk7XG5cbiAgICAgIC8vIFJlbW92aW5nIHVubGlzdGVkIGJyZWFrcG9pbnRzIGFuZCBtYXJrIHRoZSBvbmVzIHRoYXQgYWxyZWFkeSBleGlzdC5cbiAgICAgIGNvbnN0IHVuY2hhbmdlZEJyZWFrcG9pbnRTZXQgPSBuZXcgU2V0KCk7XG4gICAgICBjb25zdCBleGlzdGluZ0JyZWFrcG9pbnRzID0gV2ViSW5zcGVjdG9yLmJyZWFrcG9pbnRNYW5hZ2VyLmFsbEJyZWFrcG9pbnRzKCk7XG4gICAgICBleGlzdGluZ0JyZWFrcG9pbnRzLmZvckVhY2goZXhpc3RpbmdCcmVha3BvaW50ID0+IHtcbiAgICAgICAgY29uc3Qgc291cmNlID0gZXhpc3RpbmdCcmVha3BvaW50LnVpU291cmNlQ29kZSgpO1xuICAgICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgICAgY29uc3Qga2V5ID0gZm9ybWF0QnJlYWtwb2ludEtleShzb3VyY2UudXJpKCksIGV4aXN0aW5nQnJlYWtwb2ludC5saW5lTnVtYmVyKCkpO1xuICAgICAgICAgIGlmIChuZXdCcmVha3BvaW50U2V0LmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB1bmNoYW5nZWRCcmVha3BvaW50U2V0LmFkZChrZXkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBleGlzdGluZ0JyZWFrcG9pbnQucmVtb3ZlKGZhbHNlKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9wYXJzZUJyZWFrcG9pbnRTb3VyY2VzKCk7XG5cbiAgICAgIC8vIEFkZCB0aGUgb25lcyB0aGF0IGRvbid0LlxuICAgICAgdGhpcy5fYWxsQnJlYWtwb2ludHMuZm9yRWFjaChicmVha3BvaW50ID0+IHtcbiAgICAgICAgY29uc3Qga2V5ID0gZm9ybWF0QnJlYWtwb2ludEtleShicmVha3BvaW50LnNvdXJjZVVSTCwgYnJlYWtwb2ludC5saW5lTnVtYmVyKTtcbiAgICAgICAgaWYgKCF1bmNoYW5nZWRCcmVha3BvaW50U2V0LmhhcyhrZXkpKSB7XG4gICAgICAgICAgY29uc3Qgc291cmNlID0gV2ViSW5zcGVjdG9yLndvcmtzcGFjZS51aVNvdXJjZUNvZGVGb3JPcmlnaW5VUkwoYnJlYWtwb2ludC5zb3VyY2VVUkwpO1xuICAgICAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgICAgIFdlYkluc3BlY3Rvci5icmVha3BvaW50TWFuYWdlci5zZXRCcmVha3BvaW50KFxuICAgICAgICAgICAgICBzb3VyY2UsXG4gICAgICAgICAgICAgIGJyZWFrcG9pbnQubGluZU51bWJlcixcbiAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAgIHRydWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBObyBBUEkgZXhpc3RzIGZvciBhZGRpbmcgYnJlYWtwb2ludHMgdG8gc291cmNlIGZpbGVzIHRoYXQgYXJlIG5vdFxuICAgICAgICAgICAgLy8geWV0IGtub3duLCBzdG9yZSBpdCBsb2NhbGx5IGFuZCB0cnkgdG8gYWRkIHRoZW0gbGF0ZXIuXG4gICAgICAgICAgICB0aGlzLl91bnJlc29sdmVkQnJlYWtwb2ludHMuc2V0KGJyZWFrcG9pbnQuc291cmNlVVJMLCBicmVha3BvaW50LmxpbmVOdW1iZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgndW5yZXNvbHZlZC1icmVha3BvaW50cy1jaGFuZ2VkJywgbnVsbCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuX3N1cHByZXNzQnJlYWtwb2ludE5vdGlmaWNhdGlvbiA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIF9jb250aW51ZSgpOiB2b2lkIHtcbiAgICBjb25zdCB0YXJnZXQgPSBXZWJJbnNwZWN0b3IudGFyZ2V0TWFuYWdlci5tYWluVGFyZ2V0KCk7XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgYmVnaW5UaW1lclRyYWNraW5nKCdudWNsaWRlLWRlYnVnZ2VyLWF0b206Y29udGludWUnKTtcbiAgICAgIHRhcmdldC5kZWJ1Z2dlck1vZGVsLnJlc3VtZSgpO1xuICAgIH1cbiAgfVxuXG4gIF9zdGVwT3ZlcigpOiB2b2lkIHtcbiAgICBjb25zdCB0YXJnZXQgPSBXZWJJbnNwZWN0b3IudGFyZ2V0TWFuYWdlci5tYWluVGFyZ2V0KCk7XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgYmVnaW5UaW1lclRyYWNraW5nKCdudWNsaWRlLWRlYnVnZ2VyLWF0b206c3RlcE92ZXInKTtcbiAgICAgIHRhcmdldC5kZWJ1Z2dlck1vZGVsLnN0ZXBPdmVyKCk7XG4gICAgfVxuICB9XG5cbiAgX3N0ZXBJbnRvKCk6IHZvaWQge1xuICAgIGNvbnN0IHRhcmdldCA9IFdlYkluc3BlY3Rvci50YXJnZXRNYW5hZ2VyLm1haW5UYXJnZXQoKTtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICBiZWdpblRpbWVyVHJhY2tpbmcoJ251Y2xpZGUtZGVidWdnZXItYXRvbTpzdGVwSW50bycpO1xuICAgICAgdGFyZ2V0LmRlYnVnZ2VyTW9kZWwuc3RlcEludG8oKTtcbiAgICB9XG4gIH1cblxuICBfc3RlcE91dCgpOiB2b2lkIHtcbiAgICBjb25zdCB0YXJnZXQgPSBXZWJJbnNwZWN0b3IudGFyZ2V0TWFuYWdlci5tYWluVGFyZ2V0KCk7XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgYmVnaW5UaW1lclRyYWNraW5nKCdudWNsaWRlLWRlYnVnZ2VyLWF0b206c3RlcE91dCcpO1xuICAgICAgdGFyZ2V0LmRlYnVnZ2VyTW9kZWwuc3RlcE91dCgpO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVVSVNvdXJjZUNvZGVBZGRlZChldmVudDogT2JqZWN0KSB7XG4gICAgY29uc3Qgc291cmNlID0gZXZlbnQuZGF0YTtcbiAgICB0aGlzLl91bnJlc29sdmVkQnJlYWtwb2ludHMuZ2V0KHNvdXJjZS51cmkoKSkuZm9yRWFjaChsaW5lID0+IHtcbiAgICAgIFdlYkluc3BlY3Rvci5icmVha3BvaW50TWFuYWdlci5zZXRCcmVha3BvaW50KHNvdXJjZSwgbGluZSAsIDAsICcnLCB0cnVlKTtcbiAgICB9KTtcbiAgICBpZiAodGhpcy5fdW5yZXNvbHZlZEJyZWFrcG9pbnRzLmRlbGV0ZUFsbChzb3VyY2UudXJpKCkpKSB7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ3VucmVzb2x2ZWQtYnJlYWtwb2ludHMtY2hhbmdlZCcsIG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIG9uVW5yZXNvbHZlZEJyZWFrcG9pbnRzQ2hhbmdlZChjYWxsYmFjazogKCkgPT4gdm9pZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbigndW5yZXNvbHZlZC1icmVha3BvaW50cy1jaGFuZ2VkJywgY2FsbGJhY2spO1xuICB9XG5cbiAgZ2V0VW5yZXNvbHZlZEJyZWFrcG9pbnRzTGlzdCgpOiB7dXJsOiBzdHJpbmc7IGxpbmU6IG51bWJlcn1bXSB7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgdGhpcy5fdW5yZXNvbHZlZEJyZWFrcG9pbnRzLmZvckVhY2goKGxpbmUsIHVybCkgPT4ge1xuICAgICAgcmVzdWx0LnB1c2goe3VybCwgbGluZX0pO1xuICAgIH0pO1xuICAgIHJlc3VsdC5zb3J0KChhLCBiKSA9PiB7XG4gICAgICBpZiAoYS51cmwgPCBiLnVybCkge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgICB9IGVsc2UgaWYgKGEudXJsID4gYi51cmwpIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYS5saW5lIC0gYi5saW5lO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTnVjbGlkZUJyaWRnZSgpO1xuIl19