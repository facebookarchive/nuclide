"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _passesGK() {
  const data = _interopRequireDefault(require("../../commons-node/passesGK"));

  _passesGK = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const GATEKEEPER_NAME = 'nuclide_blame_toggle_button';
/**
 * Shows a 'toggle blame' button to the bottom right of an editor, if the
 * contents of the editor support it.
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

    _reactDom.default.render(React.createElement(BlameToggleContainer, {
      editor: editor,
      canBlame: canBlame
    }), this._container);
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
class BlameToggleContainer extends React.Component {
  constructor(props) {
    super(props);

    this._setVisible = () => {
      this._subscriptions.add(_RxMin.Observable.fromPromise((0, _passesGK().default)(GATEKEEPER_NAME)).subscribe(passed => {
        // The blame toggle button is visible if:
        //  - the use is in the Gatekeeper
        //  - the editor is not modiified
        //  - the editor is blamable (there is a blame provider for it)
        this.setState({
          visible: passed && !this.props.editor.isModified() && this.props.canBlame(this.props.editor)
        });
      }));
    };

    this.state = {
      visible: false
    };
    this._subscriptions = new (_UniversalDisposable().default)();
  }

  componentDidMount() {
    this._setVisible();

    this._subscriptions.add( // update visibility on editor changed (may now be modified, non-blamable)
    this.props.editor.onDidStopChanging(this._setVisible), // update visibility on editor saved (may no longer be modiified)
    this.props.editor.onDidSave(this._setVisible), // update visibility on initial package load, this might have been
    // created before a BlameProvider was available.
    atom.packages.onDidActivateInitialPackages(this._setVisible));
  }

  componentWillUnmount() {
    this._subscriptions.dispose();
  }

  render() {
    return React.createElement("div", null, this.state.visible && React.createElement(BlameToggleComponent, null));
  }

}

/**
 * Renders a 'toggle blame' button in an editor.
 */
class BlameToggleComponent extends React.Component {
  _onClick() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-blame:toggle-blame');
  }

  render() {
    return React.createElement("div", {
      className: 'nuclide-blame-button',
      onClick: this._onClick
    }, "toggle blame");
  }

}