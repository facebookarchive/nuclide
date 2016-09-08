Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _Constants2;

function _Constants() {
  return _Constants2 = _interopRequireDefault(require('./Constants'));
}

var CallstackStore = (function () {
  function CallstackStore(dispatcher) {
    _classCallCheck(this, CallstackStore);

    var dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new (_atom2 || _atom()).CompositeDisposable(new (_atom2 || _atom()).Disposable(function () {
      dispatcher.unregister(dispatcherToken);
    }));
    this._callstack = null;
    this._selectedCallFrameMarker = null;
    this._emitter = new (_atom2 || _atom()).Emitter();
  }

  _createClass(CallstackStore, [{
    key: '_handlePayload',
    value: function _handlePayload(payload) {
      switch (payload.actionType) {
        case (_Constants2 || _Constants()).default.Actions.CLEAR_INTERFACE:
          this._handleClearInterface();
          break;
        case (_Constants2 || _Constants()).default.Actions.SET_SELECTED_CALLFRAME_LINE:
          this._setSelectedCallFrameLine(payload.data.options);
          break;
        case (_Constants2 || _Constants()).default.Actions.OPEN_SOURCE_LOCATION:
          this._openSourceLocation(payload.data.sourceURL, payload.data.lineNumber);
          break;
        case (_Constants2 || _Constants()).default.Actions.UPDATE_CALLSTACK:
          this._updateCallstack(payload.data.callstack);
          break;
        default:
          return;
      }
    }
  }, {
    key: '_updateCallstack',
    value: function _updateCallstack(callstack) {
      this._callstack = callstack;
      this._emitter.emit('change');
    }
  }, {
    key: '_openSourceLocation',
    value: function _openSourceLocation(sourceURL, lineNumber) {
      var _this = this;

      var path = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.uriToNuclideUri(sourceURL);
      if (path != null && atom.workspace != null) {
        // only handle real files for now.
        atom.workspace.open(path, { searchAllPanes: true }).then(function (editor) {
          _this._nagivateToLocation(editor, lineNumber);
        });
      }
    }
  }, {
    key: '_nagivateToLocation',
    value: function _nagivateToLocation(editor, line) {
      editor.scrollToBufferPosition([line, 0]);
      editor.setCursorBufferPosition([line, 0]);
    }
  }, {
    key: '_handleClearInterface',
    value: function _handleClearInterface() {
      this._setSelectedCallFrameLine(null);
      this._updateCallstack([]);
    }
  }, {
    key: '_setSelectedCallFrameLine',
    value: function _setSelectedCallFrameLine(options) {
      var _this2 = this;

      if (options) {
        (function () {
          var path = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.uriToNuclideUri(options.sourceURL);
          var lineNumber = options.lineNumber;

          if (path != null && atom.workspace != null) {
            // only handle real files for now
            atom.workspace.open(path, { searchAllPanes: true }).then(function (editor) {
              _this2._clearSelectedCallFrameMarker();
              _this2._highlightCallFrameLine(editor, lineNumber);
              _this2._nagivateToLocation(editor, lineNumber);
            });
          }
        })();
      } else {
        this._clearSelectedCallFrameMarker();
      }
    }
  }, {
    key: '_highlightCallFrameLine',
    value: function _highlightCallFrameLine(editor, line) {
      var marker = editor.markBufferRange([[line, 0], [line, Infinity]], { invalidate: 'never' });
      editor.decorateMarker(marker, {
        type: 'line',
        'class': 'nuclide-current-line-highlight'
      });
      this._selectedCallFrameMarker = marker;
    }
  }, {
    key: '_clearSelectedCallFrameMarker',
    value: function _clearSelectedCallFrameMarker() {
      if (this._selectedCallFrameMarker) {
        this._selectedCallFrameMarker.destroy();
        this._selectedCallFrameMarker = null;
      }
    }
  }, {
    key: 'onChange',
    value: function onChange(callback) {
      return this._emitter.on('change', callback);
    }
  }, {
    key: 'getCallstack',
    value: function getCallstack() {
      return this._callstack;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._clearSelectedCallFrameMarker();
      this._disposables.dispose();
    }
  }]);

  return CallstackStore;
})();

exports.default = CallstackStore;
module.exports = exports.default;