'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _JediServer;

function _load_JediServer() {
  return _JediServer = _interopRequireDefault(require('./JediServer'));
}

var _LinkTreeManager;

function _load_LinkTreeManager() {
  return _LinkTreeManager = _interopRequireDefault(require('./LinkTreeManager'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class JediServerManager {

  constructor() {
    this._linkTreeManager = new (_LinkTreeManager || _load_LinkTreeManager()).default();
    this._sysPathMap = new Map();
  }

  getJediService() {
    if (this._server == null) {
      this._server = new (_JediServer || _load_JediServer()).default();
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
    this._linkTreeManager = new (_LinkTreeManager || _load_LinkTreeManager()).default();
  }
}

exports.default = JediServerManager; /**
                                      * Copyright (c) 2015-present, Facebook, Inc.
                                      * All rights reserved.
                                      *
                                      * This source code is licensed under the license found in the LICENSE file in
                                      * the root directory of this source tree.
                                      *
                                      * 
                                      * @format
                                      */

function getTopLevelModulePath(src) {
  return (_fsPromise || _load_fsPromise()).default.findFurthestFile('__init__.py', (_nuclideUri || _load_nuclideUri()).default.dirname(src), true /* stopOnMissing */
  );
}

async function getCustomSysPath(src) {
  try {
    // $FlowFB
    const fbCustomSysPath = require('./fb/custom-sys-path').default;
    return await fbCustomSysPath(src);
  } catch (err) {
    // Ignore.
  }
  return [];
}