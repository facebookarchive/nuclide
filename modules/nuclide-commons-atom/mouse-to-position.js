'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bufferPositionForMouseEvent = bufferPositionForMouseEvent;
function bufferPositionForMouseEvent(event, editor = null) {
  const _editor = editor || atom.workspace.getActiveTextEditor();

  if (!(_editor != null)) {
    throw new Error('Invariant violation: "_editor != null"');
  }

  const view = atom.views.getView(_editor);
  const component = view.component;

  if (!(component != null)) {
    throw new Error('Invariant violation: "component != null"');
  }
  // Beware, screenPositionForMouseEvent is not a public api and may change in future versions.


  const screenPosition = component.screenPositionForMouseEvent(event);
  return _editor.bufferPositionForScreenPosition(screenPosition);
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