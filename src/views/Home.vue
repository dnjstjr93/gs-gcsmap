<template>
    <div>
        <GcsAppBar/>
        <DroneInfoList/>
        <GcsMap/>
<!--        <v-card tile flat width="100%" height="calc(100vh - 48px)" class="px-0 ma-0">-->
<!--            <OlGcsMap :geojson="geojson" v-on:select="selected = $event"></OlGcsMap>-->
<!--        </v-card>-->
    </div>
</template>

<script>

import GcsAppBar from "../components/GcsAppBar";
import DroneInfoList from "../components/DroneInfoList";
import GcsMap from "../components/GcsMap";
// import OlGcsMap from "@/components/OlGcsMap";

export default {
    name: 'Home',

    components: {
        GcsAppBar,
        GcsMap,
        // OlGcsMap,
        DroneInfoList
    },

    data: () => ({
        selected: undefined,
        geojson: {
            "type":"FeatureCollection",
            "features":[
                {
                    type: 'Feature',
                    properties: {
                        name: 'default object',
                        quality: 'top'
                    },
                    id: 'nameA',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [
                                    -27.0703125,
                                    43.58039085560784
                                ],
                                [
                                    -28.125,
                                    23.563987128451217
                                ],
                                [
                                    -10.8984375,
                                    32.84267363195431
                                ],
                                [
                                    -27.0703125,
                                    43.58039085560784
                                ]
                            ]
                        ]
                    }
                },
                {
                    type: 'Feature',
                    properties: {
                        name: 'default object',
                        quality: 'top'
                    },
                    id: 'nameB',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [
                                    -28.0703125,
                                    43.58039085560784
                                ],
                                [
                                    -29.125,
                                    23.563987128451217
                                ],
                                [
                                    -11.8984375,
                                    32.84267363195431
                                ],
                                [
                                    -28.0703125,
                                    43.58039085560784
                                ]
                            ]
                        ]
                    }
                }
            ],
        }
    }),

    created() {
        // console.log(document.cookie);
        // document.cookie.split(";").forEach((c) => {
        //     console.log(c);
        //     document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        // });
    }
}
</script>
