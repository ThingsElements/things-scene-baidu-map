/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'latitude',
    name: 'lat'
  }, {
    type: 'number',
    label: 'longitude',
    name: 'lng'
  }, {
    type: 'number',
    label: 'zoom',
    name: 'zoom'
  }, {
    type: 'string',
    label: 'api-key',
    name: 'apiKey'
  }],
  'value-property': 'latlng'
}

import {
  Component,
  HTMLOverlayContainer,
  ScriptLoader,
  error
} from '@hatiolab/things-scene';

function getGlobalScale(component) {
  var scale = { x: 1, y: 1 };
  var parent = component;

  while (parent) {
    let { x, y } = parent.get('scale') || { x: 1, y: 1 };
    scale.x *= x || 1;
    scale.y *= y || 1;

    parent = parent.parent
  }
  return scale;
}

export default class BaiduMap extends HTMLOverlayContainer {

  static load(component) {

    var key = component.get('apiKey') || 'bMxSipKRYIqOi2q4M7XR7IqKM2Xt3fNy';
    ScriptLoader.load(`http://api.map.baidu.com/getscript?v=1.3&ak=${key}&services=`, [
      'http://api.map.baidu.com/res/13/bmap.css'
    ]).then(() => component.onload(), error);
  }

  ready() {
    super.ready()

    if (this.rootModel) {
      this._listenTo = this.rootModel
      this._listener = function (after) {
        after.scale && this.rescale()
      }.bind(this)
      this.rootModel.on('change', this._listener);
    }
  }

  removed() {
    if (this._listenTo) {
      this._listenTo.off('change', this._listener)

      delete this._listenTo
      delete this._listener
    }
  }

  /*
   * baidu map은 scale된 상태에서 마우스 포지션을 정확히 매핑하지 못하므로, 마커를 정상적으로 동작시키지 못한다.
   * 따라서, baidu map의 경우에는 부모의 스케일의 역으로 transform해서, scale을 1로 맞추어야 한다.
   */
  rescale() {
    var anchor = this._anchor;
    if (!anchor)
      return
    var scale = getGlobalScale(this)

    var sx = 1 / scale.x
    var sy = 1 / scale.y

    var transform = `scale(${sx}, ${sy})`;

    ['-webkit-', '-moz-', '-ms-', '-o-', ''].forEach(prefix => {
      anchor.style[prefix + 'transform'] = transform;
      anchor.style[prefix + 'transform-origin'] = '0px 0px';
    })

    var { width, height } = this.model
    anchor.style.width = width * scale.x + 'px'
    anchor.style.height = height * scale.y + 'px'

    if (BaiduMap.loaded) {
      // google.maps.event.trigger(this.map, "resize");

      let {
        lat,
        lng,
        zoom
      } = this.model

      let point = new BMap.Point(lat, lng);
      this.map.centerAndZoom(point, zoom);
    }
  }

  createElement() {
    super.createElement();
    this._anchor = document.createElement('div')
    this.element.appendChild(this._anchor)
    this.rescale()

    this._markerComponents = []
    this._markers = []

    this._onmarkerchange = this.onmarkerchange.bind(this)

    BaiduMap.load(this)
  }

  onload() {
    BaiduMap.loaded = true

    var map = this.map

    this.buildMarkers()

    this.rescale()
  }

  get tagName() {
    return 'div'
  }

  get map() {
    if (!this._map) {
      var {
        lat,
        lng,
        zoom
      } = this.model

      let map = new BMap.Map(this._anchor);

      let point = new BMap.Point(lat, lng);
      map.centerAndZoom(point, zoom);
      // map.setMinZoom(7);
      // map.setMaxZoom(19);

      map.enableScrollWheelZoom();
      // map.addControl(new BMap.ScaleControl());        // 添加比例尺控件
      // map.addControl(new BMap.MapTypeControl());      // 添加地图类型控件
      // map.addControl(new BMap.NavigationControl());   // 添加缩放平移控件
      // map.addControl(new BMap.OverviewMapControl({
      //   isOpen: true, anchor: BMAP_ANCHOR_BOTTOM_RIGHT
      // }));  // 添加缩略地图控件

      this._map = map;
    }

    return this._map
  }

  dispose() {
    super.dispose()

    this._markerComponents && this._markerComponents.slice().forEach(component => {
      this.removeMarker(component)
    })

    delete this._markerComponents
    delete this._markers
    delete this._anchor
  }

  buildMarkers() {
    var markers = []

    this._markerComponents.forEach(component => {
      let {
        lat,
        lng
      } = component.model

      let point = new BMap.Point(lat, lng);
      let marker = new BMap.Marker(point);
      markers.push(marker)

      this.map.addOverlay(marker);

      component.marker = marker
    })

    this._markers = markers
  }

  touchMarker(component) {
    var idx = this._markerComponents.indexOf(component)
    if (idx == -1 || !BaiduMap.loaded)
      return

    var marker = this._markers[idx]
    var {
      lat,
      lng
    } = component.model

    let point = new BMap.Point(lat, lng);
    // TODO replace following code with Baidu API
    // marker.setPosition(new google.maps.LatLng(lat, lng))
  }

  onmarkerchange(after, before, hint) {
    var component = hint.origin

    if (after.hasOwnProperty('lat') || after.hasOwnProperty('lng'))
      this.touchMarker(component)
  }

  addMarker(component) {
    if (!this._markerComponents)
      this._markerComponents = []

    var markerComponents = this._markerComponents
    var markers = this._markers

    if (markerComponents.indexOf(component) == -1) {
      markerComponents.push(component)
      component.on('change', this._onmarkerchange)

      if (!BaiduMap.loaded)
        return

      let {
        lat,
        lng
      } = component.model

      let point = new BMap.Point(lat, lng);
      let marker = new BMap.Marker(point);
      markers.push(marker)

      this.map.addOverlay(marker);

      component.marker = marker
    }
  }

  removeMarker(component) {
    if (!this._markerComponents)
      return

    var idx = this._markerComponents.indexOf(component)
    if (idx == -1)
      return

    component.off('change', this._onmarkerchange)
    component.marker = null

    this._markerComponents.splice(idx, 1)
    var removals = this._markers.splice(idx, 1)
  }

  get markers() {
    if (!this._markerComponents) {
      this._markerComponents = []
      this._markers = []
    }

    return this._markers
  }

  setElementProperties(div) {
    this.rescale()
  }

  onchange(after, before) {
    if (BaiduMap.loaded) {
      if (after.zoom || after.hasOwnProperty('lat') || after.hasOwnProperty('lng')) {

        let {
          lat,
          lng,
          zoom
        } = this.model

        let point = new BMap.Point(lat, lng);
        this.map.centerAndZoom(point, zoom);
      }
    }

    super.onchange(after, before)

    this.rescale()
  }

  get latlng() {
    return {
      lat: this.get('lat'),
      lng: this.get('lng')
    }
  }

  set latlng(latlng) {
    this.set(latlng)
  }

  get nature() {
    return NATURE;
  }
}

Component.register('baidu-map', BaiduMap);
