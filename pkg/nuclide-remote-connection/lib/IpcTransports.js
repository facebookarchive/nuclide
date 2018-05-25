'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IpcClientTransport = exports.IpcServerTransport = undefined;

var _fs = _interopRequireDefault(require('fs'));

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _promise;

function _load_promise() {
  return _promise = require('../../../modules/nuclide-commons/promise');
}

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const PIPE_FD = 3; /**
                    * Copyright (c) 2015-present, Facebook, Inc.
                    * All rights reserved.
                    *
                    * This source code is licensed under the license found in the LICENSE file in
                    * the root directory of this source tree.
                    *
                    *  strict-local
                    * @format
                    */

class IpcServerTransport {

  constructor() {
    this._transport = new (_nuclideRpc || _load_nuclideRpc()).StreamTransport(_fs.default.createWriteStream('', { fd: PIPE_FD }), _fs.default.createReadStream('', { fd: PIPE_FD }));
  }

  send(message) {
    this._transport.send(message);
  }

  onMessage() {
    return this._transport.onMessage();
  }

  close() {
    this._transport.close();
  }

  isClosed() {
    return this._transport.isClosed();
  }
}

exports.IpcServerTransport = IpcServerTransport;
class IpcClientTransport {

  constructor(processStream) {
    this._transport = new (_promise || _load_promise()).Deferred();
    this._subscription = processStream.do(process => this._transport.resolve(new (_nuclideRpc || _load_nuclideRpc()).StreamTransport(process.stdio[PIPE_FD], process.stdio[PIPE_FD]))).switchMap(process => (0, (_process || _load_process()).getOutputStream)(process)).subscribe({
      error: err => {
        this._handleError(err);
      }
    });
  }

  _handleError(err) {
    this._transport.reject(err);
    (0, (_log4js || _load_log4js()).getLogger)().fatal('Nuclide RPC process crashed', err);
    const buttons = [{
      text: 'Reload Atom',
      className: 'icon icon-zap',
      onDidClick() {
        atom.reload();
      }
    }];
    if (atom.packages.isPackageLoaded('fb-file-a-bug')) {
      buttons.push({
        text: 'File a bug',
        className: 'icon icon-nuclicon-bug',
        onDidClick() {
          atom.commands.dispatch(atom.workspace.getElement(), 'fb-file-a-bug:file');
        }
      });
    }
    let detail;
    if (err instanceof (_process || _load_process()).ProcessExitError) {
      let { stderr } = err;
      if (stderr != null) {
        const lines = stderr.split('\n');
        const startIndex = lines.findIndex(line => line.includes('chrome-devtools://'));
        if (startIndex !== -1) {
          stderr = lines.slice(startIndex + 1).join('\n');
        }
      }
      detail = `Exit code: ${String(err.exitCode)}\nstderr: ${stderr}`;
    } else {
      detail = String(err);
    }
    atom.notifications.addError('Local RPC process crashed!', {
      description: 'The local Nuclide RPC process crashed. Please reload Atom to continue.',
      detail,
      dismissable: true,
      buttons
    });
  }

  send(message) {
    if (!!this.isClosed()) {
      throw new Error('Transport unexpectedly closed');
    }

    this._transport.promise.then(transport => {
      transport.send(message);
    });
  }

  onMessage() {
    return _rxjsBundlesRxMinJs.Observable.fromPromise(this._transport.promise).switchMap(transport => transport.onMessage());
  }

  close() {
    this._subscription.unsubscribe();
    this._transport.reject(Error('Transport closed'));
  }

  isClosed() {
    // $FlowFixMe: Add to rxjs defs
    return this._subscription.closed;
  }
}
exports.IpcClientTransport = IpcClientTransport;