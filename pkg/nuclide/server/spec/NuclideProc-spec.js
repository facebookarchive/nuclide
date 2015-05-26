'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var NuclideServer = require('../lib/NuclideServer');
var NuclideClient = require('../lib/NuclideClient');
var NuclideRemoteEventbus = require('../lib/NuclideRemoteEventbus');

var server;
var client;

describe('NuclideProc test suite', () => {
  beforeEach(() => {
    jasmine.getEnv().defaultTimeoutInterval = 10000;
    waitsForPromise(async () => {
      server = new NuclideServer({port: 8176});
      await server.connect();
      client = new NuclideClient('test', new NuclideRemoteEventbus('http://localhost:8176'));
    });
  });

  afterEach(() => {
    client.eventbus.socket.close();
    server.close();
  });

  it('can exec a process', () => {
    waitsForPromise(async () => {
      var result = await client.exec('cat', {stdin: 'Hello World!\n'});
      expect(result).toEqual({
        stdout: 'Hello World!\n',
        stderr: '',
        error: null,
      });
    });
  });

  it('gets error on bad exec', () => {
    waitsForPromise(async () => {
      var {error} = await client.exec('A-file-that-doesnt-exist');
      expect(error.code).not.toBe(0);
    });
  });

  it('executes with the CWD default as $HOME', () => {
    waitsForPromise(async () => {
      var {stdout} = await client.exec('echo $PWD');
      expect(stdout).toBe(process.env.HOME + '\n');
    });
  });

  it('executes with the env.PATH set', () => {
    waitsForPromise(async () => {
      var {stdout} = await client.exec('echo $PATH');
      expect(stdout.split(':').length).toBeGreaterThan(1);
    });
  });

});
