'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

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

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-repository');

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
      workingDirectory: new _atom.Directory(workingDirectoryPath),
      workingDirectoryLocalPath: workingDirectoryPath
    };
  }
}

class HgRepositoryProvider {
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

        const {
          originURL,
          repoPath,
          workingDirectory,
          workingDirectoryLocalPath
        } = repositoryDescription;

        const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getHgServiceByNuclideUri)(directory.getPath());
        const hgService = new service.HgService(workingDirectoryLocalPath);
        return new (_nuclideHgRepositoryClient || _load_nuclideHgRepositoryClient()).HgRepositoryClient(repoPath, hgService, {
          workingDirectory,
          projectRootDirectory: directory,
          originURL
        });
      } catch (err) {
        logger.error('Failed to create an HgRepositoryClient for ', directory.getPath(), ', error: ', err);
        return null;
      }
    });
  }
}
exports.default = HgRepositoryProvider;