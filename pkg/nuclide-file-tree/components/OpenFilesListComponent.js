Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _nuclideUiLibPanelComponentScroller2;

function _nuclideUiLibPanelComponentScroller() {
  return _nuclideUiLibPanelComponentScroller2 = require('../../nuclide-ui/lib/PanelComponentScroller');
}

var _libFileTreeHelpers2;

function _libFileTreeHelpers() {
  return _libFileTreeHelpers2 = _interopRequireDefault(require('../lib/FileTreeHelpers'));
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var OpenFilesListComponent = (function (_React$Component) {
  _inherits(OpenFilesListComponent, _React$Component);

  function OpenFilesListComponent(props) {
    _classCallCheck(this, OpenFilesListComponent);

    _get(Object.getPrototypeOf(OpenFilesListComponent.prototype), 'constructor', this).call(this, props);
    this.state = {
      hoveredUri: null
    };
    this._onListItemMouseLeave = this._onListItemMouseLeave.bind(this);
  }

  _createClass(OpenFilesListComponent, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return (_reactForAtom2 || _reactForAtom()).PureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      var selectedRow = this.refs.selectedRow;
      if (selectedRow != null && prevProps.activeUri !== this.props.activeUri) {
        selectedRow.scrollIntoViewIfNeeded();
      }
    }
  }, {
    key: '_onClick',
    value: function _onClick(entry, event) {
      if (event.defaultPrevented) {
        return;
      }

      var uri = entry.uri;
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('filetree-open-from-open-files', { uri: uri });
      atom.workspace.open(uri, { searchAllPanes: true });
    }
  }, {
    key: '_onCloseClick',
    value: function _onCloseClick(entry, event) {
      var uri = entry.uri;
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('filetree-close-from-open-files', { uri: uri });
      event.preventDefault();
      atom.workspace.getPanes().forEach(function (pane) {
        pane.getItems().filter(function (item) {
          return item.getPath && item.getPath() === uri;
        }).forEach(function (item) {
          pane.destroyItem(item);
        });
      });
    }
  }, {
    key: '_onListItemMouseEnter',
    value: function _onListItemMouseEnter(entry) {
      this.setState({
        hoveredUri: entry.uri
      });
    }
  }, {
    key: '_onListItemMouseLeave',
    value: function _onListItemMouseLeave() {
      this.setState({
        hoveredUri: null
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var sortedEntries = propsToEntries(this.props);

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-file-tree-open-files' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiLibPanelComponentScroller2 || _nuclideUiLibPanelComponentScroller()).PanelComponentScroller,
          null,
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'ul',
            { className: 'list-tree nuclide-file-tree-open-files-list' },
            sortedEntries.map(function (e) {
              var isHoveredUri = _this.state.hoveredUri === e.uri;
              return (_reactForAtom2 || _reactForAtom()).React.createElement(
                'li',
                {
                  className: (0, (_classnames2 || _classnames()).default)('list-item', {
                    'selected': e.isSelected,
                    'text-highlight': isHoveredUri
                  }),
                  key: e.uri,
                  onClick: _this._onClick.bind(_this, e),
                  onMouseEnter: _this._onListItemMouseEnter.bind(_this, e),
                  onMouseLeave: _this._onListItemMouseLeave,
                  ref: e.isSelected ? 'selectedRow' : null },
                (_reactForAtom2 || _reactForAtom()).React.createElement('span', {
                  className: (0, (_classnames2 || _classnames()).default)('icon', {
                    'icon-primitive-dot': e.isModified && !isHoveredUri,
                    'icon-x': isHoveredUri || !e.isModified,
                    'text-info': e.isModified
                  }),
                  onClick: _this._onCloseClick.bind(_this, e)
                }),
                (_reactForAtom2 || _reactForAtom()).React.createElement(
                  'span',
                  { className: 'icon icon-file-text' },
                  e.name
                )
              );
            })
          )
        )
      );
    }
  }]);

  return OpenFilesListComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.OpenFilesListComponent = OpenFilesListComponent;

function propsToEntries(props) {
  var entries = props.uris.map(function (uri) {
    var isModified = props.modifiedUris.indexOf(uri) >= 0;
    var isSelected = uri === props.activeUri;
    return { uri: uri, name: (_libFileTreeHelpers2 || _libFileTreeHelpers()).default.keyToName(uri), isModified: isModified, isSelected: isSelected };
  });

  entries.sort(function (e1, e2) {
    return e1.name.toLowerCase().localeCompare(e2.name.toLowerCase());
  });
  return entries;
}