Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

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
        return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isRemote(p) || (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isAbsolute(p);
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