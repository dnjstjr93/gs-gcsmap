<template>
    <div id="bottomWrapper" class="px-2" :class="{ 'px-4': data.fs, 'fsBottom': data.fs }">
        <div id="speeds">
            <span>{{ this.data.wayPoint.distance }} {{ this.compare }} {{ this.data.wayPoint.number }}</span>
        </div>
        <div id="mode">
            <span>{{ this.data.flightMode }}</span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'BottomData',
    props: [ 'data' ],
    computed: {
        compare () {
            return this.data.wayPoint.distance >= this.data.wayPoint.number ? '>' : '<'
        }
    }
}
</script>

<style lang="scss">

#bottomWrapper {
    position: absolute;
    bottom: 3%;
    width: 100%;
    display: flex;
    justify-content: space-between;
    z-index: 1;

    div {
        span {
            font-size: 80%;
        }
    }

    &.fsBottom {
        bottom: 6%;

        div {
            span {
                font-size: 160%;
            }
        }
    }
}

</style>