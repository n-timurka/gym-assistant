<script setup lang="ts">
import { IonButton } from '@ionic/vue';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

defineProps<EmptyStateProps>();
</script>

<template>
    <div class="flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-in">
      <div class="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4 text-muted-foreground">
        {{icon}}
      </div>
      <h3 class="font-bold text-lg text-foreground mb-1">{{title}}</h3>
      <p class="text-sm text-muted-foreground max-w-[250px]">{{description}}</p>
      <ion-button
          @click="action?.onClick"
          class="mt-6 gym-lime-gradient text-accent-foreground font-bold text-sm px-6 py-3 rounded-xl transition-all active:scale-95"
        >
          {{action?.label}}
        </ion-button>
    </div>
</template>