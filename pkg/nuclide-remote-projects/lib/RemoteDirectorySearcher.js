var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var RemoteDirectorySearcher = (function () {

  // When constructed, RemoteDirectorySearcher must be passed a function that
  // it can use to get a 'FindInProjectService' for a given remote path.

  function RemoteDirectorySearcher(serviceProvider) {
    _classCallCheck(this, RemoteDirectorySearcher);

    this._serviceProvider = serviceProvider;
  }

  _createClass(RemoteDirectorySearcher, [{
    key: 'canSearchDirectory',
    value: function canSearchDirectory(directory) {
      return (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).RemoteDirectory.isRemoteDirectory(directory);
    }
  }, {
    key: 'search',
    value: function search(directories, regex, options) {
      var _Observable,
          _this = this;

      // Track the files that we have seen updates for.
      var seenFiles = new Set();

      // Get the remote service that corresponds to each remote directory.
      var services = directories.map(function (dir) {
        return _this._serviceProvider(dir);
      });

      // Start the search in each directory, and merge the resulting streams.
      var searchStream = (_Observable = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable).merge.apply(_Observable, _toConsumableArray(directories.map(function (dir, index) {
        return services[index].findInProjectSearch(dir.getPath(), regex, options.inclusions);
      })));

      // Create a subject that we can use to track search completion.
      var searchCompletion = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).ReplaySubject();
      searchCompletion.next();

      var subscription = searchStream.subscribe(function (next) {
        options.didMatch(next);

        // Call didSearchPaths with the number of unique files we have seen matches in. This is
        // not technically correct, as didSearchPaths is also supposed to count files for which
        // no matches were found. However, we currently have no way of obtaining this information.
        seenFiles.add(next.filePath);
        options.didSearchPaths(seenFiles.size);
      }, function (error) {
        searchCompletion.error(error);
      }, function () {
        searchCompletion.complete();
      });

      // Return a promise that resolves on search completion.
      var completionPromise = searchCompletion.toPromise();
      return {
        then: completionPromise.then.bind(completionPromise),
        cancel: function cancel() {
          // Cancel the subscription, which should also kill the grep process.
          subscription.unsubscribe();
        }
      };
    }
  }]);

  return RemoteDirectorySearcher;
})();

module.exports = RemoteDirectorySearcher;