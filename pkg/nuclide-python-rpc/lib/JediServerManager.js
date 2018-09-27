"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
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

function _JediServer() {
  const data = _interopRequireDefault(require("./JediServer"));

  _JediServer = function () {
    return data;
  };

  return data;
}

function _LinkTreeManager() {
  const data = _interopRequireDefault(require("./LinkTreeManager"));

  _LinkTreeManager = function () {
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
class JediServerManager {
  constructor() {
    this._linkTreeManager = new (_LinkTreeManager().default)();
    this._sysPathMap = new Map();
  }

  getJediService() {
    if (this._server == null) {
      this._server = new (_JediServer().default)();
    }

    return this._server.getService();
  }
  /**
   * It's fine if the syspath changes over time.
   * We'll return partial results while we fetch the actual values.
   */


  getSysPath(src) {
    const cachedSysPath = this._sysPathMap.get(src);

    if (cachedSysPath == null) {
      const sysPath = [];

      this._sysPathMap.set(src, sysPath);

      getTopLevelModulePath(src).then(result => {
        if (result != null) {
          sysPath.push(result);
        }
      });

      this._linkTreeManager.getLinkTreePaths(src).then(result => {
        sysPath.push(...result);
      });

      getCustomSysPath(src).then(result => {
        sysPath.push(...result);
      });
      return sysPath;
    }

    return cachedSysPath;
  }

  reset() {
    if (this._server != null) {
      this._server.dispose();

      this._server = null;
    }

    this._sysPathMap.clear();

    this._linkTreeManager = new (_LinkTreeManager().default)();
  }

}

exports.default = JediServerManager;

function getTopLevelModulePath(src) {
  return _fsPromise().default.findFurthestFile('__init__.py', _nuclideUri().default.dirname(src), true
  /* stopOnMissing */
  );
}

async function getCustomSysPath(src) {
  try {
    // $FlowFB
    const fbCustomSysPath = require("./fb/custom-sys-path").default;

    return await fbCustomSysPath(src);
  } catch (err) {// Ignore.
  }

  return [];
}