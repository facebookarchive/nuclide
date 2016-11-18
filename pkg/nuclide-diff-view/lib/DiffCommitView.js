'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('../../nuclide-ui/AtomTextEditor');
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('../../nuclide-ui/Checkbox');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _Toolbar;

function _load_Toolbar() {
  return _Toolbar = require('../../nuclide-ui/Toolbar');
}

var _ToolbarLeft;

function _load_ToolbarLeft() {
  return _ToolbarLeft = require('../../nuclide-ui/ToolbarLeft');
}

var _ToolbarRight;

function _load_ToolbarRight() {
  return _ToolbarRight = require('../../nuclide-ui/ToolbarRight');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let DiffCommitView = class DiffCommitView extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.__onClickCommit = this.__onClickCommit.bind(this);
    this._onToggleAmend = this._onToggleAmend.bind(this);
    this._onToggleAmendRebase = this._onToggleAmendRebase.bind(this);
    this._onClickBack = this._onClickBack.bind(this);
  }

  componentDidMount() {
    this.__populateCommitMessage();

    // Shortcut to commit when on form
    this._subscriptions = new _atom.CompositeDisposable(atom.commands.add('.commit-form-wrapper', 'nuclide-diff-view:commit-message', event => this.__onClickCommit()));
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.commitMessage !== prevProps.commitMessage) {
      this.__populateCommitMessage();
    }
  }

  __populateCommitMessage() {
    this.refs.message.getTextBuffer().setText(this.props.commitMessage || '');
  }

  _isLoading() {
    const commitModeState = this.props.commitModeState;

    return commitModeState !== (_constants || _load_constants()).CommitModeState.READY;
  }

  _getToolbar() {
    var _props = this.props;
    const commitModeState = _props.commitModeState,
          commitMode = _props.commitMode;

    let message;
    switch (commitModeState) {
      case (_constants || _load_constants()).CommitModeState.AWAITING_COMMIT:
        if (commitMode === (_constants || _load_constants()).CommitMode.AMEND) {
          message = 'Amending...';
        } else {
          message = 'Committing...';
        }
        break;
      case (_constants || _load_constants()).CommitModeState.LOADING_COMMIT_MESSAGE:
        message = 'Loading...';
        break;
      case (_constants || _load_constants()).CommitModeState.READY:
        if (commitMode === (_constants || _load_constants()).CommitMode.AMEND) {
          message = 'Amend';
        } else {
          message = 'Commit';
        }
        break;
      default:
        message = 'Unknown Commit State!';
        break;
    }

    const isLoading = this._isLoading();
    const btnClassname = (0, (_classnames || _load_classnames()).default)('pull-right', {
      'btn-progress': isLoading
    });

    let rebaseOptionElement = null;
    if (this.props.commitMode === (_constants || _load_constants()).CommitMode.AMEND) {
      rebaseOptionElement = _reactForAtom.React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        className: 'padded',
        checked: this.props.shouldRebaseOnAmend,
        disabled: isLoading,
        label: 'Rebase stacked commits',
        onChange: this._onToggleAmendRebase,
        tabIndex: '-1'
      });
    }

    return _reactForAtom.React.createElement(
      (_Toolbar || _load_Toolbar()).Toolbar,
      { location: 'bottom' },
      _reactForAtom.React.createElement(
        (_ToolbarLeft || _load_ToolbarLeft()).ToolbarLeft,
        null,
        _reactForAtom.React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
          checked: this.props.commitMode === (_constants || _load_constants()).CommitMode.AMEND,
          disabled: isLoading,
          label: 'Amend',
          onChange: this._onToggleAmend
        }),
        rebaseOptionElement
      ),
      _reactForAtom.React.createElement(
        (_ToolbarRight || _load_ToolbarRight()).ToolbarRight,
        null,
        _reactForAtom.React.createElement(
          (_Button || _load_Button()).Button,
          {
            size: (_Button || _load_Button()).ButtonSizes.SMALL,
            onClick: this._onClickBack },
          'Back'
        ),
        _reactForAtom.React.createElement(
          (_Button || _load_Button()).Button,
          {
            className: btnClassname,
            size: (_Button || _load_Button()).ButtonSizes.SMALL,
            buttonType: (_Button || _load_Button()).ButtonTypes.SUCCESS,
            disabled: isLoading,
            onClick: this.__onClickCommit },
          message
        )
      )
    );
  }

  render() {
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-diff-mode' },
      _reactForAtom.React.createElement(
        'div',
        { className: 'message-editor-wrapper' },
        _reactForAtom.React.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
          gutterHidden: true,
          path: '.HG_COMMIT_EDITMSG',
          readOnly: this._isLoading(),
          ref: 'message'
        })
      ),
      this._getToolbar()
    );
  }

  __onClickCommit() {
    this.props.diffModel.commit(this.__getCommitMessage());
  }

  _onClickBack() {
    this.props.diffModel.setViewMode((_constants || _load_constants()).DiffMode.BROWSE_MODE);
  }

  __getCommitMessage() {
    return this.refs.message.getTextBuffer().getText();
  }

  _onToggleAmend(isChecked) {
    this.props.diffModel.setCommitMode(isChecked ? (_constants || _load_constants()).CommitMode.AMEND : (_constants || _load_constants()).CommitMode.COMMIT);
  }

  _onToggleAmendRebase(isChecked) {
    this.props.diffModel.setShouldAmendRebase(isChecked);
  }

  componentWillUnmount() {
    this._subscriptions.dispose();
  }
};
exports.default = DiffCommitView;
module.exports = exports['default'];