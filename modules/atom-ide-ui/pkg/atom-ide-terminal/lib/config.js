/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import featureConfig from 'nuclide-commons-atom/feature-config';

export const COLOR_CONFIGS = Object.freeze({
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
  brightWhite: 'atom-ide-terminal.brightWhite',
});

export const PRESERVED_COMMANDS_CONFIG = 'atom-ide-terminal.preservedCommands';
export const SCROLLBACK_CONFIG = 'atom-ide-terminal.scrollback';
export const CURSOR_STYLE_CONFIG = 'atom-ide-terminal.cursorStyle';
export const CURSOR_BLINK_CONFIG = 'atom-ide-terminal.cursorBlink';
export const LINE_HEIGHT_CONFIG = 'atom-ide-terminal.lineHeight';
export const DOCUMENTATION_MESSAGE_CONFIG =
  'atom-ide-terminal.documentationMessage';
export const ADD_ESCAPE_COMMAND = 'atom-ide-terminal:add-escape-prefix';
export const OPTION_IS_META_CONFIG = 'atom-ide-terminal.optionIsMeta';
export const TRANSPARENCY_CONFIG = 'atom-ide-terminal.allowTransparency';
export const CHAR_ATLAS_CONFIG = 'atom-ide-terminal.charAtlas';
export const RENDERER_TYPE_CONFIG = 'atom-ide-terminal.rendererType';
export const FONT_FAMILY_CONFIG = 'atom-ide-terminal.fontFamily';
export const FONT_SCALE_CONFIG = 'atom-ide-terminal.fontScale';

export function getFontSize(): number {
  return (
    parseFloat(featureConfig.get(FONT_SCALE_CONFIG)) *
    parseFloat(atom.config.get('editor.fontSize'))
  );
}
