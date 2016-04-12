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

var _require2 = require('../../nuclide-commons');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRleHRFdmVudERpc3BhdGNoZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBV0EsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztlQUNNLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQWxELFVBQVUsWUFBVixVQUFVO0lBQUUsbUJBQW1CLFlBQW5CLG1CQUFtQjs7Z0JBRW5CLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQzs7SUFBNUMsUUFBUSxhQUFSLFFBQVE7OztBQU9mLElBQU0sa0JBQWtCLEdBQUcsQ0FBQyxZQUFZLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDOzs7O0FBSXBFLElBQU0sZ0JBQWdCLEdBQUcsQ0FBQyxVQUFVLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDOzs7Ozs7OztJQU8xRCxxQkFBcUI7QUFTZCxXQVRQLHFCQUFxQixHQVNYOzBCQVRWLHFCQUFxQjs7QUFVdkIsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQzVCLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0dBQ3ZDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztlQVpHLHFCQUFxQjs7V0FjYixzQkFBQyxPQUFlLEVBQUUsS0FBWSxFQUFvQztBQUM1RSxVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5QyxVQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUUsVUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN6RixVQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQzVCLFVBQU0sR0FBRyxHQUFHLFNBQU4sR0FBRyxDQUFHLFFB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LHFCQUFtQixFQUFuQixtQkFBbUI7QUFDbkIsVUFBUSxFQUFFO0FBQ1IseUJBQXFCLEVBQXJCLHFCQUFxQjtHQUN0QjtDQUNGLENBQUMiLCJmaWxlIjoiVGV4dEV2ZW50RGlzcGF0Y2hlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IGludmFyaWFudCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuY29uc3Qge0Rpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuXG5jb25zdCB7ZGVib3VuY2V9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1jb21tb25zJyk7XG5cbnR5cGUgRXZlbnRDYWxsYmFjayA9IChlZGl0b3I6IFRleHRFZGl0b3IpID0+IG1peGVkO1xuXG50eXBlIEV2ZW50ID0gJ2RpZC1yZWxvYWQnIHwgJ2RpZC1jaGFuZ2UnIHwgJ2RpZC1zYXZlJyB8ICdkaWQtb3Blbic7XG5cbi8vIEEgcmVsb2FkIGNoYW5nZXMgdGhlIHRleHQgaW4gdGhlIGJ1ZmZlciwgc28gaXQgc2hvdWxkIHRyaWdnZXIgYSByZWZyZXNoLlxuY29uc3QgRklMRV9DSEFOR0VfRVZFTlRTID0gWydkaWQtY2hhbmdlJywgJ2RpZC1yZWxvYWQnLCAnZGlkLW9wZW4nXTtcblxuLy8gQSByZWxvYWQgYmFzaWNhbGx5IGluZGljYXRlcyB0aGF0IGFuIGV4dGVybmFsIHByb2dyYW0gc2F2ZWQgdGhlIGZpbGUsIHNvXG4vLyBpdCBzaG91bGQgdHJpZ2dlciBhIHJlZnJlc2guXG5jb25zdCBGSUxFX1NBVkVfRVZFTlRTID0gWydkaWQtc2F2ZScsICdkaWQtcmVsb2FkJywgJ2RpZC1vcGVuJ107XG5cbi8qKlxuICogU3RvcmVzIGNhbGxiYWNrcyBrZXllZCBvbiBncmFtbWFyIGFuZCBldmVudCwgdG8gYWxsb3cgZm9yIGVhc3kgcmV0cmlldmFsIHdoZW5cbiAqIHdlIG5lZWQgdG8gZGlzcGF0Y2ggdG8gYWxsIGNhbGxiYWNrcyByZWdpc3RlcmVkIGZvciBhIGdpdmVuIChncmFtbWFyLCBldmVudClcbiAqIHBhaXIuXG4gKi9cbmNsYXNzIFRleHRDYWxsYmFja0NvbnRhaW5lcjxDYWxsYmFja0FyZz4ge1xuICAvLyBncmFtbWFyIC0+IGV2ZW50IC0+IGNhbGxiYWNrXG4gIC8vIGludmFyaWFudDogbm8gZW1wdHkgbWFwcyBvciBzZXRzICh0aGV5IHNob3VsZCBiZSByZW1vdmVkIGluc3RlYWQpXG4gIF9jYWxsYmFja3M6IE1hcDxzdHJpbmcsIE1hcDxFdmVudCwgU2V0PChhcmc6IENhbGxiYWNrQXJnKSA9PiBtaXhlZD4+PjtcblxuICAvLyBldmVudCAtPiBjYWxsYmFja1xuICAvLyBpbnZhcmlhbnQ6IG5vIGtleXMgbWFwcGluZyB0byBlbXB0eSBzZXRzICh0aGV5IHNob3VsZCBiZSByZW1vdmVkIGluc3RlYWQpXG4gIF9hbGxHcmFtbWFyQ2FsbGJhY2tzOiBNYXA8RXZlbnQsIFNldDwoYXJnOiBDYWxsYmFja0FyZykgPT4gbWl4ZWQ+PjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9jYWxsYmFja3MgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fYWxsR3JhbW1hckNhbGxiYWNrcyA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIGdldENhbGxiYWNrcyhncmFtbWFyOiBzdHJpbmcsIGV2ZW50OiBFdmVudCk6IFNldDwoYXJnOiBDYWxsYmFja0FyZykgPT4gbWl4ZWQ+IHtcbiAgICBjb25zdCBldmVudE1hcCA9IHRoaXMuX2NhbGxiYWNrcy5nZXQoZ3JhbW1hcik7XG4gICAgY29uc3QgY2FsbGJhY2tzRm9yR3JhbW1hciA9IHRoaXMuX2dldENhbGxiYWNrc0Zyb21FdmVudE1hcChldmVudE1hcCwgZXZlbnQpO1xuICAgIGNvbnN0IGNhbGxiYWNrc0ZvckFsbCA9IHRoaXMuX2dldENhbGxiYWNrc0Zyb21FdmVudE1hcCh0aGlzLl9hbGxHcmFtbWFyQ2FsbGJhY2tzLCBldmVudCk7XG4gICAgY29uc3QgcmVzdWx0U2V0ID0gbmV3IFNldCgpO1xuICAgIGNvbnN0IGFkZCA9IGNhbGxiYWNrID0+IHsgcmVzdWx0U2V0LmFkZChjYWxsYmFjayk7IH07XG4gICAgY2FsbGJhY2tzRm9yR3JhbW1hci5mb3JFYWNoKGFkZCk7XG4gICAgY2FsbGJhY2tzRm9yQWxsLmZvckVhY2goYWRkKTtcbiAgICByZXR1cm4gcmVzdWx0U2V0O1xuICB9XG5cbiAgaXNFbXB0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzLnNpemUgPT09IDAgJiYgdGhpcy5fYWxsR3JhbW1hckNhbGxiYWNrcy5zaXplID09PSAwO1xuICB9XG5cbiAgX2dldENhbGxiYWNrc0Zyb21FdmVudE1hcChcbiAgICBldmVudE1hcDogP01hcDxFdmVudCwgU2V0PChhcmc6IENhbGxiYWNrQXJnKSA9PiBtaXhlZD4+LFxuICAgIGV2ZW50OiBFdmVudCk6IFNldDwoYXJnOiBDYWxsYmFja0FyZ1xuICApID0+IG1peGVkPiB7XG4gICAgaWYgKCFldmVudE1hcCkge1xuICAgICAgcmV0dXJuIG5ldyBTZXQoKTtcbiAgICB9XG4gICAgY29uc3QgY2FsbGJhY2tTZXQgPSBldmVudE1hcC5nZXQoZXZlbnQpO1xuICAgIGlmICghY2FsbGJhY2tTZXQpIHtcbiAgICAgIHJldHVybiBuZXcgU2V0KCk7XG4gICAgfVxuICAgIHJldHVybiBjYWxsYmFja1NldDtcbiAgfVxuXG4gIGFkZENhbGxiYWNrKFxuICAgICAgZ3JhbW1hclNjb3BlczogSXRlcmFibGU8c3RyaW5nPiB8ICdhbGwnLFxuICAgICAgZXZlbnRzOiBJdGVyYWJsZTxFdmVudD4sXG4gICAgICBjYWxsYmFjazogKGFyZzogQ2FsbGJhY2tBcmcpID0+IG1peGVkXG4gICAgICApOiB2b2lkIHtcbiAgICBpZiAoZ3JhbW1hclNjb3BlcyA9PT0gJ2FsbCcpIHtcbiAgICAgIHRoaXMuX2FkZFRvRXZlbnRNYXAodGhpcy5fYWxsR3JhbW1hckNhbGxiYWNrcywgZXZlbnRzLCBjYWxsYmFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoY29uc3QgZ3JhbW1hclNjb3BlIG9mIGdyYW1tYXJTY29wZXMpIHtcbiAgICAgICAgbGV0IGV2ZW50TWFwID0gdGhpcy5fY2FsbGJhY2tzLmdldChncmFtbWFyU2NvcGUpO1xuICAgICAgICBpZiAoIWV2ZW50TWFwKSB7XG4gICAgICAgICAgZXZlbnRNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgdGhpcy5fY2FsbGJhY2tzLnNldChncmFtbWFyU2NvcGUsIGV2ZW50TWFwKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9hZGRUb0V2ZW50TWFwKGV2ZW50TWFwLCBldmVudHMsIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyByZW1vdmUgdGhlIGNhbGxiYWNrcywgbWFpbnRhaW5pbmcgdGhlIGludmFyaWFudCB0aGF0IHRoZXJlIHNob3VsZCBiZSBub1xuICAvLyBlbXB0eSBtYXBzIG9yIHNldHMgaW4gdGhpcy5fY2FsbGJhY2tzXG4gIHJlbW92ZUNhbGxiYWNrKFxuICAgICAgZ3JhbW1hclNjb3BlczogSXRlcmFibGU8c3RyaW5nPiB8ICdhbGwnLFxuICAgICAgZXZlbnRzOiBJdGVyYWJsZTxFdmVudD4sXG4gICAgICBjYWxsYmFjazogKGFyZzogQ2FsbGJhY2tBcmcpID0+IG1peGVkXG4gICAgICApOiB2b2lkIHtcbiAgICBpZiAoZ3JhbW1hclNjb3BlcyA9PT0gJ2FsbCcpIHtcbiAgICAgIHRoaXMuX3JlbW92ZUZyb21FdmVudE1hcCh0aGlzLl9hbGxHcmFtbWFyQ2FsbGJhY2tzLCBldmVudHMsIGNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChjb25zdCBncmFtbWFyU2NvcGUgb2YgZ3JhbW1hclNjb3Blcykge1xuICAgICAgICBjb25zdCBldmVudE1hcCA9IHRoaXMuX2NhbGxiYWNrcy5nZXQoZ3JhbW1hclNjb3BlKTtcbiAgICAgICAgaW52YXJpYW50KGV2ZW50TWFwKTtcbiAgICAgICAgdGhpcy5fcmVtb3ZlRnJvbUV2ZW50TWFwKGV2ZW50TWFwLCBldmVudHMsIGNhbGxiYWNrKTtcbiAgICAgICAgaWYgKGV2ZW50TWFwLnNpemUgPT09IDApIHtcbiAgICAgICAgICB0aGlzLl9jYWxsYmFja3MuZGVsZXRlKGdyYW1tYXJTY29wZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfYWRkVG9FdmVudE1hcChcbiAgICAgIGV2ZW50TWFwOiBNYXA8RXZlbnQsIFNldDwoYXJnOiBDYWxsYmFja0FyZykgPT4gbWl4ZWQ+PixcbiAgICAgIGV2ZW50czogSXRlcmFibGU8RXZlbnQ+LFxuICAgICAgY2FsbGJhY2s6IChhcmc6IENhbGxiYWNrQXJnKSA9PiBtaXhlZCk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgZXZlbnQgb2YgZXZlbnRzKSB7XG4gICAgICBsZXQgY2FsbGJhY2tTZXQgPSBldmVudE1hcC5nZXQoZXZlbnQpO1xuICAgICAgaWYgKCFjYWxsYmFja1NldCkge1xuICAgICAgICBjYWxsYmFja1NldCA9IG5ldyBTZXQoKTtcbiAgICAgICAgZXZlbnRNYXAuc2V0KGV2ZW50LCBjYWxsYmFja1NldCk7XG4gICAgICB9XG4gICAgICBjYWxsYmFja1NldC5hZGQoY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIF9yZW1vdmVGcm9tRXZlbnRNYXAoXG4gICAgICBldmVudE1hcDogTWFwPEV2ZW50LCBTZXQ8KGFyZzogQ2FsbGJhY2tBcmcpID0+IG1peGVkPj4sXG4gICAgICBldmVudHM6IEl0ZXJhYmxlPEV2ZW50PixcbiAgICAgIGNhbGxiYWNrOiAoYXJnOiBDYWxsYmFja0FyZykgPT4gbWl4ZWQpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIGV2ZW50cykge1xuICAgICAgY29uc3QgY2FsbGJhY2tTZXQgPSBldmVudE1hcC5nZXQoZXZlbnQpO1xuICAgICAgaW52YXJpYW50KGNhbGxiYWNrU2V0KTtcbiAgICAgIGNhbGxiYWNrU2V0LmRlbGV0ZShjYWxsYmFjayk7XG4gICAgICBpZiAoY2FsbGJhY2tTZXQuc2l6ZSA9PT0gMCkge1xuICAgICAgICBldmVudE1hcC5kZWxldGUoZXZlbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIE1lYW50IHRvIG1ha2UgaXQgc2ltcGxlIGFuZCBlYXN5IGZvciBhIERpYWdub3N0aWNQcm92aWRlciB0byBzdWJzY3JpYmUgdG9cbiAqIHJlbGV2YW50IGV2ZW50cy4gQ3VycmVudGx5IHByb3ZpZGVzIHR3byBtZXRob2RzLCBvbkZpbGVDaGFuZ2UgYW5kIG9uRmlsZVNhdmUuXG4gKiBBIERpYWdub3N0aWNQcm92aWRlciB3aWxsIHR5cGljYWxseSBzdWJzY3JpYmUgdG8gb25seSBvbmUsIGRlcGVuZGluZyBvblxuICogd2hldGhlciBpdCB3YW50cyB0byBiZSBub3RpZmllZCB3aGVuZXZlciBhIGZpbGUgY2hhbmdlcyBvciBvbmx5IHdoZW4gaXQgaXNcbiAqIHNhdmVkLlxuICpcbiAqIEJvdGggbWV0aG9kcyB0YWtlIHR3byBhcmd1bWVudHM6XG4gKiAtIEFuIEl0ZXJhYmxlIG9mIGdyYW1tYXJzIGZvciB3aGljaCB0aGUgRGlhZ25vc3RpY1Byb3ZpZGVyIGNhbiBwcm92aWRlXG4gKiBkaWFnbm9zdGljcy5cbiAqIC0gVGhlIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCBvbiBhIHRleHQgZXZlbnQuXG4gKlxuICogQSBUZXh0RXZlbnREaXNwYXRjaGVyIHdpbGwgYmUgc3Vic2NyaWJlZCB0byB0ZXh0IGV2ZW50cyBpZiBhbmQgb25seSBpZiBpdCBoYXNcbiAqIHN1YnNjcmliZXJzIG9mIGl0cyBvd24uIElmIGFsbCBzdWJzY3JpYmVycyB1bnN1YnNjcmliZSwgaXQgd2lsbCB1bnN1YnNjcmliZVxuICogZnJvbSBBdG9tJ3MgdGV4dCBldmVudHMuXG4gKlxuICovXG5jbGFzcyBUZXh0RXZlbnREaXNwYXRjaGVyIHtcbiAgX2NhbGxiYWNrQ29udGFpbmVyOiBUZXh0Q2FsbGJhY2tDb250YWluZXI8VGV4dEVkaXRvcj47XG5cbiAgX2VkaXRvckxpc3RlbmVyRGlzcG9zYWJsZTogP0NvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgX3BlbmRpbmdFdmVudHM6IFdlYWtNYXA8YXRvbSRUZXh0QnVmZmVyLCBTZXQ8RXZlbnQ+PjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9jYWxsYmFja0NvbnRhaW5lciA9IG5ldyBUZXh0Q2FsbGJhY2tDb250YWluZXIoKTtcbiAgICB0aGlzLl9lZGl0b3JMaXN0ZW5lckRpc3Bvc2FibGUgPSBudWxsO1xuICAgIHRoaXMuX3BlbmRpbmdFdmVudHMgPSBuZXcgV2Vha01hcCgpO1xuICB9XG5cbiAgX29uRXZlbnRzKFxuICAgIGdyYW1tYXJTY29wZXM6IEl0ZXJhYmxlPHN0cmluZz4gfCAnYWxsJyxcbiAgICBldmVudHM6IEl0ZXJhYmxlPEV2ZW50PixcbiAgICBjYWxsYmFjazogRXZlbnRDYWxsYmFjayxcbiAgKSB7XG4gICAgaWYgKHRoaXMuX2NhbGxiYWNrQ29udGFpbmVyLmlzRW1wdHkoKSkge1xuICAgICAgdGhpcy5fcmVnaXN0ZXJFZGl0b3JMaXN0ZW5lcnMoKTtcbiAgICB9XG4gICAgLy8gU29tZXRpbWVzIHRoZXNlIGV2ZW50cyBnZXQgdHJpZ2dlcmVkIHNldmVyYWwgdGltZXMgaW4gc3VjY2Vzc2lvblxuICAgIC8vIChwYXJ0aWN1bGFybHkgb24gc3RhcnR1cCkuXG4gICAgY29uc3QgZGVib3VuY2VkQ2FsbGJhY2sgPSBkZWJvdW5jZShjYWxsYmFjaywgNTAsIHRydWUpO1xuICAgIHRoaXMuX2NhbGxiYWNrQ29udGFpbmVyLmFkZENhbGxiYWNrKGdyYW1tYXJTY29wZXMsIGV2ZW50cywgZGVib3VuY2VkQ2FsbGJhY2spO1xuICAgIGNvbnN0IGRpc3Bvc2FibGVzID0gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGhpcy5fY2FsbGJhY2tDb250YWluZXIucmVtb3ZlQ2FsbGJhY2soZ3JhbW1hclNjb3BlcywgZXZlbnRzLCBkZWJvdW5jZWRDYWxsYmFjayk7XG4gICAgICBpZiAodGhpcy5fY2FsbGJhY2tDb250YWluZXIuaXNFbXB0eSgpKSB7XG4gICAgICAgIHRoaXMuX2RlcmVnaXN0ZXJFZGl0b3JMaXN0ZW5lcnMoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZGlzcG9zYWJsZXM7XG4gIH1cblxuICBvbkZpbGVDaGFuZ2UoZ3JhbW1hclNjb3BlczogSXRlcmFibGU8c3RyaW5nPiwgY2FsbGJhY2s6IEV2ZW50Q2FsbGJhY2spOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX29uRXZlbnRzKGdyYW1tYXJTY29wZXMsIEZJTEVfQ0hBTkdFX0VWRU5UUywgY2FsbGJhY2spO1xuICB9XG4gIG9uQW55RmlsZUNoYW5nZShjYWxsYmFjazogRXZlbnRDYWxsYmFjayk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fb25FdmVudHMoJ2FsbCcsIEZJTEVfQ0hBTkdFX0VWRU5UUywgY2FsbGJhY2spO1xuICB9XG5cbiAgb25GaWxlU2F2ZShncmFtbWFyU2NvcGVzOiBJdGVyYWJsZTxzdHJpbmc+LCBjYWxsYmFjazogRXZlbnRDYWxsYmFjayk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fb25FdmVudHMoZ3JhbW1hclNjb3BlcywgRklMRV9TQVZFX0VWRU5UUywgY2FsbGJhY2spO1xuICB9XG5cbiAgb25BbnlGaWxlU2F2ZShjYWxsYmFjazogRXZlbnRDYWxsYmFjayk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fb25FdmVudHMoJ2FsbCcsIEZJTEVfU0FWRV9FVkVOVFMsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIF9yZWdpc3RlckVkaXRvckxpc3RlbmVycygpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2VkaXRvckxpc3RlbmVyRGlzcG9zYWJsZSkge1xuICAgICAgdGhpcy5fZWRpdG9yTGlzdGVuZXJEaXNwb3NhYmxlID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB9XG5cbiAgICAvLyBXaGVuZXZlciB0aGUgYWN0aXZlIHBhbmUgaXRlbSBjaGFuZ2VzLCB3ZSBjaGVjayB0byBzZWUgaWYgdGhlcmUgYXJlIGFueVxuICAgIC8vIHBlbmRpbmcgZXZlbnRzIGZvciB0aGUgbmV3bHktZm9jdXNlZCBUZXh0RWRpdG9yLlxuICAgIHRoaXMuX2dldEVkaXRvckxpc3RlbmVyRGlzcG9zYWJsZSgpLmFkZChhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKCgpID0+IHtcbiAgICAgIGNvbnN0IGN1cnJlbnRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICBpZiAoY3VycmVudEVkaXRvcikge1xuICAgICAgICBjb25zdCBwZW5kaW5nRXZlbnRzID0gdGhpcy5fcGVuZGluZ0V2ZW50cy5nZXQoY3VycmVudEVkaXRvci5nZXRCdWZmZXIoKSk7XG4gICAgICAgIGlmIChwZW5kaW5nRXZlbnRzKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBldmVudCBvZiBwZW5kaW5nRXZlbnRzKSB7XG4gICAgICAgICAgICB0aGlzLl9kaXNwYXRjaEV2ZW50cyhjdXJyZW50RWRpdG9yLCBldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuX3BlbmRpbmdFdmVudHMuZGVsZXRlKGN1cnJlbnRFZGl0b3IuZ2V0QnVmZmVyKCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdGhpcy5fZ2V0RWRpdG9yTGlzdGVuZXJEaXNwb3NhYmxlKCkuYWRkKGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyhlZGl0b3IgPT4ge1xuICAgICAgY29uc3QgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpO1xuICAgICAgY29uc3QgbWFrZURpc3BhdGNoID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX2Rpc3BhdGNoRXZlbnRzKGVkaXRvciwgZXZlbnQpO1xuICAgICAgICB9O1xuICAgICAgfTtcbiAgICAgIHRoaXMuX2dldEVkaXRvckxpc3RlbmVyRGlzcG9zYWJsZSgpLmFkZChidWZmZXIub25EaWRTdG9wQ2hhbmdpbmcobWFrZURpc3BhdGNoKCdkaWQtY2hhbmdlJykpKTtcbiAgICAgIHRoaXMuX2dldEVkaXRvckxpc3RlbmVyRGlzcG9zYWJsZSgpLmFkZChidWZmZXIub25EaWRTYXZlKG1ha2VEaXNwYXRjaCgnZGlkLXNhdmUnKSkpO1xuICAgICAgdGhpcy5fZ2V0RWRpdG9yTGlzdGVuZXJEaXNwb3NhYmxlKCkuYWRkKGJ1ZmZlci5vbkRpZFJlbG9hZChtYWtlRGlzcGF0Y2goJ2RpZC1yZWxvYWQnKSkpO1xuICAgICAgdGhpcy5fZGlzcGF0Y2hFdmVudHMoZWRpdG9yLCAnZGlkLW9wZW4nKTtcbiAgICB9KSk7XG4gIH1cblxuICBfZGVyZWdpc3RlckVkaXRvckxpc3RlbmVycygpIHtcbiAgICBpZiAodGhpcy5fZWRpdG9yTGlzdGVuZXJEaXNwb3NhYmxlKSB7XG4gICAgICB0aGlzLl9nZXRFZGl0b3JMaXN0ZW5lckRpc3Bvc2FibGUoKS5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9lZGl0b3JMaXN0ZW5lckRpc3Bvc2FibGUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9kaXNwYXRjaEV2ZW50cyhlZGl0b3I6IFRleHRFZGl0b3IsIGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGN1cnJlbnRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKGN1cnJlbnRFZGl0b3IgJiYgZWRpdG9yID09PSBjdXJyZW50RWRpdG9yKSB7XG4gICAgICBjb25zdCBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja0NvbnRhaW5lci5nZXRDYWxsYmFja3MoZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUsIGV2ZW50KTtcbiAgICAgIGZvciAoY29uc3QgY2FsbGJhY2sgb2YgY2FsbGJhY2tzKSB7XG4gICAgICAgIGNhbGxiYWNrKGVkaXRvcik7XG4gICAgICB9XG4gICAgLy8gV2Ugd2FudCB0byBhdm9pZCBzdG9yaW5nIHBlbmRpbmcgZXZlbnRzIGlmIHRoaXMgZXZlbnQgd2FzIGdlbmVyYXRlZCBieVxuICAgIC8vIHRoZSBzYW1lIGJ1ZmZlciBhcyB0aGUgY3VycmVudCBlZGl0b3IsIHRvIGF2b2lkIGR1cGxpY2F0aW5nIGV2ZW50cyB3aGVuXG4gICAgLy8gbXVsdGlwbGUgcGFuZXMgaGF2ZSB0aGUgc2FtZSBmaWxlIG9wZW4uXG4gICAgfSBlbHNlIGlmICghY3VycmVudEVkaXRvciB8fCBlZGl0b3IuZ2V0QnVmZmVyKCkgIT09IGN1cnJlbnRFZGl0b3IuZ2V0QnVmZmVyKCkpIHtcbiAgICAgIC8vIFRyaWdnZXIgdGhpcyBldmVudCBuZXh0IHRpbWUgd2Ugc3dpdGNoIHRvIGFuIGVkaXRvciB3aXRoIHRoaXMgYnVmZmVyLlxuICAgICAgY29uc3QgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpO1xuICAgICAgbGV0IGV2ZW50cyA9IHRoaXMuX3BlbmRpbmdFdmVudHMuZ2V0KGJ1ZmZlcik7XG4gICAgICBpZiAoIWV2ZW50cykge1xuICAgICAgICBldmVudHMgPSBuZXcgU2V0KCk7XG4gICAgICAgIHRoaXMuX3BlbmRpbmdFdmVudHMuc2V0KGJ1ZmZlciwgZXZlbnRzKTtcbiAgICAgIH1cbiAgICAgIGV2ZW50cy5hZGQoZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRFZGl0b3JMaXN0ZW5lckRpc3Bvc2FibGUoKTogQ29tcG9zaXRlRGlzcG9zYWJsZSB7XG4gICAgY29uc3QgZGlzcG9zYWJsZSA9IHRoaXMuX2VkaXRvckxpc3RlbmVyRGlzcG9zYWJsZTtcbiAgICBpbnZhcmlhbnQoZGlzcG9zYWJsZSwgJ1RleHRFdmVudERpc3BhdGNoZXIgZGlzcG9zYWJsZSBpcyBub3QgaW5pdGlhbGl6ZWQnKTtcbiAgICByZXR1cm4gZGlzcG9zYWJsZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVGV4dEV2ZW50RGlzcGF0Y2hlcixcbiAgX19URVNUX186IHtcbiAgICBUZXh0Q2FsbGJhY2tDb250YWluZXIsXG4gIH0sXG59O1xuIl19