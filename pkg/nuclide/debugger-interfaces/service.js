/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type nuclide_debugger$DebuggerInstance = {
  dispose: () => void;
  getWebsocketAddress: () => Promise<string>;
};

type nuclide_debugger$DebuggerProcessInfo = {
  constructor(serviceName: string);

  toString(): string;

  displayString(): string;

  getServiceName(): string;

  static compare(value: DebuggerProcessInfo, other: DebuggerProcessInfo): number;

  compareDetails(other:DebuggerProcessInfo): number;

  attach(): nuclide_debugger$DebuggerInstance;
};

type nuclide_debugger$Service = {
  name: string;
  getProcessInfoList(): Promise<Array<nuclide_debugger$DebuggerProcessInfo>>;
};
