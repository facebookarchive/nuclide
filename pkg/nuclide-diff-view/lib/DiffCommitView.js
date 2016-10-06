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

var _nuclideUiAtomTextEditor2;

function _nuclideUiAtomTextEditor() {
  return _nuclideUiAtomTextEditor2 = require('../../nuclide-ui/AtomTextEditor');
}

var _nuclideUiCheckbox2;

function _nuclideUiCheckbox() {
  return _nuclideUiCheckbox2 = require('../../nuclide-ui/Checkbox');
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiButton2;

function _nuclideUiButton() {
  return _nuclideUiButton2 = require('../../nuclide-ui/Button');
}

var _nuclideUiToolbar2;

function _nuclideUiToolbar() {
  return _nuclideUiToolbar2 = require('../../nuclide-ui/Toolbar');
}

var _nuclideUiToolbarLeft2;

function _nuclideUiToolbarLeft() {
  return _nuclideUiToolbarLeft2 = require('../../nuclide-ui/ToolbarLeft');
}

var _nuclideUiToolbarRight2;

function _nuclideUiToolbarRight() {
  return _nuclideUiToolbarRight2 = require('../../nuclide-ui/ToolbarRight');
}

var DiffCommitView = (function (_React$Component) {
  _inherits(DiffCommitView, _React$Component);

  function DiffCommitView(props) {
    _classCallCheck(this, DiffCommitView);

    _get(Object.getPrototypeOf(DiffCommitView.prototype), 'constructor', this).call(this, props);
    this.__onClickCommit = this.__onClickCommit.bind(this);
    this._onToggleAmend = this._onToggleAmend.bind(this);
    this._onToggleAmendRebase = this._onToggleAmendRebase.bind(this);
    this._onClickBack = this._onClickBack.bind(this);
  }

  _createClass(DiffCommitView, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      this.__populateCommitMessage();

      // Shortcut to commit when on form
      this._subscriptions = new (_atom2 || _atom()).CompositeDisposable(atom.commands.add('.commit-form-wrapper', 'nuclide-diff-view:commit-message', function (event) {
        return _this.__onClickCommit();
      }));
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (this.props.commitMessage !== prevProps.commitMessage) {
        this.__populateCommitMessage();
      }
    }
  }, {
    key: '__populateCommitMessage',
    value: function __populateCommitMessage() {
      this.refs.message.getTextBuffer().setText(this.props.commitMessage || '');
    }
  }, {
    key: '_isLoading',
    value: function _isLoading() {
      var commitModeState = this.props.commitModeState;

      return commitModeState !== (_constants2 || _constants()).CommitModeState.READY;
    }
  }, {
    key: '_getToolbar',
    value: function _getToolbar() {
      var commitModeState = this.props.commitModeState;

      var message = undefined;
      switch (commitModeState) {
        case (_constants2 || _constants()).CommitModeState.AWAITING_COMMIT:
          message = 'Committing...';
          break;
        case (_constants2 || _constants()).CommitModeState.LOADING_COMMIT_MESSAGE:
          message = 'Loading...';
          break;
        case (_constants2 || _constants()).CommitModeState.READY:
          message = 'Commit';
          break;
        default:
          message = 'Unknown Commit State!';
          break;
      }

      var isLoading = this._isLoading();
      var btnClassname = (0, (_classnames2 || _classnames()).default)('pull-right', {
        'btn-progress': isLoading
      });

      var rebaseOptionElement = null;
      if (this.props.commitMode === (_constants2 || _constants()).CommitMode.AMEND) {
        rebaseOptionElement = (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiCheckbox2 || _nuclideUiCheckbox()).Checkbox, {
          className: 'padded',
          checked: this.props.shouldRebaseOnAmend,
          disabled: isLoading,
          label: 'Rebase stacked commits',
          onChange: this._onToggleAmendRebase,
          tabIndex: '-1'
        });
      }

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_nuclideUiToolbar2 || _nuclideUiToolbar()).Toolbar,
        { location: 'bottom' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiToolbarLeft2 || _nuclideUiToolbarLeft()).ToolbarLeft,
          null,
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiCheckbox2 || _nuclideUiCheckbox()).Checkbox, {
            checked: this.props.commitMode === (_constants2 || _constants()).CommitMode.AMEND,
            disabled: isLoading,
            label: 'Amend',
            onChange: this._onToggleAmend
          }),
          rebaseOptionElement
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiToolbarRight2 || _nuclideUiToolbarRight()).ToolbarRight,
          null,
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiButton2 || _nuclideUiButton()).Button,
            {
              size: (_nuclideUiButton2 || _nuclideUiButton()).ButtonSizes.SMALL,
              onClick: this._onClickBack },
            'Back'
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiButton2 || _nuclideUiButton()).Button,
            {
              className: btnClassname,
              size: (_nuclideUiButton2 || _nuclideUiButton()).ButtonSizes.SMALL,
              buttonType: (_nuclideUiButton2 || _nuclideUiButton()).ButtonTypes.SUCCESS,
              disabled: isLoading,
              onClick: this.__onClickCommit },
            message
          )
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-diff-mode' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'message-editor-wrapper' },
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiAtomTextEditor2 || _nuclideUiAtomTextEditor()).AtomTextEditor, {
            gutterHidden: true,
            path: '.HG_COMMIT_EDITMSG',
            readOnly: this._isLoading(),
            ref: 'message'
          })
        ),
        this._getToolbar()
      );
    }
  }, {
    key: '__onClickCommit',
    value: function __onClickCommit() {
      this.props.diffModel.commit(this.__getCommitMessage());
    }
  }, {
    key: '_onClickBack',
    value: function _onClickBack() {
      this.props.diffModel.setViewMode((_constants2 || _constants()).DiffMode.BROWSE_MODE);
    }
  }, {
    key: '__getCommitMessage',
    value: function __getCommitMessage() {
      return this.refs.message.getTextBuffer().getText();
    }
  }, {
    key: '_onToggleAmend',
    value: function _onToggleAmend(isChecked) {
      this.props.diffModel.setCommitMode(isChecked ? (_constants2 || _constants()).CommitMode.AMEND : (_constants2 || _constants()).CommitMode.COMMIT);
    }
  }, {
    key: '_onToggleAmendRebase',
    value: function _onToggleAmendRebase(isChecked) {
      this.props.diffModel.setShouldAmendRebase(isChecked);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._subscriptions.dispose();
    }
  }]);

  return DiffCommitView;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = DiffCommitView;
module.exports = exports.default;