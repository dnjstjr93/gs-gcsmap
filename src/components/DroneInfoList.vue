<template>
    <div>
        <v-row no-gutters>
            <v-col cols="12" sm="6" md="2" class="drone_list">
                <v-card flat tile outlined color="#E8F5E9" :min-width="(myMinWidth+1)+'px'" :width="myMinWidth+'px'" :max-width="myMinWidth+'px'">
                    <v-card ref="prev" flat tile class="overflow-y-auto" :style="listHeight" :min-width="(myMinWidth+1)+'px'" :width="myMinWidth+'px'" :max-width="myMinWidth+'px'">
                        <v-card flat tile outlined>
                            <v-row no-gutters justify="center" align="center">
                                <v-col cols="4">
                                    <v-switch
                                        dense hide-details
                                        v-model="distanceMonitor"
                                        label="드론근접감시"
                                        color="warning"
                                        class="ma-0 pa-0 pl-1 py-1"
                                    ></v-switch>
                                </v-col>
                                <v-col cols="3">
                                    <v-switch
                                        dense hide-details
                                        v-model="ADSBMonitor"
                                        label="ADS-B"
                                        color="warning"
                                        class="ma-0 pa-0 pl-1 py-1"
                                        @change="switchADSBMonitor($event)"
                                    ></v-switch>
                                </v-col>
                                <v-col cols="2" class="text-right pr-1" >
                                    <v-card class="pr-1" outlined tile>
                                        <span style="font-size: 14px">{{ strMouse }}</span>
                                    </v-card>
                                </v-col>
                                <v-col cols="3" class="text-right" >
                                    <v-btn class="mr-2" x-small @click.stop="zoomNormal">
                                        <v-icon small>
                                            mdi-magnify-minus-outline
                                        </v-icon>
                                    </v-btn>
                                    <v-btn class="mr-2" x-small @click.stop="zoomDouble">
                                        <v-icon small>
                                            mdi-magnify-plus-outline
                                        </v-icon>
                                    </v-btn>
                                </v-col>
                            </v-row>
                            <v-card v-if=!$store.state.client.connected class="py-3 px-2" color="orange">
                                <span class="text-h5 font-weight-bold">Connection Failed!!!</span>
                            </v-card>
                        </v-card>
                        <v-card flat tile v-for="drone in $store.state.drone_infos" :key="drone.id">
                            <div v-if="drone.selected">
                                <DroneInfo
                                    :broker="drone.host"
                                    v-bind:name="drone.name"
                                    :id="drone.id"
                                    :gcs="drone.gcs"
                                    :sortie="drone.sortie_name"
                                    :bat_cell="drone.bat_cell"
                                    :goto_positions="drone.goto_positions"
                                    v-bind:airspeed_size="myWidth*0.45"
                                    v-bind:heading_size="myWidth*0.45"
                                    v-bind:attitude_size="myWidth*0.45"
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
                <v-card flat tile color="#E8F5E9">
                    <DroneCommand></DroneCommand>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="9">
                <v-card flat tile>
                    <DroneAlt></DroneAlt>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>
    // import MuvMqtt from "./MuvMqtt";
    import DroneInfo from "./DroneInfo";
    import DroneCommand from "./DroneCommand";
    import DroneAlt from "@/components/DroneAlt";
    import EventBus from "@/EventBus";
    import {nanoid} from "nanoid";
    import mqtt from "mqtt";
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
        name: "DroneInfoList",

        components: {
            // MuvMqtt,
            DroneInfo,
            DroneCommand,
            DroneAlt
        },

        data: function() {
            return {
                strMouse: 'NaN',
                myHeight: window.innerHeight-50,
                myWidth: 480,
                drones_selected: [],
                candidate: {},
                distanceMonitor: false,
                ADSBMonitor: false,
                myMinWidth: 480,
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
                //drone_topic: {},
                broadcast_topic: {},
                droneSubscribeSuccess: {},
                //wsUrl: 'wss://' + 'webrtc.intellicode.info:443' + '/webRTC',
                wsUrl: 'wss://' + 'gcs.iotocean.org:7598' + '/webRTC',
                ws: null,
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
                console.log(this.myWidth);

                this.$store.commit('setCommandTabLeftX', this.myWidth);

                this.myHeight = window.innerHeight-51;

                this.$store.state.command_tab_max_height = this.myHeight-50;
                this.$store.state.command_tab_max_width = window.innerWidth-this.myWidth;

                console.log('DroneInfoList-onResize', this.$store.state.command_tab_max_width, this.myWidth, this.myHeight);

                for(let dName in this.$store.state.drone_infos) {
                    if(Object.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        if(this.$store.state.drone_infos[dName].selected) {
                            let payload = {};
                            payload.width = this.myWidth;
                            //payload.height = parseInt((this.myWidth*9)/16);
                            // payload.height = parseInt((payload.width*3)/4)+parseInt(((payload.width*3)/4)*0.08);
                            payload.height = parseInt((payload.width*3)/4);

                            EventBus.$emit('do-video-size-' + dName, payload);
                        }
                    }
                }
            },

            createConnection() {
                if (this.$store.state.client.connected) {
                    console.log('DroneInfoList - destroyConnection')
                    this.destroyConnection();
                }

                if (!this.$store.state.client.connected) {
                    //var self = this;

                    this.$store.state.client.loading = true;
                    this.connection.clientId = 'mqttjs_' + this.name + '_' + nanoid(15);
                    this.connection.host = this.$store.state.VUE_APP_MOBIUS_HOST;
                    const {host, port, endpoint, ...options} = this.connection;
                    const connectUrl = `ws://${host}:${port}${endpoint}`
                    try {
                        this.$store.state.client = mqtt.connect(connectUrl, options);

                        this.$store.state.client.on('connect', () => {
                            console.log(host, 'DroneInfoList Connection succeeded!');

                            this.$store.state.client.connected = true;

                            // if(this.subscribeSuccess) {
                            //     this.doUnSubscribe()
                            // }

                            this.$store.state.client.loading = false;

                            localStorage.setItem('mqttConnection-DroneInfoList', JSON.stringify(this.$store.state.client));

                            for(let dName in this.$store.state.drone_infos) {
                                if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                                    if(dName === 'unknown') {
                                        continue;
                                    }

                                    //this.drone_topic[dName] = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/Drone_Data/' + dName + '/#';
                                    //this.doUnSubscribe(this.drone_topic[dName]);
                                    this.broadcast_topic[dName] = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/' + dName;
                                    this.doUnSubscribe(this.broadcast_topic[dName]);
                                }
                            }

                            let broadcast_gcsmap_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/gcsmap';
                            this.doUnSubscribe(broadcast_gcsmap_topic);

                            setTimeout(() => {
                                for(let dName in this.$store.state.drone_infos) {
                                    if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                                        if(dName === 'unknown') {
                                            continue;
                                        }

                                        if(this.$store.state.drone_infos[dName].selected) {
                                            //this.doSubscribe(this.drone_topic[dName]);
                                            //console.log('DroneInfoList-drone_topic - Subscribe to ', this.drone_topic[dName]);

                                            this.doSubscribe(this.broadcast_topic[dName]);
                                            console.log('DroneInfoList-broadcast_topic - Subscribe to ', this.broadcast_topic[dName]);
                                        }
                                    }
                                }

                                let broadcast_gcsmap_topic = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/gcsmap';
                                this.doSubscribe(broadcast_gcsmap_topic);
                                console.log('DroneInfoList-gcsmap_topic - Subscribe to ', broadcast_gcsmap_topic);
                            }, 200);
                        });

                        this.$store.state.client.on('error', (error) => {
                            console.log('Drone Connection failed', error);

                            this.destroyConnection();
                        });

                        this.$store.state.client.on('close', () => {
                            console.log('Drone Connection closed');

                            this.destroyConnection();

                            this.connection.clientId = 'mqttjs_' + this.name + '_' + nanoid(15);
                        });

                        this.$store.state.client.on('message', (topic, message) => {
                            // this.receiveNews = this.receiveNews.concat(message)
                            //console.log(`Received message ${message} from topic ${topic}`);

                            //console.log(topic.split('/')[4], message.toString());

                            let payload = {};
                            payload.topic = topic;
                            payload.message = message;

                            EventBus.$emit('on-message-handler-' + topic.split('/')[4], payload);
                        });
                    }
                    catch (error) {
                        console.log('mqtt.connect error', error);
                        this.$store.state.client.connected = false;
                    }
                }
            },
            doSubscribe(topic) {
                if (this.$store.state.client.connected) {
                    const qos = 0;
                    this.$store.state.client.subscribe(topic, {qos}, (error) => {
                        if (error) {
                            console.log('Subscribe to topics error', error)
                            return;
                        }

                        console.log('Subscribe to topics (', topic, ')');
                        this.droneSubscribeSuccess[topic] = true;
                    });
                }
            },
            doUnSubscribe(topic) {
                if (this.$store.state.client.connected) {
                    if(Object.hasOwnProperty.call(this.droneSubscribeSuccess, topic)) {
                        if(this.droneSubscribeSuccess[topic]) {
                            this.$store.state.client.unsubscribe(topic, error => {
                                if (error) {
                                    console.log('Unsubscribe error', error)
                                }

                                console.log('Unsubscribe to topics (', topic, ')');
                                this.droneSubscribeSuccess[topic] = false;
                            });
                        }
                    }
                }
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
            destroyConnection() {
                if (this.$store.state.client.connected) {
                    try {
                        if(Object.hasOwnProperty.call(this.$store.state.client, '__ob__')) {
                            this.$store.state.client.end();
                        }
                        this.$store.state.client = {
                            connected: false,
                        }
                        console.log(this.name, 'Successfully disconnected!');

                        localStorage.setItem('mqttConnection-DroneInfoList', JSON.stringify(this.$store.state.client));
                    }
                    catch (error) {
                        console.log('Disconnect failed', error.toString())
                    }
                }
            },
            zoomDouble() {
                this.myMinWidth = 640;

                setTimeout(() => {
                    this.onResize();
                }, 50);
            },
            zoomNormal() {
                this.myMinWidth = 480;

                setTimeout(() => {
                    this.onResize();
                }, 50);
            },

            switchADSBMonitor(e) {
                this.ADSBMonitor = e;
                EventBus.$emit('ClickADSBMonitor', this.ADSBMonitor);
            },

        },

        created() {
            for(let dName in this.$store.state.drone_infos) {
                if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos[dName], 'sortie')) {
                        this.$store.state.drone_infos[dName].sortie_name = 'unknown';
                    }

                    if(this.$store.state.drone_infos[dName].selected) {
                        if (localStorage.getItem(this.$store.state.drone_infos[dName].name + '_sortie_name')) {
                            this.$store.state.drone_infos[dName].sortie_name = localStorage.getItem(this.name + '_sortie_name');
                        } else {
                            this.$store.state.drone_infos[dName].sortie_name = 'disarm';
                            localStorage.setItem(this.$store.state.drone_infos[dName].name + '_sortie_name', this.$store.state.drone_infos[dName].sortie_name);
                        }
                    }
                }
            }
        },

        mounted() {
            window.addEventListener('resize', this.onResize);

            setTimeout(this.onResize, 2000);

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

            // setInterval(() => {
            //     EventBus.$emit('ClickADSBMonitor', this.ADSBMonitor);
            // }, 100);

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

                                            let cur_lat = this.$store.state.curDronePositions[keyA].lat / 10000000;
                                            let cur_lon = this.$store.state.curDronePositions[keyA].lng / 10000000;
                                            let cur_alt = this.$store.state.curDronePositions[keyA].alt / 1000;
                                            let result1 = dfs_xy_conv('toXY', cur_lat, cur_lon);

                                            let tar_lat = this.$store.state.curDronePositions[keyB].lat / 10000000;
                                            let tar_lon = this.$store.state.curDronePositions[keyB].lng / 10000000;
                                            let tar_alt = this.$store.state.curDronePositions[keyB].alt / 1000;
                                            let result2 = dfs_xy_conv('toXY', tar_lat, tar_lon);

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

                for (let dName in this.$store.state.drone_infos) {
                    if (Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        if (Object.prototype.hasOwnProperty.call(this.$store.state.rtlModeMonitor, dName)) {
                            if(this.$store.state.rtlModeMonitor[dName]) {
                                if (this.$store.state.drone_infos[dName].selected &&
                                    this.$store.state.drone_infos[dName].curMode === 'RTL' &&
                                    this.$store.state.drone_infos[dName].curArmStatus === 'ARMED') {

                                    if (parseInt(this.$store.state.params.wpYawBehavior[dName]) !== 1) {
                                        EventBus.$emit('setWpYawBehavior', 1);
                                    }
                                }
                            }
                        }
                    }
                }
            }, 1000);

            EventBus.$on('gcs-map-ready', () => {

                this.$store.state.commands = [];
                this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['모드']]);
                this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['설정']]);
                this.$store.state.commands.push(this.$store.state.command_menus[this.$store.state.menus['이륙']]);

                this.drones_selected = null;
                this.drones_selected = [];
                for(let name in this.$store.state.drone_infos) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, name)) {
                        if(this.$store.state.drone_infos[name].selected) {
                            this.drones_selected.push(this.$store.state.drone_infos[name]);
                        }
                    }
                }

                if (localStorage.getItem('mqttConnection-DroneInfoList')) {
                    if (JSON.parse(localStorage.getItem('mqttConnection-DroneInfoList')).connected) {
                        this.$store.state.client = JSON.parse(localStorage.getItem('mqttConnection-DroneInfoList'));
                        console.log('DroneInfoList', 'client', this.$store.state.client);

                        this.$store.state.client = {
                            connected: false,
                        }

                        localStorage.setItem('mqttConnection-DroneInfoList', JSON.stringify(this.$store.state.client));
                    }
                }
                else {
                    this.$store.state.client = {
                        connected: false,
                    }
                }

                this.createConnection();
            });

            EventBus.$on('confirm_selected', (selected) => {

                EventBus.$emit('clearDroneMarker', '');

                EventBus.$emit('do-refresh-DroneAlt');

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

                for(let dName in this.$store.state.drone_infos) {
                    if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                        if(dName === 'unknown') {
                            continue;
                        }

                        //this.drone_topic[dName] = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/Drone_Data/' + dName + '/#';
                        //this.doUnSubscribe(this.drone_topic[dName]);
                        this.broadcast_topic[dName] = '/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/watchingMission/' + dName;
                        this.doUnSubscribe(this.broadcast_topic[dName]);

                        if(this.$store.state.drone_infos[dName].selected) {
                            //this.doSubscribe(this.drone_topic[dName]);
                            //console.log('DroneInfoList-broadcast_topic - Subscribe to ', this.drone_topic[dName]);

                            this.doSubscribe(this.broadcast_topic[dName]);
                            console.log('DroneInfoList-broadcast_topic - Subscribe to ', this.broadcast_topic[dName]);
                        }
                    }
                }

                setTimeout(this.onResize, 500);
            });

            EventBus.$on('ws-connect', () => {
                this.ws = new WebSocket(this.wsUrl);

                this.ws.onopen = () => {
                    console.log('WebRTC server connected');
                };

                this.ws.onclose = () => {
                    console.log("Server is already in CLOSING or CLOSED state.\nPlease refresh the page after running the server.");

                    for(let dName in this.$store.state.drone_infos) {
                        if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                            if(dName === 'unknown') {
                                continue;
                            }

                            if(this.$store.state.drone_infos[dName].selected) {
                                EventBus.$emit('do-video-close-' + dName);
                            }
                        }
                    }

                    this.ws.close();
                    this.ws = null;

                    setTimeout(() => {
                        EventBus.$emit('ws-connect');
                    }, (2 * 1000 * 60));
                };

                this.ws.onmessage = (message) => {
                    let parsedMessage = JSON.parse(message.data);
                    let droneName = parsedMessage.droneName;

                    EventBus.$emit('ws-on-message-' + droneName, parsedMessage);
                };
            });

            EventBus.$on('ws-send-message', (message) => {
                let jsonMessage = JSON.stringify(message);
                if (this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(jsonMessage);
                }
            });

            EventBus.$on('do-calcDistance', (datum) => {
                if(datum.targeted) {
                    //console.log(datum);

                    let cur_lat = datum.lat;
                    let cur_lon = datum.lng;
                    let result1 = dfs_xy_conv('toXY', cur_lat, cur_lon);

                    let tar_lat = datum.curLat;
                    let tar_lon = datum.curLng;
                    let result2 = dfs_xy_conv('toXY', tar_lat, tar_lon);

                    let dist = Math.sqrt(Math.pow(result2.x - result1.x, 2) + Math.pow(result2.y - result1.y, 2));

                    if (dist > 1000) {
                        this.strMouse = 'd: ' + (dist / 1000).toFixed(1) + ' km';
                    } else {
                        this.strMouse = 'd: ' + dist.toFixed(1) + ' m';
                    }
                }
                else {
                    this.strMouse = 'NaN';
                }
            });

            EventBus.$emit('ws-connect');
        },

        beforeDestroy() {
            this.destroyConnection();

            this.ws.close();

            EventBus.$off('onResize-DroneInfoList');
            EventBus.$off('gcs-map-ready');
            EventBus.$off('confirm_selected');
            EventBus.$off('ws-send-message');
            EventBus.$off('do-calcDistance');
        }
    }
</script>

<style scoped>
    .drone_list {
        position: absolute;
        left: 0;
        top: 0;
        opacity: 1;
        z-index: 2;
        width: 100%;
    }
</style>
