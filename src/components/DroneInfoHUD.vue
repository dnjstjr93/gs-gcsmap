<template>
    <v-card
        :id="`${drone_name}_wrapper`"
        :style="{'width': width + 'px', 'height': height + 'px'}"
        class="hudCard"
    >
        <div class="videoContainer d-flex justify-content-center">
            <div class="webRtcVideo" ref="videoContainer">
                <video v-show="info.isVideo" autoplay class="video" :class="{ fsVideo: info.fs }"
                       ref="videoPlayer"></video>
                <HudContainer
                    v-if="info"
                    :data="info"
                    ref="hudContainer"/>
            </div>
        </div>
    </v-card>
</template>

<script>
import HudContainer from '@/components/layout/HudContainer'

import EventBus from '../EventBus';
import kurentoUtils from 'kurento-utils';

function Drone(name, bitrate) {
    this.name = name;
    this.webRtcPeer = null;

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
            this.webRtcPeer.dispose();
            this.webRtcPeer = null;

            hideSpinner(this.video);
            EventBus.$emit('ws-send-message', message);
        }
    }

    this.dispose = function () {
        if (this.webRtcPeer) {
            this.webRtcPeer.dispose();
            this.webRtcPeer = null;
        }
        hideSpinner(this.video);
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
        if (document.querySelector('#' + name + '_wrapper .mainSvg') && document.querySelector('#' + name + '_wrapper .zeroWrap')) {
            document.querySelector('#' + name + '_wrapper .mainSvg').style.setProperty('--ms-background', 'none');
            document.querySelectorAll('#' + name + '_wrapper .zeroWrap').forEach(el => {
                el.style.setProperty('--background', 'none');
                el.style.setProperty('--background-color', 'none')
            });
        }
        video.poster = './img/transparent-1px.png';
        video.style.background = 'center transparent url("./img/spinner.gif") no-repeat';
    }

    function hideSpinner(video) {
        if (document.querySelector('#' + name + '_wrapper .mainSvg') && document.querySelector('#' + name + '_wrapper .zeroWrap')) {
            document.querySelector('#' + name + '_wrapper .mainSvg').style.setProperty('--ms-background', 'skyblue');
            document.querySelectorAll('#' + name + '_wrapper .zeroWrap').forEach(el => {
                el.style.setProperty('--background', 'green');
                el.style.setProperty('--background-color', 'white')
            });
        }
        video.poster = './img/webrtc.png';
        video.style.background = '';
        // EventBus.$emit('do-video-close-' + name, {});
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
        width: 480,
        height: 320,
        drone: null,
    }),
    mounted() {
        EventBus.$on('do-video-size-' + this.drone_name, (payload) => {
            this.width = payload.width;
            this.height = payload.height;
        });

        // EventBus.$on('do-video-close-' + this.drone_name, () => {
        //     this.info.isVideo = false;
        //     this.viewer_stop();
        // });

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
                            drone.dispose();
                            alert(errorMsg);

                            this.info.isVideo = false;
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

        // EventBus.$on('hud-data-' + this.drone_name, (hudData) => {
        //     if (hudData) {
        //         this.info = hudData;
        //
        //         if (hudData.isMounted) {
        //             this.$refs.hudContainer.newInit();
        //         }
        //     }
        // })

        //this.$emit('mounted', this.drone_name)

        this.shaka();

        this.viewer_start(this.drone_name, 0);
        setTimeout(() => {
            this.viewer_stop();
        }, 1000);
    },
    computed: {},
    methods: {
        viewer_start(droneName, initbitrate) {
            if (!this.drone) {
                this.drone = new Drone(droneName, initbitrate);
            }

            this.bitrate = initbitrate;
            this.drone.viewer();
        },

        viewer_stop() {
            if (this.drone) {
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
            if (this.info.isVideo) {
                this.viewer_start(this.drone_name, this.bitrate);
            }
            else {
                this.viewer_stop();
            }
        },

        shaka() {
            const shaka = require('shaka-player/dist/shaka-player.ui.js');
            const player = new shaka.Player(this.$refs.videoPlayer);
            const ui = new shaka.ui.Overlay(player, this.$refs.videoContainer, this.$refs.videoPlayer);
            const config = {addSeekBar: false, 'controlPanelElements': ['fullscreen']};
            ui.configure(config);

            document.addEventListener("fullscreenchange", this.isFs)

            this.hideControls();
        },

        hideControls() {
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
    beforeDestroy() {
        if(this.drone) {
            this.viewer_stop();
            this.drone = null;
        }

        EventBus.$off('do-video-size-' + this.drone_name);
//        EventBus.$off('do-video-close-' + this.drone_name);
        EventBus.$off('do-video-on-' + this.drone_name);
        EventBus.$off('ws-on-message-' + this.drone_name);
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
    object-fit: contain !important;
}

</style>
