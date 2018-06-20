'use strict';

var _NuclideServer;

function _load_NuclideServer() {
  return _NuclideServer = _interopRequireDefault(require('../lib/NuclideServer'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _servicesConfig;

function _load_servicesConfig() {
  return _servicesConfig = _interopRequireDefault(require('../lib/servicesConfig'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const pathToTestDir = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'testfiles'); /**
                                                                                                 * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                 * All rights reserved.
                                                                                                 *
                                                                                                 * This source code is licensed under the license found in the LICENSE file in
                                                                                                 * the root directory of this source tree.
                                                                                                 *
                                                                                                 *  strict-local
                                                                                                 * @format
                                                                                                 */

const pathToTestFile = (_nuclideUri || _load_nuclideUri()).default.join(pathToTestDir, 'testfile.txt');

let server;
let client;

// eslint-disable-next-line jasmine/no-disabled-tests
xdescribe('NuclideSearch test suite', () => {
  beforeEach(async () => {
    jasmine.getEnv().defaultTimeoutInterval = 10000;
    await (async () => {
      server = new (_NuclideServer || _load_NuclideServer()).default({ port: 8176 }, (_servicesConfig || _load_servicesConfig()).default);
      await server.connect();
      // client = new NuclideClient('test', new NuclideRemoteEventbus('http://localhost:8176'));
    })();
  });

  afterEach(() => {
    client.eventbus.socket.close();
    server.close();
  });

  describe('Querying', () => {
    it('should return query results for the given directory', async () => {
      await (async () => {
        const results = await client.searchDirectory(pathToTestDir, 'te');
        expect(results.length).toBe(1);
        expect(results[0].path).toBe((_nuclideUri || _load_nuclideUri()).default.join(pathToTestDir, 'testfile.txt'));
      })();
    });

    it('should return query results for the given directory if it has a hostname', async () => {
      await (async () => {
        const results = await client.searchDirectory(`nuclide://some.host.com${pathToTestDir}`, 'te');
        expect(results.length).toBe(1);
        expect(results[0].path).toBe(`nuclide://some.host.com${pathToTestDir}/testfile.txt`);
      })();
    });
  });

  describe('Errors', () => {
    it('should throw an error if the directory does not exist', async () => {
      await (async () => {
        await client.searchDirectory('not-a-folder', 'query');
      })();
    });

    it('should throw an error if the specified path is not a directory', async () => {
      await (async () => {
        await client.searchDirectory(pathToTestFile, 'query');
      })();
    });
  });
});