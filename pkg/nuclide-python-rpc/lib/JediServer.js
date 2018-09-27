"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
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

function _which() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/which"));

  _which = function () {
    return data;
  };

  return data;
}

function _nuclideRpc() {
  const data = require("../../nuclide-rpc");

  _nuclideRpc = function () {
    return data;
  };

  return data;
}

function _nuclideMarshalersCommon() {
  const data = require("../../nuclide-marshalers-common");

  _nuclideMarshalersCommon = function () {
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
 *  strict-local
 * @format
 */
const LIB_PATH = _nuclideUri().default.join(__dirname, '../VendorLib');

const PROCESS_PATH = _nuclideUri().default.join(__dirname, '../python/jediserver.py');

const OPTS = {
  cwd: _nuclideUri().default.dirname(PROCESS_PATH),
  stdio: 'pipe',
  detached: false,
  // When Atom is killed, server process should be killed.
  env: Object.assign({}, process.env, {
    PYTHONPATH: LIB_PATH
  }),

  /* TODO(T17353599) */
  isExitError: () => false
};
let serviceRegistry = null;

function getServiceRegistry() {
  if (serviceRegistry == null) {
    serviceRegistry = new (_nuclideRpc().ServiceRegistry)([_nuclideMarshalersCommon().localNuclideUriMarshalers], (0, _nuclideRpc().loadServicesConfig)(_nuclideUri().default.join(__dirname, '..')), 'python_language_service');
  }

  return serviceRegistry;
}

async function getServerArgs() {
  let overrides = {};

  try {
    // Override the python path and additional sys paths
    // if override script is present.
    // $FlowFB
    const findJediServerArgs = require("./fb/find-jedi-server-args").default;

    overrides = await findJediServerArgs();
  } catch (e) {} // Ignore.
  // Append the user's PYTHONPATH if it exists.


  const {
    PYTHONPATH
  } = await (0, _process().getOriginalEnvironment)();

  if (PYTHONPATH != null && PYTHONPATH.trim() !== '') {
    overrides.paths = (overrides.paths || []).concat(_nuclideUri().default.splitPathList(PYTHONPATH));
  } // Jedi only parses Python3 files if we start with Python3.
  // It's not the end of the world if Python3 isn't available, though.


  let pythonPath = 'python';

  if (overrides.pythonPath == null) {
    const python3Path = await (0, _which().default)('python3');

    if (python3Path != null) {
      pythonPath = python3Path;
    }
  }

  return Object.assign({
    // Default to assuming that python is in system PATH.
    pythonPath,
    paths: []
  }, overrides);
}

class JediServer {
  constructor() {
    const processStream = _RxMin.Observable.fromPromise(getServerArgs()).switchMap(({
      pythonPath,
      paths
    }) => {
      let args = [PROCESS_PATH];

      if (paths.length > 0) {
        args.push('-p');
        args = args.concat(paths);
      }

      return (0, _process().spawn)(pythonPath, args, OPTS);
    });

    this._process = new (_nuclideRpc().RpcProcess)('JediServer', getServiceRegistry(), processStream);
    this._isDisposed = false;
  }

  getService() {
    if (!!this._isDisposed) {
      throw new Error('getService called on disposed JediServer');
    }

    return this._process.getService('JediService');
  }

  isDisposed() {
    return this._isDisposed;
  }

  dispose() {
    this._isDisposed = true;

    this._process.dispose();
  }

}

exports.default = JediServer;