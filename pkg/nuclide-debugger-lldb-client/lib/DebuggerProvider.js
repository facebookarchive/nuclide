'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DebuggerLaunchAttachProvider} from '../../nuclide-debugger-atom';
import type {NuclideUri} from '../../nuclide-remote-uri';
import {LLDBLaunchAttachProvider} from './LLDBLaunchAttachProvider';

function getLaunchAttachProvider(connection: NuclideUri): ?DebuggerLaunchAttachProvider {
  return new LLDBLaunchAttachProvider('C++', connection);
}

module.exports = {
  name: 'lldb',
  getLaunchAttachProvider,
};
