var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _uiAtomTextEditor = require('../../ui/atom-text-editor');

var _uiAtomTextEditor2 = _interopRequireDefault(_uiAtomTextEditor);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _constants = require('./constants');

var _reactForAtom = require('react-for-atom');

var DiffCommitView = (function (_React$Component) {
  _inherits(DiffCommitView, _React$Component);

  function DiffCommitView(props) {
    _classCallCheck(this, DiffCommitView);

    _get(Object.getPrototypeOf(DiffCommitView.prototype), 'constructor', this).call(this, props);
    this._onClickCommit = this._onClickCommit.bind(this);
  }

  _createClass(DiffCommitView, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.props.diffModel.loadCommitMessage();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      var _props$diffModel$getState = this.props.diffModel.getState();

      var commitMessage = _props$diffModel$getState.commitMessage;

      this.refs['message'].getTextBuffer().setText(commitMessage || '');
    }
  }, {
    key: '_onClickCommit',
    value: function _onClickCommit() {
      // TODO(most): real commit/amend logic.
    }
  }, {
    key: '_onChangeCommitMode',
    value: function _onChangeCommitMode(commitMode) {
      this.props.diffModel.setCommitMode(commitMode);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var loadingIndicator = null;
      var commitButton = null;

      var _props$diffModel$getState2 = this.props.diffModel.getState();

      var commitMode = _props$diffModel$getState2.commitMode;
      var isCommitMessageLoading = _props$diffModel$getState2.isCommitMessageLoading;

      if (isCommitMessageLoading) {
        loadingIndicator = _reactForAtom.React.createElement('span', { className: 'loading loading-spinner-tiny inline-block pull-right' });
      } else {
        commitButton = _reactForAtom.React.createElement(
          'button',
          { className: 'btn btn-sm btn-success pull-right',
            onClick: this._onClickCommit },
          commitMode,
          ' to HEAD'
        );
      }

      var commitModes = Object.keys(_constants.CommitMode).map(function (modeId) {
        var modeValue = _constants.CommitMode[modeId];
        var className = (0, _classnames2['default'])({
          'btn': true,
          'btn-sm': true,
          'selected': modeValue === commitMode
        });
        return _reactForAtom.React.createElement(
          'button',
          {
            className: className,
            key: modeValue,
            onClick: function () {
              return _this._onChangeCommitMode(modeValue);
            } },
          modeValue
        );
      });
      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-diff-mode' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'message-editor-wrapper' },
          _reactForAtom.React.createElement(_uiAtomTextEditor2['default'], {
            ref: 'message',
            readOnly: isCommitMessageLoading,
            gutterHidden: true
          })
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'padded' },
          _reactForAtom.React.createElement(
            'div',
            { className: 'btn-group btn-group-sm inline-block' },
            commitModes
          ),
          loadingIndicator,
          commitButton
        )
      );
    }
  }]);

  return DiffCommitView;
})(_reactForAtom.React.Component);

module.exports = DiffCommitView;
//# sourceMappingURL=data:application/json;base64,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ImZpbGUiOiJEaWZmQ29tbWl0Vmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtDb21taXRNb2RlVHlwZX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSBEaWZmVmlld01vZGVsIGZyb20gJy4vRGlmZlZpZXdNb2RlbCc7XG5cbmltcG9ydCBBdG9tVGV4dEVkaXRvciBmcm9tICcuLi8uLi91aS9hdG9tLXRleHQtZWRpdG9yJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtDb21taXRNb2RlfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxudHlwZSBQcm9wcyA9IHtcbiAgZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsO1xufTtcblxuY2xhc3MgRGlmZkNvbW1pdFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNsaWNrQ29tbWl0ID0gdGhpcy5fb25DbGlja0NvbW1pdC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5kaWZmTW9kZWwubG9hZENvbW1pdE1lc3NhZ2UoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSgpOiB2b2lkIHtcbiAgICBjb25zdCB7Y29tbWl0TWVzc2FnZX0gPSB0aGlzLnByb3BzLmRpZmZNb2RlbC5nZXRTdGF0ZSgpO1xuICAgIHRoaXMucmVmc1snbWVzc2FnZSddLmdldFRleHRCdWZmZXIoKS5zZXRUZXh0KGNvbW1pdE1lc3NhZ2UgfHwgJycpO1xuICB9XG5cbiAgX29uQ2xpY2tDb21taXQoKTogdm9pZCB7XG4gICAgLy8gVE9ETyhtb3N0KTogcmVhbCBjb21taXQvYW1lbmQgbG9naWMuXG4gIH1cblxuICBfb25DaGFuZ2VDb21taXRNb2RlKGNvbW1pdE1vZGU6IENvbW1pdE1vZGVUeXBlKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5kaWZmTW9kZWwuc2V0Q29tbWl0TW9kZShjb21taXRNb2RlKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGxldCBsb2FkaW5nSW5kaWNhdG9yID0gbnVsbDtcbiAgICBsZXQgY29tbWl0QnV0dG9uID0gbnVsbDtcblxuICAgIGNvbnN0IHtjb21taXRNb2RlLCBpc0NvbW1pdE1lc3NhZ2VMb2FkaW5nfSA9IHRoaXMucHJvcHMuZGlmZk1vZGVsLmdldFN0YXRlKCk7XG4gICAgaWYgKGlzQ29tbWl0TWVzc2FnZUxvYWRpbmcpIHtcbiAgICAgIGxvYWRpbmdJbmRpY2F0b3IgPSAoXG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImxvYWRpbmcgbG9hZGluZy1zcGlubmVyLXRpbnkgaW5saW5lLWJsb2NrIHB1bGwtcmlnaHRcIj48L3NwYW4+XG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb21taXRCdXR0b24gPSAoXG4gICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1zbSBidG4tc3VjY2VzcyBwdWxsLXJpZ2h0XCJcbiAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrQ29tbWl0fT5cbiAgICAgICAgICB7Y29tbWl0TW9kZX0gdG8gSEVBRFxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgY29tbWl0TW9kZXMgPSBPYmplY3Qua2V5cyhDb21taXRNb2RlKS5tYXAobW9kZUlkID0+IHtcbiAgICAgIGNvbnN0IG1vZGVWYWx1ZSA9IENvbW1pdE1vZGVbbW9kZUlkXTtcbiAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoe1xuICAgICAgICAnYnRuJzogdHJ1ZSxcbiAgICAgICAgJ2J0bi1zbSc6IHRydWUsXG4gICAgICAgICdzZWxlY3RlZCc6IG1vZGVWYWx1ZSA9PT0gY29tbWl0TW9kZSxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lfVxuICAgICAgICAgIGtleT17bW9kZVZhbHVlfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMuX29uQ2hhbmdlQ29tbWl0TW9kZShtb2RlVmFsdWUpfT5cbiAgICAgICAgICB7bW9kZVZhbHVlfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICk7XG4gICAgfSk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLW1vZGVcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtZXNzYWdlLWVkaXRvci13cmFwcGVyXCI+XG4gICAgICAgICAgPEF0b21UZXh0RWRpdG9yXG4gICAgICAgICAgICByZWY9XCJtZXNzYWdlXCJcbiAgICAgICAgICAgIHJlYWRPbmx5PXtpc0NvbW1pdE1lc3NhZ2VMb2FkaW5nfVxuICAgICAgICAgICAgZ3V0dGVySGlkZGVuPXt0cnVlfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZGRlZFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwIGJ0bi1ncm91cC1zbSBpbmxpbmUtYmxvY2tcIj5cbiAgICAgICAgICAgIHtjb21taXRNb2Rlc31cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7bG9hZGluZ0luZGljYXRvcn1cbiAgICAgICAgICB7Y29tbWl0QnV0dG9ufVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmQ29tbWl0VmlldztcbiJdfQ==