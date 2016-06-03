var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsNodeDebounce2;

function _commonsNodeDebounce() {
  return _commonsNodeDebounce2 = _interopRequireDefault(require('../../commons-node/debounce'));
}

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
          (0, (_assert2 || _assert()).default)(eventMap);
          this._removeFromEventMap(eventMap, events, callback);
          if (eventMap.size === 0) {
            this._callbacks.delete(grammarScope);
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
        (0, (_assert2 || _assert()).default)(callbackSet);
        callbackSet.delete(callback);
        if (callbackSet.size === 0) {
          eventMap.delete(_event2);
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
      var debouncedCallback = (0, (_commonsNodeDebounce2 || _commonsNodeDebounce()).default)(callback, 50, true);
      this._callbackContainer.addCallback(grammarScopes, events, debouncedCallback);
      var disposables = new (_atom2 || _atom()).Disposable(function () {
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
        this._editorListenerDisposable = new (_atom2 || _atom()).CompositeDisposable();
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
            _this2._pendingEvents.delete(currentEditor.getBuffer());
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
      (0, (_assert2 || _assert()).default)(disposable, 'TextEventDispatcher disposable is not initialized');
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