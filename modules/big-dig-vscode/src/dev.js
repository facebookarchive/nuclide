/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict
 * @format
 */

// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
import * as path from 'path';
import fs from 'fs';

export const __DEV__ = fs.existsSync(path.join(__dirname, '..', 'DEVELOPMENT'));
