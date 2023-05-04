<template>
    <v-card
        :id="`${drone_name}_wrapper`"
        :style="{'width': width + 'px', 'height': height + 'px'}"
        class="hudCard"
    >
        <div class="videoContainer d-flex justify-content-center">
            <div class="webRtcVideo" ref="videoContainer">
                <video v-show="info.isVideo" autoplay class="video" :class="{ fsVideo: this.info.fs }"
                       ref="videoPlayer"></video>
                <HudContainer
                    v-if="info"
                    :data="info"
                    :width="width"
                    :isVideo="info.isVideo"
                    :drone_name="drone_name"
                    ref="hudContainer"
                />
            </div>
        </div>
    </v-card>
</template>

<script>
import HudContainer from '@/components/layout/HudContainer'
import axios from 'axios'
import EventBus from '../EventBus';
import kurentoUtils from 'kurento-utils';

function Drone(name, bitrate, wrapper, video) {
    this.name = name;
    this.video = video;

    this.viewer = function () {
        if (!this.webRtcPeer) {
            //showSpinner(this.video);

            // video.poster = './img/transparent-1px.png';
            // video.style.background = 'center transparent url("./img/spinner.gif") no-repeat';

            let options = {
                remoteVideo: this.video,
                onicecandidate: function (candidate) {
                    var message = {
                        id: 'onIceCandidate',
                        droneName: name,
                        candidate: candidate
                    }
                    EventBus.$emit('ws-send-message', message);
                }
            };

            this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function (error) {
                if (error) return error;

                this.generateOffer((error, offerSdp) => {
                    if (error) return error;
                    let message = {
                        id: 'viewer',
                        droneName: name,
                        bitrate: bitrate,
                        sdpOffer: offerSdp
                    }
                    EventBus.$emit('ws-send-message', message);
                });
            });
        }
    }

    this.stop = function () {
        if (this.webRtcPeer) {
            let message = {
                id: 'stop',
                droneName: name
            }
            EventBus.$emit('ws-send-message', message);

            this.webRtcPeer.dispose();
            this.webRtcPeer = null;
        }
    }
}

export default {
    name: 'DroneInfoHUD',

    components: {
        HudContainer
    },

    props: ['drone_name', 'bitrate', 'info'],

    data() {
        return {
            fullScreen: false,
            width: 640,
            height: 480,
            droneWrapper: null,
            droneVideo: null,
            droneHudContainer: null,
            webRtcPeer: null,
            drone: null,
            room_name: null
        };
    },

    methods: {
        viewer_start(droneName, initbitrate) {
            if (this.drone) {
                this.drone.stop();
                this.drone = null;
            }

            this.drone = new Drone(droneName, initbitrate, this.droneWrapper, this.droneVideo);

            this.bitrate = initbitrate;

            this.droneVideo.poster = './img/transparent-1px.png';
            this.droneVideo.style.background = 'center transparent url("./img/spinner.gif") no-repeat';

            this.droneHudContainer.style.background = 'transparent';

            let mainSvg = this.droneWrapper.querySelector('.mainSvg');
            mainSvg.style.removeProperty('background');

            this.drone.viewer();
        },

        viewer_stop() {
            this.droneVideo.poster = './img/webrtc.png';
            this.droneVideo.style.background = '';

            this.droneHudContainer.style.background = 'skyblue'

            if (this.drone) {
                this.drone.stop();
                this.drone = null;
            }
        },

        videoOn() {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/Mission_Data/' + this.drone_name + '/msw_webrtc_crow/room_name/la',
                headers: {
                    'Accept': 'application/json',
                    'X-M2M-RI': '12345',
                    'X-M2M-Origin': 'SVue'
                }
            };

            axios.request(config)
                .then((response) => {
                    this.room_name = response.data["m2m:cin"].con;
                    console.log(this.room_name, this.info.isVideo);
                    if (this.info.isVideo) {
                        this.viewer_start(this.room_name, this.bitrate)
                    }
                    else {
                        this.viewer_stop();
                    }})
                .catch((error) => {
                    console.log(error);
                });

            // if (this.info.isVideo) {
            //     this.viewer_start(this.drone_name, this.bitrate)
            // }
            // else {
            //     this.viewer_stop();
            // }
        },

        shaka() {
            const shaka = require('shaka-player/dist/shaka-player.ui.js');
            const player = new shaka.Player(this.$refs.videoPlayer);

            const ui = new shaka.ui.Overlay(
                player,
                this.$refs.videoContainer,
                this.$refs.videoPlayer
            );

            const config = {
                addSeekBar: false,
                'controlPanelElements': ['fullscreen']
            };
            ui.configure(config);

            document.addEventListener("fullscreenchange", this.isFs)

            // hideControls
            var element = document.querySelector('#' + this.drone_name + '_wrapper .shaka-video-container');
            element.getElementsByClassName('shaka-controls-container')[0].removeAttribute('shown');

            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.type === "attributes" && element.getAttribute('style') === "cursor: none;") {
                        element.getElementsByClassName('shaka-controls-container')[0].removeAttribute('shown');
                    }
                });
            });

            observer.observe(element, {
                attributes: true //configure it to listen to attribute changes
            });
        },

        isFs() {
            this.info.fs = !!document.fullscreenElement;
        }
    },

    mounted() {
        //this.shaka();

        EventBus.$on('do-video-size-' + this.drone_name, (payload) => {
            this.width = payload.width;
            this.height = payload.height;
        });

        EventBus.$on('do-video-close-' + this.drone_name, () => {
            this.info.isVideo = false;
            this.viewer_stop();
        });

        EventBus.$on('do-video-on-' + this.drone_name, () => {
            this.videoOn();
        });

        EventBus.$on('reconnect-video-' + this.drone_name, () => {
            console.log(this.drone_name + '-' + this.info.isVideo)
            if (this.info.isVideo) {
                this.info.isVideo = false;
                this.viewer_stop();

                this.info.isVideo = true;
                setTimeout(() => {
                    this.videoOn();
                }, 1000);
            }
        });

        EventBus.$on('refresh-video-' + this.drone_name, (room_name) => {
            console.log('[refresh-video-' + this.drone_name + ']\n' + room_name);
            if (this.info.isVideo) {
                this.info.isVideo = false;
                this.viewer_stop();

                this.info.isVideo = true;
                setTimeout(() => {
                    this.viewer_start(room_name, 0);
                }, 3000);
            }
        });

        EventBus.$on('ws-on-message-' + this.drone_name, (parsedMessage) => {
            if (this.drone) {
                let drone = this.drone;

                switch (parsedMessage.id) {
                    case 'viewerResponse':
                        console.log('viewerResponse -', parsedMessage)
                        if (parsedMessage.response !== 'accepted') {
                            var errorMsg = parsedMessage.message ? parsedMessage.message : 'Unknow error';
                            //console.warn('Call not accepted for the following reason: ' + errorMsg);
                            drone.stop();
                            if (typeof parsedMessage.message === 'string'){
                                if (parsedMessage.message.includes("No active presenter")) {
                                    this.info.isVideo = false;
                                    this.viewer_stop();

                                    console.log(errorMsg);

                                    this.info.isVideo = true;
                                    setTimeout(() => {
                                        this.videoOn();
                                    }, 1000);
                                }
                                else {
                                    console.log(errorMsg);
                                    this.info.isVideo = false;
                                }
                            }
                            else if (typeof parsedMessage.message === 'object') {
                                if (Object.prototype.hasOwnProperty.call(parsedMessage.message,'data')) {
                                    if (Object.prototype.hasOwnProperty.call(parsedMessage.message.data,'type')) {
                                        if (parsedMessage.message.data.type === "MEDIA_OBJECT_NOT_FOUND") {
                                            this.info.isVideo = false;
                                            this.viewer_stop();

                                            this.info.isVideo = true;
                                            setTimeout(() => {
                                                this.videoOn();
                                            }, 1000);
                                        }
                                        else {
                                            console.log(errorMsg);
                                            this.info.isVideo = false;
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            drone.webRtcPeer.processAnswer(parsedMessage.sdpAnswer);
                        }
                        break;
                    case 'stopCommunication':
                        drone.stop();
                        break;
                    case 'iceCandidate':
                        drone.webRtcPeer.addIceCandidate(parsedMessage.candidate)
                        break;
                    default:
                        break;
                }
            }
        });

        this.droneWrapper = document.querySelector(`#${this.drone_name}_wrapper`);

        this.droneVideo = this.droneWrapper.querySelector('.video');
        this.droneVideo.id = 'video-' + this.room_name;

        this.droneHudContainer = this.droneWrapper.querySelector('#hud-container');

        const subscription_name = 'webrtc_' + this.drone_name + '_sub';
        axios({
            validateStatus: function (status) {
                // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                return status < 500;
            },
            method: 'get',
            url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/Mission_Data/' + this.drone_name + '/msw_webrtc_crow/room_name' + '/' + subscription_name,
            headers: {
                'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                'X-M2M-Origin': 'SVue'
            }
        }).then((res) => {
                console.log('getSubscription', res);

                if (res.status === 200) {
                    let room_name_topic = '/oneM2M/req/Mobius2/' + 'S' + this.drone_name + '/json';
                    setTimeout(() => {
                        EventBus.$emit('do-subscribe', room_name_topic);
                        // this.doSubscribe(room_name_topic);
                        console.log('App-room_name_topic - Subscribe to ', room_name_topic);
                    }, 500);
                } else {
                    axios({
                        validateStatus: function (status) {
                            // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                            return status < 500;
                        },
                        method: 'post',
                        url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/Mission_Data/' + this.drone_name + '/msw_webrtc_crow/room_name',
                        headers: {
                            'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                            'X-M2M-Origin': 'S' + this.drone_name,
                            'Content-Type': 'application/json;ty=23'
                        },
                        data: {
                            'm2m:sub': {
                                rn: 'webrtc_' + this.drone_name + '_sub',
                                enc: {
                                    'net': [
                                        1,
                                        2,
                                        3,
                                        4
                                    ]
                                },
                                nu: ["mqtt://gcs.iotocean.org/" + 'S' + this.drone_name + "?ct=json"],
                                nct: 2,
                            }
                        }
                    }).then(
                        (res) => {
                            console.log(res)
                            console.log(res.status, '');
                        }
                    ).catch(
                        (err) => {
                            console.log(err.message);
                        }
                    );
                }
            }
        ).catch(
            function (err) {
                console.log(err.message);
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'post',
                    url: 'http://' + this.$store.state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + this.$store.state.VUE_APP_MOBIUS_GCS + '/Mission_Data/' + this.drone_name + '/msw_webrtc_crow/room_name',
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'S' + this.$store.state.VUE_APP_MOBIUS_GCS,
                        'Content-Type': 'application/json;ty=23'
                    },
                    data: {
                        'm2m:sub': {
                            rn: 'webrtc_' + this.drone_name + '_sub',
                            enc: {
                                'net': [
                                    1,
                                    2,
                                    3,
                                    4
                                ]
                            },
                            nu: ["mqtt://gcs.iotocean.org/" + 'S' + this.drone_name + "?ct=json"],
                            nct: 2,
                        }
                    }
                }).then(
                    (res) => {
                        console.log(res)
                        console.log(res.status, '');
                    }
                ).catch(
                    (err) => {
                        console.log(err.message);
                    }
                );
            }
        );
    },

    beforeDestroy() {
        if (this.drone) {
            this.drone.stop();
            this.drone = null;
        }

        EventBus.$off('do-video-size-' + this.drone_name);
        EventBus.$off('do-video-close-' + this.drone_name);
        EventBus.$off('do-video-on-' + this.drone_name);
        EventBus.$off('ws-on-message-' + this.drone_name);
        EventBus.$off('refresh-video-' + this.drone_name);
        EventBus.$off('reconnect-video-' + this.drone_name);
    }
}
</script>

<style>
@import '../../node_modules/shaka-player/dist/controls.css'; /* Shaka player CSS import */

.hudCard {

}

.vdr {
    border: none !important;
}

.videoContainer {
    width: 100%;
    height: 100%;
}

.webRtcVideo {
    position: relative;
    width: 100%;
    height: 100%;
}

.video {
    width: 100%;
    object-fit: fill;
    background-color: whitesmoke;
}

.fsVideo {
    /*object-fit: contain !important;*/
}

</style>
