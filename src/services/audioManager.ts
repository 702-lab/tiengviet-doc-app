import * as Speech from 'expo-speech';

/**
 * Phát âm một chuỗi chữ sử dụng Speech TTS của hệ thống với giọng vùng miền chỉ định
 * Trả về một Promise giải quyết khi phát âm xong hoặc bị dừng
 */
export function speakAsync(text: string, rate: number, voice?: string): Promise<void> {
  return new Promise((resolve) => {
    Speech.stop().then(() => {
      const options: Speech.SpeechOptions = {
        language: 'vi-VN',
        rate: rate,
        pitch: 1.05,
        onDone: () => resolve(),
        onError: (error) => {
          console.warn('Lỗi phát âm TTS:', error);
          resolve();
        },
        onStopped: () => {
          resolve();
        }
      };

      if (voice) {
        options.voice = voice;
      }

      Speech.speak(text, options);
    }).catch(() => {
      resolve();
    });
  });
}

/**
 * Dừng hoàn toàn phát âm thanh hiện tại
 */
export function stopAllSpeech(): Promise<void> {
  return Speech.stop();
}
