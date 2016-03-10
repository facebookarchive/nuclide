var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var invariant = require('assert');

var _require = require('atom');

var Disposable = _require.Disposable;
var CompositeDisposable = _require.CompositeDisposable;

var _require2 = require('../../commons');

var debounce = _require2.debounce;

// A reload changes the text in the buffer, so it should trigger a refresh.
var FILE_CHANGE_EVENTS = ['did-change', 'did-reload', 'did-open'];

// A reload basically indicates that an external program saved the file, so
// it should trigger a refresh.
var FILE_SAVE_EVENTS = ['did-save', 'did-reload', 'did-open'];

/**
 * Stores callbacks keyed on grammar and event, to allow for easy retrieval when
 * we need to dispatch to all callbacks registered for a given (grammar, event)
 * pair.
 */

var TextCallbackContainer = (function () {
  function TextCallbackContainer() {
    _classCallCheck(this, TextCallbackContainer);

    this._callbacks = new Map();
    this._allGrammarCallbacks = new Map();
  }

  /**
   * Meant to make it simple and easy for a DiagnosticProvider to subscribe to
   * relevant events. Currently provides two methods, onFileChange and onFileSave.
   * A DiagnosticProvider will typically subscribe to only one, depending on
   * whether it wants to be notified whenever a file changes or only when it is
   * saved.
   *
   * Both methods take two arguments:
   * - An Iterable of grammars for which the DiagnosticProvider can provide
   * diagnostics.
   * - The callback to be called on a text event.
   *
   * A TextEventDispatcher will be subscribed to text events if and only if it has
   * subscribers of its own. If all subscribers unsubscribe, it will unsubscribe
   * from Atom's text events.
   *
   */

  _createClass(TextCallbackContainer, [{
    key: 'getCallbacks',
    value: function getCallbacks(grammar, event) {
      var eventMap = this._callbacks.get(grammar);
      var callbacksForGrammar = this._getCallbacksFromEventMap(eventMap, event);
      var callbacksForAll = this._getCallbacksFromEventMap(this._allGrammarCallbacks, event);
      var resultSet = new Set();
      var add = function add(callback) {
        resultSet.add(callback);
      };
      callbacksForGrammar.forEach(add);
      callbacksForAll.forEach(add);
      return resultSet;
    }
  }, {
    key: 'isEmpty',
    value: function isEmpty() {
      return this._callbacks.size === 0 && this._allGrammarCallbacks.size === 0;
    }
  }, {
    key: '_getCallbacksFromEventMap',
    value: function _getCallbacksFromEventMap(eventMap, event) {
      if (!eventMap) {
        return new Set();
      }
      var callbackSet = eventMap.get(event);
      if (!callbackSet) {
        return new Set();
      }
      return callbackSet;
    }
  }, {
    key: 'addCallback',
    value: function addCallback(grammarScopes, events, callback) {
      if (grammarScopes === 'all') {
        this._addToEventMap(this._allGrammarCallbacks, events, callback);
      } else {
        for (var grammarScope of grammarScopes) {
          var eventMap = this._callbacks.get(grammarScope);
          if (!eventMap) {
            eventMap = new Map();
            this._callbacks.set(grammarScope, eventMap);
          }
          this._addToEventMap(eventMap, events, callback);
        }
      }
    }

    // remove the callbacks, maintaining the invariant that there should be no
    // empty maps or sets in this._callbacks
  }, {
    key: 'removeCallback',
    value: function removeCallback(grammarScopes, events, callback) {
      if (grammarScopes === 'all') {
        this._removeFromEventMap(this._allGrammarCallbacks, events, callback);
      } else {
        for (var grammarScope of grammarScopes) {
          var eventMap = this._callbacks.get(grammarScope);
          invariant(eventMap);
          this._removeFromEventMap(eventMap, events, callback);
          if (eventMap.size === 0) {
            this._callbacks['delete'](grammarScope);
          }
        }
      }
    }
  }, {
    key: '_addToEventMap',
    value: function _addToEventMap(eventMap, events, callback) {
      for (var _event of events) {
        var callbackSet = eventMap.get(_event);
        if (!callbackSet) {
          callbackSet = new Set();
          eventMap.set(_event, callbackSet);
        }
        callbackSet.add(callback);
      }
    }
  }, {
    key: '_removeFromEventMap',
    value: function _removeFromEventMap(eventMap, events, callback) {
      for (var _event2 of events) {
        var callbackSet = eventMap.get(_event2);
        invariant(callbackSet);
        callbackSet['delete'](callback);
        if (callbackSet.size === 0) {
          eventMap['delete'](_event2);
        }
      }
    }
  }]);

  return TextCallbackContainer;
})();

var TextEventDispatcher = (function () {
  function TextEventDispatcher() {
    _classCallCheck(this, TextEventDispatcher);

    this._callbackContainer = new TextCallbackContainer();
    this._editorListenerDisposable = null;
    this._pendingEvents = new WeakMap();
  }

  _createClass(TextEventDispatcher, [{
    key: '_onEvents',
    value: function _onEvents(grammarScopes, events, callback) {
      var _this = this;

      if (this._callbackContainer.isEmpty()) {
        this._registerEditorListeners();
      }
      // Sometimes these events get triggered several times in succession
      // (particularly on startup).
      var debouncedCallback = debounce(callback, 50, true);
      this._callbackContainer.addCallback(grammarScopes, events, debouncedCallback);
      var disposables = new Disposable(function () {
        _this._callbackContainer.removeCallback(grammarScopes, events, debouncedCallback);
        if (_this._callbackContainer.isEmpty()) {
          _this._deregisterEditorListeners();
        }
      });
      return disposables;
    }
  }, {
    key: 'onFileChange',
    value: function onFileChange(grammarScopes, callback) {
      return this._onEvents(grammarScopes, FILE_CHANGE_EVENTS, callback);
    }
  }, {
    key: 'onAnyFileChange',
    value: function onAnyFileChange(callback) {
      return this._onEvents('all', FILE_CHANGE_EVENTS, callback);
    }
  }, {
    key: 'onFileSave',
    value: function onFileSave(grammarScopes, callback) {
      return this._onEvents(grammarScopes, FILE_SAVE_EVENTS, callback);
    }
  }, {
    key: 'onAnyFileSave',
    value: function onAnyFileSave(callback) {
      return this._onEvents('all', FILE_SAVE_EVENTS, callback);
    }
  }, {
    key: '_registerEditorListeners',
    value: function _registerEditorListeners() {
      var _this2 = this;

      if (!this._editorListenerDisposable) {
        this._editorListenerDisposable = new CompositeDisposable();
      }

      // Whenever the active pane item changes, we check to see if there are any
      // pending events for the newly-focused TextEditor.
      this._getEditorListenerDisposable().add(atom.workspace.onDidChangeActivePaneItem(function () {
        var currentEditor = atom.workspace.getActiveTextEditor();
        if (currentEditor) {
          var pendingEvents = _this2._pendingEvents.get(currentEditor.getBuffer());
          if (pendingEvents) {
            for (var _event3 of pendingEvents) {
              _this2._dispatchEvents(currentEditor, _event3);
            }
            _this2._pendingEvents['delete'](currentEditor.getBuffer());
          }
        }
      }));

      this._getEditorListenerDisposable().add(atom.workspace.observeTextEditors(function (editor) {
        var buffer = editor.getBuffer();
        var makeDispatch = function makeDispatch(event) {
          return function () {
            _this2._dispatchEvents(editor, event);
          };
        };
        _this2._getEditorListenerDisposable().add(buffer.onDidStopChanging(makeDispatch('did-change')));
        _this2._getEditorListenerDisposable().add(buffer.onDidSave(makeDispatch('did-save')));
        _this2._getEditorListenerDisposable().add(buffer.onDidReload(makeDispatch('did-reload')));
        _this2._dispatchEvents(editor, 'did-open');
      }));
    }
  }, {
    key: '_deregisterEditorListeners',
    value: function _deregisterEditorListeners() {
      if (this._editorListenerDisposable) {
        this._getEditorListenerDisposable().dispose();
        this._editorListenerDisposable = null;
      }
    }
  }, {
    key: '_dispatchEvents',
    value: function _dispatchEvents(editor, event) {
      var currentEditor = atom.workspace.getActiveTextEditor();
      if (currentEditor && editor === currentEditor) {
        var callbacks = this._callbackContainer.getCallbacks(editor.getGrammar().scopeName, event);
        for (var callback of callbacks) {
          callback(editor);
        }
        // We want to avoid storing pending events if this event was generated by
        // the same buffer as the current editor, to avoid duplicating events when
        // multiple panes have the same file open.
      } else if (!currentEditor || editor.getBuffer() !== currentEditor.getBuffer()) {
          // Trigger this event next time we switch to an editor with this buffer.
          var buffer = editor.getBuffer();
          var events = this._pendingEvents.get(buffer);
          if (!events) {
            events = new Set();
            this._pendingEvents.set(buffer, events);
          }
          events.add(event);
        }
    }
  }, {
    key: '_getEditorListenerDisposable',
    value: function _getEditorListenerDisposable() {
      var disposable = this._editorListenerDisposable;
      invariant(disposable, 'TextEventDispatcher disposable is not initialized');
      return disposable;
    }
  }]);

  return TextEventDispatcher;
})();

module.exports = {
  TextEventDispatcher: TextEventDispatcher,
  __TEST__: {
    TextCallbackContainer: TextCallbackContainer
  }
};

// grammar -> event -> callback
// invariant: no empty maps or sets (they should be removed instead)

// event -> callback
// invariant: no keys mapping to empty sets (they should be removed instead)
//# sourceMappingURL=data:application/json;base64,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QkFBbUIsRUFBbkIsbUJBQW1CO0FBQ25CLFVBQVEsRUFBRTtBQUNSLHlCQUFxQixFQUFyQixxQkFBcUI7R0FDdEI7Q0FDRixDQUFDIiwiZmlsZSI6IlRleHRFdmVudERpc3BhdGNoZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBpbnZhcmlhbnQgPSByZXF1aXJlKCdhc3NlcnQnKTtcbmNvbnN0IHtEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcblxuY29uc3Qge2RlYm91bmNlfSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKTtcblxudHlwZSBFdmVudENhbGxiYWNrID0gKGVkaXRvcjogVGV4dEVkaXRvcikgPT4gbWl4ZWQ7XG5cbnR5cGUgRXZlbnQgPSAnZGlkLXJlbG9hZCcgfCAnZGlkLWNoYW5nZScgfCAnZGlkLXNhdmUnIHwgJ2RpZC1vcGVuJztcblxuLy8gQSByZWxvYWQgY2hhbmdlcyB0aGUgdGV4dCBpbiB0aGUgYnVmZmVyLCBzbyBpdCBzaG91bGQgdHJpZ2dlciBhIHJlZnJlc2guXG5jb25zdCBGSUxFX0NIQU5HRV9FVkVOVFMgPSBbJ2RpZC1jaGFuZ2UnLCAnZGlkLXJlbG9hZCcsICdkaWQtb3BlbiddO1xuXG4vLyBBIHJlbG9hZCBiYXNpY2FsbHkgaW5kaWNhdGVzIHRoYXQgYW4gZXh0ZXJuYWwgcHJvZ3JhbSBzYXZlZCB0aGUgZmlsZSwgc29cbi8vIGl0IHNob3VsZCB0cmlnZ2VyIGEgcmVmcmVzaC5cbmNvbnN0IEZJTEVfU0FWRV9FVkVOVFMgPSBbJ2RpZC1zYXZlJywgJ2RpZC1yZWxvYWQnLCAnZGlkLW9wZW4nXTtcblxuLyoqXG4gKiBTdG9yZXMgY2FsbGJhY2tzIGtleWVkIG9uIGdyYW1tYXIgYW5kIGV2ZW50LCB0byBhbGxvdyBmb3IgZWFzeSByZXRyaWV2YWwgd2hlblxuICogd2UgbmVlZCB0byBkaXNwYXRjaCB0byBhbGwgY2FsbGJhY2tzIHJlZ2lzdGVyZWQgZm9yIGEgZ2l2ZW4gKGdyYW1tYXIsIGV2ZW50KVxuICogcGFpci5cbiAqL1xuY2xhc3MgVGV4dENhbGxiYWNrQ29udGFpbmVyPENhbGxiYWNrQXJnPiB7XG4gIC8vIGdyYW1tYXIgLT4gZXZlbnQgLT4gY2FsbGJhY2tcbiAgLy8gaW52YXJpYW50OiBubyBlbXB0eSBtYXBzIG9yIHNldHMgKHRoZXkgc2hvdWxkIGJlIHJlbW92ZWQgaW5zdGVhZClcbiAgX2NhbGxiYWNrczogTWFwPHN0cmluZywgTWFwPEV2ZW50LCBTZXQ8KGFyZzogQ2FsbGJhY2tBcmcpID0+IG1peGVkPj4+O1xuXG4gIC8vIGV2ZW50IC0+IGNhbGxiYWNrXG4gIC8vIGludmFyaWFudDogbm8ga2V5cyBtYXBwaW5nIHRvIGVtcHR5IHNldHMgKHRoZXkgc2hvdWxkIGJlIHJlbW92ZWQgaW5zdGVhZClcbiAgX2FsbEdyYW1tYXJDYWxsYmFja3M6IE1hcDxFdmVudCwgU2V0PChhcmc6IENhbGxiYWNrQXJnKSA9PiBtaXhlZD4+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2NhbGxiYWNrcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9hbGxHcmFtbWFyQ2FsbGJhY2tzID0gbmV3IE1hcCgpO1xuICB9XG5cbiAgZ2V0Q2FsbGJhY2tzKGdyYW1tYXI6IHN0cmluZywgZXZlbnQ6IEV2ZW50KTogU2V0PChhcmc6IENhbGxiYWNrQXJnKSA9PiBtaXhlZD4ge1xuICAgIGNvbnN0IGV2ZW50TWFwID0gdGhpcy5fY2FsbGJhY2tzLmdldChncmFtbWFyKTtcbiAgICBjb25zdCBjYWxsYmFja3NGb3JHcmFtbWFyID0gdGhpcy5fZ2V0Q2FsbGJhY2tzRnJvbUV2ZW50TWFwKGV2ZW50TWFwLCBldmVudCk7XG4gICAgY29uc3QgY2FsbGJhY2tzRm9yQWxsID0gdGhpcy5fZ2V0Q2FsbGJhY2tzRnJvbUV2ZW50TWFwKHRoaXMuX2FsbEdyYW1tYXJDYWxsYmFja3MsIGV2ZW50KTtcbiAgICBjb25zdCByZXN1bHRTZXQgPSBuZXcgU2V0KCk7XG4gICAgY29uc3QgYWRkID0gY2FsbGJhY2sgPT4geyByZXN1bHRTZXQuYWRkKGNhbGxiYWNrKTsgfTtcbiAgICBjYWxsYmFja3NGb3JHcmFtbWFyLmZvckVhY2goYWRkKTtcbiAgICBjYWxsYmFja3NGb3JBbGwuZm9yRWFjaChhZGQpO1xuICAgIHJldHVybiByZXN1bHRTZXQ7XG4gIH1cblxuICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9jYWxsYmFja3Muc2l6ZSA9PT0gMCAmJiB0aGlzLl9hbGxHcmFtbWFyQ2FsbGJhY2tzLnNpemUgPT09IDA7XG4gIH1cblxuICBfZ2V0Q2FsbGJhY2tzRnJvbUV2ZW50TWFwKFxuICAgIGV2ZW50TWFwOiA/TWFwPEV2ZW50LCBTZXQ8KGFyZzogQ2FsbGJhY2tBcmcpID0+IG1peGVkPj4sXG4gICAgZXZlbnQ6IEV2ZW50KTogU2V0PChhcmc6IENhbGxiYWNrQXJnXG4gICkgPT4gbWl4ZWQ+IHtcbiAgICBpZiAoIWV2ZW50TWFwKSB7XG4gICAgICByZXR1cm4gbmV3IFNldCgpO1xuICAgIH1cbiAgICBjb25zdCBjYWxsYmFja1NldCA9IGV2ZW50TWFwLmdldChldmVudCk7XG4gICAgaWYgKCFjYWxsYmFja1NldCkge1xuICAgICAgcmV0dXJuIG5ldyBTZXQoKTtcbiAgICB9XG4gICAgcmV0dXJuIGNhbGxiYWNrU2V0O1xuICB9XG5cbiAgYWRkQ2FsbGJhY2soXG4gICAgICBncmFtbWFyU2NvcGVzOiBJdGVyYWJsZTxzdHJpbmc+IHwgJ2FsbCcsXG4gICAgICBldmVudHM6IEl0ZXJhYmxlPEV2ZW50PixcbiAgICAgIGNhbGxiYWNrOiAoYXJnOiBDYWxsYmFja0FyZykgPT4gbWl4ZWRcbiAgICAgICk6IHZvaWQge1xuICAgIGlmIChncmFtbWFyU2NvcGVzID09PSAnYWxsJykge1xuICAgICAgdGhpcy5fYWRkVG9FdmVudE1hcCh0aGlzLl9hbGxHcmFtbWFyQ2FsbGJhY2tzLCBldmVudHMsIGNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChjb25zdCBncmFtbWFyU2NvcGUgb2YgZ3JhbW1hclNjb3Blcykge1xuICAgICAgICBsZXQgZXZlbnRNYXAgPSB0aGlzLl9jYWxsYmFja3MuZ2V0KGdyYW1tYXJTY29wZSk7XG4gICAgICAgIGlmICghZXZlbnRNYXApIHtcbiAgICAgICAgICBldmVudE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICB0aGlzLl9jYWxsYmFja3Muc2V0KGdyYW1tYXJTY29wZSwgZXZlbnRNYXApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2FkZFRvRXZlbnRNYXAoZXZlbnRNYXAsIGV2ZW50cywgY2FsbGJhY2spO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIHJlbW92ZSB0aGUgY2FsbGJhY2tzLCBtYWludGFpbmluZyB0aGUgaW52YXJpYW50IHRoYXQgdGhlcmUgc2hvdWxkIGJlIG5vXG4gIC8vIGVtcHR5IG1hcHMgb3Igc2V0cyBpbiB0aGlzLl9jYWxsYmFja3NcbiAgcmVtb3ZlQ2FsbGJhY2soXG4gICAgICBncmFtbWFyU2NvcGVzOiBJdGVyYWJsZTxzdHJpbmc+IHwgJ2FsbCcsXG4gICAgICBldmVudHM6IEl0ZXJhYmxlPEV2ZW50PixcbiAgICAgIGNhbGxiYWNrOiAoYXJnOiBDYWxsYmFja0FyZykgPT4gbWl4ZWRcbiAgICAgICk6IHZvaWQge1xuICAgIGlmIChncmFtbWFyU2NvcGVzID09PSAnYWxsJykge1xuICAgICAgdGhpcy5fcmVtb3ZlRnJvbUV2ZW50TWFwKHRoaXMuX2FsbEdyYW1tYXJDYWxsYmFja3MsIGV2ZW50cywgY2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGNvbnN0IGdyYW1tYXJTY29wZSBvZiBncmFtbWFyU2NvcGVzKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50TWFwID0gdGhpcy5fY2FsbGJhY2tzLmdldChncmFtbWFyU2NvcGUpO1xuICAgICAgICBpbnZhcmlhbnQoZXZlbnRNYXApO1xuICAgICAgICB0aGlzLl9yZW1vdmVGcm9tRXZlbnRNYXAoZXZlbnRNYXAsIGV2ZW50cywgY2FsbGJhY2spO1xuICAgICAgICBpZiAoZXZlbnRNYXAuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuX2NhbGxiYWNrcy5kZWxldGUoZ3JhbW1hclNjb3BlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9hZGRUb0V2ZW50TWFwKFxuICAgICAgZXZlbnRNYXA6IE1hcDxFdmVudCwgU2V0PChhcmc6IENhbGxiYWNrQXJnKSA9PiBtaXhlZD4+LFxuICAgICAgZXZlbnRzOiBJdGVyYWJsZTxFdmVudD4sXG4gICAgICBjYWxsYmFjazogKGFyZzogQ2FsbGJhY2tBcmcpID0+IG1peGVkKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBldmVudCBvZiBldmVudHMpIHtcbiAgICAgIGxldCBjYWxsYmFja1NldCA9IGV2ZW50TWFwLmdldChldmVudCk7XG4gICAgICBpZiAoIWNhbGxiYWNrU2V0KSB7XG4gICAgICAgIGNhbGxiYWNrU2V0ID0gbmV3IFNldCgpO1xuICAgICAgICBldmVudE1hcC5zZXQoZXZlbnQsIGNhbGxiYWNrU2V0KTtcbiAgICAgIH1cbiAgICAgIGNhbGxiYWNrU2V0LmFkZChjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgX3JlbW92ZUZyb21FdmVudE1hcChcbiAgICAgIGV2ZW50TWFwOiBNYXA8RXZlbnQsIFNldDwoYXJnOiBDYWxsYmFja0FyZykgPT4gbWl4ZWQ+PixcbiAgICAgIGV2ZW50czogSXRlcmFibGU8RXZlbnQ+LFxuICAgICAgY2FsbGJhY2s6IChhcmc6IENhbGxiYWNrQXJnKSA9PiBtaXhlZCk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgZXZlbnQgb2YgZXZlbnRzKSB7XG4gICAgICBjb25zdCBjYWxsYmFja1NldCA9IGV2ZW50TWFwLmdldChldmVudCk7XG4gICAgICBpbnZhcmlhbnQoY2FsbGJhY2tTZXQpO1xuICAgICAgY2FsbGJhY2tTZXQuZGVsZXRlKGNhbGxiYWNrKTtcbiAgICAgIGlmIChjYWxsYmFja1NldC5zaXplID09PSAwKSB7XG4gICAgICAgIGV2ZW50TWFwLmRlbGV0ZShldmVudCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogTWVhbnQgdG8gbWFrZSBpdCBzaW1wbGUgYW5kIGVhc3kgZm9yIGEgRGlhZ25vc3RpY1Byb3ZpZGVyIHRvIHN1YnNjcmliZSB0b1xuICogcmVsZXZhbnQgZXZlbnRzLiBDdXJyZW50bHkgcHJvdmlkZXMgdHdvIG1ldGhvZHMsIG9uRmlsZUNoYW5nZSBhbmQgb25GaWxlU2F2ZS5cbiAqIEEgRGlhZ25vc3RpY1Byb3ZpZGVyIHdpbGwgdHlwaWNhbGx5IHN1YnNjcmliZSB0byBvbmx5IG9uZSwgZGVwZW5kaW5nIG9uXG4gKiB3aGV0aGVyIGl0IHdhbnRzIHRvIGJlIG5vdGlmaWVkIHdoZW5ldmVyIGEgZmlsZSBjaGFuZ2VzIG9yIG9ubHkgd2hlbiBpdCBpc1xuICogc2F2ZWQuXG4gKlxuICogQm90aCBtZXRob2RzIHRha2UgdHdvIGFyZ3VtZW50czpcbiAqIC0gQW4gSXRlcmFibGUgb2YgZ3JhbW1hcnMgZm9yIHdoaWNoIHRoZSBEaWFnbm9zdGljUHJvdmlkZXIgY2FuIHByb3ZpZGVcbiAqIGRpYWdub3N0aWNzLlxuICogLSBUaGUgY2FsbGJhY2sgdG8gYmUgY2FsbGVkIG9uIGEgdGV4dCBldmVudC5cbiAqXG4gKiBBIFRleHRFdmVudERpc3BhdGNoZXIgd2lsbCBiZSBzdWJzY3JpYmVkIHRvIHRleHQgZXZlbnRzIGlmIGFuZCBvbmx5IGlmIGl0IGhhc1xuICogc3Vic2NyaWJlcnMgb2YgaXRzIG93bi4gSWYgYWxsIHN1YnNjcmliZXJzIHVuc3Vic2NyaWJlLCBpdCB3aWxsIHVuc3Vic2NyaWJlXG4gKiBmcm9tIEF0b20ncyB0ZXh0IGV2ZW50cy5cbiAqXG4gKi9cbmNsYXNzIFRleHRFdmVudERpc3BhdGNoZXIge1xuICBfY2FsbGJhY2tDb250YWluZXI6IFRleHRDYWxsYmFja0NvbnRhaW5lcjxUZXh0RWRpdG9yPjtcblxuICBfZWRpdG9yTGlzdGVuZXJEaXNwb3NhYmxlOiA/Q29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBfcGVuZGluZ0V2ZW50czogV2Vha01hcDxhdG9tJFRleHRCdWZmZXIsIFNldDxFdmVudD4+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2NhbGxiYWNrQ29udGFpbmVyID0gbmV3IFRleHRDYWxsYmFja0NvbnRhaW5lcigpO1xuICAgIHRoaXMuX2VkaXRvckxpc3RlbmVyRGlzcG9zYWJsZSA9IG51bGw7XG4gICAgdGhpcy5fcGVuZGluZ0V2ZW50cyA9IG5ldyBXZWFrTWFwKCk7XG4gIH1cblxuICBfb25FdmVudHMoXG4gICAgZ3JhbW1hclNjb3BlczogSXRlcmFibGU8c3RyaW5nPiB8ICdhbGwnLFxuICAgIGV2ZW50czogSXRlcmFibGU8RXZlbnQ+LFxuICAgIGNhbGxiYWNrOiBFdmVudENhbGxiYWNrLFxuICApIHtcbiAgICBpZiAodGhpcy5fY2FsbGJhY2tDb250YWluZXIuaXNFbXB0eSgpKSB7XG4gICAgICB0aGlzLl9yZWdpc3RlckVkaXRvckxpc3RlbmVycygpO1xuICAgIH1cbiAgICAvLyBTb21ldGltZXMgdGhlc2UgZXZlbnRzIGdldCB0cmlnZ2VyZWQgc2V2ZXJhbCB0aW1lcyBpbiBzdWNjZXNzaW9uXG4gICAgLy8gKHBhcnRpY3VsYXJseSBvbiBzdGFydHVwKS5cbiAgICBjb25zdCBkZWJvdW5jZWRDYWxsYmFjayA9IGRlYm91bmNlKGNhbGxiYWNrLCA1MCwgdHJ1ZSk7XG4gICAgdGhpcy5fY2FsbGJhY2tDb250YWluZXIuYWRkQ2FsbGJhY2soZ3JhbW1hclNjb3BlcywgZXZlbnRzLCBkZWJvdW5jZWRDYWxsYmFjayk7XG4gICAgY29uc3QgZGlzcG9zYWJsZXMgPSBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICB0aGlzLl9jYWxsYmFja0NvbnRhaW5lci5yZW1vdmVDYWxsYmFjayhncmFtbWFyU2NvcGVzLCBldmVudHMsIGRlYm91bmNlZENhbGxiYWNrKTtcbiAgICAgIGlmICh0aGlzLl9jYWxsYmFja0NvbnRhaW5lci5pc0VtcHR5KCkpIHtcbiAgICAgICAgdGhpcy5fZGVyZWdpc3RlckVkaXRvckxpc3RlbmVycygpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkaXNwb3NhYmxlcztcbiAgfVxuXG4gIG9uRmlsZUNoYW5nZShncmFtbWFyU2NvcGVzOiBJdGVyYWJsZTxzdHJpbmc+LCBjYWxsYmFjazogRXZlbnRDYWxsYmFjayk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fb25FdmVudHMoZ3JhbW1hclNjb3BlcywgRklMRV9DSEFOR0VfRVZFTlRTLCBjYWxsYmFjayk7XG4gIH1cbiAgb25BbnlGaWxlQ2hhbmdlKGNhbGxiYWNrOiBFdmVudENhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9vbkV2ZW50cygnYWxsJywgRklMRV9DSEFOR0VfRVZFTlRTLCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkZpbGVTYXZlKGdyYW1tYXJTY29wZXM6IEl0ZXJhYmxlPHN0cmluZz4sIGNhbGxiYWNrOiBFdmVudENhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9vbkV2ZW50cyhncmFtbWFyU2NvcGVzLCBGSUxFX1NBVkVfRVZFTlRTLCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkFueUZpbGVTYXZlKGNhbGxiYWNrOiBFdmVudENhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9vbkV2ZW50cygnYWxsJywgRklMRV9TQVZFX0VWRU5UUywgY2FsbGJhY2spO1xuICB9XG5cbiAgX3JlZ2lzdGVyRWRpdG9yTGlzdGVuZXJzKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fZWRpdG9yTGlzdGVuZXJEaXNwb3NhYmxlKSB7XG4gICAgICB0aGlzLl9lZGl0b3JMaXN0ZW5lckRpc3Bvc2FibGUgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIH1cblxuICAgIC8vIFdoZW5ldmVyIHRoZSBhY3RpdmUgcGFuZSBpdGVtIGNoYW5nZXMsIHdlIGNoZWNrIHRvIHNlZSBpZiB0aGVyZSBhcmUgYW55XG4gICAgLy8gcGVuZGluZyBldmVudHMgZm9yIHRoZSBuZXdseS1mb2N1c2VkIFRleHRFZGl0b3IuXG4gICAgdGhpcy5fZ2V0RWRpdG9yTGlzdGVuZXJEaXNwb3NhYmxlKCkuYWRkKGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0oKCkgPT4ge1xuICAgICAgY29uc3QgY3VycmVudEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgIGlmIChjdXJyZW50RWRpdG9yKSB7XG4gICAgICAgIGNvbnN0IHBlbmRpbmdFdmVudHMgPSB0aGlzLl9wZW5kaW5nRXZlbnRzLmdldChjdXJyZW50RWRpdG9yLmdldEJ1ZmZlcigpKTtcbiAgICAgICAgaWYgKHBlbmRpbmdFdmVudHMpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIHBlbmRpbmdFdmVudHMpIHtcbiAgICAgICAgICAgIHRoaXMuX2Rpc3BhdGNoRXZlbnRzKGN1cnJlbnRFZGl0b3IsIGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fcGVuZGluZ0V2ZW50cy5kZWxldGUoY3VycmVudEVkaXRvci5nZXRCdWZmZXIoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICB0aGlzLl9nZXRFZGl0b3JMaXN0ZW5lckRpc3Bvc2FibGUoKS5hZGQoYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKGVkaXRvciA9PiB7XG4gICAgICBjb25zdCBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKCk7XG4gICAgICBjb25zdCBtYWtlRGlzcGF0Y2ggPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fZGlzcGF0Y2hFdmVudHMoZWRpdG9yLCBldmVudCk7XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgICAgdGhpcy5fZ2V0RWRpdG9yTGlzdGVuZXJEaXNwb3NhYmxlKCkuYWRkKGJ1ZmZlci5vbkRpZFN0b3BDaGFuZ2luZyhtYWtlRGlzcGF0Y2goJ2RpZC1jaGFuZ2UnKSkpO1xuICAgICAgdGhpcy5fZ2V0RWRpdG9yTGlzdGVuZXJEaXNwb3NhYmxlKCkuYWRkKGJ1ZmZlci5vbkRpZFNhdmUobWFrZURpc3BhdGNoKCdkaWQtc2F2ZScpKSk7XG4gICAgICB0aGlzLl9nZXRFZGl0b3JMaXN0ZW5lckRpc3Bvc2FibGUoKS5hZGQoYnVmZmVyLm9uRGlkUmVsb2FkKG1ha2VEaXNwYXRjaCgnZGlkLXJlbG9hZCcpKSk7XG4gICAgICB0aGlzLl9kaXNwYXRjaEV2ZW50cyhlZGl0b3IsICdkaWQtb3BlbicpO1xuICAgIH0pKTtcbiAgfVxuXG4gIF9kZXJlZ2lzdGVyRWRpdG9yTGlzdGVuZXJzKCkge1xuICAgIGlmICh0aGlzLl9lZGl0b3JMaXN0ZW5lckRpc3Bvc2FibGUpIHtcbiAgICAgIHRoaXMuX2dldEVkaXRvckxpc3RlbmVyRGlzcG9zYWJsZSgpLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2VkaXRvckxpc3RlbmVyRGlzcG9zYWJsZSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX2Rpc3BhdGNoRXZlbnRzKGVkaXRvcjogVGV4dEVkaXRvciwgZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgY3VycmVudEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoY3VycmVudEVkaXRvciAmJiBlZGl0b3IgPT09IGN1cnJlbnRFZGl0b3IpIHtcbiAgICAgIGNvbnN0IGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrQ29udGFpbmVyLmdldENhbGxiYWNrcyhlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSwgZXZlbnQpO1xuICAgICAgZm9yIChjb25zdCBjYWxsYmFjayBvZiBjYWxsYmFja3MpIHtcbiAgICAgICAgY2FsbGJhY2soZWRpdG9yKTtcbiAgICAgIH1cbiAgICAvLyBXZSB3YW50IHRvIGF2b2lkIHN0b3JpbmcgcGVuZGluZyBldmVudHMgaWYgdGhpcyBldmVudCB3YXMgZ2VuZXJhdGVkIGJ5XG4gICAgLy8gdGhlIHNhbWUgYnVmZmVyIGFzIHRoZSBjdXJyZW50IGVkaXRvciwgdG8gYXZvaWQgZHVwbGljYXRpbmcgZXZlbnRzIHdoZW5cbiAgICAvLyBtdWx0aXBsZSBwYW5lcyBoYXZlIHRoZSBzYW1lIGZpbGUgb3Blbi5cbiAgICB9IGVsc2UgaWYgKCFjdXJyZW50RWRpdG9yIHx8IGVkaXRvci5nZXRCdWZmZXIoKSAhPT0gY3VycmVudEVkaXRvci5nZXRCdWZmZXIoKSkge1xuICAgICAgLy8gVHJpZ2dlciB0aGlzIGV2ZW50IG5leHQgdGltZSB3ZSBzd2l0Y2ggdG8gYW4gZWRpdG9yIHdpdGggdGhpcyBidWZmZXIuXG4gICAgICBjb25zdCBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKCk7XG4gICAgICBsZXQgZXZlbnRzID0gdGhpcy5fcGVuZGluZ0V2ZW50cy5nZXQoYnVmZmVyKTtcbiAgICAgIGlmICghZXZlbnRzKSB7XG4gICAgICAgIGV2ZW50cyA9IG5ldyBTZXQoKTtcbiAgICAgICAgdGhpcy5fcGVuZGluZ0V2ZW50cy5zZXQoYnVmZmVyLCBldmVudHMpO1xuICAgICAgfVxuICAgICAgZXZlbnRzLmFkZChldmVudCk7XG4gICAgfVxuICB9XG5cbiAgX2dldEVkaXRvckxpc3RlbmVyRGlzcG9zYWJsZSgpOiBDb21wb3NpdGVEaXNwb3NhYmxlIHtcbiAgICBjb25zdCBkaXNwb3NhYmxlID0gdGhpcy5fZWRpdG9yTGlzdGVuZXJEaXNwb3NhYmxlO1xuICAgIGludmFyaWFudChkaXNwb3NhYmxlLCAnVGV4dEV2ZW50RGlzcGF0Y2hlciBkaXNwb3NhYmxlIGlzIG5vdCBpbml0aWFsaXplZCcpO1xuICAgIHJldHVybiBkaXNwb3NhYmxlO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBUZXh0RXZlbnREaXNwYXRjaGVyLFxuICBfX1RFU1RfXzoge1xuICAgIFRleHRDYWxsYmFja0NvbnRhaW5lcixcbiAgfSxcbn07XG4iXX0=