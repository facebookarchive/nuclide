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
    value: function _didChangePaths(paths) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBhdGhzT2JzZXJ2ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztJQWFhLGFBQWE7QUFLYixXQUxBLGFBQWEsQ0FLWixnQkFBa0MsRUFBRTswQkFMckMsYUFBYTs7QUFNdEIsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQzFDLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQzs7QUFFMUMsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUM5QyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDaEMsQ0FBQztHQUNIOztlQVpVLGFBQWE7O1dBY2pCLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM1Qjs7O1dBRWMseUJBQUMsS0FBb0IsRUFBUTtBQUMxQyxVQUFJLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzs7QUFFN0MsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUNsQyxVQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQzs7QUFFeEIsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ3RELFVBQU0sU0FBUyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUM7ZUFBSSxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztPQUFBLENBQUMsQ0FBQztBQUM3RCxVQUFJLFNBQVMsRUFBRTtBQUNiLFlBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUN2QyxlQUFPO09BQ1I7O0FBRUQsVUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUM7ZUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7T0FBQSxDQUFDLENBQUM7QUFDL0QsVUFBTSxtQkFBbUIsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQztlQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7T0FBQSxDQUFDLENBQUM7Ozs7QUFJNUUsVUFBSSxtQkFBbUIsRUFBRTtBQUN2QixZQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxFQUFFLENBQUM7T0FDeEM7S0FDRjs7O1NBdkNVLGFBQWEiLCJmaWxlIjoiUGF0aHNPYnNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0c1N0b3JlfSBmcm9tICcuL1dvcmtpbmdTZXRzU3RvcmUnO1xuXG5leHBvcnQgY2xhc3MgUGF0aHNPYnNlcnZlciB7XG4gIF9wcmV2UGF0aHM6IEFycmF5PHN0cmluZz47XG4gIF93b3JraW5nU2V0c1N0b3JlOiBXb3JraW5nU2V0c1N0b3JlO1xuICBfZGlzcG9zYWJsZTogSURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3Iod29ya2luZ1NldHNTdG9yZTogV29ya2luZ1NldHNTdG9yZSkge1xuICAgIHRoaXMuX3ByZXZQYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpO1xuICAgIHRoaXMuX3dvcmtpbmdTZXRzU3RvcmUgPSB3b3JraW5nU2V0c1N0b3JlO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZSA9IGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKFxuICAgICAgdGhpcy5fZGlkQ2hhbmdlUGF0aHMuYmluZCh0aGlzKVxuICAgICk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICB9XG5cbiAgX2RpZENoYW5nZVBhdGhzKHBhdGhzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgdGhpcy5fd29ya2luZ1NldHNTdG9yZS51cGRhdGVBcHBsaWNhYmlsaXR5KCk7XG5cbiAgICBjb25zdCBwcmV2UGF0aHMgPSB0aGlzLl9wcmV2UGF0aHM7XG4gICAgdGhpcy5fcHJldlBhdGhzID0gcGF0aHM7XG5cbiAgICBjb25zdCBjdXJyZW50V3MgPSB0aGlzLl93b3JraW5nU2V0c1N0b3JlLmdldEN1cnJlbnQoKTtcbiAgICBjb25zdCBub25lU2hvd24gPSAhcGF0aHMuc29tZShwID0+IGN1cnJlbnRXcy5jb250YWluc0RpcihwKSk7XG4gICAgaWYgKG5vbmVTaG93bikge1xuICAgICAgdGhpcy5fd29ya2luZ1NldHNTdG9yZS5kZWFjdGl2YXRlQWxsKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgYWRkZWRQYXRocyA9IHBhdGhzLmZpbHRlcihwID0+IHByZXZQYXRocy5pbmRleE9mKHApIDwgMCk7XG4gICAgY29uc3QgcGF0aENoYW5nZVdhc0hpZGRlbiA9IGFkZGVkUGF0aHMuc29tZShwID0+ICFjdXJyZW50V3MuY29udGFpbnNEaXIocCkpO1xuXG4gICAgLy8gVGhlIHVzZXIgYWRkZWQgYSBuZXcgcHJvamVjdCByb290IGFuZCB0aGUgY3VycmVudGx5IGFjdGl2ZSB3b3JraW5nIHNldHMgZGlkIG5vdCBsZXRcbiAgICAvLyBpdCBzaG93LiBUaGlzIHdvdWxkIGZlZWwgYnJva2VuIC0gYmV0dGVyIGRlYWN0aXZhdGUgdGhlIHdvcmtpbmcgc2V0cy5cbiAgICBpZiAocGF0aENoYW5nZVdhc0hpZGRlbikge1xuICAgICAgdGhpcy5fd29ya2luZ1NldHNTdG9yZS5kZWFjdGl2YXRlQWxsKCk7XG4gICAgfVxuICB9XG59XG4iXX0=