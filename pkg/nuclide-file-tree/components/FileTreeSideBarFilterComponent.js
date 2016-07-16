'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  React,
} from 'react-for-atom';
import classnames from 'classnames';

type Props = {
  filter: string,
  found: boolean,
};

class FileTreeSidebarFilterComponent extends React.Component {
  props: Props;

  render() {
    const {filter, found} = this.props;

    const classes = classnames({
      'nuclide-file-tree-filter': true,
      'show': Boolean(filter && filter.length),
      'not-found': !found,
    });
    const text = `search for: ${filter}`;

    return (
      <div className={classes}>{text}</div>
    );
  }
}

module.exports = FileTreeSidebarFilterComponent;
