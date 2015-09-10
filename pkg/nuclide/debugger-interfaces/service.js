/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type nuclide_debugger$DebuggerInstance = {
  dispose(): void;
  getWebsocketAddress(): Promise<string>;
  onSessionEnd(callback: () => void): {
    dispose(): void;
  };
};

export type nuclide_debugger$DebuggerProcessInfo = {
  toString(): string;

  displayString(): string;

  getServiceName(): string;

  compareDetails(other: nuclide_debugger$DebuggerProcessInfo): number;

  attach(): nuclide_debugger$DebuggerInstance;
};

export type nuclide_debugger$Service = {
  name: string;
  getProcessInfoList(): Promise<Array<nuclide_debugger$DebuggerProcessInfo>>;
};
