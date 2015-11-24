'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {Directory} = require('atom');
import {trackTiming} from 'nuclide-analytics';

let logger = null;
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
  const {RemoteDirectory} = require('nuclide-remote-connection');

  if (RemoteDirectory.isRemoteDirectory(directory)) {
    var repositoryDescription = directory.getHgRepositoryDescription();
    if (!repositoryDescription.repoPath) {
      return null;
    }

    const remoteConnection = directory._remote;
    var {repoPath, originURL, workingDirectoryPath} = repositoryDescription;
    const workingDirectoryLocalPath = workingDirectoryPath;
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
    const {findHgRepository} = require('nuclide-source-control-helpers');
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

export default class HgRepositoryProvider {
  repositoryForDirectory(directory: Directory) {
    return Promise.resolve(this.repositoryForDirectorySync(directory));
  }

  @trackTiming('hg-repository.repositoryForDirectorySync')
  repositoryForDirectorySync(directory: Directory): ?HgRepository {
    try {
      const repositoryDescription = getRepositoryDescription(directory);
      if (!repositoryDescription) {
        return null;
      }

      const {originURL, repoPath, workingDirectory, workingDirectoryLocalPath} = repositoryDescription;

      const {getServiceByNuclideUri} = require('nuclide-client');
      const {HgService} = getServiceByNuclideUri('HgService', directory.getPath());
      const hgService = new HgService(workingDirectoryLocalPath);
      const {HgRepositoryClient} = require('nuclide-hg-repository-client');
      return new HgRepositoryClient(repoPath, hgService, {
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
