import Draw from 'ol/interaction/Draw';
import Overlay from 'ol/Overlay';
import Map from 'ol/Map';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { LineString, Polygon, Circle } from 'ol/geom';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { getArea, getLength } from 'ol/sphere';
import { unByKey } from 'ol/Observable';
import $ from 'jquery';
import { map } from './map';

let sketch;
let draw;
let helpTooltipElement;
let helpTooltip;
let measureTooltipElement;
let measureTooltip;
const continuePolygonMsg = 'Click to continue drawing the polygon';
const continueLineMsg = 'Click to continue drawing the line';
const continueRadMsg = 'Click to continue drawing the radius';
const typeSelect = $('#measureType');

// DEFINE MEASURE LAYER
const measureSource = new VectorSource();
const measureLayer = new VectorLayer({
  source: measureSource,
  zIndex: 99,
  style: new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new Stroke({
      color: '#ffcc33',
      width: 2
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: '#ffcc33'
      })
    })
  })
});
map.addLayer(measureLayer);

// POINTER HANDLER
const pointerMoveHandler = evt => {
  if (evt.dragging) {
    return;
  }
  let helpMsg = 'Click to start';

  if (sketch) {
    const geom = sketch.getGeometry();
    if (geom instanceof Polygon) {
      helpMsg = continuePolygonMsg;
    } else if (geom instanceof LineString) {
      helpMsg = continueLineMsg;
    } else if (geom instanceof Circle) {
      helpMsg = continueRadMsg;
    }
  }

  helpTooltipElement.innerHTML = helpMsg;
  helpTooltip.setPosition(evt.coordinate);

  helpTooltipElement.classList.remove('hidden');
};

const measure = map.on('pointermove', pointerMoveHandler);

// map.getViewport().addEventListener('mouseout', function () {
//   helpTooltipElement.classList.add('hidden');
// });

// RESULT HANDLER

const formatLength = line => {
  const length = getLength(line);
  let output;
  if (length > 100) {
    output = `${Math.round((length / 1000) * 100) / 100} km`;
  } else {
    output = `${Math.round(length * 100) / 100} m`;
  }
  return output;
};

/**
 * Format area output.
 */
const formatArea = polygon => {
  const area = getArea(polygon);
  let output;
  if (area > 10000) {
    output = `${Math.round((area / 1000000) * 100) / 100} km<sup>2</sup>`;
  } else {
    output = `${Math.round(area * 100) / 100} m<sup>2</sup>`;
  }
  return output;
};

/**
 * Format radius output.
 */
const formatRad = circle => {
  const radius = Math.round(circle.getRadius() * 100) / 100;
  let output;
  if (radius > 100) {
    output = `${Math.round((radius / 1000) * 100) / 100} km`;
  } else {
    output = `${Math.round(radius * 100) / 100} m`;
  }
  return output;
};

// CREATE HELP TOOLTIP FUNCTION
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'tooltip hidden';
  helpTooltip = new Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left'
  });
  map.addOverlay(helpTooltip);
}

// CREATE MEASURE TOOLTIP
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'tooltip tooltip-measure';
  measureTooltip = new Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center'
  });
  map.addOverlay(measureTooltip);
}

// DRAW INTERACTION
function addDrawInteraction() {
  const measureType = typeSelect.val();

  if (measureType !== 'None') {
    draw = new Draw({
      source: measureSource,
      type: measureType,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          lineDash: [10, 10],
          width: 2
        }),
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.7)'
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          })
        })
      })
    });

    map.addInteraction(draw);

    createMeasureTooltip();
    createHelpTooltip();

    let listener;
    draw.on(
      'drawstart',
      function startSketch(evt) {
        // set sketch
        sketch = evt.feature;

        let tooltipCoord = evt.coordinate;

        listener = sketch.getGeometry().on('change', e => {
          const geom = e.target;
          let output;
          if (geom instanceof Polygon) {
            output = formatArea(geom);
            tooltipCoord = geom.getInteriorPoint().getCoordinates();
          } else if (geom instanceof LineString) {
            output = formatLength(geom);
            tooltipCoord = geom.getLastCoordinate();
          } else if (geom instanceof Circle) {
            output = formatRad(geom);
            tooltipCoord = geom.getLastCoordinate();
          }
          measureTooltipElement.innerHTML = output;
          measureTooltip.setPosition(tooltipCoord);
        });
      },
      this
    );

    draw.on(
      'drawend',
      () => {
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
        measureTooltip.setOffset([0, -7]);
        // unset sketch
        sketch = null;
        // unset tooltip so that a new one can be created
        measureTooltipElement = null;
        createMeasureTooltip();
        unByKey(listener);
      },
      this
    );
  }
  if (measureType === 'None') {
    map.removeOverlay(helpTooltip);
  }
  createMeasureTooltip();
}

// LISTENER FOR MEASURE TOOL
typeSelect.on('change', function changeDraw() {
  map.removeInteraction(draw);
  addDrawInteraction();
});

$('#clearMeasureButton').on('click', function clearMeasure() {
  // map.removeLayer(measureLayer);
  measureSource.clear();
  if (measureTooltipElement) {
    $('.ol-tooltip-static').remove();
  }
});
