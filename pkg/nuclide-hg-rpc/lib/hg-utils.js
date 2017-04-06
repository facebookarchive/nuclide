/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {ProcessMessage} from '../../commons-node/process-rpc-types';
import type {HgExecOptions} from './hg-exec-types';

import {Observable} from 'rxjs';
import {asyncExecute, createArgsForScriptCommand} from '../../commons-node/process';
import {getLogger} from '../../nuclide-logging';
import fsPromise from '../../commons-node/fsPromise';
import {
  getOriginalEnvironment,
  observeProcess,
  runCommand,
} from '../../commons-node/process';
import {getConnectionDetails} from '../../nuclide-remote-atom-rpc';
import nuclideUri from '../../commons-node/nuclideUri';

// Mercurial (as of v3.7.2) [strips lines][1] matching the following prefix when a commit message is
// created by an editor invoked by Mercurial. Because Nuclide is not invoked by Mercurial, Nuclide
// must mimic the same stripping.
//
// Note: `(?m)` converts to `/m` in JavaScript-flavored RegExp to mean 'multiline'.
//
// [1] https://selenic.com/hg/file/3.7.2/mercurial/cmdutil.py#l2734
const COMMIT_MESSAGE_STRIP_LINE = /^HG:.*(\n|$)/gm;

/**
 * Calls out to checkOutput using the 'hg' command.
 * @param options as specified by http://nodejs.org/api/child_process.html. Additional options:
 *   - NO_HGPLAIN set if the $HGPLAIN environment variable should not be used.
 *   - TTY_OUTPUT set if the command should be run as if it were attached to a tty.
 */
export async function hgAsyncExecute(args_: Array<string>, options_: HgExecOptions): Promise<any> {
  const {command, args, options} = await getHgExecParams(args_, options_);
  const result = await asyncExecute(command, args, options);
  if (result.exitCode === 0) {
    return result;
  } else {
    logAndThrowHgError(args, options, result.stdout, result.stderr);
  }
}

/**
 * Calls hg commands, returning an Observable to allow aborting and streaming progress output.
 */
export function hgObserveExecution(
  args_: Array<string>,
  options_: HgExecOptions,
): Observable<ProcessMessage> {
  return Observable.fromPromise(getHgExecParams(args_, options_))
    .switchMap(({command, args, options}) => {
      return observeProcess(
        'script',
        createArgsForScriptCommand(command, args),
        {...options, killTreeOnComplete: true},
      );
    });
}

/**
 * Calls hg commands, returning an Observable to allow aborting.
 * Resolves to stdout.
 */
export function hgRunCommand(
  args_: Array<string>,
  options_: HgExecOptions,
): Observable<string> {
  return Observable.fromPromise(getHgExecParams(args_, options_))
    .switchMap(({command, args, options}) => (
      runCommand(command, args, options, true /* kill process tree on complete */)
    ));
}

function logAndThrowHgError(
  args: Array<string>,
  options: Object,
  stdout: string,
  stderr: string,
): void {
  getLogger().error(`Error executing hg command: ${JSON.stringify(args)}\n`
    + `stderr: ${stderr}\nstdout: ${stdout}\n`
    + `options: ${JSON.stringify(options)}`);
  if (stderr.length > 0 && stdout.length > 0) {
    throw new Error(`hg error\nstderr: ${stderr}\nstdout: ${stdout}`);
  } else {
    // One of `stderr` or `stdout` is empty - not both.
    throw new Error(stderr || stdout);
  }
}

async function getHgExecParams(
  args_: Array<string>,
  options_: HgExecOptions,
): Promise<{command: string, args: Array<string>, options: Object}> {
  let args = args_;
  let sshCommand;
  // expandHomeDir is not supported on windows
  if (process.platform !== 'win32') {
    const pathToSSHConfig = nuclideUri.expandHomeDir('~/.atom/scm_ssh.sh');
    const doesSSHConfigExist = await fsPromise.exists(pathToSSHConfig);
    if (doesSSHConfigExist) {
      sshCommand = pathToSSHConfig;
    }
  }

  if (sshCommand == null) {
    // Disabling ssh keyboard input so all commands that prompt for interaction
    // fail instantly rather than just wait for an input that will never arrive
    sshCommand = 'ssh -oBatchMode=yes -oControlMaster=no';
  }
  args.push(
    '--config',
    `ui.ssh=${sshCommand}`,
  );
  const options = {
    ...options_,
    env: {
      ...await getOriginalEnvironment(),
      ATOM_BACKUP_EDITOR: 'false',
    },
  };
  if (!options.NO_HGPLAIN) {
    // Setting HGPLAIN=1 overrides any custom aliases a user has defined.
    options.env.HGPLAIN = 1;
  }
  if (options.HGEDITOR != null) {
    options.env.HGEDITOR = options.HGEDITOR;
  }

  let command;
  if (options.TTY_OUTPUT) {
    command = 'script';
    args = createArgsForScriptCommand('hg', args);
  } else {
    command = 'hg';
  }
  return {command, args, options};
}

export async function createCommmitMessageTempFile(commitMessage: string): Promise<string> {
  const tempFile = await fsPromise.tempfile();
  const strippedMessage = commitMessage.replace(COMMIT_MESSAGE_STRIP_LINE, '');
  await fsPromise.writeFile(tempFile, strippedMessage);
  return tempFile;
}

export async function getEditMergeConfigs(): Promise<{args: Array<string>, hgEditor: string}> {
  const connectionDetails = await getConnectionDetails();
  if (connectionDetails == null) {
    getLogger().error('CommandServer not initialized!');
    return {
      args: [],
      hgEditor: '',
    };
  }
  // Atom RPC needs to agree with the Atom process / nuclide server on the address and port.
  const hgEditor = getAtomRpcScriptPath()
    + ` -f ${connectionDetails.family} -p ${connectionDetails.port} --wait`;
  return {
    args: [
      '--config',
      'merge-tools.editmerge.check=conflicts',
      '--config',
      'ui.merge=editmerge',
      '--config',
      'ui.interactive=no',
      '--config',
      'ui.interface.chunkselector=editor',
      '--config',
      'extensions.edrecord=',
    ],
    hgEditor,
  };
}

let atomRpcEditorPath;

function getAtomRpcScriptPath(): string {
  if (atomRpcEditorPath == null) {
    try {
      atomRpcEditorPath = require.resolve('../../nuclide-remote-atom-rpc/bin/fb-atom');
    } catch (error) {
      atomRpcEditorPath = require.resolve('../../nuclide-remote-atom-rpc/bin/atom');
    }
  }
  return atomRpcEditorPath;
}

export function processExitCodeAndThrow(
  processMessage: ProcessMessage,
): Observable<ProcessMessage> {
  if (processMessage.kind === 'exit' && processMessage.exitCode !== 0) {
    return Observable.throw(
      new Error(`HG failed with exit code: ${String(processMessage.exitCode)}`),
    );
  }
  return Observable.of(processMessage);
}
