<template>
    <div id="view-port" :class="{ 'fsView': data.fs }">
        <svg
            version="1.1"
            id="SVGRoot"
            xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 500 500"
            style="enable-background:new 0 0 500 500; width: 100%; height: 100%; position: relative; z-index: 1"
            xml:space="preserve">
          <path id="path3050" class="st16 pointer" d="M250.1,99.1l-14.4,26.3h28.8L250.1,99.1z" />
        </svg>
        <div class="mainSvg" :style="{ transform: setRoll }">
            <angle :data="data.bankAngle" />
            <value-line :data="data" />
        </div>
        <div class="arrowWrap d-flex justify-space-between align-center">
            <p class="left"></p>
            <p class="center"></p>
            <p class="right"></p>
        </div>
    </div>
</template>

<script>

export default {
    name: 'BankAngle',
    props: [ 'data' ],
    components: {
        Angle: () => import('./svg/Angle'),
        ValueLine: () => import('./svg/ValueLine')
    },
    computed: {
        setRoll () {
            let value = Math.floor(this.data.bankAngle);

            return `rotate(${value}deg)`;
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
    overflow: hidden;

    .pointer {
        fill-rule: evenodd;
        clip-rule: evenodd;
        fill: red;
        transform: translateY(-45px);
    }

    .mainSvg {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        transform-origin: 50% center;
    }

    .arrowWrap {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 70%;
        transition: all 0.3s;
        z-index: 1;

        p {
            width: 20%;
            height: 3px;
            background-color: red;

            &.center {
                width: 35px;
                height: 35px;
                border: solid red;
                border-width: 4px 0 0 4px;
                display: inline-block;
                background-color: transparent;
                transform: rotateX(45deg) rotateZ(45deg);
                margin-top: 45px;
            }
        }
    }

    /* fullscreen css */
    &.fsView {
        .arrowWrap {
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
    }
}

</style>

