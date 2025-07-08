<template>
  <div class="ui-swiper-item swiper-slide">
    <slot></slot>
  </div>
</template>

<script>
import { miniAppMixin } from '@/mixins';

export default {
  name: 'ui-swiper-item',
  mixins: [miniAppMixin],
}
</script>