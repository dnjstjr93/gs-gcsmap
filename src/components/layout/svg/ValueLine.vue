<template>
    <div :class="{ lineWrap: true, fsLineWrap: data.fs }">
        <div v-for="n in 50" :key="n" class="lines d-flex justify-center align-center">
            <span v-show="n % 5 === 0 && n % 10 !== 0" class="number values">{{ 25 - n }}</span>
            <div v-show="n % 5 === 0" class="line">
                <div v-show="n % 5 === 0" class="horLine"></div>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    name: 'lines',
    props: ['data'],
    data: () => ({
        spans: undefined,
        bg: undefined,
        parentWrapper: undefined,
        mainBg: undefined,
        secondBg: undefined,
        parentHeight: 0,
        topHeight: 0,
        headerHeight: 0
    }),
    mounted() {
        this.init();
        this.setLines();

        if (!this.data.isVideo) {
            this.setBackground(this.data.anglePitch)
        }
    },
    watch: {
        ['data.anglePitch']: function (newVal) {
            this.spans.forEach(el => {
                let dataIdx = el.getAttribute('data-index')
                el.innerHTML = parseInt(dataIdx) + Math.ceil(newVal)
            })

            this.setLines()

            if (!this.data.isVideo) {
                this.setBackground(Math.ceil(newVal))
            }
        },

        ['data.isVideo']: function (newVal) {
            if (!newVal) {
                this.setBackground(Math.ceil(this.data.anglePitch))
            }
            else {
                this.parentWrapper.style.background = 'rgba(0, 0, 0, 0.2)'

                let item = Array.from(this.spans).find(el => parseInt(el.getAttribute('data-index')) === Math.ceil(this.data.anglePitch) * -1)
                if (item) {
                    item.nextSibling.children[0].style.display = 'none'
                }
            }
        }
    },
    methods: {
        init() {
            this.parentWrapper = document.querySelector(`#${this.data.no}_wrapper`)

            this.spans = this.parentWrapper.querySelectorAll('.number')
            this.bg = this.parentWrapper.querySelector('.mainSvg')

            if (this.spans) {
                this.setDataIndex()
            }
        },

        setDataIndex() {
            this.spans.forEach((el, idx) => {
                el.setAttribute('data-index', 25 - (idx + 1))
                el.innerHTML = parseInt(el.getAttribute('data-index')) + Math.ceil(this.data.anglePitch)
            })
        },


        setLines() {
            this.spans.forEach((el) => {
                let lastChar = el.innerHTML.split('').pop()

                if (lastChar % 5 === 0) {
                    el.nextSibling.style.display = 'block'
                    // el.nextSibling.classList.add('show')
                }
                else {
                    el.nextSibling.style.display = 'none'
                    // el.nextSibling.classList.remove('show')
                }

                if (lastChar % 5 === 0 && lastChar % 10 !== 0) {
                    el.nextSibling.classList.add('short')
                }
                else {
                    el.nextSibling.classList.remove('short')
                }

                if (lastChar % 5 === 0 && lastChar % 10 === 0) {
                    el.style.display = 'block'
                }
                else {
                    el.style.display = 'none'
                }

                if (el.innerHTML === '0') {
                    el.nextSibling.style.background = 'yellowgreen'
                }
                else {
                    el.nextSibling.style.background = 'white'
                }
            })
        },

        setBackground(value) {
            this.parentHeight = this.parentWrapper.querySelector('.lineWrap').offsetTop + 3

            this.spans.forEach((el) => {
                if (parseInt(el.getAttribute('data-index')) === value * -1) {
                    el.nextSibling.style.backgroundColor = 'yellowgreen'

                    /* el.nextSibling.children[0] : 0라인 흰색 수평선 */
                    el.nextSibling.children[0].style.display = 'block'
                    // this.bg.style.setProperty('background', `linear-gradient(skyblue ${el.parentNode.offsetTop + this.parentHeight}px, green ${el.parentNode.offsetTop + this.parentHeight}px)`);
                }
                else {
                    el.nextSibling.children[0].style.display = 'none'
                    el.nextSibling.style.backgroundColor = 'white'
                }
            })

            if (!this.data.isVideo) {
                this.setBg()
            }
        },

        setBg() {
            if (parseInt(this.spans[this.spans.length - 1].innerHTML) > 0) {
                this.bg.style.removeProperty('background')
            }

            if (parseInt(this.spans[this.spans.length - 1].innerHTML) < -50) {
                this.parentWrapper.querySelector('#hud-container').style.setProperty('background', 'green')
            }
            else {
                this.parentWrapper.querySelector('#hud-container').style.setProperty('background', 'skyblue')
            }

        }
    }
}
</script>

<style lang="scss">

.lineWrap {
    position: absolute;
    left: 50%;
    top: 16%;
    transform: translateX(-50%);
    width: 25%;
    height: 70%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    transform-origin: bottom;
    transition: all 0.3s;
    z-index: 1;

    .lines {
        position: relative;
        width: 100%;
        height: 100%;
        z-index: 1;

        .number {
            position: absolute;
            left: -12%;
            width: 20%;
            white-space: nowrap;
            text-align: right;
            font-size: 70%;
            z-index: 1;
        }

        .line {
            width: 70%;
            height: 1px;
            background-color: #ffffff;

            &.short {
                width: 45%;
            }

            .horLine {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                width: 1000%;
                height: 1500px;
                background-color: green;
                display: none;
                border-top: 3px solid white;

                &::before {
                    content: '';
                    position: absolute;
                    top: -2px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 8%;
                    height: 3px;
                    background-color: yellowgreen;
                }
            }
        }
    }


    /* fullscreen css */
    &.fsLineWrap {
        top: 20%;

        .lines {
            .number {
                left: -4%;
            }

            .values {
                font-size: 30px !important;
            }

            .line {
                width: 55%;
                height: 4px;

                &.short {
                    width: 40%;
                }
            }
        }
    }
}


</style>
