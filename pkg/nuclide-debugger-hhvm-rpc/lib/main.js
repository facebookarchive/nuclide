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

import type {HHVMAttachConfig, HHVMLaunchConfig} from './types';

import nuclideUri from 'nuclide-commons/nuclideUri';
import {getAvailableServerPort} from '../../commons-node/serverPort';
import fsPromise from 'nuclide-commons/fsPromise';
import os from 'os';
import {runCommand} from 'nuclide-commons/process';

export type {HHVMAttachConfig, HHVMLaunchConfig} from './types';

const DEFAULT_HHVM_PATH = '/usr/local/bin/hhvm';

// The default path (relative to Hack Root) to use for the startup document,
// which is loaded by the dummy request thread in the debugger backend.
const DEFAULT_STARTUP_DOC_PATH = 'scripts/vsdebug_includes.php';

export async function getDebuggerArgs(
  config: HHVMAttachConfig | HHVMLaunchConfig,
): Promise<Object> {
  switch (config.action) {
    case 'launch':
      const launchConfig: HHVMLaunchConfig = (config: any);
      return getLaunchArgs(launchConfig);
    case 'attach':
      const attachConfig: HHVMAttachConfig = (config: any);
      return _getAttachArgs(attachConfig);
    default:
      throw new Error('Invalid launch/attach action');
  }
}

function _expandPath(path: string, cwd: string): string {
  // Expand a path to interpret ~/ as home and ./ as relative
  // to the current working directory.
  return path.startsWith('./')
    ? nuclideUri.resolve(
        cwd != null ? nuclideUri.expandHomeDir(cwd) : '',
        path.substring(2),
      )
    : nuclideUri.expandHomeDir(path);
}

export async function getLaunchArgs(config: HHVMLaunchConfig): Promise<Object> {
  const launchWrapperCommand =
    config.launchWrapperCommand != null &&
    config.launchWrapperCommand.trim() !== ''
      ? _expandPath(
          config.launchWrapperCommand,
          nuclideUri.dirname(config.targetUri),
        )
      : null;

  // Launch the script with cwd set to the directory the launch wrapper
  // command is in, if a wrapper is specified. Otherwise try to use the
  // cwd provided by the front-end, and finally fall back to the directory
  // of the target uri.
  const cwd =
    launchWrapperCommand != null
      ? nuclideUri.dirname(launchWrapperCommand)
      : config.cwd != null && config.cwd.trim() !== ''
        ? config.cwd
        : nuclideUri.dirname(config.targetUri);

  // Expand paths in the launch config from the front end.
  if (config.hhvmRuntimePath != null) {
    config.hhvmRuntimePath = _expandPath(config.hhvmRuntimePath, cwd);
  }

  config.launchScriptPath = _expandPath(config.launchScriptPath, cwd);

  const deferArgs = [];
  let debugPort = null;
  if (config.deferLaunch) {
    debugPort = await getAvailableServerPort();
    deferArgs.push('--vsDebugPort');
    deferArgs.push(debugPort);
  }

  const hhvmPath = await _getHhvmPath(config);
  const launchArgs =
    launchWrapperCommand != null
      ? [launchWrapperCommand, config.launchScriptPath]
      : [config.launchScriptPath];

  let hhvmRuntimeArgs = config.hhvmRuntimeArgs;
  try {
    // $FlowFB
    const fbConfig = require('./fbConfig');
    hhvmRuntimeArgs = fbConfig.getHHVMRuntimeArgs(config);
  } catch (_) {}

  const hhvmArgs = [
    ...hhvmRuntimeArgs,
    '--mode',
    'vsdebug',
    ...deferArgs,
    ...launchArgs,
    ...config.scriptArgs,
  ];

  const startupDocumentPath: ?string = await _getStartupDocumentPath(config);

  const logFilePath = await _getHHVMLogFilePath();

  return {
    hhvmPath,
    hhvmArgs,
    startupDocumentPath,
    logFilePath,
    debugPort,
    cwd,
  };
}

async function _getHHVMLogFilePath(): Promise<string> {
  const path = nuclideUri.join(
    os.tmpdir(),
    `nuclide-${os.userInfo().username}-logs`,
    'hhvm-debugger.log',
  );

  // Ensure the log file exists, and is write-able by everyone so that
  // HHVM, which is running as a different user, can append to it.
  const mode = 0o666;
  try {
    const fd = await fsPromise.open(path, 'a+', mode);
    if (fd >= 0) {
      await fsPromise.chmod(path, mode);
    }
  } catch (_) {}

  return path;
}

export async function createLogFilePaste(): Promise<string> {
  try {
    // $FlowFB
    const fbPaste = require('../../fb-pastebin');
    return fsPromise
      .readFile(await _getHHVMLogFilePath(), 'utf8')
      .then(contents =>
        fbPaste.createPasteFromContents(contents, {title: 'HHVM-Debugger'}),
      );
  } catch (error) {
    return '';
  }
}

async function _getAttachArgs(config: HHVMAttachConfig): Promise<Object> {
  const startupDocumentPath: ?string = await _getStartupDocumentPath(config);
  const logFilePath = await _getHHVMLogFilePath();
  return {
    debugPort: config.debugPort,
    startupDocumentPath,
    logFilePath,
  };
}

async function _getStartupDocumentPath(
  config: HHVMAttachConfig | HHVMLaunchConfig,
): Promise<?string> {
  if (config.startupDocumentPath != null) {
    const configPath = nuclideUri.expandHomeDir(config.startupDocumentPath);
    if (await fsPromise.exists(configPath)) {
      return configPath;
    }
  }

  // Otherwise, fall back to the default path, relative to the current
  // hack root directory.
  const filePath = nuclideUri.getPath(config.targetUri);
  const hackRoot = await fsPromise.findNearestFile('.hhconfig', filePath);
  const startupDocPath = nuclideUri.join(
    hackRoot != null ? hackRoot : '',
    DEFAULT_STARTUP_DOC_PATH,
  );

  if (await fsPromise.exists(startupDocPath)) {
    return startupDocPath;
  }

  return null;
}

async function _getHhvmPath(config: HHVMLaunchConfig): Promise<string> {
  // If the client specified an HHVM runtime path, and it exists, use that.
  if (config.hhvmRuntimePath != null && config.hhvmRuntimePath !== '') {
    const exists = await fsPromise.exists(config.hhvmRuntimePath);
    if (exists) {
      return String(config.hhvmRuntimePath);
    }
  }

  // Otherwise try to fall back to a default path.
  try {
    // $FlowFB
    return require('nuclide-debugger-common/fb-constants').DEVSERVER_HHVM_PATH;
  } catch (error) {
    return DEFAULT_HHVM_PATH;
  }
}

export async function getAttachTargetList(): Promise<
  Array<{pid: number, command: string}>,
> {
  const commands = await runCommand(
    'ps',
    ['-e', '-o', 'pid,args'],
    {},
  ).toPromise();
  return commands
    .toString()
    .split('\n')
    .filter(line => line.indexOf('vsDebugPort') > 0)
    .map(line => {
      const words = line.trim().split(' ');
      const pid = Number(words[0]);
      const command = words.slice(1).join(' ');
      return {
        pid,
        command,
      };
    });
}
