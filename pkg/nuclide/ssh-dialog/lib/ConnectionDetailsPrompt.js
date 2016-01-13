Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _ConnectionDetailsForm = require('./ConnectionDetailsForm');

var _ConnectionDetailsForm2 = _interopRequireDefault(_ConnectionDetailsForm);

var _uiMutableListSelector = require('../../ui/mutable-list-selector');

var _uiMutableListSelector2 = _interopRequireDefault(_uiMutableListSelector);

var _reactForAtom = require('react-for-atom');

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

/**
 * This component contains the entire view in which the user inputs their
 * connection information when connecting to a remote project.
 * This view contains the ConnectionDetailsForm on the left side, and a
 * NuclideListSelector on the right side that displays 0 or more connection
 * 'profiles'. Clicking on a 'profile' in the NuclideListSelector auto-fills
 * the form with the information associated with that profile.
 */
/* eslint-disable react/prop-types */

var ConnectionDetailsPrompt = (function (_React$Component) {
  _inherits(ConnectionDetailsPrompt, _React$Component);

  function ConnectionDetailsPrompt(props) {
    _classCallCheck(this, ConnectionDetailsPrompt);

    _get(Object.getPrototypeOf(ConnectionDetailsPrompt.prototype), 'constructor', this).call(this, props);
    this._boundOnProfileClicked = this._onProfileClicked.bind(this);
    this._boundOnDeleteProfileClicked = this._onDeleteProfileClicked.bind(this);
    this.state = {
      indexOfSelectedConnectionProfile: this.props.indexOfInitiallySelectedConnectionProfile
    };
  }

  /* eslint-enable react/prop-types */

  _createClass(ConnectionDetailsPrompt, [{
    key: 'getFormFields',
    value: function getFormFields() {
      return this.refs['connection-details-form'].getFormFields();
    }
  }, {
    key: 'render',
    value: function render() {
      // If there are profiles, pre-fill the form with the information from the
      // specified selected profile.
      var prefilledConnectionParams = {};
      if (this.props.connectionProfiles && this.props.connectionProfiles.length && this.state.indexOfSelectedConnectionProfile != null) {
        var indexToSelect = this.state.indexOfSelectedConnectionProfile;
        if (indexToSelect >= this.props.connectionProfiles.length) {
          // This logic protects us from incorrect indices passed from above, and
          // allows us to passively account for profiles being deleted.
          indexToSelect = this.props.connectionProfiles.length - 1;
        }
        var selectedProfile = this.props.connectionProfiles[indexToSelect];
        prefilledConnectionParams = selectedProfile.params;
      }

      // Create helper data structures.
      var listSelectorItems = [];
      if (this.props.connectionProfiles) {
        this.props.connectionProfiles.forEach(function (profile, index) {
          // Use the index of each profile as its id. This is safe because the
          // items are immutable (within this React component).
          listSelectorItems.push({ id: String(index), displayTitle: profile.displayTitle });
        });
      }
      var idOfSelectedItem = this.state.indexOfSelectedConnectionProfile != null ? String(this.state.indexOfSelectedConnectionProfile) : null;

      // We have to manually update the contents of an existing ConnectionDetailsForm,
      // because it contains AtomInput components (which don't update their contents
      // when their props change).
      var existingConnectionDetailsForm = this.refs['connection-details-form'];
      if (existingConnectionDetailsForm) {
        existingConnectionDetailsForm.setFormFields(prefilledConnectionParams);
        existingConnectionDetailsForm.clearPassword();
      }

      return _reactForAtom2['default'].createElement(
        'div',
        { className: 'nuclide-connection-details-prompt' },
        _reactForAtom2['default'].createElement(
          'div',
          { className: 'connection-details-form' },
          _reactForAtom2['default'].createElement(_ConnectionDetailsForm2['default'], {
            ref: 'connection-details-form',
            initialUsername: prefilledConnectionParams.username,
            initialServer: prefilledConnectionParams.server,
            initialRemoteServerCommand: prefilledConnectionParams.remoteServerCommand,
            initialCwd: prefilledConnectionParams.cwd,
            initialSshPort: prefilledConnectionParams.sshPort,
            initialPathToPrivateKey: prefilledConnectionParams.pathToPrivateKey,
            initialAuthMethod: prefilledConnectionParams.authMethod,
            onConfirm: this.props.onConfirm,
            onCancel: this.props.onCancel
          })
        ),
        _reactForAtom2['default'].createElement(
          'div',
          { className: 'connection-profiles padded' },
          _reactForAtom2['default'].createElement(
            'h3',
            { className: 'title' },
            'Connection Profiles'
          ),
          _reactForAtom2['default'].createElement(_uiMutableListSelector2['default'], {
            items: listSelectorItems,
            idOfInitiallySelectedItem: idOfSelectedItem,
            onItemClicked: this._boundOnProfileClicked,
            onAddButtonClicked: this.props.onAddProfileClicked,
            onDeleteButtonClicked: this._boundOnDeleteProfileClicked
          })
        )
      );
    }
  }, {
    key: '_onProfileClicked',
    value: function _onProfileClicked(profileId) {
      // The id of a profile is its index in the list of props.
      this.setState({ indexOfSelectedConnectionProfile: profileId });
    }
  }, {
    key: '_onDeleteProfileClicked',
    value: function _onDeleteProfileClicked(profileId) {
      if (profileId == null) {
        return;
      }
      // The id of a profile is its index in the list of props.
      this.props.onDeleteProfileClicked(parseInt(profileId, 10));
    }
  }]);

  return ConnectionDetailsPrompt;
})(_reactForAtom2['default'].Component);

exports['default'] = ConnectionDetailsPrompt;
module.exports = exports['default'];

// The initial list of connection profiles that will be displayed.
// Whenever a user add/removes profiles via the child NuclideListSelector,
// these props should be updated from the top-level by calling React.render()
// again (with the new props) on the ConnectionDetailsPrompt.

// If there is >= 1 connection profile, this index indicates the initial
// profile to use.

// Function to call when 'enter'/'confirm' is selected by the user in this view.

// Function to call when 'cancel' is selected by the user in this view.

// Function that is called when the "+" button on the profiles list is clicked.
// The user's intent is to create a new profile.

// Function that is called when the "-" button on the profiles list is clicked
// ** while a profile is selected **.
// The user's intent is to delete the currently-selected profile.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbm5lY3Rpb25EZXRhaWxzUHJvbXB0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7cUNBV2tDLHlCQUF5Qjs7OztxQ0FDcEIsZ0NBQWdDOzs7OzRCQUNyRCxnQkFBZ0I7Ozs7Ozs7Ozs7Ozs7O0lBMENiLHVCQUF1QjtZQUF2Qix1QkFBdUI7O0FBTS9CLFdBTlEsdUJBQXVCLENBTTlCLEtBQVksRUFBRTswQkFOUCx1QkFBdUI7O0FBT3hDLCtCQVBpQix1QkFBdUIsNkNBT2xDLEtBQUssRUFBRTtBQUNiLFFBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hFLFFBQUksQ0FBQyw0QkFBNEIsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVFLFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxzQ0FBZ0MsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLHlDQUF5QztLQUN2RixDQUFDO0dBQ0g7Ozs7ZUFia0IsdUJBQXVCOztXQWU3Qix5QkFBOEM7QUFDekQsYUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDN0Q7OztXQUVLLGtCQUFpQjs7O0FBR3JCLFVBQUkseUJBQXlCLEdBQUcsRUFBRSxDQUFDO0FBQ25DLFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsSUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLElBQ3BDLElBQUksQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLElBQUksSUFBSSxFQUFFO0FBQ3ZELFlBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLENBQUM7QUFDaEUsWUFBSSxhQUFhLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7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QU0sU0FBUzs7cUJBRE4sdUJBQXVCIiwiZmlsZSI6IkNvbm5lY3Rpb25EZXRhaWxzUHJvbXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IENvbm5lY3Rpb25EZXRhaWxzRm9ybSBmcm9tICcuL0Nvbm5lY3Rpb25EZXRhaWxzRm9ybSc7XG5pbXBvcnQgTnVjbGlkZU11dGFibGVMaXN0U2VsZWN0b3IgZnJvbSAnLi4vLi4vdWkvbXV0YWJsZS1saXN0LXNlbGVjdG9yJztcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbmltcG9ydCB0eXBlIHtcbiAgTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25QYXJhbXNXaXRoUGFzc3dvcmQsXG4gIE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUHJvZmlsZSxcbn0gZnJvbSAnLi9jb25uZWN0aW9uLXR5cGVzJztcblxudHlwZSBEZWZhdWx0UHJvcHMgPSB7fTtcbnR5cGUgUHJvcHMgPSB7XG4gIC8vIFRoZSBpbml0aWFsIGxpc3Qgb2YgY29ubmVjdGlvbiBwcm9maWxlcyB0aGF0IHdpbGwgYmUgZGlzcGxheWVkLlxuICAvLyBXaGVuZXZlciBhIHVzZXIgYWRkL3JlbW92ZXMgcHJvZmlsZXMgdmlhIHRoZSBjaGlsZCBOdWNsaWRlTGlzdFNlbGVjdG9yLFxuICAvLyB0aGVzZSBwcm9wcyBzaG91bGQgYmUgdXBkYXRlZCBmcm9tIHRoZSB0b3AtbGV2ZWwgYnkgY2FsbGluZyBSZWFjdC5yZW5kZXIoKVxuICAvLyBhZ2FpbiAod2l0aCB0aGUgbmV3IHByb3BzKSBvbiB0aGUgQ29ubmVjdGlvbkRldGFpbHNQcm9tcHQuXG4gIGNvbm5lY3Rpb25Qcm9maWxlczogP0FycmF5PE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUHJvZmlsZT47XG4gIC8vIElmIHRoZXJlIGlzID49IDEgY29ubmVjdGlvbiBwcm9maWxlLCB0aGlzIGluZGV4IGluZGljYXRlcyB0aGUgaW5pdGlhbFxuICAvLyBwcm9maWxlIHRvIHVzZS5cbiAgaW5kZXhPZkluaXRpYWxseVNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU6ID9udW1iZXI7XG4gIC8vIEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiAnZW50ZXInLydjb25maXJtJyBpcyBzZWxlY3RlZCBieSB0aGUgdXNlciBpbiB0aGlzIHZpZXcuXG4gIG9uQ29uZmlybTogKCkgPT4gbWl4ZWQ7XG4gIC8vIEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiAnY2FuY2VsJyBpcyBzZWxlY3RlZCBieSB0aGUgdXNlciBpbiB0aGlzIHZpZXcuXG4gIG9uQ2FuY2VsOiAoKSA9PiBtaXhlZDtcbiAgLy8gRnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgXCIrXCIgYnV0dG9uIG9uIHRoZSBwcm9maWxlcyBsaXN0IGlzIGNsaWNrZWQuXG4gIC8vIFRoZSB1c2VyJ3MgaW50ZW50IGlzIHRvIGNyZWF0ZSBhIG5ldyBwcm9maWxlLlxuICBvbkFkZFByb2ZpbGVDbGlja2VkOiAoKSA9PiBtaXhlZDtcbiAgLy8gRnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgXCItXCIgYnV0dG9uIG9uIHRoZSBwcm9maWxlcyBsaXN0IGlzIGNsaWNrZWRcbiAgLy8gKiogd2hpbGUgYSBwcm9maWxlIGlzIHNlbGVjdGVkICoqLlxuICAvLyBUaGUgdXNlcidzIGludGVudCBpcyB0byBkZWxldGUgdGhlIGN1cnJlbnRseS1zZWxlY3RlZCBwcm9maWxlLlxuICBvbkRlbGV0ZVByb2ZpbGVDbGlja2VkOiAoaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU6IG51bWJlcikgPT4gbWl4ZWQ7XG59O1xudHlwZSBTdGF0ZSA9IHtcbiAgaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU6ID9udW1iZXI7XG59O1xuXG4vKipcbiAqIFRoaXMgY29tcG9uZW50IGNvbnRhaW5zIHRoZSBlbnRpcmUgdmlldyBpbiB3aGljaCB0aGUgdXNlciBpbnB1dHMgdGhlaXJcbiAqIGNvbm5lY3Rpb24gaW5mb3JtYXRpb24gd2hlbiBjb25uZWN0aW5nIHRvIGEgcmVtb3RlIHByb2plY3QuXG4gKiBUaGlzIHZpZXcgY29udGFpbnMgdGhlIENvbm5lY3Rpb25EZXRhaWxzRm9ybSBvbiB0aGUgbGVmdCBzaWRlLCBhbmQgYVxuICogTnVjbGlkZUxpc3RTZWxlY3RvciBvbiB0aGUgcmlnaHQgc2lkZSB0aGF0IGRpc3BsYXlzIDAgb3IgbW9yZSBjb25uZWN0aW9uXG4gKiAncHJvZmlsZXMnLiBDbGlja2luZyBvbiBhICdwcm9maWxlJyBpbiB0aGUgTnVjbGlkZUxpc3RTZWxlY3RvciBhdXRvLWZpbGxzXG4gKiB0aGUgZm9ybSB3aXRoIHRoZSBpbmZvcm1hdGlvbiBhc3NvY2lhdGVkIHdpdGggdGhhdCBwcm9maWxlLlxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25uZWN0aW9uRGV0YWlsc1Byb21wdFxuICAgIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PERlZmF1bHRQcm9wcywgUHJvcHMsIFN0YXRlPiB7XG4gIF9pZFRvQ29ubmVjdGlvblByb2ZpbGU6ID9NYXA8c3RyaW5nLCBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGU+O1xuICBfYm91bmRPblByb2ZpbGVDbGlja2VkOiAocHJvZmlsZUlkOiBzdHJpbmcpID0+IHZvaWQ7XG4gIF9ib3VuZE9uRGVsZXRlUHJvZmlsZUNsaWNrZWQ6IChwcm9maWxlSWQ6ID9zdHJpbmcpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX2JvdW5kT25Qcm9maWxlQ2xpY2tlZCA9IHRoaXMuX29uUHJvZmlsZUNsaWNrZWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ib3VuZE9uRGVsZXRlUHJvZmlsZUNsaWNrZWQgPSB0aGlzLl9vbkRlbGV0ZVByb2ZpbGVDbGlja2VkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiB0aGlzLnByb3BzLmluZGV4T2ZJbml0aWFsbHlTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlLFxuICAgIH07XG4gIH1cblxuICBnZXRGb3JtRmllbGRzKCk6IE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUGFyYW1zV2l0aFBhc3N3b3JkIHtcbiAgICByZXR1cm4gdGhpcy5yZWZzWydjb25uZWN0aW9uLWRldGFpbHMtZm9ybSddLmdldEZvcm1GaWVsZHMoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIC8vIElmIHRoZXJlIGFyZSBwcm9maWxlcywgcHJlLWZpbGwgdGhlIGZvcm0gd2l0aCB0aGUgaW5mb3JtYXRpb24gZnJvbSB0aGVcbiAgICAvLyBzcGVjaWZpZWQgc2VsZWN0ZWQgcHJvZmlsZS5cbiAgICBsZXQgcHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcyA9IHt9O1xuICAgIGlmICh0aGlzLnByb3BzLmNvbm5lY3Rpb25Qcm9maWxlcyAmJlxuICAgICAgICB0aGlzLnByb3BzLmNvbm5lY3Rpb25Qcm9maWxlcy5sZW5ndGggJiZcbiAgICAgICAgdGhpcy5zdGF0ZS5pbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZSAhPSBudWxsKSB7XG4gICAgICBsZXQgaW5kZXhUb1NlbGVjdCA9IHRoaXMuc3RhdGUuaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGU7XG4gICAgICBpZiAoaW5kZXhUb1NlbGVjdCA+PSB0aGlzLnByb3BzLmNvbm5lY3Rpb25Qcm9maWxlcy5sZW5ndGgpIHtcbiAgICAgICAgLy8gVGhpcyBsb2dpYyBwcm90ZWN0cyB1cyBmcm9tIGluY29ycmVjdCBpbmRpY2VzIHBhc3NlZCBmcm9tIGFib3ZlLCBhbmRcbiAgICAgICAgLy8gYWxsb3dzIHVzIHRvIHBhc3NpdmVseSBhY2NvdW50IGZvciBwcm9maWxlcyBiZWluZyBkZWxldGVkLlxuICAgICAgICBpbmRleFRvU2VsZWN0ID0gdGhpcy5wcm9wcy5jb25uZWN0aW9uUHJvZmlsZXMubGVuZ3RoIC0gMTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNlbGVjdGVkUHJvZmlsZSA9IHRoaXMucHJvcHMuY29ubmVjdGlvblByb2ZpbGVzW2luZGV4VG9TZWxlY3RdO1xuICAgICAgcHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcyA9IHNlbGVjdGVkUHJvZmlsZS5wYXJhbXM7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGhlbHBlciBkYXRhIHN0cnVjdHVyZXMuXG4gICAgY29uc3QgbGlzdFNlbGVjdG9ySXRlbXMgPSBbXTtcbiAgICBpZiAodGhpcy5wcm9wcy5jb25uZWN0aW9uUHJvZmlsZXMpIHtcbiAgICAgIHRoaXMucHJvcHMuY29ubmVjdGlvblByb2ZpbGVzLmZvckVhY2goKHByb2ZpbGUsIGluZGV4KSA9PiB7XG4gICAgICAgIC8vIFVzZSB0aGUgaW5kZXggb2YgZWFjaCBwcm9maWxlIGFzIGl0cyBpZC4gVGhpcyBpcyBzYWZlIGJlY2F1c2UgdGhlXG4gICAgICAgIC8vIGl0ZW1zIGFyZSBpbW11dGFibGUgKHdpdGhpbiB0aGlzIFJlYWN0IGNvbXBvbmVudCkuXG4gICAgICAgIGxpc3RTZWxlY3Rvckl0ZW1zLnB1c2goe2lkOiBTdHJpbmcoaW5kZXgpLCBkaXNwbGF5VGl0bGU6IHByb2ZpbGUuZGlzcGxheVRpdGxlfSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgY29uc3QgaWRPZlNlbGVjdGVkSXRlbSA9ICh0aGlzLnN0YXRlLmluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlICE9IG51bGwpID9cbiAgICAgIFN0cmluZyh0aGlzLnN0YXRlLmluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlKSA6IG51bGw7XG5cbiAgICAvLyBXZSBoYXZlIHRvIG1hbnVhbGx5IHVwZGF0ZSB0aGUgY29udGVudHMgb2YgYW4gZXhpc3RpbmcgQ29ubmVjdGlvbkRldGFpbHNGb3JtLFxuICAgIC8vIGJlY2F1c2UgaXQgY29udGFpbnMgQXRvbUlucHV0IGNvbXBvbmVudHMgKHdoaWNoIGRvbid0IHVwZGF0ZSB0aGVpciBjb250ZW50c1xuICAgIC8vIHdoZW4gdGhlaXIgcHJvcHMgY2hhbmdlKS5cbiAgICBjb25zdCBleGlzdGluZ0Nvbm5lY3Rpb25EZXRhaWxzRm9ybSA9IHRoaXMucmVmc1snY29ubmVjdGlvbi1kZXRhaWxzLWZvcm0nXTtcbiAgICBpZiAoZXhpc3RpbmdDb25uZWN0aW9uRGV0YWlsc0Zvcm0pIHtcbiAgICAgIGV4aXN0aW5nQ29ubmVjdGlvbkRldGFpbHNGb3JtLnNldEZvcm1GaWVsZHMocHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcyk7XG4gICAgICBleGlzdGluZ0Nvbm5lY3Rpb25EZXRhaWxzRm9ybS5jbGVhclBhc3N3b3JkKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1jb25uZWN0aW9uLWRldGFpbHMtcHJvbXB0XCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29ubmVjdGlvbi1kZXRhaWxzLWZvcm1cIj5cbiAgICAgICAgICA8Q29ubmVjdGlvbkRldGFpbHNGb3JtXG4gICAgICAgICAgICByZWY9XCJjb25uZWN0aW9uLWRldGFpbHMtZm9ybVwiXG4gICAgICAgICAgICBpbml0aWFsVXNlcm5hbWU9e3ByZWZpbGxlZENvbm5lY3Rpb25QYXJhbXMudXNlcm5hbWV9XG4gICAgICAgICAgICBpbml0aWFsU2VydmVyPXtwcmVmaWxsZWRDb25uZWN0aW9uUGFyYW1zLnNlcnZlcn1cbiAgICAgICAgICAgIGluaXRpYWxSZW1vdGVTZXJ2ZXJDb21tYW5kPXtwcmVmaWxsZWRDb25uZWN0aW9uUGFyYW1zLnJlbW90ZVNlcnZlckNvbW1hbmR9XG4gICAgICAgICAgICBpbml0aWFsQ3dkPXtwcmVmaWxsZWRDb25uZWN0aW9uUGFyYW1zLmN3ZH1cbiAgICAgICAgICAgIGluaXRpYWxTc2hQb3J0PXtwcmVmaWxsZWRDb25uZWN0aW9uUGFyYW1zLnNzaFBvcnR9XG4gICAgICAgICAgICBpbml0aWFsUGF0aFRvUHJpdmF0ZUtleT17cHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcy5wYXRoVG9Qcml2YXRlS2V5fVxuICAgICAgICAgICAgaW5pdGlhbEF1dGhNZXRob2Q9e3ByZWZpbGxlZENvbm5lY3Rpb25QYXJhbXMuYXV0aE1ldGhvZH1cbiAgICAgICAgICAgIG9uQ29uZmlybT17dGhpcy5wcm9wcy5vbkNvbmZpcm19XG4gICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5wcm9wcy5vbkNhbmNlbH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb25uZWN0aW9uLXByb2ZpbGVzIHBhZGRlZFwiPlxuICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0aXRsZVwiPkNvbm5lY3Rpb24gUHJvZmlsZXM8L2gzPlxuICAgICAgICAgIDxOdWNsaWRlTXV0YWJsZUxpc3RTZWxlY3RvclxuICAgICAgICAgICAgaXRlbXM9e2xpc3RTZWxlY3Rvckl0ZW1zfVxuICAgICAgICAgICAgaWRPZkluaXRpYWxseVNlbGVjdGVkSXRlbT17aWRPZlNlbGVjdGVkSXRlbX1cbiAgICAgICAgICAgIG9uSXRlbUNsaWNrZWQ9e3RoaXMuX2JvdW5kT25Qcm9maWxlQ2xpY2tlZH1cbiAgICAgICAgICAgIG9uQWRkQnV0dG9uQ2xpY2tlZD17dGhpcy5wcm9wcy5vbkFkZFByb2ZpbGVDbGlja2VkfVxuICAgICAgICAgICAgb25EZWxldGVCdXR0b25DbGlja2VkPXt0aGlzLl9ib3VuZE9uRGVsZXRlUHJvZmlsZUNsaWNrZWR9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX29uUHJvZmlsZUNsaWNrZWQocHJvZmlsZUlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBUaGUgaWQgb2YgYSBwcm9maWxlIGlzIGl0cyBpbmRleCBpbiB0aGUgbGlzdCBvZiBwcm9wcy5cbiAgICB0aGlzLnNldFN0YXRlKHtpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZTogcHJvZmlsZUlkfSk7XG4gIH1cblxuICBfb25EZWxldGVQcm9maWxlQ2xpY2tlZChwcm9maWxlSWQ6ID9zdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAocHJvZmlsZUlkID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gVGhlIGlkIG9mIGEgcHJvZmlsZSBpcyBpdHMgaW5kZXggaW4gdGhlIGxpc3Qgb2YgcHJvcHMuXG4gICAgdGhpcy5wcm9wcy5vbkRlbGV0ZVByb2ZpbGVDbGlja2VkKHBhcnNlSW50KHByb2ZpbGVJZCwgMTApKTtcbiAgfVxufVxuLyogZXNsaW50LWVuYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG4iXX0=