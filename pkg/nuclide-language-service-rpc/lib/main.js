"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ServerLanguageService", {
  enumerable: true,
  get: function () {
    return _ServerLanguageService().ServerLanguageService;
  }
});
Object.defineProperty(exports, "ensureInvalidations", {
  enumerable: true,
  get: function () {
    return _ServerLanguageService().ensureInvalidations;
  }
});
Object.defineProperty(exports, "NullLanguageService", {
  enumerable: true,
  get: function () {
    return _NullLanguageService().NullLanguageService;
  }
});
Object.defineProperty(exports, "MultiProjectLanguageService", {
  enumerable: true,
  get: function () {
    return _MultiProjectLanguageService().MultiProjectLanguageService;
  }
});
Object.defineProperty(exports, "forkHostServices", {
  enumerable: true,
  get: function () {
    return _HostServicesAggregator().forkHostServices;
  }
});
Object.defineProperty(exports, "typeHintFromSnippet", {
  enumerable: true,
  get: function () {
    return _TypeHintFromSnippet().typeHintFromSnippet;
  }
});

function _ServerLanguageService() {
  const data = require("./ServerLanguageService");

  _ServerLanguageService = function () {
    return data;
  };

  return data;
}

function _NullLanguageService() {
  const data = require("./NullLanguageService");

  _NullLanguageService = function () {
    return data;
  };

  return data;
}

function _MultiProjectLanguageService() {
  const data = require("./MultiProjectLanguageService");

  _MultiProjectLanguageService = function () {
    return data;
  };

  return data;
}

function _HostServicesAggregator() {
  const data = require("./HostServicesAggregator");

  _HostServicesAggregator = function () {
    return data;
  };

  return data;
}

function _TypeHintFromSnippet() {
  const data = require("./TypeHintFromSnippet");

  _TypeHintFromSnippet = function () {
    return data;
  };

  return data;
}