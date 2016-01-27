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

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _commons = require('../../commons');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

/* eslint-disable react/prop-types */

var DiffTimelineView = (function (_React$Component) {
  _inherits(DiffTimelineView, _React$Component);

  function DiffTimelineView(props) {
    _classCallCheck(this, DiffTimelineView);

    _get(Object.getPrototypeOf(DiffTimelineView.prototype), 'constructor', this).call(this, props);
    this._subscriptions = new _atom.CompositeDisposable();
    var diffModel = props.diffModel;

    this.state = {
      revisionsState: null
    };
    var boundUpdateRevisions = this._updateRevisions.bind(this);
    this._subscriptions.add(diffModel.onRevisionsUpdate(boundUpdateRevisions));
    diffModel.getActiveRevisionsState().then(boundUpdateRevisions);
  }

  _createClass(DiffTimelineView, [{
    key: '_updateRevisions',
    value: function _updateRevisions(newRevisionsState) {
      this.setState({
        revisionsState: newRevisionsState
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var content = null;
      var revisionsState = this.state.revisionsState;

      if (revisionsState == null) {
        content = 'Revisions not loaded...';
      } else {
        var _revisions = revisionsState.revisions;
        var compareCommitId = revisionsState.compareCommitId;
        var commitId = revisionsState.commitId;

        content = _reactForAtom.React.createElement(RevisionsTimelineComponent, {
          revisions: _revisions,
          compareRevisionId: compareCommitId || commitId,
          onSelectionChange: this.props.onSelectionChange });
      }
      return _reactForAtom.React.createElement(
        'div',
        { className: 'diff-timeline' },
        content
      );
    }
  }, {
    key: 'handleSelectionChange',
    value: function handleSelectionChange(revision) {
      this.props.onSelectionChange(revision);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._subscriptions.dispose();
    }
  }]);

  return DiffTimelineView;
})(_reactForAtom.React.Component);

exports['default'] = DiffTimelineView;

var RevisionsTimelineComponent = (function (_React$Component2) {
  _inherits(RevisionsTimelineComponent, _React$Component2);

  function RevisionsTimelineComponent() {
    _classCallCheck(this, RevisionsTimelineComponent);

    _get(Object.getPrototypeOf(RevisionsTimelineComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(RevisionsTimelineComponent, [{
    key: 'render',
    value: function render() {
      var _this = this;

      var _props = this.props;
      var revisions = _props.revisions;
      var compareRevisionId = _props.compareRevisionId;

      var latestToOldestRevisions = revisions.slice().reverse();
      var selectedIndex = _commons.array.findIndex(latestToOldestRevisions, function (revision) {
        return revision.id === compareRevisionId;
      });

      return _reactForAtom.React.createElement(
        'div',
        { className: 'revision-timeline-wrap' },
        _reactForAtom.React.createElement(
          'h3',
          { className: 'text-center timeline-header' },
          'Revision Timeline'
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'revision-selector' },
          _reactForAtom.React.createElement(
            'div',
            { className: 'revisions' },
            latestToOldestRevisions.map(function (revision, i) {
              return _reactForAtom.React.createElement(RevisionTimelineNode, {
                index: i,
                key: revision.hash,
                selectedIndex: selectedIndex,
                revision: revision,
                revisionsCount: revisions.length,
                onSelectionChange: _this.props.onSelectionChange
              });
            })
          )
        )
      );
    }
  }]);

  return RevisionsTimelineComponent;
})(_reactForAtom.React.Component);

var RevisionTimelineNode = (function (_React$Component3) {
  _inherits(RevisionTimelineNode, _React$Component3);

  function RevisionTimelineNode() {
    _classCallCheck(this, RevisionTimelineNode);

    _get(Object.getPrototypeOf(RevisionTimelineNode.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(RevisionTimelineNode, [{
    key: 'render',
    value: function render() {
      var _props2 = this.props;
      var revision = _props2.revision;
      var index = _props2.index;
      var selectedIndex = _props2.selectedIndex;
      var revisionsCount = _props2.revisionsCount;
      var bookmarks = revision.bookmarks;
      var title = revision.title;
      var author = revision.author;
      var hash = revision.hash;
      var date = revision.date;

      var revisionClassName = (0, _classnames2['default'])({
        revision: true,
        'selected-revision-inrange': index < selectedIndex,
        'selected-revision-start': index === 0,
        'selected-revision-end': index === selectedIndex,
        'selected-revision-last': index === revisionsCount - 1
      });
      var tooltip = hash + ': ' + title + '\n  Author: ' + author + '\n  Date: ' + date;
      var bookmarksToRender = bookmarks.slice();
      // Add `BASE`
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
          onClick: this.handleSelectionChange.bind(this, revision),
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
  }, {
    key: 'handleSelectionChange',
    value: function handleSelectionChange() {
      this.props.onSelectionChange(this.props.revision);
    }
  }]);

  return RevisionTimelineNode;
})(_reactForAtom.React.Component);

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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dCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBEaWZmVmlld01vZGVsIGZyb20gJy4vRGlmZlZpZXdNb2RlbCc7XG5pbXBvcnQgdHlwZSB7UmV2aXNpb25zU3RhdGV9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUge1JldmlzaW9uSW5mb30gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuXG50eXBlIERpZmZUaW1lbGluZVZpZXdQcm9wcyA9IHtcbiAgZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsO1xuICBvblNlbGVjdGlvbkNoYW5nZTogKHJldmlzaW9uSW5mbzogUmV2aXNpb25JbmZvKSA9PiBhbnksXG59O1xuXG50eXBlIERpZmZUaW1lbGluZVZpZXdTdGF0ZSA9IHtcbiAgcmV2aXNpb25zU3RhdGU6ID9SZXZpc2lvbnNTdGF0ZTtcbn07XG5cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpZmZUaW1lbGluZVZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogRGlmZlRpbWVsaW5lVmlld1Byb3BzO1xuICBzdGF0ZTogRGlmZlRpbWVsaW5lVmlld1N0YXRlO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogRGlmZlRpbWVsaW5lVmlld1Byb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIGNvbnN0IHtkaWZmTW9kZWx9ID0gcHJvcHM7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHJldmlzaW9uc1N0YXRlOiBudWxsLFxuICAgIH07XG4gICAgY29uc3QgYm91bmRVcGRhdGVSZXZpc2lvbnMgPSB0aGlzLl91cGRhdGVSZXZpc2lvbnMuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGRpZmZNb2RlbC5vblJldmlzaW9uc1VwZGF0ZShib3VuZFVwZGF0ZVJldmlzaW9ucylcbiAgICApO1xuICAgIGRpZmZNb2RlbC5nZXRBY3RpdmVSZXZpc2lvbnNTdGF0ZSgpLnRoZW4oYm91bmRVcGRhdGVSZXZpc2lvbnMpO1xuICB9XG5cbiAgX3VwZGF0ZVJldmlzaW9ucyhuZXdSZXZpc2lvbnNTdGF0ZTogP1JldmlzaW9uc1N0YXRlKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICByZXZpc2lvbnNTdGF0ZTogbmV3UmV2aXNpb25zU3RhdGUsXG4gICAgfSk7XG4gIH1cblxuICByZW5kZXIoKTogP1JlYWN0RWxlbWVudCB7XG4gICAgbGV0IGNvbnRlbnQgPSBudWxsO1xuICAgIGNvbnN0IHtyZXZpc2lvbnNTdGF0ZX0gPSB0aGlzLnN0YXRlO1xuICAgIGlmIChyZXZpc2lvbnNTdGF0ZSA9PSBudWxsKSB7XG4gICAgICBjb250ZW50ID0gJ1JldmlzaW9ucyBub3QgbG9hZGVkLi4uJztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qge3JldmlzaW9ucywgY29tcGFyZUNvbW1pdElkLCBjb21taXRJZH0gPSByZXZpc2lvbnNTdGF0ZTtcbiAgICAgIGNvbnRlbnQgPSAoXG4gICAgICAgIDxSZXZpc2lvbnNUaW1lbGluZUNvbXBvbmVudFxuICAgICAgICAgIHJldmlzaW9ucz17cmV2aXNpb25zfVxuICAgICAgICAgIGNvbXBhcmVSZXZpc2lvbklkPXtjb21wYXJlQ29tbWl0SWQgfHwgY29tbWl0SWR9XG4gICAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2U9e3RoaXMucHJvcHMub25TZWxlY3Rpb25DaGFuZ2V9Lz5cbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRpZmYtdGltZWxpbmVcIj5cbiAgICAgICAge2NvbnRlbnR9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgaGFuZGxlU2VsZWN0aW9uQ2hhbmdlKHJldmlzaW9uOiBSZXZpc2lvbkluZm8pOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLm9uU2VsZWN0aW9uQ2hhbmdlKHJldmlzaW9uKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG59XG5cbnR5cGUgUmV2aXNpb25zQ29tcG9uZW50UHJvcHMgPSB7XG4gIHJldmlzaW9uczogQXJyYXk8UmV2aXNpb25JbmZvPjtcbiAgY29tcGFyZVJldmlzaW9uSWQ6IG51bWJlcjtcbiAgb25TZWxlY3Rpb25DaGFuZ2U6IChyZXZpc2lvbkluZm86IFJldmlzaW9uSW5mbykgPT4gYW55LFxufTtcblxuY2xhc3MgUmV2aXNpb25zVGltZWxpbmVDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUmV2aXNpb25zQ29tcG9uZW50UHJvcHM7XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qge3JldmlzaW9ucywgY29tcGFyZVJldmlzaW9uSWR9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBsYXRlc3RUb09sZGVzdFJldmlzaW9ucyA9IHJldmlzaW9ucy5zbGljZSgpLnJldmVyc2UoKTtcbiAgICBjb25zdCBzZWxlY3RlZEluZGV4ID0gYXJyYXkuZmluZEluZGV4KFxuICAgICAgbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnMsXG4gICAgICByZXZpc2lvbiA9PiByZXZpc2lvbi5pZCA9PT0gY29tcGFyZVJldmlzaW9uSWRcbiAgICApO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmV2aXNpb24tdGltZWxpbmUtd3JhcFwiPlxuICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgdGltZWxpbmUtaGVhZGVyXCI+UmV2aXNpb24gVGltZWxpbmU8L2gzPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJldmlzaW9uLXNlbGVjdG9yXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZXZpc2lvbnNcIj5cbiAgICAgICAgICAgIHtsYXRlc3RUb09sZGVzdFJldmlzaW9ucy5tYXAoKHJldmlzaW9uLCBpKSA9PlxuICAgICAgICAgICAgICA8UmV2aXNpb25UaW1lbGluZU5vZGVcbiAgICAgICAgICAgICAgICBpbmRleD17aX1cbiAgICAgICAgICAgICAgICBrZXk9e3JldmlzaW9uLmhhc2h9XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRJbmRleD17c2VsZWN0ZWRJbmRleH1cbiAgICAgICAgICAgICAgICByZXZpc2lvbj17cmV2aXNpb259XG4gICAgICAgICAgICAgICAgcmV2aXNpb25zQ291bnQ9e3JldmlzaW9ucy5sZW5ndGh9XG4gICAgICAgICAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2U9e3RoaXMucHJvcHMub25TZWxlY3Rpb25DaGFuZ2V9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxudHlwZSBSZXZpc2lvblRpbWVsaW5lTm9kZVByb3BzID0ge1xuICByZXZpc2lvbjogUmV2aXNpb25JbmZvO1xuICBpbmRleDogbnVtYmVyO1xuICBzZWxlY3RlZEluZGV4OiBudW1iZXI7XG4gIHJldmlzaW9uc0NvdW50OiBudW1iZXI7XG4gIG9uU2VsZWN0aW9uQ2hhbmdlOiAocmV2aXNpb25JbmZvOiBSZXZpc2lvbkluZm8pID0+IGFueSxcbn07XG5cbmNsYXNzIFJldmlzaW9uVGltZWxpbmVOb2RlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFJldmlzaW9uVGltZWxpbmVOb2RlUHJvcHM7XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qge3JldmlzaW9uLCBpbmRleCwgc2VsZWN0ZWRJbmRleCwgcmV2aXNpb25zQ291bnR9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7Ym9va21hcmtzLCB0aXRsZSwgYXV0aG9yLCBoYXNoLCBkYXRlfSA9IHJldmlzaW9uO1xuICAgIGNvbnN0IHJldmlzaW9uQ2xhc3NOYW1lID0gY2xhc3NuYW1lcyh7XG4gICAgICByZXZpc2lvbjogdHJ1ZSxcbiAgICAgICdzZWxlY3RlZC1yZXZpc2lvbi1pbnJhbmdlJzogaW5kZXggPCBzZWxlY3RlZEluZGV4LFxuICAgICAgJ3NlbGVjdGVkLXJldmlzaW9uLXN0YXJ0JzogaW5kZXggPT09IDAsXG4gICAgICAnc2VsZWN0ZWQtcmV2aXNpb24tZW5kJzogaW5kZXggPT09IHNlbGVjdGVkSW5kZXgsXG4gICAgICAnc2VsZWN0ZWQtcmV2aXNpb24tbGFzdCc6IGluZGV4ID09PSByZXZpc2lvbnNDb3VudCAtIDEsXG4gICAgfSk7XG4gICAgY29uc3QgdG9vbHRpcCA9IGAke2hhc2h9OiAke3RpdGxlfVxuICBBdXRob3I6ICR7YXV0aG9yfVxuICBEYXRlOiAke2RhdGV9YDtcbiAgICBjb25zdCBib29rbWFya3NUb1JlbmRlciA9IGJvb2ttYXJrcy5zbGljZSgpO1xuICAgIC8vIEFkZCBgQkFTRWBcbiAgICBpZiAoaW5kZXggPT09IDAgJiYgcmV2aXNpb25zQ291bnQgPiAxICYmIGJvb2ttYXJrcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGJvb2ttYXJrc1RvUmVuZGVyLnB1c2goJ0hFQUQnKTtcbiAgICB9XG4gICAgaWYgKGluZGV4ID09PSByZXZpc2lvbnNDb3VudCAtIDEgJiYgYm9va21hcmtzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgYm9va21hcmtzVG9SZW5kZXIucHVzaCgnQkFTRScpO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9e3JldmlzaW9uQ2xhc3NOYW1lfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZVNlbGVjdGlvbkNoYW5nZS5iaW5kKHRoaXMsIHJldmlzaW9uKX1cbiAgICAgICAgdGl0bGU9e3Rvb2x0aXB9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJldmlzaW9uLWJ1YmJsZVwiIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmV2aXNpb24tbGFiZWxcIj5cbiAgICAgICAgICB7dGl0bGV9ICh7Ym9va21hcmtzVG9SZW5kZXIubGVuZ3RoID8gYm9va21hcmtzVG9SZW5kZXIuam9pbignLCcpIDogaGFzaH0pXG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIGhhbmRsZVNlbGVjdGlvbkNoYW5nZSgpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLm9uU2VsZWN0aW9uQ2hhbmdlKHRoaXMucHJvcHMucmV2aXNpb24pO1xuICB9XG59XG4iXX0=