#ifdef __OBJC__
#import <UIKit/UIKit.h>
#else
#ifndef FOUNDATION_EXPORT
#if defined(__cplusplus)
#define FOUNDATION_EXPORT extern "C"
#else
#define FOUNDATION_EXPORT extern
#endif
#endif
#endif

#import "AppDelegate+threedeetouch.h"
#import "ThreeDeeTouch.h"
#import "AES256-Plugin-Bridging-Header.h"
#import "CDVAppRate.h"
#import "APPBadge.h"
#import "CDVDevice.h"
#import "CDVNotification.h"
#import "APPEmailComposer.h"
#import "APPEmailComposerImpl.h"
#import "CDVInAppBrowserNavigationController.h"
#import "CDVInAppBrowserOptions.h"
#import "CDVWKInAppBrowser.h"
#import "CDVWKInAppBrowserUIDelegate.h"
#import "KeychainWrapper.h"
#import "TouchID.h"
#import "NativeStorage.h"
#import "FileUtility.h"
#import "InAppPurchase.h"
#import "SKProduct+LocalizedPrice.h"
#import "SKProductDiscount+LocalizedPrice.h"
#import "FeHourGlass.h"
#import "GMAlbumsViewCell.h"
#import "GMAlbumsViewController.h"
#import "GMFetchItem.h"
#import "GMGridViewCell.h"
#import "GMGridViewController.h"
#import "GMImagePickerController.h"
#import "GMPHAsset.h"
#import "PSYBlockTimer.h"
#import "SOSPicker.h"
#import "UIImage+fixOrientation.h"

FOUNDATION_EXPORT double CordovaPluginsVersionNumber;
FOUNDATION_EXPORT const unsigned char CordovaPluginsVersionString[];

