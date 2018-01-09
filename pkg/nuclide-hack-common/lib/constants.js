'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const HACK_GRAMMARS = exports.HACK_GRAMMARS = ['text.html.hack', 'text.html.php'];

const HACK_CONFIG_FILE_NAME = exports.HACK_CONFIG_FILE_NAME = '.hhconfig';

// From hack/src/utils/findUtils.ml
const HACK_FILE_EXTENSIONS = exports.HACK_FILE_EXTENSIONS = ['.php', // normal php file
'.hh', // Hack extension some open source code is starting to use
'.phpt', // our php template files
'.hhi', // interface files only visible to the type checker
'.xhp'];

// Note: this regex is used only by the legacy hack service.
// LSP doesn't use it.
const HACK_WORD_REGEX = exports.HACK_WORD_REGEX = /[a-zA-Z0-9_$]+/g;