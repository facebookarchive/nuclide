'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flagsInfoForPath = flagsInfoForPath;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../modules/nuclide-commons/nuclideUri'));
}

var _BuckClangCompilationDatabase;

function _load_BuckClangCompilationDatabase() {
  return _BuckClangCompilationDatabase = require('../../../nuclide-buck-rpc/lib/BuckClangCompilationDatabase');
}

var _CompilationDatabaseFinder;

function _load_CompilationDatabaseFinder() {
  return _CompilationDatabaseFinder = require('../CompilationDatabaseFinder');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const compilationDbHandler = (0, (_BuckClangCompilationDatabase || _load_BuckClangCompilationDatabase()).getCompilationDatabaseHandler)({
  flavorsForTarget: [],
  args: [],
  useDefaultPlatform: true
});

// First find a compile commands.json nearby, otherwise get it from buck.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

async function flagsInfoForPath(path) {
  const flagsInfo = await flagsInfoFromJson(path);
  if (flagsInfo != null) {
    return flagsInfo;
  }
  return flagsInfoFromBuck(path);
}

async function flagsInfoFromJson(source) {
  const databaseDirectory = await (0, (_CompilationDatabaseFinder || _load_CompilationDatabaseFinder()).findNearestCompilationDbDir)(source);
  if (databaseDirectory != null) {
    return {
      databaseDirectory,
      flagsFile: (_nuclideUri || _load_nuclideUri()).default.join(databaseDirectory, 'compile_commands.json')
    };
  }
}

async function flagsInfoFromBuck(source) {
  const buckDatabase = await compilationDbHandler.getCompilationDatabase(source);
  if (buckDatabase != null) {
    const { file, flagsFile } = buckDatabase;
    if (file != null && flagsFile != null) {
      return { databaseDirectory: (_nuclideUri || _load_nuclideUri()).default.dirname(file), flagsFile };
    }
  }
}