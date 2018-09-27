"use strict";

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function RsyncService() {
  const data = _interopRequireWildcard(require("../lib/RsyncService"));

  RsyncService = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
 * @emails oncall+jackalope
 */
const testDir = _nuclideUri().default.join(__dirname, '../__mocks__/testdir');

describe('RsyncService', () => {
  describe('startDaemon', () => {
    it('Starts a daemon process and returns version / port number.', async () => {
      const startMessage = await RsyncService().startDaemon(testDir).refCount().first().toPromise();
      expect(typeof startMessage.port === 'number').toBe(true);
      expect(typeof startMessage.version === 'string').toBe(true);
    });
  });
  describe('getVersion', () => {
    it('Returns the CLI and protocol version.', async () => {
      const version = await RsyncService().getVersion();
      expect(typeof version.rsyncVersion === 'string').toBe(true);
      expect(typeof version.protocolVersion === 'number').toBe(true);
    });
  });
  describe('syncFolder', () => {
    it('Syncs a folder using the rsync daemon.', async () => {
      const targetDir = await _fsPromise().default.tempdir();
      await RsyncService().startDaemon(testDir).refCount().switchMap(({
        port
      }) => {
        return RsyncService().syncFolder(`rsync://localhost:${port}/files/`, targetDir).refCount().materialize();
      }) // $FlowFixMe dematerialize
      .dematerialize().toPromise();
      await (0, _process().observeProcess)('diff', ['-r', testDir, targetDir]).toPromise();
    });
  });
});