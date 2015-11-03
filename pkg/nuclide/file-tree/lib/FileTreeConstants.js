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
  DELETE_SELECTED_NODES: 'DELETE_SELECTED_NODES',
  EXPAND_NODE: 'EXPAND_NODE',
  SET_EXCLUDE_VCS_IGNORED_PATHS: 'SET_EXCLUDE_VCS_IGNORED_PATHS',
  SET_HIDE_IGNORED_NAMES: 'SET_HIDE_IGNORED_NAMES',
  SET_IGNORED_NAMES: 'SET_IGNORED_NAMES',
  SET_ROOT_KEYS: 'SET_ROOT_KEYS',
  SET_SELECTED_NODES_FOR_ROOT: 'SET_SELECTED_NODES_FOR_ROOT',
  SET_SELECTED_NODES_FOR_TREE: 'SET_SELECTED_NODES_FOR_TREE',
  SET_TRACKED_NODE: 'SET_TRACKED_NODE',
  SET_VCS_STATUSES: 'SET_VCS_STATUSES', // VCS = version control system
};

exports.EVENT_HANDLER_SELECTOR = '.nuclide-file-tree';
