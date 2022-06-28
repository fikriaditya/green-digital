import { Feature } from 'ol';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import { Vector as VectorLayer } from 'ol/layer';
import { Stroke, Style, Fill } from 'ol/style';
import * as olProj from 'ol/proj';
import $ from 'jquery';
import { map, overlay } from './map';
// import { getAllCaseData } from '../services/apiService';

const popupMain = document.getElementById('popup-main');
const popupLocations = document.getElementById('popup-locations');
// ON Tree feature Click
map.on('singleclick', event => {
    // get the feature you clicked
    const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => {
     return feature
    })
    
    // get feature actual coordinate
    const geom = feature.getGeometry();
    const coordinateTree = geom.getCoordinates();
  
    // use transform for displayed coordinate
    const currentCoord = olProj.transform(coordinateTree, 'EPSG:3857', 'EPSG:4326');
    if( feature instanceof Feature ){
      // Update on infobar for detail info
      $('#idPohonTitle').text(feature.values_.id_pohon);
      const id = feature.values_.id_pohon;

      const period = $('#periodSelect').val();
      $('#treeLat').text(currentCoord[1].toFixed(6));
      $('#treeLong').text(currentCoord[0].toFixed(6));
      $('.info-body img').attr('src', `../uploadedPhotos/${id}-${period}.png`);
      $('#treeLoc').text(feature.values_.site);
      $('#treeType').text(feature.values_.type);
      $('#plantDate').text(feature.values_.plant_date);
      $('#treeHeight').text(feature.values_[`h_${period}`] + ' m');
      $('.infobar-container').addClass('is-open');

      // Center to point and adjust zoom level
      map.getView().setCenter(coordinateTree);
      map.getView().setZoom(18);
      
      // Use popup overlay for detail info
    //   overlay.setPosition(coordinateTree);
    //   popupLocations.innerHTML = `<div><figure class="image is-3by2">
    //     <img src="https://bulma.io/images/placeholders/256x256.png")></img></figure><p>Long: <code>${currentCoord[0]}</code><br>Lat: <code>${currentCoord[1]}</code></p></div>`;
    //   popupMain.innerHTML = `<ul><li><strong>ID Pohon:</strong> ${feature.values_.id_pohon}</li>
    //       <li><strong>Tinggi:</strong> ${feature.values_.h_0622}</li>
  
    //       </ul>`;
  
      
    }
   })