Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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
    if (repositoryDescription.repoPath == null || repositoryDescription.originURL == null) {
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

        var _getServiceByNuclideUri = getServiceByNuclideUri('HgService', directory.getPath());

        var HgService = _getServiceByNuclideUri.HgService;

        var hgService = new HgService(_workingDirectoryLocalPath2);
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
//# sourceMappingURL=data:application/json;base64,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QW9CLEVBQXVCO0FBQ3BFLFVBQUk7QUFDRixZQUFNLHFCQUFxQixHQUFHLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2xFLFlBQUksQ0FBQyxxQkFBcUIsRUFBRTtBQUMxQixpQkFBTyxJQUFJLENBQUM7U0FDYjs7WUFHQyxXQUFTLEdBSVAscUJBQXFCLENBSnZCLFNBQVM7WUFDVCxVQUFRLEdBR04scUJBQXFCLENBSHZCLFFBQVE7WUFDUixpQkFBZ0IsR0FFZCxxQkFBcUIsQ0FGdkIsZ0JBQWdCO1lBQ2hCLDJCQUF5QixHQUN2QixxQkFBcUIsQ0FEdkIseUJBQXlCOzt3QkFHTSxPQUFPLENBQUMsY0FBYyxDQUFDOztZQUFqRCxzQkFBc0IsYUFBdEIsc0JBQXNCOztzQ0FDVCxzQkFBc0IsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDOztZQUFyRSxTQUFTLDJCQUFULFNBQVM7O0FBQ2hCLFlBQU0sU0FBUyxHQUFHLElBQUksU0FBUyxDQUFDLDJCQUF5QixDQUFDLENBQUM7QUFDM0QsZUFBTyxJQUFJLGtCQUFrQixDQUFDLFVBQVEsRUFBRSxTQUFTLEVBQUU7QUFDakQsMEJBQWdCLEVBQWhCLGlCQUFnQjtBQUNoQiw4QkFBb0IsRUFBRSxTQUFTO0FBQy9CLG1CQUFTLEVBQVQsV0FBUztTQUNWLENBQUMsQ0FBQztPQUNKLENBQUMsT0FBTyxHQUFHLEVBQUU7QUFDWixpQkFBUyxFQUFFLENBQUMsS0FBSyxDQUNmLDZDQUE2QyxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxXQUFXLEVBQUUsR0FBRyxDQUNyRixDQUFDO0FBQ0YsZUFBTyxJQUFJLENBQUM7T0FDYjtLQUNGOzs7U0FsQ1Usb0JBQW9CIiwiZmlsZSI6IkhnUmVwb3NpdG9yeVByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0RpcmVjdG9yeX0gPSByZXF1aXJlKCdhdG9tJyk7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IHtSZW1vdGVEaXJlY3RvcnkgYXMgUmVtb3RlRGlyZWN0b3J5VHlwZX0gZnJvbSAnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24nO1xuY29uc3Qge0hnUmVwb3NpdG9yeUNsaWVudH0gPSByZXF1aXJlKCcuLi8uLi9oZy1yZXBvc2l0b3J5LWNsaWVudCcpO1xuXG5sZXQgbG9nZ2VyID0gbnVsbDtcbmZ1bmN0aW9uIGdldExvZ2dlcigpIHtcbiAgcmV0dXJuIGxvZ2dlciB8fCAobG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gZGlyZWN0b3J5IEVpdGhlciBhIFJlbW90ZURpcmVjdG9yeSBvciBEaXJlY3Rvcnkgd2UgYXJlIGludGVyZXN0ZWQgaW4uXG4gKiBAcmV0dXJuIElmIHRoZSBkaXJlY3RvcnkgaXMgcGFydCBvZiBhIE1lcmN1cmlhbCByZXBvc2l0b3J5LCByZXR1cm5zIGFuIG9iamVjdFxuICogIHdpdGggdGhlIGZvbGxvd2luZyBmaWVsZDpcbiAqICAqIG9yaWdpblVSTCBUaGUgc3RyaW5nIFVSTCBvZiB0aGUgcmVwb3NpdG9yeSBvcmlnaW4uXG4gKiAgKiByZXBvUGF0aCBUaGUgcGF0aC91cmkgdG8gdGhlIHJlcG9zaXRvcnkgKC5oZyBmb2xkZXIpLlxuICogICogd29ya2luZ0RpcmVjdG9yeSBBIERpcmVjdG9yeSAob3IgUmVtb3RlRGlyZWN0b3J5KSBvYmplY3QgdGhhdCByZXByZXNlbnRzXG4gKiAgICB0aGUgcmVwb3NpdG9yeSdzIHdvcmtpbmcgZGlyZWN0b3J5LlxuICogICogd29ya2luZ0RpcmVjdG9yeUxvY2FsUGF0aCBUaGUgbG9jYWwgcGF0aCB0byB0aGUgd29ya2luZ0RpcmVjdG9yeSBvZiB0aGVcbiAqICAgIHJlcG9zaXRvcnkgKGkuZS4gaWYgaXQncyBhIHJlbW90ZSBkaXJlY3RvcnksIHRoZSBVUkkgbWludXMgdGhlIGhvc3RuYW1lKS5cbiAqICBJZiB0aGUgZGlyZWN0b3J5IGlzIG5vdCBwYXJ0IG9mIGEgTWVyY3VyaWFsIHJlcG9zaXRvcnksIHJldHVybnMgbnVsbC5cbiAqL1xuZnVuY3Rpb24gZ2V0UmVwb3NpdG9yeURlc2NyaXB0aW9uKFxuICBkaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5IHwgUmVtb3RlRGlyZWN0b3J5VHlwZSxcbik6ID97XG4gIG9yaWdpblVSTDogc3RyaW5nLFxuICByZXBvUGF0aDogc3RyaW5nLFxuICB3b3JraW5nRGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeSB8IFJlbW90ZURpcmVjdG9yeVR5cGUsXG4gIHdvcmtpbmdEaXJlY3RvcnlMb2NhbFBhdGg6IHN0cmluZyxcbn0ge1xuICBjb25zdCB7UmVtb3RlRGlyZWN0b3J5fSA9IHJlcXVpcmUoJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uJyk7XG4gIGlmIChkaXJlY3RvcnkgaW5zdGFuY2VvZiBSZW1vdGVEaXJlY3RvcnlUeXBlKSB7XG4gICAgY29uc3QgcmVwb3NpdG9yeURlc2NyaXB0aW9uID0gZGlyZWN0b3J5LmdldEhnUmVwb3NpdG9yeURlc2NyaXB0aW9uKCk7XG4gICAgaWYgKHJlcG9zaXRvcnlEZXNjcmlwdGlvbiA9PSBudWxsXG4gICAgICB8fCByZXBvc2l0b3J5RGVzY3JpcHRpb24ucmVwb1BhdGggPT0gbnVsbFxuICAgICAgfHwgcmVwb3NpdG9yeURlc2NyaXB0aW9uLm9yaWdpblVSTCA9PSBudWxsXG4gICAgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgcmVtb3RlQ29ubmVjdGlvbiA9IGRpcmVjdG9yeS5fcmVtb3RlO1xuICAgIGNvbnN0IHtyZXBvUGF0aCwgb3JpZ2luVVJMLCB3b3JraW5nRGlyZWN0b3J5UGF0aH0gPSByZXBvc2l0b3J5RGVzY3JpcHRpb247XG4gICAgY29uc3Qgd29ya2luZ0RpcmVjdG9yeUxvY2FsUGF0aCA9IHdvcmtpbmdEaXJlY3RvcnlQYXRoO1xuICAgIC8vIFRoZXNlIHBhdGhzIGFyZSBhbGwgcmVsYXRpdmUgdG8gdGhlIHJlbW90ZSBmcy4gV2UgbmVlZCB0byB0dXJuIHRoZXNlIGludG8gVVJJcy5cbiAgICBjb25zdCByZXBvVXJpID0gcmVtb3RlQ29ubmVjdGlvbi5nZXRVcmlPZlJlbW90ZVBhdGgocmVwb1BhdGgpO1xuICAgIGNvbnN0IHdvcmtpbmdEaXJlY3RvcnlVcmkgPSByZW1vdGVDb25uZWN0aW9uLmdldFVyaU9mUmVtb3RlUGF0aCh3b3JraW5nRGlyZWN0b3J5UGF0aCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9yaWdpblVSTCxcbiAgICAgIHJlcG9QYXRoOiByZXBvVXJpLFxuICAgICAgd29ya2luZ0RpcmVjdG9yeTogbmV3IFJlbW90ZURpcmVjdG9yeShyZW1vdGVDb25uZWN0aW9uLCB3b3JraW5nRGlyZWN0b3J5VXJpKSxcbiAgICAgIHdvcmtpbmdEaXJlY3RvcnlMb2NhbFBhdGgsXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCB7ZmluZEhnUmVwb3NpdG9yeX0gPSByZXF1aXJlKCcuLi8uLi9zb3VyY2UtY29udHJvbC1oZWxwZXJzJyk7XG4gICAgY29uc3QgcmVwb3NpdG9yeURlc2NyaXB0aW9uID0gZmluZEhnUmVwb3NpdG9yeShkaXJlY3RvcnkuZ2V0UGF0aCgpKTtcbiAgICBpZiAocmVwb3NpdG9yeURlc2NyaXB0aW9uLnJlcG9QYXRoID09IG51bGwgfHwgcmVwb3NpdG9yeURlc2NyaXB0aW9uLm9yaWdpblVSTCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCB7cmVwb1BhdGgsIG9yaWdpblVSTCwgd29ya2luZ0RpcmVjdG9yeVBhdGh9ID0gcmVwb3NpdG9yeURlc2NyaXB0aW9uO1xuICAgIHJldHVybiB7XG4gICAgICBvcmlnaW5VUkwsXG4gICAgICByZXBvUGF0aCxcbiAgICAgIHdvcmtpbmdEaXJlY3Rvcnk6IG5ldyBEaXJlY3Rvcnkod29ya2luZ0RpcmVjdG9yeVBhdGgpLFxuICAgICAgd29ya2luZ0RpcmVjdG9yeUxvY2FsUGF0aDogd29ya2luZ0RpcmVjdG9yeVBhdGgsXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSGdSZXBvc2l0b3J5UHJvdmlkZXIge1xuICByZXBvc2l0b3J5Rm9yRGlyZWN0b3J5KGRpcmVjdG9yeTogRGlyZWN0b3J5KTogUHJvbWlzZTw/SGdSZXBvc2l0b3J5Q2xpZW50PiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLnJlcG9zaXRvcnlGb3JEaXJlY3RvcnlTeW5jKGRpcmVjdG9yeSkpO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdoZy1yZXBvc2l0b3J5LnJlcG9zaXRvcnlGb3JEaXJlY3RvcnlTeW5jJylcbiAgcmVwb3NpdG9yeUZvckRpcmVjdG9yeVN5bmMoZGlyZWN0b3J5OiBEaXJlY3RvcnkpOiA/SGdSZXBvc2l0b3J5Q2xpZW50IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVwb3NpdG9yeURlc2NyaXB0aW9uID0gZ2V0UmVwb3NpdG9yeURlc2NyaXB0aW9uKGRpcmVjdG9yeSk7XG4gICAgICBpZiAoIXJlcG9zaXRvcnlEZXNjcmlwdGlvbikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgY29uc3Qge1xuICAgICAgICBvcmlnaW5VUkwsXG4gICAgICAgIHJlcG9QYXRoLFxuICAgICAgICB3b3JraW5nRGlyZWN0b3J5LFxuICAgICAgICB3b3JraW5nRGlyZWN0b3J5TG9jYWxQYXRoLFxuICAgICAgfSA9IHJlcG9zaXRvcnlEZXNjcmlwdGlvbjtcblxuICAgICAgY29uc3Qge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9ID0gcmVxdWlyZSgnLi4vLi4vY2xpZW50Jyk7XG4gICAgICBjb25zdCB7SGdTZXJ2aWNlfSA9IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0hnU2VydmljZScsIGRpcmVjdG9yeS5nZXRQYXRoKCkpO1xuICAgICAgY29uc3QgaGdTZXJ2aWNlID0gbmV3IEhnU2VydmljZSh3b3JraW5nRGlyZWN0b3J5TG9jYWxQYXRoKTtcbiAgICAgIHJldHVybiBuZXcgSGdSZXBvc2l0b3J5Q2xpZW50KHJlcG9QYXRoLCBoZ1NlcnZpY2UsIHtcbiAgICAgICAgd29ya2luZ0RpcmVjdG9yeSxcbiAgICAgICAgcHJvamVjdFJvb3REaXJlY3Rvcnk6IGRpcmVjdG9yeSxcbiAgICAgICAgb3JpZ2luVVJMLFxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBnZXRMb2dnZXIoKS5lcnJvcihcbiAgICAgICAgJ0ZhaWxlZCB0byBjcmVhdGUgYW4gSGdSZXBvc2l0b3J5Q2xpZW50IGZvciAnLCBkaXJlY3RvcnkuZ2V0UGF0aCgpLCAnLCBlcnJvcjogJywgZXJyXG4gICAgICApO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG59XG4iXX0=