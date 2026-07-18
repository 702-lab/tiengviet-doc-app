import * as Speech from 'expo-speech';

/**
 * Phát âm một chuỗi chữ sử dụng Speech TTS của hệ thống
 * Trả về một Promise giải quyết khi phát âm xong hoặc bị dừng
 */
export function speakAsync(text: string, rate: number): Promise<void> {
  return new Promise((resolve) => {
    // Thử dừng các âm thanh đang phát trước đó
    Speech.stop().then(() => {
      // expo-speech rate chuẩn thường từ 0.5 đến 2.0. 
      // Đối với trẻ em, ta nên điều chỉnh giọng nói rõ ràng, tốc độ vừa phải.
      Speech.speak(text, {
        language: 'vi-VN',
        rate: rate,
        pitch: 1.05, // Pitch cao hơn một chút giúp giọng nói trong trẻo thân thiện với trẻ em hơn
        onDone: () => resolve(),
        onError: (error) => {
          console.warn('Lỗi phát âm TTS:', error);
          resolve(); // Vẫn resolve để tránh treo luồng
        },
        onStopped: () => {
          resolve();
        }
      });
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
