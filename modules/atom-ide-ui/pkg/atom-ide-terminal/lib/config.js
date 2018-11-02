"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFontSize = getFontSize;
exports.setTerminalOption = setTerminalOption;
exports.subscribeConfigChanges = subscribeConfigChanges;
exports.syncTerminalFont = syncTerminalFont;
exports.COPY_ON_SELECT_CONFIG = exports.FONT_SCALE_CONFIG = exports.FONT_FAMILY_CONFIG = exports.RENDERER_TYPE_CONFIG = exports.CHAR_ATLAS_CONFIG = exports.TRANSPARENCY_CONFIG = exports.OPTION_IS_META_CONFIG = exports.ADD_ESCAPE_COMMAND = exports.DOCUMENTATION_MESSAGE_CONFIG = exports.LINE_HEIGHT_CONFIG = exports.CURSOR_BLINK_CONFIG = exports.CURSOR_STYLE_CONFIG = exports.SCROLLBACK_CONFIG = exports.PRESERVED_COMMANDS_CONFIG = exports.COLOR_CONFIGS = void 0;

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
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
 *  strict-local
 * @format
 */
const COLOR_CONFIGS = Object.freeze({
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
});
exports.COLOR_CONFIGS = COLOR_CONFIGS;
const PRESERVED_COMMANDS_CONFIG = 'atom-ide-terminal.preservedCommands';
exports.PRESERVED_COMMANDS_CONFIG = PRESERVED_COMMANDS_CONFIG;
const SCROLLBACK_CONFIG = 'atom-ide-terminal.scrollback';
exports.SCROLLBACK_CONFIG = SCROLLBACK_CONFIG;
const CURSOR_STYLE_CONFIG = 'atom-ide-terminal.cursorStyle';
exports.CURSOR_STYLE_CONFIG = CURSOR_STYLE_CONFIG;
const CURSOR_BLINK_CONFIG = 'atom-ide-terminal.cursorBlink';
exports.CURSOR_BLINK_CONFIG = CURSOR_BLINK_CONFIG;
const LINE_HEIGHT_CONFIG = 'atom-ide-terminal.lineHeight';
exports.LINE_HEIGHT_CONFIG = LINE_HEIGHT_CONFIG;
const DOCUMENTATION_MESSAGE_CONFIG = 'atom-ide-terminal.documentationMessage';
exports.DOCUMENTATION_MESSAGE_CONFIG = DOCUMENTATION_MESSAGE_CONFIG;
const ADD_ESCAPE_COMMAND = 'atom-ide-terminal:add-escape-prefix';
exports.ADD_ESCAPE_COMMAND = ADD_ESCAPE_COMMAND;
const OPTION_IS_META_CONFIG = 'atom-ide-terminal.optionIsMeta';
exports.OPTION_IS_META_CONFIG = OPTION_IS_META_CONFIG;
const TRANSPARENCY_CONFIG = 'atom-ide-terminal.allowTransparency';
exports.TRANSPARENCY_CONFIG = TRANSPARENCY_CONFIG;
const CHAR_ATLAS_CONFIG = 'atom-ide-terminal.charAtlas';
exports.CHAR_ATLAS_CONFIG = CHAR_ATLAS_CONFIG;
const RENDERER_TYPE_CONFIG = 'atom-ide-terminal.renderer';
exports.RENDERER_TYPE_CONFIG = RENDERER_TYPE_CONFIG;
const FONT_FAMILY_CONFIG = 'atom-ide-terminal.fontFamily';
exports.FONT_FAMILY_CONFIG = FONT_FAMILY_CONFIG;
const FONT_SCALE_CONFIG = 'atom-ide-terminal.fontScale';
exports.FONT_SCALE_CONFIG = FONT_SCALE_CONFIG;
const COPY_ON_SELECT_CONFIG = 'atom-ide-terminal.copyOnSelect';
exports.COPY_ON_SELECT_CONFIG = COPY_ON_SELECT_CONFIG;

function getFontSize() {
  return parseFloat(_featureConfig().default.get(FONT_SCALE_CONFIG)) * parseFloat(atom.config.get('editor.fontSize'));
}

function setTerminalOption(terminal, optionName, value) {
  if (terminal.getOption(optionName) !== value) {
    terminal.setOption(optionName, value);
  }
}

function subscribeConfigChanges(terminal) {
  return new (_UniversalDisposable().default)(_featureConfig().default.observeAsStream(OPTION_IS_META_CONFIG).skip(1).subscribe(optionIsMeta => {
    setTerminalOption(terminal, 'macOptionIsMeta', optionIsMeta);
  }), _featureConfig().default.observeAsStream(CURSOR_STYLE_CONFIG).skip(1).subscribe(cursorStyle => setTerminalOption(terminal, 'cursorStyle', cursorStyle)), _featureConfig().default.observeAsStream(CURSOR_BLINK_CONFIG).skip(1).subscribe(cursorBlink => setTerminalOption(terminal, 'cursorBlink', cursorBlink)), _featureConfig().default.observeAsStream(SCROLLBACK_CONFIG).skip(1).subscribe(scrollback => setTerminalOption(terminal, 'scrollback', scrollback)), _featureConfig().default.observeAsStream(RENDERER_TYPE_CONFIG).skip(1).map(rendererType => rendererType === 'auto' ? 'canvas' : rendererType).subscribe(rendererType => setTerminalOption(terminal, 'rendererType', rendererType)));
}

function syncTerminalFont(terminal) {
  setTerminalOption(terminal, 'fontSize', getFontSize());
  setTerminalOption(terminal, 'lineHeight', _featureConfig().default.get(LINE_HEIGHT_CONFIG));
  setTerminalOption(terminal, 'fontFamily', _featureConfig().default.get(FONT_FAMILY_CONFIG));
}