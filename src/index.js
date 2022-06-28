import * as OfflinePluginRuntime from 'offline-plugin/runtime';

import './fonts/libre-baskerville-v5-latin-regular.woff';
import './fonts/libre-baskerville-v5-latin-regular.woff2';

import './dummy/layerData.json';
import './dummy/dataKasus3.json';
import './dummy/admindesa.json';
import './dummy/indexLayer.json';
import './dummy/lokasiPohon.json';

// import '@mdi/font/css/materialdesignicons.css';

import 'ol/ol.css';
import 'ion-rangeslider/css/ion.rangeSlider.min.css';

import './index.html';
import './index.scss';
import './scripts/script';
import './scripts/map';
import './scripts/layer';
import './scripts/measure';
import './scripts/riskIndex';
import './scripts/selectFeature';
// import './scripts/cases';

OfflinePluginRuntime.install();
