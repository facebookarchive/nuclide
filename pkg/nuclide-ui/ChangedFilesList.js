'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.computeDisplayPaths = computeDisplayPaths;

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../nuclide-vcs-base');
}

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('../../modules/nuclide-commons-ui/addTooltip'));
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../modules/nuclide-commons/nuclideUri'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _react = _interopRequireWildcard(require('react'));

var _ChangedFile;

function _load_ChangedFile() {
  return _ChangedFile = _interopRequireDefault(require('./ChangedFile'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

function isHgPath(path) {
  const repo = (0, (_nuclideVcsBase || _load_nuclideVcsBase()).repositoryForPath)(path);
  return repo != null && repo.getType() === 'hg';
}

// Computes the minimally differentiable display path for each file.
// The algorithm is O(n*m^2) where n = filePaths.length and m = maximum number
// parts in a given path and the implementation is semi-optimized for
// performance.
//
// ['/a/b/c.js', '/a/d/c.js'] would return ['b/c.js', 'd/c.js']
// ['/a/b/c.js', '/a/b/d.js'] would return ['c.js', 'd.js']
// ['/a/b.js', '/c/a/b.js'] would return ['/a/b.js', 'c/a/b.js']
function computeDisplayPaths(filePaths, maxDepth = 5) {
  const displayPaths = filePaths.map(path => {
    const separator = (_nuclideUri || _load_nuclideUri()).default.pathSeparatorFor(path);
    return {
      separator,
      pathParts: path.split(separator).reverse(),
      depth: 1,
      done: false
    };
  });

  let seenCount = {};
  let currentDepth = 1;
  let toProcess = displayPaths;
  while (currentDepth < maxDepth && toProcess.length > 0) {
    // Compute number of times each display path is seen.
    toProcess.forEach(({ pathParts, depth }) => {
      const path = pathParts.slice(0, depth).join('/');
      if (seenCount[path] == null) {
        seenCount[path] = 1;
      } else {
        seenCount[path]++;
      }
    });

    // Mark the display paths seen exactly once as done.
    // Increment the depth otherwise.
    toProcess.forEach(displayPath => {
      const { depth, pathParts } = displayPath;
      const path = pathParts.slice(0, depth).join('/');

      if (seenCount[path] === 1 || depth === pathParts.length) {
        displayPath.done = true;
      } else {
        displayPath.depth++;
      }
    });

    toProcess = toProcess.filter(displayPath => !displayPath.done);
    seenCount = {};
    currentDepth++;
  }

  return displayPaths.map(({ separator, pathParts, depth }) => pathParts.slice(0, depth).reverse().join(separator));
}

const FILE_CHANGES_INITIAL_PAGE_SIZE = 100;

class ChangedFilesList extends _react.Component {
  constructor(props) {
    super(props);
    this.state = {
      isCollapsed: false,
      visiblePagesCount: 1
    };
  }

  render() {
    const {
      checkedFiles,
      enableInlineActions,
      fileStatuses,
      generatedTypes,
      onAddFile,
      onDeleteFile,
      onFileChecked,
      onFileChosen,
      onForgetFile,
      onMarkFileResolved,
      onOpenFileInDiffView,
      openInDiffViewOption,
      onRevertFile,
      rootPath,
      selectedFile
    } = this.props;

    const filesToShow = FILE_CHANGES_INITIAL_PAGE_SIZE * this.state.visiblePagesCount;
    const filePaths = Array.from(fileStatuses.keys()).slice(0, filesToShow);
    const displayPaths = computeDisplayPaths(filePaths);
    const sizeLimitedFileChanges = filePaths.map((filePath, index) => {
      const generatedType = generatedTypes != null ? generatedTypes.get(filePath) : null;
      return {
        filePath,
        displayPath: displayPaths[index],
        fileStatus: (0, (_nullthrows || _load_nullthrows()).default)(fileStatuses.get(filePath)),
        generatedType
      };
    }).sort((change1, change2) => (_nuclideUri || _load_nuclideUri()).default.basename(change1.filePath).localeCompare((_nuclideUri || _load_nuclideUri()).default.basename(change2.filePath)));

    const rootClassName = (0, (_classnames || _load_classnames()).default)('list-nested-item', {
      collapsed: this.state.isCollapsed
    });

    const showMoreFilesElement = fileStatuses.size > filesToShow ? _react.createElement('div', {
      className: 'icon icon-ellipsis'
      // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
      , ref: (0, (_addTooltip || _load_addTooltip()).default)({
        title: 'Show more files with uncommitted changes',
        delay: 300,
        placement: 'bottom'
      }),
      onClick: () => this.setState({
        visiblePagesCount: this.state.visiblePagesCount + 1
      })
    }) : null;

    const isHgRoot = isHgPath(rootPath);
    return _react.createElement(
      'ul',
      { className: 'list-tree has-collapsable-children nuclide-changed-files-list' },
      _react.createElement(
        'li',
        { className: rootClassName },
        this.props.shouldShowFolderName ? _react.createElement(
          'div',
          {
            className: 'list-item',
            key: this.props.rootPath,
            onClick: () => this.setState({ isCollapsed: !this.state.isCollapsed }) },
          _react.createElement(
            'span',
            {
              className: 'icon icon-file-directory nuclide-file-changes-root-entry',
              'data-path': this.props.rootPath },
            (_nuclideUri || _load_nuclideUri()).default.basename(this.props.rootPath)
          )
        ) : null,
        _react.createElement(
          'ul',
          { className: 'list-tree has-flat-children' },
          sizeLimitedFileChanges.map(({ displayPath, filePath, fileStatus, generatedType }) => {
            return _react.createElement((_ChangedFile || _load_ChangedFile()).default, {
              displayPath: displayPath,
              enableInlineActions: enableInlineActions,
              filePath: filePath,
              fileStatus: fileStatus,
              generatedType: generatedType,
              isChecked: checkedFiles == null ? null : checkedFiles.has(filePath),
              isHgPath: isHgRoot,
              isSelected: selectedFile === filePath,
              key: filePath,
              onAddFile: onAddFile,
              onDeleteFile: onDeleteFile,
              onFileChecked: onFileChecked,
              onFileChosen: onFileChosen,
              onForgetFile: onForgetFile,
              onMarkFileResolved: onMarkFileResolved,
              onOpenFileInDiffView: onOpenFileInDiffView,
              openInDiffViewOption: openInDiffViewOption,
              onRevertFile: onRevertFile,
              rootPath: rootPath
            });
          }),
          _react.createElement(
            'li',
            null,
            showMoreFilesElement
          )
        )
      )
    );
  }
}
exports.default = ChangedFilesList;