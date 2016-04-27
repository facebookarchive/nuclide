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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _reactForAtom = require('react-for-atom');

var RevisionTimelineNode = (function (_React$Component) {
  _inherits(RevisionTimelineNode, _React$Component);

  function RevisionTimelineNode(props) {
    _classCallCheck(this, RevisionTimelineNode);

    _get(Object.getPrototypeOf(RevisionTimelineNode.prototype), 'constructor', this).call(this, props);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
  }

  _createClass(RevisionTimelineNode, [{
    key: 'handleSelectionChange',
    value: function handleSelectionChange() {
      this.props.onSelectionChange(this.props.revision);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var revision = _props.revision;
      var index = _props.index;
      var selectedIndex = _props.selectedIndex;
      var revisionsCount = _props.revisionsCount;
      var bookmarks = revision.bookmarks;
      var title = revision.title;
      var author = revision.author;
      var hash = revision.hash;
      var date = revision.date;

      var revisionClassName = (0, _classnames2['default'])('revision revision--actionable', {
        'selected-revision-inrange': index < selectedIndex,
        'selected-revision-end': index === selectedIndex,
        'selected-revision-last': index === revisionsCount - 1
      });
      var tooltip = hash + ': ' + title + '\n  Author: ' + author + '\n  Date: ' + date;

      var bookmarksToRender = bookmarks.slice();
      if (index === 0 && revisionsCount > 1 && bookmarks.length === 0) {
        bookmarksToRender.push('HEAD');
      }
      if (index === revisionsCount - 1 && bookmarks.length === 0) {
        bookmarksToRender.push('BASE');
      }

      return _reactForAtom.React.createElement(
        'div',
        {
          className: revisionClassName,
          onClick: this.handleSelectionChange,
          title: tooltip },
        _reactForAtom.React.createElement('div', { className: 'revision-bubble' }),
        _reactForAtom.React.createElement(
          'div',
          { className: 'revision-label' },
          title,
          ' (',
          bookmarksToRender.length ? bookmarksToRender.join(',') : hash,
          ')'
        )
      );
    }
  }]);

  return RevisionTimelineNode;
})(_reactForAtom.React.Component);

exports['default'] = RevisionTimelineNode;
module.exports = exports['default'];