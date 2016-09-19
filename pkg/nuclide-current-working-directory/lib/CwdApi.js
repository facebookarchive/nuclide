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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideFileTreeLibFileTreeHelpers2;

function _nuclideFileTreeLibFileTreeHelpers() {
  return _nuclideFileTreeLibFileTreeHelpers2 = _interopRequireDefault(require('../../nuclide-file-tree/lib/FileTreeHelpers'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var CwdApi = (function () {
  function CwdApi(initialCwdPath) {
    var _this = this;

    _classCallCheck(this, CwdApi);

    this._cwdPath$ = new (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).BehaviorSubject(initialCwdPath);
    this._cwd$ = this._cwdPath$
    // Re-check the CWD every time the project paths change.
    // Adding/removing projects can affect the validity of cwdPath.
    .merge((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(function (cb) {
      return atom.project.onDidChangePaths(cb);
    }).mapTo(null)).map(function () {
      return _this.getCwd();
    }).map(function (directory) {
      return isValidDirectory(directory) ? directory : null;
    }).distinctUntilChanged();

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
  }

  _createClass(CwdApi, [{
    key: 'setCwd',
    value: function setCwd(path) {
      if (getDirectory(path) == null) {
        throw new Error('Path does not belong to a project root: ' + path);
      }
      this._cwdPath$.next(path);
    }
  }, {
    key: 'observeCwd',
    value: function observeCwd(callback) {
      var disposable = new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(this._cwd$.subscribe(function (directory) {
        callback(directory);
      }));
      this._disposables.add(disposable);
      return disposable;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: '_getDefaultCwdPath',
    value: function _getDefaultCwdPath() {
      var directory = atom.project.getDirectories()[0];
      return directory == null ? null : directory.getPath();
    }
  }, {
    key: 'getCwd',
    value: function getCwd() {
      return getDirectory(this._cwdPath$.getValue()) || getDirectory(this._getDefaultCwdPath());
    }
  }]);

  return CwdApi;
})();

exports.CwdApi = CwdApi;

function getDirectory(path) {
  if (path == null) {
    return null;
  }
  for (var _directory of atom.project.getDirectories()) {
    var dirPath = _directory.getPath();
    if ((_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.contains(dirPath, path)) {
      var relative = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.relative(dirPath, path);
      return _directory.getSubdirectory(relative);
    }
  }
}

function isValidDirectory(directory) {
  if (directory == null) {
    return true;
  }
  return (_nuclideFileTreeLibFileTreeHelpers2 || _nuclideFileTreeLibFileTreeHelpers()).default.isValidDirectory(directory);
}