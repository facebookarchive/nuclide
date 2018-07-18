"use strict";

var _atom = require("atom");

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
// Package activation is not supported yet
describe.skip('DefinitionHyperclick', () => {
  let provider;
  const definitionProvider = {
    priority: 20,
    name: '',
    grammarScopes: ['text.plain.null-grammar'],
    wordRegExp: null,
    getDefinition: () => Promise.resolve(null)
  };
  let editor;
  const position = new _atom.Point(0, 0);
  let goToLocation;
  let disposables;
  beforeEach(() => {
    atom.packages.activatePackage('atom-ide-definitions');
    editor = new _atom.TextEditor();
    goToLocation = jest.spyOn(require("../../../../nuclide-commons-atom/go-to-location"), 'goToLocation');
    disposables = new (_UniversalDisposable().default)(atom.packages.serviceHub.provide('definitions', '0.1.0', definitionProvider), atom.packages.serviceHub.consume('hyperclick', '0.1.0', x => {
      provider = x;
    }));
  });
  afterEach(() => {
    disposables.dispose();
  });
  it('no definition service', async () => {
    jest.spyOn(editor, 'getGrammar').mockReturnValue({
      scopeName: 'blah'
    });

    if (!(provider != null)) {
      throw new Error("Invariant violation: \"provider != null\"");
    }

    if (!(provider.getSuggestion != null)) {
      throw new Error("Invariant violation: \"provider.getSuggestion != null\"");
    }

    const result = await provider.getSuggestion(editor, position);
    expect(result).toBe(null);
  });
  it('no definition', async () => {
    const spy = jest.spyOn(definitionProvider, 'getDefinition').mockReturnValue(null);

    if (!(provider != null)) {
      throw new Error("Invariant violation: \"provider != null\"");
    }

    if (!(provider.getSuggestion != null)) {
      throw new Error("Invariant violation: \"provider.getSuggestion != null\"");
    }

    const result = await provider.getSuggestion(editor, position);
    expect(result).toBe(null);
    expect(spy).toHaveBeenCalledWith(editor, position);
  });
  it('definition - single', async () => {
    const definition = {
      queryRange: [new _atom.Range(new _atom.Point(1, 1), new _atom.Point(1, 5))],
      definitions: [{
        path: 'path1',
        position: new _atom.Point(1, 2),
        range: null,
        id: 'symbol-name',
        name: null,
        projectRoot: null
      }]
    };
    const spy = jest.spyOn(definitionProvider, 'getDefinition').mockReturnValue(Promise.resolve(definition));

    if (!(provider != null)) {
      throw new Error("Invariant violation: \"provider != null\"");
    }

    if (!(provider.getSuggestion != null)) {
      throw new Error("Invariant violation: \"provider.getSuggestion != null\"");
    }

    const result = await provider.getSuggestion(editor, position);

    if (!(result != null)) {
      throw new Error("Invariant violation: \"result != null\"");
    }

    expect(result.range).toEqual(definition.queryRange);
    expect(spy).toHaveBeenCalledWith(editor, position);
    expect(goToLocation).not.toHaveBeenCalled();

    if (!(result != null)) {
      throw new Error("Invariant violation: \"result != null\"");
    }

    if (!(result.callback != null)) {
      throw new Error("Invariant violation: \"result.callback != null\"");
    }

    if (!(typeof result.callback === 'function')) {
      throw new Error("Invariant violation: \"typeof result.callback === 'function'\"");
    }

    result.callback();
    expect(goToLocation).toHaveBeenCalledWith('path1', {
      line: 1,
      column: 2
    });
  });
  it('definition - multiple', async () => {
    const defs = {
      queryRange: [new _atom.Range(new _atom.Point(1, 1), new _atom.Point(1, 5))],
      definitions: [{
        path: '/a/b/path1',
        position: new _atom.Point(1, 2),
        range: null,
        id: 'symbol-name',
        name: 'd1',
        projectRoot: '/a'
      }, {
        path: '/a/b/path2',
        position: new _atom.Point(3, 4),
        range: null,
        id: 'symbol-name2',
        name: 'd2',
        projectRoot: '/a'
      }, {
        path: '/a/b/path3',
        position: new _atom.Point(3, 4),
        range: null,
        id: 'symbol-without-name',
        projectRoot: '/a'
      }]
    };
    const spy = jest.spyOn(definitionProvider, 'getDefinition').mockReturnValue(Promise.resolve(defs));

    if (!(provider != null)) {
      throw new Error("Invariant violation: \"provider != null\"");
    }

    if (!(provider.getSuggestion != null)) {
      throw new Error("Invariant violation: \"provider.getSuggestion != null\"");
    }

    const result = await provider.getSuggestion(editor, position);

    if (!(result != null)) {
      throw new Error("Invariant violation: \"result != null\"");
    }

    expect(result.range).toEqual(defs.queryRange);
    expect(spy).toHaveBeenCalledWith(editor, position);
    expect(goToLocation).not.toHaveBeenCalled();
    const callbacks = result.callback;
    expect(callbacks.length).toBe(3);
    expect(callbacks[0].title).toBe('d1 (b/path1)');
    expect(typeof callbacks[0].callback).toBe('function');
    expect(callbacks[1].title).toBe('d2 (b/path2)');
    expect(typeof callbacks[1].callback).toBe('function');
    expect(callbacks[2].title).toBe('b/path3:4');
    expect(typeof callbacks[2].callback).toBe('function');
    callbacks[1].callback();
    expect(goToLocation).toHaveBeenCalledWith('/a/b/path2', {
      line: 3,
      column: 4
    });
  });
  it('falls back to lower-priority providers', async () => {
    const def = {
      queryRange: [new _atom.Range(new _atom.Point(1, 1), new _atom.Point(1, 5))],
      definitions: [{
        path: 'path1',
        position: new _atom.Point(1, 2),
        range: null,
        id: 'symbol-name',
        name: null,
        projectRoot: null
      }]
    };
    const newProvider = {
      priority: 10,
      name: '',
      grammarScopes: ['text.plain.null-grammar'],
      getDefinition: () => Promise.resolve(def)
    };
    atom.packages.serviceHub.provide('definitions', '0.1.0', newProvider);

    if (!(provider != null)) {
      throw new Error("Invariant violation: \"provider != null\"");
    }

    if (!(provider.getSuggestion != null)) {
      throw new Error("Invariant violation: \"provider.getSuggestion != null\"");
    }

    const result = await provider.getSuggestion(editor, position);
    expect(result).not.toBe(null);

    if (!(result != null)) {
      throw new Error("Invariant violation: \"result != null\"");
    }

    expect(result.range).toEqual(def.queryRange);
  });
  it('does not cache null values', async () => {
    editor.setText('test');
    const def = {
      queryRange: [new _atom.Range(new _atom.Point(1, 1), new _atom.Point(1, 5))],
      definitions: [{
        path: 'path1',
        position: new _atom.Point(1, 2),
        range: null,
        id: 'symbol-name',
        name: null,
        projectRoot: null
      }]
    };
    const newProvider = {
      priority: 10,
      name: '',
      grammarScopes: ['text.plain.null-grammar'],
      getDefinition: () => Promise.resolve(null)
    };
    atom.packages.serviceHub.provide('definitions', '0.1.0', newProvider);

    if (!(provider != null)) {
      throw new Error("Invariant violation: \"provider != null\"");
    }

    if (!(provider.getSuggestion != null)) {
      throw new Error("Invariant violation: \"provider.getSuggestion != null\"");
    }

    let result = await provider.getSuggestion(editor, position);
    expect(result).toBe(null);

    newProvider.getDefinition = () => Promise.resolve(def);

    if (!(provider.getSuggestion != null)) {
      throw new Error("Invariant violation: \"provider.getSuggestion != null\"");
    }

    result = await provider.getSuggestion(editor, position);

    if (!(result != null)) {
      throw new Error("Invariant violation: \"result != null\"");
    }

    expect(result.range).toEqual(def.queryRange);
  });
});