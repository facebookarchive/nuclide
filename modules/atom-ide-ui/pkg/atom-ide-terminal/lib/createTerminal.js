"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTerminal = createTerminal;

function _decoders() {
  const data = require("decoders");

  _decoders = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _xterm() {
  const data = require("xterm");

  _xterm = function () {
    return data;
  };

  return data;
}

function Fit() {
  const data = _interopRequireWildcard(require("xterm/lib/addons/fit/fit"));

  Fit = function () {
    return data;
  };

  return data;
}

function WebLinks() {
  const data = _interopRequireWildcard(require("xterm/lib/addons/webLinks/webLinks"));

  WebLinks = function () {
    return data;
  };

  return data;
}

function _config() {
  const data = require("./config");

  _config = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const assertTerminalOptionsInFeatureConfig = (0, _decoders().guard)((0, _decoders().object)({
  cursorBlink: _decoders().boolean,
  cursorStyle: (0, _decoders().either3)((0, _decoders().constant)('block'), (0, _decoders().constant)('underline'), (0, _decoders().constant)('bar')),
  scrollback: _decoders().number,
  fontFamily: _decoders().string,
  fontSize: _decoders().number,
  lineHeight: _decoders().number,
  macOptionIsMeta: _decoders().boolean,
  allowTransparency: _decoders().boolean,
  experimentalCharAtlas: (0, _decoders().either3)((0, _decoders().constant)('none'), (0, _decoders().constant)('static'), (0, _decoders().constant)('dynamic')),
  rendererType: (0, _decoders().either)((0, _decoders().constant)('canvas'), (0, _decoders().constant)('dom'))
}));

function createTerminal(options = {}) {
  // Load the addons on-demand the first time we create a terminal.
  // $FlowIgnore
  if (_xterm().Terminal.fit == null) {
    // The 'fit' add-on resizes the terminal based on the container size
    // and the font size such that the terminal fills the container.
    _xterm().Terminal.applyAddon(Fit());
  } // $FlowIgnore


  if (_xterm().Terminal.webLinksInit == null) {
    // The 'webLinks' add-on linkifies http URL strings.
    _xterm().Terminal.applyAddon(WebLinks());
  }

  const rendererType = _featureConfig().default.get(_config().RENDERER_TYPE_CONFIG); // $FlowIgnore We know that TerminalClass is XTerminal + addons


  const terminal = new (_xterm().Terminal)( // $FlowIssue: xterms type needs to be updated to include experimentalCharAtlas
  assertTerminalOptionsInFeatureConfig(Object.assign({
    cursorBlink: _featureConfig().default.get(_config().CURSOR_BLINK_CONFIG),
    cursorStyle: _featureConfig().default.get(_config().CURSOR_STYLE_CONFIG),
    scrollback: _featureConfig().default.get(_config().SCROLLBACK_CONFIG),
    fontFamily: _featureConfig().default.get(_config().FONT_FAMILY_CONFIG),
    fontSize: (0, _config().getFontSize)(),
    lineHeight: _featureConfig().default.get(_config().LINE_HEIGHT_CONFIG),
    macOptionIsMeta: _featureConfig().default.get(_config().OPTION_IS_META_CONFIG),
    allowTransparency: _featureConfig().default.get(_config().TRANSPARENCY_CONFIG),
    experimentalCharAtlas: _featureConfig().default.get(_config().CHAR_ATLAS_CONFIG),
    rendererType: rendererType === 'auto' ? 'canvas' : rendererType
  }, options))); // Patch into xterm Linkifier to catch errors on isWrapped property.
  // Track issue at https://github.com/xtermjs/xterm.js/issues/1509

  const linkifier = terminal._core.linkifier;
  const linkifyRow = linkifier._linkifyRow;

  linkifier._linkifyRow = row => {
    try {
      linkifyRow.call(linkifier, row);
    } catch (e) {// swallow errors to avoid red box because the linkifier runs on a timer.
    }
  };

  return terminal;
}