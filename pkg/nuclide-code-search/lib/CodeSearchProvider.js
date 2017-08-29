'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CodeSearchProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
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

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CodeSearchProvider = exports.CodeSearchProvider = {
  name: 'CodeSearchProvider',
  providerType: 'DIRECTORY',
  debounceDelay: 250,
  display: {
    action: 'nuclide-code-search:toggle-provider',
    prompt: 'Search code using tools like ag, rg or ack. Configure using the Nuclide config...',
    title: 'Code Search'
  },
  isEligibleForDirectory(directory) {
    return (0, _asyncToGenerator.default)(function* () {
      const projectRoot = directory.getPath();
      return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getCodeSearchServiceByNuclideUri)(projectRoot).isEligibleForDirectory(projectRoot);
    })();
  },
  executeQuery(query, directory) {
    return (0, _asyncToGenerator.default)(function* () {
      if (query.length === 0) {
        return [];
      }
      const projectRoot = directory.getPath();
      let lastPath = null;
      const config = (_featureConfig || _load_featureConfig()).default.get('nuclide-code-search');

      return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getCodeSearchServiceByNuclideUri)(projectRoot).searchWithTool(config.tool, projectRoot, query, config.maxResults).refCount().map(function (match) {
        const result = {
          isFirstResultForPath: match.file !== lastPath,
          path: match.file,
          query,
          line: match.row,
          column: match.column,
          context: match.line,

          relativePath: '.' + (_nuclideUri || _load_nuclideUri()).default.relative(projectRoot, match.file)
        };
        lastPath = match.file;
        return result;
      }).catch(function () {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }).toArray().map(function (results) {
        return results.length <= 1 ? [] : results;
      }).toPromise();
    })();
  },
  getComponentForItem(_item) {
    const item = _item;
    const context = replaceAndWrap(item.context || '', item.query, (rest, i) => _react.createElement(
      'span',
      {
        key: `rest-${i}`,
        className: 'code-search-provider-result-context-rest' },
      rest
    ), (match, i) => _react.createElement(
      'span',
      {
        key: `match-${i}`,
        className: 'code-search-provider-result-context-match' },
      match
    ));
    return _react.createElement(
      'div',
      {
        className: item.isFirstResultForPath ? 'code-search-provider-result-first-result-for-path' : null },
      item.isFirstResultForPath && _react.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, {
        className: 'code-search-provider-result-path',
        path: item.relativePath
      }),
      _react.createElement(
        'div',
        { className: 'code-search-provider-result-context' },
        context
      )
    );
  }
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */

function replaceAndWrap(str, search, wrapRest, wrapMatch) {
  // Generate a unique React `key` for each item in the result.
  let resultCount = 0;
  if (!search) {
    return [wrapRest(str, resultCount++)];
  }
  let current = str;
  const result = [];
  while (true) {
    const index = current.toLowerCase().indexOf(search.toLowerCase());
    if (index === -1) {
      break;
    }
    if (index !== 0) {
      result.push(wrapRest(current.slice(0, index), resultCount++));
    }
    result.push(wrapMatch(current.slice(index, index + search.length), resultCount++));
    current = current.slice(index + search.length);
  }
  if (current.length) {
    result.push(wrapRest(current, resultCount++));
  }
  return result;
}