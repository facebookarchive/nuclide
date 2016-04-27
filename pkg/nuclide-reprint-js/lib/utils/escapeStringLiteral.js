

function escapeStringLiteral(value, options) {
  switch (options.quotes) {
    case 'double':
      return JSON.stringify(value);

    case 'single':
    default:
      return swapQuotes(JSON.stringify(swapQuotes(value)));
  }
}

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function swapQuotes(str) {
  return str.replace(/['"]/g, function (m) {
    return m === '"' ? '\'' : '"';
  });
}

module.exports = escapeStringLiteral;