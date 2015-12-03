'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {EventEmitter} = require('events');
const path = require('path');
const pathToFakePk = path.join(__dirname, 'fakepk');
const {clearRequireCache, uncachedRequire} = require('nuclide-test-helpers');
const {SshHandshake} = require('../lib/SshHandshake');

describe('SshHandshake', () => {
  class MockSshConnection extends EventEmitter {
    connect(config) { }
    end() { }
  }

  let dns;
  let originalDnsLookup;
  let handshakeDelegate;

  beforeEach(() => {
    dns = uncachedRequire(require, 'dns');
    originalDnsLookup = dns.lookup;
    dns.lookup = (host, family, callback) => {
      process.nextTick(() => {
        callback(/* error */ null, /* address */ 'example.com');
      });
    };
    handshakeDelegate = jasmine.createSpyObj(
      'delegate',
      ['onKeyboardInteractive', 'onWillConnect', 'onDidConnect', 'onError'],
    );
  });

  afterEach(() => {
    dns.lookup = originalDnsLookup;
    clearRequireCache(require, 'dns');
  });

  describe('connect()', () => {
    it('calls delegates onError when ssh connection fails', () => {
      const mockError = new Error('mock error');
      const sshConnection = new MockSshConnection();
      const sshHandshake = new SshHandshake(handshakeDelegate, sshConnection);
      const config = {pathToPrivateKey: pathToFakePk, authMethod: 'PRIVATE_KEY'};

      sshHandshake.connect(config);
      sshConnection.emit('error', mockError);

      expect(handshakeDelegate.onWillConnect.callCount).toBe(1);
      expect(handshakeDelegate.onError.callCount).toBe(1);
      expect(handshakeDelegate.onError.calls[0].args[0])
        .toBe(SshHandshake.ErrorType.UNKNOWN);
      expect(handshakeDelegate.onError.calls[0].args[1]).toBe(mockError);
      expect(handshakeDelegate.onError.calls[0].args[2]).toBe(config);
    });

    it('calls delegates onError when private key does not exist', () => {
      const sshConnection = new MockSshConnection();
      const sshHandshake = new SshHandshake(handshakeDelegate, sshConnection);
      const config = {pathToPrivateKey: pathToFakePk + '.oops', authMethod: 'PRIVATE_KEY'};

      sshHandshake.connect(config);

      let onErrorCalled = false;

      handshakeDelegate.onError.andCallFake((errorType, e, _config) => {
        expect(errorType).toBe(SshHandshake.ErrorType.CANT_READ_PRIVATE_KEY);
        expect(e.code).toBe('ENOENT');
        expect(_config).toBe(config);
        onErrorCalled = true;
      });

      waitsFor(() => {
        return onErrorCalled;
      });

      runs(() => {
        expect(handshakeDelegate.onError.callCount).toBe(1);
      });
    });
  });

  describe('cancel()', () => {
    it('calls SshConnection.end()', () => {
      const sshConnection = new MockSshConnection();
      const sshHandshake = new SshHandshake(handshakeDelegate, sshConnection);
      const config = {pathToPrivateKey: pathToFakePk};

      spyOn(sshConnection, 'end');

      sshHandshake.connect(config);
      sshHandshake.cancel();

      expect(sshConnection.end.calls.length).toBe(1);
    });
  });
});
