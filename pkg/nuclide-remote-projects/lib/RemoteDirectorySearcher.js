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

var _require = require('../../nuclide-remote-connection');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbW90ZURpcmVjdG9yeVNlYXJjaGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztrQkFXd0MsSUFBSTs7ZUFDbEIsT0FBTyxDQUFDLGlDQUFpQyxDQUFDOztJQUE3RCxlQUFlLFlBQWYsZUFBZTs7SUFRaEIsdUJBQXVCOzs7OztBQUtoQixXQUxQLHVCQUF1QixDQUtmLGVBQStELEVBQUU7MEJBTHpFLHVCQUF1Qjs7QUFNekIsUUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztHQUN6Qzs7ZUFQRyx1QkFBdUI7O1dBU1QsNEJBQUMsU0FBMkMsRUFBVztBQUN2RSxhQUFPLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNyRDs7O1dBRUssZ0JBQ0osV0FBbUMsRUFDbkMsS0FBYSxFQUNiLE9BQWUsRUFDUTs7OztBQUV2QixVQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDOzs7QUFHNUIsVUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUc7ZUFBSSxNQUFLLGdCQUFnQixDQUFDLEdBQUcsQ0FBQztPQUFBLENBQUMsQ0FBQzs7O0FBR3BFLFVBQU0sWUFBWSxHQUFHLGVBQVcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBQyxHQUFHLEVBQUUsS0FBSztlQUMvRCxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDO09BQUEsQ0FBQyxDQUFDLENBQUM7OztBQUdsRixVQUFNLGdCQUFnQixHQUFHLHVCQUFtQixDQUFDO0FBQzdDLHNCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDOztBQUUxQixVQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQ2xELGVBQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Ozs7O0FBS3ZCLGlCQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM3QixlQUFPLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUN4QyxFQUFFLFVBQUEsS0FBSyxFQUFJO0FBQ1Ysd0JBQWdCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ2pDLEVBQUUsWUFBTTtBQUNQLHdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO09BQ2hDLENBQUMsQ0FBQzs7O0FBR0gsVUFBTSxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN2RCxhQUFPO0FBQ0wsWUFBSSxFQUFFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7QUFDcEQsY0FBTSxFQUFBLGtCQUFHOztBQUVQLHNCQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDeEI7T0FDRixDQUFDO0tBQ0g7OztTQXZERyx1QkFBdUI7OztBQTBEN0IsTUFBTSxDQUFDLE9BQU8sR0FBRyx1QkFBdUIsQ0FBQyIsImZpbGUiOiJSZW1vdGVEaXJlY3RvcnlTZWFyY2hlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7T2JzZXJ2YWJsZSwgUmVwbGF5U3ViamVjdH0gZnJvbSAncngnO1xuY29uc3Qge1JlbW90ZURpcmVjdG9yeX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJyk7XG5pbXBvcnQgdHlwZW9mICogYXMgRmluZEluUHJvamVjdFNlcnZpY2UgZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtc2VhcmNoJztcblxudHlwZSBSZW1vdGVEaXJlY3RvcnlTZWFyY2ggPSB7XG4gIHRoZW46IChvbkZ1bGxmaWxsZWQ6IGFueSwgb25SZWplY3RlZDogYW55KSA9PiBQcm9taXNlPGFueT47XG4gIGNhbmNlbDogKCkgPT4gdm9pZDtcbn1cblxuY2xhc3MgUmVtb3RlRGlyZWN0b3J5U2VhcmNoZXIge1xuICBfc2VydmljZVByb3ZpZGVyOiAoZGlyOiBSZW1vdGVEaXJlY3RvcnkpID0+IEZpbmRJblByb2plY3RTZXJ2aWNlO1xuXG4gIC8vIFdoZW4gY29uc3RydWN0ZWQsIFJlbW90ZURpcmVjdG9yeVNlYXJjaGVyIG11c3QgYmUgcGFzc2VkIGEgZnVuY3Rpb24gdGhhdFxuICAvLyBpdCBjYW4gdXNlIHRvIGdldCBhICdGaW5kSW5Qcm9qZWN0U2VydmljZScgZm9yIGEgZ2l2ZW4gcmVtb3RlIHBhdGguXG4gIGNvbnN0cnVjdG9yKHNlcnZpY2VQcm92aWRlcjogKGRpcjogUmVtb3RlRGlyZWN0b3J5KSA9PiBGaW5kSW5Qcm9qZWN0U2VydmljZSkge1xuICAgIHRoaXMuX3NlcnZpY2VQcm92aWRlciA9IHNlcnZpY2VQcm92aWRlcjtcbiAgfVxuXG4gIGNhblNlYXJjaERpcmVjdG9yeShkaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5IHwgUmVtb3RlRGlyZWN0b3J5KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIFJlbW90ZURpcmVjdG9yeS5pc1JlbW90ZURpcmVjdG9yeShkaXJlY3RvcnkpO1xuICB9XG5cbiAgc2VhcmNoKFxuICAgIGRpcmVjdG9yaWVzOiBBcnJheTxSZW1vdGVEaXJlY3Rvcnk+LFxuICAgIHJlZ2V4OiBSZWdFeHAsXG4gICAgb3B0aW9uczogT2JqZWN0LFxuICApOiBSZW1vdGVEaXJlY3RvcnlTZWFyY2gge1xuICAgIC8vIFRyYWNrIHRoZSBmaWxlcyB0aGF0IHdlIGhhdmUgc2VlbiB1cGRhdGVzIGZvci5cbiAgICBjb25zdCBzZWVuRmlsZXMgPSBuZXcgU2V0KCk7XG5cbiAgICAvLyBHZXQgdGhlIHJlbW90ZSBzZXJ2aWNlIHRoYXQgY29ycmVzcG9uZHMgdG8gZWFjaCByZW1vdGUgZGlyZWN0b3J5LlxuICAgIGNvbnN0IHNlcnZpY2VzID0gZGlyZWN0b3JpZXMubWFwKGRpciA9PiB0aGlzLl9zZXJ2aWNlUHJvdmlkZXIoZGlyKSk7XG5cbiAgICAvLyBTdGFydCB0aGUgc2VhcmNoIGluIGVhY2ggZGlyZWN0b3J5LCBhbmQgbWVyZ2UgdGhlIHJlc3VsdGluZyBzdHJlYW1zLlxuICAgIGNvbnN0IHNlYXJjaFN0cmVhbSA9IE9ic2VydmFibGUubWVyZ2UoZGlyZWN0b3JpZXMubWFwKChkaXIsIGluZGV4KSA9PlxuICAgICAgc2VydmljZXNbaW5kZXhdLmZpbmRJblByb2plY3RTZWFyY2goZGlyLmdldFBhdGgoKSwgcmVnZXgsIG9wdGlvbnMuaW5jbHVzaW9ucykpKTtcblxuICAgIC8vIENyZWF0ZSBhIHN1YmplY3QgdGhhdCB3ZSBjYW4gdXNlIHRvIHRyYWNrIHNlYXJjaCBjb21wbGV0aW9uLlxuICAgIGNvbnN0IHNlYXJjaENvbXBsZXRpb24gPSBuZXcgUmVwbGF5U3ViamVjdCgpO1xuICAgIHNlYXJjaENvbXBsZXRpb24ub25OZXh0KCk7XG5cbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSBzZWFyY2hTdHJlYW0uc3Vic2NyaWJlKG5leHQgPT4ge1xuICAgICAgb3B0aW9ucy5kaWRNYXRjaChuZXh0KTtcblxuICAgICAgLy8gQ2FsbCBkaWRTZWFyY2hQYXRocyB3aXRoIHRoZSBudW1iZXIgb2YgdW5pcXVlIGZpbGVzIHdlIGhhdmUgc2VlbiBtYXRjaGVzIGluLiBUaGlzIGlzXG4gICAgICAvLyBub3QgdGVjaG5pY2FsbHkgY29ycmVjdCwgYXMgZGlkU2VhcmNoUGF0aHMgaXMgYWxzbyBzdXBwb3NlZCB0byBjb3VudCBmaWxlcyBmb3Igd2hpY2hcbiAgICAgIC8vIG5vIG1hdGNoZXMgd2VyZSBmb3VuZC4gSG93ZXZlciwgd2UgY3VycmVudGx5IGhhdmUgbm8gd2F5IG9mIG9idGFpbmluZyB0aGlzIGluZm9ybWF0aW9uLlxuICAgICAgc2VlbkZpbGVzLmFkZChuZXh0LmZpbGVQYXRoKTtcbiAgICAgIG9wdGlvbnMuZGlkU2VhcmNoUGF0aHMoc2VlbkZpbGVzLnNpemUpO1xuICAgIH0sIGVycm9yID0+IHtcbiAgICAgIHNlYXJjaENvbXBsZXRpb24ub25FcnJvcihlcnJvcik7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgc2VhcmNoQ29tcGxldGlvbi5vbkNvbXBsZXRlZCgpO1xuICAgIH0pO1xuXG4gICAgLy8gUmV0dXJuIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIG9uIHNlYXJjaCBjb21wbGV0aW9uLlxuICAgIGNvbnN0IGNvbXBsZXRpb25Qcm9taXNlID0gc2VhcmNoQ29tcGxldGlvbi50b1Byb21pc2UoKTtcbiAgICByZXR1cm4ge1xuICAgICAgdGhlbjogY29tcGxldGlvblByb21pc2UudGhlbi5iaW5kKGNvbXBsZXRpb25Qcm9taXNlKSxcbiAgICAgIGNhbmNlbCgpIHtcbiAgICAgICAgLy8gQ2FuY2VsIHRoZSBzdWJzY3JpcHRpb24sIHdoaWNoIHNob3VsZCBhbHNvIGtpbGwgdGhlIGdyZXAgcHJvY2Vzcy5cbiAgICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlbW90ZURpcmVjdG9yeVNlYXJjaGVyO1xuIl19