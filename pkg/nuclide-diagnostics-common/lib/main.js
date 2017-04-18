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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }