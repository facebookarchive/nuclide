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

import type {
  NuclideJavaDebuggerProvider,
  // $FlowFB
} from '../../fb-debugger-java/lib/types';

let javaDebuggerProvider: ?NuclideJavaDebuggerProvider = null;
export function setJavaDebuggerApi(api: NuclideJavaDebuggerProvider): void {
  javaDebuggerProvider = api;
}

export function getJavaDebuggerApi(): ?NuclideJavaDebuggerProvider {
  return javaDebuggerProvider;
}
