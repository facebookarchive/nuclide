'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.ActionType = {
  COLLAPSE_NODE: 'COLLAPSE_NODE',
  CREATE_CHILD: 'CREATE_CHILD',
  EXPAND_NODE: 'EXPAND_NODE',
  SET_ROOT_KEYS: 'SET_ROOT_KEYS',
  SET_FOCUSED_ROOT: 'SET_FOCUSED_ROOT',
  SET_SELECTED_NODES: 'SET_SELECTED_NODES',
};

exports.EVENT_HANDLER_SELECTOR = '.nuclide-file-tree-deux';
