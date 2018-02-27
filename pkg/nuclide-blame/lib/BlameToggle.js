/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import * as React from 'react';
import ReactDOM from 'react-dom';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import passesGK from '../../commons-node/passesGK';

const GATEKEEPER_NAME = 'nuclide_blame_toggle_button';

/**
 * Shows a 'toggle blame' button to the bottom right of an editor, if the
 * contents of the editor support it.
 */
export default class BlameToggle {
  _container: HTMLDivElement;

  /**
   * @param editor The atom TextEditor object.
   * @param canBlame A function returning a boolean value indicating whether
   *  the editor can show blame for its contents.
   */
  constructor(editor: atom$TextEditor, canBlame: atom$TextEditor => boolean) {
    this._container = document.createElement('div');

    editor.getElement().appendChild(this._container);
    ReactDOM.render(
      <BlameToggleContainer editor={editor} canBlame={canBlame} />,
      this._container,
    );
  }

  /**
   * Cleans up and removes the toggle button.
   */
  destroy(): void {
    ReactDOM.unmountComponentAtNode(this._container);
  }
}

type ContainerState = {
  visible: boolean,
};

type ContainerProps = {
  editor: atom$TextEditor,
  canBlame: atom$TextEditor => boolean,
};

/**
 * Wraps event-handling, subscription and visibility logic for a blame toggle
 * button.
 */
class BlameToggleContainer extends React.Component<
  ContainerProps,
  ContainerState,
> {
  _subscriptions: UniversalDisposable;

  constructor(props) {
    super(props);

    this.state = {visible: false};
    this._setVisible();
  }

  componentDidMount() {
    this._subscriptions = new UniversalDisposable();
    this._subscriptions.add(
      // update visibility on editor changed (may now be modified, non-blamable)
      this.props.editor.onDidStopChanging(this._setVisible.bind(this)),
      // update visibility on editor saved (may no longer be modiified)
      this.props.editor.onDidSave(this._setVisible.bind(this)),
      // update visibility on initial package load, this might have been
      // created before a BlameProvider was available.
      atom.packages.onDidActivateInitialPackages(this._setVisible.bind(this)),
    );
  }

  componentWillUnmount() {
    this._subscriptions.dispose();
  }

  render(): React.Node {
    return <div>{this.state.visible && <BlameToggleComponent />}</div>;
  }

  _setVisible() {
    passesGK(GATEKEEPER_NAME).then(passed => {
      // The blame toggle button is visible if:
      //  - the use is in the Gatekeeper
      //  - the editor is not modiified
      //  - the editor is blamable (there is a blame provider for it)
      this.setState({
        visible:
          passed &&
          !this.props.editor.isModified() &&
          this.props.canBlame(this.props.editor),
      });
    });
  }
}

type ComponentProps = {};

/**
 * Renders a 'toggle blame' button in an editor.
 */
class BlameToggleComponent extends React.Component<ComponentProps> {
  _onClick(): void {
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-blame:toggle-blame',
    );
  }

  render(): React.Node {
    return (
      <div className={'nuclide-blame-button'} onClick={this._onClick}>
        toggle blame
      </div>
    );
  }
}
