'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _DiagnosticStore;

function _load_DiagnosticStore() {
  return _DiagnosticStore = require('./DiagnosticStore');
}

Object.defineProperty(exports, 'DiagnosticStore', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_DiagnosticStore || _load_DiagnosticStore()).default;
  }
});

var _TextEventDispatcher;

function _load_TextEventDispatcher() {
  return _TextEventDispatcher = require('./TextEventDispatcher');
}

Object.defineProperty(exports, 'TextEventDispatcher', {
  enumerable: true,
  get: function () {
    return (_TextEventDispatcher || _load_TextEventDispatcher()).TextEventDispatcher;
  }
});
Object.defineProperty(exports, 'observeTextEditorEvents', {
  enumerable: true,
  get: function () {
    return (_TextEventDispatcher || _load_TextEventDispatcher()).observeTextEditorEvents;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }