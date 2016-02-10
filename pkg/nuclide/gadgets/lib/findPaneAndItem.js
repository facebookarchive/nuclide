'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type ItemAndPane = {
  item: Object,
  pane: Object,
};

type Predicate = (item: Object, pane: Object) => boolean;

/**
 * Finds the first item that matches the predicate in the workspace and its parent. It's necessary
 * to get them both in one function because items don't have links back to their parent.
 */
export default function findPaneAndItem(predicate: Predicate): ?ItemAndPane {
  for (const pane of atom.workspace.getPanes()) {
    for (const item of pane.getItems()) {
      if (predicate(item, pane)) {
        return {item, pane};
      }
    }
  }
}
