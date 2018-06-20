'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

var _which;

function _load_which() {
  return _which = _interopRequireDefault(require('../../../modules/nuclide-commons/which'));
}

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

var _nuclideMarshalersCommon;

function _load_nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon = require('../../nuclide-marshalers-common');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const LIB_PATH = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../VendorLib'); /**
                                                                                               * Copyright (c) 2015-present, Facebook, Inc.
                                                                                               * All rights reserved.
                                                                                               *
                                                                                               * This source code is licensed under the license found in the LICENSE file in
                                                                                               * the root directory of this source tree.
                                                                                               *
                                                                                               *  strict-local
                                                                                               * @format
                                                                                               */

const PROCESS_PATH = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../python/jediserver.py');
const OPTS = {
  cwd: (_nuclideUri || _load_nuclideUri()).default.dirname(PROCESS_PATH),
  stdio: 'pipe',
  detached: false, // When Atom is killed, server process should be killed.
  env: Object.assign({}, process.env, { PYTHONPATH: LIB_PATH }),
  /* TODO(T17353599) */isExitError: () => false
};

let serviceRegistry = null;

function getServiceRegistry() {
  if (serviceRegistry == null) {
    serviceRegistry = new (_nuclideRpc || _load_nuclideRpc()).ServiceRegistry([(_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).localNuclideUriMarshalers], (0, (_nuclideRpc || _load_nuclideRpc()).loadServicesConfig)((_nuclideUri || _load_nuclideUri()).default.join(__dirname, '..')), 'python_language_service');
  }
  return serviceRegistry;
}

async function getServerArgs() {
  let overrides = {};
  try {
    // Override the python path and additional sys paths
    // if override script is present.
    // $FlowFB
    const findJediServerArgs = require('./fb/find-jedi-server-args').default;
    overrides = await findJediServerArgs();
  } catch (e) {}
  // Ignore.


  // Append the user's PYTHONPATH if it exists.
  const { PYTHONPATH } = await (0, (_process || _load_process()).getOriginalEnvironment)();
  if (PYTHONPATH != null && PYTHONPATH.trim() !== '') {
    overrides.paths = (overrides.paths || []).concat((_nuclideUri || _load_nuclideUri()).default.splitPathList(PYTHONPATH));
  }

  // Jedi only parses Python3 files if we start with Python3.
  // It's not the end of the world if Python3 isn't available, though.
  let pythonPath = 'python';
  if (overrides.pythonPath == null) {
    const python3Path = await (0, (_which || _load_which()).default)('python3');
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
    const processStream = _rxjsBundlesRxMinJs.Observable.fromPromise(getServerArgs()).switchMap(({ pythonPath, paths }) => {
      let args = [PROCESS_PATH];
      if (paths.length > 0) {
        args.push('-p');
        args = args.concat(paths);
      }
      return (0, (_process || _load_process()).spawn)(pythonPath, args, OPTS);
    });
    this._process = new (_nuclideRpc || _load_nuclideRpc()).RpcProcess('JediServer', getServiceRegistry(), processStream);
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