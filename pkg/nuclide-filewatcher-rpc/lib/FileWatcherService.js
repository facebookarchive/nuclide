'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getRealPath = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (entityPath, isFile) {
    // NOTE: this will throw when trying to watch non-existent entities.
    const stat = yield (_fsPromise || _load_fsPromise()).default.stat(entityPath);
    if (stat.isFile() !== isFile) {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-filewatcher-rpc').warn(`FileWatcherService: expected ${entityPath} to be a ${isFile ? 'file' : 'directory'}`);
    }
    return (_fsPromise || _load_fsPromise()).default.realpath(entityPath);
  });

  return function getRealPath(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let unwatchDirectoryRecursive = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (directoryPath) {
    yield getWatchmanClient().unwatch(directoryPath);
  });

  return function unwatchDirectoryRecursive(_x3) {
    return _ref2.apply(this, arguments);
  };
})();

exports.watchFile = watchFile;
exports.watchFileWithNode = watchFileWithNode;
exports.watchDirectory = watchDirectory;
exports.watchDirectoryRecursive = watchDirectoryRecursive;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _SharedObservableCache;

function _load_SharedObservableCache() {
  return _SharedObservableCache = _interopRequireDefault(require('../../commons-node/SharedObservableCache'));
}

var _fs = _interopRequireDefault(require('fs'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideWatchmanHelpers;

function _load_nuclideWatchmanHelpers() {
  return _nuclideWatchmanHelpers = require('../../nuclide-watchman-helpers');
}

var _debounceDeletes;

function _load_debounceDeletes() {
  return _debounceDeletes = _interopRequireDefault(require('./debounceDeletes'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Cache an observable for each watched entity (file or directory).
// Multiple watches for the same entity can share the same observable.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const entityWatches = new (_SharedObservableCache || _load_SharedObservableCache()).default(registerWatch);

// In addition, expose the observer behind each observable so we can
// dispatch events from the root subscription.
const entityObserver = new Map();

let watchmanClient = null;
function getWatchmanClient() {
  if (watchmanClient == null) {
    watchmanClient = new (_nuclideWatchmanHelpers || _load_nuclideWatchmanHelpers()).WatchmanClient();
  }
  return watchmanClient;
}

function watchFile(filePath) {
  return watchEntity(filePath, true).publish();
}

function watchFileWithNode(filePath) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    const watcher = _fs.default.watch(filePath, { persistent: false }, eventType => {
      if (eventType === 'rename') {
        observer.next({ path: filePath, type: 'delete' });
      } else {
        observer.next({ path: filePath, type: 'change' });
      }
    });
    return () => watcher.close();
  }).publish();
}

function watchDirectory(directoryPath) {
  return watchEntity(directoryPath, false).publish();
}

function watchEntity(entityPath, isFile) {
  return _rxjsBundlesRxMinJs.Observable.fromPromise(getRealPath(entityPath, isFile)).switchMap(realPath => (0, (_debounceDeletes || _load_debounceDeletes()).default)(entityWatches.get(realPath)));
}

// Register an observable for the given path.
function registerWatch(path) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    entityObserver.set(path, observer);
    return () => entityObserver.delete(path);
  }).map(type => ({ path, type })).share();
}

function watchDirectoryRecursive(directoryPath) {
  const client = getWatchmanClient();
  if (client.hasSubscription(directoryPath)) {
    return _rxjsBundlesRxMinJs.Observable.of('EXISTING').publish();
  }
  return _rxjsBundlesRxMinJs.Observable.fromPromise(client.watchDirectoryRecursive(directoryPath, `filewatcher-${directoryPath}`,
  // Reloading with file changes should happen
  // during source control operations to reflect the file contents / tree state.
  { defer_vcs: false })).flatMap(watcher => {
    // Listen for watcher changes to route them to watched files and directories.
    watcher.on('change', entries => {
      onWatcherChange(watcher, entries);
    });

    return _rxjsBundlesRxMinJs.Observable.create(observer => {
      // Notify success watcher setup.
      observer.next('SUCCESS');

      return () => unwatchDirectoryRecursive(directoryPath);
    });
  }).publish();
}

function onWatcherChange(subscription, entries) {
  const directoryChanges = new Set();
  entries.forEach(entry => {
    const entryPath = (_nuclideUri || _load_nuclideUri()).default.join(subscription.path, entry.name);
    const observer = entityObserver.get(entryPath);
    if (observer != null) {
      // TODO(most): handle `rename`, if needed.
      if (!entry.exists) {
        observer.next('delete');
      } else {
        observer.next('change');
      }
    }
    // A file watch event can also be considered a directory change
    // for the parent directory if a file was created or deleted.
    if (entry.new || !entry.exists) {
      directoryChanges.add((_nuclideUri || _load_nuclideUri()).default.dirname(entryPath));
    }
  });

  directoryChanges.forEach(watchedDirectoryPath => {
    const observer = entityObserver.get(watchedDirectoryPath);
    if (observer != null) {
      observer.next('change');
    }
  });
}