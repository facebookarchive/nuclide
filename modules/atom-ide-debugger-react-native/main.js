/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {NuclideDebuggerProvider} from 'nuclide-debugger-common/types';

import createPackage from 'nuclide-commons-atom/createPackage';
import ReactNativeLaunchAttachProvider from './ReactNativeLaunchAttachProvider';

class Activation {
  constructor() {}
  dispose() {}

  createDebuggerProvider(): NuclideDebuggerProvider {
    return {
      name: 'React Native',
      getLaunchAttachProvider: connection => {
        return new ReactNativeLaunchAttachProvider(connection);
      },
    };
  }
}

createPackage(module.exports, Activation);
