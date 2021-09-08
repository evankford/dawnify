import { VideoBackground as VideoBackgroundRenderer } from '@squarespace/video-background-rendering';

class VideoBackground extends HTMLElement {
  constructor() {
    super();
    this.el = this;
    this.url = this.getAttribute('data-bg-video-url');
    this.setup();
  }

  setup() {

  //this == the element

    this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {threshold:  [0, 1]})
    this.observer.observe(this.el);
  }

  handleIntersection(entries,observer) {
    entries.forEach(entry => {
      console.log(entry);
      if (entry.isIntersecting) {
        this.playVideo();
      } else {
        this.pauseVideo();
      }
    });

  }

  pauseVideo() {
    if (!this.bg || !this.bg.player) {
      return;
    }

    this.bg.player.pauseVideo();
    console.log("Paused video!", this.bg.player.getPlayerState())

  }
  playVideo() {
    if (!this.bg || !this.bg.player) {
      this.loadVideoBG();
    }
    if (this.isLoaded && typeof this.bg.player.playVideo == 'function') {
      this.bg.player.playVideo();
    } else {
      this.loadVideoBG();


    }
  }

  loadVideoBG() {
    this.bg = new VideoBackgroundRenderer({container: this, url: this.getAttribute('data-bg-video-url'), useCustomFallbackImage: true, fitMode: 'fill'})
    console.log(this.bg);
    this.classList.add('loaded');
    this.isLoaded = true;
  }
};
if (!customElements.get('video-background')) {
  customElements.define('video-background', VideoBackground);
}

