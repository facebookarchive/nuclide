'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HandlesByType} from '../../types';

import nuclideUri from '../../../../nuclide-remote-uri';
import {React} from 'react-for-atom';
import HandlesTableComponent from './HandlesTableComponent';

type Props = {
  activeHandlesByType: HandlesByType,
};

export default class ActiveHandlesSectionComponent extends React.Component {
  props: Props;

  render(): React.Element<any> {
    if (
      !this.props.activeHandlesByType ||
      Object.keys(this.props.activeHandlesByType).length === 0
    ) {
      return <div />;
    }

    // Note that widthPercentage properties should add up to 90 since the ID column always adds 10.
    return (
      <div>
        <HandlesTableComponent
          key={1}
          title="Child processes"
          handles={this.props.activeHandlesByType.childprocess}
          keyed={process => process.pid}
          columns={[{
            title: 'Name',
            value: process => nuclideUri.basename(process.spawnfile),
            widthPercentage: 15,
          }, {
            title: 'In',
            value: process => process.stdin && process.stdin.bytesWritten,
            widthPercentage: 5,
          }, {
            title: 'Out',
            value: process => process.stdout && process.stdout.bytesRead,
            widthPercentage: 5,
          }, {
            title: 'Err',
            value: process => process.stderr && process.stderr.bytesRead,
            widthPercentage: 5,
          }, {
            title: 'Args',
            value: process => {
              if (process.spawnargs && process.spawnargs.length > 1) {
                return process.spawnargs.slice(1).join(' ');
              }
            },
            widthPercentage: 60,
          }]}
        />
        <HandlesTableComponent
          key={2}
          title="TLS Sockets"
          handles={this.props.activeHandlesByType.tlssocket}
          keyed={socket => socket.localPort}
          columns={[{
            title: 'Host',
            value: socket => socket._host || socket.remoteAddress,
            widthPercentage: 70,
          }, {
            title: 'Read',
            value: socket => socket.bytesRead,
            widthPercentage: 10,
          }, {
            title: 'Written',
            value: socket => socket.bytesWritten,
            widthPercentage: 10,
          }]}
        />
        <HandlesTableComponent
          key={3}
          title="Other handles"
          handles={this.props.activeHandlesByType.other}
          keyed={(handle, h) => h}
          columns={[{
            title: 'Type',
            value: handle => handle.constructor.name,
            widthPercentage: 90,
          }]}
        />
      </div>
    );
  }
}
