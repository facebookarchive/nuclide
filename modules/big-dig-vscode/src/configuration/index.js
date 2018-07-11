"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "getConnectionProfileDictionary", {
  enumerable: true,
  get: function () {
    return _profile().getConnectionProfileDictionary;
  }
});
Object.defineProperty(exports, "getConnectionIdForCredentialStore", {
  enumerable: true,
  get: function () {
    return _profile().getConnectionIdForCredentialStore;
  }
});
Object.defineProperty(exports, "getConnectionProfiles", {
  enumerable: true,
  get: function () {
    return _profile().getConnectionProfiles;
  }
});
Object.defineProperty(exports, "getIntegratedTerminal", {
  enumerable: true,
  get: function () {
    return _terminal().getIntegratedTerminal;
  }
});
Object.defineProperty(exports, "connectionProfileUpdates", {
  enumerable: true,
  get: function () {
    return _profileUpdates().connectionProfileUpdates;
  }
});

function _profile() {
  const data = require("./profile");

  _profile = function () {
    return data;
  };

  return data;
}

function _terminal() {
  const data = require("./terminal");

  _terminal = function () {
    return data;
  };

  return data;
}

function _profileUpdates() {
  const data = require("./profile-updates");

  _profileUpdates = function () {
    return data;
  };

  return data;
}