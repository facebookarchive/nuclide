"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DiagnosticsPopup = void 0;

var React = _interopRequireWildcard(require("react"));

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/analytics"));

  _analytics = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../../../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _DiagnosticsMessage() {
  const data = require("./DiagnosticsMessage");

  _DiagnosticsMessage = function () {
    return data;
  };

  return data;
}

function _DiagnosticsCodeActions() {
  const data = _interopRequireDefault(require("./DiagnosticsCodeActions"));

  _DiagnosticsCodeActions = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function renderMessage(fixer, goToLocation, codeActionsForMessage, message, index) {
  const className = (0, _classnames().default)( // native-key-bindings and tabIndex=-1 are both needed to allow copying the text in the popup.
  'native-key-bindings', 'diagnostics-popup-diagnostic', {
    'diagnostics-popup-error': message.type === 'Error',
    'diagnostics-popup-warning': message.type === 'Warning',
    'diagnostics-popup-info': message.type === 'Info'
  });
  const codeActions = getCodeActions(message, codeActionsForMessage);
  return React.createElement("div", {
    className: className,
    key: index,
    tabIndex: -1
  }, React.createElement(_DiagnosticsMessage().DiagnosticsMessage, {
    fixer: fixer,
    goToLocation: goToLocation,
    message: message
  }, codeActions && codeActions.size ? React.createElement(_DiagnosticsCodeActions().default, {
    codeActions: codeActions
  }) : null));
}

function getCodeActions(message, codeActionsForMessage) {
  const codeActionMaps = [];

  if (message.actions != null && message.actions.length > 0) {
    codeActionMaps.push(new Map(message.actions.map(action => {
      return [action.title, {
        async getTitle() {
          return action.title;
        },

        async apply() {
          action.apply();
        },

        dispose() {}

      }];
    })));
  }

  if (codeActionsForMessage) {
    const actions = codeActionsForMessage.get(message);

    if (actions != null) {
      codeActionMaps.push(actions);
    }
  }

  return codeActionMaps.length > 0 ? (0, _collection().mapUnion)(...codeActionMaps) : null;
} // TODO move LESS styles to nuclide-ui


class DiagnosticsPopup extends React.Component {
  componentDidMount() {
    _analytics().default.track('diagnostics-show-popup', {
      // Note: there could be multiple providers here (but it's less common).
      providerName: this.props.messages[0].providerName
    });
  }

  render() {
    const _this$props = this.props,
          {
      fixer,
      goToLocation,
      codeActionsForMessage,
      messages
    } = _this$props,
          rest = _objectWithoutProperties(_this$props, ["fixer", "goToLocation", "codeActionsForMessage", "messages"]);

    return React.createElement("div", Object.assign({
      className: "diagnostics-popup"
    }, rest), messages.map(renderMessage.bind(null, fixer, goToLocation, codeActionsForMessage)));
  }

}

exports.DiagnosticsPopup = DiagnosticsPopup;