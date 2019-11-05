/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
const BASE_URL_ALIAS = '$base_url'

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,

  properties: [
    {
      type: 'id-input',
      label: 'target-map',
      name: 'targetMap',
      proprety: {
        component: 'baidu-map' // component의 type (null or undefined이면 모든 컴포넌트)
      }
    },
    {
      type: 'number',
      label: 'latitude',
      name: 'lat'
    },
    {
      type: 'number',
      label: 'longitude',
      name: 'lng'
    },
    {
      type: 'image-selector',
      label: 'image-src',
      name: 'imageSrc',
      property: {
        displayField: 'id',
        displayFullUrl: true,
        baseUrlAlias: BASE_URL_ALIAS,
        defaultStorage: 'scene-image',
        storageFilters: {
          type: Array,
          value: [
            {
              name: 'category',
              value: 'image'
            }
          ]
        },
        useUpload: true
      }
    },
    {
      type: 'string',
      label: 'center-name',
      name: 'centerName'
    },
    {
      type: 'string',
      label: 'address',
      name: 'address'
    },
    {
      type: 'string',
      label: 'tel-num',
      name: 'telNum'
    },
    {
      type: 'select',
      label: 'popup-event-type',
      name: 'popupEventType',
      property: {
        options: [
          {
            display: 'click',
            value: 'click'
          },
          {
            display: 'hover',
            value: 'hover'
          }
        ]
      }
    },
    {
      type: 'number',
      label: 'popup-height',
      name: 'popupHeight'
    },
    {
      type: 'number',
      label: 'popup-width',
      name: 'popupWidth'
    },
    {
      type: 'cjmarker-content',
      label: 'cjmarker-content',
      name: 'content'
    }
  ],
  'value-property': 'latlng'
}

import { Component, RectPath, Shape } from '@hatiolab/things-scene'

export default class CjMarker extends RectPath(Shape) {
  static get nature() {
    return NATURE
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
        maxWidth: 322,
        width: this.get('popupWidth') || 440,
        height: this.get('popupHeight') || 320
      }
      var cjInfoStyle = `
      /*mouseover과 mouseout이 반복하여 발생하여 깜빡임 현상 해결을 위해 작성*/
      .BMap_pop div:nth-child(8){
        margin-left: 13px !important;
      }
      /*content 가운데 정렬*/
      .BMap_bubble_content{
        text-align: center;
      }

      .BMap_bottom + div, .BMap_center + div, .BMap_pop + div, .BMap_top + div {
        overflow:initial !important;
      }

      .BMap_bottom{
        border-top: 1px solid #fff !important;
        margin-top: -1px;
      }

      .info{
        display: block;
      }

      .info.last{
        padding-bottom: 8px;
      }
      
      .data_table{
        width:100%; 
        height:100%; 
        margin:auto; 
        text-align:center;
        top: -50%;
      }

      .data_table td{
        padding: 5px;
        border-bottom: 1px solid #444444;
      }

      #topLogo{
        width: 200px;
        height: 90px;
      }
    `
      var centerName, address, telNum, tableContent, content
      centerName = address = telNum = tableContent = ''
      content = []

      var imageAddress = this.app.url(this.get('imageSrc')) || ''
      if (this.state && this.state.data) {
        centerName = this.get('centerName') || ''
        address = this.get('address') || ''
        telNum = this.get('telNum') || ''
        content = this.get('content') || []
        if (content.length > 0) {
          tableContent += '<table class="data_table">'
          for (var i = 0; i < content.length; i++) {
            tableContent += `<tr><td>${content[i].name}</td>
            <td>${this.data[content[i].qty] || ''}</td>
            <td>${content[i].unit}</td></tr>`
          }
          tableContent += '</table>'
        }
      }

      this._infoWindow = new BMap.InfoWindow(
        `<style>${cjInfoStyle} </style> 
        <div style="background-color:white">
          <img id ="topLogo" src="${imageAddress}"/>
          <h2>${centerName}</h2>
          <span class="info">${address}</span>
          <span class="info last">${telNum}</span>
          ${tableContent}
        </div>
        `,
        opts
      )
    }

    return this._infoWindow
  }

  openInfoWindow() {
    var map = this.findMap()
    if (!map || !map.map) return

    let { lat, lng } = this.model

    let point = new BMap.Point(lng, lat)

    map.map.openInfoWindow(this.infoWindow, point)
  }

  onmarkerclick(e) {
    if (this.get('popupEventType') == 'click' || !this.get('popupEventType')) {
      this.openInfoWindow()
    }
  }

  onmarkermouseover(e) {
    if (this.get('popupEventType') == 'hover') {
      this.openInfoWindow()
    }
  }

  onmarkermouseout(e) {
    if (this.get('popupEventType') == 'hover') {
      this.infoWindow.close()
    }
  }

  set marker(marker) {
    var map = this.findMap()

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
    var { top, left, width, height } = this.model

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

  get controls() {}

  findMap(id) {
    id = id || this.get('targetMap')

    return id && this.root.findById(id)
  }

  get click_handler() {
    if (!this._click_handler) this._click_handler = this.onmarkerclick.bind(this)

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

Component.register('cj-marker', CjMarker)
