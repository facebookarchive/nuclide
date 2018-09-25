"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CodeSearchProvider = void 0;

function _HighlightedText() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-ui/HighlightedText"));

  _HighlightedText = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("../../../modules/nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

var React = _interopRequireWildcard(require("react"));

function _PathWithFileIcon() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-ui/PathWithFileIcon"));

  _PathWithFileIcon = function () {
    return data;
  };

  return data;
}

function _escapeStringRegexp() {
  const data = _interopRequireDefault(require("escape-string-regexp"));

  _escapeStringRegexp = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("./utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const directoriesObs = new _RxMin.Subject();
const SEARCH_TIMEOUT = 10000;
const CodeSearchProvider = {
  name: 'CodeSearchProvider',
  providerType: 'DIRECTORY',
  debounceDelay: 250,
  display: {
    action: 'nuclide-code-search:toggle-provider',
    prompt: 'Search code using tools like rg or ack. Configure using the Nuclide config...',
    title: 'Code Search'
  },

  async isEligibleForDirectory(directory) {
    try {
      const {
        isAvailableForPath // $FlowFB

      } = require("../../commons-atom/fb-biggrep-query");

      if (await isAvailableForPath(directory.getPath())) {
        return false;
      }
    } catch (err) {}

    const projectRoot = directory.getPath();
    return (0, _nuclideRemoteConnection().getCodeSearchServiceByNuclideUri)(projectRoot).isEligibleForDirectory(projectRoot);
  },

  async executeQuery(query, directory) {
    directoriesObs.next(directory);

    if (query.length === 0) {
      return [];
    }

    const projectRoot = directory.getPath();
    let lastPath = null;
    const config = (0, _utils().pickConfigByUri)(projectRoot);
    const regexp = new RegExp((0, _escapeStringRegexp().default)(query), 'i');
    return (0, _nuclideRemoteConnection().getCodeSearchServiceByNuclideUri)(projectRoot).codeSearch(projectRoot, regexp, config.useVcsSearch, config.tool.length === 0 ? null : config.tool, config.maxResults).refCount().map(match => {
      const result = {
        isFirstResultForPath: match.file !== lastPath,
        path: match.file,
        query,
        line: match.row,
        column: match.column,
        context: match.line,
        displayPath: `./${_nuclideUri().default.relative(projectRoot, match.file).replace(/\\/g, '/')}`,
        resultType: 'FILE'
      };
      lastPath = match.file;
      return result;
    }).timeout(SEARCH_TIMEOUT).catch(() => _RxMin.Observable.empty()).toArray().takeUntil(directoriesObs.filter(dir => dir.getPath() === projectRoot)).toPromise() // toPromise yields undefined if it was interrupted.
    .then(result => result || []);
  },

  getComponentForItem(_item) {
    const item = _item;
    return React.createElement("div", {
      className: item.isFirstResultForPath ? 'code-search-provider-result-first-result-for-path' : null
    }, item.isFirstResultForPath && React.createElement(_PathWithFileIcon().default, {
      className: "code-search-provider-result-path",
      path: item.path
    }, item.displayPath), React.createElement("div", {
      className: "code-search-provider-result-context"
    }, React.createElement(_HighlightedText().default, {
      highlightedRanges: (0, _string().getMatchRanges)( // The search is case-insensitive.
      item.context.toLowerCase(), item.query.toLowerCase()),
      text: item.context
    })));
  }

};
exports.CodeSearchProvider = CodeSearchProvider;