/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var babel = require('babel-core');
var fs = require('fs');
var transformer = require('../lib/main');

// Strips off metadata from AST nodes. Helpful when comparing ASTs for equality.
function stripMeta(node) {
  delete node.start;
  delete node.end;
  delete node.leadingComments;
  delete node.trailingComments;
  delete node.raw;
  for (var p in node) {
    if (node[p] && typeof node[p] === 'object') {
      stripMeta(node[p]);
    }
  }
  return node;
}

function assertTransformation(source, expected) {
  var output = babel.transform(source, {
    plugins: [{
      position: 'before',
      transformer: transformer,
    }],
    blacklist: ['strict'],
  }).code;

  expect(
    stripMeta(babel.parse(output))
  ).toEqual(
    stripMeta(babel.parse(expected))
  );
}

var TESTS = [
  'default-specifier',
  'multiple-specifiers',
  'namespace-specifier',
  'no-assign',
  'no-shadow',
  'no-specifiers',
  'renamed-default-specifier',
  'renamed-specifier',
  'single-specifier',
];

describe('inline-imports', function() {
  TESTS.forEach(function(name) {
    it('should handle ' + name, function() {
      const testPath = 'spec/fixtures/' + name + '.test';
      const errorPath = 'spec/fixtures/' + name + '.error';
      const expectedPath = 'spec/fixtures/' + name + '.expected';
      var source = fs.readFileSync(testPath, 'utf8');
      if (fs.existsSync(errorPath)) {
        var error = fs.readFileSync(errorPath, 'utf8').trim();
        expect(assertTransformation.bind(null, source, '')).toThrow(error);
      } else {
        var expected = fs.readFileSync(expectedPath, 'utf8');
        assertTransformation(source, expected);
      }
    });
  });
});
