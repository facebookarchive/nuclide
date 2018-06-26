'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FONT_SCALE_CONFIG = exports.FONT_FAMILY_CONFIG = exports.CHAR_ATLAS_CONFIG = exports.TRANSPARENCY_CONFIG = exports.OPTION_IS_META_CONFIG = exports.ADD_ESCAPE_COMMAND = exports.DOCUMENTATION_MESSAGE_CONFIG = exports.LINE_HEIGHT_CONFIG = exports.CURSOR_BLINK_CONFIG = exports.CURSOR_STYLE_CONFIG = exports.SCROLLBACK_CONFIG = exports.PRESERVED_COMMANDS_CONFIG = exports.COLOR_CONFIGS = undefined;
exports.getFontSize = getFontSize;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../../nuclide-commons-atom/feature-config'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const COLOR_CONFIGS = exports.COLOR_CONFIGS = Object.freeze({
  // dark
  black: 'atom-ide-terminal.black',
  red: 'atom-ide-terminal.red',
  green: 'atom-ide-terminal.green',
  blue: 'atom-ide-terminal.blue',
  yellow: 'atom-ide-terminal.yellow',
  cyan: 'atom-ide-terminal.cyan',
  magenta: 'atom-ide-terminal.magenta',
  white: 'atom-ide-terminal.white',
  // bright
  brightBlack: 'atom-ide-terminal.brightBlack',
  brightRed: 'atom-ide-terminal.brightRed',
  brightGreen: 'atom-ide-terminal.brightGreen',
  brightBlue: 'atom-ide-terminal.brightBlue',
  brightYellow: 'atom-ide-terminal.brightYellow',
  brightCyan: 'atom-ide-terminal.brightCyan',
  brightMagenta: 'atom-ide-terminal.brightMagenta',
  brightWhite: 'atom-ide-terminal.brightWhite'
}); /**
     * Copyright (c) 2017-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the BSD-style license found in the
     * LICENSE file in the root directory of this source tree. An additional grant
     * of patent rights can be found in the PATENTS file in the same directory.
     *
     *  strict-local
     * @format
     */

const PRESERVED_COMMANDS_CONFIG = exports.PRESERVED_COMMANDS_CONFIG = 'atom-ide-terminal.preservedCommands';
const SCROLLBACK_CONFIG = exports.SCROLLBACK_CONFIG = 'atom-ide-terminal.scrollback';
const CURSOR_STYLE_CONFIG = exports.CURSOR_STYLE_CONFIG = 'atom-ide-terminal.cursorStyle';
const CURSOR_BLINK_CONFIG = exports.CURSOR_BLINK_CONFIG = 'atom-ide-terminal.cursorBlink';
const LINE_HEIGHT_CONFIG = exports.LINE_HEIGHT_CONFIG = 'atom-ide-terminal.lineHeight';
const DOCUMENTATION_MESSAGE_CONFIG = exports.DOCUMENTATION_MESSAGE_CONFIG = 'atom-ide-terminal.documentationMessage';
const ADD_ESCAPE_COMMAND = exports.ADD_ESCAPE_COMMAND = 'atom-ide-terminal:add-escape-prefix';
const OPTION_IS_META_CONFIG = exports.OPTION_IS_META_CONFIG = 'atom-ide-terminal.optionIsMeta';
const TRANSPARENCY_CONFIG = exports.TRANSPARENCY_CONFIG = 'atom-ide-terminal.allowTransparency';
const CHAR_ATLAS_CONFIG = exports.CHAR_ATLAS_CONFIG = 'atom-ide-terminal.charAtlas';
const FONT_FAMILY_CONFIG = exports.FONT_FAMILY_CONFIG = 'atom-ide-terminal.fontFamily';
const FONT_SCALE_CONFIG = exports.FONT_SCALE_CONFIG = 'atom-ide-terminal.fontScale';

function getFontSize() {
  return parseFloat((_featureConfig || _load_featureConfig()).default.get(FONT_SCALE_CONFIG)) * parseFloat(atom.config.get('editor.fontSize'));
}