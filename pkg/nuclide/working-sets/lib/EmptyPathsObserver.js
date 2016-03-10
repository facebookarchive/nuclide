Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var EmptyPathsObserver = (function () {
  function EmptyPathsObserver(workingSetsStore) {
    _classCallCheck(this, EmptyPathsObserver);

    this._prevPaths = atom.project.getPaths();
    this._workingSetsStore = workingSetsStore;
  }

  _createClass(EmptyPathsObserver, [{
    key: 'onEmptyPaths',
    value: function onEmptyPaths(callback) {
      var _this = this;

      return atom.project.onDidChangePaths(function (paths) {
        _this._didChangePaths(paths, callback);
      });
    }
  }, {
    key: '_didChangePaths',
    value: function _didChangePaths(paths, emptyPathsCallback) {
      var prevPaths = this._prevPaths;
      this._prevPaths = paths;

      var currentWs = this._workingSetsStore.getCurrent();
      var noneShown = !paths.some(function (p) {
        return currentWs.containsDir(p);
      });
      if (noneShown) {
        emptyPathsCallback();
        return;
      }

      var addedPaths = paths.filter(function (p) {
        return prevPaths.indexOf(p) < 0;
      });
      var pathChangeWasHidden = addedPaths.some(function (p) {
        return !currentWs.containsDir(p);
      });

      // The user added a new project root and the currently active working sets did not let
      // it show. This would feel broken - better deactivate the working sets.
      if (pathChangeWasHidden) {
        emptyPathsCallback();
      }
    }
  }]);

  return EmptyPathsObserver;
})();

exports.EmptyPathsObserver = EmptyPathsObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkVtcHR5UGF0aHNPYnNlcnZlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0lBYWEsa0JBQWtCO0FBSWxCLFdBSkEsa0JBQWtCLENBSWpCLGdCQUFrQyxFQUFFOzBCQUpyQyxrQkFBa0I7O0FBSzNCLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUMxQyxRQUFJLENBQUMsaUJBQWlCLEdBQUcsZ0JBQWdCLENBQUM7R0FDM0M7O2VBUFUsa0JBQWtCOztXQVNqQixzQkFBQyxRQUFvQixFQUFlOzs7QUFDOUMsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFVBQUMsS0FBSyxFQUFvQjtBQUM3RCxjQUFLLGVBQWUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7T0FDdkMsQ0FBQyxDQUFDO0tBQ0o7OztXQUVjLHlCQUFDLEtBQW9CLEVBQUUsa0JBQThCLEVBQVE7QUFDMUUsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUNsQyxVQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQzs7QUFFeEIsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ3RELFVBQU0sU0FBUyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUM7ZUFBSSxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztPQUFBLENBQUMsQ0FBQztBQUM3RCxVQUFJLFNBQVMsRUFBRTtBQUNiLDBCQUFrQixFQUFFLENBQUM7QUFDckIsZUFBTztPQUNSOztBQUVELFVBQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDO2VBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO09BQUEsQ0FBQyxDQUFDO0FBQy9ELFVBQU0sbUJBQW1CLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUM7ZUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO09BQUEsQ0FBQyxDQUFDOzs7O0FBSTVFLFVBQUksbUJBQW1CLEVBQUU7QUFDdkIsMEJBQWtCLEVBQUUsQ0FBQztPQUN0QjtLQUNGOzs7U0FsQ1Usa0JBQWtCIiwiZmlsZSI6IkVtcHR5UGF0aHNPYnNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0c1N0b3JlfSBmcm9tICcuL1dvcmtpbmdTZXRzU3RvcmUnO1xuXG5leHBvcnQgY2xhc3MgRW1wdHlQYXRoc09ic2VydmVyIHtcbiAgX3ByZXZQYXRoczogQXJyYXk8c3RyaW5nPjtcbiAgX3dvcmtpbmdTZXRzU3RvcmU6IFdvcmtpbmdTZXRzU3RvcmU7XG5cbiAgY29uc3RydWN0b3Iod29ya2luZ1NldHNTdG9yZTogV29ya2luZ1NldHNTdG9yZSkge1xuICAgIHRoaXMuX3ByZXZQYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpO1xuICAgIHRoaXMuX3dvcmtpbmdTZXRzU3RvcmUgPSB3b3JraW5nU2V0c1N0b3JlO1xuICB9XG5cbiAgb25FbXB0eVBhdGhzKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygocGF0aHM6IEFycmF5PHN0cmluZz4pID0+IHtcbiAgICAgIHRoaXMuX2RpZENoYW5nZVBhdGhzKHBhdGhzLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH1cblxuICBfZGlkQ2hhbmdlUGF0aHMocGF0aHM6IEFycmF5PHN0cmluZz4sIGVtcHR5UGF0aHNDYWxsYmFjazogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGNvbnN0IHByZXZQYXRocyA9IHRoaXMuX3ByZXZQYXRocztcbiAgICB0aGlzLl9wcmV2UGF0aHMgPSBwYXRocztcblxuICAgIGNvbnN0IGN1cnJlbnRXcyA9IHRoaXMuX3dvcmtpbmdTZXRzU3RvcmUuZ2V0Q3VycmVudCgpO1xuICAgIGNvbnN0IG5vbmVTaG93biA9ICFwYXRocy5zb21lKHAgPT4gY3VycmVudFdzLmNvbnRhaW5zRGlyKHApKTtcbiAgICBpZiAobm9uZVNob3duKSB7XG4gICAgICBlbXB0eVBhdGhzQ2FsbGJhY2soKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBhZGRlZFBhdGhzID0gcGF0aHMuZmlsdGVyKHAgPT4gcHJldlBhdGhzLmluZGV4T2YocCkgPCAwKTtcbiAgICBjb25zdCBwYXRoQ2hhbmdlV2FzSGlkZGVuID0gYWRkZWRQYXRocy5zb21lKHAgPT4gIWN1cnJlbnRXcy5jb250YWluc0RpcihwKSk7XG5cbiAgICAvLyBUaGUgdXNlciBhZGRlZCBhIG5ldyBwcm9qZWN0IHJvb3QgYW5kIHRoZSBjdXJyZW50bHkgYWN0aXZlIHdvcmtpbmcgc2V0cyBkaWQgbm90IGxldFxuICAgIC8vIGl0IHNob3cuIFRoaXMgd291bGQgZmVlbCBicm9rZW4gLSBiZXR0ZXIgZGVhY3RpdmF0ZSB0aGUgd29ya2luZyBzZXRzLlxuICAgIGlmIChwYXRoQ2hhbmdlV2FzSGlkZGVuKSB7XG4gICAgICBlbXB0eVBhdGhzQ2FsbGJhY2soKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==