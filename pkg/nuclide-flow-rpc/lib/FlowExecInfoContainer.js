"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowExecInfoContainer = void 0;

function _lruCache() {
  const data = _interopRequireDefault(require("lru-cache"));

  _lruCache = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _which() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/which"));

  _which = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _ConfigCache() {
  const data = require("../../../modules/nuclide-commons/ConfigCache");

  _ConfigCache = function () {
    return data;
  };

  return data;
}

function _config() {
  const data = require("./config");

  _config = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const FLOW_BIN_PATH = 'node_modules/.bin/flow';

class FlowExecInfoContainer {
  // Map from file path to the closest ancestor directory containing a .flowconfig file (the file's
  // Flow root)
  // Map from Flow root directory (or null for "no root" e.g. files outside of a Flow root, or
  // unsaved files. Useful for outline view) to FlowExecInfo. A null value means that the Flow
  // binary cannot be found for that root. It is possible for Flow to be available in some roots but
  // not others because we will support root-specific installations of flow-bin.
  constructor(versionInfo) {
    this._flowConfigDirCache = new (_ConfigCache().ConfigCache)(['.flowconfig']);
    this._flowExecInfoCache = (0, _lruCache().default)({
      max: 10,
      maxAge: 1000 * 30 // 30 seconds

    });
    this._disposables = new (_UniversalDisposable().default)();
    this._versionInfo = versionInfo;
    this._canUseFlowBin = Boolean((0, _config().getConfig)('canUseFlowBin'));
    this._pathToFlow = (0, _config().getConfig)('pathToFlow');
  }

  dispose() {
    this._disposables.dispose();

    this._flowConfigDirCache.dispose();

    this._flowExecInfoCache.reset();
  } // Returns null iff Flow cannot be found.


  getFlowExecInfo(root) {
    let info = this._flowExecInfoCache.get(root);

    if (info == null) {
      info = this._computeFlowExecInfo(root);

      this._flowExecInfoCache.set(root, info);
    }

    return info;
  }

  reallyGetFlowExecInfo(root) {
    this._flowExecInfoCache.del(root);

    return this.getFlowExecInfo(root);
  }

  async _computeFlowExecInfo(root) {
    let versionInfo;

    if (this._versionInfo == null) {
      const flowPath = await this._getPathToFlow(root);

      if (flowPath == null) {
        return null;
      }

      versionInfo = await getFlowVersionInformation(flowPath, root);

      if (versionInfo == null) {
        return null;
      }
    } else {
      versionInfo = this._versionInfo;
    }

    return Object.assign({}, versionInfo, {
      execOptions: getFlowExecOptions(root)
    });
  } // Return the path we should use to execute Flow for the given root, or null if Flow cannot be
  // found.


  async _getPathToFlow(root) {
    const flowBinPath = await this._getFlowBinPath(root);

    if (flowBinPath != null && (await canFindFlow(flowBinPath))) {
      return flowBinPath;
    } // Pull this into a local on the off chance that the setting changes while we are doing the
    // check.


    const systemFlowPath = this._pathToFlow; // If on Windows, prefer the .cmd wrapper for flow if it's available.

    if (process.platform === 'win32') {
      const cmdPath = systemFlowPath + '.cmd';

      if (await canFindFlow(systemFlowPath)) {
        return cmdPath;
      }
    }

    if (await canFindFlow(systemFlowPath)) {
      return systemFlowPath;
    }

    return null;
  }

  async _getFlowBinPath(root) {
    if (root == null) {
      return null;
    }

    if (!this._canUseFlowBin) {
      return null;
    } // If we are running on Windows, we should use the .cmd version of flow.


    if (process.platform === 'win32') {
      return _nuclideUri().default.join(root, FLOW_BIN_PATH + '.cmd');
    }

    return _nuclideUri().default.join(root, FLOW_BIN_PATH);
  }

  async findFlowConfigDir(localFile) {
    return this._flowConfigDirCache.getConfigDir(localFile);
  }

}

exports.FlowExecInfoContainer = FlowExecInfoContainer;

async function getFlowVersionInformation(flowPath, root) {
  try {
    const result = await (0, _process().runCommand)(flowPath, ['version', '--json'], root != null ? {
      cwd: root
    } : undefined).toPromise();
    const json = JSON.parse(result);
    return {
      flowVersion: json.semver,
      pathToFlow: json.binary
    };
  } catch (e) {
    return null;
  }
}

async function canFindFlow(flowPath) {
  if (process.platform === 'win32') {
    // On Windows, if the flow path is configured as a full path rather than just "flow" or
    // "flow.exe", format the path correctly to pass to `where <flow>`
    const dirPath = _nuclideUri().default.dirname(flowPath);

    if (dirPath != null && dirPath !== '' && dirPath !== '.') {
      return (await (0, _which().default)(flowPath)) != null;
    }
  }

  return (await (0, _which().default)(flowPath)) != null;
} // `string | null` forces the presence of an explicit argument (`?string` allows undefined which
// means the argument can be left off altogether.


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