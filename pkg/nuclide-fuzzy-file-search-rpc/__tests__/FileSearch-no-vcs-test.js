/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import fs from 'fs';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {runCommand} from 'nuclide-commons/process';
import {generateFixture} from 'nuclide-commons/test-helpers';
import {
  aFileSearchShould,
  createTestFolder,
} from '../__mocks__/a_file_search_should';

jest.setTimeout(30000);

aFileSearchShould('Vanilla (No VCS)', createTestFolder);
