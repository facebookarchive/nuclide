'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getRealPath = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (entityPath, isFile) {
    let stat;
    try {
      stat = yield (_fsPromise || _load_fsPromise()).default.stat(entityPath);
    } catch (e) {
      // Atom watcher behavior compatibility.
      throw new Error(`Can't watch a non-existing entity: ${entityPath}`);
    }
    if (stat.isFile() !== isFile) {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().warn(`FileWatcherService: expected ${entityPath} to be a ${isFile ? 'file' : 'directory'}`);
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
exports.watchDirectory = watchDirectory;
exports.watchDirectoryRecursive = watchDirectoryRecursive;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _SharedObservableCache;

function _load_SharedObservableCache() {
  return _SharedObservableCache = _interopRequireDefault(require('../../commons-node/SharedObservableCache'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _nuclideWatchmanHelpers;

function _load_nuclideWatchmanHelpers() {
  return _nuclideWatchmanHelpers = require('../../nuclide-watchman-helpers');
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

function watchDirectory(directoryPath) {
  return watchEntity(directoryPath, false).publish();
}

function watchEntity(entityPath, isFile) {
  return _rxjsBundlesRxMinJs.Observable.fromPromise(getRealPath(entityPath, isFile)).switchMap(realPath => entityWatches.get(realPath));
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
    const entryPath = (_nuclideUri || _load_nuclideUri()).default.join(subscription.root, entry.name);
    const observer = entityObserver.get(entryPath);
    if (observer != null) {
      // TODO(most): handle `rename`, if needed.
      if (!entry.exists) {
        observer.next('delete');
        observer.complete();
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