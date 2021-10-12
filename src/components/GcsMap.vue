<script src="../../../gmap/src/main.js"></script>
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
                    <v-btn tile @click="cancelTempMarker" elevation="2" color="error">취소</v-btn>
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
                             @dblclick="addingTempMarker"
                             @dragstart="cancelTempMarker"
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
                            <div v-for="(pName, mIndex) in tempMarkers" :key="'targetTempMarker_'+mIndex">
                                <GmapMarker
                                        v-for="(pos, pIndex) in pName" :key="pIndex"
                                        :position="pos"
                                        :clickable="true"
                                        :draggable="true"
                                        @dblclick="selectTempMarker($event, mIndex, pIndex)"
                                        @click="targetTempMarker($event, mIndex, pIndex)"
                                        @dragend="updateTempPosition($event, mIndex, pIndex)"
                                        :icon="pos.m_icon"
                                        :label="pos.m_label"
                                        :title="mIndex  + ':' + pos.alt  + ':' + pos.speed  + ':' + pos.radius"
                                />
                            </div>

                            <GmapPolyline
                                    v-for="(line, lIndex) in $store.state.trackingLines" :key="'trackingLline_'+lIndex"
                                    :path.sync="line"
                                    :options="trackingLineOptions"
                            ></GmapPolyline>


                            <GmapPolyline
                                    v-for="(line, lIndex) in gotoLines" :key="'line_'+lIndex"
                                    :path.sync="line"
                                    :options="gotoLinesOptions[lIndex]"
                            ></GmapPolyline>

                            <div v-for="drone in $store.state.drone_infos" :key="'guideCircles_'+drone.id">
                                <div v-if="drone.selected">
                                    <GmapCircle
                                            :center="{lat: drone.lat, lng: drone.lng}"
                                            :radius="2"
                                            :options="{fillOpacity: 0, strokeColor: '#D50000', strokeOpacity: 1, strokeWeight: 1}"
                                    ></GmapCircle>

                                    <GmapCircle
                                            :center="{lat: drone.lat, lng: drone.lng}"
                                            :radius="5"
                                            :options="{fillOpacity: 0, strokeColor: '#FF5252', strokeOpacity: 0.9, strokeWeight: 1}"
                                    ></GmapCircle>

                                    <GmapCircle
                                            :center="{lat: drone.lat, lng: drone.lng}"
                                            :radius="10"
                                            :options="{fillOpacity: 0, strokeColor: '#FFCDD2', strokeOpacity: 0.8, strokeWeight: 1}"
                                    ></GmapCircle>

<!--                                    <GmapCircle-->
<!--                                            :center="{lat: drone.lat, lng: drone.lng}"-->
<!--                                            :radius="100"-->
<!--                                            :options="{fillOpacity: 0, strokeColor: drone.color, strokeOpacity: 0.15, strokeWeight: 6}"-->
<!--                                            @dblclick="addingTempMarker"-->
<!--                                    ></GmapCircle>-->

<!--                                    <GmapCircle-->
<!--                                            :center="{lat: drone.lat, lng: drone.lng}"-->
<!--                                            :radius="250"-->
<!--                                            :options="{fillOpacity: 0, strokeColor: drone.color, strokeOpacity: 0.6, strokeWeight: 1}"-->
<!--                                    ></GmapCircle>-->

                                    <GmapCircle
                                            :center="{lat: drone.home_position.lat, lng: drone.home_position.lng}"
                                            :radius="3"
                                            :options="{fillOpacity: 1, fillColor: drone.color, strokeColor: drone.color, strokeOpacity: 1, strokeWeight: 1}"
                                    ></GmapCircle>

                                    <GmapCircle
                                            :center="{lat: drone.home_position.lat, lng: drone.home_position.lng}"
                                            :radius="500"
                                            :options="{fillOpacity: 0, fillColor: drone.color, strokeColor: drone.color, strokeOpacity: 0.15, strokeWeight: 6}"
                                            @dblclick="addingTempMarker"
                                            @click="printPosClick"
                                    ></GmapCircle>

                                </div>
                            </div>

                            <GmapCircle v-for="(circle, dName) in boundaryCircles" :key="'boundaryCircles_'+dName"
                                        :center="circle"
                                        :radius="circle.radius"
                                        :options="circle.options"
                                        @dblclick="addingTempMarker"
                                        @click="printPosClick"
                            ></GmapCircle>

                            <GmapPolyline
                                v-for="(line, dName) in $store.state.targetLines" :key="'targetLines_'+dName"
                                :path.sync="line.path"
                                :options="line.options"
                            ></GmapPolyline>

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

                            <GmapCircle v-for="(circle, dName) in $store.state.missionCircles" :key="'missionCircles_'+dName"
                                :center="circle"
                                :radius="circle.radius"
                                :options="circle.options"
                            ></GmapCircle>
                        </div>
                    </GmapMap>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>

    import InfoMarker from "./InfoMarker";
    import EventBus from "@/EventBus";
    import {nanoid} from "nanoid";
    import {gmapApi} from 'vue2-google-maps'

    var curElevationVal = 0;

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
                map: null,
                // targetCirclesOptions: {},

                trackingLineOptions: {
                    strokeColor: '#FF6D00',
                    strokeOpacity: 0.9,
                    strokeWeight: 2,
                    zIndex: 5
                },

                boundaryCircles: {},
                curBoundaryRadius: 100,

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

            tempMarkers: {
                deep: true,
                handler: function (newVal) {
                    console.log('watch-tempMakers', newVal);

                    this.gotoLines = {};
                    for (let pName in newVal) {
                        if(Object.prototype.hasOwnProperty.call(newVal, pName)) {
                            if (pName !== 'unknown') {
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

                    this.curTargets = Object.keys(newVal);

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
            tempMarkers() {
                return (this.$store.state.tempMarkers);
            },
            defaultDroneIcon() {
                return (this.$store.state.defaultDroneIcon);
            },
            defaultDroneLabel() {
                return (this.$store.state.defaultDroneLabel);
            },
            myGcsStyle() {
                return ("width: " + window.innerWidth + "px'" + "; height: " + (this.myHeight) + 'px')
            },

            google: gmapApi,
        },

        methods: {
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
                    .catch((e) =>
                        console.log("Elevation service failed due to: " + e)
                    );
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

            confirmAddTempMarker() {
                this.context_flag = false;

                this.$store.commit('confirmAddTempMarker', false);

                this.doBroadcastAddMarker(this.$store.state.tempPayload);
            },

            cancelTempMarker() {
                this.context_flag = false;

                this.$store.commit('cancelTempMarker', false);
            },

            addingTempMarker(e) {
                this.drawBoundaryCircles(100);

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

                this.cancelTempMarker();

                let payload = {};
                payload.pName = 'unknown';
                payload.lat = e.latLng.lat();
                payload.lng = e.latLng.lng();
                payload.alt = 20;
                payload.speed = 5;
                payload.radius = 250;
                payload.turningSpeed = 10;
                payload.targetMavCmd = 16;
                payload.targetStayTime = 1;
                payload.color = 'grey';
                this.$store.commit('setDroneColorMap', payload); //JSON.parse(JSON.stringify(payload)));

                this.$store.commit('addingTempMarker', payload);

                console.log(e);
                console.log('click-pos', e.latLng.lat(), e.latLng.lng());
                //this.center = {lat: e.latLng.lat(), lng: e.latLng.lng()};

                this.click_x = e.domEvent.clientX;
                this.click_y = e.domEvent.clientY-50;

                console.log('pixel', e.domEvent.clientX, e.domEvent.clientY-50);

                this.context.left = e.domEvent.clientX;
                this.context.top = e.domEvent.clientY-50;

                console.log('context', this.context);

                this.context_flag = true;

                this.curFlagMarker = false;
                //this.$store.commit('setAllTempMarker', false);

                // console.log('addingTempMarker', e.domEvent);
                //
                // e.domEvent.preventDefault();
                //
                // e.domEvent.cancelBubble = true;
                //
                // console.log('addingTempMarker', e.domEvent);
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

                this.cancelTempMarker();
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
                    let payload = {};
                    payload.pName = pName;
                    payload.pIndex = pIndex;
                    payload.lat = e.latLng.lat();
                    payload.lng = e.latLng.lng();

                    this.$store.commit('updateTempPosition', payload);

                    payload.value = false;
                    this.$store.commit('setSelected', payload);

                    this.drawLineTarget(payload);

                    this.doBroadcastTempPosition(payload);

                    // this.selectTempMarker(e, pName, pIndex);

                    // this.$store.commit('saveCurrentDroneInfos');
                }

                // this.gotoLines = {};
                // for (let pName in this.tempMarkers) {
                //     if(Object.prototype.hasOwnProperty.call(this.tempMarkers, pName)) {
                //         if (pName !== 'unknown') {
                //             this.tempMarkers[pName].forEach((pos) => {
                //                 if (!Object.prototype.hasOwnProperty.call(this.gotoLines, pName)) {
                //                     this.gotoLines[pName] = [];
                //                     this.gotoLinesOptions[pName] = {};
                //                     this.gotoLinesOptions[pName].strokeColor = pos.m_icon.fillColor;
                //                     this.gotoLinesOptions[pName].strokeOpacity = 0.9;
                //                     this.gotoLinesOptions[pName].strokeWeight = 2;
                //                 }
                //
                //                 this.gotoLines[pName].push(pos);
                //             });
                //         }
                //     }
                // }
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
                            console.log('curElevation', val);

                            this.$store.state.tempMarkers[pName][pIndex].elevation = val;

                            this.curFlagMarker = true;
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

            targetTempMarker(e, pName, pIndex) {
                if(!this.$store.state.adding) {
                    console.log('targetTempMarker - pName', pName);
                    console.log('targetTempMarker - pIndex', pIndex);

                    if(!this.$store.state.tempMarkers[pName][pIndex].selected) {

                        let targeted = !this.$store.state.tempMarkers[pName][pIndex].targeted;
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
                this.targetTempMarker('', payload.pName, payload.pIndex);
            });

            EventBus.$on('do-targetDroneMarker', (pName) => {
                let dMarker = this.droneMarkers[pName];
                this.targetDroneMarker('', dMarker, pName);
            });

            EventBus.$on('gcs-map-ready', () => {
                this.readyFlagGcsMap = true;

                this.$refs.mapRef.$mapPromise.then((map) => {
                    map.setTilt(45);
                });

                console.log('GcsMap-mounted-tempMarker', this.tempMarkers);

                for (let pName in this.tempMarkers) {
                    if(Object.prototype.hasOwnProperty.call(this.tempMarkers, pName)) {
                        console.log('GcsMap-mounted-tempMarker', pName, this.tempMarkers);
                        if (pName !== 'unknown') {
                            this.tempMarkers[pName].forEach((pos) => {
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

                this.drawBoundaryCircles(100);

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
        }

    }
</script>

<style scoped>
    .info_markers {
        position: absolute;
        left: 0;
        top: 0;
        opacity: 0.85;
        z-index: 2;
        width: 100%;
    }

    .context-menu {
        position: absolute;
        opacity: 1;
        z-index: 5;
    }
</style>
