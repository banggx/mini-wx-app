<template>
  <div class="ui-view" @click="clicked">
    <slot></slot>
  </div>
</template>

<script>
import { miniAppMixin } from '@/mixins';

export default {
  name: 'ui-view',
  mixins: [miniAppMixin],
  methods: {
    clicked() {
			this.$emit('tap');
		}
  }
}
</script>

<style lang="less" scoped>
.ui-view {
	display: block;
}
</style>