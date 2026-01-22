class SpeechModule(
  reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "BackgroundSpeechAndroid"

    @ReactMethod
    fun startService() {
        val intent = Intent(reactApplicationContext, SpeechService::class.java)
        reactApplicationContext.startForegroundService(intent)
    }

    @ReactMethod
    fun speak(text: String) {
        SpeechServiceHolder.service?.speak(text)
    }

    @ReactMethod
    fun stopService() {
        val intent = Intent(reactApplicationContext, SpeechService::class.java)
        reactApplicationContext.stopService(intent)
    }
}
