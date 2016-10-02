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

type DefaultProps = {
  width: string,
};

type Props = {
  width?: string,
};

export default class HhvmIcon extends React.Component {

  props: Props;

  static defaultProps: DefaultProps = {
    width: '16px',
  };

  render(): React.Element<any> {
    return (
      <svg className="hhvm-icon"
        version="1.1"
        x="0px"
        y="0px"
        width={this.props.width}
        height="100%"
        viewBox="0 0 13.4 19.6">
        <polygon points="7,6.6 7,12.6 13,6.6" />
        <polygon points="13.4,6 13.4,0 7.4,6" />
        <polygon points="7,13.4 7,19.6 13.4,13.2 13.4,7" />
        <polygon points="0,12.6 6.4,6.2 6.4,0 0,6.4" />
        <polygon points="6.4,13 6.4,7 0.4,13" />
        <polygon points="0,13.6 0,19.6 6,13.6" />
      </svg>
    );
  }

}
