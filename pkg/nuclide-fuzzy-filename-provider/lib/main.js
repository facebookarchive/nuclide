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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideBusySignal2;

function _nuclideBusySignal() {
  return _nuclideBusySignal2 = require('../../nuclide-busy-signal');
}

var _commonsAtomCreatePackage2;

function _commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage2 = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _commonsAtomScheduleIdleCallback2;

function _commonsAtomScheduleIdleCallback() {
  return _commonsAtomScheduleIdleCallback2 = _interopRequireDefault(require('../../commons-atom/scheduleIdleCallback'));
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _FuzzyFileNameProvider2;

function _FuzzyFileNameProvider() {
  return _FuzzyFileNameProvider2 = _interopRequireDefault(require('./FuzzyFileNameProvider'));
}

var _utils2;

function _utils() {
  return _utils2 = require('./utils');
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

var Activation = (function () {
  function Activation() {
    _classCallCheck(this, Activation);

    this._busySignalProvider = new (_nuclideBusySignal2 || _nuclideBusySignal()).BusySignalProviderBase();
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._projectRoots = new Set();
    this._readySearch = this._readySearch.bind(this);

    // Do search preprocessing for all existing and future root directories.
    this._readySearch(atom.project.getPaths());
    this._disposables.add(atom.project.onDidChangePaths(this._readySearch));
  }

  _createClass(Activation, [{
    key: '_readySearch',
    value: function _readySearch(projectPaths) {
      var _this = this;

      var newProjectPaths = new Set(projectPaths);
      // Add new project roots.

      var _loop = function (newProjectPath) {
        if (!_this._projectRoots.has(newProjectPath)) {
          (function () {
            _this._projectRoots.add(newProjectPath);
            // Wait a bit before starting the initial search, since it's a heavy op.
            var disposable = (0, (_commonsAtomScheduleIdleCallback2 || _commonsAtomScheduleIdleCallback()).default)(function () {
              _this._disposables.remove(disposable);
              _this._busySignalProvider.reportBusy('File search: indexing files for project ' + newProjectPath, function () {
                return _this._initialSearch(newProjectPath);
              }).catch(function (err) {
                logger.error('Error starting fuzzy filename search for ' + newProjectPath, err);
                _this._disposeSearch(newProjectPath);
              });
            });
            _this._disposables.add(disposable);
          })();
        }
      };

      for (var newProjectPath of newProjectPaths) {
        _loop(newProjectPath);
      }
      // Clean up removed project roots.
      for (var existingProjectPath of this._projectRoots) {
        if (!newProjectPaths.has(existingProjectPath)) {
          this._disposeSearch(existingProjectPath);
        }
      }
    }
  }, {
    key: '_initialSearch',
    value: _asyncToGenerator(function* (projectPath) {
      var service = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getFuzzyFileSearchServiceByNuclideUri)(projectPath);
      var isAvailable = yield service.isFuzzySearchAvailableFor(projectPath);
      if (isAvailable) {
        // It doesn't matter what the search term is. Empirically, doing an initial
        // search speeds up the next search much more than simply doing the setup
        // kicked off by 'fileSearchForDirectory'.
        yield service.queryFuzzyFile(projectPath, 'a', (0, (_utils2 || _utils()).getIgnoredNames)());
      } else {
        throw new Error('Nonexistent directory');
      }
    })
  }, {
    key: '_disposeSearch',
    value: function _disposeSearch(projectPath) {
      try {
        var service = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getFuzzyFileSearchServiceByNuclideUri)(projectPath);
        service.disposeFuzzySearch(projectPath);
      } catch (err) {
        logger.error('Error disposing fuzzy filename service for ' + projectPath, err);
      } finally {
        this._projectRoots.delete(projectPath);
      }
    }
  }, {
    key: 'registerProvider',
    value: function registerProvider() {
      return (_FuzzyFileNameProvider2 || _FuzzyFileNameProvider()).default;
    }
  }, {
    key: 'provideBusySignal',
    value: function provideBusySignal() {
      return this._busySignalProvider;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return Activation;
})();

exports.default = (0, (_commonsAtomCreatePackage2 || _commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;