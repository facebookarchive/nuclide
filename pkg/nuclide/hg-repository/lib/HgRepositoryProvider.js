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

module.exports = class HgRepositoryProvider {
  repositoryForDirectory(directory: Directory) {
    return Promise.resolve(this.repositoryForDirectorySync(directory));
  }

  repositoryForDirectorySync(directory: Directory): ?HgRepository {
    var {RemoteDirectory} = require('nuclide-remote-connection');
    if (RemoteDirectory.isRemoteDirectory(directory)) {
      // This provider does not support remote directories at this time.
      return null;
    }

    var {findHgRepository} = require('nuclide-hg-repository-base');
    var {repoPath, originURL, workingDirectoryPath} = findHgRepository(directory.getPath());

    if (repoPath) {
      var HgRepositoryClient = require('./HgRepositoryClient');
      var {getServiceByNuclideUri} = require('nuclide-client');
      var service = getServiceByNuclideUri(
        'HgService',
        directory.getPath(),
        {workingDirectory: workingDirectoryPath}
      );
      var workingDirectory = new Directory(workingDirectoryPath);
      return new HgRepositoryClient(repoPath, service, {
        workingDirectory,
        projectRootDirectory: directory,
        originURL,
      });
    } else {
      return null;
    }
  }
}
