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

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

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

        content = _reactForAtom2['default'].createElement(RevisionsTimelineComponent, {
          revisions: _revisions,
          compareRevisionId: compareCommitId || commitId,
          onSelectionChange: this.props.onSelectionChange });
      }
      return _reactForAtom2['default'].createElement(
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
})(_reactForAtom2['default'].Component);

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

      return _reactForAtom2['default'].createElement(
        'div',
        { className: 'revision-timeline-wrap' },
        _reactForAtom2['default'].createElement(
          'h3',
          { className: 'text-center timeline-header' },
          'Revision Timeline'
        ),
        _reactForAtom2['default'].createElement(
          'div',
          { className: 'revision-selector' },
          _reactForAtom2['default'].createElement(
            'div',
            { className: 'revisions' },
            latestToOldestRevisions.map(function (revision, i) {
              return _reactForAtom2['default'].createElement(RevisionTimelineNode, {
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
})(_reactForAtom2['default'].Component);

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
      return _reactForAtom2['default'].createElement(
        'div',
        {
          className: revisionClassName,
          onClick: this.handleSelectionChange.bind(this, revision),
          title: tooltip },
        _reactForAtom2['default'].createElement('div', { className: 'revision-bubble' }),
        _reactForAtom2['default'].createElement(
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
})(_reactForAtom2['default'].Component);

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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bnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRGlmZlZpZXdNb2RlbCBmcm9tICcuL0RpZmZWaWV3TW9kZWwnO1xuaW1wb3J0IHR5cGUge1JldmlzaW9uc1N0YXRlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtSZXZpc2lvbkluZm99IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbnR5cGUgRGlmZlRpbWVsaW5lVmlld1Byb3BzID0ge1xuICBkaWZmTW9kZWw6IERpZmZWaWV3TW9kZWw7XG4gIG9uU2VsZWN0aW9uQ2hhbmdlOiAocmV2aXNpb25JbmZvOiBSZXZpc2lvbkluZm8pID0+IGFueSxcbn07XG5cbnR5cGUgRGlmZlRpbWVsaW5lVmlld1N0YXRlID0ge1xuICByZXZpc2lvbnNTdGF0ZTogP1JldmlzaW9uc1N0YXRlO1xufTtcblxuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZlRpbWVsaW5lVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBEaWZmVGltZWxpbmVWaWV3UHJvcHM7XG4gIHN0YXRlOiBEaWZmVGltZWxpbmVWaWV3U3RhdGU7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBEaWZmVGltZWxpbmVWaWV3UHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgY29uc3Qge2RpZmZNb2RlbH0gPSBwcm9wcztcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgcmV2aXNpb25zU3RhdGU6IG51bGwsXG4gICAgfTtcbiAgICBjb25zdCBib3VuZFVwZGF0ZVJldmlzaW9ucyA9IHRoaXMuX3VwZGF0ZVJldmlzaW9ucy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgZGlmZk1vZGVsLm9uUmV2aXNpb25zVXBkYXRlKGJvdW5kVXBkYXRlUmV2aXNpb25zKVxuICAgICk7XG4gICAgZGlmZk1vZGVsLmdldEFjdGl2ZVJldmlzaW9uc1N0YXRlKCkudGhlbihib3VuZFVwZGF0ZVJldmlzaW9ucyk7XG4gIH1cblxuICBfdXBkYXRlUmV2aXNpb25zKG5ld1JldmlzaW9uc1N0YXRlOiA/UmV2aXNpb25zU3RhdGUpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHJldmlzaW9uc1N0YXRlOiBuZXdSZXZpc2lvbnNTdGF0ZSxcbiAgICB9KTtcbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICBsZXQgY29udGVudCA9IG51bGw7XG4gICAgY29uc3Qge3JldmlzaW9uc1N0YXRlfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKHJldmlzaW9uc1N0YXRlID09IG51bGwpIHtcbiAgICAgIGNvbnRlbnQgPSAnUmV2aXNpb25zIG5vdCBsb2FkZWQuLi4nO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB7cmV2aXNpb25zLCBjb21wYXJlQ29tbWl0SWQsIGNvbW1pdElkfSA9IHJldmlzaW9uc1N0YXRlO1xuICAgICAgY29udGVudCA9IChcbiAgICAgICAgPFJldmlzaW9uc1RpbWVsaW5lQ29tcG9uZW50XG4gICAgICAgICAgcmV2aXNpb25zPXtyZXZpc2lvbnN9XG4gICAgICAgICAgY29tcGFyZVJldmlzaW9uSWQ9e2NvbXBhcmVDb21taXRJZCB8fCBjb21taXRJZH1cbiAgICAgICAgICBvblNlbGVjdGlvbkNoYW5nZT17dGhpcy5wcm9wcy5vblNlbGVjdGlvbkNoYW5nZX0vPlxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGlmZi10aW1lbGluZVwiPlxuICAgICAgICB7Y29udGVudH1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UocmV2aXNpb246IFJldmlzaW9uSW5mbyk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMub25TZWxlY3Rpb25DaGFuZ2UocmV2aXNpb24pO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cbn1cblxudHlwZSBSZXZpc2lvbnNDb21wb25lbnRQcm9wcyA9IHtcbiAgcmV2aXNpb25zOiBBcnJheTxSZXZpc2lvbkluZm8+O1xuICBjb21wYXJlUmV2aXNpb25JZDogbnVtYmVyO1xuICBvblNlbGVjdGlvbkNoYW5nZTogKHJldmlzaW9uSW5mbzogUmV2aXNpb25JbmZvKSA9PiBhbnksXG59O1xuXG5jbGFzcyBSZXZpc2lvbnNUaW1lbGluZUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBSZXZpc2lvbnNDb21wb25lbnRQcm9wcztcblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7cmV2aXNpb25zLCBjb21wYXJlUmV2aXNpb25JZH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zID0gcmV2aXNpb25zLnNsaWNlKCkucmV2ZXJzZSgpO1xuICAgIGNvbnN0IHNlbGVjdGVkSW5kZXggPSBhcnJheS5maW5kSW5kZXgoXG4gICAgICBsYXRlc3RUb09sZGVzdFJldmlzaW9ucyxcbiAgICAgIHJldmlzaW9uID0+IHJldmlzaW9uLmlkID09PSBjb21wYXJlUmV2aXNpb25JZFxuICAgICk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZXZpc2lvbi10aW1lbGluZS13cmFwXCI+XG4gICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciB0aW1lbGluZS1oZWFkZXJcIj5SZXZpc2lvbiBUaW1lbGluZTwvaDM+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmV2aXNpb24tc2VsZWN0b3JcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJldmlzaW9uc1wiPlxuICAgICAgICAgICAge2xhdGVzdFRvT2xkZXN0UmV2aXNpb25zLm1hcCgocmV2aXNpb24sIGkpID0+XG4gICAgICAgICAgICAgIDxSZXZpc2lvblRpbWVsaW5lTm9kZVxuICAgICAgICAgICAgICAgIGluZGV4PXtpfVxuICAgICAgICAgICAgICAgIGtleT17cmV2aXNpb24uaGFzaH1cbiAgICAgICAgICAgICAgICBzZWxlY3RlZEluZGV4PXtzZWxlY3RlZEluZGV4fVxuICAgICAgICAgICAgICAgIHJldmlzaW9uPXtyZXZpc2lvbn1cbiAgICAgICAgICAgICAgICByZXZpc2lvbnNDb3VudD17cmV2aXNpb25zLmxlbmd0aH1cbiAgICAgICAgICAgICAgICBvblNlbGVjdGlvbkNoYW5nZT17dGhpcy5wcm9wcy5vblNlbGVjdGlvbkNoYW5nZX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG50eXBlIFJldmlzaW9uVGltZWxpbmVOb2RlUHJvcHMgPSB7XG4gIHJldmlzaW9uOiBSZXZpc2lvbkluZm87XG4gIGluZGV4OiBudW1iZXI7XG4gIHNlbGVjdGVkSW5kZXg6IG51bWJlcjtcbiAgcmV2aXNpb25zQ291bnQ6IG51bWJlcjtcbiAgb25TZWxlY3Rpb25DaGFuZ2U6IChyZXZpc2lvbkluZm86IFJldmlzaW9uSW5mbykgPT4gYW55LFxufTtcblxuY2xhc3MgUmV2aXNpb25UaW1lbGluZU5vZGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUmV2aXNpb25UaW1lbGluZU5vZGVQcm9wcztcblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7cmV2aXNpb24sIGluZGV4LCBzZWxlY3RlZEluZGV4LCByZXZpc2lvbnNDb3VudH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtib29rbWFya3MsIHRpdGxlLCBhdXRob3IsIGhhc2gsIGRhdGV9ID0gcmV2aXNpb247XG4gICAgY29uc3QgcmV2aXNpb25DbGFzc05hbWUgPSBjbGFzc25hbWVzKHtcbiAgICAgIHJldmlzaW9uOiB0cnVlLFxuICAgICAgJ3NlbGVjdGVkLXJldmlzaW9uLWlucmFuZ2UnOiBpbmRleCA8IHNlbGVjdGVkSW5kZXgsXG4gICAgICAnc2VsZWN0ZWQtcmV2aXNpb24tc3RhcnQnOiBpbmRleCA9PT0gMCxcbiAgICAgICdzZWxlY3RlZC1yZXZpc2lvbi1lbmQnOiBpbmRleCA9PT0gc2VsZWN0ZWRJbmRleCxcbiAgICAgICdzZWxlY3RlZC1yZXZpc2lvbi1sYXN0JzogaW5kZXggPT09IHJldmlzaW9uc0NvdW50IC0gMSxcbiAgICB9KTtcbiAgICBjb25zdCB0b29sdGlwID0gYCR7aGFzaH06ICR7dGl0bGV9XG4gIEF1dGhvcjogJHthdXRob3J9XG4gIERhdGU6ICR7ZGF0ZX1gO1xuICAgIGNvbnN0IGJvb2ttYXJrc1RvUmVuZGVyID0gYm9va21hcmtzLnNsaWNlKCk7XG4gICAgLy8gQWRkIGBCQVNFYFxuICAgIGlmIChpbmRleCA9PT0gMCAmJiByZXZpc2lvbnNDb3VudCA+IDEgJiYgYm9va21hcmtzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgYm9va21hcmtzVG9SZW5kZXIucHVzaCgnSEVBRCcpO1xuICAgIH1cbiAgICBpZiAoaW5kZXggPT09IHJldmlzaW9uc0NvdW50IC0gMSAmJiBib29rbWFya3MubGVuZ3RoID09PSAwKSB7XG4gICAgICBib29rbWFya3NUb1JlbmRlci5wdXNoKCdCQVNFJyk7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT17cmV2aXNpb25DbGFzc05hbWV9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlU2VsZWN0aW9uQ2hhbmdlLmJpbmQodGhpcywgcmV2aXNpb24pfVxuICAgICAgICB0aXRsZT17dG9vbHRpcH0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmV2aXNpb24tYnViYmxlXCIgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZXZpc2lvbi1sYWJlbFwiPlxuICAgICAgICAgIHt0aXRsZX0gKHtib29rbWFya3NUb1JlbmRlci5sZW5ndGggPyBib29rbWFya3NUb1JlbmRlci5qb2luKCcsJykgOiBoYXNofSlcbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgaGFuZGxlU2VsZWN0aW9uQ2hhbmdlKCk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMub25TZWxlY3Rpb25DaGFuZ2UodGhpcy5wcm9wcy5yZXZpc2lvbik7XG4gIH1cbn1cbiJdfQ==