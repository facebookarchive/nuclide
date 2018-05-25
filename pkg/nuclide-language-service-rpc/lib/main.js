'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ServerLanguageService;

function _load_ServerLanguageService() {
  return _ServerLanguageService = require('./ServerLanguageService');
}

Object.defineProperty(exports, 'ServerLanguageService', {
  enumerable: true,
  get: function () {
    return (_ServerLanguageService || _load_ServerLanguageService()).ServerLanguageService;
  }
});
Object.defineProperty(exports, 'ensureInvalidations', {
  enumerable: true,
  get: function () {
    return (_ServerLanguageService || _load_ServerLanguageService()).ensureInvalidations;
  }
});

var _NullLanguageService;

function _load_NullLanguageService() {
  return _NullLanguageService = require('./NullLanguageService');
}

Object.defineProperty(exports, 'NullLanguageService', {
  enumerable: true,
  get: function () {
    return (_NullLanguageService || _load_NullLanguageService()).NullLanguageService;
  }
});

var _MultiProjectLanguageService;

function _load_MultiProjectLanguageService() {
  return _MultiProjectLanguageService = require('./MultiProjectLanguageService');
}

Object.defineProperty(exports, 'MultiProjectLanguageService', {
  enumerable: true,
  get: function () {
    return (_MultiProjectLanguageService || _load_MultiProjectLanguageService()).MultiProjectLanguageService;
  }
});

var _HostServicesAggregator;

function _load_HostServicesAggregator() {
  return _HostServicesAggregator = require('./HostServicesAggregator');
}

Object.defineProperty(exports, 'forkHostServices', {
  enumerable: true,
  get: function () {
    return (_HostServicesAggregator || _load_HostServicesAggregator()).forkHostServices;
  }
});

var _TypeHintFromSnippet;

function _load_TypeHintFromSnippet() {
  return _TypeHintFromSnippet = require('./TypeHintFromSnippet');
}

Object.defineProperty(exports, 'typeHintFromSnippet', {
  enumerable: true,
  get: function () {
    return (_TypeHintFromSnippet || _load_TypeHintFromSnippet()).typeHintFromSnippet;
  }
});