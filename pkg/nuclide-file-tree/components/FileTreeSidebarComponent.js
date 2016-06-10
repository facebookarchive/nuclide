'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';

import {
  React,
  ReactDOM,
} from 'react-for-atom';
import {Observable} from 'rxjs';
import {FileTree} from './FileTree';
import FileTreeSideBarFilterComponent from './FileTreeSideBarFilterComponent';
import {FileTreeToolbarComponent} from './FileTreeToolbarComponent';
import {OpenFilesListComponent} from './OpenFilesListComponent';
import {FileTreeStore} from '../lib/FileTreeStore';
import {CompositeDisposable, Disposable} from 'atom';
import {PanelComponentScroller} from '../../nuclide-ui/lib/PanelComponentScroller';
import {DisposableSubscription, toggle} from '../../commons-node/stream';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import featureConfig from '../../nuclide-feature-config';

type State = {
  shouldRenderToolbar: boolean;
  scrollerHeight: number;
  scrollerScrollTop: number;
  showOpenFiles: boolean;
  openFilesUris: Array<NuclideUri>;
  modifiedUris: Array<NuclideUri>;
  activeUri: ?NuclideUri;
};

type Props = {
  hidden: boolean;
};

const SHOW_OPEN_FILE_CONFIG_KEY = 'nuclide-file-tree.showOpenFiles';

class FileTreeSidebarComponent extends React.Component {
  _store: FileTreeStore;
  _disposables: CompositeDisposable;
  _afRequestId: ?number;
  _showOpenConfigValues: Observable<boolean>;
  state: State;
  props: Props;

  constructor(props: Props) {
    super(props);

    this._store = FileTreeStore.getInstance();
    this.state = {
      shouldRenderToolbar: false,
      scrollerHeight: 0,
      scrollerScrollTop: 0,
      showOpenFiles: true,
      openFilesUris: [],
      modifiedUris: [],
      activeUri: null,
    };
    this._showOpenConfigValues = featureConfig.observeAsStream(SHOW_OPEN_FILE_CONFIG_KEY).cache(1);

    this._disposables = new CompositeDisposable();
    this._afRequestId = null;
    (this: any)._handleFocus = this._handleFocus.bind(this);
    (this: any)._onViewChange = this._onViewChange.bind(this);
    (this: any)._scrollToPosition = this._scrollToPosition.bind(this);
    (this: any)._processExternalUpdate = this._processExternalUpdate.bind(this);
  }

  componentDidMount(): void {
    this._processExternalUpdate();

    window.addEventListener('resize', this._onViewChange);
    this._afRequestId = window.requestAnimationFrame(() => {
      this._onViewChange();
      this._afRequestId = null;
    });

    this._disposables.add(
      this._store.subscribe(this._processExternalUpdate),
      atom.project.onDidChangePaths(this._processExternalUpdate),
      new DisposableSubscription(
        toggle(observeAllModifiedStatusChanges(), this._showOpenConfigValues)
          .subscribe(() => this._setModifiedUris()),
      ),
      this._monitorActiveUri(),
      new DisposableSubscription(
        this._showOpenConfigValues.subscribe(showOpenFiles => this.setState({showOpenFiles}))
      ),
      new Disposable(() => {
        window.removeEventListener('resize', this._onViewChange);
        if (this._afRequestId != null) {
          window.cancelAnimationFrame(this._afRequestId);
        }
      }),
    );
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  componentDidUpdate(prevProps: Props): void {
    if (prevProps.hidden && !this.props.hidden) {
      this._onViewChange();
    }
  }

  _handleFocus(event: SyntheticEvent): void {
    // Delegate focus to the FileTree component if this component gains focus because the FileTree
    // matches the selectors targeted by themes to show the containing panel has focus.
    if (event.target === ReactDOM.findDOMNode(this)) {
      ReactDOM.findDOMNode(this.refs.fileTree).focus();
    }
  }

  render() {
    const workingSetsStore = this._store.getWorkingSetsStore();
    let toolbar;
    if (this.state.shouldRenderToolbar && workingSetsStore != null) {
      toolbar = [
        <FileTreeSideBarFilterComponent
          key="filter"
          filter={this._store.getFilter()}
          found={this._store.getFilterFound()}
        />,
        <FileTreeToolbarComponent
          key="toolbar"
          workingSetsStore={workingSetsStore}
        />,
      ];
    }

    let openFilesCaption = null;
    let openFilesList = null;
    let foldersCaption = null;
    if (this.state.showOpenFiles) {
      openFilesCaption = <h6 className="nuclide-file-tree-section-caption">OPEN FILES</h6>;

      openFilesList = (
        <OpenFilesListComponent
          uris={this.state.openFilesUris}
          modifiedUris={this.state.modifiedUris}
          activeUri={this.state.activeUri}
        />);

      foldersCaption = <h6 className="nuclide-file-tree-section-caption">FOLDERS</h6>;
    }

    // Include `tabIndex` so this component can be focused by calling its native `focus` method.
    return (
      <div
        className="nuclide-file-tree-toolbar-container"
        tabIndex={0}>
        {openFilesCaption}
        {openFilesList}
        {toolbar}
        {foldersCaption}
        <PanelComponentScroller
          ref="scroller"
          onFocus={this._handleFocus}
          onScroll={this._onViewChange}>
          <FileTree
            ref="fileTree"
            containerHeight={this.state.scrollerHeight}
            containerScrollTop={this.state.scrollerScrollTop}
            scrollToPosition={this._scrollToPosition}
          />
        </PanelComponentScroller>
      </div>
    );
  }

  _processExternalUpdate(): void {
    const shouldRenderToolbar = !this._store.roots.isEmpty();
    const openFilesUris = this._store.getOpenFilesWorkingSet().getUris();

    if (shouldRenderToolbar !== this.state.shouldRenderToolbar ||
      openFilesUris !== this.state.openFilesUris
    ) {
      this.setState({shouldRenderToolbar, openFilesUris});
    } else {
      // Note: It's safe to call forceUpdate here because the change events are de-bounced.
      this.forceUpdate();
    }
  }

  _setModifiedUris(): void {
    const modifiedUris = getCurrentBuffers()
      .filter(buffer => buffer.isModified())
      .map(buffer => buffer.getPath() || '')
      .filter(path => path !== '');

    this.setState({modifiedUris});
  }

  _monitorActiveUri(): IDisposable {
    const activeEditors = observableFromSubscribeFunction(
      atom.workspace.onDidStopChangingActivePaneItem.bind(atom.workspace),
    );

    return new DisposableSubscription(
      toggle(activeEditors, this._showOpenConfigValues)
      .subscribe(editor => {
        if (editor == null || typeof editor.getPath !== 'function' || editor.getPath() == null) {
          this.setState({activeUri: null});
          return;
        }

        this.setState({activeUri: editor.getPath()});
      })
    );
  }

  _onViewChange(): void {
    const node = ReactDOM.findDOMNode(this.refs.scroller);
    const {clientHeight, scrollTop} = node;

    if (clientHeight !== this.state.scrollerHeight || scrollTop !== this.state.scrollerScrollTop) {
      this.setState({scrollerHeight: clientHeight, scrollerScrollTop: scrollTop});
    }
  }

  _scrollToPosition(top: number, height: number): void {
    const requestedBottom = top + height;
    const currentBottom = this.state.scrollerScrollTop + this.state.scrollerHeight;
    if (top > this.state.scrollerScrollTop && requestedBottom <= currentBottom) {
      return;  // Already in the view
    }

    const node = ReactDOM.findDOMNode(this.refs.scroller);
    if (node == null) {
      return;
    }
    const newTop = Math.max(top + height / 2 - this.state.scrollerHeight / 2, 0);
    setImmediate(() => {
      try {  // For the rather unlikely chance that the node is already gone from the DOM
        node.scrollTop = newTop;
        this.setState({scrollerScrollTop: newTop});
      } catch (e) {}
    });
  }
}

function observeAllModifiedStatusChanges(): Observable<void> {
  const paneItemChangeEvents = Observable.merge(
    observableFromSubscribeFunction(
      atom.workspace.onDidAddPaneItem.bind(atom.workspace),
    ),
    observableFromSubscribeFunction(
      atom.workspace.onDidDestroyPaneItem.bind(atom.workspace),
    ),
  )
  .startWith(undefined);

  return paneItemChangeEvents
  .map(getCurrentBuffers)
  .switchMap(buffers => Observable.merge(
    ...buffers.map(buffer => {
      return observableFromSubscribeFunction(buffer.onDidChangeModified.bind(buffer));
    })
  ));
}

function getCurrentBuffers(): Array<atom$TextBuffer> {
  const buffers = [];
  const editors = atom.workspace.getTextEditors();
  editors.forEach(te => {
    const buffer = te.getBuffer();

    if (typeof buffer.getPath !== 'function' || buffer.getPath() == null) {
      return;
    }

    if (buffers.indexOf(buffer) < 0) {
      buffers.push(buffer);
    }
  });

  return buffers;
}

module.exports = FileTreeSidebarComponent;
