'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type LazyTreeNode from '../../ui/tree';
import type {FileChange, FileChangeState} from './types';
import type DiffViewModel from './DiffViewModel';

import {fileTypeClass} from '../../atom-helpers';
import {TreeRootComponent} from '../../ui/tree';
import DiffViewTreeNode from './DiffViewTreeNode';
import remoteUri from '../../remote-uri';
import Immutable from 'immutable';
import {FileChangeStatus} from './constants';
import {CompositeDisposable} from 'atom';
import {React} from 'react-for-atom';

import {array} from '../../commons';
import classnames from 'classnames';

function labelClassNameForNode(node: LazyTreeNode): string {
  const classObj = {
    'icon': true,
    'name': true,
  };

  if (node.isContainer()) {
    classObj[`icon-file-directory`] = true;
  } else if (node.getItem().statusCode) {
    classObj[fileTypeClass(node.getLabel())] = true;
  }
  return classnames(classObj);
}

function rowClassNameForNode(node: LazyTreeNode) {
  const vcsClassName = vcsClassNameForEntry(node.getItem());
  return classnames({
    [vcsClassName]: vcsClassName,
  });
}

function vcsClassNameForEntry(entry: FileChange): string {
  let className = '';
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

type Props = {
  diffModel: DiffViewModel;
};

/* eslint-disable react/prop-types */
export default class DiffViewTree extends React.Component {

  _boundOnConfirmSelection: Function;
  _subscriptions: ?CompositeDisposable;

  constructor(props: Props) {
    super(props);
    this._boundOnConfirmSelection = this._onConfirmSelection.bind(this);
    const {diffModel} = props;
    const {filePath} = diffModel.getActiveFileState();
    this.state = {
      fileChanges: diffModel.getCompareFileChanges(),
      selectedFilePath: filePath,
    };
  }

  componentDidMount(): void {
    const {diffModel} = this.props;
    const subscriptions = this._subscriptions = new CompositeDisposable();
    subscriptions.add(diffModel.onDidChangeCompareStatus(fileChanges => {
      this.setState({fileChanges, selectedFilePath: this.state.selectedFilePath});
    }));
    subscriptions.add(diffModel.onActiveFileUpdates((fileState: FileChangeState) => {
      const {filePath} = fileState;
      if (filePath !== this.state.selectedFilePath) {
        this.setState({selectedFilePath: filePath, fileChanges: this.state.fileChanges});
      }
    }));
  }

  componentDidUpdate(): void {
    const roots = atom.project.getDirectories().map(directory => {
      return new DiffViewTreeNode(
        {filePath: directory.getPath()},
        null, /* null parent for roots */
        true, /* isContainer */
        this._rootChildrenFetcher.bind(this), /* root children fetcher */
      );
    });
    const treeRoot = this.refs['tree'];
    const noOp = () => {};
    const selectFileNode = () => {
      treeRoot.selectNodeKey(this.state.selectedFilePath).then(noOp, noOp);
    };
    treeRoot.setRoots(roots).then(selectFileNode, selectFileNode);
  }

  async _rootChildrenFetcher(rootNode: LazyTreeNode): Promise<Immutable.List<LazyTreeNode>> {
    const noChildrenFetcher = async () => Immutable.List.of();
    const {filePath: rootPath} = rootNode.getItem();
    const childNodes = [];
    const {repositoryForPath} = require('../../hg-git-bridge');
    const repository = repositoryForPath(rootPath);
    if (repository == null || repository.getType() !== 'hg') {
      const nodeName = `[X] Non-Mercurial Repository`;
      childNodes.push(
        new DiffViewTreeNode({filePath: nodeName}, rootNode, false, noChildrenFetcher)
      );
    } else {
      const {fileChanges} = this.state;
      const filePaths = array.from(fileChanges.keys())
        .sort((filePath1, filePath2) =>
          remoteUri.basename(filePath1).toLowerCase().localeCompare(
            remoteUri.basename(filePath2).toLowerCase()
          )
        );
      for (const filePath of filePaths) {
        if (filePath.startsWith(rootPath)) {
          const statusCode = fileChanges.get(filePath);
          childNodes.push(
            new DiffViewTreeNode({filePath, statusCode}, rootNode, false, noChildrenFetcher)
          );
        }
      }
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
        elementToRenderWhenEmpty={<div>No changes to show</div>}
        onKeepSelection={() => {}}
        ref="tree" />
    );
  }

  _onConfirmSelection(node: LazyTreeNode): void {
    const entry: FileChange = node.getItem();
    if (!entry.statusCode || entry.filePath === this.state.selectedFilePath) {
      return;
    }
    this.props.diffModel.activateFile(entry.filePath);
  }
}
