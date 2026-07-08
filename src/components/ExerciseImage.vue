<script setup lang="ts">
import { IonIcon, IonImg, IonSkeletonText } from '@ionic/vue';
import { camera } from 'ionicons/icons';
import { ref, watch } from 'vue';
import { storage } from '@/firebase.config';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';

const { exerciseId, size = 'sm' } = defineProps<{
  exerciseId?: string
  size?: 'xs' | 'sm' | 'lg'
}>()

const imageSrc = ref<string|null>(null)
const loading = ref(true)
const hasError = ref(false)

// Load image from Firebase Storage
const loadImage = async () => {
  if (!exerciseId) {
    imageSrc.value = null
    loading.value = false
    return
  }

  loading.value = true
  hasError.value = false

  try {
    const imageRef = storageRef(storage, `${size}/${exerciseId}.webp`)
    
    imageSrc.value = await getDownloadURL(imageRef)
  } catch (error) {
    console.warn(`Failed to load image for item ${exerciseId}:`, error)
    imageSrc.value = null
    hasError.value = true
  }
  finally {
    loading.value = false
  }
}

watch(
  () => [exerciseId, size],
  () => {
    loadImage()
  },
  { immediate: true }
)
</script>

<template>
  <div class="image-container" :class="size">
    <ion-skeleton-text v-if="loading" animated style="width:100%; height:100%" />
    <ion-img
      v-else-if="imageSrc"
      :src="imageSrc"
      :alt="`Exercise ${exerciseId}`"
      loading="lazy"
      class="image"
      @ion-error="hasError = true" />
    <div v-else class="placeholder">
      <ion-icon :name="camera" color="primary" />
    </div>
  </div>
</template>

<style scoped>
.image-container {
  position: relative;
  display: inline-block;
  overflow: hidden;
  border-radius: 8px;
}

.image-container.xs {
  width: 64px;
  height: 64px;
}

.image-container.sm {
  width: 80px;
  height: 80px;
}

.image-container.lg {
  width: 250px;
  height: 250px;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f1f1;
}
</style>
