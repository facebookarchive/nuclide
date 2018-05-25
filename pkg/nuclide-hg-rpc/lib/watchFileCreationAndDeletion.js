'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.subscribeToFilesCreateAndDelete = subscribeToFilesCreateAndDelete;

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
 * Set up a watchman subscription to watch for a file's creation and deletion.
 * Returns a Promise so that all such subscriptions can be awaited in bulk.
 */
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

function subscribeToFilesCreateAndDelete(watchmanClient, repoPath, fileNames, subscriptionName) {
  const filesSubscriptionPromise = watchmanClient.watchDirectoryRecursive(repoPath, subscriptionName, {
    expression: ['name', fileNames, 'wholename'],
    defer_vcs: false
  });
  return _rxjsBundlesRxMinJs.Observable.fromPromise(filesSubscriptionPromise).switchMap(subscription => {
    (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc').debug(`Watchman create/delete subscription ${subscriptionName}` + ` established for files: ${fileNames.join(',')}`);
    return _rxjsBundlesRxMinJs.Observable.create(observer => {
      // Check each file being watched if it already exists. This is done
      // individually so that no watchman event can invalidate previously
      // checked files. We only bother updating if the file exists.
      fileNames.map(fileName => {
        const qualifiedFileName = (_nuclideUri || _load_nuclideUri()).default.join(repoPath, fileName);
        (_fsPromise || _load_fsPromise()).default.exists(qualifiedFileName).then(exists => {
          if (exists) {
            observer.next(new Map([[fileName, exists]]));
            (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc').info(`${subscriptionName}: watched file ${fileName} already exists`);
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
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc').info(`disposing of watchman subscription ${subscriptionName}`);
        changeSubscription.dispose();
        subscription.dispose();
      };
    });
  });
}