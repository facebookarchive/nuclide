/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import {Directory} from 'atom';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {trackTiming} from '../../nuclide-analytics';
import {
  RemoteDirectory,
  getHgServiceByNuclideUri,
} from '../../nuclide-remote-connection';
import {HgRepositoryClient} from '../../nuclide-hg-repository-client';
import {getLogger} from 'log4js';
import {findHgRepository} from '../../nuclide-source-control-helpers';
import invariant from 'assert';

const logger = getLogger('nuclide-hg-repository');

type RefCountedRepo = {
  refCount: number,
  repo: HgRepositoryClient,
};

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
function getRepositoryDescription(
  directory: atom$Directory | RemoteDirectory,
): ?{
  originURL: ?string,
  repoPath: string,
  workingDirectory: atom$Directory | RemoteDirectory,
} {
  if (directory instanceof RemoteDirectory) {
    const repositoryDescription = directory.getHgRepositoryDescription();
    if (
      repositoryDescription == null ||
      repositoryDescription.repoPath == null
    ) {
      return null;
    }
    const serverConnection = directory._server;
    const {repoPath, originURL, workingDirectoryPath} = repositoryDescription;
    const workingDirectoryLocalPath = workingDirectoryPath;
    // These paths are all relative to the remote fs. We need to turn these into URIs.
    const repoUri = serverConnection.getUriOfRemotePath(repoPath);
    const workingDirectoryUri = serverConnection.getUriOfRemotePath(
      workingDirectoryPath,
    );
    return {
      originURL,
      repoPath: repoUri,
      workingDirectory: serverConnection.createDirectory(workingDirectoryUri),
      workingDirectoryLocalPath,
    };
  } else {
    const repositoryDescription = findHgRepository(directory.getPath());
    if (repositoryDescription == null) {
      return null;
    }
    const {repoPath, originURL, workingDirectoryPath} = repositoryDescription;
    return {
      originURL,
      repoPath,
      workingDirectory: new Directory(workingDirectoryPath),
    };
  }
}

export default class HgRepositoryProvider {
  // Allow having multiple project roots under the same repo while sharing
  // the underlying HgRepositoryClient.
  _activeRepositoryClients: Map<string, RefCountedRepo> = new Map();

  repositoryForDirectory(directory: Directory): Promise<?HgRepositoryClient> {
    return Promise.resolve(this.repositoryForDirectorySync(directory));
  }

  repositoryForDirectorySync(directory: Directory): ?HgRepositoryClient {
    return trackTiming('hg-repository.repositoryForDirectorySync', () => {
      try {
        const repositoryDescription = getRepositoryDescription(directory);
        if (!repositoryDescription) {
          return null;
        }

        const {originURL, repoPath, workingDirectory} = repositoryDescription;

        // extend the underlying instance of HgRepositoryClient to prevent
        // having multiple clients for multiple project roots inside the same
        // repository folder
        const activeRepositoryClients = this._activeRepositoryClients;
        let activeRepoClientInfo = activeRepositoryClients.get(repoPath);

        if (activeRepoClientInfo != null) {
          activeRepoClientInfo.refCount++;
        } else {
          const hgService = getHgServiceByNuclideUri(directory.getPath());
          const activeRepoClient = new HgRepositoryClient(repoPath, hgService, {
            workingDirectory,
            originURL,
          });

          activeRepoClientInfo = {
            refCount: 1,
            repo: activeRepoClient,
          };
          activeRepositoryClients.set(repoPath, activeRepoClientInfo);
        }

        let destroyed = false;

        const localDisposables = new UniversalDisposable();

        /* eslint-disable no-inner-declarations */
        function ProjectHgRepositoryClient() {
          this.getInternalProjectDirectory = function(): atom$Directory {
            return directory;
          };

          this.destroy = function(): void {
            invariant(activeRepoClientInfo != null);
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
          this.onDidDestroy = function(callback: () => mixed): IDisposable {
            localDisposables.add(callback);
            return {
              dispose() {
                localDisposables.remove(callback);
              },
            };
          };
        }

        ProjectHgRepositoryClient.prototype = activeRepoClientInfo.repo;

        // $FlowFixMe: this object has an HgRepositoryClient instance in its prototype chain
        return ((new ProjectHgRepositoryClient(): any): HgRepositoryClient);
      } catch (err) {
        logger.error(
          'Failed to create an HgRepositoryClient for ',
          directory.getPath(),
          ', error: ',
          err,
        );
        return null;
      }
    });
  }
}
