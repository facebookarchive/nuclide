'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isEligibleForDirectory = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

let isEligibleForDirectory = exports.isEligibleForDirectory = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (rootDirectory) {
    const projectId = yield (0, (_nuclideArcanistRpc || _load_nuclideArcanistRpc()).findArcProjectIdOfPath)(rootDirectory);
    if (projectId == null) {
      return true;
    }

    try {
      // $FlowFB
      const bigGrep = require('../../commons-atom/fb-biggrep-query'); // eslint-disable-line nuclide-internal/no-cross-atom-imports
      const corpus = bigGrep.ARC_PROJECT_CORPUS[projectId];
      if (corpus != null) {
        return false;
      }
    } catch (err) {}
    return true;
  });

  return function isEligibleForDirectory(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.searchWithTool = searchWithTool;

var _nuclideArcanistRpc;

function _load_nuclideArcanistRpc() {
  return _nuclideArcanistRpc = require('../../nuclide-arcanist-rpc');
}

var _AgAckService;

function _load_AgAckService() {
  return _AgAckService = require('./AgAckService');
}

var _RgService;

function _load_RgService() {
  return _RgService = require('./RgService');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const searchToolHandlers = new Map([['ag', (directory, query) => (0, (_AgAckService || _load_AgAckService()).search)(directory, query, 'ag')], ['ack', (directory, query) => (0, (_AgAckService || _load_AgAckService()).search)(directory, query, 'ack')], ['rg', (_RgService || _load_RgService()).search]]);

function searchWithTool(tool, directory, query, maxResults) {
  const handler = searchToolHandlers.get(tool);
  if (handler != null) {
    return handler(directory, query).take(maxResults).publish();
  }
  return _rxjsBundlesRxMinJs.Observable.empty().publish();
}