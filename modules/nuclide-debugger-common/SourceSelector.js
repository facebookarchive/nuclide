"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SourceSelector = void 0;

function _Dropdown() {
  const data = require("../nuclide-commons-ui/Dropdown");

  _Dropdown = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _utils() {
  const data = require("./utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
class SourceSelector extends React.Component {
  constructor(props) {
    super(props);

    this._sourceToOption = source => {
      const label = this._getLabelFromSource(source);

      return {
        value: source,
        label,
        selectedLabel: label
      };
    };

    this._disposables = new (_UniversalDisposable().default)();
    this.state = {
      selectableSources: [],
      selectedSource: null
    };
  }

  _getNewlySelectedSource(selectedSource, projectPaths, deserializedProjectPath) {
    let newSelectedSource = null;

    if (selectedSource != null) {
      newSelectedSource = projectPaths.includes(selectedSource) ? selectedSource : null;
    }

    if (newSelectedSource == null && projectPaths.length > 0) {
      const matches = projectPaths.filter(projectPath => projectPath.projectPath === deserializedProjectPath);
      newSelectedSource = matches.length > 0 ? matches[0] : projectPaths[0];
    }

    return newSelectedSource;
  }

  componentDidMount() {
    this._disposables.add((0, _utils().observeProjectPathsAllFromSourcePathsService)(projectPaths => {
      const newSelectedSource = this._getNewlySelectedSource( // TODO: (wbinnssmith) T30771435 this setState depends on current state
      // and should use an updater function rather than an object
      // eslint-disable-next-line react/no-access-state-in-setstate
      this.state.selectedSource, projectPaths, this.props.deserialize());

      this.setState({
        selectableSources: projectPaths,
        selectedSource: newSelectedSource
      });
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _getLabelFromSource(source) {
    const {
      projectPath,
      hostLabel
    } = source;

    const basename = _nuclideUri().default.basename(projectPath);

    return hostLabel + ' - ' + basename;
  }

  setState(partialState, callback) {
    const fullState = Object.assign({}, this.state, partialState);
    super.setState(fullState, () => {
      var _ref;

      this.props.onSelect((_ref = fullState) != null ? (_ref = _ref.selectedSource) != null ? _ref.projectPath : _ref : _ref);
      callback && callback();
    });
  }

  render() {
    const {
      selectableSources,
      selectedSource
    } = this.state;
    const options = selectableSources.map(this._sourceToOption);

    if (options.length === 0) {
      return React.createElement("div", null, "No Projects Found. Please add a project to your file tree so the debugger can find sources.");
    }

    const potentiallyWrongSourceLabel = selectedSource != null && !selectedSource.suggested ? React.createElement("label", null, "Nuclide is not sure that you have selected a project which contains sources the debugger can use. Please double check that your selected source is correct.") : null;
    return React.createElement("div", null, React.createElement(_Dropdown().Dropdown, {
      options: options,
      onChange: option => this.setState({
        selectedSource: option
      }),
      placeholder: 'Select a source',
      value: selectedSource
    }), potentiallyWrongSourceLabel);
  }

}

exports.SourceSelector = SourceSelector;