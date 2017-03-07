/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import FileChanges from '../../../nuclide-ui/FileChanges';
import parse from 'diffparser';
import React from 'react';

type Props = {
  diffContent: string,
};

export default class InteractiveFileChanges extends React.Component {
  props: Props;

  render(): React.Element<any> {
    const parsedDiffFiles = parse(this.props.diffContent);

    return (
      <div>
        {parsedDiffFiles.map(file =>
          <FileChanges diff={file} key={`${file.from}:${file.to}`} />,
        )}
      </div>
    );
  }
}
