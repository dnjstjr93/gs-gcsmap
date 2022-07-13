<template>
    <div ref="map-root" style="width: 100%; height: 100%">
        <v-card flat tile class="info_markers" v-if="curInfoTempMarkerFlag">
            <InfoTempMarker v-model="curInfoTempMarkerFlag"
                            :marker-name="curNameMarker"
                            :marker-index="curIndexMarker"
                            :marker="curSelectedMarker"
            ></InfoTempMarker>
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
import XYZ from 'ol/source/XYZ'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
//import GeoJSON from 'ol/format/GeoJSON'
import MultiPoint from 'ol/geom/MultiPoint';
import { toLonLat } from 'ol/proj';
import { Collection } from "ol";

import 'ol/ol.css'
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {Icon, Text} from 'ol/style';
// import {Geometry} from 'ol/geom';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';

import { faLocationArrow, faMapPin, faCrosshairs } from "@fortawesome/free-solid-svg-icons";
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
// svgDroneObj.svg.path._attributes['stroke-alignment'] = 'inner';

let svgTempObj = {};
svgTempObj.svg = {};
svgTempObj.svg._attributes = {};
svgTempObj.svg._attributes.xmlns = 'http://www.w3.org/2000/svg';
svgTempObj.svg._attributes.x = '0';
svgTempObj.svg._attributes.y = '0';
svgTempObj.svg._attributes.width = faCrosshairs.icon[0]/2;
svgTempObj.svg._attributes.height = faCrosshairs.icon[1]/2;
svgTempObj.svg._attributes.class = faCrosshairs.icon[3];
svgTempObj.svg._attributes.viewBox = '-11 -11 ' + (faCrosshairs.icon[0]+22) + ' ' + (faCrosshairs.icon[1]+22);
svgTempObj.svg.path = {};
svgTempObj.svg.path._attributes = {};
svgTempObj.svg.path._attributes.d = faCrosshairs.icon[4];

console.log('faMapPin', faLocationArrow, faCrosshairs, faMapPin);

const svgScale = 0.18;

const colorMapAlt = {
    0:  '#FFFFFF',
    10:  '#FF9E80',
    20:  '#FFD180',
    30:  '#FFE57F',
    40:  '#FFFF8D',
    50:  '#F4FF81',
    60:  '#CCFF90',
    70:  '#B9F6CA',
    80:  '#A7FFEB',
    90:  '#84FFFF',
    100:  '#80D8FF',
    110:  '#82B1FF',
    120:  '#8C9EFF',
    130:  '#B388FF',
    140:  '#EA80FC',
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

export default {
    name: 'MapContainer',
    components: {
        InfoTempMarker,
    },
    props: {
        geojson: Object
    },
    data: () => {

        return {
            curInfoTempMarkerFlag: false,

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

            selectedFeature: undefined,
            selectedFeatureFlag: {},
            selectedFeatureId: null,
            selectedTempFeatureId: '',

            targetedFeature: undefined,
            targetedTempFeatureId: {},

            targetedTempTranslate: {},

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
        geojson(value) {
            this.updateSource(value)
        },
        selectedFeature(value) {
            this.$emit('select', value)
        },
    },

    computed: {
    },

    methods: {

        deleteOlTempMarker(obj) {
            console.log(obj.data.marker.getId());
        },

        addOlTempMarker(obj) {
            if(!Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers, 'unknown')) {
                this.$store.state.tempMarkers['unknown'] = [];

                this.postCntTempMarkerInfosToMobius('unknown');
            }

            let latLng = toLonLat(obj.coordinate);

            let eLngLats = [];
            eLngLats.push(JSON.parse(JSON.stringify(latLng)));

            this.getElevationProfile(eLngLats, (status, result) => {
                if (status === 200) {
                    let elevation_val = result.elevationProfile[0].height;

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
                    marker.type = 'Goto';
                    marker.selected = false;
                    marker.targeted = false;
                    marker.color = '#9E9E9E';

                    this.$store.state.tempMarkers['unknown'].push(marker);

                    this.initOlTempMarker('unknown');

                    this.updateSource();

                    this.postCinTempMarkerInfoToMobius('unknown');

                    this.doBroadcastConfirmAddTempMarker(JSON.parse(JSON.stringify(marker)));
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
                    this.features.push(this.olDroneMarkers[dName].directionLineFeature);
                    this.features.push(this.olDroneMarkers[dName].droneMarkerFeature);
                    console.log('droneMarkers', this.features);
                }
            }

            for(let dName in this.olTempMarkers) {
                if(Object.prototype.hasOwnProperty.call(this.olTempMarkers, dName)) {
                    this.features.push(this.olTempMarkers[dName].guideLineFeature);
                    this.features = this.features.concat(this.olTempMarkers[dName].tempMarkerFeatures);

                    this.olTempMarkers[dName].tempMarkerTranslates.forEach((translate) => {
                        this.olMap.addInteraction(translate);
                    });
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
                    console.log('-------------------------------------------------------postCinTempMarkerInfoToMobius-axios', res.data);
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

        getStyleTempMarker(pIndex, fillColor, strokeColor, strokeWidth, tAlt, scale, selectedColor) {
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
                        anchor: [0.49, 0.49],
                    }),
                    text: new Text({
                        text: [pIndex + ':' + tAlt.toFixed(0), 'bold 11px sans-serif'],
                        textAlign: 'center',
                        offsetY: -25,
                        scale: 1.4,
                        stroke: new Stroke({
                            color: 'black',
                            width: 0.8,
                        }),
                        fill: new Fill({
                            color: colorMapAlt[Math.round(tAlt / 10) * 10]
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
                    '#FFFF00',
                    '35',
                    this.$store.state.tempMarkers[dName][pIndex].alt,
                    svgScale-0.05,
                    selectedColor
                );
            }
            else {
                iconStyleTemp = this.getStyleTempMarker(
                    pIndex,
                    this.$store.state.drone_infos[dName].color,
                    '#FFFDE7',
                    '15',
                    this.$store.state.tempMarkers[dName][pIndex].alt,
                    svgScale-0.05,
                    selectedColor
                );
            }

            this.olTempMarkers[dName].tempMarkerFeatures[pIndex].setStyle(iconStyleTemp);
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
                        anchor: [0.51, 0.51],

                    }),
                    text: new Text({
                        text: [dAlt.toFixed(1), 'bold 11px sans-serif', '\n', 'bold 10px sans-serif', (armStatus === 'DISARMED') ? 'DISARMED' : '', 'bold 10px sans-serif',],
                        offsetY: -40,
                        offsetX: -1,
                        scale: 1.5,
                        stroke: new Stroke({
                            color: 'black',
                            width: 0.8,
                        }),
                        fill: new Fill({
                            color: colorMapAlt[Math.round(dAlt / 10) * 10]
                        }),
                    }),
                    zIndex: 2,
                }),
                new Style({
                    text: new Text({
                        textAlign: 'center',
                        offsetY: 40,
                        text: [dName, 'bold 9px sans-serif', '\n', 'bold 10px sans-serif', '(' + system_id + ')', 'bold 10px sans-serif',],
                        scale: 1.6,
                        stroke: new Stroke({
                            color: 'black',
                            width: 0.8,
                        }),
                        fill: new Fill({
                            color: colorMapAlt[Math.round(dAlt / 10) * 10]
                        }),
                    }),
                    zIndex: 2,
                }),
            ];
        },

        deleteTranslate(feature) {
            let dName = feature.getId().split('-')[0];

            if(this.targetedTempTranslate[dName]) {
                this.olMap.removeInteraction(this.targetedTempTranslate[dName]);
                this.targetedTempTranslate[dName] = null;
            }
        },

        addTranslate(feature) {
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

                        this.getElevationProfile(eLngLats, (status, result) => {
                            if (status === 200) {
                                let elevation_val = result.elevationProfile[0].height;

                                console.log('elevation_val', result.elevationProfile[0].distance, result.elevationProfile[0].height);
                                this.olTempMarkers[dName].Coordinates[pIndex] = feature.getGeometry().getCoordinates();

                                this.olTempMarkers[dName].guideLineFeature.getGeometry().setCoordinates(this.olTempMarkers[dName].Coordinates);

                                this.$store.state.tempMarkers[dName][pIndex].lat = latLng[1];
                                this.$store.state.tempMarkers[dName][pIndex].lng = latLng[0];
                                this.$store.state.tempMarkers[dName][pIndex].elevation = elevation_val;

                                if(this.curInfoTempMarkerFlag) {
                                    this.updateSelectedTempMarker(dName, pIndex);
                                }

                                this.postCinTempMarkerInfoToMobius(dName);

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
                            }
                        });
                    }
                });
            });

            this.olMap.addInteraction(this.targetedTempTranslate[dName]);
        },

        updateSelectedTempMarker(dName, pIndex) {
            if(this.selectedTempFeatureId !== '' && this.selectedTempFeatureId !== (dName + '-' + pIndex)) {
                let dNameOld = this.selectedTempFeatureId.split('-')[0];
                let pIndexOld = this.selectedTempFeatureId.split('-')[1];

                this.$store.state.tempMarkers[dNameOld][pIndexOld].selected = false;
                this.selectedTempFeatureId = '';

                this.updateOlTempMarker(dNameOld, pIndexOld);
            }

            this.$store.state.tempMarkers[dName][pIndex].selected = true;
            this.selectedTempFeatureId = (dName + '-' + pIndex);

            this.updateOlTempMarker(dName, pIndex);

            this.curInfoTempMarkerFlag = false;

            this.$forceUpdate();

            setTimeout(() => {
                this.curSelectedMarker = this.$store.state.tempMarkers[dName][pIndex];
                this.curIndexMarker = pIndex;
                this.curNameMarker = dName;
                this.curInfoTempMarkerFlag = true;
            }, 10);
        },

        updateTargetedTempMarker(dName, pIndex, feature) {
            if(!Object.prototype.hasOwnProperty.call(this.targetedTempFeatureId, dName)) {
                this.targetedTempFeatureId[dName] = '';
            }

            if(this.targetedTempFeatureId[dName] !== '' && this.targetedTempFeatureId[dName] !== (dName + '-' + pIndex)) {
                let pIndexOld = this.targetedTempFeatureId[dName].split('-')[1];

                this.$store.state.tempMarkers[dName][pIndexOld].targeted = false;
                this.targetedTempFeatureId[dName] = '';

                this.updateOlTempMarker(dName, pIndexOld);
            }

            if (this.$store.state.tempMarkers[dName][pIndex].targeted) {
                this.$store.state.tempMarkers[dName][pIndex].targeted = false;
                this.targetedTempFeatureId[dName] = '';
                this.$store.state.drone_infos[dName].curTargetedTempMarkerIndex = -1;

                this.deleteTranslate(feature);
            }
            else {
                this.$store.state.tempMarkers[dName][pIndex].targeted = true;
                this.targetedTempFeatureId[dName] = (dName + '-' + pIndex);
                this.$store.state.drone_infos[dName].curTargetedTempMarkerIndex = pIndex;

                this.addTranslate(feature);
            }

            this.updateOlTempMarker(dName, pIndex);

            if(this.$store.state.drone_infos[dName].selected && this.$store.state.drone_infos[dName].targeted) {
                this.$store.state.drone_command_prepared = false;
                setTimeout(() => {
                    this.$store.state.drone_command_prepared = true;
                }, 10);
            }
        },

        updateTargetDroneMarker(dName) {
            let iconStyleDrone = null;

            if (this.$store.state.drone_infos[dName].targeted) {
                iconStyleDrone = this.getStyleDroneMarker(
                    dName,
                    this.$store.state.drone_infos[dName].system_id,
                    this.$store.state.drone_infos[dName].color,
                    '#FFFF00',
                    '35',
                    this.$store.state.drone_infos[dName].alt,
                    svgScale + (this.$store.state.drone_infos[dName].alt / 3000),
                    ((360+this.$store.state.drone_infos[dName].heading-45-this.mapHeading)%360) * (Math.PI / 180),
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
                    ((360+this.$store.state.drone_infos[dName].heading-45-this.mapHeading)%360) * (Math.PI / 180),
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

                    let pnt = new Point([dLng, dLat]).transform('EPSG:4326', 'EPSG:3857')
                    let coordinate = pnt.getCoordinates();

                    this.olDroneMarkers[dName] = {};
                    this.olDroneMarkers[dName].droneMarkerFeature = new Feature({
                        geometry: new Point([coordinate[0], coordinate[1]]),
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
                        ((360+this.$store.state.drone_infos[dName].heading-45-this.mapHeading)%360) * (Math.PI / 180),
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
                }
            });
        },

        getElevationProfile(eLngLats, callback) {

            eLngLats.forEach((eLngLat, idx) => {
                [eLngLat[0], eLngLat[1]] = [eLngLat[1], eLngLat[0]];
                eLngLats[idx] = eLngLat;
            });

            let param = JSON.stringify(eLngLats).replace(/\[/g, '');
            param = param.replace(/\]/g, '');

            let url = 'http://open.mapquestapi.com/elevation/v1/profile?key=p1bQYpZGSjapSfqhhqhqGWEC1W0GaDYX&shapeFormat=raw&latLngCollection=' + param;

            console.log(url);

            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status <= 500;
                },
                method: 'get',
                url: url,
                headers: {
                },
                data: ''
            }).then(
                (res) => {
                    console.log(res.data);
                    callback(res.status, res.data);
                }
            ).catch(
                (err) => {
                    console.log(err.message);
                    callback(500, err.message);
                }
            );
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

                let tPnt = new Point([tLng, tLat]).transform('EPSG:4326', 'EPSG:3857')
                let tCoordinate = tPnt.getCoordinates();

                console.log('OOOOOOOOOOOOOOOOOOOOOOOOOO tempMarkers', dName, pIndex, tCoordinate);

                this.olTempMarkers[dName].Coordinates.push(tCoordinate);

                let tFeature = new Feature({
                    geometry: new Point([tCoordinate[0], tCoordinate[1]]),
                    type: 'tempMarker',
                    dragging: false,
                });
                tFeature.setId(dName + '-' + pIndex);

                let selectedColor = '#FAFAFA80';

                if (this.$store.state.tempMarkers[dName][pIndex].selected) {
                    selectedColor = '#76FF03F0';
                }

                let iconStyleTemp = this.getStyleTempMarker(
                    pIndex,
                    this.$store.state.drone_infos[dName].color,
                    '#FFFDE7',
                    '15',
                    tAlt,
                    svgScale-0.05,
                    selectedColor
                );

                tFeature.setStyle(iconStyleTemp);

                this.olTempMarkers[dName].tempMarkerFeatures.push(tFeature);
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

            this.olTempMarkers[dName].guideLineFeature = new Feature({
                geometry: new LineString(this.olTempMarkers[dName].Coordinates),
                type: 'guideLine',
            });

            let guideLineStyle = new Style({
                stroke: new Stroke({
                    color: this.$store.state.drone_infos[dName].color + '30',
                    width: 10,
                })
            });

            this.olTempMarkers[dName].guideLineFeature.setId(dName + '-' + 'guideLine');

            this.olTempMarkers[dName].guideLineFeature.setStyle(guideLineStyle);
        },

        initOlTempMarkers() {
            this.olTempMarkers = {};

            Object.keys(this.$store.state.tempMarkers).forEach((dName) => {
                if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                    this.initOlTempMarker(dName);
                }
            });
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
    },

    mounted() {

        this.vectorSource = new VectorSource({
            features: [],
        });

        this.vectorLayer = new VectorLayer({
            source: this.vectorSource,
            style: this.styles,
        });

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

        contextmenu.on('open', (evt) => {
            console.log('open', evt);

            var feature = this.olMap.forEachFeatureAtPixel(evt.pixel, ft => ft);

            if (feature && feature.get('type') === 'tempMarker') {
                contextmenu.clear();
                removeMarkerItem.data = { marker: feature };
                contextmenu.push(removeMarkerItem);
            }
            else {
                contextmenu.clear();
                contextmenu.extend(contextmenuItems);
                contextmenu.extend(contextmenu.getDefaultItems());
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

            this.updateSource();

            // const view = this.olMap.getView();
            // view.fit(source.getExtent())

            let pnt = new Point([127.16050533784832, 37.40423134053018]).transform('EPSG:4326', 'EPSG:3857')
            let center_coordinate = pnt.getCoordinates();

            this.olMap.getView().setCenter(center_coordinate);
            this.olMap.getView().setZoom(18);
        });

        EventBus.$on('do-current-drone-position', (dName) => {
            let dLat = this.$store.state.drone_infos[dName].lat;
            let dLng = this.$store.state.drone_infos[dName].lng;
            let dAlt = this.$store.state.drone_infos[dName].alt;

            let pnt = new Point([dLng, dLat]).transform('EPSG:4326', 'EPSG:3857')
            let coordinate = pnt.getCoordinates();

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
                this.olDroneMarkers[dName].droneMarkerFeature.getStyle()[0].getImage().setScale(svgScale + (dAlt / 3000));
                this.olDroneMarkers[dName].droneMarkerFeature.getStyle()[0].getImage().setRotation(((360+this.$store.state.drone_infos[dName].heading-45-this.mapHeading)%360) * (Math.PI / 180));
                this.olDroneMarkers[dName].droneMarkerFeature.getStyle()[0].getText().setText([dAlt.toFixed(1), 'bold 11px sans-serif', '\n', 'bold 10px sans-serif', (this.$store.state.drone_infos[dName].curArmStatus === 'DISARMED') ? 'DISARMED' : '', 'bold 11px sans-serif',]);
                this.olDroneMarkers[dName].droneMarkerFeature.getStyle()[0].getText().setFill(new Fill({ color: (this.$store.state.drone_infos[dName].curArmStatus === 'DISARMED') ? 'red' : colorMapAlt[Math.round(dAlt / 10) * 10] }));
                this.olDroneMarkers[dName].droneMarkerFeature.getStyle()[1].getText().setFill(new Fill({ color: colorMapAlt[Math.round(dAlt / 10) * 10] }));
                this.olDroneMarkers[dName].droneMarkerFeature.getGeometry().setCoordinates(coordinate);

                this.olDroneMarkers[dName].headingLineFeature.getGeometry().setCoordinates([[sCoordinate[0], sCoordinate[1]], [eCoordinate[0], eCoordinate[1]]]);

                this.olDroneMarkers[dName].directionLineFeature.getStyle()[1].getImage().setRotation(-rotation);
                this.olDroneMarkers[dName].directionLineFeature.getStyle()[1].setGeometry(new Point(eDirCoordinate));
                this.olDroneMarkers[dName].directionLineFeature.getGeometry().setCoordinates([[sDirCoordinate[0], sDirCoordinate[1]], [eDirCoordinate[0], eDirCoordinate[1]]]);
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

                    this.updateOlTempMarker(dNameOld, pIndexOld);
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

        this.olMap.on('pointermove', (event) => {
            if (event.dragging) {
                return;
            }

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
            //console.log(event.pixel, event.coordinate);
            if (hovered !== undefined) {
                if(hovered.getId() !== undefined) {
                    //console.log('hovered', hovered.getId());
                    //this.$set(this, 'selectedFeature', hovered);
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
                }
                else if(this.targetedFeature.getProperties().type === 'tempMarker') {
                    let arrId = this.targetedFeature.getId().split('-');
                    let dName = arrId[0];
                    let pIndex = arrId[1];

                    this.updateTargetedTempMarker(dName, pIndex, this.targetedFeature);

                    if(dName === 'unknown') {
                        this.datum.targeted = this.$store.state.tempMarkers[dName][pIndex].targeted;
                        this.datum.lat = this.$store.state.tempMarkers[dName][pIndex].lat;
                        this.datum.lng = this.$store.state.tempMarkers[dName][pIndex].lng;
                    }
                }
                else if(this.targetedFeature.getProperties().type === 'guideLine') {

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
                }
            }
            else {
                console.log('singleclick', this.targetedFeature);

                Object.keys(this.$store.state.drone_infos).forEach((dName) => {
                    if(this.$store.state.drone_infos[dName].targeted) {
                        this.$store.state.drone_infos[dName].targeted = false;

                        this.updateTargetDroneMarker(dName);
                    }
                });

                Object.keys(this.targetedTempFeatureId).forEach((dName) => {
                    if(this.targetedTempFeatureId[dName] !== '') {
                        let pIndexOld = this.targetedTempFeatureId[dName].split('-')[1];

                        this.$store.state.tempMarkers[dName][pIndexOld].targeted = false;
                        this.targetedTempFeatureId[dName] = '';

                        this.updateOlTempMarker(dName, pIndexOld);
                    }
                });

                if (this.selectedTempFeatureId !== '') {
                    let dNameOld = this.selectedTempFeatureId.split('-')[0];
                    let pIndexOld = this.selectedTempFeatureId.split('-')[1];

                    this.$store.state.tempMarkers[dNameOld][pIndexOld].selected = false;
                    this.selectedTempFeatureId = '';

                    this.updateOlTempMarker(dNameOld, pIndexOld);

                    this.curInfoTempMarkerFlag = false;

                    this.$forceUpdate();
                }
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
            console.log('dblclick', this.selectedFeature);

            if(this.selectedFeature !== undefined && this.selectedFeature.getId() !== undefined) {
                if(this.selectedFeature.getProperties().type === 'tempMarker') {
                    let arrId = this.selectedFeature.getId().split('-');
                    let dName = arrId[0];
                    let pIndex = arrId[1];

                    this.updateSelectedTempMarker(dName, pIndex);
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

        let pnt = new Point([127.16050533784832, 37.40423134053018]).transform('EPSG:4326', 'EPSG:3857')
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
                    let ctx = canvas.getContext("2d");
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

    },

    beforeDestroy() {
        EventBus.$off('do-centerCurrentPosition');
        EventBus.$off('gcs-map-ready');
        EventBus.$off('do-centerCurrentPosition');
        EventBus.$off('do-updateTargetDroneMarker');
        EventBus.$off('do-unsetSelectedTempMarker');
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
    z-index: 2;
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
    top: 0.5em;
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
