import { LocalNotifications } from "@capacitor/local-notifications";
import { isPlatform } from "@ionic/vue";

export function useNotification() {
  const isNative = isPlatform("ios") || isPlatform("android");

  async function requestPermission() {
    if (isNative) {
      const { display } = await LocalNotifications.requestPermissions();

      return display === "granted";
    } else if ("Notification" in window) {
      const permission = await Notification.requestPermission();

      return permission === "granted";
    }

    return false;
  }

  async function cancelTimerNotification() {
    if (!isNative) return;

    await LocalNotifications.cancel({ notifications: [{ id: 9999 }] }).catch(
      () => {},
    );
  }

  async function scheduleTimerEnd(
    endTime: number,
    title = "Timer Complete",
    body = "Your timer has finished!",
  ) {
    if (isNative) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: 9999,
              title,
              body,
              schedule: { at: new Date(endTime) },
              sound: "alarm.mp3", // Add to native resources
              extra: { type: "timer-complete" },
            },
          ],
        });
      } catch (err) {
        console.warn("Native notification failed", err);
      }
    } else {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        reg.active?.postMessage({
          type: "SCHEDULE_TIMER_NOTIFICATION",
          endTime,
          title,
          body,
        });
      }
    }
  }

  return {
    requestPermission,
    cancelTimerNotification,
    scheduleTimerEnd,
    isNative,
  };
}
