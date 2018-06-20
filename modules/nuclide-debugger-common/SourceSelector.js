'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SourceSelector = undefined;

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../nuclide-commons-ui/Dropdown');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../nuclide-commons/UniversalDisposable'));
}

var _react = _interopRequireWildcard(require('react'));

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class SourceSelector extends _react.Component {

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

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = { selectableSources: [], selectedSource: null };
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
    this._disposables.add((0, (_utils || _load_utils()).observeProjectPathsAllFromSourcePathsService)(projectPaths => {
      const newSelectedSource = this._getNewlySelectedSource(this.state.selectedSource, projectPaths, this.props.deserialize());
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
    const { projectPath, hostLabel } = source;
    const basename = (_nuclideUri || _load_nuclideUri()).default.basename(projectPath);
    return hostLabel + ' - ' + basename;
  }

  setState(partialState, callback) {
    const fullState = Object.assign({}, this.state, partialState);
    super.setState(fullState, () => {
      var _ref, _ref2;

      this.props.onSelect((_ref = fullState) != null ? (_ref2 = _ref.selectedSource) != null ? _ref2.projectPath : _ref2 : _ref);
      callback && callback();
    });
  }

  render() {
    const { selectableSources, selectedSource } = this.state;
    const options = selectableSources.map(this._sourceToOption);
    if (options.length === 0) {
      return _react.createElement(
        'div',
        null,
        'No Projects Found. Please add a project to your file tree so the debugger can find sources.'
      );
    }
    const potentiallyWrongSourceLabel = selectedSource != null && !selectedSource.suggested ? _react.createElement(
      'label',
      null,
      'Nuclide is not sure that you have selected a project which contains sources the debugger can use. Please double check that your selected source is correct.'
    ) : null;
    return _react.createElement(
      'div',
      null,
      _react.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
        options: options,
        onChange: option => this.setState({ selectedSource: option }),
        placeholder: 'Select a source',
        value: selectedSource
      }),
      potentiallyWrongSourceLabel
    );
  }
}
exports.SourceSelector = SourceSelector;