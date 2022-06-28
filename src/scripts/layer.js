import $ from 'jquery';
import { changeOpacity, updateLayer, getLegend } from './map';
import { getAllLayerData } from '../services/apiService';

function setLayerMarkup(layerdata) {
  const categories = [...new Set(layerdata.map(({ lyrGroup }) => lyrGroup))];
  categories.forEach(function applyCategories(val) {
    $('#menu-content #responsecontainer').append(
      `<li id="lyrGroup${val}" class="layer-group-list-item" data-toggle="collapse" data-target="#Dinas_Pendidikan">
				<a id="i-3" class="layer-group-toggle" href="#">
					<span class="layer-group-icon">
						<i class="fa fa-globe fa-lg"></i>
					</span>${val}
					<span class="chevron-icon">
						<i class="fa fa-chevron-down"></i>
					</span>
				</a>
				<ul class="layer-list"></ul>
			</li>`
    );
  });

  layerdata.forEach(function applyLayer(obj) {
    console.log('apply-layer');
    const category = $(`#lyrGroup${obj.lyrGroup} ul.layer-list`);
    category.append(
      `<li class="layer-list-item">
			<div class="layer-item-content columns is-gapless is-mobile">
				<div class="layer-toggle column is-1">
					<label class="fancy-checkbox">
						<input class="chk layer-checkbox" type="checkbox" id="${obj.lyrShortname}Toggle" name="${obj.lyrShortname}Toggle" value="${obj.lyrShortname}">
						<i class="fa fa-fw fa-eye checked" style="color:#F69"></i>
						<i class="fa fa-fw fa-eye-slash unchecked"></i>
					</label>
				</div>
				<div class="layer-text column">
					<span>${obj.lyrName}</span>
				</div>
				<div id="info${obj.lyrShortname}" class="layer-icon column is-1">
					<i class="fa fa-info-circle"></i> 
				</div>
			</div>
			<div class="layer-slider">
				<input type="range" min="1" max="100" value="100" class="slider layeropacity" id="${obj.lyrShortname}Slider" name="${obj.lyrShortname}">
			</div>
		</li>`
    );
  });
  // apply event listener
  $('.layer-group-toggle').on('click', function openLayerList() {
    const parent = $(this).parent();
    parent.toggleClass('is-open');
  });
  $('.layer-slider input').on('change', function sliderChange() {
    const sliderName = this.name;
    const sliderValue = $(this).val();
    changeOpacity(sliderName, sliderValue);
  });
  $('.layer-toggle input[type=checkbox]').on('change', function toggleLayer() {
    const layerName = this.value;
    const value = this.checked;
    const layer = layerdata.filter(obj => {
      return obj.lyrShortname === layerName;
    });
    updateLayer(layerName, value);
    getLegend(layer[0], value);
  });
  $('.layer-icon').on('click', function openLayerModal() {
    const iconId = this.id.substring(4);
    const layer = layerdata.filter(obj => {
      return obj.lyrShortname === iconId;
    })[0];
    const lyrModal = $('#layerModal');
    lyrModal.find('.modal-title-text')[0].textContent = layer.lyrName;
    lyrModal.find('.lyrScale')[0].textContent = layer.lyrScale;
    lyrModal.find('.lyrScope')[0].textContent = layer.lyrScope;
    lyrModal.find('.lyrSource')[0].textContent = layer.lyrSource;
    lyrModal.find('.lyrPublish')[0].textContent = layer.lyrPublishdate;
    lyrModal.find('.lyrDesc')[0].textContent = layer.lyrDesc;
    lyrModal.find('.lyrLicense')[0].textContent = layer.lyrLicense;
    lyrModal.addClass('is-active');
    $('html').addClass('is-clipped');
  });
}

getAllLayerData(setLayerMarkup);
