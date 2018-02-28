'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveTool = exports.POSIX_TOOLS = exports.WINDOWS_TOOLS = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let resolveTool = exports.resolveTool = (() => {
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

let resolveToolWithDefault = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (tool, defaultTool) {
    const resolvedTool = yield resolveTool(tool);
    return resolvedTool == null ? defaultTool : resolvedTool;
  });

  return function resolveToolWithDefault(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
})();

exports.searchInDirectory = searchInDirectory;
exports.searchWithTool = searchWithTool;
exports.searchInDirectories = searchInDirectories;

var _AgAckHandler;

function _load_AgAckHandler() {
  return _AgAckHandler = require('./AgAckHandler');
}

var _GrepHandler;

function _load_GrepHandler() {
  return _GrepHandler = require('./GrepHandler');
}

var _RgHandler;

function _load_RgHandler() {
  return _RgHandler = require('./RgHandler');
}

var _VcsSearchHandler;

function _load_VcsSearchHandler() {
  return _VcsSearchHandler = require('./VcsSearchHandler');
}

var _minimatch;

function _load_minimatch() {
  return _minimatch = require('minimatch');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _which;

function _load_which() {
  return _which = _interopRequireDefault(require('nuclide-commons/which'));
}

var _os = _interopRequireDefault(require('os'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const WINDOWS_TOOLS = exports.WINDOWS_TOOLS = ['rg', 'grep']; /**
                                                               * Copyright (c) 2015-present, Facebook, Inc.
                                                               * All rights reserved.
                                                               *
                                                               * This source code is licensed under the license found in the LICENSE file in
                                                               * the root directory of this source tree.
                                                               *
                                                               * 
                                                               * @format
                                                               */

const POSIX_TOOLS = exports.POSIX_TOOLS = ['ag', 'rg', 'ack', 'grep'];

const searchToolHandlers = new Map([['ag', (directory, query) => (0, (_AgAckHandler || _load_AgAckHandler()).search)(directory, query, 'ag')], ['ack', (directory, query) => (0, (_AgAckHandler || _load_AgAckHandler()).search)(directory, query, 'ack')], ['rg', (_RgHandler || _load_RgHandler()).search], ['grep', (_GrepHandler || _load_GrepHandler()).search]]);

function searchInDirectory(directory, regex, tool, useVcsSearch) {
  return useVcsSearch ? (0, (_VcsSearchHandler || _load_VcsSearchHandler()).search)(directory, regex).catch(() => searchWithTool(tool, directory, regex)) : searchWithTool(tool, directory, regex);
}

function searchWithTool(tool, directory, regex) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => resolveTool(tool)).switchMap(actualTool => {
    const handler = searchToolHandlers.get(actualTool);
    if (handler != null) {
      return handler(directory, regex);
    }
    return _rxjsBundlesRxMinJs.Observable.empty();
  });
}

function searchInDirectories(directory, regex, subdirs, useVcsSearch, tool) {
  // Resolve tool once here so we do not call 'which' for each subdir.
  return _rxjsBundlesRxMinJs.Observable.defer(() => resolveToolWithDefault(tool, '')).switchMap(actualTool => {
    if (!subdirs || subdirs.length === 0) {
      // Since no subdirs were specified, run search on the root directory.
      return searchInDirectory(directory, regex, tool, useVcsSearch);
    } else if (subdirs.find(subdir => subdir.includes('*'))) {
      // Mimic Atom and use minimatch for glob matching.
      const matchers = subdirs.map(subdir => {
        let pattern = subdir;
        if (!pattern.includes('*')) {
          // Automatically glob-ify the non-globs.
          pattern = (_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator(pattern) + '**';
        }
        return new (_minimatch || _load_minimatch()).Minimatch(pattern, { matchBase: true, dot: true });
      });
      // TODO: This should walk the subdirectories and filter by glob before searching.
      return searchInDirectory(directory, regex, tool, useVcsSearch).filter(result => Boolean(matchers.find(matcher => matcher.match(result.file))));
    } else {
      // Run the search on each subdirectory that exists.
      return _rxjsBundlesRxMinJs.Observable.from(subdirs).concatMap((() => {
        var _ref3 = (0, _asyncToGenerator.default)(function* (subdir) {
          try {
            const stat = yield (_fsPromise || _load_fsPromise()).default.lstat((_nuclideUri || _load_nuclideUri()).default.join(directory, subdir));
            if (stat.isDirectory()) {
              return searchInDirectory((_nuclideUri || _load_nuclideUri()).default.join(directory, subdir), regex, tool, useVcsSearch);
            } else {
              return _rxjsBundlesRxMinJs.Observable.empty();
            }
          } catch (e) {
            return _rxjsBundlesRxMinJs.Observable.empty();
          }
        });

        return function (_x4) {
          return _ref3.apply(this, arguments);
        };
      })()).mergeAll();
    }
  });
}