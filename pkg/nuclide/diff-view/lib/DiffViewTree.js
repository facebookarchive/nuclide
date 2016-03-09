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
import type {FileChange, FileChangeStatusValue} from './types';
import type DiffViewModel from './DiffViewModel';
import type {NuclideUri} from '../../remote-uri';

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
import {getFileTreePathFromTargetEvent} from './utils';
import {getPath, basename} from '../../remote-uri';

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
  const statusCodeDefined = entry.statusCode != null;
  const classObject: Object = {
    'root': !statusCodeDefined,
    'file-change': statusCodeDefined,
  };
  switch (entry.statusCode) {
    case FileChangeStatus.ADDED:
    case FileChangeStatus.UNTRACKED:
      classObject['status-added'] = true;
      break;
    case FileChangeStatus.MODIFIED:
      classObject['status-modified'] = true;
      break;
    case FileChangeStatus.REMOVED:
    case FileChangeStatus.MISSING:
      classObject['status-removed'] = true;
      break;
  }
  return classnames(classObject);
}

type Props = {
  activeFilePath: ?NuclideUri;
  diffModel: DiffViewModel;
  fileChanges: Map<NuclideUri, FileChangeStatusValue>;
};

export default class DiffViewTree extends React.Component {
  props: Props;

  _subscriptions: CompositeDisposable;

  constructor(props: Props) {
    super(props);
    (this: any)._onConfirmSelection = this._onConfirmSelection.bind(this);
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return (
      this.props.activeFilePath !== nextProps.activeFilePath ||
      this.props.fileChanges !== nextProps.fileChanges
    );
  }

  componentDidMount(): void {
    this._subscriptions = new CompositeDisposable();
    this._subscriptions.add(atom.contextMenu.add({
      '.nuclide-diff-view-tree .entry.file-change': [
        {type: 'separator'},
        {
          label: 'Goto File',
          command: 'nuclide-diff-tree:goto-file',
        },
        {
          label: 'Copy File Name',
          command: 'nuclide-diff-tree:copy-file-name',
        },
        {
          label: 'Copy Full Path',
          command: 'nuclide-diff-tree:copy-full-path',
        },
        {type: 'separator'},
      ],
    }));
    this._subscriptions.add(atom.commands.add(
      '.nuclide-diff-view-tree .entry.file-change',
      'nuclide-diff-tree:goto-file',
      event => {
        const filePath = getFileTreePathFromTargetEvent(event);
        if (filePath != null && filePath.length) {
          atom.workspace.open(filePath);
        }
      }
    ));
    this._subscriptions.add(atom.commands.add(
      '.nuclide-diff-view-tree .entry.file-change',
      'nuclide-diff-tree:copy-full-path',
      event => {
        const filePath = getFileTreePathFromTargetEvent(event);
        atom.clipboard.write(getPath(filePath || ''));
      }
    ));
    this._subscriptions.add(atom.commands.add(
      '.nuclide-diff-view-tree .entry.file-change',
      'nuclide-diff-tree:copy-file-name',
      event => {
        const filePath = getFileTreePathFromTargetEvent(event);
        atom.clipboard.write(basename(filePath || ''));
      }
    ));
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
      treeRoot.selectNodeKey(this.props.activeFilePath).then(noOp, noOp);
    };
    treeRoot.setRoots(roots).then(selectFileNode, selectFileNode);
  }

  // TODO(most): move async code out of the React component class.
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
      const {fileChanges} = this.props;
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
    this._subscriptions.dispose();
  }

  render() {
    return (
      <TreeRootComponent
        initialRoots={[]}
        eventHandlerSelector=".nuclide-diff-view-tree"
        onConfirmSelection={this._onConfirmSelection}
        labelClassNameForNode={labelClassNameForNode}
        rowClassNameForNode={rowClassNameForNode}
        elementToRenderWhenEmpty={<div>No changes to show</div>}
        onKeepSelection={() => {}}
        ref="tree"
      />
    );
  }

  _onConfirmSelection(node: LazyTreeNode): void {
    const entry: FileChange = node.getItem();
    if (!entry.statusCode || entry.filePath === this.props.activeFilePath) {
      return;
    }
    this.props.diffModel.activateFile(entry.filePath);
  }
}
