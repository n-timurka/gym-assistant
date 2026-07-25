import { ref, computed, onMounted } from "vue";
import { useSound } from "./useSound";
import { useNotification } from "./useNotifications";

// Store data
const timerState = {
  endTime: ref<number | null>(null),
  intervalId: ref<ReturnType<typeof setInterval> | null>(null),
  isRunning: ref(false),
  remainingSeconds: ref(0),
  duration: ref(0),
};

export function useRestTimer() {
  const { play: playAlarm, unlock: unlockAlarm } = useSound();
  const { requestPermission, scheduleTimerEnd, cancelTimerNotification } =
    useNotification();
  const isRunning = computed(() => timerState.isRunning.value);

  async function startTimer(seconds: number) {
    stopTimer();

    // Unlock sound on user gesture (timer start)
    await unlockAlarm();

    const permissionGranted = await requestPermission();
    if (!permissionGranted) {
      console.warn("Notifications not granted");
    }

    timerState.duration.value = seconds;
    const end = Date.now() + seconds * 1000;
    timerState.endTime.value = end;
    timerState.isRunning.value = true;
    timerState.remainingSeconds.value = seconds;

    timerState.intervalId.value = setInterval(() => {
      if (!timerState.endTime.value) return;
      const now = Date.now();
      const remaining = Math.max(
        0,
        Math.ceil((timerState.endTime.value - now) / 1000),
      );
      timerState.remainingSeconds.value = remaining;

      if (remaining <= 0) {
        stopTimer(true);
      }
    }, 1000);

    await scheduleTimerEnd(end);

    // Persist
    localStorage.setItem("globalTimerEnd", end.toString());
    localStorage.setItem("globalTimerDuration", seconds.toString());
  }

  function stopTimer(completed = false) {
    if (timerState.intervalId.value) {
      clearInterval(timerState.intervalId.value);
      timerState.intervalId.value = null;
    }
    timerState.isRunning.value = false;

    cancelTimerNotification();

    if (completed) {
      playAlarm();
    }

    timerState.endTime.value = null;
    timerState.remainingSeconds.value = 0;
    localStorage.removeItem("globalTimerEnd");
  }

  function restoreState() {
    const savedEnd = localStorage.getItem("globalTimerEnd");
    if (savedEnd) {
      const end = parseInt(savedEnd, 10);
      if (end > Date.now()) {
        const dur = parseInt(
          localStorage.getItem("globalTimerDuration") || "0",
          10,
        );
        timerState.endTime.value = end;
        timerState.duration.value = dur;
        timerState.isRunning.value = true;
        timerState.intervalId.value = setInterval(() => {
          /* same update logic */
        }, 1000);
        // Trigger one update
        const now = Date.now();
        timerState.remainingSeconds.value = Math.max(
          0,
          Math.ceil((end - now) / 1000),
        );
      }
    }
  }

  onMounted(restoreState);

  const formattedTime = computed(() => {
    const min = Math.floor(timerState.remainingSeconds.value / 60);
    const sec = timerState.remainingSeconds.value % 60;

    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  });

  return {
    startTimer,
    stopTimer,
    formattedTime,
    isRunning,
    remainingSeconds: timerState.remainingSeconds,
  };
}
