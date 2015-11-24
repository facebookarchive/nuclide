'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const NuclideServer = require('../lib/NuclideServer');
const NuclideClient = require('../lib/NuclideClient');
const NuclideRemoteEventbus = require('../lib/NuclideRemoteEventbus');

const path = require('path');
const pathToTestDir = path.join(__dirname, 'testfiles');
const pathToTestFile = path.join(pathToTestDir, 'testfile.txt');

let server;
let client;

xdescribe('NuclideSearch test suite', () => {
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
        const results = await client.searchDirectory(pathToTestDir, 'te');
        expect(results.length).toBe(1);
        expect(results[0].path).toBe(path.join(pathToTestDir, 'testfile.txt'));
      });
    });

    it('should return query results for the given directory if it has a hostname', () => {
      waitsForPromise(async () => {
        const results = await client.searchDirectory(`nuclide://some.host.com${pathToTestDir}`, 'te');
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
