<template>
    <div>
        <v-row no-gutters>
            <v-col cols="12">
                <v-card flat tile class="info_markers" v-if="curInfoTempMarkerFlag">
                    <InfoTempMarker v-model="curInfoTempMarkerFlag"
                                :marker-name="curNameMarker"
                                :marker-index="curIndexMarker"
                                :marker="curSelectedMarker"
                    ></InfoTempMarker>
                </v-card>
                <v-card flat tile class="info_markers" v-if="curInfoSurveyMarkerFlag">
                    <InfoSurveyMarker
                        v-model="curInfoSurveyMarkerFlag"
                        :marker-name="curNameMarker"
                        :marker-index="curIndexMarker"
                    ></InfoSurveyMarker>
                </v-card>
                <v-card flat tile class="info_markers" v-if="curLossMarkerFlag">
                    <InfoLossMarker
                        v-model="curLossMarkerFlag"
                        :marker-index="curIndexMarker"
                    ></InfoLossMarker>
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
                        v-if="prepared"
                        ref="mapRef" :center="center"
                        :zoom="18"
                        :mapTypeId="myMapTypeId"
                        :heading="mapHeading"
                        :restriction="{
                            strictBounds: false,
                        }"
                        :style="myGcsStyle"
                        :options="{
                            disableDefaultUI: true, gestureHandling: 'greedy', disableDoubleClickZoom: true, minZoom: 1, maxZoom: 30,
                            streetViewControl: false, mapId:'3ce830ad992810c1',
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
                            v-for="(p, pIndex) in $store.state.loss_lte_infos" :key="'loss_lte_infos-'+pIndex"
                            @dblclick="updataLossMarker($event, p, pIndex)"
                            :position="p"
                            :clickable="false"
                            :draggable="false"
                            :title="pIndex"
                            :icon="{
                                path: $store.state.iconSourceLossMarker.icon[4],
                                fillColor: 'black',
                                fillOpacity: 1,
                                strokeWeight: 1,
                                strokeColor: 'white',
                                rotation: 0,
                                scale: 0.06,
                                anchor: {x: $store.state.iconSourceLossMarker.icon[0] / 2, y: $store.state.iconSourceLossMarker.icon[1]},
                                labelOrigin: {x: $store.state.iconSourceLossMarker.icon[0] / 2, y: 0},
                            }"
                            :label="{
                                text: String(p.alt),
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 'normal'
                            }"
                        />

                        <GmapMarker
                            v-for="(p, pIndex) in planeMarkers" :key="'targetPlaneMarker_'+pIndex"
                            :position="{lat: p.lat, lng: p.lng}"
                            :clickable="false"
                            :draggable="false"
                            :icon="p.icon"
                            :label="p.label"
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
<!--                                        @dragend="updateTempMarkerPosition($event, mIndex, pIndex)"-->
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
                                @dragend="updateTempMarkerPosition($event, 'unknown', pIndex)"
                                :title="'unknown'  + ':' + pos.alt"
                                :icon="{
                                    path: $store.state.iconSourceMarker.icon[4],
                                    fillColor: '#9E9E9E',
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

                            <div v-if="Object.prototype.hasOwnProperty.call($store.state.surveyMarkers, 'unknown')">
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
<!--                                    <GmapMarker-->
<!--                                        :position="{lat:survey.pathLines[0].lat, lng:survey.pathLines[0].lng}"-->
<!--                                        :icon="{-->
<!--                                                    path: $store.state.iconSourceSurveyMarker.icon[4],-->
<!--                                                    fillColor: '#FF5722',-->
<!--                                                    fillOpacity: 0.6,-->
<!--                                                    strokeWeight: 0.8,-->
<!--                                                    strokeColor: 'black',-->
<!--                                                    rotation: 0,-->
<!--                                                    scale: 0.05,-->
<!--                                                    anchor: {x: $store.state.iconSourceSurveyMarker.icon[0]/2, y: $store.state.iconSourceSurveyMarker.icon[1]},-->
<!--                                                    labelOrigin: {x: $store.state.iconSourceSurveyMarker.icon[0]/2, y: $store.state.iconSourceSurveyMarker.icon[1]/2},-->
<!--                                                }"-->
<!--                                        :label="{-->
<!--                                                    text: '0',-->
<!--                                                    color: 'white',-->
<!--                                                    fontSize: '14px',-->
<!--                                                    fontWeight: 'bold',-->
<!--                                                }"-->
<!--                                    />-->
<!--                                    <GmapMarker-->
<!--                                        :position="{lat:survey.pathLines[survey.pathLines.length-1].lat, lng:survey.pathLines[survey.pathLines.length-1].lng}"-->
<!--                                        :icon="{-->
<!--                                            path: $store.state.iconSourceSurveyMarker.icon[4],-->
<!--                                            fillColor: '#607D8B',-->
<!--                                            fillOpacity: 0.6,-->
<!--                                            strokeWeight: 0.8,-->
<!--                                            strokeColor: 'black',-->
<!--                                            rotation: 0,-->
<!--                                            scale: 0.05,-->
<!--                                            anchor: {x: $store.state.iconSourceSurveyMarker.icon[0]/2, y: $store.state.iconSourceSurveyMarker.icon[1]},-->
<!--                                            labelOrigin: {x: $store.state.iconSourceSurveyMarker.icon[0]/2, y: $store.state.iconSourceSurveyMarker.icon[1]/2},-->
<!--                                        }"-->
<!--                                        :label="{-->
<!--                                            text: String(survey.pathLines.length-1),-->
<!--                                            color: 'white',-->
<!--                                            fontSize: '14px',-->
<!--                                            fontWeight: 'bold',-->
<!--                                        }"-->
<!--                                    />-->
                                </div>
                            </div>

                            <div v-for="drone in $store.state.drone_infos" :key="'droneInfos_'+drone.name">
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
                                            rotation: (360+drone.heading-45-map.getHeading())%360,
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

                                    <GmapMarker
                                        :position="drone.pausePosition"
                                        :clickable="false"
                                        :draggable="false"
                                        :icon="{
                                            path: $store.state.iconSourcePauseMarker.icon[4],
                                            fillColor: drone.color,
                                            fillOpacity: 1,
                                            strokeWeight: 1,
                                            strokeColor: 'white',
                                            rotation: 0,
                                            scale: 0.05,
                                            anchor: {x: $store.state.iconSourcePauseMarker.icon[0] / 2, y: $store.state.iconSourcePauseMarker.icon[1] / 2},
                                            labelOrigin: {x: $store.state.iconSourcePauseMarker.icon[0] / 2, y: 0},
                                            zIndex: 1
                                        }"
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
                                        :path="$store.state.tempMarkers[drone.name]"
                                        :options="{
                                            strokeColor: drone.color,
                                            strokeOpacity: 0.2,
                                            strokeWeight: 10,
                                            zIndex: 0
                                        }"
                                    ></GmapPolyline>

                                    <div v-if="Object.prototype.hasOwnProperty.call($store.state.tempMarkers, drone.name)">
                                        <div v-for="(pos, pIndex) in $store.state.tempMarkers[drone.name]" :key="'marker'+pIndex">
                                            <GmapMarker
                                                :position="{lat:pos.lat, lng:pos.lng}"
                                                :clickable="true"
                                                :draggable="true"
                                                @dblclick="selectTempMarker($event, drone.name, pIndex)"
                                                @click="targetTempMarker($event, drone.name, pIndex)"
                                                @dragend="updateTempMarkerPosition($event, drone.name, pIndex)"
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
                                                    zIndex: 4
                                                }"
                                                :label="{
                                                    text: pIndex + ':' + pos.alt,
                                                    color: 'white',
                                                    fontSize: '14px',
                                                    fontWeight: 'normal'
                                                }"
                                            />

                                            <div v-if="drone.targeted && pos.targeted">
                                                <GmapPolyline
                                                    :path="[
                                                        {
                                                            lat: drone.lat,
                                                            lng: drone.lng,
                                                        },
                                                        {
                                                            lat: pos.lat,
                                                            lng: pos.lng,
                                                        }
                                                    ]"
                                                    :options="{
                                                        strokeColor: drone.color,
                                                        strokeOpacity: 0.7,
                                                        strokeWeight: 4,
                                                        zIndex: 0
                                                    }"
                                                ></GmapPolyline>

                                                <GmapCircle
                                                    v-if="$store.state.active_tab === '선회'"
                                                    :center="{
                                                        lat: pos.lat,
                                                        lng: pos.lng,
                                                    }"
                                                    :radius="parseInt(drone.targetRadius)"
                                                    :options="{
                                                        strokeColor: drone.color,
                                                        strokeOpacity: 0.7,
                                                        strokeWeight: 4,
                                                        zIndex: 0
                                                    }"
                                                    @mousemove="calcDistance"
                                                ></GmapCircle>
                                            </div>

<!--                                        <div v-if="$store.state.tempMarkers[drone.name][pIndex].type === 'Circle'">-->
<!--                                            <GmapCircle-->
<!--                                                :center="{lat: $store.state.tempMarkers[drone.name][pIndex].lat, lng: $store.state.tempMarkers[drone.name][pIndex].lng}"-->
<!--                                                :radius="50"-->
<!--                                                :options="{fillOpacity: 0, strokeColor: '#D50000', strokeOpacity: 1, strokeWeight: 1}"-->
<!--                                            ></GmapCircle>-->
<!--                                        </div>-->
                                    </div>
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

                                    <div v-if="Object.prototype.hasOwnProperty.call($store.state.surveyMarkers, drone.name)">
                                        <div v-for="(survey, pIndex) in $store.state.surveyMarkers[drone.name]" :key="'survey'+pIndex">
                                            <GmapPolygon
                                                @paths_changed="showNewPolygon($event, drone.name, pIndex)"
                                                @dblclick="updataSurveyParam($event, drone.name, pIndex)"
                                                @click="targetSurveyPolygon($event, drone.name, pIndex)"
                                                @mousemove="calcDistance"
                                                :paths="survey.paths"
                                                :options="{
                                                    strokeColor: (survey.selected)?'#76FF03':((survey.targeted)?'#FFFF00':drone.color),
                                                    strokeOpacity: (survey.selected)?0.8:((survey.targeted)?0.9:0.5),
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
                                            <div v-if="drone.targeted && survey.targeted">-->
                                                <GmapPolyline
                                                    :path="[
                                                        {
                                                            lat: drone.lat,
                                                            lng: drone.lng,
                                                        },
                                                        {
                                                            lat: survey.pathLines[0].lat,
                                                            lng: survey.pathLines[0].lng
                                                        }
                                                    ]"
                                                    :options="{
                                                        strokeColor: drone.color,
                                                        strokeOpacity: 0.7,
                                                        strokeWeight: 4
                                                    }"
                                                ></GmapPolyline>
                                            </div>
<!--                                            <div v-if="false">-->
<!--                                                <div v-for="(pos, pIndex) in survey.pathLines" :key="'survey'+pIndex">-->
<!--                                                    <GmapMarker-->
<!--                                                        :position="{lat:pos.lat, lng:pos.lng}"-->
<!--                                                        :icon="{-->
<!--                                                            path: $store.state.iconSourceSurveyMarker.icon[4],-->
<!--                                                            fillColor: (pIndex===0)?'#FF5722':'#607D8B',-->
<!--                                                            fillOpacity: 0.6,-->
<!--                                                            strokeWeight: 0.8,-->
<!--                                                            strokeColor: 'black',-->
<!--                                                            rotation: 0,-->
<!--                                                            scale: 0.05,-->
<!--                                                            anchor: {x: $store.state.iconSourceSurveyMarker.icon[0]/2, y: $store.state.iconSourceSurveyMarker.icon[1]},-->
<!--                                                            labelOrigin: {x: $store.state.iconSourceSurveyMarker.icon[0]/2, y: $store.state.iconSourceSurveyMarker.icon[1]/2},-->
<!--                                                        }"-->
<!--                                                        :label="{-->
<!--                                                            text: String(pIndex),-->
<!--                                                            color: 'white',-->
<!--                                                            fontSize: '14px',-->
<!--                                                            fontWeight: 'bold',-->
<!--                                                        }"-->
<!--                                                    />-->
<!--                                                </div>-->
<!--                                            </div>-->
<!--                                            <div v-if="drone.targeted && survey.targeted">-->
<!--                                                <GmapPolyline-->
<!--                                                    :path="[-->
<!--                                                        {-->
<!--                                                            lat: drone.lat,-->
<!--                                                            lng: drone.lng,-->
<!--                                                        },-->
<!--                                                        {-->
<!--                                                            lat: survey.pathLines[0].lat,-->
<!--                                                            lng: survey.pathLines[0].lng-->
<!--                                                        }-->
<!--                                                    ]"-->
<!--                                                    :options="{-->
<!--                                                        strokeColor: drone.color,-->
<!--                                                        strokeOpacity: 0.7,-->
<!--                                                        strokeWeight: 4-->
<!--                                                    }"-->
<!--                                                ></GmapPolyline>-->
<!--                                            </div>-->
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

                            <div v-for="(line, dName) in $store.state.missionLines" :key="'missionLines_'+dName">
                                <div v-if="$store.state.drone_infos[dName].selected">
                                    <GmapPolyline
                                        :path.sync="line.path"
                                        :options="{
                                                strokeColor: 'white',
                                                strokeOpacity: 1,
                                                strokeWeight: 4,
                                                zIndex: 0
                                            }"
                                    ></GmapPolyline>
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

<!--<script src="../../../gmap/src/main.js"></script>-->

<script>

    import InfoTempMarker from "./InfoTempMarker";
    import InfoSurveyMarker from "./InfoSurveyMarker";
    import EventBus from "@/EventBus";
    import {nanoid} from "nanoid";
    import {gmapApi} from 'vue2-google-maps';
    import axios from "axios";
    import InfoLossMarker from "@/components/InfoLossMarker";
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
            InfoLossMarker,
            InfoTempMarker,
            InfoSurveyMarker,
        },

        data () {
            return {
                mapHeading: 0,
                preZoomLevel: 18,
                myMapTypeId: "satellite",
                datum: {targeted: false, lat:0.0, lng:0.0},
                scaleDroneIcon: 0.1,
                turningDir: [90, 90, -90, -90],
                idUpdateTimer: null,
                idPostTimer: null,
                lineArrow: null,
                curElevation: 0,
                zoom: 18,
                curInfoTempMarkerFlag: false,
                curInfoSurveyMarkerFlag: false,
                curLossMarkerFlag: false,
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
                movingLines: {},
                movingLinesOptions: {},
                lines: [],
                center: {
                    lat: 37.40423134053018,
                    lng: 127.16050533784832
                },
                prepared: true,
                myHeight: window.innerHeight-50,
                myWidth: window.innerWidth,
                readyFlagGcsMap: false,
                droneMarkers: {},
                planeMarkers: {},

                map: null,

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

            curInfoTempMarkerFlag: function (newVal, oldVal) {
                if(oldVal) {
                    console.log('curInfoTempMarkerFlag', oldVal, '->', newVal);
                    for(let dName in this.$store.state.drone_infos) {
                        if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                            if(dName === 'unknown' || this.$store.state.drone_infos[dName].selected) {
                                if(Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers, dName)) {
                                    this.$store.state.drone_infos[dName].curTargetedTempMarkerIndex = -1;
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

            curInfoSurveyMarkerFlag: function (newVal, oldVal) {
                if(oldVal) {
                    console.log('curInfoSurveyMarkerFlag', oldVal, '->', newVal);
                    for(let dName in this.$store.state.drone_infos) {
                        if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                            if(dName === 'unknown' || this.$store.state.drone_infos[dName].selected) {
                                if(Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers, dName)) {
                                    this.$store.state.drone_infos[dName].curTargetedSurveyMarkerIndex = -1;
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

                let area = this.google.maps.geometry.spherical.computeArea(this.$store.state.surveyMarkers[dName][pIndex].paths);
                this.$store.state.surveyMarkers[dName][pIndex].area = area.toFixed(1);
                console.log('computeArea = ', area.toFixed(1), '㎡');

                const elevator = new this.google.maps.ElevationService();

                // Initiate the location request
                elevator.getElevationAlongPath({
                    path: this.$store.state.surveyMarkers[dName][pIndex].pathLines,
                    samples: 256,
                })
                .then(({ results }) => {
                    if (results[0]) {
                        this.$store.state.surveyMarkers[dName][pIndex].elevations = [];
                        this.$store.state.surveyMarkers[dName][pIndex].elevations_location = [];

                        //console.log('getElevationAlongPath', results);

                        //console.log(this.$store.state.drone_infos[dName].absolute_alt);

                        //let diff_alt = this.$store.state.drone_infos[dName].alt - this.$store.state.drone_infos[dName].absolute_alt;

                        for (let i = 0; i < results.length; i++) {
                            //console.log(results[i].elevation, results[i].location.lat(), results[i].location.lng());

                            //this.$store.state.surveyMarkers[dName][pIndex].elevations.push((results[i].elevation - diff_alt));
                            this.$store.state.surveyMarkers[dName][pIndex].elevations.push((results[i].elevation));
                            this.$store.state.surveyMarkers[dName][pIndex].elevations_location.push({lat: results[i].location.lat(), lng: results[i].location.lng()});
                        }
                    }
                    else {
                        console.log("No results found");
                    }

                    EventBus.$emit('on-update-info-survey-marker');
                })
                .catch((e) => {
                    console.log(location, "Elevation service failed due to: " + e);

                    EventBus.$emit('on-update-info-survey-marker');
                });
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

                    if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        this.$store.state.drone_infos[dName].curMissionItemReached = 0;
                    }

                    if(this.idPostTimer !== null) {
                        clearTimeout(this.idPostTimer);
                    }

                    this.idPostTimer = setTimeout((dName) => {
                        this.postCinSurveyMarkerInfoToMobius(dName);
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
                    this.$store.state.tempMarkers['unknown'] = [];

                    this.postCntTempMarkerInfosToMobius('unknown', () => {
                        console.log('postCntTempMarkerInfosToMobius', 'unknown');
                    });
                }

                const elevator = new this.google.maps.ElevationService();

                console.log('elevation-confirmAddTempMarker', this.$store.state.tempMarkers);
                let lat = this.click_lat;
                let lng = this.click_lng;

                this.displayLocationElevation({lat:lat, lng:lng}, elevator, (val) => {
                    console.log('__________________________________confirmAddTempMarker', 'curElevation', val);

                    let marker = {};
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
                    marker.selected = false;
                    marker.targeted = false;
                    marker.color = '#9E9E9E';

                    this.$store.state.tempMarkers['unknown'].push(marker);

                    let temp = JSON.parse(JSON.stringify(this.$store.state.tempMarkers));
                    this.$store.state.tempMarkers = null;
                    this.$store.state.tempMarkers = JSON.parse(JSON.stringify(temp));

                    this.postCinTempMarkerInfoToMobius('unknown');

                    this.doBroadcastConfirmAddTempMarker(JSON.parse(JSON.stringify(marker)));

                    this.$store.state.adding = false;
                });
            },

            postCntSurveyMarkerInfosToMobius(dName, callback) {
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

            postCinSurveyMarkerInfoToMobius(dName) {
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

            postCinTempMarkerInfoToMobius(dName) {
                axios({
                    validateStatus: (status) => {
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
                    function (res) {
                        console.log('-------------------------------------------------------postCinTempMarkerInfoToMobius-axios', res.data);
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
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
                    function (res) {
                        console.log('-------------------------------------------------------postCinTempMarkerInfoToMobius-axios', res.data);
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

                    this.postCntSurveyMarkerInfosToMobius('unknown', () => {
                        console.log('postCntSurveyMarkerInfosToMobius', 'unknown');
                    });
                }

                let lat = this.click_lat;
                let lng = this.click_lng;

                let survey = JSON.parse(JSON.stringify(this.$store.state.defaultPosition));
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
                survey.flyAlt = Array(256).fill(150);
                survey.takeoffAlt = Array(256).fill(0);
                survey.offsetAlt = Array(256).fill(0);
                survey.flyAltType = '상대고도';
                survey.elevations = [];
                survey.elevations_location = [];

                this.$store.state.surveyMarkers['unknown'].push(survey);

                this.updateSurveyPath('unknown', this.$store.state.surveyMarkers.unknown.length-1, 20, 0, 1);

                this.$store.state.adding = false;

                this.postCinSurveyMarkerInfoToMobius('unknown', () => {
                    this.doBroadcastConfirmAddSurveyMarker(JSON.parse(JSON.stringify(survey)));
                });

                this.$forceUpdate();
            },

            cancelMarker() {
                this.context_flag = false;

                if (this.$store.state.adding) {
                    this.$store.state.tempMarkers['unknown'].pop();
                    this.$store.state.tempPayload = {};
                }

                this.$store.state.adding = false;
            },

            addingMarker(e) {

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

                this.curInfoTempMarkerFlag = false;
                this.curInfoSurveyMarkerFlag = false;

                for(let dName in this.$store.state.drone_infos) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        if(dName === 'unknown' || this.$store.state.drone_infos[dName].selected) {
                            if(Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers, dName)) {
                                this.$store.state.drone_infos[dName].curTargetedTempMarkerIndex = -1;
                                this.$store.state.tempMarkers[dName].forEach((marker) => {
                                    marker.selected = false;
                                    marker.targeted = false;
                                });
                            }

                            if(Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers, dName)) {
                                this.$store.state.drone_infos[dName].curTargetedSurveyMarkerIndex = -1;
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

                this.context_flag = true;
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

                this.curInfoTempMarkerFlag = false;
                this.curInfoSurveyMarkerFlag = false;


                console.log('curNameMarker', this.curNameMarker);
                console.log('this.$store.state.surveyMarkers', this.$store.state.surveyMarkers);

                this.curInfoTempMarkerFlag = false;
                this.curInfoSurveyMarkerFlag = false;

                for(let dName in this.$store.state.drone_infos) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        if(dName === 'unknown' || this.$store.state.drone_infos[dName].selected) {
                            if(Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers, dName)) {
                                this.$store.state.drone_infos[dName].curTargetedTempMarkerIndex = -1;
                                this.$store.state.tempMarkers[dName].forEach((marker) => {
                                    marker.selected = false;
                                    marker.targeted = false;
                                });
                            }

                            if(Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers, dName)) {
                                this.$store.state.drone_infos[dName].curTargetedSurveyMarkerIndex = -1;
                                this.$store.state.surveyMarkers[dName].forEach((marker) => {
                                    marker.selected = false;
                                    marker.targeted = false;
                                    marker.polygonDraggable = false;
                                    marker.polygonEditable = false;
                                });
                            }

                            this.$store.state.drone_infos[dName].targeted = false;
                        }
                    }
                }

                setTimeout(() => {
                    this.$store.state.drone_command_prepared = false;
                }, 100);

                this.cancelMarker();
            },

            changeMapId(e) {
                const maxZoomService = new this.google.maps.MaxZoomService();

                maxZoomService.getMaxZoomAtLatLng(this.center, (result) => {
                    if (result.status !== "OK") {
                        console.log("Error in MaxZoomService");
                    } else {
                        let zoomLevel = e;
                        console.log('zoomLevel: ' + zoomLevel);

                        if(zoomLevel >= result.zoom) {
                            this.myMapTypeId = 'roadmap';
                            this.scaleDroneIcon = (0.1 - ((zoomLevel-20)/100));
                        }
                        else {
                            this.myMapTypeId = 'satellite';
                            this.scaleDroneIcon = 0.1;
                        }

                        this.preZoomLevel = e;
                    }
                });
            },

            calcDistance(e) {
                if(this.datum.targeted) {
                    this.datum.curLat = e.latLng.lat();
                    this.datum.curLng = e.latLng.lng();
                    EventBus.$emit('do-calcDistance', this.datum);
                }
            },

            targetSurveyPolygon(e, dName, pIndex) {
                if(!this.$store.state.adding) {

                    this.curInfoSurveyMarkerFlag = false;

                    this.$store.state.drone_infos[dName].curTargetedTempMarkerIndex = -1;
                    if (Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers, dName)) {
                        this.$store.state.tempMarkers[dName].forEach((marker) => {
                            marker.selected = false;
                            marker.targeted = false;
                        });
                    }

                    for (var d_name in this.$store.state.drone_infos) {
                        if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, d_name)) {
                            if (d_name === 'unknown' || this.$store.state.drone_infos[d_name].selected) {
                                if (Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers, d_name)) {
                                    this.$store.state.surveyMarkers[d_name].forEach((marker, index) => {
                                        marker.selected = false;

                                        if (pIndex !== index) {
                                            marker.targeted = false;
                                        }

                                        marker.polygonDraggable = false;
                                        marker.polygonEditable = false;
                                    });
                                }
                            }
                        }
                    }

                    this.$store.state.surveyMarkers[dName][pIndex].targeted = !this.$store.state.surveyMarkers[dName][pIndex].targeted;

                    this.$store.state.drone_infos[dName].curTargetedSurveyMarkerIndex = -1;
                    if (this.$store.state.surveyMarkers[dName][pIndex].targeted) {
                        this.$store.state.drone_infos[dName].curTargetedSurveyMarkerIndex = pIndex;
                    }

                    if (this.$store.state.drone_infos[dName].selected && this.$store.state.drone_infos[dName].targeted) {
                        this.$store.state.drone_command_prepared = false;
                        setTimeout(() => {
                            this.$store.state.drone_command_prepared = true;
                        }, 10);
                    }

                    this.$forceUpdate();
                }
            },

            updataSurveyParam(e, dName, pIndex) {
                if(!this.$store.state.adding) {
                    console.log('updataSurveyParam', dName, pIndex, this.$store.state.surveyMarkers[dName][pIndex]);

                    this.curInfoSurveyMarkerFlag = false;
                    this.curInfoTempMarkerFlag = false;

                    for(let dName in this.$store.state.drone_infos) {
                        if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                            if (dName === 'unknown' || this.$store.state.drone_infos[dName].selected) {
                                if (Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers, dName)) {
                                    this.$store.state.drone_infos[dName].curTargetedTempMarkerIndex = -1;
                                    this.$store.state.tempMarkers[dName].forEach((marker) => {
                                        marker.selected = false;
                                        marker.targeted = false;
                                    });
                                }

                                if(Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers, dName)) {
                                    this.$store.state.drone_infos[dName].curTargetedSurveyMarkerIndex = -1;
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
                        this.curInfoSurveyMarkerFlag = true;
                    }, 10);
                }
            },

            updataLossMarker(e, p, pIndex) {
                if(!this.$store.state.adding) {
                    console.log('updataLossMarker', p, pIndex);

                    this.curLossMarkerFlag = false;

                    this.$forceUpdate();

                    setTimeout(() => {
                        this.curIndexMarker = pIndex;
                        this.curLossMarkerFlag = true;
                    }, 10)
                }
            },

            updateTempMarkerPosition(e, dName, pIndex) {
                if(!this.$store.state.adding) {
                    let lat = e.latLng.lat();
                    let lng = e.latLng.lng();

                    const elevator = new this.google.maps.ElevationService();
                    this.displayLocationElevation({lat: lat, lng: lng}, elevator, (elevation_val) => {
                        console.log('__________________________________updateTempMarkerPosition - elevation_val', elevation_val);

                        this.$store.state.tempMarkers[dName][pIndex].lat = lat;
                        this.$store.state.tempMarkers[dName][pIndex].lng = lng;
                        this.$store.state.tempMarkers[dName][pIndex].elevation = elevation_val;

                        let temp = JSON.parse(JSON.stringify(this.$store.state.tempMarkers));
                        this.$store.state.tempMarkers = null;
                        this.$store.state.tempMarkers = JSON.parse(JSON.stringify(temp));

                        if(this.curInfoTempMarkerFlag) {
                            this.curInfoTempMarkerFlag = false;

                            this.$forceUpdate();

                            setTimeout(() => {
                                this.$store.state.tempMarkers[dName][pIndex].selected = true;
                                this.curSelectedMarker = this.$store.state.tempMarkers[dName][pIndex];
                                this.curIndexMarker = pIndex;
                                this.curNameMarker = dName;
                                this.curInfoTempMarkerFlag = true;
                            }, 10);
                        }

                        this.postCinTempMarkerInfoToMobius(dName);

                        let watchingPayload = {};
                        watchingPayload.broadcastMission = 'broadcastUpdateTempMarkerPosition';
                        watchingPayload.payload = {};
                        watchingPayload.payload.pName = dName;
                        watchingPayload.payload.pIndex = pIndex;
                        watchingPayload.payload.lat = lat;
                        watchingPayload.payload.lng = lng;
                        watchingPayload.payload.targeted = this.$store.state.tempMarkers[dName][pIndex].targeted;
                        watchingPayload.payload.selected = this.$store.state.tempMarkers[dName][pIndex].selected;
                        this.broadcast_gcsmap_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/gcsmap';
                        this.doPublish(this.broadcast_gcsmap_topic, JSON.stringify(watchingPayload));
                        this.$store.state.didIPublish = true;
                    });
                }
            },

            selectTempMarker(e, dName, pIndex) {
                if(!this.$store.state.adding) {
                    console.log('selectTempMarker', dName, pIndex, this.$store.state.tempMarkers[dName][pIndex]);

                    this.curInfoSurveyMarkerFlag = false;
                    this.curInfoTempMarkerFlag = false;

                    for(let dName in this.$store.state.drone_infos) {
                        if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                            if (dName === 'unknown' || this.$store.state.drone_infos[dName].selected) {
                                if(Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers, dName)) {
                                    if(Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers, dName)) {
                                        this.$store.state.drone_infos[dName].curTargetedSurveyMarkerIndex = -1;
                                        this.$store.state.surveyMarkers[dName].forEach((marker) => {
                                            marker.selected = false;
                                            marker.targeted = false;
                                            marker.polygonDraggable = false;
                                            marker.polygonEditable = false;
                                        });
                                    }

                                    if (Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers, dName)) {
                                        this.$store.state.drone_infos[dName].curTargetedTempMarkerIndex = -1;
                                        this.$store.state.tempMarkers[dName].forEach((marker) => {
                                            marker.selected = false;
                                            marker.targeted = false;
                                        });
                                    }
                                }
                            }
                        }
                    }

                    this.$forceUpdate();

                    setTimeout(() => {
                        this.$store.state.tempMarkers[dName][pIndex].selected = true;
                        this.curSelectedMarker = this.$store.state.tempMarkers[dName][pIndex];
                        this.curIndexMarker = pIndex;
                        this.curNameMarker = dName;
                        this.curInfoTempMarkerFlag = true;
                    }, 10);
                }
            },

            targetTempMarker(e, dName, pIndex) {
                if(!this.$store.state.adding) {
                    this.curInfoTempMarkerFlag = false;

                    if(!Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        this.$store.state.drone_infos[dName] = {};
                    }

                    this.$store.state.drone_infos[dName].curTargetedSurveyMarkerIndex = -1;

                    if(Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers, dName)) {
                        this.$store.state.surveyMarkers[dName].forEach((marker) => {
                            marker.selected = false;
                            marker.targeted = false;
                            marker.polygonDraggable = false;
                            marker.polygonEditable = false;
                        });
                    }

                    if (Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers, dName)) {
                        this.$store.state.tempMarkers[dName].forEach((marker, index) => {
                            marker.selected = false;

                            if(pIndex !== index) {
                                marker.targeted = false;
                            }
                        });
                    }

                    this.$store.state.tempMarkers[dName][pIndex].targeted = !this.$store.state.tempMarkers[dName][pIndex].targeted;

                    this.$store.state.drone_infos[dName].curTargetedTempMarkerIndex = -1;
                    if (this.$store.state.tempMarkers[dName][pIndex].targeted) {
                        this.$store.state.drone_infos[dName].curTargetedTempMarkerIndex = pIndex;

                        if(dName === 'unknown') {
                            this.datum.targeted = this.$store.state.tempMarkers[dName][pIndex].targeted;
                            this.datum.lat = this.$store.state.tempMarkers[dName][pIndex].lat;
                            this.datum.lng = this.$store.state.tempMarkers[dName][pIndex].lng;
                        }
                    }

                    if(this.$store.state.drone_infos[dName].selected && this.$store.state.drone_infos[dName].targeted) {
                        this.$store.state.drone_command_prepared = false;
                        setTimeout(() => {
                            this.$store.state.drone_command_prepared = true;
                        }, 10);
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

                this.$store.state.drone_command_prepared = false;
                for (let dName in this.$store.state.drone_infos) {
                    if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        if (this.$store.state.drone_infos[dName].selected && this.$store.state.drone_infos[dName].targeted) {
                            this.$store.state.drone_command_prepared = true;
                            break;
                        }
                    }
                }

                //EventBus.$emit('do-targetDrone');
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
            //         dMarker.icon.strokeColor = '#9E9E9E';
            //
            //     }
            //
            //     //if(this.$store.state.currentCommandTab === '이동' || this.$store.state.currentCommandTab === '선회') {
            //     for(let pIndex in this.$store.state.tempMarkers[dName]) {
            //         if (Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers[dName], pIndex)) {
            //             if (this.$store.state.tempMarkers[dName][pIndex].targeted) {
            //                 let payload = {};
            //                 payload.pName = dName;
            //                 payload.pIndex = pIndex;
            ////
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
            //                             payload = null;
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

            getCinSurveyMarkerInfoFromMobius(dName, callback) {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'get',
                    url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/SurveyMarkerInfos/' + dName + '/la',
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'SVue',
                        'Content-Type': 'application/json'
                    }
                }).then(
                    (res) => {

                        console.log('getCinSurveyMarkerInfoFromMobius', 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/SurveyMarkerInfos/' + dName + '/la', res.data['m2m:cin'].con);

                        if (res.status === 200) {
                            callback(res.status, res.data['m2m:cin'].con);
                        }
                        else {
                            callback(res.status, '');
                        }
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
            },

            getCinTempMarkerInfoFromMobius(dName, callback) {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'get',
                    url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/MarkerInfos/' + dName + '/la',
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'SVue',
                        'Content-Type': 'application/json'
                    }
                }).then(
                    (res) => {
                        console.log('getCinTempMarkerInfoFromMobius', 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/MarkerInfos/' + dName + '/la', res.data['m2m:cin'].con);

                        if (res.status === 200) {
                            callback(res.status, res.data['m2m:cin'].con);
                        }
                        else {
                            callback(res.status, '');
                        }
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
            },

            onMessageBroadcast(topic, message) {
                if(!this.$store.state.didIPublish) {
                    console.log(topic, message.toString());
                    try {
                        let watchingPayload = JSON.parse(message.toString());
                        if (watchingPayload.broadcastMission === 'broadcastUpdateTempMarkerPosition') {
                            let payload = watchingPayload.payload;

                            this.$store.state.tempMarkers[payload.pName][payload.pIndex].lat = payload.lat;
                            this.$store.state.tempMarkers[payload.pName][payload.pIndex].lng = payload.lng;
                            this.$store.state.tempMarkers[payload.pName][payload.pIndex].targeted = payload.targeted;
                            this.$store.state.tempMarkers[payload.pName][payload.pIndex].selected = payload.selected;

                            let temp = JSON.parse(JSON.stringify(this.$store.state.tempMarkers));
                            this.$store.state.tempMarkers = null;
                            this.$store.state.tempMarkers = JSON.parse(JSON.stringify(temp));
                            temp = null;
                        }
                        else if (watchingPayload.broadcastMission === 'confirmAddTempMarker') {
                            let dName = watchingPayload.payload.dName;
                            this.getCinTempMarkerInfoFromMobius(dName, (status, con) => {
                                if(status === 200) {
                                    this.$store.state.tempMarkers[dName] = null;
                                    this.$store.state.tempMarkers[dName] = JSON.parse(JSON.stringify(con));
                                }
                            });
                        }
                        else if (watchingPayload.broadcastMission === 'confirmAddSurveyMarker') {
                            let dName = watchingPayload.payload.dName;
                            this.getCinSurveyMarkerInfoFromMobius(dName, (status, con) => {
                                if(status === 200) {
                                    this.$store.state.surveyMarkers[dName] = null;
                                    this.$store.state.surveyMarkers[dName] = JSON.parse(JSON.stringify(con));
                                }
                            });
                        }
                        else if (watchingPayload.broadcastMission === 'broadcastRegisterTempMarker') {
                            let dName = watchingPayload.dName;
                            this.getCinTempMarkerInfoFromMobius(dName, (status, con) => {
                                if(status === 200) {
                                    this.$store.state.tempMarkers[dName] = null;
                                    this.$store.state.tempMarkers[dName] = JSON.parse(JSON.stringify(con));
                                }
                            });
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

            doBroadcastConfirmAddTempMarker(payload) {
                let watchingPayload = {};
                watchingPayload.broadcastMission = 'confirmAddTempMarker';
                watchingPayload.payload = payload;

                this.broadcast_gcsmap_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/gcsmap';
                console.log('broadcast_gcsmap_topic', this.broadcast_gcsmap_topic, '-', JSON.stringify(watchingPayload));
                this.doPublish(this.broadcast_gcsmap_topic, JSON.stringify(watchingPayload));

                this.$store.state.didIPublish = true;
            },

            doBroadcastConfirmAddSurveyMarker(payload) {
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
                //     this.$store.state.defaultDroneIcon.scale = (map.getZoom() < 15)?(1.4/15):(1.4/map.getZoom());
                    //this.scaleDroneIcon = (map.getZoom() < 15)?(1.4/15):(1.4/map.getZoom());

                // });
            });



            // setInterval(() => {
            //     for (let idx in this.planeMarkers) {
            //
            //         if ((this.preADSB[idx].lat == this.planeMarkers[idx].lat) && (this.preADSB[idx].lng == this.planeMarkers[idx].lng)) {
            //             if (this.count[idx] > 20) {
            //                 EventBus.$emit('clearPlaneMarker', this.planeMarkers[idx].ICAO_address);
            //             }
            //             this.count[idx]++;
            //             // EventBus.$emit('clearAllPlaneMarker', '');
            //         } else {
            //             this.preADSB[idx].ICAO_address = this.planeMarkers[idx].ICAO_address;
            //             this.preADSB[idx].lat = this.planeMarkers[idx].lat;
            //             this.preADSB[idx].lng = this.planeMarkers[idx].lng;
            //         }
            //
            //     }
            //
            //     console.log(this.mapHeading);
            //
            //     //this.prepared = !this.prepared;
            //     this.mapHeading += 20;
            //     this.mapHeading %= 360;
            //
            //     this.map.setHeading(this.mapHeading);
            //
            //     this.$forceUpdate();
            //
            // }, 5000);

            EventBus.$on('do-update-survey-GcsMap', (payload) => {
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

                this.updateSurveyPath(dName, pIndex, gap, angle, dir);

                this.postCinSurveyMarkerInfoToMobius(dName);
            });

            EventBus.$on('do-centerCurrentPosition', (positionCenter) => {
                this.center = positionCenter;
            });

            EventBus.$on('do-targetTempMarker', (payload) => {
                this.targetTempMarker('', payload.pName, payload.pIndex, payload.targeted);

                console.log(this.$store.state.iconSourceDrone);
            });

            // EventBus.$on('do-targetDroneMarker', (pName) => {
            //     let dMarker = this.droneMarkers[pName];
            //     this.targetDroneMarker('', dMarker, pName);
            // });

            // EventBus.$on('do-targetPlaneMarker', (pName) => {
            //     let pMarker = this.planeMarkers[pName];
            //     this.targetPlaneMarker('', pMarker, pName);
            // });

            EventBus.$on('gcs-map-ready', () => {
                this.readyFlagGcsMap = true;

                // this.$refs.mapRef.$mapPromise.then((map) => {
                //     //map.setTilt(45);
                //     map.setHeading(map.getHeading()+20);
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

                if(localStorage.getItem('rotateMapVal')) {
                    this.mapHeading = parseInt(localStorage.getItem('rotateMapVal'));
                }
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

            EventBus.$on('updateDroneAlt', (payload) => {
                var topRight = this.map.getProjection().fromLatLngToPoint(this.map.getBounds().getNorthEast());
                var bottomLeft = this.map.getProjection().fromLatLngToPoint(this.map.getBounds().getSouthWest());
                var scale = Math.pow(2, this.map.getZoom());
                var worldPoint = this.map.getProjection().fromLatLngToPoint({lat:payload.lat, lng:payload.lng});

                let _payload = {};
                _payload.name = payload.name;
                _payload.scale = scale;
                _payload.x = (worldPoint.x - bottomLeft.x) * scale;
                _payload.y = (worldPoint.y - topRight.y) * scale;
                _payload.alt = payload.alt;
                EventBus.$emit('do-draw-DroneCommand', _payload);
            });

            EventBus.$on('on-message-handler-gcsmap', (payload) => {
                this.onMessageBroadcast(payload.topic, payload.message);
            });

            EventBus.$on('do-rotate-map', (angle)=>{
                this.prepared = false;
                this.prepared = true;

                this.mapHeading = parseInt(angle);

                localStorage.setItem('rotateMapVal', this.mapHeading);
            });
        },

        beforeDestroy() {
            EventBus.$off('do-centerCurrentPosition');
            EventBus.$off('do-targetTempMarker');
            //EventBus.$off('do-targetDroneMarker');
            EventBus.$off('gcs-map-ready');
            EventBus.$off('updateDroneAlt');
            EventBus.$off('on-message-handler-gcsmap');

            EventBus.$off('updatePlaneMarker');
            EventBus.$off('clearPlaneMarker');
            EventBus.$off('clearAllPlaneMarker');
            // EventBus.$off('draw-gotoLines');

            EventBus.$off('do-update-survey-GcsMap');
            EventBus.$off('do-rotate-map');
        }
    }
</script>

<style scoped>
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
</style>
