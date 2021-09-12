<template>
    <div ref="joys"
         class="vue-joystick ma-2"
         :style="style"
         @touchmove="handleTouch"
         @mousemove="handleMove"
         @mousedown="handleStart"
         @mouseup="handleRelease"
         @touchend="handleRelease"
    ></div>
</template>

<script>
    export default {
        name: "JoyStick",

        props: {
            color: {
                type: String,
                default: "#25B"
            },
            joystick_size: {
                type: Number,
                default: 256,
            }
        },
        data() {
            return {
                x: 0,
                y: 0,
                angle: 0,
                speed: 0,
                isMouseDown: false
            };
        },
        computed: {
            style() {
                //console.log('JoyStick - computed', this.joystick_size)
                return {
                    "--x": `${this.x + parseInt(this.joystick_size/2)}px`,
                    "--y": `${this.y + parseInt(this.joystick_size/2)}px`,
                    "--speed": `${this.speed}px`,
                    "--angle": `${this.angle}deg`,
                    "--color": `${this.color}`,
                    "--joystick_width": `${this.joystick_size}px`,
                    "--joystick_height": `${this.joystick_size}px`,
                    "--joystick_before_width": `${(this.joystick_size/4)}px`,
                    "--joystick_before_height": `${(this.joystick_size/4)}px`,
                    "--joystick_before_margin": `${-(this.joystick_size/4/2+4)}px`,
                    "--joystick_after_bottom": `${(this.joystick_size/2)}px`,
                    "--joystick_after_left": `${(this.joystick_size/2)}px`
                };
            }
        },
        methods: {
            handleStart() {
                this.isMouseDown = true;
            },

            handleTouch({ touches: [touch] }) {

                console.log('handleTouch', touch)

                const { clientX, clientY } = touch;
                //const { offsetLeft, offsetTop } = this.$el;
                const offsetLeft = this.$refs.joys.getBoundingClientRect().left+4;
                const offsetTop = this.$refs.joys.getBoundingClientRect().top
                const x = Math.round(clientX - offsetLeft - this.joystick_size/2);
                const y = Math.round(clientY - offsetTop - this.joystick_size/2);
                this.updatePosition(x, y);
            },

            handleMove({ clientX, clientY }) {
                if (!this.isMouseDown) {
                    return;
                }

                //console.log('handleMove', clientX, clientY, this.$refs.joys.getBoundingClientRect().left)

                //const { offsetLeft, offsetTop } = this.$el;

                const offsetLeft = this.$refs.joys.getBoundingClientRect().left+4;
                const offsetTop = this.$refs.joys.getBoundingClientRect().top
                const x = Math.round(clientX - offsetLeft - this.joystick_size/2);
                const y = Math.round(clientY - offsetTop - this.joystick_size/2);
                this.updatePosition(x, y);
            },

            handleRelease() {
                this.emitAll("release");
                this.isMouseDown = false;
                this.updatePosition(0, 0);
                setTimeout(()=>{
                    this.updatePosition(0, 0);
                }, 1000);
            },

            updatePosition(x, y) {
                const offset = parseInt((this.joystick_size/2) - (this.joystick_size/8));
                const radians = Math.atan2(y, x);
                const angle = Math.round((radians * 180) / Math.PI, 4);
                this.angle = angle + (angle > 90 ? -270 : 90);
                this.speed = Math.min(
                    Math.round(Math.sqrt(Math.pow(y, 2) + Math.pow(x, 2))),
                    (this.joystick_size/2)
                );
                this.x = this.speed >= offset ? Math.cos(radians) * offset : x;
                this.y = this.speed >= offset ? Math.sin(radians) * offset : y;
                this.emitAll();
            },

            emitAll(name = "change") {
                this.$emit(name, {
                    x: this.x,
                    y: this.y,
                    speed: this.speed,
                    angle: this.angle
                });
            }
        },
        mounted() {
            this.emitAll();
        }
    }
</script>

<style scoped>
    .vue-joystick {
        display: inline-block;
        background: white;
        height: var(--joystick_height);
        width: var(--joystick_width);
        border-radius: 50%;
        position: relative;
        border: solid 4px var(--color);
    }
    .vue-joystick::before,
    .vue-joystick::after {
        content: "";
        position: absolute;
    }
    .vue-joystick::before {
        left: 0;
        right: 0;
        margin: var(--joystick_before_margin);
        background: var(--color);
        height: var(--joystick_before_height);
        width: var(--joystick_before_height);
        border-radius: 50%;
        transform: translateX(var(--x)) translateY(var(--y));
    }
    .vue-joystick::after {
        left: var(--joystick_after_left);
        bottom: var(--joystick_after_bottom);
        border-radius: 10px;
        width: 4px;
        background: var(--color);
        transform: rotate(var(--angle));
        transform-origin: bottom center;
        height: var(--speed);
    }
</style>