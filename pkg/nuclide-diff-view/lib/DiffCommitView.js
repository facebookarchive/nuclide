'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('../../nuclide-ui/add-tooltip'));
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../nuclide-ui/AtomInput');
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

var _react = _interopRequireDefault(require('react'));

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

class DiffCommitView extends _react.default.Component {

  constructor(props) {
    super(props);
    this.__onClickCommit = this.__onClickCommit.bind(this);
    this._onTogglePublish = this._onTogglePublish.bind(this);
    this._onToggleAmendRebase = this._onToggleAmendRebase.bind(this);
    this._onClickBack = this._onClickBack.bind(this);
    this._onTogglePrepare = this._onTogglePrepare.bind(this);
    this._onToggleVerbatim = this._onToggleVerbatim.bind(this);
    this._onLintExcuseChange = this._onLintExcuseChange.bind(this);
    this._onToggleInteractiveCommit = this._onToggleInteractiveCommit.bind(this);
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
      rebaseOptionElement = _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        className: 'padded',
        checked: this.props.shouldRebaseOnAmend,
        disabled: isLoading,
        label: 'Rebase stacked commits',
        onChange: this._onToggleAmendRebase,
        tabIndex: '-1',
        ref: this._addTooltip('Whether to rebase any child revisions on top of the newly amended revision.')
      });
    }

    let interactiveOptionElement;
    if (this.props.hasUncommittedChanges && this.props.enabledFeatures.has((_constants || _load_constants()).DiffViewFeatures.INTERACTIVE)) {
      interactiveOptionElement = _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        className: 'padded',
        checked: this.props.shouldCommitInteractively,
        disabled: isLoading,
        label: 'Use interactive mode',
        onChange: this._onToggleInteractiveCommit,
        tabIndex: '-1',
        ref: this._addTooltip('Whether to include all uncommitted changes or to select specific ones')
      });
    }

    let prepareOptionElement;
    let verbatimeOptionElement;
    let lintExcuseElement;
    if (this.props.shouldPublishOnCommit) {
      prepareOptionElement = _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        className: 'padded',
        checked: this.props.isPrepareMode,
        disabled: isLoading,
        label: 'Prepare',
        onChange: this._onTogglePrepare,
        ref: this._addTooltip('Whether to mark the new created revision as unpublished.')
      });

      verbatimeOptionElement = _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        className: 'padded',
        checked: this.props.verbatimModeEnabled,
        disabled: isLoading,
        label: 'Verbatim',
        onChange: this._onToggleVerbatim,
        ref: this._addTooltip('Whether to override the diff\'s ' + 'commit message on Phabricator with that of your local commit.')
      });

      lintExcuseElement = _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        className: 'nuclide-diff-view-excuse',
        size: 'sm',
        ref: this._addTooltip('Leave this box empty to run local lint and unit tests or ' + 'enter an excuse to skip them.'),
        onDidChange: this._onLintExcuseChange,
        placeholderText: '(Optional) Excuse',
        disabled: isLoading,
        value: this.props.lintExcuse,
        width: 200
      });
    }

    return _react.default.createElement(
      (_Toolbar || _load_Toolbar()).Toolbar,
      { location: 'bottom' },
      _react.default.createElement(
        (_ToolbarLeft || _load_ToolbarLeft()).ToolbarLeft,
        null,
        rebaseOptionElement,
        interactiveOptionElement,
        _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
          className: 'padded',
          checked: this.props.shouldPublishOnCommit,
          disabled: isLoading,
          label: 'Publish',
          onChange: this._onTogglePublish,
          ref: this._addTooltip('Whether to automatically publish the revision ' + 'to Phabricator after committing or amending it.')
        }),
        prepareOptionElement,
        verbatimeOptionElement,
        lintExcuseElement
      ),
      _react.default.createElement(
        (_ToolbarRight || _load_ToolbarRight()).ToolbarRight,
        null,
        _react.default.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          { size: (_ButtonGroup || _load_ButtonGroup()).ButtonGroupSizes.SMALL },
          _react.default.createElement(
            (_Button || _load_Button()).Button,
            {
              size: (_Button || _load_Button()).ButtonSizes.SMALL,
              onClick: this._onClickBack },
            'Back'
          ),
          _react.default.createElement(
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
    return _react.default.createElement(
      'div',
      { className: 'nuclide-diff-mode' },
      _react.default.createElement(
        'div',
        { className: 'message-editor-wrapper' },
        _react.default.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
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

  _onToggleInteractiveCommit(isChecked) {
    this.props.diffModel.setShouldCommitInteractively(isChecked);
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

  _onLintExcuseChange(newExcuse) {
    this.props.diffModel.setLintExcuse(newExcuse);
  }

  componentWillUnmount() {
    this._subscriptions.dispose();
  }
}
exports.default = DiffCommitView; /**
                                   * Copyright (c) 2015-present, Facebook, Inc.
                                   * All rights reserved.
                                   *
                                   * This source code is licensed under the license found in the LICENSE file in
                                   * the root directory of this source tree.
                                   *
                                   * 
                                   */