package com.raqqa.app

import android.content.Intent
import android.os.Bundle
import org.json.JSONObject
import com.getcapacitor.BridgeActivity

/**
 * Native Android host for the existing React/Vite UI.
 * Capacitor keeps the UI in WebView while this Kotlin activity owns
 * lifecycle and deep-link handoff to the JavaScript application.
 */
class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        forwardIntentToBridge(intent)
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        forwardIntentToBridge(intent)
    }

    private fun forwardIntentToBridge(intent: Intent?) {
        intent?.data?.let { uri ->
            bridge?.webView?.post {
                bridge?.webView?.evaluateJavascript(
                    "window.dispatchEvent(new CustomEvent('raqqa:deep-link', { detail: ${JSONObject.quote(uri.toString())} }))",
                    null
                )
            }
        }
    }
}
