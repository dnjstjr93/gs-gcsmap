<template>
    <v-card flat>
        <v-snackbar v-model="snackbar" absolute top right color="success">
            <span>Action successful!</span>
            <v-icon dark right>
                mdi-checkbox-marked-circle
            </v-icon>
        </v-snackbar>
        <v-form ref="form" @submit.prevent="submit">
            <v-card tile flat>
                <v-row align="center" justify="center">
                    <v-spacer/>
                    <v-col cols="2">
                        <v-combobox
                            v-model="targetSelectName"
                            :items="targets"
                            label="Target"
                            chips dense hide-details single-line
                            :disabled="disableTargetSelect"
                            class="pa-1 mr-10"
                        >
                            <template v-slot:selection="data">
                                <v-chip
                                    :key="JSON.stringify(data.item)"
                                    v-bind="data.attrs"
                                    :input-value="data.selected"
                                    :disabled="data.disabled"
                                    @click:close="data.parent.selectItem(data.item)"
                                    small
                                >
                                    <v-avatar
                                        class="white--text"
                                        left
                                        v-text="data.item.slice(0, 1).toUpperCase()"
                                        :color="curDroneColorMap"
                                    ></v-avatar>
                                    {{ data.item }}
                                </v-chip>
                            </template>
                        </v-combobox>
                    </v-col>
                    <v-col cols="3">
                        <v-radio-group
                            v-model="wayOfSurvey" class="pt-2"
                            row mandatory
                            @change="changeWayOfSurvey($event)"
                        >
                            <v-radio
                                label="촬영용 Survey"
                                value="forShooting"
                                color="red"
                            ></v-radio>
                            <v-radio
                                label="수색용 Survey"
                                value="forSearch"
                                color="primary"
                            ></v-radio>
                        </v-radio-group>
                    </v-col>
                    <v-spacer/>
                    <v-col cols="2">
                        <v-select
                            @change="changeFlyAltType($event)"
                            dense outlined hide-details
                            :items="['상대고도', '지형고도']"
                            label="비행고도설정"
                            v-model="flyAltType"
                            class="pa-1"
                        ></v-select>
                    </v-col>
                    <v-col cols="1">
                        <v-text-field
                            label="면적(㎡)"
                            :value="area"
                            class="mt-0 pt-0"
                            type="number"
                            outlined dense hide-details readonly filled
                            color="amber"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="1">
                        <v-text-field
                            label="루트(m)"
                            :value="Math.sqrt(area).toFixed(1)"
                            class="mt-0 pt-0"
                            type="number"
                            outlined dense hide-details readonly filled
                            color="amber"
                        ></v-text-field>
                    </v-col>
                    <v-spacer/>
                    <v-col cols="1">
                        <div class="ml-20 text-subtitle-2">
                            총 주행거리 : <br>
                            <span v-if="total_dist > 1000" style="font-size: 20px">
                                {{ (total_dist / 1000).toFixed(1) }} km
                            </span>
                            <span v-else style="font-size: 20px">
                                {{ total_dist.toFixed(1) }} m
                            </span>
                        </div>
                    </v-col>
                    <v-col cols="1">
                        <div class="ml-20 text-subtitle-2">
                            예상비행시간 : <br>
                            <span v-if="((total_dist / paramSpeed) + (total_count * 5)) > 60" style="font-size: 20px">
                                {{ ((total_dist / paramSpeed + (total_count * 5)) / 60).toFixed(1) }} 분
                            </span>
                            <span v-else style="font-size: 20px">
                                {{ (total_dist / paramSpeed + (total_count * 5)).toFixed(1) }} 초
                            </span>
                        </div>
                    </v-col>
                    <v-spacer/>
                </v-row>
                <v-row v-if="wayOfSurvey==='forShooting'" align="center" justify="center">
                    <v-col cols="12">
                        <v-card flat tile>
                            <v-row align="center" justify="center">
                                <v-col cols="1">
                                    <v-text-field
                                        label="초점거리(mm)"
                                        v-model="paramFocal"
                                        class="mt-0 pt-0"
                                        type="number"
                                        outlined dense hide-details
                                        color="amber"
                                        min="1"
                                        max="100"
                                        @input="changeParamShooting($event, 'Focal')"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="1">
                                    <v-text-field
                                        label="센서가로(mm)"
                                        v-model="paramSensorW"
                                        class="mt-0 pt-0"
                                        type="number"
                                        outlined dense hide-details
                                        color="green"
                                        min="10"
                                        max="500"
                                        @input="changeParamShooting($event, 'sensorW')"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="1">
                                    <v-text-field
                                        label="센서세로(mm)"
                                        v-model="paramSensorH"
                                        class="mt-0 pt-0"
                                        type="number"
                                        outlined dense hide-details
                                        color="blue"
                                        min="10"
                                        max="500"
                                        @input="changeParamShooting($event, 'sensorH')"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="1">
                                    <v-text-field
                                        label="중복도"
                                        v-model="paramOverlap"
                                        class="mt-0 pt-0"
                                        type="number"
                                        outlined dense hide-details
                                        color="red"
                                        step="0.1"
                                        min="0.0"
                                        max="1.0"
                                        @input="changeParamShooting($event, 'Overlap')"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="1">
                                    <v-text-field
                                        label="시작고도(m)"
                                        v-model="paramStartAlt"
                                        class="mt-0 pt-0"
                                        type="number"
                                        outlined dense hide-details readonly filled
                                        color="amber"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="1">
                                    <v-text-field
                                        label="옵셋고도(m)"
                                        v-model="paramOffsetAlt"
                                        class="mt-0 pt-0"
                                        type="number"
                                        outlined dense hide-details
                                        color="amber"
                                        min="3"
                                        max="500"
                                        @input="changeParamShooting($event, 'paramOffsetAlt')"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="1">
                                    <v-text-field
                                        label="촬영고도(m)"
                                        v-model="paramAlt"
                                        class="mt-0 pt-0"
                                        type="number"
                                        outlined dense hide-details
                                        color="amber"
                                        min="3"
                                        max="500"
                                        @input="changeParamShooting($event, 'paramAlt')"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="1">
                                    <v-text-field
                                        label="비행속도(m/s)"
                                        v-model="paramSpeed"
                                        class="mt-0 pt-0"
                                        type="number"
                                        outlined dense hide-details
                                        color="amber"
                                        min="3"
                                        max="500"
                                        @input="changeParamShooting($event, 'Speed')"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="1">
                                    <v-select
                                        label="direction"
                                        class="py-3 pr-2"
                                        :items="['cw', 'ccw']"
                                        v-model="paramDir"
                                        color="black"
                                        required outlined dense hide-details
                                        @change="changeDirSurveyPath($event)"
                                    >
                                    </v-select>
                                </v-col>
                                <v-col cols="1">
                                    <v-text-field
                                        label="angle(°)"
                                        v-model="paramAngle"
                                        class="mt-0 pt-0"
                                        type="number"
                                        outlined dense hide-details
                                        color="amber"
                                        min="-360"
                                        max="360"
                                        @input="changeAngleSurveyPath($event)"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="1">
                                    <v-text-field
                                        label="gap(m)"
                                        v-model="paramGap"
                                        class="mt-0 pt-0"
                                        type="number"
                                        outlined dense hide-details readonly filled
                                        color="amber"
                                        min="1"
                                        max="500"
                                        @input="changeGapSurveyPath($event)"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="1">
                                    <v-text-field
                                        label="촬영주기(s)"
                                        v-model="paramPeriod"
                                        class="mt-0 pt-0"
                                        type="number"
                                        outlined dense hide-details readonly filled
                                        color="cyan"
                                        min="1"
                                        max="60"
                                        @input="changeGapSurveyPath($event)"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                        </v-card>
                    </v-col>
                </v-row>
                <v-row v-else align="center" justify="center">
                    <v-col cols="12">
                        <v-card flat tile>
                            <v-row align="center" justify="center">
                                <v-col cols="1">
                                    <v-text-field
                                        label="수색고도(m)"
                                        v-model="paramAlt"
                                        class="mt-0 pt-0"
                                        type="number"
                                        outlined dense hide-details
                                        color="amber"
                                        min="3"
                                        max="500"
                                        @input="changeParamSearch($event, 'paramAlt')"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="1">
                                    <v-text-field
                                        label="비행속도(m/s)"
                                        v-model="paramSpeed"
                                        class="mt-0 pt-0"
                                        type="number"
                                        outlined dense hide-details
                                        color="amber"
                                        min="3"
                                        max="500"
                                        @input="changeParamSearch($event, 'Speed')"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="1">
                                    <v-select
                                        label="direction"
                                        class="py-3 pr-2"
                                        :items="['cw', 'ccw']"
                                        v-model="paramDir"
                                        color="black"
                                        required outlined dense hide-details
                                        @change="changeDirSurveyPath($event)"
                                    >
                                    </v-select>
                                </v-col>
                                <v-col cols="1">
                                    <v-text-field
                                        label="angle(°)"
                                        v-model="paramAngle"
                                        class="mt-0 pt-0"
                                        type="number"
                                        outlined dense hide-details
                                        color="amber"
                                        min="-360"
                                        max="360"
                                        @input="changeAngleSurveyPath($event)"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="1">
                                    <v-text-field
                                        label="gap(m)"
                                        v-model="paramGap"
                                        class="mt-0 pt-0"
                                        type="number"
                                        outlined dense hide-details
                                        color="amber"
                                        min="1"
                                        max="500"
                                        @input="changeGapSurveyPath($event)"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                        </v-card>
                    </v-col>
                </v-row>
                <v-row align="center" justify="center">
                    <v-col cols="12">
                        <v-card :style="{color:'white'}" outlined tile flat>
                            <canvas :id="'elevation-chart-'+markerName" :height="120+'px'"></canvas>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text color="primary" type="submit" outlined :disabled="conditions">
                    Register
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn text @click="resetForm" outlined>
                    Close
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn text color="warning" fab dark @click="deleteMarker" outlined>
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script>
    import EventBus from "@/EventBus";
    import axios from "axios";
    import {Chart, BarElement, BarController, LinearScale, CategoryScale, LineElement, LineController, PointElement } from 'chart.js'; //👈 Chart 모듈 임포트
    Chart.register(BarElement, BarController, LinearScale, CategoryScale, LineElement, LineController, PointElement); // 👈 chart.js 모듈 Chart 모듈에 등록

    export default {
        myChart: null,

        name: "InfoSurveyMarker",

        props: [
            'value',
            'markerName',
            'markerIndex',
        ],

        data() {
            return {
                wayOfSurvey: 'forShooting',
                total_count: 0,
                total_dist: 400,
                paramFocal: 16,
                paramSensorW: 23.5,
                paramSensorH: 15.6,
                paramOverlap: 0.7,

                targets: [],

                area: 0,

                flyAltType: "상대고도",
                targetSelectName: '',
                targetSelectIndex: '0',
                targetSpeed: 5,
                targetRadius: 10,
                targetTurningSpeed: 10,

                idAngleUpdateTimer: null,
                idDirUpdateTimer: null,
                idGapUpdateTimer: null,
                idAltUpdateTimer: null,
                idWayUpdateTimer: null,

                paramAngle: 0,
                paramDir: 'cw',
                paramGap: 10,
                paramPeriod: 10,
                paramAlt: 100,
                paramStartAlt: 0,
                paramOffsetAlt: 0,
                paramSpeed: 5,

                elevation: 0,

                snackbar: false,

                disableTargetSelectIndex: false,
                disableTargetSelect: false,
            }
        },

        watch: {
            markerName: function (newVal) {
                this.targetSelectName = newVal;
            },

            targetSelectName: function (newVal) {
                this.disableTargetSelectIndex = (this.markerName !== newVal);
            },

            targetSelectIndex: function (newVal) {
                this.disableTargetSelect = (String(this.markerIndex) !== newVal);
            },
        },

        computed: {
            targetIndexList() {
                console.log()
                let arrIndex = [];
                for(let idx in this.$store.state.surveyMarkers[this.markerName]) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers[this.markerName], idx)) {
                        arrIndex.push(idx);
                    }
                }

                return (arrIndex);
            },

            conditions() {
                return !((this.markerName !== this.targetSelectName) ||
                    (String(this.markerIndex) !== this.targetSelectIndex));
            },

            curDroneColorMap() {
                return (this.$store.state.drone_infos[this.targetSelectName].color);
            },
        },

        methods: {
            fillElevationData() {
                if(this.myChart) {
                    this.myChart.destroy();
                }

                //console.log(this.$store.state.surveyMarkers[this.markerName][this.markerIndex].elevations);

                let unitVal = parseInt(this.$store.state.surveyMarkers[this.markerName][this.markerIndex].total_dist / this.$store.state.SAMPLES);
                console.log('unitVal', unitVal);
                let labels = [0];
                let dist = 0;
                for(let i = 1; i < this.$store.state.SAMPLES; i++) {
                    dist += unitVal;
                    labels.push(dist);
                }

                this.$store.state.surveyMarkers[this.markerName][this.markerIndex].takeoffAlt = Array(this.$store.state.SAMPLES).fill(parseInt(this.$store.state.drone_infos[this.markerName].takeoffAbsoluteAlt));

                console.log('takeoffAlt - ', this.$store.state.drone_infos[this.markerName].absolute_alt, this.$store.state.drone_infos[this.markerName].alt, this.$store.state.drone_infos[this.markerName].takeoffAbsoluteAlt)

                const ctx = document.getElementById('elevation-chart-'+this.markerName).getContext('2d');
                let config = {
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                type: 'bar',
                                data: this.$store.state.surveyMarkers[this.markerName][this.markerIndex].elevations,
                                backgroundColor: Array(this.$store.state.SAMPLES).fill('rgba(153, 102, 255, 0.2)'),
                                // aaa: [
                                //     //색상
                                //     'rgba(255, 99, 132, 0.2)',
                                //     'rgba(54, 162, 235, 0.2)',
                                //     'rgba(255, 206, 86, 0.2)',
                                //     'rgba(75, 192, 192, 0.2)',
                                //     'rgba(153, 102, 255, 0.2)',
                                //     'rgba(255, 159, 64, 0.2)'
                                // ],
                                borderColor: Array(this.$store.state.SAMPLES).fill('rgba(153, 102, 255, 1)'),
                                // [
                                //     //경계선 색상
                                //     'rgba(255, 99, 132, 1)',
                                //     'rgba(54, 162, 235, 1)',
                                //     'rgba(255, 206, 86, 1)',
                                //     'rgba(75, 192, 192, 1)',
                                //     'rgba(153, 102, 255, 1)',
                                //     'rgba(255, 159, 64, 1)'
                                // ],
                                borderWidth: 1
                            },
                            {
                                type: 'line',
                                label: '비행고도',
                                data: this.$store.state.surveyMarkers[this.markerName][this.markerIndex].flyAlt,
                                backgroundColor: Array(this.$store.state.SAMPLES).fill('rgba(255, 99, 132, 0.2)'),
                                borderColor: Array(this.$store.state.SAMPLES).fill('rgba(255, 99, 132, 1)'),
                            },
                            {
                                type: 'line',
                                label: '옵셋고도',
                                data: this.$store.state.surveyMarkers[this.markerName][this.markerIndex].offsetAlt,
                                backgroundColor: Array(this.$store.state.SAMPLES).fill('rgba(255, 206, 86, 0.2)'),
                                borderColor: Array(this.$store.state.SAMPLES).fill('rgba(255, 206, 86, 1)'),
                            },
                            {
                                type: 'line',
                                label: '이륙고도',
                                data: this.$store.state.surveyMarkers[this.markerName][this.markerIndex].takeoffAlt,
                                backgroundColor: Array(this.$store.state.SAMPLES).fill('rgba(54, 162, 235, 1)'),
                                borderColor: Array(this.$store.state.SAMPLES).fill('rgba(54, 162, 235, 0.2)'),
                            },
                        ],
                    },
                    options: {
                        scales: {
                            y: {beginAtZero: true}
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                    }
                };

                this.myChart = new Chart(ctx, config);
            },

            changeFlyAltType(altType) {
                console.log(altType, this.markerName);

                this.flyAltType = altType;
                this.$store.state.surveyMarkers[this.markerName][this.markerIndex].flyAltType = altType;

                this.changeParamShooting(this.paramAlt, 'paramAlt');
            },

            changeWayOfSurvey(val) {
                this.wayOfSurvey = val;
                this.$store.state.surveyMarkers[this.markerName][this.markerIndex].wayOfSurvey = val;

                if(this.idWayUpdateTimer !== null) {
                    clearTimeout(this.idWayUpdateTimer);
                }

                this.idWayUpdateTimer = setTimeout((dName) => {
                    this.postCinSurveyMarkerInfoToMobius(dName);

                }, 500, this.markerName);
            },

            calcFactorSurvey(focal, sensor_h, overlap, alt, speed) {
                let interval_t = (sensor_h * alt * (1-overlap)) / (focal * speed);
                let interval_l = interval_t * speed;

                return({'interval_t': interval_t, 'interval_l': interval_l});
            },

            changeParamShooting(val, factor) {
                if(val !== '') {
                    if (factor === 'Focal') {
                        this.paramFocal = val;
                        this.$store.state.surveyMarkers[this.markerName][this.markerIndex].focal = val;
                    } else if (factor === 'SensorH') {
                        this.paramSensorH = val;
                        this.$store.state.surveyMarkers[this.markerName][this.markerIndex].sensor_h = val;
                    } else if (factor === 'SensorW') {
                        this.paramSensorW = val;
                        this.$store.state.surveyMarkers[this.markerName][this.markerIndex].sensor_w = val;
                    } else if (factor === 'SensorH') {
                        this.paramSensorH = val;
                        this.$store.state.surveyMarkers[this.markerName][this.markerIndex].sensor_h = val;
                    } else if (factor === 'Overlap') {
                        this.paramOverlap = val;
                        this.$store.state.surveyMarkers[this.markerName][this.markerIndex].overlap = val;
                    }
                    else if (factor === 'paramAlt') {
                        this.paramAlt = val;
                        this.$store.state.surveyMarkers[this.markerName][this.markerIndex].paramAlt = val;

                        this.$store.state.surveyMarkers[this.markerName][this.markerIndex].alt = parseInt(this.paramAlt) + parseInt(this.paramOffsetAlt);

                        this.$store.state.surveyMarkers[this.markerName][this.markerIndex].flyAlt = [];
                        this.$store.state.surveyMarkers[this.markerName][this.markerIndex].offsetAlt = [];
                        if(this.flyAltType === '상대고도') {
                            this.$store.state.surveyMarkers[this.markerName][this.markerIndex].offsetAlt = Array(this.$store.state.SAMPLES).fill(parseInt(this.paramOffsetAlt));
                            this.$store.state.surveyMarkers[this.markerName][this.markerIndex].flyAlt = Array(this.$store.state.SAMPLES).fill(parseInt(this.paramStartAlt) + parseInt(this.paramAlt) + parseInt(this.paramOffsetAlt));
                        }
                        else {
                            for(let i = 0; i < this.$store.state.SAMPLES; i++) {
                                this.$store.state.surveyMarkers[this.markerName][this.markerIndex].flyAlt.push(
                                    parseInt(this.$store.state.surveyMarkers[this.markerName][this.markerIndex].elevations[i]) + parseInt(this.paramAlt)
                                );
                            }
                        }
                    }
                    else if (factor === 'paramOffsetAlt') {
                        this.paramOffsetAlt = val;
                        this.$store.state.surveyMarkers[this.markerName][this.markerIndex].paramOffsetAlt = val;

                        this.$store.state.surveyMarkers[this.markerName][this.markerIndex].alt = parseInt(this.paramAlt) + parseInt(this.paramOffsetAlt);

                        this.$store.state.surveyMarkers[this.markerName][this.markerIndex].flyAlt = [];
                        this.$store.state.surveyMarkers[this.markerName][this.markerIndex].offsetAlt = [];
                        if(this.flyAltType === '상대고도') {
                            this.$store.state.surveyMarkers[this.markerName][this.markerIndex].offsetAlt = Array(this.$store.state.SAMPLES).fill(parseInt(this.paramOffsetAlt));
                            this.$store.state.surveyMarkers[this.markerName][this.markerIndex].flyAlt = Array(this.$store.state.SAMPLES).fill(parseInt(this.paramStartAlt) + parseInt(this.paramAlt) + parseInt(this.paramOffsetAlt));
                        }
                        else {
                            for(let i = 0; i < this.$store.state.SAMPLES; i++) {
                                this.$store.state.surveyMarkers[this.markerName][this.markerIndex].flyAlt.push(
                                    parseInt(this.$store.state.surveyMarkers[this.markerName][this.markerIndex].elevations[i]) + parseInt(this.paramAlt)
                                );
                            }
                        }
                    }
                    else if (factor === 'Speed') {
                        this.paramSpeed = val;
                        this.$store.state.surveyMarkers[this.markerName][this.markerIndex].speed = val;
                    }

                    // let interval_t = (this.paramSensorH * 100 * (1-this.paramOverlap)) / (this.paramFocal * 5);
                    // let interval_l = interval_t * 5;

                    let result = this.calcFactorSurvey(this.paramFocal, this.paramSensorH, this.paramOverlap, this.paramAlt, this.paramSpeed);
                    this.paramGap = parseInt(result.interval_l * (this.paramSensorW / this.paramSensorH));

                    this.paramPeriod = parseInt(result.interval_t);
                    this.$store.state.surveyMarkers[this.markerName][this.markerIndex].period = this.paramPeriod;

                    console.log('촬영주기: ', this.paramPeriod, '초, ', '간격: ', +this.paramGap + 'm');

                    this.changeGapSurveyPath(this.paramGap);
                }
            },

            changeParamSearch(val, factor) {
                if(val !== '') {
                    if (factor === 'paramAlt') {
                        this.paramAlt = val;
                        this.$store.state.surveyMarkers[this.markerName][this.markerIndex].alt = val;

                        this.$store.state.surveyMarkers[this.markerName][this.markerIndex].flyAlt = [];
                        if(this.flyAltType === '상대고도') {
                            this.$store.state.surveyMarkers[this.markerName][this.markerIndex].flyAlt = Array(this.$store.state.SAMPLES).fill(parseInt(this.paramAlt));
                        }
                        else {
                            for(let i = 0; i < this.$store.state.SAMPLES; i++) {
                                this.$store.state.surveyMarkers[this.markerName][this.markerIndex].flyAlt.push(
                                    this.$store.state.surveyMarkers[this.markerName][this.markerIndex].elevations[i] + parseInt(this.paramAlt)
                                );
                            }
                        }

                        this.changeGapSurveyPath(this.paramGap);
                    } else if (factor === 'Speed') {
                        this.paramSpeed = val;
                        this.$store.state.surveyMarkers[this.markerName][this.markerIndex].speed = val;
                    }
                }
            },

            changeGapSurveyPath(gap) {
                if(gap !== '') {
                    if (this.idGapUpdateTimer !== null) {
                        clearTimeout(this.idGapUpdateTimer);
                    }

                    this.idGapUpdateTimer = setTimeout((dName, pIndex) => {
                        EventBus.$emit('do-update-survey-GcsMap', {
                            eName: 'gap',
                            dName: dName,
                            pIndex: pIndex,
                            gap: parseInt(gap)
                        });
                    }, 500, this.markerName, this.markerIndex);
                }
            },

            changeAngleSurveyPath(angle) {
                if(angle !== '') {
                    if (this.idAngleUpdateTimer !== null) {
                        clearTimeout(this.idAngleUpdateTimer);
                    }

                    this.idAngleUpdateTimer = setTimeout((dName, pIndex) => {
                        EventBus.$emit('do-update-survey-GcsMap', {
                            eName: 'angle',
                            dName: dName,
                            pIndex: pIndex,
                            angle: parseInt(angle)
                        });
                    }, 500, this.markerName, this.markerIndex);
                }
            },

            changeDirSurveyPath(strDir) {
                if(this.idDirUpdateTimer !== null) {
                    clearTimeout(this.idDirUpdateTimer);
                }

                let dir = 1;
                if(strDir === 'ccw') {
                    dir = -1;
                }

                this.idDirUpdateTimer = setTimeout((dName, pIndex) => {
                    EventBus.$emit('do-update-survey-GcsMap', {
                        eName: 'dir',
                        dName: dName,
                        pIndex: pIndex,
                        dir: parseInt(dir)
                    });
                }, 500, this.markerName, this.markerIndex);
            },

            deleteMarker() {
                let watchingPayload = {};
                watchingPayload.payload = {
                    dName: this.markerName,
                    pIndex: this.markerIndex,
                };

                if(this.markerName === 'unknown') {
                    this.$store.state.surveyMarkers[this.markerName][this.markerIndex].selected = false;
                    this.$store.state.surveyMarkers[this.markerName].splice(this.markerIndex, 1);

                    watchingPayload.broadcastMission = 'removeSurveyMarker';

                    this.postCinSurveyMarkerInfoToMobius(this.markerName);
                }
                else {
                    this.$store.state.surveyMarkers[this.markerName][this.markerIndex].selected = false;
                    this.$store.state.surveyMarkers.unknown.push(
                        JSON.parse(JSON.stringify(this.$store.state.surveyMarkers[this.markerName][this.markerIndex]))
                    );
                    this.$store.state.surveyMarkers[this.markerName].splice(this.markerIndex, 1);

                    watchingPayload.broadcastMission = 'deleteSurveyMarker';

                    this.postCinSurveyMarkerInfoToMobius(this.markerName);

                    this.postCinSurveyMarkerInfoToMobius('unknown');
                }

                this.broadcast_gcsmap_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/gcsmap';
                this.doPublish(this.broadcast_gcsmap_topic, JSON.stringify(watchingPayload));

                this.$store.state.didIPublish = true;

                this.snackbar = true;

                setTimeout(() => {
                    this.resetForm();
                }, 100);
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

            resetForm() {
                // this.form = Object.assign({}, this.defaultForm)
                // this.$refs.form.reset()

                this.$emit('input', false);

                this.$store.state.surveyMarkers[this.markerName].forEach((marker) => {
                    marker.selected = false;
                    marker.polygonDraggable = false;
                    marker.polygonEditable = false;
                });

                EventBus.$emit('do-unsetSelectedSurveyMarker');
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
                        console.log('++++++++ postCinSurveyMarkerInfoToMobius-axios', res.data);
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
            },

            postCntToMobius(url, name, callback) {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'post',
                    url: url,
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=3'
                    },
                    data: {
                        'm2m:cnt': {
                            rn: name,
                            lbl: [name],
                        }
                    }
                }).then(
                    (res) => {
                        callback(res.status, '');
                    }
                ).catch(
                    (err) => {
                        console.log(err.message);
                    }
                );
            },

            postCinToMobius(url, con, callback) {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'post',
                    url: url,
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=4'
                    },
                    data: {
                        'm2m:cin': {
                            con: con
                        }
                    }
                }).then(
                    (res) => {
                        callback(res.status, '');
                    }
                ).catch(
                    (err) => {
                        console.log(err.message);
                    }
                );
            },

            registerSurveyMarker(oldName, oldIndex, newName) {

                this.$store.state.surveyMarkers[oldName][oldIndex].selected = false;
                this.$store.state.surveyMarkers[oldName][oldIndex].targeted = false;
                this.$store.state.surveyMarkers[oldName][oldIndex].polygonDraggable = false;
                this.$store.state.surveyMarkers[oldName][oldIndex].polygonEditable = false;

                this.$store.state.surveyMarkers[newName].push(
                    JSON.parse(JSON.stringify(this.$store.state.surveyMarkers[oldName][oldIndex]))
                );
                this.$store.state.surveyMarkers[oldName].splice(oldIndex, 1);

                this.postCinSurveyMarkerInfoToMobius(newName);

                this.postCinSurveyMarkerInfoToMobius(oldName);

                this.snackbar = true;

                setTimeout(() => {
                    this.resetForm();
                }, 100);
            },

            submit() {
                if(!Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers, this.targetSelectName)) {
                    this.$store.state.surveyMarkers[this.targetSelectName] = [];

                    let url = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/SurveyMarkerInfos';
                    this.postCntToMobius(url, this.targetSelectName, () => {
                        let url = 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/SurveyMarkerInfos/' + this.targetSelectName;
                        this.postCinToMobius(url, this.$store.state.surveyMarkers[this.targetSelectName], () => {
                            this. registerSurveyMarker(this.markerName, this.markerIndex, this.targetSelectName);
                        });
                    });
                }
                else {
                    this. registerSurveyMarker(this.markerName, this.markerIndex, this.targetSelectName);
                }
            },
        },

        created() {
            this.targets = [];

            for (var dName in this.$store.state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                    if (dName === 'unknown' || this.$store.state.drone_infos[dName].selected) {
                        this.targets.push(dName);
                    }
                }
            }
        },

        mounted() {
            this.targetSelectName = this.markerName;
            this.targetSelectIndex = String(this.markerIndex);

            if (!Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers[this.markerName][this.markerIndex], 'wayOfSurvey')) {
                this.$store.state.surveyMarkers[this.markerName][this.markerIndex].wayOfSurvey = 'forShooting';
            }

            this.wayOfSurvey = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].wayOfSurvey;

            this.paramAngle = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].angle;
            this.paramDir = (this.$store.state.surveyMarkers[this.markerName][this.markerIndex].dir === 1) ? 'cw' : 'ccw';
            this.paramGap = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].gap;
            this.paramAlt = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].paramAlt;
            this.paramOffsetAlt = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].paramOffsetAlt;

            if(this.markerName === 'unknown') {
                this.paramStartAlt = 0;
            }
            else {
                this.paramStartAlt = parseInt(this.$store.state.drone_infos[this.markerName].absolute_alt - this.$store.state.drone_infos[this.markerName].alt);
            }

            this.flyAltType = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].flyAltType;

            if (!Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers[this.markerName][this.markerIndex], 'focal')) {
                this.$store.state.surveyMarkers[this.markerName][this.markerIndex].focal = 16;
            }

            if (!Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers[this.markerName][this.markerIndex], 'sensor_w')) {
                this.$store.state.surveyMarkers[this.markerName][this.markerIndex].sensor_w = 23.5;
            }

            if (!Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers[this.markerName][this.markerIndex], 'sensor_h')) {
                this.$store.state.surveyMarkers[this.markerName][this.markerIndex].sensor_h = 15.6;
            }

            if (!Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers[this.markerName][this.markerIndex], 'overlap')) {
                this.$store.state.surveyMarkers[this.markerName][this.markerIndex].overlap = 0.7;
            }

            if (!Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers[this.markerName][this.markerIndex], 'speed')) {
                this.$store.state.surveyMarkers[this.markerName][this.markerIndex].speed = 5;
            }

            if (!Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers[this.markerName][this.markerIndex], 'period')) {
                this.$store.state.surveyMarkers[this.markerName][this.markerIndex].period = 5;
            }

            if (!Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers[this.markerName][this.markerIndex], 'total_dist')) {
                this.$store.state.surveyMarkers[this.markerName][this.markerIndex].total_dist = 400;
            }

            this.total_count = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].pathLines.length-2;
            this.total_dist = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].total_dist;
            this.paramFocal = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].focal;
            this.paramSensorW = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].sensor_w;
            this.paramSensorH = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].sensor_h;
            this.paramOverlap = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].overlap;
            this.paramSpeed = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].speed;
            this.paramPeriod = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].period;

            if(this.wayOfSurvey === 'forShooting') {
                let result = this.calcFactorSurvey(this.paramFocal, this.paramSensorH, this.paramOverlap, this.paramAlt, this.paramSpeed);
                this.paramGap = parseInt(result.interval_l * (this.paramSensorW / this.paramSensorH));
                this.$store.state.surveyMarkers[this.markerName][this.markerIndex].gap = this.paramGap;

                this.paramPeriod = parseInt(result.interval_t);
                this.$store.state.surveyMarkers[this.markerName][this.markerIndex].period = this.paramPeriod;

                this.changeGapSurveyPath(this.paramGap);
            }

            if(!Object.prototype.hasOwnProperty.call(this.$store.state.surveyMarkers[this.markerName][this.markerIndex], 'area')) {
                this.$store.state.surveyMarkers[this.markerName][this.markerIndex].area = 0;
            }
            this.area = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].area;

            console.log('InfoSurveyMarker', this.$store.state.surveyMarkers[this.markerName]);

            EventBus.$on('on-update-info-survey-marker', () => {
                this.area = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].area;
                this.total_dist = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].total_dist;
                this.total_count = this.$store.state.surveyMarkers[this.markerName][this.markerIndex].pathLines.length-2;

                this.fillElevationData();

                //this.$forceUpdate();
            });
        },

        beforeDestroy() {
            EventBus.$off('on-update-info-survey-marker');

            if(this.myChart) {
                this.myChart.destroy();
            }
        }
    }
</script>

<style scoped>

</style>