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
//# sourceMappingURL=data:application/json;base64,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LENBQUMsQ0FBQztBQUNILFlBQU0sQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFLO0FBQ3BCLFlBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFO0FBQ2pCLGlCQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ1gsTUFBTSxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRTtBQUN4QixpQkFBTyxDQUFDLENBQUM7U0FDVixNQUFNO0FBQ0wsaUJBQU8sQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1NBQ3hCO09BQ0YsQ0FBQyxDQUFDO0FBQ0gsYUFBTyxNQUFNLENBQUM7S0FDZjs7O1NBallHLGFBQWE7OztBQW9ZbkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDIiwiZmlsZSI6Ik51Y2xpZGVCcmlkZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBFbWl0dGVyID0gcmVxdWlyZSgnLi9FbWl0dGVyJyk7XG5jb25zdCBNdWx0aW1hcCA9IHJlcXVpcmUoJy4uLy4uL2xpYi9NdWx0aW1hcCcpO1xuY29uc3QgaXBjID0gcmVxdWlyZSgnaXBjJyk7XG5pbXBvcnQge2JlZ2luVGltZXJUcmFja2luZywgZW5kVGltZXJUcmFja2luZ30gZnJvbSAnLi4vLi4vbGliL0FuYWx5dGljc0hlbHBlcic7XG5cbmNvbnN0IFdlYkluc3BlY3RvcjogdHlwZW9mIFdlYkluc3BlY3RvciA9IHdpbmRvdy5XZWJJbnNwZWN0b3I7XG4vLyBSZS11c2UgJ3dhdGNoLWdyb3VwJyBzaW5jZSBzb21lIGJhY2tlbmRzIHRocm93IHdoZW4gdGhleSBlbmNvdW50ZWQgYW4gdW5yZWNvZ25pemVkIG9iamVjdCBncm91cC5cbmNvbnN0IE5VQ0xJREVfREVCVUdHRVJfT0JKRUNUX0dST1VQID0gJ3dhdGNoLWdyb3VwJztcblxuLyoqXG4gICogR2VuZXJhdGVzIGEgc3RyaW5nIGZyb20gYSBicmVha3BvaW50IHRoYXQgY2FuIGJlIHVzZWQgaW4gaGFzaGVkXG4gICogY29udGFpbmVycy5cbiAgKi9cbmZ1bmN0aW9uIGZvcm1hdEJyZWFrcG9pbnRLZXkodXJsOiBzdHJpbmcsIGxpbmU6IG51bWJlcik6IHN0cmluZyB7XG4gIHJldHVybiB1cmwgKyAnOicgKyBsaW5lO1xufVxuXG50eXBlIEJyZWFrcG9pbnROb3RpZmljYXRpb25UeXBlID0gJ0JyZWFrcG9pbnRBZGRlZCcgfCAnQnJlYWtwb2ludFJlbW92ZWQnO1xuXG5jbGFzcyBOdWNsaWRlQnJpZGdlIHtcbiAgX2FsbEJyZWFrcG9pbnRzOiB7c291cmNlVVJMOiBzdHJpbmc7IGxpbmVOdW1iZXI6IG51bWJlcn1bXTtcbiAgX3VucmVzb2x2ZWRCcmVha3BvaW50czogTXVsdGltYXA8c3RyaW5nLCBudW1iZXI+O1xuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX2RlYnVnZ2VyUGF1c2VkQ291bnQ6IG51bWJlcjtcbiAgX3N1cHByZXNzQnJlYWtwb2ludE5vdGlmaWNhdGlvbjogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9hbGxCcmVha3BvaW50cyA9IFtdO1xuICAgIHRoaXMuX3VucmVzb2x2ZWRCcmVha3BvaW50cyA9IG5ldyBNdWx0aW1hcCgpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX2RlYnVnZ2VyUGF1c2VkQ291bnQgPSAwO1xuICAgIHRoaXMuX3N1cHByZXNzQnJlYWtwb2ludE5vdGlmaWNhdGlvbiA9IGZhbHNlO1xuXG4gICAgaXBjLm9uKCdjb21tYW5kJywgdGhpcy5faGFuZGxlSXBjQ29tbWFuZC5iaW5kKHRoaXMpKTtcblxuICAgIFdlYkluc3BlY3Rvci50YXJnZXRNYW5hZ2VyLmFkZE1vZGVsTGlzdGVuZXIoXG4gICAgICBXZWJJbnNwZWN0b3IuRGVidWdnZXJNb2RlbCxcbiAgICAgIFdlYkluc3BlY3Rvci5EZWJ1Z2dlck1vZGVsLkV2ZW50cy5DYWxsRnJhbWVTZWxlY3RlZCxcbiAgICAgIHRoaXMuX2hhbmRsZUNhbGxGcmFtZVNlbGVjdGVkLFxuICAgICAgdGhpcyk7XG5cbiAgICBXZWJJbnNwZWN0b3IudGFyZ2V0TWFuYWdlci5hZGRNb2RlbExpc3RlbmVyKFxuICAgICAgV2ViSW5zcGVjdG9yLkRlYnVnZ2VyTW9kZWwsXG4gICAgICBXZWJJbnNwZWN0b3IuRGVidWdnZXJNb2RlbC5FdmVudHMuRGVidWdnZXJSZXN1bWVkLFxuICAgICAgdGhpcy5faGFuZGxlRGVidWdnZXJSZXN1bWVkLFxuICAgICAgdGhpcyk7XG5cbiAgICBXZWJJbnNwZWN0b3IudGFyZ2V0TWFuYWdlci5hZGRNb2RlbExpc3RlbmVyKFxuICAgICAgV2ViSW5zcGVjdG9yLkRlYnVnZ2VyTW9kZWwsXG4gICAgICBXZWJJbnNwZWN0b3IuRGVidWdnZXJNb2RlbC5FdmVudHMuRGVidWdnZXJQYXVzZWQsXG4gICAgICB0aGlzLl9oYW5kbGVEZWJ1Z2dlclBhdXNlZCxcbiAgICAgIHRoaXMpO1xuXG4gICAgV2ViSW5zcGVjdG9yLndvcmtzcGFjZS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgV2ViSW5zcGVjdG9yLldvcmtzcGFjZS5FdmVudHMuVUlTb3VyY2VDb2RlQWRkZWQsXG4gICAgICB0aGlzLl9oYW5kbGVVSVNvdXJjZUNvZGVBZGRlZCxcbiAgICAgIHRoaXMpO1xuXG4gICAgV2ViSW5zcGVjdG9yLm5vdGlmaWNhdGlvbnMuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFdlYkluc3BlY3Rvci5Vc2VyTWV0cmljcy5Vc2VyQWN0aW9uLFxuICAgICAgZnVuY3Rpb24oZXZlbnQ6IFdlYkluc3BlY3Rvci5FdmVudCkge1xuICAgICAgICBpZiAoZXZlbnQuZGF0YS5hY3Rpb24gPT09ICdvcGVuU291cmNlTGluaycpIHtcbiAgICAgICAgICB0aGlzLl9oYW5kbGVPcGVuU291cmNlTG9jYXRpb24oZXZlbnQpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdGhpcyk7XG5cbiAgICBXZWJJbnNwZWN0b3IuYnJlYWtwb2ludE1hbmFnZXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFdlYkluc3BlY3Rvci5CcmVha3BvaW50TWFuYWdlci5FdmVudHMuQnJlYWtwb2ludEFkZGVkLFxuICAgICAgdGhpcy5faGFuZGxlQnJlYWtwb2ludEFkZGVkLFxuICAgICAgdGhpcyk7XG5cbiAgICBXZWJJbnNwZWN0b3IuYnJlYWtwb2ludE1hbmFnZXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFdlYkluc3BlY3Rvci5CcmVha3BvaW50TWFuYWdlci5FdmVudHMuQnJlYWtwb2ludFJlbW92ZWQsXG4gICAgICB0aGlzLl9oYW5kbGVCcmVha3BvaW50UmVtb3ZlZCxcbiAgICAgIHRoaXMpO1xuXG4gICAgdGhpcy5fY3VzdG9taXplV2ViSW5zcGVjdG9yKCk7XG4gICAgd2luZG93LnJ1bk9uV2luZG93TG9hZCh0aGlzLl9oYW5kbGVXaW5kb3dMb2FkLmJpbmQodGhpcykpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlIGFuZCBjdXN0b21pemUgc29tZSBmdW5jdGlvbmFsaXRpZXMgb2YgV2ViSW5zcGVjdG9yLlxuICAgKiBEZWxpYmVyYXRlbHkgc3VwcHJlc3MgYW55IGZsb3cgZXJyb3JzIGluIHRoaXMgbWV0aG9kLlxuICAgKi9cbiAgX2N1c3RvbWl6ZVdlYkluc3BlY3RvcigpIHtcbiAgICAvLyAkRmxvd0ZpeE1lLlxuICAgIFdlYkluc3BlY3Rvci5PYmplY3RQcm9wZXJ0eVRyZWVFbGVtZW50Ll9wb3B1bGF0ZSA9XG4gICAgICBmdW5jdGlvbih0cmVlRWxlbWVudCwgdmFsdWUsIHNraXBQcm90bywgZW1wdHlQbGFjZWhvbGRlcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHs/QXJyYXkuPCFXZWJJbnNwZWN0b3IuUmVtb3RlT2JqZWN0UHJvcGVydHk+fSBwcm9wZXJ0aWVzXG4gICAgICAgICAqIEBwYXJhbSB7P0FycmF5LjwhV2ViSW5zcGVjdG9yLlJlbW90ZU9iamVjdFByb3BlcnR5Pn0gaW50ZXJuYWxQcm9wZXJ0aWVzXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBjYWxsYmFjayhwcm9wZXJ0aWVzLCBpbnRlcm5hbFByb3BlcnRpZXMpIHtcbiAgICAgICAgICB0cmVlRWxlbWVudC5yZW1vdmVDaGlsZHJlbigpO1xuICAgICAgICAgIGlmICghcHJvcGVydGllcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyAkRmxvd0ZpeE1lLlxuICAgICAgICAgIFdlYkluc3BlY3Rvci5PYmplY3RQcm9wZXJ0eVRyZWVFbGVtZW50LnBvcHVsYXRlV2l0aFByb3BlcnRpZXMoXG4gICAgICAgICAgICB0cmVlRWxlbWVudCxcbiAgICAgICAgICAgIHByb3BlcnRpZXMsXG4gICAgICAgICAgICBpbnRlcm5hbFByb3BlcnRpZXMsXG4gICAgICAgICAgICBza2lwUHJvdG8sXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIGVtcHR5UGxhY2Vob2xkZXJcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIC8vICRGbG93Rml4TWUuXG4gICAgICAgIFdlYkluc3BlY3Rvci5SZW1vdGVPYmplY3QubG9hZEZyb21PYmplY3RQZXJQcm90byh2YWx1ZSwgY2FsbGJhY2spO1xuICAgICAgfTtcblxuICAgIC8vICRGbG93Rml4TWUuXG4gICAgV2ViSW5zcGVjdG9yLk9iamVjdFByb3BlcnRpZXNTZWN0aW9uLnByb3RvdHlwZS51cGRhdGUgPVxuICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gez9BcnJheS48IVdlYkluc3BlY3Rvci5SZW1vdGVPYmplY3RQcm9wZXJ0eT59IHByb3BlcnRpZXNcbiAgICAgICAgICogQHBhcmFtIHs/QXJyYXkuPCFXZWJJbnNwZWN0b3IuUmVtb3RlT2JqZWN0UHJvcGVydHk+fSBpbnRlcm5hbFByb3BlcnRpZXNcbiAgICAgICAgICogQHRoaXMge1dlYkluc3BlY3Rvci5PYmplY3RQcm9wZXJ0aWVzU2VjdGlvbn1cbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGNhbGxiYWNrKHByb3BlcnRpZXMsIGludGVybmFsUHJvcGVydGllcykge1xuICAgICAgICAgIGlmICghcHJvcGVydGllcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnVwZGF0ZVByb3BlcnRpZXMocHJvcGVydGllcywgaW50ZXJuYWxQcm9wZXJ0aWVzKTtcbiAgICAgICAgfVxuICAgICAgICAvLyAkRmxvd0ZpeE1lLlxuICAgICAgICBXZWJJbnNwZWN0b3IuUmVtb3RlT2JqZWN0LmxvYWRGcm9tT2JqZWN0KFxuICAgICAgICAgIHRoaXMub2JqZWN0LFxuICAgICAgICAgICEhdGhpcy5pZ25vcmVIYXNPd25Qcm9wZXJ0eSxcbiAgICAgICAgICBjYWxsYmFjay5iaW5kKHRoaXMpXG4gICAgICAgICk7XG4gICAgICB9O1xuICB9XG5cbiAgX2hhbmRsZVdpbmRvd0xvYWQoKSB7XG4gICAgaXBjLnNlbmRUb0hvc3QoJ25vdGlmaWNhdGlvbicsICdyZWFkeScpO1xuICB9XG5cbiAgX2hhbmRsZUlwY0NvbW1hbmQoY29tbWFuZDogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkge1xuICAgIHN3aXRjaCAoY29tbWFuZCkge1xuICAgICAgY2FzZSAnU3luY0JyZWFrcG9pbnRzJzpcbiAgICAgICAgdGhpcy5fYWxsQnJlYWtwb2ludHMgPSBhcmdzWzBdO1xuICAgICAgICB0aGlzLl9zeW5jQnJlYWtwb2ludHMoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdDb250aW51ZSc6XG4gICAgICAgIHRoaXMuX2NvbnRpbnVlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnU3RlcE92ZXInOlxuICAgICAgICB0aGlzLl9zdGVwT3ZlcigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ1N0ZXBJbnRvJzpcbiAgICAgICAgdGhpcy5fc3RlcEludG8oKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdTdGVwT3V0JzpcbiAgICAgICAgdGhpcy5fc3RlcE91dCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2V2YWx1YXRlT25TZWxlY3RlZENhbGxGcmFtZSc6XG4gICAgICAgIHRoaXMuX2V2YWx1YXRlT25TZWxlY3RlZENhbGxGcmFtZShhcmdzWzBdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUNhbGxGcmFtZVNlbGVjdGVkKGV2ZW50OiBXZWJJbnNwZWN0b3IuRXZlbnQpIHtcbiAgICBjb25zdCBmcmFtZTogV2ViSW5zcGVjdG9yJENhbGxGcmFtZSA9IGV2ZW50LmRhdGE7XG4gICAgY29uc3QgdWlMb2NhdGlvbiA9XG4gICAgICBXZWJJbnNwZWN0b3IuZGVidWdnZXJXb3Jrc3BhY2VCaW5kaW5nLnJhd0xvY2F0aW9uVG9VSUxvY2F0aW9uKGZyYW1lLmxvY2F0aW9uKCkpO1xuICAgIGlwYy5zZW5kVG9Ib3N0KCdub3RpZmljYXRpb24nLCAnQ2FsbEZyYW1lU2VsZWN0ZWQnLCB7XG4gICAgICBzb3VyY2VVUkw6IHVpTG9jYXRpb24udWlTb3VyY2VDb2RlLnVyaSgpLFxuICAgICAgbGluZU51bWJlcjogdWlMb2NhdGlvbi5saW5lTnVtYmVyLFxuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZU9wZW5Tb3VyY2VMb2NhdGlvbihldmVudDogV2ViSW5zcGVjdG9yLkV2ZW50KSB7XG4gICAgY29uc3QgZXZlbnREYXRhID0gZXZlbnQuZGF0YTtcbiAgICB0aGlzLnNlbmRPcGVuU291cmNlTG9jYXRpb24oZXZlbnREYXRhLnVybCwgZXZlbnREYXRhLmxpbmVOdW1iZXIpO1xuICB9XG5cbiAgc2VuZE9wZW5Tb3VyY2VMb2NhdGlvbihzb3VyY2VVUkw6IHN0cmluZywgbGluZTogbnVtYmVyKSB7XG4gICAgaXBjLnNlbmRUb0hvc3QoJ25vdGlmaWNhdGlvbicsICdPcGVuU291cmNlTG9jYXRpb24nLCB7XG4gICAgICBzb3VyY2VVUkw6IHNvdXJjZVVSTCxcbiAgICAgIGxpbmVOdW1iZXI6IGxpbmUsXG4gICAgfSk7XG4gIH1cblxuICBfZXZhbHVhdGVPblNlbGVjdGVkQ2FsbEZyYW1lKGV4cHJlc3Npb246IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IG1haW5UYXJnZXQgPSBXZWJJbnNwZWN0b3IudGFyZ2V0TWFuYWdlci5tYWluVGFyZ2V0KCk7XG4gICAgaWYgKG1haW5UYXJnZXQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBtYWluVGFyZ2V0LmRlYnVnZ2VyTW9kZWwuZXZhbHVhdGVPblNlbGVjdGVkQ2FsbEZyYW1lKFxuICAgICAgZXhwcmVzc2lvbixcbiAgICAgIE5VQ0xJREVfREVCVUdHRVJfT0JKRUNUX0dST1VQLFxuICAgICAgZmFsc2UsIC8qIGluY2x1ZGVDb21tYW5kTGluZUFQSSAqL1xuICAgICAgdHJ1ZSwgLyogZG9Ob3RQYXVzZU9uRXhjZXB0aW9uc0FuZE11dGVDb25zb2xlICovXG4gICAgICBmYWxzZSwgIC8qIHJldHVybkJ5VmFsdWUgKi9cbiAgICAgIGZhbHNlLCAvKiBnZW5lcmF0ZVByZXZpZXcgKi9cbiAgICAgIChyZW1vdGVPYmplY3QsIHdhc1Rocm93biwgZXJyb3IpID0+IHtcbiAgICAgICAgaXBjLnNlbmRUb0hvc3QoJ25vdGlmaWNhdGlvbicsICdFeHByZXNzaW9uRXZhbHVhdGlvblJlc3BvbnNlJywge1xuICAgICAgICAgIHJlc3VsdDogd2FzVGhyb3duID8gbnVsbCA6IHJlbW90ZU9iamVjdCxcbiAgICAgICAgICBlcnJvcjogIHdhc1Rocm93biA/IGVycm9yIDogbnVsbCxcbiAgICAgICAgICBleHByZXNzaW9uLFxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVEZWJ1Z2dlclBhdXNlZChldmVudDogV2ViSW5zcGVjdG9yJEV2ZW50KSB7XG4gICAgZW5kVGltZXJUcmFja2luZygpO1xuICAgIGlwYy5zZW5kVG9Ib3N0KCdub3RpZmljYXRpb24nLCAnRGVidWdnZXJQYXVzZWQnLCB7fSk7XG4gICAgKyt0aGlzLl9kZWJ1Z2dlclBhdXNlZENvdW50O1xuICAgIGlmICh0aGlzLl9kZWJ1Z2dlclBhdXNlZENvdW50ID09PSAxKSB7XG4gICAgICB0aGlzLl9oYW5kbGVMb2FkZXJCcmVha3BvaW50KCk7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUxvYWRlckJyZWFrcG9pbnQoKSB7XG4gICAgLy8gU3luYyBhbnkgaW5pdGlhbCBicmVha3BvaW50cyB0byBlbmdpbmUgZHVyaW5nIGxvYWRlciBicmVha3BvaW50XG4gICAgLy8gYW5kIGNvbnRpbnVlIGZyb20gaXQuXG4gICAgdGhpcy5fc3luY0JyZWFrcG9pbnRzKCk7XG5cbiAgICAvLyBJZiB3ZSB3ZXJlIHRvIGNvbnRpbnVlIHN5bmNocm9ub3VzbHkgaGVyZSwgdGhlIGRlYnVnZ2VyIHdvdWxkIG5vIGxvbmdlciBiZSBwYXVzZWQgd2hlbiB0aGVcbiAgICAvLyByZW1haW5pbmcgc3Vic2NyaWJlcnMnIGNhbGxiYWNrcyB3ZXJlIGludm9rZWQuIFRoYXQncyBhIHZpb2xhdGlvbiBvZiBhIHByZXR0eSBiYXNpY1xuICAgIC8vIGFzc3VtcHRpb24gKHRoYXQgdGhlIGRlYnVnZ2VyIHdpbGwgYmUgcGF1c2VkIHdoZW4geW91ciBwYXVzZWQgZXZlbnQgY2FsbGJhY2sgaXMgY2FsbGVkKSBzb1xuICAgIC8vIGluc3RlYWQgd2Ugd2FpdCB1bnRpbCB0aGUgbmV4dCB0aWNrLiBJZiB0aGUgZGVidWdnZXIgaXMgc3RpbGwgcGF1c2VkIHRoZW4sIHdlIGNvbnRpbnVlLiBOb3RcbiAgICAvLyBkb2luZyB0aGlzIHJlc3VsdHMgaW4gYW4gXCJSdW50aW1lLmdldFByb3BlcnRpZXMgZmFpbGVkXCIgZXJyb3IgaW4gbm9kZS1pbnNwZWN0b3Igc2luY2UgdGhhdFxuICAgIC8vIGNhbGwgaXMgb25seSB2YWxpZCBkdXJpbmcgYSBwYXVzZWQgc3RhdGUuXG4gICAgcHJvY2Vzcy5uZXh0VGljaygoKSA9PiB7XG4gICAgICBjb25zdCB0YXJnZXRNYW5hZ2VyID0gV2ViSW5zcGVjdG9yICE9IG51bGwgPyBXZWJJbnNwZWN0b3IudGFyZ2V0TWFuYWdlciA6IG51bGw7XG4gICAgICBjb25zdCBtYWluVGFyZ2V0ID0gdGFyZ2V0TWFuYWdlciAhPSBudWxsID8gdGFyZ2V0TWFuYWdlci5tYWluVGFyZ2V0KCkgOiBudWxsO1xuICAgICAgY29uc3QgZGVidWdnZXJNb2RlbCA9IG1haW5UYXJnZXQgIT0gbnVsbCA/IG1haW5UYXJnZXQuZGVidWdnZXJNb2RlbCA6IG51bGw7XG4gICAgICBjb25zdCBzdGlsbFBhdXNlZCA9IGRlYnVnZ2VyTW9kZWwgIT0gbnVsbCAmJiBkZWJ1Z2dlck1vZGVsLmlzUGF1c2VkKCk7XG4gICAgICBpZiAoc3RpbGxQYXVzZWQpIHtcbiAgICAgICAgdGhpcy5fY29udGludWUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9oYW5kbGVEZWJ1Z2dlclJlc3VtZWQoZXZlbnQ6IFdlYkluc3BlY3RvciRFdmVudCkge1xuICAgIGlwYy5zZW5kVG9Ib3N0KCdub3RpZmljYXRpb24nLCAnRGVidWdnZXJSZXN1bWVkJywge30pO1xuICB9XG5cbiAgX2hhbmRsZUJyZWFrcG9pbnRBZGRlZChldmVudDogV2ViSW5zcGVjdG9yJEV2ZW50KSB7XG4gICAgY29uc3QgbG9jYXRpb24gPSBldmVudC5kYXRhLnVpTG9jYXRpb247XG4gICAgdGhpcy5fc2VuZEJyZWFrcG9pbnROb3RpZmljYXRpb24obG9jYXRpb24sICdCcmVha3BvaW50QWRkZWQnKTtcbiAgfVxuXG4gIF9oYW5kbGVCcmVha3BvaW50UmVtb3ZlZChldmVudDogV2ViSW5zcGVjdG9yJEV2ZW50KSB7XG4gICAgY29uc3QgbG9jYXRpb24gPSBldmVudC5kYXRhLnVpTG9jYXRpb247XG4gICAgdGhpcy5fc2VuZEJyZWFrcG9pbnROb3RpZmljYXRpb24obG9jYXRpb24sICdCcmVha3BvaW50UmVtb3ZlZCcpO1xuICB9XG5cbiAgX3NlbmRCcmVha3BvaW50Tm90aWZpY2F0aW9uKGxvY2F0aW9uOiBXZWJJbnNwZWN0b3IkVUlMb2NhdGlvbiwgdHlwZTogQnJlYWtwb2ludE5vdGlmaWNhdGlvblR5cGUpIHtcbiAgICBpZiAoIXRoaXMuX3N1cHByZXNzQnJlYWtwb2ludE5vdGlmaWNhdGlvbikge1xuICAgICAgaXBjLnNlbmRUb0hvc3QoJ25vdGlmaWNhdGlvbicsIHR5cGUsIHtcbiAgICAgICAgc291cmNlVVJMOiBsb2NhdGlvbi51aVNvdXJjZUNvZGUudXJpKCksXG4gICAgICAgIGxpbmVOdW1iZXI6IGxvY2F0aW9uLmxpbmVOdW1iZXIsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPW2plZmZyZXl0YW5dOiB0aGlzIGlzIGEgaGFjayB0byBlbmFibGUgaGh2bS9sbGRiIGRlYnVnZ2VyXG4gIC8vIHNldHRpbmcgYnJlYWtwb2ludHMgaW4gbm9uLXBhcnNlZCBmaWxlcy5cbiAgLy8gT3BlbiBpc3N1ZXM6XG4gIC8vIEFueSBicmVha3BvaW50cyBpbiB0aGlzIGxpc3Qgd2lsbCBzaG93biBhcyBib3VuZC9yZXNvbHZlZDtcbiAgLy8gbmVlZHMgdG8gcmV2aXNpdCB0aGUgdW5yZXNvbHZlZCBicmVha3BvaW50cyBkZXRlY3Rpb24gbG9naWMuXG4gIF9wYXJzZUJyZWFrcG9pbnRTb3VyY2VzKCkge1xuICAgIHRoaXMuX2FsbEJyZWFrcG9pbnRzLmZvckVhY2goYnJlYWtwb2ludCA9PiB7XG4gICAgICBjb25zdCBzb3VyY2VVcmwgPSBicmVha3BvaW50LnNvdXJjZVVSTDtcbiAgICAgIGlmIChzb3VyY2VVcmwuZW5kc1dpdGgoJy5waHAnKSB8fFxuICAgICAgICAgIHNvdXJjZVVybC5lbmRzV2l0aCgnLmhoJykgIHx8XG4gICAgICAgICAgc291cmNlVXJsLmVuZHNXaXRoKCcuYycpIHx8XG4gICAgICAgICAgc291cmNlVXJsLmVuZHNXaXRoKCcuY3BwJykgfHxcbiAgICAgICAgICBzb3VyY2VVcmwuZW5kc1dpdGgoJy5oJykgfHxcbiAgICAgICAgICBzb3VyY2VVcmwuZW5kc1dpdGgoJy5ocHAnKSB8fFxuICAgICAgICAgIHNvdXJjZVVybC5lbmRzV2l0aCgnLm0nKSB8fFxuICAgICAgICAgIHNvdXJjZVVybC5lbmRzV2l0aCgnLm1tJykpIHtcbiAgICAgICAgY29uc3Qgc291cmNlID0gV2ViSW5zcGVjdG9yLndvcmtzcGFjZS51aVNvdXJjZUNvZGVGb3JPcmlnaW5VUkwoc291cmNlVXJsKTtcbiAgICAgICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgICAgICBjb25zdCB0YXJnZXQgPSBXZWJJbnNwZWN0b3IudGFyZ2V0TWFuYWdlci5tYWluVGFyZ2V0KCk7XG4gICAgICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICAgICAgdGFyZ2V0LmRlYnVnZ2VyTW9kZWwuX3BhcnNlZFNjcmlwdFNvdXJjZShcbiAgICAgICAgICAgICAgc291cmNlVXJsLFxuICAgICAgICAgICAgICBzb3VyY2VVcmwsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gU3luY2hyb25pemVzIG51Y2xpZGUgQnJlYWtwb2ludFN0b3JlIGFuZCBCcmVha3BvaW50TWFuYWdlclxuICBfc3luY0JyZWFrcG9pbnRzKCkge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLl9zdXBwcmVzc0JyZWFrcG9pbnROb3RpZmljYXRpb24gPSB0cnVlO1xuICAgICAgdGhpcy5fdW5yZXNvbHZlZEJyZWFrcG9pbnRzID0gbmV3IE11bHRpbWFwKCk7XG5cbiAgICAgIGNvbnN0IG5ld0JyZWFrcG9pbnRTZXQgPSBuZXcgU2V0KHRoaXMuX2FsbEJyZWFrcG9pbnRzLm1hcChicmVha3BvaW50ID0+XG4gICAgICAgIGZvcm1hdEJyZWFrcG9pbnRLZXkoYnJlYWtwb2ludC5zb3VyY2VVUkwsIGJyZWFrcG9pbnQubGluZU51bWJlcikpKTtcblxuICAgICAgLy8gUmVtb3ZpbmcgdW5saXN0ZWQgYnJlYWtwb2ludHMgYW5kIG1hcmsgdGhlIG9uZXMgdGhhdCBhbHJlYWR5IGV4aXN0LlxuICAgICAgY29uc3QgdW5jaGFuZ2VkQnJlYWtwb2ludFNldCA9IG5ldyBTZXQoKTtcbiAgICAgIGNvbnN0IGV4aXN0aW5nQnJlYWtwb2ludHMgPSBXZWJJbnNwZWN0b3IuYnJlYWtwb2ludE1hbmFnZXIuYWxsQnJlYWtwb2ludHMoKTtcbiAgICAgIGV4aXN0aW5nQnJlYWtwb2ludHMuZm9yRWFjaChleGlzdGluZ0JyZWFrcG9pbnQgPT4ge1xuICAgICAgICBjb25zdCBzb3VyY2UgPSBleGlzdGluZ0JyZWFrcG9pbnQudWlTb3VyY2VDb2RlKCk7XG4gICAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgICBjb25zdCBrZXkgPSBmb3JtYXRCcmVha3BvaW50S2V5KHNvdXJjZS51cmkoKSwgZXhpc3RpbmdCcmVha3BvaW50LmxpbmVOdW1iZXIoKSk7XG4gICAgICAgICAgaWYgKG5ld0JyZWFrcG9pbnRTZXQuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIHVuY2hhbmdlZEJyZWFrcG9pbnRTZXQuYWRkKGtleSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGV4aXN0aW5nQnJlYWtwb2ludC5yZW1vdmUoZmFsc2UpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX3BhcnNlQnJlYWtwb2ludFNvdXJjZXMoKTtcblxuICAgICAgLy8gQWRkIHRoZSBvbmVzIHRoYXQgZG9uJ3QuXG4gICAgICB0aGlzLl9hbGxCcmVha3BvaW50cy5mb3JFYWNoKGJyZWFrcG9pbnQgPT4ge1xuICAgICAgICBjb25zdCBrZXkgPSBmb3JtYXRCcmVha3BvaW50S2V5KGJyZWFrcG9pbnQuc291cmNlVVJMLCBicmVha3BvaW50LmxpbmVOdW1iZXIpO1xuICAgICAgICBpZiAoIXVuY2hhbmdlZEJyZWFrcG9pbnRTZXQuaGFzKGtleSkpIHtcbiAgICAgICAgICBjb25zdCBzb3VyY2UgPSBXZWJJbnNwZWN0b3Iud29ya3NwYWNlLnVpU291cmNlQ29kZUZvck9yaWdpblVSTChicmVha3BvaW50LnNvdXJjZVVSTCk7XG4gICAgICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICAgICAgV2ViSW5zcGVjdG9yLmJyZWFrcG9pbnRNYW5hZ2VyLnNldEJyZWFrcG9pbnQoXG4gICAgICAgICAgICAgIHNvdXJjZSxcbiAgICAgICAgICAgICAgYnJlYWtwb2ludC5saW5lTnVtYmVyLFxuICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAnJyxcbiAgICAgICAgICAgICAgdHJ1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE5vIEFQSSBleGlzdHMgZm9yIGFkZGluZyBicmVha3BvaW50cyB0byBzb3VyY2UgZmlsZXMgdGhhdCBhcmUgbm90XG4gICAgICAgICAgICAvLyB5ZXQga25vd24sIHN0b3JlIGl0IGxvY2FsbHkgYW5kIHRyeSB0byBhZGQgdGhlbSBsYXRlci5cbiAgICAgICAgICAgIHRoaXMuX3VucmVzb2x2ZWRCcmVha3BvaW50cy5zZXQoYnJlYWtwb2ludC5zb3VyY2VVUkwsIGJyZWFrcG9pbnQubGluZU51bWJlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCd1bnJlc29sdmVkLWJyZWFrcG9pbnRzLWNoYW5nZWQnLCBudWxsKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50Tm90aWZpY2F0aW9uID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgX2NvbnRpbnVlKCk6IHZvaWQge1xuICAgIGNvbnN0IHRhcmdldCA9IFdlYkluc3BlY3Rvci50YXJnZXRNYW5hZ2VyLm1haW5UYXJnZXQoKTtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICBiZWdpblRpbWVyVHJhY2tpbmcoJ251Y2xpZGUtZGVidWdnZXItYXRvbTpjb250aW51ZScpO1xuICAgICAgdGFyZ2V0LmRlYnVnZ2VyTW9kZWwucmVzdW1lKCk7XG4gICAgfVxuICB9XG5cbiAgX3N0ZXBPdmVyKCk6IHZvaWQge1xuICAgIGNvbnN0IHRhcmdldCA9IFdlYkluc3BlY3Rvci50YXJnZXRNYW5hZ2VyLm1haW5UYXJnZXQoKTtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICBiZWdpblRpbWVyVHJhY2tpbmcoJ251Y2xpZGUtZGVidWdnZXItYXRvbTpzdGVwT3ZlcicpO1xuICAgICAgdGFyZ2V0LmRlYnVnZ2VyTW9kZWwuc3RlcE92ZXIoKTtcbiAgICB9XG4gIH1cblxuICBfc3RlcEludG8oKTogdm9pZCB7XG4gICAgY29uc3QgdGFyZ2V0ID0gV2ViSW5zcGVjdG9yLnRhcmdldE1hbmFnZXIubWFpblRhcmdldCgpO1xuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIGJlZ2luVGltZXJUcmFja2luZygnbnVjbGlkZS1kZWJ1Z2dlci1hdG9tOnN0ZXBJbnRvJyk7XG4gICAgICB0YXJnZXQuZGVidWdnZXJNb2RlbC5zdGVwSW50bygpO1xuICAgIH1cbiAgfVxuXG4gIF9zdGVwT3V0KCk6IHZvaWQge1xuICAgIGNvbnN0IHRhcmdldCA9IFdlYkluc3BlY3Rvci50YXJnZXRNYW5hZ2VyLm1haW5UYXJnZXQoKTtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICBiZWdpblRpbWVyVHJhY2tpbmcoJ251Y2xpZGUtZGVidWdnZXItYXRvbTpzdGVwT3V0Jyk7XG4gICAgICB0YXJnZXQuZGVidWdnZXJNb2RlbC5zdGVwT3V0KCk7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZVVJU291cmNlQ29kZUFkZGVkKGV2ZW50OiBPYmplY3QpIHtcbiAgICBjb25zdCBzb3VyY2UgPSBldmVudC5kYXRhO1xuICAgIHRoaXMuX3VucmVzb2x2ZWRCcmVha3BvaW50cy5nZXQoc291cmNlLnVyaSgpKS5mb3JFYWNoKGxpbmUgPT4ge1xuICAgICAgV2ViSW5zcGVjdG9yLmJyZWFrcG9pbnRNYW5hZ2VyLnNldEJyZWFrcG9pbnQoc291cmNlLCBsaW5lICwgMCwgJycsIHRydWUpO1xuICAgIH0pO1xuICAgIGlmICh0aGlzLl91bnJlc29sdmVkQnJlYWtwb2ludHMuZGVsZXRlQWxsKHNvdXJjZS51cmkoKSkpIHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgndW5yZXNvbHZlZC1icmVha3BvaW50cy1jaGFuZ2VkJywgbnVsbCk7XG4gICAgfVxuICB9XG5cbiAgb25VbnJlc29sdmVkQnJlYWtwb2ludHNDaGFuZ2VkKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCd1bnJlc29sdmVkLWJyZWFrcG9pbnRzLWNoYW5nZWQnLCBjYWxsYmFjayk7XG4gIH1cblxuICBnZXRVbnJlc29sdmVkQnJlYWtwb2ludHNMaXN0KCk6IHt1cmw6IHN0cmluZzsgbGluZTogbnVtYmVyfVtdIHtcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICB0aGlzLl91bnJlc29sdmVkQnJlYWtwb2ludHMuZm9yRWFjaCgobGluZSwgdXJsKSA9PiB7XG4gICAgICByZXN1bHQucHVzaCh7dXJsLCBsaW5lfSk7XG4gICAgfSk7XG4gICAgcmVzdWx0LnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIGlmIChhLnVybCA8IGIudXJsKSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH0gZWxzZSBpZiAoYS51cmwgPiBiLnVybCkge1xuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBhLmxpbmUgLSBiLmxpbmU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBOdWNsaWRlQnJpZGdlKCk7XG4iXX0=