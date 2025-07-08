<template>
  <div class="ui-image">
    <img :src="src" alt="" />
  </div>
</template>

<script>
import { miniAppMixin } from '@/mixins';

export default {
  name: 'ui-image',
  mixins: [miniAppMixin],
  props: {
    src: {
      type: String,
      default: '',
    }
  }
}
</script>

<style lang="less" scoped>
.ui-image {
  img {
    width: 100%;
    height: 100%;
  }
}
</style>