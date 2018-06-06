'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _observePaneItemVisibility;

function _load_observePaneItemVisibility() {
  return _observePaneItemVisibility = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/observePaneItemVisibility'));
}

var _event;

function _load_event() {
  return _event = require('../../../modules/nuclide-commons/event');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _observable;

function _load_observable() {
  return _observable = require('../../../modules/nuclide-commons/observable');
}

var _promise;

function _load_promise() {
  return _promise = require('../../../modules/nuclide-commons/promise');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideHgRpc;

function _load_nuclideHgRpc() {
  return _nuclideHgRpc = require('../../nuclide-hg-rpc');
}

var _hgDiffOutputParser;

function _load_hgDiffOutputParser() {
  return _hgDiffOutputParser = require('../../nuclide-hg-rpc/lib/hg-diff-output-parser');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../../nuclide-vcs-base');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// A limit on size of buffer to diff
// Value based on the constant of the same name from atom's git-diff package
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

const MAX_BUFFER_LENGTH_TO_DIFF = 2 * 1024 * 1024;

// TODO: cache fileContentsAtHead for files on _localService as they change
// less frequently than bufferContents and we can avoid sending it over IPC
// every time
// TODO: handle file renames
// TODO: re-implement git-diff so it is push-based. git-diff currently only polls
// for changes on buffer updates, so if you commit and all previous changes are
// now part of head, highlights won't update until you type

class Activation {

  constructor() {
    this._localService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getHgServiceByNuclideUri)('');
    this._disposed = new _rxjsBundlesRxMinJs.ReplaySubject(1);

    (_featureConfig || _load_featureConfig()).default.observeAsStream('nuclide-hg-repository.enableDiffStats').switchMap(enableDiffStats => {
      if (!enableDiffStats) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      const reposBeingWatched = new Set();

      return (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.observeTextEditors.bind(atom.workspace)).flatMap(textEditor => {
        const editorPath = textEditor.getPath();
        if (editorPath == null) {
          return _rxjsBundlesRxMinJs.Observable.empty();
        }

        const repositoryForEditor = (0, (_nuclideVcsBase || _load_nuclideVcsBase()).repositoryForPath)(editorPath);
        if (repositoryForEditor == null || repositoryForEditor.getType() !== 'hg') {
          return _rxjsBundlesRxMinJs.Observable.empty();
        }

        // Because multiple HgRepositoryClients can be backed by a single instance,
        // (in the case of multiple projects in the same real repo)
        // and we only want one HgRepositoryClient per real repo
        const rootRepo = repositoryForEditor.getRootRepoClient();

        if (reposBeingWatched.has(rootRepo)) {
          return _rxjsBundlesRxMinJs.Observable.empty();
        }
        reposBeingWatched.add(rootRepo);

        // Observe repo being destroyed. Remove it from Set when that happens
        const repoDestroyed = (0, (_event || _load_event()).observableFromSubscribeFunction)(rootRepo.onDidDestroy.bind(rootRepo)).do(() => reposBeingWatched.delete(rootRepo));

        return this._watchBufferDiffChanges(rootRepo).takeUntil(repoDestroyed);
      });
    }).takeUntil(this._disposed).subscribe();
  }

  // Responsible for calculating the diff of a file by 1. fetching the content
  // at head for each buffer once it becomes visible and 2. diffing it against
  // current buffer contents once the buffer changes
  _watchBufferDiffChanges(repository) {
    return repository.observeHeadRevision().do(() => repository.clearAllDiffInfo()).switchMap(() => {
      // by defining the cache in this scope, it is automatically "cleared"
      // when headRevision changes
      const fileContentsAtHead = new Map();

      // batch hg cat calls using this array
      const bufferedFilesToCat = [];

      // fetchFileContentsAtHead is the observable responsible for buffering
      // up textEditor paths as they become visible, and then running them
      // through `hg cat` to get content at head
      const fetchFileContentsAtHead = observeTextEditorsInRepo(repository).flatMap(textEditor => {
        return (0, (_observePaneItemVisibility || _load_observePaneItemVisibility()).default)(textEditor).filter(isVisible => isVisible).first().flatMap(() => {
          const bufferPath = (0, (_nullthrows || _load_nullthrows()).default)(textEditor.getPath());
          // TODO (tjfryan): do something to handle generated files
          if (fileContentsAtHead.has(bufferPath)) {
            return _rxjsBundlesRxMinJs.Observable.empty();
          }

          bufferedFilesToCat.push(repository.relativize(bufferPath));
          if (bufferedFilesToCat.length > 1) {
            return _rxjsBundlesRxMinJs.Observable.empty();
          }

          // use nextTick to buffer many files being requested at once
          // (maybe should use timeout instead?)
          return _rxjsBundlesRxMinJs.Observable.fromPromise((0, (_promise || _load_promise()).nextTick)()).switchMap(() => {
            const filesToCat = [...bufferedFilesToCat];
            bufferedFilesToCat.length = 0;
            return repository.fetchMultipleFilesContentAtRevision(filesToCat, (_nuclideHgRpc || _load_nuclideHgRpc()).hgConstants.HEAD_REVISION_EXPRESSION).catch(() =>
            // hg uses errorCode 1 as "nothing went wrong but nothing was found"
            _rxjsBundlesRxMinJs.Observable.empty());
          });
        });
      }).do(fileContents => fileContents.forEach(({ abspath, data }) => {
        fileContentsAtHead.set((_nuclideUri || _load_nuclideUri()).default.join(repository.getWorkingDirectory(), abspath), data);
      })).share();

      const buffers = new Set();
      // calculateDiffForBuffers is the observable responsible for watching
      // buffer changes and updating the diff info
      const calculateDiffForBuffers = observeTextEditorsInRepo(repository).flatMap(textEditor => {
        const buffer = textEditor.getBuffer();
        if (buffers.has(buffer)) {
          return _rxjsBundlesRxMinJs.Observable.empty();
        }
        buffers.add(buffer);

        const bufferPath = (0, (_nullthrows || _load_nullthrows()).default)(buffer.getPath());

        const bufferReloads = (0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidReload.bind(buffer));
        const bufferChanges = (0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidChangeText.bind(buffer));

        // TODO (tjfryan): handle renames `onDidChangePath`

        // This is in a flatMap, so we need to make sure this terminates
        // We can terminate, `takeUntil`, buffer is destroyed
        // And make sure to clear the cached diff for the buffer once we no
        // longer care about it
        const bufferDestroyed = (0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidDestroy.bind(buffer)).do(() => {
          buffers.delete(buffer);
          repository.deleteDiffInfo(bufferPath);
          fileContentsAtHead.delete(bufferPath);
        });

        // recalculate on bufferReload, bufferChanges, and when we get
        // this file's data from hg cat
        return _rxjsBundlesRxMinJs.Observable.merge(bufferReloads, bufferChanges, fetchFileContentsAtHead.filter(fileContentsList => fileContentsList.some(fileInfo => (_nuclideUri || _load_nuclideUri()).default.join(repository.getWorkingDirectory(), fileInfo.abspath) === bufferPath))).let((0, (_observable || _load_observable()).fastDebounce)(200)).switchMap(() => {
          const oldContents = fileContentsAtHead.get(bufferPath);
          if (oldContents == null) {
            return _rxjsBundlesRxMinJs.Observable.empty();
          }
          const newContents = buffer.getText();
          if (newContents.length > MAX_BUFFER_LENGTH_TO_DIFF) {
            return _rxjsBundlesRxMinJs.Observable.empty();
          }
          return this._localService.gitDiffStrings(oldContents, newContents).refCount().map(diffOutput => (0, (_hgDiffOutputParser || _load_hgDiffOutputParser()).parseHgDiffUnifiedOutput)(diffOutput)).do(diffInfo => {
            repository.setDiffInfo(bufferPath, diffInfo);
          });
        }).takeUntil(bufferDestroyed);
      });

      return _rxjsBundlesRxMinJs.Observable.merge(fetchFileContentsAtHead, calculateDiffForBuffers);
    });
  }

  dispose() {
    this._disposed.next();
  }
}

function observeTextEditorsInRepo(repository) {
  return (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.observeTextEditors.bind(atom.workspace)).filter(textEditor => {
    const path = textEditor.getPath();
    return path != null && repository.isPathRelevantToRepository(path);
  });
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);