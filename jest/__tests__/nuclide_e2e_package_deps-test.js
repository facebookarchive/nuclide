/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 * @emails oncall+nuclide
 */

/* eslint-disable nuclide-internal/consistent-import-name */

import {execSync} from 'child_process';
import path from 'path';

const THIRD_PARTY_DIR = path.resolve(__dirname, '../third_party');
const TAR_PATH = path.join(THIRD_PARTY_DIR, 'apm_deps.tar.gz');

const NUCLIDE_PACKAGE_JSON = path.resolve(__dirname, '../../package.json');

const depsInsideTar = () => {
  const output = String(execSync(`tar tf ${TAR_PATH}`));
  return Array.from(
    new Set(
      output
        .split('\n')
        .map(line => line.split('/')[0])
        .filter(Boolean),
    ),
  );
};

// We need to have APM dependencies installed for Nuclide E2E tests, but there
// is no offline mirror for it that we can use (like we do with Yarn). So we
// create a .tar with all the deps and check it into the repo so we can reuse it
// in our sandcastle build (see package_apm_deps.js). This test ensures that
// the list of packages does not get out of sync with package.json dependencies
test('the list of packed deps matches what is in package.json', () => {
  // $FlowFixMe dynamic require
  const nuclidePkgJson = require(NUCLIDE_PACKAGE_JSON);
  expect(nuclidePkgJson).toHaveProperty('package-deps');
  const {'package-deps': packageDeps} = nuclidePkgJson;
  const packageDepsInTar = depsInsideTar();
  expect(packageDeps.sort()).toEqual(packageDepsInTar.sort());
});
