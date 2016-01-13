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
//# sourceMappingURL=data:application/json;base64,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Q2YscUJBQW1CLEVBQW5CLG1CQUFtQjtBQUNuQixVQUFRLEVBQUU7QUFDUix5QkFBcUIsRUFBckIscUJBQXFCO0dBQ3RCO0NBQ0YsQ0FBQyIsImZpbGUiOiJUZXh0RXZlbnREaXNwYXRjaGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgaW52YXJpYW50ID0gcmVxdWlyZSgnYXNzZXJ0Jyk7XG5jb25zdCB7RGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5cbmNvbnN0IHtkZWJvdW5jZX0gPSByZXF1aXJlKCcuLi8uLi9jb21tb25zJyk7XG5cbnR5cGUgRXZlbnRDYWxsYmFjayA9IChlZGl0b3I6IFRleHRFZGl0b3IpID0+IG1peGVkO1xuXG50eXBlIEV2ZW50ID0gJ2RpZC1yZWxvYWQnIHwgJ2RpZC1jaGFuZ2UnIHwgJ2RpZC1zYXZlJyB8ICdkaWQtb3Blbic7XG5cbi8vIEEgcmVsb2FkIGNoYW5nZXMgdGhlIHRleHQgaW4gdGhlIGJ1ZmZlciwgc28gaXQgc2hvdWxkIHRyaWdnZXIgYSByZWZyZXNoLlxuY29uc3QgRklMRV9DSEFOR0VfRVZFTlRTID0gWydkaWQtY2hhbmdlJywgJ2RpZC1yZWxvYWQnLCAnZGlkLW9wZW4nXTtcblxuLy8gQSByZWxvYWQgYmFzaWNhbGx5IGluZGljYXRlcyB0aGF0IGFuIGV4dGVybmFsIHByb2dyYW0gc2F2ZWQgdGhlIGZpbGUsIHNvXG4vLyBpdCBzaG91bGQgdHJpZ2dlciBhIHJlZnJlc2guXG5jb25zdCBGSUxFX1NBVkVfRVZFTlRTID0gWydkaWQtc2F2ZScsICdkaWQtcmVsb2FkJywgJ2RpZC1vcGVuJ107XG5cbi8qKlxuICogU3RvcmVzIGNhbGxiYWNrcyBrZXllZCBvbiBncmFtbWFyIGFuZCBldmVudCwgdG8gYWxsb3cgZm9yIGVhc3kgcmV0cmlldmFsIHdoZW5cbiAqIHdlIG5lZWQgdG8gZGlzcGF0Y2ggdG8gYWxsIGNhbGxiYWNrcyByZWdpc3RlcmVkIGZvciBhIGdpdmVuIChncmFtbWFyLCBldmVudClcbiAqIHBhaXIuXG4gKi9cbmNsYXNzIFRleHRDYWxsYmFja0NvbnRhaW5lcjxDYWxsYmFja0FyZz4ge1xuICAvLyBncmFtbWFyIC0+IGV2ZW50IC0+IGNhbGxiYWNrXG4gIC8vIGludmFyaWFudDogbm8gZW1wdHkgbWFwcyBvciBzZXRzICh0aGV5IHNob3VsZCBiZSByZW1vdmVkIGluc3RlYWQpXG4gIF9jYWxsYmFja3M6IE1hcDxzdHJpbmcsIE1hcDxFdmVudCwgU2V0PChhcmc6IENhbGxiYWNrQXJnKSA9PiBtaXhlZD4+PjtcblxuICAvLyBldmVudCAtPiBjYWxsYmFja1xuICAvLyBpbnZhcmlhbnQ6IG5vIGtleXMgbWFwcGluZyB0byBlbXB0eSBzZXRzICh0aGV5IHNob3VsZCBiZSByZW1vdmVkIGluc3RlYWQpXG4gIF9hbGxHcmFtbWFyQ2FsbGJhY2tzOiBNYXA8RXZlbnQsIFNldDwoYXJnOiBDYWxsYmFja0FyZykgPT4gbWl4ZWQ+PjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9jYWxsYmFja3MgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fYWxsR3JhbW1hckNhbGxiYWNrcyA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIGdldENhbGxiYWNrcyhncmFtbWFyOiBzdHJpbmcsIGV2ZW50OiBFdmVudCk6IFNldDwoYXJnOiBDYWxsYmFja0FyZykgPT4gbWl4ZWQ+IHtcbiAgICBjb25zdCBldmVudE1hcCA9IHRoaXMuX2NhbGxiYWNrcy5nZXQoZ3JhbW1hcik7XG4gICAgY29uc3QgY2FsbGJhY2tzRm9yR3JhbW1hciA9IHRoaXMuX2dldENhbGxiYWNrc0Zyb21FdmVudE1hcChldmVudE1hcCwgZXZlbnQpO1xuICAgIGNvbnN0IGNhbGxiYWNrc0ZvckFsbCA9IHRoaXMuX2dldENhbGxiYWNrc0Zyb21FdmVudE1hcCh0aGlzLl9hbGxHcmFtbWFyQ2FsbGJhY2tzLCBldmVudCk7XG4gICAgY29uc3QgcmVzdWx0U2V0ID0gbmV3IFNldCgpO1xuICAgIGNvbnN0IGFkZCA9IGNhbGxiYWNrID0+IHsgcmVzdWx0U2V0LmFkZChjYWxsYmFjayk7IH07XG4gICAgY2FsbGJhY2tzRm9yR3JhbW1hci5mb3JFYWNoKGFkZCk7XG4gICAgY2FsbGJhY2tzRm9yQWxsLmZvckVhY2goYWRkKTtcbiAgICByZXR1cm4gcmVzdWx0U2V0O1xuICB9XG5cbiAgaXNFbXB0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzLnNpemUgPT09IDAgJiYgdGhpcy5fYWxsR3JhbW1hckNhbGxiYWNrcy5zaXplID09PSAwO1xuICB9XG5cbiAgX2dldENhbGxiYWNrc0Zyb21FdmVudE1hcChcbiAgICBldmVudE1hcDogP01hcDxFdmVudCwgU2V0PChhcmc6IENhbGxiYWNrQXJnKSA9PiBtaXhlZD4+LFxuICAgIGV2ZW50OiBFdmVudCk6IFNldDwoYXJnOiBDYWxsYmFja0FyZ1xuICApID0+IG1peGVkPiB7XG4gICAgaWYgKCFldmVudE1hcCkge1xuICAgICAgcmV0dXJuIG5ldyBTZXQoKTtcbiAgICB9XG4gICAgY29uc3QgY2FsbGJhY2tTZXQgPSBldmVudE1hcC5nZXQoZXZlbnQpO1xuICAgIGlmICghY2FsbGJhY2tTZXQpIHtcbiAgICAgIHJldHVybiBuZXcgU2V0KCk7XG4gICAgfVxuICAgIHJldHVybiBjYWxsYmFja1NldDtcbiAgfVxuXG4gIGFkZENhbGxiYWNrKFxuICAgICAgZ3JhbW1hclNjb3BlczogSXRlcmFibGU8c3RyaW5nPiB8ICdhbGwnLFxuICAgICAgZXZlbnRzOiBJdGVyYWJsZTxFdmVudD4sXG4gICAgICBjYWxsYmFjazogKGFyZzogQ2FsbGJhY2tBcmcpID0+IG1peGVkXG4gICAgICApOiB2b2lkIHtcbiAgICBpZiAoZ3JhbW1hclNjb3BlcyA9PT0gJ2FsbCcpIHtcbiAgICAgIHRoaXMuX2FkZFRvRXZlbnRNYXAodGhpcy5fYWxsR3JhbW1hckNhbGxiYWNrcywgZXZlbnRzLCBjYWxsYmFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoY29uc3QgZ3JhbW1hclNjb3BlIG9mIGdyYW1tYXJTY29wZXMpIHtcbiAgICAgICAgbGV0IGV2ZW50TWFwID0gdGhpcy5fY2FsbGJhY2tzLmdldChncmFtbWFyU2NvcGUpO1xuICAgICAgICBpZiAoIWV2ZW50TWFwKSB7XG4gICAgICAgICAgZXZlbnRNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgdGhpcy5fY2FsbGJhY2tzLnNldChncmFtbWFyU2NvcGUsIGV2ZW50TWFwKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9hZGRUb0V2ZW50TWFwKGV2ZW50TWFwLCBldmVudHMsIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyByZW1vdmUgdGhlIGNhbGxiYWNrcywgbWFpbnRhaW5pbmcgdGhlIGludmFyaWFudCB0aGF0IHRoZXJlIHNob3VsZCBiZSBub1xuICAvLyBlbXB0eSBtYXBzIG9yIHNldHMgaW4gdGhpcy5fY2FsbGJhY2tzXG4gIHJlbW92ZUNhbGxiYWNrKFxuICAgICAgZ3JhbW1hclNjb3BlczogSXRlcmFibGU8c3RyaW5nPiB8ICdhbGwnLFxuICAgICAgZXZlbnRzOiBJdGVyYWJsZTxFdmVudD4sXG4gICAgICBjYWxsYmFjazogKGFyZzogQ2FsbGJhY2tBcmcpID0+IG1peGVkXG4gICAgICApOiB2b2lkIHtcbiAgICBpZiAoZ3JhbW1hclNjb3BlcyA9PT0gJ2FsbCcpIHtcbiAgICAgIHRoaXMuX3JlbW92ZUZyb21FdmVudE1hcCh0aGlzLl9hbGxHcmFtbWFyQ2FsbGJhY2tzLCBldmVudHMsIGNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChjb25zdCBncmFtbWFyU2NvcGUgb2YgZ3JhbW1hclNjb3Blcykge1xuICAgICAgICBjb25zdCBldmVudE1hcCA9IHRoaXMuX2NhbGxiYWNrcy5nZXQoZ3JhbW1hclNjb3BlKTtcbiAgICAgICAgaW52YXJpYW50KGV2ZW50TWFwKTtcbiAgICAgICAgdGhpcy5fcmVtb3ZlRnJvbUV2ZW50TWFwKGV2ZW50TWFwLCBldmVudHMsIGNhbGxiYWNrKTtcbiAgICAgICAgaWYgKGV2ZW50TWFwLnNpemUgPT09IDApIHtcbiAgICAgICAgICB0aGlzLl9jYWxsYmFja3MuZGVsZXRlKGdyYW1tYXJTY29wZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfYWRkVG9FdmVudE1hcChcbiAgICAgIGV2ZW50TWFwOiBNYXA8RXZlbnQsIFNldDwoYXJnOiBDYWxsYmFja0FyZykgPT4gbWl4ZWQ+PixcbiAgICAgIGV2ZW50czogSXRlcmFibGU8RXZlbnQ+LFxuICAgICAgY2FsbGJhY2s6IChhcmc6IENhbGxiYWNrQXJnKSA9PiBtaXhlZCk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgZXZlbnQgb2YgZXZlbnRzKSB7XG4gICAgICBsZXQgY2FsbGJhY2tTZXQgPSBldmVudE1hcC5nZXQoZXZlbnQpO1xuICAgICAgaWYgKCFjYWxsYmFja1NldCkge1xuICAgICAgICBjYWxsYmFja1NldCA9IG5ldyBTZXQoKTtcbiAgICAgICAgZXZlbnRNYXAuc2V0KGV2ZW50LCBjYWxsYmFja1NldCk7XG4gICAgICB9XG4gICAgICBjYWxsYmFja1NldC5hZGQoY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIF9yZW1vdmVGcm9tRXZlbnRNYXAoXG4gICAgICBldmVudE1hcDogTWFwPEV2ZW50LCBTZXQ8KGFyZzogQ2FsbGJhY2tBcmcpID0+IG1peGVkPj4sXG4gICAgICBldmVudHM6IEl0ZXJhYmxlPEV2ZW50PixcbiAgICAgIGNhbGxiYWNrOiAoYXJnOiBDYWxsYmFja0FyZykgPT4gbWl4ZWQpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIGV2ZW50cykge1xuICAgICAgY29uc3QgY2FsbGJhY2tTZXQgPSBldmVudE1hcC5nZXQoZXZlbnQpO1xuICAgICAgaW52YXJpYW50KGNhbGxiYWNrU2V0KTtcbiAgICAgIGNhbGxiYWNrU2V0LmRlbGV0ZShjYWxsYmFjayk7XG4gICAgICBpZiAoY2FsbGJhY2tTZXQuc2l6ZSA9PT0gMCkge1xuICAgICAgICBldmVudE1hcC5kZWxldGUoZXZlbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIE1lYW50IHRvIG1ha2UgaXQgc2ltcGxlIGFuZCBlYXN5IGZvciBhIERpYWdub3N0aWNQcm92aWRlciB0byBzdWJzY3JpYmUgdG9cbiAqIHJlbGV2YW50IGV2ZW50cy4gQ3VycmVudGx5IHByb3ZpZGVzIHR3byBtZXRob2RzLCBvbkZpbGVDaGFuZ2UgYW5kIG9uRmlsZVNhdmUuXG4gKiBBIERpYWdub3N0aWNQcm92aWRlciB3aWxsIHR5cGljYWxseSBzdWJzY3JpYmUgdG8gb25seSBvbmUsIGRlcGVuZGluZyBvblxuICogd2hldGhlciBpdCB3YW50cyB0byBiZSBub3RpZmllZCB3aGVuZXZlciBhIGZpbGUgY2hhbmdlcyBvciBvbmx5IHdoZW4gaXQgaXNcbiAqIHNhdmVkLlxuICpcbiAqIEJvdGggbWV0aG9kcyB0YWtlIHR3byBhcmd1bWVudHM6XG4gKiAtIEFuIEl0ZXJhYmxlIG9mIGdyYW1tYXJzIGZvciB3aGljaCB0aGUgRGlhZ25vc3RpY1Byb3ZpZGVyIGNhbiBwcm92aWRlXG4gKiBkaWFnbm9zdGljcy5cbiAqIC0gVGhlIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCBvbiBhIHRleHQgZXZlbnQuXG4gKlxuICogQSBUZXh0RXZlbnREaXNwYXRjaGVyIHdpbGwgYmUgc3Vic2NyaWJlZCB0byB0ZXh0IGV2ZW50cyBpZiBhbmQgb25seSBpZiBpdCBoYXNcbiAqIHN1YnNjcmliZXJzIG9mIGl0cyBvd24uIElmIGFsbCBzdWJzY3JpYmVycyB1bnN1YnNjcmliZSwgaXQgd2lsbCB1bnN1YnNjcmliZVxuICogZnJvbSBBdG9tJ3MgdGV4dCBldmVudHMuXG4gKlxuICovXG5jbGFzcyBUZXh0RXZlbnREaXNwYXRjaGVyIHtcbiAgX2NhbGxiYWNrQ29udGFpbmVyOiBUZXh0Q2FsbGJhY2tDb250YWluZXI8VGV4dEVkaXRvcj47XG5cbiAgX2VkaXRvckxpc3RlbmVyRGlzcG9zYWJsZTogP0NvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgX3BlbmRpbmdFdmVudHM6IFdlYWtNYXA8YXRvbSRUZXh0QnVmZmVyLCBTZXQ8RXZlbnQ+PjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9jYWxsYmFja0NvbnRhaW5lciA9IG5ldyBUZXh0Q2FsbGJhY2tDb250YWluZXIoKTtcbiAgICB0aGlzLl9lZGl0b3JMaXN0ZW5lckRpc3Bvc2FibGUgPSBudWxsO1xuICAgIHRoaXMuX3BlbmRpbmdFdmVudHMgPSBuZXcgV2Vha01hcCgpO1xuICB9XG5cbiAgX29uRXZlbnRzKFxuICAgIGdyYW1tYXJTY29wZXM6IEl0ZXJhYmxlPHN0cmluZz4gfCAnYWxsJyxcbiAgICBldmVudHM6IEl0ZXJhYmxlPEV2ZW50PixcbiAgICBjYWxsYmFjazogRXZlbnRDYWxsYmFjayxcbiAgKSB7XG4gICAgaWYgKHRoaXMuX2NhbGxiYWNrQ29udGFpbmVyLmlzRW1wdHkoKSkge1xuICAgICAgdGhpcy5fcmVnaXN0ZXJFZGl0b3JMaXN0ZW5lcnMoKTtcbiAgICB9XG4gICAgLy8gU29tZXRpbWVzIHRoZXNlIGV2ZW50cyBnZXQgdHJpZ2dlcmVkIHNldmVyYWwgdGltZXMgaW4gc3VjY2Vzc2lvblxuICAgIC8vIChwYXJ0aWN1bGFybHkgb24gc3RhcnR1cCkuXG4gICAgY29uc3QgZGVib3VuY2VkQ2FsbGJhY2sgPSBkZWJvdW5jZShjYWxsYmFjaywgNTAsIHRydWUpO1xuICAgIHRoaXMuX2NhbGxiYWNrQ29udGFpbmVyLmFkZENhbGxiYWNrKGdyYW1tYXJTY29wZXMsIGV2ZW50cywgZGVib3VuY2VkQ2FsbGJhY2spO1xuICAgIGNvbnN0IGRpc3Bvc2FibGVzID0gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGhpcy5fY2FsbGJhY2tDb250YWluZXIucmVtb3ZlQ2FsbGJhY2soZ3JhbW1hclNjb3BlcywgZXZlbnRzLCBkZWJvdW5jZWRDYWxsYmFjayk7XG4gICAgICBpZiAodGhpcy5fY2FsbGJhY2tDb250YWluZXIuaXNFbXB0eSgpKSB7XG4gICAgICAgIHRoaXMuX2RlcmVnaXN0ZXJFZGl0b3JMaXN0ZW5lcnMoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZGlzcG9zYWJsZXM7XG4gIH1cblxuICBvbkZpbGVDaGFuZ2UoZ3JhbW1hclNjb3BlczogSXRlcmFibGU8c3RyaW5nPiwgY2FsbGJhY2s6IEV2ZW50Q2FsbGJhY2spOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9vbkV2ZW50cyhncmFtbWFyU2NvcGVzLCBGSUxFX0NIQU5HRV9FVkVOVFMsIGNhbGxiYWNrKTtcbiAgfVxuICBvbkFueUZpbGVDaGFuZ2UoY2FsbGJhY2s6IEV2ZW50Q2FsbGJhY2spOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9vbkV2ZW50cygnYWxsJywgRklMRV9DSEFOR0VfRVZFTlRTLCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkZpbGVTYXZlKGdyYW1tYXJTY29wZXM6IEl0ZXJhYmxlPHN0cmluZz4sIGNhbGxiYWNrOiBFdmVudENhbGxiYWNrKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fb25FdmVudHMoZ3JhbW1hclNjb3BlcywgRklMRV9TQVZFX0VWRU5UUywgY2FsbGJhY2spO1xuICB9XG5cbiAgb25BbnlGaWxlU2F2ZShjYWxsYmFjazogRXZlbnRDYWxsYmFjayk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX29uRXZlbnRzKCdhbGwnLCBGSUxFX1NBVkVfRVZFTlRTLCBjYWxsYmFjayk7XG4gIH1cblxuICBfcmVnaXN0ZXJFZGl0b3JMaXN0ZW5lcnMoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9lZGl0b3JMaXN0ZW5lckRpc3Bvc2FibGUpIHtcbiAgICAgIHRoaXMuX2VkaXRvckxpc3RlbmVyRGlzcG9zYWJsZSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgfVxuXG4gICAgLy8gV2hlbmV2ZXIgdGhlIGFjdGl2ZSBwYW5lIGl0ZW0gY2hhbmdlcywgd2UgY2hlY2sgdG8gc2VlIGlmIHRoZXJlIGFyZSBhbnlcbiAgICAvLyBwZW5kaW5nIGV2ZW50cyBmb3IgdGhlIG5ld2x5LWZvY3VzZWQgVGV4dEVkaXRvci5cbiAgICB0aGlzLl9nZXRFZGl0b3JMaXN0ZW5lckRpc3Bvc2FibGUoKS5hZGQoYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSgoKSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgaWYgKGN1cnJlbnRFZGl0b3IpIHtcbiAgICAgICAgY29uc3QgcGVuZGluZ0V2ZW50cyA9IHRoaXMuX3BlbmRpbmdFdmVudHMuZ2V0KGN1cnJlbnRFZGl0b3IuZ2V0QnVmZmVyKCkpO1xuICAgICAgICBpZiAocGVuZGluZ0V2ZW50cykge1xuICAgICAgICAgIGZvciAoY29uc3QgZXZlbnQgb2YgcGVuZGluZ0V2ZW50cykge1xuICAgICAgICAgICAgdGhpcy5fZGlzcGF0Y2hFdmVudHMoY3VycmVudEVkaXRvciwgZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9wZW5kaW5nRXZlbnRzLmRlbGV0ZShjdXJyZW50RWRpdG9yLmdldEJ1ZmZlcigpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pKTtcblxuICAgIHRoaXMuX2dldEVkaXRvckxpc3RlbmVyRGlzcG9zYWJsZSgpLmFkZChhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoZWRpdG9yID0+IHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKTtcbiAgICAgIGNvbnN0IG1ha2VEaXNwYXRjaCA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICB0aGlzLl9kaXNwYXRjaEV2ZW50cyhlZGl0b3IsIGV2ZW50KTtcbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgICB0aGlzLl9nZXRFZGl0b3JMaXN0ZW5lckRpc3Bvc2FibGUoKS5hZGQoYnVmZmVyLm9uRGlkU3RvcENoYW5naW5nKG1ha2VEaXNwYXRjaCgnZGlkLWNoYW5nZScpKSk7XG4gICAgICB0aGlzLl9nZXRFZGl0b3JMaXN0ZW5lckRpc3Bvc2FibGUoKS5hZGQoYnVmZmVyLm9uRGlkU2F2ZShtYWtlRGlzcGF0Y2goJ2RpZC1zYXZlJykpKTtcbiAgICAgIHRoaXMuX2dldEVkaXRvckxpc3RlbmVyRGlzcG9zYWJsZSgpLmFkZChidWZmZXIub25EaWRSZWxvYWQobWFrZURpc3BhdGNoKCdkaWQtcmVsb2FkJykpKTtcbiAgICAgIHRoaXMuX2Rpc3BhdGNoRXZlbnRzKGVkaXRvciwgJ2RpZC1vcGVuJyk7XG4gICAgfSkpO1xuICB9XG5cbiAgX2RlcmVnaXN0ZXJFZGl0b3JMaXN0ZW5lcnMoKSB7XG4gICAgaWYgKHRoaXMuX2VkaXRvckxpc3RlbmVyRGlzcG9zYWJsZSkge1xuICAgICAgdGhpcy5fZ2V0RWRpdG9yTGlzdGVuZXJEaXNwb3NhYmxlKCkuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fZWRpdG9yTGlzdGVuZXJEaXNwb3NhYmxlID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfZGlzcGF0Y2hFdmVudHMoZWRpdG9yOiBUZXh0RWRpdG9yLCBldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBjdXJyZW50RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChjdXJyZW50RWRpdG9yICYmIGVkaXRvciA9PT0gY3VycmVudEVkaXRvcikge1xuICAgICAgY29uc3QgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tDb250YWluZXIuZ2V0Q2FsbGJhY2tzKGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lLCBldmVudCk7XG4gICAgICBmb3IgKGNvbnN0IGNhbGxiYWNrIG9mIGNhbGxiYWNrcykge1xuICAgICAgICBjYWxsYmFjayhlZGl0b3IpO1xuICAgICAgfVxuICAgIC8vIFdlIHdhbnQgdG8gYXZvaWQgc3RvcmluZyBwZW5kaW5nIGV2ZW50cyBpZiB0aGlzIGV2ZW50IHdhcyBnZW5lcmF0ZWQgYnlcbiAgICAvLyB0aGUgc2FtZSBidWZmZXIgYXMgdGhlIGN1cnJlbnQgZWRpdG9yLCB0byBhdm9pZCBkdXBsaWNhdGluZyBldmVudHMgd2hlblxuICAgIC8vIG11bHRpcGxlIHBhbmVzIGhhdmUgdGhlIHNhbWUgZmlsZSBvcGVuLlxuICAgIH0gZWxzZSBpZiAoIWN1cnJlbnRFZGl0b3IgfHwgZWRpdG9yLmdldEJ1ZmZlcigpICE9PSBjdXJyZW50RWRpdG9yLmdldEJ1ZmZlcigpKSB7XG4gICAgICAvLyBUcmlnZ2VyIHRoaXMgZXZlbnQgbmV4dCB0aW1lIHdlIHN3aXRjaCB0byBhbiBlZGl0b3Igd2l0aCB0aGlzIGJ1ZmZlci5cbiAgICAgIGNvbnN0IGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKTtcbiAgICAgIGxldCBldmVudHMgPSB0aGlzLl9wZW5kaW5nRXZlbnRzLmdldChidWZmZXIpO1xuICAgICAgaWYgKCFldmVudHMpIHtcbiAgICAgICAgZXZlbnRzID0gbmV3IFNldCgpO1xuICAgICAgICB0aGlzLl9wZW5kaW5nRXZlbnRzLnNldChidWZmZXIsIGV2ZW50cyk7XG4gICAgICB9XG4gICAgICBldmVudHMuYWRkKGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICBfZ2V0RWRpdG9yTGlzdGVuZXJEaXNwb3NhYmxlKCk6IENvbXBvc2l0ZURpc3Bvc2FibGUge1xuICAgIGNvbnN0IGRpc3Bvc2FibGUgPSB0aGlzLl9lZGl0b3JMaXN0ZW5lckRpc3Bvc2FibGU7XG4gICAgaW52YXJpYW50KGRpc3Bvc2FibGUsICdUZXh0RXZlbnREaXNwYXRjaGVyIGRpc3Bvc2FibGUgaXMgbm90IGluaXRpYWxpemVkJyk7XG4gICAgcmV0dXJuIGRpc3Bvc2FibGU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFRleHRFdmVudERpc3BhdGNoZXIsXG4gIF9fVEVTVF9fOiB7XG4gICAgVGV4dENhbGxiYWNrQ29udGFpbmVyLFxuICB9LFxufTtcbiJdfQ==