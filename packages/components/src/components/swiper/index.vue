<template>
  <div class="ui-swiper swiper">
    <div class="swiper-wrapper">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import Swiper from 'swiper';
import { miniAppMixin } from '@/mixins';

export default {
  name: 'ui-swiper',
  mixins: [miniAppMixin],
  props: {
    vertical: {
      type: Boolean,
      default: false,
    }
  },
  methods: {
    initSwiper() {
      const self = this;
      new Swiper(this.$el, {
        longSwipesRatio: 0.2,
        direction: this.vertical ? 'vertical' : 'horizontal',
        on: {
          slideChangeTransitionEnd: function() {
            self.$emit('change', {
              current: this.activeIndex,
            });
          }
        }
      })
    }
  },
  mounted() {
    this.initSwiper();
  }
}
</script>

<style lang="less" scoped>
.ui-swiper {
  height: 150rem;
}
</style>