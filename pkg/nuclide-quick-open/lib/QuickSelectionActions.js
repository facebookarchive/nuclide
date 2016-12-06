'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _QuickSelectionDispatcher;

function _load_QuickSelectionDispatcher() {
  return _QuickSelectionDispatcher = _interopRequireDefault(require('./QuickSelectionDispatcher'));
}

var _QuickSelectionDispatcher2;

function _load_QuickSelectionDispatcher2() {
  return _QuickSelectionDispatcher2 = require('./QuickSelectionDispatcher');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const QuickSelectionActions = {

  query(query) {
    (_QuickSelectionDispatcher || _load_QuickSelectionDispatcher()).default.getInstance().dispatch({
      actionType: (_QuickSelectionDispatcher2 || _load_QuickSelectionDispatcher2()).ActionTypes.QUERY,
      query
    });
  },

  changeActiveProvider(providerName) {
    setImmediate(() => {
      (_QuickSelectionDispatcher || _load_QuickSelectionDispatcher()).default.getInstance().dispatch({
        actionType: (_QuickSelectionDispatcher2 || _load_QuickSelectionDispatcher2()).ActionTypes.ACTIVE_PROVIDER_CHANGED,
        providerName
      });
    });
  }

};

module.exports = QuickSelectionActions;