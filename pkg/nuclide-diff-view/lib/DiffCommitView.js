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

var _nuclideUiAtomTextEditor;

function _load_nuclideUiAtomTextEditor() {
  return _nuclideUiAtomTextEditor = require('../../nuclide-ui/AtomTextEditor');
}

var _nuclideUiCheckbox;

function _load_nuclideUiCheckbox() {
  return _nuclideUiCheckbox = require('../../nuclide-ui/Checkbox');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _nuclideUiButton;

function _load_nuclideUiButton() {
  return _nuclideUiButton = require('../../nuclide-ui/Button');
}

var _nuclideUiToolbar;

function _load_nuclideUiToolbar() {
  return _nuclideUiToolbar = require('../../nuclide-ui/Toolbar');
}

var _nuclideUiToolbarLeft;

function _load_nuclideUiToolbarLeft() {
  return _nuclideUiToolbarLeft = require('../../nuclide-ui/ToolbarLeft');
}

var _nuclideUiToolbarRight;

function _load_nuclideUiToolbarRight() {
  return _nuclideUiToolbarRight = require('../../nuclide-ui/ToolbarRight');
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
      this._subscriptions = new (_atom || _load_atom()).CompositeDisposable(atom.commands.add('.commit-form-wrapper', 'nuclide-diff-view:commit-message', function (event) {
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

      return commitModeState !== (_constants || _load_constants()).CommitModeState.READY;
    }
  }, {
    key: '_getToolbar',
    value: function _getToolbar() {
      var commitModeState = this.props.commitModeState;

      var message = undefined;
      switch (commitModeState) {
        case (_constants || _load_constants()).CommitModeState.AWAITING_COMMIT:
          message = 'Committing...';
          break;
        case (_constants || _load_constants()).CommitModeState.LOADING_COMMIT_MESSAGE:
          message = 'Loading...';
          break;
        case (_constants || _load_constants()).CommitModeState.READY:
          message = 'Commit';
          break;
        default:
          message = 'Unknown Commit State!';
          break;
      }

      var isLoading = this._isLoading();
      var btnClassname = (0, (_classnames || _load_classnames()).default)('pull-right', {
        'btn-progress': isLoading
      });

      var rebaseOptionElement = null;
      if (this.props.commitMode === (_constants || _load_constants()).CommitMode.AMEND) {
        rebaseOptionElement = (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiCheckbox || _load_nuclideUiCheckbox()).Checkbox, {
          className: 'padded',
          checked: this.props.shouldRebaseOnAmend,
          disabled: isLoading,
          label: 'Rebase stacked commits',
          onChange: this._onToggleAmendRebase,
          tabIndex: '-1'
        });
      }

      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_nuclideUiToolbar || _load_nuclideUiToolbar()).Toolbar,
        { location: 'bottom' },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_nuclideUiToolbarLeft || _load_nuclideUiToolbarLeft()).ToolbarLeft,
          null,
          (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiCheckbox || _load_nuclideUiCheckbox()).Checkbox, {
            checked: this.props.commitMode === (_constants || _load_constants()).CommitMode.AMEND,
            disabled: isLoading,
            label: 'Amend',
            onChange: this._onToggleAmend
          }),
          rebaseOptionElement
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_nuclideUiToolbarRight || _load_nuclideUiToolbarRight()).ToolbarRight,
          null,
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            (_nuclideUiButton || _load_nuclideUiButton()).Button,
            {
              size: (_nuclideUiButton || _load_nuclideUiButton()).ButtonSizes.SMALL,
              onClick: this._onClickBack },
            'Back'
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            (_nuclideUiButton || _load_nuclideUiButton()).Button,
            {
              className: btnClassname,
              size: (_nuclideUiButton || _load_nuclideUiButton()).ButtonSizes.SMALL,
              buttonType: (_nuclideUiButton || _load_nuclideUiButton()).ButtonTypes.SUCCESS,
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
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-diff-mode' },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'message-editor-wrapper' },
          (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiAtomTextEditor || _load_nuclideUiAtomTextEditor()).AtomTextEditor, {
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
      this.props.diffModel.setViewMode((_constants || _load_constants()).DiffMode.BROWSE_MODE);
    }
  }, {
    key: '__getCommitMessage',
    value: function __getCommitMessage() {
      return this.refs.message.getTextBuffer().getText();
    }
  }, {
    key: '_onToggleAmend',
    value: function _onToggleAmend(isChecked) {
      this.props.diffModel.setCommitMode(isChecked ? (_constants || _load_constants()).CommitMode.AMEND : (_constants || _load_constants()).CommitMode.COMMIT);
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
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.default = DiffCommitView;
module.exports = exports.default;