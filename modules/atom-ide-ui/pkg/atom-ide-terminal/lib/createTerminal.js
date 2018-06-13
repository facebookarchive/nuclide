'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTerminal = createTerminal;

var _decoders;

function _load_decoders() {
  return _decoders = require('decoders');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../../nuclide-commons-atom/feature-config'));
}

var _xterm;

function _load_xterm() {
  return _xterm = require('xterm');
}

var _fit;

function _load_fit() {
  return _fit = _interopRequireWildcard(require('xterm/lib/addons/fit/fit'));
}

var _webLinks;

function _load_webLinks() {
  return _webLinks = _interopRequireWildcard(require('xterm/lib/addons/webLinks/webLinks'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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

const SCROLLBACK_CONFIG = 'atom-ide-terminal.scrollback';
const CURSOR_STYLE_CONFIG = 'atom-ide-terminal.cursorStyle';
const CURSOR_BLINK_CONFIG = 'atom-ide-terminal.cursorBlink';
const OPTION_IS_META_CONFIG = 'atom-ide-terminal.optionIsMeta';
const TRANSPARENCY_CONFIG = 'atom-ide-terminal.allowTransparency';
const CHAR_ATLAS_CONFIG = 'atom-ide-terminal.charAtlas';

const assertTerminalOptionsInFeatureConfig = (0, (_decoders || _load_decoders()).guard)((0, (_decoders || _load_decoders()).object)({
  cols: (_decoders || _load_decoders()).number,
  rows: (_decoders || _load_decoders()).number,
  cursorBlink: (_decoders || _load_decoders()).boolean,
  cursorStyle: (0, (_decoders || _load_decoders()).either3)((0, (_decoders || _load_decoders()).constant)('block'), (0, (_decoders || _load_decoders()).constant)('underline'), (0, (_decoders || _load_decoders()).constant)('bar')),
  scrollback: (_decoders || _load_decoders()).number,
  macOptionIsMeta: (_decoders || _load_decoders()).boolean,
  allowTransparency: (_decoders || _load_decoders()).boolean,
  experimentalCharAtlas: (0, (_decoders || _load_decoders()).either3)((0, (_decoders || _load_decoders()).constant)('none'), (0, (_decoders || _load_decoders()).constant)('static'), (0, (_decoders || _load_decoders()).constant)('dynamic'))
}));

function createTerminal(options = {}) {
  // Load the addons on-demand the first time we create a terminal.
  // $FlowIgnore
  if ((_xterm || _load_xterm()).Terminal.fit == null) {
    // The 'fit' add-on resizes the terminal based on the container size
    // and the font size such that the terminal fills the container.
    (_xterm || _load_xterm()).Terminal.applyAddon(_fit || _load_fit());
  }
  // $FlowIgnore
  if ((_xterm || _load_xterm()).Terminal.webLinksInit == null) {
    // The 'webLinks' add-on linkifies http URL strings.
    (_xterm || _load_xterm()).Terminal.applyAddon(_webLinks || _load_webLinks());
  }
  // $FlowIgnore We know that TerminalClass is XTerminal + addons
  const terminal = new (_xterm || _load_xterm()).Terminal(
  // $FlowIssue: xterms type needs to be updated to include experimentalCharAtlas
  assertTerminalOptionsInFeatureConfig(Object.assign({
    cols: 512,
    rows: 512,
    cursorBlink: (_featureConfig || _load_featureConfig()).default.get(CURSOR_BLINK_CONFIG),
    cursorStyle: (_featureConfig || _load_featureConfig()).default.get(CURSOR_STYLE_CONFIG),
    scrollback: (_featureConfig || _load_featureConfig()).default.get(SCROLLBACK_CONFIG),
    macOptionIsMeta: (_featureConfig || _load_featureConfig()).default.get(OPTION_IS_META_CONFIG),
    allowTransparency: (_featureConfig || _load_featureConfig()).default.get(TRANSPARENCY_CONFIG),
    experimentalCharAtlas: (_featureConfig || _load_featureConfig()).default.get(CHAR_ATLAS_CONFIG)
  }, options)));
  // Patch into xterm Linkifier to catch errors on isWrapped property.
  // Track issue at https://github.com/xtermjs/xterm.js/issues/1509
  const linkifyRow = terminal.linkifier._linkifyRow;
  terminal.linkifier._linkifyRow = row => {
    try {
      linkifyRow.call(terminal.linkifier, row);
    } catch (e) {
      // swallow errors to avoid red box because the linkifier runs on a timer.
    }
  };
  return terminal;
}