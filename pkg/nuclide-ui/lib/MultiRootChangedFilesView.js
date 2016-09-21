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
    if (fileChanges.size === 0) {
      return <div>No changes to show</div>;
    }

    return (
      <div>File changes for root</div>
    );
  }
}

type Props = {
  fileChanges: Map<NuclideUri, Map<NuclideUri, FileChangeStatusValue>>,
};

export class MultiRootChangedFilesView extends React.Component {
  props: Props;

  render(): React.Element<any> {
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
