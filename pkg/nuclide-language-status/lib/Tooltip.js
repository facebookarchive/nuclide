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

import nullthrows from 'nullthrows';
import * as React from 'react';
import ReactDOM from 'react-dom';

const HIDE_DELAY = 150;

type Props = {
  parentRef: ?React.ElementRef<any>,
};

type State = {
  tooltipRoot: ?HTMLElement,
};

// Higher order component class for rendering a stylable hover tooltip.
const makeTooltip = (TooltipComponent: React.ComponentType<any>) => {
  class HigherOrderTooltip extends React.Component<Props, State> {
    _tooltipDisposable: ?IDisposable;
    _parentRef: ?React.ElementRef<any>;
    _hideTimeoutId: ?TimeoutID;

    props: Props = {
      parentRef: null,
    };
    state: State = {
      tooltipRoot: null,
    };

    componentDidUpdate(prevProps: Props): void {
      const {parentRef: prevParentRef} = prevProps;
      const {parentRef} = this.props;

      if (prevParentRef === parentRef) {
        return;
      }

      if (prevParentRef != null) {
        this._hideTooltip();
        prevParentRef.removeEventListener('mouseenter', this._showTooltip);
        prevParentRef.removeEventListener(
          'mouseleave',
          this._scheduleHideTooltip,
        );
      }

      if (parentRef != null) {
        parentRef.addEventListener('mouseenter', this._showTooltip);
        parentRef.addEventListener('mouseleave', this._scheduleHideTooltip);
      }
    }

    render(): React.Node {
      // The structure of Atom tooltips looks like
      // <div class="tooltip">
      //   <div class="tooltip-arrow"/>
      //   <div class="tooltip-inner"/>
      // </div>
      //
      // Use createPortal() here to render the TooltipComponent into the
      // "tooltip-inner" div.
      const container = this._getContainer();
      return container == null
        ? null
        : ReactDOM.createPortal(
            <TooltipComponent
              tooltipRoot={this.state.tooltipRoot}
              showTooltip={this._showTooltip}
              hideTooltip={this._hideTooltip}
              {...this.props}
            />,
            container,
          );
    }

    _getContainer(): ?HTMLElement {
      return this.state.tooltipRoot == null
        ? null
        : Array.from(this.state.tooltipRoot.children).find(element =>
            element.className.includes('tooltip-inner'),
          );
    }

    _showTooltip = (): void => {
      this._cancelHideTooltip();
      if (this.props.parentRef == null || this._tooltipDisposable != null) {
        return;
      }

      this._tooltipDisposable = atom.tooltips.add(this.props.parentRef, {
        delay: 0,
        item: document.createElement('div'),
        placement: 'bottom',
        trigger: 'manual',
      });
      const tooltip =
        this.props.parentRef != null
          ? atom.tooltips.tooltips.get(this.props.parentRef)
          : null;
      if (tooltip != null && tooltip[0] != null) {
        const tooltipRoot = tooltip[0].getTooltipElement();
        this.setState({tooltipRoot});
        if (tooltipRoot != null) {
          tooltipRoot.addEventListener('mouseenter', this._showTooltip);
          tooltipRoot.addEventListener('mouseleave', this._scheduleHideTooltip);
        }
      }
    };

    _hideTooltip = (): void => {
      if (this._tooltipDisposable != null) {
        nullthrows(this._tooltipDisposable).dispose();
      }
      this.setState({tooltipRoot: null});
      this._tooltipDisposable = null;
      this._hideTimeoutId = null;
    };

    _scheduleHideTooltip = (): void => {
      this._hideTimeoutId = setTimeout(this._hideTooltip, HIDE_DELAY);
    };

    _cancelHideTooltip = (): void => {
      if (this._hideTimeoutId != null) {
        clearTimeout(this._hideTimeoutId);
      }
      this._hideTimeoutId = null;
    };
  }

  return HigherOrderTooltip;
};

export default makeTooltip;
