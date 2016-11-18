'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _dec, _desc, _value, _class;

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

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _nuclideSourceControlHelpers;

function _load_nuclideSourceControlHelpers() {
  return _nuclideSourceControlHelpers = require('../../nuclide-source-control-helpers');
}

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

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
    const repoPath = repositoryDescription.repoPath,
          originURL = repositoryDescription.originURL,
          workingDirectoryPath = repositoryDescription.workingDirectoryPath;

    const workingDirectoryLocalPath = workingDirectoryPath;
    // These paths are all relative to the remote fs. We need to turn these into URIs.
    const repoUri = serverConnection.getUriOfRemotePath(repoPath);
    const workingDirectoryUri = serverConnection.getUriOfRemotePath(workingDirectoryPath);
    return {
      originURL: originURL,
      repoPath: repoUri,
      workingDirectory: serverConnection.createDirectory(workingDirectoryUri),
      workingDirectoryLocalPath: workingDirectoryLocalPath
    };
  } else {
    const repositoryDescription = (0, (_nuclideSourceControlHelpers || _load_nuclideSourceControlHelpers()).findHgRepository)(directory.getPath());
    if (repositoryDescription == null) {
      return null;
    }
    const repoPath = repositoryDescription.repoPath,
          originURL = repositoryDescription.originURL,
          workingDirectoryPath = repositoryDescription.workingDirectoryPath;

    return {
      originURL: originURL,
      repoPath: repoPath,
      workingDirectory: new _atom.Directory(workingDirectoryPath),
      workingDirectoryLocalPath: workingDirectoryPath
    };
  }
}

let HgRepositoryProvider = (_dec = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('hg-repository.repositoryForDirectorySync'), (_class = class HgRepositoryProvider {
  repositoryForDirectory(directory) {
    return Promise.resolve(this.repositoryForDirectorySync(directory));
  }

  repositoryForDirectorySync(directory) {
    try {
      const repositoryDescription = getRepositoryDescription(directory);
      if (!repositoryDescription) {
        return null;
      }

      const originURL = repositoryDescription.originURL,
            repoPath = repositoryDescription.repoPath,
            workingDirectory = repositoryDescription.workingDirectory,
            workingDirectoryLocalPath = repositoryDescription.workingDirectoryLocalPath;


      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('HgService', directory.getPath());

      if (!service) {
        throw new Error('Invariant violation: "service"');
      }

      const hgService = new service.HgService(workingDirectoryLocalPath);
      return new (_nuclideHgRepositoryClient || _load_nuclideHgRepositoryClient()).HgRepositoryClient(repoPath, hgService, {
        workingDirectory: workingDirectory,
        projectRootDirectory: directory,
        originURL: originURL
      });
    } catch (err) {
      logger.error('Failed to create an HgRepositoryClient for ', directory.getPath(), ', error: ', err);
      return null;
    }
  }
}, (_applyDecoratedDescriptor(_class.prototype, 'repositoryForDirectorySync', [_dec], Object.getOwnPropertyDescriptor(_class.prototype, 'repositoryForDirectorySync'), _class.prototype)), _class));
exports.default = HgRepositoryProvider;
module.exports = exports['default'];