"use strict";

function _humanizeKeystroke() {
  const data = _interopRequireDefault(require("../humanizeKeystroke"));

  _humanizeKeystroke = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict
 * @format
 */
describe('nuclide-keystroke-label', () => {
  // adapted from https://github.com/atom/underscore-plus/blob/master/spec/underscore-plus-spec.coffee
  describe('humanizeKeystroke', () => {
    it('replaces single keystroke', () => {
      expect((0, _humanizeKeystroke().default)('cmd-O', 'darwin')).toEqual('⌘⇧O');
      expect((0, _humanizeKeystroke().default)('cmd-O', 'linux')).toEqual('Cmd+Shift+O');
      expect((0, _humanizeKeystroke().default)('cmd-shift-up', 'darwin')).toEqual('⌘⇧↑');
      expect((0, _humanizeKeystroke().default)('cmd-shift-up', 'linux')).toEqual('Cmd+Shift+Up');
      expect((0, _humanizeKeystroke().default)('cmd-option-down', 'darwin')).toEqual('⌘⌥↓');
      expect((0, _humanizeKeystroke().default)('cmd-option-down', 'linux')).toEqual('Cmd+Alt+Down');
      expect((0, _humanizeKeystroke().default)('cmd-option-left', 'darwin')).toEqual('⌘⌥←');
      expect((0, _humanizeKeystroke().default)('cmd-option-left', 'linux')).toEqual('Cmd+Alt+Left');
      expect((0, _humanizeKeystroke().default)('cmd-option-right', 'darwin')).toEqual('⌘⌥→');
      expect((0, _humanizeKeystroke().default)('cmd-option-right', 'linux')).toEqual('Cmd+Alt+Right');
      expect((0, _humanizeKeystroke().default)('cmd-o', 'darwin')).toEqual('⌘O');
      expect((0, _humanizeKeystroke().default)('cmd-o', 'linux')).toEqual('Cmd+O');
      expect((0, _humanizeKeystroke().default)('ctrl-2', 'darwin')).toEqual('⌃2');
      expect((0, _humanizeKeystroke().default)('ctrl-2', 'linux')).toEqual('Ctrl+2');
      expect((0, _humanizeKeystroke().default)('cmd-space', 'darwin')).toEqual('⌘space');
      expect((0, _humanizeKeystroke().default)('cmd-space', 'linux')).toEqual('Cmd+Space');
      expect((0, _humanizeKeystroke().default)('cmd-|', 'darwin')).toEqual('⌘⇧\\');
      expect((0, _humanizeKeystroke().default)('cmd-|', 'linux')).toEqual('Cmd+Shift+\\');
      expect((0, _humanizeKeystroke().default)('cmd-}', 'darwin')).toEqual('⌘⇧]');
      expect((0, _humanizeKeystroke().default)('cmd-}', 'linux')).toEqual('Cmd+Shift+]');
      expect((0, _humanizeKeystroke().default)('cmd--', 'darwin')).toEqual('⌘-');
      expect((0, _humanizeKeystroke().default)('cmd--', 'linux')).toEqual('Cmd+-');
    });
    it('correctly replaces keystrokes with shift and capital letter', () => {
      expect((0, _humanizeKeystroke().default)('cmd-shift-P', 'darwin')).toEqual('⌘⇧P');
      expect((0, _humanizeKeystroke().default)('cmd-shift-P', 'linux')).toEqual('Cmd+Shift+P');
    });
    it('replaces multiple keystrokes', () => {
      expect((0, _humanizeKeystroke().default)('cmd-O cmd-n', 'darwin')).toEqual('⌘⇧O ⌘N');
      expect((0, _humanizeKeystroke().default)('cmd-O cmd-n', 'linux')).toEqual('Cmd+Shift+O Cmd+N');
      expect((0, _humanizeKeystroke().default)('cmd-shift-- cmd-n', 'darwin')).toEqual('⌘⇧- ⌘N');
      expect((0, _humanizeKeystroke().default)('cmd-shift-- cmd-n', 'linux')).toEqual('Cmd+Shift+- Cmd+N');
      expect((0, _humanizeKeystroke().default)('cmd-k right', 'darwin')).toEqual('⌘K →');
      expect((0, _humanizeKeystroke().default)('cmd-k right', 'linux')).toEqual('Cmd+K Right');
    });
    it('formats function keys', () => {
      expect((0, _humanizeKeystroke().default)('cmd-f2', 'darwin')).toEqual('⌘F2');
      expect((0, _humanizeKeystroke().default)('cmd-f2', 'linux')).toEqual('Cmd+F2');
    });
    it('handles junk input', () => {
      // $FlowFixMe: Deliberately testing invalid input.
      expect((0, _humanizeKeystroke().default)()).toEqual(undefined); // $FlowFixMe: Deliberately testing invalid input.

      expect((0, _humanizeKeystroke().default)(null)).toEqual(null);
      expect((0, _humanizeKeystroke().default)('')).toEqual('');
    });
  });
});