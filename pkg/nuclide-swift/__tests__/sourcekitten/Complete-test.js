"use strict";

function _Complete() {
  const data = require("../../lib/sourcekitten/Complete");

  _Complete = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict
 * @format
 * @emails oncall+nuclide
 */
describe('sourceKittenSourcetextToAtomSnippet', () => {
  let sourcetext;
  describe('a function with three parameters', () => {
    beforeEach(() => {
      sourcetext = 'foobar(<#T##x: Int##Int#>, y: <#T##String#>, baz: <#T##[String]#>)';
    });
    it('creates a snippet', () => {
      expect((0, _Complete().sourceKittenSourcetextToAtomSnippet)(sourcetext)).toBe('foobar(${1:x: Int}, y: ${2:String}, baz: ${3:[String]})');
    });
  });
});