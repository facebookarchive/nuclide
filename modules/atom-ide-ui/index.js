'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _types;

function _load_types() {
  return _types = require('./pkg/atom-ide-debugger/lib/types');
}

Object.defineProperty(exports, 'DebuggerService', {
  enumerable: true,
  get: function () {
    return (_types || _load_types()).RemoteDebuggerService;
  }
});