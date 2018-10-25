"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "WatchmanClient", {
  enumerable: true,
  get: function () {
    return _WatchmanClient().default;
  }
});
Object.defineProperty(exports, "WatchmanSubscription", {
  enumerable: true,
  get: function () {
    return _WatchmanSubscription().default;
  }
});

function _WatchmanClient() {
  const data = _interopRequireDefault(require("./WatchmanClient"));

  _WatchmanClient = function () {
    return data;
  };

  return data;
}

function _WatchmanSubscription() {
  const data = _interopRequireDefault(require("./WatchmanSubscription"));

  _WatchmanSubscription = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }