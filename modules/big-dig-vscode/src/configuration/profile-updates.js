"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connectionProfileUpdates = connectionProfileUpdates;
exports.configurationChanged = configurationChanged;
exports.updateRemoved = updateRemoved;
exports.updateAdded = updateAdded;
exports.updateChanged = updateChanged;

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _profile() {
  const data = require("./profile");

  _profile = function () {
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

/**
 * Observe a stream of removed/added updates to the connection profile
 * configuration. A profile is "removed" if the hostname is no longer defined or
 * if a hostname's `username` property has changed. A profile is "added" if its
 * hostname did not exist or if its `username` property has changed.
 *
 * Changes to ports, deployment, authentication method, private key, or folders
 * are ignored.
 */
function connectionProfileUpdates(options) {
  return configurationChanged('big-dig.connection.profiles') // If `withCurrent`, then start with the initial configuration treated as "added".
  .startWith(...(options.withCurrent ? [undefined] : [])) // Get the connection profile for each update
  .map(_profile().getConnectionProfileDictionary) // Combine the stream of updates into pairs of "prev" and "next" state
  .scan((acc, x) => [acc[1], x], [new Map(), new Map()]).mergeMap(([x, y]) => _RxMin.Observable.merge(updateRemoved(x, y), updateAdded(x, y), updateChanged(x, y)));
}
/**
 * Observe changes to vscode configuration changes that affect `section`.
 * This does not observe the changes themselves; subscribers will need to load
 * the new configuration on their own.
 *
 * Exported for testing.
 */


function configurationChanged(section) {
  return _RxMin.Observable.create(observer => {
    const sub = vscode().workspace.onDidChangeConfiguration(change => {
      if (change.affectsConfiguration(section)) {
        observer.next();
      }
    });
    return () => sub.dispose();
  });
}
/** Exported for testing. */


function updateRemoved(prev, next) {
  return _RxMin.Observable.from(prev.values()).filter(profile => !next.has(profile.hostname)).map(doRemoved);
}
/** Exported for testing. */


function updateAdded(prev, next) {
  return _RxMin.Observable.from(next.values()).filter(profile => !prev.has(profile.hostname)).map(doAdded);
}
/** Exported for testing. */


function updateChanged(prev, next) {
  return _RxMin.Observable.from(prev.values()).map(profile => [profile, next.get(profile.hostname)]).map(([x, y]) => y == null ? null : [x, y]).filter(Boolean).map(change => doChange(change[0], change[1])).concatAll();
}

function doAdded(profile) {
  return {
    kind: 'added',
    profile
  };
}

function doRemoved(profile) {
  return {
    kind: 'removed',
    hostname: profile.hostname
  };
}

function doChange(oldProfile, newProfile) {
  if (!(oldProfile.hostname === newProfile.hostname)) {
    throw new Error("Invariant violation: \"oldProfile.hostname === newProfile.hostname\"");
  }

  if (oldProfile.username !== newProfile.username) {
    return [doRemoved(oldProfile), doAdded(newProfile)];
  } // Ignore changes to ports, deployment, and auth type.


  return [];
}