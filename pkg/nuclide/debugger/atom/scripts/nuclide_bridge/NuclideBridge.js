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
    key: '_handleDebuggerPaused',
    value: function _handleDebuggerPaused(event) {
      (0, _libAnalyticsHelper.endTimerTracking)();
      ++this._debuggerPausedCount;
      if (this._debuggerPausedCount === 1) {
        this._handleLoaderBreakpoint();
      }
    }
  }, {
    key: '_handleLoaderBreakpoint',
    value: function _handleLoaderBreakpoint() {
      // Sync any initial breakpoints to engine during loader breakpoint
      // and continue from it.
      this._syncBreakpoints();
      this._continue();
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

    // TODO[jeffreytan]: this is a hack to enable hhvm debugger
    // setting breakpoints in non-parsed files.
    // Open issues:
    // Any breakpoints in php file will shown as bound/resolved;
    // needs to revisit the unresolved breakpoints detection logic.
  }, {
    key: '_parseBreakpointSources',
    value: function _parseBreakpointSources() {
      this._allBreakpoints.forEach(function (breakpoint) {
        var sourceUrl = breakpoint.sourceURL;
        // TODO[jeffreytan]: investigate if we need to do the same for LLDB or not.
        if (sourceUrl.endsWith('.php') || sourceUrl.endsWith('.hh')) {
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
      var _this = this;

      try {
        (function () {
          _this._suppressBreakpointNotification = true;
          _this._unresolvedBreakpoints = new Multimap();

          var newBreakpointSet = new Set(_this._allBreakpoints.map(function (breakpoint) {
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

          _this._parseBreakpointSources();

          // Add the ones that don't.
          _this._allBreakpoints.forEach(function (breakpoint) {
            var key = formatBreakpointKey(breakpoint.sourceURL, breakpoint.lineNumber);
            if (!unchangedBreakpointSet.has(key)) {
              var source = WebInspector.workspace.uiSourceCodeForOriginURL(breakpoint.sourceURL);
              if (source) {
                WebInspector.breakpointManager.setBreakpoint(source, breakpoint.lineNumber, 0, '', true);
              } else {
                // No API exists for adding breakpoints to source files that are not
                // yet known, store it locally and try to add them later.
                _this._unresolvedBreakpoints.set(breakpoint.sourceURL, breakpoint.lineNumber);
              }
            }
          });

          _this._emitter.emit('unresolved-breakpoints-changed', null);
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
//# sourceMappingURL=data:application/json;base64,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Q0FBQztLQUNmOzs7U0FuVkcsYUFBYTs7O0FBc1ZuQixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksYUFBYSxFQUFFLENBQUMiLCJmaWxlIjoiTnVjbGlkZUJyaWRnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IEVtaXR0ZXIgPSByZXF1aXJlKCcuL0VtaXR0ZXInKTtcbmNvbnN0IE11bHRpbWFwID0gcmVxdWlyZSgnLi4vLi4vbGliL011bHRpbWFwJyk7XG5jb25zdCBpcGMgPSByZXF1aXJlKCdpcGMnKTtcbmltcG9ydCB7YmVnaW5UaW1lclRyYWNraW5nLCBlbmRUaW1lclRyYWNraW5nfSBmcm9tICcuLi8uLi9saWIvQW5hbHl0aWNzSGVscGVyJztcblxuY29uc3QgV2ViSW5zcGVjdG9yOiB0eXBlb2YgV2ViSW5zcGVjdG9yID0gd2luZG93LldlYkluc3BlY3RvcjtcblxuLyoqXG4gICogR2VuZXJhdGVzIGEgc3RyaW5nIGZyb20gYSBicmVha3BvaW50IHRoYXQgY2FuIGJlIHVzZWQgaW4gaGFzaGVkXG4gICogY29udGFpbmVycy5cbiAgKi9cbmZ1bmN0aW9uIGZvcm1hdEJyZWFrcG9pbnRLZXkodXJsOiBzdHJpbmcsIGxpbmU6IG51bWJlcik6IHN0cmluZyB7XG4gIHJldHVybiB1cmwgKyAnOicgKyBsaW5lO1xufVxuXG50eXBlIEJyZWFrcG9pbnROb3RpZmljYXRpb25UeXBlID0gJ0JyZWFrcG9pbnRBZGRlZCcgfCAnQnJlYWtwb2ludFJlbW92ZWQnO1xuXG5jbGFzcyBOdWNsaWRlQnJpZGdlIHtcbiAgX2FsbEJyZWFrcG9pbnRzOiB7c291cmNlVVJMOiBzdHJpbmc7IGxpbmVOdW1iZXI6IG51bWJlcn1bXTtcbiAgX3VucmVzb2x2ZWRCcmVha3BvaW50czogTXVsdGltYXA8c3RyaW5nLCBudW1iZXI+O1xuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX2RlYnVnZ2VyUGF1c2VkQ291bnQ6IG51bWJlcjtcbiAgX3N1cHByZXNzQnJlYWtwb2ludE5vdGlmaWNhdGlvbjogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9hbGxCcmVha3BvaW50cyA9IFtdO1xuICAgIHRoaXMuX3VucmVzb2x2ZWRCcmVha3BvaW50cyA9IG5ldyBNdWx0aW1hcCgpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX2RlYnVnZ2VyUGF1c2VkQ291bnQgPSAwO1xuICAgIHRoaXMuX3N1cHByZXNzQnJlYWtwb2ludE5vdGlmaWNhdGlvbiA9IGZhbHNlO1xuXG4gICAgaXBjLm9uKCdjb21tYW5kJywgdGhpcy5faGFuZGxlSXBjQ29tbWFuZC5iaW5kKHRoaXMpKTtcblxuICAgIFdlYkluc3BlY3Rvci50YXJnZXRNYW5hZ2VyLmFkZE1vZGVsTGlzdGVuZXIoXG4gICAgICBXZWJJbnNwZWN0b3IuRGVidWdnZXJNb2RlbCxcbiAgICAgIFdlYkluc3BlY3Rvci5EZWJ1Z2dlck1vZGVsLkV2ZW50cy5DYWxsRnJhbWVTZWxlY3RlZCxcbiAgICAgIHRoaXMuX2hhbmRsZUNhbGxGcmFtZVNlbGVjdGVkLFxuICAgICAgdGhpcyk7XG5cbiAgICBXZWJJbnNwZWN0b3IudGFyZ2V0TWFuYWdlci5hZGRNb2RlbExpc3RlbmVyKFxuICAgICAgV2ViSW5zcGVjdG9yLkRlYnVnZ2VyTW9kZWwsXG4gICAgICBXZWJJbnNwZWN0b3IuRGVidWdnZXJNb2RlbC5FdmVudHMuRGVidWdnZXJSZXN1bWVkLFxuICAgICAgdGhpcy5faGFuZGxlRGVidWdnZXJSZXN1bWVkLFxuICAgICAgdGhpcyk7XG5cbiAgICBXZWJJbnNwZWN0b3IudGFyZ2V0TWFuYWdlci5hZGRNb2RlbExpc3RlbmVyKFxuICAgICAgV2ViSW5zcGVjdG9yLkRlYnVnZ2VyTW9kZWwsXG4gICAgICBXZWJJbnNwZWN0b3IuRGVidWdnZXJNb2RlbC5FdmVudHMuRGVidWdnZXJQYXVzZWQsXG4gICAgICB0aGlzLl9oYW5kbGVEZWJ1Z2dlclBhdXNlZCxcbiAgICAgIHRoaXMpO1xuXG4gICAgV2ViSW5zcGVjdG9yLndvcmtzcGFjZS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgV2ViSW5zcGVjdG9yLldvcmtzcGFjZS5FdmVudHMuVUlTb3VyY2VDb2RlQWRkZWQsXG4gICAgICB0aGlzLl9oYW5kbGVVSVNvdXJjZUNvZGVBZGRlZCxcbiAgICAgIHRoaXMpO1xuXG4gICAgV2ViSW5zcGVjdG9yLm5vdGlmaWNhdGlvbnMuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFdlYkluc3BlY3Rvci5Vc2VyTWV0cmljcy5Vc2VyQWN0aW9uLFxuICAgICAgZnVuY3Rpb24oZXZlbnQ6IFdlYkluc3BlY3Rvci5FdmVudCkge1xuICAgICAgICBpZiAoZXZlbnQuZGF0YS5hY3Rpb24gPT09ICdvcGVuU291cmNlTGluaycpIHtcbiAgICAgICAgICB0aGlzLl9oYW5kbGVPcGVuU291cmNlTG9jYXRpb24oZXZlbnQpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdGhpcyk7XG5cbiAgICBXZWJJbnNwZWN0b3IuYnJlYWtwb2ludE1hbmFnZXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFdlYkluc3BlY3Rvci5CcmVha3BvaW50TWFuYWdlci5FdmVudHMuQnJlYWtwb2ludEFkZGVkLFxuICAgICAgdGhpcy5faGFuZGxlQnJlYWtwb2ludEFkZGVkLFxuICAgICAgdGhpcyk7XG5cbiAgICBXZWJJbnNwZWN0b3IuYnJlYWtwb2ludE1hbmFnZXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFdlYkluc3BlY3Rvci5CcmVha3BvaW50TWFuYWdlci5FdmVudHMuQnJlYWtwb2ludFJlbW92ZWQsXG4gICAgICB0aGlzLl9oYW5kbGVCcmVha3BvaW50UmVtb3ZlZCxcbiAgICAgIHRoaXMpO1xuXG4gICAgdGhpcy5fY3VzdG9taXplV2ViSW5zcGVjdG9yKCk7XG4gICAgd2luZG93LnJ1bk9uV2luZG93TG9hZCh0aGlzLl9oYW5kbGVXaW5kb3dMb2FkLmJpbmQodGhpcykpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlIGFuZCBjdXN0b21pemUgc29tZSBmdW5jdGlvbmFsaXRpZXMgb2YgV2ViSW5zcGVjdG9yLlxuICAgKiBEZWxpYmVyYXRlbHkgc3VwcHJlc3MgYW55IGZsb3cgZXJyb3JzIGluIHRoaXMgbWV0aG9kLlxuICAgKi9cbiAgX2N1c3RvbWl6ZVdlYkluc3BlY3RvcigpIHtcbiAgICAvLyAkRmxvd0ZpeE1lLlxuICAgIFdlYkluc3BlY3Rvci5PYmplY3RQcm9wZXJ0eVRyZWVFbGVtZW50Ll9wb3B1bGF0ZSA9XG4gICAgICBmdW5jdGlvbih0cmVlRWxlbWVudCwgdmFsdWUsIHNraXBQcm90bywgZW1wdHlQbGFjZWhvbGRlcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHs/QXJyYXkuPCFXZWJJbnNwZWN0b3IuUmVtb3RlT2JqZWN0UHJvcGVydHk+fSBwcm9wZXJ0aWVzXG4gICAgICAgICAqIEBwYXJhbSB7P0FycmF5LjwhV2ViSW5zcGVjdG9yLlJlbW90ZU9iamVjdFByb3BlcnR5Pn0gaW50ZXJuYWxQcm9wZXJ0aWVzXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBjYWxsYmFjayhwcm9wZXJ0aWVzLCBpbnRlcm5hbFByb3BlcnRpZXMpXG4gICAgICAgIHtcbiAgICAgICAgICB0cmVlRWxlbWVudC5yZW1vdmVDaGlsZHJlbigpO1xuICAgICAgICAgIGlmICghcHJvcGVydGllcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyAkRmxvd0ZpeE1lLlxuICAgICAgICAgIFdlYkluc3BlY3Rvci5PYmplY3RQcm9wZXJ0eVRyZWVFbGVtZW50LnBvcHVsYXRlV2l0aFByb3BlcnRpZXMoXG4gICAgICAgICAgICB0cmVlRWxlbWVudCxcbiAgICAgICAgICAgIHByb3BlcnRpZXMsXG4gICAgICAgICAgICBpbnRlcm5hbFByb3BlcnRpZXMsXG4gICAgICAgICAgICBza2lwUHJvdG8sXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIGVtcHR5UGxhY2Vob2xkZXJcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIC8vICRGbG93Rml4TWUuXG4gICAgICAgIFdlYkluc3BlY3Rvci5SZW1vdGVPYmplY3QubG9hZEZyb21PYmplY3RQZXJQcm90byh2YWx1ZSwgY2FsbGJhY2spO1xuICAgICAgfTtcblxuICAgIC8vICRGbG93Rml4TWUuXG4gICAgV2ViSW5zcGVjdG9yLk9iamVjdFByb3BlcnRpZXNTZWN0aW9uLnByb3RvdHlwZS51cGRhdGUgPVxuICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gez9BcnJheS48IVdlYkluc3BlY3Rvci5SZW1vdGVPYmplY3RQcm9wZXJ0eT59IHByb3BlcnRpZXNcbiAgICAgICAgICogQHBhcmFtIHs/QXJyYXkuPCFXZWJJbnNwZWN0b3IuUmVtb3RlT2JqZWN0UHJvcGVydHk+fSBpbnRlcm5hbFByb3BlcnRpZXNcbiAgICAgICAgICogQHRoaXMge1dlYkluc3BlY3Rvci5PYmplY3RQcm9wZXJ0aWVzU2VjdGlvbn1cbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGNhbGxiYWNrKHByb3BlcnRpZXMsIGludGVybmFsUHJvcGVydGllcykge1xuICAgICAgICAgIGlmICghcHJvcGVydGllcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnVwZGF0ZVByb3BlcnRpZXMocHJvcGVydGllcywgaW50ZXJuYWxQcm9wZXJ0aWVzKTtcbiAgICAgICAgfVxuICAgICAgICAvLyAkRmxvd0ZpeE1lLlxuICAgICAgICBXZWJJbnNwZWN0b3IuUmVtb3RlT2JqZWN0LmxvYWRGcm9tT2JqZWN0KFxuICAgICAgICAgIHRoaXMub2JqZWN0LFxuICAgICAgICAgICEhdGhpcy5pZ25vcmVIYXNPd25Qcm9wZXJ0eSxcbiAgICAgICAgICBjYWxsYmFjay5iaW5kKHRoaXMpXG4gICAgICAgICk7XG4gICAgICB9O1xuICB9XG5cbiAgX2hhbmRsZVdpbmRvd0xvYWQoKSB7XG4gICAgaXBjLnNlbmRUb0hvc3QoJ25vdGlmaWNhdGlvbicsICdyZWFkeScpO1xuICB9XG5cbiAgX2hhbmRsZUlwY0NvbW1hbmQoY29tbWFuZDogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkge1xuICAgIHN3aXRjaCAoY29tbWFuZCkge1xuICAgICAgY2FzZSAnU3luY0JyZWFrcG9pbnRzJzpcbiAgICAgICAgdGhpcy5fYWxsQnJlYWtwb2ludHMgPSBhcmdzWzBdO1xuICAgICAgICB0aGlzLl9zeW5jQnJlYWtwb2ludHMoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdDb250aW51ZSc6XG4gICAgICAgIHRoaXMuX2NvbnRpbnVlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnU3RlcE92ZXInOlxuICAgICAgICB0aGlzLl9zdGVwT3ZlcigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ1N0ZXBJbnRvJzpcbiAgICAgICAgdGhpcy5fc3RlcEludG8oKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdTdGVwT3V0JzpcbiAgICAgICAgdGhpcy5fc3RlcE91dCgpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlQ2FsbEZyYW1lU2VsZWN0ZWQoZXZlbnQ6IFdlYkluc3BlY3Rvci5FdmVudCkge1xuICAgIGNvbnN0IGZyYW1lOiBXZWJJbnNwZWN0b3IkQ2FsbEZyYW1lID0gZXZlbnQuZGF0YTtcbiAgICBjb25zdCB1aUxvY2F0aW9uID1cbiAgICAgIFdlYkluc3BlY3Rvci5kZWJ1Z2dlcldvcmtzcGFjZUJpbmRpbmcucmF3TG9jYXRpb25Ub1VJTG9jYXRpb24oZnJhbWUubG9jYXRpb24oKSk7XG4gICAgaXBjLnNlbmRUb0hvc3QoJ25vdGlmaWNhdGlvbicsICdDYWxsRnJhbWVTZWxlY3RlZCcsIHtcbiAgICAgIHNvdXJjZVVSTDogdWlMb2NhdGlvbi51aVNvdXJjZUNvZGUudXJpKCksXG4gICAgICBsaW5lTnVtYmVyOiB1aUxvY2F0aW9uLmxpbmVOdW1iZXIsXG4gICAgfSk7XG4gIH1cblxuICBfaGFuZGxlT3BlblNvdXJjZUxvY2F0aW9uKGV2ZW50OiBXZWJJbnNwZWN0b3IuRXZlbnQpIHtcbiAgICBjb25zdCBldmVudERhdGEgPSBldmVudC5kYXRhO1xuICAgIHRoaXMuc2VuZE9wZW5Tb3VyY2VMb2NhdGlvbihldmVudERhdGEudXJsLCBldmVudERhdGEubGluZU51bWJlcik7XG4gIH1cblxuICBzZW5kT3BlblNvdXJjZUxvY2F0aW9uKHNvdXJjZVVSTDogc3RyaW5nLCBsaW5lOiBudW1iZXIpIHtcbiAgICBpcGMuc2VuZFRvSG9zdCgnbm90aWZpY2F0aW9uJywgJ09wZW5Tb3VyY2VMb2NhdGlvbicsIHtcbiAgICAgIHNvdXJjZVVSTDogc291cmNlVVJMLFxuICAgICAgbGluZU51bWJlcjogbGluZSxcbiAgICB9KTtcbiAgfVxuXG4gIF9oYW5kbGVEZWJ1Z2dlclBhdXNlZChldmVudDogV2ViSW5zcGVjdG9yJEV2ZW50KSB7XG4gICAgZW5kVGltZXJUcmFja2luZygpO1xuICAgICsrdGhpcy5fZGVidWdnZXJQYXVzZWRDb3VudDtcbiAgICBpZiAodGhpcy5fZGVidWdnZXJQYXVzZWRDb3VudCA9PT0gMSkge1xuICAgICAgdGhpcy5faGFuZGxlTG9hZGVyQnJlYWtwb2ludCgpO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVMb2FkZXJCcmVha3BvaW50KCkge1xuICAgIC8vIFN5bmMgYW55IGluaXRpYWwgYnJlYWtwb2ludHMgdG8gZW5naW5lIGR1cmluZyBsb2FkZXIgYnJlYWtwb2ludFxuICAgIC8vIGFuZCBjb250aW51ZSBmcm9tIGl0LlxuICAgIHRoaXMuX3N5bmNCcmVha3BvaW50cygpO1xuICAgIHRoaXMuX2NvbnRpbnVlKCk7XG4gIH1cblxuICBfaGFuZGxlRGVidWdnZXJSZXN1bWVkKGV2ZW50OiBXZWJJbnNwZWN0b3IkRXZlbnQpIHtcbiAgICBpcGMuc2VuZFRvSG9zdCgnbm90aWZpY2F0aW9uJywgJ0RlYnVnZ2VyUmVzdW1lZCcsIHt9KTtcbiAgfVxuXG4gIF9oYW5kbGVCcmVha3BvaW50QWRkZWQoZXZlbnQ6IFdlYkluc3BlY3RvciRFdmVudCkge1xuICAgIGNvbnN0IGxvY2F0aW9uID0gZXZlbnQuZGF0YS51aUxvY2F0aW9uO1xuICAgIHRoaXMuX3NlbmRCcmVha3BvaW50Tm90aWZpY2F0aW9uKGxvY2F0aW9uLCAnQnJlYWtwb2ludEFkZGVkJyk7XG4gIH1cblxuICBfaGFuZGxlQnJlYWtwb2ludFJlbW92ZWQoZXZlbnQ6IFdlYkluc3BlY3RvciRFdmVudCkge1xuICAgIGNvbnN0IGxvY2F0aW9uID0gZXZlbnQuZGF0YS51aUxvY2F0aW9uO1xuICAgIHRoaXMuX3NlbmRCcmVha3BvaW50Tm90aWZpY2F0aW9uKGxvY2F0aW9uLCAnQnJlYWtwb2ludFJlbW92ZWQnKTtcbiAgfVxuXG4gIF9zZW5kQnJlYWtwb2ludE5vdGlmaWNhdGlvbihsb2NhdGlvbjogV2ViSW5zcGVjdG9yJFVJTG9jYXRpb24sIHR5cGU6IEJyZWFrcG9pbnROb3RpZmljYXRpb25UeXBlKSB7XG4gICAgaWYgKCF0aGlzLl9zdXBwcmVzc0JyZWFrcG9pbnROb3RpZmljYXRpb24pIHtcbiAgICAgIGlwYy5zZW5kVG9Ib3N0KCdub3RpZmljYXRpb24nLCB0eXBlLCB7XG4gICAgICAgIHNvdXJjZVVSTDogbG9jYXRpb24udWlTb3VyY2VDb2RlLnVyaSgpLFxuICAgICAgICBsaW5lTnVtYmVyOiBsb2NhdGlvbi5saW5lTnVtYmVyLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gVE9ET1tqZWZmcmV5dGFuXTogdGhpcyBpcyBhIGhhY2sgdG8gZW5hYmxlIGhodm0gZGVidWdnZXJcbiAgLy8gc2V0dGluZyBicmVha3BvaW50cyBpbiBub24tcGFyc2VkIGZpbGVzLlxuICAvLyBPcGVuIGlzc3VlczpcbiAgLy8gQW55IGJyZWFrcG9pbnRzIGluIHBocCBmaWxlIHdpbGwgc2hvd24gYXMgYm91bmQvcmVzb2x2ZWQ7XG4gIC8vIG5lZWRzIHRvIHJldmlzaXQgdGhlIHVucmVzb2x2ZWQgYnJlYWtwb2ludHMgZGV0ZWN0aW9uIGxvZ2ljLlxuICBfcGFyc2VCcmVha3BvaW50U291cmNlcygpIHtcbiAgICB0aGlzLl9hbGxCcmVha3BvaW50cy5mb3JFYWNoKGJyZWFrcG9pbnQgPT4ge1xuICAgICAgY29uc3Qgc291cmNlVXJsID0gYnJlYWtwb2ludC5zb3VyY2VVUkw7XG4gICAgICAvLyBUT0RPW2plZmZyZXl0YW5dOiBpbnZlc3RpZ2F0ZSBpZiB3ZSBuZWVkIHRvIGRvIHRoZSBzYW1lIGZvciBMTERCIG9yIG5vdC5cbiAgICAgIGlmIChzb3VyY2VVcmwuZW5kc1dpdGgoJy5waHAnKSB8fCBzb3VyY2VVcmwuZW5kc1dpdGgoJy5oaCcpKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IFdlYkluc3BlY3Rvci53b3Jrc3BhY2UudWlTb3VyY2VDb2RlRm9yT3JpZ2luVVJMKHNvdXJjZVVybCk7XG4gICAgICAgIGlmICghc291cmNlKSB7XG4gICAgICAgICAgY29uc3QgdGFyZ2V0ID0gV2ViSW5zcGVjdG9yLnRhcmdldE1hbmFnZXIubWFpblRhcmdldCgpO1xuICAgICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICAgIHRhcmdldC5kZWJ1Z2dlck1vZGVsLl9wYXJzZWRTY3JpcHRTb3VyY2UoXG4gICAgICAgICAgICAgIHNvdXJjZVVybCxcbiAgICAgICAgICAgICAgc291cmNlVXJsLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vIFN5bmNocm9uaXplcyBudWNsaWRlIEJyZWFrcG9pbnRTdG9yZSBhbmQgQnJlYWtwb2ludE1hbmFnZXJcbiAgX3N5bmNCcmVha3BvaW50cygpIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50Tm90aWZpY2F0aW9uID0gdHJ1ZTtcbiAgICAgIHRoaXMuX3VucmVzb2x2ZWRCcmVha3BvaW50cyA9IG5ldyBNdWx0aW1hcCgpO1xuXG4gICAgICBjb25zdCBuZXdCcmVha3BvaW50U2V0ID0gbmV3IFNldCh0aGlzLl9hbGxCcmVha3BvaW50cy5tYXAoYnJlYWtwb2ludCA9PlxuICAgICAgICBmb3JtYXRCcmVha3BvaW50S2V5KGJyZWFrcG9pbnQuc291cmNlVVJMLCBicmVha3BvaW50LmxpbmVOdW1iZXIpKSk7XG5cbiAgICAgIC8vIFJlbW92aW5nIHVubGlzdGVkIGJyZWFrcG9pbnRzIGFuZCBtYXJrIHRoZSBvbmVzIHRoYXQgYWxyZWFkeSBleGlzdC5cbiAgICAgIGNvbnN0IHVuY2hhbmdlZEJyZWFrcG9pbnRTZXQgPSBuZXcgU2V0KCk7XG4gICAgICBjb25zdCBleGlzdGluZ0JyZWFrcG9pbnRzID0gV2ViSW5zcGVjdG9yLmJyZWFrcG9pbnRNYW5hZ2VyLmFsbEJyZWFrcG9pbnRzKCk7XG4gICAgICBleGlzdGluZ0JyZWFrcG9pbnRzLmZvckVhY2goZXhpc3RpbmdCcmVha3BvaW50ID0+IHtcbiAgICAgICAgY29uc3Qgc291cmNlID0gZXhpc3RpbmdCcmVha3BvaW50LnVpU291cmNlQ29kZSgpO1xuICAgICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgICAgY29uc3Qga2V5ID0gZm9ybWF0QnJlYWtwb2ludEtleShzb3VyY2UudXJpKCksIGV4aXN0aW5nQnJlYWtwb2ludC5saW5lTnVtYmVyKCkpO1xuICAgICAgICAgIGlmIChuZXdCcmVha3BvaW50U2V0LmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB1bmNoYW5nZWRCcmVha3BvaW50U2V0LmFkZChrZXkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBleGlzdGluZ0JyZWFrcG9pbnQucmVtb3ZlKGZhbHNlKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9wYXJzZUJyZWFrcG9pbnRTb3VyY2VzKCk7XG5cbiAgICAgIC8vIEFkZCB0aGUgb25lcyB0aGF0IGRvbid0LlxuICAgICAgdGhpcy5fYWxsQnJlYWtwb2ludHMuZm9yRWFjaChicmVha3BvaW50ID0+IHtcbiAgICAgICAgY29uc3Qga2V5ID0gZm9ybWF0QnJlYWtwb2ludEtleShicmVha3BvaW50LnNvdXJjZVVSTCwgYnJlYWtwb2ludC5saW5lTnVtYmVyKTtcbiAgICAgICAgaWYgKCF1bmNoYW5nZWRCcmVha3BvaW50U2V0LmhhcyhrZXkpKSB7XG4gICAgICAgICAgY29uc3Qgc291cmNlID0gV2ViSW5zcGVjdG9yLndvcmtzcGFjZS51aVNvdXJjZUNvZGVGb3JPcmlnaW5VUkwoYnJlYWtwb2ludC5zb3VyY2VVUkwpO1xuICAgICAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgICAgIFdlYkluc3BlY3Rvci5icmVha3BvaW50TWFuYWdlci5zZXRCcmVha3BvaW50KFxuICAgICAgICAgICAgICBzb3VyY2UsXG4gICAgICAgICAgICAgIGJyZWFrcG9pbnQubGluZU51bWJlcixcbiAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAgIHRydWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBObyBBUEkgZXhpc3RzIGZvciBhZGRpbmcgYnJlYWtwb2ludHMgdG8gc291cmNlIGZpbGVzIHRoYXQgYXJlIG5vdFxuICAgICAgICAgICAgLy8geWV0IGtub3duLCBzdG9yZSBpdCBsb2NhbGx5IGFuZCB0cnkgdG8gYWRkIHRoZW0gbGF0ZXIuXG4gICAgICAgICAgICB0aGlzLl91bnJlc29sdmVkQnJlYWtwb2ludHMuc2V0KGJyZWFrcG9pbnQuc291cmNlVVJMLCBicmVha3BvaW50LmxpbmVOdW1iZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgndW5yZXNvbHZlZC1icmVha3BvaW50cy1jaGFuZ2VkJywgbnVsbCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuX3N1cHByZXNzQnJlYWtwb2ludE5vdGlmaWNhdGlvbiA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIF9jb250aW51ZSgpOiB2b2lkIHtcbiAgICBjb25zdCB0YXJnZXQgPSBXZWJJbnNwZWN0b3IudGFyZ2V0TWFuYWdlci5tYWluVGFyZ2V0KCk7XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgYmVnaW5UaW1lclRyYWNraW5nKCdudWNsaWRlLWRlYnVnZ2VyLWF0b206Y29udGludWUnKTtcbiAgICAgIHRhcmdldC5kZWJ1Z2dlck1vZGVsLnJlc3VtZSgpO1xuICAgIH1cbiAgfVxuXG4gIF9zdGVwT3ZlcigpOiB2b2lkIHtcbiAgICBjb25zdCB0YXJnZXQgPSBXZWJJbnNwZWN0b3IudGFyZ2V0TWFuYWdlci5tYWluVGFyZ2V0KCk7XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgYmVnaW5UaW1lclRyYWNraW5nKCdudWNsaWRlLWRlYnVnZ2VyLWF0b206c3RlcE92ZXInKTtcbiAgICAgIHRhcmdldC5kZWJ1Z2dlck1vZGVsLnN0ZXBPdmVyKCk7XG4gICAgfVxuICB9XG5cbiAgX3N0ZXBJbnRvKCk6IHZvaWQge1xuICAgIGNvbnN0IHRhcmdldCA9IFdlYkluc3BlY3Rvci50YXJnZXRNYW5hZ2VyLm1haW5UYXJnZXQoKTtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICBiZWdpblRpbWVyVHJhY2tpbmcoJ251Y2xpZGUtZGVidWdnZXItYXRvbTpzdGVwSW50bycpO1xuICAgICAgdGFyZ2V0LmRlYnVnZ2VyTW9kZWwuc3RlcEludG8oKTtcbiAgICB9XG4gIH1cblxuICBfc3RlcE91dCgpOiB2b2lkIHtcbiAgICBjb25zdCB0YXJnZXQgPSBXZWJJbnNwZWN0b3IudGFyZ2V0TWFuYWdlci5tYWluVGFyZ2V0KCk7XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgYmVnaW5UaW1lclRyYWNraW5nKCdudWNsaWRlLWRlYnVnZ2VyLWF0b206c3RlcE91dCcpO1xuICAgICAgdGFyZ2V0LmRlYnVnZ2VyTW9kZWwuc3RlcE91dCgpO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVVSVNvdXJjZUNvZGVBZGRlZChldmVudDogT2JqZWN0KSB7XG4gICAgY29uc3Qgc291cmNlID0gZXZlbnQuZGF0YTtcbiAgICB0aGlzLl91bnJlc29sdmVkQnJlYWtwb2ludHMuZ2V0KHNvdXJjZS51cmkoKSkuZm9yRWFjaChsaW5lID0+IHtcbiAgICAgIFdlYkluc3BlY3Rvci5icmVha3BvaW50TWFuYWdlci5zZXRCcmVha3BvaW50KHNvdXJjZSwgbGluZSAsIDAsICcnLCB0cnVlKTtcbiAgICB9KTtcbiAgICBpZiAodGhpcy5fdW5yZXNvbHZlZEJyZWFrcG9pbnRzLmRlbGV0ZUFsbChzb3VyY2UudXJpKCkpKSB7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ3VucmVzb2x2ZWQtYnJlYWtwb2ludHMtY2hhbmdlZCcsIG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIG9uVW5yZXNvbHZlZEJyZWFrcG9pbnRzQ2hhbmdlZChjYWxsYmFjazogKCkgPT4gdm9pZCk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ3VucmVzb2x2ZWQtYnJlYWtwb2ludHMtY2hhbmdlZCcsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGdldFVucmVzb2x2ZWRCcmVha3BvaW50c0xpc3QoKToge3VybDogc3RyaW5nOyBsaW5lOiBudW1iZXJ9W10ge1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIHRoaXMuX3VucmVzb2x2ZWRCcmVha3BvaW50cy5mb3JFYWNoKChsaW5lLCB1cmwpID0+IHtcbiAgICAgIHJlc3VsdC5wdXNoKHt1cmwsIGxpbmV9KTtcbiAgICB9KTtcbiAgICByZXN1bHQuc29ydCgoYSwgYikgPT4ge1xuICAgICAgaWYgKGEudXJsIDwgYi51cmwpIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfSBlbHNlIGlmIChhLnVybCA+IGIudXJsKSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGEubGluZSAtIGIubGluZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE51Y2xpZGVCcmlkZ2UoKTtcbiJdfQ==