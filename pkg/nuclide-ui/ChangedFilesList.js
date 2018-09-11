"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.computeDisplayPaths = computeDisplayPaths;
exports.default = void 0;

function _addTooltip() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons-ui/addTooltip"));

  _addTooltip = function () {
    return data;
  };

  return data;
}

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
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

var React = _interopRequireWildcard(require("react"));

function _ChangedFile() {
  const data = _interopRequireDefault(require("./ChangedFile"));

  _ChangedFile = function () {
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
 *  strict-local
 * @format
 */
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
    const separator = _nuclideUri().default.pathSeparatorFor(path);

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
    toProcess.forEach(({
      pathParts,
      depth
    }) => {
      const path = pathParts.slice(0, depth).join('/');

      if (seenCount[path] == null) {
        seenCount[path] = 1;
      } else {
        seenCount[path]++;
      }
    }); // Mark the display paths seen exactly once as done.
    // Increment the depth otherwise.

    toProcess.forEach(displayPath => {
      const {
        depth,
        pathParts
      } = displayPath;
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

  return displayPaths.map(({
    separator,
    pathParts,
    depth
  }) => pathParts.slice(0, depth).reverse().join(separator));
}

const FILE_CHANGES_INITIAL_PAGE_SIZE = 100;
const GENERATED_TYPE_PRIORITY = ['manual', 'partial', 'generated'];

class ChangedFilesList extends React.Component {
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
      fileStatuses,
      generatedTypes,
      onAddFile,
      onDeleteFile,
      onFileChecked,
      onFileChosen,
      onForgetFile,
      onMarkFileResolved,
      onOpenFileInDiffView,
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
        fileStatus: (0, _nullthrows().default)(fileStatuses.get(filePath)),
        generatedType
      };
    }).sort((change1, change2) => {
      // Generated files always go after manually edited files
      if (change1.generatedType !== change2.generatedType) {
        return GENERATED_TYPE_PRIORITY.indexOf(change1.generatedType) - GENERATED_TYPE_PRIORITY.indexOf(change2.generatedType);
      }

      return _nuclideUri().default.basename(change1.filePath).localeCompare(_nuclideUri().default.basename(change2.filePath));
    });
    const rootClassName = (0, _classnames().default)('list-nested-item', {
      collapsed: this.state.isCollapsed
    });
    const showMoreFilesElement = fileStatuses.size > filesToShow ? React.createElement("div", {
      className: "icon icon-ellipsis" // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
      ,
      ref: (0, _addTooltip().default)({
        title: 'Show more files with uncommitted changes',
        delay: 300,
        placement: 'bottom'
      }),
      onClick: () => this.setState({
        // TODO: (wbinnssmith) T30771435 this setState depends on current state
        // and should use an updater function rather than an object
        // eslint-disable-next-line react/no-access-state-in-setstate
        visiblePagesCount: this.state.visiblePagesCount + 1
      })
    }) : null;
    return React.createElement("ul", {
      className: "list-tree has-collapsable-children nuclide-changed-files-list"
    }, React.createElement("li", {
      className: rootClassName
    }, this.props.shouldShowFolderName ? React.createElement("div", {
      className: "list-item",
      key: this.props.rootPath,
      onClick: () => // TODO: (wbinnssmith) T30771435 this setState depends on current state
      // and should use an updater function rather than an object
      // eslint-disable-next-line react/no-access-state-in-setstate
      this.setState({
        isCollapsed: !this.state.isCollapsed
      })
    }, React.createElement("span", {
      className: "icon icon-file-directory nuclide-file-changes-root-entry",
      "data-path": this.props.rootPath
    }, _nuclideUri().default.basename(this.props.rootPath))) : null, React.createElement("ul", {
      className: "list-tree has-flat-children"
    }, sizeLimitedFileChanges.map(({
      displayPath,
      filePath,
      fileStatus,
      generatedType
    }) => {
      return React.createElement(_ChangedFile().default, {
        displayPath: displayPath,
        filePath: filePath,
        fileStatus: fileStatus,
        generatedType: generatedType,
        isChecked: checkedFiles == null ? null : checkedFiles.has(filePath),
        isSelected: selectedFile === filePath,
        key: filePath,
        onAddFile: onAddFile,
        onDeleteFile: onDeleteFile,
        onFileChecked: onFileChecked,
        onFileChosen: onFileChosen,
        onForgetFile: onForgetFile,
        onMarkFileResolved: onMarkFileResolved,
        onOpenFileInDiffView: onOpenFileInDiffView,
        onRevertFile: onRevertFile,
        rootPath: rootPath
      });
    }), React.createElement("li", null, showMoreFilesElement))));
  }

}

exports.default = ChangedFilesList;