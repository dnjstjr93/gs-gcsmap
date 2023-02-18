<template>
    <div>
        <v-app-bar app color="success" dark dense>
            <v-toolbar-title>
                <v-row no-gutters align="center">
                    <v-icon left>mdi-monitor-dashboard</v-icon>
                    PUREUN AIR
                </v-row>
            </v-toolbar-title>

            <v-spacer></v-spacer>

            <v-btn text>
                <v-icon>mdi-monitor-arrow-down-variant</v-icon>
            </v-btn>
        </v-app-bar>
        <v-container>
            <v-row class="text-center">
                <v-col cols="7">
                    <v-card
                        class="mx-auto my-4"
                    >
                        <v-list-item two-line>
                            <v-list-item-content>
                                <v-list-item-title class="text-h5">
                                    내부 온습도
                                </v-list-item-title>
                                <v-list-item-subtitle>{{curTime}}</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>

                        <v-card-text>
                            <v-row align="center">
                                <v-col class="text-h2" cols="4">
                                    <span :class="tempColor">{{curTemperature}}</span>&deg;C
                                </v-col>
                                <v-icon size="92" color="orange">mdi-thermometer</v-icon>
                                <v-col class="text-h2" cols="4">
                                    <span :class="humiColor">{{curHumidity}}%</span>
                                </v-col>
                                <v-icon size="92" color="green">mdi-water-percent</v-icon>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="5">
                    <v-card class="mx-auto my-4">
                        <v-list-item two-line>
                            <v-list-item-content>
                                <v-list-item-title class="text-h5">
                                    온수 온도
                                </v-list-item-title>
                                <v-list-item-subtitle>{{curTime}}</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>

                        <v-card-text>
                            <v-row align="center">
                                <v-col class="text-h2" cols="8">
                                    <span :class="waterColor">{{curWaterTemperature}}&deg;C</span>
                                </v-col>
                                <v-icon size="92" color="blue">mdi-thermometer</v-icon>
    <!--                            <v-col cols="6">-->
    <!--                                <v-img-->
    <!--                                    :src="require('../assets/thermometer.svg')"-->
    <!--                                    alt="Water Temperature image"-->
    <!--                                    width="92"-->
    <!--                                ></v-img>-->
    <!--                            </v-col>-->
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
<!--            <v-switch-->
<!--                class="pl-4"-->
<!--                v-model="AUTO_MODE"-->
<!--                inset-->
<!--                :label="`AUTO_MODE: ${AUTO_MODE.toString()}`"-->
<!--            ></v-switch>-->
            <v-row class="text-center">
                <v-col cols="2">
                    <v-card flat outlined>
                        <v-switch
                            class="pl-3"
                            v-model="AUTO_MODE"
                            inset
                            :label="`AUTO: ${AUTO_MODE===true?'ON':'OFF'}`"
                            @change="controlAuto($event)"
                        ></v-switch>
<!--                        <v-btn-->
<!--                            class="ma-0"-->
<!--                            :loading="loading2"-->
<!--                            :disabled="loading2"-->
<!--                            color="success"-->
<!--                            @click="loader = 'loading2'"-->
<!--                        >-->
<!--                            Custom Loader-->
<!--                            <template v-slot:loader>-->
<!--                                <span>Loading...</span>-->
<!--                            </template>-->
<!--                        </v-btn>-->
                    </v-card>
                </v-col>
                <v-col cols="2">
                    <v-card flat outlined color="red lighten-5">
                        <v-switch
                            class="pl-3"
                            v-model="ctrlHeater"
                            color="red darken-3"
                            :disabled="AUTO_MODE"
                            :label="`HEATER: ${ctrlHeater===true?'ON':'OFF'}`"
                            @change="controlHeater($event)"
                        ></v-switch>
                    </v-card>
                </v-col>
                <v-col cols="2">
                    <v-card flat outlined color="indigo lighten-5">
                        <v-switch
                            class="pl-3"
                            v-model="ctrlAir"
                            color="indigo darken-3"
                            :label="`AIR: ${ctrlAir===true?'ON':'OFF'}`"
                            @change="controlAir($event)"
                        ></v-switch>
                    </v-card>
                </v-col>
                <v-col cols="2">
                    <v-card flat outlined color="orange lighten-5">
                        <v-switch
                            class="pl-3"
                            v-model="ctrlPump"
                            color="orange darken-3"
                            :label="`PUMP: ${ctrlPump===true?'ON':'OFF'}`"
                            @change="controlPump($event)"
                        ></v-switch>
                    </v-card>
                </v-col>
                <v-col cols="2">
                    <v-card flat outlined color="success lighten-5">
                        <v-switch
                            class="pl-3"
                            v-model="ctrlFan"
                            color="success darken-3"
                            :label="`FAN: ${ctrlFan===true?'ON':'OFF'}`"
                            @change="controlFan($event)"
                        ></v-switch>
                    </v-card>
                </v-col>
                <v-col cols="2">
                    <v-card flat outlined color="info lighten-5">
                        <v-switch
                            class="pl-3"
                            v-model="ctrlSpray"
                            color="info darken-3"
                            :label="`SPRAY: ${ctrlSpray===true?'ON':'OFF'}`"
                            @change="controlSpray($event)"
                        ></v-switch>
                    </v-card>
                </v-col>

<!--                        <v-list-item two-line>-->
<!--                            <v-list-item-content>-->
<!--                                <v-list-item-title class="text-h4">-->
<!--                                    자동 모드-->
<!--                                </v-list-item-title>-->
<!--                                <v-list-item-subtitle>{{curTime}}</v-list-item-subtitle>-->
<!--                            </v-list-item-content>-->
<!--                        </v-list-item>-->

<!--                        <v-card-text>-->
<!--                            <v-row class="text-center">-->
<!--                                <v-col class="text-h5 text-left" cols="12">-->
<!--                                    <p>히터작동조건 : 물온도 24도 유지(수정가능)</p>-->
<!--                                    <p>브로워작동조건 : 시간당 10분(수정가능)</p>-->
<!--                                    <p>순환펌프 : (상시가동)</p>-->
<!--                                    <p>상부팬 가동조건 : 습도 90% 유지(수정가능)</p>-->
<!--                                    <p>스프레이 작동조건 : 시간당 10분(수정가능)</p>-->
<!--                                </v-col>-->
<!--                            </v-row>-->
<!--                        </v-card-text>-->
                <v-col cols="12">
                    <v-card :disabled="AUTO_MODE" class="mx-auto my-4">
                        <v-list-item two-line>
                            <v-list-item-content>
                                <v-list-item-title class="text-h4">
                                    자동 모드
                                </v-list-item-title>
                                <v-list-item-subtitle>{{curTime}}</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                        <v-card-text class="text-center">
                            <v-row class="text-center justify-center no-gutters pa-1">
                                <v-col class="text-h5 px-1" cols="3">
                                    <v-card class="text-right" flat>히터작동조건: </v-card>
                                </v-col>
                                <v-col class="text-h5 px-1" cols="1">
                                    <v-card class="text-left" flat>물온도</v-card>
                                </v-col>
                                <v-col class="text-h5 px-1 text-left" cols="1">
                                    <v-card class="text-right" flat>
                                        <v-text-field
                                            class="text-field-size" outlined dense hide-details flat
                                            type="number" step="0.1"
                                            v-model="autoWater"
                                        ></v-text-field>
                                    </v-card>
                                </v-col>
                                <v-col class="text-h5 px-1 text-left" cols="3">
                                    <span>도 유지</span>
                                </v-col>
                            </v-row>
                            <v-row class="text-center justify-center no-gutters pa-1">
                                <v-col class="text-h5 px-1" cols="3">
                                    <v-card class="text-right" flat>브로워작동조건: </v-card>
                                </v-col>
                                <v-col class="text-h5 px-1" cols="1">
                                    <v-card class="text-left" flat>시간당</v-card>
                                </v-col>
                                <v-col class="text-h5 px-1 text-left" cols="1">
                                    <v-card class="text-right" flat>
                                        <v-text-field
                                            class="text-field-size" outlined dense hide-details flat
                                            type="number" step="1"
                                            v-model="autoAir"
                                        ></v-text-field>
                                    </v-card>
                                </v-col>
                                <v-col class="text-h5 px-1 text-left" cols="3">
                                    <span>분 동작</span>
                                </v-col>
                            </v-row>
                            <v-row class="text-center justify-center no-gutters pa-1">
                                <v-col class="text-h5 px-1" cols="3">
                                    <v-card class="text-right" flat>순환펌프작동조건: </v-card>
                                </v-col>
                                <v-col class="text-h5 px-1" cols="1">
                                    <v-card class="text-left" flat>상시가동</v-card>
                                </v-col>
                                <v-col class="text-h5 px-1 text-left" cols="1">
                                    <v-card class="text-right" flat>
                                    </v-card>
                                </v-col>
                                <v-col class="text-h5 px-1 text-left" cols="3">
                                    <span></span>
                                </v-col>
                            </v-row>
                            <v-row class="text-center justify-center no-gutters pa-1">
                                <v-col class="text-h5 px-1" cols="3">
                                    <v-card class="text-right" flat>상부팬가동조건: </v-card>
                                </v-col>
                                <v-col class="text-h5 px-1" cols="1">
                                    <v-card class="text-left" flat>습도</v-card>
                                </v-col>
                                <v-col class="text-h5 px-1 text-left" cols="1">
                                    <v-card class="text-right" flat>
                                        <v-text-field
                                            class="text-field-size" outlined dense hide-details flat
                                            type="number" step="0.1"
                                            v-model="autoHumidity"
                                        ></v-text-field>
                                    </v-card>
                                </v-col>
                                <v-col class="text-h5 px-1 text-left" cols="3">
                                    <span>% 유지</span>
                                </v-col>
                            </v-row>
                            <v-row class="text-center justify-center no-gutters pa-1">
                                <v-col class="text-h5 px-1" cols="3">
                                    <v-card class="text-right" flat>스프레이작동조건: </v-card>
                                </v-col>
                                <v-col class="text-h5 px-1" cols="1">
                                    <v-card class="text-left" flat>시간당</v-card>
                                </v-col>
                                <v-col class="text-h5 px-1 text-left" cols="1">
                                    <v-card class="text-right" flat>
                                        <v-text-field
                                            class="text-field-size" outlined dense hide-details flat
                                            type="number" step="1"
                                            v-model="autoSpray"
                                        ></v-text-field>
                                    </v-card>
                                </v-col>
                                <v-col class="text-h5 px-1 text-left" cols="3">
                                    <span>분 동작</span>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
<!--            <v-row class="text-center">-->
<!--                <v-col cols="12">-->
<!--                    <v-card outlined>-->
<!--                        <v-row class="text-center">-->
<!--                            <v-col cols="5">-->
<!--                                <v-card outlined>-->
<!--                                    <v-row class="text-center">-->
<!--                                        <v-col cols="5">-->
<!--                                            <v-list-item two-line>-->
<!--                                                <v-list-item-content>-->
<!--                                                    <v-list-item-title class="text-h5">-->
<!--                                                        내부 온습도-->
<!--                                                    </v-list-item-title>-->
<!--                                                    <v-list-item-subtitle>{{curTime}}</v-list-item-subtitle>-->
<!--                                                </v-list-item-content>-->
<!--                                            </v-list-item>-->
<!--                                        </v-col>-->
<!--&lt;!&ndash;                                        <v-list-item two-line>&ndash;&gt;-->
<!--&lt;!&ndash;                                        <v-switch&ndash;&gt;-->
<!--&lt;!&ndash;                                            v-model="AUTO_MODE"&ndash;&gt;-->
<!--&lt;!&ndash;                                            inset&ndash;&gt;-->
<!--&lt;!&ndash;                                            :label="`AUTO_MODE: ${AUTO_MODE.toString()}`"&ndash;&gt;-->
<!--&lt;!&ndash;                                        ></v-switch>&ndash;&gt;-->
<!--&lt;!&ndash;                                        </v-list-item>&ndash;&gt;-->
<!--                                    </v-row>-->
<!--                                </v-card>-->
<!--                            </v-col>-->
<!--&lt;!&ndash;                            <v-col cols="7">&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;                                <v-list-item two-line>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;                                    <v-list-item-content>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;                                        <v-list-item-title class="text-h5">&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;                                            내부 온습도&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;                                        </v-list-item-title>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;                                        <v-list-item-subtitle>{{curTime}}</v-list-item-subtitle>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;                                    </v-list-item-content>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;                                </v-list-item>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;                            </v-col>&ndash;&gt;-->
<!--&lt;!&ndash;                        </v-row>&ndash;&gt;-->
<!--&lt;!&ndash;                        <v-row>&ndash;&gt;-->
<!--&lt;!&ndash;                            <v-card-text>&ndash;&gt;-->
<!--&lt;!&ndash;                                <v-row align="center">&ndash;&gt;-->
<!--&lt;!&ndash;                                    <v-col class="text-h2" cols="4">&ndash;&gt;-->
<!--&lt;!&ndash;                                        {{curTemperature}}&deg;C&ndash;&gt;-->
<!--&lt;!&ndash;                                    </v-col>&ndash;&gt;-->
<!--&lt;!&ndash;                                    <v-icon size="92" color="orange">mdi-thermometer</v-icon>&ndash;&gt;-->
<!--&lt;!&ndash;                                    <v-col class="text-h2" cols="4">&ndash;&gt;-->
<!--&lt;!&ndash;                                        {{curHumidity}}%&ndash;&gt;-->
<!--&lt;!&ndash;                                    </v-col>&ndash;&gt;-->
<!--&lt;!&ndash;                                    <v-icon size="92" color="green">mdi-water-percent</v-icon>&ndash;&gt;-->
<!--&lt;!&ndash;                                    <v-col cols="2"></v-col>&ndash;&gt;-->
<!--&lt;!&ndash;                                </v-row>&ndash;&gt;-->
<!--&lt;!&ndash;                            </v-card-text>&ndash;&gt;-->
<!--                        </v-row>-->
<!--                    </v-card>-->
<!--                </v-col>-->
<!--            </v-row>-->
        </v-container>
    </div>
</template>

<script>

import moment from 'moment'
import {nanoid} from "nanoid";
import mqtt from 'mqtt'

export default {
    name: 'PureunAir',

    watch: {
        loader () {
            const l = this.loader
            this[l] = !this[l]

            setTimeout(() => (this[l] = false), 3000)

            this.loader = null
        },
    },

    data: () => ({
        ctrlHeater: false,
        ctrlAir: false,
        ctrlPump: true,
        ctrlFan: false,
        ctrlSpray: false,

        autoWater: 24.1,
        autoAir: 10,
        autoHumidity: 90.1,
        autoSpray: 10,

        period: {
            auto: 0,
            heater_period: 24.0,
            air_period: 10,
            fan_period: 90.0,
            spray_period: 10,
        },

        name: 'PureunAir',
        curTemperature: '24.0',
        tempColor: 'indicator-text-black',
        curHumidity: '50.0',
        humiColor: 'indicator-text-black',
        curWaterTemperature: '20.0',
        waterColor: 'indicator-text-black',

        curTime: moment().format(),

        AUTO_MODE: false,

        client: {
            connected: false,
            loading: false,
        },
        connection: {
            host: 'gcs.iotocean.org',
            port: 8883,
            endpoint: '',
            clean: true,
            connectTimeout: 4000,
            reconnectPeriod: 4000,
            clientId: nanoid(15),
            username: 'keti_muv',
            password: 'keti_muv',
        },

        getDataTopic: {
            temperature: '/puleunair/temperature',
            humidity: '/puleunair/humidity',
            hotwater: '/puleunair/hotwater',
            auto: '/puleunair/auto',
        }
    }),

    methods: {
        controlAuto(e) {
            console.log(e);
            this.period.auto = e === true ? 1 : 0;
            this.doPublish('/puleunair/auto/set', JSON.stringify(this.period))
        },

        controlHeater(e) {
            console.log(e);
            let val = e === true ? 1 : 0;
            this.doPublish('/puleunair/Control_1/set', String(val))
        },

        controlAir(e) {
            console.log(e);
            let val = e === true ? 1 : 0;
            this.doPublish('/puleunair/Control_2/set', String(val))
        },

        controlPump(e) {
            console.log(e);
            let val = e === true ? 1 : 0;
            this.doPublish('/puleunair/Control_3/set', String(val))
        },

        controlFan(e) {
            console.log(e);
            let val = e === true ? 1 : 0;
            this.doPublish('/puleunair/Control_4/set', String(val))
        },

        controlSpray(e) {
            console.log(e);
            let val = e === true ? 1 : 0;
            this.doPublish('/puleunair/Control_5/set', String(val))
        },

        createConnection() {
            if (this.client.connected) {
                console.log('Pureun Air already connected --> destroyConnection')
                this.destroyConnection();
            }

            if (!this.client.connected) {
                this.client.loading = true;
                this.connection.clientId = 'mqttjs_' + this.name + '_' + nanoid(15);
                this.connection.host = 'gcs.iotocean.org';
                const {host, port, endpoint, ...options} = this.connection;
                const connectUrl = `ws://${host}:${port}${endpoint}`
                try {
                    this.client = mqtt.connect(connectUrl, options);

                    this.client.on('connect', () => {
                        console.log(host, 'Pureun Air Connection succeeded!');

                        this.client.connected = true;
                        this.client.loading = false;

                        this.doSubscribe(this.getDataTopic.temperature);
                        this.doSubscribe(this.getDataTopic.humidity);
                        this.doSubscribe(this.getDataTopic.hotwater);
                        this.doSubscribe(this.getDataTopic.auto);
                    });

                    this.client.on('error', (error) => {
                        console.log('Pureun Air Connection failed', error);

                        this.destroyConnection();
                    });

                    this.client.on('close', () => {
                        console.log('Pureun Air Connection closed');

                        this.destroyConnection();

                        this.connection.clientId = 'mqttjs_' + this.name + '_' + nanoid(15);
                    });

                    this.client.on('message', (topic, message) => {

                        if(topic === this.getDataTopic.temperature) {
                            this.curTime =  moment().format();

                            console.log(topic, message.toString());

                            this.curTemperature = parseFloat(message.toString()).toFixed(1);
                            this.tempColor = 'indicator-text-orange';
                            setTimeout(() => {
                                this.tempColor = 'indicator-text-black';
                            }, 250);
                        }
                        else if(topic === this.getDataTopic.humidity) {
                            this.curTime =  moment().format();

                            console.log(topic, message.toString());

                            this.curHumidity = parseFloat(message.toString()).toFixed(1);
                            this.humiColor = 'indicator-text-orange';
                            setTimeout(() => {
                                this.humiColor = 'indicator-text-black';
                            }, 250);
                        }
                        else if(topic === this.getDataTopic.hotwater) {
                            this.curTime =  moment().format();

                            console.log(topic, message.toString());

                            this.curWaterTemperature = parseFloat(message.toString()).toFixed(1);
                            this.waterColor = 'indicator-text-orange';
                            setTimeout(() => {
                                this.waterColor = 'indicator-text-black';
                            }, 250);
                        }
                        else if(topic === this.getDataTopic.auto) {
                            this.curTime =  moment().format();

                            console.log(topic, message.toString());
                        }
                        else {
                            console.log('UNKNOWN', 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', message);
                        }

                        //console.log(topic.split('/')[4], message.toString());

                        // let payload = {};
                        // payload.topic = topic;
                        // payload.message = message;
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
                        return;
                    }

                    console.log('Subscribe to topics (', topic, ')');
                });
            }
        },
        doUnSubscribe(topic) {
            if (this.client.connected) {
                this.client.unsubscribe(topic, error => {
                    if (error) {
                        console.log('Unsubscribe error', error)
                    }

                    console.log('Unsubscribe to topics (', topic, ')');
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
                    }
                    console.log(this.name, 'Successfully disconnected!');
                }
                catch (error) {
                    console.log('Disconnect failed', error.toString())
                }
            }
        },
    },

    created() {
        this.createConnection();

        this.period.heater_period = this.autoWater;
        this.period.air_period = this.autoAir;
        this.period.fan_period = this.autoHumidity;
        this.period.spray_period = this.autoSpray;
    },

    mounted() {
        console.log('curTime', this.curTime);
    },

    beforeDestroy() {
        this.destroyConnection();
    }
}
</script>

<style scoped>

.text-field-size {
    width: 100%
}

.indicator-text-orange {
    color: orange;
}

.indicator-text-black {
    color: black;
}

</style>