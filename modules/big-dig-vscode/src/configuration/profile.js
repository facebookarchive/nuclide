/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {
  ConnectionProfileConfiguration,
  IConnectionProfile,
  ProfileConfigurationParser,
} from './ProfileConfigurationParser';

import * as vscode from 'vscode';

export function getConnectionProfileDictionary(): Map<
  string,
  IConnectionProfile,
> {
  const profiles = loadConnectionProfiles();
  return new Map(profiles.map(it => [it.hostname, it]));
}

/**
 * @return identifier for the specified profile to use as the key in the
 *   credential store.
 */
export function getConnectionIdForCredentialStore(
  profile: IConnectionProfile,
): string {
  return `${profile.username}@${profile.address}`;
}

function getCreateProfileParser(): (
  profile: ConnectionProfileConfiguration,
) => ProfileConfigurationParser {
  try {
    // $FlowFB
    const {createParser} = require('./fb-ProfileConfigurationParser');
    return createParser;
  } catch (e) {
    // MODULE_NOT_FOUND is expected for non-FB.
    if (e.code !== 'MODULE_NOT_FOUND') {
      throw e;
    } else {
      const {createParser} = require('./ProfileConfigurationParser');
      return createParser;
    }
  }
}

export function getConnectionProfiles(): IConnectionProfile[] {
  return Array.from(getConnectionProfileDictionary().values());
}

function loadConnectionProfiles(): Array<IConnectionProfile> {
  // Note how if big-dig.connection.profiles is empty, we default to [{}]. The
  // logic inside the `for` loop will take the empty object and inject all of
  // the appropriate defaults to create a single IConnectionProfile.
  let configurationProfiles = vscode.workspace
    .getConfiguration('big-dig')
    .get('connection.profiles', null);
  if (configurationProfiles == null) {
    configurationProfiles = [{}];
  }

  const createProfileParser = getCreateProfileParser();
  const profiles: Array<IConnectionProfile> = [];
  const connectionIds: Set<string> = new Set();
  for (const profile of configurationProfiles) {
    const configParser = createProfileParser(profile);
    const parsedProfile = configParser.parse();
    const connectionId = getConnectionIdForCredentialStore(parsedProfile);
    if (connectionIds.has(connectionId)) {
      throw new Error(
        'Multiple connection profiles have the same connection data: ' +
          `${connectionId}. Please edit settings.json to disambiguate ` +
          'and then reload VS Code.',
      );
    }

    connectionIds.add(connectionId);
    profiles.push(parsedProfile);
  }
  return profiles;
}
