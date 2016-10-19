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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _FilePreview;

function _load_FilePreview() {
  return _FilePreview = _interopRequireDefault(require('./FilePreview'));
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../../commons-node/nuclideUri'));
}

var _commonsAtomGoToLocation;

function _load_commonsAtomGoToLocation() {
  return _commonsAtomGoToLocation = require('../../../commons-atom/go-to-location');
}

var FileReferencesView = (function (_React$Component) {
  _inherits(FileReferencesView, _React$Component);

  function FileReferencesView(props) {
    _classCallCheck(this, FileReferencesView);

    _get(Object.getPrototypeOf(FileReferencesView.prototype), 'constructor', this).call(this, props);
    this.state = {
      isExpanded: true
    };
    this._onFileClick = this._onFileClick.bind(this);
    this._onFileNameClick = this._onFileNameClick.bind(this);
  }

  _createClass(FileReferencesView, [{
    key: '_onRefClick',
    value: function _onRefClick(evt, ref) {
      (0, (_commonsAtomGoToLocation || _load_commonsAtomGoToLocation()).goToLocation)(this.props.uri, ref.range.start.row, ref.range.start.column);
      evt.stopPropagation();
    }
  }, {
    key: '_onFileClick',
    value: function _onFileClick() {
      this.props.clickCallback();
      this.setState({
        isExpanded: !this.state.isExpanded
      });
    }
  }, {
    key: '_onFileNameClick',
    value: function _onFileNameClick(evt, line) {
      (0, (_commonsAtomGoToLocation || _load_commonsAtomGoToLocation()).goToLocation)(this.props.uri, line);
      evt.stopPropagation();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var groups = this.props.refGroups.map(function (group, i) {
        var firstRef = group.references[0];
        var lastRef = group.references[group.references.length - 1];

        var caller = undefined;
        if (firstRef.name && firstRef.name === lastRef.name) {
          caller = (_reactForAtom || _load_reactForAtom()).React.createElement(
            'span',
            null,
            ' in ',
            (_reactForAtom || _load_reactForAtom()).React.createElement(
              'code',
              null,
              firstRef.name
            )
          );
        }
        var startRange = firstRef.range.start;
        var endRange = lastRef.range.end;
        return (_reactForAtom || _load_reactForAtom()).React.createElement(
          'li',
          { key: group.startLine, className: 'nuclide-find-references-ref' },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'div',
            {
              className: 'nuclide-find-references-ref-name',
              onClick: function (evt) {
                return _this._onRefClick(evt, firstRef);
              } },
            'Line ',
            startRange.row + 1,
            ':',
            startRange.column + 1,
            ' - ',
            endRange.row + 1,
            ':',
            endRange.column + 1,
            caller
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement((_FilePreview || _load_FilePreview()).default, _extends({
            grammar: _this.props.grammar,
            text: _this.props.previewText[i]
          }, group, {
            onClick: function (evt) {
              return _this._onRefClick(evt, firstRef);
            },
            onLineClick: _this._onFileNameClick
          }))
        );
      });
      var outerClassName = (0, (_classnames || _load_classnames()).default)('nuclide-find-references-file list-nested-item', {
        collapsed: !this.state.isExpanded,
        expanded: this.state.isExpanded,
        selected: this.props.isSelected
      });

      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'li',
        { className: '' + outerClassName },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          {
            className: 'nuclide-find-references-filename list-item',
            onClick: this._onFileClick },
          (_reactForAtom || _load_reactForAtom()).React.createElement('span', { className: 'icon-file-text icon' }),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'a',
            { onClick: this._onFileNameClick },
            (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.relative(this.props.basePath, this.props.uri)
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'span',
            { className: 'nuclide-find-references-ref-count badge badge-small' },
            groups.length
          )
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'ul',
          { className: 'nuclide-find-references-refs list-tree' },
          groups
        )
      );
    }
  }]);

  return FileReferencesView;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.default = FileReferencesView;
module.exports = exports.default;