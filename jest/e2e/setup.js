/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @noflow
 * @format
 */
'use strict';

/* eslint nuclide-internal/no-commonjs: 0 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
// eslint-disable-next-line nuclide-internal/consistent-import-name
const {spawnSync} = require('child_process');

const CACHE_DIR = path.join(
  os.tmpdir(),
  'NUCLIDE_E2E_TMP_DIR_WITH_APM_DEPENDENCIES',
);
const NUCLIDE_PKG_JSON_PATH = path.resolve(__dirname, '../../package.json');
const NUCLIDE_PKG_JSON = require(NUCLIDE_PKG_JSON_PATH);
const TAR_PATH = path.resolve(__dirname, '../third_party/apm_deps.tar.gz');
const PACK_SCRIPT_PATH = require.resolve('../../scripts/package_apm_deps.js');
const NUCLIDE_DIR = path.resolve(__dirname, '../..');

const {'package-deps': packageDeps} = NUCLIDE_PKG_JSON;

// Are all packages that listed as dependencies present in the cache dir?
const isCacheValid = () =>
  packageDeps.every(dep => fs.existsSync(path.resolve(CACHE_DIR, dep)));

const buildCache = () => {
  fs.removeSync(CACHE_DIR);
  fs.mkdirpSync(CACHE_DIR);

  let result;
  try {
    result = spawnSync('tar', ['xvf', TAR_PATH, '-C', CACHE_DIR]);

    const {stdout, stderr, status} = result;
    if (status !== 0) {
      // eslint-disable-next-line no-console
      console.error(result);
      throw new Error(`
    tar process exited with non 0 status code
    stdout: ${String(stdout)}
    stderr: ${String(stderr)}
    status: ${status}
    `);
    }
  } catch (error) {
    const {stdout, stderr} = result || {};
    // eslint-disable-next-line no-console
    console.error(result);
    // eslint-disable-next-line no-console
    console.error({stdout: String(stdout), stderr: String(stderr)});
    throw error;
  }
  if (!isCacheValid()) {
    throw new Error(`
Missing dependencies after extracting APM package dependencies to from ${TAR_PATH}
to ${CACHE_DIR}.
Make sure that ${TAR_PATH} contains all dependencies listed in ${NUCLIDE_PKG_JSON_PATH}.
If you need to update the dependencies see: ${PACK_SCRIPT_PATH}
`);
  }
};

// If not, drop everything and recreate the cache
if (!isCacheValid()) {
  buildCache();
}

// Make sure we disable conflicting packages before we start atom.
// The list is taken from the notifications that pop up when you start
// nuclide for the first time.
const CONFIG_CSON = `"*":
  core:
    disabledPackages: [
      "encoding-selector"
      "line-ending-selector"
      "tree-view"
      "image-view"
      "file-icons"
    ]
  "exception-reporting":
    userId: "e3d9fc22-e4f7-4e0a-8949-f13b1584be3d"`;

const CONFIG_CSON_NAME = 'config.cson';

module.exports = async ({atomHome}) => {
  const configCsonPath = path.resolve(atomHome, CONFIG_CSON_NAME);
  fs.writeFileSync(configCsonPath, CONFIG_CSON);

  fs.ensureSymlinkSync(NUCLIDE_DIR, path.join(atomHome, 'packages/nuclide'));

  for (const dep of packageDeps) {
    fs.ensureSymlinkSync(
      path.join(CACHE_DIR, dep),
      path.join(atomHome, 'packages', dep),
    );
  }
};
