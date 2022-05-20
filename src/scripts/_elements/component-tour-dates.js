import parseISO from "date-fns/parseISO";
import isBefore from "date-fns/isBefore";

class TourDates extends HTMLElement {
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
      fallback: '.fallback',
      showYear: false,
      loadMore: true,
    };
  constructor() {
    super();
    this.el = this;
    this.provider = this.el.getAttribute('data-provider');

    this.loaded = false;

    this.props = this.getArgs();
    //Fix for limit = 0
    if (this.props.limit == 0) {
      this.props.limit = 1000
    }
    this.shows = [];
    this.expandButton = this.el.querySelector('[data-expand-button]');
    this.startLoad();
  }

  startLoad() {
    if (document.readyState === "complete") {
      this.init();
      return;
    }
     const self = this;
     window.addEventListener('load', this.init.bind(this));

     //Maximum time before starting to load
     window.addEventListener('DOMContentLoaded', function () {
       setTimeout(() => {
         self.init();
       }, 3000);
     });
  }

  init() {
    if (this.loaded) {
      return;
    }
    this.getShowData().then((response) => {
      this.shows = this.transformData(response);
      if (this.shows.length > 0) {
        this.renderAllShows();
      } else {
        this.noShowsToRender();
      }
      window.dispatchEvent(new Event('resize'));
      this.afterRenderShows();
    });

    this.addClickListeners();
    this.loaded = true;
  }

  getArgs() {
    let args  = {
      artist: this.el.getAttribute('data-artist') ? this.el.getAttribute('data-artist') : 'Keith Urban',
      appId: this.el.getAttribute('data-app-id') ? this.el.getAttribute('data-app-id') : '5234ca141a91a3721bdc34b061d329a2',
      limit: this.el.getAttribute('data-limit') ? this.el.getAttribute('data-limit') : 8,
      dateFormat: this.el.getAttribute('data-date-format') ? this.el.getAttribute('data-date-format') : 'long numbers',
      filterString: this.el.getAttribute('data-filter-string') ? this.el.getAttribute('data-filter-string'): false,
      showLineup: this.el.getAttribute('data-show-lineup') == "true" ? true : false,
      fallback: '.fallback',
      showYear: this.el.getAttribute('data-show-year') == "true" ? true : false,
      loadMore: this.el.getAttribute('data-load-more') == "true" ? true : false,
    };
    return args;
  }

  async getShowData() {
    let cleanArtist = this.props.artist.replace(' ', '');

    let url =`https://rest.bandsintown.com/artists/${cleanArtist}/events?app_id=${this.props.appId}`
    // console.log(url);
    if (this.provider == 'seated') {
      url = `https://cdn.seated.com/api/tour/${this.props.artist}?include=tour-events`
    }
    try {
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        this.el.querySelector('.error').classList.remove('hidden');
        this.el.querySelector('.loader').classList.add('hidden');
        this.showErrror();
        console.log(
          'There has been a problem with your fetch operation: ',
          response.message
        );
        return false;
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

  createSeatedOffers(show) {
    let offersArray = [];
    if(show.attributes['link-text1'] && show.attributes['link-url1']) {
      offersArray.push({type: show.attributes['link-text1'], status: show.attributes['link-text1'].toLowercase(), url: show.attributes['link-url1']})
      if(show.attributes['link-text2'] && show.attributes['link-url2']) {
        offersArray.push({type: show.attributes['link-text2'], status: show.attributes['link-text2'].toLowercase(), url: show.attributes['link-url2']})
      }
    } else {
      offersArray.push({type : show.attributes['on-sale-date-name'] ? show.attributes['on-sale-date-name'] : "Tickets", status: "available", url: `https://link.seated.com/${show.id}` })
    }
    if (show.attributes['promoted-on-sale-date-name'] && show.attributes['promoted-on-sale-date-url']) {
      offersArray.push({type : show.attributes['promoted-on-sale-date-name'] ? show.attributes['promoted-on-sale-date-name'] : "Tickets", status: show.attributes['promoted-on-sale-date-name'].toLowercase() , url: show.attributes['promoted-on-sale-date-url']  })
    }
    return offersArray;
  }

  processSeatedData(data) {
    let seatedShowsArray = []
    try {
      const ids = data.data.relationships['tour-events'].data.map(datum=> {
        return datum.id;
      })

      let showData = [];
      ids.forEach(id=> {
        //find show
        const foundShow = data.included.find(el=> {
          return el.id == id
        })
        if (foundShow) {
          showData.push(foundShow)
        }
      })

      //sort by date


      showData.forEach(show=> {
        let toPush = {
          datetime : parseISO(show.attributes['starts-at']),
          venueName : show.attributes['venue-name'],
          venueLocation : show.attributes['formatted-address'],
          offers : this.createSeatedOffers(show)
        };

        if (typeof show.details == 'string' && show.details.length) {
          toPush.lineup = show.details
        }
        seatedShowsArray.push(toPush);
      })
      seatedShowsArray.sort((a, b)=> {
        return isBefore(b['datetime'], a['datetime']) ? 1 : -1;
      })
      return seatedShowsArray;

    } catch(e) {
      console.error(e.message);
      return false;
    }
  }

  transformData(data) {
    let toReturn = [];
    if (this.provider == 'seated') {
      toReturn = this.processSeatedData(data);
    } else {
        data.forEach(datum=> {
        const { datetime, lineup, offers, url, venue } = datum;
        let toAdd = {
          datetime, lineup, offers, url
        }
        //Handle region
        toAdd.venueName = venue.name;
        let region = venue.region;
        if (venue.country != 'United States') {
          region = venue.country;
        }
        toAdd.venueLocation = venue.city + ', ' + region;
        toReturn.push(toAdd);
        })
      }
    return toReturn;
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
    dateEl.classList.add('td-date');
    dateEl.classList.add('label');
    dateEl.classList.add('h5');
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
    infoEl.classList.add('td-info');

    //Get Data


    //Conditional formating
    var string =
      '<span class="td-city h4 heading">' +
     show.venueLocation +
      '</span><span class="td-venue label">' +
      show.venueName
      '</span>';
    if (this.showLineup) {
      string += '<span class="td-lineup">' + show.lineup + '</span>';
    }
    infoEl.innerHTML = string;
    return infoEl;
  }

  renderLinks(show) {
    let linksEl = document.createElement('span');
    linksEl.classList.add('td-links');

    const offers = show.offers;
    offers.forEach((offer) => {
      let button = document.createElement('a');
      button.setAttribute('href', offer.url);
      button.classList.add('button');
      button.classList.add('arrow-after');
      button.classList.add('small');
      button.target = '_blank';
      button.rel = 'nofollower noreferrer noopener';
      if (offer.status == 'sold out') {
        button.innerHTML = 'Sold Out';
        button.classList.add('sold-out');
      } else if (offer.status != 'available' && offer.status != 'tickets') {
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

    this.showFallback();
  }

  renderShow(show) {
    let showEl = document.createElement('div');
    showEl.classList.add('td-show');
    // showEl.setAttribute('data-reveal', true);

    let date = this.renderDate(show);
    let info = this.renderInfo(show);
    let links = this.renderLinks(show);
    showEl.append(date, info, links);

    return showEl;
  }

  renderAllShows() {
    //CreateWrapper
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('td-wrapper');
    let extras = false;

    if (this.shows.length > this.props.limit && this.props.loadMore) {
      extras = document.createElement('div');

      extras.classList.add('td-extra');
      extras.classList.add('td-wrapper');
    }

    //Loop through shows
    let counter = 0;
    try {

      if (this.props.filterString) {
        console.log('Filtering shows by ' + this.props.filterString);
        this.shows = this.shows.filter(show=> {
          return (
            (typeof show.venueName == 'string' &&
              show.venueName ===
                this.props.filterString) ||
            (typeof show.venueLocation == 'string' &&
              show.venueLocation ===
                this.props.filterString) ||
            (typeof show.venueName == 'string' &&
              show.venueName.indexOf(this.props.filterString) >= 0) ||
            (typeof show.venueLocation == 'string' &&
              show.venueLocation.indexOf(this.props.filterString) >= 0)
          );
        })
      }
    } catch(e) {
      console.log('Filtering failed: ');
      console.log(e);
    }

    this.shows.forEach((show) => {
      const showItem = this.renderShow(show);
      //Counter
      counter++;
      if (counter <= this.props.limit) {
        this.wrapper.append(showItem);
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
      this.el.prepend(this.wrapper, extras);
      this.extraWrapper = this.el.querySelector('.td-extra');
    } else {
      if (this.expandButton) {
        this.expandButton.remove();
      }
      this.el.prepend(this.wrapper);
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
        const timer = setTimeout(() => {

          this.wrapper.scrollIntoView({ behavior: 'smooth'})
                window.dispatchEvent(new Event('resize'));

        }, 200);
        window.addEventListener('scroll', function () {
          window.clearTimeout(timer);
        });
      } else {
        this.expandButton.setAttribute('data-expand-bit', 'expanded');
        let extraShows = this.extraWrapper.querySelectorAll('.td-show');
        let heightTarget =
        extraShows[0].getBoundingClientRect().height *
        (extraShows.length * 1.75);
        this.extraWrapper.style.maxHeight = heightTarget + 50 + 'px';
        this.expandButton.innerHTML =
        this.expandButton.getAttribute('data-less-text');
        const timer = setTimeout(() => {

          this.extraWrapper.scrollIntoView({ behavior: 'smooth'})
                window.dispatchEvent(new Event('resize'));

        }, 200);
        window.addEventListener('scroll', function() {
          window.clearTimeout(timer);
        });
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
    const loaderEl = this.el.querySelector('.loader');
    if (loaderEl) {
      loaderEl.classList.add('hidden');
    }
  }
  addClickListeners() {
    this.el.addEventListener('click', (evt) => this.clickListener(evt));
  }

  afterRenderShows() {
    this.loaded = true;
    window.dispatchEvent(new Event('RevealCheck'));
  }
}

if (!customElements.get('tour-dates')) {
  customElements.define('tour-dates', TourDates);
}
