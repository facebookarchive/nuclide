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
import {PanelComponent} from '../../nuclide-ui/lib/PanelComponent';

/**
 * The Atom panel containing context provider views. This is the sidebar that
 * is rendered in the atom workspace.
 */
export class ContextViewPanel extends React.Component {
  static propTypes = {
    initialWidth: React.PropTypes.number.isRequired,
    onResize: React.PropTypes.func.isRequired, // Should be (newWidth: number) => void
    children: React.PropTypes.element,
  };

  render() {
    return (
      <PanelComponent
      dock="right"
      initialLength={this.props.initialWidth}
      noScroll
      onResize={this.props.onResize}>
        <div style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
          <Header />
          <div className="nuclide-context-view-content">
            {this.props.children}
          </div>
        </div>
      </PanelComponent>
    );
  }
}

class Header extends React.Component {

  render(): React.Element<any> {
    return (
      <div className="panel-heading" style={{'flex-shrink': 0}}>
        <h4>Context View</h4>
      </div>
    );
  }
}

