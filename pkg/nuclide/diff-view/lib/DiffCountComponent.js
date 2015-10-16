'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react-for-atom';
const {PropTypes} = React;

export default class DiffCountComponent extends React.Component {

  constructor(props: Object) {
    super(props);
  }

  // $FlowIssue t8486988
  static propTypes = {
    count: PropTypes.number.isRequired,
  };

  render(): ReactElement {
    const {count} = this.props;
    return (
      <span>
        {count > 99 ? '+99' : count}
      </span>
    );
  }
}
