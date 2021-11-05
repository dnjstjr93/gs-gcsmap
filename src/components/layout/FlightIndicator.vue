<template>
    <div id="view-port" :class="{ 'fsView': data.fs }">
        <div class="mainSvg">
            <svg version="1.1"
                 id="SVGRoot"
                 xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 500 500"
                 style="enable-background:new 0 0 500 500; width: 100%; height: 75%" xml:space="preserve"
                 class="svgImg">
                <angle :data="data.bankAngle"/>
            </svg>
            <value-line :data="data"/>
        </div>
        <div class="arrowWrap d-flex justify-space-between align-center" :style="setPitch">
            <p class="left"></p>
            <p class="center"></p>
            <p class="right"></p>
        </div>
<!--        <div class="bg" style="display: none">-->
        <div class="bg">
            <img src="@/assets/background.jpg" alt="배경"/>
        </div>
    </div>
</template>

<script>

export default {
    name: 'BankAngle',
    props: ['data'],
    components: {
        Angle: () => import('./svg/Angle'),
        ValueLine: () => import('./svg/ValueLine')
    },
    computed: {

        setPitch: function () {
            let pitch = Math.floor(this.data.anglePitch)
            let plus = pitch % 10

            return `transform: translate(-50%, -50%) rotateX(${plus * 5}deg)`
        }
    }
}
</script>

<style lang="scss">

#view-port {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;

    .mainSvg {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        height: 100%;
        padding-top: 10%;
        z-index: 1;
    }

    .arrowWrap {
        position: absolute;
        left: 50%;
        top: 59%;
        transform: translate(-50%, -50%);
        width: 70%;
        transition: all 0.3s;
        z-index: 1;

        p {
            width: 20%;
            height: 2px;
            background-color: red;

            &.center {
                width: 35px;
                height: 35px;
                border: solid red;
                border-width: 0 3px 3px 0;
                display: inline-block;
                background-color: transparent;
                transform: rotate(-135deg);
                -webkit-transform: rotate(-135deg);
            }
        }
    }

    .bg {
        width: 100%;
        height: 100%;
        overflow: hidden;

        img {
            width: 130%;
            height: 130%;
        }
    }

    /* fullscreen css */
    &.fsView {
        .mainSvg {
            padding-top: 4%;
        }

        .arrowWrap {
            top: 56%;

            p {
                height: 5px;
                background-color: red;

                &.center {
                    width: 80px;
                    height: 80px;
                    border: solid red;
                    border-width: 0 5px 5px 0;
                    display: inline-block;
                    background-color: transparent;
                    transform: rotate(-135deg);
                    -webkit-transform: rotate(-135deg);
                }
            }
        }

        .bg {
            img {
                width: 150%;
                height: 120%;
            }
        }
    }
}

</style>

