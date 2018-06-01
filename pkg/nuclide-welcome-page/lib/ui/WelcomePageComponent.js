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

import type {AppState, WelcomePage} from '../types';

import * as React from 'react';
import {connect} from 'react-redux';

type Props = {
  welcomePages: Map<string, WelcomePage>,
};

export default class WelcomePageComponent extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render(): React.Node {
    const entries = this._buildEntries(
      Array.from(this.props.welcomePages.values()),
    );
    return <div className="welcome-page">{entries}</div>;
  }

  _buildEntries(pages: Array<WelcomePage>): Array<React$Node> {
    const entries = [];
    for (let i = 0; i < pages.length - 1; i++) {
      entries.push(pages[i].content, <hr />);
    }
    entries.push(pages[pages.length - 1].content);
    return entries;
  }
}

function mapStateToProps(state: AppState): Props {
  return state;
}

export const WelcomePageContainer = connect(mapStateToProps)(
  WelcomePageComponent,
);
