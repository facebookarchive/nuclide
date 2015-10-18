'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var AtomInput = require('nuclide-ui-atom-input');
var {CompositeDisposable} = require('atom');
var RadioGroup = require('nuclide-ui-radiogroup');
var React = require('react-for-atom');
var {PropTypes} = React;
var {SshHandshake} = require('nuclide-remote-connection');

// $FlowFixMe: Flow can't find the PASSWORD, etc. properties on SupportedMethods.
var {SupportedMethods} = SshHandshake;
var authMethods = [
  SupportedMethods.PASSWORD,
  SupportedMethods.SSL_AGENT,
  SupportedMethods.PRIVATE_KEY,
];

/** Component to prompt the user for connection details. */
export default class ConnectionDetailsForm extends React.Component {
  // $FlowIssue t8486988
  static propTypes = {
    initialUsername: PropTypes.string,
    initialServer: PropTypes.string,
    initialCwd: PropTypes.string,
    initialRemoteServerCommand: PropTypes.string,
    initialSshPort: PropTypes.string,
    initialPathToPrivateKey: PropTypes.string,
    initialAuthMethod: PropTypes.shape(Object.keys(SupportedMethods)),
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  _disposables: ?CompositeDisposable;

  constructor(props: any) {
    super(props);
    this.state = {
      username: props.initialUsername,
      server: props.initialServer,
      cwd: props.initialCwd,
      remoteServerCommand: props.initialRemoteServerCommand,
      sshPort: props.initialSshPort,
      pathToPrivateKey: props.initialPathToPrivateKey,
      selectedAuthMethodIndex: authMethods.indexOf(props.initialAuthMethod),
    };
  }

  handleAuthMethodChange(newIndex: number) {
    this.setState({
      selectedAuthMethodIndex: newIndex,
    });
  }

  _onKeyUp(e) {
    if (e.key === 'Enter') {
      this.props.onConfirm();
    }

    if (e.key === 'Escape') {
      this.props.onCancel();
    }
  }

  _handlePasswordInputClick(event) {
    var passwordAuthMethodIndex = authMethods.indexOf(SupportedMethods.PASSWORD);
    this.setState(
      {
        selectedAuthMethodIndex: passwordAuthMethodIndex,
      },
      () => {
        React.findDOMNode(this.refs['password']).focus();
      }
    );
  }

  _handleKeyFileInputClick(event) {
    var privateKeyAuthMethodIndex = authMethods.indexOf(SupportedMethods.PRIVATE_KEY);
    this.setState(
      {
        selectedAuthMethodIndex: privateKeyAuthMethodIndex,
      },
      () => {
        // when setting this immediately, Atom will unset the focus...
        setTimeout(() => {
          React.findDOMNode(this.refs['pathToPrivateKey']).focus();
        }, 0);
      }
    );
  }

  render() {
    var activeAuthMethod = authMethods[this.state.selectedAuthMethodIndex];
    // We need native-key-bindings so that delete works and we need
    // _onKeyUp so that escape and enter work
    var passwordLabel = (
      <div className="nuclide-auth-method">
        <div className="nuclide-auth-method-label">
          Password:
        </div>
        <div className="nuclide-auth-method-input nuclide-auth-method-password">
          <input type="password"
            className="nuclide-password native-key-bindings"
            disabled={activeAuthMethod !== SupportedMethods.PASSWORD}
            ref="password"
            onClick={this._handlePasswordInputClick}
            onKeyUp={this._onKeyUp}
          />
        </div>
      </div>
    );
    var privateKeyLabel = (
      <div className="nuclide-auth-method">
        <div className="nuclide-auth-method-label">
          Private Key File:
        </div>
        <div className="nuclide-auth-method-input nuclide-auth-method-privatekey">
          <AtomInput
            ref="pathToPrivateKey"
            disabled={activeAuthMethod !== SupportedMethods.PRIVATE_KEY}
            onClick={this._handleKeyFileInputClick}
            placeholder="Path to private key"
            initialValue={this.state.pathToPrivateKey}
          />
        </div>
      </div>
    );
    var sshAgentLabel = (
      <div className="nuclide-auth-method">
        Use ssh-agent
      </div>
    );
    return (
      <div ref="root">
        <div className="block">
          Username:
          <AtomInput ref="username" initialValue={this.state.username} />
        </div>
        <div className="block">
          Server:
          <AtomInput mini ref="server" initialValue={this.state.server} />
        </div>
        <div className="block">
          Initial Directory:
          <AtomInput ref="cwd" initialValue={this.state.cwd} />
        </div>
        <div className="block">
          Authentication method:
        </div>
        <div className="nuclide-auth-selector">
          <RadioGroup
            optionLabels={[
              passwordLabel,
              sshAgentLabel,
              privateKeyLabel,
            ]}
            onSelectedChange={this.handleAuthMethodChange}
            selectedIndex={this.state.selectedAuthMethodIndex}
          />
        </div>
        <div className="block">
          Advanced Settings
        </div>
        <div className="block">
          SSH Port:
          <AtomInput ref="sshPort" initialValue={this.state.sshPort} />
        </div>
        <div className="block">
          Remote Server Command:
          <AtomInput ref="remoteServerCommand" initialValue={this.state.remoteServerCommand} />
        </div>
      </div>
    );
  }

  componentDidMount() {
    var disposables = new CompositeDisposable();
    this._disposables = disposables;
    var root = React.findDOMNode(this.refs['root']);

    // Hitting enter when this panel has focus should confirm the dialog.
    disposables.add(atom.commands.add(
        root,
        'core:confirm',
        (event) => this.props.onConfirm()));

    // Hitting escape when this panel has focus should cancel the dialog.
    disposables.add(atom.commands.add(
        root,
        'core:cancel',
        (event) => this.props.onCancel()));

    this.refs['username'].focus();
  }

  componentWillUnmount() {
    if (this._disposables) {
      this._disposables.dispose();
      this._disposables = null;
    }
  }

  getText(fieldName: string): string {
    return (this.refs[fieldName] && this.refs[fieldName].getText().trim()) || '';
  }

  getAuthMethod(): string {
    return authMethods[this.state.selectedAuthMethodIndex];
  }

  getAuthMethodIndex(): number {
    return this.state.selectedAuthMethodIndex;
  }

  getPassword(): string {
    return (this.refs.password && React.findDOMNode(this.refs.password).value) || '';
  }
}
