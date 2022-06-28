import $ from 'jquery';
// Get Legend Function
const getLegend = (name, lyrName, typeName, val) => {
  if (!val) {
    $(`#${name}Legend`).remove();
  } else {
    $('.legend-list').append(`<li id="${name}Legend" class="legend-list-item">
        <div class="legend-title">
          <span class="legend-marker">&#128280</span> ${lyrName}
        </div>
        <div class="legend-body">
          <!-- <i class="icon-minus-sign"></i> -->
          <img class="legend-image" src="http://103.108.201.6/geoserver/geonode/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=${typeName}&legend_options=countMatched:true;fontAntiAliasing:true;dpi:90;fontsize:10&Transparent=True">
        </div> 
      </li>`);
  }
};
