'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DebuggerProcessInfo} from '../atom';

export type nuclide_debugger$DebuggerInstance = {
  dispose(): void;
  getWebsocketAddress(): Promise<string>;
  onSessionEnd(callback: () => void): {
    dispose(): void;
  };
};

export type nuclide_debugger$Service = {
  name: string;
  getProcessInfoList(): Promise<Array<DebuggerProcessInfo>>;
};
