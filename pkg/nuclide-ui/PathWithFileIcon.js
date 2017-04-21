/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import UniversalDisposable from '../commons-node/UniversalDisposable';

type FileIconsAddItemToElementFn = (element: HTMLElement) => IDisposable;

type Props = {
  className?: string,
  children?: (React.Element<any> | Array<?React.Element<any>>),
  isFolder?: boolean,
  path: string,
};

export default class PathWithFileIcon extends React.Component {
  props: Props;
  _disposables: UniversalDisposable;
  _fileIconsDisposable: ?IDisposable;
  _addItemToElement: ?FileIconsAddItemToElementFn;
  _mounted: boolean;

  constructor(props: Props) {
    super(props);
    this._mounted = false;
    this._disposables = new UniversalDisposable(
      atom.packages.serviceHub.consume(
        'file-icons.element-icons',
        '1.0.0',
        this._consumeFileIconService.bind(this),
      ),
      () => {
        if (this._fileIconsDisposable != null) {
          this._fileIconsDisposable.dispose();
        }
      },
    );
    (this: any)._handleRef = this._handleRef.bind(this);
  }

  componentDidMount(): void {
    this._mounted = true;
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.path !== this.props.path) {
      this._forceIconUpdate();
    }
  }

  // This only gets called if the file-icons package is installed.
  _consumeFileIconService(addItemToElement: FileIconsAddItemToElementFn): IDisposable {
    this._addItemToElement = addItemToElement;
    this._forceIconUpdate();
    return new UniversalDisposable(() => {
      this._addItemToElement = null;
      this._forceIconUpdate();
    });
  }

  _handleRef(element: ?HTMLElement): void {
    if (this.props.isFolder) {
      return;
    }
    this._ensureIconRemoved();
    if (this._addItemToElement == null) {
      // file-icons service not available; ignore.
      return;
    }
    if (element == null) {
      // Element is unmounting.
      return;
    }
    this._fileIconsDisposable = new UniversalDisposable(
      this._addItemToElement(element, this.props.path),
      // On dispose, file-icons doesn't actually remove the classNames it assigned to the node,
      // so we need to reset the classList manually.
      () => {
        element.className = this._getDefaultClassName();
      },
    );
  }

  _getDefaultClassName(): string {
    const {
      className,
      isFolder,
    } = this.props;
    return classnames(
      'icon',
      {
        'icon-file-text': isFolder !== true,
        'icon-file-directory': isFolder === true,
      },
      className,
    );
  }

  _forceIconUpdate(): void {
    if (!this._mounted) {
      return;
    }
    const element = ReactDOM.findDOMNode(this);
    // $FlowIssue `element` is an HTMLElement
    this._handleRef(element);
  }

  _ensureIconRemoved(): void {
    if (this._fileIconsDisposable == null) {
      return;
    }
    this._fileIconsDisposable.dispose();
    this._fileIconsDisposable = null;
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
    this._mounted = false;
  }

  render(): React.Element<any> {
    const {
      className,
      children,
      isFolder,
      path,
      // forward properties such as `data-path`, etc
      ...rest
    } = this.props;
    const displayPath = children == null ? path : children;
    return (
      <div
        className={this._getDefaultClassName()}
        ref={this._handleRef}
        {...rest}>
        {displayPath}
      </div>
    );
  }
}
