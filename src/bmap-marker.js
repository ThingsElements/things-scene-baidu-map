/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'string',
    label: 'target-map',
    name: 'targetMap'
  }, {
    type: 'number',
    label: 'latitude',
    name: 'lat'
  }, {
    type: 'number',
    label: 'longitude',
    name: 'lng'
  }],
  'value-property': 'latlng'
}

import {
  Component,
  RectPath,
  Shape
} from '@hatiolab/things-scene';

export default class BmapMarker extends RectPath(Shape) {

  static get nature() {
    return NATURE;
  }


  dispose() {
    var map = this.findMap()
    map && map.removeMarker(this)

    delete this._infoWindow
    delete this._marker

    super.dispose()
  }

  ready() {
    super.ready()

    var map = this.findMap()
    map && map.addMarker(this)
  }

  get infoWindow() {
    if (!this._infoWindow) {
      var opts = {
        width: 200,     // 信息窗口宽度
        height: 100,     // 信息窗口高度
        title: "海底捞王府井店", // 信息窗口标题
        enableMessage: true,//设置允许信息窗发送短息
        message: "亲耐滴，晚上一起吃个饭吧？戳下面的链接看下地址喔~"
      }

      this._infoWindow = new BMap.InfoWindow('地址：北京市东城区王府井大街88号乐天银泰百货八层', opts);
    }

    return this._infoWindow;
  }

  findInfoWindow(type) {
    var event = this.model.event;
    var infoWindow = event && event[type] && event[type].infoWindow;

    if (infoWindow)
      return this.root.findById(infoWindow)
  }

  setInfoContent(sceneInfoWindow) {

    var tpl = Component.template(sceneInfoWindow.model.frontSideTemplate);
    var content = `<style>${sceneInfoWindow.model.style}</style>` + tpl(this);

    this.infoWindow.setContent(content);
  }

  openInfoWindow(iw) {
    this.setInfoContent(iw)

    var map = this.findMap();
    if (!map || !map.map)
      return

    let {
      lat,
      lng
    } = this.model

    let point = new BMap.Point(lng, lat);
    map.map.openInfoWindow(this._infoWindow, point);
  }

  onmarkerclick(e) {
    var iw = this.findInfoWindow('tap')
    iw && this.openInfoWindow(iw);

    this.trigger('click', e)
  }

  onmarkermouseover(e) {
    var iw = this.findInfoWindow('hover')
    iw && this.openInfoWindow(iw);

    // this.trigger('mouseenter', e)
  }

  onmarkermouseout(e) {
    var iw = this.findInfoWindow('hover')
    iw && this.infoWindow.close();

    // this.trigger('mouseleave', e)
  }

  set marker(marker) {
    var map = this.findMap();

    if (this._marker && this._marker !== marker) {
      map && map.map.removeOverlay(this._marker);
      // this._marker.setMap(null);
      // google.maps.event.clearInstanceListeners(this._marker);

      delete this._marker
    }

    if (marker) {
      marker.addEventListener('click', this.onmarkerclick.bind(this))
      marker.addEventListener('mouseover', this.onmarkermouseover.bind(this))
      marker.addEventListener('mouseout', this.onmarkermouseout.bind(this))

      this._marker = marker
    }
  }

  get hidden() {
    return super.hidden || this.app.isViewMode
  }

  set hidden(hidden) {
    super.hidden = hidden
  }

  _draw(context) {

    var {
      top,
      left,
      width,
      height
    } = this.model;

    context.translate(left, top)

    // 마커 모양 그리기
    context.beginPath()

    context.moveTo(width / 2, height * 0.9)
    context.bezierCurveTo(width / 2.3, height * 0.6, 0, height / 2, 0, height / 4)

    context.ellipse(width / 2, height / 4, width / 2, height / 4, 0, Math.PI * 1, Math.PI * 0)

    context.bezierCurveTo(width, height / 2, width / 1.7, height * 0.6, width / 2, height * 0.9)
    context.closePath()

    context.translate(-left, -top)
  }

  get controls() { }

  findMap(id) {
    id = id || this.get('targetMap')

    return id && this.root.findById(id)
  }

  get click_handler() {
    if (!this._click_handler)
      this._click_handler = this.onmarkerclick.bind(this)

    return this._click_handler
  }

  onchange(after, before) {
    if (before.targetMap) {
      var map = this.findMap(before.targetMap)
      map && map.removeMarker(this)
    }

    if (after.targetMap) {
      var map = this.findMap(after.targetMap)
      var marker = map && map.addMarker(this)
    }

    super.onchange && super.onchange(after, before)
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
}

Component.register('bmap-marker', BmapMarker);
