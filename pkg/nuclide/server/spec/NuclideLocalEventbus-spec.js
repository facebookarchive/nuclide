'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var temp = require('temp').track();
var fs = require('fs');
var path = require('path');
var {EventEmitter} = require('events');
var NuclideClient = require('../lib/NuclideClient');
var NuclideLocalEventBus = require('../lib/NuclideLocalEventbus');

describe('NuclideLocalEventBus test suite', () => {

  var dirPath;
  var filePath;
  var fileContents;
  var client;
  var eventBus;

  beforeEach(() => {
    dirPath = temp.mkdirSync();
    filePath = path.join(dirPath, 'file.txt');
    fileContents = 'sample contents!';
    fs.writeFileSync(filePath, fileContents);
    fs.mkdirSync(path.join(dirPath, '.git'));
    eventBus = new NuclideLocalEventBus();
    client = new NuclideClient('test', eventBus);
  });

  afterEach(() => {
    eventBus.close();
  });

});
