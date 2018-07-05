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

import type {IConnectionProfile} from './ProfileConfigurationParser';

import * as vscode from 'vscode';
import invariant from 'assert';
import {Observable} from 'rxjs';

import {getConnectionProfileDictionary} from './profile';

export type ConnectionProfileChangeType =
  | {|
      kind: 'removed',
      hostname: string,
    |}
  | {|
      kind: 'added',
      profile: IConnectionProfile,
    |};

// Maps hostnames to profiles.
type ConnectionProfiles = Map<string, IConnectionProfile>;

/**
 * Observe a stream of removed/added updates to the connection profile
 * configuration. A profile is "removed" if the hostname is no longer defined or
 * if a hostname's `username` property has changed. A profile is "added" if its
 * hostname did not exist or if its `username` property has changed.
 *
 * Changes to ports, deployment, authentication method, private key, or folders
 * are ignored.
 */
export function connectionProfileUpdates(options: {
  withCurrent: boolean,
}): Observable<ConnectionProfileChangeType> {
  return (
    configurationChanged('big-dig.connection.profiles')
      // If `withCurrent`, then start with the initial configuration treated as "added".
      .startWith(...(options.withCurrent ? [undefined] : []))
      // Get the connection profile for each update
      .map(getConnectionProfileDictionary)
      // Combine the stream of updates into pairs of "prev" and "next" state
      .scan((acc, x) => [acc[1], x], [new Map(), new Map()])
      .mergeMap(([x, y]: [ConnectionProfiles, ConnectionProfiles]) =>
        Observable.merge(
          updateRemoved(x, y),
          updateAdded(x, y),
          updateChanged(x, y),
        ),
      )
  );
}

/**
 * Observe changes to vscode configuration changes that affect `section`.
 * This does not observe the changes themselves; subscribers will need to load
 * the new configuration on their own.
 *
 * Exported for testing.
 */
export function configurationChanged(section: string): Observable<void> {
  return Observable.create(observer => {
    const sub = vscode.workspace.onDidChangeConfiguration(change => {
      if (change.affectsConfiguration(section)) {
        observer.next();
      }
    });
    return () => sub.dispose();
  });
}

/** Exported for testing. */
export function updateRemoved(
  prev: ConnectionProfiles,
  next: ConnectionProfiles,
): Observable<ConnectionProfileChangeType> {
  return Observable.from(prev.values())
    .filter(profile => !next.has(profile.hostname))
    .map(doRemoved);
}

/** Exported for testing. */
export function updateAdded(
  prev: ConnectionProfiles,
  next: ConnectionProfiles,
): Observable<ConnectionProfileChangeType> {
  return Observable.from(next.values())
    .filter(profile => !prev.has(profile.hostname))
    .map(doAdded);
}

/** Exported for testing. */
export function updateChanged(
  prev: ConnectionProfiles,
  next: ConnectionProfiles,
): Observable<ConnectionProfileChangeType> {
  return Observable.from(prev.values())
    .map(profile => [profile, next.get(profile.hostname)])
    .map(([x, y]) => (y == null ? null : [x, y]))
    .filter(Boolean)
    .map(change => doChange(change[0], change[1]))
    .concatAll();
}

function doAdded(profile: IConnectionProfile): ConnectionProfileChangeType {
  return {kind: 'added', profile};
}

function doRemoved(profile: IConnectionProfile): ConnectionProfileChangeType {
  return {kind: 'removed', hostname: profile.hostname};
}

function doChange(
  oldProfile: IConnectionProfile,
  newProfile: IConnectionProfile,
): Array<ConnectionProfileChangeType> {
  invariant(oldProfile.hostname === newProfile.hostname);

  if (oldProfile.username !== newProfile.username) {
    return [doRemoved(oldProfile), doAdded(newProfile)];
  }

  // Ignore changes to ports, deployment, and auth type.
  return [];
}
