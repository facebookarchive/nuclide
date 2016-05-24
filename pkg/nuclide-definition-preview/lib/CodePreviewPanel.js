'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {CodePreviewContent} from './CodePreviewContent';
import type {PreviewContent} from './CodePreviewView';

import {React, ReactDOM} from 'react-for-atom';
import {Observable} from 'rxjs';
import {CodePreviewView} from './CodePreviewView';
import {PanelComponent} from '../../nuclide-ui/lib/PanelComponent';
import {PanelComponentScroller} from '../../nuclide-ui/lib/PanelComponentScroller';
import invariant from 'assert';

export class CodePreviewPanel {
  _panelDOMElement: HTMLElement;
  _panel: atom$Panel;
  _width: number;

  constructor(initialWidth: number, data: Observable<?CodePreviewContent>) {
    this._panelDOMElement = document.createElement('div');
    // Otherwise it does not fill the whole panel, which might be alright except it means that the
    // resize-handle doesn't extend all the way to the bottom.
    //
    // Use 'flex' to fit Atom v1.6.0+ and `height: inherit` to fit Atom <v1.6.0. The latter uses
    // `height: 100%;` down the hierarchy and becomes innocuous in 1.6.0 because inheriting will
    // give `height: auto;`.
    this._panelDOMElement.style.display = 'flex';
    this._panelDOMElement.style.height = 'inherit';
    this._width = initialWidth;

    const onResize = newWidth => { this._width = newWidth; };

    const symbolNames = data.filter(value => value != null)
      .map(value => {
        invariant(value != null);
        return value.symbolName;
      });
    const content: Observable<?PreviewContent> = data.map(value => {
      if (value == null) {
        return null;
      }
      return {
        location: value.definition,
        grammar: value.grammar,
      };
    });
    ReactDOM.render(
      <PanelComponent
        dock="right"
        initialLength={initialWidth}
        noScroll
        onResize={onResize}>
        <div className="nuclide-definition-preview-panel">
          <Header data={symbolNames} />
          <PanelComponentScroller>
            <CodePreviewView data={content} />
          </PanelComponentScroller>
        </div>
      </PanelComponent>,
      this._panelDOMElement,
    );
    this._panel = atom.workspace.addRightPanel({
      item: this._panelDOMElement,
      priority: 200,
    });
  }

  getWidth(): number {
    return this._width;
  }

  dispose(): void {
    ReactDOM.unmountComponentAtNode(this._panelDOMElement);
    this._panel.destroy();
  }
}

type HeaderState = {
  data: ?string;
};

type HeaderProps = {
  data: Observable<?string>;
};

class Header extends React.Component {
  state: HeaderState;
  props: HeaderProps;

  subscription: ?rx$ISubscription;

  constructor(props: HeaderProps) {
    super(props);
    this.state = {
      data: null,
    };
  }

  componentDidMount(): void {
    invariant(this.subscription == null);
    this.subscription = this.props.data.subscribe(data => {
      this.setState({data});
    });
  }

  componentWillUnmount(): void {
    invariant(this.subscription != null);
    this.subscription.unsubscribe();
    this.subscription = null;
  }

  render(): React.Element {
    return (
      // Because the container is flex, prevent this header from shrinking smaller than its
      // contents. The default for flex children is to shrink as needed.
      <div className="panel-heading" style={{'flex-shrink': 0}}>
        <span className="icon icon-comment-discussion" />
        CodePreview {this.state.data == null ? '' : `: ${this.state.data}`}
        <button
          className="btn btn-xs icon icon-x pull-right nuclide-definition-preview-close-button"
          onClick={hide}
          title="Hide CodePreview"
        />
      </div>
    );
  }
}

function hide() {
  atom.commands.dispatch(
    atom.views.getView(atom.workspace),
    'nuclide-definition-preview:hide'
  );
}
