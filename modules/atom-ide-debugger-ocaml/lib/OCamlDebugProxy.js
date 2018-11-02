"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OCamlDebugProxy = exports.PROMPT = void 0;

var _child_process = _interopRequireDefault(require("child_process"));

function _vscodeDebugadapter() {
  const data = require("vscode-debugadapter");

  _vscodeDebugadapter = function () {
    return data;
  };

  return data;
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
const PROMPT = '(ocd) ';
exports.PROMPT = PROMPT;

function stripPrompt(s) {
  return s.substr(0, s.length - PROMPT.length);
}

class OCamlDebugProxy {
  constructor(command, debuggerArguments, programFinishedCallback) {
    this._programFinishedCallback = programFinishedCallback;

    _vscodeDebugadapter().logger.verbose(`Running "${command} ${debuggerArguments.join(' ')}"`);

    this._debuggerProcess = _child_process.default.spawn(command, debuggerArguments);

    this._debuggerProcess.stdout.on('data', data => {
      _vscodeDebugadapter().logger.verbose(`STDOUT:${data.toString()}`);
    });

    this._debuggerProcess.stderr.on('data', data => {
      const dataString = data.toString();

      _vscodeDebugadapter().logger.verbose(`STDERR:${dataString}`);

      if (/^Program not found\.$/m.test(dataString)) {
        _vscodeDebugadapter().logger.error(dataString);

        this._programFinishedCallback({
          kind: 'error',
          message: `Invalid executable path ${command}`
        });
      }
    });
  }

  attachOnPromptListener(onBreak) {
    let buffer = '';

    const onData = data => {
      buffer += data;

      if (buffer.endsWith(PROMPT)) {
        this._debuggerProcess.stdout.removeListener('data', onData);

        onBreak(stripPrompt(buffer));
      }
    };

    this._debuggerProcess.stdout.on('data', onData);

    return () => {
      this._debuggerProcess.stdout.removeListener('data', onData);
    };
  }

  kill() {
    this._debuggerProcess.kill();
  }

  async pause() {
    this._debuggerProcess.kill('SIGINT');

    await this.waitForPrompt();
  }

  async resume() {
    await this.send('run');
  }

  send(command) {
    _vscodeDebugadapter().logger.verbose(`STDIN:${command}`);

    this._debuggerProcess.stdin.write(`${command}\n`);

    return this.waitForPrompt();
  }

  waitForPrompt() {
    return new Promise((resolve, reject) => {
      const dispose = this.attachOnPromptListener(data => {
        if (data.match(/Time: \d+\nProgram exit.\n?$/)) {
          this._programFinishedCallback({
            kind: 'finished'
          });
        }

        dispose();
        resolve(data);
      });
    });
  }

}

exports.OCamlDebugProxy = OCamlDebugProxy;