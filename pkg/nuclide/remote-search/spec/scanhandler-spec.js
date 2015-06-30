'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var fs = require('fs');
var path = require('path');
var scanhandler = require('./../lib/scanhandler');

describe('Scan Handler Tests', () => {
  it('Should scan files in a directory', () => {
    var inputDir = path.join(__dirname, 'fixtures', 'basic');
    var expected = JSON.parse(fs.readFileSync(inputDir + '.json'));

    waitsForPromise(async () => {
      var results = await scanhandler.search(inputDir, 'Hello World');
      expect(results).toEqual(expected);
    });
  });
});
