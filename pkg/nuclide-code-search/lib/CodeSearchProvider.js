'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CodeSearchProvider = undefined;

var _HighlightedText;

function _load_HighlightedText() {
  return _HighlightedText = _interopRequireDefault(require('../../../modules/nuclide-commons-ui/HighlightedText'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _string;

function _load_string() {
  return _string = require('../../../modules/nuclide-commons/string');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _react = _interopRequireWildcard(require('react'));

var _PathWithFileIcon;

function _load_PathWithFileIcon() {
  return _PathWithFileIcon = _interopRequireDefault(require('../../nuclide-ui/PathWithFileIcon'));
}

var _escapeStringRegexp;

function _load_escapeStringRegexp() {
  return _escapeStringRegexp = _interopRequireDefault(require('escape-string-regexp'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const directoriesObs = new _rxjsBundlesRxMinJs.Subject(); /**
                                                           * Copyright (c) 2015-present, Facebook, Inc.
                                                           * All rights reserved.
                                                           *
                                                           * This source code is licensed under the license found in the LICENSE file in
                                                           * the root directory of this source tree.
                                                           *
                                                           * 
                                                           * @format
                                                           */

const SEARCH_TIMEOUT = 10000;

const CodeSearchProvider = exports.CodeSearchProvider = {
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
        isAvailableForPath
        // $FlowFB
      } = require('../../commons-atom/fb-biggrep-query');
      if (await isAvailableForPath(directory.getPath())) {
        return false;
      }
    } catch (err) {}
    const projectRoot = directory.getPath();
    return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getCodeSearchServiceByNuclideUri)(projectRoot).isEligibleForDirectory(projectRoot);
  },
  async executeQuery(query, directory) {
    directoriesObs.next(directory);
    if (query.length === 0) {
      return [];
    }
    const projectRoot = directory.getPath();
    let lastPath = null;
    const config = (0, (_utils || _load_utils()).pickConfigByUri)(projectRoot);
    const regexp = new RegExp((0, (_escapeStringRegexp || _load_escapeStringRegexp()).default)(query), 'i');

    return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getCodeSearchServiceByNuclideUri)(projectRoot).codeSearch(projectRoot, regexp, config.useVcsSearch, config.tool.length === 0 ? null : config.tool, config.maxResults).refCount().map(match => {
      const result = {
        isFirstResultForPath: match.file !== lastPath,
        path: match.file,
        query,
        line: match.row,
        column: match.column,
        context: match.line,
        displayPath: `./${(_nuclideUri || _load_nuclideUri()).default.relative(projectRoot, match.file).replace(/\\/g, '/')}`,
        resultType: 'FILE'
      };
      lastPath = match.file;
      return result;
    }).timeout(SEARCH_TIMEOUT).catch(() => _rxjsBundlesRxMinJs.Observable.empty()).toArray().takeUntil(directoriesObs.filter(dir => dir.getPath() === projectRoot)).toPromise()
    // toPromise yields undefined if it was interrupted.
    .then(result => result || []);
  },
  getComponentForItem(_item) {
    const item = _item;
    return _react.createElement(
      'div',
      {
        className: item.isFirstResultForPath ? 'code-search-provider-result-first-result-for-path' : null },
      item.isFirstResultForPath && _react.createElement(
        (_PathWithFileIcon || _load_PathWithFileIcon()).default,
        {
          className: 'code-search-provider-result-path',
          path: item.path },
        item.displayPath
      ),
      _react.createElement(
        'div',
        { className: 'code-search-provider-result-context' },
        _react.createElement((_HighlightedText || _load_HighlightedText()).default, {
          highlightedRanges: (0, (_string || _load_string()).getMatchRanges)(
          // The search is case-insensitive.
          item.context.toLowerCase(), item.query.toLowerCase()),
          text: item.context
        })
      )
    );
  }
};