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
import {Button} from '../../nuclide-ui/lib/Button';

/**
 * The Atom panel containing context provider views. This is the sidebar that
 * is rendered in the atom workspace.
 */
export class ContextViewPanel extends React.Component {
  static propTypes = {
    initialWidth: React.PropTypes.number.isRequired,
    onResize: React.PropTypes.func.isRequired, // Should be (newWidth: number) => void
    children: React.PropTypes.oneOfType([
      React.PropTypes.arrayOf(React.PropTypes.node),
      React.PropTypes.node,
    ]),
    onHide: React.PropTypes.func,
  };

  render(): ?React.Element<any> {
    return (
      <PanelComponent
      dock="right"
      initialLength={this.props.initialWidth}
      noScroll
      onResize={this.props.onResize}>
        <div style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
          <Header onHide={this.props.onHide} />
          <div className="nuclide-context-view-content">
            <p>
              Place your cursor over a function, class, variable, or method in
              <code>www</code> to see more information about it.
            </p>
            {this.props.children}
          </div>
        </div>
      </PanelComponent>
    );
  }
}

type HeaderProps = {
  onHide: () => void,
};

const Header = (props: HeaderProps) => {
  return (
    <div className="panel-heading" style={{'flex-shrink': 0}}>
      <h4>
        <span>Context View</span>
        <Button icon="x" className="pull-right"
          onClick={props.onHide} title="Hide context view"
        />
      </h4>
    </div>
  );
};
