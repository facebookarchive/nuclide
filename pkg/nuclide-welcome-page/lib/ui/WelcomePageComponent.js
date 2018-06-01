/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import * as React from 'react';
import {connect} from 'react-redux';

type Props = {};

export default class WelcomePageComponent extends React.Component<Props> {
  render(): React.Node {
    return <div>WELCOME TO NUCLIDE?</div>;
  }
}

export const WelcomePageContainer = connect()(WelcomePageComponent);
