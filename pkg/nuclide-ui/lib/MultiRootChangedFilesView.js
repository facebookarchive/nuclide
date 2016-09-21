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
            <span className="icon icon-file-directory nuclide-file-changes-root-entry">
              {nuclideUri.basename(this.props.rootPath)}
            </span>
          </div>
          <ul className="list-tree has-flat-children">
            {Array.from(fileChanges.entries()).map(
              ([filePath, fileChangeValue]) =>
                <li
                  data-path={filePath}
                  className="list-item"
                  key={filePath}>
                  <span className="icon icon-file-text">
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
          />,
        )}
      </div>
    );
  }
}
