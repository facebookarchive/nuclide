'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable} = require('atom');
import ConnectionDetailsForm from './ConnectionDetailsForm';
var React = require('react-for-atom');
var {
  SshHandshake,
  decorateSshConnectionDelegateWithTracking,
} = require('nuclide-remote-connection');
var path = require('path');
var logger = require('nuclide-logging').getLogger();

var {PropTypes} = React;

/** Component to prompt the user for authentication information. */
var AuthenticationPrompt = React.createClass({
  propTypes: {
    instructions: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  },

  render() {
    // Instructions may contain newlines that need to be converted to <br> tags.
    var safeHtml = this.props.instructions
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/\\n/g, '<br>');


    // We need native-key-bindings so that delete works and we need
    // _onKeyUp so that escape and enter work
    return (
      <div ref='root' className='password-prompt-container'>
        <div className='block'
             style={{whiteSpace: 'pre'}}
             dangerouslySetInnerHTML={{__html: safeHtml}}
        />

        <input type='password'
               className='nuclide-password native-key-bindings'
               ref='password'
               onKeyUp={this._onKeyUp}/>
      </div>
    );
  },

  _onKeyUp(e) {
    if(e.key === 'Enter'){
      this.props.onConfirm();
    }

    if(e.key === 'Escape'){
      this.props.onCancel();
    }
  },

  componentDidMount() {
    this._disposables = new CompositeDisposable();
    var root = React.findDOMNode(this.refs['root']);

    // Hitting enter when this panel has focus should confirm the dialog.
    this._disposables.add(atom.commands.add(
        root,
        'core:confirm',
        (event) => this.props.onConfirm()));

    // Hitting escape when this panel has focus should cancel the dialog.
    this._disposables.add(atom.commands.add(
        root,
        'core:cancel',
        (event) => this.props.onCancel()));

    React.findDOMNode(this.refs.password).focus();
  },

  componentWillUnmount() {
    if (this._disposables) {
      this._disposables.dispose();
      this._disposables = null;
    }
  },

  getPassword() {
    return React.findDOMNode(this.refs.password).value;
  },
});

/**
 * Component to entertain the user while he is waiting to hear back from the
 * server.
 */
var IndeterminateProgressBar = React.createClass({
  render() {
    return (
      <div className='block'>
        <span className='loading loading-spinner-medium inline-block'></span>
      </div>
    );
  },
});

var REQUEST_CONNECTION_DETAILS = 1;
var WAITING_FOR_CONNECTION = 2;
var REQUEST_AUTHENTICATION_DETAILS = 3;
var WAITING_FOR_AUTHENTICATION = 4;

/**
 * Component that manages the state transitions as the user connects to a
 * server.
 */
var ConnectionDialog = React.createClass({
  propTypes: {
    initialUsername: PropTypes.string,
    initialServer: PropTypes.string,
    initialRemoteServerCommand: PropTypes.string,
    initialCwd: PropTypes.string,
    initialSshPort: PropTypes.string,
    initialPathToPrivateKey: PropTypes.string,
    onConnect: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onClosed: PropTypes.func,
  },

  getInitialState() {
    var sshHandshake = new SshHandshake(decorateSshConnectionDelegateWithTracking({
      onKeyboardInteractive: (name, instructions, instructionsLang, prompts, finish)  => {
        // TODO: Display all prompts, not just the first one.
        this.requestAuthentication(prompts[0], finish);
      },

      onWillConnect:() => {},

      onDidConnect: (connection: SshHandshake, config: SshConnectionConfiguration) => {
        this.close(); // Close the dialog.
        this.props.onConnect(connection, config);
      },

      onError: (error: Error, config: SshConnectionConfiguration) => {
        this.close(); // Close the dialog.
        atom.notifications.addError(error.message, {dismissable: true});
        this.props.onError(error, config);
        logger.debug(error);
      },
    }));

    return {
      mode: REQUEST_CONNECTION_DETAILS,
      instructions: '',
      sshHandshake: sshHandshake,
      finish: (answers) => {},
    };
  },

  _getMode(): string {
    return this.state['mode'];
  },

  render() {
    var mode = this._getMode();
    var content;
    var isOkDisabled;
    if (mode === REQUEST_CONNECTION_DETAILS) {
      // Note React.__spread() is not available in the Atom React fork, so we
      // pass the props explicitly.
      content = (
        <ConnectionDetailsForm
          ref='connection-details'
          initialUsername={this.props.initialUsername}
          initialServer={this.props.initialServer}
          initialRemoteServerCommand={this.props.initialRemoteServerCommand}
          initialCwd={this.props.initialCwd}
          initialSshPort={this.props.initialSshPort}
          initialPathToPrivateKey={this.props.initialPathToPrivateKey}
          initialAuthMethod={this.props.initialAuthMethod}
          onConfirm={this.ok}
          onCancel={this.cancel}
        />
      );
      isOkDisabled = false;
    } else if (mode === WAITING_FOR_CONNECTION || mode === WAITING_FOR_AUTHENTICATION) {
      content = <IndeterminateProgressBar />;
      isOkDisabled = true;
    } else {
      content = (
        <AuthenticationPrompt ref='authentication'
                              instructions={this.state['instructions']}
                              onConfirm={this.ok}
                              onCancel={this.cancel}
      />);
      isOkDisabled = false;
    }

    // The root element cannot have a 'key' property, so we use a dummy
    // <div> as the root. Ideally, the <atom-panel> would be the root.
    return (
      <div>
        <atom-panel className='modal from-top' key='connect-dialog'>
          {content}
          <div className='block nuclide-ok-cancel'>
            <button className='btn' onClick={this.cancel}>
              Cancel
            </button>
            <button className='btn btn-primary' onClick={this.ok} disabled={isOkDisabled}>
              OK
            </button>
          </div>
        </atom-panel>
      </div>
    );
  },

  cancel() {
    var mode = this._getMode();

    // It is safe to call cancel even if no connection is started
    this.state.sshHandshake.cancel();

    if (mode === WAITING_FOR_CONNECTION) {
      // TODO(mikeo): Tell delegate to cancel the connection request.
      this.setState({mode: REQUEST_CONNECTION_DETAILS});
    } else {
      // TODO(mikeo): Also cancel connection request, as appropriate for mode?
      this.props.onCancel();
      this.close();
    }
  },

  close() {
    if (this.props.onClosed) {
      this.props.onClosed();
    }
    var domNode = React.findDOMNode(this);
    if (domNode) {
      React.unmountComponentAtNode(domNode.parentNode);
    }
  },

  ok() {
    var mode = this._getMode();

    if (mode === REQUEST_CONNECTION_DETAILS) {
      // User is trying to submit connection details.
      var connectionDetailsForm = this.refs['connection-details'];
      var pathToPrivateKey = connectionDetailsForm.getText('pathToPrivateKey');
      var username = connectionDetailsForm.getText('username');
      var server = connectionDetailsForm.getText('server');
      var cwd = connectionDetailsForm.getText('cwd');
      var sshPort = connectionDetailsForm.getText('sshPort');
      var remoteServerCommand = connectionDetailsForm.getText('remoteServerCommand');
      var authMethod = connectionDetailsForm.getAuthMethod();
      var password = connectionDetailsForm.getPassword();
      if (username && server && cwd && remoteServerCommand) {
        this.setState({mode: WAITING_FOR_CONNECTION});
        this.state.sshHandshake.connect({
          host: server,
          sshPort,
          username,
          pathToPrivateKey,
          authMethod,
          cwd,
          remoteServerCommand,
          password,
        });
      } else {
        // TODO(mbolin): Tell user to fill out all of the fields.
      }
    } else if (mode === REQUEST_AUTHENTICATION_DETAILS) {
      var authenticationPrompt = this.refs['authentication'];
      var password = authenticationPrompt.getPassword();

      this.state.finish([password]);

      this.setState({mode: WAITING_FOR_AUTHENTICATION});
    }
  },

  requestAuthentication(instructions: {echo: boolean; prompt: string}, finish: (answers: Array<string>) => void) {
    this.setState({
      mode: REQUEST_AUTHENTICATION_DETAILS,
      instructions: instructions.prompt,
      finish,
    });
  },
});

module.exports = ConnectionDialog;
