import Foundation
import AVFoundation

@objc(BackgroundSpeechIOS)
class BackgroundSpeechIOS: NSObject {

    private let synthesizer = AVSpeechSynthesizer()

    @objc
    func speak(_ text: String) {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(
                .playback,
                mode: .spokenAudio,
                options: [.duckOthers, .interruptSpokenAudioAndMixWithOthers]
            )
            try session.setActive(true)
        } catch {
            print("Audio session error:", error)
            return
        }

        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "da-DK")
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate

        synthesizer.speak(utterance)
    }
}
