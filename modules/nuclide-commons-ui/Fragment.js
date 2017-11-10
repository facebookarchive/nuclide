/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import * as React from 'react';

type Props = {
  children?: React.Node | Array<React.Node>,
};

// TODO: T23460026 Use the JSX construct for this exact component when it is published.
export default class Fragment extends React.Component<Props> {
  render(): React.Node {
    return this.props.children;
  }
}
