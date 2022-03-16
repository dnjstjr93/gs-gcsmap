<template>
    <div>
        <v-row no-gutters>
            <v-col cols="12">
                <v-card flat tile class="info_markers" v-if="curFlagMarker">
                    <InfoMarker v-model="curFlagMarker"
                                :marker-name="curNameMarker"
                                :marker-index="curIndexMarker"
                                :marker="curSelectedMarker"
                                :targets="curTargets"
                    ></InfoMarker>
                </v-card>
                <v-card flat tile class="context-menu" :style="{top:context.top + 'px',left:context.left+'px'}"
                        v-if="context_flag"
                >
                    <v-btn tile @click="confirmAddTempMarker" elevation="2" color="success">마커생성</v-btn>
                    <v-btn tile @click="confirmAddSurveyMarker" elevation="2" color="warning">Survey생성</v-btn>
                    <v-btn tile @click="cancelMarker" elevation="2" color="error">취소</v-btn>
                </v-card>
                <v-card>
                    <GmapMap ref="mapRef" :center="center"
                             :zoom="18"
                             map-type-id="satellite"
                             :restriction="{
                                 strictBounds: false,
                             }"
                             :style="myGcsStyle"
                             :options="{disableDefaultUI: true, gestureHandling: 'auto', disableDoubleClickZoom: true, minZoom: 3, maxZoom: 30}"
                             @click="printPosClick"
                             @dblclick="addingMarker"
                             @dragstart="cancelMarker"
                    >
<!--                        <GmapMarker-->
<!--                                :position="{lat: 37.40423134053018, lng: 127.16050533784832}"-->
<!--                                :clickable="true"-->
<!--                                :draggable="false"-->
<!--                                :icon="defaultDroneIcon"-->
<!--                                :label="defaultDroneLabel"-->
<!--                        />-->

                        <GmapMarker
                            v-for="(d, dIndex) in droneMarkers" :key="'targetDroneMarker_'+dIndex"
                            :position="{lat: d.lat, lng: d.lng}"
                            :clickable="true"
                            :draggable="false"
                            :icon="d.icon"
                            :label="d.label"
                            @click="targetDroneMarker($event, d, dIndex)"
                            :title="d.name"
                        />

                        <GmapMarker
                            v-for="(p, pIndex) in planeMarkers" :key="'targetPlaneMarker_'+pIndex"
                            :position="{lat: p.lat, lng: p.lng}"
                            :clickable="false"
                            :draggable="false"
                            :icon="p.icon"
                            :label="p.label"
                            @click="targetPlaneMarker($event, p, pIndex)"
                            :title="p.name"
                        />

<!--                        <div v-for="(m, mIndex) in gotoMarkers" :key="mIndex">-->
<!--                            <GmapMarker-->
<!--                                    v-for="(pos, pIndex) in m.positions"-->
<!--                                    :key="pIndex"-->
<!--                                    :position="pos"-->
<!--                                    :clickable="true"-->
<!--                                    :draggable="true"-->
<!--                                    @click="center=pos"-->
<!--                                    @dragend="updatePosition($event, mIndex, pIndex)"-->
<!--                                    :icon="m.m_icon"-->
<!--                                    :label="pos.m_label"-->
<!--                                    title="goto"-->
<!--                            />-->
<!--                        </div>-->

                        <!--                  icon="google.com/mapfiles/ms/micons/yellow.png"-->
                        <!--                      :icon="{ url: require('../assets/black-24dp/2x/outline_room_black_24dp.png')}"-->

                        <div v-if="readyFlagGcsMap">
<!--                            <div v-for="(pName, mIndex) in tempMarkers" :key="'targetTempMarker_'+mIndex">-->
<!--                                <GmapMarker-->
<!--                                        v-for="(pos, pIndex) in pName" :key="pIndex"-->
<!--                                        :position="{lat:pos.lat, lng:pos.lng}"-->
<!--                                        :clickable="true"-->
<!--                                        :draggable="true"-->
<!--                                        @dblclick="selectTempMarker($event, mIndex, pIndex)"-->
<!--                                        @click="targetTempMarker($event, mIndex, pIndex)"-->
<!--                                        @dragend="updateTempPosition($event, mIndex, pIndex)"-->
<!--                                        :icon="pos.m_icon"-->
<!--                                        :label="pos.m_label"-->
<!--                                        :title="mIndex  + ':' + pos.alt  + ':' + pos.speed  + ':' + pos.radius"-->
<!--                                />-->
<!--                            </div>-->

                            <GmapMarker
                                v-for="(pos, pIndex) in $store.state.tempMarkers.unknown" :key="'marker'+pIndex"
                                :position="{lat:pos.lat, lng:pos.lng}"
                                :clickable="true"
                                :draggable="true"
                                @dblclick="selectTempMarker($event, 'unknown', pIndex)"
                                @click="targetTempMarker($event, 'unknown', pIndex, pos.targeted)"
                                @dragend="updateTempPosition($event, 'unknown', pIndex)"
                                :icon="pos.m_icon"
                                :label="pos.m_label"
                                :title="'unknown'  + ':' + pos.alt  + ':' + pos.speed  + ':' + pos.radius"
                            />

                            <div v-for="(survey, pIndex) in $store.state.surveyMarkers.unknown" :key="'survey'+pIndex">
                                <GmapPolygon
                                    :paths="survey.paths"
                                    :options="survey.options"
                                    @paths_changed="showNewRect($event, 'unknown', pIndex)"
                                    @dragend="updataPolygon($event, 'unknown')"
                                />
                                <GmapPolyline
                                    :path.sync="survey.pathLines"
                                    :options="{strokeColor: survey.color, strokeOpacity: 0.9, strokeWeight: 2, zIndex: 1}"
                                />
                            </div>


                            <div v-for="drone in $store.state.drone_infos" :key="'guideCircles_'+drone.id">
                                <div v-if="drone.selected">
                                    <GmapPolyline
                                        :path.sync="$store.state.trackingLines[drone.name]"
                                        :options="trackingLineOptions"
                                    ></GmapPolyline>

                                    <GmapPolyline
                                        :path.sync="gotoLines[drone.name]"
                                        :options="gotoLinesOptions[drone.name]"
                                    ></GmapPolyline>

                                    <div v-for="(pos, pIndex) in $store.state.tempMarkers[drone.name]" :key="'marker'+pIndex">
                                        <GmapMarker
                                            :position="{lat:pos.lat, lng:pos.lng}"
                                            :clickable="true"
                                            :draggable="true"
                                            @dblclick="selectTempMarker($event, drone.name, pIndex)"
                                            @click="targetTempMarker($event, drone.name, pIndex, pos.targeted)"
                                            @dragend="updateTempPosition($event, drone.name, pIndex)"
                                            :icon="pos.m_icon"
                                            :label="pos.m_label"
                                            :title="drone.name  + ':' + pos.alt  + ':' + pos.speed  + ':' + pos.radius"
                                        />

                                      <div v-if="$store.state.tempMarkers[drone.name][pIndex].type === 'Circle'">
                                        <GmapCircle
                                            :center="{lat: $store.state.tempMarkers[drone.name][pIndex].lat, lng: $store.state.tempMarkers[drone.name][pIndex].lng}"
                                            :radius="50"
                                            :options="{fillOpacity: 0, strokeColor: '#D50000', strokeOpacity: 1, strokeWeight: 1}"
                                        ></GmapCircle>
                                      </div>
                                    </div>

<!--                                    home_position circle-->
                                    <GmapCircle
                                        :center="{lat: drone.home_position.lat, lng: drone.home_position.lng}"
                                        :radius="3"
                                        :options="{fillOpacity: 1, fillColor: drone.color, strokeColor: drone.color, strokeOpacity: 1, strokeWeight: 1}"
                                    ></GmapCircle>

                                    <GmapCircle
                                        :center="{lat: drone.home_position.lat, lng: drone.home_position.lng}"
                                        :radius="500"
                                        :options="{fillOpacity: 0, fillColor: drone.color, strokeColor: drone.color, strokeOpacity: 0.15, strokeWeight: 6}"
                                        @dblclick="addingMarker"
                                        @click="printPosClick"
                                    ></GmapCircle>

<!--                                    drone circle -->
                                    <GmapCircle
                                            :center="{lat: drone.lat, lng: drone.lng}"
                                            :radius="2"
                                            :options="{fillOpacity: 0, strokeColor: '#D50000', strokeOpacity: 1, strokeWeight: 1, zIndex: 0}"
                                    ></GmapCircle>

                                    <GmapCircle
                                            :center="{lat: drone.lat, lng: drone.lng}"
                                            :radius="5"
                                            :options="{fillOpacity: 0, strokeColor: '#FF5252', strokeOpacity: 0.8, strokeWeight: 1, zIndex: 0}"
                                    ></GmapCircle>

                                    <GmapCircle
                                            :center="{lat: drone.lat, lng: drone.lng}"
                                            :radius="10"
                                            :options="{fillOpacity: 0, strokeColor: '#FFCDD2', strokeOpacity: 0.6, strokeWeight: 1, zIndex: 0}"
                                    ></GmapCircle>

                                    <GmapCircle
                                        :center="{lat: drone.lat, lng: drone.lng}"
                                        :radius="100"
                                        :options="{fillOpacity: 0, fillColor: drone.color, strokeColor: drone.color, strokeOpacity: 0.15, strokeWeight: 6, zIndex: 0}"
                                        @dblclick="addingMarker"
                                        @click="printPosClick"
                                    ></GmapCircle>


                                    <!--                                    <GmapCircle-->
<!--                                            :center="{lat: drone.lat, lng: drone.lng}"-->
<!--                                            :radius="100"-->
<!--                                            :options="{fillOpacity: 0, strokeColor: drone.color, strokeOpacity: 0.15, strokeWeight: 6}"-->
<!--                                            @dblclick="addingMarker"-->
<!--                                    ></GmapCircle>-->

<!--                                    <GmapCircle-->
<!--                                            :center="{lat: drone.lat, lng: drone.lng}"-->
<!--                                            :radius="250"-->
<!--                                            :options="{fillOpacity: 0, strokeColor: drone.color, strokeOpacity: 0.6, strokeWeight: 1}"-->
<!--                                    ></GmapCircle>-->
                                    <GmapPolyline
                                        :path.sync="drone.headingLine"
                                        :options="{strokeColor: drone.color, strokeOpacity: 0.9, strokeWeight: 2, zIndex: 1}"
                                    ></GmapPolyline>

                                    <GmapPolyline
                                        :path.sync="drone.directionLine"
                                        :options="{strokeColor: drone.color, strokeOpacity: 0.95, strokeWeight: 5, zIndex: 5, icons: [{icon: lineArrow, offset: '100%'}]}"
                                    ></GmapPolyline>
                                </div>
                            </div>

                            <div v-for="(circle, dName) in boundaryCircles" :key="'boundaryCircles_'+dName">
                                <div v-if="$store.state.drone_infos[dName].selected">
                                    <GmapCircle
                                        :center="circle"
                                        :radius="circle.radius"
                                        :options="circle.options"
                                        @dblclick="addingMarker"
                                        @click="printPosClick"
                                    ></GmapCircle>
                                </div>
                            </div>

                            <div v-for="(line, dName) in $store.state.targetLines" :key="'targetLines_'+dName">
                                <div v-if="$store.state.drone_infos[dName].selected">
                                    <GmapPolyline
                                        :path.sync="line.path"
                                        :options="line.options"
                                    ></GmapPolyline>
                                </div>
                            </div>

                            <div v-for="(line, dName) in $store.state.missionLines" :key="'missionLines_'+dName">
                                <div v-if="$store.state.drone_infos[dName].selected">
                                    <GmapPolyline
                                        :path.sync="line.path"
                                        :options="line.options"
                                    ></GmapPolyline>
                                </div>
                            </div>

                            <div v-for="(circle, dName) in $store.state.targetCircles" :key="'targetCircles_'+dName">
                                <div v-if="$store.state.drone_infos[dName].selected">
                                    <GmapCircle
                                        :center="circle"
                                        :radius="circle.radius"
                                        :options="circle.options"
                                    ></GmapCircle>
                                </div>
                            </div>

                            <div v-for="(circle, dName) in $store.state.missionCircles" :key="'missionCircles_'+dName">
                                <div v-if="$store.state.drone_infos[dName].selected">
                                    <GmapCircle
                                        :center="circle"
                                        :radius="circle.radius"
                                        :options="circle.options"
                                    ></GmapCircle>
                                </div>
                            </div>
                        </div>
                    </GmapMap>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script src="../../../gmap/src/main.js"></script>

<script>

    import InfoMarker from "./InfoMarker";
    import EventBus from "@/EventBus";
    import {nanoid} from "nanoid";
    import {gmapApi} from 'vue2-google-maps';
    import axios from "axios";

    var curElevationVal = 0;

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

    export default {
        name: 'GcsMap',

        props: [
            'drones'
        ],

        components: {
            InfoMarker
        },

        data () {
            return {
                idUpdateTimer: null,
                blueCoords: [
                    { lat: 25.774, lng: -60.19 },
                    { lat: 18.466, lng: -46.118 },
                    { lat: 32.321, lng: -44.757 },
                ],
                blueCoordsOptions: {
                    strokeColor: "#0000FF",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#0000FF",
                    fillOpacity: 0.35,
                    draggable: true,
                    geodesic: false,
                    editable: true,
                    zIndex: 5,
                },

                lineArrow: null,
                curElevation: 0,
                zoom: 18,
                curFlagMarker: false,
                curSelectedMarker: {},
                curIndexMarker: 0,
                curNameMarker: 'unknown',
                colorIndex: 0,
                context: {
                    left: 200,
                    top: 200
                },
                click_x: 0,
                click_y: 0,
                click_lat: 0,
                click_lng: 0,
                context_flag: false,
                gotoLines: {},
                gotoLinesOptions: {},
//                targetLines: {},
//                targetLinesOptions: {},
                movingLines: {},
                movingLinesOptions: {},
                lines: [],
                center: {
                    lat: 37.40423134053018,
                    lng: 127.16050533784832
                },
                curTargets: [],
                myHeight: window.innerHeight-50,
                myWidth: window.innerWidth,
                readyFlagGcsMap: false,
                droneMarkers: {},
                planeMarkers: {},

                map: null,
                // targetCirclesOptions: {},

                trackingLineOptions: {
                    strokeColor: '#FF6D00',
                    strokeOpacity: 0.9,
                    strokeWeight: 2,
                    zIndex: 0
                },

                boundaryCircles: {},
                curBoundaryRadius: 100,

                preADSB: {},
                count: {},

                // missionCirclesOptions: {
                //     strokeColor: 'amber',
                //     strokeOpacity: 0.8,
                //     strokeWeight: 5
                // }

                client: {
                    connected: false,
                    loading: false
                },
                connection: {
                    host: this.$store.state.VUE_APP_MOBIUS_HOST,
                    port: 8883,
                    endpoint: '',
                    clean: true,
                    connectTimeout: 4000,
                    reconnectPeriod: 4000,
                    clientId: 'GcsMap' + nanoid(15),
                    username: 'keti_muv',
                    password: 'keti_muv',
                },
                broadcast_gcsmap_topic: '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/gcsmap',
            }
        },

        watch: {
            zoom: function (newVal) {
                console.log('zoom', newVal);
            },

            gotoMarkers: {
                deep: true,
                handler: function (newVal) {
                    console.log(newVal);

                    newVal.forEach((marker, mIndex) => {
                        this.lines[mIndex] = [];
                        marker.positions.forEach((pos) => {
                            this.lines[mIndex].push(pos);
                        });
                    });
                }
            },

            ['$store.state.tempMarkers']: {
                deep: true,
                handler: function (newVal) {
                    console.log('watch-tempMakers', newVal);

                    this.gotoLines = {};
                    for (let pName in newVal) {
                        if(Object.prototype.hasOwnProperty.call(newVal, pName)) {
                            if (pName !== 'unknown') {
                                console.log('***************************************************', newVal)
                                newVal[pName].forEach((pos) => {
                                    if (!Object.prototype.hasOwnProperty.call(this.gotoLines, pName)) {
                                        this.gotoLines[pName] = null;
                                        this.gotoLines[pName] = [];
                                        this.gotoLinesOptions[pName] = null;
                                        this.gotoLinesOptions[pName] = {};

                                        let _options = {};
                                        _options.strokeColor = pos.m_icon.fillColor;
                                        _options.strokeOpacity = 0.2;
                                        _options.strokeWeight = 10;

                                        this.gotoLinesOptions[pName] = JSON.parse(JSON.stringify(_options));
                                    }

                                    this.gotoLines[pName].push(pos);
                                });
                            }
                        }
                    }

                    this.curTargets = [];
                    for(var dName in this.$store.state.drone_infos) {
                        if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                            if(dName === 'unknown') {
                                this.curTargets.push(dName);
                            }
                            else {
                                if(this.$store.state.drone_infos[dName].selected) {
                                    this.curTargets.push(dName);
                                }
                            }
                        }
                    }

                    //this.curTargets = Object.keys(this.$store.state.drone_infos);

                    console.log('curTargets', this.curTargets);

                    // newVal.positions.forEach((pos) => {
                    //     if(pos.selected) {
                    //         pos.m_icon.strokeWeight = 7;
                    //     }
                    //     else {
                    //         pos.m_icon.strokeWeight = 1;
                    //     }
                    // });
                    //

                    this.$forceUpdate();
                }
            },

            curFlagMarker: function (newVal, oldVal) {
                if(oldVal) {
                    console.log('curFlagMarker', oldVal, '->', newVal);
                    this.$store.commit('setAllTempMarker', false);
                }
            },
        },

        computed: {
            gotoMarkers() {
                return (this.$store.state.gotoMarkers);
            },
            // tempMarkers() {
            //     return (this.$store.state.tempMarkers);
            // },
            defaultDroneIcon() {
                return (this.$store.state.defaultDroneIcon);
            },
            defaultDroneLabel() {
                return (this.$store.state.defaultDroneLabel);
            },
            defaultPlaneIcon() {
                return (this.$store.state.defaultPlaneIcon);
            },
            myGcsStyle() {
                return ("width: " + window.innerWidth + "px'" + "; height: " + (this.myHeight) + 'px')
            },

            google: gmapApi,
        },

        methods: {
            line_intersect(x1, y1, x2, y2, x3, y3, x4, y4)
            {
                var ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
                if (denom === 0) {
                    return null;
                }

                ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
                ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;

                var rx = x1 + ua * (x2 - x1);
                var ry = y1 + ua * (y2 - y1);



                var check_count = 0;
                if((x1 < rx && rx < x2) || (x1 > rx && rx > x2)) {
                    console.log(x1, rx, x2);
                    check_count++;
                }

                else if((x3 < rx && rx < x3) || (x3 > rx && rx > x4)) {
                    check_count++;
                    console.log(x3, rx, x4);
                }

                if((y1 < ry && ry < y2) || (y1 > ry && ry > y2)) {
                    check_count++;
                    console.log(y1, ry, y2);
                }
                else if((y3 < ry && ry < y3) || (y3 > ry && ry > y4)) {
                    check_count++;
                    console.log(y3, ry, y4);
                }

                if(check_count >= 2) {
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

            showNewRect(e, dName, pIndex) {
                this.$store.state.surveyMarkers[dName][pIndex].paths = [];
                for(let idx in e.Fd[0].Fd) {
                    if(Object.prototype.hasOwnProperty.call(e.Fd[0].Fd, idx)) {
                        this.$store.state.surveyMarkers[dName][pIndex].paths.push({lat: e.Fd[0].Fd[idx].lat(), lng: e.Fd[0].Fd[idx].lng()});
                    }
                }

                if(this.idUpdateTimer !== null) {
                    clearTimeout(this.idUpdateTimer);
                }

                this.idUpdateTimer = setTimeout((dName) => {
                    this.$store.state.surveyMarkers[dName][pIndex].color = 'orange';

                    let center = this.getCenterPoly(this.$store.state.surveyMarkers[dName][pIndex].paths);

                    this.$store.state.surveyMarkers[dName][pIndex].center = center;
                    this.$store.state.surveyMarkers[dName][pIndex].pathLines = [];
                    this.$store.state.surveyMarkers[dName][pIndex].pathLines.push(center);

                    var nextPoint = {lat: center.lat, lon: center.lng};
                    var prevPoint = {lat: center.lat, lon: center.lng};

                    let dir = this.$store.state.surveyMarkers[dName][pIndex].dir;
                    // let gap = this.$store.state.surveyMarkers[dName][pIndex].gap;
                    let gap = 20;
                    let iter = 0;
                    let angle = 0;
                    while (iter++ < 10) {
                        if(iter === 3) {
                            if(dir === 'cw') {
                                angle += 90;
                            }
                        }
                        else if(iter === 4) {
                            if(dir === 'cw') {
                                angle += 90;
                            }
                        }

                        nextPoint = get_point_dist(nextPoint.lat, nextPoint.lon, (gap/1000), angle);

                        let intersectPoint = this.line_intersect(prevPoint.lat, prevPoint.lon,
                            nextPoint.lat, nextPoint.lon,
                            this.$store.state.surveyMarkers[dName][pIndex].paths[0].lat, this.$store.state.surveyMarkers[dName][pIndex].paths[0].lng,
                            this.$store.state.surveyMarkers[dName][pIndex].paths[1].lat, this.$store.state.surveyMarkers[dName][pIndex].paths[1].lng,
                        );

                        console.log(iter, intersectPoint);

                        prevPoint = {lat: nextPoint.lat, lon: nextPoint.lon};

                        this.$store.state.surveyMarkers[dName][pIndex].pathLines.push({lat: nextPoint.lat, lng: nextPoint.lon});
                    }

                    this.postEachSurveyMarkerInfo(dName);

                }, 1000, dName);
            },

            updataPolygon(e, dName) {
                console.log('############', 'Polygon dragend', e, dName);
            },

            displayLocationElevation(location, elevator, onResult) {
                // Initiate the location request
                elevator
                    .getElevationForLocations({
                        locations: [location],
                    })
                    .then(({ results }) => {
                        if (results[0]) {
                            // Open the infowindow indicating the elevation at the clicked position.
                            console.log(
                                "The elevation at this point is " +
                                results[0].elevation +
                                " meters."
                            );

                            onResult(results[0].elevation);
                        }
                        else {
                            console.log("No results found");
                        }
                    })
                    .catch((e) => {
                        console.log(location, "Elevation service failed due to: " + e);
                        onResult(0);
                    });
            },

            onResize() {
                this.myWidth = this.$refs.mapRef.clientWidth;
                this.myHeight = window.innerHeight-50;

                //console.log(this.myHeight);
            },

            drawBoundaryCircles(radius) {
                for(let name in this.$store.state.drone_infos) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                        if(this.$store.state.drone_infos[name].selected) {
                            if(!Object.hasOwnProperty.call(this.boundaryCircles,  name)) {
                                this.boundaryCircles[name] = {};
                            }
                            else {
                                delete this.boundaryCircles[name];
                                this.boundaryCircles[name] = {};
                            }

                            this.boundaryCircles[name].lat = this.$store.state.drone_infos[name].lat;
                            this.boundaryCircles[name].lng = this.$store.state.drone_infos[name].lng;
                            this.boundaryCircles[name].radius = radius;
                            this.boundaryCircles[name].options = {
                                strokeColor: this.$store.state.drone_infos[name].color,
                                fillOpacity: 0,
                                strokeOpacity: 0.15,
                                strokeWeight: 6,
                            };
                        }
                    }
                }
            },

            createEachTempMarkerInfoToMobius(dName, callback) {
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
                    function (res) {
                        callback(res.status, '');
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
            },

            confirmAddTempMarker() {
                this.context_flag = false;

                if(!Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers, 'unknown')) {
                    this.$store.state.tempMarkers.unknown = [];

                    this.createEachTempMarkerInfoToMobius('unknown', () => {
                        console.log('createEachTempMarkerInfoToMobius', 'unknown');
                    });
                }

                const elevator = new this.google.maps.ElevationService();

                console.log('elevation-confirmAddTempMarker', this.$store.state.tempMarkers);
                let lat = this.click_lat;
                let lng = this.click_lng;

                this.displayLocationElevation({lat:lat, lng:lng}, elevator, (val) => {
                    console.log('__________________________________confirmAddTempMarker', 'curElevation', val);

                    let marker = JSON.parse(JSON.stringify(this.$store.state.defaultPosition));
                    marker.lat = this.click_lat;
                    marker.lng = this.click_lng;
                    marker.alt = 20;
                    marker.speed = 5;
                    marker.radius = 50;
                    marker.turningSpeed = 10;
                    marker.targetMavCmd = 16;
                    marker.targetStayTime = 1;
                    marker.elevation = val;
                    marker.type = 'Goto';
                    marker.m_icon.fillColor = 'grey';
                    marker.m_label.fontSize = '14px';
                    marker.m_label.text = 'T:' + String(marker.alt);
                    marker.type = 0;

                    this.$store.state.tempMarkers.unknown.push(marker);

                    this.doBroadcastAddMarker(JSON.parse(JSON.stringify(marker)));

                    marker = null;

                    axios({
                        validateStatus: function (status) {
                            // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                            return status < 500;
                        },
                        method: 'post',
                        url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/MarkerInfos/unknown',
                        headers: {
                            'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                            'X-M2M-Origin': 'SVue',
                            'Content-Type': 'application/json;ty=4'
                        },
                        data: {
                            'm2m:cin': {
                                con: this.$store.state.tempMarkers.unknown
                            }
                        }
                    }).then(
                        function (res) {
                            console.log('++++++++ confirmAddTempMarker-axios', res.data);
                        }
                    ).catch(
                        function (err) {
                            console.log(err.message);
                        }
                    );

                    this.$store.state.adding = false;
                });

                // let payload = {};
                // payload.pName = 'unknown';
                // payload.lat = this.click_lat;
                // payload.lng = this.click_lng;
                // payload.alt = 20;
                // payload.speed = 5;
                // payload.radius = 250;
                // payload.turningSpeed = 10;
                // payload.targetMavCmd = 16;
                // payload.targetStayTime = 1;
                // payload.color = 'grey';
                // payload.elevation = 0;
                // payload.type = 'Goto';
                // this.$store.commit('setDroneColorMap', payload); //JSON.parse(JSON.stringify(payload)));
                //
                // this.$store.commit('addingTempMarker', payload);
                //
                // // const elevator = new this.google.maps.ElevationService();
                //
                // console.log('elevation-confirmAddTempMarker', this.$store.state.tempPayload);
                // let lat = this.$store.state.tempPayload.lat;
                // let lng = this.$store.state.tempPayload.lng;
                //
                // this.displayLocationElevation({lat:lat, lng:lng}, this.elevator, (val) => {
                //     console.log('curElevation', val);
                //
                //     this.$store.state.tempPayload.elevation = val;
                //     this.$store.state.tempPayload.type = 0;
                //
                //     this.$store.commit('confirmAddTempMarker', false);
                //
                //     this.doBroadcastAddMarker(this.$store.state.tempPayload);
                // });
            },

            createEachSurveyMarkerInfoToMobius(dName, callback) {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'post',
                    url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/SurveyMarkerInfos',
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
                    function (res) {
                        callback(res.status, '');
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
            },

            postEachSurveyMarkerInfo(dName) {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'post',
                    url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/SurveyMarkerInfos/' + dName,
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'SVue',
                        'Content-Type': 'application/json;ty=4'
                    },
                    data: {
                        'm2m:cin': {
                            con: this.$store.state.surveyMarkers[dName]
                        }
                    }
                }).then(
                    function (res) {
                        console.log('++++++++ confirmAddSurveyMarker-axios', res.data);
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
            },

            getCenterPoly(paths) {
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

                return ({lat: (polyLatMin+polyLatMax)/2, lng: (polyLngMin+polyLngMax)/2});
            },

            confirmAddSurveyMarker() {
                this.context_flag = false;

                if(!Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers, 'unknown')) {
                    this.$store.state.surveyMarkers.unknown = [];

                    this.createEachSurveyMarkerInfoToMobius('unknown', () => {
                        console.log('createEachSurveyMarkerInfoToMobius', 'unknown');
                    });
                }

                const elevator = new this.google.maps.ElevationService();

                console.log('elevation-confirmAddSurveyMarker', this.$store.state.surveyMarkers);
                let lat = this.click_lat;
                let lng = this.click_lng;

                let paths = [];
                paths.push({lat: lat, lng: lng});
                let pointU = get_point_dist(lat, lng, 0.1, 0);
                paths.push({lat: pointU.lat, lng: pointU.lon});
                let pointUL = get_point_dist(pointU.lat, pointU.lon, 0.1, -90);
                paths.push({lat: pointUL.lat, lng: pointUL.lon});
                let pointL = get_point_dist(lat, lng, 0.1, -90);
                paths.push({lat: pointL.lat, lng: pointL.lon});

                let center = this.getCenterPoly(paths);

                this.$store.state.surveyMarkers[dName][pIndex].center = center;
                this.$store.state.surveyMarkers[dName][pIndex].pathLines = [];
                this.$store.state.surveyMarkers[dName][pIndex].pathLines.push(center);

                //let dir = this.$store.state.surveyMarkers[dName][pIndex].dir;
                let gap = this.$store.state.surveyMarkers[dName][pIndex].gap;

                let nextPoint = {lat: center.lat, lon: center.lng};

                let iter = 0;
                while (iter++ < 10) {
                    nextPoint = get_point_dist(nextPoint.lat, nextPoint.lon, (gap/1000), 0);
                    this.$store.state.surveyMarkers[dName][pIndex].pathLines.push({lat: nextPoint.lat, lng: nextPoint.lon});
                }

                this.blueCoords = JSON.parse(JSON.stringify(paths));

                //this.displayLocationElevation({lat:lat, lng:lng}, elevator, (val) => {
                    //console.log('__________________________________confirmAddSurveyMarker', 'curElevation', val);

                    let survey = JSON.parse(JSON.stringify(this.$store.state.defaultPosition));
                    survey.lat = this.click_lat;
                    survey.lng = this.click_lng;
                    survey.alt = 20;
                    survey.speed = 5;
                    survey.radius = 50;
                    survey.turningSpeed = 10;
                    survey.targetMavCmd = 16;
                    survey.targetStayTime = 1;
                    // survey.elevation = val;
                    survey.type = 'Survey';
                    survey.color = 'orange';
                    survey.m_icon.fillColor = 'grey';
                    survey.m_label.fontSize = '14px';
                    survey.m_label.text = 'T:' + String(survey.alt);
                    survey.type = 0;
                    survey.paths = JSON.parse(JSON.stringify(paths));
                    survey.options = {
                        strokeColor: "#0000FF",
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: "#0000FF",
                        fillOpacity: 0.35,
                        draggable: true,
                        geodesic: false,
                        editable: true,
                        zIndex: 6,
                    }

                    this.$store.state.surveyMarkers.unknown.push(survey);

                    this.doBroadcastAddSurveyMarker(JSON.parse(JSON.stringify(survey)));

                    survey = null;

                    this.postEachSurveyMarkerInfo('unknown');

                    this.$store.state.adding = false;
                //});
            },

            cancelMarker() {
                this.context_flag = false;

                this.$store.commit('cancelTempMarker', false);
            },

            addingMarker(e) {
                //this.drawBoundaryCircles(100);

                //this.curBoundaryRadius = 1;

                // for(let dName in this.boundaryCircles) {
                //     if (Object.prototype.hasOwnProperty.call(this.boundaryCircles, dName)) {
                //         this.boundaryCircles[dName].radius = this.curBoundaryRadius;
                //     }
                // }
                //
                // let temp = JSON.parse(JSON.stringify(this.boundaryCircles));
                // delete this.boundaryCircles;
                // this.boundaryCircles = null;
                // this.boundaryCircles = JSON.parse(JSON.stringify(temp));

                console.log(e);

                this.cancelMarker();

                console.log(e);
                console.log('click-pos', e.latLng.lat(), e.latLng.lng());
                //this.center = {lat: e.latLng.lat(), lng: e.latLng.lng()};

                this.click_x = e.domEvent.clientX;
                this.click_y = e.domEvent.clientY-50;

                this.click_lat = e.latLng.lat();
                this.click_lng = e.latLng.lng();

                console.log('pixel', e.domEvent.clientX, e.domEvent.clientY-50);

                this.context.left = e.domEvent.clientX;
                this.context.top = e.domEvent.clientY-50;

                console.log('context', this.context);

                this.context_flag = true;

                this.curFlagMarker = false;
                //this.$store.commit('setAllTempMarker', false);

                // console.log('addingMarker', e.domEvent);
                //
                // e.domEvent.preventDefault();
                //
                // e.domEvent.cancelBubble = true;
                //
                // console.log('addingMarker', e.domEvent);
                //
                // e.domEvent.stopPropagation();


                // return false;
            },

            printPosClick(e) {
                console.log(e);
                console.log('click-pos', e.latLng.lat(), e.latLng.lng());

                //this.center = {lat: e.latLng.lat(), lng: e.latLng.lng()};

                this.click_x = e.domEvent.clientX;
                this.click_y = e.domEvent.clientY-50;

                console.log('pixel', e.domEvent.clientX, e.domEvent.clientY-50)

                this.context.left = e.domEvent.clientX;
                this.context.top = e.domEvent.clientY-50;

                console.log('context', this.context);

                this.curFlagMarker = false;
                //this.$store.commit('setAllTempMarker', false);

                this.cancelMarker();
            },
            updatePosition(e, mIndex, pIndex) {
                let payload = {};
                payload.mIndex = mIndex;
                payload.pIndex = pIndex;
                payload.lat = e.latLng.lat();
                payload.lng = e.latLng.lng();

                this.$store.commit('updatePosition', payload);

                //      this.$forceUpdate();
            },

            // f_icon(mIndex) {
            //     let payload = {};
            //     payload.mIndex = mIndex;
            //     payload.fillColor = this.markerColor[(mIndex % 10)];
            //
            //     this.$store.commit('updateFillColor', payload);
            //
            //     //      this.$forceUpdate();
            //
            // },
            //
            // f_label(mIndex, pIndex) {
            //     let payload = {};
            //     payload.mIndex = mIndex;
            //     payload.pIndex = pIndex;
            //     payload.text = String(pIndex);
            //
            //     this.$store.commit('updateLabelText', payload);
            //
            //     //   this.$forceUpdate();
            // },

            updateTempPosition(e, pName, pIndex) {
                if(!this.$store.state.adding) {
                    const elevator = new this.google.maps.ElevationService();

                    if(!Object.hasOwnProperty.call(this.$store.state.tempMarkers[pName][pIndex], 'elevation')) {
                        this.$store.state.tempMarkers[pName][pIndex].elevation = 0;
                    }

                    let lat = e.latLng.lat();
                    let lng = e.latLng.lng();
                    this.displayLocationElevation({lat:lat, lng:lng}, elevator, (val) => {
                        console.log('__________________________________updateTempPosition', 'curElevation', val);

                        let payload = {};
                        payload.pName = pName;
                        payload.pIndex = pIndex;
                        payload.lat = lat;
                        payload.lng = lng;
                        payload.value = false;

                        this.$store.state.tempMarkers[pName][pIndex].elevation = val;
                        this.$store.state.tempMarkers[pName][pIndex].selected = false;

                        this.targetTempMarker('', pName, pIndex, true);

                        this.$store.commit('updateTempPosition', payload);

                        this.$store.state.didIPublish = true;

                        this.drawLineTarget(payload);

                        this.doBroadcastTempPosition(payload);

                        // this.selectTempMarker(e, pName, pIndex);

                        // this.$store.commit('saveCurrentDroneInfos');

                        EventBus.$emit('on-update-infomarker');
                    });
                }
            },

            selectTempMarker(e, pName, pIndex) {
                if(!this.$store.state.adding) {
                    console.log('selectTempMarker - pName', pName);
                    console.log('selectTempMarker - pIndex', pIndex);

                    let selected = !this.$store.state.tempMarkers[pName][pIndex].selected;

                    this.$store.commit('setAllTempMarker', false);

                    let payload = {};

                    if (selected) {
                        payload.pName = pName;
                        payload.pIndex = pIndex;
                        payload.value = selected;
                        this.$store.commit('setTempMarker', payload);

                        if(!Object.hasOwnProperty.call(this.$store.state.tempMarkers[pName][pIndex], 'elevation')) {
                            this.$store.state.tempMarkers[pName][pIndex].elevation = 0;
                        }

                        const elevator = new this.google.maps.ElevationService();

                        console.log('selected-tempMarkers', this.$store.state.tempMarkers[pName][pIndex]);
                        let lat = this.$store.state.tempMarkers[pName][pIndex].lat;
                        let lng = this.$store.state.tempMarkers[pName][pIndex].lng;

                        this.displayLocationElevation({lat:lat, lng:lng}, elevator, (val) => {
                            console.log('__________________________________selectTempMarker', 'curElevation', val);

                            this.$store.state.tempMarkers[pName][pIndex].elevation = val;

                            if (!Object.hasOwnProperty.call(this.$store.state.tempMarkers[pName][pIndex], 'targetStayTime')) {
                                this.$store.state.tempMarkers[pName][pIndex].targetStayTime = 1;
                            }
                            else {
                                if(isNaN(this.$store.state.tempMarkers[pName][pIndex].targetStayTime)) {
                                    this.$store.state.tempMarkers[pName][pIndex].targetStayTime = 1;
                                }
                            }

                            if (!Object.hasOwnProperty.call(this.$store.state.tempMarkers[pName][pIndex], 'targetMavCmd')) {
                                this.$store.state.tempMarkers[pName][pIndex].targetMavCmd = 16;
                            }

                            this.curSelectedMarker = this.$store.state.tempMarkers[pName][pIndex];
                            this.curIndexMarker = pIndex;
                            this.curNameMarker = pName;
                            this.curFlagMarker = true;

                            console.log('curSelectedMarker', pName, pIndex, this.$store.state.tempMarkers[pName][pIndex]);
                        });
                    }
                    else {
                        this.curFlagMarker = false;
                    }

                    console.log('select', this.$store.state.tempMarkers[pName][pIndex].selected)

                    this.$forceUpdate();
                }
            },

            targetTempMarker(e, pName, pIndex, _targeted) {
                if(!this.$store.state.adding) {
                    console.log('targetTempMarker - pName', pName, 'pIndex', pIndex);

                    if(!this.$store.state.tempMarkers[pName][pIndex].selected) {

                        let targeted = !_targeted;
                        let payload = {};
                        payload.pName = pName;
                        payload.pIndex = pIndex;
                        payload.value = false;
                        this.$store.commit('setTargetAllTempMarker', payload);

                        if (targeted) {
                            payload.pName = pName;
                            payload.pIndex = pIndex;
                            payload.value = targeted;
                            this.$store.commit('setTargetTempMarker', payload);
                        }

                        EventBus.$emit('do-selected-position', payload);
                        EventBus.$emit('do-target-selected' + pName, payload);

                        this.drawLineTarget(payload);

                        console.log('target', this.$store.state.tempMarkers[pName][pIndex].targeted)
                    }
                    this.$forceUpdate();
                }
            },

            targetPlaneMarker(e, pMarker, pName) {

                if(pName === 'unknown') {
                    return;
                }

                console.log('targetPlaneMarker - pMarker', pMarker);
                console.log('targetPlaneMarker - pName', pName);

                if(!Object.prototype.hasOwnProperty.call(pMarker, 'icon')) {
                    pMarker.icon = JSON.parse(JSON.stringify(this.$store.state.defaultPlaneIcon));
                }

                let temp = JSON.parse(JSON.stringify(pMarker.icon));

                pMarker.icon = null;
                pMarker.icon = JSON.parse(JSON.stringify(temp));
                pMarker.icon.strokeWeight = 3;
                pMarker.icon.strokeOpacity = 0.5
                pMarker.icon.strokeColor = 'orange';

                //if(this.$store.state.currentCommandTab === '이동' || this.$store.state.currentCommandTab === '선회') {
                for(let pIndex in this.$store.state.tempMarkers[pName]) {
                    if (Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers[pName], pIndex)) {
                        if (this.$store.state.tempMarkers[pName][pIndex].targeted) {
                            let payload = {};
                            payload.pName = pName;
                            payload.pIndex = pIndex;
                        }
                    }
                }

                pMarker = this.clone(pMarker);

                temp = null;

                // this.$store.state.drone_infos[pName].targeted = pMarker.selected;

                // EventBus.$emit('do-targetPlane');

                // temp = JSON.parse(JSON.stringify(this.$store.state.dronesChecked));
                // this.$store.state.dronesChecked = null;
                // this.$store.state.dronesChecked = JSON.parse(JSON.stringify(temp));
                // temp = null;
            },

            targetDroneMarker(e, dMarker, dName) {

                if(dName === 'unknown') {
                    return;
                }

                console.log('targetDroneMarker - dMarker', dMarker);
                console.log('targetDroneMarker - dName', dName);

                if(!Object.prototype.hasOwnProperty.call(dMarker, 'icon')) {
                    dMarker.icon = JSON.parse(JSON.stringify(this.$store.state.defaultDroneIcon));
                }

                let temp = JSON.parse(JSON.stringify(dMarker.icon));
                if (!dMarker.selected) {
                    dMarker.selected = true;
                    dMarker.icon = null;
                    dMarker.icon = JSON.parse(JSON.stringify(temp));
                    dMarker.icon.strokeWeight = 3;
                    dMarker.icon.strokeOpacity = 0.5
                    dMarker.icon.strokeColor = 'springgreen';
                }
                else {
                    dMarker.selected = false;
                    dMarker.icon = null;
                    dMarker.icon = JSON.parse(JSON.stringify(temp));
                    dMarker.icon.strokeWeight = 1;
                    dMarker.icon.strokeOpacity = 1
                    dMarker.icon.strokeColor = 'grey';

                    this.deleteLineTarget(dName);
                }

                //if(this.$store.state.currentCommandTab === '이동' || this.$store.state.currentCommandTab === '선회') {
                for(let pIndex in this.$store.state.tempMarkers[dName]) {
                    if (Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers[dName], pIndex)) {
                        if (this.$store.state.tempMarkers[dName][pIndex].targeted) {
                            let payload = {};
                            payload.pName = dName;
                            payload.pIndex = pIndex;

                            this.drawLineTarget(payload);

                        //payload = null;

                        // this.$store.state.targetLines[dName] = null;
                        // this.$store.state.targetLines[dName] = [];
                        // this.targetLinesOptions[dName] = null;
                        // this.targetLinesOptions[dName] = {};
                        // let _options = {};
                        // _options.strokeColor = dMarker.color;
                        // _options.strokeOpacity = 0.9;
                        // _options.strokeWeight = 5;
                        // this.targetLinesOptions[dName] = JSON.parse(JSON.stringify(_options));
                        // _options = null;
                        //
                        // this.$store.state.targetLines[dName].push(dMarker);
                        // this.$store.state.targetLines[dName].push(this.$store.state.tempMarkers[dName][pIndex]);
                        //
                        // this.$store.state.targetLines = this.clone(this.$store.state.targetLines);

                        //break;
                        }
                    }
                }
                //}

                EventBus.$emit('do-drone-selected' + dName, dMarker.selected);

                dMarker = this.clone(dMarker);

                temp = null;

                this.$store.state.drone_infos[dName].targeted = dMarker.selected;

                EventBus.$emit('do-targetDrone');

                // temp = JSON.parse(JSON.stringify(this.$store.state.dronesChecked));
                // this.$store.state.dronesChecked = null;
                // this.$store.state.dronesChecked = JSON.parse(JSON.stringify(temp));
                // temp = null;
            },

            clone(obj) {
                let temp = null;

                if (obj === null || typeof (obj) !== 'object' || 'isActiveClone' in obj)
                    return obj;

                if (obj instanceof Date)
                    temp = new obj.constructor();
                else
                    temp = obj.constructor();

                for (let key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        obj['isActiveClone'] = null;
                        temp[key] = this.clone(obj[key]);
                        delete obj['isActiveClone'];
                    }
                }

                return temp;
            },

            drawLineTarget(payload) {
                if(payload.pName === 'unknown') {
                    return;
                }

                console.log('drawLineTarget', this.$store.state.currentCommandTab);

                if(this.$store.state.currentCommandTab === '이동') {
                    if (!Object.prototype.hasOwnProperty.call(this.droneMarkers[payload.pName], 'selected')) {
                        this.droneMarkers[payload.pName].selected = false;
                    }

                    if (this.droneMarkers[payload.pName].selected) {
                        if (this.$store.state.tempMarkers[payload.pName][payload.pIndex].targeted) {
                            this.$store.state.targetLines[payload.pName] = null;
                            this.$store.state.targetLines[payload.pName] = {
                                path: [],
                                options: {
                                    strokeColor: this.$store.state.drone_infos[payload.pName].color,
                                    strokeOpacity: 0.9,
                                    strokeWeight: 5
                                }
                            };

                            this.$store.state.targetLines[payload.pName].path.push(this.droneMarkers[payload.pName]);
                            this.$store.state.targetLines[payload.pName].path.push(this.$store.state.tempMarkers[payload.pName][payload.pIndex]);

                            this.$store.state.targetLines = this.clone(this.$store.state.targetLines);
                        }
                        else {
                            this.$store.state.targetLines[payload.pName] = null;
                            delete this.$store.state.targetLines[payload.pName];
                            // this.targetLinesOptions[payload.pName] = null;
                            // delete this.targetLinesOptions[payload.pName];

                            this.$store.state.targetLines = this.clone(this.$store.state.targetLines);

                            this.$store.state.targetCircles[payload.pName] = null;
                            delete this.$store.state.targetCircles[payload.pName]
                            // this.targetCirclesOptions[payload.pName] = null;
                            // delete this.targetCirclesOptions[payload.pName]

                            this.$store.state.targetCircles = this.clone(this.$store.state.targetCircles);
                        }

                        this.$forceUpdate();
                    }
                    else {
                        this.$store.state.targetLines[payload.pName] = null;
                        delete this.$store.state.targetLines[payload.pName];
                        // this.targetLinesOptions[payload.pName] = null;
                        // delete this.targetLinesOptions[payload.pName]

                        this.$store.state.targetLines = this.clone(this.$store.state.targetLines);

                        this.$store.state.targetCircles[payload.pName] = null;
                        delete this.$store.state.targetCircles[payload.pName]
                        // this.targetCirclesOptions[payload.pName] = null;
                        // delete this.targetCirclesOptions[payload.pName]

                        this.$store.state.targetCircles = this.clone(this.$store.state.targetCircles);

                        this.$forceUpdate();
                    }
                }
                else if(this.$store.state.currentCommandTab === '선회') {
                    if (this.droneMarkers[payload.pName].selected) {
                        if (this.$store.state.tempMarkers[payload.pName][payload.pIndex].targeted) {
                            console.log('draw', payload.pIndex);
                            this.$store.state.targetLines[payload.pName] = null;
                            this.$store.state.targetLines[payload.pName] = {
                                path: [],
                                options: {
                                    strokeColor: this.$store.state.drone_infos[payload.pName].color,
                                    strokeOpacity: 0.9,
                                    strokeWeight: 5
                                }
                            };

                            this.$store.state.targetLines[payload.pName].path.push(this.droneMarkers[payload.pName]);
                            this.$store.state.targetLines[payload.pName].path.push(this.$store.state.tempMarkers[payload.pName][payload.pIndex]);

                            this.$store.state.targetLines = this.clone(this.$store.state.targetLines);

                            this.$store.state.tempMarkers[payload.pName][payload.pIndex].radius = this.$store.state.drone_infos[payload.pName].targetRadius;

                            this.$store.state.targetCircles[payload.pName] = null;
                            this.$store.state.targetCircles[payload.pName] = {
                                lat: this.$store.state.tempMarkers[payload.pName][payload.pIndex].lat,
                                lng: this.$store.state.tempMarkers[payload.pName][payload.pIndex].lng,
                                radius: this.$store.state.tempMarkers[payload.pName][payload.pIndex].radius,
                                options: {
                                    strokeColor: this.$store.state.drone_infos[payload.pName].color,
                                    strokeOpacity: 0.9,
                                    strokeWeight: 5
                                }
                            };

                            this.$store.state.targetCircles = this.clone(this.$store.state.targetCircles);
                        }
                        else {
                            this.$store.state.targetLines[payload.pName] = null;
                            delete this.$store.state.targetLines[payload.pName];
                            // this.targetLinesOptions[payload.pName] = null;
                            // delete this.targetLinesOptions[payload.pName];

                            this.$store.state.targetLines = this.clone(this.$store.state.targetLines);

                            this.$store.state.targetCircles[payload.pName] = null;
                            delete this.$store.state.targetCircles[payload.pName]
                            // this.targetCirclesOptions[payload.pName] = null;
                            // delete this.targetCirclesOptions[payload.pName]

                            this.$store.state.targetCircles = this.clone(this.$store.state.targetCircles);
                        }

                        this.$forceUpdate();
                    }
                    else {
                        this.$store.state.targetLines[payload.pName] = null;
                        delete this.$store.state.targetLines[payload.pName];
                        // this.targetLinesOptions[payload.pName] = null;
                        // delete this.targetLinesOptions[payload.pName]

                        this.$store.state.targetLines = this.clone(this.$store.state.targetLines);

                        this.$store.state.targetCircles[payload.pName] = null;
                        delete this.$store.state.targetCircles[payload.pName]
                        // this.targetCirclesOptions[payload.pName] = null;
                        // delete this.targetCirclesOptions[payload.pName]

                        this.$store.state.targetCircles = this.clone(this.$store.state.targetCircles);

                        this.$forceUpdate();
                    }
                }
            },

            deleteLineTarget(pName) {
                this.$store.state.targetLines[pName] = null;
                delete this.$store.state.targetLines[pName];
                // this.targetLinesOptions[pName] = null;
                // delete this.targetLinesOptions[pName]

                this.$store.state.targetLines = this.clone(this.$store.state.targetLines);

                this.$store.state.targetCircles[pName] = null;
                delete this.$store.state.targetCircles[pName]
                // this.targetCirclesOptions[pName] = null;
                // delete this.targetCirclesOptions[pName]

                this.$store.state.targetCircles = this.clone(this.$store.state.targetCircles);

                this.$forceUpdate();
            },

            deleteLineAllTarget() {
                for(let pName in this.$store.state.targetLines) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.targetLines, pName)) {
                        this.$store.state.targetLines[pName] = null;
                        delete this.$store.state.targetLines[pName];
                        // this.targetLinesOptions[pName] = null;
                        // delete this.targetLinesOptions[pName];

                        this.$store.state.targetCircles[pName] = null;
                        delete this.$store.state.targetCircles[pName]
                        // this.targetCirclesOptions[pName] = null;
                        // delete this.targetCirclesOptions[pName]
                    }
                }

                this.$store.state.targetLines = this.clone(this.$store.state.targetLines);
                this.$store.state.targetCircles = this.clone(this.$store.state.targetCircles);

                this.$forceUpdate();
            },

            drawLineAllTarget() {
                for(let pName in this.droneMarkers) {
                    if(Object.prototype.hasOwnProperty.call(this.droneMarkers, pName)) {
                        if(this.droneMarkers[pName].selected) {
                            for(let pIndex in this.$store.state.tempMarkers[pName]) {
                                if (Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers[pName], pIndex)) {
                                    if (this.$store.state.tempMarkers[pName][pIndex].targeted) {
                                        let payload = {};
                                        payload.pName = pName;
                                        payload.pIndex = pIndex;

                                        this.drawLineTarget(payload);

                                        payload = null;

                                        // if (this.$store.state.tempMarkers[pName][pIndex].targeted) {
                                        //     this.$store.state.targetLines[pName] = null;
                                        //     this.$store.state.targetLines[pName] = [];
                                        //     this.targetLinesOptions[pName] = null;
                                        //     this.targetLinesOptions[pName] = {};
                                        //     let _options = {};
                                        //     _options.strokeColor = this.droneMarkers[pName].color;
                                        //     _options.strokeOpacity = 0.9;
                                        //     _options.strokeWeight = 5;
                                        //     this.targetLinesOptions[pName] = JSON.parse(JSON.stringify(_options));
                                        //     _options = null;
                                        //
                                        //     this.$store.state.targetLines[pName].push(this.droneMarkers[pName]);
                                        //     this.$store.state.targetLines[pName].push(this.$store.state.tempMarkers[pName][pIndex]);
                                        //
                                        //     this.$store.state.targetLines = this.clone(this.$store.state.targetLines);
                                        //
                                        //     break;
                                        // }
                                    }
                                }
                            }
                        }
                        // else {
                        //     this.$store.state.targetLines[pName] = null;
                        //     delete this.$store.state.targetLines[pName];
                        //     this.targetLinesOptions[pName] = null;
                        //     delete this.targetLinesOptions[pName]
                        //
                        //     this.$store.state.targetLines = this.clone(this.$store.state.targetLines);
                        // }
                    }
                }

                //this.$store.state.targetLines = this.clone(this.$store.state.targetLines);
                //this.$forceUpdate();
            },

            doPublish(topic, payload) {
                if (this.$store.state.client.connected) {
                    this.$store.state.client.publish(topic, payload, 0, error => {
                        if (error) {
                            console.log('Publish error', error)
                        }
                    });
                }
            },

            onMessageBroadcast(topic, message) {
                if(!this.$store.state.didIPublish) {
                    console.log(topic, message.toString());
                    try {
                        let watchingPayload = JSON.parse(message.toString());
                        if (watchingPayload.broadcastMission === 'updateTempPosition') {
                            let payload = watchingPayload.payload;

                            this.$store.commit('updateTempPosition', payload);

                            payload.value = false;
                            this.$store.commit('setSelected', payload);

                            this.drawLineTarget(payload);
                        }
                        else if (watchingPayload.broadcastMission === 'confirmAddTempMarker') {
                            //this.$store.state.tempPayload = JSON.parse(JSON.stringify(watchingPayload.payload));

                            this.$store.commit('addingTempMarker', watchingPayload.payload);
                            this.context_flag = false;

                            this.$store.commit('confirmAddTempMarker', false);
                        }
                        else if (watchingPayload.broadcastMission === 'registerMarker') {
                            this.$store.commit('registerMarker', watchingPayload.payload);
                        }

                        else if (watchingPayload.broadcastMission === 'deleteMarker') {
                            if(watchingPayload.payload.pName === 'unknown') {
                                this.$store.commit('removeMarker', watchingPayload.payload);
                            }
                            else {
                                this.$store.commit('deleteMarker', watchingPayload.payload);
                            }
                        }
                    }
                    catch (e) {
                        console.log('GcsMap-onMessageBroadcast-watchingMission', e.message);
                    }
                }

                this.$store.state.didIPublish = false;
            },

            doBroadcastTempPosition(payload) {
                let watchingPayload = {};
                watchingPayload.broadcastMission = 'updateTempPosition';
                watchingPayload.payload = payload;

                this.broadcast_gcsmap_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/gcsmap';
                console.log('broadcast_gcsmap_topic', this.broadcast_gcsmap_topic, '-', JSON.stringify(watchingPayload));
                this.doPublish(this.broadcast_gcsmap_topic, JSON.stringify(watchingPayload));

                this.$store.state.didIPublish = true;
            },

            doBroadcastAddMarker(payload) {
                let watchingPayload = {};
                watchingPayload.broadcastMission = 'confirmAddTempMarker';
                watchingPayload.payload = payload;

                this.broadcast_gcsmap_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/gcsmap';
                console.log('broadcast_gcsmap_topic', this.broadcast_gcsmap_topic, '-', JSON.stringify(watchingPayload));
                this.doPublish(this.broadcast_gcsmap_topic, JSON.stringify(watchingPayload));

                this.$store.state.didIPublish = true;
            },

            doBroadcastAddSurveyMarker(payload) {
                let watchingPayload = {};
                watchingPayload.broadcastMission = 'confirmAddSurveyMarker';
                watchingPayload.payload = payload;

                this.broadcast_gcsmap_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/gcsmap';
                console.log('broadcast_gcsmap_topic', this.broadcast_gcsmap_topic, '-', JSON.stringify(watchingPayload));
                this.doPublish(this.broadcast_gcsmap_topic, JSON.stringify(watchingPayload));

                this.$store.state.didIPublish = true;
            }
        },

        created() {
            console.log(window.innerHeight);

            // for (let pName in this.tempMarkers) {
            //     if(Object.prototype.hasOwnProperty.call(this.tempMarkers, pName)) {
            //
            //         let pos = JSON.parse(JSON.stringify(this.$store.state.defaultPosition));
            //         pos.lat = 37.404523241167965;
            //         pos.lng = 127.15821741355862;
            //         pos.m_icon.fillColor = 'grey';
            //
            //         let payload = {};
            //         payload.pName = pName;
            //         payload.pos = pos;
            //         this.$store.commit('addTempMarker', JSON.parse(JSON.stringify(payload)));
            //
            //         pos = JSON.parse(JSON.stringify(this.$store.state.defaultPosition));
            //         pos.lat = 37.40350051861734;
            //         pos.lng = 127.15752003921475;
            //         pos.m_icon.fillColor = 'grey';
            //         payload = {};
            //         payload.pName = pName;
            //         payload.pos = pos;
            //         this.$store.commit('addTempMarker', JSON.parse(JSON.stringify(payload)));
            //
            //     }
            // }

            // let payload = {};
            // payload.pName = 'unknown';
            //
            // if(!Object.prototype.hasOwnProperty.call(this.$store.state.droneColorMap, payload.pName)) {
            //     payload.color = (payload.pName === 'unknown') ? 'grey' : this.$store.state.markerColor[parseInt(Math.random()*this.$store.state.markerColor.length)];
            //     this.$store.commit('setDroneColorMap', JSON.parse(JSON.stringify(payload)));
            // }
            //
            // payload.lat = 37.404523241167965;
            // payload.lng = 127.15821741355862;
            // payload.alt = 20;
            // payload.speed = 5;
            // payload.radius = 250;
            // payload.turningSpeed = 10;
            //
            // this.$store.commit('addTempMarker', JSON.parse(JSON.stringify(payload)));
            //
            // payload.lat = 37.40350051861734;
            // payload.lng = 127.15752003921475;
            // payload.alt = 20;
            // payload.speed = 5;
            // payload.radius = 250;
            // payload.turningSpeed = 10;
            // this.$store.commit('addTempMarker', JSON.parse(JSON.stringify(payload)));
            //
            //
            // payload.pName = 'KETI_Air_01';
            //
            // if(!Object.prototype.hasOwnProperty.call(this.$store.state.droneColorMap, payload.pName)) {
            //     payload.color = (payload.pName === 'unknown') ? 'grey' : this.$store.state.markerColor[parseInt(Math.random()*this.$store.state.markerColor.length)];
            //     this.$store.commit('setDroneColorMap', JSON.parse(JSON.stringify(payload)));
            // }
            //
            // payload.lat = 37.40444175959039;
            // payload.lng = 127.1613059212351;
            // payload.alt = 20;
            // payload.speed = 5;
            // payload.radius = 250;
            // payload.turningSpeed = 10;
            // this.$store.commit('addTempMarker', JSON.parse(JSON.stringify(payload)));
            //
            //
            // payload.lat = 37.40423934664011;
            // payload.lng = 127.16160364643575;
            // payload.alt = 20;
            // payload.speed = 5;
            // payload.radius = 250;
            // payload.turningSpeed = 10;
            // this.$store.commit('addTempMarker', JSON.parse(JSON.stringify(payload)));
            //
            // payload.lat = 37.403376938697185;
            // payload.lng = 127.15910254253353;
            // payload.alt = 20;
            // payload.speed = 5;
            // payload.radius = 250;
            // payload.turningSpeed = 10;
            // this.$store.commit('addTempMarker', JSON.parse(JSON.stringify(payload)));
            //
            //
            // payload.pName = 'KETI_Air_02';
            // if(!Object.prototype.hasOwnProperty.call(this.$store.state.droneColorMap, payload.pName)) {
            //     payload.color = (payload.pName === 'unknown') ? 'grey' : this.$store.state.markerColor[parseInt(Math.random()*this.$store.state.markerColor.length)];
            //     this.$store.commit('setDroneColorMap', JSON.parse(JSON.stringify(payload)));
            // }
            //
            // payload.lat = 37.40316386939071;
            // payload.lng = 127.16200469268765;
            // payload.alt = 20;
            // payload.speed = 5;
            // payload.radius = 250;
            // payload.turningSpeed = 10;
            // this.$store.commit('addTempMarker', JSON.parse(JSON.stringify(payload)));
            //
            // payload.lat = 37.40266954626633;
            // payload.lng = 127.1604114605328;
            // payload.alt = 20;
            // payload.speed = 5;
            // payload.radius = 250;
            // payload.turningSpeed = 10;
            // this.$store.commit('addTempMarker', JSON.parse(JSON.stringify(payload)));
            //
            // payload.lat = 37.40279312735314;
            // payload.lng = 127.15881286395992;
            // payload.alt = 20;
            // payload.speed = 5;
            // payload.radius = 250;
            // payload.turningSpeed = 10;
            // this.$store.commit('addTempMarker', JSON.parse(JSON.stringify(payload)));
        },

        mounted() {
            window.addEventListener('resize', this.onResize);
            this.onResize();

            this.$refs.mapRef.$mapPromise.then((map) => {
                this.map = map;

                // const bounds = map.maps.LatLngBounds()
                // for (let m of this.markers) {
                //     bounds.extend(m.position)
                // }
                // map.fitBounds(bounds);


                // console.log(map);
                // // map.setContextMenu({
                // //     control: 'map',
                // //     options: [{
                // //         title: 'Add marker',
                // //         name: 'add_marker',
                // //         action: function(e) {
                // //             this.addMarker({
                // //                 lat: e.latLng.lat(),
                // //                 lng: e.latLng.lng(),
                // //                 title: 'New marker'
                // //             });
                // //         }
                // //     }, {
                // //         title: 'Center here',
                // //         name: 'center_here',
                // //         action: function(e) {
                // //             this.setCenter(e.latLng.lat(), e.latLng.lng());
                // //         }
                // //     }]
                // // });
                //
                // console.log('map', map.getZoom());

                // this.$refs.mapRef.$mapPromise.then((map) => {
                    this.$store.state.defaultDroneIcon.scale = (map.getZoom() < 15)?(1.4/15):(1.4/map.getZoom());
                // });
            });

            setInterval(() => {
                for (let idx in this.planeMarkers) {

                    if ((this.preADSB[idx].lat == this.planeMarkers[idx].lat) && (this.preADSB[idx].lng == this.planeMarkers[idx].lng)) {
                        if (this.count[idx] > 20) {
                            EventBus.$emit('clearPlaneMarker', this.planeMarkers[idx].ICAO_address);
                        }
                        this.count[idx]++;
                        // EventBus.$emit('clearAllPlaneMarker', '');
                    } else {
                        this.preADSB[idx].ICAO_address = this.planeMarkers[idx].ICAO_address;
                        this.preADSB[idx].lat = this.planeMarkers[idx].lat;
                        this.preADSB[idx].lng = this.planeMarkers[idx].lng;
                    }

                }
            }, 1000);

            EventBus.$on('do-centerCurrentPosition', (positionCenter) => {
                this.center = positionCenter;
            });

            EventBus.$on('do-deleteLineAllTarget', () => {
                this.deleteLineAllTarget();
            });

            EventBus.$on('do-drawLineAllTarget', () => {
                this.drawLineAllTarget();
            });

            EventBus.$on('do-drawMovingLines', (payload) => {
                if (this.$store.state.movingMarkers[payload.pName].targeted) {
                    this.movingLines[payload.pName] = null;
                    this.movingLines[payload.pName] = [];
                    this.movingLinesOptions[payload.pName] = null;
                    this.movingLinesOptions[payload.pName] = {};
                    let _options = {};
                    _options.strokeColor = this.droneMarkers[payload.pName].color;
                    _options.strokeOpacity = 0.9;
                    _options.strokeWeight = 5;
                    this.movingLinesOptions[payload.pName] = JSON.parse(JSON.stringify(_options));
                    _options = null;

                    this.movingLines[payload.pName].push(this.droneMarkers[payload.pName]);
                    this.movingLines[payload.pName].push(this.movingMarkers[payload.pName]);

                    this.movingLines = this.clone(this.movingLines);
                }
                else {
                    this.movingLines[payload.pName] = null;
                    this.movingLines[payload.pName] = [];
                    this.movingLinesOptions[payload.pName] = null;
                    this.movingLinesOptions[payload.pName] = {};

                    this.movingLines = this.clone(this.movingLines);
                }

                this.$forceUpdate();
            });

            EventBus.$on('do-targetTempMarker', (payload) => {
                this.targetTempMarker('', payload.pName, payload.pIndex, payload.targeted);
            });

            EventBus.$on('do-targetDroneMarker', (pName) => {
                let dMarker = this.droneMarkers[pName];
                this.targetDroneMarker('', dMarker, pName);
            });

            EventBus.$on('do-targetPlaneMarker', (pName) => {
                let pMarker = this.planeMarkers[pName];
                this.targetPlaneMarker('', pMarker, pName);
            });

            EventBus.$on('gcs-map-ready', () => {
                this.readyFlagGcsMap = true;

                this.$refs.mapRef.$mapPromise.then((map) => {
                    map.setTilt(45);
                });

                this.lineArrow = {
                    path: this.google.maps.SymbolPath.FORWARD_CLOSED_ARROW
                };

                //this.elevator = new this.google.maps.ElevationService();

                console.log('GcsMap-mounted-tempMarker', this.$store.state.tempMarkers);

                for (let pName in this.$store.state.tempMarkers) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers, pName)) {
                        console.log('GcsMap-mounted-tempMarker', pName, this.$store.state.tempMarkers);
                        if (pName !== 'unknown') {
                            this.$store.state.tempMarkers[pName].forEach((pos) => {
                                if (!Object.prototype.hasOwnProperty.call(this.gotoLines, pName)) {
                                    this.gotoLines[pName] = [];
                                    this.gotoLinesOptions[pName] = {};
                                    this.gotoLinesOptions[pName].strokeColor = pos.m_icon.fillColor;
                                    this.gotoLinesOptions[pName].strokeOpacity = 0.2;
                                    this.gotoLinesOptions[pName].strokeWeight = 10;
                                }

                                this.gotoLines[pName].push(pos);

                                // let temp = JSON.parse(JSON.stringify(pos.m_label));
                                // pos.m_label = null;
                                // pos.m_label = JSON.parse(JSON.stringify(temp));
                                // pos.m_label.text = String(count - 1);
                            });
                        }
                    }

                    console.log('gotoLines', this.gotoLines);
                }
            });

            EventBus.$on('updatePlaneMarker', (payload) => {
                this.$refs.mapRef.$mapPromise.then((map) => {
                    this.$store.state.defaultDroneIcon.scale = (map.getZoom() < 15)?(1.4/15):(1.4/map.getZoom());
                });

                if(!Object.prototype.hasOwnProperty.call(this.planeMarkers, payload.ICAO_address)) {
                    this.planeMarkers[payload.ICAO_address] = {};
                    this.preADSB[payload.ICAO_address] = {};
                    this.count[payload.ICAO_address] = 0;
                }
                this.planeMarkers[payload.ICAO_address].ICAO_address = payload.ICAO_address;
                this.planeMarkers[payload.ICAO_address].lat = payload.lat;
                this.planeMarkers[payload.ICAO_address].lng = payload.lng;
                this.planeMarkers[payload.ICAO_address].alt = payload.alt;
                this.planeMarkers[payload.ICAO_address].heading = payload.heading;
                this.planeMarkers[payload.ICAO_address].speed = payload.speed;
                this.planeMarkers[payload.ICAO_address].callsign = payload.callsign;
                this.planeMarkers[payload.ICAO_address].squawk = payload.squawk;
                this.planeMarkers[payload.ICAO_address].name = 'ICAO_address : ' + payload.ICAO_address + '\n' +
                    'lat : ' + payload.lat + '\n' +
                    'lng : ' + payload.lng + '\n' +
                    'alt : ' + payload.alt + '\n' +
                    'heading : ' + payload.heading + '\n' +
                    'speed : ' + payload.speed + '\n' +
                    'callsign : ' + payload.callsign + '\n' +
                    'squawk : ' + payload.squawk;
                this.planeMarkers[payload.ICAO_address].icon = null;
                this.planeMarkers[payload.ICAO_address].icon = {};

                this.planeMarkers[payload.ICAO_address].icon = JSON.parse(JSON.stringify(this.$store.state.defaultPlaneIcon));

                this.planeMarkers[payload.ICAO_address].icon.rotation = payload.heading;
                this.planeMarkers = this.clone(this.planeMarkers);

                payload = null;
            });

            EventBus.$on('clearPlaneMarker', (dName) => {
                if (Object.prototype.hasOwnProperty.call(this.planeMarkers, dName)) {
                    delete this.planeMarkers[dName];
                    delete this.preADSB[dName];
                    delete this.count[dName];

                    this.planeMarkers = this.clone(this.planeMarkers);
                    this.preADSB = this.clone(this.preADSB);

                }
            });

            EventBus.$on('clearAllPlaneMarker', () => {
                for(let dName in this.planeMarkers) {
                    if (Object.prototype.hasOwnProperty.call(this.planeMarkers, dName)) {
                        this.planeMarkers[dName] = null;
                        this.planeMarkers[dName] = {};
                    }
                }

                this.planeMarkers = null;
                this.planeMarkers = {};
            });

            EventBus.$on('draw-gotoLines', (payload) => {
                let dName = payload.dName
                if (dName !== 'unknown') {
                    this.$store.state.tempMarkers[dName].forEach((pos) => {
                        if (!Object.prototype.hasOwnProperty.call(this.gotoLines, dName)) {
                            this.gotoLines[dName] = [];
                            this.gotoLinesOptions[dName] = {};
                            this.gotoLinesOptions[dName].strokeColor = pos.m_icon.fillColor;
                            this.gotoLinesOptions[dName].strokeOpacity = 0.2;
                            this.gotoLinesOptions[dName].strokeWeight = 10;
                        }

                        this.gotoLines[dName].push(pos);
                    });
                }
            });

            EventBus.$on('updateDroneMarker', (payload) => {

                // if(!Object.hasOwnProperty.call(this.boundaryCircles,  payload.name)) {
                //     this.boundaryCircles[payload.name] = {};
                // }
                // else {
                //     delete this.boundaryCircles[payload.name];
                //     this.boundaryCircles[payload.name] = {};
                // }
                //
                // this.boundaryCircles[payload.name].lat = payload.lat;
                // this.boundaryCircles[payload.name].lng = payload.lng;
                // this.boundaryCircles[payload.name].radius = this.curBoundaryRadius;
                // this.boundaryCircles[payload.name].options = {
                //     strokeColor: this.$store.state.drone_infos[payload.name].color,
                //     fillOpacity: 0,
                //     strokeOpacity: 0.15,
                //     strokeWeight: 6,
                // };

                //this.drawBoundaryCircles(100);

                //this.droneMarkers[payload.name] = null;
                this.$refs.mapRef.$mapPromise.then((map) => {
                    this.$store.state.defaultDroneIcon.scale = (map.getZoom() < 15)?(1.4/15):(1.4/map.getZoom());
                });

                if(!Object.prototype.hasOwnProperty.call(this.droneMarkers, payload.name)) {
                    this.droneMarkers[payload.name] = {};
                    this.droneMarkers[payload.name].selected = false;
                }

                this.droneMarkers[payload.name].name = payload.name;
                this.droneMarkers[payload.name].lat = payload.lat;
                this.droneMarkers[payload.name].lng = payload.lng;
                this.droneMarkers[payload.name].alt = payload.alt;
                this.droneMarkers[payload.name].icon = null;
                this.droneMarkers[payload.name].icon = {};

                this.droneMarkers[payload.name].icon = JSON.parse(JSON.stringify(this.$store.state.defaultDroneIcon));

                if(this.$store.state.drone_infos[payload.name].targeted) {
                    this.droneMarkers[payload.name].selected = true;
                    this.droneMarkers[payload.name].icon.strokeWeight = 2;
                    this.droneMarkers[payload.name].icon.strokeColor = 'springgreen';
                }
                else {
                    this.droneMarkers[payload.name].selected = false;
                    this.droneMarkers[payload.name].icon.strokeWeight = 1;
                    this.droneMarkers[payload.name].icon.strokeColor = 'grey';
                }


                this.droneMarkers[payload.name].color = this.$store.state.drone_infos[payload.name].color;
                if(payload.iconArming === 'mdi-airplane') {
                    this.droneMarkers[payload.name].icon.fillColor = this.$store.state.drone_infos[payload.name].color;
                }
                else {
                    this.droneMarkers[payload.name].icon.fillColor = '#E0E0E0';
                }

                this.droneMarkers[payload.name].home_position
                this.droneMarkers[payload.name].icon.rotation = payload.heading;
                this.droneMarkers[payload.name].label = null;
                this.droneMarkers[payload.name].label = {};
                this.droneMarkers[payload.name].label = JSON.parse(JSON.stringify(this.$store.state.defaultDroneLabel));
                this.droneMarkers[payload.name].label.fontSize = '14px'
                this.droneMarkers[payload.name].label.text = payload.name.slice(0, 1).toUpperCase() + ':' + String(this.droneMarkers[payload.name].alt.toFixed(0));

                // let temp = JSON.parse(JSON.stringify(this.droneMarkers));
                // this.droneMarkers = null;
                // this.droneMarkers = {};
                this.droneMarkers = this.clone(this.droneMarkers);

                //temp = null;
                payload = null;
            });

            EventBus.$on('clearDroneMarker', () => {
                for(let dName in this.droneMarkers) {
                    if (Object.prototype.hasOwnProperty.call(this.droneMarkers, dName)) {
                        this.droneMarkers[dName] = null;
                        this.droneMarkers[dName] = {}
                    }
                }

                this.droneMarkers = null;
                this.droneMarkers = {};

                this.boundaryCircles = null;
                this.boundaryCircles = {};
            });

            EventBus.$on('on-message-handler-gcsmap', (payload) => {
                this.onMessageBroadcast(payload.topic, payload.message);
            });

            EventBus.$on('doBroadcastRegisterMaker', (payload)=>{
                let watchingPayload = {};
                watchingPayload.broadcastMission = 'registerMarker';
                watchingPayload.payload = payload;

                this.broadcast_gcsmap_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/gcsmap';
                console.log('broadcast_gcsmap_topic', this.broadcast_gcsmap_topic, '-', JSON.stringify(watchingPayload));
                this.doPublish(this.broadcast_gcsmap_topic, JSON.stringify(watchingPayload));

                this.$store.state.didIPublish = true;
            });

            EventBus.$on('doBroadcastDeleteMaker', (payload)=>{
                let watchingPayload = {};
                watchingPayload.broadcastMission = 'deleteMarker';
                watchingPayload.payload = payload;

                this.broadcast_gcsmap_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/gcsmap';
                console.log('broadcast_gcsmap_topic', this.broadcast_gcsmap_topic, '-', JSON.stringify(watchingPayload));
                this.doPublish(this.broadcast_gcsmap_topic, JSON.stringify(watchingPayload));

                this.$store.state.didIPublish = true;
            });
        },

        beforeDestroy() {
            EventBus.$off('do-centerCurrentPosition');
            EventBus.$off('do-deleteLineAllTarget');
            EventBus.$off('do-drawLineAllTarget');
            EventBus.$off('do-drawMovingLines');
            EventBus.$off('do-targetTempMarker');
            EventBus.$off('do-targetDroneMarker');
            EventBus.$off('gcs-map-ready');
            EventBus.$off('updateDroneMarker');
            EventBus.$off('clearDroneMarker');
            EventBus.$off('on-message-handler-gcsmap');
            EventBus.$off('doBroadcastRegisterMaker');
            EventBus.$off('doBroadcastDeleteMaker');

            EventBus.$off('updatePlaneMarker');
            EventBus.$off('clearPlaneMarker');
            EventBus.$off('clearAllPlaneMarker');
            EventBus.$off('draw-gotoLines');
        }
    }
</script>

<style scoped>
    .info_markers {
        position: absolute;
        left: 0;
        top: 0;
        opacity: 0.93;
        z-index: 2;
        width: 100%;
    }

    .context-menu {
        position: absolute;
        opacity: 1;
        z-index: 5;
    }
</style>
