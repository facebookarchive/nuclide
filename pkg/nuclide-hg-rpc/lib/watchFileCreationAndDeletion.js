"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFilesInstantaneousExistance = getFilesInstantaneousExistance;
exports.subscribeToFilesCreateAndDelete = subscribeToFilesCreateAndDelete;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

/**
 * Return a map of filename => exists in response to watchman events.
 * Note that this map does not necessarily contain the status of all watched files.
 */
function filesCreateOrDeleteToObserver(fileChanges) {
  const state = new Map();

  for (const fileChange of fileChanges) {
    if (fileChange.exists) {
      // Only emit create events if watchman says the file is new.
      // Note: even if watchman debounces several changes, such as a create followed
      // shortly by a modify, we will still receive new=true.
      if (fileChange.new) {
        state.set(fileChange.name, true);
      }
    } else {
      state.set(fileChange.name, false);
    }
  }

  if (state.size > 0) {
    return state;
  }

  return null;
}
/**
 * Query the list of files for their existance at a given moment.
 * Returns an observable that emits a map of all file's existance.
 */


function getFilesInstantaneousExistance(repoPath, fileNames) {
  return _RxMin.Observable.merge(...fileNames.map(fileName => {
    const qualifiedFileName = _nuclideUri().default.join(repoPath, fileName);

    return _RxMin.Observable.fromPromise(_fsPromise().default.exists(qualifiedFileName)).map(exists => [fileName, exists]);
  })).toArray().map(pairs => {
    return new Map(pairs);
  });
}
/**
 * Set up a watchman subscription to watch for a file's creation and deletion.
 * Returns a Promise so that all such subscriptions can be awaited in bulk.
 */


function subscribeToFilesCreateAndDelete(watchmanClient, repoPath, fileNames, subscriptionName) {
  const filesSubscriptionPromise = watchmanClient.watchDirectoryRecursive(repoPath, subscriptionName, {
    expression: ['name', fileNames, 'wholename'],
    defer_vcs: false
  });
  return _RxMin.Observable.fromPromise(filesSubscriptionPromise).switchMap(subscription => {
    (0, _log4js().getLogger)('nuclide-hg-rpc').debug(`Watchman create/delete subscription ${subscriptionName}` + ` established for files: ${fileNames.join(',')}`);
    return _RxMin.Observable.create(observer => {
      // Check each file being watched if it already exists. This is done
      // individually so that no watchman event can invalidate previously
      // checked files. We only bother updating if the file exists.
      fileNames.map(fileName => {
        const qualifiedFileName = _nuclideUri().default.join(repoPath, fileName);

        _fsPromise().default.exists(qualifiedFileName).then(exists => {
          if (exists) {
            observer.next(new Map([[fileName, exists]]));
            (0, _log4js().getLogger)('nuclide-hg-rpc').info(`${subscriptionName}: watched file ${fileName} already exists`);
          }
        });
      });
      const changeSubscription = subscription.on('change', fileChanges => {
        const newState = filesCreateOrDeleteToObserver(fileChanges);

        if (newState != null) {
          observer.next(newState);
        }
      });
      return () => {
        (0, _log4js().getLogger)('nuclide-hg-rpc').info(`disposing of watchman subscription ${subscriptionName}`);
        changeSubscription.dispose();
        subscription.dispose();
      };
    });
  });
}