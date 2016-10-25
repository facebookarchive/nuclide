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

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom = require('react-for-atom');

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let UncommittedChangesTimelineNode = class UncommittedChangesTimelineNode extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleClickCommit = this._handleClickCommit.bind(this);
    this._handleClickAmend = this._handleClickAmend.bind(this);
  }

  render() {
    const dirtyFileCount = this.props.dirtyFileCount;

    const hasChanges = dirtyFileCount > 0;
    const bubbleClassName = (0, (_classnames || _load_classnames()).default)('revision-bubble revision-bubble--uncommitted', {
      'revision-bubble--no-changes': !hasChanges
    });
    let filesMessage;
    if (hasChanges) {
      filesMessage = `${ dirtyFileCount } Uncommitted Change${ dirtyFileCount > 1 ? 's' : '' }`;
    } else {
      filesMessage = 'No Uncommitted Changes';
    }
    return _reactForAtom.React.createElement(
      'div',
      { className: 'revision selected-revision-inrange selected-revision-start' },
      _reactForAtom.React.createElement('div', { className: bubbleClassName }),
      _reactForAtom.React.createElement(
        'div',
        { className: 'revision-label revision-label--uncommitted' },
        _reactForAtom.React.createElement(
          'span',
          { className: 'revision-title text-monospace' },
          filesMessage
        ),
        _reactForAtom.React.createElement(
          (_Button || _load_Button()).Button,
          {
            className: 'nuclide-diff-rev-side-button',
            size: (_Button || _load_Button()).ButtonSizes.SMALL,
            disabled: !hasChanges,
            onClick: this._handleClickCommit },
          'Commit'
        ),
        _reactForAtom.React.createElement(
          (_Button || _load_Button()).Button,
          {
            className: 'nuclide-diff-rev-side-button',
            size: (_Button || _load_Button()).ButtonSizes.SMALL,
            onClick: this._handleClickAmend },
          'Amend'
        )
      )
    );
  }

  _handleClickCommit() {
    const diffModel = this.props.diffModel;

    diffModel.setCommitMode((_constants || _load_constants()).CommitMode.COMMIT);
    diffModel.setViewMode((_constants || _load_constants()).DiffMode.COMMIT_MODE);
  }

  _handleClickAmend() {
    const diffModel = this.props.diffModel;

    diffModel.setCommitMode((_constants || _load_constants()).CommitMode.AMEND);
    diffModel.setViewMode((_constants || _load_constants()).DiffMode.COMMIT_MODE);
  }
};
exports.default = UncommittedChangesTimelineNode;
module.exports = exports['default'];