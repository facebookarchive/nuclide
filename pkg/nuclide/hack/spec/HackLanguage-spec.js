'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import path from 'path';
import fs from 'fs';
import HackLanguage from '../lib/HackLanguage';

describe('HackLanguage', () => {
  let hackLanguage;
  beforeEach(() => {
    hackLanguage = new HackLanguage(false, '', '');
  });

  afterEach(() => {
    hackLanguage.dispose();
  });

  describe('getDiagnostics()', () => {
    it('gets the file errors', () => {
      waitsForPromise(async () => {
        const filePath = path.join(__dirname, 'fixtures', 'HackExample1.php');
        const fileContents = fs.readFileSync(filePath, 'utf8');

        const errors = await hackLanguage.getDiagnostics(filePath, fileContents);

        expect(errors.length).toBe(1);
        const diagnostics = errors[0].message;
        expect(diagnostics[0].descr).toMatch(/await.*async/);
        expect(diagnostics[0].path).toBe(filePath);
        expect(diagnostics[0].start).toBe(12);
        expect(diagnostics[0].end).toBe(36);
        expect(diagnostics[0].line).toBe(15);
      });
    });
  });

  describe('getCompletions()', () => {
    it('gets the local completions', () => {
      waitsForPromise(async () => {
        const filePath = path.join(__dirname, 'fixtures', 'HackExample2.php');
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const completionOffset = fileContents.indexOf('->') + 2;

        const completions = await hackLanguage.getCompletions(filePath, fileContents, completionOffset);

        expect(completions.length).toBe(2);
        expect(completions[0]).toEqual({
          matchText : 'doSomething',
          matchSnippet: 'doSomething(${1:$inputText})',
          matchType : 'function($inputText): string',
        });
        expect(completions[1]).toEqual({
          matchText : 'getPayload',
          matchSnippet: 'getPayload()',
          matchType : 'function(): string',
        });
      });
    });
  });

  describe('formatSource()', () => {
    it('adds new line at the end and fixes indentation', () => {
      waitsForPromise(async () => {
        const contents = `<?hh // strict
  // misplaced comment and class
  class HackClass {}`;
        const newSource = await hackLanguage.formatSource(contents, 1, contents.length + 1);
        expect(newSource).toBe(`<?hh // strict
// misplaced comment and class
class HackClass {}
`);
      });
    });
  });

  describe('getType()', () => {
    it('gets the defined and inferred types', () => {
      waitsForPromise(async () => {
        const filePath = path.join(__dirname, 'fixtures', 'HackExample3.php');
        const fileContents = fs.readFileSync(filePath, 'utf8');

        const nullType = await hackLanguage.getType(filePath, fileContents, 'WebSupportFormCountryTypeahead', 4, 14);
        expect(nullType).toBeNull();
        const timeZoneType = await hackLanguage.getType(filePath, fileContents, '$timezone_id', 7, 27);
        expect(timeZoneType).toBe('TimeZoneTypeType');
        const groupedAdsType = await hackLanguage.getType(filePath, fileContents, '$grouped_ads', 9, 11);
        expect(groupedAdsType).toBe('[shape-like array]');
      });
    });
  });

  describe('getDefinition()', () => {
    it('gets the local definition', () => {
      waitsForPromise(async () => {
        const filePath = path.join(__dirname, 'fixtures', 'HackExample1.php');
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const lineNumber = 15;
        const column = 26;


        const definitions = await hackLanguage._getDefinitionLocationAtPosition(
          filePath, fileContents, lineNumber, column
        );
        expect(definitions).toEqual([{
          path: filePath,
          line: 7,
          column: 6,
          length: 9,
          name : undefined,
          scope : undefined,
          additionalInfo : undefined,
        }]);
      });
    });

    it('_parseStringForExpression returns a php expression from a line', () => {
      const {search} = hackLanguage._parseStringForExpression('  $abcd = 123;', 4);
      expect(search).toEqual('$abcd');
    });

    it('_parseStringForExpression returns an XHP expression from a line', () => {
      const {search} = hackLanguage._parseStringForExpression('  <ui:test:element attr="123">', 7);
      expect(search).toEqual(':ui:test:element');
    });

    it('_parseStringForExpression returns an php expression from a line with <', () => {
      const {search} = hackLanguage._parseStringForExpression('  $abc = $def<$lol;', 11);
      expect(search).toEqual('$def');
    });

    it('_parseStringForExpression returns an php expression from a line with < and >', () => {
      const {search} = hackLanguage._parseStringForExpression('  $abc = $def <$lol && $x > $z;', 11);
      expect(search).toEqual('$def');
    });

    it('_parseStringForExpression returns an php expression from a line with php code and xhp expression', () => {
      const {search} = hackLanguage._parseStringForExpression('  $abc = $get$Xhp() . <ui:button attr="cs">;', 25);
      expect(search).toEqual(':ui:button');
    });

    it('_parseStringForExpression returns an php expression from a line with multiple xhp expression', () => {
      const lineText = '  $abc = <ui:button attr="cs"> . <ui:radio>;';
      expect(hackLanguage._parseStringForExpression(lineText, 4).search).toBe('$abc');
      expect(hackLanguage._parseStringForExpression(lineText, 15).search).toBe(':ui:button');
      expect(hackLanguage._parseStringForExpression(lineText, 23).search).toBe('attr');
      expect(hackLanguage._parseStringForExpression(lineText, 36).search).toBe(':ui:radio');
    });
  });

  describe('getSymbolNameAtPosition()', () => {
    it('gets the symbol name', () => {
      waitsForPromise(async () => {
        const filePath = path.join(__dirname, 'fixtures', 'HackExample1.php');
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const lineNumber = 15;
        const column = 26;
        const symbol = await hackLanguage.getSymbolNameAtPosition(
          filePath,
          fileContents,
          lineNumber,
          column
        );
        expect(symbol).toEqual({
          name: '\\WebSupportFormCountryTypeahead::genPayload',
          type: 2,
          line: 14,
          column: 24,
          length: 10,
        });
      });
    });
  });

  describe('isFinishedLoadingDependencies()', () => {
    it('updates the status of isFinishedLoadingDependencies', () => {
      waitsForPromise(async () => {
        const spy = jasmine.createSpy('callback');
        const filePath = path.join(__dirname, 'fixtures', 'HackExample1.php');
        const fileContents = fs.readFileSync(filePath, 'utf8');
        hackLanguage.onFinishedLoadingDependencies(spy);
        await hackLanguage.updateFile(filePath, fileContents);
        // Initially, dependencies haven't been loaded yet.
        expect(hackLanguage.isFinishedLoadingDependencies()).toEqual(false);
        await hackLanguage.updateDependencies();
        // HackExample1 refers to another class, which Hack tries to load.
        expect(hackLanguage.isFinishedLoadingDependencies()).toEqual(false);
        await hackLanguage.updateDependencies();
        // There's no further dependencies to fetch.
        expect(hackLanguage.isFinishedLoadingDependencies()).toEqual(true);
        expect(spy).toHaveBeenCalled();
      });
    });
  });

});
