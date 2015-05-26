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

var path = require('path');
var pathToTestDir = path.join(__dirname, 'testfiles');
var pathToTestFile = path.join(pathToTestDir, 'testfile.txt');

var server;
var client;

describe('NuclideSearch test suite', () => {
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

  describe('Querying', () => {
    it('should return query results for the given directory', () => {
      waitsForPromise(async () => {
        var results = await client.searchDirectory(pathToTestDir, 'te');
        expect(results.length).toBe(1);
        expect(results[0].path).toBe(path.join(pathToTestDir, 'testfile.txt'));
      });
    });

    it('should return query results for the given directory if it has a hostname', () => {
      waitsForPromise(async () => {
        var results = await client.searchDirectory(`nuclide://some.host.com${pathToTestDir}`, 'te');
        expect(results.length).toBe(1);
        expect(results[0].path).toBe(`nuclide://some.host.com${pathToTestDir}/testfile.txt`);
      });
    });
  });

  describe('Errors', () => {
    it('should throw an error if the directory does not exist', () => {
      waitsForPromise({shouldReject: true}, async () => {
        await client.searchDirectory('not-a-folder', 'query');
      });
    });

    it('should throw an error if the specified path is not a directory', () => {
      waitsForPromise({shouldReject: true}, async () => {
        await client.searchDirectory(pathToTestFile, 'query');
      });
    });
  });
});
