"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Server", {
  enumerable: true,
  get: function () {
    return _Server().Server;
  }
});
Object.defineProperty(exports, "startSearchProviders", {
  enumerable: true,
  get: function () {
    return _Search().startSearchProviders;
  }
});
Object.defineProperty(exports, "getConnectedFilesystems", {
  enumerable: true,
  get: function () {
    return _state().getConnectedFilesystems;
  }
});
Object.defineProperty(exports, "getFilesystemForUri", {
  enumerable: true,
  get: function () {
    return _state().getFilesystemForUri;
  }
});
Object.defineProperty(exports, "getFilesystems", {
  enumerable: true,
  get: function () {
    return _state().getFilesystems;
  }
});
Object.defineProperty(exports, "getServers", {
  enumerable: true,
  get: function () {
    return _state().getServers;
  }
});
Object.defineProperty(exports, "onEachFilesystem", {
  enumerable: true,
  get: function () {
    return _state().onEachFilesystem;
  }
});
Object.defineProperty(exports, "startFilesystems", {
  enumerable: true,
  get: function () {
    return _state().startFilesystems;
  }
});

function _Server() {
  const data = require("./Server");

  _Server = function () {
    return data;
  };

  return data;
}

function _Search() {
  const data = require("./Search");

  _Search = function () {
    return data;
  };

  return data;
}

function _state() {
  const data = require("./state");

  _state = function () {
    return data;
  };

  return data;
}