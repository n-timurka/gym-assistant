import {
  alertController,
  actionSheetController,
  type ActionSheetButton,
} from '@ionic/vue';

interface ConfirmOptions {
  header: string;
  message: string;
  confirmText: string;
}

const confirm = async ({ header, message, confirmText }: ConfirmOptions): Promise<boolean> => {
  const alert = await alertController.create({
    header,
    message,
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      { text: confirmText, role: 'confirm' },
    ],
  });
  await alert.present();
  const { role } = await alert.onDidDismiss();
  return role === 'confirm';
};

export const confirmEndTraining = (hasCompletedSets: boolean) =>
  confirm({
    header: 'End Training',
    message: hasCompletedSets
      ? 'Are you sure you want to end this workout?'
      : 'No exercises have been completed. Are you sure you want to end this workout?',
    confirmText: 'End Workout',
  });

export const confirmDeleteExercise = () =>
  confirm({
    header: 'Delete Exercise',
    message: 'Are you sure you want to delete this exercise?',
    confirmText: 'Delete',
  });

export const confirmClearWorkout = () =>
  confirm({
    header: 'Clear Workout',
    message: 'Are you sure you want to remove all exercises from this workout?',
    confirmText: 'Clear All',
  });

const REST_OPTIONS = [
  { text: 'START TIMER (2 min)', seconds: 120, role: 'selected' },
  { text: '30 Seconds', seconds: 30 },
  { text: '1 Minute', seconds: 60 },
  { text: '1.5 Minutes', seconds: 90 },
  { text: '2 Minutes', seconds: 120 },
  { text: '3 Minutes', seconds: 180 },
];

/** Resolves with the chosen rest time in seconds, or null if cancelled. */
export const pickRestTime = async (): Promise<number | null> => {
  let selected: number | null = null;

  const buttons: ActionSheetButton[] = [
    ...REST_OPTIONS.map(({ text, seconds, role }) => ({
      text,
      role,
      handler: () => {
        selected = seconds;
      },
    })),
    { text: 'Cancel', role: 'cancel' },
  ];

  const sheet = await actionSheetController.create({ header: 'Rest Timer', buttons });
  await sheet.present();
  await sheet.onDidDismiss();
  return selected;
};
