'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DebuggerLaunchAttachProvider} from '../../nuclide-debugger-base';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import {NodeLaunchAttachProvider} from './NodeLaunchAttachProvider';

function getLaunchAttachProvider(connection: NuclideUri): ?DebuggerLaunchAttachProvider {
  return new NodeLaunchAttachProvider('JavaScript', connection);
}

module.exports = {
  name: 'Node',
  getLaunchAttachProvider,
};
