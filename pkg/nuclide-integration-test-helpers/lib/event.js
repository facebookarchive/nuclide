Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.dispatchKeyboardEvent = dispatchKeyboardEvent;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Use this function to simulate keyboard shortcuts or special keys, e.g. cmd-v, escape, or tab.
 * For regular text input the TextEditor.insertText method should be used.
 *
 * @param key A single character key to be sent or a special token such as 'escape' or 'tab'.
 * @param target The DOM element to which this event will be sent.
 * @param metaKeys An object denoting which meta keys are pressed for this keyboard event.
 */

function dispatchKeyboardEvent(key, target) {
  var metaKeys = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var alt = metaKeys.alt;
  var cmd = metaKeys.cmd;
  var ctrl = metaKeys.ctrl;
  var shift = metaKeys.shift;

  var event = atom.keymaps.constructor.buildKeydownEvent(key, {
    target: target,
    alt: Boolean(alt),
    cmd: Boolean(cmd),
    ctrl: Boolean(ctrl),
    shift: Boolean(shift)
  });
  atom.keymaps.handleKeyboardEvent(event);
}