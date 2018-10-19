"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNuclideContext = getNuclideContext;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _uuid() {
  const data = _interopRequireDefault(require("uuid"));

  _uuid = function () {
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
 */
const {
  findArcProjectIdAndDirectory,
  getCachedArcProjectIdAndDirectory
} = function () {
  try {
    // $FlowFB
    return require("./fb-arcanist");
  } catch (err) {
    return {};
  }
}();
/**
 * Hacky: consume these services directly.
 * It's rather annoying to have to thread these services through at the callsites.
 */


let workingSetsStore;
let recentFilesService;
atom.packages.serviceHub.consume('working-sets.provider', '0.0.0', store => {
  workingSetsStore = store;
  return new (_UniversalDisposable().default)(() => {
    workingSetsStore = null;
  });
});
atom.packages.serviceHub.consume('nuclide-recent-files-service', '0.0.0', service => {
  recentFilesService = service;
  return new (_UniversalDisposable().default)(() => {
    recentFilesService = null;
  });
});

async function getNuclideContext(rootDirectory) {
  // If we don't have arcanist stuff available, we don't have complete context info.
  if (!findArcProjectIdAndDirectory || !getCachedArcProjectIdAndDirectory) {
    return null;
  }

  const arcInfo = await findArcProjectIdAndDirectory(rootDirectory);

  if (arcInfo == null) {
    return null;
  }

  const {
    directory
  } = arcInfo;
  const open_arc_projects = Array.from(new Set(atom.project.getPaths().map(getCachedArcProjectIdAndDirectory).filter(Boolean).map(x => x.projectId)));
  const working_sets = workingSetsStore == null ? [] : workingSetsStore.getCurrent().getUris().map(uri => {
    if (_nuclideUri().default.contains(directory, uri)) {
      return _nuclideUri().default.relative(directory, uri);
    }
  }).filter(Boolean);
  const RECENT_FILES_LIMIT = 100;
  const recent_files = recentFilesService == null ? [] : (await recentFilesService.getRecentFiles()).map(({
    path,
    timestamp
  }) => {
    if (_nuclideUri().default.contains(directory, path)) {
      return {
        path: _nuclideUri().default.relative(directory, path),
        timestamp: Math.floor(timestamp / 1000)
      };
    }
  }).filter(Boolean).slice(0, RECENT_FILES_LIMIT);
  return {
    session_id: _uuid().default.v4(),
    open_arc_projects,
    working_sets,
    recent_files
  };
}