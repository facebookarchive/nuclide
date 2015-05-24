'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */

var path = require('path');
var fs = require('fs');
var HackLanguage = require('../lib/HackLanguage');

describe('HackLanguage', () => {
  var hackLanguage, hackClient;
  beforeEach(() => {
    hackClient = {dispose: () => {}};
    hackLanguage = new HackLanguage(hackClient);
  });

  afterEach(() => {
    hackLanguage.dispose();
  });

  describe('getDiagnostics()', () => {
    it('gets the file errors', () => {
      waitsForPromise(async () => {
        var filePath = path.join(__dirname, 'fixtures', 'HackExample1.php');
        var fileContents = fs.readFileSync(filePath, 'utf8');

        var errors = await hackLanguage.getDiagnostics(filePath, fileContents);

        expect(errors.length).toBe(1);
        expect(errors[0].path).toBe(filePath);
        expect(errors[0].linter).toBe('hack');
        expect(errors[0].level).toBe('error');
        expect(errors[0].range.start).toEqual({ row : 14, column : 11 });
        expect(errors[0].line).toBe(14);
        expect(errors[0].col).toBe(11);
        expect(errors[0].message).toMatch(/\(Hack\) await.*async/);
      });
    });
  });

  describe('getCompletions()', () => {
    it('gets the local completions', () => {
      waitsForPromise(async () => {
        var filePath = path.join(__dirname, 'fixtures', 'HackExample2.php');
        var fileContents = fs.readFileSync(filePath, 'utf8');
        var completionOffset = fileContents.indexOf('->') + 2;

        var completions = await hackLanguage.getCompletions(filePath, fileContents, completionOffset);

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
        var contents = `<?hh // strict
  // misplaced comment and class
  class HackClass {}`;
        var newSource = await hackLanguage.formatSource(contents, 1, contents.length+1);
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
        var filePath = path.join(__dirname, 'fixtures', 'HackExample3.php');
        var fileContents = fs.readFileSync(filePath, 'utf8');

        var nullType = await hackLanguage.getType(filePath, fileContents, 'WebSupportFormCountryTypeahead', 4, 14);
        expect(nullType).toBeNull();
        var timeZoneType = await hackLanguage.getType(filePath, fileContents, '$timezone_id', 7, 27);
        expect(timeZoneType).toBe('TimeZoneTypeType');
        var groupedAdsType = await hackLanguage.getType(filePath, fileContents, '$grouped_ads', 9, 11);
        expect(groupedAdsType).toBe('array<string, array>');
      });
    });
  });

  describe('getDefinition()', () => {
    it('gets the local definition', () => {
      waitsForPromise(async () => {
        var filePath = path.join(__dirname, 'fixtures', 'HackExample1.php');
        var fileContents = fs.readFileSync(filePath, 'utf8');
        var lineNumber = 15;
        var column = 26;
        var lineText = fileContents.split(/\r\n|\n/)[lineNumber - 1];

        var definitions = await hackLanguage.getDefinition(filePath, fileContents, lineNumber, column, lineText);

        expect(definitions.length).toBe(1);
        expect(definitions[0]).toEqual({
          path: filePath,
          line: 8,
          column: 7,
          length: 9,
        });
      });
    });
  });

});
