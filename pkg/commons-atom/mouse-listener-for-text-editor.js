Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.default = mouseListenerForTextEditor;

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
  return _commonsNodeDebounce2 = _interopRequireDefault(require('../commons-node/debounce'));
}

var DEBOUNCE_TIME = 200;

var WindowMouseListener = (function () {
  function WindowMouseListener() {
    var _this = this;

    _classCallCheck(this, WindowMouseListener);

    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();

    var handler = (0, (_commonsNodeDebounce2 || _commonsNodeDebounce()).default)(function (event) {
      return _this._handleMouseMove(event);
    }, DEBOUNCE_TIME,
    /* immediate */true);
    window.addEventListener('mousemove', handler);
    this._mouseMoveListener = new (_atom2 || _atom()).Disposable(function () {
      window.removeEventListener('mousemove', handler);
    });

    this._textEditorMouseListenersMap = new Map();
    this._textEditorMouseListenersCountMap = new Map();
    this._subscriptions.add(new (_atom2 || _atom()).Disposable(function () {
      _this._textEditorMouseListenersMap.forEach(function (listener) {
        return listener.dispose();
      });
      _this._textEditorMouseListenersMap.clear();
      _this._textEditorMouseListenersCountMap.clear();
    }));
  }

  _createClass(WindowMouseListener, [{
    key: 'mouseListenerForTextEditor',
    value: function mouseListenerForTextEditor(textEditor) {
      var _this2 = this;

      // Keep track of how many mouse listeners were returned for the text editor
      // so we know when it's safe to actually dispose it.
      var count = this._textEditorMouseListenersCountMap.get(textEditor) || 0;
      this._textEditorMouseListenersCountMap.set(textEditor, count + 1);

      var mouseListener = this._textEditorMouseListenersMap.get(textEditor);
      if (!mouseListener) {
        (function () {
          mouseListener = new TextEditorMouseListener(textEditor, /* shouldDispose */function () {
            var currentCount = _this2._textEditorMouseListenersCountMap.get(textEditor) || 0;
            if (currentCount === 1) {
              _this2._textEditorMouseListenersCountMap.delete(textEditor);
              _this2._textEditorMouseListenersMap.delete(textEditor);
              return true;
            } else {
              _this2._textEditorMouseListenersCountMap.set(textEditor, currentCount - 1);
              return false;
            }
          });
          _this2._textEditorMouseListenersMap.set(textEditor, mouseListener);

          var destroySubscription = textEditor.onDidDestroy(function () {
            // $FlowIssue: There is no way for this to become null.
            mouseListener.dispose();
            _this2._textEditorMouseListenersMap.delete(textEditor);
            _this2._textEditorMouseListenersCountMap.delete(textEditor);
            destroySubscription.dispose();
          });
        })();
      }
      return mouseListener;
    }
  }, {
    key: '_handleMouseMove',
    value: function _handleMouseMove(event) {
      this._textEditorMouseListenersMap.forEach(function (mouseListener) {
        return mouseListener._handleMouseMove(event);
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
      if (this._mouseMoveListener) {
        this._mouseMoveListener.dispose();
      }
    }
  }]);

  return WindowMouseListener;
})();

var TextEditorMouseListener = (function () {
  function TextEditorMouseListener(textEditor, shouldDispose) {
    _classCallCheck(this, TextEditorMouseListener);

    this._textEditor = textEditor;
    this._textEditorView = atom.views.getView(this._textEditor);

    this._shouldDispose = shouldDispose;
    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();

    this._emitter = new (_atom2 || _atom()).Emitter();
    this._subscriptions.add(this._emitter);

    this._lastPosition = new (_atom2 || _atom()).Point(0, 0);
  }

  /**
   * Returns an object that tracks the mouse position in a text editor.
   *
   * The positions are in text editor screen coordinates and are rounded down
   * to the last position on each line.
   */

  /**
   * Returns the last known text editor screen position under the mouse,
   * initialized to (0, 0).
   */

  _createClass(TextEditorMouseListener, [{
    key: 'getLastPosition',
    value: function getLastPosition() {
      return this._lastPosition;
    }

    /**
     * Calls `fn` when the mouse moves onto another text editor screen position,
     * not pixel position.
     */
  }, {
    key: 'onDidPositionChange',
    value: function onDidPositionChange(fn) {
      return this._emitter.on('did-position-change', fn);
    }
  }, {
    key: 'screenPositionForMouseEvent',
    value: function screenPositionForMouseEvent(event) {
      var component = this._textEditorView.component;
      (0, (_assert2 || _assert()).default)(component);
      return component.screenPositionForMouseEvent(event);
    }
  }, {
    key: '_handleMouseMove',
    value: function _handleMouseMove(event) {
      var position = this.screenPositionForMouseEvent(event);
      if (position.compare(this._lastPosition) !== 0) {
        this._lastPosition = position;
        this._emitter.emit('did-position-change', {
          nativeEvent: event,
          position: position
        });
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._shouldDispose()) {
        this._subscriptions.dispose();
      }
    }
  }]);

  return TextEditorMouseListener;
})();

function mouseListenerForTextEditor(textEditor) {
  // $FlowFixMe
  atom.nuclide = atom.nuclide || {};
  atom.nuclide.windowMouseListener = atom.nuclide.windowMouseListener || new WindowMouseListener();
  return atom.nuclide.windowMouseListener.mouseListenerForTextEditor(textEditor);
}

module.exports = exports.default;