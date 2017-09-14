'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProjectSelection = undefined;

var _react = _interopRequireWildcard(require('react'));

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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class ProjectSelection extends _react.Component {

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
    if (this._disposables.disposed) {
      // If an emitted event results in the disposal of a subscription to that
      // same emitted event, the disposal will not take effect until the next
      // emission. This is because event-kit handler arrays are immutable.
      //
      // Since this method subscribes to store updates, and store updates can
      // also cause this component to become unmounted, there is a possiblity
      // that the subscription disposal in `componentWillUnmount` may not
      // prevent this method from running on an unmounted instance. So, we
      // manually check the component's mounted state.
      return;
    }
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
    return _react.createElement(
      'div',
      { className: 'padded' },
      _react.createElement((_TruncatedButton || _load_TruncatedButton()).default, {
        onClick: () => this.runCommand('application:add-project-folder'),
        icon: 'device-desktop',
        label: 'Add Project Folder'
      }),
      _react.createElement((_TruncatedButton || _load_TruncatedButton()).default, {
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