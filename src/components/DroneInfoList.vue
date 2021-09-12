<template>
    <div>
        <v-row no-gutters>
            <v-col cols="12" sm="6" md="2" class="drone_list">
                <v-card flat tile outlined color="#E8F5E9">
                    <v-card ref="prev" flat tile class="overflow-y-auto" :style="listHeight" :min-width="myMinWidth+'px'">
                        <v-card flat tile outlined>
                            <v-switch
                                    v-model="distanceMonitor"
                                    label="드론간 근접감시"
                                    color="warning"
                                    class="ma-0 pa-0 pl-2 py-2"
                                    hide-details
                            ></v-switch>
                        </v-card>
                        <v-card flat tile v-for="drone in $store.state.drone_infos" :key="drone.id">
                            <div v-if="drone.selected">
                                <DroneInfo
                                    :broker="drone.host"
                                    v-bind:name="drone.name"
                                    :id="drone.id"
                                    :gcs="drone.gcs"
                                    :sortie="'unknown'"
                                    :bat_cell="drone.bat_cell"
                                    :goto_positions="drone.goto_positions"
                                    v-bind:airspeed_size="myWidth*0.4"
                                    v-bind:heading_size="myWidth*0.4"
                                    v-bind:attitude_size="myWidth*0.4"
                                    :lng="drone.lng"
                                    :lat="drone.lat"
                                    :ref_sys_id="drone.system_id"
                                    :myWidth="myWidth"
                                ></DroneInfo>
                            </div>
                        </v-card>
                    </v-card>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="9">
                <v-card flat tile outlined color="#E8F5E9">
                    <DroneCommand></DroneCommand>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>
    // import MuvMqtt from "./MuvMqtt";
    import DroneInfo from "./DroneInfo";
    import DroneCommand from "./DroneCommand";
    import EventBus from "@/EventBus";
    // import axios from "axios";

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
        if (code == "toXY") {
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
        name: "DroneInfoList",

        components: {
            // MuvMqtt,
            DroneInfo,
            DroneCommand
        },

        data: function() {
            return {
                myHeight: window.innerHeight-50,
                myWidth: 400,
                drones_selected: [],
                candidate: {},
                distanceMonitor: false,
                myMinWidth: 360,
            };
        },

        computed: {
            listHeight() {
                return ("max-height: " + (this.myHeight) + "px");
            }
        },

        watch: {

        },

        methods: {
            onResize() {
                this.myWidth = this.$refs.prev.$el.clientWidth;

                this.$store.commit('setCommandTabLeftX', this.myWidth);

                this.myHeight = window.innerHeight-50;

                this.$store.state.command_tab_max_height = this.myHeight-50;

                console.log('DroneInfoList-onResize', this.myWidth, this.myHeight);
            },
        },

        mounted() {
            window.addEventListener('resize', this.onResize);


            setTimeout(this.onResize, 3000);

            EventBus.$on('onResize-DroneInfoList', () => {
                this.onResize();
            });

            // setInterval(() => {
            //     if(this.$store.state.MOBIUS_CONNECTION_CONNECTED) {
            //         axios({
            //             validateStatus: function (status) {
            //                 // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
            //                 return status < 500;
            //             },
            //             method: 'post',
            //             url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/Info',
            //             headers: {
            //                 'X-M2M-RI': String(parseInt(Math.random() * 10000)),
            //                 'X-M2M-Origin': 'SVue',
            //                 'Content-Type': 'application/json;ty=4'
            //             },
            //             data: {
            //                 'm2m:cin': {
            //                     con: this.$store.state.drone_infos
            //                 }
            //             }
            //         }).then(
            //             function (res) {
            //                 console.log('setFlyingDroneInfo-axios', res.data);
            //             }
            //         ).catch(
            //             function (err) {
            //                 console.log(err.message);
            //             }
            //         );
            //     }
            // }, 60000);

            setInterval(() => {
                if(this.distanceMonitor) {
                    const keys = Object.keys(this.$store.state.curDronePositions);

                    if (keys.length >= 2) {
                        this.candidate = null;
                        this.candidate = {};
                        for (let i = 0; i < keys.length - 1; i++) {
                            for (let j = i + 1; j < keys.length; j++) {
                                const keyA = keys[i];
                                const keyB = keys[j];
                                const diff_alt = Math.abs(this.$store.state.curDronePositions[keyA].alt - this.$store.state.curDronePositions[keyB].alt);
                                const diff_lat = Math.abs(this.$store.state.curDronePositions[keyA].lat - this.$store.state.curDronePositions[keyB].lat);
                                const diff_lng = Math.abs(this.$store.state.curDronePositions[keyA].lng - this.$store.state.curDronePositions[keyB].lng);

                                //console.log(keyA, ' --- ', keyB, '---', diff_alt, diff_lat, diff_lng);

                                if (diff_alt < 2000) {
                                    if (diff_lat < 600) {
                                        if (diff_lng < 600) {

                                            var cur_lat = this.$store.state.curDronePositions[keyA].lat / 10000000;
                                            var cur_lon = this.$store.state.curDronePositions[keyA].lng / 10000000;
                                            var cur_alt = this.$store.state.curDronePositions[keyA].alt / 1000;

                                            var result1 = dfs_xy_conv('toXY', cur_lat, cur_lon);

                                            var tar_lat = this.$store.state.curDronePositions[keyB].lat / 10000000;
                                            var tar_lon = this.$store.state.curDronePositions[keyB].lng / 10000000;
                                            var tar_alt = this.$store.state.curDronePositions[keyB].alt / 1000;

                                            var result2 = dfs_xy_conv('toXY', tar_lat, tar_lon);

                                            let dist = Math.sqrt(Math.pow(result2.x - result1.x, 2) + Math.pow(result2.y - result1.y, 2) + Math.pow((tar_alt - cur_alt), 2));

                                            //console.log(keyA, ' --- ', dist , '---', keyB, '---', diff_alt, diff_lat, diff_lng);

                                            if (dist < 5) {
                                                if ((this.$store.state.curDronePositions[keyA].brake === false) || (this.$store.state.curDronePositions[keyB].brake === false)) {
                                                    console.log(keyA, ' --- ', dist, '---', keyB, '---', diff_alt, diff_lat, diff_lng);
                                                    EventBus.$emit('command-set-mode-' + keyA, 'BRAKE');
                                                    EventBus.$emit('command-set-mode-' + keyB, 'BRAKE');
                                                    this.$store.state.curDronePositions[keyA].brake = true;
                                                    this.$store.state.curDronePositions[keyB].brake = true;
                                                }
                                            }
                                            else {
                                                if ((this.$store.state.curDronePositions[keyA].brake === true) && (this.$store.state.curDronePositions[keyB].brake === true)) {
                                                    this.$store.state.curDronePositions[keyA].brake = false;
                                                    this.$store.state.curDronePositions[keyB].brake = false;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }, 100);

            EventBus.$on('gcs-map-ready', () => {
                this.drones_selected = null;
                this.drones_selected = [];
                for(let name in this.$store.state.drone_infos) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                        if(this.$store.state.drone_infos[name].selected) {
                            this.drones_selected.push(this.$store.state.drone_infos[name]);
                        }
                    }
                }
            });

            EventBus.$on('confirm_selected', (selected) => {

                EventBus.$emit('clearDroneMarker', '');

                this.drones_selected = null;
                this.drones_selected = [];
                for(let idx in selected) {
                    if (Object.prototype.hasOwnProperty.call(selected, idx)) {
                        this.drones_selected.push(this.$store.state.drone_infos[selected[idx].name]);

                        console.log('confirm_selected', this.$store.state.drone_infos[selected[idx].name].home_position);

                        // console.log('droneColorMap', this.$store.state.droneColorMap);
                        //console.log('confirm-selected', this.$store.state.droneColorMap[selected[idx].name]);

                        // let payload = {};
                        // payload.lat = this.drones_selected[d_idx-1].lat;
                        // payload.lng = this.drones_selected[d_idx-1].lng;
                        // payload.heading = this.drones_selected[d_idx-1].heading;
                        // EventBus.$emit('initialize-' + this.drones_selected[d_idx-1].name, JSON.parse(JSON.stringify(payload)));
                        // payload = null;

                        let payload = {};
                        payload.lat = parseFloat(this.$store.state.drone_infos[selected[idx].name].lat);
                        payload.lng = parseFloat(this.$store.state.drone_infos[selected[idx].name].lng);
                        payload.alt = 100.0;
                        payload.heading = 0;
                        EventBus.$emit('initialize-' + selected[idx].name, JSON.parse(JSON.stringify(payload)));
                        payload = null;
                    }
                }
                selected = null;

                setTimeout(this.onResize, 500);
            });
        }
    }
</script>

<style scoped>
    .drone_list {
        position: absolute;
        left: 0;
        top: 0;
        opacity: 0.85;
        z-index: 2;
        width: 100%;
    }
</style>