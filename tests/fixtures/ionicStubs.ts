export const ionicStubs = {
  IonPage: { template: '<div class="ion-page"><slot /></div>' },
  IonContent: { template: '<div class="ion-content"><slot /></div>' },
  IonCard: { template: '<div class="ion-card"><slot /></div>' },
  IonCardHeader: { template: '<div class="ion-card-header"><slot /></div>' },
  IonCardTitle: { template: '<h2 class="ion-card-title"><slot /></h2>' },
  IonCardContent: { template: '<div class="ion-card-content"><slot /></div>' },
  IonList: { template: '<div class="ion-list"><slot /></div>' },
  IonItem: { template: '<div class="ion-item"><slot /></div>' },
  IonItemDivider: { template: '<div class="ion-item-divider"><slot /></div>' },
  IonLabel: { template: '<label class="ion-label"><slot /></label>' },
  IonInput: {
    props: ['modelValue', 'disabled', 'type', 'placeholder'],
    emits: ['update:modelValue', 'ionBlur'],
    template: `
      <input
        class="ion-input"
        :type="type || 'text'"
        :value="modelValue"
        :disabled="disabled"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('ionBlur')"
      />
    `,
  },
  IonButton: {
    props: ['disabled'],
    template: '<button class="ion-button" :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>',
  },
  IonIcon: { template: '<i class="ion-icon" />' },
  IonAvatar: { template: '<div class="ion-avatar"><slot /></div>' },
  IonNote: { template: '<span class="ion-note"><slot /></span>' },
  IonSpinner: { template: '<span class="ion-spinner">Loading...</span>' },
  IonModal: {
    props: ['isOpen'],
    template: '<div v-if="isOpen" class="ion-modal"><slot /></div>',
  },
  IonHeader: { template: '<header><slot /></header>' },
  IonToolbar: { template: '<div class="ion-toolbar"><slot /></div>' },
  IonTitle: { template: '<h1><slot /></h1>' },
  IonButtons: { template: '<div class="ion-buttons"><slot /></div>' },
  AppLayout: { template: '<div class="app-layout"><slot /></div>' },
};
