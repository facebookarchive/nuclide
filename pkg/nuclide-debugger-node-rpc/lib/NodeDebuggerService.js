'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import {checkOutput} from '../../commons-node/process';

export type NodeAttachTargetInfo = {
  pid: number,
  name: string,
  commandName: string,
};

export async function getAttachTargetInfoList(): Promise<Array<NodeAttachTargetInfo>> {
  // Get processes list from ps utility.
  // -e: include all processes, does not require -ww argument since truncation of process names is
  //     done by the OS, not the ps utility
  // -o pid,comm: custom format the output to be two columns(pid and process name)
  const pidToName: Map<number, string> = new Map();
  const processes = await checkOutput('ps', ['-e', '-o', 'pid,comm'], {});
  processes.stdout.toString().split('\n').slice(1).forEach(line => {
    const words = line.trim().split(' ');
    const pid = Number(words[0]);
    const command = words.slice(1).join(' ');
    const components = command.split('/');
    const name = components[components.length - 1];
    pidToName.set(pid, name);
  });
  // Get processes list from ps utility.
  // -e: include all processes
  // -ww: provides unlimited width for output and prevents the truncating of command names by ps.
  // -o pid,args: custom format the output to be two columns(pid and command name)
  const pidToCommand: Map<number, string> = new Map();
  const commands = await checkOutput('ps', ['-eww', '-o', 'pid,args'], {});
  commands.stdout.toString().split('\n').slice(1).forEach(line => {
    const words = line.trim().split(' ');
    const pid = Number(words[0]);
    const command = words.slice(1).join(' ');
    pidToCommand.set(pid, command);
  });
  // Filter out processes that have died in between ps calls and zombiue processes.
  // Place pid, process, and command info into AttachTargetInfo objects and return in an array.
  return Array.from(pidToName.entries()).filter((arr => {
    const [pid, name] = arr;
    // Filter out current process and only return node processes.
    return pidToCommand.has(pid) && pid !== process.pid && name === 'node';
  }))
  .map(arr => {
    const [pid, name] = arr;
    const commandName = pidToCommand.get(pid);
    invariant(commandName != null);
    return {
      pid,
      name,
      commandName,
    };
  });
}
