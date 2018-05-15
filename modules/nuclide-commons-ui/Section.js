'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.Section = undefined;











var _react = _interopRequireWildcard(require('react'));var _classnames;
function _load_classnames() {return _classnames = _interopRequireDefault(require('classnames'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}























/** A vertical divider with a title.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Specifying `collapsable` prop as true will add a clickable chevron icon that
                                                                                                                                                                                                                                                                                                                                                                                                                                                                * collapses the component children. Optionally specify collapsedByDefault
                                                                                                                                                                                                                                                                                                                                                                                                                                                                * (defaults to false)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                */ /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    *  strict
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    */class Section extends _react.Component {constructor(props) {super(props);this.



    _toggleCollapsed = () => {
      if (this.props.collapsed == null) {
        // uncontrolled mode
        this.setState({ isCollapsed: !this.state.isCollapsed });
      } else {
        // controlled mode
        if (typeof this.props.onChange === 'function') {
          this.props.onChange(!this.props.collapsed);
        }
      }
    };const initialIsCollapsed = this.props.collapsable != null && this.props.collapsable && this.props.collapsedByDefault != null && this.props.collapsedByDefault;this.state = { isCollapsed: initialIsCollapsed };}

  render() {
    const collapsable =
    this.props.collapsable != null ? this.props.collapsable : false;
    const collapsed =
    this.props.collapsed == null ?
    this.state.isCollapsed :
    this.props.collapsed;
    // Only include classes if the component is collapsable
    const iconClass = (0, (_classnames || _load_classnames()).default)({
      icon: collapsable,
      'icon-chevron-down': collapsable && !collapsed,
      'icon-chevron-right': collapsable && collapsed,
      'nuclide-ui-section-collapsable': collapsable });

    const conditionalProps = {};
    if (collapsable) {
      conditionalProps.onClick = this._toggleCollapsed;
      conditionalProps.title = collapsed ?
      'Click to expand' :
      'Click to collapse';
    }
    // Any custom title prop should override the default title.
    if (this.props.title != null) {
      conditionalProps.title = this.props.title;
    }
    const HeadlineComponent = getHeadlineComponent(this.props.size);
    return (
      _react.createElement('div', { className: this.props.className },
        _react.createElement(HeadlineComponent, Object.assign({ className: iconClass }, conditionalProps),
          this.props.headline),

        _react.createElement('div', {
            style: collapsed ? { display: 'none' } : {},
            className: 'nuclide-ui-section-body' },
          this.props.children)));



  }}exports.Section = Section;


function getHeadlineComponent(size) {
  switch (size) {
    case 'small':
      return 'h6';
    case 'medium':
      return 'h5';
    default:
      return 'h3';}

}