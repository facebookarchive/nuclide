'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {readdirSync} = require('fs');
const {readFile} = require('../../commons').fsPromise;
const {reprint} = require('../lib/main');

// Helpful for debugging.
const only = new Set([
  // 'readme-demo',
]);

function getTests() {
  if (only.size > 0) {
    return only;
  }
  const files = readdirSync('./fixtures/');
  const tests = new Set();
  for (const file of files) {
    if (/\.test$/.test(file)) {
      tests.add(file.substring(0, file.length - 5));
    }
  }
  return tests;
}

describe('reprint', () => {
  getTests().forEach(name => {
    it(`should ${name}`, () => {
      const testPath = 'fixtures/' + name + '.test';
      const expectedPath = 'fixtures/' + name + '.expected';
      waitsForPromise(async () => {
        const fileContents = await readFile(testPath, 'utf8');
        const actual = reprint(fileContents).source;
        const expected = await readFile(expectedPath, 'utf8');
        // Helpful for debugging
        // firstDifference(actual, expected);
        expect(actual).toBe(expected);
      });
    });
  });
});

function firstDifference(a, b) { //eslint-disable-line no-unused-vars
  /*eslint-disable no-console*/
  for (let i = 0; i < a.length && i < b.length; i++) {
    if (a.charAt(i) !== b.charAt(i)) {
      console.log();
      console.log(i);
      console.log('a: "' + a.charAt(i) + '"');
      console.log('b: "' + b.charAt(i) + '"');
      console.log();
      break;
    }
  }
}
