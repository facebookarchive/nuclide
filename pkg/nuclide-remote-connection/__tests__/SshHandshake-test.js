"use strict";

var _events = _interopRequireDefault(require("events"));

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _testHelpers() {
  const data = require("../../../modules/nuclide-commons/test-helpers");

  _testHelpers = function () {
    return data;
  };

  return data;
}

function _SshHandshake() {
  const data = require("../lib/SshHandshake");

  _SshHandshake = function () {
    return data;
  };

  return data;
}

function _waits_for() {
  const data = _interopRequireDefault(require("../../../jest/waits_for"));

  _waits_for = function () {
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
 * 
 * @format
 * @emails oncall+nuclide
 */
const pathToFakePk = _nuclideUri().default.join(__dirname, 'fakepk');

describe('SshHandshake', () => {
  class MockSshConnection extends _events.default {
    connect(config) {}

    end() {}

    exec(command, options, callback) {
      return false;
    }

    sftp(callback) {
      return false;
    }

    forwardOut(srcIP, srcPort, dstIP, dstPort, callback) {
      return false;
    }

  }

  let dns;
  let handshakeDelegate;
  beforeEach(() => {
    dns = (0, _testHelpers().uncachedRequire)(require, 'dns');
    jest.spyOn(dns, 'lookup').mockImplementation((host, family, callback) => {
      process.nextTick(() => {
        callback(
        /* error */
        null,
        /* address */
        'example.com',
        /* family */
        4);
      });
    });
    handshakeDelegate = {
      onKeyboardInteractive: jest.fn(),
      onWillConnect: jest.fn(),
      onDidConnect: jest.fn(),
      onError: jest.fn()
    };
  });
  afterEach(() => {
    (0, _testHelpers().clearRequireCache)(require, 'dns');
  });
  describe('connect()', () => {
    it('calls delegates onError when ssh connection fails', () => {
      const mockError = new Error('mock error');
      const sshConnection = new MockSshConnection();
      const sshHandshake = new (_SshHandshake().SshHandshake)(handshakeDelegate, sshConnection);
      const config = {
        pathToPrivateKey: pathToFakePk,
        authMethod: 'PRIVATE_KEY'
      };
      sshHandshake.connect(config);
      sshConnection.emit('error', mockError);
      expect(handshakeDelegate.onWillConnect.mock.calls.length).toBe(1);
      expect(handshakeDelegate.onError.mock.calls.length).toBe(1);
      expect(handshakeDelegate.onError.mock.calls[0][0]).toBe(_SshHandshake().SshHandshake.ErrorType.UNKNOWN);
      expect(handshakeDelegate.onError.mock.calls[0][1]).toBe(mockError);
      expect(handshakeDelegate.onError.mock.calls[0][2]).toBe(config);
    });
    it('calls delegates onError when private key does not exist', async () => {
      const sshConnection = new MockSshConnection();
      const sshHandshake = new (_SshHandshake().SshHandshake)(handshakeDelegate, sshConnection);
      const config = {
        pathToPrivateKey: pathToFakePk + '.oops',
        authMethod: 'PRIVATE_KEY'
      };
      sshHandshake.connect(config);
      let onErrorCalled = false;
      handshakeDelegate.onError.mockImplementation((errorType, e, _config) => {
        expect(errorType).toBe(_SshHandshake().SshHandshake.ErrorType.CANT_READ_PRIVATE_KEY);
        expect(e.code).toBe('ENOENT');
        expect(_config).toBe(config);
        onErrorCalled = true;
      });
      await (0, _waits_for().default)(() => {
        return onErrorCalled;
      });
      expect(handshakeDelegate.onError.mock.calls.length).toBe(1);
    });
    it('retries with a password when authentication fails', () => {
      const mockError = new Error();
      mockError.level = 'client-authentication';
      const sshConnection = new MockSshConnection();
      const sshHandshake = new (_SshHandshake().SshHandshake)(handshakeDelegate, sshConnection);
      const config = {
        host: 'testhost',
        password: 'test',
        authMethod: 'PASSWORD'
      };
      sshHandshake.connect(config);
      sshConnection.config = config;
      sshConnection.emit('error', mockError);
      expect(handshakeDelegate.onWillConnect.mock.calls.length).toBe(1);
      expect(handshakeDelegate.onKeyboardInteractive.mock.calls.length).toBe(1);
      let args = handshakeDelegate.onKeyboardInteractive.mock.calls[0];
      expect(args[3][0].prompt).toContain('password'); // Trigger the input callback.

      jest.spyOn(sshConnection, 'connect').mockImplementation(() => {});
      args[4](['test2']);
      expect(sshConnection.connect.mock.calls.length).toBe(1);
      expect(sshConnection.connect.mock.calls[0][0].host).toBe('testhost');
      expect(sshConnection.connect.mock.calls[0][0].password).toBe('test2');
      sshConnection.emit('error', mockError);
      expect(handshakeDelegate.onKeyboardInteractive.mock.calls.length).toBe(2);
      args = handshakeDelegate.onKeyboardInteractive.mock.calls[1];
      sshHandshake.cancel();
    });
  });
  describe('cancel()', () => {
    it('calls SshConnection.end()', () => {
      const sshConnection = new MockSshConnection();
      const sshHandshake = new (_SshHandshake().SshHandshake)(handshakeDelegate, sshConnection);
      const config = {
        pathToPrivateKey: pathToFakePk
      };
      jest.spyOn(sshConnection, 'end').mockImplementation(() => {});
      sshHandshake.connect(config);
      sshHandshake.cancel();
      expect(sshConnection.end.mock.calls.length).toBe(1);
    });
  });
});