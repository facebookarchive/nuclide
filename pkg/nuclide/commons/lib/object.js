'use babel';
/* flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * O(1)-check if a given object is empty (has no properties, inherited or not)
 */
function isEmpty(obj: Object): bool {
  for (var key in obj) {
    return false;
  }
  return true;
}

module.exports = {
  isEmpty,
};
