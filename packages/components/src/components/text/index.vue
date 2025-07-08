<template>
  <div class="ui-text" :class="{'ui-text--can-select': userSelect}">
    <slot></slot>
  </div>
</template>

<script>
import { miniAppMixin } from '@/mixins';

export default {
  name: 'ui-text',
  mixins: [miniAppMixin],
  props: {
    userSelect: {
      type: Boolean,
      default: false,
    }
  }
}
</script>

<style lang="less" scoped>
.ui-text {
  margin: 0;
  padding: 0;
  line-height: 1.2;
  user-select: none;
  &.ui-text--can-select {
    user-select: text;
  }
}
</style>
