'use babel';
/* @flow */

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
export function dispatchKeyboardEvent(
  key: string,
  target: HTMLElement,
  metaKeys: {
    alt?: boolean;
    cmd?: boolean;
    ctrl?: boolean;
    shift?: boolean;
  } = {},
): void {
  const {alt, cmd, ctrl, shift} = metaKeys;
  const event = atom.keymaps.constructor.buildKeydownEvent(key, {
    target: target,
    alt: Boolean(alt),
    cmd: Boolean(cmd),
    ctrl: Boolean(ctrl),
    shift: Boolean(shift),
  });
  atom.keymaps.handleKeyboardEvent(event);
}
