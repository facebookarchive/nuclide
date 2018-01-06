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

// Subsets of https://git.io/vbhTr.
export type ReactNativeAttachArgs = {
  program: string,
  outDir: string,
  port: number,
  sourceMaps: boolean,
  sourceMapPathOverrides?: Object,
};

export type ReactNativeLaunchArgs = ReactNativeAttachArgs & {
  platform: 'android' | 'ios',
  variant?: string,
  target?: 'device' | 'simulator',
  runArguments?: Array<string>,
  env?: Object,
};
