'use strict';

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _testHelpers;

function _load_testHelpers() {
  return _testHelpers = require('../../../modules/nuclide-commons/test-helpers');
}

var _AutoImportsWorker;

function _load_AutoImportsWorker() {
  return _AutoImportsWorker = require('../src/lib/AutoImportsWorker');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _fileIndex;

function _load_fileIndex() {
  return _fileIndex = require('../src/lib/file-index');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const hasteSettings = {
  isHaste: false,
  useNameReducers: false,
  nameReducers: [],
  nameReducerWhitelist: [],
  nameReducerBlacklist: []
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */

// jest.unmock('log4js');

const configFromFlow = {
  moduleDirs: [],
  hasteSettings
};

describe('AutoImportsWorker', () => {
  let fileIndex;
  const dirPath = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures');
  beforeEach(async () => {
    await (async () => {
      fileIndex = await (0, (_fileIndex || _load_fileIndex()).getFileIndex)(dirPath, configFromFlow);
    })();
  });

  it('Should index imports in a directory asynchronously', async () => {
    await (async () => {
      const ids = await (0, (_AutoImportsWorker || _load_AutoImportsWorker()).indexDirectory)(fileIndex, hasteSettings).concatAll().concatMap(update => update.exports).map(jsExport => jsExport.id).toArray().toPromise();

      expect(ids.sort()).toEqual(['FooBarClass', 'MyFakeClassForTesting', 'MyFakeTypeForTesting', 'SomeType']);
    })();
  });
});

describe('AutoImportsWorker main files indexer', () => {
  // Create fixtures for these tests.
  let dirPath = null;
  let fileIndex;
  beforeEach(async () => {
    await (async () => {
      dirPath = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('main_tests', new Map([['some_package/package.json', '{"main": "./lib/main.js"}'], ['some_package/lib/main.js', 'export class SomeTestClass {}'], ['some_package/lib/someOtherFile.js', 'export class Something {}'], ['another_package/package.json', 'this isnt valid json'], ['complicated_package/modules/lib/tools/package.json', '{"main": "../../main.js"}'], ['complicated_package/modules/main.js', 'export type SomeType = string'], ['package_with_main_without_extension/package.json', '{"main": "./main"}'], ['package_with_main_without_extension/main.js', 'export class AnotherClass {}'], ['package_json_without_main/package.json', '{"name": "package"}'], ['package_json_without_main/index.js', 'export class Test{}']]));
      fileIndex = await (0, (_fileIndex || _load_fileIndex()).getFileIndex)(dirPath, configFromFlow);
    })();
  });

  it('Should correctly mark files as main', async () => {
    await (async () => {
      const exports = await (0, (_AutoImportsWorker || _load_AutoImportsWorker()).indexDirectory)(fileIndex, hasteSettings).concatAll().concatMap(update => update.exports).toArray().toPromise();

      const exportById = new Map(exports.map(exp => [exp.id, exp.directoryForMainFile]));
      expect(exportById.get('SomeTestClass')).toBe((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'some_package'));
      expect(exportById.has('Something')).toBeTruthy();
      expect(exportById.get('Something')).toBe(undefined);
      expect(exportById.get('SomeType')).toBe(undefined);
      expect(exportById.get('AnotherClass')).toBe((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'package_with_main_without_extension'));
      expect(exportById.get('Test')).toBe((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'package_json_without_main'));
    })();
  });
});

describe('AutoImportsWorker node_modules indexer', () => {
  let dirPath = null;
  let fileIndex;
  beforeEach(async () => {
    await (async () => {
      dirPath = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('main_tests', new Map([['node_modules/log4js/package.json', '{"main": "./lib/log4js.js"}'], ['node_modules/log4js/lib/log4js.js', 'module.exports = {getLogger: () => {}}'], ['node_modules/left-pad/package.json', '{"main": "./lib"}'], ['node_modules/left-pad/lib/index.js', 'module.exports = {};']]));
      // Deliberately sabotage spawn() to exercise the glob indexer.
      const spawnSpy = jest.spyOn(require('../../../modules/nuclide-commons/process'), 'spawn').mockReturnValue(_rxjsBundlesRxMinJs.Observable.throw());
      fileIndex = await (0, (_fileIndex || _load_fileIndex()).getFileIndex)(dirPath, configFromFlow);
      expect(spawnSpy).toHaveBeenCalled();
    })();
  });

  it('Should index node_modules correctly', async () => {
    await (async () => {
      const files = await (0, (_AutoImportsWorker || _load_AutoImportsWorker()).indexNodeModules)(fileIndex).concatAll().map(data => data && data.file).toArray().toPromise();
      files.sort();
      expect(files).toEqual([require.resolve((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'node_modules/left-pad/lib/index.js')), require.resolve((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'node_modules/log4js/lib/log4js.js'))]);
    })();
  });
});