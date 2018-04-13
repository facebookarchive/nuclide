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

import type {ReactNativeAttachArgs, ReactNativeLaunchArgs} from './types';

import {VspProcessInfo, VsAdapterTypes} from 'nuclide-debugger-common';

export const REACT_NATIVE_PACKAGER_DEFAULT_PORT = 8081;

export function getReactNativeAttachProcessInfo(
  args: ReactNativeAttachArgs,
): VspProcessInfo {
  return new VspProcessInfo(
    args.program,
    'attach',
    VsAdapterTypes.REACT_NATIVE,
    null,
    args,
    {threads: false},
  );
}

export function getReactNativeLaunchProcessInfo(
  args: ReactNativeLaunchArgs,
): VspProcessInfo {
  return new VspProcessInfo(
    args.program,
    'launch',
    VsAdapterTypes.REACT_NATIVE,
    null,
    args,
    {threads: false},
  );
}
