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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _;

function _load_() {
  return _ = require('..');
}

var _commonsNodeProcess;

function _load_commonsNodeProcess() {
  return _commonsNodeProcess = require('../../commons-node/process');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

/**
 * A generic process wrapper around a stdio-based child process, providing a simple
 * promise-based call API. Commonly used to wrap a python (or any other language)
 * process, making it invokable through JS code.
 *
 * This class can be generalized further (to not require stdin/stdout as the communication method)
 * by having the Transport class injected, which is currently defaulted to StreamTransport.
 *
 * Child Process Implementation Notes:
 * - See Rpc.js for the JSON protocol that the child process implementation must follow.
 * - Note that stdin, stdout, and stderr must be piped, done by node by default.
 *   Don't override the stdio to close off any of these streams in the constructor opts.
 */

var RpcProcess = (function () {

  /**
   * @param name           a name for this server, used to tag log entries
   * @param createProcess  a function to used create the child process when needed,
   *                       both during initialization and on restart
   */

  function RpcProcess(name, serviceRegistry, createProcess) {
    var messageLogger = arguments.length <= 3 || arguments[3] === undefined ? function (direction, message) {
      return;
    } : arguments[3];

    _classCallCheck(this, RpcProcess);

    this._createProcess = createProcess;
    this._messageLogger = messageLogger;
    this._name = name;
    this._serviceRegistry = serviceRegistry;
    this._rpcConnection = null;
    this._disposed = false;
    this._exitCode = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
  }

  _createClass(RpcProcess, [{
    key: 'getName',
    value: function getName() {
      return this._name;
    }
  }, {
    key: 'isDisposed',
    value: function isDisposed() {
      return this._disposed;
    }
  }, {
    key: 'getService',
    value: function getService(serviceName) {
      this._ensureProcess();
      (0, (_assert || _load_assert()).default)(this._rpcConnection != null);
      return this._rpcConnection.getService(serviceName);
    }
  }, {
    key: 'observeExitCode',
    value: function observeExitCode() {
      return this._exitCode.asObservable();
    }

    /**
     * Ensures that the child process is available. Asynchronously creates the child process,
     * only if it is currently null.
     */
  }, {
    key: '_ensureProcess',
    value: function _ensureProcess() {
      var _this = this;

      if (this._process) {
        return;
      }
      try {
        var proc = this._createProcess();
        logger.info(this._name + ' - created child process with PID: ', proc.pid);

        proc.stdin.on('error', function (error) {
          logger.error(_this._name + ' - error writing data: ', error);
        });

        this._rpcConnection = new (_ || _load_()).RpcConnection('client', this._serviceRegistry, new (_ || _load_()).StreamTransport(proc.stdin, proc.stdout, this._messageLogger));
        this._subscription = (0, (_commonsNodeProcess || _load_commonsNodeProcess()).getOutputStream)(proc).subscribe(this._onProcessMessage.bind(this));
        this._process = proc;
      } catch (e) {
        logger.error(this._name + ' - error spawning child process: ', e);
        throw e;
      }
    }

    /**
     * Handles lifecycle messages from stderr, exit, and error streams,
     * responding by logging and staging for process restart.
     */
  }, {
    key: '_onProcessMessage',
    value: function _onProcessMessage(message) {
      switch (message.kind) {
        case 'stdout':
          break;
        case 'stderr':
          logger.warn(this._name + ' - error from stderr received: ', message.data.toString());
          break;
        case 'exit':
          // Log exit code if process exited not as a result of being disposed.
          if (!this._disposed) {
            logger.error(this._name + ' - exited before dispose: ', message.exitCode);
          }
          this.dispose();
          this._exitCode.next(message);
          this._exitCode.complete();
          break;
        case 'error':
          logger.error(this._name + ' - error received: ', message.error.message);
          this.dispose();
          break;
        default:
          // This case should never be reached.
          (0, (_assert || _load_assert()).default)(false, this._name + ' - unknown message received: ' + message);
      }
    }

    /**
     * Cleans up in case of disposal or failure, clearing all pending calls,
     * and killing the child process if necessary.
     */
  }, {
    key: 'dispose',
    value: function dispose() {
      logger.info(this._name + ' - disposing connection.');
      this._disposed = true;

      if (this._subscription != null) {
        // Note that this will kill the process if it is still live.
        this._subscription.unsubscribe();
        this._subscription = null;
      }
      if (this._rpcConnection != null) {
        this._rpcConnection.dispose();
        this._rpcConnection = null;
      }
      // If shouldKill is false, i.e. the process exited outside of this
      // object's control or disposal, the process still needs to be nulled out
      // to indicate that the process needs to be restarted upon the next call.
      this._process = null;
    }
  }]);

  return RpcProcess;
})();

exports.RpcProcess = RpcProcess;