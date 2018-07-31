"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.DecorationIcons = void 0;

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
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

function _Icon() {
  const data = require("./Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function WarningIconWithShadow() {
  return React.createElement("div", null, React.createElement("svg", {
    className: "nuclide-ui-path-with-file-icon-warning-icon-background",
    width: "20",
    height: "18",
    viewBox: "0 0 20 20",
    xmlns: "http://www.w3.org/2000/svg"
  }, React.createElement("polygon", {
    points: "10,2 0,18 20,18"
  })), React.createElement(_Icon().Icon, {
    className: "text-warning",
    icon: "alert"
  }));
}

function ErrorIconWithShadow() {
  return React.createElement("div", null, React.createElement("svg", {
    className: "nuclide-ui-path-with-file-icon-error-icon-background",
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    xmlns: "http://www.w3.org/2000/svg"
  }, React.createElement("circle", {
    cx: "10",
    cy: "10",
    r: "8"
  })), React.createElement(_Icon().Icon, {
    className: "text-error",
    icon: "stop"
  }));
} // The decoration icons require a backdrop to be fully visible,
// so we only allow the following, blessed decorations:


const DecorationIcons = Object.freeze({
  Warning: WarningIconWithShadow,
  Error: ErrorIconWithShadow
});
exports.DecorationIcons = DecorationIcons;
let addItemToElement;
atom.packages.serviceHub.consume('file-icons.element-icons', '1.0.0', _addItemToElement => {
  addItemToElement = (element, path) => {
    try {
      return _addItemToElement(element, path);
    } catch (e) {
      (0, _log4js().getLogger)('nuclide-ui-path-with-file-icon').error('Error adding item to element', e);
      return new (_UniversalDisposable().default)();
    }
  };

  return new (_UniversalDisposable().default)(() => {
    addItemToElement = null;
  });
});

class PathWithFileIcon extends React.Component {
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
    this._disposables = new (_UniversalDisposable().default)(() => {
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
    const {
      className,
      isFolder
    } = this.props;
    return (0, _classnames().default)('icon', 'name', 'nuclide-ui-path-with-file-icon', {
      'icon-file-text': isFolder !== true,
      'icon-file-directory': isFolder === true
    }, className);
  }

  _forceIconUpdate() {
    if (!this._mounted) {
      return;
    }

    const element = _reactDom.default.findDOMNode(this); // $FlowIssue `element` is an HTMLElement


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
    const _this$props = this.props,
          {
      className,
      children,
      decorationIcon: DecorationIcon,
      isFolder,
      path
    } = _this$props,
          rest = _objectWithoutProperties(_this$props, ["className", "children", "decorationIcon", "isFolder", "path"]);

    const displayPath = children == null ? path : children;
    const decoration = DecorationIcon == null ? null : React.createElement("div", {
      className: "nuclide-ui-path-with-file-icon-decoration-icon"
    }, React.createElement(DecorationIcon, null));
    return React.createElement("div", Object.assign({
      className: this._getDefaultClassName(),
      ref: this._handleRef
    }, rest), displayPath, decoration);
  }

}

exports.default = PathWithFileIcon;