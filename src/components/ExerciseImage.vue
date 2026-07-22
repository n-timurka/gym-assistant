<script setup lang="ts">
import { IonIcon, IonImg, IonSkeletonText } from '@ionic/vue';
import { camera } from 'ionicons/icons';
import { computed, onUnmounted, ref, watch } from 'vue';
import { storage } from '@/firebase.config';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import { downloadAndCache, getCachedImageSrc } from '@/helpers/capacitor.helper';

const { exerciseId, size = 'sm' } = defineProps<{
  exerciseId?: string,
  size?: 'xs' | 'sm' | 'lg',
}>();

const imageName = computed(() => `${size}/${exerciseId}.webp`);
const imageSrc = ref<string|null>(null);
const loading = ref(true);
const hasError = ref(false);
const abortController = ref<AbortController | null>(null);

// Load image from Firebase Storage
const loadImage = async () => {
  // Cancel any previous request
  abortController.value?.abort();
  abortController.value = new AbortController();

  if (!exerciseId) {
    imageSrc.value = null;
    loading.value = false;
    return;
  }

  loading.value = true;
  hasError.value = false;

  try {
    // 1. Try cached version first
    const cachedSrc = await getCachedImageSrc(imageName.value);
    if (cachedSrc) {
      imageSrc.value = cachedSrc;
      loading.value = false;
      return;
    }

    // 2. Download + cache
    const imageRef = storageRef(storage, imageName.value);
    const downloadUrl = await getDownloadURL(imageRef);

    imageSrc.value = await downloadAndCache(
      downloadUrl,
      imageName.value,
      abortController.value.signal,
    );
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return;
    }

    console.warn(`Failed to load image for ${exerciseId}:`, error);

    if (error.message?.includes('CORS') || error.name === 'TypeError') {
      console.warn('CORS fallback: using direct URL');
      const imageRef = storageRef(storage, imageName.value);
      imageSrc.value = await getDownloadURL(imageRef);
    } else {
      imageSrc.value = null;
      hasError.value = true;
    }
  } finally {
    loading.value = false;
  }
}

watch(
  () => [exerciseId, size],
  loadImage,
  { immediate: true },
);

onUnmounted(() => {
  abortController.value?.abort();
});
</script>

<template>
  <div class="image-container" :class="size">
    <IonSkeletonText v-if="loading" animated style="width:100%; height:100%" />
    <IonImg
      v-else-if="imageSrc"
      :src="imageSrc"
      :alt="`Exercise ${exerciseId}`"
      loading="lazy"
      class="image"
      @ion-error="hasError = true" />
    <div v-else class="placeholder">
      <IonIcon :name="camera" color="primary" />
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
