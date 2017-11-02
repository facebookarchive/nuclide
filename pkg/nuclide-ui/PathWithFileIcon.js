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
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
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

class PathWithFileIcon extends _react.Component {

  constructor(props) {
    super(props);

    this._handleRef = element => {
      if (this.props.isFolder) {
        return;
      }
      this._ensureIconRemoved();
      if (this._addItemToElement == null) {
        // file-icons service not available; ignore.
        return;
      }
      if (element == null) {
        // Element is unmounting.
        return;
      }
      this._fileIconsDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._addItemToElement(element, this.props.path),
      // On dispose, file-icons doesn't actually remove the classNames it assigned to the node,
      // so we need to reset the classList manually.
      () => {
        element.className = this._getDefaultClassName();
      });
    };

    this._mounted = false;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(consumeServiceAsync('file-icons.element-icons', '1.0.0', this._consumeFileIconService.bind(this)), () => {
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

  // This only gets called if the file-icons package is installed.
  _consumeFileIconService(addItemToElement) {
    this._addItemToElement = (element, path) => {
      try {
        return addItemToElement(element, path);
      } catch (e) {
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-ui-path-with-file-icon').error('Error adding item to element', e);
        return new (_UniversalDisposable || _load_UniversalDisposable()).default();
      }
    };
    this._forceIconUpdate();
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._addItemToElement = null;
      this._forceIconUpdate();
    });
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

exports.default = PathWithFileIcon; /**
                                     * Currently, Atom's service hub [provides services while iterating over consumers][0]. If, as a
                                     * result of providing a service, new consumers are added, its array will be mutated, screwing up
                                     * the next step of the iteration.
                                     *
                                     * This is the case with the above component as providing the service may cause it to be mounted (or
                                     * unmounted), which in turn will cause it to consume (or "unconsume" by disposing) the service.
                                     *
                                     * This function is a workaround that delays both the consuming of the service and the disposal,
                                     * without affecting the API. This way, the ServiceHub's array won't be synchronously mutated while
                                     * iterating over it. We should be able to remove this workaround (in favor of calling
                                     * `serviceHub.consume()` directly) once atom/service-hub#11 makes it into our oldest-supported
                                     * version of Atom.
                                     *
                                     * [0]: https://github.com/atom/service-hub/blob/v0.7.3/src/service-hub.coffee#L32-L34
                                     */

function consumeServiceAsync(service, version, callback) {
  let serviceDisposable;
  // Don't call `consume()` synchronously.
  const id = setImmediate(() => {
    serviceDisposable = atom.packages.serviceHub.consume(service, version, callback);
  });
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
    clearImmediate(id);
  }, () => {
    if (serviceDisposable != null) {
      // "unconsume" the service asynchronously too.
      setImmediate(() => {
        serviceDisposable.dispose();
      });
    }
  });
}