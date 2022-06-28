import $ from 'jquery';
import TileWMS from 'ol/source/TileWMS';
import { Tile as TileLayer } from 'ol/layer';
import { map } from './map';
import { getAllIndexData } from '../services/apiService';

function setIndeks(data) {
  const indeksData = data;
  const latestDate = new Date(Math.max(...indeksData.map(e => new Date(e.publishDate))));
  const latestIndeks = indeksData.filter(e => {
    const d = new Date(e.publishDate);
    return d.getTime() === latestDate.getTime();
  });

  const indeksLabels = [...new Set(indeksData.map(({ labelName }) => labelName))];

  $('#indexTimeseries').ionRangeSlider({
    grid: true,
    skin: 'flat',
    prettify_enabled: false,
    // from: new Date().getMonth(),
    // from: '04JUL',
    values: indeksLabels
  });

  const indeksSource = new TileWMS({
    ratio: 1,
    url: 'http://103.108.201.6/geoserver/geonode/wms',
    params: { LAYERS: `geonode:Covid_Hazard_${latestIndeks[0].labelName}`, TILED: true }
  });

  const indeksResiko = new TileLayer({
    source: indeksSource,
    zIndex: 1,
    name: 'INDEXRISK'
  });

  map.addLayer(indeksResiko);

  function changeIndex() {
    const index = $("input[name='indexRadio']:checked").val();
    const indexDate = $('#indexTimeseries').val();

    const indexLegend = $('.index-legend .legend-title');

    switch (index) {
      case 'Hazard':
        // indexText = 'Ancaman';
        indexLegend[0].textContent = 'Indeks Ancaman';
        break;
      case 'Vulnerability':
        // indexText = 'Kerentanan';
        indexLegend[0].textContent = 'Indeks Kerentanan';
        break;
      case 'Capacity':
        // this.indexText = 'Kapasitas';
        indexLegend[0].textContent = 'Indeks Kapasitas';
        break;
      case 'Risk':
        // this.indexText = 'Resiko';
        indexLegend[0].textContent = 'Indeks Resiko';
        break;
      default:
    }

    // indeksSource.updateParams({
    //   LAYERS: `geonode:Covid_${index}`,
    //   TILED: true
    // });

    indeksSource.updateParams({
      LAYERS: `geonode:Covid_${index}_${indexDate}`,
      TILED: true
    });
  }

  $('.radio-toolbar input[name="indexRadio"]').on('change', function changeIndeksType() {
    changeIndex();
  });

  $('#indexTimeseries').on('change', function changeIndeksType() {
    changeIndex();
  });

  $('#indeksOpacity').on('change', function changeIndeksOpacity() {
    const sliderValue = $(this).val();
    indeksResiko.setOpacity(sliderValue / 100);
    // changeOpacity('indeksResiko', sliderValue);
  });
}

getAllIndexData(setIndeks);
