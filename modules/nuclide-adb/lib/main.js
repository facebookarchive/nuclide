"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "getAdbServiceByNuclideUri", {
  enumerable: true,
  get: function () {
    return _utils().getAdbServiceByNuclideUri;
  }
});
Object.defineProperty(exports, "adbDeviceForIdentifier", {
  enumerable: true,
  get: function () {
    return _AdbDevicePoller().adbDeviceForIdentifier;
  }
});
Object.defineProperty(exports, "observeAndroidDevices", {
  enumerable: true,
  get: function () {
    return _AdbDevicePoller().observeAndroidDevices;
  }
});

function _utils() {
  const data = require("./utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _AdbDevicePoller() {
  const data = require("./AdbDevicePoller");

  _AdbDevicePoller = function () {
    return data;
  };

  return data;
}