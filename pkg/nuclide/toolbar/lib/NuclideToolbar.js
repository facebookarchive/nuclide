'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var BuckToolbar = require('nuclide-buck-toolbar');
var React = require('react-for-atom');
var {Disposable} = require('atom');
var {PropTypes} = React;
var ProjectStore = require('./ProjectStore');

class NuclideToolbar extends React.Component {
  _disposable: ?Disposable;

  constructor(props: mixed) {
    super(props);
    this.state = {
      currentFilePath: '',
      projectType: 'Other',
    };
    this._disposable = null;
    this._updateStateFromStore = this._updateStateFromStore.bind(this);
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

  render(): ?ReactElement {
    if (this.state.projectType === 'Hhvm') {
      // TODO[jeffreytan]: enable HhvmToolbar when hhvm multi-requests debugging is supported.
      // var HhvmToolbar = require('nuclide-hhvm-toolbar');
      // return (
      //   <div className="tool-panel padded nuclide-toolbar">
      //     <HhvmToolbar
      //       ref="hhvmToolbar"
      //       targetFilePath={this.state.currentFilePath}
      //     />
      //   </div>
      // );
      return null;
    } else if (this.state.projectType === 'Buck') {
      return (
          <div className="tool-panel padded nuclide-toolbar">
            <BuckToolbar
              initialBuildTarget={this.props.initialBuildTarget}
              onBuildTargetChange={this.props.onBuildTargetChange}
            />
          </div>
        );
    } else {
      // Hide toolbar.
      return null;
    }
  }
}

NuclideToolbar.propTypes = {
  initialBuildTarget: PropTypes.string.isRequired,
  onBuildTargetChange: PropTypes.func.isRequired,
  projectStore: React.PropTypes.instanceOf(ProjectStore).isRequired,
};

module.exports = NuclideToolbar;
