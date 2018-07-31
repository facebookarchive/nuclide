"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _observePaneItemVisibility() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/observePaneItemVisibility"));

  _observePaneItemVisibility = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
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

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideHgRpc() {
  const data = require("../../nuclide-hg-rpc");

  _nuclideHgRpc = function () {
    return data;
  };

  return data;
}

function _hgDiffOutputParser() {
  const data = require("../../nuclide-hg-rpc/lib/hg-diff-output-parser");

  _hgDiffOutputParser = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _nuclideVcsBase() {
  const data = require("../../nuclide-vcs-base");

  _nuclideVcsBase = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
// A limit on size of buffer to diff
// Value based on the constant of the same name from atom's git-diff package
const MAX_BUFFER_LENGTH_TO_DIFF = 2 * 1024 * 1024; // TODO: cache fileContentsAtHead for files on _localService as they change
// less frequently than bufferContents and we can avoid sending it over IPC
// every time
// TODO: handle file renames
// TODO: re-implement git-diff so it is push-based. git-diff currently only polls
// for changes on buffer updates, so if you commit and all previous changes are
// now part of head, highlights won't update until you type

class Activation {
  constructor() {
    this._localService = (0, _nuclideRemoteConnection().getHgServiceByNuclideUri)('');
    this._disposed = new _RxMin.ReplaySubject(1);

    _featureConfig().default.observeAsStream('nuclide-hg-repository.enableDiffStats').switchMap(enableDiffStats => {
      if (!enableDiffStats) {
        return _RxMin.Observable.empty();
      }

      const reposBeingWatched = new Set();
      return (0, _event().observableFromSubscribeFunction)(atom.workspace.observeTextEditors.bind(atom.workspace)).flatMap(textEditor => {
        const editorPath = textEditor.getPath();

        if (editorPath == null) {
          return _RxMin.Observable.empty();
        }

        const repositoryForEditor = (0, _nuclideVcsBase().repositoryForPath)(editorPath);

        if (repositoryForEditor == null || repositoryForEditor.getType() !== 'hg') {
          return _RxMin.Observable.empty();
        } // Because multiple HgRepositoryClients can be backed by a single instance,
        // (in the case of multiple projects in the same real repo)
        // and we only want one HgRepositoryClient per real repo


        const rootRepo = repositoryForEditor.getRootRepoClient();

        if (reposBeingWatched.has(rootRepo)) {
          return _RxMin.Observable.empty();
        }

        reposBeingWatched.add(rootRepo); // Observe repo being destroyed. Remove it from Set when that happens

        const repoDestroyed = (0, _event().observableFromSubscribeFunction)(rootRepo.onDidDestroy.bind(rootRepo)).do(() => reposBeingWatched.delete(rootRepo));
        return this._watchBufferDiffChanges(rootRepo).takeUntil(repoDestroyed);
      });
    }).takeUntil(this._disposed).subscribe();
  } // Responsible for calculating the diff of a file by 1. fetching the content
  // at head for each buffer once it becomes visible and 2. diffing it against
  // current buffer contents once the buffer changes


  _watchBufferDiffChanges(repository) {
    return repository.observeHeadRevision().do(() => repository.clearAllDiffInfo()).switchMap(() => {
      // by defining the cache in this scope, it is automatically "cleared"
      // when headRevision changes
      const fileContentsAtHead = new Map(); // batch hg cat calls using this array

      const bufferedFilesToCat = []; // fetchFileContentsAtHead is the observable responsible for buffering
      // up textEditor paths as they become visible, and then running them
      // through `hg cat` to get content at head

      const fetchFileContentsAtHead = observeTextEditorsInRepo(repository).flatMap(textEditor => {
        return (0, _observePaneItemVisibility().default)(textEditor).takeUntil((0, _event().observableFromSubscribeFunction)(textEditor.onDidDestroy.bind(textEditor))).filter(isVisible => isVisible).first().flatMap(() => {
          const bufferPath = (0, _nullthrows().default)(textEditor.getPath()); // TODO (tjfryan): do something to handle generated files

          if (fileContentsAtHead.has(bufferPath)) {
            return _RxMin.Observable.empty();
          }

          bufferedFilesToCat.push(repository.relativize(bufferPath));

          if (bufferedFilesToCat.length > 1) {
            return _RxMin.Observable.empty();
          } // use nextTick to buffer many files being requested at once
          // (maybe should use timeout instead?)


          return _RxMin.Observable.fromPromise((0, _promise().nextTick)()).switchMap(() => {
            const filesToCat = [...bufferedFilesToCat];
            bufferedFilesToCat.length = 0;
            return repository.fetchMultipleFilesContentAtRevision(filesToCat, _nuclideHgRpc().hgConstants.HEAD_REVISION_EXPRESSION).catch(() => // hg uses errorCode 1 as "nothing went wrong but nothing was found"
            _RxMin.Observable.empty());
          });
        });
      }).do(fileContents => fileContents.forEach(({
        abspath,
        data
      }) => {
        fileContentsAtHead.set(_nuclideUri().default.join(repository.getWorkingDirectory(), abspath), data);
      })).share();
      const buffers = new Set(); // calculateDiffForBuffers is the observable responsible for watching
      // buffer changes and updating the diff info

      const calculateDiffForBuffers = observeTextEditorsInRepo(repository).flatMap(textEditor => {
        const buffer = textEditor.getBuffer();

        if (buffers.has(buffer)) {
          return _RxMin.Observable.empty();
        }

        buffers.add(buffer);
        const bufferPath = (0, _nullthrows().default)(buffer.getPath());
        const bufferReloads = (0, _event().observableFromSubscribeFunction)(buffer.onDidReload.bind(buffer));
        const bufferChanges = (0, _event().observableFromSubscribeFunction)(buffer.onDidChangeText.bind(buffer)); // TODO (tjfryan): handle renames `onDidChangePath`
        // This is in a flatMap, so we need to make sure this terminates
        // We can terminate, `takeUntil`, buffer is destroyed
        // And make sure to clear the cached diff for the buffer once we no
        // longer care about it

        const bufferDestroyed = (0, _event().observableFromSubscribeFunction)(buffer.onDidDestroy.bind(buffer)).do(() => {
          buffers.delete(buffer);
          repository.deleteDiffInfo(bufferPath);
          fileContentsAtHead.delete(bufferPath);
        }); // recalculate on bufferReload, bufferChanges, and when we get
        // this file's data from hg cat

        return _RxMin.Observable.merge(bufferReloads, bufferChanges, fetchFileContentsAtHead.filter(fileContentsList => fileContentsList.some(fileInfo => _nuclideUri().default.join(repository.getWorkingDirectory(), fileInfo.abspath) === bufferPath))).let((0, _observable().fastDebounce)(200)).switchMap(() => {
          const oldContents = fileContentsAtHead.get(bufferPath);

          if (oldContents == null) {
            return _RxMin.Observable.empty();
          }

          const newContents = buffer.getText();

          if (newContents.length > MAX_BUFFER_LENGTH_TO_DIFF) {
            return _RxMin.Observable.empty();
          }

          return this._localService.gitDiffStrings(oldContents, newContents).refCount().map(diffOutput => (0, _hgDiffOutputParser().parseHgDiffUnifiedOutput)(diffOutput)).do(diffInfo => {
            repository.setDiffInfo(bufferPath, diffInfo);
          });
        }).takeUntil(bufferDestroyed);
      });
      return _RxMin.Observable.merge(fetchFileContentsAtHead, calculateDiffForBuffers);
    });
  }

  dispose() {
    this._disposed.next();
  }

}

function observeTextEditorsInRepo(repository) {
  return (0, _event().observableFromSubscribeFunction)(atom.workspace.observeTextEditors.bind(atom.workspace)).filter(textEditor => {
    const path = textEditor.getPath();
    return path != null && repository.isPathRelevantToRepository(path);
  });
}

(0, _createPackage().default)(module.exports, Activation);