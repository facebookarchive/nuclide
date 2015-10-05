'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {uncachedRequire} = require('nuclide-test-helpers');

describe('LocalFlowService', () => {
  var file = 'test.js';
  var currentContents = '/* @flow */\nvar x = "this_is_a_string"\nvar y;';
  var line = 2;
  var column = 12;

  var flowService: any;

  function newFlowService() {
    const localFlowService = '../lib/LocalFlowService';
    // we have to invalidate the require cache in order to mock modules we
    // depend on
    const LocalFlowService = (uncachedRequire(require, localFlowService): any);
    return new LocalFlowService();
  }

  beforeEach(() => {
    spyOn(require('../lib/FlowHelpers'), 'getFlowExecOptions')
      .andReturn({cwd: '/path/to/flow/root'});
    flowService = newFlowService();
  });

  afterEach(() => {
    flowService = null;
    global.unspy(require('../lib/FlowHelpers'), 'getFlowExecOptions');
  });

  function mockExec(outputString) {
    spyOn(flowService, '_execFlow').andReturn({stdout: outputString, exitCode: 0});
  }

  describe('flow server creation and teardown', () => {
    var childSpy: any;

    function execFlow() {
      flowService._execFlow([], {}, '/path/to/flow/root/file.js');
    }

    beforeEach(() => {
      var called = false;
      // we want asyncExecute to throw the first time, to mimic Flow not
      // runinng. Then, it will spawn a new flow process, and we want that to be
      // successful
      spyOn(require('nuclide-commons'), 'asyncExecute').andCallFake(() => {
        if (called) {
          return {};
        } else {
          called = true;
          throw {
            stderr: 'There is no flow server running\n\'/path/to/flow/root\'',
          };
        }
      });

      childSpy = {
        stdout: { on() {} },
        stderr: { on() {} },
        on() {},
        kill() {},
      };
      spyOn(childSpy, 'kill');
      spyOn(childSpy, 'on');
      spyOn(require('nuclide-commons'), 'safeSpawn').andReturn(childSpy);
      // we have to create another flow service here since we've mocked modules
      // we depend on since the outer beforeEach ran.
      flowService = newFlowService();
      waitsForPromise(async () => { await execFlow(); });
    });

    afterEach(() => {
      global.unspy(require('nuclide-commons'), 'asyncExecute');
      global.unspy(require('nuclide-commons'), 'safeSpawn');
    });

    describe('_execFlow', () => {
      it('should spawn a new Flow server', () => {
        expect(require('nuclide-commons').safeSpawn).toHaveBeenCalledWith(
          'flow',
          ['server', '/path/to/flow/root']
        );
      });
    });

    describe('crashing Flow', () => {
      var event;
      var handler;

      beforeEach(() => {
        [event, handler] = childSpy.on.mostRecentCall.args;
        // simulate a Flow crash
        handler(2, null);
      });

      it('should blacklist the root', () => {
        expect(event).toBe('exit');
        (require('nuclide-commons').safeSpawn: any).reset();
        waitsForPromise(async () => { await execFlow(); });
        expect(require('nuclide-commons').safeSpawn).not.toHaveBeenCalled();
      });
    });

    describe('dispose', () => {
      it('should kill flow servers', () => {
        waitsForPromise(async () => {
          flowService.dispose();
          expect(childSpy.kill).toHaveBeenCalledWith('SIGKILL');
        });
      });
    });
  });

  describe('findDefinition', () => {
    function runWith(location) {
      mockExec(JSON.stringify(location));
      return flowService.findDefinition(file, currentContents, line, column);
    }

    it('should return the location', () => {
      waitsForPromise(async () => {
        // Flow uses 1-based indexing, Atom uses 0-based.
        expect(await runWith({path: file, line: 5, start: 8})).toEqual({file, line: 4, column: 7});
      });
    });

    it('should return null if no location is found', () => {
      waitsForPromise(async () => {
        expect(await runWith({})).toBe(null);
      });
    });
  });

  describe('findDiagnostics', () => {
    function runWith(errors, filePath, contents) {
      mockExec(JSON.stringify({errors}));
      return flowService.findDiagnostics(filePath, contents);
    }

    it('should call flow status when currentContents is null', () => {
      waitsForPromise(async () => {
        await runWith([], file, null);
        var flowArgs = flowService._execFlow.mostRecentCall.args[0];
        expect(flowArgs[0]).toBe('status');
      });
    });

    it('should call flow check-contents with currentContents when it is not null', () => {
      waitsForPromise(async () => {
        await runWith([], file, currentContents);
        var execArgs = flowService._execFlow.mostRecentCall.args;
        var flowArgs = execArgs[0];
        var stdin = execArgs[1].stdin;
        expect(flowArgs[0]).toBe('check-contents');
        expect(stdin).toBe(currentContents);
      });
    });
  });

  describe('getAutocompleteSuggestions', () => {
    var prefix: any;
    var optionNames: any;
    var options: any;

    function runWith(results) {
      mockExec(JSON.stringify(results));
      return flowService.getAutocompleteSuggestions(
        file,
        currentContents,
        line,
        column,
        prefix,
      );
    }

    async function getNameArray(results: Object): Promise<Array<string>> {
      return ((await runWith(results)).map(item => item.text));
    }

    async function getNameSet(results: Object): Promise<Set<string>> {
      return new Set(await getNameArray(results));
    }

    function hasEqualElements(set1: Set<string>, set2: Set<string>): boolean {
      if (set1.size !== set2.size) {
        return false;
      }
      for (var item of set1) {
        if (!set2.has(item)) {
          return false;
        }
      }
      return true;
    }

    beforeEach(() => {
      prefix = '';
      optionNames = [
        'Foo',
        'foo',
        'Bar',
        'BigLongNameOne',
        'BigLongNameTwo',
      ];
      options = optionNames.map(name => ({name, type: 'foo'}));
    });

    it('should provide suggestions', () => {
      waitsForPromise(async () => {
        expect(hasEqualElements(await getNameSet(options), new Set(optionNames))).toBe(true);
      });
    });

    it('should not filter suggestions if the prefix is a .', () => {
      waitsForPromise(async () => {
        prefix = '.';
        expect(hasEqualElements(await getNameSet(options), new Set(optionNames))).toBe(true);
      });
    });

    it('should filter suggestions by the prefix', () => {
      waitsForPromise(async () => {
        prefix = 'bln';
        expect(
          hasEqualElements(
            await getNameSet(options),
            new Set(['BigLongNameOne', 'BigLongNameTwo'])
          )
        ).toBe(true);
      });
    });

    it('should rank better matches higher', () => {
      waitsForPromise(async () => {
        prefix = 'one';
        var nameArray = await getNameArray(options);
        expect(nameArray[0]).toEqual('BigLongNameOne');
      });
    });

    it('should expose extra information about a function', () => {
      waitsForPromise(async () => {
        var result = await runWith([
          {
            name: 'foo',
            func_details: {
              params: [
                { name: 'param1', type: 'type1' },
                { name: 'param2', type: 'type2' },
              ],
              return_type: 'ret',
            },
          },
        ]);
        var fooResult = result[0];
        expect(fooResult.displayText).toEqual('foo');
        expect(fooResult.snippet).toEqual('foo(${1:param1}, ${2:param2})');
        expect(fooResult.type).toEqual('function');
        expect(fooResult.leftLabel).toEqual('ret');
        expect(fooResult.rightLabel).toEqual('(param1: type1, param2: type2)');
      });
    });
  });

  describe('getType', () => {
    function runWithString(outputString) {
      mockExec(outputString);
      return flowService.getType(file, currentContents, line, column);
    }
    function runWith(outputType) {
      return runWithString(JSON.stringify({type: outputType}));
    }

    it('should return the type on success', () => {
      waitsForPromise(async () => {
        expect(await runWith('thisIsAType')).toBe('thisIsAType');
      });
    });

    it('should return null if the type is unknown', () => {
      waitsForPromise(async () => {
        expect(await runWith('(unknown)')).toBe(null);
      });
    });

    it('should return null if the type is empty', () => {
      waitsForPromise(async () => {
        expect(await runWith('')).toBe(null);
      });
    });

    it('should return null on failure', () => {
      waitsForPromise(async () => {
        expect(await runWithString('invalid json')).toBe(null);
      });
    });

    it('should return null if the flow process fails', () => {
      waitsForPromise(async () => {
        spyOn(flowService, '_execFlow').andThrow('error');
        // this causes some errors to get logged, but I don't think it's a big
        // deal and I don't know how to mock a module
        expect(await flowService.getType(file, currentContents, line, column)).toBe(null);
      });
    });
  });
});
