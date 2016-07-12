var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideUiLibAtomTextEditor2;

function _nuclideUiLibAtomTextEditor() {
  return _nuclideUiLibAtomTextEditor2 = require('../../nuclide-ui/lib/AtomTextEditor');
}

var _nuclideUiLibCheckbox2;

function _nuclideUiLibCheckbox() {
  return _nuclideUiLibCheckbox2 = require('../../nuclide-ui/lib/Checkbox');
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../nuclide-ui/lib/Button');
}

var _nuclideUiLibToolbar2;

function _nuclideUiLibToolbar() {
  return _nuclideUiLibToolbar2 = require('../../nuclide-ui/lib/Toolbar');
}

var _nuclideUiLibToolbarLeft2;

function _nuclideUiLibToolbarLeft() {
  return _nuclideUiLibToolbarLeft2 = require('../../nuclide-ui/lib/ToolbarLeft');
}

var _nuclideUiLibToolbarRight2;

function _nuclideUiLibToolbarRight() {
  return _nuclideUiLibToolbarRight2 = require('../../nuclide-ui/lib/ToolbarRight');
}

var DiffCommitView = (function (_React$Component) {
  _inherits(DiffCommitView, _React$Component);

  function DiffCommitView(props) {
    _classCallCheck(this, DiffCommitView);

    _get(Object.getPrototypeOf(DiffCommitView.prototype), 'constructor', this).call(this, props);
    this._onClickCommit = this._onClickCommit.bind(this);
    this._onToggleAmend = this._onToggleAmend.bind(this);
    this._onClickBack = this._onClickBack.bind(this);
  }

  _createClass(DiffCommitView, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._setCommitMessage();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (this.props.commitMessage !== prevProps.commitMessage) {
        this._setCommitMessage();
      }
    }
  }, {
    key: '_setCommitMessage',
    value: function _setCommitMessage() {
      this.refs.message.getTextBuffer().setText(this.props.commitMessage || '');
    }
  }, {
    key: 'render',
    value: function render() {
      var commitModeState = this.props.commitModeState;

      var isLoading = commitModeState !== (_constants2 || _constants()).CommitModeState.READY;

      var message = undefined;
      if (isLoading) {
        switch (commitModeState) {
          case (_constants2 || _constants()).CommitModeState.AWAITING_COMMIT:
            message = 'Committing...';
            break;
          case (_constants2 || _constants()).CommitModeState.LOADING_COMMIT_MESSAGE:
            message = 'Loading...';
            break;
          default:
            message = 'Unknown Commit State!';
            break;
        }
      } else {
        message = 'Commit';
      }

      var btnClassname = (0, (_classnames2 || _classnames()).default)('pull-right', {
        'btn-progress': isLoading
      });
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-diff-mode' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'message-editor-wrapper' },
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomTextEditor2 || _nuclideUiLibAtomTextEditor()).AtomTextEditor, {
            gutterHidden: true,
            path: '.HG_COMMIT_EDITMSG',
            readOnly: isLoading,
            ref: 'message'
          })
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiLibToolbar2 || _nuclideUiLibToolbar()).Toolbar,
          { location: 'bottom' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiLibToolbarLeft2 || _nuclideUiLibToolbarLeft()).ToolbarLeft,
            null,
            (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibCheckbox2 || _nuclideUiLibCheckbox()).Checkbox, {
              checked: this.props.commitMode === (_constants2 || _constants()).CommitMode.AMEND,
              disabled: isLoading,
              label: 'Amend',
              onChange: this._onToggleAmend
            })
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiLibToolbarRight2 || _nuclideUiLibToolbarRight()).ToolbarRight,
            null,
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
              {
                size: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonSizes.SMALL,
                onClick: this._onClickBack },
              'Back'
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
              {
                className: btnClassname,
                size: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonSizes.SMALL,
                buttonType: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonTypes.SUCCESS,
                disabled: isLoading,
                onClick: this._onClickCommit },
              message
            )
          )
        )
      );
    }
  }, {
    key: '_onClickCommit',
    value: function _onClickCommit() {
      this.props.diffModel.commit(this._getCommitMessage());
    }
  }, {
    key: '_onClickBack',
    value: function _onClickBack() {
      this.props.diffModel.setViewMode((_constants2 || _constants()).DiffMode.BROWSE_MODE);
    }
  }, {
    key: '_getCommitMessage',
    value: function _getCommitMessage() {
      return this.refs.message.getTextBuffer().getText();
    }
  }, {
    key: '_onToggleAmend',
    value: function _onToggleAmend(isChecked) {
      this.props.diffModel.setCommitMode(isChecked ? (_constants2 || _constants()).CommitMode.AMEND : (_constants2 || _constants()).CommitMode.COMMIT);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      // Save the latest edited commit message for layout switches.
      var message = this._getCommitMessage();
      var diffModel = this.props.diffModel;

      // Let the component unmount before propagating the final message change to the model,
      // So the subsequent change event avoids re-rendering this component.
      process.nextTick(function () {
        diffModel.setCommitMessage(message);
      });
    }
  }]);

  return DiffCommitView;
})((_reactForAtom2 || _reactForAtom()).React.Component);

module.exports = DiffCommitView;