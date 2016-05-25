

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*
 * adapted from https://github.com/atom/underscore-plus/blob/master/src/underscore-plus.coffee
 */

var MAC_MODIFIER_KEYMAP = {
  alt: '⌥',
  cmd: '⌘',
  ctrl: '⌃',
  down: '↓',
  enter: '⏎',
  left: '←',
  option: '⌥',
  right: '→',
  shift: '⇧',
  up: '↑'
};

var NON_MAC_MODIFIER_KEYMAP = {
  alt: 'Alt',
  cmd: 'Cmd',
  ctrl: 'Ctrl',
  down: 'Down',
  enter: 'Enter',
  left: 'Left',
  option: 'Alt',
  right: 'Right',
  shift: 'Shift',
  up: 'Up'
};

// Human key combos should always explicitly state the shift key. This map is a disambiguator.
// 'shift-version': 'no-shift-version'
var SHIFT_KEYMAP = {
  '_': '-',
  ':': ';',
  '?': '/',
  '"': '\'',
  '{': '[',
  '}': ']',
  '+': '=',
  '<': ',',
  '>': '.',
  '|': '\\',
  '~': '`'
};

var FN_KEY_RE = /f[0-9]{1,2}/;

// $FlowIssue
function flatten(arr) {
  var flattened = [];
  for (var el of arr) {
    if (Array.isArray(el)) {
      flattened = flattened.concat(flatten(el));
    } else {
      flattened.push(el);
    }
  }
  return flattened;
}

function capitalize(word) {
  var first = word[0] || '';
  var rest = word.slice(1);
  return first.toUpperCase() + rest;
}

function humanizeKey(key, platform) {
  if (!key) {
    return key;
  }
  var modifierKeyMap = platform === 'darwin' ? MAC_MODIFIER_KEYMAP : NON_MAC_MODIFIER_KEYMAP;
  if (modifierKeyMap[key]) {
    return modifierKeyMap[key];
  }
  if (key.length === 1) {
    if (SHIFT_KEYMAP[key]) {
      return [modifierKeyMap.shift, SHIFT_KEYMAP[key]];
    }
    var uppercase = key.toUpperCase();
    if (key === uppercase && uppercase !== key.toLowerCase()) {
      return [modifierKeyMap.shift, uppercase];
    }
    return uppercase;
  }
  if (FN_KEY_RE.test(key)) {
    return key.toUpperCase();
  }
  return platform === 'darwin' ? key : capitalize(key);
}

/**
 * Humanize the keystroke according to platform conventions. This method
 * attempts to mirror the text the given keystroke would have if displayed in
 * a system menu.
 *
 * @param keystroke A String keystroke to humanize such as `ctrl-O`.
 * @param platform An optional String platform to humanize for (default: `process.platform`).
 * @return a humanized representation of the keystroke.
 */
function humanizeKeystroke(keystroke, platform) {
  if (!keystroke) {
    return keystroke;
  }
  platform = platform || process.platform;
  var separator = platform === 'darwin' ? '' : '+';
  var key = undefined;
  var keys = undefined;
  var splitKeystroke = undefined;
  var keystrokes = keystroke.split(' ');
  var humanizedKeystrokes = [];
  for (var i = 0; i < keystrokes.length; i++) {
    var currentKeystroke = keystrokes[i];
    splitKeystroke = currentKeystroke.split('-');
    keys = [];
    for (var index = 0; index < splitKeystroke.length; index++) {
      key = splitKeystroke[index];
      if (key === '' && splitKeystroke[index - 1] === '') {
        key = '-';
      }
      if (key) {
        keys.push(humanizeKey(key, platform));
      }
    }
    keys = Array.from(new Set(flatten(keys)));
    humanizedKeystrokes.push(keys.join(separator));
  }
  return humanizedKeystrokes.join(' ');
}

module.exports = {
  humanizeKeystroke: humanizeKeystroke
};