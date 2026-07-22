import { ref, onUnmounted, computed } from "vue";
import { toastController } from "@ionic/vue";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";

// Store data
const timerId = ref<ReturnType<typeof setInterval> | null>(null);
const timeLeft = ref(0);
const isActive = ref(false);
const currentRestSeconds = ref(60);
let notificationId = 0;

export function useRestTimer() {
  const start = async (seconds: number = 60) => {
    if (isActive.value) {
      stop(); // Cancel previous timer
    }

    currentRestSeconds.value = seconds;
    timeLeft.value = seconds;
    isActive.value = true;

    // Schedule persistent notification
    await scheduleRestNotification(seconds);

    timerId.value = setInterval(() => {
      timeLeft.value -= 1;

      if (timeLeft.value <= 0) {
        finishTimer();
      } else if (timeLeft.value % 15 === 0) {
        // Optional: update notification every 15s
        updateNotification();
      }
    }, 1000);
  };

  const stop = async () => {
    if (timerId.value) {
      clearInterval(timerId.value);
      timerId.value = null;
    }

    await LocalNotifications.cancel({
      notifications: [{ id: notificationId }],
    });
    isActive.value = false;
    timeLeft.value = 0;
  };

  const finishTimer = async () => {
    stop();

    // Haptics
    Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});

    // Play system sound (best effort)
    playSystemCompleteSound();

    // Toast
    const toast = await toastController.create({
      message: "Rest finished! Let's go! 💪",
      duration: 3000,
      position: "top",
      color: "success",
    });
    await toast.present();
  };

  const playSystemCompleteSound = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Native system sound
        const audio = new (window as any).Audio("/sounds/rest-complete.mp3");
        audio.play().catch(() => {});
      } else {
        // Web fallback
        const audio = new Audio("/sounds/rest-complete.mp3");
        audio.play().catch(() => {});
      }
    } catch (e) {
      console.warn("Sound playback failed", e);
    }
  };

  const scheduleRestNotification = async (totalSeconds: number) => {
    notificationId = Date.now();

    try {
      await LocalNotifications.requestPermissions();

      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title: "Rest Timer",
            body: `Time left: ${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, "0")}`,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: "default", // Use system default sound
            ongoing: true, // Keeps notification visible
            autoCancel: false,
          },
        ],
      });
    } catch (e) {
      console.warn("Notification scheduling failed (common in PWA)", e);
    }
  };

  const updateNotification = async () => {
    if (!isActive.value) return;
    try {
      await LocalNotifications.cancel({
        notifications: [{ id: notificationId }],
      });
      await scheduleRestNotification(timeLeft.value);
    } catch {
      /* empty */
    }
  };

  const formattedTime = computed(() => {
    const min = Math.floor(timeLeft.value / 60);
    const sec = timeLeft.value % 60;

    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  });

  onUnmounted(() => {
    stop();
  });

  return {
    timeLeft,
    isActive,
    start,
    stop,
    formattedTime,
  };
}
