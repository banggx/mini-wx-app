<template>
  <div class="ui-video">
    <video class="video-js" data-setup="{}">
      <source :src="src" />
    </video>
  </div>
</template>

<script>
import { miniAppMixin } from '@/mixins';

export default {
  name: 'ui-video',
  mixins: [miniAppMixin],
  props: {
    id: {
      type: String,
      default: '',
    },
    src: {
      type: String,
      default: '',
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
    loop: {
      type: Boolean,
      default: false,
    },
    muted: {
      type: Boolean,
      default: false,
    },
    controls: {
      type: Boolean,
      default: true,
    },
    poster: {
      type: String,
      default: '',
    }
  },
  methods: {
    createVideo() {
      const video = this.$el.querySelector('video');
      this.video = videojs(video, {
        autoplay: this.autoplay,
        controls: this.controls,
        muted: this.muted,
        loop: this.loop,
        poster: this.poster,
      });
    },
    msgHandler() {
      window.message.receive('pauseVideo', (msg) => {
        console.log('receive pauseVideo message', msg);
        const { videoId } = msg;
        if (videoId !== this.id) {
          return;
        }
        this.video.pause();
      });
      window.message.receive('playVideo', (msg) => {
        const { videoId } = msg;
        if (videoId !== this.id) {
          return;
        }
        this.video.play();
      });
    }
  },
  mounted() {
    this.createVideo(); 
    this.msgHandler();
  }
}
</script>

<style lang="less" scoped>
.ui-video {
  width: 750rem;
  height: 200rem;
  position: relative;
  
  .video-js {
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
}
</style>