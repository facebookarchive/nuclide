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
    stat = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.stat(entityPath);
  } catch (e) {
    // Atom watcher behavior compatibility.
    throw new Error('Can\'t watch a non-existing entity: ' + entityPath);
  }
  if (stat.isFile() !== isFile) {
    (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().warn('FileWatcherService: expected ' + entityPath + ' to be a ' + (isFile ? 'file' : 'directory'));
  }
  return yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.realpath(entityPath);
});

exports.watchDirectoryRecursive = watchDirectoryRecursive;

var unwatchDirectoryRecursive = _asyncToGenerator(function* (directoryPath) {
  yield getWatchmanClient().unwatch(directoryPath);
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _nuclideWatchmanHelpers2;

function _nuclideWatchmanHelpers() {
  return _nuclideWatchmanHelpers2 = require('../../nuclide-watchman-helpers');
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
    watchmanClient = new (_nuclideWatchmanHelpers2 || _nuclideWatchmanHelpers()).WatchmanClient();
  }
  return watchmanClient;
}

function watchFile(filePath) {
  return watchEntity(filePath, true);
}

function watchDirectory(directoryPath) {
  return watchEntity(directoryPath, false);
}

function watchEntity(entityPath, isFile) {
  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromPromise(getRealPath(entityPath, isFile)).flatMap(function (realPath) {
    var observable = entityObservable.get(realPath);
    if (observable != null) {
      return observable;
    }
    observable = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.create(function (observer) {
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
    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of('EXISTING');
  }
  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromPromise(client.watchDirectoryRecursive(directoryPath)).flatMap(function (watcher) {
    // Listen for watcher changes to route them to watched files and directories.
    watcher.on('change', function (entries) {
      onWatcherChange(watcher, entries);
    });

    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.create(function (observer) {
      // Notify success watcher setup.
      observer.next('SUCCESS');

      return function () {
        return unwatchDirectoryRecursive(directoryPath);
      };
    });
  });
}

function onWatcherChange(subscription, entries) {
  var directoryChanges = new Set();
  entries.forEach(function (entry) {
    var entryPath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(subscription.root, entry.name);
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
      directoryChanges.add((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(entryPath));
    }
  });

  directoryChanges.forEach(function (watchedDirectoryPath) {
    var observer = entityObserver.get(watchedDirectoryPath);
    if (observer != null) {
      observer.next('change');
    }
  });
}