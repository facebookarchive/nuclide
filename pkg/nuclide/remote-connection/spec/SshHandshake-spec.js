'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {EventEmitter} = require('events');
var path = require('path');
var pathToFakePk = path.join(__dirname, 'fakepk');
var SshHandshake = require('../lib/SshHandshake');

describe('SshHandshake', () => {
  class MockSshConnection extends EventEmitter {
    connect(config) { }
    end() { }
  }

  describe('connect()', () => {
    it('calls delegates onError when ssh connection fails', () => {
      var mockError = new Error('mock error');
      var handshakeDelegate = jasmine.createSpyObj('delegate', ['onError']);
      var sshConnection = new MockSshConnection();
      var sshHandshake = new SshHandshake(handshakeDelegate, sshConnection);
      var config = {pathToPrivateKey: pathToFakePk, authMethod: 'PRIVATE_KEY'};

      sshHandshake.connect(config);
      sshConnection.emit('error', mockError);

      expect(handshakeDelegate.onError.callCount).toBe(1);
      expect(handshakeDelegate.onError.calls[0].args[0]).toBe(mockError);
      expect(handshakeDelegate.onError.calls[0].args[1]).toBe(config);
    });

    it('calls delegates onError when private key does not exist', () => {
      var handshakeDelegate = jasmine.createSpyObj('delegate', ['onError']);
      var sshConnection = new MockSshConnection();
      var sshHandshake = new SshHandshake(handshakeDelegate, sshConnection);
      var config = {pathToPrivateKey: pathToFakePk + '.oops', authMethod: 'PRIVATE_KEY'};

      sshHandshake.connect(config);

      var onErrorCalled = false;

      handshakeDelegate.onError.andCallFake((e, _config) => {
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
      var sshConnection = new MockSshConnection();
      var sshHandshake = new SshHandshake({}, sshConnection);
      var config = {pathToPrivateKey: pathToFakePk};

      spyOn(sshConnection, 'end');

      sshHandshake.connect(config);
      sshHandshake.cancel();

      expect(sshConnection.end.calls.length).toBe(1);
    });
  });
});
