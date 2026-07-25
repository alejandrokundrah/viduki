package com.viduki.web;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = getBridge().getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
            settings.setDomStorageEnabled(true);

            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        }
    }
}
