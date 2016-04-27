Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = UncommittedChangesTimelineNode;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _reactForAtom = require('react-for-atom');

function UncommittedChangesTimelineNode(props) {
  var hasChanges = props.dirtyFileCount > 0;
  var bubbleClassName = (0, _classnames2['default'])('revision-bubble revision-bubble--uncommitted', {
    'revision-bubble--no-changes': !hasChanges
  });
  var filesMsg = hasChanges ? '(files with changes: ' + props.dirtyFileCount + ')' : '(no changes)';

  return _reactForAtom.React.createElement(
    'div',
    { className: 'revision selected-revision-inrange selected-revision-start' },
    _reactForAtom.React.createElement('div', { className: bubbleClassName }),
    _reactForAtom.React.createElement(
      'div',
      { className: 'revision-label revision-label--uncommitted' },
      'Uncommitted ',
      filesMsg
    )
  );
}

module.exports = exports['default'];