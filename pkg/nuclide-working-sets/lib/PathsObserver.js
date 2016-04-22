Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var PathsObserver = (function () {
  function PathsObserver(workingSetsStore) {
    _classCallCheck(this, PathsObserver);

    this._prevPaths = atom.project.getPaths();
    this._workingSetsStore = workingSetsStore;

    this._disposable = atom.project.onDidChangePaths(this._didChangePaths.bind(this));
  }

  _createClass(PathsObserver, [{
    key: 'dispose',
    value: function dispose() {
      this._disposable.dispose();
    }
  }, {
    key: '_didChangePaths',
    value: function _didChangePaths(_paths) {
      var paths = _paths.filter(function (p) {
        return (0, _nuclideRemoteUri.isRemote)(p) || _path2['default'].isAbsolute(p);
      });
      this._workingSetsStore.updateApplicability();

      var prevPaths = this._prevPaths;
      this._prevPaths = paths;

      var currentWs = this._workingSetsStore.getCurrent();
      var noneShown = !paths.some(function (p) {
        return currentWs.containsDir(p);
      });
      if (noneShown) {
        this._workingSetsStore.deactivateAll();
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
        this._workingSetsStore.deactivateAll();
      }
    }
  }]);

  return PathsObserver;
})();

exports.PathsObserver = PathsObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBhdGhzT2JzZXJ2ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O2dDQVd1QiwwQkFBMEI7O29CQUNoQyxNQUFNOzs7O0lBSVYsYUFBYTtBQUtiLFdBTEEsYUFBYSxDQUtaLGdCQUFrQyxFQUFFOzBCQUxyQyxhQUFhOztBQU10QixRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDMUMsUUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDOztBQUUxQyxRQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQzlDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUNoQyxDQUFDO0dBQ0g7O2VBWlUsYUFBYTs7V0FjakIsbUJBQVM7QUFDZCxVQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzVCOzs7V0FFYyx5QkFBQyxNQUFxQixFQUFRO0FBQzNDLFVBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDO2VBQUksZ0NBQVMsQ0FBQyxDQUFDLElBQUksa0JBQUssVUFBVSxDQUFDLENBQUMsQ0FBQztPQUFBLENBQUMsQ0FBQztBQUNwRSxVQUFJLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzs7QUFFN0MsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUNsQyxVQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQzs7QUFFeEIsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ3RELFVBQU0sU0FBUyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUM7ZUFBSSxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztPQUFBLENBQUMsQ0FBQztBQUM3RCxVQUFJLFNBQVMsRUFBRTtBQUNiLFlBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUN2QyxlQUFPO09BQ1I7O0FBRUQsVUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUM7ZUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7T0FBQSxDQUFDLENBQUM7QUFDL0QsVUFBTSxtQkFBbUIsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQztlQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7T0FBQSxDQUFDLENBQUM7Ozs7QUFJNUUsVUFBSSxtQkFBbUIsRUFBRTtBQUN2QixZQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxFQUFFLENBQUM7T0FDeEM7S0FDRjs7O1NBeENVLGFBQWEiLCJmaWxlIjoiUGF0aHNPYnNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7aXNSZW1vdGV9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IHR5cGUge1dvcmtpbmdTZXRzU3RvcmV9IGZyb20gJy4vV29ya2luZ1NldHNTdG9yZSc7XG5cbmV4cG9ydCBjbGFzcyBQYXRoc09ic2VydmVyIHtcbiAgX3ByZXZQYXRoczogQXJyYXk8c3RyaW5nPjtcbiAgX3dvcmtpbmdTZXRzU3RvcmU6IFdvcmtpbmdTZXRzU3RvcmU7XG4gIF9kaXNwb3NhYmxlOiBJRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3Rvcih3b3JraW5nU2V0c1N0b3JlOiBXb3JraW5nU2V0c1N0b3JlKSB7XG4gICAgdGhpcy5fcHJldlBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCk7XG4gICAgdGhpcy5fd29ya2luZ1NldHNTdG9yZSA9IHdvcmtpbmdTZXRzU3RvcmU7XG5cbiAgICB0aGlzLl9kaXNwb3NhYmxlID0gYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMoXG4gICAgICB0aGlzLl9kaWRDaGFuZ2VQYXRocy5iaW5kKHRoaXMpXG4gICAgKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gIH1cblxuICBfZGlkQ2hhbmdlUGF0aHMoX3BhdGhzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgY29uc3QgcGF0aHMgPSBfcGF0aHMuZmlsdGVyKHAgPT4gaXNSZW1vdGUocCkgfHwgcGF0aC5pc0Fic29sdXRlKHApKTtcbiAgICB0aGlzLl93b3JraW5nU2V0c1N0b3JlLnVwZGF0ZUFwcGxpY2FiaWxpdHkoKTtcblxuICAgIGNvbnN0IHByZXZQYXRocyA9IHRoaXMuX3ByZXZQYXRocztcbiAgICB0aGlzLl9wcmV2UGF0aHMgPSBwYXRocztcblxuICAgIGNvbnN0IGN1cnJlbnRXcyA9IHRoaXMuX3dvcmtpbmdTZXRzU3RvcmUuZ2V0Q3VycmVudCgpO1xuICAgIGNvbnN0IG5vbmVTaG93biA9ICFwYXRocy5zb21lKHAgPT4gY3VycmVudFdzLmNvbnRhaW5zRGlyKHApKTtcbiAgICBpZiAobm9uZVNob3duKSB7XG4gICAgICB0aGlzLl93b3JraW5nU2V0c1N0b3JlLmRlYWN0aXZhdGVBbGwoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBhZGRlZFBhdGhzID0gcGF0aHMuZmlsdGVyKHAgPT4gcHJldlBhdGhzLmluZGV4T2YocCkgPCAwKTtcbiAgICBjb25zdCBwYXRoQ2hhbmdlV2FzSGlkZGVuID0gYWRkZWRQYXRocy5zb21lKHAgPT4gIWN1cnJlbnRXcy5jb250YWluc0RpcihwKSk7XG5cbiAgICAvLyBUaGUgdXNlciBhZGRlZCBhIG5ldyBwcm9qZWN0IHJvb3QgYW5kIHRoZSBjdXJyZW50bHkgYWN0aXZlIHdvcmtpbmcgc2V0cyBkaWQgbm90IGxldFxuICAgIC8vIGl0IHNob3cuIFRoaXMgd291bGQgZmVlbCBicm9rZW4gLSBiZXR0ZXIgZGVhY3RpdmF0ZSB0aGUgd29ya2luZyBzZXRzLlxuICAgIGlmIChwYXRoQ2hhbmdlV2FzSGlkZGVuKSB7XG4gICAgICB0aGlzLl93b3JraW5nU2V0c1N0b3JlLmRlYWN0aXZhdGVBbGwoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==