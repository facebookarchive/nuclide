// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

WebInspector.OverridesUI = {}

/**
 * @return {!Element}
 */
WebInspector.OverridesUI.createDeviceSelect = function()
{
    var p = createElement("p");

    var deviceSelectElement = p.createChild("select");
    deviceSelectElement.addEventListener("change", deviceSelected, false);

    // This has to be object, not boolean, otherwise its value doesn't update properly.
    var emulatedSettingChangedMuted = { muted: false };
    WebInspector.overridesSupport.settings.emulateResolution.addChangeListener(emulatedSettingChanged);
    WebInspector.overridesSupport.settings.deviceWidth.addChangeListener(emulatedSettingChanged);
    WebInspector.overridesSupport.settings.deviceHeight.addChangeListener(emulatedSettingChanged);
    WebInspector.overridesSupport.settings.deviceScaleFactor.addChangeListener(emulatedSettingChanged);
    WebInspector.overridesSupport.settings.emulateMobile.addChangeListener(emulatedSettingChanged);
    WebInspector.overridesSupport.settings.emulateTouch.addChangeListener(emulatedSettingChanged);
    WebInspector.overridesSupport.settings.userAgent.addChangeListener(emulatedSettingChanged);

    WebInspector.emulatedDevicesList.addEventListener(WebInspector.EmulatedDevicesList.Events.CustomDevicesUpdated, deviceListChanged);
    WebInspector.emulatedDevicesList.addEventListener(WebInspector.EmulatedDevicesList.Events.StandardDevicesUpdated, deviceListChanged);
    WebInspector.emulatedDevicesList.maybeAutoUpdate();
    deviceListChanged();

    function deviceSelected()
    {
        if (deviceSelectElement.selectedIndex === 0)
            return;

        var option = deviceSelectElement.options[deviceSelectElement.selectedIndex];
        emulatedSettingChangedMuted.muted = true;
        WebInspector.overridesSupport.emulateDevice(option.overridesDevice);
        emulatedSettingChangedMuted.muted = false;
    }

    function emulatedSettingChanged()
    {
        if (emulatedSettingChangedMuted.muted)
            return;

        var index = 0;
        for (var i = 1; i < deviceSelectElement.options.length; ++i) {
            var option = deviceSelectElement.options[i];
            if (WebInspector.overridesSupport.isEmulatingDevice(option.overridesDevice)) {
                index = i;
                break;
            }
        }
        deviceSelectElement.selectedIndex = index;
    }

    function deviceListChanged()
    {
        deviceSelectElement.removeChildren();

        var selectDeviceOption = new Option(WebInspector.UIString("<Select model>"), WebInspector.UIString("<Select model>"));
        selectDeviceOption.device = {title: WebInspector.UIString("<Select model>"), width: 0, height: 0, deviceScaleFactor: 0, userAgent: "", touch: false, mobile: false};
        selectDeviceOption.disabled = true;
        deviceSelectElement.appendChild(selectDeviceOption);

        addGroup(WebInspector.UIString("Custom"), WebInspector.emulatedDevicesList.custom(), true);
        addGroup(WebInspector.UIString("Devices"), WebInspector.emulatedDevicesList.standard());

        /**
         * @param {string} name
         * @param {!Array.<!WebInspector.EmulatedDevice>} devices
         * @param {boolean=} custom
         */
        function addGroup(name, devices, custom)
        {
            devices = devices.filter(function (d) { return d.show(); });
            if (!devices.length)
                return;
            devices.sort(WebInspector.EmulatedDevice.compareByTitle);
            var groupElement = deviceSelectElement.createChild("optgroup");
            groupElement.label = name;
            for (var i = 0; i < devices.length; ++i) {
                var option = new Option(devices[i].title, devices[i].title);
                option.device = devices[i];
                option.overridesDevice = devices[i].toOverridesDevice();
                option.custom = custom;
                groupElement.appendChild(option);
            }
        }

        emulatedSettingChanged();
    }

    return p;
}

/**
 * @return {!Element}
 */
WebInspector.OverridesUI.createNetworkConditionsSelect = function()
{
    var networkConditionsSetting = WebInspector.overridesSupport.settings.networkConditions;
    var conditionsSelectElement = createElement("select");
    var presets = WebInspector.OverridesUI._networkConditionsPresets;
    for (var i = 0; i < presets.length; ++i) {
        var preset = presets[i];
        var throughput = preset.throughput | 0;
        var latency = preset.latency | 0;
        var isThrottling = (throughput > 0) || latency;
        if (!isThrottling) {
            conditionsSelectElement.add(new Option(preset.title, preset.id));
        } else {
            var throughputText = (throughput < 1024) ? WebInspector.UIString("%d Kbps", throughput) : WebInspector.UIString("%d Mbps", (throughput / 1024) | 0);
            var title = WebInspector.UIString("%s (%s %dms RTT)", preset.title, throughputText, latency);
            var option = new Option(title, preset.id);
            option.title = WebInspector.UIString("Maximum download throughput: %s.\r\nMinimum round-trip time: %dms.", throughputText, latency);
            conditionsSelectElement.add(option);
        }
    }

    settingChanged();
    networkConditionsSetting.addChangeListener(settingChanged);
    conditionsSelectElement.addEventListener("change", presetSelected, false);

    function presetSelected()
    {
        var selectedOption = conditionsSelectElement.options[conditionsSelectElement.selectedIndex];
        conditionsSelectElement.title = selectedOption.title;
        var presetId = selectedOption.value;
        var preset = presets[presets.length - 1];
        for (var i = 0; i < presets.length; ++i) {
            if (presets[i].id === presetId) {
                preset = presets[i];
                break;
            }
        }
        var kbps = 1024 / 8;
        networkConditionsSetting.removeChangeListener(settingChanged);
        networkConditionsSetting.set({throughput: preset.throughput * kbps, latency: preset.latency});
        networkConditionsSetting.addChangeListener(settingChanged);
    }

    function settingChanged()
    {
        var conditions = networkConditionsSetting.get();
        var presetIndex = presets.length - 1;
        var kbps = 1024 / 8;
        for (var i = 0; i < presets.length; ++i) {
            if (presets[i].throughput === conditions.throughput / kbps && presets[i].latency === conditions.latency) {
                presetIndex = i;
                break;
            }
        }
        conditionsSelectElement.selectedIndex = presetIndex;
        conditionsSelectElement.title = conditionsSelectElement.options[presetIndex].title;
    }

    return conditionsSelectElement;
}

/**
 * @return {{select: !Element, input: !Element}}
 */
WebInspector.OverridesUI.createUserAgentSelectAndInput = function()
{
    var userAgentSetting = WebInspector.overridesSupport.settings.userAgent;
    const noOverride = {title: WebInspector.UIString("No override"), value: ""};
    const customOverride = {title: WebInspector.UIString("Other"), value: "Other"};
    var userAgents = [noOverride].concat(WebInspector.OverridesUI._userAgents).concat([customOverride]);

    var userAgentSelectElement = createElement("select");
    for (var i = 0; i < userAgents.length; ++i)
        userAgentSelectElement.add(new Option(userAgents[i].title, userAgents[i].value));
    userAgentSelectElement.selectedIndex = 0;

    var otherUserAgentElement = createElement("input");
    otherUserAgentElement.type = "text";
    otherUserAgentElement.value = userAgentSetting.get();
    otherUserAgentElement.title = userAgentSetting.get();

    settingChanged();
    userAgentSetting.addChangeListener(settingChanged);
    userAgentSelectElement.addEventListener("change", userAgentSelected, false);

    otherUserAgentElement.addEventListener("dblclick", textDoubleClicked, true);
    otherUserAgentElement.addEventListener("blur", textChanged, false);
    otherUserAgentElement.addEventListener("keydown", textKeyDown, false);

    function userAgentSelected()
    {
        var value = userAgentSelectElement.options[userAgentSelectElement.selectedIndex].value;
        if (value !== customOverride.value) {
            userAgentSetting.removeChangeListener(settingChanged);
            userAgentSetting.set(value);
            userAgentSetting.addChangeListener(settingChanged);
            otherUserAgentElement.value = value;
            otherUserAgentElement.title = value;
            otherUserAgentElement.readOnly = true;
        } else {
            otherUserAgentElement.readOnly = false;
            otherUserAgentElement.focus();
        }
    }

    function settingChanged()
    {
        var value = userAgentSetting.get();
        var options = userAgentSelectElement.options;
        var selectionRestored = false;
        for (var i = 0; i < options.length; ++i) {
            if (options[i].value === value) {
                userAgentSelectElement.selectedIndex = i;
                selectionRestored = true;
                break;
            }
        }

        otherUserAgentElement.readOnly = selectionRestored;
        if (!selectionRestored)
            userAgentSelectElement.selectedIndex = options.length - 1;

        if (otherUserAgentElement.value !== value) {
            otherUserAgentElement.value = value;
            otherUserAgentElement.title = value;
        }
    }

    function textKeyDown(event)
    {
        if (isEnterKey(event))
            textChanged();
    }

    function textDoubleClicked()
    {
        userAgentSelectElement.selectedIndex = userAgents.length - 1;
        userAgentSelected();
    }

    function textChanged()
    {
        if (userAgentSetting.get() !== otherUserAgentElement.value)
            userAgentSetting.set(otherUserAgentElement.value);
    }

    return { select: userAgentSelectElement, input: otherUserAgentElement };
}

/** @type {!Array.<*>} */
WebInspector.OverridesUI._phones = [
    {title: "Apple iPhone 4", width: 320, height: 480, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_2_1 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148 Safari/6533.18.5", touch: true, mobile: true},
    {title: "Apple iPhone 5", width: 320, height: 568, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53", touch: true, mobile: true},
    {title: "Apple iPhone 6", width: 375, height: 667, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4", touch: true, mobile: true},
    {title: "Apple iPhone 6 Plus", width: 414, height: 736, deviceScaleFactor: 3, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4", touch: true, mobile: true},
    {title: "BlackBerry Z30", width: 360, height: 640, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (BB10; Touch) AppleWebKit/537.10+ (KHTML, like Gecko) Version/10.0.9.2372 Mobile Safari/537.10+", touch: true, mobile: true},
    {title: "Google Nexus 4", width: 384, height: 640, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (Linux; Android 4.4.4; en-us; Nexus 4 Build/JOP40D) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2307.2 Mobile Safari/537.36", touch: true, mobile: true},
    {title: "Google Nexus 5", width: 360, height: 640, deviceScaleFactor: 3, userAgent: "Mozilla/5.0 (Linux; Android 4.4.4; en-us; Nexus 5 Build/JOP40D) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2307.2 Mobile Safari/537.36", touch: true, mobile: true},
    {title: "LG Optimus L70", width: 384, height: 640, deviceScaleFactor: 1.25, userAgent: "Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; LGMS323 Build/KOT49I.MS32310c) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.1599.103 Mobile Safari/537.36", touch: true, mobile: true},
    {title: "Nokia N9", width: 360, height: 640, deviceScaleFactor: 1, userAgent: "Mozilla/5.0 (MeeGo; NokiaN9) AppleWebKit/534.13 (KHTML, like Gecko) NokiaBrowser/8.5.0 Mobile Safari/534.13", touch: true, mobile: true},
    {title: "Nokia Lumia 520", width: 320, height: 533, deviceScaleFactor: 1.4, userAgent: "Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 520)", touch: true, mobile: true},
    {title: "Samsung Galaxy S III", width: 360, height: 640, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (Linux; U; Android 4.0; en-us; GT-I9300 Build/IMM76D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30", touch: true, mobile: true},
    {title: "Samsung Galaxy S4", width: 360, height: 640, deviceScaleFactor: 3, userAgent: "Mozilla/5.0 (Linux; Android 4.4.2; GT-I9505 Build/JDQ39) AppleWebKit/537.36 (KHTML, like Gecko) Version/1.5 Chrome/28.0.1500.94 Mobile Safari/537.36", touch: true, mobile: true}
];

/** @type {!Array.<*>} */
WebInspector.OverridesUI._tablets = [
    {title: "Amazon Kindle Fire HDX", width: 2560, height: 1600, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (Linux; U; en-us; KFAPWI Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Silk/3.13 Safari/535.19 Silk-Accelerated=true", touch: true, mobile: true},
    {title: "Apple iPad Mini", width: 1024, height: 768, deviceScaleFactor: 1, userAgent: "Mozilla/5.0 (iPad; CPU OS 4_3_5 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8L1 Safari/6533.18.5", touch: true, mobile: true},
    {title: "Apple iPad", width: 1024, height: 768, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53", touch: true, mobile: true},
    {title: "BlackBerry PlayBook", width: 1024, height: 600, deviceScaleFactor: 1, userAgent: "Mozilla/5.0 (PlayBook; U; RIM Tablet OS 2.1.0; en-US) AppleWebKit/536.2+ (KHTML like Gecko) Version/7.2.1.0 Safari/536.2+", touch: true, mobile: true},
    {title: "Google Nexus 10", width: 1280, height: 800, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (Linux; Android 4.3; Nexus 10 Build/JSS15Q) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2307.2 Mobile Safari/537.36", touch: true, mobile: true},
    {title: "Google Nexus 7", width: 960, height: 600, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (Linux; Android 4.3; Nexus 7 Build/JSS15Q) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2307.2 Mobile Safari/537.36", touch: true, mobile: true},
    {title: "Samsung Galaxy Note 3", width: 360, height: 640, deviceScaleFactor: 3, userAgent: "Mozilla/5.0 (Linux; U; Android 4.3; en-us; SM-N900T Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30", touch: true, mobile: true},
    {title: "Samsung Galaxy Note II", width: 360, height: 640, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (Linux; U; Android 4.1; en-us; GT-N7100 Build/JRO03C) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30", touch: true, mobile: true}
];

/** @type {!Array.<*>} */
WebInspector.OverridesUI._notebooks = [
    {title: "Laptop with touch", width: 1280, height: 950, deviceScaleFactor: 1, userAgent: "", touch: true, mobile: false},
    {title: "Laptop with HiDPI screen", width: 1440, height: 900, deviceScaleFactor: 2, userAgent: "", touch: false, mobile: false},
    {title: "Laptop with MDPI screen", width: 1280, height: 800, deviceScaleFactor: 1, userAgent: "", touch: false, mobile: false}
];

/** @type {!Array.<!WebInspector.OverridesSupport.NetworkConditionsPreset>} */
WebInspector.OverridesUI._networkConditionsPresets = [
    {id: "offline", title: "Offline", throughput: 0, latency: 0},
    {id: "gprs", title: "GPRS", throughput: 50, latency: 500},
    {id: "edge", title: "Regular 2G", throughput: 250, latency: 300},
    {id: "2g+", title: "Good 2G", throughput: 450, latency: 150},
    {id: "3g", title: "Regular 3G", throughput: 750, latency: 100},
    {id: "3g+", title: "Good 3G", throughput: 1.5 * 1024, latency: 40},
    {id: "4g", title: "Regular 4G", throughput: 4 * 1024, latency: 20},
    {id: "dsl", title: "DSL", throughput: 2 * 1024, latency: 5},
    {id: "wifi", title: "WiFi", throughput: 30 * 1024, latency: 2},
    {id: "online", title: "No throttling", throughput: WebInspector.OverridesSupport.NetworkThroughputUnlimitedValue, latency: 0}
];

/** @type {!Array.<{title: string, value: string}>} */
WebInspector.OverridesUI._userAgents = [
    {title: "Android 4.0.2 \u2014 Galaxy Nexus", value: "Mozilla/5.0 (Linux; U; Android 4.0.2; en-us; Galaxy Nexus Build/ICL53F) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30"},
    {title: "Android 2.3 \u2014 Nexus S", value: "Mozilla/5.0 (Linux; U; Android 2.3.6; en-us; Nexus S Build/GRK39F) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"},
    {title: "BlackBerry \u2014 BB10", value: "Mozilla/5.0 (BB10; Touch) AppleWebKit/537.1+ (KHTML, like Gecko) Version/10.0.0.1337 Mobile Safari/537.1+"},
    {title: "BlackBerry \u2014 PlayBook 2.1", value: "Mozilla/5.0 (PlayBook; U; RIM Tablet OS 2.1.0; en-US) AppleWebKit/536.2+ (KHTML, like Gecko) Version/7.2.1.0 Safari/536.2+"},
    {title: "BlackBerry \u2014 9900", value: "Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en-US) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.0.0.187 Mobile Safari/534.11+"},
    {title: "Chrome 31 \u2014 Mac", value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36"},
    {title: "Chrome 31 \u2014 Windows", value: "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.16 Safari/537.36"},
    {title: "Chrome \u2014 Android Tablet", value: "Mozilla/5.0 (Linux; Android 4.1.2; Nexus 7 Build/JZ054K) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Safari/535.19"},
    {title: "Chrome \u2014 Android Mobile", value: "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19"},
    {title: "Chrome \u2014 iPad", value: "Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) CriOS/30.0.1599.12 Mobile/11A465 Safari/8536.25"},
    {title: "Chrome \u2014 iPhone", value: "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0_2 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) CriOS/30.0.1599.12 Mobile/11A501 Safari/8536.25"},
    {title: "Firefox 14 \u2014 Android Mobile", value: "Mozilla/5.0 (Android; Mobile; rv:14.0) Gecko/14.0 Firefox/14.0"},
    {title: "Firefox 14 \u2014 Android Tablet", value: "Mozilla/5.0 (Android; Tablet; rv:14.0) Gecko/14.0 Firefox/14.0"},
    {title: "Firefox 4 \u2014 Mac", value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:2.0.1) Gecko/20100101 Firefox/4.0.1"},
    {title: "Firefox 4 \u2014 Windows", value: "Mozilla/5.0 (Windows NT 6.1; rv:2.0.1) Gecko/20100101 Firefox/4.0.1"},
    {title: "Firefox 7 \u2014 Mac", value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:7.0.1) Gecko/20100101 Firefox/7.0.1"},
    {title: "Firefox 7 \u2014 Windows", value: "Mozilla/5.0 (Windows NT 6.1; Intel Mac OS X 10.6; rv:7.0.1) Gecko/20100101 Firefox/7.0.1"},
    {title: "Googlebot", value: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"},
    {title: "Googlebot Smartphone", value: "Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"},
    {title: "Internet Explorer 10", value: "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)"},
    {title: "Internet Explorer 7", value: "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)"},
    {title: "Internet Explorer 8", value: "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)"},
    {title: "Internet Explorer 9", value: "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)"},
    {title: "iPad \u2014 iOS 8", value: "Mozilla/5.0 (iPad; CPU OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4"},
    {title: "iPad \u2014 iOS 7", value: "Mozilla/5.0 (iPad; CPU OS 7_0_2 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A501 Safari/9537.53"},
    {title: "iPad \u2014 iOS 6", value: "Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25"},
    {title: "iPhone \u2014 iOS 8", value: "Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4"},
    {title: "iPhone \u2014 iOS 7", value: "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0_2 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A4449d Safari/9537.53"},
    {title: "iPhone \u2014 iOS 6", value: "Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25"},
    {title: "MeeGo \u2014 Nokia N9", value: "Mozilla/5.0 (MeeGo; NokiaN9) AppleWebKit/534.13 (KHTML, like Gecko) NokiaBrowser/8.5.0 Mobile Safari/534.13"},
    {title: "Opera 18 \u2014 Mac", value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36 OPR/18.0.1284.68"},
    {title: "Opera 18 \u2014 Windows", value: "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36 OPR/18.0.1284.68"},
    {title: "Opera 12 \u2014 Mac", value: "Opera/9.80 (Macintosh; Intel Mac OS X 10.9.1) Presto/2.12.388 Version/12.16"},
    {title: "Opera 12 \u2014 Windows", value: "Opera/9.80 (Windows NT 6.1) Presto/2.12.388 Version/12.16"},
    {title: "Silk \u2014 Kindle Fire (Desktop view)", value: "Mozilla/5.0 (Linux; U; en-us; KFTHWI Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Silk/3.13 Safari/535.19 Silk-Accelerated=true"},
    {title: "Silk \u2014 Kindle Fire (Mobile view)", value: "Mozilla/5.0 (Linux; U; Android 4.2.2; en-us; KFTHWI Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Silk/3.13 Mobile Safari/535.19 Silk-Accelerated=true"}
];
