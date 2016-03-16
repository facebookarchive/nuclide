// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @constructor
 * @extends {WebInspector.VBox}
 * @implements {WebInspector.TargetManager.Observer}
 */
WebInspector.ServiceWorkersView = function()
{
    WebInspector.VBox.call(this, true);
    this.registerRequiredCSS("resources/serviceWorkersView.css");
    this.contentElement.classList.add("service-workers-view");

    /** @type {!Set.<string>} */
    this._securityOriginHosts = new Set();
    /** @type {!Map.<string, !WebInspector.ServiceWorkerOriginElement>} */
    this._originHostToOriginElementMap = new Map();
    /** @type {!Map.<string, !WebInspector.ServiceWorkerOriginElement>} */
    this._registrationIdToOriginElementMap = new Map();

    this.root = this.contentElement.createChild("ol");
    this.root.classList.add("service-workers-root");

    WebInspector.targetManager.observeTargets(this);
}

WebInspector.ServiceWorkersView.prototype = {
    /**
     * @override
     * @param {!WebInspector.Target} target
     */
    targetAdded: function(target)
    {
        if (this._target)
            return;
        this._target = target;
        this._manager = this._target.serviceWorkerManager;

        for (var registration of this._manager.registrations().values())
            this._updateRegistration(registration);
        for (var versionMap of this._manager.versions().values()) {
            for (var version of versionMap.values())
                this._updateVersion(version);
        }
        this._manager.addEventListener(WebInspector.ServiceWorkerManager.Events.RegistrationUpdated, this._registrationUpdated, this);
        this._manager.addEventListener(WebInspector.ServiceWorkerManager.Events.RegistrationDeleted, this._registrationDeleted, this);
        this._manager.addEventListener(WebInspector.ServiceWorkerManager.Events.VersionUpdated, this._versionUpdated, this);
        this._manager.addEventListener(WebInspector.ServiceWorkerManager.Events.VersionDeleted, this._versionDeleted, this);
        this._target.resourceTreeModel.addEventListener(WebInspector.ResourceTreeModel.EventTypes.SecurityOriginAdded, this._securityOriginAdded, this);
        this._target.resourceTreeModel.addEventListener(WebInspector.ResourceTreeModel.EventTypes.SecurityOriginRemoved, this._securityOriginRemoved, this);
        var securityOrigins = this._target.resourceTreeModel.securityOrigins();
        for (var i = 0; i < securityOrigins.length; ++i)
            this._addOrigin(securityOrigins[i]);
    },

    /**
     * @override
     * @param {!WebInspector.Target} target
     */
    targetRemoved: function(target)
    {
        if (target !== this._target)
            return;
        delete this._target;
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _registrationUpdated: function(event)
    {
        this._updateRegistration(/** @type {!ServiceWorkerAgent.ServiceWorkerRegistration} */ (event.data));
    },

    /**
     * @param {!ServiceWorkerAgent.ServiceWorkerRegistration} registration
     */
    _updateRegistration: function(registration)
    {
        var parsedURL = registration.scopeURL.asParsedURL();
        if (!parsedURL)
          return;
        var originHost = parsedURL.host;
        var originElement = this._originHostToOriginElementMap.get(originHost);
        if (!originElement) {
            originElement = new WebInspector.ServiceWorkerOriginElement(this._manager, originHost);
            if (this._securityOriginHosts.has(originHost))
                this._appendOriginNode(originElement);
            this._originHostToOriginElementMap.set(originHost, originElement);
        }
        this._registrationIdToOriginElementMap.set(registration.registrationId, originElement);
        originElement._updateRegistration(registration);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _registrationDeleted: function(event)
    {
        var registration = /** @type {!ServiceWorkerAgent.ServiceWorkerRegistration} */ (event.data);
        var originElement = this._registrationIdToOriginElementMap.get(registration.registrationId);
        if (!originElement)
            return;
        this._registrationIdToOriginElementMap.delete(registration.registrationId);
        originElement._deleteRegistration(registration);
        if (originElement._hasRegistration())
            return;
        if (this._securityOriginHosts.has(originElement.originHost))
            this._removeOriginNode(originElement);
        this._originHostToOriginElementMap.delete(originElement.originHost);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _versionUpdated: function(event)
    {
        this._updateVersion(/** @type {!ServiceWorkerAgent.ServiceWorkerVersion} */ (event.data));
    },

    /**
     * @param {!ServiceWorkerAgent.ServiceWorkerVersion} version
     */
    _updateVersion: function(version)
    {
        var originElement = this._registrationIdToOriginElementMap.get(version.registrationId);
        if (originElement)
            originElement._updateVersion(version);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _versionDeleted: function(event)
    {
      var version = /** @type {!ServiceWorkerAgent.ServiceWorkerVersion} */ (event.data);
      var originElement = this._registrationIdToOriginElementMap.get(version.registrationId);
      if (originElement)
          originElement._deleteVersion(version);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _securityOriginAdded: function(event)
    {
        this._addOrigin(/** @type {string} */ (event.data));
    },

    /**
     * @param {string} securityOrigin
     */
    _addOrigin: function(securityOrigin)
    {
        var parsedURL = securityOrigin.asParsedURL();
        if (!parsedURL)
          return;
        var originHost = parsedURL.host;
        if (this._securityOriginHosts.has(originHost))
            return;
        this._securityOriginHosts.add(originHost);
        var originElement = this._originHostToOriginElementMap.get(originHost);
        if (!originElement)
          return;
        this._appendOriginNode(originElement);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _securityOriginRemoved: function(event)
    {
        var securityOrigin = /** @type {string} */ (event.data);
        var parsedURL = securityOrigin.asParsedURL();
        if (!parsedURL)
          return;
        var originHost = parsedURL.host;
        if (!this._securityOriginHosts.has(originHost))
            return;
        this._securityOriginHosts.delete(originHost);
        var originElement = this._originHostToOriginElementMap.get(originHost);
        if (!originElement)
          return;
        this._removeOriginNode(originElement);
    },

    /**
     * @param {!WebInspector.ServiceWorkerOriginElement} originElement
     */
    _appendOriginNode: function(originElement)
    {
        this.root.appendChild(originElement.element);
    },

    /**
     * @param {!WebInspector.ServiceWorkerOriginElement} originElement
     */
    _removeOriginNode: function(originElement)
    {
        this.root.removeChild(originElement.element);
    },

    __proto__: WebInspector.VBox.prototype
}

/**
 * @constructor
 * @param {!WebInspector.ServiceWorkerManager} manager
 * @param {string} originHost
 */
WebInspector.ServiceWorkerOriginElement = function(manager, originHost)
{
    this._manager = manager;
    /** @type {!Map.<string, !WebInspector.SWRegistrationElement>} */
    this._registrationElements = new Map();
    this.originHost = originHost;
    this.element = createElementWithClass("div", "service-workers-origin");
    this._listItemNode = this.element.createChild("li", "service-workers-origin-title");
    this._listItemNode.createChild("div").createTextChild(originHost);
    this._childrenListNode = this.element.createChild("ol");
}

WebInspector.ServiceWorkerOriginElement.prototype = {
    /**
     * @return {boolean}
     */
    _hasRegistration: function()
    {
        return this._registrationElements.size != 0;
    },

    /**
     * @param {!ServiceWorkerAgent.ServiceWorkerRegistration} registration
     */
    _updateRegistration: function(registration)
    {
        var swRegistrationElement = this._registrationElements.get(registration.registrationId);
        if (swRegistrationElement) {
            swRegistrationElement._updateRegistration(registration);
            return;
        }
        swRegistrationElement = new WebInspector.SWRegistrationElement(this._manager, registration);
        this._registrationElements.set(registration.registrationId, swRegistrationElement);
        this._childrenListNode.appendChild(swRegistrationElement.element);
    },

    /**
     * @param {!ServiceWorkerAgent.ServiceWorkerRegistration} registration
     */
    _deleteRegistration: function(registration)
    {
        var swRegistrationElement = this._registrationElements.get(registration.registrationId);
        if (!swRegistrationElement)
            return;
        this._registrationElements.delete(registration.registrationId);
        this._childrenListNode.removeChild(swRegistrationElement.element);
    },

    /**
     * @param {!ServiceWorkerAgent.ServiceWorkerVersion} version
     */
    _updateVersion: function(version)
    {
        var swRegistrationElement = this._registrationElements.get(version.registrationId);
        if (!swRegistrationElement)
            return
        swRegistrationElement._updateVersion(version);
    },

    /**
     * @param {!ServiceWorkerAgent.ServiceWorkerVersion} version
     */
    _deleteVersion: function(version)
    {
        var swRegistrationElement = this._registrationElements.get(version.registrationId);
        if (!swRegistrationElement)
            return;
        swRegistrationElement._deleteVersion(version);
    }
}

/**
 * @constructor
 * @param {!WebInspector.ServiceWorkerManager} manager
 * @param {!ServiceWorkerAgent.ServiceWorkerRegistration} registration
 */
WebInspector.SWRegistrationElement = function(manager, registration)
{
    this._manager = manager;
    /** @type {!ServiceWorkerAgent.ServiceWorkerRegistration} */
    this._registration = registration;
    /** @type {!Map.<string, !ServiceWorkerAgent.ServiceWorkerVersion>} */
    this._versions = new Map();
    this.element = createElementWithClass("div", "service-workers-registration");
    var headerNode = this.element.createChild("li").createChild("div", "service-workers-registration-header");
    this._titleNode = headerNode.createChild("div", "service-workers-registration-title");
    this._unregisterButton = headerNode.createChild("button", "service-workers-button service-workers-unregister-button");
    this._unregisterButton.addEventListener("click", this._unregisterButtonClicked.bind(this), false);
    this._unregisterButton.title = WebInspector.UIString("Unregister");
    this._childrenListNode = this.element.createChild("ol");
    this._updateRegistration(registration);
}

/** @enum {string} */
WebInspector.SWRegistrationElement.VersionMode = {
    Installing: "installing",
    Waiting: "waiting",
    Active: "active",
    Redundant: "redundant",
}

/** @type {!Map.<string, string>} */
WebInspector.SWRegistrationElement.VersionStausToModeMap = new Map([
    [ServiceWorkerAgent.ServiceWorkerVersionStatus.New, WebInspector.SWRegistrationElement.VersionMode.Installing],
    [ServiceWorkerAgent.ServiceWorkerVersionStatus.Installing, WebInspector.SWRegistrationElement.VersionMode.Installing],
    [ServiceWorkerAgent.ServiceWorkerVersionStatus.Installed, WebInspector.SWRegistrationElement.VersionMode.Waiting],
    [ServiceWorkerAgent.ServiceWorkerVersionStatus.Activating, WebInspector.SWRegistrationElement.VersionMode.Active],
    [ServiceWorkerAgent.ServiceWorkerVersionStatus.Activated, WebInspector.SWRegistrationElement.VersionMode.Active],
    [ServiceWorkerAgent.ServiceWorkerVersionStatus.Redundant, WebInspector.SWRegistrationElement.VersionMode.Redundant]]);

WebInspector.SWRegistrationElement.prototype = {
    /**
     * @param {!ServiceWorkerAgent.ServiceWorkerRegistration} registration
     */
    _updateRegistration: function(registration)
    {
        this._registration = registration;
        this._titleNode.textContent = WebInspector.UIString(registration.isDeleted ? "Scope: %s - deleted" : "Scope: %s", registration.scopeURL.asParsedURL().path);
        this._unregisterButton.style.display = registration.isDeleted? "none" : "block";
        this._updateVersionList();
    },

    /**
     * @param {!ServiceWorkerAgent.ServiceWorkerVersion} version
     */
    _updateVersion: function(version)
    {
        this._versions.set(version.versionId, version);
        this._updateVersionList();
    },

    /**
     * @param {!ServiceWorkerAgent.ServiceWorkerVersion} version
     */
    _deleteVersion: function(version)
    {
        if (this._versions.delete(version.versionId))
            this._updateVersionList();
    },

    _updateVersionList: function()
    {
        /** @type {!Map.<string, !Array.<!ServiceWorkerAgent.ServiceWorkerVersion>>} */
        var modeVersionArrayMap = new Map([
            [WebInspector.SWRegistrationElement.VersionMode.Installing, []],
            [WebInspector.SWRegistrationElement.VersionMode.Waiting, []],
            [WebInspector.SWRegistrationElement.VersionMode.Active, []],
            [WebInspector.SWRegistrationElement.VersionMode.Redundant, []]]);
        for (var version of this._versions.values()) {
            var mode = /** @type {string} */ (WebInspector.SWRegistrationElement.VersionStausToModeMap.get(version.status));
            modeVersionArrayMap.get(mode).push(version);
        }
        var fragment = createDocumentFragment();
        var tableElement = createElementWithClass("div", "service-workers-versions-table");
        tableElement.appendChild(this._createVersionModeRow(
            modeVersionArrayMap,
            WebInspector.SWRegistrationElement.VersionMode.Installing));
        tableElement.appendChild(this._createVersionModeRow(
            modeVersionArrayMap,
            WebInspector.SWRegistrationElement.VersionMode.Waiting));
        tableElement.appendChild(this._createVersionModeRow(
            modeVersionArrayMap,
            WebInspector.SWRegistrationElement.VersionMode.Active));
        tableElement.appendChild(this._createVersionModeRow(
            modeVersionArrayMap,
            WebInspector.SWRegistrationElement.VersionMode.Redundant));
        fragment.appendChild(tableElement);
        this._childrenListNode.removeChildren();
        this._childrenListNode.appendChild(fragment);
    },

    /**
     * @param {!Map.<string, !Array.<!ServiceWorkerAgent.ServiceWorkerVersion>>} modeVersionArrayMap
     * @param {string} mode
     */
    _createVersionModeRow: function(modeVersionArrayMap, mode)
    {
        var versionList = /** @type {!Array.<!ServiceWorkerAgent.ServiceWorkerVersion>} */(modeVersionArrayMap.get(mode));
        var modeRowElement = createElementWithClass("div", "service-workers-version-mode-row  service-workers-version-mode-row-" + mode);
        modeRowElement.createChild("div", "service-workers-version-mode").createChild("div", "service-workers-version-mode-text").createTextChild(mode);
        var versionsElement = modeRowElement.createChild("div", "service-workers-versions");
        for (var version of versionList) {
            var stateRowElement = versionsElement.createChild("div", "service-workers-version-row");
            var statusDiv = stateRowElement.createChild("div", "service-workers-version-status");
            statusDiv.createChild("div", "service-workers-version-status-text").createTextChild(version.status);
            var runningStatusDiv = stateRowElement.createChild("div", "service-workers-version-running-status");
            if (version.runningStatus == ServiceWorkerAgent.ServiceWorkerVersionRunningStatus.Running || version.runningStatus == ServiceWorkerAgent.ServiceWorkerVersionRunningStatus.Starting) {
                var stopButton = runningStatusDiv.createChild("button", "service-workers-button service-workers-stop-button service-workers-version-running-status-button");
                stopButton.addEventListener("click", this._stopButtonClicked.bind(this, version.versionId), false);
                stopButton.title = WebInspector.UIString("Stop");
            } else if (version.runningStatus == ServiceWorkerAgent.ServiceWorkerVersionRunningStatus.Stopped && !this._registration.isDeleted) {
                var startButton = runningStatusDiv.createChild("button", "service-workers-button service-workers-start-button service-workers-version-running-status-button");
                startButton.addEventListener("click", this._startButtonClicked.bind(this), false);
                startButton.title = WebInspector.UIString("Start");
            }
            runningStatusDiv.createChild("div", "service-workers-version-running-status-text").createTextChild(version.runningStatus);
            var scriptURLDiv = stateRowElement.createChild("div", "service-workers-version-script-url");
            scriptURLDiv.createChild("div", "service-workers-version-script-url-text").createTextChild(version.scriptURL.asParsedURL().path);
            if (version.runningStatus == ServiceWorkerAgent.ServiceWorkerVersionRunningStatus.Running || version.runningStatus == ServiceWorkerAgent.ServiceWorkerVersionRunningStatus.Starting) {
                var inspectButton = scriptURLDiv.createChild("span", "service-workers-version-inspect");
                inspectButton.createTextChild(WebInspector.UIString("inspect"));
                inspectButton.addEventListener("click", this._inspectButtonClicked.bind(this, version.versionId), false);
            }
        }
        if (versionList.length == 0) {
            var stateRowElement = versionsElement.createChild("div", "service-workers-version-row");
            stateRowElement.createChild("div", "service-workers-version-status");
            stateRowElement.createChild("div", "service-workers-version-running-status");
            stateRowElement.createChild("div", "service-workers-version-script-url");
        }
        return modeRowElement;
    },

    /**
     * @param {!Event} event
     */
    _unregisterButtonClicked: function(event)
    {
        this._manager.unregister(this._registration.scopeURL);
    },

    /**
     * @param {!Event} event
     */
    _startButtonClicked: function(event)
    {
        this._manager.startWorker(this._registration.scopeURL);
    },

    /**
     * @param {string} versionId
     * @param {!Event} event
     */
    _stopButtonClicked: function(versionId, event)
    {
        this._manager.stopWorker(versionId);
    },

    /**
     * @param {string} versionId
     * @param {!Event} event
     */
    _inspectButtonClicked: function(versionId, event)
    {
        this._manager.inspectWorker(versionId);
    }
}
