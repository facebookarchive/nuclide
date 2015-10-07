'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {
  getCompletionBodyInline,
  getCompletionBodyMultiLine,
} = require('../lib/AutocompleteProvider').__test__;

describe('AutocompleteProvider', () => {

  describe('@getCompletionBodyMultiLine', () => {
    it('converts method call with first argument being longest', () => {
      var completion = {};
      completion.chunks = [
        {
          spelling: 'ArgumentOne:',
          isPlaceHolder: false,
        },
        {
          spelling: 'arg1',
          isPlaceHolder: true,
        },
        {
          spelling: ' ',
          isPlaceholder: false,
        },
        {
          spelling: 'arg2:',
          isPlaceHolder: false,
        },
        {
          spelling: 'argTwo',
          isPlaceHolder: true,
        },
        {
          spelling: ' ',
          isPlaceholder: false,
        },
        {
          spelling: 'Argument3:',
          isPlaceHolder: false,
        },
        {
          spelling: 'argument3',
          isPlaceHolder: true,
        },
      ];

      var body = getCompletionBodyMultiLine(
          completion,
          /* columnOffset */ 10,
          /* indentation */ 2);

      expect(body).toBe(
              'ArgumentOne:${1:arg1}\n' +
        '             arg2:${2:argTwo}\n' +
        '        Argument3:${3:argument3}\n'
      );
    });

    it('converts method call with third argument being longest', () => {
      var completion = {};
      completion.chunks = [
        {
          spelling: 'Arg1:',
          isPlaceHolder: false,
        },
        {
          spelling: 'argumentOne',
          isPlaceHolder: true,
        },
        {
          spelling: ' ',
          isPlaceholder: false,
        },
        {
          spelling: 'arg2:',
          isPlaceHolder: false,
        },
        {
          spelling: 'argTwo',
          isPlaceHolder: true,
        },
        {
          spelling: ' ',
          isPlaceholder: false,
        },
        {
          spelling: 'Argument3:',
          isPlaceHolder: false,
        },
        {
          spelling: 'argument3',
          isPlaceHolder: true,
        },
        {
          spelling: ' ',
          isPlaceholder: false,
        },
        {
          spelling: 'test123',
          isPlaceHolder: false,
        },
        {
          spelling: 'this_is_a_test_placeholder',
          isPlaceHolder: true,
        },
      ];

      var body = getCompletionBodyMultiLine(
          completion,
          /* columnOffset */ 10,
          /* indentation */ 3);

      expect(body).toBe(
              'Arg1:${1:argumentOne}\n' +
        '         arg2:${2:argTwo}\n' +
        '    Argument3:${3:argument3}\n' +
        '      test123:${4:this_is_a_test_placeholder}\n'
      );
    });

    it('calls getCompletionBodyMultiLine with odd number of non-empty chunks', () => {
      var completion = {};
      completion.chunks = [
        {
          spelling: 'ArgumentOne:',
          isPlaceHolder: false,
        },
        {
          spelling: 'arg1',
          isPlaceHolder: true,
        },
        {
          spelling: ' ',
          isPlaceholder: false,
        },
        {
          spelling: 'arg2:',
          isPlaceHolder: false,
        },
      ];

      var body = getCompletionBodyMultiLine(
          completion,
          /* columnOffset */ 10,
          /* indentation */ 3);

      expect(body).toBe(null);
    });

    it('calls getCompletionBodyMultiLine with two non-placeholder chunks in a row', () => {
      var completion = {};
      completion.chunks = [
        {
          spelling: 'ArgumentOne:',
          isPlaceHolder: false,
        },
        {
          spelling: 'arg1',
          isPlaceHolder: true,
        },
        {
          spelling: ' ',
          isPlaceholder: false,
        },
        {
          spelling: 'arg2',
          isPlaceholder: false,
        },
        {
          spelling: 'arg2:',
          isPlaceHolder: false,
        },
      ];

      var body = getCompletionBodyMultiLine(
          completion,
          /* columnOffset */ 10,
          /* indentation */ 3);

      expect(body).toBe(null);
    });

    it('calls getCompletionBodyMultiLine with two placeholder chunks in a row', () => {
      var completion = {};
      completion.chunks = [
        {
          spelling: 'ArgumentOne:',
          isPlaceHolder: false,
        },
        {
          spelling: 'arg1',
          isPlaceHolder: true,
        },
        {
          spelling: '   ',
          isPlaceholder: false,
        },
        {
          spelling: 'arg2',
          isPlaceholder: true,
        },
        {
          spelling: 'arg2:',
          isPlaceHolder: false,
        },
      ];

      var body = getCompletionBodyMultiLine(
          completion,
          /* columnOffset */ 10,
          /* indentation */ 3);

      expect(body).toBe(null);
    });
  });

  describe('@getCompletionBodyInline', () => {
    it('converts method call with 2 arguments', () => {
      var completion = {};
      completion.chunks = [
        {
          spelling: 'ArgumentOne:',
          isPlaceHolder: false,
        },
        {
          spelling: 'arg1',
          isPlaceHolder: true,
        },
        {
          spelling: ' ',
          isPlaceholder: false,
        },
        {
          spelling: 'arg2:',
          isPlaceHolder: false,
        },
        {
          spelling: 'argTwo',
          isPlaceHolder: true,
        },
      ];

      var body = getCompletionBodyInline(completion);
      expect(body).toBe('ArgumentOne:${1:arg1} arg2:${2:argTwo}');
    });

    it('converts short completion with no placeholders', () => {
      var completion = {};
      completion.chunks = [
        {
          spelling: 'self',
          isPlaceHolder: false,
        },
      ];

      var body = getCompletionBodyInline(completion);
      expect(body).toBe('self');
    });
  });
});
