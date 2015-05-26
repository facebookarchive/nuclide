'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var fs = require('fs');
var RemoteConnection = require('../lib/RemoteConnection');
var SshHandshake = require('../lib/SshHandshake');
var {EventEmitter} = require('events');
var path = require('path');
var pathToFakePk = path.join(__dirname, 'fakepk');

describe('RemoteConnection', () => {
  var testConnections = RemoteConnection.test.connections;
  var testConnection;
  var testHostname = 'most.fb.com';
  var testPath = '/home/most/www';

  beforeEach(() => {
    fs.writeFileSync(pathToFakePk, '');
    testConnection = {
      getPathForInitialWorkingDirectory: () => testPath,
      getRemoteHostname: () => testHostname,
    };
    testConnections.push(testConnection);
  });

  afterEach(() => {
    testConnections.splice(0);
    if (fs.existsSync(pathToFakePk)) {
      fs.unlink(pathToFakePk);
    }
  });

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
      var config = {pathToPrivateKey: pathToFakePk};

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
      var config = {pathToPrivateKey: pathToFakePk + '.oops'};

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

  describe('getByHostnameAndPath()', () => {
    it('gets a connection if the hostname and path matches', () => {
      var conn = RemoteConnection.getByHostnameAndPath(testHostname, testPath);
      expect(conn).toBe(testConnection);
    });

    it('returns undefined if the path is not matching', () => {
      var conn = RemoteConnection.getByHostnameAndPath(testHostname, '/home/mikeo/www');
      expect(conn).toBeUndefined();
    });

    it('returns undefined if the hostname is not matching', () => {
      var conn = RemoteConnection.getByHostnameAndPath('mikeo.fb.com', testPath);
      expect(conn).toBeUndefined();
    });

    it('returns a connection if given a file path deep into the directory path', () => {
      var conn = RemoteConnection.getByHostnameAndPath(testHostname, testPath + '/def/abc.txt');
      expect(conn).toBe(testConnection);
    });
  });

  describe('getForUri()', () => {
    it('gets a connection if the hostname and path matches', () => {
      var conn = RemoteConnection.getForUri(`nuclide://${testHostname}:8919${testPath}`);
      expect(conn).toBe(testConnection);
    });

    it('returns undefined if the path is not matching', () => {
      var conn = RemoteConnection.getForUri(`nuclide://${testHostname}:9292$/home/mikeo/www`);
      expect(conn).toBeUndefined();
    });

    it('returns undefined if the hostname is not matching', () => {
      var conn = RemoteConnection.getForUri(`nuclide://mikeo.fb.com:9292${testPath}`);
      expect(conn).toBeUndefined();
    });


    it('returns a connection if given a file path deep into the directory path', () => {
      var conn = RemoteConnection.getForUri(`nuclide://${testHostname}:7685${testPath}/def/abc.txt`);
      expect(conn).toBe(testConnection);
    });
  });
});
