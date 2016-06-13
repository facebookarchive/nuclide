'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Definition} from '../../nuclide-definition-service';

import {React} from 'react-for-atom';
import {PanelComponent} from '../../nuclide-ui/lib/PanelComponent';

export class ContextViewPanel extends React.Component {
  static propTypes = {
    initialWidth: React.PropTypes.number.isRequired,
    onResize: React.PropTypes.func.isRequired, // Should be (newWidth: number) => void
    children: React.PropTypes.element,
    definition: React.PropTypes.object,
  };

  render() {
    return (
      <PanelComponent
      dock="right"
      initialLength={this.props.initialWidth}
      noScroll
      onResize={this.props.onResize}>
        <div style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
          <Header definition={this.props.definition} />
          <div className="nuclide-context-view-content">
            {this.props.children}
          </div>
        </div>
      </PanelComponent>
    );
  }
}

type HeaderProps = {
  definition: Definition;
};

class Header extends React.Component {

  props: HeaderProps;

  constructor(props: HeaderProps) {
    super(props);
    this.props = props;
  }

  render(): React.Element<any> {
    const info = (this.props.definition != null)
      ? this.props.definition.name
      : 'No definition selected';

    return (
      <div className="panel-heading" style={{'flex-shrink': 0}}>
        <h4>Context View: {info}</h4>
      </div>
    );
  }
}
