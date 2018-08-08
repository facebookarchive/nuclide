"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConnectionProfileDictionary = getConnectionProfileDictionary;
exports.getConnectionIdForCredentialStore = getConnectionIdForCredentialStore;
exports.getConnectionProfiles = getConnectionProfiles;

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
function getConnectionProfileDictionary() {
  const profiles = loadConnectionProfiles();
  return new Map(profiles.map(it => [it.hostname, it]));
}
/**
 * @return identifier for the specified profile to use as the key in the
 *   credential store.
 */


function getConnectionIdForCredentialStore(profile) {
  return `${profile.username}@${profile.address}`;
}

function getCreateProfileParser() {
  try {
    // $FlowFB
    const {
      createParser
    } = require("./fb-ProfileConfigurationParser");

    return createParser;
  } catch (e) {
    // MODULE_NOT_FOUND is expected for non-FB.
    if (e.code !== 'MODULE_NOT_FOUND') {
      throw e;
    } else {
      const {
        createParser
      } = require("./ProfileConfigurationParser");

      return createParser;
    }
  }
}

function getConnectionProfiles() {
  return Array.from(getConnectionProfileDictionary().values());
}

function loadConnectionProfiles() {
  // Note how if big-dig.connection.profiles is empty, we default to [{}]. The
  // logic inside the `for` loop will take the empty object and inject all of
  // the appropriate defaults to create a single IConnectionProfile.
  let configurationProfiles = vscode().workspace.getConfiguration('big-dig').get('connection.profiles', null);

  if (configurationProfiles == null) {
    configurationProfiles = [{}];
  }

  const createProfileParser = getCreateProfileParser();
  const profiles = [];
  const connectionIds = new Set();

  for (const profile of configurationProfiles) {
    const configParser = createProfileParser(profile);
    const parsedProfile = configParser.parse();
    const connectionId = getConnectionIdForCredentialStore(parsedProfile);

    if (connectionIds.has(connectionId)) {
      throw new Error('Multiple connection profiles have the same connection data: ' + `${connectionId}. Please edit settings.json to disambiguate ` + 'and then reload VS Code.');
    }

    connectionIds.add(connectionId);
    profiles.push(parsedProfile);
  }

  return profiles;
}