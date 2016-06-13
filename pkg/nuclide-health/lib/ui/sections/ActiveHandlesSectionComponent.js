'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import path from 'path';
import {React} from 'react-for-atom';
import HandlesTableComponent from './HandlesTableComponent';

const {PropTypes} = React;

export default class ActiveHandlesSectionComponent extends React.Component {

  static propTypes = {
    activeHandleObjects: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  // Returns a list of handles which are not children of others (i.e. sockets as process pipes).
  static getTopLevelHandles(handles: Array<Object>): Set<Object> {
    const topLevelHandles: Set<Object> = new Set();
    const seen: Set<Object> = new Set();
    handles.forEach(handle => {
      if (seen.has(handle)) {
        return;
      }
      seen.add(handle);
      topLevelHandles.add(handle);
      if (handle.constructor.name === 'ChildProcess') {
        seen.add(handle);
        ['stdin', 'stdout', 'stderr', '_channel'].forEach(pipe => {
          if (handle[pipe]) {
            seen.add(handle[pipe]);
          }
        });
      }
    });
    return topLevelHandles;
  }

  render(): React.Element<any> {
    if (!this.props.activeHandleObjects || this.props.activeHandleObjects.length === 0) {
      return <div />;
    }

    const handlesByType = {};
    ActiveHandlesSectionComponent.getTopLevelHandles(this.props.activeHandleObjects).forEach(
      handle => {
        let type = handle.constructor.name.toLowerCase();
        if (type !== 'childprocess' && type !== 'tlssocket') {
          type = 'other';
        }
        if (!handlesByType[type]) {
          handlesByType[type] = [];
        }
        handlesByType[type].push(handle);
      }
    );

    // Note that widthPercentage properties should add up to 90 since the ID column always adds 10.
    return (
      <div>
        <HandlesTableComponent
          key={1}
          title="Processes"
          handles={handlesByType.childprocess}
          keyed={process => process.pid}
          columns={[{
            title: 'Name',
            value: process => path.basename(process.spawnfile),
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
          handles={handlesByType.tlssocket}
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
          handles={handlesByType.other}
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
