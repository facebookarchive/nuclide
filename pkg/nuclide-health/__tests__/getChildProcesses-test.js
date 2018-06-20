'use strict';

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _process;

function _load_process() {
  return _process = _interopRequireWildcard(require('../../../modules/nuclide-commons/process'));
}

var _getChildProcesses;

function _load_getChildProcesses() {
  return _getChildProcesses = require('../lib/getChildProcesses');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

function fakePsEntry(pid, ppid, command, isDescendant, ...children) {
  const pcpu = 1;
  const time = 2;
  const rss = 3;
  const vsz = 4;
  return {
    line: `  ${pid}  ${ppid} ${pcpu}  ${time}    ${rss} ${vsz} ${command}  `,
    ps: { pid, ppid, pcpu, time, rss, vsz, command },
    isDescendant,
    children
  };
}

function fakeSummary(command, count) {
  return {
    command,
    count,
    pcpu: count,
    time: count * 2,
    rss: count * 3,
    vsz: count * 4
  };
}

function setProcessPid(pid) {
  const original = process.pid;
  Object.defineProperty(process, 'pid', { value: pid });
  return original;
}

function checkQueryPs(mockPid, data, summary) {
  describe('sample data', () => {
    const descendants = data.filter(x => x.isDescendant);
    let originalPid;

    beforeEach(() => {
      originalPid = setProcessPid(mockPid);
      jest.spyOn(_process || _load_process(), 'runCommand').mockImplementation((cmd, args, options) => {
        expect(cmd).toEqual('ps');
        expect(args).toEqual(['-eo', 'pid,ppid,pcpu,time,rss,vsz,command']);
        return _rxjsBundlesRxMinJs.Observable.of('  PID  PPID  %CPU      TIME    RSS      VSZ COMMAND\n' + data.map(entry => entry.line + '\n').join(''));
      });
    });
    afterEach(() => {
      setProcessPid(originalPid);
    });

    it('parses', async () => {
      await (async () => {
        const expected = new Map(data.map(entry => [entry.ps.pid, entry.ps]));
        const actual = await (0, (_getChildProcesses || _load_getChildProcesses()).queryPs)('command').toPromise();
        expect(actual).toEqual(expected);
      })();
    });

    it('summarizes', async () => {
      await (async () => {
        const actual = await (0, (_getChildProcesses || _load_getChildProcesses()).queryPs)('command').map((_getChildProcesses || _load_getChildProcesses()).childProcessSummary).toPromise();
        expect(actual).toEqual(summary);
      })();
    });

    it('converts to tree', async () => {
      await (async () => {
        const expectedMap = new Map(descendants.map(x => [x.ps.pid, x]));
        const actual = await (0, (_getChildProcesses || _load_getChildProcesses()).queryPs)('command').map((_getChildProcesses || _load_getChildProcesses()).childProcessTree).toPromise();
        if (expectedMap.size === 0) {
          expect(actual).toBe(null);
          return;
        }
        function check(node) {
          let count = 1;
          const expected = (0, (_nullthrows || _load_nullthrows()).default)(expectedMap.get(node.pid));
          expect(node.children.length).toBe(expected.children.length);
          for (const child of node.children) {
            expect(expected.children.includes(child.pid)).toBe(true);
            count += check(child);
          }
          return count;
        }
        const count = check((0, (_nullthrows || _load_nullthrows()).default)(actual));
        expect(count).toBe(data.filter(x => x.isDescendant).length);
      })();
    });
  });
}

describe('getChildProcesses', () => {
  describe('single process', () => {
    checkQueryPs(2, [fakePsEntry(1, 0, 'init', false), fakePsEntry(2, 1, 'nuclide', true)], [fakeSummary('nuclide', 1)]);
  });

  describe('other processes', () => {
    checkQueryPs(5, [fakePsEntry(1, 0, 'init', false), fakePsEntry(2, 1, 'launchd', false), fakePsEntry(3, 1, 'cron', false), fakePsEntry(4, 1, 'mdworker', false), fakePsEntry(5, 1, 'nuclide', true), fakePsEntry(6, 1, 'chrome', false), fakePsEntry(7, 1, 'iTerm2', false), fakePsEntry(8, 7, 'bash', false)], [fakeSummary('nuclide', 1)]);
  });

  describe('direct sub-processes', () => {
    checkQueryPs(2, [fakePsEntry(1, 0, 'init', false), fakePsEntry(2, 1, 'nuclide', true, 3, 4, 5, 6), fakePsEntry(3, 2, 'flow', true), fakePsEntry(4, 2, 'hg', true), fakePsEntry(5, 2, 'flow', true), fakePsEntry(6, 2, 'hg', true)], [fakeSummary('flow', 2), fakeSummary('hg', 2), fakeSummary('nuclide', 1)]);
  });

  describe('sub-process tree', () => {
    checkQueryPs(2, [fakePsEntry(1, 0, 'init', false), fakePsEntry(2, 1, 'nuclide', true, 3, 4), fakePsEntry(3, 2, 'flow', true, 5, 6), fakePsEntry(4, 2, 'hg', true, 7, 8), fakePsEntry(5, 3, 'flow', true), fakePsEntry(6, 3, 'flow', true), fakePsEntry(7, 4, 'hg', true), fakePsEntry(8, 4, 'hg', true)], [fakeSummary('flow', 3), fakeSummary('hg', 3), fakeSummary('nuclide', 1)]);
  });

  describe('missing process', () => {
    checkQueryPs(1, [], []);
  });

  describe('durationInSeconds', () => {
    it('handles integers', () => {
      expect((0, (_getChildProcesses || _load_getChildProcesses()).durationInSeconds)('5')).toBe(5);
    });
    it('handles doubles', () => {
      expect((0, (_getChildProcesses || _load_getChildProcesses()).durationInSeconds)('2.5')).toBe(2.5);
    });
    it('handles minutes', () => {
      expect((0, (_getChildProcesses || _load_getChildProcesses()).durationInSeconds)('5:00')).toBe(5 * 60);
    });
    it('handles hours', () => {
      expect((0, (_getChildProcesses || _load_getChildProcesses()).durationInSeconds)('5:00:00')).toBe(5 * 60 * 60);
    });
    it('handles everything at once', () => {
      expect((0, (_getChildProcesses || _load_getChildProcesses()).durationInSeconds)('500:10:20.5')).toBe(500 * 60 * 60 + 10 * 60 + 20.5);
    });
  });
});