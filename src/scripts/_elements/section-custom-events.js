import {parse, differenceInDays } from "date-fns";

class CustomEvents {
  constructor(el) {
    this.el = el;
    this.parent = el.closest('custom-events');
    if (!this.parent) {
      return;
    }
    this.datesWrap = this.parent.querySelector('[data-dates-wrap]');
    if (!this.datesWrap) {
      return;
    }
    this.datesFormat = this.datesWrap.getAttribute('data-dates-format');
    this.events = this.parent.querySelectorAll('[data-custom-event]');
    this.eventCount = this.parent.querySelectorAll('[data-custom-event]');
    this.fallback = this.parent.querySelector('[data-fallback]');


    this.removeOldEvents();
    this.tryToShowFallback();
  }

  removeOldEvents() {
    const now = new Date();
    if (!this.events || this.events.count == 0) {
      return;
    }

    this.events.forEach(evt=> {
      const eventDateAttribute = evt.getAttribute('data-date');
      if (!eventDateAttribute ) {
        return;
      }
      const eventDate = parse(eventDateAttribute, this.datesFormat);
      if (eventDate && differenceInDays(now, eventDate) < -1) {
        this.datesWrap.removeChild(evt);
      }
    })
  }


  tryToShowFallback() {
    if (this.events.length > 0) {
      return;
    }
    if (!this.fallback) {
      return;
    }
    this.fallback.classList.remove('hidden');
  }
}
(()=> {
window.addEventListener('DOMContentLoaded', () => {
  const eventWraps = document.querySelectorAll('[data-dates-wrap]');
  eventWraps.forEach(el=> {
    if (!el.hasAttribute('data-initialized')) {
      el.setAttributeNS('data-initialized', true);
      new CustomEvents(el);
    }
  })
});
})()
