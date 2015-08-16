'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var SAMPLE_FILE = '/tmp/nuclide-benchmarker-open-edit-save.js';
var FILE_SIZE = 10000;
var TIMEOUT = 30 * 1000;

var PACKAGES = [
  '',
  'nuclide-arcanist',
  'language-javascript',
  'language-javascript,nuclide-flow',
  'language-javascript,nuclide-flow,hyperclick',
];
var REPETITIONS = 3;

var {timedAsync, timedSync, makeSizedFixture} = require('../benchmarker-utils');

module.exports = {
  description: 'times how long a 10k file takes to open, edit, save, close with different packages',
  columns: ['packages', 'activate', 'open', 'insert0', 'insert', 'append', 'save', 'close'],
  timeout: TIMEOUT,
  iterations: PACKAGES.length,
  repetitions: REPETITIONS,
  run: async (iteration: number): Object => {
    var result = {};

    // Create a file of the target size.
    makeSizedFixture(SAMPLE_FILE, FILE_SIZE);

    // Activate packages for this iteration.
    var packages = PACKAGES[iteration].split(',').map(p => p.trim()).filter(p => p != '');
    result.packages = packages.join(',');
    var {time: activate} = await timedAsync(
      Promise.all(packages.map(p => atom.packages.activatePackage(p)))
    );
    result.activate = activate;

    // Open the file, insert text, append text, save and close.
    var {ret: editor, time: open} = await timedAsync(atom.workspace.open(SAMPLE_FILE));
    result.open = open;

    // The first insertion forces buffer tokenization and is much slower than subsequent mutations.
    editor.moveToTop();
    result.insert0 = timedSync(() => editor.insertText('// new line\n')).time;

    editor.moveToTop();
    result.insert = timedSync(() => editor.insertText('// new line\n')).time;

    editor.moveToBottom();
    result.append = timedSync(() => editor.insertText('// new line\n')).time;

    result.save = timedSync(() => editor.save()).time;
    result.close = timedSync(() => atom.workspace.destroyActivePaneItemOrEmptyPane()).time;

    return result;
  },
};
