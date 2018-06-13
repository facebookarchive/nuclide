'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _HighlightedText;

function _load_HighlightedText() {
  return _HighlightedText = _interopRequireDefault(require('../../../modules/nuclide-commons-ui/HighlightedText'));
}

var _PathWithFileIcon;

function _load_PathWithFileIcon() {
  return _PathWithFileIcon = _interopRequireDefault(require('../../nuclide-ui/PathWithFileIcon'));
}

var _nuclideFuzzyNative;

function _load_nuclideFuzzyNative() {
  return _nuclideFuzzyNative = require('../../nuclide-fuzzy-native');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _FileFamilyAggregator;

function _load_FileFamilyAggregator() {
  return _FileFamilyAggregator = _interopRequireDefault(require('./FileFamilyAggregator'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _matchIndexesToRanges;

function _load_matchIndexesToRanges() {
  return _matchIndexesToRanges = _interopRequireDefault(require('../../../modules/nuclide-commons/matchIndexesToRanges'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const ErrorCodes = Object.freeze({
  NO_ACTIVE_FILE: 'NO_ACTIVE_FILE'
});

function groupFilesByLabel(files) {
  const labelGroups = new Map();
  labelGroups.set('unlabeled', []);

  files.forEach(file => {
    if (file.labels == null || file.labels.size === 0) {
      (0, (_nullthrows || _load_nullthrows()).default)(labelGroups.get('unlabeled')).push(file);
    } else {
      file.labels.forEach(label => {
        if (labelGroups.has(label)) {
          (0, (_nullthrows || _load_nullthrows()).default)(labelGroups.get(label)).push(file);
        } else {
          labelGroups.set(label, [file]);
        }
      });
    }
  });

  const groupedFiles = [];
  labelGroups.forEach((labelledFiles, label) => {
    groupedFiles.push(...labelledFiles.map((file, i) => {
      // Add header for the first file in the label group
      if (i === 0) {
        file.labelHeader = label;
      }
      return file;
    }));
  });

  return groupedFiles;
}

class FileFamilyQuickOpenProvider {

  constructor(aggregators, cwds) {
    this.providerType = 'GLOBAL';
    this.name = 'FileFamilyQuickOpenProvider';
    this.debounceDelay = 0;
    this.display = {
      title: 'Related Files',
      prompt: 'Search file names of related files...',
      action: 'nuclide-file-family-quick-open-provider:toggle-provider'
    };

    this._aggregators = aggregators;
    this._cwds = cwds;
  }

  async isEligibleForDirectories(directories) {
    return true;
  }

  executeQuery(query, directories) {
    const aggregator = this._aggregators.getValue();
    if (aggregator == null) {
      return Promise.resolve([]);
    }

    const activeEditor = atom.workspace.getActiveTextEditor();
    const activeUri = activeEditor && activeEditor.getURI();

    if (activeUri == null) {
      return Promise.resolve([{
        resultType: 'FILE',
        path: '',
        errorCode: ErrorCodes.NO_ACTIVE_FILE
      }]);
    }

    const results = _rxjsBundlesRxMinJs.Observable.defer(() => aggregator.getRelatedFiles(activeUri)).map(graph => {
      const cwd = this._cwds.getValue();
      const projectUri = cwd && cwd.getCwd();

      const files = Array.from(graph.files).map(([uri, file]) => Object.assign({
        path: uri,
        pathWithoutRoot: projectUri == null ? uri : `.${uri.replace(projectUri, '')}`
      }, file)).filter(file => file.path !== activeUri);

      const matcher = new (_nuclideFuzzyNative || _load_nuclideFuzzyNative()).Matcher(files.map(file => file.pathWithoutRoot));

      return groupFilesByLabel(matcher.match(query, { recordMatchIndexes: true }).map((result, i) => {
        const file = files.find(f => f.pathWithoutRoot === result.value);

        return Object.assign({
          resultType: 'FILE',
          score: result.score,
          matchIndexes: result.matchIndexes
        }, file);
      }));
    }).toPromise();

    return results;
  }

  getComponentForItem(item) {
    // Special paths indicate that an error occurred.
    switch (item.errorCode) {
      case ErrorCodes.NO_ACTIVE_FILE:
        return _react.createElement(
          'div',
          null,
          _react.createElement(
            'span',
            { className: 'file icon icon-file' },
            'Open a file to retrieve alternates for it.'
          )
        );
    }

    const matchIndexes = item.matchIndexes || [];
    const path = item.pathWithoutRoot == null ? '' : item.pathWithoutRoot;

    return _react.createElement(
      'div',
      null,
      item.labelHeader != null && _react.createElement(
        'div',
        { className: 'nuclide-file-family-quick-open-provider-file-label-header' },
        item.labelHeader
      ),
      _react.createElement(
        'div',
        {
          className: 'nuclide-file-family-quick-open-provider-result',
          style: { opacity: item.exists ? 1 : 0.5 } },
        _react.createElement(
          (_PathWithFileIcon || _load_PathWithFileIcon()).default,
          {
            className: 'nuclide-file-family-quick-open-provider-file-path',
            path: path },
          _react.createElement((_HighlightedText || _load_HighlightedText()).default, {
            highlightedRanges: (0, (_matchIndexesToRanges || _load_matchIndexesToRanges()).default)(matchIndexes),
            text: path
          })
        ),
        !item.exists && _react.createElement(
          'div',
          { className: 'nuclide-file-family-quick-open-provider-create-file-container' },
          _react.createElement(
            'span',
            { className: 'nuclide-file-family-quick-open-provider-create-file-label' },
            'Create File'
          )
        )
      )
    );
  }
}

exports.default = FileFamilyQuickOpenProvider;