package com.dailyinternetoffer.bd;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;
import com.onesignal.OneSignal;
import com.onesignal.debug.LogLevel;
import com.onesignal.Continue;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "AlMayadinDeepLink";
    private static final String ONESIGNAL_APP_ID = "d28392ee-2a0f-4f62-ba65-03fb3e0915ab";
    private static final int PERMISSION_REQUEST_CODE = 1010;

    private VideoWebChromeClient videoChromeClient;

    public class VideoWebChromeClient extends BridgeWebChromeClient {
        private View customView;
        private WebChromeClient.CustomViewCallback customViewCallback;
        private FrameLayout customViewContainer;
        private int originalSystemUiVisibility;
        private int originalOrientation;

        public VideoWebChromeClient(Bridge bridge) {
            super(bridge);
        }

        @Override
        public void onShowCustomView(View view, WebChromeClient.CustomViewCallback callback) {
            if (customView != null) {
                onHideCustomView();
                return;
            }

            customView = view;
            customViewCallback = callback;
            originalOrientation = getRequestedOrientation();
            originalSystemUiVisibility = getWindow().getDecorView().getSystemUiVisibility();

            if (customViewContainer == null) {
                customViewContainer = new FrameLayout(MainActivity.this);
                customViewContainer.setBackgroundColor(0xFF000000); // Black background to avoid flickering
                ViewGroup decor = (ViewGroup) getWindow().getDecorView();
                decor.addView(customViewContainer, new ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                ));
            }

            customViewContainer.addView(view, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            ));
            customViewContainer.setVisibility(View.VISIBLE);

            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().setVisibility(View.GONE);
            }

            // Enter immersive fullscreen
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            );
        }

        @Override
        public void onHideCustomView() {
            if (customView == null) return;

            getWindow().getDecorView().setSystemUiVisibility(originalSystemUiVisibility);
            setRequestedOrientation(originalOrientation);

            if (customViewContainer != null) {
                customViewContainer.removeView(customView);
                customViewContainer.setVisibility(View.GONE);
            }

            if (customViewCallback != null) {
                try {
                    customViewCallback.onCustomViewHidden();
                } catch (Exception ignored) {}
                customViewCallback = null;
            }

            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().setVisibility(View.VISIBLE);
            }

            customView = null;
        }

        public boolean isCustomViewShowing() {
            return customView != null;
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Process any cold-start Deep Link Intent
        handleDeepLinkIntent(getIntent());

        try {
            // Set LogLevel
            OneSignal.getDebug().setLogLevel(LogLevel.WARN);

            // Initialize OneSignal natively for all users who install the Android app
            OneSignal.initWithContext(this, ONESIGNAL_APP_ID);

            // Prompt users for notification permission on Android 13+
            OneSignal.getNotifications().requestPermission(true, Continue.none());

            // Handle Notification Clicks to route directly to Deep Link or Product Details
            OneSignal.getNotifications().addClickListener(event -> {
                try {
                    String deepLink = null;
                    if (event != null && event.getNotification() != null && event.getNotification().getAdditionalData() != null) {
                        org.json.JSONObject data = event.getNotification().getAdditionalData();
                        if (data.has("deep_link")) {
                            deepLink = data.optString("deep_link");
                        } else if (data.has("productId")) {
                            deepLink = "almayadinbazar://product/" + data.optString("productId");
                        }
                    }
                    if (deepLink != null && getBridge() != null && getBridge().getWebView() != null) {
                        final String finalLink = deepLink;
                        getBridge().getWebView().post(new Runnable() {
                            @Override
                            public void run() {
                                String js = "if (window.__handleNativeDeepLink) { window.__handleNativeDeepLink('" + finalLink.replace("'", "\\'") + "'); }";
                                getBridge().getWebView().evaluateJavascript(js, null);
                            }
                        });
                    }
                } catch (Exception ex) {
                    Log.w(TAG, "Notification click deep link error: " + ex.getMessage());
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Configure WebView for hardware accelerated HTML5 video & audio playback
        try {
            WebView webView = getBridge() != null ? getBridge().getWebView() : null;
            if (webView != null) {
                WebSettings settings = webView.getSettings();
                settings.setMediaPlaybackRequiresUserGesture(false);
                settings.setJavaScriptEnabled(true);
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);
                settings.setAllowFileAccess(true);
                settings.setAllowContentAccess(true);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
                }

                // Force hardware accelerated layer for video rendering
                webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
                webView.setBackgroundColor(0xFFFFFFFF);

                // Set enhanced video WebChromeClient with fullscreen attach/detach support
                videoChromeClient = new VideoWebChromeClient(getBridge());
                webView.setWebChromeClient(videoChromeClient);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to configure hardware-accelerated video webview: " + e.getMessage());
        }

        // Request runtime permissions: Camera, Location, Notifications
        requestRequiredPermissions();
    }

    @Override
    public void onBackPressed() {
        if (videoChromeClient != null && videoChromeClient.isCustomViewShowing()) {
            videoChromeClient.onHideCustomView();
            return;
        }
        super.onBackPressed();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleDeepLinkIntent(intent);
    }

    private void handleDeepLinkIntent(Intent intent) {
        if (intent == null) return;
        Uri data = intent.getData();
        if (data != null) {
            String uriString = data.toString();
            Log.d(TAG, "Native Deep Link Received: " + uriString);
            try {
                // If Bridge and WebView are ready, notify JavaScript directly
                if (getBridge() != null && getBridge().getWebView() != null) {
                    final String js = "if (window.__handleNativeDeepLink) { window.__handleNativeDeepLink('" + uriString.replace("'", "\\'") + "'); }";
                    getBridge().getWebView().post(new Runnable() {
                        @Override
                        public void run() {
                            getBridge().getWebView().evaluateJavascript(js, null);
                        }
                    });
                }
            } catch (Exception e) {
                Log.w(TAG, "Failed to dispatch deep link to WebView: " + e.getMessage());
            }
        }
    }

    private void requestRequiredPermissions() {
        try {
            List<String> permissionsNeeded = new ArrayList<>();

            // 1. Camera Permission
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                permissionsNeeded.add(Manifest.permission.CAMERA);
            }

            // 2. Location Permissions
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                permissionsNeeded.add(Manifest.permission.ACCESS_FINE_LOCATION);
            }
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                permissionsNeeded.add(Manifest.permission.ACCESS_COARSE_LOCATION);
            }

            // 3. Notification Permission (Android 13+)
            if (Build.VERSION.SDK_INT >= 33) {
                if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                    permissionsNeeded.add(Manifest.permission.POST_NOTIFICATIONS);
                }
            }

            if (!permissionsNeeded.isEmpty()) {
                ActivityCompat.requestPermissions(this, permissionsNeeded.toArray(new String[0]), PERMISSION_REQUEST_CODE);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
