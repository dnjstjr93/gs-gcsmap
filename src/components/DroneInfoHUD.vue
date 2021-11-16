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

    data: () => ({
        fullScreen: false,
        width: 640,
        height: 480,
        droneWrapper: null,
        droneVideo: null,
        droneHudContainer: null,
        webRtcPeer: null,
    }),

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
            if (this.info.isVideo) {
                this.viewer_start(this.drone_name, this.bitrate)
            }
            else {
                this.viewer_stop();
            }
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
        this.shaka();

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

        EventBus.$on('ws-on-message-' + this.drone_name, (parsedMessage) => {
            if (this.drone) {
                let drone = this.drone;

                switch (parsedMessage.id) {
                    case 'viewerResponse':
                        if (parsedMessage.response !== 'accepted') {
                            var errorMsg = parsedMessage.message ? parsedMessage.message : 'Unknow error';
                            //console.warn('Call not accepted for the following reason: ' + errorMsg);
                            drone.stop();
                            alert(errorMsg);

                            this.info.isVideo = false;
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
        this.droneVideo.id = 'video-' + this.drone_name;

        this.droneHudContainer = this.droneWrapper.querySelector('#hud-container');

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
        //EventBus.$off('hud-data-' + this.drone_name);
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
