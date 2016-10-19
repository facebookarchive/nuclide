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

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _nuclideUiButton;

function _load_nuclideUiButton() {
  return _nuclideUiButton = require('../../nuclide-ui/Button');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var UncommittedChangesTimelineNode = (function (_React$Component) {
  _inherits(UncommittedChangesTimelineNode, _React$Component);

  function UncommittedChangesTimelineNode(props) {
    _classCallCheck(this, UncommittedChangesTimelineNode);

    _get(Object.getPrototypeOf(UncommittedChangesTimelineNode.prototype), 'constructor', this).call(this, props);
    this._handleClickCommit = this._handleClickCommit.bind(this);
    this._handleClickAmend = this._handleClickAmend.bind(this);
  }

  _createClass(UncommittedChangesTimelineNode, [{
    key: 'render',
    value: function render() {
      var dirtyFileCount = this.props.dirtyFileCount;

      var hasChanges = dirtyFileCount > 0;
      var bubbleClassName = (0, (_classnames || _load_classnames()).default)('revision-bubble revision-bubble--uncommitted', {
        'revision-bubble--no-changes': !hasChanges
      });
      var filesMessage = undefined;
      if (hasChanges) {
        filesMessage = dirtyFileCount + ' Uncommitted Change' + (dirtyFileCount > 1 ? 's' : '');
      } else {
        filesMessage = 'No Uncommitted Changes';
      }
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'revision selected-revision-inrange selected-revision-start' },
        (_reactForAtom || _load_reactForAtom()).React.createElement('div', { className: bubbleClassName }),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'revision-label revision-label--uncommitted' },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'span',
            { className: 'revision-title text-monospace' },
            filesMessage
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            (_nuclideUiButton || _load_nuclideUiButton()).Button,
            {
              className: 'nuclide-diff-rev-side-button',
              size: (_nuclideUiButton || _load_nuclideUiButton()).ButtonSizes.SMALL,
              disabled: !hasChanges,
              onClick: this._handleClickCommit },
            'Commit'
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            (_nuclideUiButton || _load_nuclideUiButton()).Button,
            {
              className: 'nuclide-diff-rev-side-button',
              size: (_nuclideUiButton || _load_nuclideUiButton()).ButtonSizes.SMALL,
              onClick: this._handleClickAmend },
            'Amend'
          )
        )
      );
    }
  }, {
    key: '_handleClickCommit',
    value: function _handleClickCommit() {
      var diffModel = this.props.diffModel;

      diffModel.setCommitMode((_constants || _load_constants()).CommitMode.COMMIT);
      diffModel.setViewMode((_constants || _load_constants()).DiffMode.COMMIT_MODE);
    }
  }, {
    key: '_handleClickAmend',
    value: function _handleClickAmend() {
      var diffModel = this.props.diffModel;

      diffModel.setCommitMode((_constants || _load_constants()).CommitMode.AMEND);
      diffModel.setViewMode((_constants || _load_constants()).DiffMode.COMMIT_MODE);
    }
  }]);

  return UncommittedChangesTimelineNode;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.default = UncommittedChangesTimelineNode;
module.exports = exports.default;