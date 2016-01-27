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
  }

  /* eslint-enable react/prop-types */

  _createClass(ConnectionDetailsPrompt, [{
    key: 'getFormFields',
    value: function getFormFields() {
      return this.refs['connection-details-form'].getFormFields();
    }
  }, {
    key: 'getPrefilledConnectionParams',
    value: function getPrefilledConnectionParams() {
      // If there are profiles, pre-fill the form with the information from the
      // specified selected profile.
      if (this.props.connectionProfiles && this.props.connectionProfiles.length && this.props.indexOfSelectedConnectionProfile != null) {
        var indexToSelect = this.props.indexOfSelectedConnectionProfile;
        if (indexToSelect >= this.props.connectionProfiles.length) {
          // This logic protects us from incorrect indices passed from above, and
          // allows us to passively account for profiles being deleted.
          indexToSelect = this.props.connectionProfiles.length - 1;
        }
        var selectedProfile = this.props.connectionProfiles[indexToSelect];
        return selectedProfile.params;
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      // We have to manually update the contents of an existing ConnectionDetailsForm,
      // because it contains AtomInput components (which don't update their contents
      // when their props change).
      var existingConnectionDetailsForm = this.refs['connection-details-form'];
      if (existingConnectionDetailsForm) {
        existingConnectionDetailsForm.setFormFields(this.getPrefilledConnectionParams());
        existingConnectionDetailsForm.clearPassword();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      // If there are profiles, pre-fill the form with the information from the
      // specified selected profile.
      var prefilledConnectionParams = this.getPrefilledConnectionParams() || {};

      // Create helper data structures.
      var listSelectorItems = undefined;
      if (this.props.connectionProfiles) {
        listSelectorItems = this.props.connectionProfiles.map(function (profile, index) {
          // Use the index of each profile as its id. This is safe because the
          // items are immutable (within this React component).
          return {
            deletable: profile.deletable,
            displayTitle: profile.displayTitle,
            id: String(index)
          };
        });
      } else {
        listSelectorItems = [];
      }

      var idOfSelectedItem = this.props.indexOfSelectedConnectionProfile == null ? null : String(this.props.indexOfSelectedConnectionProfile);

      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-connection-details-prompt container-fluid' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'row', style: { display: 'flex' } },
          _reactForAtom.React.createElement(
            'div',
            { className: 'connection-profiles col-xs-3 inset-panel' },
            _reactForAtom.React.createElement(
              'h6',
              null,
              'Profiles'
            ),
            _reactForAtom.React.createElement(_uiMutableListSelector2['default'], {
              items: listSelectorItems,
              idOfSelectedItem: idOfSelectedItem,
              onItemClicked: this._boundOnProfileClicked,
              onAddButtonClicked: this.props.onAddProfileClicked,
              onDeleteButtonClicked: this._boundOnDeleteProfileClicked
            })
          ),
          _reactForAtom.React.createElement(
            'div',
            { className: 'connection-details-form col-xs-9' },
            _reactForAtom.React.createElement(_ConnectionDetailsForm2['default'], {
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
          )
        )
      );
    }
  }, {
    key: '_onProfileClicked',
    value: function _onProfileClicked(profileId) {
      // The id of a profile is its index in the list of props.
      this.props.onProfileClicked(parseInt(profileId, 10));
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
})(_reactForAtom.React.Component);

exports['default'] = ConnectionDetailsPrompt;
module.exports = exports['default'];

// The initial list of connection profiles that will be displayed.
// Whenever a user add/removes profiles via the child NuclideListSelector,
// these props should be updated from the top-level by calling React.render()
// again (with the new props) on the ConnectionDetailsPrompt.

// If there is >= 1 connection profile, this index indicates the profile to use.

// Function to call when 'enter'/'confirm' is selected by the user in this view.

// Function to call when 'cancel' is selected by the user in this view.

// Function that is called when the "+" button on the profiles list is clicked.
// The user's intent is to create a new profile.

// Function that is called when the "-" button on the profiles list is clicked
// ** while a profile is selected **.
// The user's intent is to delete the currently-selected profile.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbm5lY3Rpb25EZXRhaWxzUHJvbXB0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7cUNBV2tDLHlCQUF5Qjs7OztxQ0FDcEIsZ0NBQWdDOzs7OzRCQUNuRCxnQkFBZ0I7Ozs7Ozs7Ozs7OztJQXVDZix1QkFBdUI7WUFBdkIsdUJBQXVCOztBQUsvQixXQUxRLHVCQUF1QixDQUs5QixLQUFZLEVBQUU7MEJBTFAsdUJBQXVCOztBQU14QywrQkFOaUIsdUJBQXVCLDZDQU1sQyxLQUFLLEVBQUU7QUFDYixRQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoRSxRQUFJLENBQUMsNEJBQTRCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUM3RTs7OztlQVRrQix1QkFBdUI7O1dBVzdCLHlCQUE4QztBQUN6RCxhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztLQUM3RDs7O1dBRTJCLHdDQUFtQzs7O0FBRzdELFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsSUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLElBQ3BDLElBQUksQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLElBQUksSUFBSSxFQUFFO0FBQ3ZELFlBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLENBQUM7QUFDaEUsWUFBSSxhQUFhLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7OztBQUd6RCx1QkFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztTQUMxRDtBQUNELFlBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENB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QUU7QUFDckIsZUFBTztPQUNSOztBQUVELFVBQUksQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzVEOzs7U0EvR2tCLHVCQUF1QjtHQUFTLG9CQUFNLFNBQVM7O3FCQUEvQyx1QkFBdUIiLCJmaWxlIjoiQ29ubmVjdGlvbkRldGFpbHNQcm9tcHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgQ29ubmVjdGlvbkRldGFpbHNGb3JtIGZyb20gJy4vQ29ubmVjdGlvbkRldGFpbHNGb3JtJztcbmltcG9ydCBOdWNsaWRlTXV0YWJsZUxpc3RTZWxlY3RvciBmcm9tICcuLi8uLi91aS9tdXRhYmxlLWxpc3Qtc2VsZWN0b3InO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5pbXBvcnQgdHlwZSB7XG4gIE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUGFyYW1zLFxuICBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblBhcmFtc1dpdGhQYXNzd29yZCxcbiAgTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25Qcm9maWxlLFxufSBmcm9tICcuL2Nvbm5lY3Rpb24tdHlwZXMnO1xuXG50eXBlIFByb3BzID0ge1xuICAvLyBUaGUgaW5pdGlhbCBsaXN0IG9mIGNvbm5lY3Rpb24gcHJvZmlsZXMgdGhhdCB3aWxsIGJlIGRpc3BsYXllZC5cbiAgLy8gV2hlbmV2ZXIgYSB1c2VyIGFkZC9yZW1vdmVzIHByb2ZpbGVzIHZpYSB0aGUgY2hpbGQgTnVjbGlkZUxpc3RTZWxlY3RvcixcbiAgLy8gdGhlc2UgcHJvcHMgc2hvdWxkIGJlIHVwZGF0ZWQgZnJvbSB0aGUgdG9wLWxldmVsIGJ5IGNhbGxpbmcgUmVhY3QucmVuZGVyKClcbiAgLy8gYWdhaW4gKHdpdGggdGhlIG5ldyBwcm9wcykgb24gdGhlIENvbm5lY3Rpb25EZXRhaWxzUHJvbXB0LlxuICBjb25uZWN0aW9uUHJvZmlsZXM6ID9BcnJheTxOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGU+O1xuICAvLyBJZiB0aGVyZSBpcyA+PSAxIGNvbm5lY3Rpb24gcHJvZmlsZSwgdGhpcyBpbmRleCBpbmRpY2F0ZXMgdGhlIHByb2ZpbGUgdG8gdXNlLlxuICBpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZTogP251bWJlcjtcbiAgLy8gRnVuY3Rpb24gdG8gY2FsbCB3aGVuICdlbnRlcicvJ2NvbmZpcm0nIGlzIHNlbGVjdGVkIGJ5IHRoZSB1c2VyIGluIHRoaXMgdmlldy5cbiAgb25Db25maXJtOiAoKSA9PiBtaXhlZDtcbiAgLy8gRnVuY3Rpb24gdG8gY2FsbCB3aGVuICdjYW5jZWwnIGlzIHNlbGVjdGVkIGJ5IHRoZSB1c2VyIGluIHRoaXMgdmlldy5cbiAgb25DYW5jZWw6ICgpID0+IG1peGVkO1xuICAvLyBGdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSBcIitcIiBidXR0b24gb24gdGhlIHByb2ZpbGVzIGxpc3QgaXMgY2xpY2tlZC5cbiAgLy8gVGhlIHVzZXIncyBpbnRlbnQgaXMgdG8gY3JlYXRlIGEgbmV3IHByb2ZpbGUuXG4gIG9uQWRkUHJvZmlsZUNsaWNrZWQ6ICgpID0+IG1peGVkO1xuICAvLyBGdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSBcIi1cIiBidXR0b24gb24gdGhlIHByb2ZpbGVzIGxpc3QgaXMgY2xpY2tlZFxuICAvLyAqKiB3aGlsZSBhIHByb2ZpbGUgaXMgc2VsZWN0ZWQgKiouXG4gIC8vIFRoZSB1c2VyJ3MgaW50ZW50IGlzIHRvIGRlbGV0ZSB0aGUgY3VycmVudGx5LXNlbGVjdGVkIHByb2ZpbGUuXG4gIG9uRGVsZXRlUHJvZmlsZUNsaWNrZWQ6IChpbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZTogbnVtYmVyKSA9PiBtaXhlZDtcbiAgb25Qcm9maWxlQ2xpY2tlZDogKGluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlOiBudW1iZXIpID0+IG1peGVkO1xufTtcblxuLyoqXG4gKiBUaGlzIGNvbXBvbmVudCBjb250YWlucyB0aGUgZW50aXJlIHZpZXcgaW4gd2hpY2ggdGhlIHVzZXIgaW5wdXRzIHRoZWlyXG4gKiBjb25uZWN0aW9uIGluZm9ybWF0aW9uIHdoZW4gY29ubmVjdGluZyB0byBhIHJlbW90ZSBwcm9qZWN0LlxuICogVGhpcyB2aWV3IGNvbnRhaW5zIHRoZSBDb25uZWN0aW9uRGV0YWlsc0Zvcm0gb24gdGhlIGxlZnQgc2lkZSwgYW5kIGFcbiAqIE51Y2xpZGVMaXN0U2VsZWN0b3Igb24gdGhlIHJpZ2h0IHNpZGUgdGhhdCBkaXNwbGF5cyAwIG9yIG1vcmUgY29ubmVjdGlvblxuICogJ3Byb2ZpbGVzJy4gQ2xpY2tpbmcgb24gYSAncHJvZmlsZScgaW4gdGhlIE51Y2xpZGVMaXN0U2VsZWN0b3IgYXV0by1maWxsc1xuICogdGhlIGZvcm0gd2l0aCB0aGUgaW5mb3JtYXRpb24gYXNzb2NpYXRlZCB3aXRoIHRoYXQgcHJvZmlsZS5cbiAqL1xuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29ubmVjdGlvbkRldGFpbHNQcm9tcHQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHMsIHZvaWQ+IHtcbiAgX2lkVG9Db25uZWN0aW9uUHJvZmlsZTogP01hcDxzdHJpbmcsIE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUHJvZmlsZT47XG4gIF9ib3VuZE9uUHJvZmlsZUNsaWNrZWQ6IChwcm9maWxlSWQ6IHN0cmluZykgPT4gdm9pZDtcbiAgX2JvdW5kT25EZWxldGVQcm9maWxlQ2xpY2tlZDogKHByb2ZpbGVJZDogP3N0cmluZykgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fYm91bmRPblByb2ZpbGVDbGlja2VkID0gdGhpcy5fb25Qcm9maWxlQ2xpY2tlZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2JvdW5kT25EZWxldGVQcm9maWxlQ2xpY2tlZCA9IHRoaXMuX29uRGVsZXRlUHJvZmlsZUNsaWNrZWQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGdldEZvcm1GaWVsZHMoKTogTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25QYXJhbXNXaXRoUGFzc3dvcmQge1xuICAgIHJldHVybiB0aGlzLnJlZnNbJ2Nvbm5lY3Rpb24tZGV0YWlscy1mb3JtJ10uZ2V0Rm9ybUZpZWxkcygpO1xuICB9XG5cbiAgZ2V0UHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcygpOiA/TnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25QYXJhbXMge1xuICAgIC8vIElmIHRoZXJlIGFyZSBwcm9maWxlcywgcHJlLWZpbGwgdGhlIGZvcm0gd2l0aCB0aGUgaW5mb3JtYXRpb24gZnJvbSB0aGVcbiAgICAvLyBzcGVjaWZpZWQgc2VsZWN0ZWQgcHJvZmlsZS5cbiAgICBpZiAodGhpcy5wcm9wcy5jb25uZWN0aW9uUHJvZmlsZXMgJiZcbiAgICAgICAgdGhpcy5wcm9wcy5jb25uZWN0aW9uUHJvZmlsZXMubGVuZ3RoICYmXG4gICAgICAgIHRoaXMucHJvcHMuaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGUgIT0gbnVsbCkge1xuICAgICAgbGV0IGluZGV4VG9TZWxlY3QgPSB0aGlzLnByb3BzLmluZGV4T2ZTZWxlY3RlZENvbm5lY3Rpb25Qcm9maWxlO1xuICAgICAgaWYgKGluZGV4VG9TZWxlY3QgPj0gdGhpcy5wcm9wcy5jb25uZWN0aW9uUHJvZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgIC8vIFRoaXMgbG9naWMgcHJvdGVjdHMgdXMgZnJvbSBpbmNvcnJlY3QgaW5kaWNlcyBwYXNzZWQgZnJvbSBhYm92ZSwgYW5kXG4gICAgICAgIC8vIGFsbG93cyB1cyB0byBwYXNzaXZlbHkgYWNjb3VudCBmb3IgcHJvZmlsZXMgYmVpbmcgZGVsZXRlZC5cbiAgICAgICAgaW5kZXhUb1NlbGVjdCA9IHRoaXMucHJvcHMuY29ubmVjdGlvblByb2ZpbGVzLmxlbmd0aCAtIDE7XG4gICAgICB9XG4gICAgICBjb25zdCBzZWxlY3RlZFByb2ZpbGUgPSB0aGlzLnByb3BzLmNvbm5lY3Rpb25Qcm9maWxlc1tpbmRleFRvU2VsZWN0XTtcbiAgICAgIHJldHVybiBzZWxlY3RlZFByb2ZpbGUucGFyYW1zO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICAvLyBXZSBoYXZlIHRvIG1hbnVhbGx5IHVwZGF0ZSB0aGUgY29udGVudHMgb2YgYW4gZXhpc3RpbmcgQ29ubmVjdGlvbkRldGFpbHNGb3JtLFxuICAgIC8vIGJlY2F1c2UgaXQgY29udGFpbnMgQXRvbUlucHV0IGNvbXBvbmVudHMgKHdoaWNoIGRvbid0IHVwZGF0ZSB0aGVpciBjb250ZW50c1xuICAgIC8vIHdoZW4gdGhlaXIgcHJvcHMgY2hhbmdlKS5cbiAgICBjb25zdCBleGlzdGluZ0Nvbm5lY3Rpb25EZXRhaWxzRm9ybSA9IHRoaXMucmVmc1snY29ubmVjdGlvbi1kZXRhaWxzLWZvcm0nXTtcbiAgICBpZiAoZXhpc3RpbmdDb25uZWN0aW9uRGV0YWlsc0Zvcm0pIHtcbiAgICAgIGV4aXN0aW5nQ29ubmVjdGlvbkRldGFpbHNGb3JtLnNldEZvcm1GaWVsZHModGhpcy5nZXRQcmVmaWxsZWRDb25uZWN0aW9uUGFyYW1zKCkpO1xuICAgICAgZXhpc3RpbmdDb25uZWN0aW9uRGV0YWlsc0Zvcm0uY2xlYXJQYXNzd29yZCgpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIC8vIElmIHRoZXJlIGFyZSBwcm9maWxlcywgcHJlLWZpbGwgdGhlIGZvcm0gd2l0aCB0aGUgaW5mb3JtYXRpb24gZnJvbSB0aGVcbiAgICAvLyBzcGVjaWZpZWQgc2VsZWN0ZWQgcHJvZmlsZS5cbiAgICBjb25zdCBwcmVmaWxsZWRDb25uZWN0aW9uUGFyYW1zID0gdGhpcy5nZXRQcmVmaWxsZWRDb25uZWN0aW9uUGFyYW1zKCkgfHwge307XG5cbiAgICAvLyBDcmVhdGUgaGVscGVyIGRhdGEgc3RydWN0dXJlcy5cbiAgICBsZXQgbGlzdFNlbGVjdG9ySXRlbXM7XG4gICAgaWYgKHRoaXMucHJvcHMuY29ubmVjdGlvblByb2ZpbGVzKSB7XG4gICAgICBsaXN0U2VsZWN0b3JJdGVtcyA9IHRoaXMucHJvcHMuY29ubmVjdGlvblByb2ZpbGVzLm1hcCgocHJvZmlsZSwgaW5kZXgpID0+IHtcbiAgICAgICAgLy8gVXNlIHRoZSBpbmRleCBvZiBlYWNoIHByb2ZpbGUgYXMgaXRzIGlkLiBUaGlzIGlzIHNhZmUgYmVjYXVzZSB0aGVcbiAgICAgICAgLy8gaXRlbXMgYXJlIGltbXV0YWJsZSAod2l0aGluIHRoaXMgUmVhY3QgY29tcG9uZW50KS5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBkZWxldGFibGU6IHByb2ZpbGUuZGVsZXRhYmxlLFxuICAgICAgICAgIGRpc3BsYXlUaXRsZTogcHJvZmlsZS5kaXNwbGF5VGl0bGUsXG4gICAgICAgICAgaWQ6IFN0cmluZyhpbmRleCksXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdFNlbGVjdG9ySXRlbXMgPSBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBpZE9mU2VsZWN0ZWRJdGVtID0gKHRoaXMucHJvcHMuaW5kZXhPZlNlbGVjdGVkQ29ubmVjdGlvblByb2ZpbGUgPT0gbnVsbClcbiAgICAgID8gbnVsbFxuICAgICAgOiBTdHJpbmcodGhpcy5wcm9wcy5pbmRleE9mU2VsZWN0ZWRDb25uZWN0aW9uUHJvZmlsZSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWNvbm5lY3Rpb24tZGV0YWlscy1wcm9tcHQgY29udGFpbmVyLWZsdWlkXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm93XCIgc3R5bGU9e3tkaXNwbGF5OiAnZmxleCd9fT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbm5lY3Rpb24tcHJvZmlsZXMgY29sLXhzLTMgaW5zZXQtcGFuZWxcIj5cbiAgICAgICAgICAgIDxoNj5Qcm9maWxlczwvaDY+XG4gICAgICAgICAgICA8TnVjbGlkZU11dGFibGVMaXN0U2VsZWN0b3JcbiAgICAgICAgICAgICAgaXRlbXM9e2xpc3RTZWxlY3Rvckl0ZW1zfVxuICAgICAgICAgICAgICBpZE9mU2VsZWN0ZWRJdGVtPXtpZE9mU2VsZWN0ZWRJdGVtfVxuICAgICAgICAgICAgICBvbkl0ZW1DbGlja2VkPXt0aGlzLl9ib3VuZE9uUHJvZmlsZUNsaWNrZWR9XG4gICAgICAgICAgICAgIG9uQWRkQnV0dG9uQ2xpY2tlZD17dGhpcy5wcm9wcy5vbkFkZFByb2ZpbGVDbGlja2VkfVxuICAgICAgICAgICAgICBvbkRlbGV0ZUJ1dHRvbkNsaWNrZWQ9e3RoaXMuX2JvdW5kT25EZWxldGVQcm9maWxlQ2xpY2tlZH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb25uZWN0aW9uLWRldGFpbHMtZm9ybSBjb2wteHMtOVwiPlxuICAgICAgICAgICAgPENvbm5lY3Rpb25EZXRhaWxzRm9ybVxuICAgICAgICAgICAgICByZWY9XCJjb25uZWN0aW9uLWRldGFpbHMtZm9ybVwiXG4gICAgICAgICAgICAgIGluaXRpYWxVc2VybmFtZT17cHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcy51c2VybmFtZX1cbiAgICAgICAgICAgICAgaW5pdGlhbFNlcnZlcj17cHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcy5zZXJ2ZXJ9XG4gICAgICAgICAgICAgIGluaXRpYWxSZW1vdGVTZXJ2ZXJDb21tYW5kPXtwcmVmaWxsZWRDb25uZWN0aW9uUGFyYW1zLnJlbW90ZVNlcnZlckNvbW1hbmR9XG4gICAgICAgICAgICAgIGluaXRpYWxDd2Q9e3ByZWZpbGxlZENvbm5lY3Rpb25QYXJhbXMuY3dkfVxuICAgICAgICAgICAgICBpbml0aWFsU3NoUG9ydD17cHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcy5zc2hQb3J0fVxuICAgICAgICAgICAgICBpbml0aWFsUGF0aFRvUHJpdmF0ZUtleT17cHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcy5wYXRoVG9Qcml2YXRlS2V5fVxuICAgICAgICAgICAgICBpbml0aWFsQXV0aE1ldGhvZD17cHJlZmlsbGVkQ29ubmVjdGlvblBhcmFtcy5hdXRoTWV0aG9kfVxuICAgICAgICAgICAgICBvbkNvbmZpcm09e3RoaXMucHJvcHMub25Db25maXJtfVxuICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5wcm9wcy5vbkNhbmNlbH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9vblByb2ZpbGVDbGlja2VkKHByb2ZpbGVJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gVGhlIGlkIG9mIGEgcHJvZmlsZSBpcyBpdHMgaW5kZXggaW4gdGhlIGxpc3Qgb2YgcHJvcHMuXG4gICAgdGhpcy5wcm9wcy5vblByb2ZpbGVDbGlja2VkKHBhcnNlSW50KHByb2ZpbGVJZCwgMTApKTtcbiAgfVxuXG4gIF9vbkRlbGV0ZVByb2ZpbGVDbGlja2VkKHByb2ZpbGVJZDogP3N0cmluZyk6IHZvaWQge1xuICAgIGlmIChwcm9maWxlSWQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBUaGUgaWQgb2YgYSBwcm9maWxlIGlzIGl0cyBpbmRleCBpbiB0aGUgbGlzdCBvZiBwcm9wcy5cbiAgICB0aGlzLnByb3BzLm9uRGVsZXRlUHJvZmlsZUNsaWNrZWQocGFyc2VJbnQocHJvZmlsZUlkLCAxMCkpO1xuICB9XG59XG4vKiBlc2xpbnQtZW5hYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbiJdfQ==