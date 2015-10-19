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

  let flowService: any;
  let flowExecutor: any;

  let fakeExecFlow: any;

  function newFlowService() {
    const flowServicePath = '../lib/FlowService';
    // we have to invalidate the require cache in order to mock modules we
    // depend on
    return (uncachedRequire(require, flowServicePath): any);
  }

  beforeEach(() => {
    spyOn(require('../lib/FlowHelpers'), 'getFlowExecOptions')
      .andReturn({cwd: '/path/to/flow/root'});
    flowExecutor = require('../lib/FlowExecutor');
    spyOn(flowExecutor, 'execFlow')
      .andCallFake(() => fakeExecFlow());
    flowService = newFlowService();
  });

  afterEach(() => {
    flowService = null;
    global.unspy(require('../lib/FlowHelpers'), 'getFlowExecOptions');
  });

  function mockExec(outputString) {
    fakeExecFlow = () => ({stdout: outputString, exitCode: 0});
  }

  describe('flowFindDefinition', () => {
    function runWith(location) {
      mockExec(JSON.stringify(location));
      return flowService.flowFindDefinition(file, currentContents, line, column);
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

  describe('flowFindDiagnostics', () => {
    function runWith(errors, filePath, contents) {
      mockExec(JSON.stringify({errors}));
      return flowService.flowFindDiagnostics(filePath, contents);
    }

    it('should call flow status when currentContents is null', () => {
      waitsForPromise(async () => {
        await runWith([], file, null);
        var flowArgs = flowExecutor.execFlow.mostRecentCall.args[0];
        expect(flowArgs[0]).toBe('status');
      });
    });

    it('should call flow check-contents with currentContents when it is not null', () => {
      waitsForPromise(async () => {
        await runWith([], file, currentContents);
        var execArgs = flowExecutor.execFlow.mostRecentCall.args;
        var flowArgs = execArgs[0];
        var stdin = execArgs[1].stdin;
        expect(flowArgs[0]).toBe('check-contents');
        expect(stdin).toBe(currentContents);
      });
    });
  });

  describe('flowGetAutocompleteSuggestions', () => {
    var prefix: any;
    var optionNames: any;
    var options: any;

    function runWith(results) {
      mockExec(JSON.stringify(results));
      return flowService.flowGetAutocompleteSuggestions(
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
            type: '(param1: type1, param2: type2) => ret',
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

  describe('flowGetType', () => {
    function runWithString(outputString) {
      mockExec(outputString);
      return flowService.flowGetType(file, currentContents, line, column);
    }
    function runWith(outputType) {
      return runWithString(JSON.stringify({type: outputType}));
    }

    it('should return the type on success', () => {
      waitsForPromise(async () => {
        expect(await runWith('thisIsAType')).toEqual({type: 'thisIsAType', rawType: undefined});
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
        fakeExecFlow = () => { throw 'error'; };
        // this causes some errors to get logged, but I don't think it's a big
        // deal and I don't know how to mock a module
        expect(await flowService.flowGetType(file, currentContents, line, column)).toBe(null);
      });
    });
  });
});
