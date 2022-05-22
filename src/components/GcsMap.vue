<template>
    <div>
        <v-row no-gutters>
            <v-col cols="12">
                <v-card flat tile class="info_markers" v-if="curTempMarkerFlag">
                    <InfoMarker v-model="curTempMarkerFlag"
                                :marker-name="curNameMarker"
                                :marker-index="curIndexMarker"
                                :marker="curSelectedMarker"
                    ></InfoMarker>
                </v-card>
                <v-card flat tile class="info_markers" v-if="curSurveyMarkerFlag">
                    <InfoSurveyMarker
                        v-model="curSurveyMarkerFlag"
                        :marker-name="curNameMarker"
                        :marker-index="curIndexMarker"
                    ></InfoSurveyMarker>
                </v-card>
                <v-card flat tile class="context-menu" :style="{top:context.top + 'px',left:context.left+'px'}"
                        v-if="context_flag"
                >
                    <v-btn tile @click="confirmAddTempMarker" elevation="2" color="success">마커생성</v-btn>
                    <v-btn tile @click="confirmAddSurveyMarker" elevation="2" color="warning">Survey생성</v-btn>
                    <v-btn tile @click="cancelMarker" elevation="2" color="error">취소</v-btn>
                </v-card>
                <v-card>
                    <GmapMap
                        ref="mapRef" :center="center"
                        :zoom="18"
                        :mapTypeId="myMapTypeId"
                        :restriction="{
                            strictBounds: false,
                        }"
                        :style="myGcsStyle"
                        :options="{
                            disableDefaultUI: true, gestureHandling: 'greedy', disableDoubleClickZoom: true, minZoom: 1, maxZoom: 30,
                            streetViewControl: false,
                        }"
                        @click="printPosClick"
                        @dblclick="addingMarker"
                        @dragstart="cancelMarker"
                        @mousemove="calcDistance"
                        @zoom_changed="changeMapId"
                    >
<!--                        <GmapMarker-->
<!--                                :position="{lat: 37.40423134053018, lng: 127.16050533784832}"-->
<!--                                :clickable="true"-->
<!--                                :draggable="false"-->
<!--                                :icon="defaultDroneIcon"-->
<!--                                :label="defaultDroneLabel"-->
<!--                        />-->

<!--                        <GmapMarker-->
<!--                            v-for="(d, dIndex) in droneMarkers" :key="'targetDroneMarker_'+dIndex"-->
<!--                            :position="{lat: d.lat, lng: d.lng}"-->
<!--                            :clickable="true"-->
<!--                            :draggable="false"-->
<!--                            :icon="d.icon"-->
<!--                            :label="d.label"-->
<!--                            @click="targetDroneMarker($event, d, dIndex)"-->
<!--                            :title="d.name"-->
<!--                        />-->

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
                                :title="'unknown'  + ':' + pos.alt"
                                :icon="{
                                    path: $store.state.iconSourceMarker.icon[4],
                                    fillColor: 'grey',
                                    fillOpacity: 1,
                                    strokeWeight: pos.selected ? 3 : (pos.targeted ? 3 : 1),
                                    strokeColor: pos.selected ? 'springgreen' : (pos.targeted ? 'yellow' : 'white'),
                                    rotation: 0,
                                    scale: 0.07,
                                    anchor: {x: $store.state.iconSourceMarker.icon[0] / 2, y: $store.state.iconSourceMarker.icon[1]},
                                    labelOrigin: {x: $store.state.iconSourceMarker.icon[0] / 2, y: 0},
                                }"
                                :label="{
                                    text: 'T:' + pos.alt,
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: 'normal'
                                }"
                            />

                            <div v-for="drone in $store.state.drone_infos" :key="'guideCircles_'+drone.id">
                                <div v-if="drone.selected">
                                    <GmapMarker
                                        @click="targetDrones(drone.name)"
                                        :position="{lat: drone.lat, lng: drone.lng}"
                                        :clickable="true"
                                        :draggable="false"
                                        :icon="{
                                            path: $store.state.iconSourceDrone.icon[4],
                                            fillColor: drone.color,
                                            fillOpacity: 1,
                                            strokeWeight: (drone.targeted)?3:2,
                                            strokeColor: (drone.targeted)?'springgreen':'#1A237E',
                                            rotation: (360+drone.heading-45)%360,
                                            scale: scaleDroneIcon,
                                            anchor: {x: $store.state.iconSourceDrone.icon[0] / 2, y: $store.state.iconSourceDrone.icon[1] / 2},
                                            labelOrigin: {x: $store.state.iconSourceDrone.icon[0] / 2, y: $store.state.iconSourceDrone.icon[1] / 2},
                                            zIndex: 0
                                        }"
                                        :label="{
                                            text: drone.name.slice(0, 1).toUpperCase() + '(' + drone.system_id + ')' + ':' + drone.alt.toFixed(1),
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: 'normal'
                                        }"
                                        :title="drone.name"
                                    />

                                    <GmapPolyline
                                        :path.sync="$store.state.trackingLines[drone.name]"
                                        :options="{
                                            strokeColor: '#FF6D00',
                                            strokeOpacity: 0.9,
                                            strokeWeight: 2,
                                            zIndex: 0
                                        }"
                                    ></GmapPolyline>

                                    <GmapPolyline
                                        :path.sync="$store.state.tempMarkers[drone.name]"
                                        :options="{
                                            strokeColor: drone.color,
                                            strokeOpacity: 0.2,
                                            strokeWeight: 10,
                                        }"
                                    ></GmapPolyline>

                                    <GmapCircle
                                        v-if="Object.prototype.hasOwnProperty.call($store.state.targetCircles, drone.name)"
                                        :center="$store.state.targetCircles[drone.name]"
                                        :radius="$store.state.targetCircles[drone.name].radius"
                                        :options="{
                                            strokeColor: $store.state.drone_infos[drone.name].color,
                                            strokeOpacity: 0.9,
                                            strokeWeight: 5
                                        }"
                                        @mousemove="calcDistance"
                                    ></GmapCircle>

                                    <div v-for="(pos, pIndex) in $store.state.tempMarkers[drone.name]" :key="'marker'+pIndex">
                                        <GmapMarker
                                            :position="{lat:pos.lat, lng:pos.lng}"
                                            :clickable="true"
                                            :draggable="true"
                                            @dblclick="selectTempMarker($event, drone.name, pIndex)"
                                            @click="targetTempMarker($event, drone.name, pIndex, pos.targeted)"
                                            @dragend="updateTempPosition($event, drone.name, pIndex)"
                                            :title="drone.name  + ':' + pos.alt  + ':' + pos.speed  + ':' + pos.radius"
                                            :icon="{
                                                path: $store.state.iconSourceMarker.icon[4],
                                                fillColor: drone.color,
                                                fillOpacity: 1,
                                                strokeWeight: pos.selected ? 3 : (pos.targeted ? 3 : 0.5),
                                                strokeColor: pos.selected ? 'springgreen' : (pos.targeted ? 'yellow' : 'white'),
                                                rotation: 0,
                                                scale: 0.07,
                                                anchor: {x: $store.state.iconSourceMarker.icon[0] / 2, y: $store.state.iconSourceMarker.icon[1]},
                                                labelOrigin: {x: $store.state.iconSourceMarker.icon[0] / 2, y: 0},
                                                zIndex: 3
                                            }"
                                            :label="{
                                                text: pIndex + ':' + pos.alt,
                                                color: 'white',
                                                fontSize: '14px',
                                                fontWeight: 'normal'
                                            }"
                                        />

<!--                                        <div v-if="$store.state.tempMarkers[drone.name][pIndex].type === 'Circle'">-->
<!--                                            <GmapCircle-->
<!--                                                :center="{lat: $store.state.tempMarkers[drone.name][pIndex].lat, lng: $store.state.tempMarkers[drone.name][pIndex].lng}"-->
<!--                                                :radius="50"-->
<!--                                                :options="{fillOpacity: 0, strokeColor: '#D50000', strokeOpacity: 1, strokeWeight: 1}"-->
<!--                                            ></GmapCircle>-->
<!--                                        </div>-->
                                    </div>

<!--                                    home_position circle-->
<!--                                    <GmapCircle-->
<!--                                        :center="{lat: drone.home_position.lat, lng: drone.home_position.lng}"-->
<!--                                        :radius="3"-->
<!--                                        :options="{fillOpacity: 1, fillColor: drone.color, strokeColor: drone.color, strokeOpacity: 1, strokeWeight: 1}"-->
<!--                                    ></GmapCircle>-->

                                    <GmapMarker
                                        :position="{lat: drone.home_position.lat, lng: drone.home_position.lng}"
                                        :icon="{
                                                path: $store.state.iconSourceDroneHome.icon[4],
                                                fillColor: drone.color,
                                                fillOpacity: 1,
                                                strokeWeight: 2,
                                                strokeColor: 'white',
                                                rotation: 0,
                                                scale: 0.05,
                                                anchor: {x: 50, y: $store.state.iconSourceDroneHome.icon[1]},
                                                zIndex: 0
                                        }"
                                    />


                                    <GmapCircle
                                        :center="{lat: drone.home_position.lat, lng: drone.home_position.lng}"
                                        :radius="500"
                                        :options="{fillOpacity: 0, fillColor: drone.color, strokeColor: drone.color, strokeOpacity: 0.15, strokeWeight: 6}"
                                        @dblclick="addingMarker"
                                        @click="printPosClick"
                                        @mousemove="calcDistance"
                                    ></GmapCircle>

<!--                                    drone circle -->
<!--                                    <GmapCircle-->
<!--                                            :center="{lat: drone.lat, lng: drone.lng}"-->
<!--                                            :radius="2"-->
<!--                                            :options="{fillOpacity: 0, strokeColor: '#D50000', strokeOpacity: 1, strokeWeight: 1, zIndex: 0}"-->
<!--                                    ></GmapCircle>-->

<!--                                    <GmapCircle-->
<!--                                            :center="{lat: drone.lat, lng: drone.lng}"-->
<!--                                            :radius="5"-->
<!--                                            :options="{fillOpacity: 0, strokeColor: '#FF5252', strokeOpacity: 0.8, strokeWeight: 1, zIndex: 0}"-->
<!--                                    ></GmapCircle>-->

<!--                                    <GmapCircle-->
<!--                                        :center="{lat: drone.lat, lng: drone.lng}"-->
<!--                                        :radius="10"-->
<!--                                        :options="{fillOpacity: 0, strokeColor: '#FFCDD2', strokeOpacity: 0.6, strokeWeight: 1, zIndex: 0}"-->
<!--                                        @mousemove="calcDistance"-->
<!--                                    ></GmapCircle>-->

<!--                                    <GmapCircle-->
<!--                                        :center="{lat: drone.lat, lng: drone.lng}"-->
<!--                                        :radius="100"-->
<!--                                        :options="{fillOpacity: 0, fillColor: drone.color, strokeColor: drone.color, strokeOpacity: 0.15, strokeWeight: 6, zIndex: 0}"-->
<!--                                        @dblclick="addingMarker"-->
<!--                                        @click="printPosClick"-->
<!--                                        @mousemove="calcDistance"-->
<!--                                    ></GmapCircle>-->


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
                                        :options="{strokeColor: 'black', strokeOpacity: 1, strokeWeight: 4, zIndex: 5, icons: [{icon: lineArrow, offset: '100%'}]}"
                                    ></GmapPolyline>

                                    <div v-for="(survey, pIndex) in $store.state.surveyMarkers[drone.name]" :key="'survey'+pIndex">
                                        <GmapPolygon
                                            @paths_changed="showNewPolygon($event, drone.name, pIndex)"
                                            @dblclick="updataSurveyParam($event, drone.name, pIndex)"
                                            @click="targetSurveyPolygon($event, drone.name, pIndex)"
                                            @mousemove="calcDistance"
                                            :paths="survey.paths"
                                            :options="{
                                                strokeColor: (survey.selected)?'#76FF03':((survey.targeted)?'#FFFF00':drone.color),
                                                strokeOpacity: (survey.selected)?0.8:((survey.targeted)?0.8:0.2),
                                                strokeWeight: (survey.selected)?4:((survey.targeted)?4:1),
                                                fillColor: drone.color,
                                                fillOpacity: 0.1,
                                                draggable: survey.polygonDraggable,
                                                geodesic: false,
                                                editable: survey.polygonEditable,
                                                zIndex: 2,
                                            }"
                                        />
                                        <GmapPolyline
                                            :path.sync="survey.pathLines"
                                            :options="{
                                                strokeColor: drone.color,
                                                strokeOpacity: 0.7,
                                                strokeWeight: 3,
                                                zIndex: 0
                                            }"
                                        />
                                        <GmapMarker
                                            :position="{lat:survey.pathLines[0].lat, lng:survey.pathLines[0].lng}"
                                            :icon="{
                                                path: $store.state.iconSourceSurveyMarker.icon[4],
                                                fillColor: '#FF5722',
                                                fillOpacity: 0.6,
                                                strokeWeight: 0.8,
                                                strokeColor: 'black',
                                                rotation: 0,
                                                scale: 0.05,
                                                anchor: {x: $store.state.iconSourceSurveyMarker.icon[0]/2, y: $store.state.iconSourceSurveyMarker.icon[1]},
                                                labelOrigin: {x: $store.state.iconSourceSurveyMarker.icon[0]/2, y: $store.state.iconSourceSurveyMarker.icon[1]/2},
                                            }"
                                            :label="{
                                                text: '0',
                                                color: 'white',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                            }"
                                        />
                                        <GmapMarker
                                            :position="{lat:survey.pathLines[survey.pathLines.length-1].lat, lng:survey.pathLines[survey.pathLines.length-1].lng}"
                                            :icon="{
                                                path: $store.state.iconSourceSurveyMarker.icon[4],
                                                fillColor: '#607D8B',
                                                fillOpacity: 0.6,
                                                strokeWeight: 0.8,
                                                strokeColor: 'black',
                                                rotation: 0,
                                                scale: 0.05,
                                                anchor: {x: $store.state.iconSourceSurveyMarker.icon[0]/2, y: $store.state.iconSourceSurveyMarker.icon[1]},
                                                labelOrigin: {x: $store.state.iconSourceSurveyMarker.icon[0]/2, y: $store.state.iconSourceSurveyMarker.icon[1]/2},
                                            }"
                                            :label="{
                                                text: String(survey.pathLines.length-1),
                                                color: 'white',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                            }"
                                        />
                                        <div v-if="false">
                                            <div v-for="(pos, pIndex) in survey.pathLines" :key="'survey'+pIndex">
                                                <GmapMarker
                                                    :position="{lat:pos.lat, lng:pos.lng}"
                                                    :icon="{
                                                        path: $store.state.iconSourceSurveyMarker.icon[4],
                                                        fillColor: (pIndex===0)?'#FF5722':'#607D8B',
                                                        fillOpacity: 0.6,
                                                        strokeWeight: 0.8,
                                                        strokeColor: 'black',
                                                        rotation: 0,
                                                        scale: 0.05,
                                                        anchor: {x: $store.state.iconSourceSurveyMarker.icon[0]/2, y: $store.state.iconSourceSurveyMarker.icon[1]},
                                                        labelOrigin: {x: $store.state.iconSourceSurveyMarker.icon[0]/2, y: $store.state.iconSourceSurveyMarker.icon[1]/2},
                                                    }"
                                                    :label="{
                                                        text: String(pIndex),
                                                        color: 'white',
                                                        fontSize: '14px',
                                                        fontWeight: 'bold',
                                                    }"
                                                />
                                            </div>
                                        </div>
                                    </div>
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
                                        @mousemove="calcDistance"
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

<!--                            <div v-for="(circle, dName) in $store.state.targetCircles" :key="'targetCircles_'+dName">-->
<!--                                <div v-if="$store.state.drone_infos[dName].selected">-->
<!--                                    <GmapCircle-->
<!--                                        :center="circle"-->
<!--                                        :radius="circle.radius"-->
<!--                                        :options="circle.options"-->
<!--                                        @mousemove="calcDistance"-->
<!--                                    ></GmapCircle>-->
<!--                                </div>-->
<!--                            </div>-->

                            <div v-for="(circle, dName) in $store.state.missionCircles" :key="'missionCircles_'+dName">
                                <div v-if="$store.state.drone_infos[dName].selected">
                                    <GmapCircle
                                        :center="circle"
                                        :radius="circle.radius"
                                        :options="circle.options"
                                    ></GmapCircle>
                                </div>
                            </div>

                            <div v-for="(survey, pIndex) in $store.state.surveyMarkers.unknown" :key="'survey'+pIndex">
                                <GmapPolygon
                                    @paths_changed="showNewPolygon($event, 'unknown', pIndex)"
                                    @dblclick="updataSurveyParam($event, 'unknown', pIndex)"
                                    @click="targetSurveyPolygon($event, 'unknown', pIndex)"
                                    @mousemove="calcDistance"
                                    :paths="survey.paths"
                                    :options="{
                                        strokeColor: (survey.selected)?'#76FF03':((survey.targeted)?'#FFFF00':'black'),
                                        strokeOpacity: (survey.selected)?0.8:((survey.targeted)?0.8:0.2),
                                        strokeWeight: (survey.selected)?4:((survey.targeted)?4:1),
                                        // strokeColor: (survey.selected)?'#76FF03':'black',
                                        // strokeOpacity: 0.8,
                                        // strokeWeight: (survey.selected)?4:2,
                                        fillColor: 'black',
                                        fillOpacity: 0.3,
                                        draggable: survey.polygonDraggable,
                                        geodesic: false,
                                        editable: survey.polygonEditable,
                                        zIndex: 2,
                                    }"
                                />
                                <GmapPolyline
                                    :path.sync="survey.pathLines"
                                    :options="{
                                        strokeColor: '#607D8B',
                                        strokeOpacity: 0.95,
                                        strokeWeight: 4,
                                        zIndex: 0
                                    }"
                                />
                                <GmapMarker
                                    :position="{lat:survey.pathLines[0].lat, lng:survey.pathLines[0].lng}"
                                    :icon="{
                                                path: $store.state.iconSourceSurveyMarker.icon[4],
                                                fillColor: '#FF5722',
                                                fillOpacity: 0.6,
                                                strokeWeight: 0.8,
                                                strokeColor: 'black',
                                                rotation: 0,
                                                scale: 0.05,
                                                anchor: {x: $store.state.iconSourceSurveyMarker.icon[0]/2, y: $store.state.iconSourceSurveyMarker.icon[1]},
                                                labelOrigin: {x: $store.state.iconSourceSurveyMarker.icon[0]/2, y: $store.state.iconSourceSurveyMarker.icon[1]/2},
                                            }"
                                    :label="{
                                                text: '0',
                                                color: 'white',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                            }"
                                />
                                <GmapMarker
                                    :position="{lat:survey.pathLines[survey.pathLines.length-1].lat, lng:survey.pathLines[survey.pathLines.length-1].lng}"
                                    :icon="{
                                        path: $store.state.iconSourceSurveyMarker.icon[4],
                                        fillColor: '#607D8B',
                                        fillOpacity: 0.6,
                                        strokeWeight: 0.8,
                                        strokeColor: 'black',
                                        rotation: 0,
                                        scale: 0.05,
                                        anchor: {x: $store.state.iconSourceSurveyMarker.icon[0]/2, y: $store.state.iconSourceSurveyMarker.icon[1]},
                                        labelOrigin: {x: $store.state.iconSourceSurveyMarker.icon[0]/2, y: $store.state.iconSourceSurveyMarker.icon[1]/2},
                                    }"
                                    :label="{
                                        text: String(survey.pathLines.length-1),
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                    }"
                                />
                                <div v-if="false">
                                    <div v-for="(pos, pIndex) in survey.pathLines" :key="'survey'+pIndex">
                                        <GmapMarker
                                            :position="{lat:pos.lat, lng:pos.lng}"
                                            :icon="{
                                                path: $store.state.iconSourceSurveyMarker.icon[4],
                                                fillColor: (pIndex===0)?'#FF5722':'#607D8B',
                                                fillOpacity: 0.6,
                                                strokeWeight: 0.8,
                                                strokeColor: 'black',
                                                rotation: 0,
                                                scale: 0.05,
                                                anchor: {x: $store.state.iconSourceSurveyMarker.icon[0]/2, y: $store.state.iconSourceSurveyMarker.icon[1]},
                                                labelOrigin: {x: $store.state.iconSourceSurveyMarker.icon[0]/2, y: $store.state.iconSourceSurveyMarker.icon[1]/2},
                                            }"
                                            :label="{
                                                text: String(pIndex),
                                                color: 'white',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                            }"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GmapMap>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<!--<script src="../../../gmap/src/main.js"></script>-->

<script>

    import InfoMarker from "./InfoMarker";
    import InfoSurveyMarker from "./InfoSurveyMarker";
    import EventBus from "@/EventBus";
    import {nanoid} from "nanoid";
    import {gmapApi} from 'vue2-google-maps';
    import axios from "axios";
    // import {faMapMarkerAlt} from "@fortawesome/free-solid-svg-icons";

    // var curElevationVal = 0;

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
        name: 'GcsMap',

        props: [
            'drones'
        ],

        components: {
            InfoMarker,
            InfoSurveyMarker,
        },

        data () {
            return {
                myMapTypeId: "satellite",
                datum: {targeted: false, lat:0.0, lng:0.0},
                scaleDroneIcon: 0.1,
                turningDir: [90, 90, -90, -90],
                idUpdateTimer: null,
                idPostTimer: null,
                lineArrow: null,
                curElevation: 0,
                zoom: 18,
                curTempMarkerFlag: false,
                curSurveyMarkerFlag: false,
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
                myHeight: window.innerHeight-50,
                myWidth: window.innerWidth,
                readyFlagGcsMap: false,
                droneMarkers: {},
                planeMarkers: {},

                map: null,
                // targetCirclesOptions: {},

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

            curTempMarkerFlag: function (newVal, oldVal) {
                if(oldVal) {
                    console.log('curTempMarkerFlag', oldVal, '->', newVal);
                    for(let dName in this.$store.state.drone_infos) {
                        if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                            if(dName === 'unknown' || this.$store.state.drone_infos[dName].selected) {
                                if(Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers, dName)) {
                                    this.$store.state.tempMarkers[dName].forEach((marker) => {
                                        marker.selected = false;
                                        marker.targeted = false;
                                    });
                                }
                            }
                        }
                    }
                }
            },

            curSurveyMarkerFlag: function (newVal, oldVal) {
                if(oldVal) {
                    console.log('curSurveyMarkerFlag', oldVal, '->', newVal);
                    for(let dName in this.$store.state.drone_infos) {
                        if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                            if(dName === 'unknown' || this.$store.state.drone_infos[dName].selected) {
                                if(Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers, dName)) {
                                    this.$store.state.surveyMarkers[dName].forEach((marker) => {
                                        marker.selected = false;
                                        marker.targeted = false;
                                    });
                                }
                            }
                        }
                    }
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
                            this.$store.state.surveyMarkers[dName][pIndex].pathLines.push({
                                lat: intersectPoint.x,
                                lng: intersectPoint.y
                            });
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
                                this.$store.state.surveyMarkers[dName][pIndex].pathLines.push({
                                    lat: intersectPoint.x,
                                    lng: intersectPoint.y
                                });
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
                            this.$store.state.surveyMarkers[dName][pIndex].pathLines.unshift({
                                lat: intersectPoint.x,
                                lng: intersectPoint.y
                            });
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
                                this.$store.state.surveyMarkers[dName][pIndex].pathLines.unshift({
                                    lat: intersectPoint.x,
                                    lng: intersectPoint.y
                                });
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

                let area = this.google.maps.geometry.spherical.computeArea(this.$store.state.surveyMarkers[dName][pIndex].paths);
                this.$store.state.surveyMarkers[dName][pIndex].area = area.toFixed(1);
                console.log('computeArea = ', area.toFixed(1), '㎡');

                EventBus.$emit('on-update-survey-infomarker');
            },

            showNewPolygon(e, dName, pIndex) {
                //console.log(e);

                this.$store.state.surveyMarkers[dName][pIndex].paths = [];

                for(let obj in e) {
                    if(Object.prototype.hasOwnProperty.call(e, obj)) {
                        if(Array.isArray(e[obj])) {
                            for (let idx in e[obj][0][obj]) {
                                if (Object.prototype.hasOwnProperty.call(e[obj][0][obj], idx)) {
                                    this.$store.state.surveyMarkers[dName][pIndex].paths.push({
                                        lat: e[obj][0][obj][idx].lat(),
                                        lng: e[obj][0][obj][idx].lng()
                                    });
                                }
                            }
                        }
                    }
                }

                // if(Object.prototype.hasOwnProperty.call(e, 'Fd')) {
                //     for (let idx in e.Fd[0].Fd) {
                //         if (Object.prototype.hasOwnProperty.call(e.Fd[0].Fd, idx)) {
                //             this.$store.state.surveyMarkers[dName][pIndex].paths.push({
                //                 lat: e.Fd[0].Fd[idx].lat(),
                //                 lng: e.Fd[0].Fd[idx].lng()
                //             });
                //         }
                //     }
                // }
                // else if(Object.prototype.hasOwnProperty.call(e, 'Ed')) {
                //     for (let idx in e.Ed[0].Ed) {
                //         if (Object.prototype.hasOwnProperty.call(e.Ed[0].Ed, idx)) {
                //             this.$store.state.surveyMarkers[dName][pIndex].paths.push({
                //                 lat: e.Ed[0].Ed[idx].lat(),
                //                 lng: e.Ed[0].Ed[idx].lng()
                //             });
                //         }
                //     }
                // }
                // else if(Object.prototype.hasOwnProperty.call(e, 'Dd')) {
                //     for (let idx in e.Dd[0].Dd) {
                //         if (Object.prototype.hasOwnProperty.call(e.Dd[0].Dd, idx)) {
                //             this.$store.state.surveyMarkers[dName][pIndex].paths.push({
                //                 lat: e.Dd[0].Dd[idx].lat(),
                //                 lng: e.Dd[0].Dd[idx].lng()
                //             });
                //         }
                //     }
                // }

                if(this.idUpdateTimer !== null) {
                    clearTimeout(this.idUpdateTimer);
                }

                this.idUpdateTimer = setTimeout((dName, pIndex) => {
                    // this.$store.state.surveyMarkers[dName][pIndex].paths = [];

                    // for(let obj in newPaths) {
                    //     if(Object.prototype.hasOwnProperty.call(newPaths, obj)) {
                    //         if(Array.isArray(newPaths[obj])) {
                    //             for (let idx in newPaths[obj][0][obj]) {
                    //                 if (Object.prototype.hasOwnProperty.call(newPaths[obj][0][obj], idx)) {
                    //                     this.$store.state.surveyMarkers[dName][pIndex].paths.push({
                    //                         lat: newPaths[obj][0][obj][idx].lat(),
                    //                         lng: newPaths[obj][0][obj][idx].lng()
                    //                     });
                    //                 }
                    //             }
                    //         }
                    //     }
                    // }

                    this.$store.state.surveyMarkers[dName][pIndex].color = 'orange';

                    let gap = this.$store.state.surveyMarkers[dName][pIndex].gap;
                    let angle = this.$store.state.surveyMarkers[dName][pIndex].angle;
                    let dir = this.$store.state.surveyMarkers[dName][pIndex].dir;

                    this.updateSurveyPath(dName, pIndex, gap, angle, dir);

                    this.$store.state.drone_infos[dName].curMissionItemReached = 0;

                    if(this.idPostTimer !== null) {
                        clearTimeout(this.idPostTimer);
                    }

                    this.idPostTimer = setTimeout((dName) => {
                        this.postEachSurveyMarkerInfo(dName);
                    }, 2000, dName);
                }, 500, dName, pIndex);

                this.$forceUpdate();
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

            confirmAddSurveyMarker() {
                this.context_flag = false;

                if(!Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers, 'unknown')) {
                    this.$store.state.surveyMarkers.unknown = [];

                    this.createEachSurveyMarkerInfoToMobius('unknown', () => {
                        console.log('createEachSurveyMarkerInfoToMobius', 'unknown');
                    });
                }

                //const elevator = new this.google.maps.ElevationService();

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
                survey.type = 0;
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

                survey.paths = JSON.parse(JSON.stringify(paths));

                survey.gap = 20;
                survey.dir = 1;
                survey.angle = 0;

                this.$store.state.surveyMarkers.unknown.push(survey);
                console.log('elevation-confirmAddSurveyMarker', this.$store.state.surveyMarkers);

                this.updateSurveyPath('unknown', this.$store.state.surveyMarkers.unknown.length-1, 20, 0, 1);

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

                this.curTempMarkerFlag = false;
                this.curSurveyMarkerFlag = false;

                for(let dName in this.$store.state.drone_infos) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        if(dName === 'unknown' || this.$store.state.drone_infos[dName].selected) {
                            if(Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers, dName)) {
                                this.$store.state.tempMarkers[dName].forEach((marker) => {
                                    marker.selected = false;
                                    marker.targeted = false;
                                });
                            }
                        }
                    }
                }

                for(let dName in this.$store.state.drone_infos) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        if(dName === 'unknown' && this.$store.state.drone_infos[dName].selected) {
                            if(Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers, dName)) {
                                this.$store.state.surveyMarkers[dName].forEach((marker) => {
                                    marker.selected = false;
                                    marker.targeted = false;
                                    marker.polygonDraggable = false;
                                    marker.polygonEditable = false;
                                });
                            }
                        }
                    }
                }

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

                console.log('this.$store.state.iconSourceDrone.icon[0]', this.$store.state.iconSourceDrone.icon[0]);

                //this.center = {lat: e.latLng.lat(), lng: e.latLng.lng()};

                this.click_x = e.domEvent.clientX;
                this.click_y = e.domEvent.clientY-50;

                console.log('pixel', e.domEvent.clientX, e.domEvent.clientY-50)

                this.context.left = e.domEvent.clientX;
                this.context.top = e.domEvent.clientY-50;

                console.log('context', this.context);

                this.curTempMarkerFlag = false;
                this.curSurveyMarkerFlag = false;


                console.log('curNameMarker', this.curNameMarker);
                console.log('this.$store.state.surveyMarkers', this.$store.state.surveyMarkers);

                this.curTempMarkerFlag = false;
                this.curSurveyMarkerFlag = false;

                for(let dName in this.$store.state.drone_infos) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        if(dName === 'unknown' || this.$store.state.drone_infos[dName].selected) {
                            if(Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers, dName)) {
                                this.$store.state.tempMarkers[dName].forEach((marker) => {
                                    marker.selected = false;
                                    marker.targeted = false;
                                });
                            }

                            if(Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers, dName)) {
                                this.$store.state.surveyMarkers[dName].forEach((marker) => {
                                    marker.selected = false;
                                    marker.targeted = false;
                                    marker.polygonDraggable = false;
                                    marker.polygonEditable = false;
                                });
                            }

                            if(Object.prototype.hasOwnProperty.call(this.$store.state.targetLines, dName)) {
                                this.$store.state.targetLines[dName].path = [];
                            }

                            this.$store.state.drone_infos[dName].targeted = false;
                        }
                    }
                }

                EventBus.$emit('do-targetDrone');

                this.cancelMarker();
            },

            changeMapId(e) {
                let zoomLevel = e;
                console.log('zoomLevel: ' + zoomLevel);

                if(zoomLevel >= 20) {
                    this.myMapTypeId = 'roadmap';
                    this.scaleDroneIcon = (0.1 - ((zoomLevel-20)/100));
                }
                else {
                    this.myMapTypeId = 'satellite';
                    this.scaleDroneIcon = 0.1;
                }
            },

            calcDistance(e) {
                if(this.datum.targeted) {
                    this.datum.curLat = e.latLng.lat();
                    this.datum.curLng = e.latLng.lng();
                    EventBus.$emit('do-calcDistance', this.datum);
                }
            },

            targetSurveyPolygon(e, dName, pIndex) {
                this.curSurveyMarkerFlag = false;
                this.$store.state.surveyMarkers[dName].forEach((marker, index) => {
                    marker.selected = false;

                    if(pIndex !== index) {
                        marker.targeted = false;
                    }
                });

                this.$store.state.tempMarkers[dName].forEach((marker) => {
                    marker.selected = false;
                    marker.targeted = false;
                });

                this.$store.state.surveyMarkers[dName][pIndex].targeted = !this.$store.state.surveyMarkers[dName][pIndex].targeted;

                if(!Object.prototype.hasOwnProperty.call(this.$store.state.targetLines, dName)) {
                    this.$store.state.targetLines[dName] = {
                        path: [],
                        options: {
                            strokeColor: this.$store.state.drone_infos[dName].color,
                            strokeOpacity: 0.9,
                            strokeWeight: 5
                        }
                    };
                }

                if(this.$store.state.drone_infos[dName].targeted && this.$store.state.surveyMarkers[dName][pIndex].targeted) {
                    this.$store.state.active_tab = '패턴';

                    this.$store.state.targetLines[dName].path = [];
                    this.$store.state.targetLines[dName].path.push(this.$store.state.drone_infos[dName]);
                    this.$store.state.targetLines[dName].path.push(this.$store.state.surveyMarkers[dName][pIndex].pathLines[0]);
                }
                else {
                    this.$store.state.targetLines[dName].path = [];
                }

                let payload = {};
                payload.dName = dName;
                payload.pIndex = pIndex;
                payload.targeted = this.$store.state.surveyMarkers[dName][pIndex].targeted;

                EventBus.$emit('do-target-survey-marker', payload);
            },

            updataSurveyParam(e, dName, pIndex) {
                if(!this.$store.state.adding) {
                    console.log('updataSurveyParam', dName, pIndex, this.$store.state.surveyMarkers[dName][pIndex]);

                    this.curSurveyMarkerFlag = false;

                    for(let dName in this.$store.state.drone_infos) {
                        if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                            if (dName === 'unknown' || this.$store.state.drone_infos[dName].selected) {
                                if(Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers, dName)) {
                                    this.$store.state.surveyMarkers[dName].forEach((marker) => {
                                        marker.selected = false;
                                        marker.targeted = false;
                                        marker.polygonDraggable = false;
                                        marker.polygonEditable = false;
                                    });
                                }
                            }
                        }
                    }

                    this.$forceUpdate();

                    setTimeout(() => {
                        this.$store.state.surveyMarkers[dName][pIndex].selected = true;
                        this.$store.state.surveyMarkers[dName][pIndex].polygonDraggable = true;
                        this.$store.state.surveyMarkers[dName][pIndex].polygonEditable = true;
                        this.curSelectedMarker = this.$store.state.surveyMarkers[dName][pIndex];
                        this.curIndexMarker = pIndex;
                        this.curNameMarker = dName;
                        this.curSurveyMarkerFlag = true;
                    }, 10)
                }
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

                        //this.drawLineTarget(payload);

                        this.doBroadcastTempPosition(payload);

                        // this.selectTempMarker(e, pName, pIndex);

                        // this.$store.commit('saveCurrentDroneInfos');

                        EventBus.$emit('on-update-infomarker');
                    });
                }
            },

            selectTempMarker(e, pName, pIndex) {
                if(!this.$store.state.adding) {
                    console.log('selectTempMarker - pName', pName, ' - pIndex', pIndex);

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
                            this.curTempMarkerFlag = true;

                            console.log('curSelectedMarker', pName, pIndex, this.$store.state.tempMarkers[pName][pIndex]);
                        });
                    }
                    else {
                        this.curTempMarkerFlag = false;
                    }

                    console.log('select', this.$store.state.tempMarkers[pName][pIndex].selected)

                    this.$forceUpdate();
                }
            },

            targetTempMarker(e, dName, pIndex, _targeted) {
                if(!this.$store.state.adding) {
                    console.log('targetTempMarker - pName', dName, 'pIndex', pIndex);

                    this.curSurveyMarkerFlag = false;
                    this.$store.state.surveyMarkers[dName].forEach((marker) => {
                        marker.selected = false;
                        marker.targeted = false;
                    });

                    if(!this.$store.state.tempMarkers[dName][pIndex].selected) {

                        let targeted = !_targeted;
                        let payload = {};
                        payload.pName = dName;
                        payload.pIndex = pIndex;
                        payload.value = false;
                        this.$store.commit('setTargetAllTempMarker', payload);

                        if (targeted) {
                            payload.pName = dName;
                            payload.pIndex = pIndex;
                            payload.value = targeted;
                            this.$store.commit('setTargetTempMarker', payload);
                        }

                        EventBus.$emit('do-selected-position', payload);
                        EventBus.$emit('do-target-selected' + dName, payload);

                        if(!Object.prototype.hasOwnProperty.call(this.$store.state.targetLines, dName)) {
                            this.$store.state.targetLines[dName] = {
                                path: [],
                                options: {
                                    strokeColor: this.$store.state.drone_infos[dName].color,
                                    strokeOpacity: 0.9,
                                    strokeWeight: 5
                                }
                            };
                        }

                        if(this.$store.state.drone_infos[dName].targeted && this.$store.state.tempMarkers[dName][pIndex].targeted) {
                            this.$store.state.targetLines[dName].path = [];
                            this.$store.state.targetLines[dName].path.push(this.$store.state.drone_infos[dName]);
                            this.$store.state.targetLines[dName].path.push(this.$store.state.tempMarkers[dName][pIndex]);
                        }
                        else {
                            this.$store.state.targetLines[dName].path = [];
                        }

                        if(!Object.prototype.hasOwnProperty.call(this.$store.state.targetCircles, dName)) {
                            this.$store.state.targetCircles[dName] = {
                                lat: this.$store.state.tempMarkers[dName][pIndex].lat,
                                lng: this.$store.state.tempMarkers[dName][pIndex].lng,
                                radius: 0,
                                options: {
                                    strokeColor: this.$store.state.drone_infos[dName].color,
                                    strokeOpacity: 0.9,
                                    strokeWeight: 5
                                }
                            };
                        }

                        if(this.$store.state.currentCommandTab === '선회') {
                            if (this.$store.state.drone_infos[dName].targeted && this.$store.state.tempMarkers[dName][pIndex].targeted) {
                                this.$store.state.tempMarkers[dName][pIndex].radius = this.$store.state.drone_infos[dName].targetRadius;

                                delete this.$store.state.targetCircles[dName];
                                this.$store.state.targetCircles[dName] = {
                                    lat: this.$store.state.tempMarkers[dName][pIndex].lat,
                                    lng: this.$store.state.tempMarkers[dName][pIndex].lng,
                                    radius: this.$store.state.tempMarkers[dName][pIndex].radius,
                                    options: {
                                        strokeColor: this.$store.state.drone_infos[dName].color,
                                        strokeOpacity: 0.9,
                                        strokeWeight: 5
                                    }
                                };
                            }
                            else {
                                delete this.$store.state.targetCircles[dName];
                            }
                        }

                        //this.drawLineTarget(payload);

                        console.log('target', this.$store.state.tempMarkers[dName][pIndex].targeted);

                        if(dName === 'unknown') {
                            this.datum.targeted = targeted;
                            this.datum.lat = this.$store.state.tempMarkers[dName][pIndex].lat;
                            this.datum.lng = this.$store.state.tempMarkers[dName][pIndex].lng;

                            console.log('datum', this.datum);

                            if(targeted === false) {
                                EventBus.$emit('do-calcDistance', this.datum);
                            }
                        }
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

            targetDrones(dName) {
                this.$store.state.drone_infos[dName].targeted = !this.$store.state.drone_infos[dName].targeted;

                EventBus.$emit('do-targetDrone');
            },

            // targetDroneMarker(e, dMarker, dName) {
            //
            //     if(dName === 'unknown') {
            //         return;
            //     }
            //
            //     console.log('targetDroneMarker - dMarker', dMarker);
            //     console.log('targetDroneMarker - dName', dName);
            //
            //     if(!Object.prototype.hasOwnProperty.call(dMarker, 'icon')) {
            //         dMarker.icon = JSON.parse(JSON.stringify(this.$store.state.defaultDroneIcon));
            //     }
            //
            //     let temp = JSON.parse(JSON.stringify(dMarker.icon));
            //     if (!dMarker.selected) {
            //         dMarker.selected = true;
            //         dMarker.icon = null;
            //         dMarker.icon = JSON.parse(JSON.stringify(temp));
            //         dMarker.icon.strokeWeight = 3;
            //         dMarker.icon.strokeOpacity = 0.5
            //         dMarker.icon.strokeColor = 'springgreen';
            //     }
            //     else {
            //         dMarker.selected = false;
            //         dMarker.icon = null;
            //         dMarker.icon = JSON.parse(JSON.stringify(temp));
            //         dMarker.icon.strokeWeight = 1;
            //         dMarker.icon.strokeOpacity = 1
            //         dMarker.icon.strokeColor = 'grey';
            //
            //         this.deleteLineTarget(dName);
            //     }
            //
            //     //if(this.$store.state.currentCommandTab === '이동' || this.$store.state.currentCommandTab === '선회') {
            //     for(let pIndex in this.$store.state.tempMarkers[dName]) {
            //         if (Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers[dName], pIndex)) {
            //             if (this.$store.state.tempMarkers[dName][pIndex].targeted) {
            //                 let payload = {};
            //                 payload.pName = dName;
            //                 payload.pIndex = pIndex;
            //
            //                 this.drawLineTarget(payload);
            //
            //             //payload = null;
            //
            //             // this.$store.state.targetLines[dName] = null;
            //             // this.$store.state.targetLines[dName] = [];
            //             // this.targetLinesOptions[dName] = null;
            //             // this.targetLinesOptions[dName] = {};
            //             // let _options = {};
            //             // _options.strokeColor = dMarker.color;
            //             // _options.strokeOpacity = 0.9;
            //             // _options.strokeWeight = 5;
            //             // this.targetLinesOptions[dName] = JSON.parse(JSON.stringify(_options));
            //             // _options = null;
            //             //
            //             // this.$store.state.targetLines[dName].push(dMarker);
            //             // this.$store.state.targetLines[dName].push(this.$store.state.tempMarkers[dName][pIndex]);
            //             //
            //             // this.$store.state.targetLines = this.clone(this.$store.state.targetLines);
            //
            //             //break;
            //             }
            //         }
            //     }
            //     //}
            //
            //     EventBus.$emit('do-drone-selected' + dName, dMarker.selected);
            //
            //     dMarker = this.clone(dMarker);
            //
            //     temp = null;
            //
            //     this.$store.state.drone_infos[dName].targeted = dMarker.selected;
            //
            //     EventBus.$emit('do-targetDrone');
            //
            //     // temp = JSON.parse(JSON.stringify(this.$store.state.dronesChecked));
            //     // this.$store.state.dronesChecked = null;
            //     // this.$store.state.dronesChecked = JSON.parse(JSON.stringify(temp));
            //     // temp = null;
            // },

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
                    if (this.$store.state.drone_infos[payload.pName].selected) {
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

                            this.$store.state.targetLines[payload.pName].path.push(this.$store.state.drone_infos[payload.pName]);
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
                // else if(this.$store.state.currentCommandTab === '선회') {
                //     if (this.$store.state.drone_infos[payload.pName].selected) {
                //         if (this.$store.state.tempMarkers[payload.pName][payload.pIndex].targeted) {
                //             console.log('draw', payload.pIndex);
                //             this.$store.state.targetLines[payload.pName] = null;
                //             this.$store.state.targetLines[payload.pName] = {
                //                 path: [],
                //                 options: {
                //                     strokeColor: this.$store.state.drone_infos[payload.pName].color,
                //                     strokeOpacity: 0.9,
                //                     strokeWeight: 5
                //                 }
                //             };
                //
                //             this.$store.state.targetLines[payload.pName].path.push(this.$store.state.drone_infos[payload.pName]);
                //             this.$store.state.targetLines[payload.pName].path.push(this.$store.state.tempMarkers[payload.pName][payload.pIndex]);
                //
                //             this.$store.state.targetLines = this.clone(this.$store.state.targetLines);
                //
                //             this.$store.state.tempMarkers[payload.pName][payload.pIndex].radius = this.$store.state.drone_infos[payload.pName].targetRadius;
                //
                //             this.$store.state.targetCircles[payload.pName] = null;
                //             this.$store.state.targetCircles[payload.pName] = {
                //                 lat: this.$store.state.tempMarkers[payload.pName][payload.pIndex].lat,
                //                 lng: this.$store.state.tempMarkers[payload.pName][payload.pIndex].lng,
                //                 radius: this.$store.state.tempMarkers[payload.pName][payload.pIndex].radius,
                //                 options: {
                //                     strokeColor: this.$store.state.drone_infos[payload.pName].color,
                //                     strokeOpacity: 0.9,
                //                     strokeWeight: 5
                //                 }
                //             };
                //
                //             this.$store.state.targetCircles = this.clone(this.$store.state.targetCircles);
                //         }
                //         else {
                //             this.$store.state.targetLines[payload.pName] = null;
                //             delete this.$store.state.targetLines[payload.pName];
                //             // this.targetLinesOptions[payload.pName] = null;
                //             // delete this.targetLinesOptions[payload.pName];
                //
                //             this.$store.state.targetLines = this.clone(this.$store.state.targetLines);
                //
                //             this.$store.state.targetCircles[payload.pName] = null;
                //             delete this.$store.state.targetCircles[payload.pName]
                //             // this.targetCirclesOptions[payload.pName] = null;
                //             // delete this.targetCirclesOptions[payload.pName]
                //
                //             this.$store.state.targetCircles = this.clone(this.$store.state.targetCircles);
                //         }
                //
                //         this.$forceUpdate();
                //     }
                //     else {
                //         this.$store.state.targetLines[payload.pName] = null;
                //         delete this.$store.state.targetLines[payload.pName];
                //         // this.targetLinesOptions[payload.pName] = null;
                //         // delete this.targetLinesOptions[payload.pName]
                //
                //         this.$store.state.targetLines = this.clone(this.$store.state.targetLines);
                //
                //         this.$store.state.targetCircles[payload.pName] = null;
                //         delete this.$store.state.targetCircles[payload.pName]
                //         // this.targetCirclesOptions[payload.pName] = null;
                //         // delete this.targetCirclesOptions[payload.pName]
                //
                //         this.$store.state.targetCircles = this.clone(this.$store.state.targetCircles);
                //
                //         this.$forceUpdate();
                //     }
                // }
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

            // drawLineAllTarget() {
            //     for(let pName in this.droneMarkers) {
            //         if(Object.prototype.hasOwnProperty.call(this.droneMarkers, pName)) {
            //             if(this.droneMarkers[pName].selected) {
            //                 for(let pIndex in this.$store.state.tempMarkers[pName]) {
            //                     if (Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers[pName], pIndex)) {
            //                         if (this.$store.state.tempMarkers[pName][pIndex].targeted) {
            //                             let payload = {};
            //                             payload.pName = pName;
            //                             payload.pIndex = pIndex;
            //
            //                             this.drawLineTarget(payload);
            //
            //                             payload = null;
            //
            //                             // if (this.$store.state.tempMarkers[pName][pIndex].targeted) {
            //                             //     this.$store.state.targetLines[pName] = null;
            //                             //     this.$store.state.targetLines[pName] = [];
            //                             //     this.targetLinesOptions[pName] = null;
            //                             //     this.targetLinesOptions[pName] = {};
            //                             //     let _options = {};
            //                             //     _options.strokeColor = this.droneMarkers[pName].color;
            //                             //     _options.strokeOpacity = 0.9;
            //                             //     _options.strokeWeight = 5;
            //                             //     this.targetLinesOptions[pName] = JSON.parse(JSON.stringify(_options));
            //                             //     _options = null;
            //                             //
            //                             //     this.$store.state.targetLines[pName].push(this.droneMarkers[pName]);
            //                             //     this.$store.state.targetLines[pName].push(this.$store.state.tempMarkers[pName][pIndex]);
            //                             //
            //                             //     this.$store.state.targetLines = this.clone(this.$store.state.targetLines);
            //                             //
            //                             //     break;
            //                             // }
            //                         }
            //                     }
            //                 }
            //             }
            //             // else {
            //             //     this.$store.state.targetLines[pName] = null;
            //             //     delete this.$store.state.targetLines[pName];
            //             //     this.targetLinesOptions[pName] = null;
            //             //     delete this.targetLinesOptions[pName]
            //             //
            //             //     this.$store.state.targetLines = this.clone(this.$store.state.targetLines);
            //             // }
            //         }
            //     }
            //
            //     //this.$store.state.targetLines = this.clone(this.$store.state.targetLines);
            //     //this.$forceUpdate();
            // },

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

                            //this.drawLineTarget(payload);
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

                        else if (watchingPayload.broadcastMission === 'removeSurveyMarker') {
                            this.$store.state.surveyMarkers[watchingPayload.payload.dName].splice(watchingPayload.payload.pIndex, 1);
                        }

                        else if (watchingPayload.broadcastMission === 'deleteSurveyMarker') {
                            let oldObj = JSON.parse(JSON.stringify(this.$store.state.surveyMarkers[watchingPayload.payload.dName][watchingPayload.payload.pIndex]));
                            this.$store.state.surveyMarkers[watchingPayload.payload.dName].splice(watchingPayload.payload.pIndex, 1);
                            this.$store.state.surveyMarkers.unknown.push(oldObj);
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
                    //this.scaleDroneIcon = (map.getZoom() < 15)?(1.4/15):(1.4/map.getZoom());

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

            EventBus.$on('do-update-survey-angle-GcsMap', (payload) => {
                let dName = payload.dName;
                let pIndex = payload.pIndex;
                let angle = payload.angle;
                let gap = this.$store.state.surveyMarkers[dName][pIndex].gap;
                let dir = this.$store.state.surveyMarkers[dName][pIndex].dir;

                this.updateSurveyPath(dName, pIndex, gap, angle, dir);

                this.postEachSurveyMarkerInfo(dName);
            });

            EventBus.$on('do-update-survey-alt-GcsMap', (payload) => {
                let dName = payload.dName;
                let pIndex = payload.pIndex;
                this.$store.state.surveyMarkers[dName][pIndex].alt = payload.alt;

                this.postEachSurveyMarkerInfo(dName);
            });

            EventBus.$on('do-update-way-of-survey-GcsMap', (payload) => {
                let dName = payload.dName;
                let pIndex = payload.pIndex;
                this.$store.state.surveyMarkers[dName][pIndex].wayOfSurvey = payload.wayOfSurvey;

                this.postEachSurveyMarkerInfo(dName);
            });

            EventBus.$on('do-update-survey-gap-GcsMap', (payload) => {
                let dName = payload.dName;
                let pIndex = payload.pIndex;
                let angle = this.$store.state.surveyMarkers[dName][pIndex].angle;
                let gap = payload.gap;
                let dir = this.$store.state.surveyMarkers[dName][pIndex].dir;

                this.updateSurveyPath(dName, pIndex, gap, angle, dir);

                this.postEachSurveyMarkerInfo(dName);
            });

            EventBus.$on('do-update-survey-dir-GcsMap', (payload) => {
                let dName = payload.dName;
                let pIndex = payload.pIndex;
                let angle = this.$store.state.surveyMarkers[dName][pIndex].angle;
                let gap = this.$store.state.surveyMarkers[dName][pIndex].gap;
                let dir = payload.dir;

                this.updateSurveyPath(dName, pIndex, gap, angle, dir);

                this.postEachSurveyMarkerInfo(dName);
            });

            EventBus.$on('do-centerCurrentPosition', (positionCenter) => {
                this.center = positionCenter;
            });

            EventBus.$on('do-deleteLineAllTarget', () => {
                this.deleteLineAllTarget();
            });

            // EventBus.$on('do-drawLineAllTarget', () => {
            //     this.drawLineAllTarget();
            // });

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

            // EventBus.$on('do-targetDroneMarker', (pName) => {
            //     let dMarker = this.droneMarkers[pName];
            //     this.targetDroneMarker('', dMarker, pName);
            // });

            EventBus.$on('do-targetPlaneMarker', (pName) => {
                let pMarker = this.planeMarkers[pName];
                this.targetPlaneMarker('', pMarker, pName);
            });

            EventBus.$on('gcs-map-ready', () => {
                this.readyFlagGcsMap = true;

                // this.$refs.mapRef.$mapPromise.then((map) => {
                //     map.setTilt(45);
                // });

                this.lineArrow = {
                    path: this.google.maps.SymbolPath.FORWARD_CLOSED_ARROW
                };

                //this.elevator = new this.google.maps.ElevationService();

                console.log('GcsMap-mounted-tempMarker', this.$store.state.tempMarkers);

                // for (let pName in this.$store.state.tempMarkers) {
                //     if(Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers, pName)) {
                //         console.log('GcsMap-mounted-tempMarker', pName, this.$store.state.tempMarkers);
                //         if (pName !== 'unknown') {
                //             this.$store.state.tempMarkers[pName].forEach((pos) => {
                //                 if (!Object.prototype.hasOwnProperty.call(this.gotoLines, pName)) {
                //                     this.gotoLines[pName] = [];
                //                     this.gotoLinesOptions[pName] = {};
                //                     this.gotoLinesOptions[pName].strokeColor = pos.m_icon.fillColor;
                //                     this.gotoLinesOptions[pName].strokeOpacity = 0.2;
                //                     this.gotoLinesOptions[pName].strokeWeight = 10;
                //                 }
                //
                //                 this.gotoLines[pName].push(pos);
                //
                //                 // let temp = JSON.parse(JSON.stringify(pos.m_label));
                //                 // pos.m_label = null;
                //                 // pos.m_label = JSON.parse(JSON.stringify(temp));
                //                 // pos.m_label.text = String(count - 1);
                //             });
                //         }
                //     }
                //
                //     console.log('gotoLines', this.gotoLines);
                // }
            });

            EventBus.$on('updatePlaneMarker', (payload) => {
                // this.$refs.mapRef.$mapPromise.then((map) => {
                //     this.$store.state.defaultDroneIcon.scale = (map.getZoom() < 15)?(1.4/15):(1.4/map.getZoom());
                //     this.scaleDroneIcon = (map.getZoom() < 15)?(1.4/15):(1.4/map.getZoom());
                // });

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

            // EventBus.$on('draw-gotoLines', (payload) => {
            //     let dName = payload.dName
            //     if (dName !== 'unknown') {
            //         this.$store.state.tempMarkers[dName].forEach((pos) => {
            //             if (!Object.prototype.hasOwnProperty.call(this.gotoLines, dName)) {
            //                 this.gotoLines[dName] = [];
            //                 this.gotoLinesOptions[dName] = {};
            //                 this.gotoLinesOptions[dName].strokeColor = pos.m_icon.fillColor;
            //                 this.gotoLinesOptions[dName].strokeOpacity = 0.2;
            //                 this.gotoLinesOptions[dName].strokeWeight = 10;
            //             }
            //
            //             this.gotoLines[dName].push(pos);
            //         });
            //     }
            // });

            EventBus.$on('updateDroneMarker', (payload) => {

                var topRight = this.map.getProjection().fromLatLngToPoint(this.map.getBounds().getNorthEast());
                var bottomLeft = this.map.getProjection().fromLatLngToPoint(this.map.getBounds().getSouthWest());
                var scale = Math.pow(2, this.map.getZoom());
                var worldPoint = this.map.getProjection().fromLatLngToPoint({lat:payload.lat, lng:payload.lng});
                //console.log(new this.google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale));

                let _payload = {};
                _payload.name = payload.name;
                _payload.scale = scale;
                _payload.x = (worldPoint.x - bottomLeft.x) * scale;
                _payload.y = (worldPoint.y - topRight.y) * scale;
                _payload.alt = payload.alt;
                EventBus.$emit('do-draw-DroneCommand', _payload);

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


                // this.$refs.mapRef.$mapPromise.then((map) => {
                //     this.$store.state.defaultDroneIcon.scale = (map.getZoom() < 15)?(1.4/15):(1.4/map.getZoom());
                //     this.scaleDroneIcon = (map.getZoom() < 15)?(1.4/15):(1.4/map.getZoom());
                // });

                // if(!Object.prototype.hasOwnProperty.call(this.droneMarkers, payload.name)) {
                //     this.droneMarkers[payload.name] = {};
                //     this.droneMarkers[payload.name].selected = false;
                // }
                //
                // this.droneMarkers[payload.name].name = payload.name;
                // this.droneMarkers[payload.name].lat = payload.lat;
                // this.droneMarkers[payload.name].lng = payload.lng;
                // this.droneMarkers[payload.name].alt = payload.alt;
                // this.droneMarkers[payload.name].icon = null;
                // this.droneMarkers[payload.name].icon = {};
                //
                // this.droneMarkers[payload.name].icon = JSON.parse(JSON.stringify(this.$store.state.defaultDroneIcon));
                //
                // if(this.$store.state.drone_infos[payload.name].targeted) {
                //     this.droneMarkers[payload.name].selected = true;
                //     this.droneMarkers[payload.name].icon.strokeWeight = 2;
                //     this.droneMarkers[payload.name].icon.strokeColor = 'springgreen';
                // }
                // else {
                //     this.droneMarkers[payload.name].selected = false;
                //     this.droneMarkers[payload.name].icon.strokeWeight = 1;
                //     this.droneMarkers[payload.name].icon.strokeColor = 'grey';
                // }
                //
                //
                // this.droneMarkers[payload.name].color = this.$store.state.drone_infos[payload.name].color;
                // if(payload.iconArming === 'mdi-airplane') {
                //     this.droneMarkers[payload.name].icon.fillColor = this.$store.state.drone_infos[payload.name].color;
                // }
                // else {
                //     this.droneMarkers[payload.name].icon.fillColor = '#E0E0E0';
                // }
                //
                // this.droneMarkers[payload.name].home_position
                // this.droneMarkers[payload.name].icon.rotation = payload.heading;
                // this.droneMarkers[payload.name].label = null;
                // this.droneMarkers[payload.name].label = {};
                // this.droneMarkers[payload.name].label = JSON.parse(JSON.stringify(this.$store.state.defaultDroneLabel));
                // this.droneMarkers[payload.name].label.fontSize = '14px'
                // this.droneMarkers[payload.name].label.text = payload.name.slice(0, 1).toUpperCase() + ':' + String(this.droneMarkers[payload.name].alt.toFixed(0));
                //
                // // let temp = JSON.parse(JSON.stringify(this.droneMarkers));
                // // this.droneMarkers = null;
                // // this.droneMarkers = {};
                // this.droneMarkers = this.clone(this.droneMarkers);

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
            // EventBus.$off('do-drawLineAllTarget');
            EventBus.$off('do-drawMovingLines');
            EventBus.$off('do-targetTempMarker');
            //EventBus.$off('do-targetDroneMarker');
            EventBus.$off('gcs-map-ready');
            EventBus.$off('updateDroneMarker');
            EventBus.$off('clearDroneMarker');
            EventBus.$off('on-message-handler-gcsmap');
            EventBus.$off('doBroadcastRegisterMaker');
            EventBus.$off('doBroadcastDeleteMaker');

            EventBus.$off('updatePlaneMarker');
            EventBus.$off('clearPlaneMarker');
            EventBus.$off('clearAllPlaneMarker');
            // EventBus.$off('draw-gotoLines');

            EventBus.$off('do-update-survey-angle-GcsMap');
            EventBus.$off('do-update-survey-dir-GcsMap');
            EventBus.$off('do-update-survey-gap-GcsMap');
            EventBus.$off('do-update-survey-alt-GcsMap');
            EventBus.$off('do-update-way-of-survey-GcsMap');
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
