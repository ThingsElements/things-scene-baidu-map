/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties : [{
    type: 'number',
    label: 'value',
    name: 'value'
  },{
    type: 'angle',
    label: 'angle property',
    name: 'propAngle'
  },{
    type: 'string',
    label: 'string property',
    name: 'propString'
  },{
    type: 'color',
    label: 'color property',
    name: 'propColor'
  }]
}

import { Component, ValueHolder, RectPath, Shape, error } from '@hatiolab/things-scene';

export default class BmapMarker extends ValueHolder(RectPath(Shape)) {

  static get nature() {
    return NATURE;
  }

  dispose() {
    super.dispose();
  }

  render(context) {
    var {
      top,
      left,
      height,
      width,
      backgroundColor = 'transparent',
      reverse
    } = this.model;

    this.animOnValueChange(this.value);

    // background의 색상
    context.beginPath();
    context.rect(left, top, width, height);

    context.fillStyle = backgroundColor;
    context.fill();

    // value의 색상
    context.beginPath();

    var drawValue = width - width * Math.max(Math.min(this.animValue, 100), 0) / 100;
    drawValue = Math.max(Math.min(drawValue, width), 0);

    context.rect(left + drawValue, top, width - drawValue, height);

    this.drawFill(context);

    context.closePath();

    context.beginPath();

    context.rect(left, top, width, height);
  }

  postrender(context) {
    this.drawStroke(context);
    this.drawText(context);
  }

  get controls() {}
}

Component.register('bmap-marker', BmapMarker);
