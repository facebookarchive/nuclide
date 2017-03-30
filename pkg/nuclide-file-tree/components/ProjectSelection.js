'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProjectSelection = undefined;

var _react = _interopRequireDefault(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _FileTreeStore;

function _load_FileTreeStore() {
  return _FileTreeStore = require('../lib/FileTreeStore');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class ProjectSelection extends _react.default.Component {

  constructor(props) {
    super(props);
    this._store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      extraContent: this.calculateExtraContent()
    };
  }

  componentDidMount() {
    this._processExternalUpdate();

    this._disposables.add(this._store.subscribe(this._processExternalUpdate.bind(this)));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _processExternalUpdate() {
    this.setState({
      extraContent: this.calculateExtraContent()
    });
  }

  calculateExtraContent() {
    const list = this._store.getExtraProjectSelectionContent();
    if (list.isEmpty()) {
      return null;
    }
    return list.toJS();
  }

  render() {
    return _react.default.createElement(
      'div',
      { className: 'padded' },
      _react.default.createElement(
        (_Button || _load_Button()).Button,
        {
          onClick: () => this.runCommand('application:add-project-folder'),
          icon: 'device-desktop',
          className: 'btn-block' },
        'Add Project Folder'
      ),
      _react.default.createElement(
        (_Button || _load_Button()).Button,
        {
          onClick: () => this.runCommand('nuclide-remote-projects:connect'),
          icon: 'cloud-upload',
          className: 'btn-block' },
        'Add Remote Project Folder'
      ),
      this.state.extraContent
    );
  }

  runCommand(command) {
    atom.commands.dispatch(atom.views.getView(atom.workspace), command);
  }
}
exports.ProjectSelection = ProjectSelection;