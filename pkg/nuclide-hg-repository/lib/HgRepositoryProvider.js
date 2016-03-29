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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhnUmVwb3NpdG9yeVByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7c0JBWXNCLFFBQVE7Ozs7Z0NBQ0oseUJBQXlCOzt1Q0FDRSxpQ0FBaUM7Ozs7Ozs7Ozs7ZUFIbEUsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBNUIsU0FBUyxZQUFULFNBQVM7O2dCQUlhLE9BQU8sQ0FBQyxvQ0FBb0MsQ0FBQzs7SUFBbkUsa0JBQWtCLGFBQWxCLGtCQUFrQjs7QUFFekIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFNBQVMsU0FBUyxHQUFHO0FBQ25CLFNBQU8sTUFBTSxLQUFLLE1BQU0sR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQSxBQUFDLENBQUM7Q0FDMUU7Ozs7Ozs7Ozs7Ozs7O0FBY0QsU0FBUyx3QkFBd0IsQ0FDL0IsU0FBK0MsRUFNL0M7a0JBQzBCLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQzs7TUFBN0QsZUFBZSxhQUFmLGVBQWU7O0FBQ3RCLE1BQUksU0FBUyxvREFBK0IsRUFBRTtBQUM1QyxRQUFNLHFCQUFxQixHQUFHLFNBQVMsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0FBQ3JFLFFBQUkscUJBQXFCLElBQUksSUFBSSxJQUM1QixxQkFBcUIsQ0FBQyxRQUFRLElBQUksSUFBSSxJQUN0QyxxQkFBcUIsQ0FBQyxTQUFTLElBQUksSUFBSSxFQUMxQztBQUNBLGFBQU8sSUFBSSxDQUFDO0tBQ2I7QUFDRCxRQUFNLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUM7UUFDcEMsU0FBUSxHQUFxQyxxQkFBcUIsQ0FBbEUsUUFBUTtRQUFFLFVBQVMsR0FBMEIscUJBQXFCLENBQXhELFNBQVM7UUFBRSxvQkFBb0IsR0FBSSxxQkFBcUIsQ0FBN0Msb0JBQW9COztBQUNoRCxRQUFNLDBCQUF5QixHQUFHLG9CQUFvQixDQUFDOztBQUV2RCxRQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxTQUFRLENBQUMsQ0FBQztBQUM5RCxRQUFNLG1CQUFtQixHQUFHLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDdEYsV0FBTztBQUNMLGVBQVMsRUFBVCxVQUFTO0FBQ1QsY0FBUSxFQUFFLE9BQU87QUFDakIsc0JBQWdCLEVBQUUsSUFBSSxlQUFlLENBQUMsZ0JBQWdCLEVBQUUsbUJBQW1CLENBQUM7QUFDNUUsK0JBQXlCLEVBQXpCLDBCQUF5QjtLQUMxQixDQUFDO0dBQ0gsTUFBTTtvQkFDc0IsT0FBTyxDQUFDLHNDQUFzQyxDQUFDOztRQUFuRSxnQkFBZ0IsYUFBaEIsZ0JBQWdCOztBQUN2QixRQUFNLHFCQUFxQixHQUFHLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3BFLFFBQUkscUJBQXFCLElBQUksSUFBSSxFQUFFO0FBQ2pDLGFBQU8sSUFBSSxDQUFDO0tBQ2I7UUFDTSxVQUFRLEdBQXFDLHFCQUFxQixDQUFsRSxRQUFRO1FBQUUsV0FBUyxHQUEwQixxQkFBcUIsQ0FBeEQsU0FBUztRQUFFLG9CQUFvQixHQUFJLHFCQUFxQixDQUE3QyxvQkFBb0I7O0FBQ2hELFdBQU87QUFDTCxlQUFTLEVBQVQsV0FBUztBQUNULGNBQVEsRUFBUixVQUFRO0FBQ1Isc0JBQWdCLEVBQUUsSUFBSSxTQUFTLENBQUMsb0JBQW9CLENBQUM7QUFDckQsK0JBQXlCLEVBQUUsb0JBQW9CO0tBQ2hELENBQUM7R0FDSDtDQUNGOztJQUVZLG9CQUFvQjtXQUFwQixvQkFBb0I7MEJBQXBCLG9CQUFvQjs7O3dCQUFwQixvQkFBb0I7O1dBQ1QsZ0NBQUMsU0FBb0IsRUFBZ0M7QUFDekUsYUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0tBQ3BFOzs7aUJBRUEsbUNBQVksMENBQTBDLENBQUM7V0FDOUIsb0NBQUMsU0FBb0IsRUFBdUI7QUFDcEUsVUFBSTtBQUNGLFlBQU0scUJBQXFCLEdBQUcsd0JBQXdCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbEUsWUFBSSxDQUFDLHFCQUFxQixFQUFFO0FBQzFCLGlCQUFPLElBQUksQ0FBQztTQUNiOztZQUdDLFdBQVMsR0FJUCxxQkFBcUIsQ0FKdkIsU0FBUztZQUNULFVBQVEsR0FHTixxQkFBcUIsQ0FIdkIsUUFBUTtZQUNSLGlCQUFnQixHQUVkLHFCQUFxQixDQUZ2QixnQkFBZ0I7WUFDaEIsMkJBQXlCLEdBQ3ZCLHFCQUFxQixDQUR2Qix5QkFBeUI7O3dCQUdNLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQzs7WUFBekQsc0JBQXNCLGFBQXRCLHNCQUFzQjs7QUFDN0IsWUFBTSxPQUFPLEdBQUcsc0JBQXNCLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3pFLGlDQUFVLE9BQU8sQ0FBQyxDQUFDO0FBQ25CLFlBQU0sU0FBUyxHQUFHLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQywyQkFBeUIsQ0FBQyxDQUFDO0FBQ25FLGVBQU8sSUFBSSxrQkFBa0IsQ0FBQyxVQUFRLEVBQUUsU0FBUyxFQUFFO0FBQ2pELDBCQUFnQixFQUFoQixpQkFBZ0I7QUFDaEIsOEJBQW9CLEVBQUUsU0FBUztBQUMvQixtQkFBUyxFQUFULFdBQVM7U0FDVixDQUFDLENBQUM7T0FDSixDQUFDLE9BQU8sR0FBRyxFQUFFO0FBQ1osaUJBQVMsRUFBRSxDQUFDLEtBQUssQ0FDZiw2Q0FBNkMsRUFBRSxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsV0FBVyxFQUFFLEdBQUcsQ0FDckYsQ0FBQztBQUNGLGVBQU8sSUFBSSxDQUFDO09BQ2I7S0FDRjs7O1NBbkNVLG9CQUFvQiIsImZpbGUiOiJIZ1JlcG9zaXRvcnlQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtEaXJlY3Rvcnl9ID0gcmVxdWlyZSgnYXRvbScpO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IHtSZW1vdGVEaXJlY3RvcnkgYXMgUmVtb3RlRGlyZWN0b3J5VHlwZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtY29ubmVjdGlvbic7XG5jb25zdCB7SGdSZXBvc2l0b3J5Q2xpZW50fSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1jbGllbnQnKTtcblxubGV0IGxvZ2dlciA9IG51bGw7XG5mdW5jdGlvbiBnZXRMb2dnZXIoKSB7XG4gIHJldHVybiBsb2dnZXIgfHwgKGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtbG9nZ2luZycpLmdldExvZ2dlcigpKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gZGlyZWN0b3J5IEVpdGhlciBhIFJlbW90ZURpcmVjdG9yeSBvciBEaXJlY3Rvcnkgd2UgYXJlIGludGVyZXN0ZWQgaW4uXG4gKiBAcmV0dXJuIElmIHRoZSBkaXJlY3RvcnkgaXMgcGFydCBvZiBhIE1lcmN1cmlhbCByZXBvc2l0b3J5LCByZXR1cm5zIGFuIG9iamVjdFxuICogIHdpdGggdGhlIGZvbGxvd2luZyBmaWVsZDpcbiAqICAqIG9yaWdpblVSTCBUaGUgc3RyaW5nIFVSTCBvZiB0aGUgcmVwb3NpdG9yeSBvcmlnaW4uXG4gKiAgKiByZXBvUGF0aCBUaGUgcGF0aC91cmkgdG8gdGhlIHJlcG9zaXRvcnkgKC5oZyBmb2xkZXIpLlxuICogICogd29ya2luZ0RpcmVjdG9yeSBBIERpcmVjdG9yeSAob3IgUmVtb3RlRGlyZWN0b3J5KSBvYmplY3QgdGhhdCByZXByZXNlbnRzXG4gKiAgICB0aGUgcmVwb3NpdG9yeSdzIHdvcmtpbmcgZGlyZWN0b3J5LlxuICogICogd29ya2luZ0RpcmVjdG9yeUxvY2FsUGF0aCBUaGUgbG9jYWwgcGF0aCB0byB0aGUgd29ya2luZ0RpcmVjdG9yeSBvZiB0aGVcbiAqICAgIHJlcG9zaXRvcnkgKGkuZS4gaWYgaXQncyBhIHJlbW90ZSBkaXJlY3RvcnksIHRoZSBVUkkgbWludXMgdGhlIGhvc3RuYW1lKS5cbiAqICBJZiB0aGUgZGlyZWN0b3J5IGlzIG5vdCBwYXJ0IG9mIGEgTWVyY3VyaWFsIHJlcG9zaXRvcnksIHJldHVybnMgbnVsbC5cbiAqL1xuZnVuY3Rpb24gZ2V0UmVwb3NpdG9yeURlc2NyaXB0aW9uKFxuICBkaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5IHwgUmVtb3RlRGlyZWN0b3J5VHlwZSxcbik6ID97XG4gIG9yaWdpblVSTDogP3N0cmluZztcbiAgcmVwb1BhdGg6IHN0cmluZztcbiAgd29ya2luZ0RpcmVjdG9yeTogYXRvbSREaXJlY3RvcnkgfCBSZW1vdGVEaXJlY3RvcnlUeXBlO1xuICB3b3JraW5nRGlyZWN0b3J5TG9jYWxQYXRoOiBzdHJpbmc7XG59IHtcbiAgY29uc3Qge1JlbW90ZURpcmVjdG9yeX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJyk7XG4gIGlmIChkaXJlY3RvcnkgaW5zdGFuY2VvZiBSZW1vdGVEaXJlY3RvcnlUeXBlKSB7XG4gICAgY29uc3QgcmVwb3NpdG9yeURlc2NyaXB0aW9uID0gZGlyZWN0b3J5LmdldEhnUmVwb3NpdG9yeURlc2NyaXB0aW9uKCk7XG4gICAgaWYgKHJlcG9zaXRvcnlEZXNjcmlwdGlvbiA9PSBudWxsXG4gICAgICB8fCByZXBvc2l0b3J5RGVzY3JpcHRpb24ucmVwb1BhdGggPT0gbnVsbFxuICAgICAgfHwgcmVwb3NpdG9yeURlc2NyaXB0aW9uLm9yaWdpblVSTCA9PSBudWxsXG4gICAgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgcmVtb3RlQ29ubmVjdGlvbiA9IGRpcmVjdG9yeS5fcmVtb3RlO1xuICAgIGNvbnN0IHtyZXBvUGF0aCwgb3JpZ2luVVJMLCB3b3JraW5nRGlyZWN0b3J5UGF0aH0gPSByZXBvc2l0b3J5RGVzY3JpcHRpb247XG4gICAgY29uc3Qgd29ya2luZ0RpcmVjdG9yeUxvY2FsUGF0aCA9IHdvcmtpbmdEaXJlY3RvcnlQYXRoO1xuICAgIC8vIFRoZXNlIHBhdGhzIGFyZSBhbGwgcmVsYXRpdmUgdG8gdGhlIHJlbW90ZSBmcy4gV2UgbmVlZCB0byB0dXJuIHRoZXNlIGludG8gVVJJcy5cbiAgICBjb25zdCByZXBvVXJpID0gcmVtb3RlQ29ubmVjdGlvbi5nZXRVcmlPZlJlbW90ZVBhdGgocmVwb1BhdGgpO1xuICAgIGNvbnN0IHdvcmtpbmdEaXJlY3RvcnlVcmkgPSByZW1vdGVDb25uZWN0aW9uLmdldFVyaU9mUmVtb3RlUGF0aCh3b3JraW5nRGlyZWN0b3J5UGF0aCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9yaWdpblVSTCxcbiAgICAgIHJlcG9QYXRoOiByZXBvVXJpLFxuICAgICAgd29ya2luZ0RpcmVjdG9yeTogbmV3IFJlbW90ZURpcmVjdG9yeShyZW1vdGVDb25uZWN0aW9uLCB3b3JraW5nRGlyZWN0b3J5VXJpKSxcbiAgICAgIHdvcmtpbmdEaXJlY3RvcnlMb2NhbFBhdGgsXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCB7ZmluZEhnUmVwb3NpdG9yeX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXNvdXJjZS1jb250cm9sLWhlbHBlcnMnKTtcbiAgICBjb25zdCByZXBvc2l0b3J5RGVzY3JpcHRpb24gPSBmaW5kSGdSZXBvc2l0b3J5KGRpcmVjdG9yeS5nZXRQYXRoKCkpO1xuICAgIGlmIChyZXBvc2l0b3J5RGVzY3JpcHRpb24gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHtyZXBvUGF0aCwgb3JpZ2luVVJMLCB3b3JraW5nRGlyZWN0b3J5UGF0aH0gPSByZXBvc2l0b3J5RGVzY3JpcHRpb247XG4gICAgcmV0dXJuIHtcbiAgICAgIG9yaWdpblVSTCxcbiAgICAgIHJlcG9QYXRoLFxuICAgICAgd29ya2luZ0RpcmVjdG9yeTogbmV3IERpcmVjdG9yeSh3b3JraW5nRGlyZWN0b3J5UGF0aCksXG4gICAgICB3b3JraW5nRGlyZWN0b3J5TG9jYWxQYXRoOiB3b3JraW5nRGlyZWN0b3J5UGF0aCxcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBIZ1JlcG9zaXRvcnlQcm92aWRlciB7XG4gIHJlcG9zaXRvcnlGb3JEaXJlY3RvcnkoZGlyZWN0b3J5OiBEaXJlY3RvcnkpOiBQcm9taXNlPD9IZ1JlcG9zaXRvcnlDbGllbnQ+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMucmVwb3NpdG9yeUZvckRpcmVjdG9yeVN5bmMoZGlyZWN0b3J5KSk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2hnLXJlcG9zaXRvcnkucmVwb3NpdG9yeUZvckRpcmVjdG9yeVN5bmMnKVxuICByZXBvc2l0b3J5Rm9yRGlyZWN0b3J5U3luYyhkaXJlY3Rvcnk6IERpcmVjdG9yeSk6ID9IZ1JlcG9zaXRvcnlDbGllbnQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXBvc2l0b3J5RGVzY3JpcHRpb24gPSBnZXRSZXBvc2l0b3J5RGVzY3JpcHRpb24oZGlyZWN0b3J5KTtcbiAgICAgIGlmICghcmVwb3NpdG9yeURlc2NyaXB0aW9uKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7XG4gICAgICAgIG9yaWdpblVSTCxcbiAgICAgICAgcmVwb1BhdGgsXG4gICAgICAgIHdvcmtpbmdEaXJlY3RvcnksXG4gICAgICAgIHdvcmtpbmdEaXJlY3RvcnlMb2NhbFBhdGgsXG4gICAgICB9ID0gcmVwb3NpdG9yeURlc2NyaXB0aW9uO1xuXG4gICAgICBjb25zdCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNsaWVudCcpO1xuICAgICAgY29uc3Qgc2VydmljZSA9IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0hnU2VydmljZScsIGRpcmVjdG9yeS5nZXRQYXRoKCkpO1xuICAgICAgaW52YXJpYW50KHNlcnZpY2UpO1xuICAgICAgY29uc3QgaGdTZXJ2aWNlID0gbmV3IHNlcnZpY2UuSGdTZXJ2aWNlKHdvcmtpbmdEaXJlY3RvcnlMb2NhbFBhdGgpO1xuICAgICAgcmV0dXJuIG5ldyBIZ1JlcG9zaXRvcnlDbGllbnQocmVwb1BhdGgsIGhnU2VydmljZSwge1xuICAgICAgICB3b3JraW5nRGlyZWN0b3J5LFxuICAgICAgICBwcm9qZWN0Um9vdERpcmVjdG9yeTogZGlyZWN0b3J5LFxuICAgICAgICBvcmlnaW5VUkwsXG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGdldExvZ2dlcigpLmVycm9yKFxuICAgICAgICAnRmFpbGVkIHRvIGNyZWF0ZSBhbiBIZ1JlcG9zaXRvcnlDbGllbnQgZm9yICcsIGRpcmVjdG9yeS5nZXRQYXRoKCksICcsIGVycm9yOiAnLCBlcnJcbiAgICAgICk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==