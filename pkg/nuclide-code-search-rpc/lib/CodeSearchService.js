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
      return (0, (_which || _load_which()).default)(t).then(function (cmd) {
        return cmd != null ? t : null;
      });
    });
  });

  return function resolveTool(_x) {
    return _ref.apply(this, arguments);
  };
})();

let isFbManaged = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (rootDirectory) {
    try {
      // $FlowFB
      const { findArcProjectIdOfPath } = require('../../fb-arcanist-rpc');
      const projectId = yield findArcProjectIdOfPath(rootDirectory);
      if (projectId == null) {
        return false;
      }
      // $FlowFB
      const bigGrep = require('../../commons-atom/fb-biggrep-query'); // eslint-disable-line rulesdir/no-cross-atom-imports
      const corpus = bigGrep.ARC_PROJECT_CORPUS[projectId];
      if (corpus != null) {
        return true;
      }
    } catch (err) {}
    return false;
  });

  return function isFbManaged(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

let isEligibleForDirectory = exports.isEligibleForDirectory = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (rootDirectory) {
    const checks = yield Promise.all([resolveTool(null).then(function (tool) {
      return tool == null;
    }), isFbManaged(rootDirectory), (0, (_FileSystemService || _load_FileSystemService()).isNfs)(rootDirectory), (0, (_FileSystemService || _load_FileSystemService()).isFuse)(rootDirectory)]);
    if (checks.some(function (x) {
      return x;
    })) {
      return false;
    }

    return true;
  });

  return function isEligibleForDirectory(_x3) {
    return _ref3.apply(this, arguments);
  };
})();

exports.searchWithTool = searchWithTool;

var _AgAckService;

function _load_AgAckService() {
  return _AgAckService = require('./AgAckService');
}

var _RgService;

function _load_RgService() {
  return _RgService = require('./RgService');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _which;

function _load_which() {
  return _which = _interopRequireDefault(require('nuclide-commons/which'));
}

var _FileSystemService;

function _load_FileSystemService() {
  return _FileSystemService = require('../../nuclide-server/lib/services/FileSystemService');
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