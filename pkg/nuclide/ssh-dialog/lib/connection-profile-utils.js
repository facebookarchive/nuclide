'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Disposable} from 'atom';
import type {NuclideRemoteConnectionProfile} from './connection-types';

const CONNECTION_PROFILES_KEY = 'nuclide.connectionProfiles';


/**
 * Returns an array of saved connection profiles.
 */
export function getSavedConnectionProfiles(): Array<NuclideRemoteConnectionProfile> {
  const connectionProfiles = atom.config.get(CONNECTION_PROFILES_KEY);
  (connectionProfiles : ?Array<NuclideRemoteConnectionProfile>);
  return connectionProfiles || [];
}

/**
 * Saves the connection profiles. Overwrites any existing profiles.
 */
export function saveConnectionProfiles(profiles: Array<NuclideRemoteConnectionProfile>): void {
  atom.config.set(CONNECTION_PROFILES_KEY, profiles);
}


type ConnectionProfileChange = {
  newValue: ?Array<NuclideRemoteConnectionProfile>;
  oldValue: ?Array<NuclideRemoteConnectionProfile>;
  keyPath: string;
};
/**
 * Calls the callback when the saved connection profiles change.
 * @return Disposable that can be disposed to stop listening for changes.
 */
export function onSavedConnectionProfilesDidChange(
  callback: (newProfiles: ?Array<NuclideRemoteConnectionProfile>) => mixed
): Disposable {
  return atom.config.onDidChange(
    CONNECTION_PROFILES_KEY,
    (event: ConnectionProfileChange) => callback(event.newValue)
  );
}
