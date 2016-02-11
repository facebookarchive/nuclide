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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbW90ZURpcmVjdG9yeVNlYXJjaGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztrQkFXd0MsSUFBSTs7ZUFDbEIsT0FBTyxDQUFDLHlCQUF5QixDQUFDOztJQUFyRCxlQUFlLFlBQWYsZUFBZTs7SUFRaEIsdUJBQXVCOzs7OztBQUtoQixXQUxQLHVCQUF1QixDQUtmLGVBQStELEVBQUU7MEJBTHpFLHVCQUF1Qjs7QUFNekIsUUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztHQUN6Qzs7ZUFQRyx1QkFBdUI7O1dBU1QsNEJBQUMsU0FBMkMsRUFBVztBQUN2RSxhQUFPLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNyRDs7O1dBRUssZ0JBQ0osV0FBbUMsRUFDbkMsS0FBYSxFQUNiLE9BQWUsRUFDUTs7OztBQUV2QixVQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDOzs7QUFHNUIsVUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUc7ZUFBSSxNQUFLLGdCQUFnQixDQUFDLEdBQUcsQ0FBQztPQUFBLENBQUMsQ0FBQzs7O0FBR3BFLFVBQU0sWUFBWSxHQUFHLGVBQVcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBQyxHQUFHLEVBQUUsS0FBSztlQUMvRCxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDO09BQUEsQ0FBQyxDQUFDLENBQUM7OztBQUdsRixVQUFNLGdCQUFnQixHQUFHLHVCQUFtQixDQUFDO0FBQzdDLHNCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDOztBQUUxQixVQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQ2xELGVBQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Ozs7O0FBS3ZCLGlCQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM3QixlQUFPLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUN4QyxFQUFFLFVBQUEsS0FBSyxFQUFJO0FBQ1Ysd0JBQWdCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ2pDLEVBQUUsWUFBTTtBQUNQLHdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO09BQ2hDLENBQUMsQ0FBQzs7O0FBR0gsVUFBTSxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN2RCxhQUFPO0FBQ0wsWUFBSSxFQUFFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7QUFDcEQsY0FBTSxFQUFBLGtCQUFHOztBQUVQLHNCQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDeEI7T0FDRixDQUFDO0tBQ0g7OztTQXZERyx1QkFBdUI7OztBQTBEN0IsTUFBTSxDQUFDLE9BQU8sR0FBRyx1QkFBdUIsQ0FBQyIsImZpbGUiOiJSZW1vdGVEaXJlY3RvcnlTZWFyY2hlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7T2JzZXJ2YWJsZSwgUmVwbGF5U3ViamVjdH0gZnJvbSAncngnO1xuY29uc3Qge1JlbW90ZURpcmVjdG9yeX0gPSByZXF1aXJlKCcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbicpO1xuaW1wb3J0IHR5cGVvZiAqIGFzIEZpbmRJblByb2plY3RTZXJ2aWNlIGZyb20gJy4uLy4uL3JlbW90ZS1zZWFyY2gnO1xuXG50eXBlIFJlbW90ZURpcmVjdG9yeVNlYXJjaCA9IHtcbiAgdGhlbjogKG9uRnVsbGZpbGxlZDogYW55LCBvblJlamVjdGVkOiBhbnkpID0+IFByb21pc2U8YW55PjtcbiAgY2FuY2VsOiAoKSA9PiB2b2lkO1xufVxuXG5jbGFzcyBSZW1vdGVEaXJlY3RvcnlTZWFyY2hlciB7XG4gIF9zZXJ2aWNlUHJvdmlkZXI6IChkaXI6IFJlbW90ZURpcmVjdG9yeSkgPT4gRmluZEluUHJvamVjdFNlcnZpY2U7XG5cbiAgLy8gV2hlbiBjb25zdHJ1Y3RlZCwgUmVtb3RlRGlyZWN0b3J5U2VhcmNoZXIgbXVzdCBiZSBwYXNzZWQgYSBmdW5jdGlvbiB0aGF0XG4gIC8vIGl0IGNhbiB1c2UgdG8gZ2V0IGEgJ0ZpbmRJblByb2plY3RTZXJ2aWNlJyBmb3IgYSBnaXZlbiByZW1vdGUgcGF0aC5cbiAgY29uc3RydWN0b3Ioc2VydmljZVByb3ZpZGVyOiAoZGlyOiBSZW1vdGVEaXJlY3RvcnkpID0+IEZpbmRJblByb2plY3RTZXJ2aWNlKSB7XG4gICAgdGhpcy5fc2VydmljZVByb3ZpZGVyID0gc2VydmljZVByb3ZpZGVyO1xuICB9XG5cbiAgY2FuU2VhcmNoRGlyZWN0b3J5KGRpcmVjdG9yeTogYXRvbSREaXJlY3RvcnkgfCBSZW1vdGVEaXJlY3RvcnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gUmVtb3RlRGlyZWN0b3J5LmlzUmVtb3RlRGlyZWN0b3J5KGRpcmVjdG9yeSk7XG4gIH1cblxuICBzZWFyY2goXG4gICAgZGlyZWN0b3JpZXM6IEFycmF5PFJlbW90ZURpcmVjdG9yeT4sXG4gICAgcmVnZXg6IFJlZ0V4cCxcbiAgICBvcHRpb25zOiBPYmplY3QsXG4gICk6IFJlbW90ZURpcmVjdG9yeVNlYXJjaCB7XG4gICAgLy8gVHJhY2sgdGhlIGZpbGVzIHRoYXQgd2UgaGF2ZSBzZWVuIHVwZGF0ZXMgZm9yLlxuICAgIGNvbnN0IHNlZW5GaWxlcyA9IG5ldyBTZXQoKTtcblxuICAgIC8vIEdldCB0aGUgcmVtb3RlIHNlcnZpY2UgdGhhdCBjb3JyZXNwb25kcyB0byBlYWNoIHJlbW90ZSBkaXJlY3RvcnkuXG4gICAgY29uc3Qgc2VydmljZXMgPSBkaXJlY3Rvcmllcy5tYXAoZGlyID0+IHRoaXMuX3NlcnZpY2VQcm92aWRlcihkaXIpKTtcblxuICAgIC8vIFN0YXJ0IHRoZSBzZWFyY2ggaW4gZWFjaCBkaXJlY3RvcnksIGFuZCBtZXJnZSB0aGUgcmVzdWx0aW5nIHN0cmVhbXMuXG4gICAgY29uc3Qgc2VhcmNoU3RyZWFtID0gT2JzZXJ2YWJsZS5tZXJnZShkaXJlY3Rvcmllcy5tYXAoKGRpciwgaW5kZXgpID0+XG4gICAgICBzZXJ2aWNlc1tpbmRleF0uZmluZEluUHJvamVjdFNlYXJjaChkaXIuZ2V0UGF0aCgpLCByZWdleCwgb3B0aW9ucy5pbmNsdXNpb25zKSkpO1xuXG4gICAgLy8gQ3JlYXRlIGEgc3ViamVjdCB0aGF0IHdlIGNhbiB1c2UgdG8gdHJhY2sgc2VhcmNoIGNvbXBsZXRpb24uXG4gICAgY29uc3Qgc2VhcmNoQ29tcGxldGlvbiA9IG5ldyBSZXBsYXlTdWJqZWN0KCk7XG4gICAgc2VhcmNoQ29tcGxldGlvbi5vbk5leHQoKTtcblxuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHNlYXJjaFN0cmVhbS5zdWJzY3JpYmUobmV4dCA9PiB7XG4gICAgICBvcHRpb25zLmRpZE1hdGNoKG5leHQpO1xuXG4gICAgICAvLyBDYWxsIGRpZFNlYXJjaFBhdGhzIHdpdGggdGhlIG51bWJlciBvZiB1bmlxdWUgZmlsZXMgd2UgaGF2ZSBzZWVuIG1hdGNoZXMgaW4uIFRoaXMgaXNcbiAgICAgIC8vIG5vdCB0ZWNobmljYWxseSBjb3JyZWN0LCBhcyBkaWRTZWFyY2hQYXRocyBpcyBhbHNvIHN1cHBvc2VkIHRvIGNvdW50IGZpbGVzIGZvciB3aGljaFxuICAgICAgLy8gbm8gbWF0Y2hlcyB3ZXJlIGZvdW5kLiBIb3dldmVyLCB3ZSBjdXJyZW50bHkgaGF2ZSBubyB3YXkgb2Ygb2J0YWluaW5nIHRoaXMgaW5mb3JtYXRpb24uXG4gICAgICBzZWVuRmlsZXMuYWRkKG5leHQuZmlsZVBhdGgpO1xuICAgICAgb3B0aW9ucy5kaWRTZWFyY2hQYXRocyhzZWVuRmlsZXMuc2l6ZSk7XG4gICAgfSwgZXJyb3IgPT4ge1xuICAgICAgc2VhcmNoQ29tcGxldGlvbi5vbkVycm9yKGVycm9yKTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICBzZWFyY2hDb21wbGV0aW9uLm9uQ29tcGxldGVkKCk7XG4gICAgfSk7XG5cbiAgICAvLyBSZXR1cm4gYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgb24gc2VhcmNoIGNvbXBsZXRpb24uXG4gICAgY29uc3QgY29tcGxldGlvblByb21pc2UgPSBzZWFyY2hDb21wbGV0aW9uLnRvUHJvbWlzZSgpO1xuICAgIHJldHVybiB7XG4gICAgICB0aGVuOiBjb21wbGV0aW9uUHJvbWlzZS50aGVuLmJpbmQoY29tcGxldGlvblByb21pc2UpLFxuICAgICAgY2FuY2VsKCkge1xuICAgICAgICAvLyBDYW5jZWwgdGhlIHN1YnNjcmlwdGlvbiwgd2hpY2ggc2hvdWxkIGFsc28ga2lsbCB0aGUgZ3JlcCBwcm9jZXNzLlxuICAgICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgfSxcbiAgICB9O1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVtb3RlRGlyZWN0b3J5U2VhcmNoZXI7XG4iXX0=