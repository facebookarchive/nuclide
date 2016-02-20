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
    const {record} = this.props;
    const classes = [
      'nuclide-output-record',
      `level-${record.level}`,
    ];

    const iconName = getIconName(record);
    const icon = iconName ? <span className={`icon icon-${iconName}`} /> : null;

    return (
      <div className={classes.join(' ')}>
        {icon}
        {renderContent(record)}
      </div>
    );
  }

}

function renderContent(record: Record): ReactElement {
  // If there's not text, use a space to make sure the row doesn't collapse.
  const text = record.text || ' ';
  return <pre>{text}</pre>;
}

function getIconName(record: Record): ?string {
  switch (record.level) {
    case 'info':
      return 'info';
    case 'warning':
      return 'alert';
    case 'error':
      return 'stop';
  }
}
