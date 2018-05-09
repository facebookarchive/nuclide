/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict
 * @format
 */

import type {Command} from './pty-service/rpc-types';

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
  command?: Command,
  cwd?: string,
  environmentVariables?: Map<string, string>,
  preservedCommands?: Array<string>,
  initialInput?: string,
};

export type TerminalInfo = TerminalInfoUntrustedFields &
  TerminalInfoTrustedFields;

export interface TerminalInstance {
  setProcessExitCallback(callback: () => mixed): void;
  terminateProcess(): void;
}

export type TerminalApi = {
  open(info: TerminalInfo): Promise<TerminalInstance>,
  close(key: string): void,
};
