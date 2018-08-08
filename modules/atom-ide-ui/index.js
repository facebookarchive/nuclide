"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "DebuggerService", {
  enumerable: true,
  get: function () {
    return _types().RemoteDebuggerService;
  }
});

function _types() {
  const data = require("./pkg/atom-ide-debugger/lib/types");

  _types = function () {
    return data;
  };

  return data;
}