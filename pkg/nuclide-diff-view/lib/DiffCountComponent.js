'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';

type Props = {
  count: number;
};

class DiffCountComponent extends React.Component {
  props: Props;

  shouldComponentUpdate(nextProps: Props): boolean {
    return this.props.count !== nextProps.count;
  }

  render(): ?React.Element {
    const {count} = this.props;
    if (count === 0) {
      return null;
    }
    return (
      <span>
        {count > 99 ? '99+' : count}
      </span>
    );
  }
}

module.exports = DiffCountComponent;
