"use strict";

function _which() {
  const data = _interopRequireDefault(require("../which"));

  _which = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
describe('which', () => {
  let runCommand;
  let runCommandReturn = '';
  beforeEach(() => {
    runCommandReturn = '';
    runCommand = jest.spyOn(require("../process"), 'runCommand').mockImplementation(() => _RxMin.Observable.of(runCommandReturn));
  });
  afterEach(() => {
    // $FlowFixMe
    require("../process").runCommand.mockRestore();
  });
  describe('on windows', () => {
    const real_platform = process.platform;
    const eol = '\r\n';

    const os = require('os');

    const real_eol = os.EOL;
    beforeEach(() => {
      Object.defineProperty(process, 'platform', {
        value: 'win32'
      });
      os.EOL = eol;
    });
    afterEach(() => {
      Object.defineProperty(process, 'platform', {
        value: real_platform
      });
      os.EOL = real_eol;
    });
    it('calls where on Windows', () => {
      const param = '';
      (0, _which().default)(param);
      expect(runCommand).toHaveBeenCalledWith('where', [''], {});
    });
    it('returns the first match', async () => {
      runCommandReturn = 'hello' + os.EOL + 'hello.exe' + os.EOL;
      const ret = await (0, _which().default)('bla');
      expect(ret).toEqual('hello');
    });
  });
  describe('on linux', () => {
    const real_platform = process.platform;
    const eol = '\n';

    const os = require('os');

    const real_eol = os.EOL;
    beforeEach(() => {
      Object.defineProperty(process, 'platform', {
        value: 'linux'
      });
      os.EOL = eol;
    });
    afterEach(() => {
      Object.defineProperty(process, 'platform', {
        value: real_platform
      });
      os.EOL = real_eol;
    });
    it('calls which', () => {
      const param = '';
      (0, _which().default)(param);
      expect(runCommand).toHaveBeenCalledWith('which', [param], {});
    });
    it('returns the first match', async () => {
      runCommandReturn = 'hello' + os.EOL + '/bin/hello' + os.EOL;
      const ret = await (0, _which().default)('bla');
      expect(ret).toEqual('hello');
    });
  });
});