"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flagsInfoForPath = flagsInfoForPath;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _BuckClangCompilationDatabase() {
  const data = require("../../../nuclide-buck-rpc/lib/BuckClangCompilationDatabase");

  _BuckClangCompilationDatabase = function () {
    return data;
  };

  return data;
}

function _CompilationDatabaseFinder() {
  const data = require("../CompilationDatabaseFinder");

  _CompilationDatabaseFinder = function () {
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
 * 
 * @format
 */
const compilationDbHandler = (0, _BuckClangCompilationDatabase().getCompilationDatabaseHandler)({
  flavorsForTarget: [],
  args: [],
  useDefaultPlatform: true
}); // First find a compile commands.json nearby, otherwise get it from buck.

async function flagsInfoForPath(path) {
  const flagsInfo = await flagsInfoFromJson(path);

  if (flagsInfo != null) {
    return flagsInfo;
  }

  return flagsInfoFromBuck(path);
}

async function flagsInfoFromJson(source) {
  const databaseDirectory = await (0, _CompilationDatabaseFinder().findNearestCompilationDbDir)(source);

  if (databaseDirectory != null) {
    return {
      databaseDirectory,
      flagsFile: _nuclideUri().default.join(databaseDirectory, 'compile_commands.json')
    };
  }
}

async function flagsInfoFromBuck(source) {
  const buckDatabase = await compilationDbHandler.getCompilationDatabase(source);

  if (buckDatabase != null) {
    const {
      file,
      flagsFile
    } = buckDatabase;

    if (file != null && flagsFile != null) {
      return {
        databaseDirectory: _nuclideUri().default.dirname(file),
        flagsFile
      };
    }
  }
}