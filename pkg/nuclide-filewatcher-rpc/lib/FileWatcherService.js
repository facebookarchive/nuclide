Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.watchFile = watchFile;
exports.watchDirectory = watchDirectory;

var getRealPath = _asyncToGenerator(function* (entityPath, isFile) {
  var stat = undefined;
  try {
    stat = yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.stat(entityPath);
  } catch (e) {
    // Atom watcher behavior compatibility.
    throw new Error('Can\'t watch a non-existing entity: ' + entityPath);
  }
  if (stat.isFile() !== isFile) {
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().warn('FileWatcherService: expected ' + entityPath + ' to be a ' + (isFile ? 'file' : 'directory'));
  }
  return yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.realpath(entityPath);
});

exports.watchDirectoryRecursive = watchDirectoryRecursive;

var unwatchDirectoryRecursive = _asyncToGenerator(function* (directoryPath) {
  yield getWatchmanClient().unwatch(directoryPath);
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _commonsNodeFsPromise;

function _load_commonsNodeFsPromise() {
  return _commonsNodeFsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _nuclideWatchmanHelpers;

function _load_nuclideWatchmanHelpers() {
  return _nuclideWatchmanHelpers = require('../../nuclide-watchman-helpers');
}

// Cache an observable for each watched entity (file or directory).
// Multiple watches for the same entity can share the same observable.
var entityObservable = new Map();

// In addition, expose the observer behind each observable so we can
// dispatch events from the root subscription.
var entityObserver = new Map();

var watchmanClient = null;
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
  return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise(getRealPath(entityPath, isFile)).flatMap(function (realPath) {
    var observable = entityObservable.get(realPath);
    if (observable != null) {
      return observable;
    }
    observable = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.create(function (observer) {
      entityObserver.set(realPath, observer);
      return function () {
        entityObserver.delete(realPath);
        entityObservable.delete(realPath);
      };
    }).map(function (type) {
      return { path: realPath, type: type };
    }).share();
    entityObservable.set(realPath, observable);
    return observable;
  });
}

function watchDirectoryRecursive(directoryPath) {
  var client = getWatchmanClient();
  if (client.hasSubscription(directoryPath)) {
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of('EXISTING').publish();
  }
  return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise(client.watchDirectoryRecursive(directoryPath)).flatMap(function (watcher) {
    // Listen for watcher changes to route them to watched files and directories.
    watcher.on('change', function (entries) {
      onWatcherChange(watcher, entries);
    });

    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.create(function (observer) {
      // Notify success watcher setup.
      observer.next('SUCCESS');

      return function () {
        return unwatchDirectoryRecursive(directoryPath);
      };
    });
  }).publish();
}

function onWatcherChange(subscription, entries) {
  var directoryChanges = new Set();
  entries.forEach(function (entry) {
    var entryPath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(subscription.root, entry.name);
    var observer = entityObserver.get(entryPath);
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
      directoryChanges.add((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.dirname(entryPath));
    }
  });

  directoryChanges.forEach(function (watchedDirectoryPath) {
    var observer = entityObserver.get(watchedDirectoryPath);
    if (observer != null) {
      observer.next('change');
    }
  });
}