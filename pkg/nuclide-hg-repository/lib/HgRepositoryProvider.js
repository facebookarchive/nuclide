'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideHgRepositoryClient;

function _load_nuclideHgRepositoryClient() {
  return _nuclideHgRepositoryClient = require('../../nuclide-hg-repository-client');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideSourceControlHelpers;

function _load_nuclideSourceControlHelpers() {
  return _nuclideSourceControlHelpers = require('../../nuclide-source-control-helpers');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-repository'); /**
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
 * @param directory Either a RemoteDirectory or Directory we are interested in.
 * @return If the directory is part of a Mercurial repository, returns an object
 *  with the following field:
 *  * originURL The string URL of the repository origin.
 *  * repoPath The path/uri to the repository (.hg folder).
 *  * workingDirectory A Directory (or RemoteDirectory) object that represents
 *    the repository's working directory.
 *  * workingDirectoryLocalPath The local path to the workingDirectory of the
 *    repository (i.e. if it's a remote directory, the URI minus the hostname).
 *  If the directory is not part of a Mercurial repository, returns null.
 */
function getRepositoryDescription(directory) {
  if (directory instanceof (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteDirectory) {
    const repositoryDescription = directory.getHgRepositoryDescription();
    if (repositoryDescription == null || repositoryDescription.repoPath == null) {
      return null;
    }
    const serverConnection = directory._server;
    const { repoPath, originURL, workingDirectoryPath } = repositoryDescription;
    const workingDirectoryLocalPath = workingDirectoryPath;
    // These paths are all relative to the remote fs. We need to turn these into URIs.
    const repoUri = serverConnection.getUriOfRemotePath(repoPath);
    const workingDirectoryUri = serverConnection.getUriOfRemotePath(workingDirectoryPath);
    return {
      originURL,
      repoPath: repoUri,
      workingDirectory: serverConnection.createDirectory(workingDirectoryUri),
      workingDirectoryLocalPath
    };
  } else {
    const repositoryDescription = (0, (_nuclideSourceControlHelpers || _load_nuclideSourceControlHelpers()).findHgRepository)(directory.getPath());
    if (repositoryDescription == null) {
      return null;
    }
    const { repoPath, originURL, workingDirectoryPath } = repositoryDescription;
    return {
      originURL,
      repoPath,
      workingDirectory: new _atom.Directory(workingDirectoryPath)
    };
  }
}

class HgRepositoryProvider {
  constructor() {
    this._activeRepositoryClients = new Map();
  }
  // Allow having multiple project roots under the same repo while sharing
  // the underlying HgRepositoryClient.


  repositoryForDirectory(directory) {
    return Promise.resolve(this.repositoryForDirectorySync(directory));
  }

  repositoryForDirectorySync(directory) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('hg-repository.repositoryForDirectorySync', () => {
      try {
        const repositoryDescription = getRepositoryDescription(directory);
        if (!repositoryDescription) {
          return null;
        }

        const { originURL, repoPath, workingDirectory } = repositoryDescription;

        // extend the underlying instance of HgRepositoryClient to prevent
        // having multiple clients for multiple project roots inside the same
        // repository folder
        const activeRepositoryClients = this._activeRepositoryClients;
        let activeRepoClientInfo = activeRepositoryClients.get(repoPath);

        if (activeRepoClientInfo != null) {
          activeRepoClientInfo.refCount++;
        } else {
          const hgService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getHgServiceByNuclideUri)(directory.getPath());
          const activeRepoClient = new (_nuclideHgRepositoryClient || _load_nuclideHgRepositoryClient()).HgRepositoryClient(repoPath, hgService, {
            workingDirectory,
            originURL
          });

          activeRepoClientInfo = {
            refCount: 1,
            repo: activeRepoClient
          };
          activeRepositoryClients.set(repoPath, activeRepoClientInfo);
        }

        let destroyed = false;

        const localDisposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();

        /* eslint-disable no-inner-declarations */
        function ProjectHgRepositoryClient() {
          this.getInternalProjectDirectory = function () {
            return directory;
          };

          this.destroy = function () {
            if (!(activeRepoClientInfo != null)) {
              throw new Error('Invariant violation: "activeRepoClientInfo != null"');
            }

            if (!destroyed && --activeRepoClientInfo.refCount === 0) {
              destroyed = true;
              activeRepoClientInfo.repo.destroy();
              activeRepositoryClients.delete(repoPath);
            }
            localDisposables.dispose();
          };

          // Allow consumers to use `onDidDestroy` for the ProjectRepos.
          // `getRootRepo()` can be used to add an onDidDestroy for the base
          // repo
          this.onDidDestroy = function (callback) {
            localDisposables.add(callback);
            return {
              dispose() {
                localDisposables.remove(callback);
              }
            };
          };
        }

        ProjectHgRepositoryClient.prototype = activeRepoClientInfo.repo;

        // $FlowFixMe: this object has an HgRepositoryClient instance in its prototype chain
        return new ProjectHgRepositoryClient();
      } catch (err) {
        logger.error('Failed to create an HgRepositoryClient for ', directory.getPath(), ', error: ', err);
        return null;
      }
    });
  }
}
exports.default = HgRepositoryProvider;