'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {uncachedRequire, spyOnGetterValue} = require('nuclide-test-helpers');
var {Range} = require('atom');

const TYPE_HINT_PROVIDER = '../lib/TypeHintProvider';

describe('TypeHintProvider.js', () => {
  var editor = {
    getPath() { return ''; },
    getText() { return ''; },
  };
  var position = [1, 1];
  var range = new Range([1, 2], [3, 4]);

  var typeHintProvider;

  afterEach(() => {
    // we assume here that runWith is called in every spec -- otherwise these
    // will not be spies
    jasmine.unspy(require('nuclide-atom-helpers'), 'extractWordAtPosition');
    jasmine.unspy(require('nuclide-commons'), 'getConfigValueAsync');
    jasmine.unspy(require('nuclide-client'), 'getServiceByNuclideUri');
  });

  async function runWith(enabled, type, word) {
    spyOn(require('nuclide-commons'), 'getConfigValueAsync')
      .andReturn(() => Promise.resolve(enabled));
    spyOn(require('nuclide-client'), 'getServiceByNuclideUri').andReturn({
      getType() { return Promise.resolve(type); },
    });
    spyOnGetterValue(require('nuclide-atom-helpers'), 'extractWordAtPosition')
      .andReturn(word);

    typeHintProvider = new (uncachedRequire(require, TYPE_HINT_PROVIDER))();
    return await typeHintProvider.typeHint(editor, position);
  }

  it('should return null when disabled', () => {
    waitsForPromise(async () => {
      expect(await runWith(false, 'foo', {range})).toBe(null);
    });
  });

  it('should return the type', () => {
    waitsForPromise(async () => {
      expect((await runWith(true, 'foo', {range})).hint).toBe('foo');
    });
  });

  it('should return the range', () => {
    waitsForPromise(async () => {
      expect((await runWith(true, 'foo', {range})).range).toBe(range);
    });
  });

  it('should return null when the type is null', () => {
    waitsForPromise(async () => {
      expect(await runWith(true, null, {range})).toBe(null);
    });
  });

  it('should return a default range when the word is null', () => {
    waitsForPromise(async () => {
      expect((await runWith(true, 'foo', null)).range)
        .toEqual(new Range(position, position));
    });
  });
});
