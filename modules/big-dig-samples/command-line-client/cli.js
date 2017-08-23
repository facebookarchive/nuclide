'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _yargs;

function _load_yargs() {
  return _yargs = _interopRequireDefault(require('yargs'));
}

var _readline;

function _load_readline() {
  return _readline = require('big-dig/src/common/readline');
}

var _username;

function _load_username() {
  return _username = require('big-dig/src/common/username');
}

var _SshHandshake;

function _load_SshHandshake() {
  return _SshHandshake = require('big-dig/src/client/SshHandshake');
}

var _logging;

function _load_logging() {
  return _logging = require('./logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

(0, (_logging || _load_logging()).setupDefaultLogging)('big-dig-server-cli.log');

const DEFAULT_SSH_PORT = 22;

function parseArgsAndRunMain() {
  const { version } = require('../package.json');
  const { argv } = (_yargs || _load_yargs()).default.usage(`Big Dig sample command line client, version ${version} `).help('h').alias('h', 'help').option('host', {
    describe: 'The host to connect to',
    type: 'string'
  }).option('private-key', {
    describe: 'Path to file that contains your private key',
    type: 'string'
  }).option('remote-server-command', {
    describe: 'Command to launch the server on the host',
    type: 'string'
  });

  const { host, privateKey, remoteServerCommand } = argv;

  return new Promise((resolve, reject) => {
    const sshHandshake = new (_SshHandshake || _load_SshHandshake()).SshHandshake({
      onKeyboardInteractive(name, instructions, instructionsLang, prompts, finish) {
        if (!(prompts.length > 0)) {
          throw new Error('Invariant violation: "prompts.length > 0"');
        }

        const { prompt, echo } = prompts[0];
        (0, (_readline || _load_readline()).question)(prompt, !echo).then(answer => {
          finish([answer]);
        });
      },

      onWillConnect() {
        (0, (_log4js || _load_log4js()).getLogger)().info('Connecting...');
      },

      onDidConnect(connection, config) {
        return (0, _asyncToGenerator.default)(function* () {
          (0, (_log4js || _load_log4js()).getLogger)().info(`Connected to server at: ${connection.getAddress()}`);
          // TODO(mbolin): Do this in a better way that does not interleave
          // with logging output. Maybe a simpler send/response would be a better
          // first sample and there could be a more complex example that uses more
          // of the Observable API.
          connection.onMessage('raw-data').subscribe(function (x) {
            return (0, (_log4js || _load_log4js()).getLogger)().info(x);
          });

          // Once the connection is established, the common pattern is to pass
          // the WebSocketTransport to the business logic that needs to
          // communicate with the server.
          const client = new QuestionClient(connection, resolve);
          client.run();
        })();
      },

      onError(errorType, error, config) {
        (0, (_log4js || _load_log4js()).getLogger)().error('CONNECTION FAILED');

        reject(error);
      }
    });
    sshHandshake.connect({
      host,
      sshPort: DEFAULT_SSH_PORT,
      username: (0, (_username || _load_username()).getUsername)(),
      pathToPrivateKey: privateKey,
      authMethod: 'PRIVATE_KEY',
      remoteServerCommand,
      remoteServerCustomParams: {},
      password: '' });
  });
}

class QuestionClient {

  constructor(connection, exit) {
    this.connection_ = connection;
    this.exit_ = exit;
  }

  run() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const data = yield (0, (_readline || _load_readline()).question)('Input to send to server or "exit" to exit: ',
      /* hideInput */false);

      if (data !== 'exit') {
        _this.connection_.sendMessage('raw-data', data);
        yield _this.run();
      } else {
        _this.exit_();
        _this.connection_.dispose();
      }
    })();
  }
}

parseArgsAndRunMain();