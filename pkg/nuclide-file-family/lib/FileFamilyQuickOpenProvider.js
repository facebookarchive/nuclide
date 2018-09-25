"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _HighlightedText() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-ui/HighlightedText"));

  _HighlightedText = function () {
    return data;
  };

  return data;
}

function _PathWithFileIcon() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-ui/PathWithFileIcon"));

  _PathWithFileIcon = function () {
    return data;
  };

  return data;
}

function _nuclideFuzzyNative() {
  const data = require("../../../modules/nuclide-fuzzy-native");

  _nuclideFuzzyNative = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _FileFamilyAggregator() {
  const data = _interopRequireDefault(require("./FileFamilyAggregator"));

  _FileFamilyAggregator = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _matchIndexesToRanges() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/matchIndexesToRanges"));

  _matchIndexesToRanges = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
      (0, _nullthrows().default)(labelGroups.get('unlabeled')).push(file);
    } else {
      file.labels.forEach(label => {
        if (labelGroups.has(label)) {
          (0, _nullthrows().default)(labelGroups.get(label)).push(file);
        } else {
          labelGroups.set(label, [file]);
        }
      });
    }
  });
  const groupedFiles = [];
  labelGroups.forEach((labelledFiles, label) => {
    groupedFiles.push(...labelledFiles // Have existing files come before non-existing files with Create File
    // options.
    .sort((a, b) => !a.exists && b.exists ? 1 : a.exists && !b.exists ? -1 : 0).map((file, i) => {
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

    const results = _RxMin.Observable.defer(() => aggregator.getRelatedFiles(activeUri)).map(graph => {
      const cwd = this._cwds.getValue();

      const projectUri = cwd && cwd.getCwd();
      const files = Array.from(graph.files).map(([uri, file]) => Object.assign({
        path: uri,
        pathWithoutRoot: projectUri == null ? uri : `.${uri.replace(projectUri, '')}`
      }, file)).filter(file => file.path !== activeUri);
      const matcher = new (_nuclideFuzzyNative().Matcher)(files.map(file => file.pathWithoutRoot));
      return groupFilesByLabel(matcher.match(query, {
        recordMatchIndexes: true
      }).map((result, i) => {
        const file = files.find(f => f.pathWithoutRoot === result.value);
        return Object.assign({
          resultType: 'FILE',
          score: file && file.exists ? result.score * 10 : result.score,
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
        return React.createElement("div", null, React.createElement("span", {
          className: "file icon icon-file"
        }, "Open a file to retrieve alternates for it."));
    }

    const matchIndexes = item.matchIndexes || [];
    const path = item.pathWithoutRoot == null ? '' : item.pathWithoutRoot;
    return React.createElement("div", null, item.labelHeader != null && React.createElement("div", {
      className: "nuclide-file-family-quick-open-provider-file-label-header"
    }, item.labelHeader), React.createElement("div", {
      className: "nuclide-file-family-quick-open-provider-result",
      style: {
        opacity: item.exists ? 1 : 0.5
      }
    }, React.createElement(_PathWithFileIcon().default, {
      className: "nuclide-file-family-quick-open-provider-file-path",
      path: path
    }, React.createElement(_HighlightedText().default, {
      highlightedRanges: (0, _matchIndexesToRanges().default)(matchIndexes),
      text: path
    })), !item.exists && React.createElement("div", {
      className: "nuclide-file-family-quick-open-provider-create-file-container"
    }, React.createElement("span", {
      className: "nuclide-file-family-quick-open-provider-create-file-label"
    }, "Create File"))));
  }

}

var _default = FileFamilyQuickOpenProvider;
exports.default = _default;