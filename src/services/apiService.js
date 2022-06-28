import axios from 'axios';

// const baseCovidUrl = './dummy/';
const baseCovidUrl = 'http://localhost:5000/api/';
const baseGeoportalUrl = 'http://103.108.201.6/geoserver/geonode/';

const getAllCaseData = setCaseData => {
  axios
    .get(`${baseCovidUrl}cases`)
    .then(response => {
      setCaseData(response);
    })
    .catch(error => console.log(error));
};

const getAllIndexData = setIndexData => {
  axios
    .get(`${baseCovidUrl}index`)
    .then(response => {
      setIndexData(response.data);
    })
    .catch(error => console.log(error));
};

const getAllLayerData = setLayerData => {
  axios
    // .get(`${baseCovidUrl}layers`)
    .get('dummy/layerData.json')
    .then(response => {
      setLayerData(response.data);
    })
    .catch(error => console.log(error));
};

const getBasemapData = setBasemapData => {
  axios
    .get(`${baseCovidUrl}baseMapData.json`)
    .then(response => {
      setBasemapData(response);
    })
    .catch(error => console.log(error));
};

const getLayerInfo = setLayerInfo => {
  axios
    .get(`${baseGeoportalUrl}?`, {
      params: {
        SERVICE: 'WMS',
        VERSION: '1.1.1',
        REQUEST: 'GetFeatureInfo',
        FORMAT: 'image/png',
        TRANSPARENT: true,
        QUERY_LAYERS: 'geonode:ADMINDESAAR_BPS',
        LAYERS: 'geonode:ADMINDESAAR_BPS',
        exceptions: 'application/vnd.ogc.se_inimage',
        INFO_FORMAT: 'application/json',
        FEATURE_COUNT: 50,
        X: 50,
        Y: 50,
        SRS: 'EPSG:4326',
        STYLES: '',
        WIDTH: 101,
        HEIGHT: 101,
        BBOX: '107.62,-6.928,107.63,-6.926'
      }
    })
    .then(response => {
      setLayerInfo(response);
    })
    .catch(error => console.log(error));
};

export { getAllCaseData, getAllIndexData, getAllLayerData, getBasemapData, getLayerInfo };
