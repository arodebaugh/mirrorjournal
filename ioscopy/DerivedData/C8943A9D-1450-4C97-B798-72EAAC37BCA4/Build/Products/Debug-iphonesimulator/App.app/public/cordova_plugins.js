
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      {
          "id": "cordova-plugin-inappbrowser.inappbrowser",
          "file": "plugins/cordova-plugin-inappbrowser/www/inappbrowser.js",
          "pluginId": "cordova-plugin-inappbrowser",
        "clobbers": [
          "cordova.InAppBrowser.open"
        ]
        },
      {
          "id": "cordova-plugin-aes256-encryption.AES256",
          "file": "plugins/cordova-plugin-aes256-encryption/www/AES256.js",
          "pluginId": "cordova-plugin-aes256-encryption",
        "clobbers": [
          "cordova.plugins.AES256"
        ]
        },
      {
          "id": "cordova-plugin-email-composer.EmailComposer",
          "file": "plugins/cordova-plugin-email-composer/www/email_composer.js",
          "pluginId": "cordova-plugin-email-composer",
        "clobbers": [
          "cordova.plugins.email"
        ]
        },
      {
          "id": "cordova-plugin-badge.Badge",
          "file": "plugins/cordova-plugin-badge/www/badge.js",
          "pluginId": "cordova-plugin-badge",
        "clobbers": [
          "cordova.plugins.notification.badge"
        ]
        },
      {
          "id": "cordova-plugin-theme-detection.ThemeDetection",
          "file": "plugins/cordova-plugin-theme-detection/www/ThemeDetection.js",
          "pluginId": "cordova-plugin-theme-detection",
        "clobbers": [
          "cordova.plugins.ThemeDetection"
        ]
        },
      {
          "id": "cordova-plugin-device.device",
          "file": "plugins/cordova-plugin-device/www/device.js",
          "pluginId": "cordova-plugin-device",
        "clobbers": [
          "device"
        ]
        },
      {
          "id": "cordova-plugin-nativestorage.mainHandle",
          "file": "plugins/cordova-plugin-nativestorage/www/mainHandle.js",
          "pluginId": "cordova-plugin-nativestorage",
        "clobbers": [
          "NativeStorage"
        ]
        },
      {
          "id": "cordova-plugin-telerik-imagepicker.ImagePicker",
          "file": "plugins/cordova-plugin-telerik-imagepicker/www/imagepicker.js",
          "pluginId": "cordova-plugin-telerik-imagepicker",
        "clobbers": [
          "plugins.imagePicker"
        ]
        },
      {
          "id": "cordova-plugin-purchase.InAppPurchase",
          "file": "plugins/cordova-plugin-purchase/www/store-ios.js",
          "pluginId": "cordova-plugin-purchase",
        "clobbers": [
          "store"
        ]
        },
      {
          "id": "cordova-plugin-3dtouch.ThreeDeeTouch",
          "file": "plugins/cordova-plugin-3dtouch/www/ThreeDeeTouch.js",
          "pluginId": "cordova-plugin-3dtouch",
        "clobbers": [
          "ThreeDeeTouch"
        ]
        },
      {
          "id": "cordova-plugin-apprate.AppRate",
          "file": "plugins/cordova-plugin-apprate/www/AppRate.js",
          "pluginId": "cordova-plugin-apprate",
        "clobbers": [
          "AppRate",
          "window.AppRate"
        ]
        },
      {
          "id": "cordova-plugin-keychain-touch-id.TouchID",
          "file": "plugins/cordova-plugin-keychain-touch-id/www/touchid.js",
          "pluginId": "cordova-plugin-keychain-touch-id",
        "clobbers": [
          "window.plugins.touchid"
        ]
        },
      {
          "id": "cordova-plugin-apprate.locales",
          "file": "plugins/cordova-plugin-apprate/www/locales.js",
          "pluginId": "cordova-plugin-apprate",
        "runs": true
        },
      {
          "id": "cordova-plugin-apprate.storage",
          "file": "plugins/cordova-plugin-apprate/www/storage.js",
          "pluginId": "cordova-plugin-apprate",
        "runs": true
        },
      {
          "id": "cordova-plugin-nativestorage.LocalStorageHandle",
          "file": "plugins/cordova-plugin-nativestorage/www/LocalStorageHandle.js",
          "pluginId": "cordova-plugin-nativestorage"
        },
      {
          "id": "cordova-plugin-nativestorage.NativeStorageError",
          "file": "plugins/cordova-plugin-nativestorage/www/NativeStorageError.js",
          "pluginId": "cordova-plugin-nativestorage"
        },
      {
          "id": "cordova-plugin-dialogs.notification",
          "file": "plugins/cordova-plugin-dialogs/www/notification.js",
          "pluginId": "cordova-plugin-dialogs",
        "merges": [
          "navigator.notification"
        ]
        }
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      "cordova-plugin-3dtouch": "1.3.8",
      "cordova-plugin-aes256-encryption": "1.2.2",
      "cordova-plugin-apprate": "1.7.2",
      "cordova-plugin-badge": "0.8.9",
      "cordova-plugin-device": "2.1.0",
      "cordova-plugin-dialogs": "2.0.2",
      "cordova-plugin-email-composer": "0.9.2",
      "cordova-plugin-inappbrowser": "5.0.0",
      "cordova-plugin-keychain-touch-id": "3.2.1",
      "cordova-plugin-nativestorage": "2.3.2",
      "cordova-plugin-purchase": "10.6.1",
      "cordova-plugin-telerik-imagepicker": "2.3.5",
      "cordova-plugin-theme-detection": "1.3.0"
    };
    // BOTTOM OF METADATA
    });
    