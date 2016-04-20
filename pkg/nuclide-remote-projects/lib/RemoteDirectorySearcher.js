var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactivexRxjs = require('@reactivex/rxjs');

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
      var searchStream = _reactivexRxjs.Observable.merge.apply(_reactivexRxjs.Observable, _toConsumableArray(directories.map(function (dir, index) {
        return services[index].findInProjectSearch(dir.getPath(), regex, options.inclusions);
      })));

      // Create a subject that we can use to track search completion.
      var searchCompletion = new _reactivexRxjs.ReplaySubject();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbW90ZURpcmVjdG9yeVNlYXJjaGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OzZCQVd3QyxpQkFBaUI7O2VBQy9CLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQzs7SUFBN0QsZUFBZSxZQUFmLGVBQWU7O0lBUWhCLHVCQUF1Qjs7Ozs7QUFLaEIsV0FMUCx1QkFBdUIsQ0FLZixlQUErRCxFQUFFOzBCQUx6RSx1QkFBdUI7O0FBTXpCLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7R0FDekM7O2VBUEcsdUJBQXVCOztXQVNULDRCQUFDLFNBQTJDLEVBQVc7QUFDdkUsYUFBTyxlQUFlLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDckQ7OztXQUVLLGdCQUNKLFdBQW1DLEVBQ25DLEtBQWEsRUFDYixPQUFlLEVBQ1E7Ozs7QUFFdkIsVUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7O0FBRzVCLFVBQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHO2VBQUksTUFBSyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUM7T0FBQSxDQUFDLENBQUM7OztBQUdwRSxVQUFNLFlBQVksR0FBRywwQkFBVyxLQUFLLE1BQUEsK0NBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFDLEdBQUcsRUFBRSxLQUFLO2VBQ2xFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUM7T0FBQSxDQUFDLEVBQUMsQ0FBQzs7O0FBR2xGLFVBQU0sZ0JBQWdCLEdBQUcsa0NBQW1CLENBQUM7QUFDN0Msc0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7O0FBRXhCLFVBQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsVUFBQSxJQUFJLEVBQUk7QUFDbEQsZUFBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7Ozs7QUFLdkIsaUJBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzdCLGVBQU8sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ3hDLEVBQUUsVUFBQSxLQUFLLEVBQUk7QUFDVix3QkFBZ0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDL0IsRUFBRSxZQUFNO0FBQ1Asd0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUM7T0FDN0IsQ0FBQyxDQUFDOzs7QUFHSCxVQUFNLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3ZELGFBQU87QUFDTCxZQUFJLEVBQUUsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztBQUNwRCxjQUFNLEVBQUEsa0JBQUc7O0FBRVAsc0JBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUM1QjtPQUNGLENBQUM7S0FDSDs7O1NBdkRHLHVCQUF1Qjs7O0FBMEQ3QixNQUFNLENBQUMsT0FBTyxHQUFHLHVCQUF1QixDQUFDIiwiZmlsZSI6IlJlbW90ZURpcmVjdG9yeVNlYXJjaGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtPYnNlcnZhYmxlLCBSZXBsYXlTdWJqZWN0fSBmcm9tICdAcmVhY3RpdmV4L3J4anMnO1xuY29uc3Qge1JlbW90ZURpcmVjdG9yeX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJyk7XG5pbXBvcnQgdHlwZW9mICogYXMgRmluZEluUHJvamVjdFNlcnZpY2UgZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtc2VhcmNoJztcblxudHlwZSBSZW1vdGVEaXJlY3RvcnlTZWFyY2ggPSB7XG4gIHRoZW46IChvbkZ1bGxmaWxsZWQ6IGFueSwgb25SZWplY3RlZDogYW55KSA9PiBQcm9taXNlPGFueT47XG4gIGNhbmNlbDogKCkgPT4gdm9pZDtcbn07XG5cbmNsYXNzIFJlbW90ZURpcmVjdG9yeVNlYXJjaGVyIHtcbiAgX3NlcnZpY2VQcm92aWRlcjogKGRpcjogUmVtb3RlRGlyZWN0b3J5KSA9PiBGaW5kSW5Qcm9qZWN0U2VydmljZTtcblxuICAvLyBXaGVuIGNvbnN0cnVjdGVkLCBSZW1vdGVEaXJlY3RvcnlTZWFyY2hlciBtdXN0IGJlIHBhc3NlZCBhIGZ1bmN0aW9uIHRoYXRcbiAgLy8gaXQgY2FuIHVzZSB0byBnZXQgYSAnRmluZEluUHJvamVjdFNlcnZpY2UnIGZvciBhIGdpdmVuIHJlbW90ZSBwYXRoLlxuICBjb25zdHJ1Y3RvcihzZXJ2aWNlUHJvdmlkZXI6IChkaXI6IFJlbW90ZURpcmVjdG9yeSkgPT4gRmluZEluUHJvamVjdFNlcnZpY2UpIHtcbiAgICB0aGlzLl9zZXJ2aWNlUHJvdmlkZXIgPSBzZXJ2aWNlUHJvdmlkZXI7XG4gIH1cblxuICBjYW5TZWFyY2hEaXJlY3RvcnkoZGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeSB8IFJlbW90ZURpcmVjdG9yeSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBSZW1vdGVEaXJlY3RvcnkuaXNSZW1vdGVEaXJlY3RvcnkoZGlyZWN0b3J5KTtcbiAgfVxuXG4gIHNlYXJjaChcbiAgICBkaXJlY3RvcmllczogQXJyYXk8UmVtb3RlRGlyZWN0b3J5PixcbiAgICByZWdleDogUmVnRXhwLFxuICAgIG9wdGlvbnM6IE9iamVjdCxcbiAgKTogUmVtb3RlRGlyZWN0b3J5U2VhcmNoIHtcbiAgICAvLyBUcmFjayB0aGUgZmlsZXMgdGhhdCB3ZSBoYXZlIHNlZW4gdXBkYXRlcyBmb3IuXG4gICAgY29uc3Qgc2VlbkZpbGVzID0gbmV3IFNldCgpO1xuXG4gICAgLy8gR2V0IHRoZSByZW1vdGUgc2VydmljZSB0aGF0IGNvcnJlc3BvbmRzIHRvIGVhY2ggcmVtb3RlIGRpcmVjdG9yeS5cbiAgICBjb25zdCBzZXJ2aWNlcyA9IGRpcmVjdG9yaWVzLm1hcChkaXIgPT4gdGhpcy5fc2VydmljZVByb3ZpZGVyKGRpcikpO1xuXG4gICAgLy8gU3RhcnQgdGhlIHNlYXJjaCBpbiBlYWNoIGRpcmVjdG9yeSwgYW5kIG1lcmdlIHRoZSByZXN1bHRpbmcgc3RyZWFtcy5cbiAgICBjb25zdCBzZWFyY2hTdHJlYW0gPSBPYnNlcnZhYmxlLm1lcmdlKC4uLmRpcmVjdG9yaWVzLm1hcCgoZGlyLCBpbmRleCkgPT5cbiAgICAgIHNlcnZpY2VzW2luZGV4XS5maW5kSW5Qcm9qZWN0U2VhcmNoKGRpci5nZXRQYXRoKCksIHJlZ2V4LCBvcHRpb25zLmluY2x1c2lvbnMpKSk7XG5cbiAgICAvLyBDcmVhdGUgYSBzdWJqZWN0IHRoYXQgd2UgY2FuIHVzZSB0byB0cmFjayBzZWFyY2ggY29tcGxldGlvbi5cbiAgICBjb25zdCBzZWFyY2hDb21wbGV0aW9uID0gbmV3IFJlcGxheVN1YmplY3QoKTtcbiAgICBzZWFyY2hDb21wbGV0aW9uLm5leHQoKTtcblxuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHNlYXJjaFN0cmVhbS5zdWJzY3JpYmUobmV4dCA9PiB7XG4gICAgICBvcHRpb25zLmRpZE1hdGNoKG5leHQpO1xuXG4gICAgICAvLyBDYWxsIGRpZFNlYXJjaFBhdGhzIHdpdGggdGhlIG51bWJlciBvZiB1bmlxdWUgZmlsZXMgd2UgaGF2ZSBzZWVuIG1hdGNoZXMgaW4uIFRoaXMgaXNcbiAgICAgIC8vIG5vdCB0ZWNobmljYWxseSBjb3JyZWN0LCBhcyBkaWRTZWFyY2hQYXRocyBpcyBhbHNvIHN1cHBvc2VkIHRvIGNvdW50IGZpbGVzIGZvciB3aGljaFxuICAgICAgLy8gbm8gbWF0Y2hlcyB3ZXJlIGZvdW5kLiBIb3dldmVyLCB3ZSBjdXJyZW50bHkgaGF2ZSBubyB3YXkgb2Ygb2J0YWluaW5nIHRoaXMgaW5mb3JtYXRpb24uXG4gICAgICBzZWVuRmlsZXMuYWRkKG5leHQuZmlsZVBhdGgpO1xuICAgICAgb3B0aW9ucy5kaWRTZWFyY2hQYXRocyhzZWVuRmlsZXMuc2l6ZSk7XG4gICAgfSwgZXJyb3IgPT4ge1xuICAgICAgc2VhcmNoQ29tcGxldGlvbi5lcnJvcihlcnJvcik7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgc2VhcmNoQ29tcGxldGlvbi5jb21wbGV0ZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gUmV0dXJuIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIG9uIHNlYXJjaCBjb21wbGV0aW9uLlxuICAgIGNvbnN0IGNvbXBsZXRpb25Qcm9taXNlID0gc2VhcmNoQ29tcGxldGlvbi50b1Byb21pc2UoKTtcbiAgICByZXR1cm4ge1xuICAgICAgdGhlbjogY29tcGxldGlvblByb21pc2UudGhlbi5iaW5kKGNvbXBsZXRpb25Qcm9taXNlKSxcbiAgICAgIGNhbmNlbCgpIHtcbiAgICAgICAgLy8gQ2FuY2VsIHRoZSBzdWJzY3JpcHRpb24sIHdoaWNoIHNob3VsZCBhbHNvIGtpbGwgdGhlIGdyZXAgcHJvY2Vzcy5cbiAgICAgICAgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICB9LFxuICAgIH07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZW1vdGVEaXJlY3RvcnlTZWFyY2hlcjtcbiJdfQ==