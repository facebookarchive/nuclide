/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {DebuggerLaunchAttachProvider} from '../../nuclide-debugger-base';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import {JavaLaunchAttachProvider} from './JavaLaunchAttachProvider';

function getLaunchAttachProvider(connection: NuclideUri): ?DebuggerLaunchAttachProvider {
  return new JavaLaunchAttachProvider('Java', connection);
}

module.exports = {
  name: 'java',
  getLaunchAttachProvider,
};
