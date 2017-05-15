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

/**
 * It tries to mimic what the top utility would report, but we have to do it manually because
 * different devices can have different versions of top.
 *
 * Reference for calculations: https://github.com/scaidermern/top-processes
 */

import type {Process} from './types';

import {sleep} from 'nuclide-commons/promise';
import {Adb} from './Adb';
import {arrayCompact} from 'nuclide-commons/collection';

type CPU_MEM = [number, number];

export class AdbTop {
  _adb: Adb;
  _device: string;

  constructor(adb: Adb, device: string) {
    this._adb = adb;
    this._device = device;
  }

  async fetch(): Promise<Process[]> {
    const [processes, cpuAndMemUsage] = await Promise.all([
      this._getProcessList(),
      this._getProcessAndMemoryUsage(),
    ]);
    return arrayCompact(
      processes.map(x => {
        const info = x.trim().split(/\s+/);
        const pid = parseInt(info[1], 10);
        if (!Number.isInteger(pid)) {
          return null;
        }
        const cpuAndMem = cpuAndMemUsage.get(pid);
        let cpu = null;
        let mem = null;
        if (cpuAndMem != null) {
          cpu = parseFloat(cpuAndMem[0]);
          mem = parseFloat(cpuAndMem[1]);
        }
        return {
          user: info[0],
          pid,
          name: info[info.length - 1],
          cpuUsage: cpu,
          memUsage: mem,
        };
      }),
    );
  }

  async _getProcessList(): Promise<Array<string>> {
    return (await this._adb
      .runShortCommand(this._device, ['shell', 'ps'])
      .toPromise()).split(/\n/);
  }

  async _getProcessAndMemoryUsage(): Promise<Map<number, CPU_MEM>> {
    const [procTimePrev, cpuTimePrev] = await Promise.all([
      this._getProcessesTime(),
      this._getGlobalCPUTime(),
    ]);
    await sleep(500);
    const [procTime, cpuTime] = await Promise.all([
      this._getProcessesTime(),
      this._getGlobalCPUTime(),
    ]);

    // pid => cpuUsage, memory usage
    const cpuAndMemUsage = new Map();
    const deltaCpu = cpuTime - cpuTimePrev;
    procTime.forEach((p1, pid) => {
      if (!procTimePrev.has(pid)) {
        return;
      }
      const p0 = procTimePrev.get(pid);
      if (p0 != null) {
        const deltaProc = p1[0] - p0[0];
        const memUsage = p1[1];
        cpuAndMemUsage.set(pid, [deltaProc / deltaCpu * 100, memUsage]);
      }
    });
    return cpuAndMemUsage;
  }

  /**
   * Returns a map: pid => utime + stime
   */
  async _getProcessesTime(): Promise<Map<number, CPU_MEM>> {
    const validProcessRegex = new RegExp(/\d+\s()/);
    // We look for the all the /proc/PID/stat files failing silently if the process dies as the
    // command runs.
    const procTime = (await this._adb
      .runShortCommand(this._device, [
        'shell',
        'for file in /proc/[0-9]*/stat; do cat "$file" 2>/dev/null || true; done',
      ])
      .toPromise())
      .split(/\n/)
      .filter(x => validProcessRegex.test(x));
    return new Map(
      procTime.map(x => {
        const info = x.trim().split(/\s/);
        return [
          parseInt(info[0], 10),
          [
            parseInt(info[12], 10) + parseInt(info[13], 10), // stime + utime
            parseInt(info[23], 10), // RSS
          ],
        ];
      }),
    );
  }

  async _getGlobalCPUTime(): Promise<number> {
    return (await this._getGlobalProcessStat())
      .split(/\s+/)
      .slice(1, -2)
      .reduce((acc, current) => {
        const val = parseInt(current, 10);
        return acc + val;
      }, 0);
  }

  async _getGlobalProcessStat(): Promise<string> {
    return (await this._adb
      .runShortCommand(this._device, ['shell', 'cat', '/proc/stat'])
      .toPromise())
      .split(/\n/)[0]
      .trim();
  }
}
