'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getServerArgs = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (src) {
    let overrides = {};
    try {
      // Override the python path and additional sys paths
      // if override script is present.
      // $FlowFB
      const findJediServerArgs = require('./fb/find-jedi-server-args').default;
      overrides = yield findJediServerArgs(src);
    } catch (e) {}
    // Ignore.


    // Append the user's PYTHONPATH if it exists.
    const { PYTHONPATH } = yield (0, (_process || _load_process()).getOriginalEnvironment)();
    if (PYTHONPATH != null && PYTHONPATH.trim() !== '') {
      overrides.paths = (overrides.paths || []).concat((_nuclideUri || _load_nuclideUri()).default.splitPathList(PYTHONPATH));
    }

    return Object.assign({
      // Default to assuming that python is in system PATH.
      pythonPath: 'python',
      paths: []
    }, overrides);
  });

  return function getServerArgs(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
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

const LIB_PATH = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../VendorLib');
const PROCESS_PATH = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../python/jediserver.py');
const OPTS = {
  cwd: (_nuclideUri || _load_nuclideUri()).default.dirname(PROCESS_PATH),
  stdio: 'pipe',
  detached: false, // When Atom is killed, server process should be killed.
  env: { PYTHONPATH: LIB_PATH },
  /* TODO(T17353599) */isExitError: () => false
};

let serviceRegistry = null;

function getServiceRegistry() {
  if (serviceRegistry == null) {
    serviceRegistry = new (_nuclideRpc || _load_nuclideRpc()).ServiceRegistry([(_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).localNuclideUriMarshalers], (0, (_nuclideRpc || _load_nuclideRpc()).loadServicesConfig)((_nuclideUri || _load_nuclideUri()).default.join(__dirname, '..')), 'python_language_service');
  }
  return serviceRegistry;
}

class JediServer {

  constructor(src) {
    // Generate a name for this server using the src file name, used to namespace logs
    const name = `JediServer-${(_nuclideUri || _load_nuclideUri()).default.basename(src)}`;
    const processStream = _rxjsBundlesRxMinJs.Observable.fromPromise(getServerArgs(src)).switchMap(({ pythonPath, paths }) => {
      let args = [PROCESS_PATH, '-s', src];
      if (paths.length > 0) {
        args.push('-p');
        args = args.concat(paths);
      }
      return (0, (_process || _load_process()).spawn)(pythonPath, args, OPTS);
    });
    this._process = new (_nuclideRpc || _load_nuclideRpc()).RpcProcess(name, getServiceRegistry(), processStream);
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