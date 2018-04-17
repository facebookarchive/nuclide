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

/* eslint-disable no-undef */

declare interface nuclide$CwdApi {
  setCwd(path: string): void;
  observeCwd(callback: (path: ?string) => void): IDisposable;
  getCwd(): ?string;
}

type nuclide$TerminalCommand = {
  file: string,
  args: Array<string>,
};

// Fields that are legal from untrusted sources.
type TerminalInfoUntrustedFields = {
  title?: string,
  key?: string,
  remainOnCleanExit?: boolean,
  defaultLocation?: atom$PaneLocation | 'pane',
  icon?: string,
  trustToken?: string,
};

// Fields that are only legal from trusted sources.
type TerminalInfoTrustedFields = {
  command?: nuclide$TerminalCommand,
  cwd?: string,
  environmentVariables?: Map<string, string>,
  preservedCommands?: Array<string>,
  initialInput?: string,
};

declare type nuclide$TerminalInfo = TerminalInfoUntrustedFields &
  TerminalInfoTrustedFields;

declare type nuclide$Command = {
  file: string,
  args: Array<string>,
};

declare interface nuclide$TerminalInstance {
  setProcessExitCallback(callback: () => mixed): void;
  terminateProcess(): void;
}

declare interface nuclide$TerminalApi {
  open(info: nuclide$TerminalInfo): Promise<nuclide$TerminalInstance>;
  close(key: string): void;
}

declare interface nuclide$RpcService {
  getServiceByNuclideUri(serviceName: string, uri: ?string): any;
}
