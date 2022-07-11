<template>
    <v-container :class="borderColor" class="pa-0 ma-0">
        <v-card ref="info" tile flat :color="$store.state.drone_infos[name].color">
            <v-row no-gutters class="mt-0">
                <v-col cols="12">
                    <v-row no-gutters align="center" justify="center">
                        <v-col cols="5">
                            <v-card flat tile :color="$store.state.drone_infos[name].color">
                                <v-checkbox
                                    dense hide-details
                                    @change="checkDroneTargeted" class="pt-0 pl-1 ma-0 shadow"
                                    v-model="$store.state.drone_infos[name].targeted"
                                >
                                    <template v-slot:label>
                                        <div>
                                            <span :class="statusTextColor">{{name + '(' + sys_id + ')' }}</span>
                                        </div>
                                    </template>
                                </v-checkbox>
                                <!--                            :disabled="!flagReceiving"-->
                            </v-card>
                        </v-col>
                        <v-col cols="1">
                            <v-fade-transition>
                                <v-avatar
                                    v-if="isPlaying"
                                    :color="bpm_color"
                                    :style="{animationDuration: animationDuration}"
                                    class="v-avatar--metronome pb-0 mb-1"
                                    size="20"
                                >
                                    <v-icon dark>
                                        mdi-heart-circle
                                    </v-icon>
                                </v-avatar>
                            </v-fade-transition>
                        </v-col>
                        <v-spacer></v-spacer>
                        <v-col cols="1">
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        class="mr-1 my-1" dark x-small text outlined elevation="5"
                                        @click.stop="checkMissionLteUrl"
                                        v-bind="attrs"
                                        v-on="on"
                                        :disabled="missionLteUrlFlag"
                                    >
                                        <v-icon small>
                                            mdi-briefcase-outline
                                        </v-icon>
                                    </v-btn>
                                </template>
                                <span>LTE 미션 확인</span>
                            </v-tooltip>
                        </v-col>
                        <v-col cols="1">
<!--                                    <v-switch-->
<!--                                        dense hide-details flat inset-->
<!--                                        prepend-icon="mdi-video-outline"-->
<!--                                        color="white"-->
<!--                                        class="ma-0 pa-0 pr-1"-->
<!--                                        v-model="info.isVideo"-->
<!--                                        @change="onVideoHandler(name)"-->
<!--                                    >-->
<!--                                    </v-switch>-->
                            <v-btn-toggle
                                dense dark
                                v-model="toggle_exclusive"
                                :background-color="$store.state.drone_infos[name].color"
                                @change="onVideoHandler($event, name)"
                                active-class="deep-purple--text text--accent-5"
                            >
                                <v-tooltip top>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn
                                            class="mr-1 my-1" dark x-small text outlined elevation="5"
                                            v-bind="attrs"
                                            v-on="on"
                                        >
                                            <v-icon small>mdi-video-outline</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Video On/Off</span>
                                </v-tooltip>
                            </v-btn-toggle>
                        </v-col>
                        <v-col cols="1">
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        class="mr-1 my-1" dark x-small text outlined elevation="5"
                                        @click.stop="clearTrackingLines"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <v-icon small>
                                            mdi-layers-off
                                        </v-icon>
                                    </v-btn>
                                </template>
                                <span>궤적 지우기</span>
                            </v-tooltip>
                        </v-col>
                        <v-col cols="1">
                            <div class="text-right">
                                <v-tooltip top>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn
                                            class="mr-1 my-1" dark x-small elevation="5"
                                            :color="$store.state.drone_infos[name].color"
                                            @click.stop="showMyDroneInfoDialog"
                                            v-bind="attrs"
                                            v-on="on"
                                        >
                                            <v-icon small>
                                                mdi-text-box-check-outline
                                            </v-icon>
                                        </v-btn>
                                    </template>
                                    <span>드론 정보 관리</span>
                                </v-tooltip>

                                <v-dialog
                                    v-model="dialog"
                                    max-width="720"
                                >
                                    <v-card>
                                        <v-card-title class="text-h6">Information of {{ name }}
                                            <v-spacer></v-spacer>
                                            <v-file-input
                                                class="mr-2"
                                                accept=".waypoints,.txt,.kml,.plan"
                                                label="Waypoints File input"
                                                :color="'#FF5722'"
                                                outlined dense hide-details small-chips
                                                v-model="chosenWaypointsFile"
                                            ></v-file-input>
                                            <v-btn
                                                class="ml-5"
                                                elevation="5"
                                                :color="'#FF5722'"
                                                @click.stop="loadUpdateWaypoints"
                                                left
                                                :disabled="showLoadWaypointsBtn"
                                            >
                                                <v-icon dark class="mr-2">mdi-map-marker-path</v-icon>
                                                Load
                                            </v-btn>
                                        </v-card-title>
                                        <v-textarea outlined name="myDroneInfo" label="drone_info" class="mx-2" height="480"
                                            v-model="strMyDroneInfo"
                                            hide-details
                                        ></v-textarea>

                                        <v-card-actions>
                                            <v-btn
                                                dark
                                                elevation="5"
                                                :color="'#795548'"
                                                @click.stop="saveWaypoints"
                                                left
                                            >
                                                <v-icon dark class="mr-2">mdi-download</v-icon>
                                                Save
                                            </v-btn>
                                            <v-spacer></v-spacer>

                                            <v-btn
                                                color="green darken-1"
                                                text
                                                @click="dialog = false"
                                            >
                                                Cancel
                                            </v-btn>

                                            <v-btn
                                                color="green darken-1"
                                                text
                                                @click="updateMyDroneInfo"
                                            >
                                                OK
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                            </div>
                        </v-col>
                    </v-row>
                    <!--                            <v-row no-gutters align="center" justify="center">-->
                    <!--                                <v-col cols="12">-->
                    <!--                                    <v-card class="px-2 py-0" :class="colorMode" flat tile :color="$store.state.droneColorMap[name]">-->
                    <!--                                        <v-row no-gutters class="pa-0">-->
                    <!--                                            <v-col cols="7">-->
                    <!--                                                <v-card tile :color="$store.state.droneColorMap[name]">-->
                    <!--                                                    <v-row no-gutters class="d-flex justify-center" :style="heightInfo">-->
                    <!--                                                        <v-col cols="12" class="pl-2 text-left align-self-center">-->
                    <!--                                                            <v-card flat tile class="shadow" :class="colorMode" :color="$store.state.droneColorMap[name]">{{ curMode }}</v-card>-->
                    <!--                                                        </v-col>-->
                    <!--                                                    </v-row>-->
                    <!--                                                    <v-overlay :absolute="absolute" :value="!flagReceiving" :opacity="opacity" color="#E0E0E0"></v-overlay>-->
                    <!--                                                </v-card>-->
                    <!--                                            </v-col>-->
                    <!--                                            <v-col cols="5">-->
                    <!--                                                <v-card tile :color="$store.state.droneColorMap[name]">-->
                    <!--                                                    <v-row no-gutters class="d-flex justify-center" :style="heightInfo">-->
                    <!--                                                        <v-col cols="4" class="text-right align-self-center">-->
                    <!--                                                            <v-icon :class="colorBattery" :style="iconSize" class="shadow_icon">{{ iconBattery }}</v-icon>-->
                    <!--                                                        </v-col>-->
                    <!--                                                        <v-col cols="8" class="text-right align-self-center">-->
                    <!--                                                            <v-card flat tile :class="colorBattery" :style="fontSize" class="shadow_icon"  :color="$store.state.droneColorMap[name]">{{ (ss.voltage_battery / 1000).toFixed(1) }} V</v-card>-->
                    <!--                                                        </v-col>-->
                    <!--                                                    </v-row>-->
                    <!--                                                    <v-overlay :absolute="absolute" :value="!flagReceiving" :opacity="opacity" color="#E0E0E0"></v-overlay>-->
                    <!--                                                </v-card>-->
                    <!--                                            </v-col>-->
                    <!--                                        </v-row>-->
                    <!--                                    </v-card>-->
                    <!--                                </v-col>-->
                    <!--                            </v-row>-->
                    <!--                            <v-row no-gutters class="ma-0 pa-0 " justify="center" align="center">-->
                    <!--                                <v-col cols="6">-->
                    <!--                                    <v-card tile>-->
                    <!--                                        <v-row no-gutters class="d-flex justify-center" :style="heightInfo">-->
                    <!--                                            <v-col cols="4" class="text-right align-self-center">-->
                    <!--                                                <v-icon class="shadow_icon">mdi-satellite-variant</v-icon>-->
                    <!--                                            </v-col>-->
                    <!--                                            &lt;!&ndash;                        <v-col cols="4" class="pl-1 text-left align-self-center">&ndash;&gt;-->
                    <!--                                            &lt;!&ndash;                            <span>{{ infos1[0].name }}</span>&ndash;&gt;-->
                    <!--                                            &lt;!&ndash;                        </v-col>&ndash;&gt;-->
                    <!--                                            <v-col cols="8" class="pr-2 text-right align-self-center">-->
                    <!--                                                <v-card flat tile class="shadow_icon">{{ num_satellites }} </v-card>-->
                    <!--                                            </v-col>-->

                    <!--                                        </v-row>-->
                    <!--                                        <v-overlay :absolute="absolute" :value="!flagReceiving" :opacity="opacity" color="#E0E0E0"></v-overlay>-->
                    <!--                                    </v-card>-->
                    <!--                                </v-col>-->
                    <!--                                <v-col cols="6">-->
                    <!--                                    <v-card tile>-->
                    <!--                                        <v-row no-gutters class="d-flex justify-center" :style="heightInfo">-->
                    <!--                                            <v-col cols="4" class="text-right align-self-center">-->
                    <!--                                                <v-icon class="shadow_icon">mdi-altimeter</v-icon>-->
                    <!--                                            </v-col>-->
                    <!--                                            &lt;!&ndash;                        <v-col cols="4" class="pl-1 text-left align-self-center">&ndash;&gt;-->
                    <!--                                            &lt;!&ndash;                            <span>{{ infos1[0].name }}</span>&ndash;&gt;-->
                    <!--                                            &lt;!&ndash;                        </v-col>&ndash;&gt;-->
                    <!--                                            <v-col cols="8" class="pr-2 text-right align-self-center">-->
                    <!--                                                <v-card flat tile class="shadow_icon">{{ (gpi.relative_alt / 1000).toFixed(1) }} m</v-card>-->
                    <!--                                            </v-col>-->

                    <!--                                        </v-row>-->
                    <!--                                        <v-overlay :absolute="absolute" :value="!flagReceiving" :opacity="opacity" color="#E0E0E0"></v-overlay>-->
                    <!--                                    </v-card>-->
                    <!--                                </v-col>-->
                    <!--                            </v-row>-->
                    <!--                            <v-row no-gutters class="ma-0 pa-0 " justify="center" align="center">-->
                    <!--                                <v-col cols="6">-->
                    <!--                                    <v-card tile>-->
                    <!--                                        <v-row no-gutters class="d-flex justify-center" :style="heightInfo">-->
                    <!--                                            <v-col cols="4" class="text-right align-self-center">-->
                    <!--                                                <v-icon :class="colorLteVal" :style="iconSize" class="shadow_icon">{{ iconLte }}</v-icon>-->
                    <!--                                            </v-col>-->
                    <!--                                            &lt;!&ndash;                        <v-col cols="4" class="pl-1 text-left align-self-center">&ndash;&gt;-->
                    <!--                                            &lt;!&ndash;                            <span>{{ infos2[0].name }}</span>&ndash;&gt;-->
                    <!--                                            &lt;!&ndash;                        </v-col>&ndash;&gt;-->
                    <!--                                            <v-col cols="8" class="pr-2 text-right align-self-center" :class="colorLteVal">-->
                    <!--                                                <v-card flat tile :class="colorLteVal" :style="fontSize" class="shadow_icon">{{ curLteVal }}</v-card>-->
                    <!--                                            </v-col>-->
                    <!--                                        </v-row>-->
                    <!--                                        <v-overlay :absolute="absolute" :value="!flagReceiving" :opacity="opacity" color="#E0E0E0"></v-overlay>-->
                    <!--                                    </v-card>-->
                    <!--                                </v-col>-->
                    <!--                                <v-col cols="6">-->
                    <!--                                    <v-card tile>-->
                    <!--                                        <v-row no-gutters class="d-flex justify-center" :style="heightInfo">-->
                    <!--                                            <v-col cols="4" class="text-right align-self-center">-->
                    <!--                                                <v-icon class="shadow_icon">mdi-speedometer</v-icon>-->
                    <!--                                            </v-col>-->
                    <!--                                            &lt;!&ndash;                        <v-col cols="4" class="pl-1 text-left align-self-center">&ndash;&gt;-->
                    <!--                                            &lt;!&ndash;                            <span>{{ infos1[0].name }}</span>&ndash;&gt;-->
                    <!--                                            &lt;!&ndash;                        </v-col>&ndash;&gt;-->
                    <!--                                            <v-col cols="8" class="pr-2 text-right align-self-center">-->
                    <!--                                                <v-card flat tile class="shadow_icon">{{ airspeed.toFixed(1) }} m/s</v-card>-->
                    <!--                                            </v-col>-->

                    <!--                                        </v-row>-->
                    <!--                                        <v-overlay :absolute="absolute" :value="!flagReceiving" :opacity="opacity" color="#E0E0E0"></v-overlay>-->
                    <!--                                    </v-card>-->
                    <!--                                </v-col>-->
                    <!--                            </v-row>-->
                    <!--                            <v-row no-gutters class="ma-0 pa-0 " justify="center" align="center">-->
                    <!--                                <v-col cols="6">-->
                    <!--                                    <v-card tile>-->
                    <!--                                        <v-row no-gutters class="d-flex justify-center" :style="heightInfo">-->
                    <!--                                            <v-col cols="4" class="text-right align-self-center">-->
                    <!--                                                <v-icon class="shadow_icon">{{ iconDistance }}</v-icon>-->
                    <!--                                            </v-col>-->
                    <!--                                            &lt;!&ndash;                        <v-col cols="4" class="pl-1 text-left align-self-center">&ndash;&gt;-->
                    <!--                                            &lt;!&ndash;                            <span>{{ infos2[0].name }}</span>&ndash;&gt;-->
                    <!--                                            &lt;!&ndash;                        </v-col>&ndash;&gt;-->
                    <!--                                            <v-col cols="8" class="pr-2 text-right align-self-center">-->
                    <!--                                                <v-card flat tile class="shadow_icon">{{ valueDistance }}</v-card>-->
                    <!--                                            </v-col>-->
                    <!--                                        </v-row>-->
                    <!--                                        <v-overlay :absolute="absolute" :value="!flagReceiving" :opacity="opacity" color="#E0E0E0"></v-overlay>-->
                    <!--                                    </v-card>-->
                    <!--                                </v-col>-->
                    <!--                                <v-col cols="6">-->
                    <!--                                    <v-card tile>-->
                    <!--                                        <v-row no-gutters class="d-flex justify-center" :style="heightInfo">-->
                    <!--                                            <v-col cols="4" class="text-right align-self-center">-->
                    <!--                                                <v-icon class="shadow_icon">{{ iconFlightElapsed }}</v-icon>-->
                    <!--                                            </v-col>-->
                    <!--                                            &lt;!&ndash;                        <v-col cols="4" class="pl-1 text-left align-self-center">&ndash;&gt;-->
                    <!--                                            &lt;!&ndash;                            <span>{{ infos1[0].name }}</span>&ndash;&gt;-->
                    <!--                                            &lt;!&ndash;                        </v-col>&ndash;&gt;-->
                    <!--                                            <v-col cols="8" class="pr-2 text-right align-self-center">-->
                    <!--                                                <v-card flat tile class="shadow_icon">{{ flightElapsedTime }}</v-card>-->
                    <!--                                            </v-col>-->

                    <!--                                        </v-row>-->
                    <!--                                        <v-overlay :absolute="absolute" :value="!flagReceiving" :opacity="opacity" color="#E0E0E0"></v-overlay>-->
                    <!--                                    </v-card>-->
                    <!--                                </v-col>-->
                    <!--                            </v-row>-->
                    <v-row no-gutters align="center" justify="center">
                        <v-col cols="1">
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        :disabled="$store.state.drone_infos[name].curArmStatus === 'DISARMED'"
                                        class="mr-1 my-1" dark x-small text outlined elevation="5"
                                        @click.stop="gotoHomePosition"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <v-icon small>
                                            mdi-home
                                        </v-icon>
                                    </v-btn>
                                </template>
                                <span>홈 위치로 이동</span>
                            </v-tooltip>
                        </v-col>
                        <v-col cols="1">
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        :disabled="$store.state.drone_infos[name].curArmStatus === 'DISARMED'"
                                        class="mr-1 my-1" dark x-small text outlined elevation="5"
                                        @click.stop="returnToLaunch"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <v-icon small>
                                            mdi-arrow-down-left-bold
                                        </v-icon>
                                    </v-btn>
                                </template>
                                <span>귀환</span>
                            </v-tooltip>
                        </v-col>
                        <v-spacer></v-spacer>
                        <v-col cols="1">
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        :disabled="$store.state.drone_infos[name].curArmStatus === 'DISARMED'"
                                        class="mr-1 my-1" dark x-small text outlined elevation="5"
                                        @click.stop="pauseCurPosition"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <v-icon small>
                                            mdi-close-octagon-outline
                                        </v-icon>
                                    </v-btn>
                                </template>
                                <span>정지(Loiter)</span>
                            </v-tooltip>
                        </v-col>
                        <v-spacer></v-spacer>
                        <v-col cols="1">
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        :disabled="false"
                                        class="mr-1 my-1" dark x-small text outlined elevation="5"
                                        @click.stop="reservedQuick"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <v-icon small>
                                            mdi-radiobox-blank
                                        </v-icon>
                                    </v-btn>
                                </template>
                                <span>Reserved</span>
                            </v-tooltip>
                        </v-col>
                        <v-col cols="1">
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        :disabled="$store.state.drone_infos[name].curArmStatus === 'DISARMED'"
                                        class="mr-1 my-1" dark x-small text outlined elevation="5"
                                        @click.stop="showYawAngleDialog"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <v-icon small>
                                            mdi-rotate-orbit
                                        </v-icon>
                                    </v-btn>
                                </template>
                                <span>YAW회전</span>
                            </v-tooltip>
                            <v-dialog
                                v-model="yawAngleDialog"
                                max-width="340"
                            >
                                <v-card class="pa-3 pt-5">
                                    <v-row no-gutters align="center" justify="center">
                                        <v-col cols="5">
                                            <v-text-field
                                                label="heading(°)"
                                                :value="heading.toFixed(1)"
                                                class="ma-0 pa-0"
                                                outlined dense hide-details readonly filled
                                            ></v-text-field>
                                        </v-col>
                                        <v-spacer/>
                                        <v-col cols="2" class="text-center">
                                            <v-icon>
                                                mdi-rotate-orbit
                                            </v-icon>
                                        </v-col>
                                        <v-spacer/>
                                        <v-col cols="5">
                                            <v-text-field
                                                label="yawAngle(°)"
                                                v-model="yawAngle"
                                                class="ma-0 pa-0"
                                                type="number"
                                                outlined dense hide-details
                                                color="amber"
                                                min="-360"
                                                max="360"
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row no-gutters align="center" justify="center">
                                        <v-col cols="6">
                                            <v-card-actions>
                                                <v-btn
                                                    color="green darken-1"
                                                    text outlined
                                                    @click="rotateYawAngle"
                                                >
                                                    OK
                                                </v-btn>
                                                <v-btn
                                                    color="red darken-1"
                                                    text outlined
                                                    @click="yawAngleDialog = false"
                                                >
                                                    Cancel
                                                </v-btn>
                                            </v-card-actions>
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </v-dialog>
                        </v-col>
                    </v-row>
                    <v-row no-gutters class="d-flex justify-center" align="center">
                        <v-col cols="12" class="text-center align-self-center">
                            <v-card flat tile class="align-self-center justify-space-between ma-0 py-0 pt-0"
                                    :class="colorArming"
                                    @click="currentPosition">
                                <DroneInfoBox v-show="false"
                                    :name="name"
                                    :heading="heading"
                                    :heading_size="heading_size"
                                    :myWidth="myWidth"
                                    :attitude_size="attitude_size"
                                    :curMode="curMode"
                                    :colorMode="colorMode"
                                    :num_satellites="num_satellites"
                                    :roll="roll"
                                    :pitch="pitch"
                                    :iconLte="iconLte"
                                    :colorLteVal="colorLteVal"
                                    :curLteVal="curLteVal"
                                    :rssi="rssi"
                                    :iconFlightElapsed="iconFlightElapsed"
                                    :curLat="(gpi.lat / 10000000).toFixed(7)"
                                    :curLng="(gpi.lon / 10000000).toFixed(7)"
                                    :curRelativeAlt="(gpi.relative_alt / 1000).toFixed(1)"
                                    :curAlt="(gpi.alt / 1000).toFixed(1)"
                                    :curArmStatus="curArmStatus"
                                    :colorArm="colorArm"
                                    :colorBattery="colorBattery"
                                    :iconBattery="iconBattery"
                                    :voltageBattery="(ss.voltage_battery / 1000).toFixed(1)"
                                    :airspeed="airspeed.toFixed(1)"
                                    :iconDistance="iconDistance"
                                    :flightElapsedTime="flightElapsedTime"
                                    :valueDistance="(valueDistance > 1000) ? (valueDistance / 1000).toFixed(1) + ' km' : (valueDistance.toFixed(0) + ' m')"
                                    :bpm_color="bpm_color"
                                    :animationDuration="animationDuration"
                                ></DroneInfoBox>
                                <v-overlay :absolute="absolute" :value="!flagReceiving" :opacity="opacity" color="#E0E0E0"></v-overlay>
                            </v-card>
                        </v-col>
                    </v-row>
<!--                    <v-row no-gutters class="d-flex justify-center" align="center">-->
<!--                        <v-col cols="12" class="text-center align-self-center">-->
<!--                            <v-card flat tile class="align-self-center justify-space-between ma-0 py-0 pt-0"-->
<!--                                    :class="colorArming"-->
<!--                                    @click="currentPosition">-->
<!--                                &lt;!&ndash;                    <v-icon x-large :class="colorArming">{{ iconArming }}</v-icon>&ndash;&gt;-->
<!--                                <div class="py-0">-->
<!--                                    <Heading :size="heading_size" :heading="heading"/>-->
<!--                                    <v-fade-transition>-->
<!--                                        <v-avatar-->
<!--                                            v-if="isPlaying"-->
<!--                                            :color="color"-->
<!--                                            :style="{animationDuration: animationDuration, top: '1px', left: (myWidth/2-12)+'px'}"-->
<!--                                            class="mt-1 ml-1 v-avatar&#45;&#45;metronome"-->
<!--                                            size="14"-->
<!--                                        ></v-avatar>-->
<!--                                    </v-fade-transition>-->
<!--                                    <Attitude :size="attitude_size" :roll="roll" :pitch="pitch"/>-->
<!--                                </div>-->

<!--                                <div class="info_position align-self-center" :style="{top: 0, left: 0}">-->
<!--                                    <v-input :style="{'font-size': '26px'}" :class="colorMode" :color="$store.state.drone_infos[name].color"-->
<!--                                        class="shadow_icon px-1">{{ curMode }}</v-input>-->
<!--                                </div>-->

<!--                                <div class="info_position" :style="{top: (hud_gap*2)+'px', left: 0}">-->
<!--                                    <v-icon class="shadow_icon pl-1" :style="{color: 'white'}">mdi-satellite-variant-->
<!--                                    </v-icon>-->
<!--                                    <span class="shadow_icon px-1 text&#45;&#45;white"-->
<!--                                          :style="{color: 'white'}">{{ num_satellites }} </span>-->
<!--                                </div>-->

<!--                                <div class="info_position" :style="{top: (hud_gap*3)+'px', left: 0}">-->
<!--                                    <v-icon :class="colorLteVal" :style="iconSize" class="shadow_icon pl-1">{{-->
<!--                                            iconLte-->
<!--                                        }}-->
<!--                                    </v-icon>-->
<!--                                    <span :class="colorLteVal" :style="fontSize" class="shadow_icon px-1">{{-->
<!--                                            curLteVal-->
<!--                                        }}</span>-->
<!--                                </div>-->

<!--                                <div class="info_position" :style="{top: (hud_gap*4)+'px', left: 0}">-->
<!--                                    <v-icon class="shadow_icon pl-1" :style="{color: 'white'}">mdi-access-point</v-icon>-->
<!--                                    <span class="shadow_icon px-1" :style="{color: 'white'}">{{ rssi }}</span>-->
<!--                                </div>-->

<!--                                <div class="info_position" :style="{top: (hud_gap*5)+'px', left: 0}">-->
<!--                                    <v-icon class="shadow_icon pl-1" :style="{color: 'white'}">{{-->
<!--                                            iconFlightElapsed-->
<!--                                        }}-->
<!--                                    </v-icon>-->
<!--                                    <span class="shadow_icon px-1" :style="{color: 'white'}">{{-->
<!--                                            flightElapsedTime-->
<!--                                        }}</span>-->
<!--                                </div>-->

<!--                                <div class="info_position text-center" :style="{top: (hud_gap*6)+'px', left: 0}">-->
<!--                                    <span class="shadow_icon px-2" :style="{color: 'white'}">{{-->
<!--                                            (gpi.lat / 10000000).toFixed(7)-->
<!--                                        }} : {{ (gpi.lon / 10000000).toFixed(7) }} : <span style="font-size: 20px">{{-->
<!--                                                (gpi.relative_alt / 1000).toFixed(1)-->
<!--                                            }}</span> ({{ (gpi.alt / 1000).toFixed(1) }})</span>-->
<!--                                </div>-->

<!--                                <div class="info_position"-->
<!--                                     :style="{top: 0, left: ((curArmStatus==='ARMED')?(myWidth-110):(myWidth-138))+'px'}">-->
<!--                                    <v-input :style="{'font-size': '26px'}" :class="colorArm" :color="$store.state.drone_infos[name].color"-->
<!--                                        class="shadow_icon px-1">{{ curArmStatus }}</v-input>-->
<!--                                </div>-->

<!--                                <div class="info_position" :style="{top: (hud_gap*2)+'px', left: (myWidth-110)+'px'}">-->
<!--                                    <v-icon :class="colorBattery" :style="iconSize" class="shadow_icon pl-1">-->
<!--                                        {{ iconBattery }}-->
<!--                                    </v-icon>-->
<!--                                    <span class="shadow_icon px-1" :class="colorBattery">{{-->
<!--                                            (ss.voltage_battery / 1000).toFixed(1)-->
<!--                                        }} V</span>-->
<!--                                </div>-->

<!--                                <div class="info_position" :style="{top: (hud_gap*3)+'px', left: (myWidth-110)+'px'}">-->
<!--                                    <v-icon class="shadow_icon pl-1" :style="{color: 'white'}">mdi-altimeter</v-icon>-->
<!--                                    <span class="shadow_icon px-1" :style="{color: 'white'}">{{-->
<!--                                            (gpi.relative_alt / 1000).toFixed(1)-->
<!--                                        }} m</span>-->
<!--                                </div>-->

<!--                                <div class="info_position" :style="{top: (hud_gap*4)+'px', left: (myWidth-110)+'px'}">-->
<!--                                    <v-icon class="shadow_icon pl-1" :style="{color: 'white'}">mdi-speedometer</v-icon>-->
<!--                                    <span class="shadow_icon px-1" :style="{color: 'white'}">{{ airspeed.toFixed(1) }} m/s</span>-->
<!--                                </div>-->

<!--                                <div class="info_position" :style="{top: (hud_gap*5)+'px', left: (myWidth-110)+'px'}">-->
<!--                                    <v-icon class="shadow_icon pl-1" :style="{color: 'white'}">{{-->
<!--                                            iconDistance-->
<!--                                        }}-->
<!--                                    </v-icon>-->
<!--                                    <span class="shadow_icon px-1" :style="{color: 'white'}">{{-->
<!--                                            (valueDistance > 1000) ? (valueDistance / 1000).toFixed(1) + ' km' : (valueDistance.toFixed(0) + ' m')-->
<!--                                        }}</span>-->
<!--                                </div>-->

<!--                                &lt;!&ndash;                                <v-overlay :absolute="absolute" :value="!flagReceiving" :opacity="opacity" color="#E0E0E0"></v-overlay>&ndash;&gt;-->
<!--                            </v-card>-->
<!--                        </v-col>-->
<!--                    </v-row>-->
                    <v-row no-gutters class="d-flex justify-center" align="center">
                        <v-col cols="12" class="align-self-center">
                            <v-card flat tile class="align-self-center justify-space-between ma-0 py-0 pt-0"
                                    :class="colorArming"
                                    @click="currentPosition">
                                <DroneInfoHUD
                                    :drone_name="name"
                                    :bitrate="0"
                                    :info="info"
                                ></DroneInfoHUD>
                                <v-overlay :absolute="absolute" :value="!flagReceiving" :opacity="opacity" color="#E0E0E0"></v-overlay>
                            </v-card>
                        </v-col>
                    </v-row>
                    <v-row no-gutters justify="center" align="center">
                        <v-col cols="2" class="pl-1 pt-1">
                            <v-img v-if="fc_img === 'ardupilot.png'"
                                src="../assets/ardupilot.png"
                                alt="Ahn"
                            ></v-img>
                            <v-img v-else-if="fc_img === 'px4.png'"
                                src="../assets/px4.png"
                                alt="Ahn"
                            ></v-img>
                        </v-col>
                        <v-col cols="2">
                            <v-select class="ma-0 pa-0 pl-1" v-model="mavVersion" :items="mavVersions"
                                      @change="selectedMavVersion($event)"
                                      dark outlined dense flat tile hide-details
                            ></v-select>
                        </v-col>
                        <v-col cols="8">
                            <v-card class="singleline-ellipsis py-1" outlined tile>
                                <span style="font-size: 14px">{{ mavStr }}</span>
                                <v-overlay :absolute="absolute" :value="!flagReceiving" :opacity="opacity" color="#E0E0E0"></v-overlay>
                                <v-progress-linear
                                    active absolute top
                                    :color="$store.state.drone_infos[name].color"
                                    height="32"
                                    :value="watchingMissionStatus"
                                >
                                    <template v-slot:default="{ value }">
                                        <strong>{{ watchingMission + ' - ' + value }}%</strong>
                                    </template>
                                </v-progress-linear>

                            </v-card>
                        </v-col>
                    </v-row>

                    <v-row no-gutters>
                        <v-col cols="12">
                            <v-card tile outlined
                                    class="mx-auto overflow-y-auto overflow">
                                <!--                                    :class="flagReceiving?'overflow-y-auto':'overflow-y-hidden'"-->
                                <!--                                    max-height="135"-->
                                <!--                                    min-height="135"-->
                                <v-sheet
                                    elevation="5"
                                    class="px-0"
                                >
                                    <v-chip-group
                                        v-model="selectedItem"
                                        active-class="primary--text"
                                        :center-active="true"
                                        show-arrows
                                        class="ma-0 px-0 py-0"
                                    >
                                        <draggable v-model="positions">
                                            <v-chip
                                                v-for="(position, i) in positions" :key="'pos_chip'+i"
                                                @click="targetTempMarkerPosition(i)"
                                                label outlined class="ma-0 pa-0 mx-1 px-1"
                                            >
                                                {{ String(i) }}
                                                <v-icon :color="evalAltColor[i]" class="ml-1">mdi-altimeter</v-icon>
                                            </v-chip>
                                        </draggable>
                                    </v-chip-group>
                                </v-sheet>
                                <!--                                <v-list dense>-->
                                <!--                                    <v-list-item-group-->
                                <!--                                        v-model="selectedItem"-->
                                <!--                                        color="deep-orange darken-4"-->
                                <!--                                    >-->
                                <!--                                        <draggable v-model="positions">-->
                                <!--                                            <v-list-item v-for="(position, i) in positions" :key="i">-->
                                <!--                                                &lt;!&ndash;                                <v-card flat rounded shaped width="25" class="mr-2 text-center" style="{border-radius: 50%; }">{{i}}</v-card>&ndash;&gt;-->
                                <!--                                                <v-list-item-avatar class="ma-0 mr-1" size="24" color="grey lighten-4">-->
                                <!--                                                    <span>{{ i + 1 }}</span>-->
                                <!--                                                </v-list-item-avatar>-->
                                <!--                                                <v-list-item-icon>-->
                                <!--                                                    <v-icon class="mr-2" v-text="position.icon"></v-icon>-->
                                <!--                                                </v-list-item-icon>-->
                                <!--                                                <v-hover>-->
                                <!--                                                    <template v-slot:default="{ hover }">-->
                                <!--                                                        <v-list-item-content>-->
                                <!--                                                            <v-list-item-title v-text="position.text"></v-list-item-title>-->
                                <!--                                                            <v-overlay-->
                                <!--                                                                v-if="hover"-->
                                <!--                                                                absolute-->
                                <!--                                                                color="transparent"-->
                                <!--                                                                style="padding-left: 88%"-->
                                <!--                                                            >-->
                                <!--                                                                <v-btn-->
                                <!--                                                                    class="pa-0 ma-0"-->
                                <!--                                                                    fab-->
                                <!--                                                                    dark-->
                                <!--                                                                    x-small-->
                                <!--                                                                    color="grey darken-3"-->
                                <!--                                                                >-->
                                <!--                                                                    <v-icon dark>mdi-trash-can</v-icon>-->
                                <!--                                                                </v-btn>-->
                                <!--                                                            </v-overlay>-->
                                <!--                                                        </v-list-item-content>-->
                                <!--                                                    </template>-->
                                <!--                                                </v-hover>-->
                                <!--                                            </v-list-item>-->
                                <!--                                        </draggable>-->
                                <!--                                    </v-list-item-group>-->
                                <!--                                </v-list>-->
                                <v-overlay :absolute="absolute" :value="!flagReceiving" :opacity="opacity" color="#E0E0E0"></v-overlay>
                            </v-card>
                        </v-col>
                        <v-col cols="12">
                            <v-card :style="{color:'white'}" outlined tile flat>
                                <canvas :id="'chart-'+name" height="50"></canvas>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-card>
    </v-container>
</template>

<script>

// import {Airspeed, Attitude, Heading} from 'vue-flight-indicators'
import EventBus from '../EventBus';
import mavlink, {MAVLink} from '../js/mavlink'
import moment from 'moment'

// eslint-disable-next-line no-unused-vars

import axios from "axios";

import draggable from 'vuedraggable';
import {nanoid} from "nanoid";
import DroneInfoHUD from "./DroneInfoHUD";
import DroneInfoBox from "@/components/DroneInfoBox";
import mqtt from "mqtt";
import convert from "xml-js";

import {Chart, BarElement, BarController, LinearScale, CategoryScale, LineElement, LineController, PointElement } from 'chart.js'; //👈 Chart 모듈 임포트
Chart.register(BarElement, BarController, LinearScale, CategoryScale, LineElement, LineController, PointElement); // 👈 chart.js 모듈 Chart 모듈에 등록

const byteToHex = [];

for (let n = 0; n <= 0xff; ++n) {
    const hexOctet = n.toString(16).padStart(2, "0");
    byteToHex.push(hexOctet);
}

const MISSION_ACK_TIMEOUT_COUNT = 20;

const RE = 6371.00877; // 지구 반경(km)
const GRID = 0.001; // 격자 간격(km)
const SLAT1 = 30.0; // 투영 위도1(degree)
const SLAT2 = 60.0; // 투영 위도2(degree)
const OLON = 126.0; // 기준점 경도(degree)
const OLAT = 38.0; // 기준점 위도(degree)
const XO = 43; // 기준점 X좌표(GRID)
const YO = 136; // 기1준점 Y좌표(GRID)

function dfs_xy_conv(code, v1, v2) {
    const DEGRAD = Math.PI / 180.0;
    const RADDEG = 180.0 / Math.PI;

    const re = RE / GRID;
    const slat1 = SLAT1 * DEGRAD;
    const slat2 = SLAT2 * DEGRAD;
    const olon = OLON * DEGRAD;
    const olat = OLAT * DEGRAD;

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
        if (sn < 0.0) -ra;
        var alat = Math.pow((re * sf / ra), (1.0 / sn));
        alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;

        if (Math.abs(xn) <= 0.0) {
            theta = 0.0;
        }
        else {
            if (Math.abs(yn) <= 0.0) {
                theta = Math.PI * 0.5;
                if (xn < 0.0) -theta;
            }
            else theta = Math.atan2(xn, yn);
        }
        var alon = theta / sn + olon;
        rs['lat'] = alat * RADDEG;
        rs['lng'] = alon * RADDEG;
    }
    return rs;
}

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
    name: "DroneInfo",

    components: {
        DroneInfoBox,
        // eslint-disable-next-line vue/no-unused-components
        draggable,
        DroneInfoHUD
    },

    props: [
        'broker',
        'name',
        'id',
        'gcs',
        'bat_cell',
        'sortie_name',
        'airspeed_size',
        'heading_size',
        'attitude_size',
        'goto_positions',
        'lat',
        'lng',
        'ref_sys_id',
        'myWidth'
    ],

    data() {
        return {
            missionTopic: '/oneM2M/req/Mobius2/' + this.name + '/json',

            myChart: null,

            yawAngle: 0,
            toggle_exclusive: undefined,
            itemsWpYawBehavior: [
                '0 = Never change Yaw.',
                '1 = Face Next Waypoint including facing home during RTL.',
                '2 = Face Next Waypoint except for RTL (i.e. during RTL vehicle will remain pointed at its last heading)'
            ],
            mavVersion: 'v1',
            mavVersions: ['v1', 'v2'],
            evalAltColor: [],

            hud_gap: 31,
            showLoadWaypointsBtn: true,
            strWaypoints: null,
            chosenWaypointsFile: null,
            dialog: false,
            yawAngleDialog: false,
            isPlaying: true,
            bpm: 40,

            left_pos: ((this.heading_size * 2) - 16),

            stat_flttime_param: {param_value: 0},

            selectedItem: -1,
            colorSelectedNumber: 'deep-orange darken-4',
            positions: [
                {type: 'Circle', text: '37.0000000:127.0000000:100.0:100.0:5', icon: 'mdi-google-circles-group'},
                {type: 'Goto', text: '37.0000000:127.0000000:100.0', icon: 'mdi-logout-variant'},
                {type: 'Survey', text: '37.0000000:127.0000000:100.0', icon: 'mdi-logout-variant'},
            ],
            absolute: true,
            opacity: 0.8,
            curSortieName: this.sortie_name,

            curMode: 'UNKNOWN',
            colorMode: 'td-text-gray',
            target_pub_topic: '/Mobius/' + this.gcs + '/GCS_Data/' + this.name,

            colorArm: 'td-text-gray',
            curArmStatus: 'DISARMED',

            // colorArming: this.$store.state.drone_infos[this.name].color + ' darken-4',
            colorArming: 'white',
            iconDistance: 'mdi-map-marker-distance',
            valueDistance: 0,
            flightTimeCount: 0,
            flightTimer: null,
            iconFlightElapsed: 'mdi-timer-off-outline',
            flightElapsedTime: '00:00',
            iconBattery: 'mdi-battery-off-outline',
            colorBattery: '#9E9E9E',
            infos1: [
                {
                    name: 'Bat',
                    icon: "mdi-battery-high",
                    values: 159,
                },
                {
                    name: 'Lat',
                    icon: "mdi-latitude",
                    values: 159,
                },
                {
                    name: 'Lon',
                    icon: "mdi-longitude",
                    values: 159,
                },
                {
                    name: 'Alt',
                    icon: "mdi-altimeter",
                    values: 159,
                },
                {
                    name: 'Ba5',
                    icon: "mdi-battery-high",
                    values: 159,
                },
                {
                    name: 'Bat6',
                    icon: "mdi-battery-high",
                    values: 159,
                },
                {
                    name: 'Bat7',
                    icon: "mdi-battery-high",
                    values: 159,
                },
                {
                    name: 'Bat8',
                    icon: "mdi-battery-high",
                    values: 159,
                },
                {
                    name: 'Bat9',
                    icon: "mdi-battery-high",
                    values: 159,
                },
            ],
            infos2: [
                {
                    name: 'LTE',
                    icon: "mdi-network-strength-4",
                    values: 159,
                },
                {
                    name: 'FTime',
                    icon: "mdi-latitude",
                    values: 159,
                },
                {
                    name: 'Lon',
                    icon: "mdi-longitude",
                    values: 159,
                },
                {
                    name: 'Alt',
                    icon: "mdi-altimeter",
                    values: 159,
                },
                {
                    name: 'Ba5',
                    icon: "mdi-battery-high",
                    values: 159,
                },
                {
                    name: 'Bat6',
                    icon: "mdi-battery-high",
                    values: 159,
                },
                {
                    name: 'Bat7',
                    icon: "mdi-battery-high",
                    values: 159,
                },
                {
                    name: 'Bat8',
                    icon: "mdi-battery-high",
                    values: 159,
                },
                {
                    name: 'Bat9',
                    icon: "mdi-battery-high",
                    values: 159,
                },
            ],
            counter: 0,
            targeted: -1,

            missionLteUrl: '',
            missionLteUrlFlag: false,

            curLteVal: -80,
            colorLteVal: '#9E9E9E',
            iconLte: 'mdi-network-strength-off-outline',

            roll: 0,
            arrRoll: [],
            pitch: 0,
            arrPitch: [],
            heading: 0,
            airspeed: 0,
            colorAirspeed: 'td-text-gray',
            mavStr: '...',
            statusColor: 'indicator-gray',
            statusTextColor: 'indicator-text-gray',
            borderColor: 'indicator-border-gray',
            missionTimeoutObj: null,
            timeoutObj: null,
            lteTimeoutObj: null,
            flagReceiving: false,
            sys_id: 0,
            hb: {},
            gpi: {lat: 370000000, lon: 1270000000, alt: 1000000, relative_alt: 100000},
            max_v: (this.bat_cell * 4.2),
            mid_v: (this.bat_cell * 3.95),
            min_v: (this.bat_cell * 3.75),
            ss: {voltage_battery: 44000},
            adsb: {ICAO_address: '12K345', lat: 370000000, lon: 1270000000, attitude: 1000000, heading: 100, callsign: 'KETI', speed: 100, squawk: 0},
            att: {},
            rc1: {},
            rc2: {},
            rc3: {},
            rc4: {},
            params: {},

            num_satellites: 0,

            recv_counter: 1,
            timer_id: null,
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
                clientId: this.name + nanoid(15),
                username: 'keti_muv',
                password: 'keti_muv',
            },
            drone_topic: '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/Drone_Data/' + this.name + '/#',
            broadcast_topic: '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/' + this.name,
            droneSubscribeSuccess: {},

            // mavStrFromDrone: {},
            // mavStrFromDroneLength: {},

            pre_lat: 0,
            pre_lng: 0,
            pre_heading: 0,
            pre_relative_alt: 0,
            pre_airspeed: 0,

            result_command_ack: {},

            result_mission_ack: {},
            result_check_count: 0,
            mission_request: {},

            rssi: 255,

            mission_seq: 0,

            startFlightTime: null,

            strMyDroneInfo: '',

            watchingMission: '',
            watchingMissionStatus: 0,
            watchingCount: 0,
            watchingMaxCount: 64,
            watchingInitDist: 0,
            watchingInitSpeed: 0,

            stxFlag: 0,
            strContentEach: '',

            droneStatus: {},

            ADSB_Monitor_Flag: false,

            MAV_CMD_ACK_CODE: {
                0: 'MAV_CMD_ACK_OK',
                1: 'MAV_CMD_ACK_ERR_FAIL',
                2: 'MAV_CMD_ACK_ERR_ACCESS_DENIED',
                3: 'MAV_CMD_ACK_ERR_NOT_SUPPORTED',
                4: 'MAV_CMD_ACK_ERR_COORDINATE_FRAME_NOT_SUPPORTED',
                5: 'MAV_CMD_ACK_ERR_COORDINATES_OUT_OF_RANGE',
                6: 'MAV_CMD_ACK_ERR_X_LAT_OUT_OF_RANGE',
                7: 'MAV_CMD_ACK_ERR_Y_LON_OUT_OF_RANGE',
                8: 'MAV_CMD_ACK_ERR_Z_ALT_OUT_OF_RANGE',
            },

            MAV_MISSION_RESULT_CODE: {
                0: 'MAV_MISSION_ACCEPTED',
                1: 'MAV_MISSION_ERROR',
                2: 'MAV_MISSION_UNSUPPORTED_FRAME',
                3: 'MAV_MISSION_UNSUPPORTED',
                4: 'MAV_MISSION_NO_SPACE',
                5: 'MAV_MISSION_INVALID',
                6: 'MAV_MISSION_INVALID_PARAM1',
                7: 'MAV_MISSION_INVALID_PARAM2',
                8: 'MAV_MISSION_INVALID_PARAM3',
                9: 'MAV_MISSION_INVALID_PARAM4',
                10: 'MAV_MISSION_INVALID_PARAM5_X',
                11: 'MAV_MISSION_INVALID_PARAM6_Y',
                12: 'MAV_MISSION_INVALID_PARAM7',
                13: 'MAV_MISSION_INVALID_SEQUENCE',
                14: 'MAV_MISSION_DENIED',
                15: 'MAV_MISSION_OPERATION_CANCELLED',
            },

            MAV_AUTOPILOT: {
                0: 'MAV_AUTOPILOT_GENERIC',
                1: 'MAV_AUTOPILOT_RESERVED',
                2: 'MAV_AUTOPILOT_SLUGS',
                3: 'MAV_AUTOPILOT_ARDUPILOTMEGA',
                4: 'MAV_AUTOPILOT_OPENPILOT',
                5: 'MAV_AUTOPILOT_GENERIC_WAYPOINTS_ONLY',
                6: 'MAV_AUTOPILOT_GENERIC_WAYPOINTS_AND_SIMPLE_NAVIGATION_ONLY',
                7: 'MAV_AUTOPILOT_GENERIC_MISSION_FULL',
                8: 'MAV_AUTOPILOT_INVALID',
                9: 'MAV_AUTOPILOT_PPZ',
                10: 'MAV_AUTOPILOT_UDB',
                11: 'MAV_AUTOPILOT_FP',
                12: 'MAV_AUTOPILOT_PX4',
                13: 'MAV_AUTOPILOT_SMACCMPILOT',
                14: 'MAV_AUTOPILOT_AUTOQUAD',
                15: 'MAV_AUTOPILOT_ARMAZILA',
                16: 'MAV_AUTOPILOT_AEROB',
                17: 'MAV_AUTOPILOT_ASLUAV',
                18: 'MAV_AUTOPILOT_SMARTAP',
                19: 'MAV_AUTOPILOT_AIRRAILS',
                20: 'MAV_AUTOPILOT_REFLEX',
            },

            enableVideo: false,
            info: {
                no: this.name,
                headingDirection: 210,
                airSpeed: 15,
                altitude: 60,
                cetr: 2,
                linkQuality: 35,
                gpsTime: '03:15:31',
                batState: {
                    volt: 100,
                    per: 25
                },
                flightMode: 'Stabilize',
                wayPoint: {
                    distance: 0,
                    number: 0
                },
                gpsState: 'No Fix',
                bankAngle: 0,
                anglePitch: 0,
                flightTime: '12 : 03',
                fs: false,
                isVideo: false,
                num_satellites: 0,
                rssi: 0,
                colorLteVal: '#9E9E9E',
                curLteVal: 0,
                iconLte: 'mdi-network-strength-off-outline',
                colorBattery: '#9E9E9E',
                iconBattery: 'mdi-battery-off-outline',
                voltageBattery: 0,
                iconFlightElapsed: 'mdi-timer-off-outline',
                flightElapsedTime: '00:00',
                valueDistance: '0 m',
                wpYawBehavior: 'YAW-0',
                colorMode: '#9E9E9E',
                curMode: 'UNKNOWN',
                curArmStatus: 'DISARMED',
                severity: 6,
                text: ''
            },
            fc_img: "ardupilot.png",
            fcType: 'ardupilot',
        }
    },

    computed: {
        bpm_color() {
            if (this.bpm < 100) return '#9E9E9E'
            if (this.bpm < 200) return 'indigo'
            if (this.bpm < 300) return 'teal'
            if (this.bpm < 400) return 'green'
            if (this.bpm < 500) return 'orange'
            return 'red'
        },
        animationDuration() {
            return `${60 / this.bpm}s`
        },
        iconFontSize() {
            return ("font-size: " + (this.airspeed_size / 6) + 'px');
        },
        // flightElapsedTime() {
        //     var min = parseInt(this.flightTimeCount / 60).toString().padStart(2, '0');
        //     let sec = (this.flightTimeCount % 60).toString().padStart(2, '0');
        //     // let min = parseInt(this.stat_flttime_param.param_value / 60).toString().padStart(2, '0');
        //     // let sec = (this.stat_flttime_param.param_value % 60).toString().padStart(2, '0');
        //     return (min + ':' + sec);
        // },
        heightInfo() {
            return ('height: ' + (this.airspeed_size / 2) + 'px');
        },
    },

    watch: {
        chosenWaypointsFile: function (newVal) {
            this.showLoadWaypointsBtn = !newVal;
        },

        ['$store.state.tempMarkers']: {
            deep: true,
            handler: function (newData) {
                //console.log('DroneInfo-watch-goto_positions', newData);

                this.positions = [];
                for (let dName in newData) {
                    if (Object.prototype.hasOwnProperty.call(newData, dName)) {
                        if(dName === this.name) {
                            for (let pIndex in newData[dName]) {
                                let goto_pos = {};
                                goto_pos.type = 'Goto';
                                goto_pos.text = newData[dName][pIndex].lat + ':' +
                                    newData[dName][pIndex].lng + ':' +
                                    newData[dName][pIndex].alt + ':' +
                                    newData[dName][pIndex].speed + ':' +
                                    newData[dName][pIndex].radius + ':' +
                                    newData[dName][pIndex].turningSpeed + ':' +
                                    newData[dName][pIndex].targetMavCmd + ':' +
                                    newData[dName][pIndex].targetStayTime + ':' +
                                    newData[dName][pIndex].elevation;
                                goto_pos.icon = 'mdi-logout-variant';

                                let diffAlt = newData[dName][pIndex].alt - newData[dName][pIndex].elevation;
                                if(diffAlt > 5) {
                                    this.evalAltColor[pIndex] = 'green';
                                }
                                else if(diffAlt > 0) {
                                    this.evalAltColor[pIndex] = 'yellow';
                                }
                                else {
                                    this.evalAltColor[pIndex] = 'red';
                                }

                                this.positions.push(goto_pos);
                            }
                        }
                    }
                }
                this.$forceUpdate();
            }
        },

        curArmStatus: function (newVal) {
            if(newVal === 'ARMED') {
                this.$store.state.drone_infos[this.name].takeoffAbsoluteAlt = (this.$store.state.drone_infos[this.name].absolute_alt - this.$store.state.drone_infos[this.name].alt);

                this.$store.state.rtlModeMonitor[this.name] = true;
            }
        },

        curMode: function (newVal) {
            this.colorMode = 'td-text-blue';
            this.info.colorMode = 'blue';

            this.$store.state.drone_infos[this.name].curMode = newVal;
            this.info.curMode = newVal;
            this.$store.state.drone_infos[this.name].targetModeSelection = newVal;

            if(this.$store.state.drone_infos[this.name].preMode === 'AUTO' && this.curArmStatus === 'ARMED') {
                this.$store.state.drone_infos[this.name].pausePosition = {
                    lat: this.gpi.lat / 10000000,
                    lng: this.gpi.lon / 10000000,
                    alt: this.gpi.alt / 1000,
                    heading: this.heading,
                };

                console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& AUTO mode is interrupted!', this.name, 'AUTO -> ', newVal, this.$store.state.drone_infos[this.name].pausePosition);

                this.postDroneInfos(() => {

                });

            }

            setTimeout(() => {
                if (this.flagReceiving) {
                    this.colorMode = 'td-text-black';
                    this.info.colorMode = 'white';
                }
                else {
                    this.colorMode = 'td-text-gray';
                    this.info.colorMode = '#9E9E9E';
                }
            }, 2000);

            this.$store.state.drone_infos[this.name].preMode = this.$store.state.drone_infos[this.name].curMode;
        },

        sortie_name: function (newData, oldData) {
            console.log(`sortie_name change ${oldData} -> ${newData}`, 'missionLteUrl', this.missionLteUrl);

            if (newData !== 'disarm') {
                var now = moment.utc();
                this.startFlightTime = moment(newData.replace(/_/g, ''));
                console.log('sortie_name', this.startFlightTime);

                //let diff = (now.seconds() - this.startFlightTime.seconds());
                let diff = now.subtract(this.startFlightTime);
                console.log(diff.unix());

                this.flightTimeCount = diff.unix();
                this.startFlightTimer();
            }
            else {
                this.stopFlightTimer();
            }

            if (this.missionLteUrl === '') {
                return;
            }

            // let sortie_name = newData;
            // let mission_topic = '/oneM2M/req/Mobius2/' + this.name + '/json';
            //
            // this.createSubscription(sortie_name, (res) => {
            //     console.log('createSubscription', res);
            //
            //     if (res.status === 201 || res.status === 409) {
            //         //EventBus.$emit('do-subscribe', mission_topic);
            //
            //         this.doSubscribe(mission_topic);
            //
            //         this.droneSubscribeSuccess[mission_topic] = true;
            //         console.log('Subscribe mission topic to ', mission_topic);
            //     }
            // });

            // this.getParentSubscription(sortie_name, (res) => {
            //     console.log('getParentSubscription', res);
            //
            //     if (res.status === 200) {
            //         this.getSubscription(sortie_name, (res) => {
            //             console.log('getSubscription', res);
            //
            //             if (res.status === 200) {
            //                 //EventBus.$emit('do-subscribe', mission_topic);
            //
            //                 this.doSubscribe(mission_topic);
            //
            //                 this.droneSubscribeSuccess[mission_topic] = true;
            //                 console.log('Subscribe mission topic to ', mission_topic);
            //             }
            //             else {
            //                 this.createSubscription(sortie_name, function (res) {
            //                     console.log('createSubscription', res);
            //
            //                     if (res.status === 201 || res.status === 409) {
            //                         //EventBus.$emit('do-subscribe', mission_topic);
            //
            //                         this.doSubscribe(mission_topic);
            //
            //                         this.droneSubscribeSuccess[mission_topic] = true;
            //                         console.log('Subscribe mission topic to ', mission_topic);
            //                     }
            //                 });
            //             }
            //         });
            //     }
                // else {
                //     let tid = setInterval(this.getParentSubscription, 2000, sortie_name, (res) => {
                //         console.log('getParentSubscription', res);
                //
                //         if (res.status === 200) {
                //             clearInterval(tid);
                //
                //             this.getSubscription(sortie_name, (res) => {
                //
                //                 console.log('getSubscription', res);
                //
                //                 if (res.status === 200) {
                //                     //EventBus.$emit('do-subscribe', mission_topic);
                //                     console.log(mission_topic);
                //                     this.doSubscribe(mission_topic);
                //
                //                     this.droneSubscribeSuccess[mission_topic] = true;
                //                     console.log('Subscribe mission topic to ', mission_topic);
                //                 } else {
                //                     this.createSubscription(sortie_name, function (res) {
                //                         console.log('createSubscription', res);
                //
                //                         if (res.status === 201 || res.status === 409) {
                //                             //EventBus.$emit('do-subscribe', mission_topic);
                //
                //                             this.doSubscribe(mission_topic);
                //
                //                             this.droneSubscribeSuccess[mission_topic] = true;
                //                             console.log('Subscribe mission topic to ', mission_topic);
                //                         }
                //                     });
                //                 }
                //             });
                //         }
                //     });
                // }
            // });
        },
    },

    methods: {
        fillData() {
            const ctx = document.getElementById('chart-'+this.name).getContext('2d');
            let config = {
                data: {
                    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                    datasets: [
                        {
                            type: 'bar',
                            label: '# of Votes',
                            data: [12, 19, 3, 5, 2, 3],
                            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'],
                            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
                            borderWidth: 1
                        },
                        {
                            type: 'line',
                            label: 'Line Dataset',
                            data: [20, 21, 19, 18, 20, 22],
                        }
                    ]
                },
                options: {
                    scales: {
                        y: {beginAtZero: true}
                    }
                }
            };

            this.myChart = new Chart(ctx, config);
        },

        selectedMavVersion: function(event) {
            // console.log("selectedMavVersion", event)
            this.mavVersion = event;

            localStorage.setItem(this.name + '_mavVersion', this.mavVersion);
        },

        onVideoHandler(e, drone_name) {
            this.info.isVideo = e === 0;

            console.log('>>>>>>>>>>>>>>>>>>>>>>', this.info.isVideo, drone_name,)
            EventBus.$emit('do-video-on-' + drone_name, {});
            //EventBus.$emit('hud-data-' + drone_name, this.info);
        },

        loadUpdateWaypoints() {
            console.log('loadUpdateWaypoints', 'chosenWaypointsFile', this.chosenWaypointsFile);

            if (!this.chosenWaypointsFile) {
                this.strWaypoints = "No File Chosen"
            }

            var reader = new FileReader();

            // Use the javascript reader object to load the contents
            // of the file in the v-model prop
            reader.readAsText(this.chosenWaypointsFile);
            reader.onload = () => {
                this.strWaypoints = reader.result;

                console.log('strWaypoints', this.strWaypoints);
                if (this.chosenWaypointsFile.name.includes('.waypoints') || this.chosenWaypointsFile.name.includes('.txt')) {
                    console.log('Waypoints File in Mission Planner');
                    this.strWaypoints = this.strWaypoints.replace(/\n/g, '\r');
                    let arrWayPoints = this.strWaypoints.split('\r');
                    console.log('arrWayPoints', arrWayPoints);

                    let objMyDroneInfo = JSON.parse(this.strMyDroneInfo);

                    console.log('strMyDroneInfo', this.strMyDroneInfo, 'drone_infos', JSON.stringify(this.$store.state.drone_infos[this.name]));

                    console.log('objMyDroneInfo', objMyDroneInfo);

                    objMyDroneInfo.goto_positions = null;
                    objMyDroneInfo.goto_positions = [];

                    let acceptSeq = 0;
                    arrWayPoints.forEach((waypoint) => {
                        waypoint = waypoint.replace(/\n/g, '');
                        waypoint = waypoint.replace(/\t\t/g, '\t');
                        let arrWaypoint = waypoint.split('\t');

                        console.log('arrWaypoint.length', arrWaypoint.length, 'arrWaypoint', arrWaypoint, 'arrWaypoint[0]', parseInt(arrWaypoint[0]));

                        let seq = parseInt(arrWaypoint[0]);

                        if (!isNaN(seq)) {
                            if (seq > 1) { // seq = 0 (home position), seq = 1 (takeoff)
                                if (arrWaypoint[3] === 16 || arrWaypoint[3] === '16' || arrWaypoint[3] === 21 || arrWaypoint[3] === '21') {
                                    let strGotoPosition = String(arrWaypoint[8]) + ':' +
                                        String(arrWaypoint[9]) + ':' +
                                        String(arrWaypoint[10]) + ':' +
                                        (arrWaypoint[12] ? String(arrWaypoint[12]) : String(objMyDroneInfo.targetSpeed)) + ':' +
                                        String(objMyDroneInfo.targetRadius) + ':' +
                                        String(objMyDroneInfo.targetTurningSpeed) + ':' +
                                        String(arrWaypoint[3]) + ':' +
                                        String(arrWaypoint[4]) + ':0.0:0';

                                    console.log(strGotoPosition);

                                    objMyDroneInfo.goto_positions[acceptSeq++] = strGotoPosition;

                                    //this.strMyDroneInfo = JSON.stringify(objMyDroneInfo, null, 4);
                                }
                            }
                        }
                    });

                    // 원석 수정 부분
                    // let acceptSeq = 0;
                    // let takeoff_alt = 0;
                    // arrWayPoints.forEach((waypoint) => {
                    //     waypoint = waypoint.replace(/\n/g, '');
                    //     waypoint = waypoint.replace(/\t\t/g, '\t');
                    //     let arrWaypoint = waypoint.split('\t');
                    //
                    //     console.log('arrWaypoint.length', arrWaypoint.length, 'arrWaypoint', arrWaypoint, 'arrWaypoint[0]', parseInt(arrWaypoint[0]));
                    //
                    //     let seq = parseInt(arrWaypoint[0]);
                    //
                    //     if (!isNaN(seq)) {
                    //         if (seq > 0) { // seq = 0 (home position), seq = 1 (takeoff)
                    //             if (seq === 1) {
                    //                 takeoff_alt = arrWaypoint[10]
                    //             } else {
                    //                 if (arrWaypoint[3] === 16 || arrWaypoint[3] === '16' || arrWaypoint[3] === 21 || arrWaypoint[3] === '21') {
                    //                     let strGotoPosition = String(arrWaypoint[8]) + ':' +
                    //                         String(arrWaypoint[9]) + ':' +
                    //                         (String(arrWaypoint[10]) === '0.000000' ? String(takeoff_alt) : String(arrWaypoint[10])) + ':' +
                    //                         (arrWaypoint[12] ? String(arrWaypoint[12]) : String(objMyDroneInfo.targetSpeed)) + ':' +
                    //                         String(objMyDroneInfo.targetRadius) + ':' +
                    //                         String(objMyDroneInfo.targetTurningSpeed) + ':' +
                    //                         String(arrWaypoint[3]) + ':' +
                    //                         String(arrWaypoint[4]) + ':0.0:0';
                    //
                    //                     // console.log(strGotoPosition);
                    //
                    //                     objMyDroneInfo.goto_positions[acceptSeq++] = strGotoPosition;
                    //
                    //                     //this.strMyDroneInfo = JSON.stringify(objMyDroneInfo, null, 4);
                    //                 }
                    //             }
                    //         }
                    //     }
                    // });

                    this.strMyDroneInfo = JSON.stringify(objMyDroneInfo, null, 4);
                } else if (this.chosenWaypointsFile.name.includes('.kml')) {
                    console.log('Waypoints File(KML) in QGroundControl');

                    let objMyDroneInfo = JSON.parse(this.strMyDroneInfo);

                    console.log('strMyDroneInfo', this.strMyDroneInfo, 'drone_infos', JSON.stringify(this.$store.state.drone_infos[this.name]));

                    console.log('objMyDroneInfo', objMyDroneInfo);

                    objMyDroneInfo.goto_positions = null;
                    objMyDroneInfo.goto_positions = [];

                    let json = convert.xml2json(this.strWaypoints, {compact: true})
                    let placemark = JSON.parse(json).kml.Document.Folder.Placemark
                    // console.log(placemark)

                    let acceptSeq = 0;

                    placemark.forEach((waypoint) => {
                        waypoint = waypoint.description['_cdata'].split('\r\n')
                        console.log(waypoint)
                        // let arrWaypoint = []
                        let seq = parseInt(waypoint[0].split(' ')[1]);

                        if (!isNaN(seq)) {
                            if (seq !== 0 && waypoint[1] === 'Waypoint') {
                                let strGotoPosition = String(waypoint[4].split(' ')[1]) + ':' +
                                    String(waypoint[5].split(' ')[1]) + ':' +
                                    String(waypoint[3].split(' ')[2]) + ':' +
                                    (waypoint[7] ? String(waypoint[7]) : String(objMyDroneInfo.targetSpeed)) + ':' +
                                    String(objMyDroneInfo.targetRadius) + ':' +
                                    String(objMyDroneInfo.targetTurningSpeed) + ':16:0:0.0:0';

                                console.log(strGotoPosition);

                                objMyDroneInfo.goto_positions[acceptSeq++] = strGotoPosition;
                            }
                        }
                    });
                    this.strMyDroneInfo = JSON.stringify(objMyDroneInfo, null, 4);
                } else if (this.chosenWaypointsFile.name.includes('.plan')) {
                    console.log('Waypoints File(plan) in QGroundControl');
                    this.strWaypoints = JSON.parse(this.strWaypoints);

                    let objMyDroneInfo = JSON.parse(this.strMyDroneInfo);

                    console.log('strMyDroneInfo', this.strMyDroneInfo, 'drone_infos', JSON.stringify(this.$store.state.drone_infos[this.name]));

                    console.log('objMyDroneInfo', objMyDroneInfo);

                    objMyDroneInfo.goto_positions = null;
                    objMyDroneInfo.goto_positions = [];

                    let WayPoints = null;

                    for (let idx in this.strWaypoints.mission.items) {
                        if (Object.prototype.hasOwnProperty.call(this.strWaypoints.mission.items[idx], 'TransectStyleComplexItem')) {
                            WayPoints = this.strWaypoints.mission.items[idx].TransectStyleComplexItem.Items;
                        }
                    }
                    let acceptSeq = 0;
                    if (WayPoints) {
                        WayPoints.forEach((waypoint) => {
                            if (waypoint.command === 16 || waypoint.command === '16' || waypoint.command === 21 || waypoint.command === '21') {
                                let strGotoPosition = String(waypoint.params[4]) + ':' +
                                    String(waypoint.params[5]) + ':' +
                                    String(waypoint.params[6]) + ':' +
                                    (waypoint.params[7] ? String(waypoint.params[7]) : String(objMyDroneInfo.targetSpeed)) + ':' +
                                    String(objMyDroneInfo.targetRadius) + ':' +
                                    String(objMyDroneInfo.targetTurningSpeed) + ':' +
                                    String(waypoint.command) + ':' +
                                    String(waypoint.params[0]) + ':0.0:0';

                                console.log(strGotoPosition);

                                objMyDroneInfo.goto_positions[acceptSeq++] = strGotoPosition;
                            }
                        });
                    }
                    this.strMyDroneInfo = JSON.stringify(objMyDroneInfo, null, 4);
                }
            }
        },

        saveWaypoints() {
            let seq = 0;
            let arrWaypoints = [];
            let arrWaypoint = [];

            arrWaypoint[0] = 0;
            arrWaypoint[1] = 1;
            arrWaypoint[2] = 0;
            arrWaypoint[3] = 0;
            arrWaypoint[4] = 0;
            arrWaypoint[5] = 0;
            arrWaypoint[6] = 0;
            arrWaypoint[7] = 0;
            arrWaypoint[8] = 0;
            arrWaypoint[9] = 0;
            arrWaypoint[10] = 0;
            arrWaypoint[11] = 1;
            arrWaypoint[12] = 0;

            arrWaypoints[seq++] = arrWaypoint.join('\t');

            console.log(arrWaypoints);

            let objMyDroneInfo = JSON.parse(this.strMyDroneInfo);
            objMyDroneInfo.goto_positions.forEach((point)=>{
                let arrPoint = point.split(':');

                arrWaypoint[0] = seq;
                arrWaypoint[1] = 0;
                arrWaypoint[2] = 3;
                arrWaypoint[3] = parseFloat(arrPoint[6]);
                arrWaypoint[4] = parseFloat(arrPoint[7]);
                arrWaypoint[5] = 0.00000000;
                arrWaypoint[6] = 0.00000000;
                arrWaypoint[7] = 0.00000000;
                arrWaypoint[8] = parseFloat(arrPoint[0]);
                arrWaypoint[9] = parseFloat(arrPoint[1]);
                arrWaypoint[10] = parseFloat(arrPoint[2]);
                arrWaypoint[11] = 1;
                arrWaypoint[12] = parseFloat(arrPoint[5]);

                arrWaypoints[seq++] = arrWaypoint.join('\t');
                console.log(arrWaypoints);
            });

            let strWaypoints = arrWaypoints.join('\n');

            strWaypoints = 'QGC WPL 110\n' + strWaypoints;

            console.log(strWaypoints);

            const blob = new Blob([strWaypoints], {type: 'text/plain'})
            const e = document.createEvent('MouseEvents'),
                a = document.createElement('a');
            a.download = "test.waypoints";
            a.href = window.URL.createObjectURL(blob);
            a.dataset.downloadurl = ['text/txt', a.download, a.href].join(':');
            e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
        },

        targetTempMarkerPosition: function (i) {
            let payload = {};
            payload.pName = this.name;
            payload.pIndex = i;
            payload.targeted = true;

            console.log('targetTempMarkerPosition', this.selectedItem);

            //this.selectedItem = -1;

            //(this.selectedItem === i) ? (this.selectedItem = -1) : (this.selectedItem);

            EventBus.$emit('do-centerCurrentPosition', {lat: this.$store.state.tempMarkers[this.name][i].lat, lng: this.$store.state.tempMarkers[this.name][i].lng});

            EventBus.$emit('do-targetTempMarker', payload);
        },

        showMyDroneInfoDialog() {
            this.$store.state.drone_infos[this.name].goto_positions = [];
            this.$store.state.tempMarkers[this.name].forEach((pos) => {
                let strPos = pos.lat + ':' +
                    pos.lng + ':' +
                    pos.alt + ':' +
                    pos.speed + ':' +
                    pos.radius + ':' +
                    pos.turningSpeed + ':' +
                    pos.targetMavCmd + ':' +
                    pos.targetStayTime + ':' +
                    pos.elevation;
                this.$store.state.drone_infos[this.name].goto_positions.push(strPos);
            });

            this.strMyDroneInfo = JSON.stringify(this.$store.state.drone_infos[this.name], null, 4);

            this.chosenWaypointsFile = null;
            this.dialog = true;
        },

        updateMyDroneInfo() {
            console.log('updateMyDroneInfo', this.strMyDroneInfo);

            try {
                let temp = JSON.parse(this.strMyDroneInfo);

                this.$store.state.drone_infos[this.name] = null;
                this.$store.state.drone_infos[this.name] = JSON.parse(JSON.stringify(temp));

                this.$store.state.tempMarkers[this.name] = [];
                this.$store.state.drone_infos[this.name].goto_positions.forEach((ele) => {
                    let pos_arr = ele.split(':');

                    let marker = {};
                    marker.lat = parseFloat(pos_arr[0]);
                    marker.lng = parseFloat(pos_arr[1]);
                    marker.alt = parseFloat(pos_arr[2]);
                    marker.speed = parseFloat(pos_arr[3]);
                    marker.radius = parseFloat(pos_arr[4]);
                    marker.turningSpeed = parseFloat(pos_arr[5]);
                    marker.targetMavCmd = (typeof pos_arr[6] === 'undefined') ? 16 : parseInt(pos_arr[6]);
                    marker.targetStayTime = (typeof pos_arr[7] === 'undefined') ? 1 : parseInt(pos_arr[7]);
                    marker.elevation = (typeof pos_arr[8] === 'undefined') ? 0.0 : parseInt(pos_arr[8]);
                    marker.type = 'Goto';
                    marker.selected = false;
                    marker.targeted = false;
                    marker.color = this.$store.state.drone_infos[this.name].color;

                    this.$store.state.tempMarkers[this.name].push(marker);
                });

                // this.positions = [];
                // for (let i in this.$store.state.drone_infos[this.name].goto_positions) {
                //     if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[this.name].goto_positions, i)) {
                //         let goto_pos = {};
                //         if(typeof this.$store.state.drone_infos[this.name].goto_positions[i][9] === 'undefined') {
                //             goto_pos.type = 'Goto';
                //         }
                //         else {
                //             if(this.$store.state.drone_infos[this.name].goto_positions[i][9] === '2') {
                //                 goto_pos.type = 'Survey';
                //             }
                //             else if(this.$store.state.drone_infos[this.name].goto_positions[i][9] === '1') {
                //                 goto_pos.type = 'Circle';
                //             }
                //             else {
                //                 goto_pos.type = 'Goto';
                //             }
                //         }
                //         goto_pos.text = this.$store.state.drone_infos[this.name].goto_positions[i];
                //         goto_pos.icon = 'mdi-logout-variant';
                //         this.positions.push(goto_pos);
                //     }
                // }
                // this.$forceUpdate();

                //this.$store.commit('updateDroneInfosSelected');

                this.postMarkerInfos(this.name, () => {
                    console.log('DroneInfo.vue', 'postMarkerInfos');
                });

                EventBus.$emit('gcs-map-ready');
            }
            catch (e) {
                console.log('updateMyDroneInfo-JSON parsing error', e.message);
            }

            this.dialog = false;
        },

        postMarkerInfos(dName, callback) {
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
                function (res) {

                    console.log('postMarkerInfos-axios', dName, res.data);

                    callback(res.status, '');
                }
            ).catch(
                function (err) {
                    console.log(err.message);
                }
            );
        },

        postDroneInfos(callback) {
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'post',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/DroneInfos/' + this.name,
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random()*10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json;ty=4'
                },
                data: {
                    'm2m:cin': {
                        con: this.$store.state.drone_infos[this.name]
                    }
                }
            }).then(
                (res) => {
                    console.log('postDroneInfos-axios', this.name, res.data);

                    callback(res);
                }
            ).catch(
                (err) => {
                    console.log(err.message);

                    callback(err)
                }
            );
        },

        // postDroneInfos(callback) {
        //     axios({
        //         validateStatus: function (status) {
        //             // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
        //             return status < 500;
        //         },
        //         method: 'post',
        //         url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/Info',
        //         headers: {
        //             'X-M2M-RI': String(parseInt(Math.random() * 10000)),
        //             'X-M2M-Origin': 'SVue',
        //             'Content-Type': 'application/json;ty=4'
        //         },
        //         data: {
        //             'm2m:cin': {
        //                 con: this.$store.state.drone_infos
        //             }
        //         }
        //     }).then(
        //         function (res) {
        //             console.log('postDroneInfos-axios', res.data);
        //
        //             callback(res);
        //         }
        //     ).catch(
        //         function (err) {
        //             console.log(err.message);
        //
        //             callback(err)
        //         }
        //     );
        // },

        currentPosition() {
            EventBus.$emit('do-centerCurrentPosition', {lat: this.gpi.lat / 10000000, lng: this.gpi.lon / 10000000})
        },

        checkDroneTargeted(checked) {
            console.log('checkDroneTargeted', checked);

            // if(event) {
            //     this.$store.state.dronesChecked[this.name] = null;
            //     this.$store.state.dronesChecked[this.name] = this.$store.state.drone_infos[this.name];
            // }
            // else {
            //     delete this.$store.state.dronesChecked[this.name];
            // }
            //
            // let temp = JSON.parse(JSON.stringify(this.$store.state.dronesChecked));
            // this.$store.state.dronesChecked = null;
            // this.$store.state.dronesChecked = JSON.parse(JSON.stringify(temp));
            // temp = null;

            EventBus.$emit('do-updateTargetDroneMarker', this.name);

            //EventBus.$emit('do-targetDrone');

            this.$store.state.drone_infos[this.name].targeted = checked;

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

        onMessageBroadcast(message) {
            if(!this.$store.state.didIPublish) {
                try {

                    let watchingPayload = JSON.parse(message.toString());

                    console.log('onMessageBroadcast-', watchingPayload);

                    this.watchingMission = watchingPayload.watchingMission;
                    this.watchingInitDist = watchingPayload.watchingInitDist;
                    this.watchingMissionStatus = watchingPayload.watchingMissionStatus;

                    if (watchingPayload.watchingMission === 'goto') {
                        this.$store.state.drone_infos[this.name].targetLat = watchingPayload.targetLat;
                        this.$store.state.drone_infos[this.name].targetLng = watchingPayload.targetLng;
                        this.$store.state.drone_infos[this.name].targetAlt = watchingPayload.targetAlt;

                        this.$store.state.missionLines = this.clone(watchingPayload.missionLines);
                        this.$store.state.missionCircles = this.clone(watchingPayload.missionCircles);
                    }
                    else if (watchingPayload.watchingMission === 'goto-circle') {
                        this.$store.state.drone_infos[this.name].targetLat = watchingPayload.targetLat;
                        this.$store.state.drone_infos[this.name].targetLng = watchingPayload.targetLng;
                        this.$store.state.drone_infos[this.name].targetAlt = watchingPayload.targetAlt;

                        this.droneStatus.radius = watchingPayload.targetRadius;
                        this.droneStatus.initHeading = watchingPayload.targetHeading;

                        this.$store.state.missionCircles = this.clone(watchingPayload.missionCircles);
                        this.$store.state.missionLines = this.clone(watchingPayload.missionLines);
                    }
                    else if (watchingPayload.watchingMission === 'goto-alt') {
                        this.$store.state.drone_infos[this.name].targetAlt = watchingPayload.targetAlt;
                    }
                    else if (watchingPayload.watchingMission === 'takeoff') {
                        this.$store.state.drone_infos[this.name].home_position = watchingPayload.homePosition;
                    }
                }
                catch (e) {
                    console.log('broadcast-watchingMission', e.message);
                }
            }

            this.$store.state.didIPublish = false;
        },

        onDroneMessageHandler(topic, message) {
            let chkTopic = topic.substr(0, 7);

            if (chkTopic === "/Mobius") {
                this.strContentEach += message.toString('hex').toLowerCase();
                while (this.strContentEach.length > 12) {
                    if (this.mavVersion === 'v1' && this.strContentEach.substr(0, 2) === 'fe') {
                        var len = parseInt(this.strContentEach.substr(2, 2), 16);
                        var contentLenth = (6 * 2) + (len * 2) + (2 * 2);

                        if (contentLenth > this.strContentEach.length) {
                            break;
                        }
                        else {
                            // var mavLength = (6 * 2) + (contentLenth * 2) + (2 * 2);
                            //console.log(this.name, this.strContentEach.substr(0, mavLength));

                            this.receiveFromDrone(topic, this.strContentEach.substr(0, contentLenth));

                            this.strContentEach = this.strContentEach.substr(contentLenth);
                            //console.log(this.strContentEach);
                        }
                    }
                    else if (this.mavVersion === 'v2' && this.strContentEach.substr(0, 2) === 'fd') {
                        len = parseInt(this.strContentEach.substr(2, 2), 16);
                        contentLenth = (10 * 2) + (len * 2) + (2 * 2);

                        if (contentLenth > this.strContentEach.length) {
                            break;
                        }
                        else {
                            // var mavLength = (6 * 2) + (contentLenth * 2) + (2 * 2);
                            //console.log(this.name, this.strContentEach.substr(0, contentLenth));

                            this.receiveFromDrone(topic, this.strContentEach.substr(0, contentLenth));

                            this.strContentEach = this.strContentEach.substr(contentLenth);
                            //console.log(this.strContentEach);
                        }
                    }
                    else {
                        this.strContentEach = this.strContentEach.substr(2);
                    }
                }
            }
        },

        onMessageHandler(topic, message) {
            let chkTopic = topic.substr(0, 7);

            if (chkTopic === '/oneM2M') {
                var jsonObj = JSON.parse(message.toString());

                if (jsonObj['m2m:rqp'] == null) {
                    jsonObj['m2m:rqp'] = jsonObj;
                }

                if (Object.prototype.hasOwnProperty.call(jsonObj['m2m:rqp'], 'pc')) {

                    // console.log(Object.keys(jsonObj['m2m:rqp'].pc)[0]);
                    // console.log(jsonObj['m2m:rqp'].pc);

                    let arr_topic = topic.split('/');
                    let resp_topic = topic.replace('/req/', '/resp/');
                    let rsp_message = {};
                    rsp_message['m2m:rsp'] = {};
                    rsp_message['m2m:rsp'].rsc = 2001;
                    rsp_message['m2m:rsp'].to = '';
                    rsp_message['m2m:rsp'].fr = arr_topic[4];
                    rsp_message['m2m:rsp'].rqi = '12345';
                    rsp_message['m2m:rsp'].pc = '';

                    //console.log(resp_topic);

                    this.doPublish(resp_topic, JSON.stringify(rsp_message['m2m:rsp']));

                    rsp_message = null;

                    if (Object.prototype.hasOwnProperty.call(jsonObj['m2m:rqp'].pc, 'm2m:sgn')) {
                        if (Object.prototype.hasOwnProperty.call(jsonObj['m2m:rqp'].pc['m2m:sgn'], 'nev')) {
                            if (Object.prototype.hasOwnProperty.call(jsonObj['m2m:rqp'].pc['m2m:sgn'].nev, 'rep')) {
                                if (Object.keys(jsonObj['m2m:rqp'].pc['m2m:sgn'].nev.rep)[0] === 'm2m:cin') {
                                    let mission_payload = {};

                                    mission_payload.drone_name = arr_topic[4];
                                    mission_payload.payload = {}
                                    mission_payload.payload.sur = jsonObj['m2m:rqp'].pc['m2m:sgn'].sur;
                                    mission_payload.payload.con = jsonObj['m2m:rqp'].pc['m2m:sgn'].nev.rep['m2m:cin'].con;

                                    //this.$store.commit('setMissionPayload', mission_payload);

                                    //EventBus.$emit('push-mission-' + mission_payload.drone_name, mission_payload.payload);

                                    let payload = JSON.parse(JSON.stringify(mission_payload.payload));
                                    mission_payload = null;
                                    let arr_sur = payload.sur.split('/');
                                    arr_sur.pop();
                                    payload.sur = '/' + arr_sur.join('/');

                                    //if ((this.missionLteUrl + '/' + this.sortie_name) === payload.sur) {
                                    if (this.missionLteUrl === payload.sur) {
                                        // console.log(payload.sur);

                                        if (Object.prototype.hasOwnProperty.call(payload.con, 'rsrp')) {
                                            this.colorLteVal = '#9E9E9E';

                                            this.curLteVal = payload.con.rsrp;
                                            //console.log(this.curLteVal);

                                            payload = null;

                                            if (0 > this.curLteVal && this.curLteVal >= -80) {
                                                this.iconLte = 'mdi-network-strength-4';
                                                this.colorLteVal = '#1E88E5';
                                            }
                                            else if (-80 > this.curLteVal && this.curLteVal >= -90) {
                                                this.iconLte = 'mdi-network-strength-3';
                                                this.colorLteVal = '#76FF03';
                                            }
                                            else if (-90 > this.curLteVal && this.curLteVal >= -100) {
                                                this.iconLte = 'mdi-network-strength-2';
                                                this.colorLteVal = '#FFFF00';
                                            }
                                            else {
                                                this.iconLte = 'mdi-network-strength-1';
                                                this.colorLteVal = '#FF3D00';
                                            }

                                            this.info.colorLteVal = this.colorLteVal;
                                            this.info.curLteVal = this.curLteVal;
                                            this.info.iconLte = this.iconLte;

                                            if (this.lteTimeoutObj) {
                                                clearTimeout(this.lteTimeoutObj);
                                            }

                                            this.lteTimeoutObj = setTimeout(() => {
                                                this.lteTimeoutObj = null;
                                                this.colorLteVal = '#9E9E9E';
                                                this.iconLte = 'mdi-network-strength-off-outline';
                                            }, 5500);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        createConnection() {
            if (this.client.connected) {
                console.log('DroneInfo', this.name, 'createConnection', 'destroyConnection')
                this.destroyConnection();
            }

            if (!this.client.connected) {

                this.client.loading = true;
                this.connection.clientId = 'mqttjs_' + this.name + '_' + nanoid(15);
                this.connection.host = this.$store.state.VUE_APP_MOBIUS_HOST;
                const {host, port, endpoint, ...options} = this.connection;
                const connectUrl = `ws://${host}:${port}${endpoint}`
                try {
                    this.client = mqtt.connect(connectUrl, options);

                    this.client.on('connect', () => {
                        console.log(this.name, host, 'DroneInfo Connection succeeded!');

                        this.client.connected = true;
                        this.client.loading = false;

                        //localStorage.setItem('mqttConnection-' + this.name, JSON.stringify(this.client));

                        this.drone_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/Drone_Data/' + this.name + '/#';
                        this.doUnSubscribe(this.drone_topic);

                        setTimeout(() => {
                            this.doSubscribe(this.drone_topic);
                            console.log('DroneInfoList-drone_topic - Subscribe to ', this.drone_topic);
                        }, 200);
                    });

                    this.client.on('error', (error) => {
                        console.log('Drone Connection failed', error);

                        this.destroyConnection();
                    });

                    this.client.on('close', () => {
                        console.log('Drone Connection closed');

                        this.destroyConnection();

                        this.connection.clientId = 'mqttjs_' + this.name + '_' + nanoid(15);
                    });

                    this.client.on('message', (topic, message) => {
                        // this.receiveNews = this.receiveNews.concat(message)
                        //console.log(`Received message ${message} from topic ${topic}`);

                        //console.log(topic.split('/')[4], message.toString());

                        let payload = {};
                        payload.topic = topic;
                        payload.message = message;

                        this.onDroneMessageHandler(payload.topic, payload.message);
                    });
                }
                catch (error) {
                    console.log('mqtt.connect error', error);
                    this.client.connected = false;
                }
            }
        },

        doSubscribe(topic) {
            if (this.client.connected) {
                const qos = 0;
                this.client.subscribe(topic, {qos}, (error) => {
                    if (error) {
                        console.log('Subscribe to topics error', error)
                        return
                    }
                    this.droneSubscribeSuccess[topic] = true;
                });
            }
        },

        doUnSubscribe(topic) {
            if (this.client.connected) {

                this.client.unsubscribe(topic, (error) => {
                    if (error) {
                        console.log('Unsubscribe error', error)
                    }

                    this.droneSubscribeSuccess[topic] = false;
                    console.log('Unsubscribe to topics (', topic, ')');

                    this.receiveNews = '';
                });
            }
        },

        doPublish(topic, payload) {
            if (this.client.connected) {
                this.client.publish(topic, payload, 0, error => {
                    if (error) {
                        console.log('Publish error', error)
                    }
                });
            }

            if (this.$store.state.client.connected) {
                this.$store.state.client.publish(topic, payload, 0, error => {
                    if (error) {
                        console.log('Publish error', error)
                    }
                });
            }
        },

        destroyConnection() {
            if (this.client.connected) {
                try {
                    if(Object.hasOwnProperty.call(this.client, '__ob__')) {
                        this.client.end();
                    }

                    this.client = {
                        connected: false,
                        loading: false
                    };

                    console.log(this.name, 'Successfully disconnected!');

                    //localStorage.setItem('mqttConnection-' + this.name, JSON.stringify(this.client));
                }
                catch (error) {
                    this.client = {
                        connected: false,
                        loading: false
                    };
                    //localStorage.setItem('mqttConnection-' + this.name, JSON.stringify(this.client));

                    console.log('Disconnect failed', this.name, error.toString());
                }
            }
        },

        postLossLTEInfoToMobius(callback) {
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'post',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/LossLteInfos',
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json;ty=4'
                },
                data: {
                    'm2m:cin': {
                        con: this.$store.state.loss_lte_infos,
                    }
                }
            }).then(
                (res) => {
                    console.log('postLossLTEInfoToMobius', res.data);
                    callback(res.status, '');
                }
            ).catch(
                (err) => {
                    console.log(err.message);
                }
            );
        },

        speak(text, opt_prop) {
            if (typeof SpeechSynthesisUtterance === "undefined" || typeof window.speechSynthesis === "undefined") {
                alert("이 브라우저는 음성 합성을 지원하지 않습니다.")
                return
            }

            window.speechSynthesis.cancel() // 현재 읽고있다면 초기화

            const prop = opt_prop || {}

            const speechMsg = new SpeechSynthesisUtterance()
            speechMsg.rate = prop.rate || 1 // 속도: 0.1 ~ 10
            speechMsg.pitch = prop.pitch || 1 // 음높이: 0 ~ 2
            speechMsg.lang = prop.lang || "en-US"
            speechMsg.text = text

            // SpeechSynthesisUtterance에 저장된 내용을 바탕으로 음성합성 실행
            window.speechSynthesis.speak(speechMsg)
        },

        receiveFromDrone(topic, hex_content_each) {
            var arr_topic = topic.split('/');
            let curSortieName = arr_topic.pop();
            topic = arr_topic.join('/');

            // // eslint-disable-next-line no-prototype-builtins
            // if (!Object.prototype.hasOwnProperty.call(this.mavStrFromDrone, topic)) {
            //     this.mavStrFromDrone[topic] = '';
            // }

            // eslint-disable-next-line no-prototype-builtins
            // if (!Object.prototype.hasOwnProperty.call(this.mavStrFromDroneLength, topic)) {
            //     this.mavStrFromDroneLength[topic] = 0;
            // }
            //
            // if (this.mavStrFromDroneLength[topic] > 0) {
            //     this.mavStrFromDrone[topic] = this.mavStrFromDrone[topic].substr(this.mavStrFromDroneLength[topic]);
            //     this.mavStrFromDroneLength[topic] = 0;
            // }

            //this.mavStrFromDrone[topic] += this.hex(hex_content_each);
            let mavPacket = hex_content_each;
            //var stx = this.mavStrFromDrone[topic].substr(0, 2);
            //if (stx === 'fe') {
            //var len = parseInt(mavPacket.substr(2, 2), 16);

            if(this.mavVersion === 'v1') {
                var recv_sys_id = parseInt(mavPacket.substr(6, 2), 16);
                //var mavLength = (6 * 2) + (len * 2) + (2 * 2);
            }
            else {
                recv_sys_id = parseInt(mavPacket.substr(10, 2), 16);
                //mavLength = (10 * 2) + (len * 2) + (2 * 2);
            }

            if (recv_sys_id === parseInt(this.ref_sys_id)) {
                // if ((this.mavStrFromDrone[topic].length - this.mavStrFromDroneLength[topic]) >= mavLength) {
                //     this.mavStrFromDroneLength[topic] += mavLength;
                // var mavPacket = this.mavStrFromDrone[topic].substr(0, mavLength);
                //this.mavStrFromDrone[topic] = this.mavStrFromDrone[topic].substr(mavLength);

                // let payload = {};
                // payload.sortie_name = sortie_name;
                // payload.data = mavPacket;

                //EventBus.$emit('push-status-' + arr_topic[4], payload);

                this.recv_counter++;

                if(this.curSortieName !== curSortieName) {
                    this.curSortieName = curSortieName;
                    this.$store.state.drone_infos[this.name].sortie_name = curSortieName;
                    localStorage.setItem(this.name+'_sortie_name', this.curSortieName);

                    this.postDroneInfos((res) => {
                        console.log('postDroneInfos -> disarm', res);
                    });
                }

                this.mavStr = mavPacket;

                this.statusColor = 'indicator-green';
                this.statusTextColor = 'indicator-text-black';
                this.borderColor = 'indicator-border-green';
                this.flagReceiving = true;

                //setTimeout(this.parseMavFromDrone, 0, mavPacket);

                this.parseMavFromDrone(mavPacket);

                // payload = null;

                if (this.timeoutObj) {
                    clearTimeout(this.timeoutObj);
                    this.timeoutObj = null;
                }

                this.timeoutObj = setTimeout(() => {
                    if(this.curArmStatus === 'ARMED') {
                        let posLat = this.gpi.lat / 10000000;
                        let posLng = this.gpi.lon / 10000000;
                        let posAlt = this.gpi.alt / 1000;
                        let posKey = (parseInt(this.gpi.lat / 1000) / 10000) + '_' + parseInt(this.gpi.lon / 1000) / 10000;
                        console.log('this.$store.state.loss_lte_infos', this.$store.state.loss_lte_infos);

                        this.$store.state.loss_lte_infos[posKey] = {
                            lat: posLat,
                            lng: posLng,
                            alt: posAlt
                        };

                        this.postLossLTEInfoToMobius();
                    }

                    this.colorArming = 'white';
                    this.iconDistance = 'mdi-map-marker-distance';

                    this.iconBattery = 'mdi-battery-off-outline';
                    this.colorBattery = '#9E9E9E';

                    this.info.iconBattery = this.iconBattery;
                    this.info.colorBattery = this.colorBattery;

                    this.colorAirspeed = 'td-text-gray';

                    this.statusColor = 'indicator-gray';
                    this.statusTextColor = 'indicator-text-gray';
                    this.borderColor = 'indicator-border-gray';
                    this.mavStr = '...';
                    this.timeoutObj = null;
                    this.flagReceiving = false;
                    this.sys_id = 0;

                    this.colorMode = 'td-text-gray';
                    this.curMode = 'UNKNOWN';
                }, 3000);
                // }
                // else {
                //     //break;
                // }
            }
            // }
            // else {
            //     this.mavStrFromDrone[topic] = this.mavStrFromDrone[topic].substr(2);
            // }

            // else { // if (stx === 'fd') {
            //     len = parseInt(this.mavStrFromDrone[topic].substr(2, 2), 16);
            //     recv_sys_id = parseInt(this.mavStrFromDrone[topic].substr(10, 2), 16);
            //     mavLength = (10 * 2) + (len * 2) + (2 * 2);
            // }
        },

        // onMessageHandler(topic, message) {
        //     if (topic.includes('/oneM2M/req/')) {
        //         var jsonObj = JSON.parse(message.toString());
        //
        //         if (jsonObj['m2m:rqp'] == null) {
        //             jsonObj['m2m:rqp'] = jsonObj;
        //         }
        //
        //         if (Object.prototype.hasOwnProperty.call(jsonObj['m2m:rqp'], 'pc')) {
        //
        //             // console.log(Object.keys(jsonObj['m2m:rqp'].pc)[0]);
        //             // console.log(jsonObj['m2m:rqp'].pc);
        //
        //             let arr_topic = topic.split('/');
        //             let resp_topic = topic.replace('/req/', '/resp/');
        //             let rsp_message = {};
        //             rsp_message['m2m:rsp'] = {};
        //             rsp_message['m2m:rsp'].rsc = 2001;
        //             rsp_message['m2m:rsp'].to = '';
        //             rsp_message['m2m:rsp'].fr = arr_topic[4];
        //             rsp_message['m2m:rsp'].rqi = '12345';
        //             rsp_message['m2m:rsp'].pc = '';
        //
        //             //console.log(resp_topic);
        //
        //             this.doPublish(resp_topic, JSON.stringify(rsp_message['m2m:rsp']));
        //
        //             rsp_message = null;
        //
        //             if (Object.prototype.hasOwnProperty.call(jsonObj['m2m:rqp'].pc, 'm2m:sgn')) {
        //                 if (Object.prototype.hasOwnProperty.call(jsonObj['m2m:rqp'].pc['m2m:sgn'], 'nev')) {
        //                     if (Object.prototype.hasOwnProperty.call(jsonObj['m2m:rqp'].pc['m2m:sgn'].nev, 'rep')) {
        //                         if (Object.keys(jsonObj['m2m:rqp'].pc['m2m:sgn'].nev.rep)[0] === 'm2m:cin') {
        //                             let mission_payload = {};
        //
        //                             mission_payload.drone_name = arr_topic[4];
        //                             mission_payload.payload = {}
        //                             mission_payload.payload.sur = jsonObj['m2m:rqp'].pc['m2m:sgn'].sur;
        //                             mission_payload.payload.con = jsonObj['m2m:rqp'].pc['m2m:sgn'].nev.rep['m2m:cin'].con;
        //
        //                             //this.$store.commit('setMissionPayload', mission_payload);
        //
        //                             //EventBus.$emit('push-mission-' + mission_payload.drone_name, mission_payload.payload);
        //
        //                             let payload = JSON.parse(JSON.stringify(mission_payload.payload));
        //                             mission_payload = null;
        //                             let arr_sur = payload.sur.split('/');
        //                             arr_sur.pop();
        //                             payload.sur = '/' + arr_sur.join('/');
        //
        //                             if ((this.missionLteUrl + '/' + this.sortie_name) === payload.sur) {
        //                                 // console.log(payload.sur);
        //
        //                                 if (Object.prototype.hasOwnProperty.call(payload.con, 'rsrp')) {
        //                                     this.colorLteVal = 'td-text-gray';
        //
        //                                     // setTimeout(() => {
        //                                     //
        //                                     // }, 200);
        //
        //                                     this.curLteVal = payload.con.rsrp;
        //                                     //console.log(this.curLteVal);
        //
        //                                     payload = null;
        //
        //                                     if (0 > this.curLteVal && this.curLteVal >= -80) {
        //                                         this.iconLte = 'mdi-network-strength-4';
        //                                         this.colorLteVal = 'td-text-blue';
        //                                     }
        //                                     else if (-80 > this.curLteVal && this.curLteVal >= -90) {
        //                                         this.iconLte = 'mdi-network-strength-3';
        //                                         this.colorLteVal = 'td-text-green';
        //                                     }
        //                                     else if (-90 > this.curLteVal && this.curLteVal >= -100) {
        //                                         this.iconLte = 'mdi-network-strength-2';
        //                                         this.colorLteVal = 'td-text-yellow';
        //                                     }
        //                                     else {
        //                                         this.iconLte = 'mdi-network-strength-1';
        //                                         this.colorLteVal = 'td-text-red';
        //                                     }
        //
        //                                     if (this.lteTimeoutObj) {
        //                                         clearTimeout(this.lteTimeoutObj);
        //                                     }
        //
        //                                     this.lteTimeoutObj = setTimeout(() => {
        //                                         this.lteTimeoutObj = null;
        //                                         this.colorLteVal = 'td-text-gray';
        //                                         this.iconLte = 'mdi-network-strength-off-outline';
        //                                     }, 2500);
        //                                 }
        //                             }
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     else {
        //         if (message[0] == 0xfe || message[0] == 0xfd) {
        //             this.receiveFromDrone(topic, message);
        //         }
        //
        //         // let payload = {};
        //         // let arr_topic = topic.split('/');
        //         // payload.sortie_name = arr_topic[5];
        //         // payload.data = message.toString();
        //         //
        //         // EventBus.$emit('push-status-' + arr_topic[4], payload);
        //     }
        // },

        hex(arrayBuffer) {
            const buff = new Uint8Array(arrayBuffer);
            const hexOctets = []; // new Array(buff.length) is even faster (preallocates necessary array size), then use hexOctets[i] instead of .push()

            for (let i = 0; i < buff.length; ++i) {
                hexOctets.push(byteToHex[buff[i]]);
            }

            return hexOctets.join("");
        },


        mavlinkGenerateMessage(src_sys_id, src_comp_id, type, params) {
            const mavlinkParser = new MAVLink(null/*logger*/, src_sys_id, src_comp_id, this.mavVersion);
            try {
                var mavMsg = null;
                var genMsg = null;
                //var targetSysId = sysId;
                // eslint-disable-next-line no-unused-vars
                //var targetCompId = (params.targetCompId === undefined) ? 0 : params.targetCompId;

                switch (type) {
                    // MESSAGE ////////////////////////////////////
                    case mavlink.MAVLINK_MSG_ID_PING:
                        mavMsg = new mavlink.messages.ping(params.time_usec, params.seq, params.target_system, params.target_component);
                        break;
                    case mavlink.MAVLINK_MSG_ID_HEARTBEAT:
                        mavMsg = new mavlink.messages.heartbeat(params.type,
                            params.autopilot,
                            params.base_mode,
                            params.custom_mode,
                            params.system_status,
                            params.mavlink_version);
                        break;
                    case mavlink.MAVLINK_MSG_ID_GPS_RAW_INT:
                        mavMsg = new mavlink.messages.gps_raw_int(params.time_usec,
                            params.fix_type,
                            params.lat,
                            params.lon,
                            params.alt,
                            params.eph,
                            params.epv,
                            params.vel,
                            params.cog,
                            params.satellites_visible,
                            params.alt_ellipsoid,
                            params.h_acc,
                            params.v_acc,
                            params.vel_acc,
                            params.hdg_acc);
                        break;
                    case mavlink.MAVLINK_MSG_ID_ATTITUDE:
                        mavMsg = new mavlink.messages.attitude(params.time_boot_ms,
                            params.roll,
                            params.pitch,
                            params.yaw,
                            params.rollspeed,
                            params.pitchspeed,
                            params.yawspeed);
                        break;
                    case mavlink.MAVLINK_MSG_ID_GLOBAL_POSITION_INT:
                        mavMsg = new mavlink.messages.global_position_int(params.time_boot_ms,
                            params.lat,
                            params.lon,
                            params.alt,
                            params.relative_alt,
                            params.vx,
                            params.vy,
                            params.vz,
                            params.hdg);
                        break;
                    case mavlink.MAVLINK_MSG_ID_RC_CHANNELS_OVERRIDE:
                        mavMsg = new mavlink.messages.rc_channels_override(params.target_system,
                            params.target_component,
                            params.chan1_raw,
                            params.chan2_raw,
                            params.chan3_raw,
                            params.chan4_raw,
                            params.chan5_raw,
                            params.chan6_raw,
                            params.chan7_raw,
                            params.chan8_raw);
                        break;
                    case mavlink.MAVLINK_MSG_ID_COMMAND_LONG:
                        mavMsg = new mavlink.messages.command_long(params.target_system,
                            params.target_component,
                            params.command,
                            params.confirmation,
                            params.param1,
                            params.param2,
                            params.param3,
                            params.param4,
                            params.param5,
                            params.param6,
                            params.param7);
                        break;

                    case mavlink.MAVLINK_MSG_ID_REQUEST_DATA_STREAM:
                        mavMsg = new mavlink.messages.request_data_stream(params.target_system,
                            params.target_component,
                            params.req_stream_id,
                            params.req_message_rate,
                            params.start_stop);
                        break;

                    case mavlink.MAVLINK_MSG_ID_COMMAND_INT:
                        mavMsg = new mavlink.messages.mission_item(params.target_system,
                            params.target_component,
                            params.frame,
                            params.command,
                            params.current,
                            params.autocontinue,
                            params.param1,
                            params.param2,
                            params.param3,
                            params.param4,
                            params.param5,
                            params.param6,
                            params.param7);
                        break;

                    case mavlink.MAVLINK_MSG_ID_MISSION_ITEM:
                        mavMsg = new mavlink.messages.mission_item(params.target_system,
                            params.target_component,
                            params.seq,
                            params.frame,
                            params.command,
                            params.current,
                            params.autocontinue,
                            params.param1,
                            params.param2,
                            params.param3,
                            params.param4,
                            params.param5,
                            params.param6,
                            params.param7,
                            params.mission_type);
                        break;

                    case mavlink.MAVLINK_MSG_ID_MISSION_ITEM_INT:
                        mavMsg = new mavlink.messages.mission_item_int(params.target_system,
                            params.target_component,
                            params.seq,
                            params.frame,
                            params.command,
                            params.current,
                            params.autocontinue,
                            params.param1,
                            params.param2,
                            params.param3,
                            params.param4,
                            params.param5,
                            params.param6,
                            params.param7,
                            params.mission_type);
                        break;

                    case mavlink.MAVLINK_MSG_ID_MISSION_CLEAR_ALL:
                        mavMsg = new mavlink.messages.mission_clear_all(params.target_system,
                            params.target_component,
                            params.mission_type);
                        break;

                    case mavlink.MAVLINK_MSG_ID_MISSION_COUNT:
                        mavMsg = new mavlink.messages.mission_count(params.target_system,
                            params.target_component,
                            params.count,
                            params.mission_type);
                        break;

                    case mavlink.MAVLINK_MSG_ID_SET_MODE:
                        mavMsg = new mavlink.messages.set_mode(params.target_system,
                            params.base_mode,
                            params.custom_mode);
                        break;

                    case mavlink.MAVLINK_MSG_ID_PARAM_SET:
                        mavMsg = new mavlink.messages.param_set(params.target_system,
                            params.target_component,
                            params.param_id,
                            params.param_value,
                            params.param_type);
                        break;
                    case mavlink.MAVLINK_MSG_ID_PARAM_REQUEST_READ:
                        mavMsg = new mavlink.messages.param_request_read(params.target_system,
                            params.target_component,
                            params.param_id,
                            params.param_index);
                        break;
                }
            }
            catch (e) {
                console.log('MAVLINK EX:' + e);
            }

            if (mavMsg) {
                genMsg = Buffer.from(mavMsg.pack(mavlinkParser));
                //console.log('>>>>> MAVLINK OUTGOING MSG: ' + genMsg.toString('hex'));
            }

            return genMsg;
        },

        send_request_data_stream_command(target_name, pub_topic, target_sys_id, req_stream_id, req_message_rate, start_stop) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.req_stream_id = req_stream_id;
            btn_params.req_message_rate = req_message_rate;
            btn_params.start_stop = start_stop;

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_REQUEST_DATA_STREAM, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_wpnav_radius_param_set_command(target_name, pub_topic, target_sys_id, radius) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.param_id = "WPNAV_RADIUS";
            btn_params.param_type = mavlink.MAV_PARAM_TYPE_REAL32;
            btn_params.param_value = radius * 100; // cm.

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_PARAM_SET, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    console.log('Send WPNAV_RADIUS to (' + radius + ')', target_name);
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_wpnav_accel_param_set_command(target_name, pub_topic, target_sys_id, accel) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.param_id = "WPNAV_ACCEL";
            btn_params.param_type = mavlink.MAV_PARAM_TYPE_REAL32;
            btn_params.param_value = accel * 100; // cm.

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_PARAM_SET, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    console.log('Send WPNAV_ACCEL to (' + accel + ')', target_name);
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },
        send_rtl_alt_param_set_command(target_name, pub_topic, target_sys_id, target_alt) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.param_id = "RTL_ALT";
            btn_params.param_type = mavlink.MAV_PARAM_TYPE_REAL32;
            btn_params.param_value = target_alt * 100; // cm.

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_PARAM_SET, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    console.log('Send RTL_ALT to (' + target_alt + ')', target_name);
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_wpnav_speed_dn_param_set_command(target_name, pub_topic, target_sys_id, target_speed) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.param_id = "WPNAV_SPEED_DN";
            btn_params.param_type = mavlink.MAV_PARAM_TYPE_REAL32;
            btn_params.param_value = target_speed * 100; // cm / s.

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_PARAM_SET, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    console.log('Send WPNAV Speed DN to (' + target_speed + ')', target_name);
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_wpnav_speed_up_param_set_command(target_name, pub_topic, target_sys_id, target_speed) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.param_id = "WPNAV_SPEED_UP";
            btn_params.param_type = mavlink.MAV_PARAM_TYPE_REAL32;
            btn_params.param_value = target_speed * 100; // cm / s.

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_PARAM_SET, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    console.log('Send WPNAV Speed UP to (' + target_speed + ')', target_name);
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_atc_slew_yaw_param_set_command(target_name, pub_topic, target_sys_id, value) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.param_id = "ATC_SLEW_YAW";
            btn_params.param_type = mavlink.MAV_PARAM_TYPE_REAL32;
            btn_params.param_value = value * 100; // centidegrees pre second (500 - 18000)

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_PARAM_SET, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    console.log('Send ATC_SLEW_YAW param set command to (' + value + ') ', target_name);
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_wp_yaw_behavior_param_set_command(target_name, pub_topic, target_sys_id, value) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.param_id = "WP_YAW_BEHAVIOR";
            btn_params.param_type = mavlink.MAV_PARAM_TYPE_UINT8;
            btn_params.param_value = value;

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_PARAM_SET, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    console.log('Send WP_YAW_BEHAVIOR param set command to (' + value + ') ', target_name);
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_wpnav_speed_param_set_command(target_name, pub_topic, target_sys_id, target_speed) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.param_id = "WPNAV_SPEED";
            btn_params.param_type = mavlink.MAV_PARAM_TYPE_REAL32;
            btn_params.param_value = target_speed * 100; // cm / s.

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_PARAM_SET, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    console.log('Send WPNAV Speed param set command to %s, ' + 'msg: ' + msg.toString('hex') + '\n', target_name);
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_param_get_command(target_name, pub_topic, target_sys_id, param_id) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.param_id = param_id;
            btn_params.param_index = -1;

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_PARAM_REQUEST_READ, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    //console.log('Send param get command of ' + param_id + ' to %s, ' + 'msg: ' + msg.toString('hex') + '\n', target_name);
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        // result_auto_mission_item_complete(target_name, pub_topic, target_sys_id, goto_each_position, start_idx, end_idx, delay, cur_idx, result_check_count) {
        //     if (this.result_mission_ack[target_sys_id].type === 0) {
        //         console.log('Auto Mission Upload Complete to %s', target_name);
        //
        //         let custom_mode = this.$store.state.mode_items.indexOf('AUTO'); // AUTO Mode
        //         let base_mode = this.hb.base_mode & ~mavlink.MAV_MODE_FLAG_DECODE_POSITION_CUSTOM_MODE;
        //         base_mode |= mavlink.MAV_MODE_FLAG_CUSTOM_MODE_ENABLED;
        //         this.send_set_mode_command(this.name, this.target_pub_topic, this.sys_id, base_mode, custom_mode);
        //     }
        //     else {
        //         result_check_count++;
        //         if (result_check_count > MISSION_ACK_TIMEOUT_COUNT) {
        //             console.log('Auto Mission Upload Error at %s', target_name);
        //         }
        //         else {
        //             console.log(result_check_count + ' - result_auto_mission_item_complete ', target_name);
        //             setTimeout(this.result_auto_mission_item_complete, 5, target_name, pub_topic, target_sys_id, goto_each_position, start_idx, end_idx, delay, cur_idx, result_check_count);
        //         }
        //     }
        // },

        send_set_mission_current_command(target_name, pub_topic, target_sys_id, seq) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.command = mavlink.MAV_CMD_DO_SET_MISSION_CURRENT;
            btn_params.confirmation = 0;
            btn_params.param1 = seq; // current sequence number of mission
            btn_params.param2 = 0; //
            btn_params.param3 = 0; //
            btn_params.param4 = 0; //
            btn_params.param5 = 0; //
            btn_params.param6 = 0; //
            btn_params.param7 = 0; //

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_COMMAND_LONG, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    console.log('Send Set Mission Current command to %s, ' + 'msg: ' + msg.toString('hex') + '\n', target_name);
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_set_roi_command(target_name, pub_topic, target_sys_id, target_lat, target_lon, target_alt) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.command = mavlink.MAV_CMD_DO_SET_ROI;
            btn_params.confirmation = 0;
            btn_params.param1 = 0; //
            btn_params.param2 = 0; //
            btn_params.param3 = 0; //
            btn_params.param4 = 0; //
            btn_params.param5 = target_lat; // Latitude (x) of the fixed ROI
            btn_params.param6 = target_lon; // Longitude (y) of the fixed ROI
            btn_params.param7 = target_alt; // Altitude of the fixed ROI

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_COMMAND_LONG, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    console.log('Send Set ROI command to %s, ' + 'msg: ' + msg.toString('hex') + '\n', target_name);
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_auto_mission_protocol(target_name, pub_topic, target_sys_id, goto_each_position, start_idx, end_idx, delay, cur_idx, seq) {
            var btn_params = {};

            let cur_goto_position = goto_each_position[seq];

            //console.log(seq, cur_goto_position);
            this.mission_request[target_sys_id].seq_sent = seq;

            var arr_cur_goto_position = cur_goto_position.split(':');
            var latitude = parseFloat(arr_cur_goto_position[0]);
            var longitude = parseFloat(arr_cur_goto_position[1]);
            var rel_altitude = parseFloat(arr_cur_goto_position[2]);
            var radius = parseFloat(arr_cur_goto_position[4]);

            let mav_cmd = mavlink.MAV_CMD_NAV_WAYPOINT;

            if(this.$store.state.drone_infos[this.name].flyShape === '곡선비행') {
                if (seq % 2 === 1) {
                    if (seq !== 1) {
                        mav_cmd = mavlink.MAV_CMD_NAV_SPLINE_WAYPOINT;
                    }
                }
            }

            if(arr_cur_goto_position.length > 6) {
                if(parseInt(arr_cur_goto_position[6]) === mavlink.MAV_CMD_NAV_TAKEOFF) {
                    mav_cmd = mavlink.MAV_CMD_NAV_TAKEOFF;
                    radius = 0;
                }
                else if(parseInt(arr_cur_goto_position[6]) === mavlink.MAV_CMD_NAV_LAND) {
                    mav_cmd = mavlink.MAV_CMD_NAV_LAND
                    radius = 0;
                    rel_altitude = 0.0;
                }
                else if(parseInt(arr_cur_goto_position[6]) === mavlink.MAV_CMD_NAV_LOITER_TURNS) {
                    mav_cmd = mavlink.MAV_CMD_NAV_LOITER_TURNS;
                }
                else {
                    radius = 0;
                }
            }
            else {
                radius = 0;
            }

            if(arr_cur_goto_position.length > 7) {
                delay = parseInt(arr_cur_goto_position[7]);
            }

            console.log('send_auto_mission_protocol', seq, mav_cmd, latitude, longitude, rel_altitude, radius);

            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.seq = seq;
            btn_params.frame = mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT; // 0: MAV_FRAME_GLOBAL, 3: MAV_FRAME_GLOBAL_RELATIVE_ALT
            btn_params.command = mav_cmd;

            if(seq === 0) {
                btn_params.current = 1;
                btn_params.autocontinue = 0;
            }
            else {
                btn_params.current = 0;
                btn_params.autocontinue = 1;
            }

            btn_params.param1 = delay;
            btn_params.param2 = 0;
            btn_params.param3 = radius;
            btn_params.param4 = 0;
            btn_params.param5 = latitude;
            btn_params.param6 = longitude;
            btn_params.param7 = rel_altitude;
            btn_params.mission_type = 0;

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_MISSION_ITEM, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    this.doPublish(pub_topic, msg);
                    //console.log('Send MISSION_ITEM ' + seq + ' to %s, ' + 'msg: ' + msg.toString('hex') + ' - ' + seq, target_name);

                    this.droneStatus.curCommand = 'auto_mission_item';
                    this.droneStatus.target_name = target_name;
                    this.droneStatus.pub_topic = pub_topic;
                    this.droneStatus.target_sys_id = target_sys_id;
                    this.droneStatus.goto_each_position = goto_each_position;
                    this.droneStatus.start_idx = start_idx;
                    this.droneStatus.end_idx = end_idx;
                    this.droneStatus.delay = delay;
                    this.droneStatus.cur_idx = cur_idx;
                    this.droneStatus.latitude = latitude;
                    this.droneStatus.longitude = longitude;
                    this.droneStatus.rel_altitude = rel_altitude;
                    this.droneStatus.radius = radius;
                    this.droneStatus.startCount = 0;

                    //this.watchingMissionStatus = 0;

                    this.droneStatus.objTimeout = setTimeout(() => {
                        this.droneStatus.curCommand = '';
                        console.log('Error Auto Mission Upload at %s', target_name);
                    }, 2000, target_name);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_auto_mission_count(target_name, pub_topic, target_sys_id, goto_each_position, start_idx, end_idx, delay, cur_idx) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.count = 1 + end_idx - start_idx + 1;
            btn_params.mission_type = 0;

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_MISSION_COUNT, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    this.doPublish(pub_topic, msg);

                    this.droneStatus.curCommand = 'auto_mission_count';
                    this.droneStatus.target_name = target_name;
                    this.droneStatus.pub_topic = pub_topic;
                    this.droneStatus.target_sys_id = target_sys_id;
                    this.droneStatus.goto_each_position = goto_each_position;
                    this.droneStatus.start_idx = start_idx;
                    this.droneStatus.end_idx = end_idx;
                    this.droneStatus.delay = delay;
                    this.droneStatus.cur_idx = cur_idx;
                    this.droneStatus.mission_count = btn_params.count;
                    this.$store.state.drone_infos[this.name].mission_count = btn_params.count;

                    this.postDroneInfos((res) => {
                        console.log('postDroneInfos - send_auto_mission_count', res);
                    });

                    console.log('Send AUTO_MISSION_COUNT to %s, msg: ' + msg.toString('hex') + ' - ' + btn_params.count, target_name);

                    if (!Object.prototype.hasOwnProperty.call(this.mission_request, target_sys_id)) {
                        this.mission_request[target_sys_id] = {};
                    }
                    this.mission_request[target_sys_id].seq_sent = 0;
                    this.mission_request[target_sys_id].seq_requested = 255;

                    this.result_check_count = 0;
                    //setTimeout(this.result_auto_mission_protocol, 1, target_name, pub_topic, target_sys_id, goto_each_position, start_idx, end_idx, delay, cur_idx, this.result_check_count);

                    this.droneStatus.objTimeout = setTimeout(() => {
                        this.droneStatus.curCommand = '';
                        console.log('Error Auto Mission Upload at %s', target_name);
                    }, 2000, target_name);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_auto_command(target_name, pub_topic, target_sys_id, goto_each_position, start_idx, end_idx, delay, cur_idx) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.mission_type = 0;

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_MISSION_CLEAR_ALL, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    this.doPublish(pub_topic, msg);

                    //console.log('send_auto_command', 'goto_each_position', goto_each_position);

                    this.droneStatus.curCommand = 'auto_mission_clear_all';
                    this.droneStatus.target_name = target_name;
                    this.droneStatus.pub_topic = pub_topic;
                    this.droneStatus.target_sys_id = target_sys_id;
                    this.droneStatus.goto_each_position = goto_each_position;
                    this.droneStatus.start_idx = start_idx;
                    this.droneStatus.end_idx = end_idx;
                    this.droneStatus.delay = delay;
                    this.droneStatus.cur_idx = cur_idx;

                    console.log('Send Auto Mission Clear All command to %s, msg: ' + msg.toString('hex') + ' - ' + cur_idx, target_name);

                    if (!Object.prototype.hasOwnProperty.call(this.result_mission_ack, target_sys_id)) {
                        this.result_mission_ack[target_sys_id] = {};
                    }
                    this.result_mission_ack[target_sys_id].type = 255;

                    this.result_check_count = 0;
                    //setTimeout(this.result_auto_mission_clear_all, 1000, target_name, pub_topic, target_sys_id, goto_each_position, start_idx, end_idx, delay, cur_idx, this.result_check_count);
                    this.droneStatus.objTimeout = setTimeout(() => {
                        this.droneStatus.curCommand = '';
                        console.log('Error Auto Mission Clear All command at %s', target_name);
                    }, 2000, target_name);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_set_do_set_home(target_name, pub_topic, target_sys_id) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.command = mavlink.MAV_CMD_DO_SET_HOME;
            btn_params.confirmation = 0;
            btn_params.param1 = 1; // Use current (1=use current location, 0=use specified location)
            btn_params.param2 = 0; //
            btn_params.param3 = 0; //
            btn_params.param4 = (this.gpi.hdg / 100); //
            btn_params.param5 = this.gpi.lat / 10000000; //
            btn_params.param6 = this.gpi.lon / 10000000; //
            btn_params.param7 = this.gpi.relative_alt / 1000; //

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_COMMAND_LONG, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    console.log('Send Set Do Set Home command to %s', target_name);
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_set_servo_command(target_name, pub_topic, target_sys_id, target_number, target_pwm) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.command = mavlink.MAV_CMD_DO_SET_SERVO;
            btn_params.confirmation = 0;
            btn_params.param1 = target_number; // Servo number - target servo output pin/channel number.
            btn_params.param2 = target_pwm; // PWM value to output, in microseconds (typically 1000 to 2000).
            btn_params.param3 = 0; //
            btn_params.param4 = 0; //
            btn_params.param5 = 0; //
            btn_params.param6 = 0; //
            btn_params.param7 = 0; //

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_COMMAND_LONG, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    console.log('Send Set Servo command to %s (' + target_number + ', ' + target_pwm + ')', target_name);
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_rtl_command(target_name, pub_topic, target_sys_id) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.command = mavlink.MAV_CMD_NAV_RETURN_TO_LAUNCH;
            btn_params.confirmation = 0;
            btn_params.param1 = 0; //
            btn_params.param2 = 0; //
            btn_params.param3 = 0; //
            btn_params.param4 = 0; //
            btn_params.param5 = 0; //
            btn_params.param6 = 0; //
            btn_params.param7 = 0; //

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_COMMAND_LONG, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    console.log('Send RTL command to %s', target_name);
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_land_command(target_name, pub_topic, target_sys_id) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.command = mavlink.MAV_CMD_NAV_LAND;
            btn_params.confirmation = 0;
            btn_params.param1 = 0; // Abort Alt
            btn_params.param2 = 0; // Land Mode
            btn_params.param3 = 0; // Empty
            btn_params.param4 = 0; // Yaw angle
            btn_params.param5 = 0; // Target latitude. If zero, the Copter will land at the current latitude.
            btn_params.param6 = 0; // Longitude
            btn_params.param7 = 0; // Altitude

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_COMMAND_LONG, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        result_mission_item_complete(target_name, pub_topic, target_sys_id, latitude, longitude, rel_altitude, speed, radius, result_check_count) {
            if (this.result_mission_ack[target_sys_id].type === 0) {
                console.log('Mission Upload Complete to %s', target_name);

                delete this.$store.state.missionLines[target_name];
                this.$store.state.missionCircles[target_name] = null;
                delete this.$store.state.missionCircles[target_name];
                this.$store.state.missionCircles[target_name] = {
                    lat: latitude,
                    lng: longitude,
                    radius: radius,
                    options: {
                        strokeColor: this.$store.state.drone_infos[this.name].color,
                        strokeOpacity: 1,
                        strokeWeight: 5
                    }
                };

                this.$store.state.missionCircles = this.clone(this.$store.state.missionCircles);

                setTimeout(this.send_set_mode_command, 50, this.name, this.target_pub_topic, this.sys_id, 'AUTO');
            }
            else {
                result_check_count++;
                if (result_check_count > MISSION_ACK_TIMEOUT_COUNT) {
                    console.log('Mission Upload Error at %s', target_name);
                }
                else {
                    console.log(result_check_count + ' - result_mission_item_complete ', target_name);
                    setTimeout(this.result_mission_item_complete, 50, target_name, pub_topic, target_sys_id, latitude, longitude, rel_altitude, speed, radius, result_check_count);
                }
            }
        },

        send_mission_protocol(target_name, pub_topic, target_sys_id, latitude, longitude, rel_altitude, speed, radius, seq, result_check_count) {
            var btn_params = {};

            if (seq === 0) {
                btn_params.target_system = target_sys_id;
                btn_params.target_component = 1;
                btn_params.seq = 0;
                btn_params.frame = mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT; // 0: MAV_FRAME_GLOBAL, 3: MAV_FRAME_GLOBAL_RELATIVE_ALT
                btn_params.command = mavlink.MAV_CMD_NAV_WAYPOINT;
                btn_params.current = 1;
                btn_params.autocontinue = 0;
                btn_params.param1 = 0;
                btn_params.param2 = 0;
                btn_params.param3 = 0;
                btn_params.param4 = 0;
                btn_params.param5 = this.gpi.lat / 10000000;
                btn_params.param6 = this.gpi.lon / 10000000;
                btn_params.param7 = this.gpi.relative_alt / 1000;
                btn_params.mission_type = 0;
            }
            else {
                btn_params.target_system = target_sys_id;
                btn_params.target_component = 1;
                btn_params.seq = seq;
                btn_params.frame = mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT; // 0: MAV_FRAME_GLOBAL, 3: MAV_FRAME_GLOBAL_RELATIVE_ALT
                btn_params.command = mavlink.MAV_CMD_NAV_LOITER_TURNS;
                btn_params.current = 0;
                btn_params.autocontinue = 1;
                btn_params.param1 = 1;
                btn_params.param2 = 0;
                btn_params.param3 = radius;
                btn_params.param4 = 0;
                btn_params.param5 = latitude;
                btn_params.param6 = longitude;
                btn_params.param7 = rel_altitude;
                btn_params.mission_type = 0;
            }

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_MISSION_ITEM, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    console.log(seq + ' Send MISSION_ITEM to %s, ' + 'msg: ' + msg.toString('hex') + ' - ' + radius, target_name);
                    this.doPublish(pub_topic, msg);

                    if (seq < 1) {
                        if (!Object.prototype.hasOwnProperty.call(this.mission_request, target_sys_id)) {
                            this.mission_request[target_sys_id] = {};
                        }
                        this.mission_request[target_sys_id].seq = 255;

                        result_check_count = 0;
                        setTimeout(this.result_mission_protocol, 55, target_name, pub_topic, target_sys_id, latitude, longitude, rel_altitude, speed, radius, result_check_count);
                    }
                    else {
                        if (!Object.prototype.hasOwnProperty.call(this.result_mission_ack, target_sys_id)) {
                            this.result_mission_ack[target_sys_id] = {};
                        }
                        this.result_mission_ack[target_sys_id].type = 255;

                        result_check_count = 0;
                        setTimeout(this.result_mission_item_complete, 55, target_name, pub_topic, target_sys_id, latitude, longitude, rel_altitude, speed, radius, result_check_count);
                    }
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        result_mission_protocol(target_name, pub_topic, target_sys_id, latitude, longitude, rel_altitude, speed, radius, result_check_count) {
            if (this.mission_request[target_sys_id].seq <= 1) {
                console.log(this.mission_request[target_sys_id].seq + ' MISSION REQUEST from %s', target_name);

                result_check_count = 0;
                setTimeout(this.send_mission_protocol, 1, target_name, pub_topic, target_sys_id, latitude, longitude, rel_altitude, speed, radius, this.mission_request[target_sys_id].seq, result_check_count);
            }
            else {
                result_check_count++;
                if (result_check_count > MISSION_ACK_TIMEOUT_COUNT) {
                    console.log('Mission Upload Error at %s', target_name);
                }
                else {
                    console.log(result_check_count + ' - result_mission_protocol ', target_name);
                    setTimeout(this.result_mission_protocol, 55, target_name, pub_topic, target_sys_id, latitude, longitude, rel_altitude, speed, radius, result_check_count);
                }
            }
        },

        send_mission_count(target_name, pub_topic, target_sys_id, latitude, longitude, rel_altitude, speed, radius, result_check_count) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.count = 2;
            btn_params.mission_type = 0;

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_MISSION_COUNT, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    this.doPublish(pub_topic, msg);

                    if (!Object.prototype.hasOwnProperty.call(this.mission_request, target_sys_id)) {
                        this.mission_request[target_sys_id] = {};
                    }
                    this.mission_request[target_sys_id].seq = 255;

                    result_check_count = 0;
                    setTimeout(this.result_mission_protocol, 55, target_name, pub_topic, target_sys_id, latitude, longitude, rel_altitude, speed, radius, result_check_count);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        result_mission_clear_all(target_name, pub_topic, target_sys_id, latitude, longitude, rel_altitude, speed, radius, result_check_count) {
            if (this.result_mission_ack[target_sys_id].type === 0) {
                console.log('Clear All Mission of %s', target_name);
                result_check_count = 0;
                setTimeout(this.send_mission_count, 1, target_name, pub_topic, target_sys_id, latitude, longitude, rel_altitude, speed, radius, result_check_count);
            }
            else {
                result_check_count++;
                if (result_check_count > MISSION_ACK_TIMEOUT_COUNT) {
                    console.log('Mission Clear All Error at %s', target_name);
                }
                else {
                    setTimeout(this.result_mission_clear_all, 50, target_name, pub_topic, target_sys_id, latitude, longitude, rel_altitude, speed, radius, result_check_count);
                }
            }
        },

        send_goto_circle_command(target_name, pub_topic, target_sys_id, latitude, longitude, rel_altitude, speed, radius) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.mission_type = 0;

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_MISSION_CLEAR_ALL, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    this.doPublish(pub_topic, msg);

                    if (!Object.prototype.hasOwnProperty.call(this.result_mission_ack, target_sys_id)) {
                        this.result_mission_ack[target_sys_id] = {};
                    }
                    this.result_mission_ack[target_sys_id].type = 255;

                    this.result_check_count = 0;
                    setTimeout(this.result_mission_clear_all, 50, target_name, pub_topic, target_sys_id, latitude, longitude, rel_altitude, speed, radius, this.result_check_count);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_circle_rate_param_set_command(target_name, pub_topic, target_sys_id, target_rate) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.param_id = "CIRCLE_RATE";
            btn_params.param_type = mavlink.MAV_PARAM_TYPE_INT16;
            btn_params.param_value = target_rate; // v = rw -> w = v / r.

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_PARAM_SET, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_rtl_speed_param_set_command(target_name, pub_topic, target_sys_id, rtl_speed) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.param_id = "RTL_SPEED";
            btn_params.param_type = mavlink.MAV_PARAM_TYPE_UINT32;
            btn_params.param_value = rtl_speed * 100; // cm / s.

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_PARAM_SET, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    console.log('send_rtl_speed_param_set_command (', rtl_speed, ') ', this.name);
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_circle_radius_param_set_command(target_name, pub_topic, target_sys_id, target_radius) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.param_id = "CIRCLE_RADIUS";
            btn_params.param_type = mavlink.MAV_PARAM_TYPE_UINT32;
            btn_params.param_value = target_radius * 100; // cm / s.

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_PARAM_SET, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_change_speed_command(target_name, pub_topic, target_sys_id, target_speed) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.command = mavlink.MAV_CMD_DO_CHANGE_SPEED;
            btn_params.confirmation = 0;
            btn_params.param1 = 0; // Speed type (0=Airspeed, 1=Ground Speed).
            btn_params.param2 = target_speed; // Target speed (m/s).
            btn_params.param3 = 0; // Throttle as a percentage (0-100%). A value of -1 indicates no change.
            btn_params.param4 = 0; // Empty
            btn_params.param5 = 0; // Empty
            btn_params.param6 = 0; // Empty
            btn_params.param7 = 0; // Empty

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_COMMAND_LONG, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    console.log('send_change_speed_command (', target_speed, ') ', this.name);
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_goto_command(target_name, pub_topic, target_sys_id, latitude, longitude, rel_altitude) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.seq = 0;
            btn_params.frame = mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT; // 0: MAV_FRAME_GLOBAL, 3: MAV_FRAME_GLOBAL_RELATIVE_ALT
            btn_params.command = mavlink.MAV_CMD_NAV_WAYPOINT;
            btn_params.current = 2;
            btn_params.autocontinue = 0;
            btn_params.param1 = 0;
            btn_params.param2 = 0;
            btn_params.param3 = 0;
            btn_params.param4 = 0;
            btn_params.param5 = latitude;
            btn_params.param6 = longitude;
            btn_params.param7 = rel_altitude;
            btn_params.mission_type = 0;

            //console.log(latitude, longitude, rel_altitude);

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_MISSION_ITEM, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    console.log('send_goto_command ', this.name);
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_goto_alt_command(target_name, pub_topic, target_sys_id, alt) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.seq = 0;
            btn_params.frame = mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT; // 0: MAV_FRAME_GLOBAL, 3: MAV_FRAME_GLOBAL_RELATIVE_ALT
            btn_params.command = mavlink.MAV_CMD_NAV_WAYPOINT;
            btn_params.current = 2;
            btn_params.autocontinue = 0;
            btn_params.param1 = 0;
            btn_params.param2 = 0;
            btn_params.param3 = 0;
            btn_params.param4 = 0;
            btn_params.param5 = this.gpi.lat / 10000000;
            btn_params.param6 = this.gpi.lon / 10000000;
            btn_params.param7 = alt;
            btn_params.mission_type = 0;

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_MISSION_ITEM, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    console.log('send_goto_alt_command ', this.name);
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_takeoff_command(target_name, pub_topic, target_sys_id, alt) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.command = mavlink.MAV_CMD_NAV_TAKEOFF;
            btn_params.confirmation = 0;
            btn_params.param1 = -1; // Minimum pitch (if airspeed sensor present)
            btn_params.param2 = 0; // Empty
            btn_params.param3 = 0; // Empty
            btn_params.param4 = 0; // Yaw angle
            if(this.fcType === 'ardupilot') {
                btn_params.param5 = 0; // Latitude
                btn_params.param6 = 0; // Longitude
            }
            else {
                btn_params.param5 = this.gpi.lat / 10000000; // Latitude
                btn_params.param6 = this.gpi.lng / 10000000; // Longitude
            }
            btn_params.param7 = alt; // Altitude

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_COMMAND_LONG, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    // let payload = {};
                    // payload.topic = pub_topic;
                    // payload.msg = msg;
                    // EventBus.$emit('do-publish', payload);

                    console.log('send_takeoff_command ', this.name);
                    this.doPublish(pub_topic, msg);

                    this.$store.state.drone_infos[this.name].home_position = null;
                    delete this.$store.state.drone_infos[this.name].home_position;
                    this.$store.state.drone_infos[this.name].home_position = {
                        lat: (this.gpi.lat / 10000000),
                        lng: (this.gpi.lon / 10000000)
                    };
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_arm_command(target_name, pub_topic, target_sys_id, param1, param2) {
            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.target_component = 1;
            btn_params.command = mavlink.MAV_CMD_COMPONENT_ARM_DISARM;
            btn_params.confirmation = 0;
            btn_params.param1 = param1;
            btn_params.param2 = param2;
            btn_params.param3 = 65535;
            btn_params.param4 = 65535;
            btn_params.param5 = 65535;
            btn_params.param6 = 65535;
            btn_params.param7 = 65535;

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_COMMAND_LONG, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        send_set_mode_command(target_name, pub_topic, target_sys_id, target_mode) {
            var str_custom_mode = this.$store.state[this.fcType + '_mode_indexs_obj'][target_mode];
            var custom_mode = Buffer.from(str_custom_mode, 'hex').readUInt32LE(0);
            var base_mode = this.hb.base_mode & ~mavlink.MAV_MODE_FLAG_DECODE_POSITION_CUSTOM_MODE;
            base_mode |= mavlink.MAV_MODE_FLAG_CUSTOM_MODE_ENABLED;

            var btn_params = {};
            btn_params.target_system = target_sys_id;
            btn_params.base_mode = base_mode;
            btn_params.custom_mode = custom_mode;

            try {
                var msg = this.mavlinkGenerateMessage(255, 0xbe, mavlink.MAVLINK_MSG_ID_SET_MODE, btn_params);
                if (msg == null) {
                    console.log("mavlink message is null");
                }
                else {
                    console.log('send_set_mode_command (', this.$store.state[this.fcType + '_mode_items_obj'][str_custom_mode], ') - ', this.name);
                    this.doPublish(pub_topic, msg);
                }
            }
            catch (ex) {
                console.log('[ERROR] ' + ex);
            }
        },

        checkLteValRsrp(_curLteVal) {
            this.colorLteVal = '#9E9E9E';
            this.iconLte = 'mdi-network-strength-off-outline';

            if (0 > _curLteVal && _curLteVal >= -80) {
                this.iconLte = 'mdi-network-strength-4';
                this.colorLteVal = 'blue';

            }
            else if (-80 > _curLteVal && _curLteVal >= -90) {
                this.iconLte = 'mdi-network-strength-3';
                this.colorLteVal = '#76FF03';
            }
            else if (-90 > _curLteVal && _curLteVal >= -100) {
                this.iconLte = 'mdi-network-strength-2';
                this.colorLteVal = 'yellow';
            }
            else if (-10 > _curLteVal) {
                this.iconLte = 'mdi-network-strength-1';
                this.colorLteVal = 'red';
            }

            if (this.lteTimeoutObj) {
                clearTimeout(this.lteTimeoutObj);
            }

            this.lteTimeoutObj = setTimeout(() => {
                this.lteTimeoutObj = null;
                this.colorLteVal = '#9E9E9E';
                this.iconLte = 'mdi-network-strength-off-outline';
            }, 2500);
        },
        startFlightTimer: function () {
            this.iconFlightElapsed = 'mdi-timer-outline';
            if (this.flightTimer) {
                clearInterval(this.flightTimer);
                this.flightTimer = null;
            }

            this.flightTimer = setInterval(() => {
                this.flightTimeCount += 1;

                var min = parseInt(this.flightTimeCount / 60).toString().padStart(2, '0');
                let sec = (this.flightTimeCount % 60).toString().padStart(2, '0');
                // let min = parseInt(this.stat_flttime_param.param_value / 60).toString().padStart(2, '0');
                // let sec = (this.stat_flttime_param.param_value % 60).toString().padStart(2, '0');
                this.flightElapsedTime = min + ':' + sec;

                this.info.flightElapsedTime = this.flightElapsedTime;
            }, 1000);

            this.info.iconFlightElapsed = this.iconFlightElapsed;
        },
        stopFlightTimer: function () {
            clearInterval(this.flightTimer);
            this.iconFlightElapsed = 'mdi-timer-off-outline';
            this.flightTimer = null;

            this.info.iconFlightElapsed = this.iconFlightElapsed;
        },

        parseMavFromDrone(mavPacket) {
            try {
                var ver = mavPacket.substr(0, 2);
                var msglen = mavPacket.substr(2, 2);
                var sysid = '';
                var msgid = '';
                var base_offset = 12;

                if (ver === 'fd') {
                    sysid = mavPacket.substr(10, 2).toLowerCase();
                    //msgid = mavPacket.substr(14, 6).toLowerCase();
                    msgid = mavPacket.substr(18, 2) + mavPacket.substr(16, 2) + mavPacket.substr(14, 2);
                    base_offset = 20;
                }
                else {
                    sysid = mavPacket.substr(6, 2).toLowerCase();
                    msgid = mavPacket.substr(10, 2).toLowerCase();
                    base_offset = 12;
                }

                var sys_id = parseInt(sysid, 16);
                var msg_id = parseInt(msgid, 16);
                var msg_len = parseInt(msglen, 16);

                this.sys_id = sys_id;

                if (msg_id === mavlink.MAVLINK_MSG_ID_HEARTBEAT) {
                    let my_len = 9;
                    let ar = mavPacket.split('');
                    for (let i = 0; i < (my_len - msg_len); i++) {
                        ar.splice(ar.length-4, 0, '0');
                        ar.splice(ar.length-4, 0, '0');
                    }
                    mavPacket = ar.join('');

                    var custom_mode = mavPacket.substr(base_offset, 8).toLowerCase();
                    base_offset += 8;
                    var type = mavPacket.substr(base_offset, 2).toLowerCase();
                    base_offset += 2;
                    var autopilot = mavPacket.substr(base_offset, 2).toLowerCase();
                    base_offset += 2;
                    var base_mode = mavPacket.substr(base_offset, 2).toLowerCase();
                    base_offset += 2;
                    var system_status = mavPacket.substr(base_offset, 2).toLowerCase();
                    base_offset += 2;
                    var mavlink_version = mavPacket.substr(base_offset, 2).toLowerCase();

                    this.hb.type = Buffer.from(type, 'hex').readUInt8(0);
                    this.hb.autopilot = Buffer.from(autopilot, 'hex').readUInt8(0);
                    this.hb.base_mode = Buffer.from(base_mode, 'hex').readUInt8(0);
                    this.hb.custom_mode = Buffer.from(custom_mode, 'hex').readUInt32LE(0);
                    this.hb.system_status = Buffer.from(system_status, 'hex').readUInt8(0);
                    this.hb.mavlink_version = Buffer.from(mavlink_version, 'hex').readUInt8(0);

                    // console.log(this.MAV_AUTOPILOT[this.hb.autopilot]);

                    if (this.hb.autopilot === mavlink.MAV_AUTOPILOT_ARDUPILOTMEGA) {
                        this.fc_img = 'ardupilot.png';
                        this.$store.state.drone_infos[this.name].fcType = 'ardupilot';
                        this.fcType = 'ardupilot';
                    }
                    else if (this.hb.autopilot === mavlink.MAV_AUTOPILOT_PX4) {
                        this.fc_img = 'px4.png';
                        this.$store.state.drone_infos[this.name].fcType = 'px4';
                        this.fcType = 'px4';
                    }

                    // console.log('this.hb.mavlink_version', this.hb.mavlink_version);

                    // if(!Object.hasOwnProperty.call(this.$store.state.trackingLines, this.name)) {
                    //     console.log('---------------------------------------------------------------------------------------------------')
                    //     if(localStorage.getItem('trackingLines-' + this.name)) {
                    //         this.$store.state.trackingLines[this.name] = JSON.parse(localStorage.getItem('trackingLines-' + this.name));
                    //     }
                    //     else {
                    //         this.$store.state.trackingLines[this.name] = [];
                    //     }
                    // }

                    if ((this.hb.base_mode & 0x80) === 0x80) {
                        // if (this.curArmStatus === 'DISARMED') {
                        //     this.$store.state.trackingLines[this.name] = null;
                        //     delete this.$store.state.trackingLines[this.name];
                        //     this.$store.state.trackingLines[this.name] = [];
                        // }
                        // if(this.$store.state.drone_infos[this.name].curArmStatus !== 'ARMED') {
                            this.colorArming = this.$store.state.refColorName[this.$store.state.drone_infos[this.name].color] + ' darken-4';
                            this.curArmStatus = 'ARMED';
                            this.$store.state.drone_infos[this.name].curArmStatus = 'ARMED';
                            this.colorArm = 'td-text-red';

                            // this.$store.state.commands = [];
                            // this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['모드']]);
                            // this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['설정']]);
                            // this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['이동']]);
                            // this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['선회']]);
                            // this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['패턴']]);
                            // this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['자동']]);
                            // this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['고도']]);
                            // this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['속도']]);
                            // this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['관심']]);
                            // this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['착륙']]);
                            // this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['귀환']]);
                            // this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['제어']]);
                            // this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['임무']]);
                            // this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['투하']]);
                            // this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['종료']]);
                        // }
                    }
                    else {
                        // if(this.$store.state.drone_infos[this.name].curArmStatus !== 'DISARMED') {
                            this.colorArming = 'white';
                            this.curArmStatus = 'DISARMED';
                            this.$store.state.drone_infos[this.name].curArmStatus = 'DISARMED';
                            this.colorArm = 'td-text-blue';

                            this.$store.state.rtlModeMonitor[this.name] = false;

                            // this.$store.state.commands = [];
                            // this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['모드']]);
                            // this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['설정']]);
                            // this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['이륙']]);
                            // this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['시동']]);
                        // }
                    }

                    this.info.curArmStatus = this.curArmStatus;

                    this.curMode = this.$store.state[this.fcType + '_mode_items_obj'][custom_mode];

                    //console.log(this.name, ' - bpm - ', this.bpm);
                    if (this.bpm < 50) {
                        console.log(this.name + ' - REQUEST_DATA_STREAM - bpm', this.bpm);
                        setTimeout(this.send_request_data_stream_command, 1, this.name, this.target_pub_topic, this.sys_id, mavlink.MAV_DATA_STREAM_RAW_SENSORS, 3, 1);
                        setTimeout(this.send_request_data_stream_command, 3, this.name, this.target_pub_topic, this.sys_id, mavlink.MAV_DATA_STREAM_EXTENDED_STATUS, 3, 1);
                        setTimeout(this.send_request_data_stream_command, 5, this.name, this.target_pub_topic, this.sys_id, mavlink.MAV_DATA_STREAM_RC_CHANNELS, 3, 1);
                        setTimeout(this.send_request_data_stream_command, 7, this.name, this.target_pub_topic, this.sys_id, mavlink.MAV_DATA_STREAM_POSITION, 3, 1);
                        setTimeout(this.send_request_data_stream_command, 9, this.name, this.target_pub_topic, this.sys_id, mavlink.MAV_DATA_STREAM_EXTRA1, 3, 1);
                        setTimeout(this.send_request_data_stream_command, 11, this.name, this.target_pub_topic, this.sys_id, mavlink.MAV_DATA_STREAM_EXTRA2, 3, 1);
                        setTimeout(this.send_request_data_stream_command, 13, this.name, this.target_pub_topic, this.sys_id, mavlink.MAV_DATA_STREAM_EXTRA3, 3, 1);

                        EventBus.$emit('onResize-DroneInfoList');
                    }
                }
                else if (msg_id === mavlink.MAVLINK_MSG_ID_GPS_INJECT_DATA) {
                    console.log('MAVLINK_MSG_ID_GPS_INJECT_DATA MAVLINK_MSG_ID_GPS_INJECT_DATA MAVLINK_MSG_ID_GPS_INJECT_DATA MAVLINK_MSG_ID_GPS_INJECT_DATA MAVLINK_MSG_ID_GPS_INJECT_DATA');
                }
                else if (msg_id === mavlink.MAVLINK_MSG_ID_GPS_RTCM_DATA) {
                    console.log('MAVLINK_MSG_ID_GPS_RTCM_DATAMAVLINK_MSG_ID_GPS_RTCM_DATAMAVLINK_MSG_ID_GPS_RTCM_DATAMAVLINK_MSG_ID_GPS_RTCM_DATAMAVLINK_MSG_ID_GPS_RTCM_DATAMAVLINK_MSG_ID_GPS_RTCM_DATAMAVLINK_MSG_ID_GPS_RTCM_DATA');
                }
                else if (msg_id === mavlink.MAVLINK_MSG_ID_GPS_RTK) {
                    console.log('MAVLINK_MSG_ID_GPS_RTKMAVLINK_MSG_ID_GPS_RTKMAVLINK_MSG_ID_GPS_RTKMAVLINK_MSG_ID_GPS_RTKMAVLINK_MSG_ID_GPS_RTKMAVLINK_MSG_ID_GPS_RTK');
                }
                else if (msg_id === mavlink.MAVLINK_MSG_ID_GPS_INPUT) {
                    console.log('MAVLINK_MSG_ID_GPS_INPU');
                }
                else if (msg_id === mavlink.MAVLINK_MSG_ID_STATUSTEXT) {
                    /*
                    0 비상: 시스템을 사용할 수 없음
                    1 경고: 즉시 조치를 취해야 합니다.
                    2 크리티컬: 크리티컬 조건
                    3 오류: 오류 조건
                    4 경고: 경고 조건
                    5 주의: 정상적이지만 중요한 상태
                    6 정보: 정보 메시지
                    7 디버그: 디버그 수준 메시지
                     */
                    let my_len = 53;
                    if(ver === 'fd') {
                        my_len += 3;
                    }
                    let ar = mavPacket.split('');
                    for (let i = 0; i < (my_len - msg_len); i++) {
                        ar.splice(ar.length-4, 0, '0');
                        ar.splice(ar.length-4, 0, '0');
                    }
                    mavPacket = ar.join('');

                    var severity = mavPacket.substr(base_offset, 2).toLowerCase();
                    base_offset += 2;
                    var text = mavPacket.substr(base_offset, 100).toLowerCase();

                    this.info.severity = Buffer.from(severity, 'hex').readUInt8(0);
                    this.info.text = Buffer.from(text, 'hex').toString('ASCII').replace(/\0/g, '').replace('  ', '');

                    // console.log('text\n', mavPacket, '\n', this.info.text)
                    if (this.info.severity < 4) {
                        this.speak(this.info.text, {
                            rate: 1,
                            pitch: 1.2,
                            lang: "en-US"
                        })
                    }
                }

                else if (msg_id === mavlink.MAVLINK_MSG_ID_SYS_STATUS && ((ver === 'fd') || (ver === 'fe' && mavPacket.length === 78))) {
                    let my_len = 31;
                    if(ver === 'fd') {
                        my_len += 12;
                    }
                    let ar = mavPacket.split('');
                    for (let i = 0; i < (my_len - msg_len); i++) {
                        ar.splice(ar.length-4, 0, '0');
                        ar.splice(ar.length-4, 0, '0');
                    }
                    mavPacket = ar.join('');

                    base_offset += 28;
                    var voltage_battery = mavPacket.substr(base_offset, 8).toLowerCase();

                    this.ss.voltage_battery = Buffer.from(voltage_battery, 'hex').readUInt16LE(0);

                    if (this.mid_v < this.ss.voltage_battery) {
                        this.iconBattery = 'mdi-battery-high';
                        this.colorBattery = '#76FF03';
                    }
                    else if (this.min_v < this.ss.voltage_battery && this.ss.voltage_battery <= this.mid_v) {
                        this.iconBattery = 'mdi-battery-medium';
                        this.colorBattery = '#FFFF00';
                    }
                    else {
                        this.iconBattery = 'mdi-battery-low';
                        this.colorBattery = '#FF3D00';
                    }

                    this.info.colorBattery = this.colorBattery;
                    this.info.iconBattery = this.iconBattery;
                    this.info.voltageBattery = (this.ss.voltage_battery / 1000).toFixed(1);

                    // this.$store.commit('set_ss_voltage_battery', (Buffer.from(voltage_battery, 'hex').readUInt16LE(0)));
                }

                else if (msg_id === mavlink.MAVLINK_MSG_ID_GLOBAL_POSITION_INT) {
                    let my_len = 28;
                    let ar = mavPacket.split('');
                    for (let i = 0; i < (my_len - msg_len); i++) {
                        ar.splice(ar.length-4, 0, '0');
                        ar.splice(ar.length-4, 0, '0');
                    }
                    mavPacket = ar.join('');

                    var time_boot_ms = mavPacket.substr(base_offset, 8).toLowerCase();
                    base_offset += 8;
                    var lat = mavPacket.substr(base_offset, 8).toLowerCase();
                    base_offset += 8;
                    var lon = mavPacket.substr(base_offset, 8).toLowerCase();
                    base_offset += 8;
                    var alt = mavPacket.substr(base_offset, 8).toLowerCase();
                    base_offset += 8;
                    var relative_alt = mavPacket.substr(base_offset, 8).toLowerCase();
                    base_offset += 8;
                    var vx = mavPacket.substr(base_offset, 4).toLowerCase();
                    base_offset += 4;
                    var vy = mavPacket.substr(base_offset, 4).toLowerCase();
                    base_offset += 4;
                    var vz = mavPacket.substr(base_offset, 4).toLowerCase();
                    base_offset += 4;
                    var hdg = mavPacket.substr(base_offset, 4).toLowerCase();

                    // eslint-disable-next-line no-prototype-builtins
                    if (!Object.prototype.hasOwnProperty.call(this.gpi, sys_id)) {
                        this.gpi = {};
                    }

                    this.gpi.time_boot_ms = Buffer.from(time_boot_ms, 'hex').readUInt32LE(0);
                    this.gpi.lat = Buffer.from(lat, 'hex').readInt32LE(0);
                    this.gpi.lon = Buffer.from(lon, 'hex').readInt32LE(0);
                    this.gpi.alt = Buffer.from(alt, 'hex').readInt32LE(0);
                    this.gpi.relative_alt = Buffer.from(relative_alt, 'hex').readInt32LE(0);
                    this.gpi.vx = Buffer.from(vx, 'hex').readInt16LE(0);
                    this.gpi.vy = Buffer.from(vy, 'hex').readInt16LE(0);
                    this.gpi.vz = Buffer.from(vz, 'hex').readInt16LE(0);
                    this.gpi.hdg = Buffer.from(hdg, 'hex').readUInt16LE(0);

                    this.info.altitude = (this.gpi.relative_alt / 1000).toFixed(1);

                    //this.$store.state.drone_infos[this.name].offset_alt = (parseFloat(this.gpi.alt) - parseFloat(this.gpi.relative_alt)) * 1000;

                    //this.airspeed = Math.sqrt(Math.pow(this.gpi.vx, 2) + Math.pow(this.gpi.vy, 2) + Math.pow(this.gpi.vz, 2)) / 100;
                    this.airspeed = Math.abs((this.gpi.vx + this.gpi.vy + this.gpi.vz) / 100);
                    this.colorAirspeed = 'td-text-green';

                    this.info.airSpeed = this.airspeed.toFixed(1);

                    // this.heading = (this.gpi.hdg / 100) % 360;
                    //

                    //console.log('this.gpi.hdg', (this.gpi.hdg / 100) % 360);

                    this.$store.state.drone_infos[this.name].lat = (this.gpi.lat / 10000000);
                    this.$store.state.drone_infos[this.name].lng = (this.gpi.lon / 10000000);
                    this.$store.state.drone_infos[this.name].alt = (this.gpi.relative_alt / 1000);
                    this.$store.state.drone_infos[this.name].absolute_alt = (this.gpi.alt / 1000);

                    let h_pos = get_point_dist((this.gpi.lat / 10000000), (this.gpi.lon / 10000000), 1, this.heading);
                    this.$store.state.drone_infos[this.name].headingLine = [];
                    this.$store.state.drone_infos[this.name].headingLine.push({lat: (this.gpi.lat / 10000000), lng: (this.gpi.lon / 10000000)});
                    this.$store.state.drone_infos[this.name].headingLine.push({lat: h_pos.lat, lng: h_pos.lon});

                    EventBus.$emit('do-current-drone-position', this.name);

                    if(Math.abs(this.gpi.vx) < 10) {
                        this.gpi.vx = 0;
                    }

                    if(Math.abs(this.gpi.vy) < 10) {
                        this.gpi.vy = 0;
                    }

                    let vyy = Math.ceil((this.gpi.vx));
                    let vxx = Math.ceil((this.gpi.vy));
                    let theta = (360 + (Math.atan2(vyy, vxx) * 180 / Math.PI)) % 360;

                    //console.log('vxx', vxx, ', vyy', vyy, ', theta', theta);
                    if(vxx >= 0 && vyy >= 0) {
                        var dir = (360 + (90-theta)) % 360;
                    }
                    else if(vxx < 0 && vyy >= 0) {
                        dir = (360 + (180-theta+270)) % 360;
                    }
                    else if(vxx < 0 && vyy < 0) {
                        dir = (360 + (270-theta+180)) % 360;
                    }
                    else {
                        dir = (360 + (360-theta+90)) % 360;
                    }
                    //console.log("vx", this.gpi.vx / 100, "vy", this.gpi.vy / 100, "theta", dir, "heading", this.heading);


                    let dir_pos = get_point_dist((this.gpi.lat / 10000000), (this.gpi.lon / 10000000), (0.001 + ((this.airspeed * 5)/1000)), dir);
                    this.$store.state.drone_infos[this.name].directionLine = [];
                    this.$store.state.drone_infos[this.name].directionLine.push({lat: (this.gpi.lat / 10000000), lng: (this.gpi.lon / 10000000)});
                    this.$store.state.drone_infos[this.name].directionLine.push({lat: dir_pos.lat, lng: dir_pos.lon});

                    this.info.headingDirection = this.heading;

                    // console.log('airspeed: ' + this.airspeed, 'heading: ' + this.heading);

                    if (this.flagReceiving) {
                        if (this.$store.state.drone_infos[this.name].watchingMission === 'takeoff') {
                            let cur_alt = this.gpi.relative_alt / 1000;
                            let target_alt = this.$store.state.drone_infos[this.name].targetTakeoffAlt;
                            let cur_dist = Math.abs(target_alt - cur_alt);

                            this.watchingMissionStatus = parseInt(Math.abs((1 - (cur_dist / this.watchingInitDist))) * 100);

                            if (this.watchingMissionStatus >= 98) {
                                 this.watchingCount++;
                                 if(this.watchingCount > 32) {
                                     this.watchingMissionStatus = 100;
                                     this.watchingMission = 'takeoff-complete';
                                     this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                                 }
                            }
                            else {
                                this.watchingCount = 0;
                            }
                        }
                        else if (this.$store.state.drone_infos[this.name].watchingMission === 'goto-alt') {
                            let cur_alt = this.gpi.relative_alt / 1000;
                            let target_alt = this.$store.state.drone_infos[this.name].targetAlt;
                            let cur_dist = Math.abs(target_alt - cur_alt);

                            this.watchingMissionStatus = parseInt(Math.abs((1 - (cur_dist / this.watchingInitDist))) * 100);

                            if (this.watchingMissionStatus >= 98) {
                                this.watchingCount++;
                                if(this.watchingCount > 32) {
                                    this.watchingMissionStatus = 100;
                                    this.watchingMission = 'goto-alt-complete';
                                    this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                                }
                            }
                            else {
                                this.watchingCount = 0;
                            }
                        }
                        else if (this.$store.state.drone_infos[this.name].watchingMission === 'goto') {

                            let cur_lat = this.gpi.lat / 10000000;
                            let cur_lon = this.gpi.lon / 10000000;
                            let cur_alt = this.gpi.relative_alt / 1000;

                            let result1 = dfs_xy_conv('toXY', cur_lat, cur_lon);

                            let tar_lat = this.$store.state.drone_infos[this.name].targetLat;
                            let tar_lon = this.$store.state.drone_infos[this.name].targetLng;
                            let tar_alt = this.$store.state.drone_infos[this.name].targetAlt;

                            let result2 = dfs_xy_conv('toXY', tar_lat, tar_lon);

                            let cur_dist = Math.sqrt(Math.pow(result2.x - result1.x, 2) + Math.pow(result2.y - result1.y, 2) + Math.pow((tar_alt - cur_alt), 2));

                            this.watchingMissionStatus = parseInt(Math.abs((1 - (cur_dist / this.watchingInitDist))) * 100);

                            if (this.watchingMissionStatus >= 98) {
                                this.watchingCount++;
                                if(this.watchingCount > 32) {
                                    this.watchingMissionStatus = 100;
                                    this.watchingMission = 'goto-complete';
                                    this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;

                                    //this.setWpYawBehavior(1);
                                }
                            }
                            else {
                                this.watchingCount = 0;
                            }
                        }

                        else if (this.$store.state.drone_infos[this.name].watchingMission === 'goto-circle') {
                            let cur_lat = this.gpi.lat / 10000000;
                            let cur_lon = this.gpi.lon / 10000000;
                            let cur_alt = this.gpi.relative_alt / 1000;

                            let result1 = dfs_xy_conv('toXY', cur_lat, cur_lon);

                            let tar_lat = this.$store.state.drone_infos[this.name].targetLat;
                            let tar_lon = this.$store.state.drone_infos[this.name].targetLng;
                            let tar_alt = this.$store.state.drone_infos[this.name].targetAlt;

                            let result2 = dfs_xy_conv('toXY', tar_lat, tar_lon);

                            let cur_dist = Math.sqrt(Math.pow(result2.x - result1.x, 2) + Math.pow(result2.y - result1.y, 2) + Math.pow((tar_alt - cur_alt), 2));

                            //console.log('goto-circle', 'cur_dist-, heading', Math.abs(cur_dist - this.droneStatus.radius), this.heading);

                            if(Math.abs(cur_dist - this.droneStatus.radius) < 3) {

                                // this.droneStatus.startCount++;
                                //
                                // if(this.droneStatus.startCount > 16) {
                                    //console.log(this.droneStatus.initHeading, this.heading)
                                    let cur_heading = this.heading;
                                    let diff = 0;
                                    if(this.$store.state.drone_infos[this.name].circleType === '시계방향') {
                                        diff = cur_heading - this.droneStatus.initHeading;
                                    }
                                    else {
                                        diff = this.droneStatus.initHeading - cur_heading;
                                    }

                                    if(diff < 0) {
                                        diff += 360;
                                    }

                                    this.watchingMissionStatus = parseInt((diff / 360) * 100);
                                    //console.log('goto-circle', 'diff, heading', diff, this.heading, this.droneStatus.initHeading);
//                                 }
//                                 else {
//                                     let deg = (Math.atan2((result2.y - result1.y), (result2.x - result1.x)) * (180/3.14));
//                                     deg = 360-deg;
//                                     deg -= 90;
//                                     deg %= 360;
//
// //                                    console.log(deg);
//                                     this.droneStatus.initHeading = (deg + 180) % 360;
//
//                                     console.log(this.droneStatus.initHeading, this.heading)
//                                 }
                            }
                            // else {
                            //     this.droneStatus.startCount = 0;
                            // }
                        }

                        else if (this.$store.state.drone_infos[this.name].watchingMission === 'auto-goto') {
                            // if(this.curArmStatus !== 'ARMED') {
                            //     this.watchingMissionStatus = 100;
                            //     this.watchingMission = 'auto-goto-complete';
                            //     this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                            //
                            //     //this.setWpYawBehavior(1);
                            // }
                        }

                        else if (this.$store.state.drone_infos[this.name].watchingMission === 'land') {
                            let cur_alt = this.gpi.relative_alt / 1000;
                            let target_alt = 0;
                            let cur_dist = Math.abs(target_alt - cur_alt);

                            this.watchingMissionStatus = parseInt(Math.abs((1 - (cur_dist / this.watchingInitDist))) * 100);

                            if(this.curArmStatus !== 'ARMED') {
                                this.watchingMissionStatus = 100;
                                this.watchingMission = 'land-complete';
                                this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                            }
                        }
                        else if (this.$store.state.drone_infos[this.name].watchingMission === 'rtl') {
                            this.watchingMissionStatus = parseInt(Math.abs((1 - (this.valueDistance / this.watchingInitDist))) * 100);

                            if(this.curArmStatus !== 'ARMED') {
                                this.watchingMissionStatus = 100;
                                this.watchingMission = 'rtl-complete';
                                this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                            }
                        }

                        if (this.pre_lat !== this.gpi.lat || this.pre_lng !== this.gpi.lon || this.pre_heading !== this.heading || this.pre_relative_alt !== this.gpi.relative_alt) {
                            let _payload = {};
                            _payload.name = this.name;
                            _payload.iconArming = this.iconArming;
                            _payload.lat = (this.gpi.lat / 10000000);
                            _payload.lng = (this.gpi.lon / 10000000);
                            _payload.alt = (this.gpi.relative_alt / 1000);

                            this.$store.state.drone_infos[this.name].heading = this.heading;

                            EventBus.$emit('updateDroneAlt', JSON.parse(JSON.stringify(_payload)));

                            this.pre_lat = this.gpi.lat;
                            this.pre_lng = this.gpi.lon;
                            this.pre_heading = this.heading;
                            this.pre_relative_alt = this.gpi.relative_alt;
                            this.pre_airspeed = this.airspeed;

                            if (this.$store.state.trackingLines[this.name].length > 5000) {
                                this.$store.state.trackingLines[this.name].shift();
                            }

                            if(this.curArmStatus === 'ARMED') {
                                this.$store.state.trackingLines[this.name].push({lat: _payload.lat, lng: _payload.lng});

                                localStorage.setItem('trackingLines-' + this.name, JSON.stringify(this.$store.state.trackingLines[this.name]));

                                let temp = JSON.parse(JSON.stringify(this.$store.state.trackingLines[this.name]));
                                this.$store.state.trackingLines[this.name] = null;
                                this.$store.state.trackingLines[this.name] = JSON.parse(JSON.stringify(temp));
                            }

                            _payload = null;

                            if (Object.prototype.hasOwnProperty.call(this.$store.state.curDronePositions, this.name)) {
                                this.$store.state.curDronePositions[this.name].lat = this.gpi.lat;
                                this.$store.state.curDronePositions[this.name].lng = this.gpi.lon;
                                this.$store.state.curDronePositions[this.name].alt = this.gpi.alt;
                            }
                        }

                        if (this.curArmStatus === 'ARMED') {
                            let cur_lat = this.gpi.lat / 10000000;
                            let cur_lon = this.gpi.lon / 10000000;
                            let cur_alt = this.gpi.relative_alt / 1000;

                            let result1 = dfs_xy_conv('toXY', cur_lat, cur_lon);

                            let tar_lat = this.$store.state.drone_infos[this.name].home_position.lat;
                            let tar_lon = this.$store.state.drone_infos[this.name].home_position.lng;
                            let tar_alt = 0;

                            let result2 = dfs_xy_conv('toXY', tar_lat, tar_lon);

                            this.valueDistance = Math.sqrt(Math.pow(result2.x - result1.x, 2) + Math.pow(result2.y - result1.y, 2) + Math.pow((tar_alt - cur_alt), 2));
                            this.info.valueDistance = (this.valueDistance > 1000) ? (this.valueDistance / 1000).toFixed(1) + ' km' : (this.valueDistance.toFixed(0) + ' m')

                            this.$store.state.curDronePositions[this.name] = {};
                            this.$store.state.curDronePositions[this.name].brake = false;
                        }
                        else {
                            this.valueDistance = 0;
                            this.info.valueDistance = (this.valueDistance > 1000) ? (this.valueDistance / 1000).toFixed(1) + ' km' : (this.valueDistance.toFixed(0) + ' m')

                            delete this.$store.state.curDronePositions[this.name];
                        }

                        if (this.$store.state.currentCommandTab === '이동' || this.$store.state.currentCommandTab === '선회' || this.$store.state.currentCommandTab === '관심') {
                            let pIndex = this.$store.state.drone_infos[this.name].curTargetedTempMarkerIndex;
                            if (this.$store.state.drone_infos[this.name].selected && this.$store.state.drone_infos[this.name].targeted &&  pIndex !== -1) {
                                let cur_lat = this.gpi.lat / 10000000;
                                let cur_lon = this.gpi.lon / 10000000;
                                let cur_alt = this.gpi.relative_alt / 1000;

                                let result1 = dfs_xy_conv('toXY', cur_lat, cur_lon);

                                let tar_lat = this.$store.state.tempMarkers[this.name][pIndex].lat;
                                let tar_lon = this.$store.state.tempMarkers[this.name][pIndex].lng;
                                let tar_alt = this.$store.state.tempMarkers[this.name][pIndex].alt;

                                let result2 = dfs_xy_conv('toXY', tar_lat, tar_lon);

                                this.$store.state.distanceTarget[this.name] = Math.sqrt(Math.pow(result2.x - result1.x, 2) + Math.pow(result2.y - result1.y, 2) + Math.pow((tar_alt - cur_alt), 2));

                                this.$store.state.distanceTarget = this.clone(this.$store.state.distanceTarget);
                            }
                            else {
                                this.$store.state.distanceTarget[this.name] = 0;
                            }
                        }
                    }
                }

                else if (msg_id === mavlink.MAVLINK_MSG_ID_ATTITUDE) {
                    let my_len = 28;
                    let ar = mavPacket.split('');
                    for (let i = 0; i < (my_len - msg_len); i++) {
                        ar.splice(ar.length-4, 0, '0');
                        ar.splice(ar.length-4, 0, '0');
                    }
                    mavPacket = ar.join('');

                    time_boot_ms = mavPacket.substr(base_offset, 8).toLowerCase();
                    base_offset += 8;
                    var roll = mavPacket.substr(base_offset, 8).toLowerCase();
                    base_offset += 8;
                    var pitch = mavPacket.substr(base_offset, 8).toLowerCase();
                    base_offset += 8;
                    var yaw = mavPacket.substr(base_offset, 8).toLowerCase();
                    base_offset += 8;
                    var rollspeed = mavPacket.substr(base_offset, 8).toLowerCase();
                    base_offset += 8;
                    var pitchspeed = mavPacket.substr(base_offset, 8).toLowerCase();
                    base_offset += 8;
                    var yawspeed = mavPacket.substr(base_offset, 8).toLowerCase();

                    // eslint-disable-next-line no-prototype-builtins
                    if (!Object.prototype.hasOwnProperty.call(this.att, sys_id)) {
                        this.att = {};
                    }

                    this.att.time_boot_ms = Buffer.from(time_boot_ms, 'hex').readUInt32LE(0);
                    this.att.roll = Buffer.from(roll, 'hex').readFloatLE(0);
                    this.att.pitch = Buffer.from(pitch, 'hex').readFloatLE(0);
                    this.att.yaw = Buffer.from(yaw, 'hex').readFloatLE(0);
                    this.att.rollspeed = Buffer.from(rollspeed, 'hex').readFloatLE(0);
                    this.att.pitchspeed = Buffer.from(pitchspeed, 'hex').readFloatLE(0);
                    this.att.yawspeed = Buffer.from(yawspeed, 'hex').readFloatLE(0);

                    this.arrRoll.push((-1) * this.att.roll * 100);
                    while(this.arrRoll.length > 3) {
                        this.arrRoll.shift();
                    }
                    this.roll = this.arrRoll.reduce( ( p, c ) => p + c, 0 ) / this.arrRoll.length;
                    this.roll = this.att.roll * (180/3.14);
                    this.info.bankAngle = (-1) * this.roll ;

                    // console.log('roll(rad): ' + (this.att.roll));

                    this.arrPitch.push(this.att.pitch * 100);
                    while(this.arrPitch.length > 3) {
                        this.arrPitch.shift();
                    }
                    this.pitch = this.arrPitch.reduce( ( p, c ) => p + c, 0 ) / this.arrPitch.length;
                    this.pitch = this.att.pitch * (180/3.14);
                    this.info.anglePitch = this.pitch;

                    // console.log('pitch(rad): ' + (this.att.pitch));
                    // console.log('pitch(deg): ' + (this.att.pitch * (180/3.14)));

                    // console.log('roll: ' + this.roll, 'pitch: ' + this.pitch);

                    if(this.att.yaw < 0) {
                        this.att.yaw += (2 * Math.PI);
                    }

                    // console.log('yaw', ((this.att.yaw * 180) / Math.PI));

                    this.heading = ((this.att.yaw * 180)/Math.PI);
                }

                else if (msg_id === mavlink.MAVLINK_MSG_ID_GPS_RAW_INT) {

                    let my_len = 30;
                    if(ver === 'fd') {
                        my_len += 22;
                    }
                    let ar = mavPacket.split('');
                    for (let i = 0; i < (my_len - msg_len); i++) {
                        ar.splice(ar.length-4, 0, '0');
                        ar.splice(ar.length-4, 0, '0');
                    }
                    mavPacket = ar.join('');

                    base_offset += (16 + 2 + 8 + 8 + 8 + 4 + 4 + 4 + 4);
                    var satellites = mavPacket.substr(base_offset, 2).toLowerCase();

                    this.num_satellites = Buffer.from(satellites, 'hex').readUInt8(0);
                    this.info.num_satellites = this.num_satellites;

                    //console.log("MAVLINK_MSG_ID_GPS_RAW_INT", "num_satellites ", this.num_satellites);
                }

                // else if (msg_id === mavlink.MAVLINK_MSG_ID_GPS_STATUS) {
                //     let my_len = 101;
                //     let ar = mavPacket.split('');
                //     for (let i = 0; i < (my_len - msg_len); i++) {
                //         ar.splice(ar.length-4, 0, '0');
                //         ar.splice(ar.length-4, 0, '0');
                //     }
                //     mavPacket = ar.join('');
                //
                //     satellites = mavPacket.substr(base_offset, 2).toLowerCase();
                //     this.num_satellites = Buffer.from(satellites, 'hex').readUInt8(0);
                //     this.info.num_satellites = this.num_satellites;
                //
                //     console.log("MAVLINK_MSG_ID_GPS_STATUS", "num_satellites ", this.num_satellites);
                // }

                // else if (msg_id === mavlink.MAVLINK_MSG_ID_RADIO_STATUS) {
                //     let my_len = 9;
                //     let ar = mavPacket.split('');
                //     for (let i = 0; i < (my_len - msg_len); i++) {
                //         ar.splice(ar.length-4, 0, '0');
                //         ar.splice(ar.length-4, 0, '0');
                //     }
                //     mavPacket = ar.join('');
                //
                //     base_offset += 2;
                //     var rssi = mavPacket.substr(base_offset, 2).toLowerCase();
                //     this.rssi = Buffer.from(rssi, 'hex').readUInt8(0);
                //     this.info.rssi = this.rssi;
                //     console.log('MAVLINK_MSG_ID_RADIO_STATUS', this.rssi);
                // }

                // else if (msg_id === mavlink.MAVLINK_MSG_ID_RC_CHANNELS_RAW) {
                //     let my_len = 22;
                //     let ar = mavPacket.split('');
                //     for (let i = 0; i < (my_len - msg_len); i++) {
                //         ar.splice(ar.length-4, 0, '0');
                //         ar.splice(ar.length-4, 0, '0');
                //     }
                //     mavPacket = ar.join('');
                //
                //     base_offset += 42;
                //     var rssi = mavPacket.substr(base_offset, 2).toLowerCase();
                //     this.rssi = Buffer.from(rssi, 'hex').readUInt8(0);
                //     this.info.rssi = this.rssi;
                //     console.log('MAVLINK_MSG_ID_RC_CHANNELS_RAW', this.rssi);
                // }

                // else if (msg_id === mavlink.MAVLINK_MSG_ID_RC_CHANNELS) {
                //     let my_len = 42;
                //     let ar = mavPacket.split('');
                //     for (let i = 0; i < (my_len - msg_len); i++) {
                //         ar.splice(ar.length-4, 0, '0');
                //         ar.splice(ar.length-4, 0, '0');
                //     }
                //     mavPacket = ar.join('');
                //
                //     base_offset += 82;
                //     var rssi = mavPacket.substr(base_offset, 2).toLowerCase();
                //     this.rssi = Buffer.from(rssi, 'hex').readUInt8(0);
                //     this.info.rssi = this.rssi;
                //     console.log('MAVLINK_MSG_ID_RC_CHANNELS', this.rssi);
                // }

                // else if (msg_id === mavlink.MAVLINK_MSG_ID_RC_CHANNELS) {
                //     if (ver === 'fd') {
                //         base_offset = 20;
                //         time_boot_ms = mavPacket.substr(base_offset, 8).toLowerCase();
                //         base_offset += (8 + 2 + (4 * 18));
                //         var rssi = mavPacket.substr(base_offset, 2).toLowerCase();
                //     }
                //     else {
                //         base_offset = 12;
                //         time_boot_ms = mavPacket.substr(base_offset, 8).toLowerCase();
                //         base_offset += (8 + 2 + (4 * 18));
                //         rssi = mavPacket.substr(base_offset, 2).toLowerCase();
                //     }
                //
                //     this.rssi = parseInt((Buffer.from(rssi, 'hex').readUInt8(0)) / 255 * 100);
                // }

                else if (msg_id === mavlink.MAVLINK_MSG_ID_PARAM_VALUE) {
                    let my_len = 25;
                    let ar = mavPacket.split('');
                    for (let i = 0; i < (my_len - msg_len); i++) {
                        ar.splice(ar.length-4, 0, '0');
                        ar.splice(ar.length-4, 0, '0');
                    }
                    mavPacket = ar.join('');

                    var param_value = mavPacket.substr(base_offset, 8).toLowerCase();
                    base_offset += 8;
                    var param_count = mavPacket.substr(base_offset, 4).toLowerCase();
                    base_offset += 4;
                    var param_index = mavPacket.substr(base_offset, 4).toLowerCase();
                    base_offset += 4;
                    var param_id = mavPacket.substr(base_offset, 32).toLowerCase();
                    base_offset += 32;
                    var param_type = mavPacket.substr(base_offset, 2).toLowerCase();

                    param_id = Buffer.from(param_id, "hex").toString('ASCII');

                    // if (param_id.includes('STAT_FLTTIME')) {
                    //
                    //     this.stat_flttime_param = {};
                    //     this.stat_flttime_param.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                    //     this.stat_flttime_param.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                    //     this.stat_flttime_param.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                    //     this.stat_flttime_param.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                    //
                    //     console.log(this.name, 'STAT_FLTTIME', this.stat_flttime_param.param_value);
                    //
                    //     // if(this.$store.state.drone_infos[this.name].lastFlightTime > this.stat_flttime_param.param_value) {
                    //     //     this.$store.state.drone_infos[this.name].lastFlightTime = this.stat_flttime_param.param_value;
                    //     //
                    //     //     this.postDroneInfos();
                    //     // }
                    // }
                    // else {
                    //     if(this.curArmStatus === 'ARMED') {
                    //         let curFlightTime = this.stat_flttime_param.param_value - this.$store.state.drone_infos[this.name].lastFlightTime;
                    //         console.log(this.name, 'curFlightTime', curFlightTime);
                    //     }
                    // }

                    // else if (param_id.includes('STAT_RUNTIME')) {
                    //
                    //     let stat_runtime_param = {};
                    //     stat_runtime_param.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                    //     stat_runtime_param.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                    //     stat_runtime_param.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                    //     stat_runtime_param.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                    //
                    //     console.log(this.name, 'STAT_RUNTIME', stat_runtime_param);
                    // }

                    if (param_id.includes('RC1_MIN')) {
                        if (!Object.prototype.hasOwnProperty.call(this.rc1, 'min')) {
                            this.rc1.min = {};
                        }

                        this.rc1.min.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                        this.rc1.min.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                        this.rc1.min.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                        this.rc1.min.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                        // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", this.name, 'RC1_MIN', this.rc1.min.param_value);
                    }
                    else if (param_id.includes('RC1_MAX')) {
                        if (!Object.prototype.hasOwnProperty.call(this.rc1, 'max')) {
                            this.rc1.max = {};
                        }

                        this.rc1.max.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                        this.rc1.max.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                        this.rc1.max.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                        this.rc1.max.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                        // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", this.name, 'RC1_MAX', this.rc1.max.param_value);
                    }
                    else if (param_id.includes('RC1_TRIM')) {
                        if (!Object.prototype.hasOwnProperty.call(this.rc1, 'trim')) {
                            this.rc1.trim = {};
                        }

                        this.rc1.trim.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                        this.rc1.trim.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                        this.rc1.trim.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                        this.rc1.trim.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                        // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", this.name, 'RC1_TRIM', this.rc1.trim.param_value);
                    }
                    else if (param_id.includes('RC2_MIN')) {
                        if (!Object.prototype.hasOwnProperty.call(this.rc2, 'min')) {
                            this.rc2.min = {};
                        }

                        this.rc2.min.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                        this.rc2.min.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                        this.rc2.min.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                        this.rc2.min.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                        // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", this.name, 'RC2_MIN', this.rc2.min.param_value);
                    }
                    else if (param_id.includes('RC2_MAX')) {
                        if (!Object.prototype.hasOwnProperty.call(this.rc2, 'max')) {
                            this.rc2.max = {};
                        }

                        this.rc2.max.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                        this.rc2.max.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                        this.rc2.max.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                        this.rc2.max.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                        // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", this.name, 'RC2_MAX', this.rc2.max.param_value);
                    }
                    else if (param_id.includes('RC2_TRIM')) {
                        if (!Object.prototype.hasOwnProperty.call(this.rc2, 'trim')) {
                            this.rc2.trim = {};
                        }

                        this.rc2.trim.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                        this.rc2.trim.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                        this.rc2.trim.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                        this.rc2.trim.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                        // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", this.name, 'RC2_TRIM', this.rc2.trim.param_value);
                    }
                    else if (param_id.includes('RC3_MIN')) {
                        if (!Object.prototype.hasOwnProperty.call(this.rc3, 'min')) {
                            this.rc3.min = {};
                        }

                        this.rc3.min.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                        this.rc3.min.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                        this.rc3.min.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                        this.rc3.min.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                        // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", this.name, 'RC3_MIN', this.rc3.min.param_value);
                    }
                    else if (param_id.includes('RC3_MAX')) {
                        if (!Object.prototype.hasOwnProperty.call(this.rc3, 'max')) {
                            this.rc3.max = {};
                        }

                        this.rc3.max.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                        this.rc3.max.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                        this.rc3.max.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                        this.rc3.max.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                        // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", this.name, 'RC3_MAX', this.rc3.max.param_value);
                    }
                    else if (param_id.includes('RC3_TRIM')) {
                        if (!Object.prototype.hasOwnProperty.call(this.rc3, 'trim')) {
                            this.rc3.trim = {};
                        }

                        this.rc3.trim.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                        this.rc3.trim.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                        this.rc3.trim.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                        this.rc3.trim.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                        // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", this.name, 'RC3_TRIM', this.rc3.trim.param_value);
                    }
                    else if (param_id.includes('RC4_MIN')) {
                        if (!Object.prototype.hasOwnProperty.call(this.rc4, 'min')) {
                            this.rc4.min = {};
                        }

                        this.rc4.min.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                        this.rc4.min.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                        this.rc4.min.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                        this.rc4.min.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                        // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", this.name, 'RC4_MIN', this.rc4.min.param_value);
                    }
                    else if (param_id.includes('RC4_MAX')) {
                        if (!Object.prototype.hasOwnProperty.call(this.rc4, 'max')) {
                            this.rc4.max = {};
                        }

                        this.rc4.max.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                        this.rc4.max.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                        this.rc4.max.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                        this.rc4.max.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                        // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", this.name, 'RC4_MAX', this.rc4.max.param_value);
                    }
                    else if (param_id.includes('RC4_TRIM')) {
                        if (!Object.prototype.hasOwnProperty.call(this.rc4, 'trim')) {
                            this.rc4.trim = {};
                        }

                        this.rc4.trim.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                        this.rc4.trim.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                        this.rc4.trim.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                        this.rc4.trim.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                        // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", this.name, 'RC4_TRIM', this.rc4.trim.param_value);
                    }
                    else if (param_id.includes('WP_YAW_BEHAVIOR')) {
                        if (!Object.prototype.hasOwnProperty.call(this.params, 'wpYawBehavior')) {
                            this.params.wpYawBehavior = {};
                        }

                        this.params.wpYawBehavior.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                        this.params.wpYawBehavior.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                        this.params.wpYawBehavior.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                        this.params.wpYawBehavior.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                        console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", this.name, 'WP_YAW_BEHAVIOR', this.params.wpYawBehavior);

                        this.$store.state.params.wpYawBehavior[this.name] = this.itemsWpYawBehavior[this.params.wpYawBehavior.param_value];
                        this.info.wpYawBehavior = 'YAW-' + String(this.params.wpYawBehavior.param_value);
                    }
                    else if (param_id.includes('ATC_SLEW_YAW')) {
                        if (!Object.prototype.hasOwnProperty.call(this.params, 'atcSlewYaw')) {
                            this.params.atcSlewYaw = {};
                        }

                        this.params.atcSlewYaw.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                        this.params.atcSlewYaw.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                        this.params.atcSlewYaw.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                        this.params.atcSlewYaw.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                        console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", this.name, 'ATC_SLEW_YAW', this.params.atcSlewYaw);

                        this.$store.state.params.atcSlewYaw[this.name] = (this.params.atcSlewYaw.param_value / 100);
                    }
                    else if (param_id.includes('WPNAV_SPEED_UP')) {
                        if (!Object.prototype.hasOwnProperty.call(this.params, 'wpnavSpeedUp')) {
                            this.params.wpnavSpeedUp = {};
                        }

                        this.params.wpnavSpeedUp.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                        this.params.wpnavSpeedUp.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                        this.params.wpnavSpeedUp.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                        this.params.wpnavSpeedUp.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                        console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", this.name, 'WPNAV_SPEED_UP', this.params.wpnavSpeedUp);

                        this.$store.state.params.wpnavSpeedUp[this.name] = (this.params.wpnavSpeedUp.param_value / 100);
                    }
                    else if (param_id.includes('WPNAV_SPEED_DN')) {
                        if (!Object.prototype.hasOwnProperty.call(this.params, 'wpnavSpeedDn')) {
                            this.params.wpnavSpeedDn = {};
                        }

                        this.params.wpnavSpeedDn.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                        this.params.wpnavSpeedDn.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                        this.params.wpnavSpeedDn.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                        this.params.wpnavSpeedDn.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                        console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", this.name, 'WPNAV_SPEED_DN', this.params.wpnavSpeedDn);

                        this.$store.state.params.wpnavSpeedDn[this.name] = (this.params.wpnavSpeedDn.param_value / 100);
                    }
                    else if (param_id.includes('RTL_ALT')) {
                        if (!Object.prototype.hasOwnProperty.call(this.params, 'rtlAlt')) {
                            this.params.rtlAlt = {};
                        }

                        this.params.rtlAlt.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                        this.params.rtlAlt.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                        this.params.rtlAlt.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                        this.params.rtlAlt.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                        console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", this.name, 'RTL_ALT', this.params.rtlAlt);

                        this.$store.state.params.rtlAlt[this.name] = (this.params.rtlAlt.param_value / 100);
                    }
                    else if (param_id.includes('WPNAV_RADIUS')) {
                        if (!Object.prototype.hasOwnProperty.call(this.params, 'wpnavRadius')) {
                            this.params.wpnavRadius = {};
                        }

                        this.params.wpnavRadius.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                        this.params.wpnavRadius.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                        this.params.wpnavRadius.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                        this.params.wpnavRadius.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                        console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", this.name, 'WPNAV_RADIUS', this.params.wpnavRadius);

                        this.$store.state.params.wpnavRadius[this.name] = (this.params.wpnavRadius.param_value / 100);
                    }
                    else if (param_id.includes('WPNAV_ACCEL')) {
                        if (!Object.prototype.hasOwnProperty.call(this.params, 'wpnavAccel')) {
                            this.params.wpnavAccel = {};
                        }

                        this.params.wpnavAccel.param_value = Buffer.from(param_value, 'hex').readFloatLE(0);
                        this.params.wpnavAccel.param_type = Buffer.from(param_type, 'hex').readInt8(0);
                        this.params.wpnavAccel.param_count = Buffer.from(param_count, 'hex').readInt16LE(0);
                        this.params.wpnavAccel.param_index = Buffer.from(param_index, 'hex').readUInt16LE(0);
                        console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", this.name, 'WPNAV_ACCEL', this.params.wpnavAccel);

                        this.$store.state.params.wpnavAccel[this.name] = (this.params.wpnavAccel.param_value / 100);
                    }
                }
                else if (msg_id === mavlink.MAVLINK_MSG_ID_MISSION_ITEM) {
                    // console.log('---> ' + 'MAVLINK_MSG_ID_MISSION_ITEM - ' + mavPacket);
                }
                else if (msg_id === mavlink.MAVLINK_MSG_ID_MISSION_REQUEST) {
                    // console.log('---> ' + 'MAVLINK_MSG_ID_MISSION_REQUEST - ' + mavPacket);

                    let my_len = 4;
                    if(ver === 'fd') {
                        my_len += 1;
                    }
                    let ar = mavPacket.split('');
                    for (let i = 0; i < (my_len - msg_len); i++) {
                        ar.splice(ar.length-4, 0, '0');
                        ar.splice(ar.length-4, 0, '0');
                    }
                    mavPacket = ar.join('');

                    var mission_sequence = mavPacket.substr(base_offset, 4).toLowerCase();
                    base_offset += 4;
                    var target_system = mavPacket.substr(base_offset, 2).toLowerCase();
                    base_offset += 2;
                    //var target_component = mavPacket.substr(base_offset, 2).toLowerCase();
                    base_offset += 2;
                    //var mission_type = mavPacket.substr(base_offset, 2).toLowerCase();

                    if (!Object.prototype.hasOwnProperty.call(this.mission_request, sys_id)) {
                        this.mission_request[sys_id] = {};
                    }

                    var mission_result = Buffer.from(target_system, 'hex').readUInt8(0);
                    this.mission_request[sys_id].target_system = mission_result;
                    mission_result = Buffer.from(mission_sequence, 'hex').readUInt16LE(0);
                    this.mission_request[sys_id].seq_requested = mission_result;

                    console.log(this.name, sys_id, 'MAVLINK_MSG_ID_MISSION_REQUEST', '-', this.mission_request[sys_id].target_system, this.mission_request[sys_id].seq_requested);

                    this.watchingMissionStatus = parseInt((this.mission_request[sys_id].seq_requested) / (this.droneStatus.mission_count-1) * 100);

                    console.log('downloading ' + this.watchingMissionStatus + '%');

                    if((this.droneStatus.curCommand === 'auto_mission_count') || (this.droneStatus.curCommand === 'auto_mission_item')) {
                        clearTimeout(this.droneStatus.objTimeout);

                        this.send_auto_mission_protocol(this.droneStatus.target_name, this.droneStatus.pub_topic, this.droneStatus.target_sys_id, this.droneStatus.goto_each_position, this.droneStatus.start_idx, this.droneStatus.end_idx, this.droneStatus.delay, this.droneStatus.cur_idx, this.mission_request[sys_id].seq_requested);
                    }
                }
                else if (msg_id === mavlink.MAVLINK_MSG_ID_MISSION_ITEM_REACHED) {
                    let my_len = 30;
                    if(ver === 'fd') {
                        my_len += 22;
                    }
                    let ar = mavPacket.split('');
                    for (let i = 0; i < (my_len - msg_len); i++) {
                        ar.splice(ar.length-4, 0, '0');
                        ar.splice(ar.length-4, 0, '0');
                    }
                    mavPacket = ar.join('');

                    var mission_seq = mavPacket.substr(base_offset, 4).toLowerCase();

                    this.mission_seq = Buffer.from(mission_seq, 'hex').readUInt16LE(0);

                    console.log(this.name, 'MAVLINK_MSG_ID_MISSION_ITEM_REACHED', this.mission_seq);

                    if(this.$store.state.drone_infos[this.name].watchingMission === 'auto-goto') {

                        this.watchingMissionStatus = parseInt((this.mission_seq) / (this.$store.state.drone_infos[this.name].mission_count-1) * 100);

                        if(this.$store.state.drone_infos[this.name].mission_count === (this.mission_seq+1)) {
                            console.log('Auto Mission Complete at %s', this.droneStatus.target_name);

                            let target_mode = 'GUIDED';
                            if(this.fcType === 'px4') {
                                target_mode = 'AUTO_LOITER';
                            }
                            this.send_set_mode_command(this.name, this.target_pub_topic, this.sys_id, target_mode);

                            this.watchingMission = 'auto-goto-complete';
                            this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;

                            this.$store.state.drone_infos[this.name].curMissionItemReached = 0;

                            this.postDroneInfos((res) => {
                                console.log('postDroneInfos - auto-goto-complete', res);
                            });

                            //this.setWpYawBehavior(1);
                        }
                        else {
                            this.$store.state.drone_infos[this.name].curMissionItemReached = this.mission_seq;
                            localStorage.setItem('curMissionItemReached', this.mission_seq);
                        }
                    }

                    else if(this.$store.state.drone_infos[this.name].watchingMission === 'goto-circle') {
                        this.watchingMissionStatus = 100;

                        this.droneStatus.startFlag = false;

                        let target_mode = 'GUIDED';
                        if(this.fcType === 'px4') {
                            target_mode = 'AUTO_LOITER';
                        }
                        this.send_set_mode_command(this.name, this.target_pub_topic, this.sys_id, target_mode);

                        this.watchingMission = 'goto-circle-complete';
                        this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                    }

                    else if(this.$store.state.drone_infos[this.name].watchingMission === 'takeoff') {
                        this.watchingMissionStatus = 100;
                        this.watchingMission = 'takeoff-complete';
                        this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                    }

                    else if(this.$store.state.drone_infos[this.name].watchingMission === 'goto') {
                        this.watchingMissionStatus = 100;
                        this.watchingMission = 'goto-complete';
                        this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;

                        //this.setWpYawBehavior(1);
                    }

                    else if(this.$store.state.drone_infos[this.name].watchingMission === 'goto-alt') {
                        this.watchingMissionStatus = 100;
                        this.watchingMission = 'goto-alt-complete';
                        this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                    }


                }
                else if (msg_id === mavlink.MAVLINK_MSG_ID_MISSION_COUNT) { //
                    // console.log('---> ' + 'MAVLINK_MSG_ID_MISSION_COUNT - ' + mavPacket);
                }
                else if (msg_id === mavlink.MAVLINK_MSG_ID_MISSION_REQUEST_LIST) {
                    // console.log('---> ' + 'MAVLINK_MSG_ID_MISSION_REQUEST_LIST - ' + mavPacket);
                }
                else if (msg_id === mavlink.MAVLINK_MSG_ID_MISSION_ACK) { // #47 - mission_ack
                    // console.log('---> ' + 'MAVLINK_MSG_ID_MISSION_ACK - ' + mavPacket);

                    let my_len = 3;
                    if(ver === 'fd') {
                        my_len += 1;
                    }
                    let ar = mavPacket.split('');
                    for (let i = 0; i < (my_len - msg_len); i++) {
                        ar.splice(ar.length-4, 0, '0');
                        ar.splice(ar.length-4, 0, '0');
                    }
                    mavPacket = ar.join('');

                    target_system = mavPacket.substr(base_offset, 2).toLowerCase();
                    base_offset += 2;
                    //target_component = mavPacket.substr(base_offset, 2).toLowerCase();
                    base_offset += 2;
                    var mission_result_type = mavPacket.substr(base_offset, 2).toLowerCase();
                    base_offset += 2;
                    //mission_type = mavPacket.substr(base_offset, 2).toLowerCase();

                    if (!Object.prototype.hasOwnProperty.call(this.result_mission_ack, sys_id)) {
                        this.result_mission_ack[sys_id] = {};
                    }

                    this.result_mission_ack[sys_id].target_system = Buffer.from(target_system, 'hex').readUInt8(0);
                    this.result_mission_ack[sys_id].type = Buffer.from(mission_result_type, 'hex').readUInt8(0);

                    console.log(this.name, 'MAVLINK_MSG_ID_MISSION_ACK', '-', this.result_mission_ack[sys_id].target_system, this.MAV_MISSION_RESULT_CODE[this.result_mission_ack[sys_id].type]);

                    if((this.droneStatus.curCommand === 'auto_mission_clear_all') && (this.result_mission_ack[sys_id].type === 0)) {
                        clearTimeout(this.droneStatus.objTimeout);
                        this.droneStatus.curCommand = '';

                        this.send_auto_mission_count(this.droneStatus.target_name, this.droneStatus.pub_topic, this.droneStatus.target_sys_id, this.droneStatus.goto_each_position, this.droneStatus.start_idx, this.droneStatus.end_idx, this.droneStatus.delay, this.droneStatus.cur_idx);
                    }
                    else if((this.droneStatus.curCommand === 'auto_mission_item') && (this.result_mission_ack[sys_id].type === 0)) {
                        clearTimeout(this.droneStatus.objTimeout);
                        this.droneStatus.curCommand = '';

                        console.log('Auto Mission Upload Complete to %s', this.droneStatus.target_name);

                        this.watchingMissionStatus = 0;

                        if(this.$store.state.drone_infos[this.name].watchingMission === 'goto-circle') {
                            delete this.$store.state.missionLines[this.droneStatus.target_name];
                            this.$store.state.missionCircles[this.droneStatus.target_name] = null;
                            delete this.$store.state.missionCircles[this.droneStatus.target_name];
                            this.$store.state.missionCircles[this.droneStatus.target_name] = {
                                lat: this.droneStatus.latitude,
                                lng: this.droneStatus.longitude,
                                radius: this.droneStatus.radius,
                                options: {
                                    strokeColor: this.$store.state.drone_infos[this.name].color,
                                    strokeOpacity: 1,
                                    strokeWeight: 5
                                }
                            };

                            this.$store.state.missionCircles = this.clone(this.$store.state.missionCircles);
                        }

                        this.send_set_mode_command(this.name, this.target_pub_topic, this.sys_id, 'AUTO');
                    }
                }
                else if (msg_id === mavlink.MAVLINK_MSG_ID_MISSION_ITEM_INT) {
                    // console.log('---> ' + 'MAVLINK_MSG_ID_MISSION_ITEM_INT - ' + mavPacket);
                }
                else if (msg_id === mavlink.MAVLINK_MSG_ID_COMMAND_ACK) { // #77 command_ack
                    console.log('---> ' + 'MAVLINK_MSG_ID_COMMAND_ACK - ' + mavPacket);

                    let ar = mavPacket.split('');
                    for (let i = 0; i < (3 - msg_len); i++) {
                        ar.splice(ar.length-4, 0, '0');
                        ar.splice(ar.length-4, 0, '0');
                    }
                    mavPacket = ar.join('');

                    var command = mavPacket.substr(base_offset, 4).toLowerCase();
                    base_offset += 4;
                    var command_result = mavPacket.substr(base_offset, 2).toLowerCase();
                    base_offset += 2;

                    if (!Object.prototype.hasOwnProperty.call(this.result_command_ack, sys_id)) {
                        this.result_command_ack = {};
                        this.result_command_ack[sys_id] = {};
                    }

                    this.result_command_ack[sys_id].command = Buffer.from(command, 'hex').readUInt16LE(0);
                    this.result_command_ack[sys_id].command_result = Buffer.from(command_result, 'hex').readUInt8(0);

                    console.log(this.name, 'MAVLINK_MSG_ID_COMMAND_ACK', '-', this.result_command_ack[sys_id].command, this.MAV_CMD_ACK_CODE[this.result_command_ack[sys_id].command_result]);

                    // fd 01 00 00 27 69 01 4d0000 0b d24b
                    // fd 01 00 00 27 69 01 4d0000 0b d24b
                    // fd 01 00 00 42 69 01 4d0000 0b b20f
                    // fd 01 00 00 42 69 01 4d0000 0b b20f
                    // fd 17 00 00 00 ff be 170000 00 00 0040690157505f5941575f4245484156 494f5200 01 319e
                    // fd 06 00 00 0f ff be 0b0000 11 00 00 00 69 59 3f3b

                }
                else if (msg_id === mavlink.MAVLINK_MSG_ID_ADSB_VEHICLE) {
                    let my_len = 38;
                    let ar = mavPacket.split('');
                    for (let i = 0; i < (my_len - msg_len); i++) {
                        ar.splice(ar.length-4, 0, '0');
                        ar.splice(ar.length-4, 0, '0');
                    }
                    mavPacket = ar.join('');

                    var ICAO_address = mavPacket.substr(base_offset, 8).toLowerCase();
                    base_offset += 8;
                    var adsb_lat = mavPacket.substr(base_offset, 8).toLowerCase();
                    base_offset += 8;
                    var adsb_lon = mavPacket.substr(base_offset, 8).toLowerCase();
                    base_offset += 8;
                    var attitude = mavPacket.substr(base_offset, 8).toLowerCase();
                    base_offset += 8;
                    // var attitude_type = mavPacket.substr(base_offset, 2).toLowerCase();
                    // base_offset += 2;
                    var heading = mavPacket.substr(base_offset, 4).toLowerCase();
                    base_offset += 4;
                    var hor_velocity = mavPacket.substr(base_offset, 4).toLowerCase();
                    base_offset += 4;
                    var ver_velocity = mavPacket.substr(base_offset, 4).toLowerCase();
                    base_offset += 4;
                    var flag = mavPacket.substr(base_offset, 4).toLowerCase();
                    base_offset += 4;
                    var squawk = mavPacket.substr(base_offset, 4).toLowerCase();
                    base_offset += 4;
                    var callsign = mavPacket.substr(base_offset, 20).toLowerCase();
                    base_offset += 20;
                    var emitter_type = mavPacket.substr(base_offset, 2).toLowerCase();
                    base_offset += 2;
                    var tslc = mavPacket.substr(base_offset, 2).toLowerCase();

                    this.adsb.ICAO_address = Buffer.from(ICAO_address, 'hex').readUInt32LE(0).toString(16).toUpperCase();
                    this.adsb.lat = Buffer.from(adsb_lat, 'hex').readInt32LE(0);
                    this.adsb.lon = Buffer.from(adsb_lon, 'hex').readInt32LE(0);
                    this.adsb.attitude = Buffer.from(attitude, 'hex').readInt32LE(0);
                    this.adsb.heading = Buffer.from(heading, 'hex').readUInt16LE(0);
                    this.adsb.hor_velocity = Buffer.from(hor_velocity, 'hex').readUInt16LE(0);
                    this.adsb.ver_velocity = Buffer.from(ver_velocity, 'hex').readInt16LE(0);
                    this.adsb.speed = Math.sqrt(Math.pow(this.adsb.hor_velocity, 2) + Math.pow(this.adsb.ver_velocity, 2))
                    this.adsb.callsign = Buffer.from(callsign, "hex").toString('ASCII').toUpperCase();
                    this.adsb.emitter_type = Buffer.from(emitter_type, 'hex').readUInt8(0);
                    this.adsb.tslc = Buffer.from(tslc, 'hex').readInt8(0);
                    this.adsb.flag = Buffer.from(flag, 'hex').readUInt16LE(0);
                    this.adsb.squawk = Buffer.from(squawk, 'hex').readUInt16LE(0);

                    if (this.ADSB_Monitor_Flag) {
                        let _payload = {};
                        _payload.ICAO_address = this.adsb.ICAO_address;
                        _payload.lat = (this.adsb.lat / 10000000);
                        _payload.lng = (this.adsb.lon / 10000000);
                        _payload.alt = Math.round(this.adsb.attitude / 1000);
                        _payload.heading = Math.round(this.adsb.heading / 100);
                        _payload.speed = Math.round(this.adsb.speed / 100);
                        _payload.callsign = (this.adsb.callsign.replace(/\0/g, '').replace('  ', ''));
                        _payload.squawk = this.adsb.squawk;

                        EventBus.$emit('updatePlaneMarker', JSON.parse(JSON.stringify(_payload)));
                    } else {
                        EventBus.$emit('clearAllPlaneMarker', '');
                    }
                }
                mavPacket = null;
            }
            catch (e) {
                console.log(msg_id, e.message);
            }
        },

        getParentSubscription(sortie_name, callback) {

            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'get',
                //url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579' + this.missionLteUrl + '/' + sortie_name,
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579' + this.missionLteUrl,
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue'
                }
            }).then(
                function (res) {
                    callback(res);
                }
            ).catch(
                function (err) {
                    console.log(err.message);
                    callback(err);
                });
        },

        getSubscription(sortie_name, callback) {
            const subscription_name = 'sub_' + this.name + '_of_gcs';
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'get',
                //url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579' + this.missionLteUrl + '/' + sortie_name + '/' + subscription_name,
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579' + this.missionLteUrl + '/' + subscription_name,
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue'
                }
            }).then(
                function (res) {
                    callback(res);
                }
            ).catch(
                function (err) {
                    console.log(err.message);
                    callback(err);
                }
            );
        },

        deleteSubscription(sortie_name, callback) {
            const subscription_name = 'sub_' + this.name + '_of_gcs';
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'delete',
                //url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579' + this.missionLteUrl + '/' + sortie_name + '/' + subscription_name,
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579' + this.missionLteUrl + '/' + subscription_name,
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'Superman'
                }
            }).then(
                function (res) {
                    callback(res);
                }
            ).catch(
                function (err) {
                    //console.log(err.message);
                    callback(err);
                });
        },

        createSubscription(sortie_name, callback) {
            const subscription_name = 'sub_' + this.name + '_of_gcs';
            let nu = 'mqtt://' + this.$store.state.VUE_APP_MOBIUS_HOST + '/' + this.name + '?ct=json';

            axios({
                validateStatus: (status) => {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'post',
                //url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579' + this.missionLteUrl + '/' + sortie_name,
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579' + this.missionLteUrl,
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json;ty=23'
                },
                data: {
                    'm2m:sub': {
                        rn: subscription_name,
                        enc: {
                            net: [1, 2, 3, 4]
                        },
                        nct: 2,
                        nu: [nu],
                        exc: 0
                    }
                }
            }).then(
                (res) => {
                    callback(res);
                }
            ).catch(
                (err) => {
                    callback(err);
                }
            );
        },

        getDroneMissionInfo(callback) {

            axios({
                method: 'get',
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/MUV/approval/' + this.id + '/la',
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue'
                }
            }).then(
                (res) => {
                    console.log(res.data[Object.keys(res.data)[0]].con);
                    // console.log(res);
                    // console.log('headers', res.headers)

                    // EventBus.$emit('push-approval-' + drone.name, res.data[Object.keys(res.data)[0]].con);

                    let con = res.data[Object.keys(res.data)[0]].con;
                    if (Object.prototype.hasOwnProperty.call(con, 'mission')) {
                        for (let msw_name in con['mission']) {
                            if (Object.prototype.hasOwnProperty.call(con['mission'], msw_name)) {
                                for (let container in con['mission'][msw_name]) {
                                    if (Object.prototype.hasOwnProperty.call(con['mission'][msw_name], container)) {
                                        for (let idx in con['mission'][msw_name][container]) {
                                            if (Object.prototype.hasOwnProperty.call(con['mission'][msw_name][container], idx)) {
                                                if (con['mission'][msw_name][container][idx] === 'LTE') {
                                                    this.missionLteUrl = '/Mobius/' + con.gcs + '/Mission_Data/' + this.name + '/' + msw_name + '/' + con['mission'][msw_name][container][idx];
                                                    console.log(this.missionLteUrl);

                                                    callback(res.status);
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            ).catch(
                (err) => {
                    console.log(err.message)
                    callback(err.message)
                }
            )
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

        doPublishBroadcast() {
            let watchingPayload = {};
            watchingPayload.watchingMission = this.watchingMission;
            watchingPayload.watchingInitDist = this.watchingInitDist;
            watchingPayload.watchingMissionStatus = this.watchingMissionStatus;

            if(watchingPayload.watchingMission === 'goto') {
                watchingPayload.targetLat = this.$store.state.drone_infos[this.name].targetLat;
                watchingPayload.targetLng = this.$store.state.drone_infos[this.name].targetLng;
                watchingPayload.targetAlt = this.$store.state.drone_infos[this.name].targetAlt;

                watchingPayload.missionLines = this.$store.state.missionLines;
                watchingPayload.missionCircles = this.$store.state.missionCircles;
            }
            else if(watchingPayload.watchingMission === 'goto-circle') {
                watchingPayload.targetLat = this.$store.state.drone_infos[this.name].targetLat;
                watchingPayload.targetLng = this.$store.state.drone_infos[this.name].targetLng;
                watchingPayload.targetAlt = this.$store.state.drone_infos[this.name].targetAlt;

                watchingPayload.targetRadius = this.droneStatus.radius;
                watchingPayload.targetHeading = this.droneStatus.initHeading;

                watchingPayload.missionCircles = this.$store.state.missionCircles;
                watchingPayload.missionLines = this.$store.state.missionLines;
            }
            else if(watchingPayload.watchingMission === 'goto-alt') {
                watchingPayload.targetAlt = this.$store.state.drone_infos[this.name].targetAlt;
            }
            else if(watchingPayload.watchingMission === 'takeoff') {
                watchingPayload.homePosition = this.$store.state.drone_infos[this.name].home_position;
            }

            console.log('broadcast_topic', this.broadcast_topic, '-', JSON.stringify(watchingPayload));
            if (this.$store.state.client.connected) {
                this.$store.state.client.publish(this.broadcast_topic, JSON.stringify(watchingPayload), 0, error => {
                    if (error) {
                        console.log('Publish Broadcast error', error)
                    }
                });
            }

            this.$store.state.didIPublish = true;
        },

        checkMissionLteUrl() {
            this.getDroneMissionInfo(() => {
                if(this.missionLteUrl !== '') {
                    this.createSubscription(this.curSortieName, (res) => {
                        console.log('createSubscription', res);

                        if (res.status === 201 || res.status === 409) {

                            // this.doSubscribe(this.missionTopic);
                            //
                            // this.droneSubscribeSuccess[this.missionTopic] = true;
                            // console.log('Subscribe mission topic to ', this.missionTopic);

                            EventBus.$emit('do-subscribe', this.missionTopic);

                            this.missionLteUrlFlag = true;
                        }
                    });
                }
            });
        },

        clearTrackingLines() {
            this.$store.state.trackingLines[this.name] = null;
            delete this.$store.state.trackingLines[this.name];
            this.$store.state.trackingLines[this.name] = [];

            let temp = JSON.parse(JSON.stringify(this.$store.state.trackingLines));
            this.$store.state.trackingLines = null;
            this.$store.state.trackingLines = JSON.parse(JSON.stringify(temp));

            localStorage.setItem('trackingLines-' + this.name, JSON.stringify(this.$store.state.trackingLines[this.name]));
        },

        gotoHomePosition() {
            // this.$store.state.drone_infos[this.name].home_position = null;
            // delete this.$store.state.drone_infos[this.name].home_position;
            // this.$store.state.drone_infos[this.name].home_position = {
            //     lat: (this.gpi.lat / 10000000),
            //     lng: (this.gpi.lon / 10000000)
            // };

            let strPos = this.$store.state.drone_infos[this.name].home_position.lat + ':' +
                this.$store.state.drone_infos[this.name].home_position.lng + ':' +
                '20:5:50:5:16:1:0';

            console.log('gotoHomePosition-', strPos);
            this.$store.state.drone_infos[this.name].gotoType = 'goto';
            this.$store.state.drone_infos[this.name].targetSpeed = 5;
            this.$store.state.drone_infos[this.name].targetAlt = 30;
            EventBus.$emit('command-set-goto-' + this.name, strPos);
        },

        returnToLaunch() {
            EventBus.$emit('command-set-rtl-' + this.name, 5);
        },

        pauseCurPosition() {
            EventBus.$emit('command-set-stop-' + this.name);
        },

        reservedQuick() {
            // console.log('send_set_mission_current - 5');
            // setTimeout(this.send_set_mission_current_command, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, 5);
        },

        showYawAngleDialog() {
            this.yawAngleDialog = true;
        },

        rotateYawAngle() {
            let curLat = (this.gpi.lat / 10000000);
            let curLng = (this.gpi.lon / 10000000);
            let curAlt = (this.gpi.relative_alt / 1000);
            let roiPoint = get_point_dist(curLat, curLng, 1, this.yawAngle);

            console.log('rotateYawAngle', roiPoint);

            let position_selection = roiPoint.lat + ':' + roiPoint.lon + ':' + curAlt + ':5:100:5:16:1:0';
            this.$store.state.drone_infos[this.name].targetAlt = curAlt;

            EventBus.$emit('command-set-roi-' + this.name, position_selection);

            this.yawAngleDialog = false;
        },
    },

    created() {
        this.positions = []
        for (let idx in this.$store.state.tempMarkers[this.name]) {
            if (Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers[this.name], idx)) {
                let str = this.$store.state.tempMarkers[this.name][idx].lat + ':' +
                    this.$store.state.tempMarkers[this.name][idx].lng + ':' +
                    this.$store.state.tempMarkers[this.name][idx].alt + ':' +
                    this.$store.state.tempMarkers[this.name][idx].speed + ':' +
                    this.$store.state.tempMarkers[this.name][idx].radius + ':' +
                    this.$store.state.tempMarkers[this.name][idx].turningSpeed + ':' +
                    this.$store.state.tempMarkers[this.name][idx].targetMavCmd + ':' +
                    this.$store.state.tempMarkers[this.name][idx].targetStayTime + ':' +
                    this.$store.state.tempMarkers[this.name][idx].elevation;

                let diffAlt = this.$store.state.tempMarkers[this.name][idx].alt - this.$store.state.tempMarkers[this.name][idx].elevation;
                if(diffAlt > 5) {
                    this.evalAltColor[idx] = 'green';
                }
                else if(diffAlt > 0) {
                    this.evalAltColor[idx] = 'yellow';
                }
                else {
                    this.evalAltColor[idx] = 'red';
                }

                this.positions.push(str);
            }
        }

        var count = 0;
        var tidRcParam = setInterval(() => {
            if(count === 0) {
                if(!Object.prototype.hasOwnProperty.call(this.rc1, 'min')) {
                    this.send_param_get_command(this.name, this.target_pub_topic, this.sys_id, 'RC1_MIN');
                }
                count++;
            }

            else if(count === 1) {
                if (!Object.prototype.hasOwnProperty.call(this.rc1, 'max')) {
                    this.send_param_get_command(this.name, this.target_pub_topic, this.sys_id, 'RC1_MAX');
                }
                count++;
            }
            else if(count === 2) {
                if (!Object.prototype.hasOwnProperty.call(this.rc1, 'trim')) {
                    this.send_param_get_command(this.name, this.target_pub_topic, this.sys_id, 'RC1_TRIM');
                }
                count++;
            }
            else if(count === 3) {
                if(!Object.prototype.hasOwnProperty.call(this.rc2, 'min')) {
                    this.send_param_get_command(this.name, this.target_pub_topic, this.sys_id, 'RC2_MIN');
                }
                count++;
            }
            else if(count === 4) {
                if(!Object.prototype.hasOwnProperty.call(this.rc2, 'max')) {
                    this.send_param_get_command(this.name, this.target_pub_topic, this.sys_id, 'RC2_MAX');
                }
                count++;
            }
            else if(count === 5) {
                if(!Object.prototype.hasOwnProperty.call(this.rc2, 'trim')) {
                    this.send_param_get_command(this.name, this.target_pub_topic, this.sys_id, 'RC2_TRIM');
                }
                count++;
            }
            else if(count === 6) {
                if(!Object.prototype.hasOwnProperty.call(this.rc3, 'min')) {
                    this.send_param_get_command(this.name, this.target_pub_topic, this.sys_id, 'RC3_MIN');
                }
                count++;
            }
            else if(count === 7) {
                if(!Object.prototype.hasOwnProperty.call(this.rc3, 'max')) {
                    this.send_param_get_command(this.name, this.target_pub_topic, this.sys_id, 'RC3_MAX');
                }
                count++;
            }
            else if(count === 8) {
                if(!Object.prototype.hasOwnProperty.call(this.rc3, 'trim')) {
                    this.send_param_get_command(this.name, this.target_pub_topic, this.sys_id, 'RC3_TRIM');
                }
                count++;
            }
            else if(count === 9) {
                if(!Object.prototype.hasOwnProperty.call(this.rc4, 'min')) {
                    this.send_param_get_command(this.name, this.target_pub_topic, this.sys_id, 'RC4_MIN');
                }
                count++;
            }
            else if(count === 10) {
                if(!Object.prototype.hasOwnProperty.call(this.rc4, 'max')) {
                    this.send_param_get_command(this.name, this.target_pub_topic, this.sys_id, 'RC4_MAX');
                }
                count++;
            }
            else if(count === 11) {
                if(!Object.prototype.hasOwnProperty.call(this.rc4, 'trim')) {
                    this.send_param_get_command(this.name, this.target_pub_topic, this.sys_id, 'RC4_TRIM');
                }
                count++;
            }
            else if(count === 12) {
                if(!Object.prototype.hasOwnProperty.call(this.params, 'wpYawBehavior')) {
                    this.send_param_get_command(this.name, this.target_pub_topic, this.sys_id, 'WP_YAW_BEHAVIOR');
                }
                count++;
            }
            else if(count === 13) {
                if(!Object.prototype.hasOwnProperty.call(this.params, 'atcSlewYaw')) {
                    this.send_param_get_command(this.name, this.target_pub_topic, this.sys_id, 'ATC_SLEW_YAW');
                }
                count++;
            }
            else if(count === 14) {
                if(!Object.prototype.hasOwnProperty.call(this.params, 'wpnavSpeedUp')) {
                    this.send_param_get_command(this.name, this.target_pub_topic, this.sys_id, 'WPNAV_SPEED_UP');
                }
                count++;
            }
            else if(count === 15) {
                if(!Object.prototype.hasOwnProperty.call(this.params, 'wpnavSpeedDn')) {
                    this.send_param_get_command(this.name, this.target_pub_topic, this.sys_id, 'WPNAV_SPEED_DN');
                }
                count++;
            }
            else if(count === 16) {
                if(!Object.prototype.hasOwnProperty.call(this.params, 'rtlAlt')) {
                    this.send_param_get_command(this.name, this.target_pub_topic, this.sys_id, 'RTL_ALT');
                }
                count++;
            }
            else if(count === 17) {
                if(!Object.prototype.hasOwnProperty.call(this.params, 'wpnavRadius')) {
                    this.send_param_get_command(this.name, this.target_pub_topic, this.sys_id, 'WPNAV_RADIUS');
                }
                count++;
            }
            else if(count === 18) {
                if(!Object.prototype.hasOwnProperty.call(this.params, 'wpnavAccel')) {
                    this.send_param_get_command(this.name, this.target_pub_topic, this.sys_id, 'WPNAV_ACCEL');
                }
                count++;
            }
            else {
                clearInterval(tidRcParam);
            }
        }, 100);

        // setInterval(() => {
        //     if(this.flagReceiving) {
        //         if(this.pre_lat !== this.gpi.lat || this.pre_lng !== this.gpi.lon || this.pre_heading !== this.heading) {
        //             let _payload = {};
        //             _payload.name = this.name;
        //             _payload.lat = (this.gpi.lat / 10000000);
        //             _payload.lng = (this.gpi.lon / 10000000);
        //             _payload.heading = this.heading;
        //             this.$store.commit('setFlyingDroneInfo', JSON.parse(JSON.stringify(_payload)));
        //
        //             EventBus.$emit('updateDroneMarker', JSON.parse(JSON.stringify(_payload)));
        //             _payload = null;
        //
        //             this.pre_lat = this.gpi.lat;
        //             this.pre_lng = this.gpi.lon;
        //             this.pre_heading = this.heading;
        //
        //             if(Object.prototype.hasOwnProperty.call(this.$store.state.curDronePositions, this.name)) {
        //                 this.$store.state.curDronePositions[this.name].lat = this.gpi.lat;
        //                 this.$store.state.curDronePositions[this.name].lng = this.gpi.lon;
        //                 this.$store.state.curDronePositions[this.name].alt = this.gpi.alt;
        //             }
        //         }
        //
        //         if(this.iconArming === 'mdi-airplane') {
        //             if(!Object.prototype.hasOwnProperty.call(this.$store.state.curDronePositions, this.name)) {
        //                 this.$store.state.curDronePositions[this.name] = {};
        //                 this.$store.state.curDronePositions[this.name].brake = false;
        //
        //             }
        //         }
        //         else {
        //             if(Object.prototype.hasOwnProperty.call(this.$store.state.curDronePositions, this.name)) {
        //                 this.$store.state.curDronePositions[this.name] = null;
        //                 delete this.$store.state.curDronePositions[this.name];
        //             }
        //         }
        //     }
        // }, 500);

        this.timer_id = setInterval(() => {
            this.bpm = this.recv_counter;
            this.recv_counter = 1;

            //this.info.headingDirection = parseInt(Math.random() * 359);
            //this.info.airSpeed = parseInt(Math.random() * 20);
            //this.info.altitude = parseInt(Math.random() * 150);
            //this.info.anglePitch = -90 + parseInt(Math.random() * 180);
            //this.info.bankAngle = -90 + parseInt(Math.random() * 180);

        }, 3000);


        // if (!Object.prototype.hasOwnProperty.call(this.$store.state.selectedDrone, this.name)) {
        //     this.$store.state.selectedDrone[this.name] = false;
        // }

        //this.targeted = this.$store.state.selectedDrone[this.name];
        this.targeted = this.$store.state.drone_infos[this.name].targeted;

        // EventBus.$on('push-airspeed-' + this.name, (payload) => {
        //     this.airspeed = payload.airspeed;
        // });
        //
        // EventBus.$on('push-attitude-' + this.name, (payload) => {
        //     this.roll = payload.roll;
        //     this.pitch = payload.pitch
        // });
        //
        // EventBus.$on('push-heading-' + this.name, (payload) => {
        //     this.heading = payload.heading;
        // });

        EventBus.$on('setWpYawBehavior-' + this.name, (param_value) => {
            let pre_custom_mode = this.curMode;

            let target_mode = 'LOITER';
            if(this.fcType === 'px4') {
                target_mode = 'AUTO_LOITER';
            }

            setTimeout((name, target_pub_topic, sys_id, mode) => {
                console.log('send_set_mode_command', mode);
                this.send_set_mode_command(name, target_pub_topic, sys_id, mode);
            }, parseInt(Math.random() * 2), this.name, this.target_pub_topic, this.sys_id, target_mode);

            setTimeout((name, target_pub_topic, sys_id, param_value) => {
                this.send_wp_yaw_behavior_param_set_command(name, target_pub_topic, sys_id, param_value);
            }, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, param_value);

            setTimeout((name, target_pub_topic, sys_id, mode) => {
                console.log('send_set_mode_command', mode);
                this.send_set_mode_command(name, target_pub_topic, sys_id, mode);
            }, parseInt(50 + (Math.random() * 2)), this.name, this.target_pub_topic, this.sys_id, pre_custom_mode);
        });

        EventBus.$on('ClickADSBMonitor', (flag) => {
            this.ADSB_Monitor_Flag = flag;
        });

        EventBus.$on('do-drone-selected' + this.name, (value_selected) => {
            console.log(value_selected);
            this.targeted = value_selected;
            this.$store.state.drone_infos[this.name].targeted = value_selected;
            // this.$store.state.selectedDrone[this.name] = value_selected;
        });

        EventBus.$on('do-target-selected' + this.name, (payload) => {
            if (payload.value) {
                this.selectedItem = payload.pIndex;
            }
            else {
                this.selectedItem = -1;
            }
        });

        EventBus.$on('initialize-' + this.name, (payload) => {
            this.flagReceiving = false;

            console.log('DroneInfo-initialize-' + this.name, payload);

            this.pre_lat = payload.lat;
            this.pre_lng = payload.lng;
            this.pre_heading = payload.heading;

            payload = null;
        });

        EventBus.$on('command-set-pwms-mission-' + this.name, (mission_pwms) => {
            let mission_pwms_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/Mission_Data/' + this.name + '/msw_remote_gimbal/REMOTE';

            this.doPublish(mission_pwms_topic, JSON.stringify(mission_pwms));

            console.log('command-set-pwms-mission-' + this.name, mission_pwms.num, mission_pwms.value);

            //this.watchingMission = 'pwms-mission';
        });

        EventBus.$on('command-set-params-' + this.name, (params) => {
            if (Object.prototype.hasOwnProperty.call(params, 'wpYawBehavior')) {
                if (params.wpYawBehavior[this.name] !== undefined) {
                    let param_value = parseInt(params.wpYawBehavior[this.name].charAt(0));

                    let pre_custom_mode = this.curMode;

                    let target_mode = 'LOITER';
                    if(this.fcType === 'px4') {
                        target_mode = 'AUTO_LOITER';
                    }

                    setTimeout((name, target_pub_topic, sys_id, mode) => {
                        console.log('send_set_mode_command', mode);
                        this.send_set_mode_command(name, target_pub_topic, sys_id, mode);
                    }, parseInt(Math.random() * 2), this.name, this.target_pub_topic, this.sys_id, target_mode);

                    setTimeout((name, target_pub_topic, sys_id, param_value) => {
                        this.send_wp_yaw_behavior_param_set_command(name, target_pub_topic, sys_id, param_value);
                    }, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, param_value);

                    setTimeout((name, target_pub_topic, sys_id, mode) => {
                        console.log('send_set_mode_command', mode);
                        this.send_set_mode_command(name, target_pub_topic, sys_id, mode);
                    }, parseInt(50 + (Math.random() * 2)), this.name, this.target_pub_topic, this.sys_id, pre_custom_mode);
                }
            }

            if (Object.prototype.hasOwnProperty.call(params, 'atcSlewYaw')) {
                if (params.atcSlewYaw[this.name] !== undefined) {
                    let param_value = parseFloat(params.atcSlewYaw[this.name]);

                    setTimeout((name, target_pub_topic, sys_id, param_value) => {
                        this.send_atc_slew_yaw_param_set_command(name, target_pub_topic, sys_id, param_value);

                    }, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, param_value);
                }
            }

            if (Object.prototype.hasOwnProperty.call(params, 'wpnavSpeedUp')) {
                if (params.wpnavSpeedUp[this.name] !== undefined) {
                    let param_value = parseFloat(params.wpnavSpeedUp[this.name]);

                    setTimeout((name, target_pub_topic, sys_id, param_value) => {
                        this.send_wpnav_speed_up_param_set_command(name, target_pub_topic, sys_id, param_value);

                    }, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, param_value);
                }
            }

            if (Object.prototype.hasOwnProperty.call(params, 'wpnavSpeedDn')) {
                if (params.wpnavSpeedDn[this.name] !== undefined) {
                    let param_value = parseFloat(params.wpnavSpeedDn[this.name]);

                    setTimeout((name, target_pub_topic, sys_id, param_value) => {
                        this.send_wpnav_speed_dn_param_set_command(name, target_pub_topic, sys_id, param_value);

                    }, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, param_value);
                }
            }

            if (Object.prototype.hasOwnProperty.call(params, 'rtlAlt')) {
                if (params.rtlAlt[this.name] !== undefined) {
                    let param_value = parseFloat(params.rtlAlt[this.name]);

                    setTimeout((name, target_pub_topic, sys_id, param_value) => {
                        this.send_rtl_alt_param_set_command(name, target_pub_topic, sys_id, param_value);

                    }, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, param_value);
                }
            }

            if (Object.prototype.hasOwnProperty.call(params, 'wpnavRadius')) {
                if (params.wpnavRadius[this.name] !== undefined) {
                    let param_value = parseFloat(params.wpnavRadius[this.name]);

                    setTimeout((name, target_pub_topic, sys_id, param_value) => {
                        this.send_wpnav_radius_param_set_command(name, target_pub_topic, sys_id, param_value);

                    }, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, param_value);
                }
            }

            if (Object.prototype.hasOwnProperty.call(params, 'wpnavAccel')) {
                if (params.wpnavAccel[this.name] !== undefined) {
                    let param_value = parseFloat(params.wpnavAccel[this.name]);

                    setTimeout((name, target_pub_topic, sys_id, param_value) => {
                        this.send_wpnav_accel_param_set_command(name, target_pub_topic, sys_id, param_value);

                    }, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, param_value);
                }
            }

            //this.watchingMission = 'params';
        });

        EventBus.$on('command-set-disarm-' + this.name, () => {
            console.log('send_disarm_command ', this.name);
            setTimeout(this.send_arm_command, parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, 0, 0);

            //this.watchingMission = 'disarm';
        });

        EventBus.$on('command-set-auto_goto-' + this.name, (payload) => {
            let start_idx = payload.start_index;
            let end_idx = payload.end_index;
            let delay = this.$store.state.drone_infos[this.name].autoDelay;
            let auto_speed = this.$store.state.drone_infos[this.name].autoSpeed;

            this.send_wpnav_speed_param_set_command(this.name, this.target_pub_topic, this.sys_id, auto_speed);

            let target_mode = 'LOITER';
            if (this.fcType === 'px4') {
                target_mode = 'AUTO_LOITER';
            }

            setTimeout((name, target_pub_topic, sys_id, mode) => {
                console.log('send_set_mode_command', mode);
                this.send_set_mode_command(name, target_pub_topic, sys_id, mode);
            }, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, target_mode);

            let yaw_behavior = 0;
            if(this.$store.state.drone_infos[this.name].yawBehavior !== 'YAW고정') {
                yaw_behavior = 1;
            }

            setTimeout((name, target_pub_topic, sys_id, param_value) => {
                this.send_wp_yaw_behavior_param_set_command(name, target_pub_topic, sys_id, param_value);
            }, 15 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, yaw_behavior);

            target_mode = 'GUIDED';
            if(this.fcType === 'px4') {
                target_mode = 'AUTO_LOITER';
            }

            setTimeout((name, target_pub_topic, sys_id, mode) => {
                console.log('send_set_mode_command', mode);
                this.send_set_mode_command(name, target_pub_topic, sys_id, mode);
            }, 25 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, target_mode);

            var auto_goto_positions = payload.goto_positions.slice(start_idx, (end_idx + 1));
            let ele0 = (this.gpi.lat / 10000000).toString() + ':' + (this.gpi.lon / 10000000).toString() + ':' + (this.gpi.relative_alt / 1000).toString() + ':5:250:10:16:1';
            auto_goto_positions.unshift(ele0);

            setTimeout((name, target_pub_topic, sys_id, auto_goto_positions, start_idx, end_idx, delay, cur_idx) => {

                if (this.curArmStatus === 'DISARMED') {
                    this.$store.state.drone_infos[name].targetTakeoffAlt = auto_goto_positions[1].split(':')[2];
                    this.$store.state.drone_infos[name].takeoffDelay = 7;

                    let payload = {};
                    payload.targetTakeoffAlt = auto_goto_positions[1].split(':')[2];
                    payload.takeoffDelay = 7;

                    EventBus.$emit('command-set-takeoff-' + this.name, payload);
                }
                else {
                    this.watchingMission = 'takeoff-complete';
                    this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                }

                const checkMission = (name, target_pub_topic, sys_id, auto_goto_positions, start_idx, end_idx, delay, cur_idx) => {
                    if (this.$store.state.drone_infos[this.name].watchingMission === 'takeoff-complete') {
                        setTimeout(this.send_auto_command, 50, name, target_pub_topic, sys_id, auto_goto_positions, start_idx, end_idx, delay, cur_idx);

                        this.watchingMission = 'auto-goto';
                        this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                        this.watchingMissionStatus = 0;

                        this.postDroneInfos((res) => {
                            console.log('postDroneInfos - auto-goto', res);
                        });

                        this.doPublishBroadcast();
                    }
                    else {
                        setTimeout(checkMission, 250, name, target_pub_topic, sys_id, auto_goto_positions, start_idx, end_idx, delay, cur_idx);
                    }
                }

                checkMission(name, target_pub_topic, sys_id, auto_goto_positions, start_idx, end_idx, delay, cur_idx);
            }, 35 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, auto_goto_positions, start_idx, end_idx, delay, start_idx);
        });

        EventBus.$on('command-set-pwms-' + this.name, (pwms) => {
            if (Object.prototype.hasOwnProperty.call(pwms, 'ch9')) {
                if (pwms.ch9[this.name] !== undefined) {
                    let pwm_value = parseInt(pwms.ch9[this.name]);

                    setTimeout((name, target_pub_topic, sys_id, pwm_value) => {
                        this.send_set_servo_command(name, target_pub_topic, sys_id, 9, pwm_value);

                    }, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, pwm_value);
                }
            }

            if (Object.prototype.hasOwnProperty.call(pwms, 'ch10')) {
                if (pwms.ch10[this.name] !== undefined) {
                    let pwm_value = parseInt(pwms.ch10[this.name]);

                    setTimeout((name, target_pub_topic, sys_id, pwm_value) => {
                        this.send_set_servo_command(name, target_pub_topic, sys_id, 10, pwm_value);

                    }, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, pwm_value);
                }
            }

            if (Object.prototype.hasOwnProperty.call(pwms, 'ch11')) {
                if (pwms.ch11[this.name] !== undefined) {
                    let pwm_value = parseInt(pwms.ch11[this.name]);

                    setTimeout((name, target_pub_topic, sys_id, pwm_value) => {
                        this.send_set_servo_command(name, target_pub_topic, sys_id, 11, pwm_value);

                    }, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, pwm_value);
                }
            }

            if (Object.prototype.hasOwnProperty.call(pwms, 'ch12')) {
                if (pwms.ch12[this.name] !== undefined) {
                    let pwm_value = parseInt(pwms.ch12[this.name]);

                    setTimeout((name, target_pub_topic, sys_id, pwm_value) => {
                        this.send_set_servo_command(name, target_pub_topic, sys_id, 12, pwm_value);

                    }, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, pwm_value);
                }
            }

            //this.watchingMission = 'pwms';
        });

        EventBus.$on('command-set-roi-' + this.name, (position) => {
            let target_mode = 'GUIDED';
            if(this.fcType === 'px4') {
                target_mode = 'AUTO_LOITER';
            }
            setTimeout(this.send_set_mode_command, parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, target_mode);

            var arr_cur_goto_position = position.split(':');
            var lat = parseFloat(arr_cur_goto_position[0]);
            var lng = parseFloat(arr_cur_goto_position[1]);
            let alt = parseFloat(arr_cur_goto_position[2]);

            console.log('send_set_roi_command - lat: ', lat, ', lng: ', lng, ', alt: ', alt);
            setTimeout(this.send_set_roi_command, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, lat, lng, alt);
        });

        EventBus.$on('command-set-rtl-' + this.name, (rtl_speed) => {
            setTimeout((name, target_pub_topic, sys_id, rtl_speed) => {
                this.send_rtl_speed_param_set_command(name, target_pub_topic, sys_id, rtl_speed);

                setTimeout((name, target_pub_topic, sys_id) => {
                    this.send_rtl_command(name, target_pub_topic, sys_id);

                    this.watchingMission = 'rtl';
                    this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                    this.watchingInitDist = this.valueDistance;

                    this.doPublishBroadcast();

                }, 5 + parseInt(Math.random() * 5), name, target_pub_topic, sys_id);
            }, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, rtl_speed);
        });

        EventBus.$on('command-set-land-' + this.name, () => {
            setTimeout(this.send_land_command, parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id);

            this.watchingMission = 'land';
            this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
            this.watchingInitDist = Math.abs(0 - parseFloat((this.gpi.relative_alt / 1000).toFixed(1)));
            this.watchingMissionStatus = 0;

            if(this.watchingInitDist <= 0.1) {
                this.watchingMission = 'land-complete';
                this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                this.watchingMissionStatus = 100;
            }

            this.doPublishBroadcast();
        });

        EventBus.$on('command-set-stop-' + this.name, () => {

            let target_mode = 'LOITER';
            if(this.fcType === 'px4') {
                target_mode = 'AUTO_LOITER';
            }
            setTimeout(this.send_set_mode_command, 0, this.name, this.target_pub_topic, this.sys_id, target_mode);

            //this.watchingMission = 'stop';
        });

        EventBus.$on('command-set-change-speed-' + this.name, (target_speed) => {
            setTimeout(this.send_change_speed_command, parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, target_speed);

            //this.watchingMission = 'change-speed';
        });

        EventBus.$on('command-set-goto-circle-' + this.name, (position) => {
            var dir = (this.$store.state.drone_infos[this.name].circleType === '시계방향') ? (1) : (-1);
            var arr_cur_goto_position = position.split(':');
            var lat = parseFloat(arr_cur_goto_position[0]);
            var lon = parseFloat(arr_cur_goto_position[1]);
            var alt = parseFloat(arr_cur_goto_position[2]);
            //var speed = parseFloat(arr_cur_goto_position[3]);
            var radius = parseFloat(arr_cur_goto_position[4]);
            var circle_speed = parseFloat(arr_cur_goto_position[5]);
            var degree_speed = dir * parseInt((circle_speed / radius) * (180 / 3.14), 10);

            setTimeout((name, target_pub_topic, sys_id, lat, lon, alt, radius, degree_speed) => {
                this.send_circle_radius_param_set_command(name, target_pub_topic, sys_id, radius);

                setTimeout((name, target_pub_topic, sys_id, lat, lon, alt, radius, degree_speed) => {
                    this.send_circle_rate_param_set_command(name, target_pub_topic, sys_id, degree_speed);

                    setTimeout((name, target_pub_topic, sys_id, lat, lon, alt, radius, degree_speed) => {
                        let target_mode = 'GUIDED';
                        if(this.fcType === 'px4') {
                            target_mode = 'AUTO_LOITER';
                        }
                        this.send_set_mode_command(name, target_pub_topic, sys_id, target_mode);

                        var auto_goto_positions = [];

                        let ele = (this.gpi.lat / 10000000).toString() + ':' + (this.gpi.lon / 10000000).toString() + ':' + (this.gpi.relative_alt / 1000).toString() + ':5:250:10:' + String(mavlink.MAV_CMD_NAV_WAYPOINT) + ':1';
                        auto_goto_positions.push(ele);

                        ele = lat.toString() + ':' + lon.toString() + ':' + alt.toString() + ':' + degree_speed + ':' + radius + ':10:' + String(mavlink.MAV_CMD_NAV_LOITER_TURNS)
                        auto_goto_positions.push(ele);

                        //console.log('auto_goto_positions', auto_goto_positions);

                        setTimeout(this.send_auto_command, 50, this.name, this.target_pub_topic, this.sys_id, auto_goto_positions, 0, 0, 1, 0);

                        delete this.$store.state.missionLines[name];
                        this.$store.state.missionCircles[name] = null;
                        delete this.$store.state.missionCircles[name];
                        this.$store.state.missionCircles[name] = {
                            lat: lat,
                            lng: lon,
                            radius: radius,
                            options: {
                                strokeColor: this.$store.state.drone_infos[this.name].color,
                                strokeOpacity: 1,
                                strokeWeight: 5,
                                fillOpacity: 0.1
                            }
                        };

                        this.$store.state.missionCircles = this.clone(this.$store.state.missionCircles);

                        console.log('send_goto_circle_command', this.$store.state.missionCircles);

                        let cur_lat = this.gpi.lat / 10000000;
                        let cur_lon = this.gpi.lon / 10000000;
                        let result1 = dfs_xy_conv('toXY', cur_lat, cur_lon);

                        var result2 = dfs_xy_conv('toXY', lat, lon);

                        this.$store.state.drone_infos[name].targetLat = lat;
                        this.$store.state.drone_infos[name].targetLng = lon;
                        this.$store.state.drone_infos[name].targetAlt = alt;


                        this.watchingMission = 'goto-circle';
                        this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                        this.watchingMissionStatus = 0;

                        let deg = (Math.atan2((result2.y - result1.y), (result2.x - result1.x)) * (180/3.14));
                        deg = 360-deg;
                        deg -= 90;
                        deg %= 360;

                        this.droneStatus.initHeading = (deg + 180) % 360;
                        this.droneStatus.radius = radius;

                        this.doPublishBroadcast();

                        // setTimeout((name, target_pub_topic, sys_id, lat, lon, alt, radius, degree_speed) => {
                        //     this.send_goto_circle_command(name, target_pub_topic, sys_id, lat, lon, alt, degree_speed, radius);
                        //
                        //     delete this.$store.state.missionLines[name];
                        //     this.$store.state.missionCircles[name] = null;
                        //     delete this.$store.state.missionCircles[name];
                        //     this.$store.state.missionCircles[name] = {
                        //         lat: lat,
                        //         lng: lon,
                        //         radius: radius,
                        //         options: {
                        //             strokeColor: this.$store.state.drone_infos[this.name].color,
                        //             strokeOpacity: 0.4,
                        //             strokeWeight: 5,
                        //             fillOpacity: 0.1
                        //         }
                        //     };
                        //
                        //     this.$store.state.missionCircles = this.clone(this.$store.state.missionCircles);
                        //
                        //     console.log('send_goto_circle_command', this.$store.state.missionCircles);
                        //
                        //     this.watchingMission = 'goto-circle';
                        //
                        // }, 5 + parseInt(Math.random() * 5), name, target_pub_topic, sys_id, lat, lon, alt, radius, degree_speed);
                    }, 5 + parseInt(Math.random() * 5), name, target_pub_topic, sys_id, lat, lon, alt, radius, degree_speed);
                }, 5 + parseInt(Math.random() * 5), name, target_pub_topic, sys_id, lat, lon, alt, radius, degree_speed);
            }, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, lat, lon, alt, radius, degree_speed);
        });

        EventBus.$on('command-set-goto-' + this.name, (position) => {

            let target_mode = 'LOITER';
            if (this.fcType === 'px4') {
                target_mode = 'AUTO_LOITER';
            }

            setTimeout((name, target_pub_topic, sys_id, mode) => {
                console.log('send_set_mode_command', mode);
                this.send_set_mode_command(name, target_pub_topic, sys_id, mode);
            }, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, target_mode);

            let yaw_behavior = 0;
            if(this.$store.state.drone_infos[this.name].yawBehavior !== 'YAW고정') {
                yaw_behavior = 1;
            }

            setTimeout((name, target_pub_topic, sys_id, param_value) => {
                this.send_wp_yaw_behavior_param_set_command(name, target_pub_topic, sys_id, param_value);
            }, 15 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, yaw_behavior);

            target_mode = 'GUIDED';
            if(this.fcType === 'px4') {
                target_mode = 'AUTO_LOITER';
            }

            setTimeout((name, target_pub_topic, sys_id, mode) => {
                console.log('send_set_mode_command', mode);
                this.send_set_mode_command(name, target_pub_topic, sys_id, mode);
            }, 25 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, target_mode);

            var arr_cur_goto_position = position.split(':');
            var lat = parseFloat(arr_cur_goto_position[0]);
            var lon = parseFloat(arr_cur_goto_position[1]);
            var alt = parseFloat(arr_cur_goto_position[2]);
            var speed = parseFloat(arr_cur_goto_position[3]);

            //this.$store.state.drone_infos[this.name].targetSpeed = speed;
            //var alt = this.$store.state.drone_infos[this.name].targetAlt;
            //var speed = this.$store.state.drone_infos[this.name].targetSpeed;

            delete this.$store.state.missionCircles[this.name];
            delete this.$store.state.missionLines[this.name];
            this.$store.state.missionLines[this.name] = {
                path: [],
                options: {
                    strokeColor: this.$store.state.drone_infos[this.name].color,
                    strokeOpacity: 1,
                    strokeWeight: 5
                }
            };

            this.$store.state.missionLines[this.name].path.push({
                lat: this.gpi.lat / 10000000,
                lng: this.gpi.lon / 10000000
            });
            this.$store.state.missionLines[this.name].path.push({lat: lat, lng: lon});

            this.$store.state.missionLines = this.clone(this.$store.state.missionLines)

            setTimeout((name, target_pub_topic, sys_id, lat, lon, alt, speed) => {

                if (this.$store.state.drone_infos[name].gotoType === '고도먼저') {
                    this.$store.state.drone_infos[name].targetAlt = alt;

                    console.log('send_goto_alt_command - alt: ', alt);
                    this.send_goto_alt_command(name, target_pub_topic, sys_id, alt);

                    this.watchingMission = 'goto-alt';
                    this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                    this.watchingInitDist = Math.abs(alt - parseFloat((this.gpi.relative_alt / 1000).toFixed(1)));
                    this.watchingMissionStatus = 0;

                    if(this.watchingInitDist <= 0.1) {
                        this.watchingMission = 'goto-alt-complete';
                        this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                        this.watchingMissionStatus = 100;
                    }

                    this.doPublishBroadcast();
                }
                else {
                    this.watchingMission = 'goto-alt-complete';
                    this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                }

                const checkMission = (interval, name, target_pub_topic, sys_id, lat, lon, alt, speed) => {
                    setTimeout(() => {
                        if (this.$store.state.drone_infos[this.name].watchingMission === 'goto-alt-complete') {
                            this.send_goto_command(name, target_pub_topic, sys_id, lat, lon, alt);
                            setTimeout((name, target_pub_topic, sys_id, speed) => {
                                this.send_change_speed_command(name, target_pub_topic, sys_id, speed);

                                delete this.$store.state.missionCircles[name];
                                delete this.$store.state.missionLines[name];
                                this.$store.state.missionLines[name] = {
                                    path: [],
                                    options: {
                                        strokeColor: this.$store.state.drone_infos[name].color,
                                        strokeOpacity: 1,
                                        strokeWeight: 5
                                    }
                                };

                                this.$store.state.missionLines[name].path.push({
                                    lat: this.gpi.lat / 10000000,
                                    lng: this.gpi.lon / 10000000
                                });
                                this.$store.state.missionLines[name].path.push({lat: lat, lng: lon});

                                this.$store.state.missionLines = this.clone(this.$store.state.missionLines);

                                let cur_lat = this.gpi.lat / 10000000;
                                let cur_lon = this.gpi.lon / 10000000;
                                let cur_alt = this.gpi.relative_alt / 1000;
                                let result1 = dfs_xy_conv('toXY', cur_lat, cur_lon);

                                let tar_lat = lat;
                                let tar_lon = lon;
                                let tar_alt = alt;
                                var result2 = dfs_xy_conv('toXY', tar_lat, tar_lon);

                                this.$store.state.drone_infos[name].targetLat = lat;
                                this.$store.state.drone_infos[name].targetLng = lon;
                                this.$store.state.drone_infos[name].targetAlt = alt;


                                this.watchingMission = 'goto';
                                this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                                this.watchingInitDist = parseFloat(Math.sqrt(Math.pow(result2.x - result1.x, 2) + Math.pow(result2.y - result1.y, 2) + Math.pow((tar_alt - cur_alt), 2)).toFixed(1));
                                this.watchingMissionStatus = 0;

                                if(this.watchingInitDist <= 0.1) {
                                    this.watchingMission = 'goto-complete';
                                    this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                                    this.watchingMissionStatus = 100;

                                    //this.setWpYawBehavior(1);
                                }

                                this.doPublishBroadcast();

                            }, 5 + parseInt(Math.random() * 5), name, target_pub_topic, sys_id, speed);
                        }
                        else if (this.$store.state.drone_infos[this.name].watchingMission === 'fail') {
                            console.log('command-set-goto-', name, ' fail');
                        }
                        else {
                            checkMission(250, name, target_pub_topic, sys_id, lat, lon, alt, speed);
                        }
                    }, interval, name, target_pub_topic, sys_id, lat, lon, alt, speed)
                }

                checkMission(5, name, target_pub_topic, sys_id, lat, lon, alt, speed);
            }, 35 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, lat, lon, alt, speed);
        });

        EventBus.$on('command-set-goto-alt-' + this.name, (_alt) => {
            let target_mode = 'GUIDED';
            if(this.fcType === 'px4') {
                target_mode = 'AUTO_LOITER';
            }
            setTimeout(this.send_set_mode_command, parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, target_mode);

            this.watchingMission = 'goto-alt';
            this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
            this.watchingInitDist = Math.abs(_alt - parseFloat((this.gpi.relative_alt / 1000).toFixed(1)));
            this.watchingMissionStatus = 0;

            if(this.watchingInitDist <= 0.1) {
                this.watchingMission = 'goto-alt-complete';
                this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                this.watchingMissionStatus = 100;
            }

            this.doPublishBroadcast();

            console.log('send_goto_alt_command - alt: ', _alt);
            setTimeout(this.send_goto_alt_command, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, _alt);
        });

        EventBus.$on('command-set-takeoff-' + this.name, (payload) => {
            if(this.curArmStatus === 'ARMED' && (this.gpi.alt / 1000).toFixed(1) > 1) {
                console.log("비행체가 이륙된 상태 입니다.");
            }
            else {
                let target_mode = 'ALT_HOLD';
                if(this.fcType === 'px4') {
                    target_mode = 'AUTO_LOITER';
                }
                setTimeout(this.send_set_mode_command, parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, target_mode);

                console.log('send_arm_command ', this.name);
                setTimeout(this.send_arm_command, parseInt(50 + Math.random() * 50), this.name, this.target_pub_topic, this.sys_id, 1, 0);

                let takeoffDelay = payload.takeoffDelay;
                let relativeAlt = payload.targetTakeoffAlt;
                let absoluteAlt = parseFloat((this.gpi.alt / 1000) + relativeAlt);

                let _alt = relativeAlt;
                if(this.fcType === 'px4') {
                    _alt = absoluteAlt;
                }

                //this.send_set_do_set_home(this.name, this.target_pub_topic, this.sys_id);
                setTimeout((name, target_pub_topic, sys_id, takeoff_alt) => {
                    if (this.curArmStatus === 'ARMED') {

                        target_mode = 'GUIDED';
                        if(this.fcType === 'px4') {
                            target_mode = 'AUTO_LOITER';
                        }
                        this.send_set_mode_command(name, target_pub_topic, sys_id, target_mode);

                        setTimeout((name, target_pub_topic, sys_id, takeoff_alt) => {
                            console.log('send_takeoff_command - alt - delay: ', relativeAlt, takeoffDelay);
                            this.send_takeoff_command(name, target_pub_topic, sys_id, takeoff_alt);

                            this.watchingMission = 'takeoff';
                            this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                            this.watchingInitDist = Math.abs(relativeAlt - parseFloat((this.gpi.relative_alt / 1000).toFixed(1)));
                            this.watchingMissionStatus = 0;

                            if(this.watchingInitDist <= 0.1) {
                                this.watchingMission = 'takeoff-complete';
                                this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                                this.watchingMissionStatus = 100;
                            }

                            this.doPublishBroadcast();

                        }, parseInt(Math.random() * 10), name, target_pub_topic, sys_id, takeoff_alt);


                        // var auto_goto_positions = [];
                        //
                        // let ele = (this.gpi.lat / 10000000).toString() + ':' + (this.gpi.lon / 10000000).toString() + ':' + (takeoff_alt).toString() + ':5:250:10:' + String(mavlink.MAV_CMD_NAV_TAKEOFF);
                        // auto_goto_positions.push(ele);
                        // ele = (this.gpi.lat / 10000000).toString() + ':' + (this.gpi.lon / 10000000).toString() + ':' + (takeoff_alt).toString() + ':5:250:10:' + String(mavlink.MAV_CMD_NAV_WAYPOINT);
                        // auto_goto_positions.push(ele);
                        //
                        // //console.log('auto_goto_positions', auto_goto_positions);
                        //
                        // setTimeout(this.send_auto_command, 50, this.name, this.target_pub_topic, this.sys_id, auto_goto_positions, 0, 0, 0, 0);
                        // this.watchingMission = 'auto-goto';
                    }
                    else {
                        console.log("시동이 걸리지 않았습니다.");
                    }
                }, parseInt(((takeoffDelay) * 1000) + Math.random() * 10), this.name, this.target_pub_topic, this.sys_id, _alt);
            }
        });

        EventBus.$on('command-set-mode-' + this.name, (selected_mode) => {
            setTimeout(this.send_set_mode_command, 1, this.name, this.target_pub_topic, this.sys_id, selected_mode);

            this.watchingMission = 'mode';
            this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
        });

        EventBus.$on('command-set-arm-' + this.name, () => {
            setTimeout((name, target_pub_topic, sys_id) => {
                let target_mode = 'ALT_HOLD';
                if(this.fcType === 'px4') {
                    target_mode = 'AUTO_LOITER';
                }
                this.send_set_mode_command(name, target_pub_topic, sys_id, target_mode);
                setTimeout((name, target_pub_topic, sys_id) => {
                    console.log('send_arm_command ', this.name);
                    this.send_arm_command(name, target_pub_topic, sys_id, 1, 0);
                    this.watchingMission = 'arm';
                    this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                }, parseInt(Math.random() * 5), name, target_pub_topic, sys_id);
            }, parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id);
        });

        EventBus.$on('on-message-handler-' + this.name, (payload) => {
            this.onMessageHandler(payload.topic, payload.message);
        });

        EventBus.$on('on-drone-message-handler-' + this.name, (payload) => {
            this.onDroneMessageHandler(payload.topic, payload.message);
        });

        EventBus.$on('do-positions-elevation-' + this.name, () => {
            for (let idx in this.$store.state.tempMarkers[this.name]) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers[this.name], idx)) {
                    let str = this.$store.state.tempMarkers[this.name][idx].lat + ':' +
                        this.$store.state.tempMarkers[this.name][idx].lng + ':' +
                        this.$store.state.tempMarkers[this.name][idx].alt + ':' +
                        this.$store.state.tempMarkers[this.name][idx].speed + ':' +
                        this.$store.state.tempMarkers[this.name][idx].radius + ':' +
                        this.$store.state.tempMarkers[this.name][idx].turningSpeed + ':' +
                        this.$store.state.tempMarkers[this.name][idx].targetMavCmd + ':' +
                        this.$store.state.tempMarkers[this.name][idx].targetStayTime + ':' +
                        this.$store.state.tempMarkers[this.name][idx].elevation;

                    let diffAlt = this.$store.state.tempMarkers[this.name][idx].alt - this.$store.state.tempMarkers[this.name][idx].elevation;
                    if(diffAlt > 5) {
                        this.evalAltColor[idx] = 'green';
                    }
                    else if(diffAlt > 0) {
                        this.evalAltColor[idx] = 'yellow';
                    }
                    else {
                        this.evalAltColor[idx] = 'red';
                    }

                    let goto_pos = {};
                    goto_pos.type = 'Goto';
                    goto_pos.text = str;
                    goto_pos.icon = 'mdi-logout-variant';
                    this.positions.push(goto_pos);
                    goto_pos = null;
                }
            }
        });

        EventBus.$on('do-publish-' + this.name, (payload) => {
            if (this.client.connected) {
                this.client.publish(payload.topic, payload.payload, 0, error => {
                    if (error) {
                        console.log('Publish error', error)
                    }
                });
            }
        });

        EventBus.$on('command-set-mission_rewind-' + this.name, (payload) => {
            let position = payload.position;
            let mission_current_number = payload.mission_current_number;

            let target_mode = 'LOITER';
            if (this.fcType === 'px4') {
                target_mode = 'AUTO_LOITER';
            }

            setTimeout((name, target_pub_topic, sys_id, mode) => {
                console.log('send_set_mode_command', mode);
                this.send_set_mode_command(name, target_pub_topic, sys_id, mode);
            }, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, target_mode);

            let yaw_behavior = 0;
            if(this.$store.state.drone_infos[this.name].yawBehavior !== 'YAW고정') {
                yaw_behavior = 1;
            }

            setTimeout((name, target_pub_topic, sys_id, param_value) => {
                this.send_wp_yaw_behavior_param_set_command(name, target_pub_topic, sys_id, param_value);
            }, 15 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, yaw_behavior);

            target_mode = 'GUIDED';
            if(this.fcType === 'px4') {
                target_mode = 'AUTO_LOITER';
            }

            setTimeout((name, target_pub_topic, sys_id, mode) => {
                console.log('send_set_mode_command', mode);
                this.send_set_mode_command(name, target_pub_topic, sys_id, mode);
            }, 25 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, target_mode);

            // goto
            let arr_cur_goto_position = position.split(':');
            let lat = parseFloat(arr_cur_goto_position[0]);
            let lon = parseFloat(arr_cur_goto_position[1]);
            var alt = parseFloat(arr_cur_goto_position[2]);
            var speed = parseFloat(arr_cur_goto_position[3]);

            if (this.curArmStatus === 'DISARMED') {
                let payload = {};
                payload.targetTakeoffAlt = alt;
                payload.takeoffDelay = 6;

                EventBus.$emit('command-set-takeoff-' + this.name, payload);
            }
            else {
                this.watchingMission = 'takeoff-complete';
                this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
            }

            setTimeout((name, target_pub_topic, sys_id, lat, lon, alt, speed, mission_current_number) => {
                const checkTakeoff = (name, target_pub_topic, sys_id, lat, lon, alt, speed, mission_current_number) => {
                    if (this.$store.state.drone_infos[this.name].watchingMission === 'takeoff-complete') {
                        this.send_goto_command(name, target_pub_topic, sys_id, lat, lon, alt);

                        setTimeout((name, target_pub_topic, sys_id, lat, lon, alt, speed, mission_current_number) => {
                            this.send_change_speed_command(name, target_pub_topic, sys_id, speed);

                            setTimeout((name, target_pub_topic, sys_id, lat, lon, alt, speed, mission_current_number) => {
                                this.send_change_speed_command(name, target_pub_topic, sys_id, speed);

                                let cur_lat = this.gpi.lat / 10000000;
                                let cur_lon = this.gpi.lon / 10000000;
                                let cur_alt = this.gpi.relative_alt / 1000;
                                let result1 = dfs_xy_conv('toXY', cur_lat, cur_lon);

                                let tar_lat = lat;
                                let tar_lon = lon;
                                let tar_alt = alt;
                                var result2 = dfs_xy_conv('toXY', tar_lat, tar_lon);

                                this.$store.state.drone_infos[name].targetLat = lat;
                                this.$store.state.drone_infos[name].targetLng = lon;
                                this.$store.state.drone_infos[name].targetAlt = alt;


                                this.watchingMission = 'goto';
                                this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                                this.watchingInitDist = parseFloat(Math.sqrt(Math.pow(result2.x - result1.x, 2) + Math.pow(result2.y - result1.y, 2) + Math.pow((tar_alt - cur_alt), 2)).toFixed(1));
                                this.watchingMissionStatus = 0;

                                if(this.watchingInitDist <= 0.1) {
                                    this.watchingMission = 'goto-complete';
                                    this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                                    this.watchingMissionStatus = 100;
                                }

                                this.doPublishBroadcast();

                                const checkMission = (name, target_pub_topic, sys_id, lat, lon, alt, speed, mission_current_number) => {
                                    if (this.$store.state.drone_infos[this.name].watchingMission === 'goto-complete') {

                                        console.log('send_set_mission_current - ', mission_current_number);

                                        setTimeout((name, target_pub_topic, sys_id, mode) => {
                                            console.log('send_set_mode_command', mode);
                                            this.send_set_mode_command(name, target_pub_topic, sys_id, mode);
                                        }, 5 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, target_mode);

                                        setTimeout((name, target_pub_topic, sys_id, mission_current_number) => {
                                            console.log('send_set_mission_current_command', mission_current_number);
                                            this.send_set_mission_current_command(name, target_pub_topic, sys_id, (mission_current_number));
                                        }, 15 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, mission_current_number);

                                        setTimeout((name, target_pub_topic, sys_id, mode) => {
                                            console.log('send_set_mode_command', mode);
                                            this.send_set_mode_command(name, target_pub_topic, sys_id, mode);
                                        }, 25 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, 'AUTO');

                                        this.postDroneInfos((res) => {
                                            console.log('postDroneInfos - command-set-mission_rewind', res);
                                        });

                                        this.watchingMission = 'auto-goto';
                                        this.$store.state.drone_infos[this.name].watchingMission = this.watchingMission;
                                        this.watchingMissionStatus = parseInt(mission_current_number / (this.$store.state.drone_infos[this.name].mission_count-1) * 100);

                                        this.doPublishBroadcast();
                                    }
                                    else {
                                        setTimeout(checkMission, 250, name, target_pub_topic, sys_id, lat, lon, alt, speed, mission_current_number);
                                    }
                                }
                                checkMission(250, name, target_pub_topic, sys_id, lat, lon, alt, speed, mission_current_number);

                            }, 5 + parseInt(Math.random() * 5), name, target_pub_topic, sys_id, lat, lon, alt, speed, mission_current_number);

                        }, 15 + parseInt(Math.random() * 5), name, target_pub_topic, sys_id, lat, lon, alt, speed, mission_current_number);
                    }
                    else {
                        setTimeout(checkTakeoff, 250, name, target_pub_topic, sys_id, lat, lon, alt, speed, mission_current_number);
                    }
                }

                checkTakeoff(name, target_pub_topic, sys_id, lat, lon, alt, speed, mission_current_number);

            }, 35 + parseInt(Math.random() * 5), this.name, this.target_pub_topic, this.sys_id, lat, lon, alt, speed, mission_current_number);
        });

        // EventBus.$on('push-status-' + this.name, (payload) => {
        //     //console.log(payload);
        //
        //     this.recv_counter++;
        //
        //     this.sortie_name = payload.sortie_name;
        //     this.mavStr = payload.data;
        //
        //     this.statusColor = 'indicator-green';
        //     this.statusTextColor = 'indicator-text-black';
        //     this.borderColor = 'indicator-border-green';
        //     this.flagReceiving = true;
        //
        //     setTimeout(this.parseMavFromDrone, 0, payload.data);
        //
        //     if (this.timeoutObj) {
        //         clearTimeout(this.timeoutObj);
        //     }
        //
        //     this.timeoutObj = setTimeout(() => {
        //         this.iconArming = 'mdi-airplane-off';
        //         this.colorArming = 'white';
        //         this.iconDistance = 'mdi-map-marker-distance';
        //         this.iconBattery = 'mdi-battery-off-outline';
        //         this.colorBattery = 'td-text-gray';
        //         this.colorAirspeed = 'td-text-gray';
        //
        //         this.statusColor = 'indicator-gray';
        //         this.statusTextColor = 'indicator-text-gray';
        //         this.borderColor = 'indicator-border-gray';
        //         this.mavStr = '...';
        //         this.timeoutObj = null;
        //         this.flagReceiving = false;
        //         this.sys_id = 0;
        //
        //         this.colorMode = 'td-text-gray';
        //         this.curMode = 'UNKNOWN';
        //     }, 3000);
        // });

        // EventBus.$on('push-mission-' + this.name, (payload) => {
        //     let arr_sur = payload.sur.split('/');
        //     arr_sur.pop();
        //     payload.sur = '/' + arr_sur.join('/');
        //
        //     if ((this.missionLteUrl + '/' + this.sortie_name) === payload.sur) {
        //         // console.log(payload.sur);
        //
        //         if (Object.prototype.hasOwnProperty.call(payload.con, 'rsrp')) {
        //             this.colorLteVal = 'td-text-gray';
        //
        //             // setTimeout(() => {
        //             //
        //             // }, 200);
        //
        //             this.curLteVal = payload.con.rsrp;
        //             //console.log(this.curLteVal);
        //
        //             if (0 > this.curLteVal && this.curLteVal >= -80) {
        //                 this.iconLte = 'mdi-network-strength-4';
        //                 this.colorLteVal = 'td-text-blue';
        //             }
        //             else if (-80 > this.curLteVal && this.curLteVal >= -90) {
        //                 this.iconLte = 'mdi-network-strength-3';
        //                 this.colorLteVal = 'td-text-green';
        //             }
        //             else if (-90 > this.curLteVal && this.curLteVal >= -100) {
        //                 this.iconLte = 'mdi-network-strength-2';
        //                 this.colorLteVal = 'td-text-yellow';
        //             }
        //             else {
        //                 this.iconLte = 'mdi-network-strength-1';
        //                 this.colorLteVal = 'td-text-red';
        //             }
        //
        //             if (this.lteTimeoutObj) {
        //                 clearTimeout(this.lteTimeoutObj);
        //             }
        //
        //             this.lteTimeoutObj = setTimeout(() => {
        //                 this.lteTimeoutObj = null;
        //                 this.colorLteVal = 'td-text-gray';
        //                 this.iconLte = 'mdi-network-strength-off-outline';
        //             }, 2500);
        //         }
        //     }
        // });

        // if (localStorage.getItem('mqttConnection-' + this.name)) {
        //     if (JSON.parse(localStorage.getItem('mqttConnection-' + this.name)).connected) {
        //         this.client = JSON.parse(localStorage.getItem('mqttConnection-' + this.name));
        //         console.log(this.name, 'client', this.client);
        //
        //         this.client = {
        //             connected: false,
        //         }
        //
        //         localStorage.setItem('mqttConnection-' + this.name, JSON.stringify(this.client));
        //     }
        // }
        // else {
            this.client = {
                connected: false,
                loading: false
            };
        // }

        //this.createConnection();
    },


    mounted: function () {

        this.fillData();

        this.positions = []
        // for(let i in this.goto_positions) {
        //     if(Object.prototype.hasOwnProperty.call(this.goto_positions, i)) {
        //         // console.log('DroneInfo-mounted', this.goto_positions[i]);
        //         let goto_pos = {};
        //         goto_pos.type = 'Goto';
        //         goto_pos.text = this.goto_positions[i];
        //         goto_pos.icon = 'mdi-logout-variant';
        //         this.positions.push(goto_pos);
        //     }
        // }

        if (localStorage.getItem(this.name + '_mavVersion')) {
            this.mavVersion = localStorage.getItem(this.name + '_mavVersion');
        }

        for (let idx in this.$store.state.tempMarkers[this.name]) {
            if (Object.prototype.hasOwnProperty.call(this.$store.state.tempMarkers[this.name], idx)) {
                let str = this.$store.state.tempMarkers[this.name][idx].lat + ':' +
                    this.$store.state.tempMarkers[this.name][idx].lng + ':' +
                    this.$store.state.tempMarkers[this.name][idx].alt + ':' +
                    this.$store.state.tempMarkers[this.name][idx].speed + ':' +
                    this.$store.state.tempMarkers[this.name][idx].radius + ':' +
                    this.$store.state.tempMarkers[this.name][idx].turningSpeed + ':' +
                    this.$store.state.tempMarkers[this.name][idx].targetMavCmd + ':' +
                    this.$store.state.tempMarkers[this.name][idx].targetStayTime + ':' +
                    this.$store.state.tempMarkers[this.name][idx].elevation;

                let goto_pos = {};
                goto_pos.type = 'Goto';
                goto_pos.text = str;
                goto_pos.icon = 'mdi-logout-variant';
                this.positions.push(goto_pos);
                goto_pos = null;
            }
        }

        console.log('Interval getDroneMissionInfo');

        this.checkMissionLteUrl();

        console.log('DroneInfo-mounted', this.lat, this.lng);

        let payload = {};
        payload.lat = parseFloat(this.lat);
        payload.lng = parseFloat(this.lng);
        payload.alt = parseFloat(this.gpi.relative_alt / 1000);
        payload.heading = 0;
        EventBus.$emit('initialize-' + this.name, JSON.parse(JSON.stringify(payload)));
        payload = null;

        this.gpi.lat = parseFloat(this.lat) * 10000000;
        this.gpi.lon = parseFloat(this.lng) * 10000000;

        if(localStorage.getItem('trackingLines-' + this.name)) {
            this.$store.state.trackingLines[this.name] = JSON.parse(localStorage.getItem('trackingLines-' + this.name));

            let temp = JSON.parse(JSON.stringify(this.$store.state.trackingLines[this.name]));
            this.$store.state.trackingLines[this.name] = null;
            delete this.$store.state.trackingLines[this.name];
            this.$store.state.trackingLines[this.name] = [];
            this.$store.state.trackingLines[this.name] = JSON.parse(JSON.stringify(temp));
            temp = null;
        }
        else {
            this.$store.state.trackingLines[this.name] = [];
        }

        if (this.curSortieName !== 'disarm') {
            var now = moment.utc();
            this.startFlightTime = moment(this.curSortieName.replace(/_/g, ''));
            console.log('curSortieName', this.startFlightTime);

            //let diff = (now.seconds() - this.startFlightTime.seconds());
            let diff = now.subtract(this.startFlightTime);
            console.log(diff.unix());

            this.flightTimeCount = diff.unix();
            this.startFlightTimer();
        }
        else {
            this.stopFlightTimer();
        }

    },

    beforeDestroy() {
        this.destroyConnection();

        EventBus.$off('do-drone-selected' + this.name);
        EventBus.$off('do-target-selected' + this.name);
        EventBus.$off('initialize-' + this.name);
        EventBus.$off('command-set-pwms-mission-' + this.name);
        EventBus.$off('command-set-params-' + this.name);
        EventBus.$off('command-set-disarm-' + this.name);
        EventBus.$off('command-set-auto_goto-' + this.name);
        EventBus.$off('command-set-pwms-' + this.name);
        EventBus.$off('command-set-rtl-' + this.name);
        EventBus.$off('command-set-land-' + this.name);
        EventBus.$off('command-set-stop-' + this.name);
        EventBus.$off('command-set-change-speed-' + this.name);
        EventBus.$off('command-set-goto-circle-' + this.name);
        EventBus.$off('command-set-goto-' + this.name);
        EventBus.$off('command-set-goto-alt-' + this.name);
        EventBus.$off('command-set-takeoff-' + this.name);
        EventBus.$off('command-set-mode-' + this.name);
        EventBus.$off('command-set-mode-' + this.name);
        EventBus.$off('command-set-arm-' + this.name);
        EventBus.$off('on-message-handler-' + this.name);
        EventBus.$off('on-drone-message-handler-' + this.name);
        EventBus.$off('command-set-roi-' + this.name);

        EventBus.$off('ClickADSBMonitor');
        EventBus.$off('do-positions-elevation-' + this.name);
        EventBus.$off('setWpYawBehavior-' + this.name);

        EventBus.$off('do-publish-' + this.name);

        EventBus.$off('command-set-mission_rewind-' + this.name);

        if (this.timer_id) {
            clearInterval(this.timer_id);
        }

        this.myChart.destroy();
    }
}
</script>

<style scoped>
.singleline-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    padding-left: 10px;
    padding-right: 10px;
    margin: 1px;
}

.indicator-gray {
    background-color: lightgray;
}

.indicator-green {
    background-color: lightgreen;
}

.indicator-text-gray {
    color: grey;
}

.indicator-text-black {
    color: white;
}

.td-text-blue {
    color: #82B1FF;
}

.td-text-green {
    color: #CCFF90;
}

.td-text-yellow {
    color: #FFFF8D;
}

.td-text-red {
    color: #FF8A80;
}

.td-text-gray {
    color: lightgray;
}

.td-text-black {
    color: white;
}

.indicator-border-gray {
    border: 1px solid lightgray;
}

.indicator-border-green {
    border: 1px solid darkblue;
}

.container {
    width: 100%;
    height: 100%;
    position: relative;
    margin: 0;
}

.box {
    width: 100%;
    height: 100%;
}

.overlay_box {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0.8; /* for demo purpose  */
}

.stack-top {
    z-index: 9;
    margin: 0; /* for demo purpose  */
}

.arm-status-gray {
    color: lightgray;
    background-color: lightgrey;
}

.arm-status-green {
    color: greenyellow;
    background-color: #263238;
}

.wrapper-block {
    max-width: 700px;
    height: 200px;
    margin: 10px auto;
    padding: 10px;
    background-color: #fff;
    /*This prevents the margins to collapse.*/
    /*overflow:hidden;*/
    position: relative;
}

.center.block-unknown-height {
    padding: 30px;
    position: absolute;
    top: 50%;
    /*요소의 높이의 반 만큼 위로 이동*/
    transform: translateY(-50%);
}

#rounded-card {
    border-radius: 50%;
}

@keyframes metronome-example {
    from {
        transform: scale(.5);
    }

    to {
        transform: scale(1);
    }
}

.v-avatar--metronome {
    animation-name: metronome-example;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    position: relative;
    opacity: 1; /* for demo purpose  */
}

.info_position {
    position: absolute;
    opacity: 1; /* for demo purpose  */
}

.no-scroll {
    overflow: hidden;
}

.shadow {
    text-shadow: 1px 1px #000000;
}

.shadow_icon {
    text-shadow: 0.5px 0.5px 5px #000000;
}

.v-text-field--enclosed .v-input__slot {
    padding: 0;
}



</style>
