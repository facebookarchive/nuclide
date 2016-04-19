'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {React} = require('react-for-atom');
const {Disposable} = require('atom');
const ProjectStore = require('./ProjectStore');
const {PropTypes} = React;

class NuclideToolbar extends React.Component {
  _disposable: ?Disposable;

  state: {
    currentFilePath: string;
    projectType: string;
  };

  static propTypes = {
    projectStore: PropTypes.instanceOf(ProjectStore).isRequired,
  };

  constructor(props: mixed) {
    super(props);
    this.state = {
      currentFilePath: '',
      projectType: 'Other',
    };
    this._disposable = null;
    (this: any)._updateStateFromStore = this._updateStateFromStore.bind(this);
  }

  componentWillMount() {
    this._disposable = this.props.projectStore.onChange(this._updateStateFromStore);
  }

  componentWillUnmount() {
    if (this._disposable) {
      this._disposable.dispose();
      this._disposable = null;
    }
  }

  _updateStateFromStore() {
    this.setState({
      currentFilePath: this.props.projectStore.getCurrentFilePath(),
      projectType: this.props.projectStore.getProjectType(),
    });
  }

  render(): ?React.Element {
    if (this.state.projectType === 'Hhvm') {
      const HhvmToolbar = require('./HhvmToolbar');
      return (
        <HhvmToolbar
          ref="hhvmToolbar"
          targetFilePath={this.state.currentFilePath}
        />
      );
    } else {
      // Hide toolbar.
      return null;
    }
  }
}

module.exports = NuclideToolbar;
