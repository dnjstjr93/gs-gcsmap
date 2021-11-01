<template>
    <v-card
        :id="`${drone_name}_wrapper`"
        :style="{'width': width + 'px', 'height': height + 'px'}"
        class="hudCard"
    >
        <div class="videoContainer d-flex justify-content-center">
            <div class="webRtcVideo" ref="videoContainer">
                <video v-show="isVideo" autoplay class="video" ref="videoPlayer"></video>
                <HudContainer :data="info" />
            </div>
        </div>
    </v-card>
</template>

<script>
import HudContainer from '@/components/layout/HudContainer'

import EventBus from '../EventBus';
import kurentoUtils from "kurento-utils";

function Drone(name, bitrate) {
    this.name = name;

    // Card Wrapper
    let wrapper = document.getElementById(`${this.name}_wrapper`)

    let video = wrapper.querySelector('.video')
    video.id = 'video-' + name;

    this.video = video;

    this.viewer = function () {
        if (!this.webRtcPeer) {
            showSpinner(this.video);

            let options = {
                remoteVideo: this.video,
                onicecandidate: onIceCandidate
            };

            this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function (error) {
                if (error) return error;

                this.generateOffer(onOfferViewer);
            });
        }
    }

    function onOfferViewer(error, offerSdp) {
        if (error) return error;
        let message = {
            id: 'viewer',
            droneName: name,
            bitrate: bitrate,
            sdpOffer: offerSdp
        }
        EventBus.$emit('ws-send-message', message);
    }

    this.stop = function () {
        if (this.webRtcPeer) {
            let message = {
                id: 'stop',
                droneName: this.name
            }
            EventBus.$emit('ws-send-message', message);
            this.dispose();
        }
    }

    function onIceCandidate(candidate) {
        var message = {
            id: 'onIceCandidate',
            droneName: name,
            candidate: candidate
        }
        EventBus.$emit('ws-send-message', message);
    }

    function showSpinner(video) {
        if (document.querySelector('#' + name + '_wrapper .bg')) {
            document.querySelector('#' + name + '_wrapper .bg').style.display = "none"
        }
        video.poster = './img/transparent-1px.png';
        video.style.background = 'center transparent url("./img/spinner.gif") no-repeat';
    }

    function hideSpinner(video) {
        if (document.querySelector('#' + name + '_wrapper .bg')) {
            document.querySelector('#' + name + '_wrapper .bg').style.display = "block"
        }
        video.poster = './img/webrtc.png';
        video.style.background = '';
    }

    this.dispose = function () {
        if (this.webRtcPeer) {
            this.webRtcPeer.dispose();
            this.webRtcPeer = null;
        }
        hideSpinner(this.video);
    }
}

export default {
    name: 'Drone',
    components: {
        HudContainer
    },
    props: ['drone_name', 'bitrate', 'info'],
    mounted() {
        this.shaka();

        if(!this.drone) {
            this.drone = new Drone(this.drone_name, 0);
            this.isVideo = false;
            this.videoOn();
            setTimeout(()=>{
                this.videoOn();
            }, 100);
        }

        EventBus.$on('do-video-size-'+this.drone_name, (payload) => {

            console.log('do-video-size-'+this.drone_name, payload);

            this.width = payload.width;
            this.height = payload.height;

            this.$forceUpdate();
        });

        EventBus.$on('do-video-close-'+this.drone_name, () => {

            console.log('do-video-close-'+this.drone_name);

            this.viewer_stop();
        });

        EventBus.$on('do-video-on-'+this.drone_name, () => {

            console.log('do-video-on-'+this.drone_name);

            this.videoOn();
        });

        EventBus.$on('ws-on-message-'+this.drone_name, (parsedMessage) => {

            console.log('ws-on-message-'+this.drone_name);

            if(this.drone) {
                let drone = this.drone;

                switch (parsedMessage.id) {
                    case 'viewerResponse':
                        if (parsedMessage.response !== 'accepted') {
                            var errorMsg = parsedMessage.message ? parsedMessage.message : 'Unknow error';
                            //console.warn('Call not accepted for the following reason: ' + errorMsg);
                            drone.dispose();
                            //alert(errorMsg);
                            console.log('viewMessage', errorMsg)

                            this.isVideo = false;
                        }
                        else {
                            drone.webRtcPeer.processAnswer(parsedMessage.sdpAnswer);
                        }
                        break;
                    case 'stopCommunication':
                        drone.dispose();
                        break;
                    case 'iceCandidate':
                        drone.webRtcPeer.addIceCandidate(parsedMessage.candidate)
                        break;
                    default:
                        break;
                }
            }
        });
    },

    data: () => ({
        isVideo: true,
        width: 450,
        height: 300,
        drone: null,
    }),
    computed: {},
    methods: {
        viewer_start(droneName, initbitrate) {
            if(!this.drone) {
                this.drone = new Drone(droneName, initbitrate);
            }

            this.bitrate = initbitrate;
            this.drone.viewer();
        },

        viewer_stop() {
            if(this.drone) {
                this.drone.stop();
            }
        },

        /**
         * @WebRTC Event Handlers
         */
        open() {
            this.shaka();
            //this.$emit('onStart', this.itemIndex)
        },

        stop() {
            this.viewer_stop();
            //this.$emit('onStop', this.itemIndex)
        },

        videoOn() {
            this.isVideo = !this.isVideo
            if (this.isVideo) {
                this.viewer_start(this.drone_name, this.bitrate);
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
        },

        isFs() {
            this.info.fs = !!document.fullscreenElement;
        }
    },
    beforeDestroy() {
        this.drone.stop();
        this.drone = null;

        EventBus.$off('do-video-size-'+this.drone_name);
        EventBus.$off('do-video-close-'+this.drone_name);
        EventBus.$off('do-video-on-'+this.drone_name);
        EventBus.$off('ws-on-message-'+this.drone_name);
    }
}
</script>

<style lang="scss">
@import '../../node_modules/shaka-player/dist/controls.css'; /* Shaka player CSS import */
@import '../assets/_index.scss';

.hudCard {
    min-width: 120px;
    min-height: 120px;
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
    height: 100%;
    object-fit: fill;
    background-color: whitesmoke;
}

</style>
