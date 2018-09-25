"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Modal = void 0;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

/**
 * Shows a modal dialog when rendered, using Atom's APIs (atom.workspace.addModalPanel).
 */
class Modal extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleWindowClick = event => {
      // If the user clicks outside of the modal, and not on a tooltip or
      // notification, close it.
      if (this._innerElement && !this._innerElement.contains(event.target) && event.target.closest('atom-notifications, .tooltip') == null) {
        this.props.onDismiss();
      }
    }, this._handleContainerInnerElement = el => {
      if (this._cancelDisposable != null) {
        this._cancelDisposable.dispose();
      }

      this._innerElement = el;

      if (el == null) {
        return;
      }

      el.focus();
      this._cancelDisposable = new (_UniversalDisposable().default)(atom.commands.add(window, 'core:cancel', () => {
        this.props.onDismiss();
      }), _RxMin.Observable.fromEvent(window, 'mousedown') // Ignore clicks in the current tick. We don't want to capture the click that showed this
      // modal.
      .skipUntil(_RxMin.Observable.interval(0).first()).subscribe(this._handleWindowClick));
    }, _temp;
  }

  UNSAFE_componentWillMount() {
    this._container = document.createElement('div');
    this._panel = atom.workspace.addModalPanel({
      item: this._container,
      className: this.props.modalClassName
    });
  }

  componentWillUnmount() {
    this._panel.destroy();
  }

  componentDidUpdate(prevProps) {
    const {
      modalClassName
    } = this.props;
    const {
      modalClassName: prevModalClassName
    } = prevProps;

    const panelElement = this._panel.getElement();

    if (prevModalClassName != null) {
      panelElement.classList.remove(...prevModalClassName.split(/\s+/).filter(token => token.length > 0));
    }

    if (modalClassName != null) {
      panelElement.classList.add(...modalClassName.split(/\s+/).filter(token => token.length > 0));
    }
  }

  render() {
    const _this$props = this.props,
          {
      modalClassName,
      children,
      onDismiss
    } = _this$props,
          props = _objectWithoutProperties(_this$props, ["modalClassName", "children", "onDismiss"]);

    return _reactDom.default.createPortal(React.createElement("div", Object.assign({
      tabIndex: "0"
    }, props, {
      ref: this._handleContainerInnerElement
    }), this.props.children), this._container);
  }

}

exports.Modal = Modal;