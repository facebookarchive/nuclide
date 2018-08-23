"use strict";

function DebugProtocol() {
  const data = _interopRequireWildcard(require("vscode-debugprotocol"));

  DebugProtocol = function () {
    return data;
  };

  return data;
}

function _Breakpoint() {
  const data = _interopRequireDefault(require("./Breakpoint"));

  _Breakpoint = function () {
    return data;
  };

  return data;
}

function _Thread() {
  const data = _interopRequireDefault(require("./Thread"));

  _Thread = function () {
    return data;
  };

  return data;
}

function _ThreadCollection() {
  const data = _interopRequireDefault(require("./ThreadCollection"));

  _ThreadCollection = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }