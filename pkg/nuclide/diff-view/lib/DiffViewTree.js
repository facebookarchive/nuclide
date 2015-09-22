'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {fileTypeClass} = require('nuclide-atom-helpers');
var {TreeRootComponent} = require('nuclide-ui-tree');
var DiffViewTreeNode = require('./DiffViewTreeNode');
var Immutable = require('immutable');
var {FileChangeStatus} = require('./constants');
var {CompositeDisposable} = require('atom');

import type LazyTreeNode from 'nuclide-ui-tree';
import type {FileChange, FileChangeState} from './types';

var React = require('react-for-atom');
var {PropTypes, addons} = React;

function labelClassNameForNode(node: LazyTreeNode): string {
  var classObj = {
    'icon': true,
    'name': true,
  };

  if (node.isContainer()) {
    classObj['icon-file-directory'] = true;
  } else if (node.getItem().statusCode) {
    classObj[fileTypeClass(node.getLabel())] = true;
  }
  return addons.classSet(classObj);
}

function rowClassNameForNode(node: LazyTreeNode) {
  var vcsClassName = vcsClassNameForEntry(node.getItem());
  return addons.classSet({
    [vcsClassName]: vcsClassName,
  });
}

function vcsClassNameForEntry(entry: FileChange): string {
  var className = '';
  switch (entry.statusCode) {
  case FileChangeStatus.ADDED:
  case FileChangeStatus.UNTRACKED:
    className = 'status-added';
    break;
  case FileChangeStatus.MODIFIED:
    className = 'status-modified';
    break;
  case FileChangeStatus.REMOVED:
  case FileChangeStatus.MISSING:
    className = 'status-removed';
    break;
  }
  return className;
}

class DiffViewTree extends React.Component {

  _boundOnConfirmSelection: Function;
  _subscriptions: ?CompositeDisposable;

  constructor(props: Object) {
    super(props);
    this._boundOnConfirmSelection = this._onConfirmSelection.bind(this);
    var diffModel = props.diffModel;
    var {filePath} = diffModel.getActiveFileState();
    this.state = {
      fileChanges: diffModel.getFileChanges(),
      selectedFilePath: filePath,
    };
  }

  componentDidMount(): void {
    var diffModel = this.props.diffModel;
    var subscriptions = this._subscriptions = new CompositeDisposable();
    subscriptions.add(diffModel.onDidChangeStatus((fileChanges: Map<string, number>) => {
      this.setState({fileChanges, selectedFilePath: this.state.selectedFilePath});
    }));
    subscriptions.add(diffModel.onActiveFileUpdates((fileState: FileChangeState) => {
      var {filePath} = fileState;
      if (filePath !== this.state.selectedFilePath) {
        this.setState({selectedFilePath: filePath, fileChanges: this.state.fileChanges});
      }
    }));
  }

  componentDidUpdate(): void {
    var roots = atom.project.getDirectories().map(directory => {
      return new DiffViewTreeNode(
        {filePath: directory.getPath()},
        null, /* null parent for roots */
        true, /* isContainer */
        this._rootChildrenFetcher.bind(this), /* root children fetcher */
      );
    });
    var treeRoot = this.refs['tree'];
    var noOp = () => {};
    var selectFileNode = () => {
      treeRoot.selectNodeKey(this.state.selectedFilePath).then(noOp, noOp);
    };
    treeRoot.setRoots(roots).then(selectFileNode, selectFileNode);
  }

  async _rootChildrenFetcher(rootNode: LazyTreeNode): Promise<Immutable.List<LazyTreeNode>> {
    var noChildrenFetcher = async () => Immutable.List.of();
    var {filePath: rootPath} = rootNode.getItem();
    var childNodes = [];
    var {repositoryForPath} = require('nuclide-hg-git-bridge');
    var repository = repositoryForPath(rootPath);
    if (!repository || repository.getType() !== 'hg') {
      var nodeName = `[X] Non-Mercurial Repository`;
      childNodes.push(
        new DiffViewTreeNode({filePath: nodeName}, rootNode, false, noChildrenFetcher)
      );
    } else {
      this.state.fileChanges.forEach((statusCode, filePath) => {
        if (filePath.startsWith(rootPath)) {
          childNodes.push(
            new DiffViewTreeNode({filePath, statusCode}, rootNode, false, noChildrenFetcher)
          );
        }
      });
    }
    return Immutable.List(childNodes);
  }

  componentWillUnmount(): void {
    if (this._subscriptions) {
      this._subscriptions.dispose();
      this._subscriptions = null;
    }
  }

  render() {
    return (
      <TreeRootComponent
        initialRoots={[]}
        eventHandlerSelector=".nuclide-diff-view-tree"
        onConfirmSelection={this._boundOnConfirmSelection}
        labelClassNameForNode={labelClassNameForNode}
        rowClassNameForNode={rowClassNameForNode}
        elementToRenderWhenEmpty=<div>No changes to show</div>
        onKeepSelection={() => {}}
        ref="tree" />
    );
  }

  _onConfirmSelection(node: LazyTreeNode): void {
    var entry: FileChange = node.getItem();
    if (!entry.statusCode || entry.filePath === this.state.selectedFilePath) {
      return;
    }
    this.props.diffModel.activateFile(entry.filePath);
  }
}

DiffViewTree.propTypes = {
  diffModel: PropTypes.object.isRequired,
};

module.exports = DiffViewTree;
