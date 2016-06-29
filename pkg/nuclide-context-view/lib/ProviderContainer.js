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
import {ShowMoreComponent} from '../../nuclide-ui/lib/ShowMoreComponent';

type ProviderContainerProps = {
  title: string;
  isEditorBased: boolean;
  children?: React.Element<any>;
};

/**
 * Each context provider view is rendered inside a ProviderContainer.
 */
export class ProviderContainer extends React.Component {

  props: ProviderContainerProps;

  render(): ?React.Element<any> {
    return (
      <div className="nuclide-context-view-provider-container">
        <Section headline={this.props.title} collapsable={true}>
          {this.props.isEditorBased ? this.props.children : this._textBasedComponent()}
        </Section>
      </div>
    );
  }

  _textBasedComponent(): React.Element<any> {
    return (
      <ShowMoreComponent maxHeight={600} showMoreByDefault={false}>
        {this.props.children}
      </ShowMoreComponent>
    );
  }
}
