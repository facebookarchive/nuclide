'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../commons-node/nuclideUri';
import type {FileChangeStatusValue} from '../nuclide-hg-git-bridge/lib/constants';

import classnames from 'classnames';
import {
 FileChangeStatusToIcon,
 FileChangeStatusToTextColor,
} from '../nuclide-hg-git-bridge/lib/constants';
import nuclideUri from '../commons-node/nuclideUri';
import {React} from 'react-for-atom';
import {Icon} from './Icon';

type ChangedFilesProps = {
  fileChanges: Map<NuclideUri, FileChangeStatusValue>,
  rootPath: NuclideUri,
  commandPrefix: string,
  selectedFile: ?NuclideUri,
  hideEmptyFolders: boolean,
  shouldShowFolderName: boolean,
  onFileChosen: (filePath: NuclideUri) => void,
};

type ChangedFilesState = {
  isCollapsed: boolean,
};

export default class ChangedFilesList extends React.Component {
  props: ChangedFilesProps;
  state: ChangedFilesState;

  constructor(props: ChangedFilesProps) {
    super(props);
    this.state = {
      isCollapsed: false,
    };
  }

  _getFileClassname(file: NuclideUri, fileChangeValue: FileChangeStatusValue): string {
    const {selectedFile} = this.props;
    return classnames(
      'list-item', {
        selected: file === selectedFile,
      },
      FileChangeStatusToTextColor[fileChangeValue],
    );
  }

  render(): ?React.Element<any> {
    const {fileChanges, commandPrefix} = this.props;
    if (fileChanges.size === 0 && this.props.hideEmptyFolders) {
      return null;
    }

    const rootClassName = classnames('list-nested-item', {
      collapsed: this.state.isCollapsed,
    });

    const fileClassName = classnames(
      'icon',
      'icon-file-text',
      'nuclide-file-changes-file-entry',
      `${commandPrefix}-file-entry`,
    );

    return (
      <ul className="list-tree has-collapsable-children">
        <li className={rootClassName}>
          {this.props.shouldShowFolderName ?
            <div
              className="list-item"
              key={this.props.rootPath}
              onClick={() => this.setState({isCollapsed: !this.state.isCollapsed})}>
              <span
                className="icon icon-file-directory nuclide-file-changes-root-entry"
                data-path={this.props.rootPath}>
                {nuclideUri.basename(this.props.rootPath)}
              </span>
            </div> :
            null
          }
          <ul className="list-tree has-flat-children">
            {Array.from(fileChanges.entries()).map(
              ([filePath, fileChangeValue]) => {
                const baseName = nuclideUri.basename(filePath);
                return (
                  <li
                    data-path={filePath}
                    className={this._getFileClassname(filePath, fileChangeValue)}
                    key={filePath}
                    onClick={() => this.props.onFileChosen(filePath)}>
                    <Icon icon={FileChangeStatusToIcon[fileChangeValue]} />
                    <span
                      className={fileClassName}
                      data-name={baseName}
                      data-path={filePath}
                      data-root={this.props.rootPath}>
                      {baseName}
                    </span>
                  </li>
                );
              },
            )}
          </ul>
        </li>
      </ul>
    );
  }
}
