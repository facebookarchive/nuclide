'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Directory} = require('atom');

try {
  var {ignoredRepositories} = require('./fb/config.json');
} catch (e) {
  var ignoredRepositories = [];
}

var logger = null;
function getLogger() {
  return logger || (logger = require('nuclide-logging').getLogger());
}

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
function getRepositoryDescription(directory: Directory): ?mixed {
  var {RemoteDirectory} = require('nuclide-remote-connection');

  if (RemoteDirectory.isRemoteDirectory(directory)) {
    var repositoryDescription = directory.getHgRepositoryDescription();
    if (!repositoryDescription.repoPath) {
      return null;
    }

    // TODO(chenshen) fix the performance issue and enable disabled repositories.
    // Disable remote hg feature for certain hg repsitory due to t7448942.
    if (ignoredRepositories.indexOf(repositoryDescription.originURL) >= 0) {
      logger.debug(`{repositoryDescription.originURL} is ignored.`);
      return null;
    }

    var remoteConnection = directory._remote;
    var {repoPath, originURL, workingDirectoryPath} = repositoryDescription;
    var workingDirectoryLocalPath = workingDirectoryPath;
    // These paths are all relative to the remote fs. We need to turn these into URIs.
    var repoPath = remoteConnection.getUriOfRemotePath(repoPath);
    var workingDirectoryPath = remoteConnection.getUriOfRemotePath(workingDirectoryPath);
    return {
      originURL,
      repoPath,
      workingDirectory: new RemoteDirectory(remoteConnection, workingDirectoryPath),
      workingDirectoryLocalPath,
    };
  } else {
    var {findHgRepository} = require('nuclide-source-control-helpers');
    var repositoryDescription = findHgRepository(directory.getPath());
    if (!repositoryDescription.repoPath) {
      return null;
    }

    var {repoPath, originURL, workingDirectoryPath} = repositoryDescription;
    return {
      originURL,
      repoPath,
      workingDirectory: new Directory(workingDirectoryPath),
      workingDirectoryLocalPath: workingDirectoryPath,
    };
  }
}

module.exports = class HgRepositoryProvider {
  repositoryForDirectory(directory: Directory) {
    return Promise.resolve(this.repositoryForDirectorySync(directory));
  }

  repositoryForDirectorySync(directory: Directory): ?HgRepository {
    try {
      var repositoryDescription = getRepositoryDescription(directory);
      if (!repositoryDescription) {
        return null;
      }

      var {originURL, repoPath, workingDirectory, workingDirectoryLocalPath} = repositoryDescription;

      var {getServiceByNuclideUri} = require('nuclide-client');
      var service = getServiceByNuclideUri(
        'HgService',
        directory.getPath(),
        {workingDirectory: workingDirectoryLocalPath}
      );
      var {HgRepositoryClient} = require('nuclide-hg-repository-client');
      return new HgRepositoryClient(repoPath, service, {
        workingDirectory,
        projectRootDirectory: directory,
        originURL,
      });
    } catch (err) {
      getLogger().error('Failed to create an HgRepositoryClient for ', directory.getPath(), ', error: ', err);
      return null;
    }
  }
}
