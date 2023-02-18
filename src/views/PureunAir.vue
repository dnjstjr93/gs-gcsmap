<template>
    <v-container>
        <v-row class="text-center">
            <v-col cols="6">
                <v-card
                    class="mx-auto my-4"
                    max-width="600"
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
                                {{curTemperature}}&deg;C
                            </v-col>
                            <v-icon size="92" color="orange">mdi-thermometer</v-icon>
                            <v-col class="text-h2" cols="4">
                                {{curHumidity}}%
                            </v-col>
                            <v-icon size="92" color="green">mdi-water-percent</v-icon>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="6">
                <v-card
                    class="mx-auto my-4"
                    max-width="400"
                >
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
                                {{curWaterTemperature}}&deg;C
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
    </v-container>
</template>

<script>

import moment from 'moment'
import {nanoid} from "nanoid";
import mqtt from 'mqtt'

export default {
    name: 'PureunAir',

    data: () => ({
        curTemperature: 24.0,
        curHumidity: 50.0,
        curWaterTemperature: 20.0,
        curTime: moment().format(),

        ecosystem: [
            {
                text: 'vuetify-loader',
                href: 'https://github.com/vuetifyjs/vuetify-loader',
            },
            {
                text: 'github',
                href: 'https://github.com/vuetifyjs/vuetify',
            },
            {
                text: 'awesome-vuetify',
                href: 'https://github.com/vuetifyjs/awesome-vuetify',
            },
        ],
        importantLinks: [
            {
                text: 'Documentation',
                href: 'https://vuetifyjs.com',
            },
            {
                text: 'Chat',
                href: 'https://community.vuetifyjs.com',
            },
            {
                text: 'Made with Vuetify',
                href: 'https://madewithvuejs.com/vuetify',
            },
            {
                text: 'Twitter',
                href: 'https://twitter.com/vuetifyjs',
            },
            {
                text: 'Articles',
                href: 'https://medium.com/vuetify',
            },
        ],
        whatsNext: [
            {
                text: 'Explore components',
                href: 'https://vuetifyjs.com/components/api-explorer',
            },
            {
                text: 'Select a layout',
                href: 'https://vuetifyjs.com/getting-started/pre-made-layouts',
            },
            {
                text: 'Frequently Asked Questions',
                href: 'https://vuetifyjs.com/getting-started/frequently-asked-questions',
            },
        ],

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
            clientId: this.name + nanoid(15),
            username: 'keti_muv',
            password: 'keti_muv',
        },

        getDataTopic: {
            temperature: '/puleunair/temperature',
            humidity: '/puleunair/humidity',
            hotwater: '/puleunair/hotwater',
        }
    }),

    methods: {
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
                        console.log(host, 'DroneInfoList Connection succeeded!');

                        this.client.connected = true;
                        this.client.loading = false;

                        this.doSubscribe(this.getDataTopic.temperature);
                        this.doSubscribe(this.getDataTopic.humidity);
                        this.doSubscribe(this.getDataTopic.hotwater);
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
                            console.log(topic, message);

                        }
                        else if(topic === this.getDataTopic.humidity) {
                            console.log(topic, message);

                        }
                        else if(topic === this.getDataTopic.hotwater) {
                            console.log(topic, message);
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

    mounted() {
        console.log('curTime', this.curTime);

        this.createConnection();
    },

    beforeDestroy() {
        this.destroyConnection();
    }
}
</script>
