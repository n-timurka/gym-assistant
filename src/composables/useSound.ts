import { ref } from "vue";

export function useSound(soundPath = "/sounds/alarm.mp3", volume = 0.8) {
  const audio = ref<HTMLAudioElement | null>(null);
  const isUnlocked = ref(false);

  function init() {
    if (!audio.value) {
      audio.value = new Audio(soundPath);
      audio.value.volume = volume;
    }
  }

  async function unlock() {
    init();
    if (!audio.value || isUnlocked.value) return;

    try {
      audio.value.volume = 0;
      await audio.value.play();
      audio.value.pause();
      audio.value.currentTime = 0;
      audio.value.volume = volume;
      isUnlocked.value = true;
    } catch (e) {
      console.warn("Sound unlock failed", e);
    }
  }

  async function play() {
    init();
    if (!audio.value) return;

    try {
      if (!isUnlocked.value) await unlock();
      audio.value.currentTime = 0;
      await audio.value.play();
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  }

  return { play, unlock, isUnlocked };
}
