"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProjectSelection = void 0;

var React = _interopRequireWildcard(require("react"));

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _FileTreeStore() {
  const data = _interopRequireDefault(require("../lib/FileTreeStore"));

  _FileTreeStore = function () {
    return data;
  };

  return data;
}

function Selectors() {
  const data = _interopRequireWildcard(require("../lib/FileTreeSelectors"));

  Selectors = function () {
    return data;
  };

  return data;
}

function _TruncatedButton() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-ui/TruncatedButton"));

  _TruncatedButton = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class ProjectSelection extends React.Component {
  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable().default)();
    this.state = {
      extraContent: this.calculateExtraContent()
    };
  }

  componentDidMount() {
    this._processExternalUpdate();

    this._disposables.add(this.props.store.subscribe(this._processExternalUpdate.bind(this)));
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
    this.props.remeasureHeight();
  }

  calculateExtraContent() {
    const list = Selectors().getExtraProjectSelectionContent(this.props.store);

    if (list.isEmpty()) {
      return null;
    }

    return list.toArray();
  }

  render() {
    return React.createElement("div", {
      className: "padded"
    }, React.createElement(_TruncatedButton().default, {
      onClick: () => this.runCommand('application:add-project-folder'),
      icon: "device-desktop",
      label: "Add Local Folder"
    }), React.createElement(_TruncatedButton().default, {
      onClick: () => this.runCommand('nuclide-remote-projects:connect'),
      icon: "cloud-upload",
      label: "Add Remote Folder"
    }), this.state.extraContent);
  }

  runCommand(command) {
    atom.commands.dispatch(atom.views.getView(atom.workspace), command);
  }

}

exports.ProjectSelection = ProjectSelection;