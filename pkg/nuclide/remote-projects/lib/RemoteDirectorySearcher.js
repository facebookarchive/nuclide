var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _rx = require('rx');

var _require = require('../../remote-connection');

var RemoteDirectory = _require.RemoteDirectory;

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
      return RemoteDirectory.isRemoteDirectory(directory);
    }
  }, {
    key: 'search',
    value: function search(directories, regex, options) {
      var _this = this;

      // Track the files that we have seen updates for.
      var seenFiles = new Set();

      // Get the remote service that corresponds to each remote directory.
      var services = directories.map(function (dir) {
        return _this._serviceProvider(dir);
      });

      // Start the search in each directory, and merge the resulting streams.
      var searchStream = _rx.Observable.merge(directories.map(function (dir, index) {
        return services[index].findInProjectSearch(dir.getPath(), regex, options.inclusions);
      }));

      // Create a subject that we can use to track search completion.
      var searchCompletion = new _rx.ReplaySubject();
      searchCompletion.onNext();

      var subscription = searchStream.subscribe(function (next) {
        options.didMatch(next);

        // Call didSearchPaths with the number of unique files we have seen matches in. This is
        // not technically correct, as didSearchPaths is also supposed to count files for which
        // no matches were found. However, we currently have no way of obtaining this information.
        seenFiles.add(next.filePath);
        options.didSearchPaths(seenFiles.size);
      }, function (error) {
        searchCompletion.onError(error);
      }, function () {
        searchCompletion.onCompleted();
      });

      // Return a promise that resolves on search completion.
      var completionPromise = searchCompletion.toPromise();
      return {
        then: completionPromise.then.bind(completionPromise),
        cancel: function cancel() {
          // Cancel the subscription, which should also kill the grep process.
          subscription.dispose();
        }
      };
    }
  }]);

  return RemoteDirectorySearcher;
})();

module.exports = RemoteDirectorySearcher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbW90ZURpcmVjdG9yeVNlYXJjaGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztrQkFXd0MsSUFBSTs7ZUFDbEIsT0FBTyxDQUFDLHlCQUF5QixDQUFDOztJQUFyRCxlQUFlLFlBQWYsZUFBZTs7SUFPaEIsdUJBQXVCOzs7OztBQUtoQixXQUxQLHVCQUF1QixDQUtmLGVBQThDLEVBQUU7MEJBTHhELHVCQUF1Qjs7QUFNekIsUUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztHQUN6Qzs7ZUFQRyx1QkFBdUI7O1dBU1QsNEJBQUMsU0FBMkMsRUFBVztBQUN2RSxhQUFPLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNyRDs7O1dBRUssZ0JBQ0osV0FBbUMsRUFDbkMsS0FBYSxFQUNiLE9BQWUsRUFDUTs7OztBQUV2QixVQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDOzs7QUFHNUIsVUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUc7ZUFBSSxNQUFLLGdCQUFnQixDQUFDLEdBQUcsQ0FBQztPQUFBLENBQUMsQ0FBQzs7O0FBR3BFLFVBQU0sWUFBWSxHQUFHLGVBQVcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBQyxHQUFHLEVBQUUsS0FBSztlQUMvRCxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDO09BQUEsQ0FBQyxDQUFDLENBQUM7OztBQUdsRixVQUFNLGdCQUFnQixHQUFHLHVCQUFtQixDQUFDO0FBQzdDLHNCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDOztBQUUxQixVQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQ2xELGVBQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Ozs7O0FBS3ZCLGlCQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM3QixlQUFPLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUN4QyxFQUFFLFVBQUEsS0FBSyxFQUFJO0FBQ1Ysd0JBQWdCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ2pDLEVBQUUsWUFBTTtBQUNQLHdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO09BQ2hDLENBQUMsQ0FBQzs7O0FBR0gsVUFBTSxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN2RCxhQUFPO0FBQ0wsWUFBSSxFQUFFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7QUFDcEQsY0FBTSxFQUFBLGtCQUFHOztBQUVQLHNCQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDeEI7T0FDRixDQUFDO0tBQ0g7OztTQXZERyx1QkFBdUI7OztBQTBEN0IsTUFBTSxDQUFDLE9BQU8sR0FBRyx1QkFBdUIsQ0FBQyIsImZpbGUiOiJSZW1vdGVEaXJlY3RvcnlTZWFyY2hlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7T2JzZXJ2YWJsZSwgUmVwbGF5U3ViamVjdH0gZnJvbSAncngnO1xuY29uc3Qge1JlbW90ZURpcmVjdG9yeX0gPSByZXF1aXJlKCcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbicpO1xuXG50eXBlIFJlbW90ZURpcmVjdG9yeVNlYXJjaCA9IHtcbiAgdGhlbjogKG9uRnVsbGZpbGxlZDogYW55LCBvblJlamVjdGVkOiBhbnkpID0+IFByb21pc2U8YW55PjtcbiAgY2FuY2VsOiAoKSA9PiB2b2lkO1xufVxuXG5jbGFzcyBSZW1vdGVEaXJlY3RvcnlTZWFyY2hlciB7XG4gIF9zZXJ2aWNlUHJvdmlkZXI6IChkaXI6IFJlbW90ZURpcmVjdG9yeSkgPT4gYW55O1xuXG4gIC8vIFdoZW4gY29uc3RydWN0ZWQsIFJlbW90ZURpcmVjdG9yeVNlYXJjaGVyIG11c3QgYmUgcGFzc2VkIGEgZnVuY3Rpb24gdGhhdFxuICAvLyBpdCBjYW4gdXNlIHRvIGdldCBhICdGaW5kSW5Qcm9qZWN0U2VydmljZScgZm9yIGEgZ2l2ZW4gcmVtb3RlIHBhdGguXG4gIGNvbnN0cnVjdG9yKHNlcnZpY2VQcm92aWRlcjogKGRpcjogUmVtb3RlRGlyZWN0b3J5KSA9PiBhbnkpIHtcbiAgICB0aGlzLl9zZXJ2aWNlUHJvdmlkZXIgPSBzZXJ2aWNlUHJvdmlkZXI7XG4gIH1cblxuICBjYW5TZWFyY2hEaXJlY3RvcnkoZGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeSB8IFJlbW90ZURpcmVjdG9yeSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBSZW1vdGVEaXJlY3RvcnkuaXNSZW1vdGVEaXJlY3RvcnkoZGlyZWN0b3J5KTtcbiAgfVxuXG4gIHNlYXJjaChcbiAgICBkaXJlY3RvcmllczogQXJyYXk8UmVtb3RlRGlyZWN0b3J5PixcbiAgICByZWdleDogUmVnRXhwLFxuICAgIG9wdGlvbnM6IE9iamVjdCxcbiAgKTogUmVtb3RlRGlyZWN0b3J5U2VhcmNoIHtcbiAgICAvLyBUcmFjayB0aGUgZmlsZXMgdGhhdCB3ZSBoYXZlIHNlZW4gdXBkYXRlcyBmb3IuXG4gICAgY29uc3Qgc2VlbkZpbGVzID0gbmV3IFNldCgpO1xuXG4gICAgLy8gR2V0IHRoZSByZW1vdGUgc2VydmljZSB0aGF0IGNvcnJlc3BvbmRzIHRvIGVhY2ggcmVtb3RlIGRpcmVjdG9yeS5cbiAgICBjb25zdCBzZXJ2aWNlcyA9IGRpcmVjdG9yaWVzLm1hcChkaXIgPT4gdGhpcy5fc2VydmljZVByb3ZpZGVyKGRpcikpO1xuXG4gICAgLy8gU3RhcnQgdGhlIHNlYXJjaCBpbiBlYWNoIGRpcmVjdG9yeSwgYW5kIG1lcmdlIHRoZSByZXN1bHRpbmcgc3RyZWFtcy5cbiAgICBjb25zdCBzZWFyY2hTdHJlYW0gPSBPYnNlcnZhYmxlLm1lcmdlKGRpcmVjdG9yaWVzLm1hcCgoZGlyLCBpbmRleCkgPT5cbiAgICAgIHNlcnZpY2VzW2luZGV4XS5maW5kSW5Qcm9qZWN0U2VhcmNoKGRpci5nZXRQYXRoKCksIHJlZ2V4LCBvcHRpb25zLmluY2x1c2lvbnMpKSk7XG5cbiAgICAvLyBDcmVhdGUgYSBzdWJqZWN0IHRoYXQgd2UgY2FuIHVzZSB0byB0cmFjayBzZWFyY2ggY29tcGxldGlvbi5cbiAgICBjb25zdCBzZWFyY2hDb21wbGV0aW9uID0gbmV3IFJlcGxheVN1YmplY3QoKTtcbiAgICBzZWFyY2hDb21wbGV0aW9uLm9uTmV4dCgpO1xuXG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gc2VhcmNoU3RyZWFtLnN1YnNjcmliZShuZXh0ID0+IHtcbiAgICAgIG9wdGlvbnMuZGlkTWF0Y2gobmV4dCk7XG5cbiAgICAgIC8vIENhbGwgZGlkU2VhcmNoUGF0aHMgd2l0aCB0aGUgbnVtYmVyIG9mIHVuaXF1ZSBmaWxlcyB3ZSBoYXZlIHNlZW4gbWF0Y2hlcyBpbi4gVGhpcyBpc1xuICAgICAgLy8gbm90IHRlY2huaWNhbGx5IGNvcnJlY3QsIGFzIGRpZFNlYXJjaFBhdGhzIGlzIGFsc28gc3VwcG9zZWQgdG8gY291bnQgZmlsZXMgZm9yIHdoaWNoXG4gICAgICAvLyBubyBtYXRjaGVzIHdlcmUgZm91bmQuIEhvd2V2ZXIsIHdlIGN1cnJlbnRseSBoYXZlIG5vIHdheSBvZiBvYnRhaW5pbmcgdGhpcyBpbmZvcm1hdGlvbi5cbiAgICAgIHNlZW5GaWxlcy5hZGQobmV4dC5maWxlUGF0aCk7XG4gICAgICBvcHRpb25zLmRpZFNlYXJjaFBhdGhzKHNlZW5GaWxlcy5zaXplKTtcbiAgICB9LCBlcnJvciA9PiB7XG4gICAgICBzZWFyY2hDb21wbGV0aW9uLm9uRXJyb3IoZXJyb3IpO1xuICAgIH0sICgpID0+IHtcbiAgICAgIHNlYXJjaENvbXBsZXRpb24ub25Db21wbGV0ZWQoKTtcbiAgICB9KTtcblxuICAgIC8vIFJldHVybiBhIHByb21pc2UgdGhhdCByZXNvbHZlcyBvbiBzZWFyY2ggY29tcGxldGlvbi5cbiAgICBjb25zdCBjb21wbGV0aW9uUHJvbWlzZSA9IHNlYXJjaENvbXBsZXRpb24udG9Qcm9taXNlKCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRoZW46IGNvbXBsZXRpb25Qcm9taXNlLnRoZW4uYmluZChjb21wbGV0aW9uUHJvbWlzZSksXG4gICAgICBjYW5jZWwoKSB7XG4gICAgICAgIC8vIENhbmNlbCB0aGUgc3Vic2NyaXB0aW9uLCB3aGljaCBzaG91bGQgYWxzbyBraWxsIHRoZSBncmVwIHByb2Nlc3MuXG4gICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB9LFxuICAgIH07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZW1vdGVEaXJlY3RvcnlTZWFyY2hlcjtcbiJdfQ==