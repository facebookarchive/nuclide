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
import {
  Button,
  ButtonSizes,
} from '../../nuclide-ui/lib/Button';

class HomeFeatureComponent extends React.Component {
  static propTypes = {
    title: React.PropTypes.string.isRequired,
    icon: React.PropTypes.string.isRequired,
    description: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.element,
    ]).isRequired,
    command: React.PropTypes.string,
  };

  render(): React.Element<any> {
    const {title, command} = this.props;
    return (
      <details className="nuclide-home-card">
        <summary className={`nuclide-home-summary icon icon-${this.props.icon}`}>
          {title}
          {command ? <Button
            className="pull-right nuclide-home-tryit"
            size={ButtonSizes.SMALL}
            onClick={() => atom.commands.dispatch(atom.views.getView(atom.workspace), command)}>
            Try it
          </Button> : null}
        </summary>
        <div className="nuclide-home-detail">
          {this.props.description}
        </div>
      </details>
    );
  }
}

module.exports = HomeFeatureComponent;
