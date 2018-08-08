"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
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

function _nuclideHgRepositoryClient() {
  const data = require("../../nuclide-hg-repository-client");

  _nuclideHgRepositoryClient = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideSourceControlHelpers() {
  const data = require("../../nuclide-source-control-helpers");

  _nuclideSourceControlHelpers = function () {
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
 *  strict-local
 * @format
 */
const logger = (0, _log4js().getLogger)('nuclide-hg-repository');

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
  if (directory instanceof _nuclideRemoteConnection().RemoteDirectory) {
    const repositoryDescription = directory.getHgRepositoryDescription();

    if (repositoryDescription == null || repositoryDescription.repoPath == null) {
      return null;
    }

    const serverConnection = directory._server;
    const {
      repoPath,
      originURL,
      workingDirectoryPath
    } = repositoryDescription; // These paths are all relative to the remote fs. We need to turn these into URIs.

    const repoUri = serverConnection.getUriOfRemotePath(repoPath);
    const workingDirectoryUri = serverConnection.getUriOfRemotePath(workingDirectoryPath);
    return {
      originURL,
      repoPath: repoUri,
      workingDirectoryPath: workingDirectoryUri
    };
  } else {
    const repositoryDescription = (0, _nuclideSourceControlHelpers().findHgRepository)(directory.getPath());

    if (repositoryDescription == null) {
      return null;
    }

    const {
      repoPath,
      originURL,
      workingDirectoryPath
    } = repositoryDescription;
    return {
      originURL,
      repoPath,
      workingDirectoryPath
    };
  }
}

class HgRepositoryProvider {
  constructor() {
    this._activeRepositoryClients = new Map();
  }

  repositoryForDirectory(directory) {
    return Promise.resolve(this.repositoryForDirectorySync(directory));
  }

  repositoryForDirectorySync(directory) {
    return (0, _nuclideAnalytics().trackTiming)('hg-repository.repositoryForDirectorySync', () => {
      try {
        const repositoryDescription = getRepositoryDescription(directory);

        if (!repositoryDescription) {
          return null;
        }

        const {
          originURL,
          repoPath,
          workingDirectoryPath
        } = repositoryDescription; // extend the underlying instance of HgRepositoryClient to prevent
        // having multiple clients for multiple project roots inside the same
        // repository folder

        const activeRepositoryClients = this._activeRepositoryClients;
        let activeRepoClientInfo = activeRepositoryClients.get(repoPath);

        if (activeRepoClientInfo != null) {
          activeRepoClientInfo.refCount++;
        } else {
          const hgService = (0, _nuclideRemoteConnection().getHgServiceByNuclideUri)(workingDirectoryPath);
          const activeRepoClient = new (_nuclideHgRepositoryClient().HgRepositoryClient)(repoPath, hgService, {
            workingDirectoryPath,
            originURL
          });
          activeRepoClientInfo = {
            refCount: 1,
            repo: activeRepoClient
          };
          activeRepositoryClients.set(repoPath, activeRepoClientInfo);
        }

        let destroyed = false;
        const localDisposables = new (_UniversalDisposable().default)();
        /* eslint-disable no-inner-declarations */

        function ProjectHgRepositoryClient() {
          this.getProjectDirectory = function () {
            return directory.getPath();
          };

          this.destroy = function () {
            if (!(activeRepoClientInfo != null)) {
              throw new Error("Invariant violation: \"activeRepoClientInfo != null\"");
            }

            if (!destroyed && --activeRepoClientInfo.refCount === 0) {
              destroyed = true;
              activeRepoClientInfo.repo.destroy();
              activeRepositoryClients.delete(repoPath);
            }

            localDisposables.dispose();
          }; // Allow consumers to use `onDidDestroy` for the ProjectRepos.
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

        ProjectHgRepositoryClient.prototype = activeRepoClientInfo.repo; // $FlowFixMe: this object has an HgRepositoryClient instance in its prototype chain

        return new ProjectHgRepositoryClient();
      } catch (err) {
        logger.error('Failed to create an HgRepositoryClient for ', directory.getPath(), ', error: ', err);
        return null;
      }
    });
  }

}

exports.default = HgRepositoryProvider;