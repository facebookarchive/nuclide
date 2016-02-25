Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _analytics = require('../../analytics');

var _remoteConnection = require('../../remote-connection');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var Directory = _require.Directory;

var _require2 = require('../../hg-repository-client');

var HgRepositoryClient = _require2.HgRepositoryClient;

var logger = null;
function getLogger() {
  return logger || (logger = require('../../logging').getLogger());
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
  var _require3 = require('../../remote-connection');

  var RemoteDirectory = _require3.RemoteDirectory;

  if (directory instanceof _remoteConnection.RemoteDirectory) {
    var repositoryDescription = directory.getHgRepositoryDescription();
    if (repositoryDescription == null || repositoryDescription.repoPath == null || repositoryDescription.originURL == null) {
      return null;
    }
    var remoteConnection = directory._remote;
    var _repoPath = repositoryDescription.repoPath;
    var _originURL = repositoryDescription.originURL;
    var workingDirectoryPath = repositoryDescription.workingDirectoryPath;

    var _workingDirectoryLocalPath = workingDirectoryPath;
    // These paths are all relative to the remote fs. We need to turn these into URIs.
    var repoUri = remoteConnection.getUriOfRemotePath(_repoPath);
    var workingDirectoryUri = remoteConnection.getUriOfRemotePath(workingDirectoryPath);
    return {
      originURL: _originURL,
      repoPath: repoUri,
      workingDirectory: new RemoteDirectory(remoteConnection, workingDirectoryUri),
      workingDirectoryLocalPath: _workingDirectoryLocalPath
    };
  } else {
    var _require4 = require('../../source-control-helpers');

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
    decorators: [(0, _analytics.trackTiming)('hg-repository.repositoryForDirectorySync')],
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

        var _require5 = require('../../client');

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
//# sourceMappingURL=data:application/json;base64,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QUFNLHFCQUFxQixHQUFHLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2xFLFlBQUksQ0FBQyxxQkFBcUIsRUFBRTtBQUMxQixpQkFBTyxJQUFJLENBQUM7U0FDYjs7WUFHQyxXQUFTLEdBSVAscUJBQXFCLENBSnZCLFNBQVM7WUFDVCxVQUFRLEdBR04scUJBQXFCLENBSHZCLFFBQVE7WUFDUixpQkFBZ0IsR0FFZCxxQkFBcUIsQ0FGdkIsZ0JBQWdCO1lBQ2hCLDJCQUF5QixHQUN2QixxQkFBcUIsQ0FEdkIseUJBQXlCOzt3QkFHTSxPQUFPLENBQUMsY0FBYyxDQUFDOztZQUFqRCxzQkFBc0IsYUFBdEIsc0JBQXNCOztBQUM3QixZQUFNLE9BQU8sR0FBRyxzQkFBc0IsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDekUsaUNBQVUsT0FBTyxDQUFDLENBQUM7QUFDbkIsWUFBTSxTQUFTLEdBQUcsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLDJCQUF5QixDQUFDLENBQUM7QUFDbkUsZUFBTyxJQUFJLGtCQUFrQixDQUFDLFVBQVEsRUFBRSxTQUFTLEVBQUU7QUFDakQsMEJBQWdCLEVBQWhCLGlCQUFnQjtBQUNoQiw4QkFBb0IsRUFBRSxTQUFTO0FBQy9CLG1CQUFTLEVBQVQsV0FBUztTQUNWLENBQUMsQ0FBQztPQUNKLENBQUMsT0FBTyxHQUFHLEVBQUU7QUFDWixpQkFBUyxFQUFFLENBQUMsS0FBSyxDQUNmLDZDQUE2QyxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxXQUFXLEVBQUUsR0FBRyxDQUNyRixDQUFDO0FBQ0YsZUFBTyxJQUFJLENBQUM7T0FDYjtLQUNGOzs7U0FuQ1Usb0JBQW9CIiwiZmlsZSI6IkhnUmVwb3NpdG9yeVByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0RpcmVjdG9yeX0gPSByZXF1aXJlKCdhdG9tJyk7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IHtSZW1vdGVEaXJlY3RvcnkgYXMgUmVtb3RlRGlyZWN0b3J5VHlwZX0gZnJvbSAnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24nO1xuY29uc3Qge0hnUmVwb3NpdG9yeUNsaWVudH0gPSByZXF1aXJlKCcuLi8uLi9oZy1yZXBvc2l0b3J5LWNsaWVudCcpO1xuXG5sZXQgbG9nZ2VyID0gbnVsbDtcbmZ1bmN0aW9uIGdldExvZ2dlcigpIHtcbiAgcmV0dXJuIGxvZ2dlciB8fCAobG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gZGlyZWN0b3J5IEVpdGhlciBhIFJlbW90ZURpcmVjdG9yeSBvciBEaXJlY3Rvcnkgd2UgYXJlIGludGVyZXN0ZWQgaW4uXG4gKiBAcmV0dXJuIElmIHRoZSBkaXJlY3RvcnkgaXMgcGFydCBvZiBhIE1lcmN1cmlhbCByZXBvc2l0b3J5LCByZXR1cm5zIGFuIG9iamVjdFxuICogIHdpdGggdGhlIGZvbGxvd2luZyBmaWVsZDpcbiAqICAqIG9yaWdpblVSTCBUaGUgc3RyaW5nIFVSTCBvZiB0aGUgcmVwb3NpdG9yeSBvcmlnaW4uXG4gKiAgKiByZXBvUGF0aCBUaGUgcGF0aC91cmkgdG8gdGhlIHJlcG9zaXRvcnkgKC5oZyBmb2xkZXIpLlxuICogICogd29ya2luZ0RpcmVjdG9yeSBBIERpcmVjdG9yeSAob3IgUmVtb3RlRGlyZWN0b3J5KSBvYmplY3QgdGhhdCByZXByZXNlbnRzXG4gKiAgICB0aGUgcmVwb3NpdG9yeSdzIHdvcmtpbmcgZGlyZWN0b3J5LlxuICogICogd29ya2luZ0RpcmVjdG9yeUxvY2FsUGF0aCBUaGUgbG9jYWwgcGF0aCB0byB0aGUgd29ya2luZ0RpcmVjdG9yeSBvZiB0aGVcbiAqICAgIHJlcG9zaXRvcnkgKGkuZS4gaWYgaXQncyBhIHJlbW90ZSBkaXJlY3RvcnksIHRoZSBVUkkgbWludXMgdGhlIGhvc3RuYW1lKS5cbiAqICBJZiB0aGUgZGlyZWN0b3J5IGlzIG5vdCBwYXJ0IG9mIGEgTWVyY3VyaWFsIHJlcG9zaXRvcnksIHJldHVybnMgbnVsbC5cbiAqL1xuZnVuY3Rpb24gZ2V0UmVwb3NpdG9yeURlc2NyaXB0aW9uKFxuICBkaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5IHwgUmVtb3RlRGlyZWN0b3J5VHlwZSxcbik6ID97XG4gIG9yaWdpblVSTDogP3N0cmluZztcbiAgcmVwb1BhdGg6IHN0cmluZztcbiAgd29ya2luZ0RpcmVjdG9yeTogYXRvbSREaXJlY3RvcnkgfCBSZW1vdGVEaXJlY3RvcnlUeXBlO1xuICB3b3JraW5nRGlyZWN0b3J5TG9jYWxQYXRoOiBzdHJpbmc7XG59IHtcbiAgY29uc3Qge1JlbW90ZURpcmVjdG9yeX0gPSByZXF1aXJlKCcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbicpO1xuICBpZiAoZGlyZWN0b3J5IGluc3RhbmNlb2YgUmVtb3RlRGlyZWN0b3J5VHlwZSkge1xuICAgIGNvbnN0IHJlcG9zaXRvcnlEZXNjcmlwdGlvbiA9IGRpcmVjdG9yeS5nZXRIZ1JlcG9zaXRvcnlEZXNjcmlwdGlvbigpO1xuICAgIGlmIChyZXBvc2l0b3J5RGVzY3JpcHRpb24gPT0gbnVsbFxuICAgICAgfHwgcmVwb3NpdG9yeURlc2NyaXB0aW9uLnJlcG9QYXRoID09IG51bGxcbiAgICAgIHx8IHJlcG9zaXRvcnlEZXNjcmlwdGlvbi5vcmlnaW5VUkwgPT0gbnVsbFxuICAgICkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHJlbW90ZUNvbm5lY3Rpb24gPSBkaXJlY3RvcnkuX3JlbW90ZTtcbiAgICBjb25zdCB7cmVwb1BhdGgsIG9yaWdpblVSTCwgd29ya2luZ0RpcmVjdG9yeVBhdGh9ID0gcmVwb3NpdG9yeURlc2NyaXB0aW9uO1xuICAgIGNvbnN0IHdvcmtpbmdEaXJlY3RvcnlMb2NhbFBhdGggPSB3b3JraW5nRGlyZWN0b3J5UGF0aDtcbiAgICAvLyBUaGVzZSBwYXRocyBhcmUgYWxsIHJlbGF0aXZlIHRvIHRoZSByZW1vdGUgZnMuIFdlIG5lZWQgdG8gdHVybiB0aGVzZSBpbnRvIFVSSXMuXG4gICAgY29uc3QgcmVwb1VyaSA9IHJlbW90ZUNvbm5lY3Rpb24uZ2V0VXJpT2ZSZW1vdGVQYXRoKHJlcG9QYXRoKTtcbiAgICBjb25zdCB3b3JraW5nRGlyZWN0b3J5VXJpID0gcmVtb3RlQ29ubmVjdGlvbi5nZXRVcmlPZlJlbW90ZVBhdGgod29ya2luZ0RpcmVjdG9yeVBhdGgpO1xuICAgIHJldHVybiB7XG4gICAgICBvcmlnaW5VUkwsXG4gICAgICByZXBvUGF0aDogcmVwb1VyaSxcbiAgICAgIHdvcmtpbmdEaXJlY3Rvcnk6IG5ldyBSZW1vdGVEaXJlY3RvcnkocmVtb3RlQ29ubmVjdGlvbiwgd29ya2luZ0RpcmVjdG9yeVVyaSksXG4gICAgICB3b3JraW5nRGlyZWN0b3J5TG9jYWxQYXRoLFxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgY29uc3Qge2ZpbmRIZ1JlcG9zaXRvcnl9ID0gcmVxdWlyZSgnLi4vLi4vc291cmNlLWNvbnRyb2wtaGVscGVycycpO1xuICAgIGNvbnN0IHJlcG9zaXRvcnlEZXNjcmlwdGlvbiA9IGZpbmRIZ1JlcG9zaXRvcnkoZGlyZWN0b3J5LmdldFBhdGgoKSk7XG4gICAgaWYgKHJlcG9zaXRvcnlEZXNjcmlwdGlvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qge3JlcG9QYXRoLCBvcmlnaW5VUkwsIHdvcmtpbmdEaXJlY3RvcnlQYXRofSA9IHJlcG9zaXRvcnlEZXNjcmlwdGlvbjtcbiAgICByZXR1cm4ge1xuICAgICAgb3JpZ2luVVJMLFxuICAgICAgcmVwb1BhdGgsXG4gICAgICB3b3JraW5nRGlyZWN0b3J5OiBuZXcgRGlyZWN0b3J5KHdvcmtpbmdEaXJlY3RvcnlQYXRoKSxcbiAgICAgIHdvcmtpbmdEaXJlY3RvcnlMb2NhbFBhdGg6IHdvcmtpbmdEaXJlY3RvcnlQYXRoLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEhnUmVwb3NpdG9yeVByb3ZpZGVyIHtcbiAgcmVwb3NpdG9yeUZvckRpcmVjdG9yeShkaXJlY3Rvcnk6IERpcmVjdG9yeSk6IFByb21pc2U8P0hnUmVwb3NpdG9yeUNsaWVudD4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5yZXBvc2l0b3J5Rm9yRGlyZWN0b3J5U3luYyhkaXJlY3RvcnkpKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnaGctcmVwb3NpdG9yeS5yZXBvc2l0b3J5Rm9yRGlyZWN0b3J5U3luYycpXG4gIHJlcG9zaXRvcnlGb3JEaXJlY3RvcnlTeW5jKGRpcmVjdG9yeTogRGlyZWN0b3J5KTogP0hnUmVwb3NpdG9yeUNsaWVudCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlcG9zaXRvcnlEZXNjcmlwdGlvbiA9IGdldFJlcG9zaXRvcnlEZXNjcmlwdGlvbihkaXJlY3RvcnkpO1xuICAgICAgaWYgKCFyZXBvc2l0b3J5RGVzY3JpcHRpb24pIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHtcbiAgICAgICAgb3JpZ2luVVJMLFxuICAgICAgICByZXBvUGF0aCxcbiAgICAgICAgd29ya2luZ0RpcmVjdG9yeSxcbiAgICAgICAgd29ya2luZ0RpcmVjdG9yeUxvY2FsUGF0aCxcbiAgICAgIH0gPSByZXBvc2l0b3J5RGVzY3JpcHRpb247XG5cbiAgICAgIGNvbnN0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSA9IHJlcXVpcmUoJy4uLy4uL2NsaWVudCcpO1xuICAgICAgY29uc3Qgc2VydmljZSA9IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0hnU2VydmljZScsIGRpcmVjdG9yeS5nZXRQYXRoKCkpO1xuICAgICAgaW52YXJpYW50KHNlcnZpY2UpO1xuICAgICAgY29uc3QgaGdTZXJ2aWNlID0gbmV3IHNlcnZpY2UuSGdTZXJ2aWNlKHdvcmtpbmdEaXJlY3RvcnlMb2NhbFBhdGgpO1xuICAgICAgcmV0dXJuIG5ldyBIZ1JlcG9zaXRvcnlDbGllbnQocmVwb1BhdGgsIGhnU2VydmljZSwge1xuICAgICAgICB3b3JraW5nRGlyZWN0b3J5LFxuICAgICAgICBwcm9qZWN0Um9vdERpcmVjdG9yeTogZGlyZWN0b3J5LFxuICAgICAgICBvcmlnaW5VUkwsXG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGdldExvZ2dlcigpLmVycm9yKFxuICAgICAgICAnRmFpbGVkIHRvIGNyZWF0ZSBhbiBIZ1JlcG9zaXRvcnlDbGllbnQgZm9yICcsIGRpcmVjdG9yeS5nZXRQYXRoKCksICcsIGVycm9yOiAnLCBlcnJcbiAgICAgICk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==