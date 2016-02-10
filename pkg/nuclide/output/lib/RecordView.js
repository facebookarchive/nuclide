'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable react/prop-types */

import type {Record} from './types';

import {React} from 'react-for-atom';

type Props = {
  record: Record,
};

export default class RecordView extends React.Component<void, Props, void> {

  render(): ReactElement {
    const classes = [
      'nuclide-output-record',
      `level-${this.props.record.level}`,
    ];

    return (
      <pre className={classes.join(' ')}>
        {this.props.record.text}
      </pre>
    );
  }

}
