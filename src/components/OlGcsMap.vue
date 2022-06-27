<template>
    <div ref="map-root"
         style="width: 100%; height: 100%">
    </div>
</template>

<script>
import View from 'ol/View'
import Map from 'ol/Map'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import MultiPoint from 'ol/geom/MultiPoint';
//import Projection from 'ol/proj'

import 'ol/ol.css'
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {Icon} from 'ol/style';
// import {Geometry} from 'ol/geom';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';


const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pin-fill" viewBox="0 0 16 16"> <path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A5.921 5.921 0 0 1 5 6.708V2.277a2.77 2.77 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354z"/> </svg>';

    export default {
    name: 'MapContainer',
    components: {},
    props: {
        geojson: Object
    },
    data: () => ({
        olMap: null,
        vectorLayer: null,
        vectorSource: null,
        selectedFeature: null,
        selectedFeatureFlag: {},
        selectedFeatureId: null,

        styles: [
            /* We are using two different styles for the polygons:
             *  - The first style is for the polygons themselves.
             *  - The second style is to draw the vertices of the polygons.
             *    In a custom `geometry` function the vertices of a polygon are
             *    returned as `MultiPoint` geometry, which will be used to render
             *    the style.
             */
            new Style({
                stroke: new Stroke({
                    color: 'blue',
                    width: 3,
                }),
                fill: new Fill({
                    color: 'rgba(0, 0, 255, 0.1)',
                }),
            }),
            new Style({
                image: new CircleStyle({
                    radius: 5,
                    fill: new Fill({
                        color: 'orange',
                    }),
                }),
                geometry: function (feature) {
                    // return the coordinates of the first ring of the polygon
                    const coordinates = feature.getGeometry().getCoordinates()[0];
                    return new MultiPoint(coordinates);
                },
            }),
        ],
        selectedStyles: [
            /* We are using two different styles for the polygons:
             *  - The first style is for the polygons themselves.
             *  - The second style is to draw the vertices of the polygons.
             *    In a custom `geometry` function the vertices of a polygon are
             *    returned as `MultiPoint` geometry, which will be used to render
             *    the style.
             */
            new Style({
                stroke: new Stroke({
                    color: 'green',
                    width: 3,
                }),
                fill: new Fill({
                    color: 'rgba(0, 0, 255, 0.1)',
                }),
            }),
            new Style({
                image: new CircleStyle({
                    radius: 5,
                    fill: new Fill({
                        color: 'orange',
                    }),
                }),
                geometry: function (feature) {
                    // return the coordinates of the first ring of the polygon
                    const coordinates = feature.getGeometry().getCoordinates()[0];
                    return new MultiPoint(coordinates);
                },
            }),
        ],
        iconFeature: new Feature({
            geometry: new Point([0, 0], ),
            name: 'Null Island',
            population: 4000,
            rainfall: 500,
        }),
        iconStyle: new Style({
            image: new Icon({
                opacity: 1,
                src: 'data:image/svg+xml;utf8,' + svg,
                scale: 1
            })
        // })
        // // new Style({
        // //     text: new Text({
        // //         text: '\uf04b',
        // //         font: 'normal 18px FontAwesome',
        // //         textBaseline: 'Bottom',
        // //         fill: new Fill({
        // //             color: 'white'
        // //         })
        // //     })
        //     new Style({
        //     image: new Icon({
        //         anchor: [0.5, 46],
        //         anchorXUnits: 'fraction',
        //         anchorYUnits: 'pixels',
        //         src: 'data:image/svg+xml;utf8,' + this.svg,
        //     }),

            // image: new CircleStyle({
            //     radius: 5,
            //     fill: new Fill({
            //         color: 'red',
            //     }),
            // }),
            // geometry: function (feature) {
            //     // return the coordinates of the first ring of the polygon
            //     const coordinates = feature.getGeometry().getCoordinates();
            //     return new Point(coordinates);
            // },
        }),
    }),
    mounted() {
        //console.log(faMapPin);
        // this.iconStyle = new Style({
        //     image: new Icon({
        //         anchor: [0.5, 46],
        //         anchorXUnits: 'fraction',
        //         anchorYUnits: 'pixels',
        //         src: 'data:image/svg+xml;utf8,' + svg,
        //     }),
        // });

        // this.iconStyle = new Style({
        //     image: new Icon({
        //         opacity: 1,
        //         src: 'data:image/svg+xml;utf8,' + svg,
        //         scale: 0.3
        //     })
        // });

        this.iconFeature.setStyle(this.iconStyle);

        this.vectorSource = new VectorSource({
            features: [],
        });

        this.vectorLayer = new VectorLayer({
            source: this.vectorSource,
            style: this.styles,
        });

        this.olMap = new Map({
            target: this.$refs["map-root"],
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                this.vectorLayer
            ],
            view: new View({
                zoom: 0,
                center: [0, 0],
                constrainResolution: true
            }),
        })

        this.olMap.on('pointermove', (event) => {
            const hovered = this.olMap.forEachFeatureAtPixel(event.pixel, (feature) => feature);
            if (hovered !== this.selectedFeature) {
                this.$set(this, 'selectedFeature', hovered);
            }
        });

        this.olMap.on('singleclick', (event) => {

            this.vectorLayer.getSource().forEachFeature((feature) => {
                //console.log(feature);

                if (!Object.prototype.hasOwnProperty.call(this.selectedFeatureFlag, feature.id_)) {
                    this.selectedFeatureFlag[feature.id_] = false;
                }

                this.selectedFeatureFlag[feature.id_] = false;
            });

            const clicked = this.olMap.forEachFeatureAtPixel(event.pixel, (feature) => feature);

            this.selectedFeature = clicked;

            if(this.selectedFeature !== undefined) {
//                this.selectedFeatureId = this.selectedFeature.getId();

                if (this.selectedFeatureId) {
                    this.vectorLayer.getSource().getFeatureById(this.selectedFeatureId).setStyle();
                    this.selectedFeatureId = null;
                }

                if (this.selectedFeature.getId() !== this.selectedFeatureId) {
                    this.selectedFeature.setStyle(this.selectedStyles);
                    this.selectedFeatureId = this.selectedFeature.getId();
                }

                if (!Object.prototype.hasOwnProperty.call(this.selectedFeatureFlag, clicked.id_)) {
                    this.selectedFeatureFlag[clicked.id_] = false;
                }

                this.selectedFeatureFlag[clicked.id_] = !this.selectedFeatureFlag[clicked.id_];

                console.log(clicked.id_, this.selectedFeatureFlag[clicked.id_]);

            }
            else {
                if (this.selectedFeatureId) {
                    this.vectorLayer.getSource().getFeatureById(this.selectedFeatureId).setStyle();
                    this.selectedFeatureId = null;
                }
            }

            // this.olMap.forEachFeatureAtPixel(event.pixel, (clicked) => {
            //     this.selectedFeature = clicked;
            //
            //     if(clicked !== undefined) {
            //         if (!Object.prototype.hasOwnProperty.call(this.selectedFeatureFlag, clicked.id_)) {
            //             this.selectedFeatureFlag[clicked.id_] = false;
            //         }
            //
            //         this.selectedFeatureFlag[clicked.id_] = !this.selectedFeatureFlag[clicked.id_];
            //
            //         console.log(clicked.id_, this.selectedFeatureFlag[clicked.id_]);
            //
            //         if (this.selectedFeatureId) {
            //             selectedFeature.setStyle();
            //             selectedFeatureId = null;
            //         }
            //         if (!selectedFeature || (selectedFeature.getId() != feature.getId())) {
            //             feature.setStyle(selectedStyle);
            //             selectedFeatureId = feature.getId();
            //         }
            //     }
            //     else {
            //         this.selectedFeatureId = null;
            //     }
            // });


        });

        // this.olMap.on('click', (event) => {
        //     if(this.selectedFeature !== undefined) {
        //         console.log('click', event, this.selectedFeature);
        //
        //         if (!Object.prototype.hasOwnProperty.call(this.selectedFeatureFlag, this.selectedFeature.id_)) {
        //             this.selectedFeatureFlag[this.selectedFeature.id_] = false;
        //         }
        //
        //         this.selectedFeatureFlag[this.selectedFeature.id_] = !this.selectedFeatureFlag[this.selectedFeature.id_];
        //
        //         console.log(this.selectedFeature.id_, this.selectedFeatureFlag[this.selectedFeature.id_]);
        //     }
        // })

        this.updateSource(this.geojson);

        setInterval(()=>{
            let coordinate = this.iconFeature.getGeometry().getCoordinates();

            console.log('coordinate', coordinate, coordinate[0], coordinate[1]);

            coordinate[0] += parseInt(Math.random() * 10000);
            coordinate[1] += parseInt(Math.random() * 10000);

            // this.iconFeature = null;
            // this.iconFeature = new Feature({
            //     geometry: new Point(coordinate ),
            //     name: 'Null Island',
            //     population: 4000,
            //     rainfall: 500,
            // });

            this.iconFeature.getGeometry().setCoordinates(coordinate);

            //this.iconFeature.setStyle(this.iconStyle);

            //this.updateSource(this.geojson);
        }, 2000);
    },
    watch: {
        geojson(value) {
            this.updateSource(value)
        },
        selectedFeature(value) {
            this.$emit('select', value)
        }
    },
    methods: {
        updateSource(geojson) {
            console.log('geojson', geojson);

            const view = this.olMap.getView();
            const source = this.vectorLayer.getSource();

            const features = new GeoJSON({
                featureProjection: 'EPSG:3857',
            }).readFeatures(geojson);

            console.log('features', features);

            features.push(this.iconFeature);
            console.log('features', features);

            source.clear();
            source.addFeatures(features);

            view.fit(source.getExtent())
        }
    }
}
</script>
