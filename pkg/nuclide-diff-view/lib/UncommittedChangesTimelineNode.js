'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireDefault(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class UncommittedChangesTimelineNode extends _react.default.Component {

  constructor(props) {
    super(props);
    this._handleClickCommit = this._handleClickCommit.bind(this);
    this._handleClickAmend = this._handleClickAmend.bind(this);
  }

  render() {
    const { dirtyFileCount, selectedIndex, revisionsCount } = this.props;
    const hasChanges = dirtyFileCount > 0;
    let filesMessage;
    if (hasChanges) {
      filesMessage = `${dirtyFileCount} Uncommitted Change${dirtyFileCount > 1 ? 's' : ''}`;
    } else {
      filesMessage = 'No Uncommitted Changes';
    }

    const revisionClassName = (0, (_classnames || _load_classnames()).default)('revision selected-revision-start', {
      'selected-revision-inrange': selectedIndex !== 0,
      'selected-revision-last': revisionsCount === 1
    });

    return _react.default.createElement(
      'div',
      {
        className: revisionClassName,
        onClick: () => {
          this.props.onSelectionChange();
        } },
      _react.default.createElement('div', { className: 'revision-bubble revision-bubble--uncommitted' }),
      _react.default.createElement(
        'div',
        { className: 'revision-label' },
        _react.default.createElement(
          'span',
          { className: 'revision-title text-monospace' },
          filesMessage
        ),
        _react.default.createElement(
          (_Button || _load_Button()).Button,
          {
            className: 'nuclide-diff-rev-side-button',
            size: (_Button || _load_Button()).ButtonSizes.SMALL,
            disabled: !hasChanges,
            onClick: this._handleClickCommit },
          'Commit'
        ),
        _react.default.createElement(
          (_Button || _load_Button()).Button,
          {
            className: 'nuclide-diff-rev-side-button',
            size: (_Button || _load_Button()).ButtonSizes.SMALL,
            disabled: revisionsCount === 1,
            onClick: this._handleClickAmend },
          'Amend'
        )
      )
    );
  }

  _handleClickCommit(event) {
    const { diffModel } = this.props;
    diffModel.setCommitMode((_constants || _load_constants()).CommitMode.COMMIT);
    diffModel.setViewMode((_constants || _load_constants()).DiffMode.COMMIT_MODE);
    event.stopPropagation();
  }

  _handleClickAmend(event) {
    const { diffModel } = this.props;
    diffModel.setCommitMode((_constants || _load_constants()).CommitMode.AMEND);
    diffModel.setViewMode((_constants || _load_constants()).DiffMode.COMMIT_MODE);
    event.stopPropagation();
  }
}
exports.default = UncommittedChangesTimelineNode; /**
                                                   * Copyright (c) 2015-present, Facebook, Inc.
                                                   * All rights reserved.
                                                   *
                                                   * This source code is licensed under the license found in the LICENSE file in
                                                   * the root directory of this source tree.
                                                   *
                                                   * 
                                                   */