'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (uri) {
  if (uri.startsWith((_SettingsPaneItem2 || _load_SettingsPaneItem2()).WORKSPACE_VIEW_URI)) {
    let initialFilter = '';
    const { query } = _url.default.parse(uri);
    if (query != null) {
      const params = _querystring.default.parse(query);
      if (typeof params.filter === 'string') {
        initialFilter = params.filter;
      }
    }
    return (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_react.createElement((_SettingsPaneItem || _load_SettingsPaneItem()).default, { initialFilter: initialFilter }));
  }
};

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _SettingsPaneItem;

function _load_SettingsPaneItem() {
  return _SettingsPaneItem = _interopRequireDefault(require('./SettingsPaneItem'));
}

var _SettingsPaneItem2;

function _load_SettingsPaneItem2() {
  return _SettingsPaneItem2 = require('./SettingsPaneItem');
}

var _querystring = _interopRequireDefault(require('querystring'));

var _react = _interopRequireWildcard(require('react'));

var _url = _interopRequireDefault(require('url'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }