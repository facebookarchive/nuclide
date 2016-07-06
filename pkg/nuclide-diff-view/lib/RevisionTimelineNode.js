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

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _nuclideArcanistBaseLibUtils2;

function _nuclideArcanistBaseLibUtils() {
  return _nuclideArcanistBaseLibUtils2 = require('../../nuclide-arcanist-base/lib/utils');
}

var _nuclideArcanistBaseLibUtils4;

function _nuclideArcanistBaseLibUtils3() {
  return _nuclideArcanistBaseLibUtils4 = require('../../nuclide-arcanist-base/lib/utils');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var RevisionTimelineNode = (function (_React$Component) {
  _inherits(RevisionTimelineNode, _React$Component);

  function RevisionTimelineNode(props) {
    _classCallCheck(this, RevisionTimelineNode);

    _get(Object.getPrototypeOf(RevisionTimelineNode.prototype), 'constructor', this).call(this, props);
    this._handlePhabricatorRevisionClick = this._handlePhabricatorRevisionClick.bind(this);
    this._handleSelectionChange = this._handleSelectionChange.bind(this);
  }

  _createClass(RevisionTimelineNode, [{
    key: '_handlePhabricatorRevisionClick',
    value: function _handlePhabricatorRevisionClick(event) {
      // Clicking an anchor opens the `href` in the browser. Stop propagation so it doesn't affect
      // the node selection in the Timeline.
      event.stopPropagation();

      var revision = (0, (_nuclideArcanistBaseLibUtils2 || _nuclideArcanistBaseLibUtils()).getPhabricatorRevisionFromCommitMessage)(this.props.revision.description);
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('diff-view-phabricator-diff-open', { revision: revision });
    }
  }, {
    key: '_handleSelectionChange',
    value: function _handleSelectionChange() {
      this.props.onSelectionChange(this.props.revision);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var diffStatus = _props.diffStatus;
      var index = _props.index;
      var revision = _props.revision;
      var revisionsCount = _props.revisionsCount;
      var selectedIndex = _props.selectedIndex;
      var author = revision.author;
      var bookmarks = revision.bookmarks;
      var date = revision.date;
      var description = revision.description;
      var hash = revision.hash;
      var title = revision.title;

      var revisionClassName = (0, (_classnames2 || _classnames()).default)('revision revision--actionable', {
        'selected-revision-inrange': index < selectedIndex,
        'selected-revision-end': index === selectedIndex,
        'selected-revision-last': index === revisionsCount - 1
      });
      var tooltip = hash + ': ' + title + '\n  Author: ' + author + '\n  Date: ' + date.toString();

      var commitAuthor = (0, (_nuclideArcanistBaseLibUtils4 || _nuclideArcanistBaseLibUtils3()).getCommitAuthorFromAuthorEmail)(author);
      var commitAuthorElement = undefined;
      if (commitAuthor != null) {
        commitAuthorElement = (_reactForAtom2 || _reactForAtom()).React.createElement(
          'span',
          { className: 'inline-block' },
          commitAuthor
        );
      }

      var phabricatorRevision = (0, (_nuclideArcanistBaseLibUtils2 || _nuclideArcanistBaseLibUtils()).getPhabricatorRevisionFromCommitMessage)(description);
      var phabricatorRevisionElement = undefined;
      if (phabricatorRevision != null) {
        phabricatorRevisionElement = (_reactForAtom2 || _reactForAtom()).React.createElement(
          'a',
          {
            className: 'inline-block',
            href: phabricatorRevision.url,
            onClick: this._handlePhabricatorRevisionClick },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'strong',
            null,
            phabricatorRevision.name
          )
        );
      }

      var diffStatusElement = undefined;
      if (diffStatus != null) {
        diffStatusElement = (_reactForAtom2 || _reactForAtom()).React.createElement(
          'span',
          { className: (0, (_classnames2 || _classnames()).default)('inline-block', diffStatus.className) },
          diffStatus.name
        );
      }

      var associatedExtraElement = undefined;
      try {
        var extraUIUtils = require('../../nuclide-arcanist-base/lib/fb/utils.js');
        var extraUIElements = extraUIUtils.getExtraUIElements(description);
        if (extraUIElements != null) {
          associatedExtraElement = extraUIElements.map(function (task) {
            return (_reactForAtom2 || _reactForAtom()).React.createElement(
              'a',
              { key: task.id, className: 'inline-block', href: task.url },
              task.name
            );
          });
        }
      } catch (ex) {
        // There are no extra UI elements to show.
      }

      var bookmarksToRender = bookmarks.slice();
      if (index === 0 && revisionsCount > 1 && bookmarks.length === 0) {
        bookmarksToRender.push('HEAD');
      }
      if (index === revisionsCount - 1 && bookmarks.length === 0) {
        bookmarksToRender.push('BASE');
      }

      var bookmarksElement = undefined;
      if (bookmarksToRender.length > 0) {
        bookmarksElement = (_reactForAtom2 || _reactForAtom()).React.createElement(
          'span',
          { className: 'inline-block text-success' },
          bookmarksToRender.join(' ')
        );
      }

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        {
          className: revisionClassName,
          onClick: this._handleSelectionChange,
          title: tooltip },
        (_reactForAtom2 || _reactForAtom()).React.createElement('div', { className: 'revision-bubble' }),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'revision-label text-monospace' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'span',
            { className: 'inline-block' },
            hash.substr(0, 7)
          ),
          commitAuthorElement,
          phabricatorRevisionElement,
          diffStatusElement,
          associatedExtraElement,
          bookmarksElement,
          (_reactForAtom2 || _reactForAtom()).React.createElement('br', null),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'span',
            { className: 'revision-title' },
            title
          )
        )
      );
    }
  }]);

  return RevisionTimelineNode;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = RevisionTimelineNode;
module.exports = exports.default;