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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var canFindFlow = _asyncToGenerator(function* (flowPath) {
  return (yield (0, (_commonsNodeWhich2 || _commonsNodeWhich()).default)(flowPath)) != null;
}

// `string | null` forces the presence of an explicit argument (`?string` allows undefined which
// means the argument can be left off altogether.
);

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lruCache2;

function _lruCache() {
  return _lruCache2 = _interopRequireDefault(require('lru-cache'));
}

var _eventKit2;

function _eventKit() {
  return _eventKit2 = require('event-kit');
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _commonsNodeWhich2;

function _commonsNodeWhich() {
  return _commonsNodeWhich2 = _interopRequireDefault(require('../../commons-node/which'));
}

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

// All the information needed to execute Flow in a given root. The path to the Flow binary we want
// to use may vary per root -- for now, only if we are using the version of Flow from `flow-bin`.
// The options also vary, right now only because they set the cwd to the current Flow root.

var FlowExecInfoContainer = (function () {
  function FlowExecInfoContainer() {
    _classCallCheck(this, FlowExecInfoContainer);

    this._flowConfigDirCache = (0, (_lruCache2 || _lruCache()).default)({
      max: 10,
      maxAge: 1000 * 30 });

    // 30 seconds
    this._flowExecInfoCache = (0, (_lruCache2 || _lruCache()).default)({
      max: 10,
      maxAge: 1000 * 30 });

    // 30 seconds
    this._disposables = new (_eventKit2 || _eventKit()).CompositeDisposable();

    this._observeSettings();
  }

  _createClass(FlowExecInfoContainer, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
      this._flowConfigDirCache.reset();
      this._flowExecInfoCache.reset();
    }

    // Returns null iff Flow cannot be found.
  }, {
    key: 'getFlowExecInfo',
    value: _asyncToGenerator(function* (root) {
      if (!this._flowExecInfoCache.has(root)) {
        var info = yield this._computeFlowExecInfo(root);
        this._flowExecInfoCache.set(root, info);
      }
      return this._flowExecInfoCache.get(root);
    })
  }, {
    key: '_computeFlowExecInfo',
    value: _asyncToGenerator(function* (root) {
      var flowPath = yield this._getPathToFlow(root);
      if (flowPath == null) {
        return null;
      }
      return {
        pathToFlow: flowPath,
        execOptions: getFlowExecOptions(root)
      };
    })

    // Return the path we should use to execute Flow for the given root, or null if Flow cannot be
    // found.
  }, {
    key: '_getPathToFlow',
    value: _asyncToGenerator(function* (root) {
      var flowBinPath = yield this._getFlowBinPath(root);
      if (flowBinPath != null && (yield canFindFlow(flowBinPath))) {
        return flowBinPath;
      }

      // Pull this into a local on the off chance that the setting changes while we are doing the
      // check.
      var systemFlowPath = this._pathToFlow;
      if (yield canFindFlow(systemFlowPath)) {
        return systemFlowPath;
      }

      return null;
    })
  }, {
    key: '_getFlowBinPath',
    value: _asyncToGenerator(function* (root) {
      if (root == null) {
        return null;
      }
      if (!this._canUseFlowBin) {
        return null;
      }
      return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(root, 'node_modules/.bin/flow');
    })
  }, {
    key: 'findFlowConfigDir',
    value: _asyncToGenerator(function* (localFile) {
      if (!this._flowConfigDirCache.has(localFile)) {
        var flowConfigDir = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.findNearestFile('.flowconfig', (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.dirname(localFile));
        this._flowConfigDirCache.set(localFile, flowConfigDir);
      }
      return this._flowConfigDirCache.get(localFile);
    })
  }, {
    key: '_observeSettings',
    value: function _observeSettings() {
      var _this = this;

      if (global.atom == null) {
        this._pathToFlow = 'flow';
        this._canUseFlowBin = false;
      } else {
        // $UPFixMe: This should use nuclide-features-config
        // Does not currently do so because this is an npm module that may run on the server.
        this._disposables.add(atom.config.observe('nuclide.nuclide-flow.pathToFlow', function (path) {
          _this._pathToFlow = path;
          _this._flowExecInfoCache.reset();
        }), atom.config.observe('nuclide.nuclide-flow.canUseFlowBin', function (canUseFlowBin) {
          _this._canUseFlowBin = canUseFlowBin;
          _this._flowExecInfoCache.reset();
        }));
      }
    }
  }]);

  return FlowExecInfoContainer;
})();

exports.FlowExecInfoContainer = FlowExecInfoContainer;
function getFlowExecOptions(root) {
  return {
    cwd: root,
    env: _extends({
      // Allows backtrace to be printed:
      // http://caml.inria.fr/pub/docs/manual-ocaml/runtime.html#sec279
      OCAMLRUNPARAM: 'b'
    }, process.env)
  };
}

// Map from file path to the closest ancestor directory containing a .flowconfig file (the file's
// Flow root)

// Map from Flow root directory (or null for "no root" e.g. files outside of a Flow root, or
// unsaved files. Useful for outline view) to FlowExecInfo. A null value means that the Flow
// binary cannot be found for that root. It is possible for Flow to be available in some roots but
// not others because we will support root-specific installations of flow-bin.
// Put this after so that if the user already has something set for OCAMLRUNPARAM we use
// that instead. They probably know what they're doing.