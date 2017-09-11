'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GutterCheckbox = undefined;

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('nuclide-commons-ui/Checkbox');
}

var _Portal;

function _load_Portal() {
  return _Portal = require('../../../nuclide-ui/Portal');
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const GUTTER_NAME = 'nuclide-patch-editor-checkbox-gutter'; /**
                                                             * Copyright (c) 2015-present, Facebook, Inc.
                                                             * All rights reserved.
                                                             *
                                                             * This source code is licensed under the license found in the LICENSE file in
                                                             * the root directory of this source tree.
                                                             *
                                                             * 
                                                             * @format
                                                             */

class GutterCheckbox extends _react.Component {

  constructor(props) {
    super(props);

    this._node = document.createElement('div');

    let gutter = props.editor.gutterWithName(GUTTER_NAME);
    if (gutter == null) {
      gutter = props.editor.addGutter({ name: GUTTER_NAME });
    }
    this._gutter = gutter;

    this._marker = props.editor.markBufferPosition([props.lineNumber, 0], {
      invalidate: 'never'
    });

    gutter.decorateMarker(this._marker, { type: 'gutter', item: this._node });
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.checked !== this.props.checked;
  }

  componentWillUnmount() {
    this._marker.destroy();
  }

  render() {
    return _react.createElement(
      (_Portal || _load_Portal()).Portal,
      { container: this._node },
      _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        checked: this.props.checked,
        className: 'nuclide-patch-editor-line-checkbox',
        onChange: this.props.onToggleLine
      })
    );
  }
}
exports.GutterCheckbox = GutterCheckbox;