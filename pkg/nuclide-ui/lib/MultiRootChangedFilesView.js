'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {FileChangeStatusValue} from '../../nuclide-hg-git-bridge/lib/constants';

import {mapEqual} from '../../commons-node/collection';
import {FileChangeStatusToPrefix} from '../../nuclide-hg-git-bridge/lib/constants';
import nuclideUri from '../../commons-node/nuclideUri';
import {React} from 'react-for-atom';

type ChangedFilesProps = {
  fileChanges: Map<NuclideUri, FileChangeStatusValue>,
  rootPath: NuclideUri,
  onFileChosen: (filePath: NuclideUri) => void,
};

class ChangedFilesView extends React.Component {
  props: ChangedFilesProps;

  shouldComponentUpdate(nextProps: ChangedFilesProps) {
    return mapEqual(this.props.fileChanges, nextProps.fileChanges);
  }

  render(): React.Element<any> {
    const {fileChanges} = this.props;
    return (
      <ul className="list-tree has-collapsable-children">
        <li className="list-nested-item">
          <div
            className="list-item"
            key={this.props.rootPath}>
            <span
              className="icon icon-file-directory nuclide-file-changes-root-entry"
              data-path={this.props.rootPath}>
              {nuclideUri.basename(this.props.rootPath)}
            </span>
          </div>
          <ul className="list-tree has-flat-children">
            {Array.from(fileChanges.entries()).map(
              ([filePath, fileChangeValue]) =>
                <li
                  className="list-item"
                  key={filePath}
                  onClick={() => this.props.onFileChosen(filePath)}>
                  <span
                    className="icon icon-file-text nuclide-file-changes-file-entry"
                    data-path={filePath}>
                    {FileChangeStatusToPrefix[fileChangeValue]}{nuclideUri.basename(filePath)}
                  </span>
                </li>,
            )}
          </ul>
        </li>
      </ul>
    );
  }
}

type Props = {
  fileChanges: Map<NuclideUri, Map<NuclideUri, FileChangeStatusValue>>,
  onFileChosen: (filePath: NuclideUri) => void,
};

export class MultiRootChangedFilesView extends React.Component {
  props: Props;

  render(): React.Element<any> {
    if (this.props.fileChanges.size === 0) {
      return <div>No changes</div>;
    }

    return (
      <div>
        {Array.from(this.props.fileChanges.entries()).map(([root, fileChanges]) =>
          <ChangedFilesView
            key={root}
            fileChanges={fileChanges}
            rootPath={root}
            onFileChosen={this.props.onFileChosen}
          />,
        )}
      </div>
    );
  }
}
