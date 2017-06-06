'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProjectSelection = undefined;

var _react = _interopRequireDefault(require('react'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _FileTreeStore;

function _load_FileTreeStore() {
  return _FileTreeStore = require('../lib/FileTreeStore');
}

var _TruncatedButton;

function _load_TruncatedButton() {
  return _TruncatedButton = _interopRequireDefault(require('nuclide-commons-ui/TruncatedButton'));
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
 * @format
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
      _react.default.createElement((_TruncatedButton || _load_TruncatedButton()).default, {
        onClick: () => this.runCommand('application:add-project-folder'),
        icon: 'device-desktop',
        label: 'Add Project Folder'
      }),
      _react.default.createElement((_TruncatedButton || _load_TruncatedButton()).default, {
        onClick: () => this.runCommand('nuclide-remote-projects:connect'),
        icon: 'cloud-upload',
        label: 'Add Remote Project Folder'
      }),
      this.state.extraContent
    );
  }

  runCommand(command) {
    atom.commands.dispatch(atom.views.getView(atom.workspace), command);
  }
}
exports.ProjectSelection = ProjectSelection;