"use strict";

function _PtyService() {
  const data = require("../lib/pty-service/PtyService");

  _PtyService = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
describe('PtyService', () => {
  describe('spawn', () => {
    let ptyInfo;
    let runner;
    beforeEach(() => {
      ptyInfo = {
        terminalType: 'xterm',
        command: {
          file: '',
          args: []
        }
      };
      runner = new LocalRunner();
    });
    it('adds numbers in bash', async () => {
      if (!(ptyInfo.command != null)) {
        throw new Error("Invariant violation: \"ptyInfo.command != null\"");
      }

      ptyInfo.command.file = '/bin/bash';
      ptyInfo.command.args = ['--norc', '-c', 'echo $((1 + 1))'];
      await (0, _PtyService().spawn)(ptyInfo, runner);
      const result = await runner.promise;
      expect(result.output.trim()).toBe('2');
      expect(result.code).toBe(0);
    });
  });
});

class LocalRunner {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
    });
    this._output = '';
  }

  onOutput(data) {
    this._output += data;
  }

  onExit(code, signal) {
    this._resolve({
      output: this._output,
      code,
      signal
    });
  }

  dispose() {}

}