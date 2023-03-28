<template>
    <div ref="map-root" style="width: 100%; height: 100%">
        <v-card flat tile class="info_markers" v-if="curInfoTempMarkerFlag">
            <InfoTempMarker v-model="curInfoTempMarkerFlag"
                            :marker-name="curNameMarker"
                            :marker-index="curIndexMarker"
                            :marker="curSelectedMarker"
            ></InfoTempMarker>
        </v-card>
        <v-card flat tile class="info_markers" v-if="curInfoSurveyMarkerFlag">
            <InfoSurveyMarker v-model="curInfoSurveyMarkerFlag"
                            :marker-name="curNameMarker"
                            :marker-index="curIndexMarker"
                            :marker="curSelectedMarker"
            ></InfoSurveyMarker>
        </v-card>
    </div>
</template>

<script>
import InfoTempMarker from "./InfoTempMarker";

import View from 'ol/View'
import Map from 'ol/Map'
import TileLayer from 'ol/layer/Tile'
import Stamen from 'ol/source/Stamen'
import ScaleLine from 'ol/control/ScaleLine'
import Zoom from 'ol/control/Zoom'

import ContextMenu from 'ol-contextmenu'


// import ImageLayer from 'ol/layer/Image'
// import Raster from 'ol/source/Raster'

//import OSM from 'ol/source/OSM'
import DoubleClickZoom from 'ol/interaction/DoubleClickZoom'
import Translate from 'ol/interaction/Translate'
import Modify from 'ol/interaction/Modify';
import XYZ from 'ol/source/XYZ'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
//import GeoJSON from 'ol/format/GeoJSON'
import MultiPoint from 'ol/geom/MultiPoint';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import LineString from 'ol/geom/LineString';
import { toLonLat, getPointResolution } from 'ol/proj';
import { Collection } from "ol";
import {getLength, getArea} from 'ol/sphere';

import 'ol/ol.css'
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {Icon, Text} from 'ol/style';
// import {Geometry} from 'ol/geom';
import Feature from 'ol/Feature';

import {
    faLocationArrow,
    faMapPin,
    faCrosshairs,
    faBullseye,
    faHome,
    faGamepad
} from "@fortawesome/free-solid-svg-icons";
//import { faMapMarkerAlt, faCrosshairs, faFlag, faPlaneSlash, faHourglassHalf } from "@fortawesome/free-solid-svg-icons";

import convert from "xml-js";

import EventBus from "@/EventBus";
import axios from "axios";

import arrawImagePath from '../assets/arrow.png'

let svgDroneObj = {};
svgDroneObj.svg = {};
svgDroneObj.svg._attributes = {};
svgDroneObj.svg._attributes.xmlns = 'http://www.w3.org/2000/svg';
svgDroneObj.svg._attributes.x = '0';
svgDroneObj.svg._attributes.y = '0';
svgDroneObj.svg._attributes.width = faLocationArrow.icon[0]/2;
svgDroneObj.svg._attributes.height = faLocationArrow.icon[1]/2;
svgDroneObj.svg._attributes.class = faLocationArrow.icon[3];
svgDroneObj.svg._attributes.viewBox = '-11 -11 ' + (faLocationArrow.icon[0]+22) + ' ' + (faLocationArrow.icon[1]+22);
svgDroneObj.svg.path = {};
svgDroneObj.svg.path._attributes = {};
svgDroneObj.svg.path._attributes.d = faLocationArrow.icon[4];

let svgDroneHomeObj = {};
svgDroneHomeObj.svg = {};
svgDroneHomeObj.svg._attributes = {};
svgDroneHomeObj.svg._attributes.xmlns = 'http://www.w3.org/2000/svg';
svgDroneHomeObj.svg._attributes.x = '0';
svgDroneHomeObj.svg._attributes.y = '0';
svgDroneHomeObj.svg._attributes.width = faHome.icon[0]/3;
svgDroneHomeObj.svg._attributes.height = faHome.icon[1]/3;
svgDroneHomeObj.svg._attributes.class = faHome.icon[3];
svgDroneHomeObj.svg._attributes.viewBox = '-11 -11 ' + (faHome.icon[0]+22) + ' ' + (faHome.icon[1]+22);
svgDroneHomeObj.svg.path = {};
svgDroneHomeObj.svg.path._attributes = {};
svgDroneHomeObj.svg.path._attributes.d = faHome.icon[4];

let svgTempObj = {};
svgTempObj.svg = {};
svgTempObj.svg._attributes = {};
svgTempObj.svg._attributes.xmlns = 'http://www.w3.org/2000/svg';
svgTempObj.svg._attributes.x = '0';
svgTempObj.svg._attributes.y = '0';
svgTempObj.svg._attributes.width = faMapPin.icon[0]/2;
svgTempObj.svg._attributes.height = faMapPin.icon[1]/2;
svgTempObj.svg._attributes.class = faMapPin.icon[3];
svgTempObj.svg._attributes.viewBox = '-11 -11 ' + (faMapPin.icon[0]+22) + ' ' + (faMapPin.icon[1]+22);
svgTempObj.svg.path = {};
svgTempObj.svg.path._attributes = {};
svgTempObj.svg.path._attributes.d = faMapPin.icon[4];

let svgGamepadObj = {};
svgGamepadObj.svg = {};
svgGamepadObj.svg._attributes = {};
svgGamepadObj.svg._attributes.xmlns = 'http://www.w3.org/2000/svg';
svgGamepadObj.svg._attributes.x = '0';
svgGamepadObj.svg._attributes.y = '0';
svgGamepadObj.svg._attributes.width = faGamepad.icon[0]/2;
svgGamepadObj.svg._attributes.height = faGamepad.icon[1]/2;
svgGamepadObj.svg._attributes.class = faGamepad.icon[3];
svgGamepadObj.svg._attributes.viewBox = '-11 -11 ' + (faGamepad.icon[0]+22) + ' ' + (faGamepad.icon[1]+22);
svgGamepadObj.svg.path = {};
svgGamepadObj.svg.path._attributes = {};
svgGamepadObj.svg.path._attributes.d = faGamepad.icon[4];

console.log('svg', faMapPin, faBullseye, faCrosshairs, faGamepad);

const svgScale = 0.18;
const svgTempScale = 0.11;

const colorMapAlt = {
    0:  '#FFFFFF',
    5: '#DD2C00',
    10:  '#FF9E80',
    15:  '#FF6D00',
    20:  '#FFD180',
    25:  '#FFAB00',
    30:  '#FFE57F',
    35:  '#FFD600',
    40:  '#FFFF8D',
    45:  '#AEEA00',
    50:  '#F4FF81',
    55:  '#64DD17',
    60:  '#CCFF90',
    65:  '#00C853',
    70:  '#B9F6CA',
    75:  '#00BFA5',
    80:  '#A7FFEB',
    85:  '#00B8D4',
    90:  '#84FFFF',
    95:  '#0091EA',
    100:  '#80D8FF',
    105:  '#2962FF',
    110:  '#82B1FF',
    115:  '#304FFE',
    120:  '#8C9EFF',
    125:  '#6200EA',
    130:  '#B388FF',
    135:  '#AA00FF',
    140:  '#EA80FC',
    145:  '#C51162',
    150:  '#FF80AB',
    160:  '#BF360C',
    170:  '#E65100',
    180:  '#FF6F00',
    190:  '#F57F17',
    200:  '#827717',
    210:  '#33691E',
    220:  '#1B5E20',
    230:  '#004D40',
    240:  '#006064',
    250:  '#01579B',
    260:  '#0D47A1',
    270:  '#1A237E',
    280:  '#311B92',
    290:  '#4A148C',
    300:  '#880E4F',
};

import pinIcon from '../assets/pin_drop.png';
import centerIcon from '../assets/center.png';
import listIcon from '../assets/view_list.png';
import surveyIcon from '../assets/grid.png';
import InfoSurveyMarker from "./InfoSurveyMarker";

const get_point_dist = (latitude, longitude, distanceInKm, bearingInDegrees) => {
    const R = 6378.1;
    const dr = Math.PI / 180;
    const bearing = bearingInDegrees * dr;
    let lat = latitude * dr;
    let lon = longitude * dr;

    lat = Math.asin(Math.sin(lat) * Math.cos(distanceInKm / R) + Math.cos(lat) * Math.sin(distanceInKm / R) * Math.cos(bearing));
    lon += Math.atan2(
        Math.sin(bearing) * Math.sin(distanceInKm / R) * Math.cos(lat),
        Math.cos(distanceInKm / R) - Math.sin(lat) * Math.sin(lat)
    );
    lat /= dr;
    lon /= dr;
    return {lat, lon};
}

//
// LCC DFS 좌표변환을 위한 기초 자료
//
var RE = 6371.00877; // 지구 반경(km)
var GRID = 0.001; // 격자 간격(km)
var SLAT1 = 30.0; // 투영 위도1(degree)
var SLAT2 = 60.0; // 투영 위도2(degree)
var OLON = 126.0; // 기준점 경도(degree)
var OLAT = 38.0; // 기준점 위도(degree)
var XO = 43; // 기준점 X좌표(GRID)
var YO = 136; // 기1준점 Y좌표(GRID)

function dfs_xy_conv(code, v1, v2) {
    var DEGRAD = Math.PI / 180.0;
    var RADDEG = 180.0 / Math.PI;

    var re = RE / GRID;
    var slat1 = SLAT1 * DEGRAD;
    var slat2 = SLAT2 * DEGRAD;
    var olon = OLON * DEGRAD;
    var olat = OLAT * DEGRAD;

    var sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
    var sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
    var ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = re * sf / Math.pow(ro, sn);
    var rs = {};
    if (code === "toXY") {
        rs['lat'] = v1;
        rs['lng'] = v2;
        var ra = Math.tan(Math.PI * 0.25 + (v1) * DEGRAD * 0.5);
        ra = re * sf / Math.pow(ra, sn);
        var theta = v2 * DEGRAD - olon;
        if (theta > Math.PI) theta -= 2.0 * Math.PI;
        if (theta < -Math.PI) theta += 2.0 * Math.PI;
        theta *= sn;
        rs['x'] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
        rs['y'] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
    }
    else {
        rs['x'] = v1;
        rs['y'] = v2;
        var xn = v1 - XO;
        var yn = ro - v2 + YO;
        ra = Math.sqrt(xn * xn + yn * yn);
        if (sn < 0.0) - ra;
        var alat = Math.pow((re * sf / ra), (1.0 / sn));
        alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;

        if (Math.abs(xn) <= 0.0) {
            theta = 0.0;
        }
        else {
            if (Math.abs(yn) <= 0.0) {
                theta = Math.PI * 0.5;
                if (xn < 0.0) - theta;
            }
            else theta = Math.atan2(xn, yn);
        }
        var alon = theta / sn + olon;
        rs['lat'] = alat * RADDEG;
        rs['lng'] = alon * RADDEG;
    }
    return rs;
}

export default {
    name: 'MapContainer',
    components: {
        InfoSurveyMarker,
        InfoTempMarker,
    },
    props: {
        geojson: Object
    },
    data: () => {

        return {
            quickGotoMode: false,

            curInfoTempMarkerFlag: false,
            curInfoSurveyMarkerFlag: false,

            datum: {targeted: false, lat:0.0, lng:0.0},

            tileCoordObj: {},

            mapHeading: 0,

            olMap: null,
            vectorLayer: null,
            vectorSource: null,
            osmSource: null,
            demSource: null,

            features: [],

            olDroneMarkers: {},
            olTempMarkers: {},
            olSurveyMarkers: {},

            selectedFeature: undefined,
            selectedFeatureFlag: {},
            selectedFeatureId: null,
            selectedTempFeatureId: '',
            selectedSurveyFeatureId: '',

            targetedFeature: undefined,
            targetedTempFeature: {},
            targetedTempFeatureId: {},
            targetedSurveyFeature: {},
            targetedSurveyFeatureId: {},

            targetedTempTranslate: {},
            targetedSurveyTranslate: {},
            targetedSurveyModifyInteraction: {},
            targetedDroneTranslate: {},

            styles: [
                /* We are using two different styles for the polygons:
             *  - The first style is for the polygons themselves.
             *  - The second style is to draw the vertices of the polygons.
             *    In a custom `geometry` function the vertices of a polygon are
             *    returned as `MultiPoint` geometry, which will be used to render
             *    the style.
             */
                new Style({
                    stroke: new Stroke({
                        color: 'blue',
                        width: 3,
                    }),
                    fill: new Fill({
                        color: 'rgba(0, 0, 255, 0.1)',
                    }),
                }),
                new Style({
                    image: new CircleStyle({
                        radius: 5,
                        fill: new Fill({
                            color: 'orange',
                        }),
                    }),
                    geometry: function (feature) {
                        // return the coordinates of the first ring of the polygon
                        const coordinates = feature.getGeometry().getCoordinates()[0];
                        return new MultiPoint(coordinates);
                    },
                }),
            ],
            selectedStyles: [
                /* We are using two different styles for the polygons:
             *  - The first style is for the polygons themselves.
             *  - The second style is to draw the vertices of the polygons.
             *    In a custom `geometry` function the vertices of a polygon are
             *    returned as `MultiPoint` geometry, which will be used to render
             *    the style.
             */
                new Style({
                    stroke: new Stroke({
                        color: 'green',
                        width: 3,
                    }),
                    fill: new Fill({
                        color: 'rgba(0, 0, 255, 0.1)',
                    }),
                }),
                new Style({
                    image: new CircleStyle({
                        radius: 5,
                        fill: new Fill({
                            color: 'orange',
                        }),
                    }),
                    geometry: function (feature) {
                        // return the coordinates of the first ring of the polygon
                        const coordinates = feature.getGeometry().getCoordinates()[0];
                        return new MultiPoint(coordinates);
                    },
                }),
            ],
        }
    },

    watch: {
        // geojson(value) {
        //     this.updateSource(value)
        // },
        // selectedFeature(value) {
        //     this.$emit('select', value)
        // },
    },

    computed: {
    },

    methods: {

        deleteOlTempMarker(obj) {
            console.log(obj.data.marker.getId());
        },

        line_intersect(x1, y1, x2, y2, x3, y3, x4, y4)
        {
            let ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
            if (denom === 0) {
                return null;
            }

            ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
            ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;

            var rx = x1 + ua * (x2 - x1);
            var ry = y1 + ua * (y2 - y1);

            // console.log('px:', x1, x2, x3, x4);
            // console.log('rx:', rx);
            // console.log('py:', y1, y2, y3, y4);
            // console.log('ry:', ry);


            var check_count = 0;
            if((x1 <= rx && rx <= x2) || (x1 >= rx && rx >= x2)) {
                check_count++;
                //console.log('x1 x2 사이');

            }

            if((x3 <= rx && rx <= x4) || (x3 >= rx && rx >= x4)) {
                check_count++;
                //console.log('x3 x4 사이');
            }

            if((y1 <= ry && ry <= y2) || (y1 >= ry && ry >= y2)) {
                check_count++;
                //console.log('y1 y2 사이');
            }

            if((y3 <= ry && ry <= y4) || (y3 >= ry && ry >= y4)) {
                check_count++;
                //console.log('y3 y4 사이');
            }


            if(check_count >= 4) {
                return {
                    x: rx,
                    y: ry,
                    seg1: ua >= 0 && ua <= 1,
                    seg2: ub >= 0 && ub <= 1
                };
            }
            else {
                return null;
            }
        },

        checkBoundaryIntersectionNextPoint(dName, pIndex, currPoint, nextPoint) {
            let resultPoints = [];
            let intersectPoint = null;
            let len = this.$store.state.surveyMarkers[dName][pIndex].paths.length;
            for(let i = 0; i < len; i++) {
                intersectPoint = this.line_intersect(currPoint.lat, currPoint.lon,
                    nextPoint.lat, nextPoint.lon,
                    this.$store.state.surveyMarkers[dName][pIndex].paths[i].lat, this.$store.state.surveyMarkers[dName][pIndex].paths[i].lng,
                    this.$store.state.surveyMarkers[dName][pIndex].paths[(i+1)%len].lat, this.$store.state.surveyMarkers[dName][pIndex].paths[(i+1)%len].lng,
                );

                if(intersectPoint !== null) {
                    resultPoints.push(intersectPoint);
                }
            }

            if(resultPoints.length > 0) {
                return resultPoints;
            }
            else {
                return null;
            }
        },

        getCenterPoly(paths) {

            console.log('getCenterPoly', paths);


            let polyLatMin = paths[0].lat;
            let polyLatMax = paths[0].lat;
            let polyLngMin = paths[0].lng;
            let polyLngMax = paths[0].lng;

            for(let i = 1; i < paths.length; i++) {
                if(polyLatMin > paths[i].lat) {
                    polyLatMin = paths[i].lat;
                }

                if(polyLatMax < paths[i].lat) {
                    polyLatMax = paths[i].lat;
                }

                if(polyLngMin > paths[i].lng) {
                    polyLngMin = paths[i].lng;
                }

                if(polyLngMax < paths[i].lng) {
                    polyLngMax = paths[i].lng;
                }
            }

            return ({
                center: {lat: (polyLatMin + polyLatMax) / 2, lng: (polyLngMin + polyLngMax) / 2},
                min: {lat: polyLatMin, lng: polyLngMin},
                max: {lat: polyLatMax, lng: polyLngMax}
            });
        },

        updateSurveyPath(dName, pIndex, gap, angle, dir) {
            let objCenter = this.getCenterPoly(this.$store.state.surveyMarkers[dName][pIndex].paths);
            let center = objCenter.center;
            let min = objCenter.min;
            let max = objCenter.max;

            this.$store.state.surveyMarkers[dName][pIndex].center = center;
            this.$store.state.surveyMarkers[dName][pIndex].pathLines = [];
            //this.$store.state.surveyMarkers[dName][pIndex].pathLines.push(center);

            this.$store.state.surveyMarkers[dName][pIndex].gap = gap;
            this.$store.state.surveyMarkers[dName][pIndex].angle = angle;
            this.$store.state.surveyMarkers[dName][pIndex].dir = dir;

            const max_try_num = 100;
            for(let i = 0; i < max_try_num; i++) {
                let prevPoint = get_point_dist(center.lat, center.lng, (gap / 1000) * i, (360+(angle+(90*dir)))%360);
                //let intersectPoints = this.checkBoundaryIntersectionNextPoint(dName, pIndex, {lat:center.lat, lon:center.lng}, prevPoint);
                let intersectPoint = null;
                let checkCount = 0;

                if(min.lat <= prevPoint.lat && prevPoint.lat <= max.lat) {
                    checkCount++;
                }

                if(min.lng <= prevPoint.lon && prevPoint.lon <= max.lng){
                    checkCount++;
                }

                if(checkCount <= 1) {
                    break;
                }

                let nextPoint = get_point_dist(prevPoint.lat, prevPoint.lon, (1000 / 1000), angle);
                let intersectPointsUp = this.checkBoundaryIntersectionNextPoint(dName, pIndex, prevPoint, nextPoint);

                if (intersectPointsUp !== null) {
                    checkCount = 0;

                    let dist = 0;

                    for(let p = 0; p < intersectPointsUp.length; p++) {

                        let temp = Math.sqrt(Math.pow(prevPoint.lat - intersectPointsUp[p].x, 2) + Math.pow(prevPoint.lon - intersectPointsUp[p].y, 2));
                        if(dist < temp) {
                            dist = temp;

                            intersectPoint = {x: intersectPointsUp[p].x, y: intersectPointsUp[p].y};
                        }
                    }

                    if (intersectPoint !== null) {
                        if(i%2 === 1) {
                            this.$store.state.surveyMarkers[dName][pIndex].pathLines.push({
                                lat: intersectPoint.x,
                                lng: intersectPoint.y
                            });

                            // let guidePoint = get_point_dist(intersectPoint.x, intersectPoint.y, 0.01, (360 + (angle)) % 360);
                            // this.$store.state.surveyMarkers[dName][pIndex].pathLines.push({
                            //     lat: guidePoint.lat,
                            //     lng: guidePoint.lon
                            // });
                        }
                        else {
                            // let guidePoint = get_point_dist(intersectPoint.x, intersectPoint.y, 0.01, (360 + (angle)) % 360);
                            // this.$store.state.surveyMarkers[dName][pIndex].pathLines.push({
                            //     lat: guidePoint.lat,
                            //     lng: guidePoint.lon
                            // });

                            this.$store.state.surveyMarkers[dName][pIndex].pathLines.push({
                                lat: intersectPoint.x,
                                lng: intersectPoint.y
                            });
                        }
                    }
                }
                else {
                    let nextPoint = get_point_dist(prevPoint.lat, prevPoint.lon, (1000 / 1000), (360+(angle+180))%360);
                    let intersectPointsUp = this.checkBoundaryIntersectionNextPoint(dName, pIndex, prevPoint, nextPoint);

                    if (intersectPointsUp !== null) {
                        checkCount = 0;

                        let dist = 1000000;
                        for(let p = 0; p < intersectPointsUp.length; p++) {

                            let temp = Math.sqrt(Math.pow(prevPoint.lat - intersectPointsUp[p].x, 2) + Math.pow(prevPoint.lon - intersectPointsUp[p].y, 2));
                            if(dist > temp) {
                                dist = temp;

                                intersectPoint = {x: intersectPointsUp[p].x, y: intersectPointsUp[p].y};
                            }
                        }

                        if (intersectPoint !== null) {
                            if(i%2 === 1) {
                                this.$store.state.surveyMarkers[dName][pIndex].pathLines.push({
                                    lat: intersectPoint.x,
                                    lng: intersectPoint.y
                                });

                                // let guidePoint = get_point_dist(intersectPoint.x, intersectPoint.y, 0.01, (360+(angle))%360);
                                // this.$store.state.surveyMarkers[dName][pIndex].pathLines.push({
                                //     lat: guidePoint.lat,
                                //     lng: guidePoint.lon
                                // });
                            }
                            else {
                                // let guidePoint = get_point_dist(intersectPoint.x, intersectPoint.y, 0.01, (360+(angle))%360);
                                // this.$store.state.surveyMarkers[dName][pIndex].pathLines.push({
                                //     lat: guidePoint.lat,
                                //     lng: guidePoint.lon
                                // });

                                this.$store.state.surveyMarkers[dName][pIndex].pathLines.push({
                                    lat: intersectPoint.x,
                                    lng: intersectPoint.y
                                });
                            }
                        }
                    }
                }

                nextPoint = get_point_dist(prevPoint.lat, prevPoint.lon, (1000 / 1000), (360+(angle+180))%360);
                let intersectPointsDn = this.checkBoundaryIntersectionNextPoint(dName, pIndex, prevPoint, nextPoint);

                if (intersectPointsDn !== null) {
                    checkCount = 0;

                    let dist = 0;
                    for(let p = 0; p < intersectPointsDn.length; p++) {

                        let temp = Math.sqrt(Math.pow(prevPoint.lat - intersectPointsDn[p].x, 2) + Math.pow(prevPoint.lon - intersectPointsDn[p].y, 2));
                        if(dist < temp) {
                            dist = temp;

                            intersectPoint = {x: intersectPointsDn[p].x, y: intersectPointsDn[p].y};
                        }
                    }

                    if (intersectPoint !== null) {
                        if(i%2 === 1) {
                            // let guidePoint = get_point_dist(intersectPoint.x, intersectPoint.y, 0.01, (360+(angle+180))%360);
                            // this.$store.state.surveyMarkers[dName][pIndex].pathLines.splice(this.$store.state.surveyMarkers[dName][pIndex].pathLines.length-2, 0, {
                            //     lat: guidePoint.lat,
                            //     lng: guidePoint.lon
                            // });

                            this.$store.state.surveyMarkers[dName][pIndex].pathLines.splice(this.$store.state.surveyMarkers[dName][pIndex].pathLines.length-1, 0, {
                                lat: intersectPoint.x,
                                lng: intersectPoint.y
                            });
                        }
                        else {
                            this.$store.state.surveyMarkers[dName][pIndex].pathLines.push({
                                lat: intersectPoint.x,
                                lng: intersectPoint.y
                            });

                            // let guidePoint = get_point_dist(intersectPoint.x, intersectPoint.y, 0.01, (360+(angle+180))%360);
                            // this.$store.state.surveyMarkers[dName][pIndex].pathLines.push({
                            //     lat: guidePoint.lat,
                            //     lng: guidePoint.lon
                            // });
                        }
                    }
                }
                else {
                    let nextPoint = get_point_dist(prevPoint.lat, prevPoint.lon, (1000 / 1000), angle);
                    let intersectPointsUp = this.checkBoundaryIntersectionNextPoint(dName, pIndex, prevPoint, nextPoint);

                    if (intersectPointsUp !== null) {
                        checkCount = 0;

                        let dist = 1000000;
                        for(let p = 0; p < intersectPointsUp.length; p++) {

                            let temp = Math.sqrt(Math.pow(prevPoint.lat - intersectPointsUp[p].x, 2) + Math.pow(prevPoint.lon - intersectPointsUp[p].y, 2));
                            if(dist > temp) {
                                dist = temp;

                                intersectPoint = {x: intersectPointsUp[p].x, y: intersectPointsUp[p].y};
                            }
                        }

                        if (intersectPoint !== null) {
                            if(i%2 === 1) {
                                // let guidePoint = get_point_dist(intersectPoint.x, intersectPoint.y, 0.01, (360+(angle+180))%360);
                                // this.$store.state.surveyMarkers[dName][pIndex].pathLines.splice(this.$store.state.surveyMarkers[dName][pIndex].pathLines.length-2, 0, {
                                //     lat: guidePoint.lat,
                                //     lng: guidePoint.lon
                                // });

                                this.$store.state.surveyMarkers[dName][pIndex].pathLines.splice(this.$store.state.surveyMarkers[dName][pIndex].pathLines.length-1, 0, {
                                    lat: intersectPoint.x,
                                    lng: intersectPoint.y
                                });
                            }
                            else {
                                this.$store.state.surveyMarkers[dName][pIndex].pathLines.push({
                                    lat: intersectPoint.x,
                                    lng: intersectPoint.y
                                });

                                // let guidePoint = get_point_dist(intersectPoint.x, intersectPoint.y, 0.01, (360+(angle+180))%360);
                                // this.$store.state.surveyMarkers[dName][pIndex].pathLines.push({
                                //     lat: guidePoint.lat,
                                //     lng: guidePoint.lon
                                // });
                            }
                        }
                    }
                }
            }

            for(let i = 1; i < max_try_num; i++) {
                let prevPoint = get_point_dist(center.lat, center.lng, (gap / 1000) * i, (360+(angle+(90*(-dir))))%360);
                //let intersectPoints = this.checkBoundaryIntersectionNextPoint(dName, pIndex, {lat:center.lat, lon:center.lng}, prevPoint);
                let intersectPoint = null;
                let checkCount = 0;

                if(min.lat <= prevPoint.lat && prevPoint.lat <= max.lat) {
                    checkCount++;
                }

                if(min.lng <= prevPoint.lon && prevPoint.lon <= max.lng){
                    checkCount++;
                }

                if(checkCount <= 1) {
                    break;
                }

                let nextPoint = get_point_dist(prevPoint.lat, prevPoint.lon, (1000 / 1000), angle);
                let intersectPoints = this.checkBoundaryIntersectionNextPoint(dName, pIndex, prevPoint, nextPoint);

                if (intersectPoints !== null) {
                    checkCount = 0;

                    let dist = 0;

                    for(let p = 0; p < intersectPoints.length; p++) {

                        let temp = Math.sqrt(Math.pow(prevPoint.lat - intersectPoints[p].x, 2) + Math.pow(prevPoint.lon - intersectPoints[p].y, 2));
                        if(dist < temp) {
                            dist = temp;

                            intersectPoint = {x: intersectPoints[p].x, y: intersectPoints[p].y};
                        }
                    }

                    if (intersectPoint !== null) {
                        if(i%2 === 1) {
                            // let guidePoint = get_point_dist(intersectPoint.x, intersectPoint.y, 0.01, (360 + (angle)) % 360);
                            // this.$store.state.surveyMarkers[dName][pIndex].pathLines.unshift({
                            //     lat: guidePoint.lat,
                            //     lng: guidePoint.lon
                            // });

                            this.$store.state.surveyMarkers[dName][pIndex].pathLines.unshift({
                                lat: intersectPoint.x,
                                lng: intersectPoint.y
                            });
                        }
                        else {
                            this.$store.state.surveyMarkers[dName][pIndex].pathLines.unshift({
                                lat: intersectPoint.x,
                                lng: intersectPoint.y
                            });

                            // let guidePoint = get_point_dist(intersectPoint.x, intersectPoint.y, 0.01, (360 + (angle)) % 360);
                            // this.$store.state.surveyMarkers[dName][pIndex].pathLines.unshift({
                            //     lat: guidePoint.lat,
                            //     lng: guidePoint.lon
                            // });
                        }
                    }
                }
                else {
                    let nextPoint = get_point_dist(prevPoint.lat, prevPoint.lon, (1000 / 1000), (360+(angle+180))%360);
                    let intersectPointsUp = this.checkBoundaryIntersectionNextPoint(dName, pIndex, prevPoint, nextPoint);

                    if (intersectPointsUp !== null) {
                        checkCount = 0;

                        let dist = 1000000;
                        for(let p = 0; p < intersectPointsUp.length; p++) {

                            let temp = Math.sqrt(Math.pow(prevPoint.lat - intersectPointsUp[p].x, 2) + Math.pow(prevPoint.lon - intersectPointsUp[p].y, 2));
                            if(dist > temp) {
                                dist = temp;

                                intersectPoint = {x: intersectPointsUp[p].x, y: intersectPointsUp[p].y};
                            }
                        }

                        if (intersectPoint !== null) {
                            if(i%2 === 1) {
                                // let guidePoint = get_point_dist(intersectPoint.x, intersectPoint.y, 0.01, (360 + (angle)) % 360);
                                // this.$store.state.surveyMarkers[dName][pIndex].pathLines.unshift({
                                //     lat: guidePoint.lat,
                                //     lng: guidePoint.lon
                                // });

                                this.$store.state.surveyMarkers[dName][pIndex].pathLines.unshift({
                                    lat: intersectPoint.x,
                                    lng: intersectPoint.y
                                });
                            }
                            else {
                                this.$store.state.surveyMarkers[dName][pIndex].pathLines.unshift({
                                    lat: intersectPoint.x,
                                    lng: intersectPoint.y
                                });

                                // let guidePoint = get_point_dist(intersectPoint.x, intersectPoint.y, 0.01, (360 + (angle)) % 360);
                                // this.$store.state.surveyMarkers[dName][pIndex].pathLines.unshift({
                                //     lat: guidePoint.lat,
                                //     lng: guidePoint.lon
                                // });
                            }
                        }
                    }
                }

                nextPoint = get_point_dist(prevPoint.lat, prevPoint.lon, (1000 / 1000), (360+(angle+180))%360);
                intersectPoints = this.checkBoundaryIntersectionNextPoint(dName, pIndex, prevPoint, nextPoint);

                if (intersectPoints !== null) {
                    checkCount = 0;

                    let dist = 0;

                    for(let p = 0; p < intersectPoints.length; p++) {

                        let temp = Math.sqrt(Math.pow(prevPoint.lat - intersectPoints[p].x, 2) + Math.pow(prevPoint.lon - intersectPoints[p].y, 2));
                        if(dist < temp) {
                            dist = temp;

                            intersectPoint = {x: intersectPoints[p].x, y: intersectPoints[p].y};
                        }
                    }

                    if (intersectPoint !== null) {
                        if(i%2 === 0) {
                            // let guidePoint = get_point_dist(intersectPoint.x, intersectPoint.y, 0.01, (360 + (angle+180)) % 360);
                            // this.$store.state.surveyMarkers[dName][pIndex].pathLines.splice(2, 0, {
                            //     lat: guidePoint.lat,
                            //     lng: guidePoint.lon
                            // });

                            this.$store.state.surveyMarkers[dName][pIndex].pathLines.splice(1, 0, {
                                lat: intersectPoint.x,
                                lng: intersectPoint.y
                            });
                        }
                        else {
                            this.$store.state.surveyMarkers[dName][pIndex].pathLines.unshift({
                                lat: intersectPoint.x,
                                lng: intersectPoint.y
                            });

                            // let guidePoint = get_point_dist(intersectPoint.x, intersectPoint.y, 0.01, (360 + (angle+180)) % 360);
                            // this.$store.state.surveyMarkers[dName][pIndex].pathLines.unshift({
                            //     lat: guidePoint.lat,
                            //     lng: guidePoint.lon
                            // });
                        }
                    }
                }
                else {
                    let nextPoint = get_point_dist(prevPoint.lat, prevPoint.lon, (1000 / 1000), angle);
                    let intersectPointsUp = this.checkBoundaryIntersectionNextPoint(dName, pIndex, prevPoint, nextPoint);

                    if (intersectPointsUp !== null) {
                        checkCount = 0;

                        let dist = 1000000;
                        for(let p = 0; p < intersectPointsUp.length; p++) {

                            let temp = Math.sqrt(Math.pow(prevPoint.lat - intersectPointsUp[p].x, 2) + Math.pow(prevPoint.lon - intersectPointsUp[p].y, 2));
                            if(dist > temp) {
                                dist = temp;

                                intersectPoint = {x: intersectPointsUp[p].x, y: intersectPointsUp[p].y};
                            }
                        }

                        if (intersectPoint !== null) {
                            if(i%2 === 0) {
                                // let guidePoint = get_point_dist(intersectPoint.x, intersectPoint.y, 0.01, (360 + (angle+180)) % 360);
                                // this.$store.state.surveyMarkers[dName][pIndex].pathLines.splice(2, 0, {
                                //     lat: guidePoint.lat,
                                //     lng: guidePoint.lon
                                // });

                                this.$store.state.surveyMarkers[dName][pIndex].pathLines.splice(1, 0, {
                                    lat: intersectPoint.x,
                                    lng: intersectPoint.y
                                });
                            }
                            else {
                                this.$store.state.surveyMarkers[dName][pIndex].pathLines.unshift({
                                    lat: intersectPoint.x,
                                    lng: intersectPoint.y
                                });

                                // let guidePoint = get_point_dist(intersectPoint.x, intersectPoint.y, 0.01, (360 + (angle+180)) % 360);
                                // this.$store.state.surveyMarkers[dName][pIndex].pathLines.unshift({
                                //     lat: guidePoint.lat,
                                //     lng: guidePoint.lon
                                // });
                            }
                        }
                    }
                }
            }

            this.$store.state.surveyMarkers[dName][pIndex].dists = [];
            let total_dist = 0;
            for(let i = 0; i < this.$store.state.surveyMarkers[dName][pIndex].pathLines.length-1; i++) {
                let cur_lat = this.$store.state.surveyMarkers[dName][pIndex].pathLines[i].lat;
                let cur_lon = this.$store.state.surveyMarkers[dName][pIndex].pathLines[i].lng;
                let result1 = dfs_xy_conv('toXY', cur_lat, cur_lon);

                let tar_lat = this.$store.state.surveyMarkers[dName][pIndex].pathLines[i+1].lat;
                let tar_lon = this.$store.state.surveyMarkers[dName][pIndex].pathLines[i+1].lng;
                let result2 = dfs_xy_conv('toXY', tar_lat, tar_lon);

                let dist = Math.sqrt(Math.pow(result2.x - result1.x, 2) + Math.pow(result2.y - result1.y, 2));

                this.$store.state.surveyMarkers[dName][pIndex].dists.push(dist);
                total_dist += dist;
                //console.log('dist- ', dist);
            }
            this.$store.state.surveyMarkers[dName][pIndex].total_dist = total_dist;

            console.log('total_dist- ', total_dist);

            //
            // const elevator = new this.google.maps.ElevationService();
            //
            // // Initiate the location request
            // elevator.getElevationAlongPath({
            //     path: this.$store.state.surveyMarkers[dName][pIndex].pathLines,
            //     samples: 256,
            // })
            //     .then(({ results }) => {
            //         if (results[0]) {
            //             this.$store.state.surveyMarkers[dName][pIndex].elevations = [];
            //             this.$store.state.surveyMarkers[dName][pIndex].elevations_location = [];
            //
            //             //console.log('getElevationAlongPath', results);
            //
            //             //console.log(this.$store.state.drone_infos[dName].absolute_alt);
            //
            //             //let diff_alt = this.$store.state.drone_infos[dName].alt - this.$store.state.drone_infos[dName].absolute_alt;
            //
            //             for (let i = 0; i < results.length; i++) {
            //                 //console.log(results[i].elevation, results[i].location.lat(), results[i].location.lng());
            //
            //                 //this.$store.state.surveyMarkers[dName][pIndex].elevations.push((results[i].elevation - diff_alt));
            //                 this.$store.state.surveyMarkers[dName][pIndex].elevations.push((results[i].elevation));
            //                 this.$store.state.surveyMarkers[dName][pIndex].elevations_location.push({lat: results[i].location.lat(), lng: results[i].location.lng()});
            //             }
            //         }
            //         else {
            //             console.log("No results found");
            //         }
            //
            //         EventBus.$emit('on-update-info-survey-marker');
            //     })
            //     .catch((e) => {
            //         console.log(location, "Elevation service failed due to: " + e);
            //
            //         EventBus.$emit('on-update-info-survey-marker');
            //     });
        },

        async addOlSurveyMarker(obj) {
            let dName = 'unknown';
            let url_base = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS;

            if(!Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers, dName)) {
                this.$store.state.surveyMarkers[dName] = [];

                let url = url_base + '/SurveyMarkerInfos/' + dName;
                let response = await axios.post(url, {
                    'm2m:cin': {
                        con: []
                    }
                }, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=4'
                    },
                });
                console.log('addOlSurveyMarker-SurveyMarkerInfos-' + dName, response.status, response.data['m2m:cin']);
            }

            let latLng = toLonLat(obj.coordinate);
            let lat = latLng[1];
            let lng = latLng[0];

            let survey = {};
            survey.lat = lat;
            survey.lng = lng;
            survey.alt = 20;
            survey.speed = 5;
            survey.radius = 50;
            survey.turningSpeed = 10;
            survey.targetMavCmd = 16;
            survey.targetStayTime = 1;
            survey.type = 'Survey';
            survey.color = '#9E9E9E';
            survey.selected = false;
            survey.targeted = false;

            let paths = [];
            paths.push({lat: lat, lng: lng});
            let pointU = get_point_dist(lat, lng, 0.1, 0);
            paths.push({lat: pointU.lat, lng: pointU.lon});
            let pointUL = get_point_dist(pointU.lat, pointU.lon, 0.1, -90);
            paths.push({lat: pointUL.lat, lng: pointUL.lon});
            let pointL = get_point_dist(lat, lng, 0.1, -90);
            paths.push({lat: pointL.lat, lng: pointL.lon});

            survey.paths = JSON.parse(JSON.stringify(paths));

            survey.wayOfSurvey = 'forShooting';
            survey.gap = 20;
            survey.dir = 1;
            survey.angle = 0;
            survey.focal = 16;
            survey.sensor_w = 23.5;
            survey.sensor_h = 15.6;
            survey.overlap = 0.7;
            survey.speed = 5;
            survey.period = 5;
            survey.area = 0;
            survey.paramAlt = 150;
            survey.paramOffsetAlt = 0;
            survey.flyAlt = Array(this.$store.state.SAMPLES).fill(150);
            survey.takeoffAlt = Array(this.$store.state.SAMPLES).fill(0);
            survey.offsetAlt = Array(this.$store.state.SAMPLES).fill(0);
            survey.flyAltType = '상대고도';
            survey.pathLines = [];
            survey.elevations = [];
            survey.elevations_location = [];

            this.$store.state.surveyMarkers[dName].push(survey);

            let pIndex = this.$store.state.surveyMarkers[dName].length-1;
            this.updateSurveyPath(dName, pIndex, 20, 0, 1);

            console.log(this.$store.state.surveyMarkers);

            //this.initOlSurveyMarker(dName, pIndex, survey);

            this.pushOlSurveyMarker(survey, dName, pIndex);

            //this.updateSource();

            try {
                let url = url_base + '/SurveyMarkerInfos/' + dName;
                let response = await axios.post(url, {
                    'm2m:cin': {
                        con: this.$store.state.surveyMarkers[dName]
                    }
                }, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=4'
                    },
                });
                console.log('addOlSurveyMarker-SurveyMarkerInfos-' + dName, response.status, response.data['m2m:cin']);
            }
            catch (err) {
                console.log("Error >>", err);
            }
        },

        async addOlTempMarker(obj) {
            let dName = 'unknown';
            let url_base = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS;

            if(!Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers, dName)) {
                this.$store.state.tempMarkers[dName] = [];

                let url = url_base + '/MarkerInfos/' + dName;
                let response = await axios.post(url, {
                    'm2m:cin': {
                        con: []
                    }
                }, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=4'
                    },
                });
                console.log('addOlTempMarker-MarkerInfos-' + dName, response.status, response.data['m2m:cin']);
            }

            let latLng = toLonLat(obj.coordinate);

            let eLngLats = [];
            eLngLats.push(JSON.parse(JSON.stringify(latLng)));

            this.getElevationProfile(eLngLats, async (status, result) => {
                if (status === 200) {
                    //let elevation_val = result.elevationProfile[0].height;
                    let elevation_val = result.results[0].elevation;

                    console.log(elevation_val);

                    let marker = {};
                    marker.lat = latLng[1];
                    marker.lng = latLng[0];
                    marker.alt = 20;
                    marker.speed = 5;
                    marker.radius = 50;
                    marker.turningSpeed = 10;
                    marker.targetMavCmd = 16;
                    marker.targetStayTime = 1;
                    marker.elevation = elevation_val;
                    marker.updatedTempEleFlag = true;
                    marker.type = 'Goto';
                    marker.selected = false;
                    marker.targeted = false;
                    marker.color = '#9E9E9E';

                    this.$store.state.tempMarkers[dName].push(marker);

                    //this.initOlTempMarker(dName);

                    this.pushOlTempMarker(marker, dName, this.$store.state.tempMarkers[dName].length-1);

                    //this.updateSource();

                    try {
                        let url = url_base + '/MarkerInfos/' + dName;
                        let response = await axios.post(url, {
                            'm2m:cin': {
                                con: this.$store.state.tempMarkers[dName]
                            }
                        }, {
                            validateStatus: status => {
                                return status < 500;
                            }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                            headers: {
                                'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                'Content-Type': 'application/json;ty=4'
                            },
                        });
                        console.log('addOlTempMarker-MarkerInfos-' + dName, response.status, response.data['m2m:cin']);
                    } catch (err) {
                        console.log("Error >>", err);
                    }


                    //this.doBroadcastConfirmAddTempMarker(JSON.parse(JSON.stringify(marker)));
                }
            });
        },

        writeIdxedDB(names) {
            const request = window.indexedDB.open('SampleDB');
            request.onerror = (e) => {
                alert('DataBase error', e.target.errorCode);
            }

            request.onsuccess = () => {
                console.log('success');

                const db = request.result;
                const transaction = db.transaction(['name'], 'readwrite');
                //person 객체 저장소에 읽기&쓰기 권한으로 transaction 생성

                // 완료, 실패 이벤트 처리
                transaction.oncomplete = () => {
                    console.log('[oncomplete] success');
                }

                transaction.onerror = () => {
                    console.log('[onerror] fail');
                }

                // transaction으로
                const objStore = transaction.objectStore('name');
                for (const name of names) {
                    const request = objStore.add(name);   // 저장
                    request.onsuccess = (e) => console.log(e.target.result);
                }
            }
        },

        updateSource() {
            //console.log('geojson', geojson);

            const source = this.vectorLayer.getSource();

            // let features = new GeoJSON({
            //     featureProjection: 'EPSG:3857',
            // }).readFeatures(geojson);
            //
            // console.log('features', features);

            this.features = [];

            for(let dName in this.olDroneMarkers) {
                if(Object.prototype.hasOwnProperty.call(this.olDroneMarkers, dName)) {
                    this.features.push(this.olDroneMarkers[dName].headingLineFeature);
                    this.features.push(this.olDroneMarkers[dName].quickLineFeature);
                    this.features.push(this.olDroneMarkers[dName].targetLineFeature);
                    this.features.push(this.olDroneMarkers[dName].droneMarkerFeature);
                    this.features.push(this.olDroneMarkers[dName].droneHomeMarkerFeature);
                    this.features.push(this.olDroneMarkers[dName].directionLineFeature);
                    this.features.push(this.olDroneMarkers[dName].trackingLineFeature);
                    console.log('droneMarkers', this.features);
                }
            }

            for(let dName in this.olTempMarkers) {
                if(Object.prototype.hasOwnProperty.call(this.olTempMarkers, dName)) {
                    //임시//this.features.push(this.olTempMarkers[dName].guideLineFeature);
                    this.features = this.features.concat(this.olTempMarkers[dName].tempMarkerFeatures);

                    // this.olTempMarkers[dName].tempMarkerTranslates.forEach((translate) => {
                    //     this.olMap.addInteraction(translate);
                    // });
                }
            }

            for(let dName in this.olSurveyMarkers) {
                if(Object.prototype.hasOwnProperty.call(this.olSurveyMarkers, dName)) {
                    this.features = this.features.concat(this.olSurveyMarkers[dName].surveyLineFeatures);
                    this.features = this.features.concat(this.olSurveyMarkers[dName].surveyMarkerFeatures);
                }
            }

            source.clear();
            source.addFeatures(this.features);
        },

        getIdxedDBValueSync(key) {
            return new Promise((resolve) => {
                const request = window.indexedDB.open('SampleDB');  // 1. DB 열기
                request.onerror =(e)=> console.log(e.target.errorCode);

                request.onsuccess = () => {
                    const db = request.result;
                    const transaction = db.transaction('name');
                    transaction.onerror = () => console.log('fail');
                    transaction.oncomplete = () => console.log('success');

                    const objStore = transaction.objectStore('name');
                    const objStoreRequest = objStore.get(key);        // 2. get으로 데이터 접근
                    objStoreRequest.onsuccess = () => {
                        resolve(objStoreRequest.result);
                    }
                }
            });
        },

        async getIdxedDBValue(tileCoord) {
            let key = 'OSM_' + tileCoord[0] + '_' + tileCoord[1] + '_' + (-tileCoord[2] - 1);

            return localStorage.getItem(key);
            //
            // let promise = new Promise((resolve, reject) => {
            //     const request = idxedDB.open('SampleDB');  // 1. DB 열기
            //     request.onerror = (e)=> console.log(e.target.errorCode);
            //
            //     request.onsuccess = () => {
            //         const db = request.result;
            //         const transaction = db.transaction('name');
            //         transaction.onerror = () => {
            //             console.log('fail');
            //             return reject();
            //         }
            //         transaction.oncomplete = () => console.log('success');
            //
            //         const objStore = transaction.objectStore('name');
            //         const objStoreRequest = objStore.get(key);        // 2. get으로 데이터 접근
            //         objStoreRequest.onsuccess = () => {
            //             return resolve(objStoreRequest.result.name);
            //         }
            //     }
            // });
            //
            // let result = await promise;
            // console.log(result);
            // console.log(localStorage.getItem(key));
            //
            // return result;
        },

        getOfflineMapImage(id) {
            return new Promise((resolve, reject) => {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'get',
                    url: 'http://localhost:3000/employees/' + id,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: ''
                }).then(
                    (res) => {
                        resolve(res.data);
                    }
                ).catch(
                    (err) => {
                        console.log(err.message);
                        reject(err.message);
                    }
                );
            });
        },

        postOfflineMapImage(obj) {
            return new Promise((resolve, reject) => {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'post',
                    url: 'http://localhost:3000/employees',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: obj
                }).then(
                    (res) => {
                        resolve(res.status);
                    }
                ).catch(
                    (err) => {
                        console.log(err.message);
                        reject(err.message);
                    }
                );
            });
        },

        postCntTempMarkerInfosToMobius(dName) {
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'post',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/MarkerInfos',
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json;ty=3'
                },
                data: {
                    'm2m:cnt': {
                        rn: dName,
                        lbl: ['dName'],
                    }
                }
            }).then(
                (res) => {
                    console.log('-------------------------------------------------------postCntTempMarkerInfosToMobius-axios', res.data);
                }
            ).catch(
                (err) => {
                    console.log(err.message);
                }
            );
        },

        postCinTempMarkerInfoToMobius(dName) {
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'post',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/MarkerInfos/' + dName,
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json;ty=4'
                },
                data: {
                    'm2m:cin': {
                        con: this.$store.state.tempMarkers[dName]
                    }
                }
            }).then(
                (res) => {
                    console.log('-------------------------------------------------------postCinTempMarkerInfoToMobius-axios', res.data);
                }
            ).catch(
                (err) => {
                    console.log(err.message);
                }
            );
        },

        getStyleSurveyMarker(pIndex, targetedColor, strokeWidth, selectedColor) {
            return ([
                new Style({
                    stroke: new Stroke({
                        color: targetedColor,
                        width: strokeWidth,
                    }),
                    fill: new Fill({
                        color: selectedColor
                    }),
                    zIndex: 3,
                }),
            ]);
        },

        getStyleTempMarker(pIndex, fillColor, strokeColor, strokeWidth, tAlt, scale, selectedColor, elevation_val) {
            svgTempObj.svg.path._attributes.fill = fillColor.replace('#', '%23');
            svgTempObj.svg.path._attributes.stroke = strokeColor.replace('#', '%23');
            svgTempObj.svg.path._attributes['stroke-width'] = strokeWidth;

            let xmlSvgTempMarker = convert.js2xml(svgTempObj, {compact: true, ignoreComment: true, spaces: 4});

            return ([
                new Style({
                    image: new Icon({
                        opacity: 1,
                        src: 'data:image/svg+xml;utf8,' + xmlSvgTempMarker,
                        scale: scale,
                        anchor: [0.5, 1],
                    }),
                    text: new Text({
                        text: [pIndex + ':' + String(tAlt) + ':' + elevation_val.toFixed(0), 'bold 11px sans-serif'],
                        textAlign: 'center',
                        offsetY: -25,
                        scale: 1.4,
                        stroke: new Stroke({
                            color: 'black',
                            width: 0.8,
                        }),
                        fill: new Fill({
                            color: (tAlt > 150) ? colorMapAlt[Math.round(tAlt / 10) * 10] : colorMapAlt[Math.round(tAlt / 5) * 5]
                        }),
                    }),
                    zIndex: 3,
                }),
                new Style({
                    image: new CircleStyle({
                        radius: 9,
                        fill: new Fill({
                            color: selectedColor,
                        }),
                    }),
                    geometry: function (feature) {
                        // return the coordinates of the first ring of the polygon
                        const coordinate = feature.getGeometry().getCoordinates();
                        return new Point(coordinate);
                    },
                }),
                new Style({
                    image: new CircleStyle({
                        radius: 1,
                        fill: new Fill({
                            color: '#E8F5E920',
                        }),
                        stroke: new Stroke({
                            color: fillColor,
                            width: 2,
                        }),
                    }),
                    geometry: function (feature) {
                        // return the coordinates of the first ring of the polygon
                        const coordinate = feature.getGeometry().getCoordinates();
                        return new Point(coordinate);
                    },
                }),
            ]);
        },

        updateOlTempMarker(dName, pIndex) {
            let iconStyleTemp = null;
            let selectedColor = '#FAFAFA80';

            if (this.$store.state.tempMarkers[dName][pIndex].selected) {
                selectedColor = '#76FF03F0';
            }

            if (this.$store.state.tempMarkers[dName][pIndex].targeted) {
                iconStyleTemp = this.getStyleTempMarker(
                    pIndex,
                    this.$store.state.drone_infos[dName].color,
                    '#76FF03',
                    '50',
                    this.$store.state.tempMarkers[dName][pIndex].alt,
                    svgTempScale,
                    selectedColor,
                    this.$store.state.tempMarkers[dName][pIndex].elevation,
                );
            }
            else {
                iconStyleTemp = this.getStyleTempMarker(
                    pIndex,
                    this.$store.state.drone_infos[dName].color,
                    '#FFFDE7',
                    '15',
                    this.$store.state.tempMarkers[dName][pIndex].alt,
                    svgTempScale,
                    selectedColor,
                    this.$store.state.tempMarkers[dName][pIndex].elevation,
                );
            }

            this.olTempMarkers[dName].tempMarkerFeatures[pIndex].setStyle(iconStyleTemp);
        },

        initDroneGotoMarker() {

        },

        getStyleDroneGotoMarker() {
            let xmlSvgDroneGotoMarker = convert.js2xml(svgDroneHomeObj, {compact: true, ignoreComment: true, spaces: 4});

            return (new Style({
                image: new Icon({
                    opacity: 1,
                    src: 'data:image/svg+xml;utf8,' + xmlSvgDroneGotoMarker,
                    scale: svgScale,
                    anchor: [0.5, 1],
                }),
                zIndex: 2,
            }));
        },

        getStyleDroneMarker(dName, system_id, fillColor, strokeColor, strokeWidth, dAlt, scale, rotation, armStatus) {
            svgDroneObj.svg.path._attributes.fill = fillColor.replace('#', '%23');
            svgDroneObj.svg.path._attributes.stroke = strokeColor.replace('#', '%23');
            svgDroneObj.svg.path._attributes['stroke-width'] = strokeWidth;

            let xmlSvgDroneMarker = convert.js2xml(svgDroneObj, {compact: true, ignoreComment: true, spaces: 4});

            return [
                new Style({
                    image: new Icon({
                        opacity: 1,
                        src: 'data:image/svg+xml;utf8,' + xmlSvgDroneMarker,
                        scale: scale,
                        rotation: rotation,
                        //anchor: [0.505, 0.505],
                    }),
                    text: new Text({
                        text: [dAlt.toFixed(1)+' m', 'bold 10px sans-serif', '\n', 'bold 10px sans-serif',
                            '', 'bold 10px sans-serif', '\n', 'bold 10px sans-serif',
                            (armStatus === 'DISARMED') ? 'DISARMED' : this.$store.state.drone_infos[dName].curMode, 'bold 10px sans-serif',],
                        textAlign: 'center',
                        offsetY: -25,
                        scale: 1.5,
                        stroke: new Stroke({
                            color: 'black',
                            width: 0.8,
                        }),
                        fill: new Fill({
                            color: (dAlt > 150) ? colorMapAlt[Math.round(dAlt / 10) * 10] : colorMapAlt[Math.round(dAlt / 5) * 5]
                        }),
                    }),
                    zIndex: 2,
                }),
                new Style({
                    text: new Text({
                        textAlign: 'center',
                        offsetY: 40,
                        text: [dName, 'bold 9px sans-serif', '\n', 'bold 9px sans-serif', '(' + system_id + ')', 'bold 9px sans-serif',],
                        scale: 1.6,
                        stroke: new Stroke({
                            color: 'black',
                            width: 0.8,
                        }),
                        fill: new Fill({
                            color: (dAlt > 150) ? colorMapAlt[Math.round(dAlt / 10) * 10] : colorMapAlt[Math.round(dAlt / 5) * 5]
                        }),
                    }),
                    zIndex: 2,
                }),
                new Style({
                    image: new CircleStyle({
                        radius: 10,
                        fill: new Fill({
                            color: fillColor + '08',
                        }),
                        stroke: new Stroke({
                            color: fillColor + '80',
                            width: 1,
                        }),
                    }),
                    geometry: function (feature) {
                        // return the coordinates of the first ring of the polygon
                        const coordinate = feature.getGeometry().getCoordinates();
                        return new Point(coordinate);
                    },
                }),
            ];
        },

        deleteModifyInteraction(feature) {
            let dName = feature.getId().split('-')[0];

            if(this.targetedSurveyModifyInteraction[dName]) {
                this.olMap.removeInteraction(this.targetedSurveyModifyInteraction[dName]);
                this.targetedSurveyModifyInteraction[dName] = null;
            }
        },

        addModifyInteraction(polyFeature) {
            let dName = polyFeature.getId().split('-')[0];

            if(!Object.prototype.hasOwnProperty.call(this.targetedSurveyModifyInteraction, dName)) {
                this.targetedSurveyModifyInteraction[dName] = null;
            }

            if(this.targetedSurveyModifyInteraction[dName]) {
                this.olMap.removeInteraction(this.targetedSurveyModifyInteraction[dName]);
                this.targetedSurveyModifyInteraction[dName] = null;
            }

            this.targetedSurveyModifyInteraction[dName] = new Modify({
                features: new Collection([polyFeature]),
                tag: polyFeature.getId(),
            });

            this.targetedSurveyModifyInteraction[dName].on('modifystart', (evt) => {
                console.log('modifystart', evt);
            });

            this.targetedSurveyModifyInteraction[dName].on('modifyend', (evt) => {
                evt.features.forEach((feature) => {
                    console.log('modifyend', feature.getGeometry().getCoordinates());

                    let dName = feature.getId().split('-')[0];
                    let pIndex = feature.getId().split('-')[1];

                    let svCoordinates = feature.getGeometry().getCoordinates();

                    let paths = [];
                    svCoordinates[0].forEach((coordinate) => {
                        let svLngLat = toLonLat(coordinate);
                        paths.push({lat: svLngLat[1], lng: svLngLat[0]});
                    });

                    this.$store.state.surveyMarkers[dName][pIndex].paths = JSON.parse(JSON.stringify(paths));

                    let angle = this.$store.state.surveyMarkers[dName][pIndex].angle;
                    let gap = this.$store.state.surveyMarkers[dName][pIndex].gap;
                    let dir = this.$store.state.surveyMarkers[dName][pIndex].dir;
                    this.updateSurveyPath(dName, pIndex, gap, angle, dir);

                    let pathLineCoordinates = [];
                    for(let i = 0; i < this.$store.state.surveyMarkers[dName][pIndex].pathLines.length; i++) {
                        let svLat = this.$store.state.surveyMarkers[dName][pIndex].pathLines[i].lat;
                        let svLng = this.$store.state.surveyMarkers[dName][pIndex].pathLines[i].lng;

                        let svPnt = new Point([svLng, svLat]).transform('EPSG:4326', 'EPSG:3857')
                        let svCoordinate = svPnt.getCoordinates();

                        pathLineCoordinates.push(svCoordinate);
                    }

                    this.olSurveyMarkers[dName].surveyLineFeatures[pIndex].getGeometry().setCoordinates(pathLineCoordinates);

                    let lineFeature = this.olSurveyMarkers[dName].surveyLineFeatures[pIndex];

                    let eLngLats = [];

                    this.$store.state.surveyMarkers[dName][pIndex].elevations = [];
                    this.$store.state.surveyMarkers[dName][pIndex].elevations_location = [];

                    for(let i = 0; i < this.$store.state.SAMPLES; i++) {
                        let eLngLat = toLonLat(lineFeature.getGeometry().getCoordinateAt(i/(this.$store.state.SAMPLES-1)));
                        eLngLats.push(eLngLat);
                        this.$store.state.surveyMarkers[dName][pIndex].elevations_location.push({lat: eLngLat[1], lng: eLngLat[0]});
                    }

                    this.getElevationProfile(eLngLats, async (status, result) => {
                        if (status === 200) {
                            console.log('getElevationProfile', dName, this.$store.state.surveyMarkers);
                            result.results.forEach((ele) => {
                                this.$store.state.surveyMarkers[dName][pIndex].elevations.push(ele.elevation);
                            });
                        }
                    });

                    let area = getArea(feature.getGeometry());
                    this.$store.state.surveyMarkers[dName][pIndex].area = area.toFixed(1);
                    console.log('computeArea = ', area.toFixed(1), '㎡');

                    if(this.curInfoSurveyMarkerFlag) {
                        // console.log('do-update-survey-GcsMap', 'on-update-info-survey-marker');
                        // EventBus.$emit('on-update-info-survey-marker');

                        this.updateTargetedSurveyMarker(dName, pIndex);

                        this.curInfoSurveyMarkerFlag = false;

                        this.$forceUpdate();

                        setTimeout(() => {
                            this.curSelectedMarker = this.$store.state.surveyMarkers[dName][pIndex];
                            this.curIndexMarker = pIndex;
                            this.curNameMarker = dName;
                            this.curInfoSurveyMarkerFlag = true;

                            // setTimeout(() => {
                            //     console.log('translateend', 'on-update-info-survey-marker');
                            //     EventBus.$emit('on-update-info-survey-marker');
                            // }, 10);
                        }, 10);
                    }
                });
            });

            this.olMap.addInteraction(this.targetedSurveyModifyInteraction[dName]);

        },

        deleteSurveyTranslate(feature) {
            let dName = feature.getId().split('-')[0];

            if(this.targetedSurveyTranslate[dName]) {
                this.olMap.removeInteraction(this.targetedSurveyTranslate[dName]);
                this.targetedSurveyTranslate[dName] = null;
            }
        },

        deleteTempTranslate(feature) {
            let dName = feature.getId().split('-')[0];

            if(this.targetedTempTranslate[dName]) {
                this.olMap.removeInteraction(this.targetedTempTranslate[dName]);
                this.targetedTempTranslate[dName] = null;
            }
        },

        deleteDroneTranslate(feature) {
            let dName = feature.getId();

            if(this.targetedDroneTranslate[dName]) {
                this.olMap.removeInteraction(this.targetedDroneTranslate[dName]);
                this.targetedDroneTranslate[dName] = null;
            }
        },

        addSurveyTranslate(polyFeature) {
            let dName = polyFeature.getId().split('-')[0];

            if(!Object.prototype.hasOwnProperty.call(this.targetedSurveyTranslate, dName)) {
                this.targetedSurveyTranslate[dName] = null;
            }

            if(this.targetedSurveyTranslate[dName]) {
                this.olMap.removeInteraction(this.targetedSurveyTranslate[dName]);
                this.targetedSurveyTranslate[dName] = null;
            }

            this.targetedSurveyTranslate[dName] = new Translate({
                features: new Collection([polyFeature]),
                tag: polyFeature.getId(),
            });

            this.targetedSurveyTranslate[dName].on('translatestart', function (evt) {
                console.log('survey-translatestart', evt, evt.coordinate);
            });

            this.targetedSurveyTranslate[dName].on('translating', (evt) => {
                evt.features.forEach((feature) => {
                    if (evt.coordinate.length === evt.startCoordinate.length && evt.coordinate.every((u, i) => { return parseInt(u) === parseInt(evt.startCoordinate[i]); }))
                    {
                        feature.setProperties({dragging: false});
                        console.log('feature.getProperties().dragging', feature.getProperties().dragging);
                    }
                    else {
                        feature.setProperties({dragging: true});
                    }
                });
            });

            this.targetedSurveyTranslate[dName].on('translateend', (evt) => {
                //line.setCoordinates([coordMarker2, evt.coordinate]);
                evt.features.forEach(async (feature) => {
                    console.log('survey-translateend', evt.coordinate, feature.getGeometry().getCoordinates(), feature);

                    if(feature.getProperties().dragging) {

                        feature.setProperties({dragging: false});

                        let dName = feature.getId().split('-')[0];
                        let pIndex = feature.getId().split('-')[1];

                        let svCoordinates = feature.getGeometry().getCoordinates();

                        let paths = [];
                        svCoordinates[0].forEach((coordinate) => {
                            let svLngLat = toLonLat(coordinate);
                            paths.push({lat: svLngLat[1], lng: svLngLat[0]});
                        });

                        this.$store.state.surveyMarkers[dName][pIndex].paths = JSON.parse(JSON.stringify(paths));

                        let angle = this.$store.state.surveyMarkers[dName][pIndex].angle;
                        let gap = this.$store.state.surveyMarkers[dName][pIndex].gap;
                        let dir = this.$store.state.surveyMarkers[dName][pIndex].dir;

                        this.updateSurveyPath(dName, pIndex, gap, angle, dir);

                        let pathLineCoordinates = [];
                        for(let i = 0; i < this.$store.state.surveyMarkers[dName][pIndex].pathLines.length; i++) {
                            let svLat = this.$store.state.surveyMarkers[dName][pIndex].pathLines[i].lat;
                            let svLng = this.$store.state.surveyMarkers[dName][pIndex].pathLines[i].lng;

                            let svPnt = new Point([svLng, svLat]).transform('EPSG:4326', 'EPSG:3857')
                            let svCoordinate = svPnt.getCoordinates();

                            pathLineCoordinates.push(svCoordinate);
                        }

                        this.olSurveyMarkers[dName].surveyLineFeatures[pIndex].getGeometry().setCoordinates(pathLineCoordinates);

                        let lineFeature = this.olSurveyMarkers[dName].surveyLineFeatures[pIndex];

                        let eLngLats = [];

                        this.$store.state.surveyMarkers[dName][pIndex].elevations = [];
                        this.$store.state.surveyMarkers[dName][pIndex].elevations_location = [];

                        for(let i = 0; i < this.$store.state.SAMPLES; i++) {
                            let eLngLat = toLonLat(lineFeature.getGeometry().getCoordinateAt(i/(this.$store.state.SAMPLES-1)));
                            eLngLats.push(eLngLat);
                            this.$store.state.surveyMarkers[dName][pIndex].elevations_location.push({lat: eLngLat[1], lng: eLngLat[0]});
                        }

                        this.getElevationProfile(eLngLats, async (status, result) => {
                            if (status === 200) {
                                result.results.forEach((ele) => {
                                    this.$store.state.surveyMarkers[dName][pIndex].elevations.push(ele.elevation);
                                });
                            }
                        });

                        if(this.curInfoSurveyMarkerFlag) {
                            this.updateTargetedSurveyMarker(dName, pIndex);

                            this.curInfoSurveyMarkerFlag = false;

                            this.$forceUpdate();

                            setTimeout(() => {
                                this.curSelectedMarker = this.$store.state.surveyMarkers[dName][pIndex];
                                this.curIndexMarker = pIndex;
                                this.curNameMarker = dName;
                                this.curInfoSurveyMarkerFlag = true;

                                // setTimeout(() => {
                                //     console.log('translateend', 'on-update-info-survey-marker');
                                //     EventBus.$emit('on-update-info-survey-marker');
                                // }, 10);
                            }, 10);
                        }

                        try {
                            let url_base = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS;
                            let url = url_base + '/SurveyMarkerInfos/' + dName;
                            let response = await axios.post(url, {
                                'm2m:cin': {
                                    con: this.$store.state.surveyMarkers[dName]
                                }
                            }, {
                                validateStatus: status => {
                                    return status < 500;
                                }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                                headers: {
                                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                    'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                    'Content-Type': 'application/json;ty=4'
                                },
                            });
                            console.log('translateend-SurveyMarkerInfos-' + dName, response.status, response.data['m2m:cin']);
                        }
                        catch (err) {
                            console.log("Error >>", err);
                        }
                    }
                });
            });

            this.olMap.addInteraction(this.targetedSurveyTranslate[dName]);
        },

        addTempTranslate(feature) {
            let dName = feature.getId().split('-')[0];

            if(!Object.prototype.hasOwnProperty.call(this.targetedTempTranslate, dName)) {
                this.targetedTempTranslate[dName] = null;
            }

            if(this.targetedTempTranslate[dName]) {
                this.olMap.removeInteraction(this.targetedTempTranslate[dName]);
                this.targetedTempTranslate[dName] = null;
            }

            this.targetedTempTranslate[dName] = new Translate({
                features: new Collection([feature]),
                tag: feature.getId(),
            });

            this.targetedTempTranslate[dName].on('translatestart', function (evt) {
                //coordMarker2 = marker2.getCoordinates();

                //this.olDroneMarkers[dName].droneMarkerFeature.getGeometry().setCoordinates(coordinate);

                console.log('translatestart', evt, evt.coordinate);
            });

            this.targetedTempTranslate[dName].on('translating', (evt) => {
                //console.log(evt.coordinate, evt.startCoordinate);
                //console.log('translating', evt.coordinate.every((u, i) => { return parseInt(u/2)*2 === parseInt(evt.startCoordinate[i]/2)*2; }));

                evt.features.forEach((feature) => {
                    if (evt.coordinate.length === evt.startCoordinate.length && evt.coordinate.every((u, i) => { return parseInt(u) === parseInt(evt.startCoordinate[i]); }))
                    {
                        feature.setProperties({dragging: false});
                        console.log('feature.getProperties().dragging', feature.getProperties().dragging);
                    }
                    else {
                        feature.setProperties({dragging: true});
                    }
                });
            });

            this.targetedTempTranslate[dName].on('translateend', (evt) => {
                //line.setCoordinates([coordMarker2, evt.coordinate]);
                evt.features.forEach((feature) => {
                    console.log('translateend', evt.coordinate, feature.getGeometry().getCoordinates(), feature);

                    if(feature.getProperties().dragging) {

                        feature.setProperties({dragging: false});

                        let dName = feature.getId().split('-')[0];
                        let pIndex = feature.getId().split('-')[1];
                        let latLng = toLonLat(feature.getGeometry().getCoordinates());

                        //feature.getGeometry().setCoordinates(evt.coordinate);

                        let eLngLats = [];
                        eLngLats.push(JSON.parse(JSON.stringify(latLng)));

                        this.$store.state.tempMarkers[dName][pIndex].lat = latLng[1];
                        this.$store.state.tempMarkers[dName][pIndex].lng = latLng[0];

                        this.getElevationProfile(eLngLats, async (status, result) => {
                            if (status === 200) {
                                // let elevation_val = result.elevationProfile[0].height;
                                let elevation_val = result.results[0].elevation;

                                // console.log('elevation_val', result.elevationProfile[0].distance, result.elevationProfile[0].height);
                                console.log('elevation_val', result.results[0].elevation);

                                this.$store.state.tempMarkers[dName][pIndex].elevation = elevation_val;

                                feature.getStyle()[0].getText().setText([pIndex + ':' + String(this.$store.state.tempMarkers[dName][pIndex].alt) + ':' + elevation_val.toFixed(0), 'bold 11px sans-serif']);

                                this.$store.state.tempMarkers[dName][pIndex].updatedTempEleFlag = true;

                                if(this.curInfoTempMarkerFlag) {
                                    this.updateSelectedTempMarker(dName, pIndex);

                                    this.curInfoTempMarkerFlag = false;

                                    this.$forceUpdate();

                                    setTimeout(() => {
                                        this.curSelectedMarker = this.$store.state.tempMarkers[dName][pIndex];
                                        this.curIndexMarker = pIndex;
                                        this.curNameMarker = dName;
                                        this.curInfoTempMarkerFlag = true;
                                    }, 10);
                                }

                                //this.postCinTempMarkerInfoToMobius(dName);
                            }
                        });

                        this.olTempMarkers[dName].Coordinates[pIndex] = feature.getGeometry().getCoordinates();

                        //임시//this.olTempMarkers[dName].guideLineFeature.getGeometry().setCoordinates(this.olTempMarkers[dName].Coordinates);

                        try {
                            let url_base = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS;
                            let url = url_base + '/MarkerInfos/' + dName;
                            axios.post(url, {
                                'm2m:cin': {
                                    con: this.$store.state.tempMarkers[dName]
                                }
                            }, {
                                validateStatus: status => {
                                    return status < 500;
                                }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                                headers: {
                                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                    'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                    'Content-Type': 'application/json;ty=4'
                                },
                            }).then(
                                (res) => {

                                    console.log('addOlTempMarker-MarkerInfos-' + dName, res.status, res.data['m2m:cin']);

                                }
                            ).catch(
                                (err) => {
                                    console.log(err.message);
                                }
                            );
                        } catch (err) {
                            console.log("Error >>", err);
                        }

                        let watchingPayload = {};
                        watchingPayload.broadcastMission = 'broadcastUpdateTempMarkerPosition';
                        watchingPayload.payload = {};
                        watchingPayload.payload.pName = dName;
                        watchingPayload.payload.pIndex = pIndex;
                        watchingPayload.payload.lat = latLng[1];
                        watchingPayload.payload.lng = latLng[0];
                        watchingPayload.payload.targeted = this.$store.state.tempMarkers[dName][pIndex].targeted;
                        watchingPayload.payload.selected = this.$store.state.tempMarkers[dName][pIndex].selected;
                        this.broadcast_gcsmap_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/gcsmap';
                        //this.doPublish(this.broadcast_gcsmap_topic, JSON.stringify(watchingPayload));
                        this.$store.state.didIPublish = true;

                        this.$store.state.drone_infos[dName].updatedTempElePathFlag = false;

                        if(feature.getProperties().altKey) {

                            console.log('tempMarker dragging altKey', dName, feature.getProperties().altKey, this.$store.state.drone_infos[dName].alt);

                            if(this.$store.state.drone_infos[dName].alt > 5) {
                                let strPos = this.$store.state.tempMarkers[dName][pIndex].lat + ':' +
                                    this.$store.state.tempMarkers[dName][pIndex].lng + ':' +
                                    this.$store.state.drone_infos[dName].targetAlt + ':' +
                                    this.$store.state.drone_infos[dName].targetSpeed + ':' +
                                    this.$store.state.tempMarkers[dName][pIndex].radius + ':' +
                                    this.$store.state.tempMarkers[dName][pIndex].turningSpeed + ':' +
                                    this.$store.state.tempMarkers[dName][pIndex].targetMavCmd + ':' +
                                    this.$store.state.tempMarkers[dName][pIndex].targetStayTime + ':' +
                                    this.$store.state.tempMarkers[dName][pIndex].elevation;

                                console.log('quick-', 'DroneCommand-setGoto', strPos);

                                EventBus.$emit('command-set-goto-' + dName, strPos);
                            }

                            feature.setProperties({altKey: false});
                        }
                    }
                });
            });

            this.olMap.addInteraction(this.targetedTempTranslate[dName]);
        },

        addDroneTranslate(feature) {
            let dName = feature.getId();

            if(!Object.prototype.hasOwnProperty.call(this.targetedDroneTranslate, dName)) {
                this.targetedDroneTranslate[dName] = null;
            }

            if(this.targetedDroneTranslate[dName]) {
                this.olMap.removeInteraction(this.targetedDroneTranslate[dName]);
                this.targetedDroneTranslate[dName] = null;
            }

            this.targetedDroneTranslate[dName] = new Translate({
                features: new Collection([feature]),
                tag: feature.getId(),
            });

            this.targetedDroneTranslate[dName].on('translatestart', function (evt) {
                //coordMarker2 = marker2.getCoordinates();

                //this.olDroneMarkers[dName].droneMarkerFeature.getGeometry().setCoordinates(coordinate);

                console.log('Drone', 'translatestart', evt, evt.coordinate);
            });

            this.targetedDroneTranslate[dName].on('translating', (evt) => {
                //console.log(evt.coordinate, evt.startCoordinate);
                //console.log('translating', evt.coordinate.every((u, i) => { return parseInt(u/2)*2 === parseInt(evt.startCoordinate[i]/2)*2; }));

                evt.features.forEach((feature) => {
                    if (evt.coordinate.length === evt.startCoordinate.length && evt.coordinate.every((u, i) => { return parseInt(u) === parseInt(evt.startCoordinate[i]); }))
                    {
                        feature.setProperties({dragging: false});
                        console.log('feature.getProperties().dragging', feature.getProperties().dragging);
                    }
                    else {
                        feature.setProperties({dragging: true});
                    }
                });
            });

            this.targetedDroneTranslate[dName].on('translateend', (evt) => {
                //line.setCoordinates([coordMarker2, evt.coordinate]);
                evt.features.forEach((feature) => {
                    console.log('translateend', evt.coordinate, feature.getGeometry().getCoordinates(), feature);

                    if(feature.getProperties().dragging) {

                        feature.setProperties({dragging: false});

                        let dName = feature.getId().split('-')[0];
                        let pIndex = feature.getId().split('-')[1];
                        let latLng = toLonLat(feature.getGeometry().getCoordinates());

                        //feature.getGeometry().setCoordinates(evt.coordinate);

                        let eLngLats = [];
                        eLngLats.push(JSON.parse(JSON.stringify(latLng)));

                        this.getElevationProfile(eLngLats, async (status, result) => {
                            if (status === 200) {
                                // let elevation_val = result.elevationProfile[0].height;
                                let elevation_val = result.results[0].elevation;

                                // console.log('elevation_val', result.elevationProfile[0].distance, result.elevationProfile[0].height);
                                console.log('elevation_val', result.results[0].elevation);
                                this.olTempMarkers[dName].Coordinates[pIndex] = feature.getGeometry().getCoordinates();

                                //임시//this.olTempMarkers[dName].guideLineFeature.getGeometry().setCoordinates(this.olTempMarkers[dName].Coordinates);

                                this.$store.state.tempMarkers[dName][pIndex].lat = latLng[1];
                                this.$store.state.tempMarkers[dName][pIndex].lng = latLng[0];
                                this.$store.state.tempMarkers[dName][pIndex].elevation = elevation_val;

                                this.$store.state.tempMarkers[dName][pIndex].updatedTempEleFlag = true;

                                if(this.curInfoTempMarkerFlag) {
                                    this.updateSelectedTempMarker(dName, pIndex);

                                    this.curInfoTempMarkerFlag = false;

                                    this.$forceUpdate();

                                    setTimeout(() => {
                                        this.curSelectedMarker = this.$store.state.tempMarkers[dName][pIndex];
                                        this.curIndexMarker = pIndex;
                                        this.curNameMarker = dName;
                                        this.curInfoTempMarkerFlag = true;
                                    }, 10);
                                }

                                //this.postCinTempMarkerInfoToMobius(dName);

                                feature.getStyle()[0].getText().setText([pIndex + ':' + String(this.$store.state.tempMarkers[dName][pIndex].alt) + ':' + elevation_val.toFixed(0), 'bold 11px sans-serif']);

                                try {
                                    let url_base = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS;
                                    let url = url_base + '/MarkerInfos/' + dName;
                                    let response = await axios.post(url, {
                                        'm2m:cin': {
                                            con: this.$store.state.tempMarkers[dName]
                                        }
                                    }, {
                                        validateStatus: status => {
                                            return status < 500;
                                        }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                                        headers: {
                                            'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                                            'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                                            'Content-Type': 'application/json;ty=4'
                                        },
                                    });
                                    console.log('addOlTempMarker-MarkerInfos-' + dName, response.status, response.data['m2m:cin']);
                                } catch (err) {
                                    console.log("Error >>", err);
                                }

                                let watchingPayload = {};
                                watchingPayload.broadcastMission = 'broadcastUpdateTempMarkerPosition';
                                watchingPayload.payload = {};
                                watchingPayload.payload.pName = dName;
                                watchingPayload.payload.pIndex = pIndex;
                                watchingPayload.payload.lat = latLng[1];
                                watchingPayload.payload.lng = latLng[0];
                                watchingPayload.payload.targeted = this.$store.state.tempMarkers[dName][pIndex].targeted;
                                watchingPayload.payload.selected = this.$store.state.tempMarkers[dName][pIndex].selected;
                                this.broadcast_gcsmap_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/gcsmap';
                                //this.doPublish(this.broadcast_gcsmap_topic, JSON.stringify(watchingPayload));
                                this.$store.state.didIPublish = true;

                                this.$store.state.drone_infos[dName].updatedTempElePathFlag = false;
                            }
                        });
                    }
                });
            });

            this.olMap.addInteraction(this.targetedDroneTranslate[dName]);
        },

        updateSelectedTempMarker(dName, pIndex) {
            if(this.$store.state.tempMarkers[dName][pIndex].selected) {
                let tempCircle = new CircleStyle({
                    radius: 9,
                    fill: new Fill({
                        color: '#76FF03F0',
                    }),
                });
                this.olTempMarkers[dName].tempMarkerFeatures[pIndex].getStyle()[1].setImage(tempCircle);
            }
            else {
                let tempCircle = new CircleStyle({
                    radius: 9,
                    fill: new Fill({
                        color: '#FAFAFA80',
                    }),
                });
                this.olTempMarkers[dName].tempMarkerFeatures[pIndex].getStyle()[1].setImage(tempCircle);
            }
        },

        updateTargetedSurveyMarker(dName, pIndex) {
            console.log(dName, pIndex, this.$store.state.surveyMarkers[dName][pIndex].targeted);

            let selectedColor = '#76FF03F0';
            if (this.$store.state.surveyMarkers[dName][pIndex].selected) {
                selectedColor = '#76FF0320';
            }
            else {
                selectedColor = '#FAFAFA20';
            }

            let targetedColor = '#76FF03FF';
            if (this.$store.state.surveyMarkers[dName][pIndex].targeted) {
                targetedColor = '#76FF0380';
            }
            else {
                targetedColor = this.$store.state.drone_infos[dName].color + '20';
            }

            let styleSurvey = new Style({
                stroke: new Stroke({
                    color: targetedColor,
                    width: 2,
                }),
                fill: new Fill({
                    color: selectedColor
                }),
                zIndex: 3,
            });

            this.olSurveyMarkers[dName].surveyMarkerFeatures[pIndex].setStyle(styleSurvey);
            this.$forceUpdate();
        },

        updateTargetedTempMarker(dName, pIndex) {
            console.log(dName, pIndex, this.$store.state.tempMarkers[dName][pIndex].targeted);

            if (this.$store.state.tempMarkers[dName][pIndex].targeted) {
                svgTempObj.svg.path._attributes.fill = this.$store.state.drone_infos[dName].color.replace('#', '%23');
                svgTempObj.svg.path._attributes.stroke = '#76FF03'.replace('#', '%23');
                svgTempObj.svg.path._attributes['stroke-width'] = '25';
            }
            else {
                svgTempObj.svg.path._attributes.fill = this.$store.state.drone_infos[dName].color.replace('#', '%23');
                svgTempObj.svg.path._attributes.stroke = '#FFFDE7'.replace('#', '%23');
                svgTempObj.svg.path._attributes['stroke-width'] = '15';
            }

            let xmlSvgTempMarker = convert.js2xml(svgTempObj, {
                compact: true,
                ignoreComment: true,
                spaces: 4
            });

            let tempIcon = new Icon({
                opacity: 1,
                src: 'data:image/svg+xml;utf8,' + xmlSvgTempMarker,
                scale: svgTempScale,
                anchor: [0.5, 1],
            });

            this.olTempMarkers[dName].tempMarkerFeatures[pIndex].getStyle()[0].setImage(tempIcon);
        },

        updateTargetDroneMarker(dName) {
            // if (this.$store.state.drone_infos[dName].targeted) {
            //     svgDroneObj.svg.path._attributes.fill = this.$store.state.drone_infos[dName].color.replace('#', '%23');
            //     svgDroneObj.svg.path._attributes.stroke = '#76FF03'.replace('#', '%23');
            //     svgDroneObj.svg.path._attributes['stroke-width'] = '35';
            // }
            // else {
            //     svgDroneObj.svg.path._attributes.fill = this.$store.state.drone_infos[dName].color.replace('#', '%23');
            //     svgDroneObj.svg.path._attributes.stroke = '#FFFDE7'.replace('#', '%23');
            //     svgDroneObj.svg.path._attributes['stroke-width'] = '25';
            // }
            //
            // let xmlSvgDroneMarker = convert.js2xml(svgDroneObj, {
            //     compact: true,
            //     ignoreComment: true,
            //     spaces: 4
            // });
            //
            // let droneIcon = new Icon({
            //     opacity: 1,
            //     src: 'data:image/svg+xml;utf8,' + xmlSvgDroneMarker,
            //     scale: svgScale + (this.$store.state.drone_infos[dName].alt / 3000),
            //     rotation: ((360 + this.$store.state.drone_infos[dName].heading - 45 + this.mapHeading) % 360) * (Math.PI / 180),
            //     //anchor: [0.51, 0.51],
            // });
            //
            // this.olDroneMarkers[dName].droneMarkerFeature.getStyle()[0].setImage(droneIcon);
            //
            // this.$store.state.drone_command_prepared = false;
            // for (let dName in this.$store.state.drone_infos) {
            //     if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
            //         if (this.$store.state.drone_infos[dName].selected && this.$store.state.drone_infos[dName].targeted) {
            //             this.$store.state.drone_command_prepared = true;
            //             break;
            //         }
            //     }
            // }

            let iconStyleDrone = null;

            if (this.$store.state.drone_infos[dName].targeted) {
                iconStyleDrone = this.getStyleDroneMarker(
                    dName,
                    this.$store.state.drone_infos[dName].system_id,
                    this.$store.state.drone_infos[dName].color,
                    '#76FF03',
                    '25',
                    this.$store.state.drone_infos[dName].alt,
                    svgScale + (this.$store.state.drone_infos[dName].alt / 3000),
                    ((360+this.$store.state.drone_infos[dName].heading-45+this.mapHeading)%360) * (Math.PI / 180),
                    this.$store.state.drone_infos[dName].curArmStatus,
                );
            }
            else {
                iconStyleDrone = this.getStyleDroneMarker(
                    dName,
                    this.$store.state.drone_infos[dName].system_id,
                    this.$store.state.drone_infos[dName].color,
                    '#FFFDE7',
                    '25',
                    this.$store.state.drone_infos[dName].alt,
                    svgScale + (this.$store.state.drone_infos[dName].alt / 3000),
                    ((360+this.$store.state.drone_infos[dName].heading-45+this.mapHeading)%360) * (Math.PI / 180),
                    this.$store.state.drone_infos[dName].curArmStatus,
                );
            }

            this.olDroneMarkers[dName].droneMarkerFeature.setStyle(iconStyleDrone);

            this.$store.state.drone_command_prepared = false;
            for (let dName in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                    if (this.$store.state.drone_infos[dName].selected && this.$store.state.drone_infos[dName].targeted) {
                        this.$store.state.drone_command_prepared = true;
                        break;
                    }
                }
            }
        },

        initDroneMarkers() {
            this.olDroneMarkers = {};

            Object.keys(this.$store.state.drone_infos).forEach((dName) => {
                if(dName !== 'unknown' && this.$store.state.drone_infos[dName].selected) {
                    let dLat = this.$store.state.drone_infos[dName].lat;
                    let dLng = this.$store.state.drone_infos[dName].lng;
                    let dAlt = this.$store.state.drone_infos[dName].alt;

                    let dPnt = new Point([dLng, dLat]).transform('EPSG:4326', 'EPSG:3857')
                    let dCoordinate = dPnt.getCoordinates();

                    this.olDroneMarkers[dName] = {};
                    this.olDroneMarkers[dName].droneMarkerFeature = new Feature({
                        geometry: new Point([dCoordinate[0], dCoordinate[1]]),
                        type: 'droneMarker',
                    });
                    this.olDroneMarkers[dName].droneMarkerFeature.setId(dName);

                    svgDroneObj.svg.path._attributes.fill = this.$store.state.drone_infos[dName].color.replace('#', '%23');
                    svgDroneObj.svg.path._attributes.stroke = 'white';
                    svgDroneObj.svg.path._attributes['stroke-width'] = '25';
                    this.olDroneMarkers[dName].droneMarker = convert.js2xml(svgDroneObj, {compact: true, ignoreComment: true, spaces: 4});

                    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx droneMarker', this.olDroneMarkers[dName].droneMarker);

                    let iconStyleDrone = this.getStyleDroneMarker(
                        dName,
                        this.$store.state.drone_infos[dName].system_id,
                        this.$store.state.drone_infos[dName].color,
                        '#FFFDE7',
                        '25',
                        dAlt,
                        svgScale + (dAlt / 3000),
                        ((360+this.$store.state.drone_infos[dName].heading-45+this.mapHeading)%360) * (Math.PI / 180),
                        this.$store.state.drone_infos[dName].curArmStatus,
                    );

                    this.olDroneMarkers[dName].droneMarkerFeature.setStyle(iconStyleDrone);

                    if(this.$store.state.drone_infos[dName].headingLine.length === 0) {
                        this.$store.state.drone_infos[dName].headingLine.push({lat: 0, lng: 0});
                        this.$store.state.drone_infos[dName].headingLine.push({lat: 0, lng: 0});
                    }

                    let sLat = this.$store.state.drone_infos[dName].headingLine[0].lat;
                    let sLng = this.$store.state.drone_infos[dName].headingLine[0].lng;
                    let eLat = this.$store.state.drone_infos[dName].headingLine[1].lat;
                    let eLng = this.$store.state.drone_infos[dName].headingLine[1].lng;

                    let sPnt = new Point([sLng, sLat]).transform('EPSG:4326', 'EPSG:3857')
                    let sCoordinate = sPnt.getCoordinates();
                    let ePnt = new Point([eLng, eLat]).transform('EPSG:4326', 'EPSG:3857')
                    let eCoordinate = ePnt.getCoordinates();

                    this.olDroneMarkers[dName].headingLineFeature = new Feature({
                        geometry: new LineString([[sCoordinate[0], sCoordinate[1]], [eCoordinate[0], eCoordinate[1]]]),
                        type: 'headingLine-'+dName,
                    });

                    let headingLineStyle = new Style({
                        stroke: new Stroke({
                            color: this.$store.state.drone_infos[dName].color,
                            width: 1,
                        })
                    });

                    this.olDroneMarkers[dName].headingLineFeature.setStyle(headingLineStyle);

                    this.olDroneMarkers[dName].quickLineFeature = new Feature({
                        geometry: new LineString([[sCoordinate[0], sCoordinate[1]], [eCoordinate[0], eCoordinate[1]]]),
                        type: 'headingLine-'+dName,
                    });

                    let quickLineStyle = new Style({
                        stroke: new Stroke({
                            color: this.$store.state.drone_infos[dName].color,
                            width: 1,
                        })
                    });

                    this.olDroneMarkers[dName].quickLineFeature.setStyle(quickLineStyle);

                    if(this.$store.state.drone_infos[dName].directionLine.length === 0) {
                        this.$store.state.drone_infos[dName].directionLine.push({lat: 0, lng: 0});
                        this.$store.state.drone_infos[dName].directionLine.push({lat: 0, lng: 0});
                    }

                    let sDirLat = this.$store.state.drone_infos[dName].directionLine[0].lat;
                    let sDirLng = this.$store.state.drone_infos[dName].directionLine[0].lng;
                    let eDirLat = this.$store.state.drone_infos[dName].directionLine[1].lat;
                    let eDirLng = this.$store.state.drone_infos[dName].directionLine[1].lng;

                    let sDirPnt = new Point([sDirLng, sDirLat]).transform('EPSG:4326', 'EPSG:3857')
                    let sDirCoordinate = sDirPnt.getCoordinates();
                    let eDirPnt = new Point([eDirLng, eDirLat]).transform('EPSG:4326', 'EPSG:3857')
                    let eDirCoordinate = eDirPnt.getCoordinates();

                    var dx = eDirCoordinate[0] - sDirCoordinate[0];
                    var dy = eDirCoordinate[1] - sDirCoordinate[1];
                    var rotation = Math.atan2(dy, dx);

                    this.olDroneMarkers[dName].directionLineFeature = new Feature({
                        geometry: new LineString([[sDirCoordinate[0], sDirCoordinate[1]], [eDirCoordinate[0], eDirCoordinate[1]]]),
                        type: 'directionLine-'+dName,
                    });

                    let directionLineStyle = [
                        new Style({
                            stroke: new Stroke({
                                color: this.$store.state.drone_infos[dName].color + '80',
                                width: 5,
                            }),
                            text: new Text({
                                text: [''],
                                scale: 1.5,
                                stroke: new Stroke({
                                    color: 'black',
                                    width: 0.8,
                                }),
                                fill: new Fill({
                                    color: '#FAFAFA'
                                }),
                            }),
                        }),
                        new Style({
                            geometry: new Point(eDirCoordinate),
                            image: new Icon({
                                src: arrawImagePath,
                                anchor: [0.75, 0.5],
                                rotateWithView: true,
                                rotation: -rotation,
                                color: this.$store.state.drone_infos[dName].color,
                                opacity: 0.5,
                                scale: 1.5
                            })
                        }),
                    ];

                    this.olDroneMarkers[dName].directionLineFeature.setStyle(directionLineStyle);

                    if (!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'targetPosition')) {
                        this.$store.state.drone_infos[dName].targetPosition = {
                            lat: this.$store.state.drone_infos[dName].lat,
                            lng: this.$store.state.drone_infos[dName].lng
                        };
                    }

                    let sTarLat = this.$store.state.drone_infos[dName].lat;
                    let sTarLng = this.$store.state.drone_infos[dName].lng;
                    let eTarLat = this.$store.state.drone_infos[dName].targetPosition.lat;
                    let eTarLng = this.$store.state.drone_infos[dName].targetPosition.lng;

                    let sTarPnt = new Point([sTarLng, sTarLat]).transform('EPSG:4326', 'EPSG:3857')
                    let sTarCoordinate = sTarPnt.getCoordinates();
                    let eTarPnt = new Point([eTarLng, eTarLat]).transform('EPSG:4326', 'EPSG:3857')
                    let eTarCoordinate = eTarPnt.getCoordinates();

                    dx = eTarCoordinate[0] - sTarCoordinate[0];
                    dy = eTarCoordinate[1] - sTarCoordinate[1];
                    rotation = Math.atan2(dy, dx);

                    this.olDroneMarkers[dName].targetLineFeature = new Feature({
                        geometry: new LineString([[sTarCoordinate[0], sTarCoordinate[1]], [eTarCoordinate[0], eTarCoordinate[1]]]),
                        type: 'directionLine-'+dName,
                    });

                    let targetLineStyle = [
                        new Style({
                            stroke: new Stroke({
                                color: this.$store.state.drone_infos[dName].color + 'FF',
                                width: 5,
                            }),
                            text: new Text({
                                text: [''],
                                scale: 1.5,
                                stroke: new Stroke({
                                    color: 'black',
                                    width: 0.8,
                                }),
                                fill: new Fill({
                                    color: '#FAFAFA'
                                }),
                            }),
                            zIndex: 2,
                        }),
                        new Style({
                            geometry: new Point(eTarCoordinate),
                            image: new Icon({
                                src: arrawImagePath,
                                anchor: [0.75, 0.5],
                                rotateWithView: true,
                                rotation: -rotation,
                                color: this.$store.state.drone_infos[dName].color,
                                opacity: 1,
                                scale: 1.7
                            })
                        }),
                    ];

                    this.olDroneMarkers[dName].targetLineFeature.setStyle(targetLineStyle);

                    let hLat = this.$store.state.drone_infos[dName].home_position.lat;
                    let hLng = this.$store.state.drone_infos[dName].home_position.lng;

                    let hPnt = new Point([hLng, hLat]).transform('EPSG:4326', 'EPSG:3857')
                    let hCoordinate = hPnt.getCoordinates();

                    this.olDroneMarkers[dName].droneHomeMarkerFeature = new Feature({
                        geometry: new Point([hCoordinate[0], hCoordinate[1]]),
                        type: 'droneHomeMarker',
                    });
                    this.olDroneMarkers[dName].droneHomeMarkerFeature.setId(dName+'-Home');

                    svgDroneHomeObj.svg.path._attributes.fill = this.$store.state.drone_infos[dName].color.replace('#', '%23');
                    svgDroneHomeObj.svg.path._attributes.stroke = '#E8F5E9'.replace('#', '%23');
                    svgDroneHomeObj.svg.path._attributes['stroke-width'] = '10';
                    let xmlSvgDroneHomeMarker = convert.js2xml(svgDroneHomeObj, {compact: true, ignoreComment: true, spaces: 4});

                    let iconStyleDroneHome = new Style({
                        image: new Icon({
                            opacity: 0.8,
                            src: 'data:image/svg+xml;utf8,' + xmlSvgDroneHomeMarker,
                            scale: 0.13,
                            anchor: [0.5, 0.5],
                        }),
                        geometry: function (feature) {
                            // return the coordinates of the first ring of the polygon
                            const coordinate = feature.getGeometry().getCoordinates();
                            return new Point(coordinate);
                        },
                        zIndex: 1
                    });

                    this.olDroneMarkers[dName].droneHomeMarkerFeature.setStyle(iconStyleDroneHome);

                    if(!Object.prototype.hasOwnProperty.call(this.$store.state.trackingLines, dName)) {
                        this.$store.state.trackingLines[dName] = [];
                    }

                    this.olDroneMarkers[dName].trCoordinates = [];
                    for(let i = 0; i < this.$store.state.trackingLines[dName].length; i++) {
                        let trLat = this.$store.state.trackingLines[dName][i].lat;
                        let trLng = this.$store.state.trackingLines[dName][i].lng;
                        let trPnt = new Point([trLng, trLat]).transform('EPSG:4326', 'EPSG:3857')
                        let trCoordinate = trPnt.getCoordinates();

                        this.olDroneMarkers[dName].trCoordinates.push(trCoordinate);
                    }

                    this.olDroneMarkers[dName].trackingLineFeature = new Feature({
                        geometry: new LineString(this.olDroneMarkers[dName].trCoordinates),
                        type: 'trackingLine-'+dName,
                    });

                    let trackingLineStyle = new Style({
                        stroke: new Stroke({
                            color: this.$store.state.drone_infos[dName].color + 'F0',
                            width: 2,
                        })
                    });

                    this.olDroneMarkers[dName].trackingLineFeature.setStyle(trackingLineStyle);
                }
            });
        },

        pushOlTempMarker(marker, dName, pIndex) {
            let tLat = marker.lat;
            let tLng = marker.lng;
            let tAlt = marker.alt;

            let tPnt = new Point([tLng, tLat]).transform('EPSG:4326', 'EPSG:3857');
            let tCoordinate = tPnt.getCoordinates();

            console.log('OOOOOOOOOOOOOOOOOOOOOOOOOO tempMarkers', dName, pIndex, tCoordinate);

            this.olTempMarkers[dName].Coordinates.push(tCoordinate);

            let tFeature = new Feature({
                geometry: new Point([tCoordinate[0], tCoordinate[1]]),
                type: 'tempMarker',
                dragging: false,
                altKey: false,
            });
            tFeature.setId(dName + '-' + pIndex);

            let selectedColor = '#76FF03F0';
            let targetedColor = '#76FF03FF';

            if (this.$store.state.tempMarkers[dName][pIndex].selected) {
                selectedColor = '#76FF03F0';
            }
            else {
                selectedColor = '#FAFAFA80';
            }

            if (this.$store.state.tempMarkers[dName][pIndex].targeted) {
                targetedColor = '#76FF03FF';
            }
            else {
                targetedColor = '#FFFDE7FF';
            }

            console.log('ppppppppppppppppppppppppp tempMarker-targeted', dName, pIndex, this.$store.state.tempMarkers[dName][pIndex].targeted, targetedColor);

            let iconStyleTemp = this.getStyleTempMarker(
                pIndex,
                this.$store.state.drone_infos[dName].color,
                targetedColor,
                '15',
                tAlt,
                svgTempScale,
                selectedColor,
                this.$store.state.tempMarkers[dName][pIndex].elevation,
            );

            tFeature.setStyle(iconStyleTemp);

            this.olTempMarkers[dName].tempMarkerFeatures.push(tFeature);
            const source = this.vectorLayer.getSource();
            source.addFeature(tFeature);

            if (this.$store.state.tempMarkers[dName][pIndex].targeted) {
                this.addTempTranslate(tFeature);
            }
        },

        initOlTempMarker(dName) {
            this.olTempMarkers[dName] = {};
            this.olTempMarkers[dName].Coordinates = [];
            this.olTempMarkers[dName].tempMarkerFeatures = [];
            this.olTempMarkers[dName].tempMarkerTranslates = [];

            this.$store.state.tempMarkers[dName].forEach((marker, pIndex) => {
                let tLat = marker.lat;
                let tLng = marker.lng;
                let tAlt = marker.alt;

                let tPnt = new Point([tLng, tLat]).transform('EPSG:4326', 'EPSG:3857');
                let tCoordinate = tPnt.getCoordinates();

                console.log('OOOOOOOOOOOOOOOOOOOOOOOOOO tempMarkers', dName, pIndex, tCoordinate);

                this.olTempMarkers[dName].Coordinates.push(tCoordinate);

                let tFeature = new Feature({
                    geometry: new Point([tCoordinate[0], tCoordinate[1]]),
                    type: 'tempMarker',
                    dragging: false,
                    altKey: false,
                });
                tFeature.setId(dName + '-' + pIndex);

                let selectedColor = '#76FF03F0';
                let targetedColor = '#76FF03FF';

                if (this.$store.state.tempMarkers[dName][pIndex].selected) {
                    selectedColor = '#76FF03F0';
                }
                else {
                    selectedColor = '#FAFAFA80';
                }

                if (this.$store.state.tempMarkers[dName][pIndex].targeted) {
                    targetedColor = '#76FF03FF';
                }
                else {
                    targetedColor = '#FFFDE7FF';
                }

                console.log('ppppppppppppppppppppppppp tempMarker-targeted', dName, pIndex, this.$store.state.tempMarkers[dName][pIndex].targeted, targetedColor);

                let iconStyleTemp = this.getStyleTempMarker(
                    pIndex,
                    this.$store.state.drone_infos[dName].color,
                    targetedColor,
                    '15',
                    tAlt,
                    svgTempScale,
                    selectedColor,
                    this.$store.state.tempMarkers[dName][pIndex].elevation,
                );

                tFeature.setStyle(iconStyleTemp);

                this.olTempMarkers[dName].tempMarkerFeatures.push(tFeature);

                if (this.$store.state.tempMarkers[dName][pIndex].targeted) {
                    this.addTempTranslate(tFeature);
                }
            });

            // let tTranslate = new Translate({
            //     features: new Collection(this.olTempMarkers[dName].tempMarkerFeatures),
            // });
            //
            // tTranslate.on('translatestart', function (evt) {
            //     //coordMarker2 = marker2.getCoordinates();
            //
            //     //this.olDroneMarkers[dName].droneMarkerFeature.getGeometry().setCoordinates(coordinate);
            //
            //     console.log('translatestart', evt, evt.coordinate);
            // });
            //
            // tTranslate.on('translating', (evt) => {
            //     //console.log(evt.coordinate, evt.startCoordinate);
            //     //console.log('translating', evt.coordinate.every((u, i) => { return parseInt(u/2)*2 === parseInt(evt.startCoordinate[i]/2)*2; }));
            //
            //     evt.features.forEach((feature) => {
            //         if (evt.coordinate.length === evt.startCoordinate.length && evt.coordinate.every((u, i) => { return parseInt(u) === parseInt(evt.startCoordinate[i]); }))
            //         {
            //             feature.setProperties({dragging: false});
            //             console.log('feature.getProperties().dragging', feature.getProperties().dragging);
            //         }
            //         else {
            //             feature.setProperties({dragging: true});
            //         }
            //     });
            // });
            //
            // tTranslate.on('translateend', (evt) => {
            //     //line.setCoordinates([coordMarker2, evt.coordinate]);
            //     evt.features.forEach((feature) => {
            //         console.log('translateend', evt.coordinate, feature.getGeometry().getCoordinates(), feature);
            //
            //         if(feature.getProperties().dragging) {
            //
            //             feature.setProperties({dragging: false});
            //
            //             let pIndex = feature.getId().split('-')[1];
            //             let latLng = toLonLat(feature.getGeometry().getCoordinates());
            //
            //             //feature.getGeometry().setCoordinates(evt.coordinate);
            //
            //             let eLngLats = [];
            //             eLngLats.push(JSON.parse(JSON.stringify(latLng)));
            //
            //             this.getElevationProfile(eLngLats, (status, result) => {
            //                 if (status === 200) {
            //                     let elevation_val = result.elevationProfile[0].height;
            //
            //                     console.log('elevation_val', result.elevationProfile[0].distance, result.elevationProfile[0].height);
            //                     this.olTempMarkers[dName].Coordinates[pIndex] = feature.getGeometry().getCoordinates();
            //
            //                     this.olTempMarkers[dName].guideLineFeature.getGeometry().setCoordinates(this.olTempMarkers[dName].Coordinates);
            //
            //                     this.$store.state.tempMarkers[dName][pIndex].lat = latLng[1];
            //                     this.$store.state.tempMarkers[dName][pIndex].lng = latLng[0];
            //                     this.$store.state.tempMarkers[dName][pIndex].elevation = elevation_val;
            //
            //                     if(this.curInfoTempMarkerFlag) {
            //                         this.updateSelectedTempMarker(dName, pIndex);
            //                     }
            //
            //                     this.postCinTempMarkerInfoToMobius(dName);
            //
            //                     let watchingPayload = {};
            //                     watchingPayload.broadcastMission = 'broadcastUpdateTempMarkerPosition';
            //                     watchingPayload.payload = {};
            //                     watchingPayload.payload.pName = dName;
            //                     watchingPayload.payload.pIndex = pIndex;
            //                     watchingPayload.payload.lat = latLng[1];
            //                     watchingPayload.payload.lng = latLng[0];
            //                     watchingPayload.payload.targeted = this.$store.state.tempMarkers[dName][pIndex].targeted;
            //                     watchingPayload.payload.selected = this.$store.state.tempMarkers[dName][pIndex].selected;
            //                     this.broadcast_gcsmap_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/gcsmap';
            //                     //this.doPublish(this.broadcast_gcsmap_topic, JSON.stringify(watchingPayload));
            //                     this.$store.state.didIPublish = true;
            //                 }
            //             });
            //         }
            //     });
            // });
            //
            // this.olTempMarkers[dName].tempMarkerTranslates.push(tTranslate);

            //임시//this.olTempMarkers[dName].guideLineFeature = new Feature({
            //임시//    geometry: new LineString(this.olTempMarkers[dName].Coordinates),
            //임시//    type: 'guideLine',
            //임시//});

            //임시//let guideLineStyle = new Style({
            //임시//    stroke: new Stroke({
            //임시//        color: this.$store.state.drone_infos[dName].color + '25',
            //임시//        width: 9,
            //임시//    })
            //임시//});

            //임시//this.olTempMarkers[dName].guideLineFeature.setId(dName + '-' + 'guideLine');

            //임시//this.olTempMarkers[dName].guideLineFeature.setStyle(guideLineStyle);
        },

        initOlTempMarkers() {
            this.olTempMarkers = {};

            Object.keys(this.$store.state.tempMarkers).forEach((dName) => {
                if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                    this.initOlTempMarker(dName);
                }
            });
        },

        pushOlSurveyMarker(survey, dName, pIndex) {
            let polyCoordinates = [];
            for(let i = 0; i < survey.paths.length; i++) {
                let svLat = survey.paths[i].lat;
                let svLng = survey.paths[i].lng;

                let svPnt = new Point([svLng, svLat]).transform('EPSG:4326', 'EPSG:3857')
                let svCoordinate = svPnt.getCoordinates();

                console.log('sssssssssssssssssssssssssssssssssssss surveyMarkers', dName, pIndex, i, svCoordinate);

                polyCoordinates.push(svCoordinate);
            }

            this.olSurveyMarkers[dName].polyCoordinates[pIndex] = JSON.parse(JSON.stringify(polyCoordinates));

            let svFeature = new Feature({
                geometry: new Polygon([this.olSurveyMarkers[dName].polyCoordinates[pIndex]]),
                type: 'surveyMarker',
                dragging: false,
            });
            svFeature.setId(dName + '-' + pIndex + '-survey');

            let area = getArea(svFeature.getGeometry());
            this.$store.state.surveyMarkers[dName][pIndex].area = area.toFixed(1);
            console.log('computeArea = ', area.toFixed(1), '㎡');

            let selectedColor = '#76FF03F0';
            if (this.$store.state.surveyMarkers[dName][pIndex].selected) {
                selectedColor = '#76FF0320';
            }
            else {
                selectedColor = '#FAFAFA20';
            }

            let targetedColor = '#76FF03FF';
            if (this.$store.state.surveyMarkers[dName][pIndex].targeted) {
                targetedColor = '#76FF0380';
            }
            else {
                targetedColor = this.$store.state.drone_infos[dName].color + '20';
            }

            console.log('sssssssssssssssssssssssssssssss surveyMarker-targeted', dName, pIndex, this.$store.state.surveyMarkers[dName][pIndex].targeted, targetedColor);

            let styleSurvey = new Style({
                stroke: new Stroke({
                    color: targetedColor,
                    width: 2,
                }),
                fill: new Fill({
                    color: selectedColor
                }),
                zIndex: 3,
            });

            svFeature.setStyle(styleSurvey);

            this.olSurveyMarkers[dName].surveyMarkerFeatures.push(svFeature);
            const source = this.vectorLayer.getSource();
            source.addFeature(svFeature);

            if (this.$store.state.surveyMarkers[dName][pIndex].targeted) {
                this.addSurveyTranslate(svFeature);
            }

            let pathLineCoordinates = [];
            for(let i = 0; i < survey.pathLines.length; i++) {
                let svLat = survey.pathLines[i].lat;
                let svLng = survey.pathLines[i].lng;

                let svPnt = new Point([svLng, svLat]).transform('EPSG:4326', 'EPSG:3857')
                let svCoordinate = svPnt.getCoordinates();

                pathLineCoordinates.push(svCoordinate);
            }

            console.log('sssssssssssssssssssssssssssssssssssss pathLines', dName, pIndex, pathLineCoordinates);

            this.olSurveyMarkers[dName].lineCoordinates[pIndex] = JSON.parse(JSON.stringify(pathLineCoordinates));

            let lineFeature = new Feature({
                geometry: new LineString(this.olSurveyMarkers[dName].lineCoordinates[pIndex]),
                type: 'surveyLine',
            });
            lineFeature.setId(dName + '-' + pIndex + '-surveyLine');

            let pathLineStyle = [
                new Style({
                    stroke: new Stroke({
                        color: this.$store.state.drone_infos[dName].color + 'FF',
                        width: 5,
                    }),
                    zIndex: 2,
                }),
                new Style({
                    image: new CircleStyle({
                        radius: 6,
                        fill: new Fill({
                            color: 'orange',
                        }),
                    }),
                    geometry: function (feature) {
                        // return the coordinates of the first ring of the polygon
                        const coordinates = feature.getGeometry().getCoordinates();
                        return new MultiPoint(coordinates);
                    },
                    zIndex: 2,
                }),
                new Style({
                    text: new Text({
                        text: ['0', 'bold 10px sans-serif'],
                        textAlign: 'center',
                        offsetY: 0,
                        scale: 1.4,
                        stroke: new Stroke({
                            color: 'black',
                            width: 1,
                        }),
                        fill: new Fill({
                            color: 'white'
                        }),
                    }),
                    geometry: function (feature) {
                        // return the coordinates of the first ring of the polygon
                        const coordinate = feature.getGeometry().getCoordinates()[0];
                        return new Point(coordinate);
                    },
                    zIndex: 3,
                }),
            ];

            lineFeature.setStyle(pathLineStyle);

            this.olSurveyMarkers[dName].surveyLineFeatures.push(lineFeature);
            source.addFeature(lineFeature);

            let eLngLats = [];

            this.$store.state.surveyMarkers[dName][pIndex].elevations = [];
            this.$store.state.surveyMarkers[dName][pIndex].elevations_location = [];

            for(let i = 0; i < this.$store.state.SAMPLES; i++) {
                let eLngLat = toLonLat(lineFeature.getGeometry().getCoordinateAt(i/(this.$store.state.SAMPLES-1)));
                eLngLats.push(eLngLat);
                this.$store.state.surveyMarkers[dName][pIndex].elevations_location.push({lat: eLngLat[1], lng: eLngLat[0]});
            }

            console.log('sssssssssssssssssssssssssssssssssssss initOlSurveyMarker');
        },

        async initOlSurveyMarker(dName, pIndex, survey) {
            let polyCoordinates = [];
            for(let i = 0; i < survey.paths.length; i++) {
                let svLat = survey.paths[i].lat;
                let svLng = survey.paths[i].lng;

                let svPnt = new Point([svLng, svLat]).transform('EPSG:4326', 'EPSG:3857')
                let svCoordinate = svPnt.getCoordinates();

                console.log('sssssssssssssssssssssssssssssssssssss surveyMarkers', dName, pIndex, i, svCoordinate);

                polyCoordinates.push(svCoordinate);
            }

            // let svLat = survey.paths[0].lat;
            // let svLng = survey.paths[0].lng;
            //
            // let svPnt = new Point([svLng, svLat]).transform('EPSG:4326', 'EPSG:3857')
            // let svCoordinate = svPnt.getCoordinates();
            //
            // polyCoordinates.push(svCoordinate);

            this.olSurveyMarkers[dName].polyCoordinates[pIndex] = JSON.parse(JSON.stringify(polyCoordinates));

            let svFeature = new Feature({
                geometry: new Polygon([this.olSurveyMarkers[dName].polyCoordinates[pIndex]]),
                type: 'surveyMarker',
                dragging: false,
            });
            svFeature.setId(dName + '-' + pIndex + '-survey');

            let area = getArea(svFeature.getGeometry());
            this.$store.state.surveyMarkers[dName][pIndex].area = area.toFixed(1);
            console.log('computeArea = ', area.toFixed(1), '㎡');

            let selectedColor = '#76FF03F0';
            if (this.$store.state.surveyMarkers[dName][pIndex].selected) {
                selectedColor = '#76FF0320';
            }
            else {
                selectedColor = '#FAFAFA20';
            }

            let targetedColor = '#76FF03FF';
            if (this.$store.state.surveyMarkers[dName][pIndex].targeted) {
                targetedColor = '#76FF0380';
            }
            else {
                targetedColor = this.$store.state.drone_infos[dName].color + '20';
            }

            console.log('sssssssssssssssssssssssssssssss surveyMarker-targeted', dName, pIndex, this.$store.state.surveyMarkers[dName][pIndex].targeted, targetedColor);

            // let styleSurvey = this.getStyleSurveyMarker(
            //     pIndex,
            //     targetedColor,
            //     '1',
            //     selectedColor,
            // );

            let styleSurvey = new Style({
                stroke: new Stroke({
                    color: targetedColor,
                    width: 2,
                }),
                fill: new Fill({
                    color: selectedColor
                }),
                zIndex: 3,
            });

            svFeature.setStyle(styleSurvey);

            this.olSurveyMarkers[dName].surveyMarkerFeatures.push(svFeature);

            if (this.$store.state.surveyMarkers[dName][pIndex].targeted) {
                this.addSurveyTranslate(svFeature);
            }

            let pathLineCoordinates = [];
            for(let i = 0; i < survey.pathLines.length; i++) {
                let svLat = survey.pathLines[i].lat;
                let svLng = survey.pathLines[i].lng;

                let svPnt = new Point([svLng, svLat]).transform('EPSG:4326', 'EPSG:3857')
                let svCoordinate = svPnt.getCoordinates();


                pathLineCoordinates.push(svCoordinate);
            }

            console.log('sssssssssssssssssssssssssssssssssssss pathLines', dName, pIndex, pathLineCoordinates);

            this.olSurveyMarkers[dName].lineCoordinates[pIndex] = JSON.parse(JSON.stringify(pathLineCoordinates));

            let lineFeature = new Feature({
                geometry: new LineString(this.olSurveyMarkers[dName].lineCoordinates[pIndex]),
                type: 'surveyLine',
            });
            lineFeature.setId(dName + '-' + pIndex + '-surveyLine');

            let pathLineStyle = [
                new Style({
                    stroke: new Stroke({
                        color: this.$store.state.drone_infos[dName].color + 'FF',
                        width: 5,
                    }),
                    zIndex: 2,
                }),
                new Style({
                    image: new CircleStyle({
                        radius: 6,
                        fill: new Fill({
                            color: 'orange',
                        }),
                    }),
                    geometry: function (feature) {
                        // return the coordinates of the first ring of the polygon
                        const coordinates = feature.getGeometry().getCoordinates();
                        return new MultiPoint(coordinates);
                    },
                    zIndex: 2,
                }),
                new Style({
                    text: new Text({
                        text: ['0', 'bold 10px sans-serif'],
                        textAlign: 'center',
                        offsetY: 0,
                        scale: 1.4,
                        stroke: new Stroke({
                            color: 'black',
                            width: 1,
                        }),
                        fill: new Fill({
                            color: 'white'
                        }),
                    }),
                    geometry: function (feature) {
                        // return the coordinates of the first ring of the polygon
                        const coordinate = feature.getGeometry().getCoordinates()[0];
                        return new Point(coordinate);
                    },
                    zIndex: 3,
                }),
            ];

            lineFeature.setStyle(pathLineStyle);

            this.olSurveyMarkers[dName].surveyLineFeatures.push(lineFeature);

            let eLngLats = [];

            this.$store.state.surveyMarkers[dName][pIndex].elevations = [];
            this.$store.state.surveyMarkers[dName][pIndex].elevations_location = [];

            for(let i = 0; i < this.$store.state.SAMPLES; i++) {
                let eLngLat = toLonLat(lineFeature.getGeometry().getCoordinateAt(i/(this.$store.state.SAMPLES-1)));
                eLngLats.push(eLngLat);
                this.$store.state.surveyMarkers[dName][pIndex].elevations_location.push({lat: eLngLat[1], lng: eLngLat[0]});
            }

            console.log('sssssssssssssssssssssssssssssssssssss initOlSurveyMarker');


            // this.getElevationProfile(eLngLats, async (status, result) => {
            //     if (status === 200) {
            //         result.results.forEach((ele) => {
            //             this.$store.state.surveyMarkers[dName][pIndex].elevations.push(ele.elevation);
            //         });
            //     }
            // });
        },

        initOlSurveyMarkers() {
            this.olSurveyMarkers = {};

            Object.keys(this.$store.state.surveyMarkers).forEach((dName) => {
                if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                    console.log('initOlSurveyMarkers', dName);

                    this.olSurveyMarkers[dName] = {};
                    this.olSurveyMarkers[dName].polyCoordinates = [];
                    this.olSurveyMarkers[dName].lineCoordinates = [];
                    this.olSurveyMarkers[dName].surveyLineFeatures = [];
                    this.olSurveyMarkers[dName].surveyMarkerFeatures = [];
                    this.olSurveyMarkers[dName].surveyMarkerTranslates = [];

                    console.log('sssssssssssssssssssssssssssssssssssss initOlSurveyMarker', dName, this.$store.state.surveyMarkers[dName]);

                    this.$store.state.surveyMarkers[dName].forEach((survey, pIndex) => {
                        this.initOlSurveyMarker(dName, pIndex, survey);
                    });
                }
            });
        },

        async updateTargetLineFeature(dName) {
            if(this.$store.state.drone_infos[dName].targeted && this.targetedTempFeatureId[dName] !== '' && this.targetedTempFeature[dName] !== undefined) {
                // console.log('this.$store.state.drone_infos[dName].targeted && this.targetedTempFeatureId[dName]', this.$store.state.drone_infos[dName].targeted, this.targetedTempFeatureId[dName])

                let sTarLat = this.$store.state.drone_infos[dName].lat;
                let sTarLng = this.$store.state.drone_infos[dName].lng;
                let eTarLat = this.$store.state.drone_infos[dName].lat;
                let eTarLng = this.$store.state.drone_infos[dName].lng;

                let sTarPnt = new Point([sTarLng, sTarLat]).transform('EPSG:4326', 'EPSG:3857')
                let sTarCoordinate = sTarPnt.getCoordinates();
                let eTarPnt = new Point([eTarLng, eTarLat]).transform('EPSG:4326', 'EPSG:3857')
                let eTarCoordinate = eTarPnt.getCoordinates();

                if(Object.prototype.hasOwnProperty.call(this.targetedTempFeature, dName)) {
                    eTarCoordinate = this.targetedTempFeature[dName].getGeometry().getCoordinates();
                }

                let eTarLatLng = toLonLat(eTarCoordinate);
                this.$store.state.drone_infos[dName].targetPosition = {lat: eTarLatLng[1], lng: eTarLatLng[0]};

                let dx = eTarCoordinate[0] - sTarCoordinate[0];
                let dy = eTarCoordinate[1] - sTarCoordinate[1];
                let rotation = Math.atan2(dy, dx);

                this.olDroneMarkers[dName].targetLineFeature.getGeometry().setCoordinates([[sTarCoordinate[0], sTarCoordinate[1]], [eTarCoordinate[0], eTarCoordinate[1]]]);
                let distance = getLength(this.olDroneMarkers[dName].targetLineFeature.getGeometry());

                this.$store.state.drone_infos[dName].targetDistance = distance;
                if(distance < 1000) {
                    this.olDroneMarkers[dName].targetLineFeature.getStyle()[0].getText().setText([distance.toFixed(1)+' m', 'bold 9px sans-serif']);
                }
                else {
                    this.olDroneMarkers[dName].targetLineFeature.getStyle()[0].getText().setText([(distance/1000).toFixed(1)+' km', 'bold 9px sans-serif']);
                }
                this.olDroneMarkers[dName].targetLineFeature.getStyle()[1].getImage().setRotation(-rotation);
                this.olDroneMarkers[dName].targetLineFeature.getStyle()[1].setGeometry(new Point(eTarCoordinate));

                let pIndex = this.targetedTempFeatureId[dName].split('-')[1];

                if (this.$store.state.currentCommandTab === '선회') {
                    let resolution = this.olMap.getView().getResolution();
                    let projection = this.olMap.getView().getProjection();

                    this.olTempMarkers[dName].tempMarkerFeatures[pIndex].getStyle()[2].getImage().setRadius(this.$store.state.drone_infos[dName].targetRadius / getPointResolution(projection, resolution, eTarCoordinate, 'm'))
                }
                else {
                    let pIndex = this.targetedTempFeatureId[dName].split('-')[1];

                    this.olTempMarkers[dName].tempMarkerFeatures[pIndex].getStyle()[2].getImage().setRadius(1);
                }

                if(!this.$store.state.drone_infos[dName].updatedTempElePathFlag) {
                    this.$store.state.drone_infos[dName].updatedTempElePathFlag = true;

                    let eLngLats = [];

                    this.$store.state.drone_infos[dName].elevations = [];
                    this.$store.state.drone_infos[dName].elevations_location = [];

                    for (let i = 0; i < this.$store.state.SAMPLES; i++) {
                        let eLngLat = toLonLat(this.olDroneMarkers[dName].targetLineFeature.getGeometry().getCoordinateAt(i / (this.$store.state.SAMPLES-1)));
                        eLngLats.push(eLngLat);
                        this.$store.state.drone_infos[dName].elevations_location.push({
                            lat: eLngLat[1],
                            lng: eLngLat[0]
                        });
                    }

                    this.getElevationProfile(eLngLats, async (status, result) => {
                        if (status === 200) {
                            // result.results.forEach((ele) => {
                            //     this.$store.state.drone_infos[dName].elevations.push(ele.elevation);
                            // });

                            for(let i = 0; i < result.results.length; i++) {
                                this.$store.state.drone_infos[dName].elevations[i] = result.results[i].elevation;
                            }

                            EventBus.$emit('update-fill-goto-evevation-data', dName);
                        }
                    });
                }
            }
            else if(this.$store.state.drone_infos[dName].targeted && this.targetedSurveyFeatureId[dName] !== '' && this.targetedSurveyFeature[dName] !== undefined) {
                let pIndex = this.targetedSurveyFeatureId[dName].split('-')[1];

                let sTarLat = this.$store.state.drone_infos[dName].lat;
                let sTarLng = this.$store.state.drone_infos[dName].lng;
                let eTarLat = this.$store.state.surveyMarkers[dName].lat;
                let eTarLng = this.$store.state.surveyMarkers[dName].lng;


                let sTarPnt = new Point([sTarLng, sTarLat]).transform('EPSG:4326', 'EPSG:3857')
                let sTarCoordinate = sTarPnt.getCoordinates();
                let eTarPnt = new Point([eTarLng, eTarLat]).transform('EPSG:4326', 'EPSG:3857')
                let eTarCoordinate = eTarPnt.getCoordinates();

                eTarCoordinate = this.olSurveyMarkers[dName].surveyLineFeatures[pIndex].getGeometry().getCoordinates()[0];

                let eTarLatLng = toLonLat(eTarCoordinate);
                this.$store.state.drone_infos[dName].targetPosition = {lat: eTarLatLng[1], lng: eTarLatLng[0]};

                let dx = eTarCoordinate[0] - sTarCoordinate[0];
                let dy = eTarCoordinate[1] - sTarCoordinate[1];
                let rotation = Math.atan2(dy, dx);

                this.olDroneMarkers[dName].targetLineFeature.getGeometry().setCoordinates([[sTarCoordinate[0], sTarCoordinate[1]], [eTarCoordinate[0], eTarCoordinate[1]]]);
                let distance = getLength(this.olDroneMarkers[dName].targetLineFeature.getGeometry());

                if(distance < 1000) {
                    this.olDroneMarkers[dName].targetLineFeature.getStyle()[0].getText().setText([distance.toFixed(1)+' m', 'bold 9px sans-serif']);
                }
                else {
                    this.olDroneMarkers[dName].targetLineFeature.getStyle()[0].getText().setText([(distance/1000).toFixed(1)+' km', 'bold 9px sans-serif']);
                }
                this.olDroneMarkers[dName].targetLineFeature.getStyle()[1].getImage().setRotation(-rotation);
                this.olDroneMarkers[dName].targetLineFeature.getStyle()[1].setGeometry(new Point(eTarCoordinate));
            }
            else {
                let sTarLat = this.$store.state.drone_infos[dName].lat;
                let sTarLng = this.$store.state.drone_infos[dName].lng;
                let eTarLat = this.$store.state.drone_infos[dName].lat;
                let eTarLng = this.$store.state.drone_infos[dName].lng;

                this.$store.state.drone_infos[dName].targetPosition = {lat: this.$store.state.drone_infos[dName].lat, lng: this.$store.state.drone_infos[dName].lng};

                let sTarPnt = new Point([sTarLng, sTarLat]).transform('EPSG:4326', 'EPSG:3857')
                let sTarCoordinate = sTarPnt.getCoordinates();
                let eTarPnt = new Point([eTarLng, eTarLat]).transform('EPSG:4326', 'EPSG:3857')
                let eTarCoordinate = eTarPnt.getCoordinates();

                let dx = eTarCoordinate[0] - sTarCoordinate[0];
                let dy = eTarCoordinate[1] - sTarCoordinate[1];
                let rotation = Math.atan2(dy, dx);

                if(dName !== 'unknown') {
                    this.olDroneMarkers[dName].targetLineFeature.getStyle()[0].getText().setText(['', 'bold 9px sans-serif']);
                    this.olDroneMarkers[dName].targetLineFeature.getStyle()[1].getImage().setRotation(-rotation);
                    this.olDroneMarkers[dName].targetLineFeature.getStyle()[1].setGeometry(new Point(eTarCoordinate));
                    this.olDroneMarkers[dName].targetLineFeature.getGeometry().setCoordinates([[sTarCoordinate[0], sTarCoordinate[1]], [eTarCoordinate[0], eTarCoordinate[1]]]);
                }
            }
        },

        async getElevationProfile(eLngLats, callback) {
            eLngLats.forEach((eLngLat, idx) => {
                [eLngLat[0], eLngLat[1]] = [eLngLat[1], eLngLat[0]];
                eLngLats[idx] = eLngLat;
            });

            let param = JSON.stringify(eLngLats).replace(/\[\[/g, '');
            param = param.replace(/\],\[/g, '|');
            param = param.replace(/\]\]/g, '');
            let url = 'http://gcs.iotocean.org:9980/api/v1/lookup?locations=' + param;

            try {
                axios.defaults.withCredentials = false;

                let response = await axios.get(url, {
                    // withCredentials: true,
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    // headers: {
                    //     'Access-Control-Allow-Origin': "*",
                    //     'Access-Control-Allow-Credentials': true,
                    //     'Access-Control-Allow-Methods': "POST, PUT, PATCH, GET, DELETE, OPTIONS",
                    //     'Access-Control-Allow-Headers': "Origin, X-Api-Key, X-Requested-With, Content-Type, Accept, Authorization",
                    // },
                });
                console.log('getElevationProfile', response.status, response.data);

                callback(response.status, response.data);

            } catch (err) {
                console.log("Error >>", err);

                let response_data = {};
                response_data.results = [];
                eLngLats.forEach(() => {
                    response_data.results.push({
                        elevation: 0
                    });
                });

                callback(200, response_data);
            }
        },

        shade(inputs, data) {
            var elevationImage = inputs[0]; // 첫번째(0) 데이터소스로 elevation 객체
            var width = elevationImage.width;
            var height = elevationImage.height;
            var elevationData = elevationImage.data;
            var shadeData = new Uint8ClampedArray(elevationData.length);
            var dp = data.resolution * 2;
            var maxX = width - 1;
            var maxY = height - 1;
            var pixel = [0, 0, 0, 0];
            var twoPi = 2 * Math.PI;
            var halfPi = Math.PI / 2;
            //var sunEl = Math.PI * data.sunEl / 180;
            var sunAz = Math.PI * data.sunAz / 180;
            var cosSunEl = Math.cos(data.sunEl);
            var sinSunEl = Math.sin(data.sunEl);
            var pixelX, pixelY, x0, x1, y0, y1, offset,
                z0, z1, dzdx, dzdy, slope, aspect, cosIncidence, scaled;
            for (pixelY = 0; pixelY <= maxY; ++pixelY) {
                y0 = pixelY === 0 ? 0 : pixelY - 1;
                y1 = pixelY === maxY ? maxY : pixelY + 1;
                for (pixelX = 0; pixelX <= maxX; ++pixelX) {
                    x0 = pixelX === 0 ? 0 : pixelX - 1;
                    x1 = pixelX === maxX ? maxX : pixelX + 1;
                    // determine elevation for (x0, pixelY)
                    offset = (pixelY * width + x0) * 4;
                    pixel[0] = elevationData[offset];
                    pixel[1] = elevationData[offset + 1];
                    pixel[2] = elevationData[offset + 2];
                    pixel[3] = elevationData[offset + 3];
                    z0 = data.vert * (pixel[0] + pixel[1] * 2 + pixel[2] * 3);

                    // determine elevation for (x1, pixelY)
                    offset = (pixelY * width + x1) * 4;
                    pixel[0] = elevationData[offset];
                    pixel[1] = elevationData[offset + 1];
                    pixel[2] = elevationData[offset + 2];
                    pixel[3] = elevationData[offset + 3];
                    z1 = data.vert * (pixel[0] + pixel[1] * 2 + pixel[2] * 3);
                    dzdx = (z1 - z0) / dp;
                    // determine elevation for (pixelX, y0)
                    offset = (y0 * width + pixelX) * 4;
                    pixel[0] = elevationData[offset];
                    pixel[1] = elevationData[offset + 1];
                    pixel[2] = elevationData[offset + 2];
                    pixel[3] = elevationData[offset + 3];
                    z0 = data.vert * (pixel[0] + pixel[1] * 2 + pixel[2] * 3);
                    // determine elevation for (pixelX, y1)
                    offset = (y1 * width + pixelX) * 4;
                    pixel[0] = elevationData[offset];
                    pixel[1] = elevationData[offset + 1];
                    pixel[2] = elevationData[offset + 2];
                    pixel[3] = elevationData[offset + 3];
                    z1 = data.vert * (pixel[0] + pixel[1] * 2 + pixel[2] * 3);
                    dzdy = (z1 - z0) / dp;
                    slope = Math.atan(Math.sqrt(dzdx * dzdx + dzdy * dzdy));
                    aspect = Math.atan2(dzdy, -dzdx);
                    if (aspect < 0) {
                        aspect = halfPi - aspect;
                    } else if (aspect > halfPi) {
                        aspect = twoPi - aspect + halfPi;
                    } else {
                        aspect = halfPi - aspect;
                    }
                    cosIncidence = sinSunEl * Math.cos(slope) +
                        cosSunEl * Math.sin(slope) * Math.cos(sunAz - aspect);
                    offset = (pixelY * width + pixelX) * 4;
                    scaled = 255 * cosIncidence;
                    shadeData[offset] = scaled;
                    shadeData[offset + 1] = scaled;
                    shadeData[offset + 2] = scaled;
                    shadeData[offset + 3] = elevationData[offset + 3];
                }
            }
            return {data: shadeData, width: width, height: height};
        },

        makeTargetTempMarker(dName, pIndex) {
            if(!Object.prototype.hasOwnProperty.call(this.targetedTempFeatureId, dName)) {
                this.targetedTempFeatureId[dName] = '';
            }

            if(!Object.prototype.hasOwnProperty.call(this.targetedTempFeature, dName)) {
                this.targetedTempFeature[dName] = undefined;
            }

            if(this.targetedTempFeatureId[dName] !== '' && this.targetedTempFeatureId[dName] !== (dName + '-' + pIndex)) {
                let pIndexOld = this.targetedTempFeatureId[dName].split('-')[1];
                this.$store.state.tempMarkers[dName][pIndexOld].targeted = false;

                this.deleteTempTranslate(this.targetedTempFeature[dName]);
                this.targetedTempFeatureId[dName] = '';
                this.targetedTempFeature[dName] = undefined;

                this.updateTargetedTempMarker(dName, pIndexOld);
                //this.updateOlTempMarker(dName, pIndexOld);

                this.olTempMarkers[dName].tempMarkerFeatures[pIndexOld].getStyle()[2].getImage().setRadius(1);
            }

            if(this.targetedSurveyFeatureId[dName] !== '') {
                let pIndexOld = this.targetedSurveyFeatureId[dName].split('-')[1];
                this.$store.state.surveyMarkers[dName][pIndexOld].targeted = false;

                this.deleteSurveyTranslate(this.targetedSurveyFeature[dName]);
                this.deleteModifyInteraction(this.targetedSurveyFeature[dName]);

                this.targetedSurveyFeatureId[dName] = '';
                this.targetedSurveyFeature[dName] = undefined;

                this.updateTargetedSurveyMarker(dName, pIndexOld);
            }

            this.$store.state.tempMarkers[dName][pIndex].targeted = !this.$store.state.tempMarkers[dName][pIndex].targeted;

            // console.log('ppppppppppppppppppppp single click', dName, pIndex, this.$store.state.tempMarkers[dName][pIndex].targeted);

            if (this.$store.state.tempMarkers[dName][pIndex].targeted) {
                this.$store.state.drone_infos[dName].curTargetedTempMarkerIndex = pIndex;

                this.addTempTranslate(this.targetedFeature);
                this.targetedTempFeatureId[dName] = (dName + '-' + pIndex);
                this.targetedTempFeature[dName] = this.targetedFeature;

                this.$store.state.drone_infos[dName].updatedTempElePathFlag = false;
            }
            else {
                this.$store.state.drone_infos[dName].curTargetedTempMarkerIndex = -1;

                this.deleteTempTranslate(this.targetedFeature);
                this.targetedTempFeatureId[dName] = '';
                this.targetedTempFeature[dName] = undefined;

                this.olTempMarkers[dName].tempMarkerFeatures[pIndex].getStyle()[2].getImage().setRadius(1);
            }

            this.updateTargetedTempMarker(dName, pIndex);
            //this.updateOlTempMarker(dName, pIndex);

            if(this.$store.state.drone_infos[dName].selected && this.$store.state.drone_infos[dName].targeted) {
                this.$store.state.drone_command_prepared = false;
                setTimeout(() => {
                    this.$store.state.drone_command_prepared = true;
                }, 100);
            }

            if(dName === 'unknown') {
                this.datum.targeted = this.$store.state.tempMarkers[dName][pIndex].targeted;
                this.datum.lat = this.$store.state.tempMarkers[dName][pIndex].lat;
                this.datum.lng = this.$store.state.tempMarkers[dName][pIndex].lng;
            }

            this.updateTargetLineFeature(dName);
        },
    },

    mounted() {

        this.vectorSource = new VectorSource({
            features: [],
        });

        this.vectorLayer = new VectorLayer({
            source: this.vectorSource,
            style: this.styles,
        });

        // Todo: 오프라인맵 적용 방안 강구할 것
        this.osmSource = new XYZ({url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'}); // Google Satellite
        //this.osmSource = new XYZ({url: 'http://localhost:4500/todos/todoid/OSM_{z}_{x}_{y}'}); // My Map of Satellite



        // this.osmSource = new OSM(), this.osmSource = new XYZ({url: 'http://xdworld.vworld.kr:8080/2d/Base/202111/{z}/{x}/{y}.png'});
        // this.osmSource = new XYZ({url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'}); // Esri Imagery/Satellite
        // this.osmSource = new XYZ({url: 'http://tile.thunderforest.com/cycle/{z}/{x}/{y}.png'}); // OSM Cycle Map
        // this.osmSource = new XYZ({url: 'http://tile.openstreetmap.org/{z}/{x}/{y}.png'}); // OpenStreetMap Mapnick
        // this.osmSource = new XYZ({url: 'http://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'}); // OSM Black and White
        // this.osmSource = new XYZ({url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'}); // Esri Streets
        // this.osmSource = new XYZ({url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'}); // Esri Topo
        // this.osmSource = new XYZ({url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'}); // Google Streets
        // this.osmSource = new XYZ({url: 'https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'}); // Carto Positron
        // this.osmSource = new XYZ({url: 'http://a.tile.stamen.com/terrain/{z}/{x}/{y}.png'}); // Stamen Terrain
        // this.osmSource = new XYZ({
        //     maxZoom: 19,
        //     minZoom:19,
        //     tileUrlFunction: (tileCoord) => {
        //         console.log(localStorage.getItem('OSM_' + tileCoord[0] + '_' + tileCoord[1] + '_' + (-tileCoord[2] - 1)));
        //         return localStorage.getItem('OSM_' + tileCoord[0] + '_' + tileCoord[1] + '_' + (-tileCoord[2] - 1));
        //     }
        // }); // offline

        // this.osmSource = new XYZ({
        //     url: 'http://a.tile.stamen.com/terrain/{z}/{x}/{y}.png',
        //     crossOrigin: 'anonymous',
        //     transition: 0
        // });

        this.demSource = new Stamen({ layer: 'terrain' });

        // var raster = new Raster({
        //     sources: [elevation],
        //     operationType: 'image',
        //     operation: this.shade
        // });
        //
        // raster.on('beforeoperations', (event) => {
        //     var data = event.data;
        //     data.resolution = event.resolution;
        //     data.vert = 1; // 음영기복도의 과고감 정도
        //     data.sunEl = 45; // 태양의 Elevation(단위: Degree)
        //     data.sunAz = 45; // 태양의 Azimuth(단위: Degree)
        // });
        //
        // var imageLayer = new ImageLayer({ source: raster });

        // var map = new Map({
        //     target: this.$refs["map-root"],
        //     layers: [
        //         //imageLayer,
        //         this.vectorLayer
        //     ],
        //     view: new View({
        //         extent: [-13675026, 4439648, -13580856, 4580292],
        //         center: [-13615645, 4497969],
        //         minZoom: 10,
        //         maxZoom: 16,
        //         zoom: 13
        //     })
        // });
        //
        // console.log(map);

        this.olMap = new Map({
            target: this.$refs["map-root"],
            layers: [
                new TileLayer({
                    source: this.osmSource
                }),
                // new TileLayer({
                //     source: this.demSource
                // }),
                this.vectorLayer
            ],
            view: new View({
                zoom: 19,
                center: [0, 0],
                constrainResolution: true
            }),
        });

        var interactions = this.olMap.getInteractions();
        for (var i = 0; i < interactions.getLength(); i++) {
            var interaction = interactions.item(i);
            if (interaction instanceof DoubleClickZoom) {
                this.olMap.removeInteraction(interaction);
                break;
            }
        }

        this.olMap.getView().on('change:rotation', () => {
            this.mapHeading = ((this.olMap.getView().getRotation()*180)/Math.PI);

            console.log('change:rotation', this.mapHeading);

            localStorage.setItem('rotateMapVal', this.mapHeading);
        });

        // Control
        var ctrl = new Zoom({ });
        this.olMap.addControl(ctrl);
        this.olMap.addControl(new ScaleLine());

        const contextmenuItems = [
            {
                text: 'Center map here',
                classname: 'bold',
                icon: centerIcon,
                callback: (obj) => {
                    console.log('Center map here', obj);
                },
            },
            {
                text: 'Some Actions',
                icon: listIcon,
                items: [
                    {
                        text: 'Center map here',
                        icon: centerIcon,
                        callback: (obj) => {
                            console.log('Center map here', obj);
                        },
                    },
                    {
                        text: 'Add a Marker',
                        icon: pinIcon,
                        callback: (obj) => {
                            console.log('Add a Marker', obj);

                            this.addOlTempMarker(obj);
                        },
                    }
                ]
            },
            {
                text: 'Add a Marker',
                icon: pinIcon,
                callback: (obj) => {
                    console.log('Add a Marker', obj);

                    this.addOlTempMarker(obj);
                },
            },
            {
                text: 'Add a Survey',
                icon: surveyIcon,
                callback: (obj) => {
                    console.log('Add a Survey', obj);

                    this.addOlSurveyMarker(obj);
                },
            },
            '-' // this is a separator
        ];

        var contextmenu = new ContextMenu({
            width: 180,
            items: contextmenuItems
        });
        this.olMap.addControl(contextmenu);

        var removeMarkerItem = {
            text: 'Remove this Marker',
            classname: 'marker',
            callback: (obj) => {
                console.log('Remove this Marker', obj);

                this.deleteOlTempMarker(obj);
            },
        };

        // var ctrlDroneItem = {
        //     text: '모드변경',
        //     classname: 'marker',
        //     callback: (obj) => {
        //         console.log('change Mode', obj);
        //
        //
        //     },
        // };

        contextmenu.on('open', (evt) => {
            console.log('open', evt);

            var feature = this.olMap.forEachFeatureAtPixel(evt.pixel, ft => ft);

            if (feature && feature.get('type') === 'tempMarker') {
                contextmenu.clear();
                removeMarkerItem.data = { marker: feature };
                contextmenu.push(removeMarkerItem);
            }
            // else if (feature && feature.get('type') === 'droneMarker') {
            //     contextmenu.clear();
            //     ctrlDroneItem.data = { marker: feature };
            //     contextmenu.push(ctrlDroneItem);
            // }
            else {
                contextmenu.clear();
                contextmenu.extend(contextmenuItems);
                contextmenu.extend(contextmenu.getDefaultItems());
            }
        });

        Object.keys(this.$store.state.drone_infos).forEach((dName) => {
            if(!Object.prototype.hasOwnProperty.call(this.targetedTempFeatureId, dName)) {
                this.targetedTempFeatureId[dName] = '';
                this.targetedSurveyFeatureId[dName] = '';
            }
        });

        //this.updateSource(this.geojson);

        // setInterval(()=>{
        //
        //
        //     // let pnt = new Point([127.16050533784832, 37.40423134053018]).transform('EPSG:4326', 'EPSG:3857')
        //     // let coordinate = pnt.getCoordinates();
        //     // console.log('coordinate', coordinate[0], coordinate[1]);
        //     //
        //     // if(coordinate[0] === 0) {
        //     //     coordinate[0] = 12716050;
        //     //     coordinate[1] = 3740423;
        //     // }
        //     //
        //     // coordinate[0] += parseInt(Math.random() * 10000);
        //     // //coordinate[1] += parseInt(Math.random() * 10000);
        //     //
        //     // // this.iconFeature = null;
        //     // // this.iconFeature = new Feature({
        //     // //     geometry: new Point(coordinate ),
        //     // //     name: 'Null Island',
        //     // //     population: 4000,
        //     // //     rainfall: 500,
        //     // // });
        //     //
        //     // this.iconFeature.getGeometry().setCoordinates(coordinate);
        //
        //
        //     for(let dName in this.olDroneMarkers) {
        //         if(Object.prototype.hasOwnProperty.call(this.olDroneMarkers, dName)) {
        //             let dLat = this.$store.state.drone_infos[dName].lat;
        //             let dLng = this.$store.state.drone_infos[dName].lng;
        //
        //             console.log(dLat, dLng);
        //
        //             let pnt = new Point([dLng, dLat]).transform('EPSG:4326', 'EPSG:3857')
        //             let coordinate = pnt.getCoordinates();
        //
        //             console.log('coordinate', coordinate, coordinate[0], coordinate[1]);
        //
        //             this.olDroneMarkers[dName].droneMarkerFeature.getGeometry().setCoordinates(coordinate);
        //         }
        //     }
        //
        //     //this.iconFeature.setStyle(this.iconStyle);
        //
        //     //this.updateSource(this.geojson);
        // }, 500);

        EventBus.$on('gcs-map-ready', () => {

            this.initDroneMarkers();

            this.initOlTempMarkers();

            this.initOlSurveyMarkers();

            this.updateSource();

            // const view = this.olMap.getView();
            // view.fit(source.getExtent())

            let pnt = new Point([127.16050533784832, 37.40423134053018]).transform('EPSG:4326', 'EPSG:3857');

            for(let dName in this.$store.state.drone_infos) {
                if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                    if(dName !== 'unknown') {
                        pnt = new Point([this.$store.state.drone_infos[dName].lng, this.$store.state.drone_infos[dName].lat]).transform('EPSG:4326', 'EPSG:3857');
                        break;
                    }
                }
            }

            let center_coordinate = pnt.getCoordinates();

            this.olMap.getView().setCenter(center_coordinate);
            this.olMap.getView().setZoom(18);

            if(localStorage.getItem('rotateMapVal')) {
                this.mapHeading = parseInt(localStorage.getItem('rotateMapVal'));

                this.olMap.getView().setRotation((this.mapHeading*Math.PI)/180);
            }
        });

        EventBus.$on('do-current-drone-position', (dName) => {
            //console.log((this.olMap.getView().getRotation()*180)/Math.PI);

            let dLat = this.$store.state.drone_infos[dName].lat;
            let dLng = this.$store.state.drone_infos[dName].lng;
            let dAlt = this.$store.state.drone_infos[dName].alt;

            let dPnt = new Point([dLng, dLat]).transform('EPSG:4326', 'EPSG:3857')
            let dCoordinate = dPnt.getCoordinates();

            let sLat = this.$store.state.drone_infos[dName].headingLine[0].lat;
            let sLng = this.$store.state.drone_infos[dName].headingLine[0].lng;
            let eLat = this.$store.state.drone_infos[dName].headingLine[1].lat;
            let eLng = this.$store.state.drone_infos[dName].headingLine[1].lng;

            let sPnt = new Point([sLng, sLat]).transform('EPSG:4326', 'EPSG:3857')
            let sCoordinate = sPnt.getCoordinates();
            let ePnt = new Point([eLng, eLat]).transform('EPSG:4326', 'EPSG:3857')
            let eCoordinate = ePnt.getCoordinates();

            let sDirLat = this.$store.state.drone_infos[dName].directionLine[0].lat;
            let sDirLng = this.$store.state.drone_infos[dName].directionLine[0].lng;
            let eDirLat = this.$store.state.drone_infos[dName].directionLine[1].lat;
            let eDirLng = this.$store.state.drone_infos[dName].directionLine[1].lng;

            let sDirPnt = new Point([sDirLng, sDirLat]).transform('EPSG:4326', 'EPSG:3857')
            let sDirCoordinate = sDirPnt.getCoordinates();
            let eDirPnt = new Point([eDirLng, eDirLat]).transform('EPSG:4326', 'EPSG:3857')
            let eDirCoordinate = eDirPnt.getCoordinates();

            var dx = eDirCoordinate[0] - sDirCoordinate[0];
            var dy = eDirCoordinate[1] - sDirCoordinate[1];
            var rotation = Math.atan2(dy, dx);

            if(Object.prototype.hasOwnProperty.call(this.olDroneMarkers, dName)) {
                //console.log(this.olDroneMarkers[dName].droneMarkerFeature.getStyle()[0]);
                this.olDroneMarkers[dName].droneMarkerFeature.getStyle()[0].getImage().setScale(svgScale + (dAlt / 3000));
                this.olDroneMarkers[dName].droneMarkerFeature.getStyle()[0].getImage().setRotation(((360+this.$store.state.drone_infos[dName].heading-45+this.mapHeading)%360) * (Math.PI / 180));

                let speed = this.$store.state.drone_infos[dName].airSpeed;
                if(speed < 1) {
                    this.olDroneMarkers[dName].droneMarkerFeature.getStyle()[0].getText().setText([dAlt.toFixed(1)+' m', 'bold 10px sans-serif', '\n', 'bold 10px sans-serif',
                        '', 'bold 10px sans-serif', '\n', 'bold 10px sans-serif',
                        (this.$store.state.drone_infos[dName].curArmStatus === 'DISARMED') ? 'DISARMED' : this.$store.state.drone_infos[dName].curMode, 'bold 10px sans-serif',]);
                }
                else {
                    this.olDroneMarkers[dName].droneMarkerFeature.getStyle()[0].getText().setText([dAlt.toFixed(1)+' m', 'bold 10px sans-serif', '\n', 'bold 10px sans-serif',
                        speed.toFixed(1)+' m/s', 'bold 10px sans-serif', '\n', 'bold 10px sans-serif',
                        (this.$store.state.drone_infos[dName].curArmStatus === 'DISARMED') ? 'DISARMED' : this.$store.state.drone_infos[dName].curMode, 'bold 10px sans-serif',]);
                }
                this.olDroneMarkers[dName].droneMarkerFeature.getStyle()[0].getText().setFill(new Fill({ color: (this.$store.state.drone_infos[dName].curArmStatus === 'DISARMED') ? 'red' : (dAlt > 150) ? colorMapAlt[Math.round(dAlt / 10) * 10] : colorMapAlt[Math.round(dAlt / 5) * 5] }));
                this.olDroneMarkers[dName].droneMarkerFeature.getStyle()[1].getText().setFill(new Fill({ color: (dAlt > 150) ? colorMapAlt[Math.round(dAlt / 10) * 10] : colorMapAlt[Math.round(dAlt / 5) * 5] }));
                this.olDroneMarkers[dName].droneMarkerFeature.getGeometry().setCoordinates(dCoordinate);

                let resolution = this.olMap.getView().getResolution();
                let projection = this.olMap.getView().getProjection();
                //console.log(projection, resolution, getPointResolution(projection, resolution, dCoordinate, 'm'));
                this.olDroneMarkers[dName].droneMarkerFeature.getStyle()[2].getImage().setRadius(10 / getPointResolution(projection, resolution, dCoordinate, 'm'))

                this.olDroneMarkers[dName].headingLineFeature.getGeometry().setCoordinates([[sCoordinate[0], sCoordinate[1]], [eCoordinate[0], eCoordinate[1]]]);

                this.olDroneMarkers[dName].directionLineFeature.getStyle()[1].getImage().setRotation(-rotation);
                this.olDroneMarkers[dName].directionLineFeature.getStyle()[1].setGeometry(new Point(eDirCoordinate));
                this.olDroneMarkers[dName].directionLineFeature.getGeometry().setCoordinates([[sDirCoordinate[0], sDirCoordinate[1]], [eDirCoordinate[0], eDirCoordinate[1]]]);

                if (this.olDroneMarkers[dName].trCoordinates.length > 5000) {
                    this.olDroneMarkers[dName].trCoordinates.shift();
                }
                this.olDroneMarkers[dName].trCoordinates.push(dCoordinate);
                this.olDroneMarkers[dName].trackingLineFeature.getGeometry().setCoordinates(this.olDroneMarkers[dName].trCoordinates);

                this.olDroneMarkers[dName].targetLineFeature.getGeometry().setCoordinates([[sDirCoordinate[0], sDirCoordinate[1]], [eDirCoordinate[0], eDirCoordinate[1]]]);

                this.updateTargetLineFeature(dName);
            }
        });

        EventBus.$on('do-clear-drone-position', (dName) => {
            if(Object.prototype.hasOwnProperty.call(this.olDroneMarkers, dName)) {
                this.olDroneMarkers[dName].droneMarkerFeature.getStyle()[0].getText().setText('');
                this.olDroneMarkers[dName].droneMarkerFeature.getStyle()[1].getText().setText('');

                const source = this.vectorLayer.getSource();
                source.removeFeature(this.olDroneMarkers[dName].droneMarkerFeature);
                source.addFeature(this.olDroneMarkers[dName].droneMarkerFeature);
            }
        });

        EventBus.$on('do-centerCurrentPosition', (positionCenter) => {
            let dLat = positionCenter.lat;
            let dLng = positionCenter.lng;

            let pnt = new Point([dLng, dLat]).transform('EPSG:4326', 'EPSG:3857')
            let coordinate = pnt.getCoordinates();

            //this.olMap.getView().fit([12962380.601052666, 4004207.209473483, 15290958.230732275, 4982601.171523739], {duration: 500});

            this.olMap.getView().setCenter(coordinate);
            this.olMap.getView().setZoom(18);
        });

        EventBus.$on('do-makeTargetTempMarker', (payload) => {
            let dName = payload.dName;
            let pIndex = payload.pIndex;

            this.targetedFeature = this.olTempMarkers[dName].tempMarkerFeatures[pIndex];

            this.makeTargetTempMarker(dName, pIndex);
        });

        EventBus.$on('do-updateTargetDroneMarker', (dName) => {
            this.updateTargetDroneMarker(dName);
        });

        EventBus.$on('do-unsetSelectedTempMarker', (payload) => {
            let status = payload.status;
            let dNameOld = payload.dNameOld;
            let dNameNew = payload.dNameNew;

            console.log(status, payload);

            if(status === 'cancel') {
                if (this.selectedTempFeatureId !== '') {
                    let dNameOld = this.selectedTempFeatureId.split('-')[0];
                    let pIndexOld = this.selectedTempFeatureId.split('-')[1];

                    this.$store.state.tempMarkers[dNameOld][pIndexOld].selected = false;
                    this.selectedTempFeatureId = '';

                    this.updateSelectedTempMarker(dNameOld, pIndexOld);
                }
            }
            else if(status === 'register-name') {
                if (this.selectedTempFeatureId !== '') {

                    this.initOlTempMarker(dNameOld);

                    this.initOlTempMarker(dNameNew);

                    this.updateSource();

                    this.selectedTempFeatureId = '';
                }
            }
            else if(status === 'register-index') {
                if (this.selectedTempFeatureId !== '') {

                    this.initOlTempMarker(dNameOld);

                    this.updateSource();

                    this.selectedTempFeatureId = '';
                }
            }
            else if(status === 'register-extra') {
                if (this.selectedTempFeatureId !== '') {

                    this.initOlTempMarker(dNameOld);

                    this.updateSource();

                    this.selectedTempFeatureId = '';
                }
            }
            else if(status === 'delete') {
                if (this.selectedTempFeatureId !== '') {

                    this.initOlTempMarker(dNameOld);

                    this.initOlTempMarker(dNameNew);

                    this.updateSource();

                    this.selectedTempFeatureId = '';
                }
            }
            else if(status === 'remove') {
                if (this.selectedTempFeatureId !== '') {

                    this.initOlTempMarker(dNameOld);

                    this.updateSource();

                    this.selectedTempFeatureId = '';
                }
            }
        });

        EventBus.$on('do-unsetSelectedSurveyMarker', () => {

            console.log('>>>>>>>>>>>>>>>>>>>>>> initOlSurveyMarkers');
            this.initOlSurveyMarkers();

            this.updateSource();

            this.selectedSurveyFeatureId = '';
        });

        this.olMap.on('pointermove', (event) => {
            var hit = this.olMap.hasFeatureAtPixel(this.olMap.getEventPixel(event.originalEvent));
            this.olMap.getTargetElement().style.cursor = hit ? 'pointer' : '';

            //console.log('event.dragging', event.dragging);

            let latLng = toLonLat(event.coordinate);

            if(this.datum.targeted) {
                this.datum.curLat = latLng[1];
                this.datum.curLng = latLng[0];

                EventBus.$emit('do-calcDistance', this.datum);
            }

            //console.log(Proj.toLonLat(event.getCoordinates()));
            const hovered = this.olMap.forEachFeatureAtPixel(event.pixel, (feature) => feature);
            if (hovered !== undefined) {
                //console.log(hovered, hovered.getId(), hovered.getProperties().type, event.dragging, event.pixel, event.coordinate);
                if(hovered.getProperties().type === 'tempMarker') {
                    //console.log('hovered', hovered.getId());
                    //this.$set(this, 'selectedFeature', hovered);

                    let dName = hovered.getId().split('-')[0];
                    let pIndex = hovered.getId().split('-')[1];

                    if(this.$store.state.tempMarkers[dName][pIndex].targeted && this.$store.state.drone_infos[dName].targeted) {

                        if (event.dragging) {
                            // if(hovered.getProperties().altKey !== event.originalEvent.altKey) {
                            hovered.setProperties({altKey: event.originalEvent.altKey});

                            if (event.originalEvent.altKey) {
                                svgTempObj.svg.path._attributes.fill = this.$store.state.drone_infos[dName].color.replace('#', '%23');
                                svgTempObj.svg.path._attributes.stroke = '#FF1744'.replace('#', '%23');
                                svgTempObj.svg.path._attributes['stroke-width'] = '45';
                            }
                            else {
                                svgTempObj.svg.path._attributes.fill = this.$store.state.drone_infos[dName].color.replace('#', '%23');
                                svgTempObj.svg.path._attributes.stroke = '#76FF03'.replace('#', '%23');
                                svgTempObj.svg.path._attributes['stroke-width'] = '25';
                            }

                            let xmlSvgTempMarker = convert.js2xml(svgTempObj, {
                                compact: true,
                                ignoreComment: true,
                                spaces: 4
                            });

                            let tempIcon = new Icon({
                                opacity: 1,
                                src: 'data:image/svg+xml;utf8,' + xmlSvgTempMarker,
                                scale: svgTempScale,
                                anchor: [0.5, 1],
                            });

                            this.olTempMarkers[dName].tempMarkerFeatures[pIndex].getStyle()[0].setImage(tempIcon);
                            // }

                            //console.log(hovered.getProperties().type, event.originalEvent.altKey, event.pixel, event.coordinate);
                        }
                    }
                }
            }
        });

        this.olMap.on('singleclick', (event) => {

            // this.vectorLayer.getSource().forEachFeature((feature) => {
            //     if (!Object.prototype.hasOwnProperty.call(this.selectedFeatureFlag, feature.id_)) {
            //         this.selectedFeatureFlag[feature.getId()] = false;
            //     }
            //
            //     this.selectedFeatureFlag[feature.getId()] = false;
            // });

            this.targetedFeature = this.olMap.forEachFeatureAtPixel(event.pixel, (feature) => feature);

            if(this.targetedFeature !== undefined && this.targetedFeature.getId() !== undefined) {
                if(this.targetedFeature.getProperties().type === 'droneMarker') {
                    let dName = this.targetedFeature.getId();

                    this.$store.state.drone_infos[dName].targeted = !this.$store.state.drone_infos[dName].targeted;

                    this.updateTargetDroneMarker(dName);

                    this.updateTargetLineFeature(dName);

                    // if (this.$store.state.drone_infos[dName].targeted) {
                    //     this.addDroneTranslate(this.targetedFeature);
                    // }
                }

                else if(this.targetedFeature.getProperties().type === 'surveyMarker') {
                    let arrId = this.targetedFeature.getId().split('-');
                    let dName = arrId[0];
                    let pIndex = arrId[1];

                    if(!Object.prototype.hasOwnProperty.call(this.targetedSurveyFeatureId, dName)) {
                        this.targetedSurveyFeatureId[dName] = '';
                    }

                    if(!Object.prototype.hasOwnProperty.call(this.targetedSurveyFeature, dName)) {
                        this.targetedSurveyFeature[dName] = undefined;
                    }

                    if(this.targetedSurveyFeatureId[dName] !== '' && this.targetedSurveyFeatureId[dName] !== (dName + '-' + pIndex)) {
                        let pIndexOld = this.targetedSurveyFeatureId[dName].split('-')[1];

                        if(Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers[dName], pIndexOld)) {
                            this.$store.state.surveyMarkers[dName][pIndexOld].targeted = false;
                        }

                        this.deleteSurveyTranslate(this.targetedSurveyFeature[dName]);
                        this.deleteModifyInteraction(this.targetedSurveyFeature[dName]);

                        this.targetedSurveyFeatureId[dName] = '';
                        this.targetedSurveyFeature[dName] = undefined;

                        this.updateTargetedSurveyMarker(dName, pIndexOld);
                    }

                    if(this.targetedTempFeatureId[dName] !== '') {
                        let pIndexOld = this.targetedTempFeatureId[dName].split('-')[1];
                        this.$store.state.tempMarkers[dName][pIndexOld].targeted = false;

                        this.deleteTempTranslate(this.targetedTempFeature[dName]);
                        this.targetedTempFeatureId[dName] = '';
                        this.targetedTempFeature[dName] = undefined;

                        this.updateTargetedTempMarker(dName, pIndexOld);
                        //this.updateOlTempMarker(dName, pIndexOld);

                        this.olTempMarkers[dName].tempMarkerFeatures[pIndexOld].getStyle()[2].getImage().setRadius(1);
                    }

                    this.$store.state.surveyMarkers[dName][pIndex].targeted = !this.$store.state.surveyMarkers[dName][pIndex].targeted;

                    console.log('sssssssssssssssssssssssss single click', dName, pIndex, this.$store.state.surveyMarkers[dName][pIndex].targeted);

                    if (this.$store.state.surveyMarkers[dName][pIndex].targeted) {
                        this.$store.state.drone_infos[dName].curTargetedSurveyMarkerIndex = pIndex;

                        this.addSurveyTranslate(this.targetedFeature);
                        this.addModifyInteraction(this.targetedFeature);

                        this.targetedSurveyFeatureId[dName] = (dName + '-' + pIndex);
                        this.targetedSurveyFeature[dName] = this.targetedFeature;


                    }
                    else {
                        this.$store.state.drone_infos[dName].curTargetedSurveyMarkerIndex = -1;

                        this.deleteSurveyTranslate(this.targetedFeature);
                        this.deleteModifyInteraction(this.targetedFeature);

                        this.targetedSurveyFeatureId[dName] = '';
                        this.targetedSurveyFeature[dName] = undefined;
                    }

                    this.updateTargetedSurveyMarker(dName, pIndex);

                    if(this.$store.state.drone_infos[dName].selected && this.$store.state.drone_infos[dName].targeted) {
                        this.$store.state.drone_command_prepared = false;
                        setTimeout(() => {
                            this.$store.state.drone_command_prepared = true;
                        }, 10);
                    }
                }

                else if(this.targetedFeature.getProperties().type === 'tempMarker') {
                    let arrId = this.targetedFeature.getId().split('-');
                    let dName = arrId[0];
                    let pIndex = arrId[1];

                    this.makeTargetTempMarker(dName, pIndex);

                    // if(!Object.prototype.hasOwnProperty.call(this.targetedTempFeatureId, dName)) {
                    //     this.targetedTempFeatureId[dName] = '';
                    // }
                    //
                    // if(!Object.prototype.hasOwnProperty.call(this.targetedTempFeature, dName)) {
                    //     this.targetedTempFeature[dName] = undefined;
                    // }
                    //
                    // if(this.targetedTempFeatureId[dName] !== '' && this.targetedTempFeatureId[dName] !== (dName + '-' + pIndex)) {
                    //     let pIndexOld = this.targetedTempFeatureId[dName].split('-')[1];
                    //     this.$store.state.tempMarkers[dName][pIndexOld].targeted = false;
                    //
                    //     this.deleteTempTranslate(this.targetedTempFeature[dName]);
                    //     this.targetedTempFeatureId[dName] = '';
                    //     this.targetedTempFeature[dName] = undefined;
                    //
                    //     this.updateTargetedTempMarker(dName, pIndexOld);
                    //     //this.updateOlTempMarker(dName, pIndexOld);
                    //
                    //     this.olTempMarkers[dName].tempMarkerFeatures[pIndexOld].getStyle()[2].getImage().setRadius(1);
                    // }
                    //
                    // if(this.targetedSurveyFeatureId[dName] !== '') {
                    //     let pIndexOld = this.targetedSurveyFeatureId[dName].split('-')[1];
                    //     this.$store.state.surveyMarkers[dName][pIndexOld].targeted = false;
                    //
                    //     this.deleteSurveyTranslate(this.targetedSurveyFeature[dName]);
                    //     this.deleteModifyInteraction(this.targetedSurveyFeature[dName]);
                    //
                    //     this.targetedSurveyFeatureId[dName] = '';
                    //     this.targetedSurveyFeature[dName] = undefined;
                    //
                    //     this.updateTargetedSurveyMarker(dName, pIndexOld);
                    // }
                    //
                    // this.$store.state.tempMarkers[dName][pIndex].targeted = !this.$store.state.tempMarkers[dName][pIndex].targeted;
                    //
                    // console.log('ppppppppppppppppppppp single click', dName, pIndex, this.$store.state.tempMarkers[dName][pIndex].targeted);
                    //
                    // if (this.$store.state.tempMarkers[dName][pIndex].targeted) {
                    //       this.$store.state.drone_infos[dName].curTargetedTempMarkerIndex = pIndex;
                    //
                    //     this.addTempTranslate(this.targetedFeature);
                    //     this.targetedTempFeatureId[dName] = (dName + '-' + pIndex);
                    //     this.targetedTempFeature[dName] = this.targetedFeature;
                    //
                    //     this.$store.state.drone_infos[dName].updatedTempElePathFlag = false;
                    // }
                    // else {
                    //     this.$store.state.drone_infos[dName].curTargetedTempMarkerIndex = -1;
                    //
                    //     this.deleteTempTranslate(this.targetedFeature);
                    //     this.targetedTempFeatureId[dName] = '';
                    //     this.targetedTempFeature[dName] = undefined;
                    //
                    //     this.olTempMarkers[dName].tempMarkerFeatures[pIndex].getStyle()[2].getImage().setRadius(1);
                    // }
                    //
                    // this.updateTargetedTempMarker(dName, pIndex);
                    // //this.updateOlTempMarker(dName, pIndex);
                    //
                    // if(this.$store.state.drone_infos[dName].selected && this.$store.state.drone_infos[dName].targeted) {
                    //     this.$store.state.drone_command_prepared = false;
                    //     setTimeout(() => {
                    //         this.$store.state.drone_command_prepared = true;
                    //     }, 100);
                    // }
                    //
                    // if(dName === 'unknown') {
                    //     this.datum.targeted = this.$store.state.tempMarkers[dName][pIndex].targeted;
                    //     this.datum.lat = this.$store.state.tempMarkers[dName][pIndex].lat;
                    //     this.datum.lng = this.$store.state.tempMarkers[dName][pIndex].lng;
                    // }
                    //
                    // this.updateTargetLineFeature(dName);
                }
                //임시//else if(this.targetedFeature.getProperties().type === 'guideLine') {

                    // let eLngLats = [];
                    // let eLngLat = toLonLat(this.selectedFeature.getGeometry().getCoordinateAt(0));
                    // [eLngLat[0], eLngLat[1]] = [eLngLat[1], eLngLat[0]];
                    // eLngLats.push(eLngLat);
                    //
                    // eLngLat = toLonLat(this.selectedFeature.getGeometry().getCoordinateAt(0.5));
                    // [eLngLat[0], eLngLat[1]] = [eLngLat[1], eLngLat[0]];
                    // eLngLats.push(eLngLat);
                    //
                    // eLngLat = toLonLat(this.selectedFeature.getGeometry().getCoordinateAt(1));
                    // [eLngLat[0], eLngLat[1]] = [eLngLat[1], eLngLat[0]];
                    // eLngLats.push(eLngLat);
                    //
                    // console.log('this.selectedFeature.getGeometry().getCoordinateAt', this.selectedFeature.getGeometry().getCoordinateAt(0));
                    // console.log('this.selectedFeature.getGeometry().getCoordinateAt', this.selectedFeature.getGeometry().getCoordinateAt(0.5));
                    // console.log('this.selectedFeature.getGeometry().getCoordinateAt', this.selectedFeature.getGeometry().getCoordinateAt(1));
                    //
                    // let param = JSON.stringify(eLngLats).replace(/\[/g, '');
                    // param = param.replace(/\]/g, '');
                    //
                    // let url = 'http://open.mapquestapi.com/elevation/v1/profile?key=p1bQYpZGSjapSfqhhqhqGWEC1W0GaDYX&shapeFormat=raw&latLngCollection=' + param;
                    //
                    // console.log(url);
                    //
                    // axios({
                    //     validateStatus: function (status) {
                    //         // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    //         return status <= 500;
                    //     },
                    //     method: 'get',
                    //     url: url,
                    //     headers: {
                    //     },
                    //     data: ''
                    // }).then(
                    //     (res) => {
                    //         console.log(res.data);
                    //     }
                    // ).catch(
                    //     (err) => {
                    //         console.log(err.message);
                    //     }
                    // );
                //임시//}
            }
            else {
                console.log('singleclick', this.targetedFeature);

                Object.keys(this.targetedTempFeatureId).forEach((dName) => {
                    if(this.targetedTempFeatureId[dName] !== '') {
                        let pIndexOld = this.targetedTempFeatureId[dName].split('-')[1];
                        console.log('pIndexOld', this.targetedTempFeatureId[dName], this.$store.state.tempMarkers[dName][pIndexOld].targeted);

                        this.deleteTempTranslate(this.targetedTempFeature[dName]);
                        this.$store.state.tempMarkers[dName][pIndexOld].targeted = false;
                        this.targetedTempFeatureId[dName] = '';

                        this.updateTargetedTempMarker(dName, pIndexOld);
                        //this.updateOlTempMarker(dName, pIndexOld);
                    }
                });

                Object.keys(this.targetedSurveyFeatureId).forEach((dName) => {
                    if(this.targetedSurveyFeatureId[dName] !== '') {
                        let pIndexOld = this.targetedSurveyFeatureId[dName].split('-')[1];

                        if(Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers[dName], pIndexOld)) {
                            this.$store.state.surveyMarkers[dName][pIndexOld].targeted = false;
                        }

                        this.deleteSurveyTranslate(this.targetedSurveyFeature[dName]);
                        this.deleteModifyInteraction(this.targetedSurveyFeature[dName]);

                        this.targetedSurveyFeatureId[dName] = '';
                        this.targetedSurveyFeature[dName] = undefined;

                        this.updateTargetedSurveyMarker(dName, pIndexOld);
                    }
                });

                if (this.selectedTempFeatureId !== '') {
                    let dName = this.selectedTempFeatureId.split('-')[0];
                    let pIndex = this.selectedTempFeatureId.split('-')[1];

                    this.$store.state.tempMarkers[dName][pIndex].selected = false;
                    this.selectedTempFeatureId = '';

                    this.updateSelectedTempMarker(dName, pIndex);

                    this.curInfoTempMarkerFlag = false;

                    this.$forceUpdate();

                    this.$store.state.drone_infos[dName].curTargetedTempMarkerIndex = -1;
                }

                if (this.selectedSurveyFeatureId !== '') {
                    let dName = this.selectedSurveyFeatureId.split('-')[0];
                    let pIndex = this.selectedSurveyFeatureId.split('-')[1];

                    this.$store.state.surveyMarkers[dName][pIndex].selected = false;
                    this.selectedSurveyFeatureId = '';

                    this.updateTargetedSurveyMarker(dName, pIndex);

                    this.curInfoSurveyMarkerFlag = false;

                    this.$forceUpdate();

                    this.$store.state.drone_infos[dName].curTargetedSurveyMarkerIndex = -1;
                }

                Object.keys(this.$store.state.drone_infos).forEach((dName) => {
                    if(this.$store.state.drone_infos[dName].targeted) {
                        this.$store.state.drone_infos[dName].targeted = false;

                        this.updateTargetLineFeature(dName);

                        this.updateTargetDroneMarker(dName);
                    }
                });

                EventBus.$emit('do-clear-target-drones');
            }

            // this.olMap.forEachFeatureAtPixel(event.pixel, (clicked) => {
            //     this.selectedFeature = clicked;
            //
            //     if(clicked !== undefined) {
            //         if (!Object.prototype.hasOwnProperty.call(this.selectedFeatureFlag, clicked.id_)) {
            //             this.selectedFeatureFlag[clicked.id_] = false;
            //         }
            //
            //         this.selectedFeatureFlag[clicked.id_] = !this.selectedFeatureFlag[clicked.id_];
            //
            //         console.log(clicked.id_, this.selectedFeatureFlag[clicked.id_]);
            //
            //         if (this.selectedFeatureId) {
            //             selectedFeature.setStyle();
            //             selectedFeatureId = null;
            //         }
            //         if (!selectedFeature || (selectedFeature.getId() != feature.getId())) {
            //             feature.setStyle(selectedStyle);
            //             selectedFeatureId = feature.getId();
            //         }
            //     }
            //     else {
            //         this.selectedFeatureId = null;
            //     }
            // });


        });

        this.olMap.on('dblclick', (event) => {

            this.selectedFeature = this.olMap.forEachFeatureAtPixel(event.pixel, (feature) => feature);

            // console.log('dblclick', this.selectedFeature);

            if(this.selectedFeature !== undefined && this.selectedFeature.getId() !== undefined) {
                console.log('dblclick', this.selectedFeature.getProperties().type);

                if(this.selectedFeature.getProperties().type === 'droneMarker') {
                    //let dName = this.selectedFeature.getId();

                }
                else if(this.selectedFeature.getProperties().type === 'surveyMarker') {
                    let arrId = this.selectedFeature.getId().split('-');
                    let dName = arrId[0];
                    let pIndex = arrId[1];

                    if(this.selectedSurveyFeatureId !== '' && this.selectedSurveyFeatureId !== (dName + '-' + pIndex)) {
                        let dNameOld = this.selectedSurveyFeatureId.split('-')[0];
                        let pIndexOld = this.selectedSurveyFeatureId.split('-')[1];

                        this.$store.state.surveyMarkers[dNameOld][pIndexOld].selected = false;
                        this.selectedSurveyFeatureId = '';

                        this.updateTargetedSurveyMarker(dNameOld, pIndexOld);
                    }

                    if(this.selectedTempFeatureId !== '') {
                        let dNameOld = this.selectedTempFeatureId.split('-')[0];
                        let pIndexOld = this.selectedTempFeatureId.split('-')[1];

                        this.$store.state.tempMarkers[dNameOld][pIndexOld].selected = false;
                        this.selectedTempFeatureId = '';

                        this.updateSelectedTempMarker(dNameOld, pIndexOld);
                    }

                    this.$store.state.surveyMarkers[dName][pIndex].selected = true;
                    this.selectedSurveyFeatureId = (dName + '-' + pIndex);

                    this.updateTargetedSurveyMarker(dName, pIndex);

                    this.curInfoSurveyMarkerFlag = false;
                    this.curInfoTempMarkerFlag = false;

                    this.$forceUpdate();

                    let lineFeature = this.olSurveyMarkers[dName].surveyLineFeatures[pIndex];

                    let eLngLats = [];

                    this.$store.state.surveyMarkers[dName][pIndex].elevations = [];
                    this.$store.state.surveyMarkers[dName][pIndex].elevations_location = [];

                    for(let i = 0; i < this.$store.state.SAMPLES; i++) {
                        let eLngLat = toLonLat(lineFeature.getGeometry().getCoordinateAt(i/(this.$store.state.SAMPLES-1)));
                        eLngLats.push(eLngLat);
                        this.$store.state.surveyMarkers[dName][pIndex].elevations_location.push({lat: eLngLat[1], lng: eLngLat[0]});
                    }

                    this.getElevationProfile(eLngLats, async (status, result) => {
                        if (status === 200) {
                            result.results.forEach((ele) => {
                                this.$store.state.surveyMarkers[dName][pIndex].elevations.push(ele.elevation);
                            });
                        }
                    });

                    let area = getArea(this.selectedFeature.getGeometry());
                    this.$store.state.surveyMarkers[dName][pIndex].area = area.toFixed(1);
                    console.log('computeArea = ', area.toFixed(1), '㎡');

                    setTimeout(() => {
                        this.curSelectedMarker = this.$store.state.surveyMarkers[dName][pIndex];
                        this.curIndexMarker = pIndex;
                        this.curNameMarker = dName;
                        this.curInfoSurveyMarkerFlag = true;

                        // setTimeout(() => {
                        //     console.log('dblclick', 'on-update-info-survey-marker');
                        //     EventBus.$emit('on-update-info-survey-marker');
                        // }, 10);
                    }, 100);
                }
                else if(this.selectedFeature.getProperties().type === 'tempMarker') {
                    let arrId = this.selectedFeature.getId().split('-');
                    let dName = arrId[0];
                    let pIndex = arrId[1];

                    if(this.selectedTempFeatureId !== '' && this.selectedTempFeatureId !== (dName + '-' + pIndex)) {
                        let dNameOld = this.selectedTempFeatureId.split('-')[0];
                        let pIndexOld = this.selectedTempFeatureId.split('-')[1];

                        this.$store.state.tempMarkers[dNameOld][pIndexOld].selected = false;
                        this.selectedTempFeatureId = '';

                        this.updateSelectedTempMarker(dNameOld, pIndexOld);
                    }

                    if(this.selectedSurveyFeatureId !== '') {
                        let dNameOld = this.selectedSurveyFeatureId.split('-')[0];
                        let pIndexOld = this.selectedSurveyFeatureId.split('-')[1];

                        this.$store.state.surveyMarkers[dNameOld][pIndexOld].selected = false;
                        this.selectedSurveyFeatureId = '';

                        this.updateTargetedSurveyMarker(dNameOld, pIndexOld);
                    }

                    this.$store.state.tempMarkers[dName][pIndex].selected = true;
                    this.selectedTempFeatureId = (dName + '-' + pIndex);

                    this.updateSelectedTempMarker(dName, pIndex);

                    this.curInfoTempMarkerFlag = false;
                    this.curInfoSurveyMarkerFlag = false;

                    this.$forceUpdate();

                    setTimeout(() => {
                        this.curSelectedMarker = this.$store.state.tempMarkers[dName][pIndex];
                        this.curIndexMarker = pIndex;
                        this.curNameMarker = dName;
                        this.curInfoTempMarkerFlag = true;
                    }, 10);
                }
            }
        });

        // this.olMap.on('click', (event) => {
        //     if(this.selectedFeature !== undefined) {
        //         console.log('click', event, this.selectedFeature);
        //
        //         if (!Object.prototype.hasOwnProperty.call(this.selectedFeatureFlag, this.selectedFeature.id_)) {
        //             this.selectedFeatureFlag[this.selectedFeature.id_] = false;
        //         }
        //
        //         this.selectedFeatureFlag[this.selectedFeature.id_] = !this.selectedFeatureFlag[this.selectedFeature.id_];
        //
        //         console.log(this.selectedFeature.id_, this.selectedFeatureFlag[this.selectedFeature.id_]);
        //     }
        // })

        let pnt = new Point([127.16050533784832, 37.40423134053018]).transform('EPSG:4326', 'EPSG:3857');

        for(let dName in this.$store.state.drone_infos) {
            if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                if(dName !== 'unknown') {
                    pnt = new Point([this.$store.state.drone_infos[dName].lng, this.$store.state.drone_infos[dName]]).transform('EPSG:4326', 'EPSG:3857');
                    break;
                }
            }
        }

        let center_coordinate = pnt.getCoordinates();

        this.olMap.getView().setCenter(center_coordinate);
        this.olMap.getView().setZoom(18);

        EventBus.$on('do-download-map', () => {
            let osmextent = this.olMap.getView().calculateExtent();
            //let totalLocalStroageSize = 0;
            let totalCount = 0;
            let totalCount2 = 0;
            let currentZoomLevel = this.olMap.getView().getZoom();
            //var mapImageObjs = [];
            console.log('**************************************** getTileGrid', this.osmSource.getTileGrid());

            this.osmSource.getTileGrid().forEachTileCoord(osmextent, currentZoomLevel, (tileCoord) => {
                let img = document.createElement("img");
                img.onload = () => {
                    let canvas = document.createElement("canvas");
                    canvas.width = this.osmSource.getTileGrid().getTileSize(currentZoomLevel);
                    canvas.height = this.osmSource.getTileGrid().getTileSize(currentZoomLevel);
                    let ctx = canvas.getContext('2d', { willReadFrequently: true });
                    ctx.drawImage(img, 0, 0);
                    //totalLocalStroageSize += canvas.toDataURL().length;
                    //console.log(++totalCount, canvas.toDataURL().length, totalLocalStroageSize, 'OSM_' + tileCoord[0] + '_' + tileCoord[1] + '_' + (-tileCoord[2] - 1), canvas.toDataURL());

                    //localStorage.setItem('OSM_' + tileCoord[0] + '_' + tileCoord[1] + '_' + (-tileCoord[2] - 1), canvas.toDataURL());

                    let mapImageObj = {};
                    mapImageObj.todoid = 'OSM_' + tileCoord[0] + '_' + tileCoord[1] + '_' + (tileCoord[2]);
                    mapImageObj.content = canvas.toDataURL();

                    axios({
                        validateStatus: function (status) {
                            // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                            return status <= 500;
                        },
                        method: 'post',
                        url: 'http://localhost:4500/todos',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: mapImageObj
                    }).then(
                        (res) => {
                            console.log(res.status);
                        }
                    ).catch(
                        (err) => {
                            console.log(err.message);
                        }
                    );

                    img.remove();
                    canvas.remove();

                    if(totalCount >= totalCount2) {
                        //this.writeIdxedDB(mapImageObjs);

                        // mapImageObjs.forEach((obj, idx) => {
                        //     if(idx < 20) {
                        //         localStorage.setItem(obj.id, obj.name);
                        //     }
                        // });

                        // mapImageObjs.forEach((obj) => {
                        //     axios({
                        //         validateStatus: function (status) {
                        //             // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        //             return status <= 500;
                        //         },
                        //         method: 'post',
                        //         url: 'http://localhost:4500/todos',
                        //         headers: {
                        //             'Content-Type': 'application/json'
                        //         },
                        //         data: obj
                        //     }).then(
                        //         (res) => {
                        //             console.log(res.status);
                        //         }
                        //     ).catch(
                        //         (err) => {
                        //             console.log(err.message);
                        //         }
                        //     );
                        // });
                    }
                };
                img.crossOrigin = "Anonymous";
                img.src = this.osmSource.getTileUrlFunction()(tileCoord);

                console.log('totalCount2', totalCount2++);
            });
        });

        EventBus.$on('do-rotate-map', (angle)=>{
            this.prepared = false;
            this.prepared = true;

            this.mapHeading = parseInt(angle);

            this.olMap.getView().setRotation((angle*Math.PI)/180);

            localStorage.setItem('rotateMapVal', this.mapHeading);
        });

        EventBus.$on('updateDroneAlt', (payload) => {
            // let osmextent = this.olMap.getView().calculateExtent();
            //
            // let topLeft = this.olMap.getPixelFromCoordinate([osmextent[0], osmextent[1]]);
            // // let topRight = this.olMap.getPixelFromCoordinate(osmextent[1]);
            // // let bottomLeft = this.olMap.getPixelFromCoordinate(osmextent[2]);
            // // let bottomRight = this.olMap.getPixelFromCoordinate(osmextent[3]);
            //
            // //console.log(payload, osmextent, topLeft, topRight, bottomLeft, bottomRight);
            // console.log(topLeft[0], topLeft[1]);

            let dPnt = new Point([payload.lng, payload.lat]).transform('EPSG:4326', 'EPSG:3857')
            let dCoordinate = dPnt.getCoordinates();

            let dPixel = this.olMap.getPixelFromCoordinate(dCoordinate);

            //let dFeature = this.vectorLayer.getSource().getFeaturesAtCoordinate(dCoordinate);
            //console.log(payload.name, dPixel[0], dPixel[1]);

            let scale = Math.pow(2, this.olMap.getView().getZoom());

            let _payload = {};
            _payload.name = payload.name;
            _payload.scale = scale;
            _payload.x = dPixel[0];
            _payload.y = dPixel[1];
            _payload.alt = payload.alt;
            EventBus.$emit('do-draw-DroneCommand', _payload);


            // var topRight = this.map.getProjection().fromLatLngToPoint(this.map.getBounds().getNorthEast());
            // var bottomLeft = this.map.getProjection().fromLatLngToPoint(this.map.getBounds().getSouthWest());
            //
            //
            // var scale = Math.pow(2, this.map.getZoom());
            // var worldPoint = this.map.getProjection().fromLatLngToPoint({lat:payload.lat, lng:payload.lng});
            //
            // let _payload = {};
            // _payload.name = payload.name;
            // _payload.scale = scale;
            // _payload.x = (worldPoint.x - bottomLeft.x) * scale;
            // _payload.y = (worldPoint.y - topRight.y) * scale;
            // _payload.alt = payload.alt;
            // EventBus.$emit('do-draw-DroneCommand', _payload);
        });

        EventBus.$on('update-home-position', (dName) => {
            let hLat = this.$store.state.drone_infos[dName].home_position.lat;
            let hLng = this.$store.state.drone_infos[dName].home_position.lng;

            let hPnt = new Point([hLng, hLat]).transform('EPSG:4326', 'EPSG:3857')
            let hCoordinate = hPnt.getCoordinates();

            this.olDroneMarkers[dName].droneHomeMarkerFeature.getGeometry().setCoordinates(hCoordinate);
        });

        EventBus.$on('do-refresh-tempMarker', (dName) => {

            this.initOlTempMarker(dName);

            this.updateSource();
        });

        EventBus.$on('do-update-survey-GcsMap', async (payload) => {
            let eName = payload.eName;

            let dName = payload.dName;
            let pIndex = payload.pIndex;
            let angle = this.$store.state.surveyMarkers[dName][pIndex].angle;
            let gap = this.$store.state.surveyMarkers[dName][pIndex].gap;
            let dir = this.$store.state.surveyMarkers[dName][pIndex].dir;

            if(eName === 'angle') {
                angle = payload.angle;
            }
            else if(eName === 'gap') {
                gap = payload.gap;
            }
            else if(eName === 'dir') {
                dir = payload.dir;
            }

            this.$store.state.surveyMarkers[dName][pIndex].angle = angle;
            this.$store.state.surveyMarkers[dName][pIndex].gap = gap;
            this.$store.state.surveyMarkers[dName][pIndex].dir = dir;

            this.updateSurveyPath(dName, pIndex, gap, angle, dir);

            let pathLineCoordinates = [];
            for(let i = 0; i < this.$store.state.surveyMarkers[dName][pIndex].pathLines.length; i++) {
                let svLat = this.$store.state.surveyMarkers[dName][pIndex].pathLines[i].lat;
                let svLng = this.$store.state.surveyMarkers[dName][pIndex].pathLines[i].lng;

                let svPnt = new Point([svLng, svLat]).transform('EPSG:4326', 'EPSG:3857')
                let svCoordinate = svPnt.getCoordinates();

                pathLineCoordinates.push(svCoordinate);
            }

            this.olSurveyMarkers[dName].surveyLineFeatures[pIndex].getGeometry().setCoordinates(pathLineCoordinates);
            //
            // let lineFeature = this.olSurveyMarkers[dName].surveyLineFeatures[pIndex];
            //
            // let eLngLats = [];
            //
            // this.$store.state.surveyMarkers[dName][pIndex].elevations = [];
            // this.$store.state.surveyMarkers[dName][pIndex].elevations_location = [];
            //
            // for(let i = 0; i < this.$store.state.SAMPLES; i++) {
            //     let eLngLat = toLonLat(lineFeature.getGeometry().getCoordinateAt(i/(this.$store.state.SAMPLES-1)));
            //     eLngLats.push(eLngLat);
            //     this.$store.state.surveyMarkers[dName][pIndex].elevations_location.push({lat: eLngLat[1], lng: eLngLat[0]});
            // }
            //
            // this.getElevationProfile(eLngLats, async (status, result) => {
            //     if (status === 200) {
            //         result.results.forEach((ele) => {
            //             this.$store.state.surveyMarkers[dName][pIndex].elevations.push(ele.elevation);
            //         });
            //     }
            // });

            try {
                let url_base = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS;
                let url = url_base + '/SurveyMarkerInfos/' + dName;
                let response = await axios.post(url, {
                    'm2m:cin': {
                        con: this.$store.state.surveyMarkers[dName]
                    }
                }, {
                    validateStatus: status => {
                        return status < 500;
                    }, // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=4'
                    },
                });
                console.log('translateend-SurveyMarkerInfos-' + dName, response.status, response.data['m2m:cin']);
            }
            catch (err) {
                console.log("Error >>", err);
            }

            if(this.curInfoSurveyMarkerFlag) {
                console.log('do-update-survey-GcsMap', 'on-update-info-survey-marker');
                EventBus.$emit('on-update-info-survey-marker');
            }
        });

        EventBus.$on('clearTrackingLines', (dName) => {
            this.olDroneMarkers[dName].trCoordinates = [];

            this.olDroneMarkers[dName].trackingLineFeature.getGeometry().setCoordinates(this.olDroneMarkers[dName].trCoordinates);
        });
    },

    beforeDestroy() {
        EventBus.$off('do-centerCurrentPosition');
        EventBus.$off('do-current-drone-position');
        EventBus.$off('gcs-map-ready');
        EventBus.$off('do-centerCurrentPosition');
        EventBus.$off('do-makeTargetTempMarker');
        EventBus.$off('do-updateTargetDroneMarker');
        EventBus.$off('do-unsetSelectedTempMarker');
        EventBus.$off('do-unsetSelectedSurveyMarker');
        EventBus.$off('do-rotate-map');
        EventBus.$off('do-download-map');
        EventBus.$off('updateDroneAlt');
        EventBus.$off('update-home-position');
        EventBus.$off('do-refresh-tempMarker');
        EventBus.$off('do-update-survey-GcsMap');
        EventBus.$off('clearTrackingLines');
        EventBus.$off('do-clear-drone-position');
    }
}
</script>

<style lang="scss">

@import "../../node_modules/ol-contextmenu/dist/ol-contextmenu.min.css";

.info_markers {
    position: absolute;
    left: 0;
    top: 0;
    opacity: 1;
    z-index: 6;
    width: 100%;
}

.context-menu {
    position: absolute;
    opacity: 1;
    z-index: 5;
}



//.ol-zoom.my-new-class-name {
//    background: red;
//}

.ol-zoom {
    top:3em;
    right: 0.5em;
    left: unset;

    //move the tooltips to the left of the now right aligned buttons
    .ol-has-tooltip:hover [role=tooltip] {
        left: -5.5em;
        border-radius: 4px 0 0 4px;
    }

    .ol-zoom-out.ol-has-tooltip:hover [role=tooltip] {
        left: -6.2em;
    }

    //make sure the rotate controls included by default with an opacity of 0 don't
    //block clicks intended for the '+' button
    .ol-rotate {
        visibility: visible;
    }
}

.ol-scale-line {
    bottom: 0.5em;
    right: 0.5em;
    left: unset;

    //move the tooltips to the left of the now right aligned buttons
    .ol-has-tooltip:hover [role=tooltip] {
        left: -5.5em;
        border-radius: 4px 0 0 4px;
    }

    .ol-zoom-out.ol-has-tooltip:hover [role=tooltip] {
        left: -6.2em;
    }

    //make sure the rotate controls included by default with an opacity of 0 don't
    //block clicks intended for the '+' button
    .ol-rotate {
        visibility: hidden;
    }
}


</style>
