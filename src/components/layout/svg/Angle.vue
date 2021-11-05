<template>
    <svg version="1.1"
         id="SVGRoot"
         xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 500 500"
         style="enable-background:new 0 0 500 500; position: absolute; width: 100%; height: 80%; z-index: 3" xml:space="preserve"
         class="svgImg">
    <g id="angle" :class="{ fsAngle: data.fs }">
      <path id="path3195_1_" class="st17" d="M35.4,222.1C77.6,147.2,157.9,96.6,250,96.6 c91.9,0,172.1,50.4,214.3,125.1"/>

        <text x="-25" y="210" class="num">60</text>
        <rect id="rect1731" x="16.7" y="203" transform="matrix(0.5 -0.866 0.866 0.5 -174.6422 121.6761)" class="st16" width="2.8" height="30.1"/>

        <text x="25" y="150" class="num">45</text>
        <path id="rect1739" class="st16" d="M61,155l15.2,13.3l-1.8,2.1 l-15.2-13.3L61,155z"/>

        <text x="75" y="100" class="num">30</text>
        <rect id="rect1737" x="114.8" y="100.5" transform="matrix(0.866 -0.5 0.5 0.866 -40.7164 73.1713)" class="st16" width="2.8" height="30.1"/>

        <text x="140" y="80" class="num">20</text>
        <path id="path1746" class="st16" d="M159.1,92.3l6.5,19.1l-2.6,0.9l-6.5-19.1L159.1,92.3z"/>

        <text x="190" y="70" class="num">10</text>
        <path id="path1748" class="st16" d="M205.3,80.1l3.1,20l-2.7,0.5l-3.1-20L205.3,80.1z"/>

        <text x="500" y="210" class="num">60</text>
        <rect id="rect1733" x="460.9" y="210.7" transform="matrix(0.866 -0.5 0.5 0.866 -41.4726 269.3869)" class="st16" width="30.1" height="2.8"/>

        <text x="450" y="150" class="num">45</text>
        <path id="path1742" class="st16" d="M438.8,155l-15.2,13.3l1.8,2.1l15.2-13.3L438.8,155z"/>

        <text x="400" y="100" class="num">30</text>
        <rect id="rect1735" x="363.8" y="111.2" transform="matrix(0.5 -0.866 0.866 0.5 94.4299 388.6844)" class="st16" width="30.1" height="2.8"/>

        <text x="345" y="80" class="num">20</text>
        <path id="path1744" class="st16" d="M340.9,92.3l-6.5,19.1l2.6,0.9l6.5-19.1L340.9,92.3z"/>

        <text x="290" y="70" class="num">10</text>
        <path id="path1750" class="st16" d="M294.7,80.1l-3.1,20l2.7,0.5l3.1-20L294.7,80.1z"/>

        <text x="245" y="65" class="num">0</text>
        <rect id="rect1737" x="250" y="75" class="st16" width="2.8" height="20.1"/>
    </g>
  </svg>
</template>

<script>

export default {
    name: 'Angle',
    props: ['data'],
    computed: {

        setStyle () {
            let value = Math.floor(this.data)
            if (value < 0) {
                if (value >= -60) {
                    return `transform: rotate(${value}deg)`
                } else {
                    return 'transform: rotate(-64deg)'
                }
            } else {
                if (value <= 60) {
                    return `transform: rotate(${value}deg)`
                } else {
                    return 'transform: rotate(64deg)'
                }
            }
        }
    }
}
</script>

<style lang="scss">

#angle {
    transform: translateY(-35px);
    z-index: 3;

    .num {
        fill: #ffffff;
        font-size: 1.5em
    }

    .st16{
        fill-rule:evenodd;
        clip-rule:evenodd;
        fill:#ffffff;
    }

    .st17{
        fill:none;
        stroke:#ffffff;
        stroke-width:1.441;
        stroke-miterlimit:11.3386;
    }

    /* fullscreen css */
    &.fsAngle {
        //
    }
}

</style>