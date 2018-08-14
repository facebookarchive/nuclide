"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _string() {
  const data = require("../../../../modules/nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _AtomInput() {
  const data = require("../../../../modules/nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../../../../modules/nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _ButtonGroup() {
  const data = require("../../../../modules/nuclide-commons-ui/ButtonGroup");

  _ButtonGroup = function () {
    return data;
  };

  return data;
}

function _LoadingSpinner() {
  const data = require("../../../../modules/nuclide-commons-ui/LoadingSpinner");

  _LoadingSpinner = function () {
    return data;
  };

  return data;
}

function _Modal() {
  const data = require("../../../../modules/nuclide-commons-ui/Modal");

  _Modal = function () {
    return data;
  };

  return data;
}

function _Icon() {
  const data = require("../../../../modules/nuclide-commons-ui/Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
class BuckToolbarSettings extends React.Component {
  constructor(props) {
    super(props);
    const {
      buildArguments,
      runArguments
    } = props.settings;
    this.state = {
      buildArguments: buildArguments == null ? '' : (0, _string().shellQuote)(buildArguments),
      runArguments: runArguments == null ? '' : (0, _string().shellQuote)(runArguments)
    };
  }

  render() {
    const extraSettingsUi = this.props.platformProviderSettings != null ? this.props.platformProviderSettings.ui : null;
    return React.createElement(_Modal().Modal, {
      onDismiss: this.props.onDismiss
    }, React.createElement("div", {
      className: "block"
    }, React.createElement("div", {
      className: "block"
    }, React.createElement("label", null, "Current Buck root:"), React.createElement("p", null, React.createElement("code", null, this.props.buckRoot)), React.createElement("div", null, React.createElement("label", null, "Buck version:"), this._getBuckversionFileComponent()), React.createElement("label", null, "Build Arguments:"), React.createElement(_AtomInput().AtomInput, {
      tabIndex: "0",
      initialValue: this.state.buildArguments,
      placeholderText: "Extra arguments to Buck itself (e.g. --num-threads 4)",
      onDidChange: this._onBuildArgsChange.bind(this),
      onConfirm: this._onSave.bind(this)
    }), React.createElement("label", null, "Run Arguments:"), React.createElement(_AtomInput().AtomInput, {
      tabIndex: "0",
      initialValue: this.state.runArguments,
      placeholderText: "Custom command-line arguments to pass to the app/binary",
      onDidChange: this._onRunArgsChange.bind(this),
      onConfirm: this._onSave.bind(this)
    }), extraSettingsUi), React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'flex-end'
      }
    }, React.createElement(_ButtonGroup().ButtonGroup, null, React.createElement(_Button().Button, {
      onClick: this.props.onDismiss
    }, "Cancel"), React.createElement(_Button().Button, {
      buttonType: _Button().ButtonTypes.PRIMARY,
      onClick: this._onSave.bind(this)
    }, "Save")))));
  }

  _getBuckversionFileComponent() {
    const label = ' .buckversion file:';
    const {
      buckversionFileContents
    } = this.props;

    if (buckversionFileContents == null) {
      return React.createElement("p", null, React.createElement("div", {
        className: "inline-block"
      }, React.createElement(_LoadingSpinner().LoadingSpinner, {
        size: "EXTRA_SMALL",
        className: "nuclide-buck-buckversion-file-spinner"
      })), label);
    } else if (buckversionFileContents instanceof Error) {
      let errorMessage; // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)

      if (buckversionFileContents.code === 'ENOENT') {
        errorMessage = 'not found';
      } else {
        errorMessage = buckversionFileContents.message;
      }

      return React.createElement("p", null, React.createElement(_Icon().Icon, {
        icon: "x",
        className: "inline-block"
      }), label, " ", errorMessage);
    } else {
      return React.createElement("p", null, React.createElement(_Icon().Icon, {
        icon: "check",
        className: "inline-block"
      }), label, " ", React.createElement("code", null, buckversionFileContents));
    }
  }

  _onBuildArgsChange(args) {
    this.setState({
      buildArguments: args
    });
  }

  _onRunArgsChange(args) {
    this.setState({
      runArguments: args
    });
  }

  _onSave() {
    try {
      this.props.onSave({
        buildArguments: (0, _string().shellParse)(this.state.buildArguments),
        runArguments: (0, _string().shellParse)(this.state.runArguments)
      });
    } catch (err) {
      atom.notifications.addError('Could not parse arguments', {
        detail: err.stack
      });
    }

    if (this.props.platformProviderSettings != null) {
      this.props.platformProviderSettings.onSave();
    }
  }

}

exports.default = BuckToolbarSettings;