"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.search = search;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _handlerCommon() {
  const data = require("./handlerCommon");

  _handlerCommon = function () {
    return data;
  };

  return data;
}

function _parser() {
  const data = require("./parser");

  _parser = function () {
    return data;
  };

  return data;
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
function search({
  regex,
  directory,
  leadingLines,
  trailingLines
}) {
  const sharedArgs = [];

  if (regex.ignoreCase) {
    sharedArgs.push('-i');
  } // hg grep actually requires no space between A/B and the parameter!
  // git grep doesn't seem to mind.


  if (leadingLines != null) {
    sharedArgs.push('-B' + String(leadingLines));
  }

  if (trailingLines != null) {
    sharedArgs.push('-A' + String(trailingLines));
  } // TODO: handle limit in params


  sharedArgs.push( // print line number
  '-n', '-E', regex.source, directory);

  const observeVcsGrepProcess = (command, subcommand) => {
    return (0, _process().observeProcess)(command, [subcommand].concat(sharedArgs), {
      cwd: directory,
      // An exit code of 0 or 1 is perfectly normal for grep (1 = no results).
      // `hg grep` can sometimes have an exit code of 123, since it uses xargs.
      isExitError: ({
        exitCode,
        signal
      }) => {
        return (// flowlint-next-line sketchy-null-string:off
          !signal && (exitCode == null || exitCode > 1 && exitCode !== 123)
        );
      }
    });
  }; // Try running search commands, falling through to the next if there is an error.


  return (0, _handlerCommon().mergeOutputToResults)(observeVcsGrepProcess('git', 'grep').catch(() => observeVcsGrepProcess('hg', 'wgrep')), event => (0, _parser().parseVcsGrepLine)(event, directory, regex), regex, leadingLines || 0, trailingLines || 0);
}