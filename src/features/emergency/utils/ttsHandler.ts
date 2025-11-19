import * as Speech from 'expo-speech';

export const speak = (text: string) => {
  Speech.stop();
  Speech.speak(text, {
    language: 'tr-TR',
    pitch: 1.0,
    rate: 0.9,
  });
};

export const stop = () => {
  Speech.stop();
};
