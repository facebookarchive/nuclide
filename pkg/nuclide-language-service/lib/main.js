'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _AtomLanguageService;

function _load_AtomLanguageService() {
  return _AtomLanguageService = require('./AtomLanguageService');
}

Object.defineProperty(exports, 'AtomLanguageService', {
  enumerable: true,
  get: function () {
    return (_AtomLanguageService || _load_AtomLanguageService()).AtomLanguageService;
  }
});
Object.defineProperty(exports, 'AtomLanguageServiceConfig', {
  enumerable: true,
  get: function () {
    return (_AtomLanguageService || _load_AtomLanguageService()).AtomLanguageServiceConfig;
  }
});

var _HostServices;

function _load_HostServices() {
  return _HostServices = require('./HostServices');
}

Object.defineProperty(exports, 'getHostServices', {
  enumerable: true,
  get: function () {
    return (_HostServices || _load_HostServices()).getHostServices;
  }
});

var _LanguageService;

function _load_LanguageService() {
  return _LanguageService = require('./LanguageService');
}

Object.defineProperty(exports, 'LanguageService', {
  enumerable: true,
  get: function () {
    return (_LanguageService || _load_LanguageService()).LanguageService;
  }
});

var _AutocompleteProvider;

function _load_AutocompleteProvider() {
  return _AutocompleteProvider = require('./AutocompleteProvider');
}

Object.defineProperty(exports, 'updateAutocompleteResults', {
  enumerable: true,
  get: function () {
    return (_AutocompleteProvider || _load_AutocompleteProvider()).updateAutocompleteResults;
  }
});
Object.defineProperty(exports, 'updateAutocompleteFirstResults', {
  enumerable: true,
  get: function () {
    return (_AutocompleteProvider || _load_AutocompleteProvider()).updateAutocompleteFirstResults;
  }
});
Object.defineProperty(exports, 'updateAutocompleteResultRanges', {
  enumerable: true,
  get: function () {
    return (_AutocompleteProvider || _load_AutocompleteProvider()).updateAutocompleteResultRanges;
  }
});