'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('../../nuclide-ui/add-tooltip'));
}

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

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../nuclide-ui/ButtonGroup');
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

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class DiffCommitView extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.__onClickCommit = this.__onClickCommit.bind(this);
    this._onTogglePublish = this._onTogglePublish.bind(this);
    this._onToggleAmendRebase = this._onToggleAmendRebase.bind(this);
    this._onClickBack = this._onClickBack.bind(this);
    this._onTogglePrepare = this._onTogglePrepare.bind(this);
    this._onToggleVerbatim = this._onToggleVerbatim.bind(this);
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
    const { commitModeState } = this.props;
    return commitModeState !== (_constants || _load_constants()).CommitModeState.READY;
  }

  _addTooltip(title) {
    return (0, (_addTooltip || _load_addTooltip()).default)({
      title,
      delay: 200,
      placement: 'top'
    });
  }

  _getToolbar() {
    const { commitModeState, commitMode } = this.props;
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
        tabIndex: '-1',
        ref: this._addTooltip('Whether to rebase any child revisions on top of the newly amended revision.')
      });
    }

    let prepareOptionElement;
    let verbatimeOptionElement;
    if (this.props.shouldPublishOnCommit) {
      prepareOptionElement = _reactForAtom.React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        className: 'padded',
        checked: this.props.isPrepareMode,
        disabled: isLoading,
        label: 'Prepare',
        onChange: this._onTogglePrepare,
        ref: this._addTooltip('Whether to mark the new created revision as unpublished.')
      });

      verbatimeOptionElement = _reactForAtom.React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        className: 'padded',
        checked: this.props.verbatimModeEnabled,
        disabled: isLoading,
        label: 'Verbatim',
        onChange: this._onToggleVerbatim,
        ref: this._addTooltip('Whether to override the diff\'s' + 'commit message on Phabricator with that of your local commit.')
      });
    }

    return _reactForAtom.React.createElement(
      (_Toolbar || _load_Toolbar()).Toolbar,
      { location: 'bottom' },
      _reactForAtom.React.createElement(
        (_ToolbarLeft || _load_ToolbarLeft()).ToolbarLeft,
        null,
        rebaseOptionElement,
        _reactForAtom.React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
          className: 'padded',
          checked: this.props.shouldPublishOnCommit,
          disabled: isLoading,
          label: 'Publish',
          onChange: this._onTogglePublish,
          ref: this._addTooltip('Whether to automatically publish the revision' + 'to Phabricator after committing or amending it.')
        }),
        prepareOptionElement,
        verbatimeOptionElement
      ),
      _reactForAtom.React.createElement(
        (_ToolbarRight || _load_ToolbarRight()).ToolbarRight,
        null,
        _reactForAtom.React.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          { size: (_ButtonGroup || _load_ButtonGroup()).ButtonGroupSizes.SMALL },
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
              buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
              disabled: isLoading,
              onClick: this.__onClickCommit },
            message
          )
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
          grammar: atom.grammars.grammarForScopeName('source.fb-arcanist-editor'),
          gutterHidden: true,
          path: '.HG_COMMIT_EDITMSG',
          readOnly: this._isLoading(),
          ref: 'message'
        })
      ),
      this._getToolbar()
    );
  }

  __onClickCommit(bookmarkName) {
    this.props.diffModel.commit(this.__getCommitMessage(), bookmarkName);
  }

  _onClickBack() {
    this.props.diffModel.setViewMode((_constants || _load_constants()).DiffMode.BROWSE_MODE);
  }

  __getCommitMessage() {
    return this.refs.message.getTextBuffer().getText();
  }

  _onToggleAmendRebase(isChecked) {
    this.props.diffModel.setShouldAmendRebase(isChecked);
  }

  _onTogglePublish(isChecked) {
    this.props.diffModel.setShouldPublishOnCommit(isChecked);
  }

  _onTogglePrepare(isChecked) {
    this.props.diffModel.setIsPrepareMode(isChecked);
  }

  _onToggleVerbatim(isChecked) {
    this.props.diffModel.setVerbatimModeEnabled(isChecked);
  }

  componentWillUnmount() {
    this._subscriptions.dispose();
  }
}
exports.default = DiffCommitView;
module.exports = exports['default'];