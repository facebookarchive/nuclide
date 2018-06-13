'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DecorationIcons = undefined;

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../modules/nuclide-commons/UniversalDisposable'));
}

var _Icon;

function _load_Icon() {
  return _Icon = require('../../modules/nuclide-commons-ui/Icon');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; } /**
                                                                                                                                                                                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                              * All rights reserved.
                                                                                                                                                                                                                              *
                                                                                                                                                                                                                              * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                                              * the root directory of this source tree.
                                                                                                                                                                                                                              *
                                                                                                                                                                                                                              * 
                                                                                                                                                                                                                              * @format
                                                                                                                                                                                                                              */

function WarningIconWithShadow() {
  return _react.createElement(
    'div',
    null,
    _react.createElement(
      'svg',
      {
        className: 'nuclide-ui-path-with-file-icon-warning-icon-background',
        width: '20',
        height: '18',
        viewBox: '0 0 20 20',
        xmlns: 'http://www.w3.org/2000/svg' },
      _react.createElement('polygon', { points: '10,2 0,18 20,18' })
    ),
    _react.createElement((_Icon || _load_Icon()).Icon, { className: 'text-warning', icon: 'alert' })
  );
}

function ErrorIconWithShadow() {
  return _react.createElement(
    'div',
    null,
    _react.createElement(
      'svg',
      {
        className: 'nuclide-ui-path-with-file-icon-error-icon-background',
        width: '16',
        height: '16',
        viewBox: '0 0 16 16',
        xmlns: 'http://www.w3.org/2000/svg' },
      _react.createElement('circle', { cx: '10', cy: '10', r: '8' })
    ),
    _react.createElement((_Icon || _load_Icon()).Icon, { className: 'text-error', icon: 'stop' })
  );
}

// The decoration icons require a backdrop to be fully visible,
// so we only allow the following, blessed decorations:
const DecorationIcons = exports.DecorationIcons = Object.freeze({
  Warning: WarningIconWithShadow,
  Error: ErrorIconWithShadow
});

let addItemToElement;
atom.packages.serviceHub.consume('file-icons.element-icons', '1.0.0', _addItemToElement => {
  addItemToElement = (element, path) => {
    try {
      return _addItemToElement(element, path);
    } catch (e) {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-ui-path-with-file-icon').error('Error adding item to element', e);
      return new (_UniversalDisposable || _load_UniversalDisposable()).default();
    }
  };
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
    addItemToElement = null;
  });
});

class PathWithFileIcon extends _react.Component {

  constructor(props) {
    super(props);

    this._handleRef = element => {
      if (this.props.isFolder) {
        return;
      }
      this._ensureIconRemoved();
      if (addItemToElement == null) {
        // file-icons service not available; ignore.
        return;
      }
      if (element == null) {
        // Element is unmounting.
        return;
      }
      this._fileIconsDisposable = addItemToElement(element, this.props.path);
    };

    this._mounted = false;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      if (this._fileIconsDisposable != null) {
        this._fileIconsDisposable.dispose();
      }
    });
  }

  componentDidMount() {
    this._mounted = true;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.path !== this.props.path) {
      this._forceIconUpdate();
    }
  }

  _getDefaultClassName() {
    const { className, isFolder } = this.props;
    return (0, (_classnames || _load_classnames()).default)('icon', 'name', 'nuclide-ui-path-with-file-icon', {
      'icon-file-text': isFolder !== true,
      'icon-file-directory': isFolder === true
    }, className);
  }

  _forceIconUpdate() {
    if (!this._mounted) {
      return;
    }
    const element = _reactDom.default.findDOMNode(this);
    // $FlowIssue `element` is an HTMLElement
    this._handleRef(element);
  }

  _ensureIconRemoved() {
    if (this._fileIconsDisposable == null) {
      return;
    }
    this._fileIconsDisposable.dispose();
    this._fileIconsDisposable = null;
  }

  componentWillUnmount() {
    this._disposables.dispose();
    this._mounted = false;
  }

  render() {
    const _props = this.props,
          {
      className,
      children,
      decorationIcon: DecorationIcon,
      isFolder,
      path
    } = _props,
          rest = _objectWithoutProperties(_props, ['className', 'children', 'decorationIcon', 'isFolder', 'path']);
    const displayPath = children == null ? path : children;
    const decoration = DecorationIcon == null ? null : _react.createElement(
      'div',
      { className: 'nuclide-ui-path-with-file-icon-decoration-icon' },
      _react.createElement(DecorationIcon, null)
    );
    return _react.createElement(
      'div',
      Object.assign({
        className: this._getDefaultClassName(),
        ref: this._handleRef
      }, rest),
      displayPath,
      decoration
    );
  }
}
exports.default = PathWithFileIcon;