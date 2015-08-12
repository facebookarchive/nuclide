'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ExternalOptions} from 'nuclide-format-js-base/lib/types/options';

var options: ?ExternalOptions;

function getOptions(): ExternalOptions {
  return options || (options = buildOptions());
}

function clearOptions(): void {
  options = null;
}

function buildOptions(): ExternalOptions {
  return {
    builtIns: atom.config.get('nuclide-format-js.builtIns'),
    builtInBlacklist: atom.config.get('nuclide-format-js.builtInBlacklist'),
    builtInTypes: atom.config.get('nuclide-format-js.builtInTypes'),
    builtInTypeBlacklist: atom.config.get(
      'nuclide-format-js.builtInTypeBlacklist'
    ),
    commonAliases: fixCommonAliases(
      (atom.config.get('nuclide-format-js.commonAliases'): any)
    ),
  };
}

/**
 * Nuclide can't handle nested arrays well in settings, so we save it in a
 * flat array and fix up each pair or entries before using it in the transform
 */
function fixCommonAliases(aliases: ?Array<string>): Array<[string, string]> {
  aliases = aliases || [];
  var pairs = [];
  for (var i = 0; i < aliases.length - 1; i += 2) {
    pairs.push([aliases[i], aliases[i + 1]]);
  }
  return pairs;
}

module.exports = {getOptions, clearOptions};
