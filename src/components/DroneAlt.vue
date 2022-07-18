<template>
    <div>
        <div
            ref="alt"
            class="ma-0 canvas"
            :style="{
                top: ($store.state.command_tab_max_height-122)+'px',
                left: (context_left+21)+'px',
                width: ($store.state.command_tab_max_width-40)+'px',
                height: 156+'px'
            }"
            v-if="refreshCanvas"
        />

        <div
            class="divcanvas"
            :style="{
                top: ($store.state.command_tab_max_height-122)+'px',
                left: (context_left+21)+'px',
                width: ($store.state.command_tab_max_width-40)+'px',
                height: 156+'px'
            }"
            v-if="refreshCanvas"
        >
            <div v-for="drone in $store.state.drone_infos" :key="drone.id">
                <div v-if="drone.selected">
                    <v-slider
                        v-show="showSlider[drone.name]"
                        :style="styleAlt[drone.name]"
                        vertical hide-details dense readonly
                        min="0" max="150"
                        v-model="sliderAlt[drone.name]"
                        class="altcanvas large-slider ma-0 pa-0"
                        height="0px"
                        :color="drone.color"
                        thumb-label="always"
                        track-color="#E0E0E0"
                        :thumb-color="drone.color"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import EventBus from '../EventBus';

export default {
    name: "DroneAlt",

    components: {
    },

    data() {
        return {
            sliderAlt: {},
            styleAlt: {},
            showSlider: {},
            componentKey: 0,
            refreshCanvas: false,
            ctx: null,
            context_top: 1,
            context_left: 1,
            context_max_height: 640,
        }
    },
    watch: {
        command_tab_left_x: function (newVal) {
            this.context_left = newVal;
        },

        command_tab_max_height: function (newVal) {
            console.log('DroneCommand-context_max_height', newVal)
            this.context_max_height = newVal;
        }
    },
    computed: {
        command_tab_left_x() {
            return (this.$store.state.command_tab_left_x);
        }
    },

    mounted() {
    },

    created() {
        this.context_left = this.$store.state.command_tab_left_x;

        EventBus.$on('gcs-map-ready', () => {
            for(let dName in this.$store.state.drone_infos) {
                if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                    if(this.$store.state.drone_infos[dName].selected) {
                        this.showSlider[dName] = true;
                    }
                }
            }

            setTimeout(() => {
                this.refreshCanvas = true;
            }, 2000);
        });

        EventBus.$on('do-refresh-DroneAlt', () => {
            for(let dName in this.$store.state.drone_infos) {
                if(Object.prototype.hasOwnProperty.call(this.$store.state.drone_infos, dName)) {
                    if(this.$store.state.drone_infos[dName].selected) {
                        this.showSlider[dName] = true;
                    }
                }
            }

            setTimeout(() => {
                this.refreshCanvas = true;
            }, 50);
        });

        EventBus.$on('do-draw-DroneCommand', (payload) => {
            //console.log(payload);

            if(!Object.prototype.hasOwnProperty.call(this.showSlider, payload.name)) {
                this.showSlider[payload.name] = true;
            }

            if(!Object.prototype.hasOwnProperty.call(this.styleAlt, payload.name)) {
                this.styleAlt[payload.name] = {
                    left: 0 + 'px',
                    top: 115 + 'px',
                    opacity: 1
                };
            }

            if(!Object.prototype.hasOwnProperty.call(this.sliderAlt, payload.name)) {
                this.sliderAlt[payload.name] = 0;
            }

            if(Object.prototype.hasOwnProperty.call(this.$refs, 'alt')) {
                let clientRect = this.$refs.alt.getBoundingClientRect();
                //console.log(clientRect.x, clientRect.y, clientRect.width, clientRect.height);

                let diff = payload.x - clientRect.x;
                let temp = JSON.parse(JSON.stringify(this.sliderAlt));
                this.sliderAlt = null;
                this.sliderAlt = JSON.parse(JSON.stringify(temp));
                this.sliderAlt[payload.name] = payload.alt;
                // this.draw(x, y);

                this.showSlider[payload.name] = (0 <= diff);

                //console.log('scale', payload.scale);
                //console.log('$store.state.command_tab_max_width', this.$store.state.command_tab_max_width);
                //console.log('draw', this.showSlider[payload.name].x, y);

                this.styleAlt[payload.name] = {
                    left: diff + 'px',
                    top: 76 + 'px',
                    opacity: 1
                }
            }
        });
    },
    methods: {
        forceRerender() {
            this.componentKey += 1;
        },

        draw(x, y) {
            this.ctx = this.$refs.alt.getContext('2d');
            this.ctx.beginPath()
            this.ctx.clearRect(0, 0, 500, 500)
            console.log('draw', x, y);
            //this.ctx.rect(x, y+10, 30, 30)
            //this.ctx.fill()
            this.ctx.strokeStyle = "red"
            this.ctx.strokeRect(x, y + 10, 50, 30);
        },
    },

    beforeDestroy() {
        EventBus.$off('gcs-map-ready');
        EventBus.$off('do-refresh-DroneAlt');
        EventBus.$off('do-draw-DroneCommand');
    }
}
</script>

<style scoped>
    @keyframes metronome-example {
        from {
            transform: scale(.5);
        }

        to {
            transform: scale(1);
        }
    }

    /*.v-avatar--metronome {*/
    /*    animation-name: metronome-example;*/
    /*    animation-iteration-count: infinite;*/
    /*    animation-direction: alternate;*/
    /*}*/

    .tab_position {
        position: absolute;
        opacity: 0.9; /* for demo purpose  */
        z-index: 2;
    }

    td, th {
        font-weight: normal;
        padding: 10px;
        border: 1px solid #ccc;
    }

    body {
        padding: 1rem;
    }

    .canvas {
        background-color: black;
        position: absolute;
        opacity: 0.4; /* for demo purpose  */
        z-index: 5;
    }

    .divcanvas {
        position: absolute;
        z-index: 5;
    }

    .altcanvas {
        position: absolute;
        opacity: 1;
        z-index: 7;
    }

    .large-slider >>> .v-slider {
        height: 40px;
    }

    /*.v-slider--thumb {*/
    /*    height: 30px;*/
    /*    width: 30px;*/
    /*}*/

    /*.v-slider--vertical {*/
    /*    height: 100px;*/
    /*}*/

    /*.v-slider--track-width {*/
    /*    height: 1000px;*/
    /*}*/

    /*.v-slider--track-container {*/
    /*    height: 100px;*/
    /*}*/

</style>
