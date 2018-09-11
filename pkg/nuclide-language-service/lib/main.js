"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "AtomLanguageService", {
  enumerable: true,
  get: function () {
    return _AtomLanguageService().AtomLanguageService;
  }
});
Object.defineProperty(exports, "AtomLanguageServiceConfig", {
  enumerable: true,
  get: function () {
    return _AtomLanguageService().AtomLanguageServiceConfig;
  }
});
Object.defineProperty(exports, "getHostServices", {
  enumerable: true,
  get: function () {
    return _HostServices().getHostServices;
  }
});
Object.defineProperty(exports, "LanguageService", {
  enumerable: true,
  get: function () {
    return _LanguageService().LanguageService;
  }
});
Object.defineProperty(exports, "updateAutocompleteResults", {
  enumerable: true,
  get: function () {
    return _AutocompleteProvider().updateAutocompleteResults;
  }
});
Object.defineProperty(exports, "updateAutocompleteFirstResults", {
  enumerable: true,
  get: function () {
    return _AutocompleteProvider().updateAutocompleteFirstResults;
  }
});
Object.defineProperty(exports, "updateAutocompleteResultRanges", {
  enumerable: true,
  get: function () {
    return _AutocompleteProvider().updateAutocompleteResultRanges;
  }
});

function _AtomLanguageService() {
  const data = require("./AtomLanguageService");

  _AtomLanguageService = function () {
    return data;
  };

  return data;
}

function _HostServices() {
  const data = require("./HostServices");

  _HostServices = function () {
    return data;
  };

  return data;
}

function _LanguageService() {
  const data = require("./LanguageService");

  _LanguageService = function () {
    return data;
  };

  return data;
}

function _AutocompleteProvider() {
  const data = require("./AutocompleteProvider");

  _AutocompleteProvider = function () {
    return data;
  };

  return data;
}