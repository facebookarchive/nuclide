'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isEligibleForDirectory = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let resolveTool = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (tool) {
    if (tool != null) {
      return tool;
    }
    return (0, (_promise || _load_promise()).asyncFind)(_os.default.platform() === 'win32' ? WINDOWS_TOOLS : POSIX_TOOLS, function (t) {
      return (0, (_hasCommand || _load_hasCommand()).hasCommand)(t).then(function (has) {
        return has ? t : null;
      });
    });
  });

  return function resolveTool(_x) {
    return _ref.apply(this, arguments);
  };
})();

let isEligibleForDirectory = exports.isEligibleForDirectory = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (rootDirectory) {
    if ((yield resolveTool(null)) == null) {
      return false;
    }

    const projectId = yield (0, (_nuclideArcanistRpc || _load_nuclideArcanistRpc()).findArcProjectIdOfPath)(rootDirectory);
    if (projectId == null) {
      return true;
    }

    try {
      // $FlowFB
      const bigGrep = require('../../commons-atom/fb-biggrep-query'); // eslint-disable-line rulesdir/no-cross-atom-imports
      const corpus = bigGrep.ARC_PROJECT_CORPUS[projectId];
      if (corpus != null) {
        return false;
      }
    } catch (err) {}
    return true;
  });

  return function isEligibleForDirectory(_x2) {
    return _ref2.apply(this, arguments);
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

var _hasCommand;

function _load_hasCommand() {
  return _hasCommand = require('nuclide-commons/hasCommand');
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _os = _interopRequireDefault(require('os'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const WINDOWS_TOOLS = ['rg']; /**
                               * Copyright (c) 2015-present, Facebook, Inc.
                               * All rights reserved.
                               *
                               * This source code is licensed under the license found in the LICENSE file in
                               * the root directory of this source tree.
                               *
                               * 
                               * @format
                               */

const POSIX_TOOLS = ['ag', 'rg', 'ack'];

const searchToolHandlers = new Map([['ag', (directory, query) => (0, (_AgAckService || _load_AgAckService()).search)(directory, query, 'ag')], ['ack', (directory, query) => (0, (_AgAckService || _load_AgAckService()).search)(directory, query, 'ack')], ['rg', (_RgService || _load_RgService()).search]]);

function searchWithTool(tool, directory, query, maxResults) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => resolveTool(tool)).switchMap(actualTool => {
    const handler = searchToolHandlers.get(actualTool);
    if (handler != null) {
      return handler(directory, query).take(maxResults);
    }
    return _rxjsBundlesRxMinJs.Observable.empty();
  }).publish();
}