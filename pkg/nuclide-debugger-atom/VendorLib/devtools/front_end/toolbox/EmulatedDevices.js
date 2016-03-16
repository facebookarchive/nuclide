// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @constructor
 */
WebInspector.EmulatedDevice = function()
{
    /** @type {string} */
    this.title = "";
    /** @type {string} */
    this.type = WebInspector.EmulatedDevice.Type.Unknown;
    /** @type {!WebInspector.EmulatedDevice.Orientation} */
    this.vertical = {width: 0, height: 0, outlineInsets: null, outlineImages: null};
    /** @type {!WebInspector.EmulatedDevice.Orientation} */
    this.horizontal = {width: 0, height: 0, outlineInsets: null, outlineImages: null};
    /** @type {number} */
    this.deviceScaleFactor = 1;
    /** @type {!Array.<string>} */
    this.capabilities = [WebInspector.EmulatedDevice.Capability.Touch, WebInspector.EmulatedDevice.Capability.Mobile];
    /** @type {string} */
    this.userAgent = "";
    /** @type {!Array.<!WebInspector.EmulatedDevice.Mode>} */
    this.modes = [];

    /** @type {string} */
    this._show = WebInspector.EmulatedDevice._Show.Default;
    /** @type {boolean} */
    this._showByDefault = true;
}

/** @typedef {!{title: string, orientation: string, pageRect: !WebInspector.Geometry.Rect, images: !WebInspector.EmulatedDevice.Images}} */
WebInspector.EmulatedDevice.Mode;

/** @typedef {!{width: number, height: number, outlineInsets: ?WebInspector.Geometry.Insets, outlineImages: ?WebInspector.EmulatedDevice.Images}} */
WebInspector.EmulatedDevice.Orientation;

WebInspector.EmulatedDevice.Horizontal = "horizontal";
WebInspector.EmulatedDevice.Vertical = "vertical";

WebInspector.EmulatedDevice.Type = {
    Phone: "phone",
    Tablet: "tablet",
    Notebook: "notebook",
    Desktop: "desktop",
    Unknown: "unknown"
}

WebInspector.EmulatedDevice.Capability = {
    Touch: "touch",
    Mobile: "mobile"
}

WebInspector.EmulatedDevice._Show = {
    Always: "Always",
    Default: "Default",
    Never: "Never"
}

/**
 * @param {*} json
 * @return {?WebInspector.EmulatedDevice}
 */
WebInspector.EmulatedDevice.fromJSONV1 = function(json)
{
    try {
        /**
         * @param {*} object
         * @param {string} key
         * @param {string} type
         * @param {*=} defaultValue
         * @return {*}
         */
        function parseValue(object, key, type, defaultValue)
        {
            if (typeof object !== "object" || object === null || !object.hasOwnProperty(key)) {
                if (typeof defaultValue !== "undefined")
                    return defaultValue;
                throw new Error("Emulated device is missing required property '" + key + "'");
            }
            var value = object[key];
            if (typeof value !== type || value === null)
                throw new Error("Emulated device property '" + key + "' has wrong type '" + typeof value + "'");
            return value;
        }

        /**
         * @param {*} object
         * @param {string} key
         * @return {number}
         */
        function parseIntValue(object, key)
        {
            var value = /** @type {number} */ (parseValue(object, key, "number"));
            if (value !== Math.abs(value))
                throw new Error("Emulated device value '" + key + "' must be integer");
            return value;
        }

        /**
         * @param {*} json
         * @return {!WebInspector.Geometry.Rect}
         */
        function parseIntRect(json)
        {
            var result = {};
            result.top = parseIntValue(json, "top");
            result.left = parseIntValue(json, "left");
            result.width = parseIntValue(json, "width");
            result.height = parseIntValue(json, "height");
            return /** @type {!WebInspector.Geometry.Rect} */ (result);
        }

        /**
         * @param {*} json
         * @return {?WebInspector.Geometry.Insets}
         */
        function parseIntInsets(json)
        {
            if (json === null)
                return null;
            var result = {};
            result.top = parseIntValue(json, "top");
            result.left = parseIntValue(json, "left");
            return /** @type {?WebInspector.Geometry.Insets} */ (result);
        }

        /**
         * @param {*} json
         * @return {!WebInspector.EmulatedDevice.Images}
         */
        function parseImages(json)
        {
            if (!Array.isArray(json))
                throw new Error("Emulated device images is not an array");
            var result = new WebInspector.EmulatedDevice.Images();
            for (var i = 0; i < json.length; ++i) {
                var src = /** @type {string} */ (parseValue(json[i], "src", "string"));
                var scale = /** @type {number} */ (parseValue(json[i], "scale", "number"));
                if (scale <= 0)
                    throw new Error("Emulated device property image scale must be positive");
                result.addSource(src, scale);
            }
            return result;
        }

        /**
         * @param {*} json
         * @return {!WebInspector.EmulatedDevice.Orientation}
         */
        function parseOrientation(json)
        {
            var result = {};

            result.width = parseIntValue(json, "width");
            if (result.width < 0 || result.width > WebInspector.OverridesSupport.MaxDeviceSize)
                throw new Error("Emulated device has wrong width: " + result.width);

            result.height = parseIntValue(json, "height");
            if (result.height < 0 || result.height > WebInspector.OverridesSupport.MaxDeviceSize)
                throw new Error("Emulated device has wrong height: " + result.height);

            result.outlineInsets = parseIntInsets(parseValue(json["outline"], "insets", "object", null));
            if (result.outlineInsets) {
                if (result.outlineInsets.left < 0 || result.outlineInsets.top < 0)
                    throw new Error("Emulated device has wrong outline insets");
                result.outlineImages = parseImages(parseValue(json["outline"], "images", "object"));
            }

            return /** @type {!WebInspector.EmulatedDevice.Orientation} */ (result);
        }

        var result = new WebInspector.EmulatedDevice();
        result.title = /** @type {string} */ (parseValue(json, "title", "string"));
        result.type = /** @type {string} */ (parseValue(json, "type", "string"));
        result.userAgent = /** @type {string} */ (parseValue(json, "user-agent", "string"));

        var capabilities = parseValue(json, "capabilities", "object", []);
        if (!Array.isArray(capabilities))
            throw new Error("Emulated device capabilities must be an array");
        result.capabilities = [];
        for (var i = 0; i < capabilities.length; ++i) {
            if (typeof capabilities[i] !== "string")
                throw new Error("Emulated device capability must be a string");
            result.capabilities.push(capabilities[i]);
        }

        result.deviceScaleFactor = /** @type {number} */ (parseValue(json["screen"], "device-pixel-ratio", "number"));
        if (result.deviceScaleFactor < 0 || result.deviceScaleFactor > 100)
            throw new Error("Emulated device has wrong deviceScaleFactor: " + result.deviceScaleFactor);

        result.vertical = parseOrientation(parseValue(json["screen"], "vertical", "object"));
        result.horizontal = parseOrientation(parseValue(json["screen"], "horizontal", "object"));

        var modes = parseValue(json, "modes", "object", []);
        if (!Array.isArray(modes))
            throw new Error("Emulated device modes must be an array");
        result.modes = [];
        for (var i = 0; i < modes.length; ++i) {
            var mode = {};
            mode.title = /** @type {string} */ (parseValue(modes[i], "title", "string"));
            mode.orientation = /** @type {string} */ (parseValue(modes[i], "orientation", "string"));
            if (mode.orientation !== WebInspector.EmulatedDevice.Vertical && mode.orientation !== WebInspector.EmulatedDevice.Horizontal)
                throw new Error("Emulated device mode has wrong orientation '" + mode.orientation + "'");
            var orientation = result.orientationByName(mode.orientation);
            mode.pageRect = parseIntRect(parseValue(modes[i], "page-rect", "object"));
            if (mode.pageRect.top < 0 || mode.pageRect.left < 0 || mode.pageRect.width < 0 || mode.pageRect.height < 0 ||
                mode.pageRect.top + mode.pageRect.height > orientation.height || mode.pageRect.left + mode.pageRect.width > orientation.width) {
                throw new Error("Emulated device mode '" + mode.title + "'has wrong page rect");
            }
            mode.images = parseImages(parseValue(modes[i], "images", "object"));
            result.modes.push(mode);
        }

        result._showByDefault = /** @type {boolean} */ (parseValue(json, "show-by-default", "boolean", true));
        result._show = /** @type {string} */ (parseValue(json, "show", "string", WebInspector.EmulatedDevice._Show.Default));

        return result;
    } catch (e) {
        WebInspector.console.error("Failed to update emulated device list. " + String(e));
        return null;
    }
}

/**
 * @param {!WebInspector.OverridesSupport.Device} device
 * @param {string} title
 * @param {string=} type
 * @return {!WebInspector.EmulatedDevice}
 */
WebInspector.EmulatedDevice.fromOverridesDevice = function(device, title, type)
{
    var result = new WebInspector.EmulatedDevice();
    result.title = title;
    result.type = type || WebInspector.EmulatedDevice.Type.Unknown;
    result.vertical.width = device.width;
    result.vertical.height = device.height;
    result.horizontal.width = device.height;
    result.horizontal.height = device.width;
    result.deviceScaleFactor = device.deviceScaleFactor;
    result.userAgent = device.userAgent;
    if (device.touch)
        result.capabilities.push(WebInspector.EmulatedDevice.Capability.Touch);
    if (device.mobile)
        result.capabilities.push(WebInspector.EmulatedDevice.Capability.Mobile);
    return result;
}

/**
 * @param {!WebInspector.EmulatedDevice} device1
 * @param {!WebInspector.EmulatedDevice} device2
 * @return {number}
 */
WebInspector.EmulatedDevice.compareByTitle = function(device1, device2)
{
    return device1.title < device2.title ? -1 : (device1.title > device2.title ? 1 : 0);
}

WebInspector.EmulatedDevice.prototype = {
    /**
     * @return {*}
     */
    _toJSON: function()
    {
        var json = {};
        json["title"] = this.title;
        json["type"] = this.type;
        json["user-agent"] = this.userAgent;
        json["capabilities"] = this.capabilities;

        json["screen"] = {};
        json["screen"]["device-pixel-ratio"] = this.deviceScaleFactor;
        json["screen"]["vertical"] = this._orientationToJSON(this.vertical);
        json["screen"]["horizontal"] = this._orientationToJSON(this.horizontal);

        json["modes"] = [];
        for (var i = 0; i < this.modes.length; ++i) {
            var mode = {};
            mode["title"] = this.modes[i].title;
            mode["orientation"] = this.modes[i].orientation;
            mode["page-rect"] = this.modes[i].pageRect;
            mode["images"] = this.modes[i].images._toJSON();
            json["modes"].push(mode);
        }

        json["show-by-default"] = this._showByDefault;
        json["show"] = this._show;

        return json;
    },

    /**
     * @param {!WebInspector.EmulatedDevice.Orientation} orientation
     * @return {*}
     */
    _orientationToJSON: function(orientation)
    {
        var json = {};
        json["width"] = orientation.width;
        json["height"] = orientation.height;
        if (orientation.outlineInsets) {
            json["outline"] = {};
            json["outline"]["insets"] = orientation.outlineInsets;
            json["outline"]["images"] = orientation.outlineImages._toJSON();
        }
        return json;
    },

    /**
     * @return {!WebInspector.OverridesSupport.Device}
     */
    toOverridesDevice: function()
    {
        var result = {};
        result.width = this.vertical.width;
        result.height = this.vertical.height;
        result.deviceScaleFactor = this.deviceScaleFactor;
        result.userAgent = this.userAgent;
        result.touch = this.touch();
        result.mobile = this.mobile();
        return result;
    },

    /**
     * @param {string} name
     * @return {!WebInspector.EmulatedDevice.Orientation}
     */
    orientationByName: function(name)
    {
        return name === WebInspector.EmulatedDevice.Vertical ? this.vertical : this.horizontal;
    },

    /**
     * @return {boolean}
     */
    show: function()
    {
        if (this._show === WebInspector.EmulatedDevice._Show.Default)
            return this._showByDefault;
        return this._show === WebInspector.EmulatedDevice._Show.Always;
    },

    /**
     * @param {boolean} show
     */
    setShow: function(show)
    {
        this._show = show ? WebInspector.EmulatedDevice._Show.Always : WebInspector.EmulatedDevice._Show.Never;
    },

    /**
     * @param {!WebInspector.EmulatedDevice} other
     */
    copyShowFrom: function(other)
    {
        this._show = other._show;
    },

    /**
     * @return {boolean}
     */
    touch: function()
    {
        return this.capabilities.indexOf(WebInspector.EmulatedDevice.Capability.Touch) !== -1;
    },

    /**
     * @return {boolean}
     */
    mobile: function()
    {
        return this.capabilities.indexOf(WebInspector.EmulatedDevice.Capability.Mobile) !== -1;
    }
}


/**
 * @constructor
 * @extends {WebInspector.Object}
 */
WebInspector.EmulatedDevice.Images = function()
{
    WebInspector.Object.call(this);
    this._sources = [];
    this._scales = [];
}

WebInspector.EmulatedDevice.Images.Events = {
    Update: "Update"
}

WebInspector.EmulatedDevice.Images.prototype = {
    /**
     * @return {*}
     */
    _toJSON: function()
    {
        var result = [];
        for (var i = 0; i < this._sources.length; ++i)
            result.push({src: this._sources[i], scale: this._scales[i]});
        return result;
    },

    /**
     * @param {string} src
     * @param {number} scale
     */
    addSource: function(src, scale)
    {
        this._sources.push(src);
        this._scales.push(scale);
    },

    __proto__: WebInspector.Object.prototype
}


/**
 * @constructor
 * @extends {WebInspector.Object}
 */
WebInspector.EmulatedDevicesList = function()
{
    WebInspector.Object.call(this);

    /**
     * @param {!Array.<*>} list
     * @param {string} type
     * @return {!Array.<*>}
     */
    function convert(list, type)
    {
        var result = [];
        for (var i = 0; i < list.length; ++i) {
            var device = WebInspector.EmulatedDevice.fromOverridesDevice(/** @type {!WebInspector.OverridesSupport.Device} */ (list[i]), list[i].title, type);
            result.push(device._toJSON());
        }
        return result;
    }

    // FIXME: shrink default list once external list is good enough.
    var defaultValue = convert(WebInspector.OverridesUI._phones, "phone")
        .concat(convert(WebInspector.OverridesUI._tablets, "tablet"))
        .concat(convert(WebInspector.OverridesUI._notebooks, "notebook"));

    /** @type {!WebInspector.Setting} */
    this._standardSetting = WebInspector.settings.createSetting("standardEmulatedDeviceList", defaultValue);
    /** @type {!Array.<!WebInspector.EmulatedDevice>} */
    this._standard = this._listFromJSONV1(this._standardSetting.get());

    /** @type {!WebInspector.Setting} */
    this._customSetting = WebInspector.settings.createSetting("customEmulatedDeviceList", []);
    /** @type {!Array.<!WebInspector.EmulatedDevice>} */
    this._custom = this._listFromJSONV1(this._customSetting.get());

    /** @type {!WebInspector.Setting} */
    this._lastUpdatedSetting = WebInspector.settings.createSetting("lastUpdatedDeviceList", null);

    /** @type {boolean} */
    this._updating = false;
}

WebInspector.EmulatedDevicesList.Events = {
    CustomDevicesUpdated: "CustomDevicesUpdated",
    IsUpdatingChanged: "IsUpdatingChanged",
    StandardDevicesUpdated: "StandardDevicesUpdated"
}

WebInspector.EmulatedDevicesList._DevicesJsonUrl = "https://api.github.com/repos/GoogleChrome/devtools-device-data/contents/devices.json?ref=release";
WebInspector.EmulatedDevicesList._UpdateIntervalMs = 24 * 60 * 60 * 1000;

WebInspector.EmulatedDevicesList.prototype = {
    /**
     * @param {!Array.<*>} jsonArray
     * @return {!Array.<!WebInspector.EmulatedDevice>}
     */
    _listFromJSONV1: function(jsonArray)
    {
        var result = [];
        if (!Array.isArray(jsonArray))
            return result;
        for (var i = 0; i < jsonArray.length; ++i) {
            var device = WebInspector.EmulatedDevice.fromJSONV1(jsonArray[i]);
            if (device)
                result.push(device);
        }
        return result;
    },

    /**
     * @return {!Array.<!WebInspector.EmulatedDevice>}
     */
    standard: function()
    {
        return this._standard;
    },

    /**
     * @return {!Array.<!WebInspector.EmulatedDevice>}
     */
    custom: function()
    {
        return this._custom;
    },

    /**
     * @param {!WebInspector.EmulatedDevice} device
     */
    addCustomDevice: function(device)
    {
        this._custom.push(device);
        this.saveCustomDevices();
    },

    /**
     * @param {!WebInspector.EmulatedDevice} device
     */
    removeCustomDevice: function(device)
    {
        this._custom.remove(device);
        this.saveCustomDevices();
    },

    saveCustomDevices: function()
    {
        var json = this._custom.map(/** @param {!WebInspector.EmulatedDevice} device */ function(device) { return device._toJSON(); });
        this._customSetting.set(json);
        this.dispatchEventToListeners(WebInspector.EmulatedDevicesList.Events.CustomDevicesUpdated);
    },

    saveStandardDevices: function()
    {
        var json = this._standard.map(/** @param {!WebInspector.EmulatedDevice} device */ function(device) { return device._toJSON(); });
        this._standardSetting.set(json);
        this.dispatchEventToListeners(WebInspector.EmulatedDevicesList.Events.StandardDevicesUpdated);
    },

    update: function()
    {
        if (this._updating)
            return;

        this._updating = true;
        this.dispatchEventToListeners(WebInspector.EmulatedDevicesList.Events.IsUpdatingChanged);

        /**
         * @param {*} json
         * @return {!Promise.<string>}
         */
        function decodeBase64Content(json)
        {
            return loadXHR("data:application/json;charset=utf-8;base64," + json.content);
        }

        /**
         * FIXME: promise chain below does not compile with JSON.parse.
         * @return {*}
         */
        function myJsonParse(json)
        {
            return JSON.parse(json);
        }

        loadXHR(WebInspector.EmulatedDevicesList._DevicesJsonUrl)
            .then(JSON.parse)
            .then(decodeBase64Content)
            .then(myJsonParse)
            .then(this._parseUpdatedDevices.bind(this))
            .then(this._updateFinished.bind(this))
            .catch(this._updateFailed.bind(this));
    },

    maybeAutoUpdate: function()
    {
        if (!Runtime.experiments.isEnabled("externalDeviceList"))
            return;
        var lastUpdated = this._lastUpdatedSetting.get();
        if (lastUpdated && (Date.now() - lastUpdated < WebInspector.EmulatedDevicesList._UpdateIntervalMs))
            return;
        this.update();
    },

    /**
     * @param {*} json
     */
    _parseUpdatedDevices: function(json)
    {
        if (!json || typeof json !== "object") {
            WebInspector.console.error("Malfromed device list");
            return;
        }
        if (!("version" in json) || typeof json["version"] !== "number") {
            WebInspector.console.error("Device list does not specify version");
            return;
        }
        var version = json["version"];
        if (version === 1) {
            this._parseDevicesV1(json);
            return;
        }
        WebInspector.console.error("Unsupported device list version '" + version + "'");
    },

    /**
     * @param {*} json
     */
    _parseDevicesV1: function(json)
    {
        if (!("devices" in json)) {
            WebInspector.console.error("Malfromed device list");
            return;
        }
        var devices = json["devices"];
        if (!Array.isArray(devices)) {
            WebInspector.console.error("Malfromed device list");
            return;
        }

        devices = this._listFromJSONV1(devices);
        this._copyShowValues(this._standard, devices);
        this._standard = devices;
        this.saveStandardDevices();
        WebInspector.console.log("Device list updated successfully");
    },

    _updateFailed: function()
    {
        WebInspector.console.error("Cannot update device list");
        this._updateFinished();
    },

    _updateFinished: function()
    {
        this._updating = false;
        this._lastUpdatedSetting.set(Date.now());
        this.dispatchEventToListeners(WebInspector.EmulatedDevicesList.Events.IsUpdatingChanged);
    },

    /**
     * @param {!Array.<!WebInspector.EmulatedDevice>} from
     * @param {!Array.<!WebInspector.EmulatedDevice>} to
     */
    _copyShowValues: function(from, to)
    {
        var deviceById = new Map();
        for (var i = 0; i < from.length; ++i)
            deviceById.set(from[i].title, from[i]);

        for (var i = 0; i < to.length; ++i) {
            var title = to[i].title;
            if (deviceById.has(title))
                to[i].copyShowFrom(/** @type {!WebInspector.EmulatedDevice} */ (deviceById.get(title)));
        }
    },

    /**
     * @return {boolean}
     */
    isUpdating: function()
    {
        return this._updating;
    },

    __proto__: WebInspector.Object.prototype
}

/** @type {!WebInspector.EmulatedDevicesList} */
WebInspector.emulatedDevicesList;
