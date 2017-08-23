'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jasmineAttachWorkspace = jasmineAttachWorkspace;


// Attach the Atom workspace to the DOM, and give it a reasonable size.
// This is important for tests that touch the text editor in 1.19+, as they'll have a height of 0
// unless properly attached with a valid viewport.
function jasmineAttachWorkspace() {
  jasmine.attachToDOM(atom.views.getView(atom.workspace));

  // Set the testing window dimensions (smallish, yet realistic).
  const styleCSS = `
    height: 600px;
    width: 1000px;
  `;
  const content = document.querySelector('#jasmine-content');

  if (!(content != null)) {
    throw new Error('Invariant violation: "content != null"');
  }

  content.setAttribute('style', styleCSS);
} /**
   * Copyright (c) 2017-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   * 
   * @format
   */