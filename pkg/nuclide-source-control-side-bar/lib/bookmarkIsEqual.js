'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BookmarkInfo} from '../../nuclide-hg-rpc/lib/HgService';

// Returns true if the given bookmarks are not void and are deeply equal.
export default function bookmarkIsEqual(a: ?BookmarkInfo, b: ?BookmarkInfo) {
  return a != null
    && b != null
    && a.rev === b.rev
    && a.bookmark === b.bookmark;
}
