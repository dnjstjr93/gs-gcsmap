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
        <div class="bg" style="display: none">
            <img src="@/assets/3_images/background.jpg" alt="배경"/>
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

<style>

</style>
