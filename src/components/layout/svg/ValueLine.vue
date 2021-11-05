<template>
    <div :class="{ lineWrap: true, fsLineWrap: data.fs }">
        <div v-for="n in 10" :key="n" class="lines d-flex justify-center align-center">
            <span class="number">{{ n % 2 !== 0 ? 20 - ((n - 1) * 5) : null }}</span>
            <div v-show="20 - ((n - 1) * 5) === 0" class="zeroWrap">
                <p class="line"></p>
            </div>
            <div class="line"></div>
        </div>
    </div>
</template>

<script>

export default {
    name: 'lines',
    props: [ 'data' ],
    data: () => ({
        spans: undefined,
        bg: undefined
    }),
    watch: {
        ['data.anglePitch']: function (newVal) {
            let plus = 10 - Math.ceil(newVal) % 10
            this.spans.forEach((el, index) => {
                if(index === 0 && el.closest('.mainSvg').style.getPropertyValue('--ms-background') !== 'none') {
                    if(newVal <= -30) {
                        el.closest('.mainSvg').style.setProperty('--ms-background', 'green');
                    } else {
                        el.closest('.mainSvg').style.setProperty('--ms-background', 'skyblue');
                    }
                }

                if (index % 2 === 0) {
                    el.innerHTML = Math.ceil(newVal) - (index * 5) + 10 + plus
                    if (el.innerHTML === '0') {
                        el.nextSibling.style.display = 'block'
                    } else {
                        el.nextSibling.style.display = 'none'
                    }
                } else {
                    el.innerHTML = ''
                }
            })
        }
    },
    mounted() {
        this.getSpans()
    },
    methods: {
        getSpans () {
            this.spans = document.querySelectorAll('.number')
            this.bg = document.querySelector('.mainSvg')
        }
    }
}
</script>

<style lang="scss">

.lineWrap {
    position: absolute;
    left: 50%;
    top: 18.5%;
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

        .zeroWrap {
            position: absolute;
            width: 400%;
            height: 2px;
            background-color:var(--background-color, white);

            //&::before {
            //  content: '';
            //  position: absolute;
            //  left: 0;
            //  top: -10000%;
            //  width: 100%;
            //  height: 10000%;
            //  transform: scale(2);
            //}

            &::after {
                content: '';
                position: absolute;
                left: -50%;
                top: 0;
                width: 1000%;
                height: 25000%;
                background-color:var(--background, green) ;
                z-index: -1;
            }

            p {
                position: absolute;
                background-color: rgb(0, 221, 0);
                width: 20%;
                left: 50%;
                transform: translateX(-50%);
            }
        }

        &:nth-child(2n) {
            .line {
                width: 45%;
            }
        }

        .number {
            position: absolute;
            left: -15px;
            width: 20%;
            white-space: nowrap;
            text-align: right;
            font-size: 80%;
            z-index: 1;
        }

        .line {
            width: 70%;
            height: 2px;
            background-color: #ffffff;
        }
    }


    /* fullscreen css */
    &.fsLineWrap {
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