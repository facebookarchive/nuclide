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

var _config;

function _load_config() {
  return _config = require('./config');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const assertTerminalOptionsInFeatureConfig = (0, (_decoders || _load_decoders()).guard)((0, (_decoders || _load_decoders()).object)({
  cursorBlink: (_decoders || _load_decoders()).boolean,
  cursorStyle: (0, (_decoders || _load_decoders()).either3)((0, (_decoders || _load_decoders()).constant)('block'), (0, (_decoders || _load_decoders()).constant)('underline'), (0, (_decoders || _load_decoders()).constant)('bar')),
  scrollback: (_decoders || _load_decoders()).number,
  fontFamily: (_decoders || _load_decoders()).string,
  fontSize: (_decoders || _load_decoders()).number,
  lineHeight: (_decoders || _load_decoders()).number,
  macOptionIsMeta: (_decoders || _load_decoders()).boolean,
  allowTransparency: (_decoders || _load_decoders()).boolean,
  experimentalCharAtlas: (0, (_decoders || _load_decoders()).either3)((0, (_decoders || _load_decoders()).constant)('none'), (0, (_decoders || _load_decoders()).constant)('static'), (0, (_decoders || _load_decoders()).constant)('dynamic'))
})); /**
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
    cursorBlink: (_featureConfig || _load_featureConfig()).default.get((_config || _load_config()).CURSOR_BLINK_CONFIG),
    cursorStyle: (_featureConfig || _load_featureConfig()).default.get((_config || _load_config()).CURSOR_STYLE_CONFIG),
    scrollback: (_featureConfig || _load_featureConfig()).default.get((_config || _load_config()).SCROLLBACK_CONFIG),
    fontFamily: (_featureConfig || _load_featureConfig()).default.get((_config || _load_config()).FONT_FAMILY_CONFIG),
    fontSize: (0, (_config || _load_config()).getFontSize)(),
    lineHeight: (_featureConfig || _load_featureConfig()).default.get((_config || _load_config()).LINE_HEIGHT_CONFIG),
    macOptionIsMeta: (_featureConfig || _load_featureConfig()).default.get((_config || _load_config()).OPTION_IS_META_CONFIG),
    allowTransparency: (_featureConfig || _load_featureConfig()).default.get((_config || _load_config()).TRANSPARENCY_CONFIG),
    experimentalCharAtlas: (_featureConfig || _load_featureConfig()).default.get((_config || _load_config()).CHAR_ATLAS_CONFIG)
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