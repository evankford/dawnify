import { DEBUG } from '@squarespace/video-background-rendering/src/constants/instance';
import { VideoBackground as VideoBackgroundRenderer } from '@squarespace/video-background-rendering/src/index.js';

class VideoBackground extends HTMLElement {
  constructor() {
    super();
    this.el = this;
    this.parent = this.parentElement;
    this.url = this.getAttribute('data-bg-video-url');


    this.setup();
  }

  setup() {
    //this == the element

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      { threshold: [0, 1] }
    );
    this.observer.observe(this.el);
  }

  handleIntersection(entries, observer) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.playVideo();
        if (this.el.getAttribute('data-allow-unmute')) {
          this.initMuteButton();
        }
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
    this.muteVideo();
    // console.log('Paused video!', this.bg.player.getPlayerState());
  }
  playVideo() {
    console.log("Playing video, hmmm");
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
    if (this.isLoaded) {
      return;
    }
    this.bg = new VideoBackgroundRenderer({
      container: this,
      url: this.getAttribute('data-bg-video-url'),
      useCustomFallbackImage: true,
      fitMode: 'fill',
      DEBUG: {
        enabled: true,
        verbose: true
      }
    });
    this.classList.add('loaded');
    this.isLoaded = true;
  }

  initMuteButton() {
    this.button = this.parent.querySelector('[data-bga-button]');
    this.muteLogo = this.parent.querySelector('[data-bga-play]');
    this.playLogo = this.parent.querySelector('[data-bga-mute]');
    this.muted = true;
    this.supportsAudio = typeof window.Audio !== 'undefined';

    if (this.supportsAudio && this.button) {
      this.button.removeAttribute('style');
      this.parent.style.position = 'static';
      this.button.addEventListener('click', this.togglePlayState.bind(this));
    }
  }

  changeButtonToMute() {
    this.button.setAttribute('aria-label', 'Play Music');
    this.playLogo.classList.remove('not-displayed');
    this.muteLogo.classList.add('not-displayed');
  }
  changeButtonToPlay() {
    this.button.setAttribute('aria-label', 'Mute');
    this.playLogo.classList.add('not-displayed');
    this.muteLogo.classList.remove('not-displayed');
  }

  togglePlayState() {
    console.log(this.bg.player);

    if (this.bg && this.bg.player) {
      this.muted = this.bg.player.isMuted();
    }
    if (!this.muted) {
      this.muteVideo();
    } else {
      this.unmuteVideo();
    }
  }
  muteVideo() {
    this.changeButtonToPlay();
    if (this.bg && this.bg.player) {
      this.bg.player.mute();
    }
    this.muted = true;

  }

  unmuteVideo() {
    //Check which player type?
    this.changeButtonToMute();

    if (this.bg && this.bg.player) {
      this.bg.player.unMute();
    }
     this.muted = false;
  }
};
if (!customElements.get('video-background')) {
  customElements.define('video-background', VideoBackground);
}

