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
//# sourceMappingURL=data:application/json;base64,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QUFDO0tBQ2Y7OztTQW5WRyxhQUFhOzs7QUFzVm5CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQyIsImZpbGUiOiJOdWNsaWRlQnJpZGdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgRW1pdHRlciA9IHJlcXVpcmUoJy4vRW1pdHRlcicpO1xuY29uc3QgTXVsdGltYXAgPSByZXF1aXJlKCcuLi8uLi9saWIvTXVsdGltYXAnKTtcbmNvbnN0IGlwYyA9IHJlcXVpcmUoJ2lwYycpO1xuaW1wb3J0IHtiZWdpblRpbWVyVHJhY2tpbmcsIGVuZFRpbWVyVHJhY2tpbmd9IGZyb20gJy4uLy4uL2xpYi9BbmFseXRpY3NIZWxwZXInO1xuXG5jb25zdCBXZWJJbnNwZWN0b3I6IHR5cGVvZiBXZWJJbnNwZWN0b3IgPSB3aW5kb3cuV2ViSW5zcGVjdG9yO1xuXG4vKipcbiAgKiBHZW5lcmF0ZXMgYSBzdHJpbmcgZnJvbSBhIGJyZWFrcG9pbnQgdGhhdCBjYW4gYmUgdXNlZCBpbiBoYXNoZWRcbiAgKiBjb250YWluZXJzLlxuICAqL1xuZnVuY3Rpb24gZm9ybWF0QnJlYWtwb2ludEtleSh1cmw6IHN0cmluZywgbGluZTogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIHVybCArICc6JyArIGxpbmU7XG59XG5cbnR5cGUgQnJlYWtwb2ludE5vdGlmaWNhdGlvblR5cGUgPSAnQnJlYWtwb2ludEFkZGVkJyB8ICdCcmVha3BvaW50UmVtb3ZlZCc7XG5cbmNsYXNzIE51Y2xpZGVCcmlkZ2Uge1xuICBfYWxsQnJlYWtwb2ludHM6IHtzb3VyY2VVUkw6IHN0cmluZzsgbGluZU51bWJlcjogbnVtYmVyfVtdO1xuICBfdW5yZXNvbHZlZEJyZWFrcG9pbnRzOiBNdWx0aW1hcDxzdHJpbmcsIG51bWJlcj47XG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfZGVidWdnZXJQYXVzZWRDb3VudDogbnVtYmVyO1xuICBfc3VwcHJlc3NCcmVha3BvaW50Tm90aWZpY2F0aW9uOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2FsbEJyZWFrcG9pbnRzID0gW107XG4gICAgdGhpcy5fdW5yZXNvbHZlZEJyZWFrcG9pbnRzID0gbmV3IE11bHRpbWFwKCk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fZGVidWdnZXJQYXVzZWRDb3VudCA9IDA7XG4gICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50Tm90aWZpY2F0aW9uID0gZmFsc2U7XG5cbiAgICBpcGMub24oJ2NvbW1hbmQnLCB0aGlzLl9oYW5kbGVJcGNDb21tYW5kLmJpbmQodGhpcykpO1xuXG4gICAgV2ViSW5zcGVjdG9yLnRhcmdldE1hbmFnZXIuYWRkTW9kZWxMaXN0ZW5lcihcbiAgICAgIFdlYkluc3BlY3Rvci5EZWJ1Z2dlck1vZGVsLFxuICAgICAgV2ViSW5zcGVjdG9yLkRlYnVnZ2VyTW9kZWwuRXZlbnRzLkNhbGxGcmFtZVNlbGVjdGVkLFxuICAgICAgdGhpcy5faGFuZGxlQ2FsbEZyYW1lU2VsZWN0ZWQsXG4gICAgICB0aGlzKTtcblxuICAgIFdlYkluc3BlY3Rvci50YXJnZXRNYW5hZ2VyLmFkZE1vZGVsTGlzdGVuZXIoXG4gICAgICBXZWJJbnNwZWN0b3IuRGVidWdnZXJNb2RlbCxcbiAgICAgIFdlYkluc3BlY3Rvci5EZWJ1Z2dlck1vZGVsLkV2ZW50cy5EZWJ1Z2dlclJlc3VtZWQsXG4gICAgICB0aGlzLl9oYW5kbGVEZWJ1Z2dlclJlc3VtZWQsXG4gICAgICB0aGlzKTtcblxuICAgIFdlYkluc3BlY3Rvci50YXJnZXRNYW5hZ2VyLmFkZE1vZGVsTGlzdGVuZXIoXG4gICAgICBXZWJJbnNwZWN0b3IuRGVidWdnZXJNb2RlbCxcbiAgICAgIFdlYkluc3BlY3Rvci5EZWJ1Z2dlck1vZGVsLkV2ZW50cy5EZWJ1Z2dlclBhdXNlZCxcbiAgICAgIHRoaXMuX2hhbmRsZURlYnVnZ2VyUGF1c2VkLFxuICAgICAgdGhpcyk7XG5cbiAgICBXZWJJbnNwZWN0b3Iud29ya3NwYWNlLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBXZWJJbnNwZWN0b3IuV29ya3NwYWNlLkV2ZW50cy5VSVNvdXJjZUNvZGVBZGRlZCxcbiAgICAgIHRoaXMuX2hhbmRsZVVJU291cmNlQ29kZUFkZGVkLFxuICAgICAgdGhpcyk7XG5cbiAgICBXZWJJbnNwZWN0b3Iubm90aWZpY2F0aW9ucy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgV2ViSW5zcGVjdG9yLlVzZXJNZXRyaWNzLlVzZXJBY3Rpb24sXG4gICAgICBmdW5jdGlvbihldmVudDogV2ViSW5zcGVjdG9yLkV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5kYXRhLmFjdGlvbiA9PT0gJ29wZW5Tb3VyY2VMaW5rJykge1xuICAgICAgICAgIHRoaXMuX2hhbmRsZU9wZW5Tb3VyY2VMb2NhdGlvbihldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB0aGlzKTtcblxuICAgIFdlYkluc3BlY3Rvci5icmVha3BvaW50TWFuYWdlci5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgV2ViSW5zcGVjdG9yLkJyZWFrcG9pbnRNYW5hZ2VyLkV2ZW50cy5CcmVha3BvaW50QWRkZWQsXG4gICAgICB0aGlzLl9oYW5kbGVCcmVha3BvaW50QWRkZWQsXG4gICAgICB0aGlzKTtcblxuICAgIFdlYkluc3BlY3Rvci5icmVha3BvaW50TWFuYWdlci5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgV2ViSW5zcGVjdG9yLkJyZWFrcG9pbnRNYW5hZ2VyLkV2ZW50cy5CcmVha3BvaW50UmVtb3ZlZCxcbiAgICAgIHRoaXMuX2hhbmRsZUJyZWFrcG9pbnRSZW1vdmVkLFxuICAgICAgdGhpcyk7XG5cbiAgICB0aGlzLl9jdXN0b21pemVXZWJJbnNwZWN0b3IoKTtcbiAgICB3aW5kb3cucnVuT25XaW5kb3dMb2FkKHRoaXMuX2hhbmRsZVdpbmRvd0xvYWQuYmluZCh0aGlzKSk7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGUgYW5kIGN1c3RvbWl6ZSBzb21lIGZ1bmN0aW9uYWxpdGllcyBvZiBXZWJJbnNwZWN0b3IuXG4gICAqIERlbGliZXJhdGVseSBzdXBwcmVzcyBhbnkgZmxvdyBlcnJvcnMgaW4gdGhpcyBtZXRob2QuXG4gICAqL1xuICBfY3VzdG9taXplV2ViSW5zcGVjdG9yKCkge1xuICAgIC8vICRGbG93Rml4TWUuXG4gICAgV2ViSW5zcGVjdG9yLk9iamVjdFByb3BlcnR5VHJlZUVsZW1lbnQuX3BvcHVsYXRlID1cbiAgICAgIGZ1bmN0aW9uKHRyZWVFbGVtZW50LCB2YWx1ZSwgc2tpcFByb3RvLCBlbXB0eVBsYWNlaG9sZGVyKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gez9BcnJheS48IVdlYkluc3BlY3Rvci5SZW1vdGVPYmplY3RQcm9wZXJ0eT59IHByb3BlcnRpZXNcbiAgICAgICAgICogQHBhcmFtIHs/QXJyYXkuPCFXZWJJbnNwZWN0b3IuUmVtb3RlT2JqZWN0UHJvcGVydHk+fSBpbnRlcm5hbFByb3BlcnRpZXNcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGNhbGxiYWNrKHByb3BlcnRpZXMsIGludGVybmFsUHJvcGVydGllcylcbiAgICAgICAge1xuICAgICAgICAgIHRyZWVFbGVtZW50LnJlbW92ZUNoaWxkcmVuKCk7XG4gICAgICAgICAgaWYgKCFwcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vICRGbG93Rml4TWUuXG4gICAgICAgICAgV2ViSW5zcGVjdG9yLk9iamVjdFByb3BlcnR5VHJlZUVsZW1lbnQucG9wdWxhdGVXaXRoUHJvcGVydGllcyhcbiAgICAgICAgICAgIHRyZWVFbGVtZW50LFxuICAgICAgICAgICAgcHJvcGVydGllcyxcbiAgICAgICAgICAgIGludGVybmFsUHJvcGVydGllcyxcbiAgICAgICAgICAgIHNraXBQcm90byxcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgZW1wdHlQbGFjZWhvbGRlclxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gJEZsb3dGaXhNZS5cbiAgICAgICAgV2ViSW5zcGVjdG9yLlJlbW90ZU9iamVjdC5sb2FkRnJvbU9iamVjdFBlclByb3RvKHZhbHVlLCBjYWxsYmFjayk7XG4gICAgICB9O1xuXG4gICAgLy8gJEZsb3dGaXhNZS5cbiAgICBXZWJJbnNwZWN0b3IuT2JqZWN0UHJvcGVydGllc1NlY3Rpb24ucHJvdG90eXBlLnVwZGF0ZSA9XG4gICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7P0FycmF5LjwhV2ViSW5zcGVjdG9yLlJlbW90ZU9iamVjdFByb3BlcnR5Pn0gcHJvcGVydGllc1xuICAgICAgICAgKiBAcGFyYW0gez9BcnJheS48IVdlYkluc3BlY3Rvci5SZW1vdGVPYmplY3RQcm9wZXJ0eT59IGludGVybmFsUHJvcGVydGllc1xuICAgICAgICAgKiBAdGhpcyB7V2ViSW5zcGVjdG9yLk9iamVjdFByb3BlcnRpZXNTZWN0aW9ufVxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gY2FsbGJhY2socHJvcGVydGllcywgaW50ZXJuYWxQcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgaWYgKCFwcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudXBkYXRlUHJvcGVydGllcyhwcm9wZXJ0aWVzLCBpbnRlcm5hbFByb3BlcnRpZXMpO1xuICAgICAgICB9XG4gICAgICAgIC8vICRGbG93Rml4TWUuXG4gICAgICAgIFdlYkluc3BlY3Rvci5SZW1vdGVPYmplY3QubG9hZEZyb21PYmplY3QoXG4gICAgICAgICAgdGhpcy5vYmplY3QsXG4gICAgICAgICAgISF0aGlzLmlnbm9yZUhhc093blByb3BlcnR5LFxuICAgICAgICAgIGNhbGxiYWNrLmJpbmQodGhpcylcbiAgICAgICAgKTtcbiAgICAgIH07XG4gIH1cblxuICBfaGFuZGxlV2luZG93TG9hZCgpIHtcbiAgICBpcGMuc2VuZFRvSG9zdCgnbm90aWZpY2F0aW9uJywgJ3JlYWR5Jyk7XG4gIH1cblxuICBfaGFuZGxlSXBjQ29tbWFuZChjb21tYW5kOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgc3dpdGNoIChjb21tYW5kKSB7XG4gICAgICBjYXNlICdTeW5jQnJlYWtwb2ludHMnOlxuICAgICAgICB0aGlzLl9hbGxCcmVha3BvaW50cyA9IGFyZ3NbMF07XG4gICAgICAgIHRoaXMuX3N5bmNCcmVha3BvaW50cygpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0NvbnRpbnVlJzpcbiAgICAgICAgdGhpcy5fY29udGludWUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdTdGVwT3Zlcic6XG4gICAgICAgIHRoaXMuX3N0ZXBPdmVyKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnU3RlcEludG8nOlxuICAgICAgICB0aGlzLl9zdGVwSW50bygpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ1N0ZXBPdXQnOlxuICAgICAgICB0aGlzLl9zdGVwT3V0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVDYWxsRnJhbWVTZWxlY3RlZChldmVudDogV2ViSW5zcGVjdG9yLkV2ZW50KSB7XG4gICAgY29uc3QgZnJhbWU6IFdlYkluc3BlY3RvciRDYWxsRnJhbWUgPSBldmVudC5kYXRhO1xuICAgIGNvbnN0IHVpTG9jYXRpb24gPVxuICAgICAgV2ViSW5zcGVjdG9yLmRlYnVnZ2VyV29ya3NwYWNlQmluZGluZy5yYXdMb2NhdGlvblRvVUlMb2NhdGlvbihmcmFtZS5sb2NhdGlvbigpKTtcbiAgICBpcGMuc2VuZFRvSG9zdCgnbm90aWZpY2F0aW9uJywgJ0NhbGxGcmFtZVNlbGVjdGVkJywge1xuICAgICAgc291cmNlVVJMOiB1aUxvY2F0aW9uLnVpU291cmNlQ29kZS51cmkoKSxcbiAgICAgIGxpbmVOdW1iZXI6IHVpTG9jYXRpb24ubGluZU51bWJlcixcbiAgICB9KTtcbiAgfVxuXG4gIF9oYW5kbGVPcGVuU291cmNlTG9jYXRpb24oZXZlbnQ6IFdlYkluc3BlY3Rvci5FdmVudCkge1xuICAgIGNvbnN0IGV2ZW50RGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgdGhpcy5zZW5kT3BlblNvdXJjZUxvY2F0aW9uKGV2ZW50RGF0YS51cmwsIGV2ZW50RGF0YS5saW5lTnVtYmVyKTtcbiAgfVxuXG4gIHNlbmRPcGVuU291cmNlTG9jYXRpb24oc291cmNlVVJMOiBzdHJpbmcsIGxpbmU6IG51bWJlcikge1xuICAgIGlwYy5zZW5kVG9Ib3N0KCdub3RpZmljYXRpb24nLCAnT3BlblNvdXJjZUxvY2F0aW9uJywge1xuICAgICAgc291cmNlVVJMOiBzb3VyY2VVUkwsXG4gICAgICBsaW5lTnVtYmVyOiBsaW5lLFxuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZURlYnVnZ2VyUGF1c2VkKGV2ZW50OiBXZWJJbnNwZWN0b3IkRXZlbnQpIHtcbiAgICBlbmRUaW1lclRyYWNraW5nKCk7XG4gICAgKyt0aGlzLl9kZWJ1Z2dlclBhdXNlZENvdW50O1xuICAgIGlmICh0aGlzLl9kZWJ1Z2dlclBhdXNlZENvdW50ID09PSAxKSB7XG4gICAgICB0aGlzLl9oYW5kbGVMb2FkZXJCcmVha3BvaW50KCk7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUxvYWRlckJyZWFrcG9pbnQoKSB7XG4gICAgLy8gU3luYyBhbnkgaW5pdGlhbCBicmVha3BvaW50cyB0byBlbmdpbmUgZHVyaW5nIGxvYWRlciBicmVha3BvaW50XG4gICAgLy8gYW5kIGNvbnRpbnVlIGZyb20gaXQuXG4gICAgdGhpcy5fc3luY0JyZWFrcG9pbnRzKCk7XG4gICAgdGhpcy5fY29udGludWUoKTtcbiAgfVxuXG4gIF9oYW5kbGVEZWJ1Z2dlclJlc3VtZWQoZXZlbnQ6IFdlYkluc3BlY3RvciRFdmVudCkge1xuICAgIGlwYy5zZW5kVG9Ib3N0KCdub3RpZmljYXRpb24nLCAnRGVidWdnZXJSZXN1bWVkJywge30pO1xuICB9XG5cbiAgX2hhbmRsZUJyZWFrcG9pbnRBZGRlZChldmVudDogV2ViSW5zcGVjdG9yJEV2ZW50KSB7XG4gICAgY29uc3QgbG9jYXRpb24gPSBldmVudC5kYXRhLnVpTG9jYXRpb247XG4gICAgdGhpcy5fc2VuZEJyZWFrcG9pbnROb3RpZmljYXRpb24obG9jYXRpb24sICdCcmVha3BvaW50QWRkZWQnKTtcbiAgfVxuXG4gIF9oYW5kbGVCcmVha3BvaW50UmVtb3ZlZChldmVudDogV2ViSW5zcGVjdG9yJEV2ZW50KSB7XG4gICAgY29uc3QgbG9jYXRpb24gPSBldmVudC5kYXRhLnVpTG9jYXRpb247XG4gICAgdGhpcy5fc2VuZEJyZWFrcG9pbnROb3RpZmljYXRpb24obG9jYXRpb24sICdCcmVha3BvaW50UmVtb3ZlZCcpO1xuICB9XG5cbiAgX3NlbmRCcmVha3BvaW50Tm90aWZpY2F0aW9uKGxvY2F0aW9uOiBXZWJJbnNwZWN0b3IkVUlMb2NhdGlvbiwgdHlwZTogQnJlYWtwb2ludE5vdGlmaWNhdGlvblR5cGUpIHtcbiAgICBpZiAoIXRoaXMuX3N1cHByZXNzQnJlYWtwb2ludE5vdGlmaWNhdGlvbikge1xuICAgICAgaXBjLnNlbmRUb0hvc3QoJ25vdGlmaWNhdGlvbicsIHR5cGUsIHtcbiAgICAgICAgc291cmNlVVJMOiBsb2NhdGlvbi51aVNvdXJjZUNvZGUudXJpKCksXG4gICAgICAgIGxpbmVOdW1iZXI6IGxvY2F0aW9uLmxpbmVOdW1iZXIsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPW2plZmZyZXl0YW5dOiB0aGlzIGlzIGEgaGFjayB0byBlbmFibGUgaGh2bSBkZWJ1Z2dlclxuICAvLyBzZXR0aW5nIGJyZWFrcG9pbnRzIGluIG5vbi1wYXJzZWQgZmlsZXMuXG4gIC8vIE9wZW4gaXNzdWVzOlxuICAvLyBBbnkgYnJlYWtwb2ludHMgaW4gcGhwIGZpbGUgd2lsbCBzaG93biBhcyBib3VuZC9yZXNvbHZlZDtcbiAgLy8gbmVlZHMgdG8gcmV2aXNpdCB0aGUgdW5yZXNvbHZlZCBicmVha3BvaW50cyBkZXRlY3Rpb24gbG9naWMuXG4gIF9wYXJzZUJyZWFrcG9pbnRTb3VyY2VzKCkge1xuICAgIHRoaXMuX2FsbEJyZWFrcG9pbnRzLmZvckVhY2goYnJlYWtwb2ludCA9PiB7XG4gICAgICBjb25zdCBzb3VyY2VVcmwgPSBicmVha3BvaW50LnNvdXJjZVVSTDtcbiAgICAgIC8vIFRPRE9bamVmZnJleXRhbl06IGludmVzdGlnYXRlIGlmIHdlIG5lZWQgdG8gZG8gdGhlIHNhbWUgZm9yIExMREIgb3Igbm90LlxuICAgICAgaWYgKHNvdXJjZVVybC5lbmRzV2l0aCgnLnBocCcpIHx8IHNvdXJjZVVybC5lbmRzV2l0aCgnLmhoJykpIHtcbiAgICAgICAgY29uc3Qgc291cmNlID0gV2ViSW5zcGVjdG9yLndvcmtzcGFjZS51aVNvdXJjZUNvZGVGb3JPcmlnaW5VUkwoc291cmNlVXJsKTtcbiAgICAgICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgICAgICBjb25zdCB0YXJnZXQgPSBXZWJJbnNwZWN0b3IudGFyZ2V0TWFuYWdlci5tYWluVGFyZ2V0KCk7XG4gICAgICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICAgICAgdGFyZ2V0LmRlYnVnZ2VyTW9kZWwuX3BhcnNlZFNjcmlwdFNvdXJjZShcbiAgICAgICAgICAgICAgc291cmNlVXJsLFxuICAgICAgICAgICAgICBzb3VyY2VVcmwsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gU3luY2hyb25pemVzIG51Y2xpZGUgQnJlYWtwb2ludFN0b3JlIGFuZCBCcmVha3BvaW50TWFuYWdlclxuICBfc3luY0JyZWFrcG9pbnRzKCkge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLl9zdXBwcmVzc0JyZWFrcG9pbnROb3RpZmljYXRpb24gPSB0cnVlO1xuICAgICAgdGhpcy5fdW5yZXNvbHZlZEJyZWFrcG9pbnRzID0gbmV3IE11bHRpbWFwKCk7XG5cbiAgICAgIGNvbnN0IG5ld0JyZWFrcG9pbnRTZXQgPSBuZXcgU2V0KHRoaXMuX2FsbEJyZWFrcG9pbnRzLm1hcChicmVha3BvaW50ID0+XG4gICAgICAgIGZvcm1hdEJyZWFrcG9pbnRLZXkoYnJlYWtwb2ludC5zb3VyY2VVUkwsIGJyZWFrcG9pbnQubGluZU51bWJlcikpKTtcblxuICAgICAgLy8gUmVtb3ZpbmcgdW5saXN0ZWQgYnJlYWtwb2ludHMgYW5kIG1hcmsgdGhlIG9uZXMgdGhhdCBhbHJlYWR5IGV4aXN0LlxuICAgICAgY29uc3QgdW5jaGFuZ2VkQnJlYWtwb2ludFNldCA9IG5ldyBTZXQoKTtcbiAgICAgIGNvbnN0IGV4aXN0aW5nQnJlYWtwb2ludHMgPSBXZWJJbnNwZWN0b3IuYnJlYWtwb2ludE1hbmFnZXIuYWxsQnJlYWtwb2ludHMoKTtcbiAgICAgIGV4aXN0aW5nQnJlYWtwb2ludHMuZm9yRWFjaChleGlzdGluZ0JyZWFrcG9pbnQgPT4ge1xuICAgICAgICBjb25zdCBzb3VyY2UgPSBleGlzdGluZ0JyZWFrcG9pbnQudWlTb3VyY2VDb2RlKCk7XG4gICAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgICBjb25zdCBrZXkgPSBmb3JtYXRCcmVha3BvaW50S2V5KHNvdXJjZS51cmkoKSwgZXhpc3RpbmdCcmVha3BvaW50LmxpbmVOdW1iZXIoKSk7XG4gICAgICAgICAgaWYgKG5ld0JyZWFrcG9pbnRTZXQuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIHVuY2hhbmdlZEJyZWFrcG9pbnRTZXQuYWRkKGtleSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGV4aXN0aW5nQnJlYWtwb2ludC5yZW1vdmUoZmFsc2UpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX3BhcnNlQnJlYWtwb2ludFNvdXJjZXMoKTtcblxuICAgICAgLy8gQWRkIHRoZSBvbmVzIHRoYXQgZG9uJ3QuXG4gICAgICB0aGlzLl9hbGxCcmVha3BvaW50cy5mb3JFYWNoKGJyZWFrcG9pbnQgPT4ge1xuICAgICAgICBjb25zdCBrZXkgPSBmb3JtYXRCcmVha3BvaW50S2V5KGJyZWFrcG9pbnQuc291cmNlVVJMLCBicmVha3BvaW50LmxpbmVOdW1iZXIpO1xuICAgICAgICBpZiAoIXVuY2hhbmdlZEJyZWFrcG9pbnRTZXQuaGFzKGtleSkpIHtcbiAgICAgICAgICBjb25zdCBzb3VyY2UgPSBXZWJJbnNwZWN0b3Iud29ya3NwYWNlLnVpU291cmNlQ29kZUZvck9yaWdpblVSTChicmVha3BvaW50LnNvdXJjZVVSTCk7XG4gICAgICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICAgICAgV2ViSW5zcGVjdG9yLmJyZWFrcG9pbnRNYW5hZ2VyLnNldEJyZWFrcG9pbnQoXG4gICAgICAgICAgICAgIHNvdXJjZSxcbiAgICAgICAgICAgICAgYnJlYWtwb2ludC5saW5lTnVtYmVyLFxuICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAnJyxcbiAgICAgICAgICAgICAgdHJ1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE5vIEFQSSBleGlzdHMgZm9yIGFkZGluZyBicmVha3BvaW50cyB0byBzb3VyY2UgZmlsZXMgdGhhdCBhcmUgbm90XG4gICAgICAgICAgICAvLyB5ZXQga25vd24sIHN0b3JlIGl0IGxvY2FsbHkgYW5kIHRyeSB0byBhZGQgdGhlbSBsYXRlci5cbiAgICAgICAgICAgIHRoaXMuX3VucmVzb2x2ZWRCcmVha3BvaW50cy5zZXQoYnJlYWtwb2ludC5zb3VyY2VVUkwsIGJyZWFrcG9pbnQubGluZU51bWJlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCd1bnJlc29sdmVkLWJyZWFrcG9pbnRzLWNoYW5nZWQnLCBudWxsKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5fc3VwcHJlc3NCcmVha3BvaW50Tm90aWZpY2F0aW9uID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgX2NvbnRpbnVlKCk6IHZvaWQge1xuICAgIGNvbnN0IHRhcmdldCA9IFdlYkluc3BlY3Rvci50YXJnZXRNYW5hZ2VyLm1haW5UYXJnZXQoKTtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICBiZWdpblRpbWVyVHJhY2tpbmcoJ251Y2xpZGUtZGVidWdnZXItYXRvbTpjb250aW51ZScpO1xuICAgICAgdGFyZ2V0LmRlYnVnZ2VyTW9kZWwucmVzdW1lKCk7XG4gICAgfVxuICB9XG5cbiAgX3N0ZXBPdmVyKCk6IHZvaWQge1xuICAgIGNvbnN0IHRhcmdldCA9IFdlYkluc3BlY3Rvci50YXJnZXRNYW5hZ2VyLm1haW5UYXJnZXQoKTtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICBiZWdpblRpbWVyVHJhY2tpbmcoJ251Y2xpZGUtZGVidWdnZXItYXRvbTpzdGVwT3ZlcicpO1xuICAgICAgdGFyZ2V0LmRlYnVnZ2VyTW9kZWwuc3RlcE92ZXIoKTtcbiAgICB9XG4gIH1cblxuICBfc3RlcEludG8oKTogdm9pZCB7XG4gICAgY29uc3QgdGFyZ2V0ID0gV2ViSW5zcGVjdG9yLnRhcmdldE1hbmFnZXIubWFpblRhcmdldCgpO1xuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIGJlZ2luVGltZXJUcmFja2luZygnbnVjbGlkZS1kZWJ1Z2dlci1hdG9tOnN0ZXBJbnRvJyk7XG4gICAgICB0YXJnZXQuZGVidWdnZXJNb2RlbC5zdGVwSW50bygpO1xuICAgIH1cbiAgfVxuXG4gIF9zdGVwT3V0KCk6IHZvaWQge1xuICAgIGNvbnN0IHRhcmdldCA9IFdlYkluc3BlY3Rvci50YXJnZXRNYW5hZ2VyLm1haW5UYXJnZXQoKTtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICBiZWdpblRpbWVyVHJhY2tpbmcoJ251Y2xpZGUtZGVidWdnZXItYXRvbTpzdGVwT3V0Jyk7XG4gICAgICB0YXJnZXQuZGVidWdnZXJNb2RlbC5zdGVwT3V0KCk7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZVVJU291cmNlQ29kZUFkZGVkKGV2ZW50OiBPYmplY3QpIHtcbiAgICBjb25zdCBzb3VyY2UgPSBldmVudC5kYXRhO1xuICAgIHRoaXMuX3VucmVzb2x2ZWRCcmVha3BvaW50cy5nZXQoc291cmNlLnVyaSgpKS5mb3JFYWNoKGxpbmUgPT4ge1xuICAgICAgV2ViSW5zcGVjdG9yLmJyZWFrcG9pbnRNYW5hZ2VyLnNldEJyZWFrcG9pbnQoc291cmNlLCBsaW5lICwgMCwgJycsIHRydWUpO1xuICAgIH0pO1xuICAgIGlmICh0aGlzLl91bnJlc29sdmVkQnJlYWtwb2ludHMuZGVsZXRlQWxsKHNvdXJjZS51cmkoKSkpIHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgndW5yZXNvbHZlZC1icmVha3BvaW50cy1jaGFuZ2VkJywgbnVsbCk7XG4gICAgfVxuICB9XG5cbiAgb25VbnJlc29sdmVkQnJlYWtwb2ludHNDaGFuZ2VkKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCd1bnJlc29sdmVkLWJyZWFrcG9pbnRzLWNoYW5nZWQnLCBjYWxsYmFjayk7XG4gIH1cblxuICBnZXRVbnJlc29sdmVkQnJlYWtwb2ludHNMaXN0KCk6IHt1cmw6IHN0cmluZzsgbGluZTogbnVtYmVyfVtdIHtcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICB0aGlzLl91bnJlc29sdmVkQnJlYWtwb2ludHMuZm9yRWFjaCgobGluZSwgdXJsKSA9PiB7XG4gICAgICByZXN1bHQucHVzaCh7dXJsLCBsaW5lfSk7XG4gICAgfSk7XG4gICAgcmVzdWx0LnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIGlmIChhLnVybCA8IGIudXJsKSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH0gZWxzZSBpZiAoYS51cmwgPiBiLnVybCkge1xuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBhLmxpbmUgLSBiLmxpbmU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBOdWNsaWRlQnJpZGdlKCk7XG4iXX0=