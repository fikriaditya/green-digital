/* eslint-disable no-nested-ternary */
import { Map, View, Feature } from 'ol';
import TileWMS from 'ol/source/TileWMS';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
// import getProperties from 'ol/layer/vector';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import Attribution from 'ol/source/Source';
import * as olControl from 'ol/control';
import MousePosition from 'ol/control/MousePosition';
import { createStringXY } from 'ol/coordinate';
import * as olProj from 'ol/proj';
import Overlay from 'ol/Overlay';
import fit from 'ol/View';
import {Fill, Stroke, Style} from 'ol/style';
import Select from 'ol/interaction/Select';
import {OSM, Vector as VectorSource} from 'ol/source';
import {getGeometry, getCoordinates} from 'ol/Feature';
import 'ion-rangeslider';
import $ from 'jquery';
import axios from 'axios';
import { getAllLayerData } from '../services/apiService';

// Set Color-Scheme Condition
const colorSchemeQueryList = window.matchMedia('(prefers-color-scheme: dark)');

// DEFINE MOUSE POSITION CONTROL
const mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(6),
  projection: 'EPSG:4326',
  // comment the following two lines to have the mouse position
  // be placed within the map.
  className: 'custom-mouse-position',
  target: document.getElementById('longlatText'),
  undefinedHTML: '0.000000, 0.000000'
});

// DEFINE SCALE LINE
const scaleLineControl = new olControl.ScaleLine({
  units: 'metric',
  bar: false,
  steps: 4,
  text: true,
  minWidth: 140
});

// Popup showing the position the user clicked
const container = document.getElementById('popup');
const popupMain = document.getElementById('popup-main');
const popupLocations = document.getElementById('popup-locations');
const closer = document.getElementById('popup-closer');

const overlay = new Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});

const selectedStyle = new Style({
  fill: new Fill({
    color: '#eeeeee',
  }),
  stroke: new Stroke({
    color: 'rgba(255, 255, 255, 0.7)',
    width: 2,
  }),
});
function selectStyle(feature) {
  const color = feature.get('COLOR') || '#eeeeee';
  selectedStyle.getFill().setColor(color);
  return selectedStyle;
};

const selectTree = new Select({style: selectStyle});

closer.onclick = function() {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

// DEFINE MAP
const map = new Map({
  target: 'map',
  overlays: [overlay],
  controls: olControl.defaults().extend([mousePositionControl, scaleLineControl]),
  view: new View({
    // center: [11983148, -771099],
    center: [12015048, -772899],
    maxZoom: 25,
    zoom: 17
  })
});


// map.addInteraction(selectTree);
//     selectTree.on('select', function (e) {
//       console.log(e.target.getFeatures());
//       const feature = e.target.getFeatures();
//       console.log(feature.values_.idPohon);
//       // map.getView().fit(feature.getGeometry())
//       // document.getElementById('status').innerHTML =
//       //   '&nbsp;' +
//       //   e.target.getFeatures().getLength() +
//       //   ' selected features (last operation selected ' +
//       //   e.selected.length +
//       //   ' and deselected ' +
//       //   e.deselected.length +
//       //   ' features)';
//     });

// On change resolution handler
map.getView().on('change:resolution', function updateScale(evt) {
  const resolution = evt.target.get('resolution');
  const units = map
    .getView()
    .getProjection()
    .getUnits();
  const dpi = 25.4 / 0.28;
  const mpu = olProj.METERS_PER_UNIT[units];
  let scale = resolution * mpu * 39.37 * dpi;
  if (scale >= 9500 && scale <= 950000) {
    scale = `${Math.round(scale / 1000)}K`;
  } else if (scale >= 950000) {
    scale = `${Math.round(scale / 1000000)}M`;
  } else {
    scale = Math.round(scale);
  }
  document.getElementById('scale').innerHTML = `Skala = 1 : ${scale}`;
});


// DEFINE BASEMAP LAYER
let basemap;

const baseOSM = new TileLayer({
  source: new XYZ({
    attributions:
      '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
      '© <a href="https://www.openstreetmap.org/copyright">' +
      'OpenStreetMap contributors</a>',
    url:
      'https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmlrcmkxNzA3IiwiYSI6ImNqZ2xtc2FtMzBndWszM3JtcWgydWN1MjUifQ.Q6zPd6zgaWuk9R8pc68cPQ'
  }),
  zIndex: 0
});

const baseMapboxLight = new TileLayer({
  source: new XYZ({
    attributions:
      '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
      '© <a href="https://www.openstreetmap.org/copyright">' +
      'OpenStreetMap contributors</a>',
    url:
      'https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmlrcmkxNzA3IiwiYSI6ImNqZ2xtc2FtMzBndWszM3JtcWgydWN1MjUifQ.Q6zPd6zgaWuk9R8pc68cPQ'
  }),
  zIndex: 0
});
const baseMapboxSatellite = new TileLayer({
  source: new XYZ({
    attributions:
      '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
      '© <a href="https://www.openstreetmap.org/copyright">' +
      'OpenStreetMap contributors</a>',
    url:
      'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmlrcmkxNzA3IiwiYSI6ImNqZ2xtc2FtMzBndWszM3JtcWgydWN1MjUifQ.Q6zPd6zgaWuk9R8pc68cPQ'
  }),
  zIndex: 0
});
const baseMapboxDark = new TileLayer({
  source: new XYZ({
    attributions:
      '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
      '© <a href="https://www.openstreetmap.org/copyright">' +
      'OpenStreetMap contributors</a>',
    url:
      'https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmlrcmkxNzA3IiwiYSI6ImNqZ2xtc2FtMzBndWszM3JtcWgydWN1MjUifQ.Q6zPd6zgaWuk9R8pc68cPQ'
  }),
  zIndex: 0
});
const baseEsri = new TileLayer({
  source: new XYZ({
    attributions: new Attribution({
      html:
        'Tiles &copy; <a href="http://services.arcgisonline.com/ArcGIS/' +
        'rest/services/World_Topo_Map/MapServer">ArcGIS</a>'
    }),
    url:
      'http://server.arcgisonline.com/ArcGIS/rest/services/' +
      'World_Imagery/MapServer/tile/{z}/{y}/{x}'
  }),
  zIndex: 0
});

const batasAdmin = new TileLayer({
  source: new TileWMS({
    ratio: 1,
    url: 'http://103.108.201.6/geoserver/geonode/wms',
    params: {
      LAYERS: 'geonode:ADMINISTRASILN',
      TILED: true,
      STYLES: 'geonode:ADMINISTRASI_LN_NEW'
    }
  }),
  zIndex: 3,
  name: 'BatasAdmin'
});

const lokasiPohon = new VectorLayer({
  source: new VectorSource({
    url: '../dummy/lokasiPohon.json',
    attribution: '© <a href="#">Telkom green digital</a>',
    format: new GeoJSON()
  }),
  zIndex:3,
  name: 'LokasiPohon'
});

// const pohonSource = lokasiPohon.getSource();
// console.log(pohonSource)
// console.log(lokasiPohon.features);


// DEFINE LAYER BASED ON JSON
function callLayer(layerData) {
  layerData.forEach(function(obj) {
    // setup layer based on layer type condition
    if (obj.lyrType === 'wms') {
      window[`${obj.lyrShortname.trim()}`] = new TileLayer({
        source: new TileWMS({
          // ratio: 1,
          url: `${obj.lyrUrl}`,
          params: {
            LAYERS: `${obj.lyrTypeName.trim()}`,
            CQL_FILTER: obj.lyrFilter ? `${obj.lyrFilter}` : null,
            STYLES: obj.lyrStyle ? `${obj.lyrStyle}` : null
          }
        }),
        zIndex: 4,
        name: `${obj.lyrShortname.trim()}`
      });
    } else if (obj.lyrType === 'geojson') {
      window[`${obj.lyrShortname.trim()}`] = new VectorLayer({
        source: new VectorSource({
          url: `${obj.lyrUrl}`,
          format: new GeoJSON()
        })
      })

    }
  });
}

axios.get('dummy/layerData.json').then(response => {
  callLayer(response.data);
});
// getAllLayerData(callLayer);

// ADD COLORSCHEME LISTENER
const setColorScheme = e => {
  map.removeLayer(basemap);
  if (e.matches) {
    // Dark
    // basemap = baseMapboxDark;
    basemap = baseMapboxSatellite;
  } else {
    // Light
    // basemap = baseMapboxLight;
    basemap = baseMapboxSatellite;
  }
  map.addLayer(basemap);
};
setColorScheme(colorSchemeQueryList);
colorSchemeQueryList.addListener(setColorScheme);

// UPDATE LAYER FUNCTION
const updateLayer = (lyr, val) => {
  // eslint-disable-next-line no-eval
  const layer = eval(lyr);
  console.log(layer);
  if (val) {
    map.addLayer(layer);
  } else {
    map.removeLayer(layer);
  }
};

// GET LEGEND FUNCTION
const getLegend = (layer, val) => {
  if (!val) {
    $(`#${layer.lyrShortname}Legend`).remove();
  } else {
    $('.legend-list').append(`<li id="${layer.lyrShortname}Legend" class="legend-list-item">
        <div class="legend-title">
          <span class="legend-marker">&#128280</span> ${layer.lyrName}
        </div>
        <div class="legend-body">
          <!-- <i class="icon-minus-sign"></i> -->
          <img class="legend-image" src="http://103.108.201.6/geoserver/geonode/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=${
            layer.lyrTypeName
          }&style=${
      layer.lyrStyle ? layer.lyrStyle : ''
    }&legend_options=countMatched:true;fontAntiAliasing:true;dpi:90;fontsize:10&Transparent=True">
        </div> 
      </li>`);
  }
};

// CHANGE OPACITY FUNCTION
const changeOpacity = (layer, val) => {
  const opacity = val / 100;
  // eslint-disable-next-line no-eval
  const ly = eval(layer);
  ly.setOpacity(opacity);
};

// SET NEW BASEMAP FUNCTION
function setBasemap(mapId) {
  // eslint-disable-next-line no-eval
  const newBasemap = eval(mapId);
  map.addLayer(newBasemap);
  map.removeLayer(basemap);
  // eslint-disable-next-line no-eval
  basemap = eval(mapId);
  map.addLayer(basemap);
  map.removeLayer(newBasemap);
}

// clear checkBox
// function clear() {
//   // map.removeControl(geocoder);

//   closer.blur();
//   const cboxes = document.getElementsByName('ceka[]');
//   const len = cboxes.length;
//   for (let i = 0; i < len; i++) {
//     if (cboxes[i].checked == true) {
//       // cboxes[i].checked = false;
//       y = eval(cboxes[i].value);
//       map.removeLayer(y);
//     }
//   }
//   map.removeLayer(measureLayer);
// }

// listen for basemap component click/tap
$('.basemap-list-item').on('click', function changeBasemap() {
  const mapId = this.id.toString();
  setBasemap(mapId);
});

// map.addLayer(caseLayer);
map.addLayer(lokasiPohon);
// SET EXTENT TO TREE LAYER
const sourcePohon = lokasiPohon.getSource();
sourcePohon.once('change',function(e){
  if(sourcePohon.getState() === 'ready') { 
      map.getView().fit(sourcePohon.getExtent(), map.getSize());
  }
});
// eslint-disable-next-line import/prefer-default-export
export { changeOpacity, overlay, updateLayer, map, getLegend };
