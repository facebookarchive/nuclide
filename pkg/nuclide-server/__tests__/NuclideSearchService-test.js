"use strict";

function _NuclideServer() {
  const data = _interopRequireDefault(require("../lib/NuclideServer"));

  _NuclideServer = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _servicesConfig() {
  const data = _interopRequireDefault(require("../lib/servicesConfig"));

  _servicesConfig = function () {
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
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
const pathToTestDir = _nuclideUri().default.join(__dirname, 'testfiles');

const pathToTestFile = _nuclideUri().default.join(pathToTestDir, 'testfile.txt');

let server;
let client; // eslint-disable-next-line jasmine/no-disabled-tests

xdescribe('NuclideSearch test suite', () => {
  beforeEach(async () => {
    jasmine.getEnv().defaultTimeoutInterval = 10000;
    server = new (_NuclideServer().default)({
      port: 8176
    }, _servicesConfig().default);
    await server.connect(); // client = new NuclideClient('test', new NuclideRemoteEventbus('http://localhost:8176'));
  });
  afterEach(() => {
    client.eventbus.socket.close();
    server.close();
  });
  describe('Querying', () => {
    it('should return query results for the given directory', async () => {
      const results = await client.searchDirectory(pathToTestDir, 'te');
      expect(results.length).toBe(1);
      expect(results[0].path).toBe(_nuclideUri().default.join(pathToTestDir, 'testfile.txt'));
    });
    it('should return query results for the given directory if it has a hostname', async () => {
      const results = await client.searchDirectory(`nuclide://some.host.com${pathToTestDir}`, 'te');
      expect(results.length).toBe(1);
      expect(results[0].path).toBe(`nuclide://some.host.com${pathToTestDir}/testfile.txt`);
    });
  });
  describe('Errors', () => {
    it('should throw an error if the directory does not exist', async () => {
      await client.searchDirectory('not-a-folder', 'query');
    });
    it('should throw an error if the specified path is not a directory', async () => {
      await client.searchDirectory(pathToTestFile, 'query');
    });
  });
});