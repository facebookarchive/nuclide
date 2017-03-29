'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = bookmarkIsEqual;


// Returns true if the given bookmarks are not void and are deeply equal.
function bookmarkIsEqual(a, b) {
  return a != null && b != null && a.rev === b.rev && a.bookmark === b.bookmark;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */