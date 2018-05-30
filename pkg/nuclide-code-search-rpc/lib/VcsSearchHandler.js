'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.search = search;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

var _handlerCommon;

function _load_handlerCommon() {
  return _handlerCommon = require('./handlerCommon');
}

var _parser;

function _load_parser() {
  return _parser = require('./parser');
}

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

function search(directory, regex) {
  const sharedArgs = (regex.ignoreCase ? ['-i'] : []).concat([
  // print line number
  '-n', '-E', regex.source, directory]);
  const observeVcsGrepProcess = (command, subcommand) => {
    return (0, (_process || _load_process()).observeProcess)(command, [subcommand].concat(sharedArgs), {
      cwd: directory,
      // An exit code of 0 or 1 is perfectly normal for grep (1 = no results).
      // `hg grep` can sometimes have an exit code of 123, since it uses xargs.
      isExitError: ({ exitCode, signal }) => {
        return (
          // flowlint-next-line sketchy-null-string:off
          !signal && (exitCode == null || exitCode > 1 && exitCode !== 123)
        );
      }
    });
  };
  // Try running search commands, falling through to the next if there is an error.
  return (0, (_handlerCommon || _load_handlerCommon()).mergeOutputToResults)(observeVcsGrepProcess('git', 'grep').catch(() => observeVcsGrepProcess('hg', 'wgrep')), event => (0, (_parser || _load_parser()).parseVcsGrepLine)(event, directory, regex), regex, 0, 0);
}