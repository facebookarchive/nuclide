

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function stringifyError(error) {
  return 'name: ' + error.name + ', message: ' + error.message + ', stack: ' + error.stack + '.';
}

module.exports = {
  stringifyError: stringifyError
};