import icon from './baidu-map.png';

export default {
  type: 'baidu-map',
  description: 'baidu-map',
  group: 'etc',
  /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */
  icon: icon,
  model: {
    type: 'baidu-map',
    left: 150,
    top: 150,
    width: 300,
    height: 200,
    lat: 22.6392,
    lng: 113.811,
    zoom: 10,
    apiKey: 'AIzaSyBgQZb-SFqjQBC_XTxNiz0XapejNwV9PgA'
  }
};
