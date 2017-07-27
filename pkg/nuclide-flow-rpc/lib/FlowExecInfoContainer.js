'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowExecInfoContainer = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getFlowVersionInformation = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (flowPath, root) {
    try {
      const result = yield (0, (_process || _load_process()).runCommand)(flowPath, ['version', '--json'], root != null ? { cwd: root } : undefined).toPromise();
      const json = JSON.parse(result);
      return {
        flowVersion: json.semver,
        pathToFlow: json.binary
      };
    } catch (e) {
      return null;
    }
  });

  return function getFlowVersionInformation(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let canFindFlow = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (flowPath) {
    if (process.platform === 'win32') {
      // On Windows, if the flow path is configured as a full path rather than just "flow" or
      // "flow.exe", format the path correctly to pass to `where <flow>`
      const dirPath = (_nuclideUri || _load_nuclideUri()).default.dirname(flowPath);
      if (dirPath != null && dirPath !== '' && dirPath !== '.') {
        const whichPath = `${(_nuclideUri || _load_nuclideUri()).default.dirname(flowPath)}:${(_nuclideUri || _load_nuclideUri()).default.basename(flowPath)}`;
        return (yield (0, (_which || _load_which()).default)(whichPath)) != null;
      }
    }

    return (yield (0, (_which || _load_which()).default)(flowPath)) != null;
  });

  return function canFindFlow(_x3) {
    return _ref2.apply(this, arguments);
  };
})();

// `string | null` forces the presence of an explicit argument (`?string` allows undefined which
// means the argument can be left off altogether.


var _lruCache;

function _load_lruCache() {
  return _lruCache = _interopRequireDefault(require('lru-cache'));
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _which;

function _load_which() {
  return _which = _interopRequireDefault(require('nuclide-commons/which'));
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _ConfigCache;

function _load_ConfigCache() {
  return _ConfigCache = require('nuclide-commons/ConfigCache');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const FLOW_BIN_PATH = 'node_modules/.bin/flow';

// All the information needed to execute Flow in a given root. The path to the Flow binary we want
// to use may vary per root -- for now, only if we are using the version of Flow from `flow-bin`.
// The options also vary, right now only because they set the cwd to the current Flow root.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class FlowExecInfoContainer {
  // Map from file path to the closest ancestor directory containing a .flowconfig file (the file's
  // Flow root)
  constructor(versionInfo) {
    this._flowConfigDirCache = new (_ConfigCache || _load_ConfigCache()).ConfigCache(['.flowconfig']);

    this._flowExecInfoCache = (0, (_lruCache || _load_lruCache()).default)({
      max: 10,
      maxAge: 1000 * 30 });

    this._disposables = new (_eventKit || _load_eventKit()).CompositeDisposable();
    this._versionInfo = versionInfo;

    this._observeSettings();
  }

  // Map from Flow root directory (or null for "no root" e.g. files outside of a Flow root, or
  // unsaved files. Useful for outline view) to FlowExecInfo. A null value means that the Flow
  // binary cannot be found for that root. It is possible for Flow to be available in some roots but
  // not others because we will support root-specific installations of flow-bin.


  dispose() {
    this._disposables.dispose();
    this._flowConfigDirCache.dispose();
    this._flowExecInfoCache.reset();
  }

  // Returns null iff Flow cannot be found.
  getFlowExecInfo(root) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!_this._flowExecInfoCache.has(root)) {
        const info = yield _this._computeFlowExecInfo(root);
        _this._flowExecInfoCache.set(root, info);
      }
      return _this._flowExecInfoCache.get(root);
    })();
  }

  reallyGetFlowExecInfo(root) {
    this._flowExecInfoCache.del(root);
    return this.getFlowExecInfo(root);
  }

  _computeFlowExecInfo(root) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let versionInfo;
      if (_this2._versionInfo == null) {
        const flowPath = yield _this2._getPathToFlow(root);
        if (flowPath == null) {
          return null;
        }
        versionInfo = yield getFlowVersionInformation(flowPath, root);
        if (versionInfo == null) {
          return null;
        }
      } else {
        versionInfo = _this2._versionInfo;
      }

      return Object.assign({}, versionInfo, {
        execOptions: getFlowExecOptions(root)
      });
    })();
  }

  // Return the path we should use to execute Flow for the given root, or null if Flow cannot be
  // found.
  _getPathToFlow(root) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const flowBinPath = yield _this3._getFlowBinPath(root);
      if (flowBinPath != null && (yield canFindFlow(flowBinPath))) {
        return flowBinPath;
      }

      // Pull this into a local on the off chance that the setting changes while we are doing the
      // check.
      const systemFlowPath = _this3._pathToFlow;

      // If on Windows, prefer the .cmd wrapper for flow if it's available.
      if (process.platform === 'win32') {
        const cmdPath = systemFlowPath + '.cmd';
        if (yield canFindFlow(systemFlowPath)) {
          return cmdPath;
        }
      }

      if (yield canFindFlow(systemFlowPath)) {
        return systemFlowPath;
      }

      return null;
    })();
  }

  _getFlowBinPath(root) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (root == null) {
        return null;
      }
      if (!_this4._canUseFlowBin) {
        return null;
      }
      // If we are running on Windows, we should use the .cmd version of flow.
      if (process.platform === 'win32') {
        return (_nuclideUri || _load_nuclideUri()).default.join(root, FLOW_BIN_PATH + '.cmd');
      }
      return (_nuclideUri || _load_nuclideUri()).default.join(root, FLOW_BIN_PATH);
    })();
  }

  findFlowConfigDir(localFile) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this5._flowConfigDirCache.getConfigDir(localFile);
    })();
  }

  _observeSettings() {
    if (global.atom == null) {
      this._pathToFlow = 'flow';
      this._canUseFlowBin = false;
    } else {
      // $UPFixMe: This should use nuclide-features-config
      // Does not currently do so because this is an npm module that may run on the server.
      this._disposables.add(atom.config.observe('nuclide.nuclide-flow.pathToFlow', path => {
        this._pathToFlow = path;
        this._flowExecInfoCache.reset();
      }), atom.config.observe('nuclide.nuclide-flow.canUseFlowBin', canUseFlowBin => {
        this._canUseFlowBin = canUseFlowBin;
        this._flowExecInfoCache.reset();
      }));
    }
  }
}

exports.FlowExecInfoContainer = FlowExecInfoContainer;
function getFlowExecOptions(root) {
  return {
    cwd: root,
    env: Object.assign({
      // Allows backtrace to be printed:
      // http://caml.inria.fr/pub/docs/manual-ocaml/runtime.html#sec279
      OCAMLRUNPARAM: 'b'
    }, process.env)
  };
}