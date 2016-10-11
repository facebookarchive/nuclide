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

var _commonsNodeEvent;

function _load_commonsNodeEvent() {
  return _commonsNodeEvent = require('../../commons-node/event');
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideFileTreeLibFileTreeHelpers;

function _load_nuclideFileTreeLibFileTreeHelpers() {
  return _nuclideFileTreeLibFileTreeHelpers = _interopRequireDefault(require('../../nuclide-file-tree/lib/FileTreeHelpers'));
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var CwdApi = (function () {
  function CwdApi(initialCwdPath) {
    var _this = this;

    _classCallCheck(this, CwdApi);

    this._cwdPath$ = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).BehaviorSubject(initialCwdPath);
    this._cwd$ = this._cwdPath$
    // Re-check the CWD every time the project paths change.
    // Adding/removing projects can affect the validity of cwdPath.
    .merge((0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(function (cb) {
      return atom.project.onDidChangePaths(cb);
    }).mapTo(null)).map(function () {
      return _this.getCwd();
    }).map(function (directory) {
      return isValidDirectory(directory) ? directory : null;
    }).distinctUntilChanged();

    this._disposables = new (_atom || _load_atom()).CompositeDisposable();
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
      var disposable = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(this._cwd$.subscribe(function (directory) {
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
      for (var _directory of atom.project.getDirectories()) {
        if (isValidDirectory(_directory)) {
          return _directory.getPath();
        }
      }
      return null;
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
  for (var _directory2 of atom.project.getDirectories()) {
    if (!isValidDirectory(_directory2)) {
      continue;
    }
    var dirPath = _directory2.getPath();
    if ((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.contains(dirPath, path)) {
      var relative = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.relative(dirPath, path);
      return _directory2.getSubdirectory(relative);
    }
  }
}

function isValidDirectory(directory) {
  if (directory == null) {
    return true;
  }
  return (_nuclideFileTreeLibFileTreeHelpers || _load_nuclideFileTreeLibFileTreeHelpers()).default.isValidDirectory(directory);
}