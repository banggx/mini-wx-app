import View from './components/view/index.vue';
import Image from './components/image/index.vue';
import Text from './components/text/index.vue';
import Video from './components/video/index.vue';
import Swiper from './components/swiper/index.vue';
import SwiperItem from './components/swiper-item/index.vue';

const components = {
  'ui-view': View,
  'ui-image': Image,
  'ui-text': Text,
  'ui-video': Video,
  'ui-swiper': Swiper,
  'ui-swiper-item': SwiperItem
};

Object.keys(components).forEach(name => {
  window.Vue.component(name, components[name]);
});
