'use strict';

var _ImportFormatter;

function _load_ImportFormatter() {
  return _ImportFormatter = require('../src/lib/ImportFormatter');
}

var _Completions;

function _load_Completions() {
  return _Completions = require('../src/Completions');
}

var _AutoImportsManager;

function _load_AutoImportsManager() {
  return _AutoImportsManager = require('../src/lib/AutoImportsManager');
}

describe('getImportInformation', () => {
  it('Should correctly parse value imports', () => {
    const importInformation = (0, (_Completions || _load_Completions()).getImportInformation)('import {something}');
    expect(importInformation).toBeDefined();
    expect(importInformation && importInformation.ids.length).toBe(1);
    expect(importInformation && importInformation.ids[0]).toBe('something');
    expect(importInformation && importInformation.importType).toBe('namedValue');
    expect(importInformation && importInformation.isComplete).toBe(true);
  });
  it('Should correctly parse default imports', () => {
    const importInformation = (0, (_Completions || _load_Completions()).getImportInformation)('import TextDocuments ');
    expect(importInformation).toBeDefined();
    expect(importInformation && importInformation.ids.length).toBe(1);
    expect(importInformation && importInformation.ids[0]).toBe('TextDocuments');
    expect(importInformation && importInformation.importType).toBe('defaultValue');
    expect(importInformation && importInformation.isComplete).toBe(true);
  });
  it('Should correctly parse type imports', () => {
    const importInformation = (0, (_Completions || _load_Completions()).getImportInformation)('import  type {SomeType }');
    expect(importInformation).toBeDefined();
    expect(importInformation && importInformation.ids.length).toBe(1);
    expect(importInformation && importInformation.ids[0]).toBe('SomeType');
    expect(importInformation && importInformation.importType).toBe('namedType');
    expect(importInformation && importInformation.isComplete).toBe(true);
  });
  it('Should correctly parse multiple values', () => {
    const importInformation = (0, (_Completions || _load_Completions()).getImportInformation)('import {one,  two, three, four}');
    expect(importInformation).toBeDefined();
    expect(importInformation && importInformation.ids.length).toBe(4);
    expect(importInformation && importInformation.ids[0]).toBe('one');
    expect(importInformation && importInformation.ids[1]).toBe('two');
    expect(importInformation && importInformation.ids[2]).toBe('three');
    expect(importInformation && importInformation.ids[3]).toBe('four');
    expect(importInformation && importInformation.importType).toBe('namedValue');
    expect(importInformation && importInformation.isComplete).toBe(true);
  });
  it('Should correctly parse multiple types', () => {
    const importInformation = (0, (_Completions || _load_Completions()).getImportInformation)('import type {One,  Two, Three, Four,}');
    expect(importInformation).toBeDefined();
    expect(importInformation && importInformation.ids.length).toBe(4);
    expect(importInformation && importInformation.ids[0]).toBe('One');
    expect(importInformation && importInformation.ids[1]).toBe('Two');
    expect(importInformation && importInformation.ids[2]).toBe('Three');
    expect(importInformation && importInformation.ids[3]).toBe('Four');
    expect(importInformation && importInformation.importType).toBe('namedType');
  });
  it('Should ignore extra whitespace', () => {
    const importInformation = (0, (_Completions || _load_Completions()).getImportInformation)('      import { something  }  ');
    expect(importInformation).toBeDefined();
    expect(importInformation && importInformation.ids.length).toBe(1);
    expect(importInformation && importInformation.ids[0]).toBe('something');
    expect(importInformation && importInformation.isComplete).toBe(true);
  });
  it('Should handle importing type defaults', () => {
    const importInformation = (0, (_Completions || _load_Completions()).getImportInformation)('import type TextDocuments ');
    expect(importInformation).toBeDefined();
    expect(importInformation && importInformation.ids.length).toBe(1);
    expect(importInformation && importInformation.ids[0]).toBe('TextDocuments');
    expect(importInformation && importInformation.importType).toBe('defaultType');
    expect(importInformation && importInformation.isComplete).toBe(true);
  });
  it('Should handle all valid Javascript identifiers', () => {
    const importInformation = (0, (_Completions || _load_Completions()).getImportInformation)('import {WORKSPACE_VIEW_URI, $DOLLAR_SIGNS$}');
    expect(importInformation).toBeDefined();
    expect(importInformation && importInformation.ids.length).toBe(2);
    expect(importInformation && importInformation.ids[0]).toBe('WORKSPACE_VIEW_URI');
    expect(importInformation && importInformation.ids[1]).toBe('$DOLLAR_SIGNS$');
    expect(importInformation && importInformation.importType).toBe('namedValue');
    expect(importInformation && importInformation.isComplete).toBe(true);
  });
  it('Should correctly parse incomplete default import', () => {
    const importInformation = (0, (_Completions || _load_Completions()).getImportInformation)('import TextDoc');
    expect(importInformation).toBeDefined();
    expect(importInformation && importInformation.ids.length).toBe(1);
    expect(importInformation && importInformation.ids[0]).toBe('TextDoc');
    expect(importInformation && importInformation.importType).toBe('defaultValue');
    expect(importInformation && importInformation.isComplete).toBe(false);
  });
  it('Should correctly parse incomplete default type import', () => {
    const importInformation = (0, (_Completions || _load_Completions()).getImportInformation)('import type TextDoc');
    expect(importInformation).toBeDefined();
    expect(importInformation && importInformation.ids.length).toBe(1);
    expect(importInformation && importInformation.ids[0]).toBe('TextDoc');
    expect(importInformation && importInformation.importType).toBe('defaultType');
    expect(importInformation && importInformation.isComplete).toBe(false);
  });
  it('Should correctly parse incomplete named value import', () => {
    const importInformation = (0, (_Completions || _load_Completions()).getImportInformation)('import {AutoImpor');
    expect(importInformation).toBeDefined();
    expect(importInformation && importInformation.ids.length).toBe(1);
    expect(importInformation && importInformation.ids[0]).toBe('AutoImpor');
    expect(importInformation && importInformation.importType).toBe('namedValue');
    expect(importInformation && importInformation.isComplete).toBe(false);
  });
  it('Should correctly parse incomplete named type import', () => {
    const importInformation = (0, (_Completions || _load_Completions()).getImportInformation)('import type {AutoImpor');
    expect(importInformation).toBeDefined();
    expect(importInformation && importInformation.ids.length).toBe(1);
    expect(importInformation && importInformation.ids[0]).toBe('AutoImpor');
    expect(importInformation && importInformation.importType).toBe('namedType');
    expect(importInformation && importInformation.isComplete).toBe(false);
  });
  it('Should correctly parse incomplete require', () => {
    const importInformation = (0, (_Completions || _load_Completions()).getImportInformation)('const CSS');
    expect(importInformation).toBeDefined();
    expect(importInformation && importInformation.ids.length).toBe(1);
    expect(importInformation && importInformation.ids[0]).toBe('CSS');
    expect(importInformation && importInformation.importType).toBe('requireImport');
    expect(importInformation && importInformation.isComplete).toBe(false);
  });
  it('Should correctly parse complete require', () => {
    const importInformation = (0, (_Completions || _load_Completions()).getImportInformation)('const CSS ');
    expect(importInformation).toBeDefined();
    expect(importInformation && importInformation.ids.length).toBe(1);
    expect(importInformation && importInformation.ids[0]).toBe('CSS');
    expect(importInformation && importInformation.importType).toBe('requireImport');
    expect(importInformation && importInformation.isComplete).toBe(true);
  });
  it('Should not match const with leading whitespace', () => {
    let importInformation = (0, (_Completions || _load_Completions()).getImportInformation)(' const CSS');
    expect(importInformation).toBeNull();
    importInformation = (0, (_Completions || _load_Completions()).getImportInformation)('  const CSS');
    expect(importInformation).toBeNull();
    importInformation = (0, (_Completions || _load_Completions()).getImportInformation)('      const CSS');
    expect(importInformation).toBeNull();
  });
  it('Should correctly parse destructured require statement', () => {
    const importInformation = (0, (_Completions || _load_Completions()).getImportInformation)('const {someId, someOtherType}');
    expect(importInformation).toBeDefined();
    expect(importInformation && importInformation.ids.length).toBe(2);
    expect(importInformation && importInformation.ids[0]).toBe('someId');
    expect(importInformation && importInformation.ids[1]).toBe('someOtherType');
    expect(importInformation && importInformation.importType).toBe('requireDestructured');
    expect(importInformation && importInformation.isComplete).toBe(true);
  });
  it('Should correctly parse incomplete destructured require statement', () => {
    const importInformation = (0, (_Completions || _load_Completions()).getImportInformation)('const {some');
    expect(importInformation).toBeDefined();
    expect(importInformation && importInformation.ids.length).toBe(1);
    expect(importInformation && importInformation.ids[0]).toBe('some');
    expect(importInformation && importInformation.importType).toBe('requireDestructured');
    expect(importInformation && importInformation.isComplete).toBe(false);
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict-local
     * @format
     */

describe('Completion Functions', () => {
  let autoImportsManager;
  let importsFormatter;

  beforeEach(() => {
    autoImportsManager = new (_AutoImportsManager || _load_AutoImportsManager()).AutoImportsManager([]);
    importsFormatter = new (_ImportFormatter || _load_ImportFormatter()).ImportFormatter(['/a/node_modules'], false);

    autoImportsManager.indexFile('/a/b/test2.js', 'export function test2() {}');
    autoImportsManager.indexFile('/a/above.js', 'export function test() {}\nexport function testAbove() {}');
    autoImportsManager.indexFile('/a/b/test3.js', 'export function test() {}');
    autoImportsManager.indexFile('/a/node_modules/module', 'export function test() {}\nexport class MyClass {}');
  });

  function getCompletionText(completion) {
    const { textEdit } = completion;
    if (textEdit == null) {
      return '';
    }
    return textEdit.newText;
  }

  describe('provideFullImportCompletions', () => {
    it('returns completions in order', () => {
      const importInformation = {
        ids: ['test'],
        importType: 'namedValue',
        isComplete: false
      };
      const completions = (0, (_Completions || _load_Completions()).provideFullImportCompletions)(importInformation, importsFormatter, autoImportsManager, '/a/b/test.js', '', 0);
      // 1) IDs need to be ordered by relevance.
      // 2) For the same ID, prefer node modules -> same directory -> other directories.
      expect(completions.map(getCompletionText)).toEqual(["import {test} from './test3';", "import {test} from '../above';", "import {test} from 'module';", "import {test2} from './test2';", "import {testAbove} from '../above';"]);
    });
  });

  describe('provideImportFileCompletions', () => {
    it('provides exact matches', () => {
      const importInformation = {
        ids: ['test', 'testAbove'],
        importType: 'namedValue',
        isComplete: false
      };
      const completions = (0, (_Completions || _load_Completions()).provideImportFileCompletions)(importInformation, importsFormatter, autoImportsManager, '/a/b/test.js', '', 0);
      expect(completions.map(getCompletionText)).toEqual(["import {test, testAbove} from '../above';"]);

      importInformation.ids = ['test'];
      const singleCompletions = (0, (_Completions || _load_Completions()).provideImportFileCompletions)(importInformation, importsFormatter, autoImportsManager, '/a/b/test.js', '', 0);
      expect(singleCompletions.map(getCompletionText)).toEqual(["import {test} from './test3';", "import {test} from '../above';", "import {test} from 'module';"]);
    });
    it('does not complete within the same file', () => {
      const importInformation = {
        ids: ['test'],
        importType: 'namedValue',
        isComplete: false
      };
      const completions = (0, (_Completions || _load_Completions()).provideImportFileCompletions)(importInformation, importsFormatter, autoImportsManager, '/a/b/test3.js', '', 0);
      expect(completions.map(getCompletionText)).toEqual([
      // Note the absence of test3.js.
      "import {test} from '../above';", "import {test} from 'module';"]);
    });
    it('does not suggest functions for type imports', () => {
      const importInformation = {
        ids: ['test'],
        importType: 'namedType',
        isComplete: false
      };
      const completions = (0, (_Completions || _load_Completions()).provideImportFileCompletions)(importInformation, importsFormatter, autoImportsManager, '/a/b/test3.js', '', 0);
      expect(completions.map(getCompletionText)).toEqual([]);
    });
    it('suggests classes for type imports', () => {
      const importInformation = {
        ids: ['MyClass'],
        importType: 'namedType',
        isComplete: false
      };
      const completions = (0, (_Completions || _load_Completions()).provideImportFileCompletions)(importInformation, importsFormatter, autoImportsManager, '/a/b/test3.js', '', 0);
      expect(completions.map(getCompletionText)).toEqual(["import type {MyClass} from 'module';"]);
    });
  });
});