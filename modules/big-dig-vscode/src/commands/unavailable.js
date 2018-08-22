/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import * as vscode from 'vscode';
import {getLogger} from 'log4js';

const logger = getLogger('commands');

// $FlowIgnore
export async function unavailable(...args: any) {
  vscode.window.showErrorMessage(
    'this feature is not available in the open source release',
  );
  logger.info('adding on demand www to workspace');
}
