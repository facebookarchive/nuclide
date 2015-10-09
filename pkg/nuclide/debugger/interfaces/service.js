/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * TODO[jeffreytan]: got following error for each export needs to ask flow team
 * if it is a bug:
 * "export type type nuclide_debugger$DebuggerInstance = ....
 * Type is incompatible with (unclassified use type: SetNamedExportsT)"
 */

// $FlowIssue
export type nuclide_debugger$DebuggerInstance = {
  dispose(): void;
  getWebsocketAddress(): Promise<string>;
  onSessionEnd(callback: () => void): {
    dispose(): void;
  };
};

// $FlowIssue
export type nuclide_debugger$DebuggerProcessInfo = {
  toString(): string;

  displayString(): string;

  getServiceName(): string;

  compareDetails(other: nuclide_debugger$DebuggerProcessInfo): number;

  attach(): nuclide_debugger$DebuggerInstance;
};

// $FlowIssue
export type nuclide_debugger$Service = {
  name: string;
  getProcessInfoList(): Promise<Array<nuclide_debugger$DebuggerProcessInfo>>;
};
