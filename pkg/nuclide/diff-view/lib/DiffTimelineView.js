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
          onSelectionChange: this.props.onSelectionChange
        });
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
//# sourceMappingURL=data:application/json;base64,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R0FBRyxDQUFDO09BQ3ZELENBQUMsQ0FBQztBQUNILFVBQU0sT0FBTyxHQUFNLElBQUksVUFBSyxLQUFLLG9CQUN6QixNQUFNLGtCQUNSLElBQUksQUFBRSxDQUFDO0FBQ2IsVUFBTSxpQkFBaUIsR0FBRyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7O0FBRTVDLFVBQUksS0FBSyxLQUFLLENBQUMsSUFBSSxjQUFjLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQy9ELHlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUNoQztBQUNELFVBQUksS0FBSyxLQUFLLGNBQWMsR0FBRyxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDMUQseUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQ2hDO0FBQ0QsYUFDRTs7O0FBQ0UsbUJBQVMsRUFBRSxpQkFBaUIsQUFBQztBQUM3QixpQkFBTyxFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxBQUFDO0FBQ3pELGVBQUssRUFBRSxPQUFPLEFBQUM7UUFDZiwyQ0FBSyxTQUFTLEVBQUMsaUJBQWlCLEdBQUc7UUFDbkM7O1lBQUssU0FBUyxFQUFDLGdCQUFnQjtVQUM1QixLQUFLOztVQUFJLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSTs7U0FDbkU7T0FDRixDQUNOO0tBQ0g7OztXQUVvQixpQ0FBUztBQUM1QixVQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDbkQ7OztTQXZDRyxvQkFBb0I7R0FBUyxvQkFBTSxTQUFTIiwiZmlsZSI6IkRpZmZUaW1lbGluZVZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBEaWZmVmlld01vZGVsIGZyb20gJy4vRGlmZlZpZXdNb2RlbCc7XG5pbXBvcnQgdHlwZSB7UmV2aXNpb25zU3RhdGV9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUge1JldmlzaW9uSW5mb30gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9IZ1NlcnZpY2UnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuXG50eXBlIERpZmZUaW1lbGluZVZpZXdQcm9wcyA9IHtcbiAgZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsO1xuICBvblNlbGVjdGlvbkNoYW5nZTogKHJldmlzaW9uSW5mbzogUmV2aXNpb25JbmZvKSA9PiBhbnk7XG59O1xuXG50eXBlIERpZmZUaW1lbGluZVZpZXdTdGF0ZSA9IHtcbiAgcmV2aXNpb25zU3RhdGU6ID9SZXZpc2lvbnNTdGF0ZTtcbn07XG5cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpZmZUaW1lbGluZVZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogRGlmZlRpbWVsaW5lVmlld1Byb3BzO1xuICBzdGF0ZTogRGlmZlRpbWVsaW5lVmlld1N0YXRlO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogRGlmZlRpbWVsaW5lVmlld1Byb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIGNvbnN0IHtkaWZmTW9kZWx9ID0gcHJvcHM7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHJldmlzaW9uc1N0YXRlOiBudWxsLFxuICAgIH07XG4gICAgY29uc3QgYm91bmRVcGRhdGVSZXZpc2lvbnMgPSB0aGlzLl91cGRhdGVSZXZpc2lvbnMuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGRpZmZNb2RlbC5vblJldmlzaW9uc1VwZGF0ZShib3VuZFVwZGF0ZVJldmlzaW9ucylcbiAgICApO1xuICAgIGRpZmZNb2RlbC5nZXRBY3RpdmVSZXZpc2lvbnNTdGF0ZSgpLnRoZW4oYm91bmRVcGRhdGVSZXZpc2lvbnMpO1xuICB9XG5cbiAgX3VwZGF0ZVJldmlzaW9ucyhuZXdSZXZpc2lvbnNTdGF0ZTogP1JldmlzaW9uc1N0YXRlKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICByZXZpc2lvbnNTdGF0ZTogbmV3UmV2aXNpb25zU3RhdGUsXG4gICAgfSk7XG4gIH1cblxuICByZW5kZXIoKTogP1JlYWN0RWxlbWVudCB7XG4gICAgbGV0IGNvbnRlbnQgPSBudWxsO1xuICAgIGNvbnN0IHtyZXZpc2lvbnNTdGF0ZX0gPSB0aGlzLnN0YXRlO1xuICAgIGlmIChyZXZpc2lvbnNTdGF0ZSA9PSBudWxsKSB7XG4gICAgICBjb250ZW50ID0gJ1JldmlzaW9ucyBub3QgbG9hZGVkLi4uJztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qge3JldmlzaW9ucywgY29tcGFyZUNvbW1pdElkLCBjb21taXRJZH0gPSByZXZpc2lvbnNTdGF0ZTtcbiAgICAgIGNvbnRlbnQgPSAoXG4gICAgICAgIDxSZXZpc2lvbnNUaW1lbGluZUNvbXBvbmVudFxuICAgICAgICAgIHJldmlzaW9ucz17cmV2aXNpb25zfVxuICAgICAgICAgIGNvbXBhcmVSZXZpc2lvbklkPXtjb21wYXJlQ29tbWl0SWQgfHwgY29tbWl0SWR9XG4gICAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2U9e3RoaXMucHJvcHMub25TZWxlY3Rpb25DaGFuZ2V9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkaWZmLXRpbWVsaW5lXCI+XG4gICAgICAgIHtjb250ZW50fVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIGhhbmRsZVNlbGVjdGlvbkNoYW5nZShyZXZpc2lvbjogUmV2aXNpb25JbmZvKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5vblNlbGVjdGlvbkNoYW5nZShyZXZpc2lvbik7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG50eXBlIFJldmlzaW9uc0NvbXBvbmVudFByb3BzID0ge1xuICByZXZpc2lvbnM6IEFycmF5PFJldmlzaW9uSW5mbz47XG4gIGNvbXBhcmVSZXZpc2lvbklkOiBudW1iZXI7XG4gIG9uU2VsZWN0aW9uQ2hhbmdlOiAocmV2aXNpb25JbmZvOiBSZXZpc2lvbkluZm8pID0+IGFueTtcbn07XG5cbmNsYXNzIFJldmlzaW9uc1RpbWVsaW5lQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFJldmlzaW9uc0NvbXBvbmVudFByb3BzO1xuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtyZXZpc2lvbnMsIGNvbXBhcmVSZXZpc2lvbklkfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnMgPSByZXZpc2lvbnMuc2xpY2UoKS5yZXZlcnNlKCk7XG4gICAgY29uc3Qgc2VsZWN0ZWRJbmRleCA9IGFycmF5LmZpbmRJbmRleChcbiAgICAgIGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zLFxuICAgICAgcmV2aXNpb24gPT4gcmV2aXNpb24uaWQgPT09IGNvbXBhcmVSZXZpc2lvbklkXG4gICAgKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInJldmlzaW9uLXRpbWVsaW5lLXdyYXBcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZXZpc2lvbi1zZWxlY3RvclwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmV2aXNpb25zXCI+XG4gICAgICAgICAgICB7bGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnMubWFwKChyZXZpc2lvbiwgaSkgPT5cbiAgICAgICAgICAgICAgPFJldmlzaW9uVGltZWxpbmVOb2RlXG4gICAgICAgICAgICAgICAgaW5kZXg9e2l9XG4gICAgICAgICAgICAgICAga2V5PXtyZXZpc2lvbi5oYXNofVxuICAgICAgICAgICAgICAgIHNlbGVjdGVkSW5kZXg9e3NlbGVjdGVkSW5kZXh9XG4gICAgICAgICAgICAgICAgcmV2aXNpb249e3JldmlzaW9ufVxuICAgICAgICAgICAgICAgIHJldmlzaW9uc0NvdW50PXtyZXZpc2lvbnMubGVuZ3RofVxuICAgICAgICAgICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlPXt0aGlzLnByb3BzLm9uU2VsZWN0aW9uQ2hhbmdlfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG5cbnR5cGUgUmV2aXNpb25UaW1lbGluZU5vZGVQcm9wcyA9IHtcbiAgcmV2aXNpb246IFJldmlzaW9uSW5mbztcbiAgaW5kZXg6IG51bWJlcjtcbiAgc2VsZWN0ZWRJbmRleDogbnVtYmVyO1xuICByZXZpc2lvbnNDb3VudDogbnVtYmVyO1xuICBvblNlbGVjdGlvbkNoYW5nZTogKHJldmlzaW9uSW5mbzogUmV2aXNpb25JbmZvKSA9PiBhbnk7XG59O1xuXG5jbGFzcyBSZXZpc2lvblRpbWVsaW5lTm9kZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBSZXZpc2lvblRpbWVsaW5lTm9kZVByb3BzO1xuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtyZXZpc2lvbiwgaW5kZXgsIHNlbGVjdGVkSW5kZXgsIHJldmlzaW9uc0NvdW50fSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge2Jvb2ttYXJrcywgdGl0bGUsIGF1dGhvciwgaGFzaCwgZGF0ZX0gPSByZXZpc2lvbjtcbiAgICBjb25zdCByZXZpc2lvbkNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoe1xuICAgICAgcmV2aXNpb246IHRydWUsXG4gICAgICAnc2VsZWN0ZWQtcmV2aXNpb24taW5yYW5nZSc6IGluZGV4IDwgc2VsZWN0ZWRJbmRleCxcbiAgICAgICdzZWxlY3RlZC1yZXZpc2lvbi1zdGFydCc6IGluZGV4ID09PSAwLFxuICAgICAgJ3NlbGVjdGVkLXJldmlzaW9uLWVuZCc6IGluZGV4ID09PSBzZWxlY3RlZEluZGV4LFxuICAgICAgJ3NlbGVjdGVkLXJldmlzaW9uLWxhc3QnOiBpbmRleCA9PT0gcmV2aXNpb25zQ291bnQgLSAxLFxuICAgIH0pO1xuICAgIGNvbnN0IHRvb2x0aXAgPSBgJHtoYXNofTogJHt0aXRsZX1cbiAgQXV0aG9yOiAke2F1dGhvcn1cbiAgRGF0ZTogJHtkYXRlfWA7XG4gICAgY29uc3QgYm9va21hcmtzVG9SZW5kZXIgPSBib29rbWFya3Muc2xpY2UoKTtcbiAgICAvLyBBZGQgYEJBU0VgXG4gICAgaWYgKGluZGV4ID09PSAwICYmIHJldmlzaW9uc0NvdW50ID4gMSAmJiBib29rbWFya3MubGVuZ3RoID09PSAwKSB7XG4gICAgICBib29rbWFya3NUb1JlbmRlci5wdXNoKCdIRUFEJyk7XG4gICAgfVxuICAgIGlmIChpbmRleCA9PT0gcmV2aXNpb25zQ291bnQgLSAxICYmIGJvb2ttYXJrcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGJvb2ttYXJrc1RvUmVuZGVyLnB1c2goJ0JBU0UnKTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPXtyZXZpc2lvbkNsYXNzTmFtZX1cbiAgICAgICAgb25DbGljaz17dGhpcy5oYW5kbGVTZWxlY3Rpb25DaGFuZ2UuYmluZCh0aGlzLCByZXZpc2lvbil9XG4gICAgICAgIHRpdGxlPXt0b29sdGlwfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZXZpc2lvbi1idWJibGVcIiAvPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJldmlzaW9uLWxhYmVsXCI+XG4gICAgICAgICAge3RpdGxlfSAoe2Jvb2ttYXJrc1RvUmVuZGVyLmxlbmd0aCA/IGJvb2ttYXJrc1RvUmVuZGVyLmpvaW4oJywnKSA6IGhhc2h9KVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5vblNlbGVjdGlvbkNoYW5nZSh0aGlzLnByb3BzLnJldmlzaW9uKTtcbiAgfVxufVxuIl19