/* eslint-disable no-nested-ternary */
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import { Vector as VectorLayer } from 'ol/layer';
import { Stroke, Style, Fill } from 'ol/style';
import * as olProj from 'ol/proj';
import $ from 'jquery';
import { map, overlay } from './map';
import { getAllCaseData } from '../services/apiService';

function setCases() {
  // Define case Source(baseJson)
  const caseSource = new VectorSource({
    format: new GeoJSON(),
    url: './dummy/admindesa.json'
    // 'http://103.108.201.6/geoserver/geonode/ows?service=WFS&version=1.1.0&request=GetFeature&typename=geonode%3AADMINDESAAR_BPS&outputFormat=application%2Fjson&srsName=EPSG%3A4326'
    // strategy: bboxStrategy
  });

  // Define case Layer
  const caseLayer = new VectorLayer({
    source: caseSource,
    zIndex: 2,
    opacity: 0
  });
  // Define ColorMap Function
  function getColor(d) {
    return d > 500
      ? '#7a0177'
      : d > 100
      ? '#ae017e'
      : d > 50
      ? '#dd3497'
      : d > 20
      ? '#f768a1'
      : d > 10
      ? '#fa9fb5'
      : d > 5
      ? '#fcc5c0'
      : d > 0
      ? '#fde0dd'
      : '#fff7f3';
  }

  // Define dateToLabel function
  function dateToLabel(data) {
    // convert to msec
    // add local time zone offset
    // get UTC time in msec
    const lang = 'en-US';
    const d = new Date(data);
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;

    // create new Date object for different city
    // using supplied offset
    const nd = new Date(utc + 3600000 * +7);

    // return time as a string
    return nd.toLocaleDateString(lang, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  }

  function dateToTS(date) {
    return date.valueOf();
  }

  // Define Get all Cases function
  const setAllCaseData = response => {
    // const cases = response.data;
    // console.log(response.data);
    window.cases = response.data;
    window.caseDate = [...new Set(response.data.map(({ dateReported }) => dateReported))];
    const newCaseDate = caseDate.map(item => dateToLabel(item));
    const latestDate = new Date(Math.max(...cases.map(e => new Date(e.dateReported))));
    if (typeof newCaseDate !== 'undefined' && newCaseDate[0].length !== 0) {
      $('#caseTimeseries').ionRangeSlider({
        type: 'single',
        grid: true,
        skin: 'flat',
        min: dateToTS(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0)),
        max: dateToTS(new Date(Date.now()).setHours(0, 0, 0, 0)),
        from: dateToTS(latestDate),
        step: 24 * 60 * 60 * 1000,
        // step: new Date(-60 * 24 * 60 * 60 * 1000),
        prettify: dateToLabel

        // from: '04JUL',
        // values: newCaseDate
      });
    }

    // Define Get Daily CaseData
    const getCaseData = byDate => {
      const dailyCases = cases.filter(e => {
        const d = new Date(e.dateReported);
        return d.getTime() === byDate.getTime();
      });
      window.currentCase = dailyCases;
      window.currentCaseDate = byDate;
      return dailyCases;
    };
    // Define Custom Style Function
    const getStyle = (feature, field, byDate) => {
      const kodeBPS = feature.get('KDEBPS');
      const recentCases = getCaseData(byDate);
      const currentFeature = recentCases.filter(obj => {
        return obj.kodeBPS === kodeBPS;
      })[0];

      if (typeof currentFeature !== 'undefined') {
        return new Style({
          fill: new Fill({
            color: getColor(eval(`currentFeature.${field}`)) // semi-transparent red
          }),
          stroke: new Stroke({ color: '#66666622', width: 1 })
        });
      }
    };

    caseLayer.setStyle(function caseStyle(feature) {
      const field = 'posAktif';
      // const latestDate = new Date(Math.max(...cases.map(e => new Date(e.dateReported))));
      return getStyle(feature, field, latestDate);
    });

    function changeCaseStyle() {
      const typeValue = $('#caseType').val();
      const dateValue = Number($('#caseTimeseries').val());
      const byDate = new Date(dateValue);
      caseLayer.setStyle(function caseStyle(feature) {
        return getStyle(feature, typeValue, byDate);
      });
    }

    $('#caseType').on('change', function changeCaseType() {
      changeCaseStyle();
    });
    $('#caseTimeseries').on('change', function changeCaseDate() {
      changeCaseStyle();
    });
  };
  getAllCaseData(setAllCaseData);

  map.addLayer(caseLayer);

  // Add EventListener for Case
  $('#caseOpacity').on('change', function changeCaseOpacity() {
    const sliderValue = $(this).val();
    caseLayer.setOpacity(sliderValue / 100);
    // changeOpacity('indeksResiko', sliderValue);
  });

  // const container = document.getElementById('popup');
  const popupMain = document.getElementById('popup-main');
  const popupLocations = document.getElementById('popup-locations');
  // const closer = document.getElementById('popup-closer');

  map.on('click', function getCoordinate(evt) {
    if ($('#measureType').val() === 'None') {
      const currentCoord = olProj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
      // const currentPixel = evt.pixel;
      // const currentBBOX = olProj.transform(
      //   map.getView().calculateExtent(map.getSize()),
      //   'EPSG:3857',
      //   'EPSG:4326'
      // );
      const selectedfeature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
        // eslint-disable-next-line no-underscore-dangle
        return feature.values_;
      });
      const kodeBPS = selectedfeature.KDEBPS;
      const currentFeature = currentCase.filter(obj => {
        return obj.kodeBPS === kodeBPS;
      })[0];

      // $('#analyzeModal').addClass('is-active');
      // $('html').addClass('is-clipped');
      overlay.setPosition(evt.coordinate);
      popupLocations.innerHTML = `<p>Long: <code>${currentCoord[0]}</code><br>Lat: <code>${currentCoord[1]}</code></p>`;
      popupMain.innerHTML = `<ul><li><strong>Kecamatan:</strong> ${selectedfeature.WIADKC}</li>
		<li><strong>Kelurahan:</strong> ${selectedfeature.NAMOBJ}</li>
		<li><strong>Positif Aktif:</strong> ${currentFeature.posAktif}</li>
		<li><strong>Suspek Dipantau:</strong> ${currentFeature.suspekDipantau}</li>
		<li><strong>Kontak Erat:</strong> ${currentFeature.kontakDipantau}</li>
		<li><strong>Positif Sembuh:</strong> ${currentFeature.posSmbh}</li>
		<li><strong>Positif Meninggal:</strong> ${currentFeature.posMeninggal}</li>
		</ul>`;
    }

    // const transBBOX = olProj.transform(currentBBOX, 'EPSG:3857', 'EPSG:4326');
    // const long = coord[0];
    // const lat = coord[0];
    // console.log(currentFeature);
    // console.log(currentCaseDate);
    // console.log(currentBBOX);
  });
}

setCases();
