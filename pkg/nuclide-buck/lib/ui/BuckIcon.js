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

export class BuckIcon extends React.Component {

  render(): React.Element<any> {
    return (
      <svg
        version="1.1"
        x="0px"
        y="0px"
        viewBox="0 0 459.3 399.5"
        height="100%">
        <path
          className="icon-path-fill"
          d={
            'M349.1,203.1l-36-36l41.3-41.3l0-94l-33.8,0l0,79.9l-31.4,31.4l-31-31l0-80.3l-33.8,'
            + '0l0,94.3l77,77l-47.9,0L130.1,79.8 l0-79.8L96.2,0l0,93.8l41.5,41.6l-48.4,0L33.8,'
            + '79.8l0-79.8L0,0l0,93.8l75.4,75.4l96.2,0l33.9,33.9l-96.2,0l79.6,79.6L72.1,399.5'
            + ' l47.9,0l116.8-116.8L191,236.9l234.4,0l0,16.9l-104,62.2l-83.9,83.5l47.6,'
            + '0l55.5-55.6l118.7-70.9l0-70L349.1,203.1z M259.1,258.8 l23.9,23.9l23.9-23.9L259.1,'
            + '258.8z'
          }
        />
      </svg>
    );
  }

}
