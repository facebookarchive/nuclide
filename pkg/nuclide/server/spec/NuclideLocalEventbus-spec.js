'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const temp = require('temp').track();
const fs = require('fs');
const path = require('path');
const {EventEmitter} = require('events');
const NuclideClient = require('../lib/NuclideClient');
const NuclideLocalEventBus = require('../lib/NuclideLocalEventbus');

describe('NuclideLocalEventBus test suite', () => {

  let dirPath;
  let filePath;
  let fileContents;

  let eventBus;

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
