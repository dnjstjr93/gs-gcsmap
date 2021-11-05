<template>
    <div :class="{ lineWrap: true, fsLineWrap: data.fs }" :style="setRoll">
        <div v-for="n in 10" :key="n" class="lines d-flex justify-center align-center">
            <span class="number">{{ n % 2 !== 0 ? 20 - ((n - 1) * 5) : null }}</span>
            <div class="line"></div>
        </div>
    </div>
</template>

<script>

export default {
    name: 'lines',
    props: ['data'],
    data: () => ({
        spans: undefined
    }),
    watch: {
        ['data.anglePitch']: function (newVal) {
            let plus = 10 - Math.ceil(newVal) % 10
            this.spans.forEach((el, index) => {
                if (index % 2 === 0) {
                    el.innerHTML = Math.ceil(newVal) - (index * 5) + 10 + plus
                }
                else {
                    el.innerHTML = ''
                }
            })
        }
    },
    mounted() {
        this.getSpans()
    },
    computed: {

        setRoll() {
            let value = Math.floor(this.data.bankAngle)
            if (value < 0) {
                if (value >= -90) {
                    return `transform: translate(-50%, -50%) rotate(${value / 3.5}deg)`
                }
                else {
                    return 'transform: translate(-50%, -50%) rotate(-18deg)'
                }
            }
            else {
                if (value <= 90) {
                    return `transform: translate(-50%, -50%) rotate(${value / 3.5}deg)`
                }
                else {
                    return 'transform: translate(-50%, -50%) rotate(18deg)'
                }
            }
        }
    },
    methods: {
        getSpans() {
            this.spans = document.querySelectorAll('.number')
        }
    }
}
</script>

<style lang="scss">

.lineWrap {
    position: absolute;
    left: 50%;
    top: 63%;
    transform: translate(-50%, -50%);
    width: 25%;
    height: 50%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    transform-origin: bottom;
    transition: all 0.3s;
    z-index: -1;

    .lines {
        position: relative;
        width: 100%;
        height: 100%;

        &:nth-child(2n) {
            .line {
                width: 40%;
            }
        }

        .number {
            position: absolute;
            left: -15px;
            width: 20%;
            white-space: nowrap;
            text-align: right;
            font-size: 80%;
        }

        .line {
            width: 70%;
            height: 2px;
            background-color: #ffffff;
        }
    }

    /* fullscreen css */
    &.fsLineWrap {
        top: 60%;

        .lines {

            &:nth-child(2n) {
                .line {
                    width: 45%;
                }
            }

            .number {
                font-size: 180%;
            }

            .line {
                width: 60%;
                height: 4px;
            }
        }
    }
}

</style>