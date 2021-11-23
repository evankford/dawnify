class BandsintownDates extends HTMLElement {
  static monthsLong = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  static monthsShort = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  static  defaults = {
      appId: '5234ca141a91a3721bdc34b061d329a2',
      artist: 'Keith Urban',
      limit: 8,
      dateFormat: 'long numbers',

      filterString: false,
      showLineup: false,
      fallback: '.bit-fallback',
      showYear: false,
      loadMore: true,
    };
  constructor() {
    super();
    this.el = this;

    this.props = this.getArgs();
    //Fix for limit = 0
    if (this.props.limit == 0) {
      this.props.limit = 1000
    }


    this.shows = [];
    this.expandButton = this.el.querySelector('[data-expand-bit]');
    this.expandButton = this.el.querySelector('[data-expand-bit]');
    this.getShowData().then((response) => {
      this.shows = response;
      if (this.shows.length > 0) {
        this.renderAllShows();
      } else {
        this.noShowsToRender();
      }
      window.dispatchEvent(new Event('resize'));
    });

    this.addClickListeners();
  }

  getArgs() {
    let args  = {
      artist: this.el.getAttribute('data-artist') ? this.el.getAttribute('data-artist') : 'Keith Urban',
      appId: this.el.getAttribute('data-app-id') ? this.el.getAttribute('data-app-id') : '5234ca141a91a3721bdc34b061d329a2',
      limit: this.el.getAttribute('data-limit') ? this.el.getAttribute('data-limit') : 8,
      dateFormat: this.el.getAttribute('data-date-format') ? this.el.getAttribute('data-date-format') : 'long numbers',
      filterString: this.el.getAttribute('data-filter-string') ? this.el.getAttribute('data-filter-string'): false,
      showLineup: this.el.getAttribute('data-show-lineup') == "true" ? true : false,
      fallback: '.bit-fallback',
      showYear: this.el.getAttribute('data-show-year') == "true" ? true : false,
      loadMore: this.el.getAttribute('data-load-more') == "true" ? true : false,
    };
    return args;
  }

  async getShowData() {
    let cleanArtist = this.props.artist.replace(' ', '');
    let url =
      'https://rest.bandsintown.com/artists/' +
      cleanArtist +
      '/events?app_id=' +
      this.props.appId;
    console.log(url);
    try {
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        this.el.querySelector('.error').classList.remove('hidden');
        throw new Error('Failed to load dates. ' + response.message);
      }
      return response.json();
    } catch (error) {
      this.showError();
      console.log(
        'There has been a problem with your fetch operation: ',
        error.message
      );
    }
  }

  showError() {
    this.el.classList.add('error');
  }

  renderDate(show) {
    //Store data
    let showDate = new Date(show.datetime);
    let month = showDate.getMonth();
    let year = showDate.getYear() - 100;
    let day = showDate.getDate().toString();

    ///Element
    let dateEl = document.createElement('span');
    dateEl.classList.add('bit-date');
    dateEl.classList.add('label');
    dateEl.classList.add('h4');
    let string = '';

    //Contitional markup
    switch (this.props.dateFormat) {
      case 'long numbers':
        month = (month + 1).toString();
        if (month.length == 1) {
          string += '0';
        }
        string += month + '.';
        if (day.length == 1) {
          string += '0';
        }
        string += day;
        if (this.props.showYear) {
          string += '.' + year;
        }
        break;
      case 'long words':
        string += monthsLong[month] + ' ' + day;
        if (this.props.showYear) {
          string += ', ' + year;
        }
        break;
      case 'short words':
        string += monthsShort[month] + ' ' + day;
        if (this.props.showYear) {
          string += ', ' + year;
        }
        break;
      default:
        month = (month + 1).toString();
        string += month + '.' + day;
        if (this.showYear) {
          string += '.' + year;
        }
    }

    //Load markup into element
    dateEl.innerHTML = string;
    return dateEl;
  }

  renderInfo(show) {
    //Create elements
    let infoEl = document.createElement('span');
    infoEl.classList.add('bit-info');

    //Get Data
    let region = show.venue.region;
    if (show.venue.country != 'United States') {
      region = show.venue.country;
    }
    let venue = show.venue.name;

    //Conditional formating
    var string =
      '<span class="bit-city h4 heading">' +
      show.venue.city +
      ', ' +
      region +
      '</span><span class="bit-venue label">' +
      venue +
      '</span>';
    if (this.showLineup) {
      string += '<span class="bit-lineup">' + show.lineup + '</span>';
    }

    infoEl.innerHTML = string;
    return infoEl;
  }

  renderLinks(show) {
    let linksEl = document.createElement('span');
    linksEl.classList.add('bit-links');

    const offers = show.offers;
    offers.forEach((offer) => {
      let button = document.createElement('a');
      button.setAttribute('href', offer.url);
      button.classList.add('button');
      button.classList.add('arrow-after');
      button.classList.add('small');
      if (offer.status == 'sold out') {
        button.innerHTML = 'Sold Out';
        button.classList.add('sold-out');
      } else if (offer.status != 'available') {
        button.innerHTML = 'Info';
      } else {
        button.innerHTML = offer.type;
      }

      if (offer.type == 'VIP') {
        button.classList.add('link-vip');
      }

      linksEl.append(button);
    });

    if (offers.length == 0) {
      let infoButton = document.createElement('a');
      infoButton.setAttribute('href', show.url);
      infoButton.innerHTML = 'Info';
      infoButton.classList.add('button');
      infoButton.classList.add('arrow-after');
      infoButton.classList.add('small');
      linksEl.append(infoButton);
    }

    return linksEl;
  }

  noShowsToRender() {
    this.el.classList.add('no-shows');
  }

  renderShow(show) {
    let showEl = document.createElement('div');
    showEl.classList.add('bit-show');

    let date = this.renderDate(show);
    let info = this.renderInfo(show);
    let links = this.renderLinks(show);
    showEl.append(date, info, links);

    return showEl;
  }

  renderAllShows() {
    //CreateWrapper
    let wrapper = document.createElement('div');
    wrapper.classList.add('bit-wrapper');
    let extras = false;
    if (this.shows.length > this.props.limit && this.props.loadMore) {
      extras = document.createElement('div');

      extras.classList.add('bit-extra');
      extras.classList.add('bit-wrapper');
    }

    //Loop through shows
    let counter = 0;
    this.shows.forEach((show) => {
      const showItem = this.renderShow(show);
      //Counter
      counter++;
      if (counter <= this.props.limit) {
        wrapper.append(showItem);
      } else if (extras && this.props.loadMore) {
        extras.append(showItem);
      } else {
        return false;
      }
    });

    if (this.shows.length < this.props.limit) {
      if (this.shows.length == 0) {
        this.showFallback();
      }
    } else if (this.expandButton) {
      this.expandButton.classList.remove('hidden');
      this.expandButton.classList.remove('hidden');
    }
    if (extras) {
      this.el.prepend(wrapper, extras);
      this.extraWrapper = this.el.querySelector('.bit-extra');
    } else if (this.expandButton) {
      this.expandButton.remove();
      this.el.prepend(wrapper);
    }
    this.el.querySelector('.loader').classList.add('hidden');
  }

  toggleExpand() {
    if (!this.expandButton) {
      return false;
    }
    if (this.extraWrapper) {
      if (this.expandButton.getAttribute('data-expand-bit') == 'expanded') {
        //collapse
        this.expandButton.innerHTML =
          this.expandButton.getAttribute('data-more-text');
        this.expandButton.setAttribute('data-expand-bit', '');
        this.extraWrapper.style.maxHeight = 0 + 'px';
      } else {
        this.expandButton.setAttribute('data-expand-bit', 'expanded');
        let extraShows = this.extraWrapper.querySelectorAll('.bit-show');
        let heightTarget =
          extraShows[0].getBoundingClientRect().height *
          (extraShows.length * 1.75);
        this.extraWrapper.style.maxHeight = heightTarget + 50 + 'px';
        this.expandButton.innerHTML =
          this.expandButton.getAttribute('data-less-text');
      }
      window.dispatchEvent(new Event('resize'));
    }
  }
  clickListener(event) {
    if (event.target == this.expandButton) {
      if (this.extraWrapper) {
        event.preventDefault();
        this.toggleExpand();
      }
    }
  }

  showFallback() {
    this.el.classList.add('fallback-active');

    const fallbackEl = this.el.querySelector(this.props.fallback);
    if (fallbackEl) {
      fallbackEl.classList.remove('hidden');
    }
  }
  addClickListeners() {
    this.el.addEventListener('click', (evt) => this.clickListener(evt));
  }
}

if (!customElements.get('bandsintown-dates')) {
  customElements.define('bandsintown-dates', BandsintownDates);
}
