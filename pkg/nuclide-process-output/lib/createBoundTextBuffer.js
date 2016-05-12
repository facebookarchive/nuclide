Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.default = createBoundTextBuffer;

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

/**
 * Create a text buffer that's bound to the process.
 */

function createBoundTextBuffer(processOutputStore, outputHandler) {

  var buffer = new (_atom2 || _atom()).TextBuffer({
    load: false,
    text: ''
  });

  var update = function update(data) {
    if (outputHandler) {
      outputHandler(buffer, data);
    } else {
      // `{undo: 'skip'}` disables the TextEditor's "undo system".
      buffer.append(data, { undo: 'skip' });
    }
  };

  // Update the text buffer with the initial contents of the store.
  update(processOutputStore.getStdout() || '');
  update(processOutputStore.getStderr() || '');

  var disposable = new (_atom2 || _atom()).CompositeDisposable(processOutputStore.observeStdout(update), processOutputStore.observeStderr(update));

  buffer.onDidDestroy(function () {
    return disposable.dispose();
  });

  return buffer;
}

module.exports = exports.default;