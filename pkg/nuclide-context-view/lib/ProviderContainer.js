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
import {Section} from '../../nuclide-ui/lib/Section';

type ProviderContainerProps = {
  title: string;
  children?: React.Element<any>;
};

/**
 * Each context provider view is rendered inside a ProviderContainer.
 */
export class ProviderContainer extends React.Component {

  props: ProviderContainerProps;

  render(): React.Element<any> {
    return (
      <Section headline={this.props.title} collapsable={true} collapsedByDefault={false}>
        {this.props.children}
      </Section>
    );
  }
}
