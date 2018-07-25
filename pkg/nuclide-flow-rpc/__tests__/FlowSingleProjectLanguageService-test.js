"use strict";

function _simpleTextBuffer() {
  const data = _interopRequireWildcard(require("simple-text-buffer"));

  _simpleTextBuffer = function () {
    return data;
  };

  return data;
}

function _FlowSingleProjectLanguageService() {
  const data = require("../lib/FlowSingleProjectLanguageService");

  _FlowSingleProjectLanguageService = function () {
    return data;
  };

  return data;
}

function _FlowExecInfoContainer() {
  const data = require("../lib/FlowExecInfoContainer");

  _FlowExecInfoContainer = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
describe('FlowSingleProjectLanguageService', () => {
  const file = '/path/to/test.js';
  const root = '/path/to';
  const currentContents = '/* @flow */\nvar x = "this_is_a_string"\nvar y;';
  let line = null;
  let column = null;
  let buffer = null;
  let flowRoot = null;
  let fakeExecFlow;

  function newFlowService() {
    return new (_FlowSingleProjectLanguageService().FlowSingleProjectLanguageService)(root, new (_FlowExecInfoContainer().FlowExecInfoContainer)(), null);
  }

  beforeEach(() => {
    buffer = new (_simpleTextBuffer().default)(currentContents);
    line = 2;
    column = 12;
    flowRoot = newFlowService();
    jest.spyOn(flowRoot._process, 'execFlow').mockImplementation(() => fakeExecFlow());
  });

  function mockExec(outputString) {
    fakeExecFlow = () => ({
      stdout: outputString,
      exitCode: 0
    });
  }

  describe('getDefinition', () => {
    function runWith(location) {
      mockExec(JSON.stringify(location));
      return flowRoot.getDefinition(file, buffer, new (_simpleTextBuffer().Point)(line, column));
    }

    it('should return the location', async () => {
      line = 2;
      column = 4; // Flow uses 1-based indexing, Atom uses 0-based.

      const result = await runWith({
        path: file,
        line: 5,
        start: 8
      });

      if (!(result != null)) {
        throw new Error("Invariant violation: \"result != null\"");
      }

      expect(result.definitions[0]).toEqual({
        path: file,
        position: new (_simpleTextBuffer().Point)(4, 7),
        language: 'Flow'
      });
    });
    it('should return null if no location is found', async () => {
      line = 2;
      column = 4;
      expect((await runWith({}))).toBe(null);
      expect(flowRoot._process.execFlow).toHaveBeenCalled();
    });
  });
  describe('getDiagnostics', () => {
    function runWith(errors, filePath) {
      mockExec(JSON.stringify({
        errors
      }));
      return flowRoot.getDiagnostics(filePath, buffer);
    }

    it('should call flow status', async () => {
      await runWith([], file);
      const flowArgs = flowRoot._process.execFlow.mock.calls[flowRoot._process.execFlow.mock.calls.length - 1][0];
      expect(flowArgs[0]).toBe('status');
    });
  });
  describe('flowGetType', () => {
    function runWithString(outputString) {
      mockExec(outputString);
      return flowRoot.typeHint(file, buffer, new (_simpleTextBuffer().Point)(line, column));
    }

    function runWith(outputType, startLine, startCol, endLine, endCol) {
      return runWithString(JSON.stringify({
        type: outputType,
        loc: {
          start: {
            line: startLine,
            column: startCol
          },
          end: {
            line: endLine,
            column: endCol
          }
        }
      }));
    }

    it('should return the type on success', async () => {
      expect((await runWith('thisIsAType', 1, 1, 1, 4))).toEqual({
        hint: [{
          type: 'snippet',
          value: 'thisIsAType'
        }],
        range: new (_simpleTextBuffer().Range)([0, 0], [0, 4])
      });
    });
    it('should return null if the type is unknown', async () => {
      expect((await runWith('(unknown)', 1, 1, 1, 4))).toBe(null);
    });
    it('should return null if the type is empty', async () => {
      expect((await runWith('', 1, 1, 1, 4))).toBe(null);
    });
    it('should return null on failure', async () => {
      expect((await runWithString('invalid json'))).toBe(null);
    });
    it('should return null if the flow process fails', async () => {
      fakeExecFlow = () => {
        throw new Error('error');
      }; // this causes some errors to get logged, but I don't think it's a big
      // deal and I don't know how to mock a module


      expect((await flowRoot.typeHint(file, buffer, new (_simpleTextBuffer().Point)(line, column)))).toBe(null);
    });
  });
  describe('getAutocompleteSuggestions', () => {
    let prefix = null;
    let resultNames = null;
    let result;
    let activatedManually = undefined;
    beforeEach(async () => {
      prefix = '';
      activatedManually = false;
      resultNames = ['Foo', 'foo', 'Bar', 'BigLongNameOne', 'BigLongNameTwo'];
      result = resultNames.map(name => ({
        name,
        type: 'foo'
      }));
    });

    function run() {
      mockExec(JSON.stringify({
        result
      }));
      return flowRoot.getAutocompleteSuggestions(file, buffer, new (_simpleTextBuffer().Point)(line, column), activatedManually, prefix);
    }

    async function getNameArray(_) {
      const suggestions = await run();

      if (suggestions == null) {
        return [];
      }

      return suggestions.items.map(item => item.text);
    }

    async function getNameSet(_) {
      return new Set((await getNameArray()));
    }

    function hasEqualElements(set1, set2) {
      if (set1.size !== set2.size) {
        return false;
      }

      for (const item of set1) {
        if (!set2.has(item)) {
          return false;
        }
      }

      return true;
    }

    it('should not provide suggestions when no characters have been typed', async () => {
      expect(hasEqualElements((await getNameSet()), new Set())).toBe(true);
    });
    it('should always provide suggestions when activated manually', async () => {
      activatedManually = true;
      expect(hasEqualElements((await getNameSet()), new Set(resultNames))).toBe(true);
    });
    it('should always provide suggestions when the prefix contains .', async () => {
      prefix = '   .   ';
      expect(hasEqualElements((await getNameSet()), new Set(resultNames))).toBe(true);
    });
    it('should expose extra information about a function', async () => {
      prefix = 'f';
      await (async () => {
        result = [{
          name: 'foo',
          type: '(param1: type1, param2: type2) => ret',
          func_details: {
            params: [{
              name: 'param1',
              type: 'type1'
            }, {
              name: 'param2',
              type: 'type2'
            }],
            return_type: 'ret'
          }
        }];
        const results = await run();

        if (!(results != null)) {
          throw new Error("Invariant violation: \"results != null\"");
        }

        const fooResult = results.items[0];
        expect(fooResult.displayText).toEqual('foo');
        expect(fooResult.snippet).toEqual('foo(${1:param1}, ${2:param2})');
        expect(fooResult.type).toEqual('function');
        expect(fooResult.leftLabel).toEqual('ret');
        expect(fooResult.rightLabel).toEqual('(param1: type1, param2: type2)');
      })();
    });
  });
  describe('groupParamNames', () => {
    it('should return a group for each argument', () => {
      const args = ['arg1', 'arg2'];
      expect((0, _FlowSingleProjectLanguageService().groupParamNames)(args)).toEqual(args.map(arg => [arg]));
    });
    it('should group optional params', () => {
      const args = ['arg1', 'arg2?'];
      expect((0, _FlowSingleProjectLanguageService().groupParamNames)(args)).toEqual([args]);
    });
    it('should only group optional params at the end', () => {
      // I have no idea why you are even allowed to have optional params in the middle, but I guess
      // we have to deal with it.
      const args = ['arg1', 'arg2?', 'arg3', 'arg4?'];
      const expectedGrouping = [['arg1'], ['arg2?'], ['arg3', 'arg4?']];
      expect((0, _FlowSingleProjectLanguageService().groupParamNames)(args)).toEqual(expectedGrouping);
    });
    it('should group all params if they are all optional', () => {
      const args = ['arg1?', 'arg2?'];
      expect((0, _FlowSingleProjectLanguageService().groupParamNames)(args)).toEqual([args]);
    });
    it('should return an empty array for no arguments', () => {
      expect((0, _FlowSingleProjectLanguageService().groupParamNames)([])).toEqual([]);
    });
  });
}); // FYI, the order of the expected messages within the nested array is arbitrary, but deterministic.
// However, using arrays makes it easy to compare output using toEqual. It would make sense to
// switch to Sets as long as toEqual (or similar) is extended to compare Sets structurally.

describe('push diagnostics collation', () => {
  it('should clear all previous errors upon each message if we are not in a recheck', async () => {
    const messages = [{
      kind: 'errors',
      errors: makeFakeFlowOutput(makeFakeFlowError('bar', '/path1'), makeFakeFlowError('foo', '/path1'))
    }, {
      kind: 'errors',
      errors: makeFakeFlowOutput()
    }];
    const expected = [[], [{
      filePath: '/path1',
      messages: [['bar', false], ['foo', false]]
    }], [{
      filePath: '/path1',
      messages: []
    }]];
    const results = await getAbbreviatedResults(messages);
    expect(results).toEqual(expected);
  });
  it('should accumulate errors during a recheck', async () => {
    const messages = [{
      kind: 'errors',
      errors: makeFakeFlowOutput(makeFakeFlowError('foo', '/path1'), makeFakeFlowError('bar', '/path2'))
    }, {
      kind: 'start-recheck'
    }, {
      kind: 'errors',
      errors: makeFakeFlowOutput(makeFakeFlowError('new', '/path1'))
    }, {
      kind: 'errors',
      errors: makeFakeFlowOutput(makeFakeFlowError('asdf', '/path3'))
    }, {
      kind: 'end-recheck'
    }, {
      kind: 'errors',
      errors: makeFakeFlowOutput(makeFakeFlowError('another new', '/path2'), makeFakeFlowError('asdf', '/path3'))
    }];
    const expected = [[], [{
      filePath: '/path1',
      messages: [['foo', false]]
    }, {
      filePath: '/path2',
      messages: [['bar', false]]
    }], [{
      filePath: '/path1',
      messages: [['foo', true]]
    }, {
      filePath: '/path2',
      messages: [['bar', true]]
    }], [{
      filePath: '/path1',
      messages: [['foo', true], ['new', false]]
    }], [{
      filePath: '/path3',
      messages: [['asdf', false]]
    }], [{
      filePath: '/path1',
      messages: [['new', false]]
    }, {
      filePath: '/path2',
      messages: []
    }], [// 'new' is not included here since this message came after the 'end-recheck' message.
    // Because of that, it is considered to be a complete set of errors.
    {
      filePath: '/path2',
      messages: [['another new', false]]
    }, {
      filePath: '/path3',
      messages: [['asdf', false]]
    }, {
      filePath: '/path1',
      messages: []
    }]];
    const results = await getAbbreviatedResults(messages);
    expect(results).toEqual(expected);
  });
  it('should remove all diagnostics when the IDE connection is lost outside of a recheck', async () => {
    const messages = [{
      kind: 'errors',
      errors: makeFakeFlowOutput(makeFakeFlowError('foo', '/path1'), makeFakeFlowError('bar', '/path2'))
    }, null];
    const expected = [[], [{
      filePath: '/path1',
      messages: [['foo', false]]
    }, {
      filePath: '/path2',
      messages: [['bar', false]]
    }], [{
      filePath: '/path1',
      messages: []
    }, {
      filePath: '/path2',
      messages: []
    }]];
    const results = await getAbbreviatedResults(messages);
    expect(results).toEqual(expected);
  });
  it('should remove all diagnostics when the IDE connection is lost during a recheck', async () => {
    const messages = [{
      kind: 'errors',
      errors: makeFakeFlowOutput(makeFakeFlowError('foo', '/path1'), makeFakeFlowError('bar', '/path2'))
    }, {
      kind: 'start-recheck'
    }, {
      kind: 'errors',
      errors: makeFakeFlowOutput(makeFakeFlowError('baz', '/path1'), makeFakeFlowError('asdf', '/path3'))
    }, null];
    const expected = [[], [{
      filePath: '/path1',
      messages: [['foo', false]]
    }, {
      filePath: '/path2',
      messages: [['bar', false]]
    }], [{
      filePath: '/path1',
      messages: [['foo', true]]
    }, {
      filePath: '/path2',
      messages: [['bar', true]]
    }], [{
      filePath: '/path1',
      messages: [['foo', true], ['baz', false]]
    }, {
      filePath: '/path3',
      messages: [['asdf', false]]
    }], [{
      filePath: '/path1',
      messages: []
    }, {
      filePath: '/path2',
      messages: []
    }, {
      filePath: '/path3',
      messages: []
    }]];
    const results = await getAbbreviatedResults(messages);
    expect(results).toEqual(expected);
  });
}); // For simpler comparison in tests. Other tests make sure that messages are properly transformed,
// here we just need to make sure they are properly collated.

async function getAbbreviatedResults(messages) {
  const results = [];
  let state = (0, _FlowSingleProjectLanguageService().emptyDiagnosticsState)();
  results.push((await (0, _FlowSingleProjectLanguageService().getDiagnosticUpdates)(state).toPromise()));

  for (const message of messages) {
    state = (0, _FlowSingleProjectLanguageService().updateDiagnostics)(state, message);
    results.push((await (0, _FlowSingleProjectLanguageService().getDiagnosticUpdates)(state).toPromise() // eslint-disable-line no-await-in-loop
    ));
  }

  return results.map(inner => {
    return Array.from(inner).map(([filePath, msgs]) => {
      return {
        filePath,
        messages: msgs.map(msg => [msg.text, Boolean(msg.stale)])
      };
    });
  });
}

function makeFakeFlowOutput(...errors) {
  return {
    passed: errors.length === 0,
    flowVersion: '0.44.1',
    errors
  };
}

function makeFakeFlowError(text, file) {
  return {
    level: 'error',
    kind: 'infer',
    message: [{
      descr: text,
      loc: {
        source: file,
        start: {
          line: 1,
          column: 1
        },
        end: {
          line: 1,
          column: 4
        }
      }
    }]
  };
}