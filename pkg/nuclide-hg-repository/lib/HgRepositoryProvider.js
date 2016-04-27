Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideRemoteConnection = require('../../nuclide-remote-connection');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var Directory = _require.Directory;

var _require2 = require('../../nuclide-hg-repository-client');

var HgRepositoryClient = _require2.HgRepositoryClient;

var logger = null;
function getLogger() {
  return logger || (logger = require('../../nuclide-logging').getLogger());
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
function getRepositoryDescription(directory) {
  var _require3 = require('../../nuclide-remote-connection');

  var RemoteDirectory = _require3.RemoteDirectory;

  if (directory instanceof _nuclideRemoteConnection.RemoteDirectory) {
    var repositoryDescription = directory.getHgRepositoryDescription();
    if (repositoryDescription == null || repositoryDescription.repoPath == null || repositoryDescription.originURL == null) {
      return null;
    }
    var serverConnection = directory._server;
    var _repoPath = repositoryDescription.repoPath;
    var _originURL = repositoryDescription.originURL;
    var workingDirectoryPath = repositoryDescription.workingDirectoryPath;

    var _workingDirectoryLocalPath = workingDirectoryPath;
    // These paths are all relative to the remote fs. We need to turn these into URIs.
    var repoUri = serverConnection.getUriOfRemotePath(_repoPath);
    var workingDirectoryUri = serverConnection.getUriOfRemotePath(workingDirectoryPath);
    return {
      originURL: _originURL,
      repoPath: repoUri,
      workingDirectory: new RemoteDirectory(serverConnection, workingDirectoryUri),
      workingDirectoryLocalPath: _workingDirectoryLocalPath
    };
  } else {
    var _require4 = require('../../nuclide-source-control-helpers');

    var findHgRepository = _require4.findHgRepository;

    var repositoryDescription = findHgRepository(directory.getPath());
    if (repositoryDescription == null) {
      return null;
    }
    var _repoPath2 = repositoryDescription.repoPath;
    var _originURL2 = repositoryDescription.originURL;
    var workingDirectoryPath = repositoryDescription.workingDirectoryPath;

    return {
      originURL: _originURL2,
      repoPath: _repoPath2,
      workingDirectory: new Directory(workingDirectoryPath),
      workingDirectoryLocalPath: workingDirectoryPath
    };
  }
}

var HgRepositoryProvider = (function () {
  function HgRepositoryProvider() {
    _classCallCheck(this, HgRepositoryProvider);
  }

  _createDecoratedClass(HgRepositoryProvider, [{
    key: 'repositoryForDirectory',
    value: function repositoryForDirectory(directory) {
      return Promise.resolve(this.repositoryForDirectorySync(directory));
    }
  }, {
    key: 'repositoryForDirectorySync',
    decorators: [(0, _nuclideAnalytics.trackTiming)('hg-repository.repositoryForDirectorySync')],
    value: function repositoryForDirectorySync(directory) {
      try {
        var repositoryDescription = getRepositoryDescription(directory);
        if (!repositoryDescription) {
          return null;
        }

        var _originURL3 = repositoryDescription.originURL;
        var _repoPath3 = repositoryDescription.repoPath;
        var _workingDirectory = repositoryDescription.workingDirectory;
        var _workingDirectoryLocalPath2 = repositoryDescription.workingDirectoryLocalPath;

        var _require5 = require('../../nuclide-client');

        var getServiceByNuclideUri = _require5.getServiceByNuclideUri;

        var service = getServiceByNuclideUri('HgService', directory.getPath());
        (0, _assert2['default'])(service);
        var hgService = new service.HgService(_workingDirectoryLocalPath2);
        return new HgRepositoryClient(_repoPath3, hgService, {
          workingDirectory: _workingDirectory,
          projectRootDirectory: directory,
          originURL: _originURL3
        });
      } catch (err) {
        getLogger().error('Failed to create an HgRepositoryClient for ', directory.getPath(), ', error: ', err);
        return null;
      }
    }
  }]);

  return HgRepositoryProvider;
})();

exports.HgRepositoryProvider = HgRepositoryProvider;