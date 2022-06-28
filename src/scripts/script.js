import $ from 'jquery';
import 'ion-rangeslider';

// add custom js below

// const map = new Map({
//   target: 'map',
//   layers: [
//     new TileLayer({
//       source: new OSM()
//     })
//   ],
//   view: new View({
//     center: [0, 0],
//     zoom: 0
//   })
// });

const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

if (prefersDarkScheme.matches) {
  console.log('dark-theme');
} else {
  console.log('dark-theme');
}

// Execute function when markup ready
$(document).ready(function initPage() {
  // Map Tool Toggle
  // eslint-disable-next-line no-unused-vars
  $('.map-tool').on('click', function openTool(e) {
    e.preventDefault();
    const toolId = this.id;
    const toolContainer = $('.tool-panel-container');
    const thisTool = $(`.panel-${toolId}`);

    if (!toolContainer.hasClass('is-open')) {
      toolContainer.addClass('is-open');
      $('body').addClass('is-covered');
      thisTool.addClass('is-active');
    } else if (toolContainer.hasClass('is-open')) {
      $('body').removeClass('is-covered');
      if (!thisTool.hasClass('is-active')) {
        $('.tool-panel').removeClass('is-active');
        thisTool.addClass('is-active');
      } else if (thisTool.hasClass('is-active')) {
        thisTool.removeClass('is-active');
        toolContainer.removeClass('is-open');
      }
    }
  });

  $('.basemap-icon').on('click', function openLayerModal() {
    $('#basemapModal').addClass('is-active');
    $('html').addClass('is-clipped');
  });

  $('.indeks-info').on('click', function openIndeksModal() {
    $('#indexModal').addClass('is-active');
    $('html').addClass('is-clipped');
  });

  // Mobile Menu Toggle
  $('.menu-toggle').on('click', function openMobileMenu() {
    $('header').toggleClass('is-expanded');
  });

  // Mobile Menu Close Button
  $('header .close-button').on('click', function closeMobileMenu() {
    $('header').removeClass('is-expanded');
  });

  // Tool Panel Close Button
  $('.tool-panel-container .close-button').on('click', function closeTool(e) {
    e.preventDefault();
    $('.tool-panel-container').removeClass('is-open');
    $('body').removeClass('is-covered');
    $('.tool-panel').removeClass('is-active');
  });

  // Close Modal Button
  $('button.close-modal').on('click', function closeModal() {
    $('.modal').removeClass('is-active');
    $('html').removeClass('is-clipped');
  });

  $('#infobarToggle').on('click', function toggleInfoBar() {
    $('.infobar-container').toggleClass('is-open');
  });

  $('.infobar-closer').on('click', function closeInfoBar() {
    $('.infobar-container').removeClass('is-open');
  });

  window.addEventListener('resize', () => {
    // We execute the same script as before
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  });
});
