'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const GATEKEEPER_NAME = 'nuclide_blame_toggle_button';

/**
 * Shows a 'toggle blame' button to the bottom right of an editor, if the
 * contents of the editor support it.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class BlameToggle {

  /**
   * @param editor The atom TextEditor object.
   * @param canBlame A function returning a boolean value indicating whether
   *  the editor can show blame for its contents.
   */
  constructor(editor, canBlame) {
    this._container = document.createElement('div');

    editor.getElement().appendChild(this._container);
    _reactDom.default.render(_react.createElement(BlameToggleContainer, { editor: editor, canBlame: canBlame }), this._container);
  }

  /**
   * Cleans up and removes the toggle button.
   */
  destroy() {
    _reactDom.default.unmountComponentAtNode(this._container);
  }
}

exports.default = BlameToggle;


/**
 * Wraps event-handling, subscription and visibility logic for a blame toggle
 * button.
 */
class BlameToggleContainer extends _react.Component {

  constructor(props) {
    super(props);

    this._setVisible = () => {
      this._subscriptions.add(_rxjsBundlesRxMinJs.Observable.fromPromise((0, (_passesGK || _load_passesGK()).default)(GATEKEEPER_NAME)).subscribe(passed => {
        // The blame toggle button is visible if:
        //  - the use is in the Gatekeeper
        //  - the editor is not modiified
        //  - the editor is blamable (there is a blame provider for it)
        this.setState({
          visible: passed && !this.props.editor.isModified() && this.props.canBlame(this.props.editor)
        });
      }));
    };

    this.state = { visible: false };
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  componentDidMount() {
    this._setVisible();
    this._subscriptions.add(
    // update visibility on editor changed (may now be modified, non-blamable)
    this.props.editor.onDidStopChanging(this._setVisible),
    // update visibility on editor saved (may no longer be modiified)
    this.props.editor.onDidSave(this._setVisible),
    // update visibility on initial package load, this might have been
    // created before a BlameProvider was available.
    atom.packages.onDidActivateInitialPackages(this._setVisible));
  }

  componentWillUnmount() {
    this._subscriptions.dispose();
  }

  render() {
    return _react.createElement(
      'div',
      null,
      this.state.visible && _react.createElement(BlameToggleComponent, null)
    );
  }

}

/**
 * Renders a 'toggle blame' button in an editor.
 */
class BlameToggleComponent extends _react.Component {
  _onClick() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-blame:toggle-blame');
  }

  render() {
    return _react.createElement(
      'div',
      { className: 'nuclide-blame-button', onClick: this._onClick },
      'toggle blame'
    );
  }
}