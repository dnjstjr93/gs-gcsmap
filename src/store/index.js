import Vue from 'vue'
import Vuex from 'vuex'
import axios from "axios";
import EventBus from '../EventBus';

Vue.use(Vuex)


// Vertical - align: start, center, end, baseline, stretch
// Horizontal - justify: start, cener, end, space-around, space-between
//
// Vertical Alignment:
//     <v-row align="start"></v-row> // top
// <v-row align="center"></v-row> // middle
// <v-row align="end"></v-row> // bottom
// <v-row align="stretch"></v-row> // fill height
//
//
// Horizontal Justification:
//     <v-row justify="start"></v-row> // left
// <v-row justify="center"></v-row> // center
// <v-row justify="end"></v-row> // right
// <v-row justify="space-around"></v-row> // centered - spaced evenly around
// <v-row justify="space-between"></v-row> // not centered - spaced evenly between

import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { faDotCircle } from "@fortawesome/free-solid-svg-icons";
//import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

const defaultForm = Object.freeze({
    first: '',
    last: '',
    bio: '',
    favoriteAnimal: '',
    age: null,
    terms: false,
});

const _defaultPosition = Object(
    {
        type: 'Goto',
        owner: 'unknown',
        m_icon: {
            //path: "M10.453 14.016l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM12 2.016q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
            path: faMapMarkerAlt.icon[4],
            fillColor: "grey",
            fillOpacity: 0.9,
            strokeWeight: 0.9,
            strokeColor: 'grey',
            rotation: 0,
            scale: 0.07,
            // anchor: {x: 12, y: 24},
            anchor: {x: faMapMarkerAlt.icon[0] / 2, y: faMapMarkerAlt.icon[1]},
            labelOrigin: {x: faMapMarkerAlt.icon[0] / 2, y: 0},
            // labelOrigin: {x: 12, y: 12}
        },
        m_label: {
            text: 'T',
            color: 'white',
            fontSize: '26px',
            fontWeight: 'bold'
        },
        selected: false,
        targeted: false,
        lat: 37.404523241167965,
        lng: 127.15821741355862,
        alt: 20,
        speed: 5,
        radius: 10,
        turningSpeed: 10,
        elevation: 0,
        targetMavCmd: 16,
        targetStayTime: 1
    }
);

const _defaultMarkerIcon = Object(
    {
        path: "M10.453 14.016l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM12 2.016q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
        fillColor: "grey",
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: 'grey',
        rotation: 0,
        scale: 2,
        anchor: {x: 12, y: 24},
        labelOrigin: {x: 12, y: 12}
    }
);

const _defaultCircleMarkerIcon = Object(
    {
        path: faDotCircle.icon[4],
        fillColor: "grey",
        fillOpacity: 0.9,
        strokeWeight: 0.9,
        strokeColor: 'grey',
        rotation: 0,
        scale: 0.06,
        anchor: {x: faDotCircle.icon[0] / 2, y: faDotCircle.icon[1]},
        labelOrigin: {x: faDotCircle.icon[0] / 2, y: 0},
    }
);


const droneSvgPath = "M 527.42,434.24\n" +
    "           C 525.20,434.52 523.53,435.35 523.53,436.04\n" +
    "             523.53,437.99 533.81,450.21 541.17,457.15\n" +
    "             546.03,461.59 549.91,463.96 553.52,464.51\n" +
    "             571.16,467.43 585.74,475.06 597.55,487.28\n" +
    "             626.99,517.70 626.71,564.36 596.99,594.07\n" +
    "             586.99,604.07 576.02,610.18 561.58,613.79\n" +
    "             543.11,618.51 528.39,616.99 510.06,608.10\n" +
    "             488.81,597.96 474.09,578.66 468.54,554.08\n" +
    "             466.45,544.50 465.76,543.11 458.40,535.89\n" +
    "             449.24,526.86 439.24,519.92 437.71,521.31\n" +
    "             437.15,521.86 436.74,531.86 436.74,543.39\n" +
    "             436.74,561.72 437.15,565.88 439.93,574.91\n" +
    "             459.51,636.84 522.56,669.34 582.96,648.65\n" +
    "             621.01,635.60 649.07,602.13 656.15,561.72\n" +
    "             656.70,558.80 656.98,550.05 656.98,542.28\n" +
    "             656.70,494.37 625.18,452.29 578.38,437.43\n" +
    "             570.74,434.93 564.63,434.24 549.91,433.96\n" +
    "             539.64,433.68 529.50,433.82 527.42,434.24 Z\n" +
    "           M 141.64,435.35\n" +
    "           C 118.59,440.49 99.71,451.32 82.90,469.37\n" +
    "             74.29,478.54 70.68,483.67 65.27,494.92\n" +
    "             56.24,513.95 53.74,524.50 53.74,544.36\n" +
    "             53.88,563.66 57.07,577.41 65.41,593.80\n" +
    "             90.12,643.23 147.06,666.56 199.97,649.07\n" +
    "             227.60,639.90 250.66,619.49 263.85,592.41\n" +
    "             272.46,574.91 274.26,566.30 274.26,542.69\n" +
    "             274.26,531.58 273.85,521.86 273.29,521.31\n" +
    "             269.96,518.11 243.02,542.83 243.02,549.08\n" +
    "             243.02,555.47 236.21,574.08 231.08,581.71\n" +
    "             214.13,606.71 185.67,619.63 156.50,615.46\n" +
    "             120.40,610.32 93.87,581.02 92.07,544.36\n" +
    "             90.82,520.75 97.21,504.09 113.87,487.28\n" +
    "             125.81,475.20 137.06,469.09 153.17,465.76\n" +
    "             162.61,463.96 163.59,463.26 170.81,455.76\n" +
    "             179.69,446.46 186.92,436.32 185.67,435.07\n" +
    "             183.72,433.13 150.67,433.27 141.64,435.35 Z\n" +
    "           M 348.00,79.29\n" +
    "           C 348.83,80.82 348.83,105.82 347.86,110.82\n" +
    "             347.58,112.20 345.36,117.48 342.86,122.34\n" +
    "             332.86,142.20 329.67,154.56 325.50,190.25\n" +
    "             324.25,201.36 323.14,211.22 323.14,212.05\n" +
    "             323.14,213.02 322.59,213.86 321.89,213.86\n" +
    "             321.34,213.86 320.78,214.69 320.78,215.52\n" +
    "             320.64,217.74 309.26,226.35 306.48,226.35\n" +
    "             302.73,226.35 285.23,219.69 274.12,214.13\n" +
    "             267.87,211.08 257.74,204.69 251.63,199.97\n" +
    "             234.96,187.47 226.63,176.78 224.41,165.25\n" +
    "             223.85,162.61 222.47,157.20 221.22,153.31\n" +
    "             219.27,146.50 218.72,145.95 213.02,144.42\n" +
    "             209.69,143.45 206.91,142.34 206.91,141.92\n" +
    "             206.91,141.51 208.16,139.84 209.69,138.17\n" +
    "             209.69,138.17 212.61,135.12 212.61,135.12\n" +
    "             212.61,135.12 206.36,129.42 206.36,129.42\n" +
    "             177.89,103.18 132.90,111.93 115.68,146.92\n" +
    "             112.07,154.14 111.79,156.09 111.79,170.81\n" +
    "             111.79,185.53 112.07,187.47 115.68,194.69\n" +
    "             124.01,211.77 138.17,222.47 158.17,226.91\n" +
    "             163.72,228.16 169.97,230.10 172.06,231.07\n" +
    "             184.42,237.46 204.97,262.74 215.52,284.12\n" +
    "             215.52,284.12 222.47,298.43 222.47,298.43\n" +
    "             222.47,298.43 222.60,313.84 222.60,313.84\n" +
    "             222.88,328.98 223.02,329.39 226.77,332.73\n" +
    "             230.66,336.06 230.66,336.20 230.66,352.44\n" +
    "             230.52,368.69 227.74,388.27 223.16,402.99\n" +
    "             221.91,407.16 221.63,409.66 222.47,409.94\n" +
    "             223.30,410.21 222.88,413.55 221.35,418.41\n" +
    "             219.41,424.66 218.44,426.18 216.63,425.63\n" +
    "             214.97,425.07 213.58,426.46 211.63,430.77\n" +
    "             208.02,438.82 195.53,457.29 187.33,466.73\n" +
    "             177.75,477.84 171.78,481.45 159.42,483.81\n" +
    "             129.56,489.51 111.09,511.03 111.09,540.19\n" +
    "             111.09,570.61 132.62,593.80 163.17,596.71\n" +
    "             185.67,598.80 209.55,584.91 218.85,564.50\n" +
    "             220.52,560.61 222.74,553.52 223.58,548.53\n" +
    "             225.66,536.72 229.69,530.19 240.52,520.47\n" +
    "             260.65,502.70 280.51,491.87 304.95,485.06\n" +
    "             318.42,481.31 319.53,481.17 355.50,481.17\n" +
    "             391.47,481.17 392.58,481.31 406.05,485.06\n" +
    "             431.04,492.01 453.82,504.78 471.73,521.86\n" +
    "             481.73,531.31 483.81,535.33 487.56,550.33\n" +
    "             491.17,564.77 495.76,573.24 504.37,581.30\n" +
    "             532.83,607.96 577.97,599.35 595.32,564.08\n" +
    "             598.93,556.86 599.21,554.91 599.21,540.19\n" +
    "             599.21,525.47 598.93,523.53 595.32,516.31\n" +
    "             586.99,499.23 572.83,488.53 552.83,484.09\n" +
    "             547.28,482.84 541.03,480.90 538.94,479.93\n" +
    "             528.39,474.37 509.36,452.71 499.78,435.35\n" +
    "             496.31,428.96 493.53,425.35 492.42,425.77\n" +
    "             490.62,426.46 486.17,413.27 486.31,407.58\n" +
    "             486.31,406.05 484.92,398.83 483.40,391.61\n" +
    "             481.04,381.61 480.34,373.27 480.20,357.17\n" +
    "             480.06,336.61 480.06,335.92 483.40,332.45\n" +
    "             486.31,329.25 486.87,327.31 487.42,314.12\n" +
    "             488.12,299.68 488.40,298.84 495.34,284.68\n" +
    "             503.12,268.85 510.48,258.02 522.42,245.10\n" +
    "             531.72,235.10 540.47,229.96 553.52,226.91\n" +
    "             573.24,222.33 586.58,211.91 594.77,194.69\n" +
    "             598.93,186.08 599.21,184.28 599.21,170.67\n" +
    "             599.21,156.64 599.07,155.67 593.93,145.53\n" +
    "             583.38,124.15 562.27,112.34 538.11,114.29\n" +
    "             526.17,115.40 511.59,122.20 503.53,130.40\n" +
    "             498.12,135.81 498.12,136.09 500.62,138.73\n" +
    "             502.98,141.51 502.98,141.64 499.37,143.03\n" +
    "             497.28,143.73 494.92,144.42 494.23,144.42\n" +
    "             492.42,144.42 489.23,152.34 487.28,161.36\n" +
    "             486.45,165.39 484.23,171.64 482.42,175.11\n" +
    "             473.68,192.47 438.68,216.77 411.46,224.41\n" +
    "             403.13,226.63 402.85,226.63 398.27,223.85\n" +
    "             389.11,218.16 386.61,213.86 385.50,202.61\n" +
    "             382.02,164.00 377.30,143.59 367.58,123.73\n" +
    "             367.58,123.73 361.75,111.79 361.75,111.79\n" +
    "             361.75,111.79 361.75,94.71 361.75,94.71\n" +
    "             361.75,94.71 361.75,77.77 361.75,77.77\n" +
    "             361.75,77.77 354.39,77.77 354.39,77.77\n" +
    "             349.39,77.77 347.31,78.32 348.00,79.29 Z\n" +
    "           M 342.59,165.53\n" +
    "           C 342.17,166.64 341.75,166.22 341.75,164.70\n" +
    "             341.61,163.17 342.03,162.34 342.45,162.89\n" +
    "             342.86,163.31 343.00,164.56 342.59,165.53 Z\n" +
    "           M 368.97,173.86\n" +
    "           C 368.55,174.97 368.14,174.56 368.14,173.03\n" +
    "             368.00,171.50 368.41,170.67 368.83,171.22\n" +
    "             369.25,171.64 369.39,172.89 368.97,173.86 Z\n" +
    "           M 370.36,183.58\n" +
    "           C 369.94,184.69 369.53,184.28 369.53,182.75\n" +
    "             369.39,181.22 369.80,180.39 370.22,180.94\n" +
    "             370.64,181.36 370.78,182.61 370.36,183.58 Z\n" +
    "           M 339.81,184.97\n" +
    "           C 339.39,186.08 338.97,185.67 338.97,184.14\n" +
    "             338.84,182.61 339.25,181.78 339.67,182.33\n" +
    "             340.09,182.75 340.22,184.00 339.81,184.97 Z\n" +
    "           M 371.75,196.08\n" +
    "           C 371.33,197.19 370.91,196.77 370.91,195.25\n" +
    "             370.78,193.72 371.19,192.89 371.61,193.44\n" +
    "             372.03,193.86 372.16,195.11 371.75,196.08 Z\n" +
    "           M 338.42,197.47\n" +
    "           C 338.00,198.58 337.59,198.16 337.59,196.64\n" +
    "             337.45,195.11 337.86,194.28 338.28,194.83\n" +
    "             338.70,195.25 338.84,196.50 338.42,197.47 Z\n" +
    "           M 373.14,209.97\n" +
    "           C 372.72,211.08 372.30,210.66 372.30,209.13\n" +
    "             372.16,207.61 372.58,206.77 373.00,207.33\n" +
    "             373.41,207.75 373.55,209.00 373.14,209.97 Z\n" +
    "           M 337.03,212.74\n" +
    "           C 336.61,213.72 336.34,213.02 336.34,211.08\n" +
    "             336.34,209.13 336.61,208.44 337.03,209.27\n" +
    "             337.31,210.24 337.31,211.91 337.03,212.74 Z\n" +
    "           M 334.81,223.99\n" +
    "           C 333.42,225.24 333.28,225.10 334.11,223.16\n" +
    "             334.53,221.77 335.36,221.08 335.78,221.49\n" +
    "             336.20,221.91 335.78,223.02 334.81,223.99 Z\n" +
    "           M 380.50,227.33\n" +
    "           C 380.50,227.60 378.97,226.77 377.02,225.52\n" +
    "             375.08,224.27 373.55,222.74 373.55,222.05\n" +
    "             373.55,221.35 375.08,222.19 377.02,223.85\n" +
    "             378.97,225.52 380.50,227.05 380.50,227.33 Z\n" +
    "           M 136.09,59.85\n" +
    "           C 97.62,69.85 67.07,100.68 56.80,139.56\n" +
    "             53.33,152.75 52.63,176.64 55.41,189.55\n" +
    "             59.16,206.77 68.60,225.94 80.68,240.24\n" +
    "             95.82,258.29 123.45,273.43 147.34,276.90\n" +
    "             153.17,277.73 153.86,278.29 154.70,282.04\n" +
    "             154.70,282.04 155.53,286.07 155.53,286.07\n" +
    "             155.53,286.07 163.45,282.18 163.45,282.18\n" +
    "             167.89,279.96 175.11,277.60 179.56,277.18\n" +
    "             183.86,276.62 187.47,275.65 187.47,274.96\n" +
    "             187.47,273.29 177.47,261.21 170.39,254.27\n" +
    "             164.97,249.13 162.61,247.88 152.75,245.66\n" +
    "             117.62,237.46 94.01,210.24 92.07,175.67\n" +
    "             91.10,159.84 93.18,150.12 100.12,136.23\n" +
    "             109.98,116.37 129.84,101.23 152.06,96.51\n" +
    "             164.28,94.01 170.39,94.01 182.33,96.51\n" +
    "             201.64,100.54 217.88,110.95 228.44,125.67\n" +
    "             235.80,135.95 238.99,143.03 242.32,156.78\n" +
    "             244.27,164.56 246.07,168.45 249.82,172.61\n" +
    "             255.24,178.72 269.82,190.25 272.04,190.25\n" +
    "             276.35,190.25 275.51,150.67 270.79,135.40\n" +
    "             259.13,97.90 228.99,69.43 191.08,59.71\n" +
    "             176.08,55.96 150.81,55.96 136.09,59.85 Z\n" +
    "           M 531.44,57.07\n" +
    "           C 503.81,60.82 475.34,77.21 458.96,98.87\n" +
    "             450.49,110.12 441.04,129.84 438.26,142.62\n" +
    "             436.04,152.75 435.35,173.58 436.88,185.11\n" +
    "             436.88,185.11 437.85,191.50 437.85,191.50\n" +
    "             437.85,191.50 445.90,185.80 445.90,185.80\n" +
    "             450.49,182.75 456.73,177.19 460.07,173.72\n" +
    "             465.07,168.31 466.59,165.53 468.68,156.92\n" +
    "             474.65,131.37 488.40,113.45 510.06,102.76\n" +
    "             575.74,70.54 643.93,140.26 610.88,205.94\n" +
    "             604.77,217.88 589.49,232.88 577.41,238.57\n" +
    "             572.41,241.07 563.66,243.99 557.97,245.24\n" +
    "             547.97,247.46 547.69,247.60 535.75,259.82\n" +
    "             528.95,266.62 523.53,273.01 523.53,274.12\n" +
    "             523.53,275.37 525.89,276.35 530.47,276.90\n" +
    "             534.22,277.46 541.30,279.68 546.03,281.90\n" +
    "             546.03,281.90 554.77,286.07 554.77,286.07\n" +
    "             554.77,286.07 555.19,282.18 555.19,282.18\n" +
    "             555.61,278.29 556.02,278.01 567.55,275.79\n" +
    "             611.02,267.32 645.73,233.30 654.76,190.53\n" +
    "             657.40,178.17 657.40,154.98 654.62,142.62\n" +
    "             651.70,129.15 640.73,106.79 631.43,95.68\n" +
    "             607.82,67.35 568.24,52.08 531.44,57.07 Z";

const planeSvgPath = "M496.469,353.365l-197.781-197.76V67.904c0-13.845-3.072-27.797-9.131-40.811l-4.501-8.533\n" +
    "\t\t\tC279.744,7.104,268.629,0,256.021,0s-23.723,7.104-28.8,18.069l-4.971,9.493c-5.824,12.544-8.896,26.475-8.896,40.341v87.701\n" +
    "\t\t\tL15.637,353.323C5.568,363.392,0.021,376.768,0.021,391.019v25.003c0,3.904,2.133,7.488,5.547,9.344\n" +
    "\t\t\tc3.413,1.877,7.595,1.749,10.88-0.384l201.045-128.832c1.984,32.277,4.672,59.221,7.957,92.011l3.392,33.6l-74.688,49.344\n" +
    "\t\t\tc-3.008,2.005-4.8,5.333-4.8,8.917v21.333c0,3.221,1.472,6.293,3.989,8.32c2.539,2.048,5.845,2.816,8.981,2.112l93.696-20.843\n" +
    "\t\t\tl93.696,20.843c0.768,0.171,1.536,0.256,2.304,0.256c2.411,0,4.757-0.811,6.677-2.347c2.517-2.048,3.989-5.12,3.989-8.341v-21.333\n" +
    "\t\t\tc0-3.584-1.792-6.933-4.8-8.896l-74.688-49.28l3.392-33.707c3.285-32.747,5.973-59.669,7.957-91.947l201.045,128.789\n" +
    "\t\t\tc3.307,2.133,7.467,2.24,10.859,0.384c3.435-1.856,5.568-5.44,5.568-9.344v-25.003\n" +
    "\t\t\tC512.021,376.768,506.496,363.392,496.469,353.365z";

//
// const _defaultDroneIcon = {
//         path: droneSvgPath,
//         fillColor: "grey",
//         fillOpacity: 1,
//         strokeWeight: 1,
//         strokeColor: 'grey',
//         rotation: 0,
//         scale: 0.2,
//         anchor: {x: 12, y: 24},
//         labelOrigin: {x: 12, y: 12}
// };

const _defaultDroneInfo = {
    name: "KETI_Air_01",
    id: "Zeus",
    bat_cell: 6,
    goto_positions: [
        "37.1710644:128.4724337:50:5:255:25:16:1:0.0:0",
        "37.1703954:128.4696845:50:10:255:25:16:1:0.0:0",
        "37.1703954:128.4696845:100:10:255:25:16:1:0.0:0",
        "37.1703954:128.4696845:150:10:255:25:16:1:0.0:0",
        "37.1703954:128.4696845:200:10:255:25:16:1:0.0:0",
        "37.1703954:128.4696845:300:10:255:25:16:1:0.0:0",
        "37.1703954:128.4696845:400:10:255:25:16:1:0.0:0",
        "37.1703954:128.4696845:500:10:255:25:16:1:0.0:0",
        "37.1703954:128.4696845:600:10:255:25:16:1:0.0:0",
        "37.1707969:128.4712104:250:7:70:25:16:1:0.0:0",
    ],
    "system_id": 12
};

export default new Vuex.Store({
    state: {
        MOBIUS_CONNECTION_CONNECTED: false,
        VUE_APP_MOBIUS_HOST: '203.253.128.177',
        VUE_APP_MOBIUS_GCS: 'KETI_GCS',

        refColorValue: {
            red: '#F44336',
            pink: '#E91E63',
            purple: '#9C27B0',
            'deep-purple': '#673AB7',
            indigo: '#3F51B5',
            blue: '#2196F3',
            'light-blue': '#03A9F4',
            cyan: '#00BCD4',
            teal: '#009688',
            green: '#4CAF50',
            'light-green': '#8BC34A',
            lime: '#CDDC39',
            yellow: '#FFEB3B',
            amber: '#FFC107',
            orange: '#FF9800',
            'deep-orange': '#FF5722',
            brown: '#795548',
            'blue-grey': '#607D8B'
        },

        refColorName: {
            '#F44336': 'red',
            '#E91E63': 'pink',
            '#9C27B0': 'purple',
            '#673AB7': 'deep-purple',
            '#3F51B5': 'indigo',
            '#2196F3': 'blue',
            '#03A9F4': 'light-blue',
            '#00BCD4': 'cyan',
            '#009688': 'teal',
            '#4CAF50': 'green',
            '#8BC34A': 'light-green',
            '#CDDC39': 'lime',
            '#FFEB3B': 'yellow',
            '#FFC107': 'amber',
            '#FF9800': 'orange',
            '#FF5722': 'deep-orange',
            '#795548': 'brown',
            '#607D8B': 'blue-grey'
        },

        defaultGotoMarkerIcon: {
            path: faMapMarkerAlt.icon[4],
            fillColor: "grey",
            fillOpacity: 0.9,
            strokeWeight: 0.9,
            strokeColor: 'grey',
            rotation: 0,
            scale: 0.07,
            anchor: {x: faMapMarkerAlt.icon[0] / 2, y: faMapMarkerAlt.icon[1]},
            labelOrigin: {x: faMapMarkerAlt.icon[0] / 2, y: 0},
        },

        defaultCircleMarkerIcon: {
            path: faDotCircle.icon[4],
            fillColor: "grey",
            fillOpacity: 0.9,
            strokeWeight: 0.9,
            strokeColor: 'grey',
            rotation: 0,
            scale: 0.06,
            anchor: {x: faDotCircle.icon[0] / 2, y: faDotCircle.icon[1] / 2},
            labelOrigin: {x: faDotCircle.icon[0] / 2, y: 0},
        },

        // markerColor: [
        //     'red',
        //     'pink',
        //     'purple',
        //     'deep-purple',
        //     'indigo',
        //     'blue',
        //     'light-blue',
        //     'cyan',
        //     'teal',
        //     'green',
        //     'light-green',
        //     'lime',
        //     'yellow',
        //     'amber',
        //     'orange',
        //     'deep-orange',
        //     'brown',
        //     'blue-grey'
        // ],

        form: Object.assign({}, defaultForm),

        defaultPosition: Object.assign({}, _defaultPosition),
        defaultMarkerIcon: Object.assign({}, _defaultMarkerIcon),
        __defaultCircleMarkerIcon: Object.assign({}, _defaultCircleMarkerIcon),

        adding: false,
        gotoMarkers: [],
        tempMarkers: {
        },
        surveyMarkers: {
        },

        curDronePositions: {},
        movingMarkers: {},

        tempPayload: {},

        defaultPlaneIcon: {
            path: planeSvgPath,
            fillColor: "orange",
            fillOpacity: 1,
            strokeWeight: 0.5,
            strokeColor: 'orange',
            rotation: 0,
            scale: 0.08,
            anchor: {x: 256, y: 256},
            labelOrigin: {x: 256, y: 256}
        },

        defaultDroneIcon: {
            path: droneSvgPath,
            fillColor: "grey",
            fillOpacity: 0.8,
            strokeWeight: 0.8,
            strokeColor: 'white',
            rotation: 0,
            scale: 0.1,
            anchor: {x: 350, y: 351},
            labelOrigin: {x: 350, y: 370}
        },

        defaultDroneLabel: {
            text: 'D',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
        },

        defaultDroneInfo: Object.assign({}, _defaultDroneInfo), //JSON.parse(JSON.stringify(_defaultDroneInfo)),

        drone_infos: {},

        //selectedDrone: {},

        unknown_info: {},

        countFlying: 0,

        ardupilot_mode_items: ['STABILIZE', 'ACRO', 'ALT_HOLD', 'AUTO', 'GUIDED', 'LOITER',
            'RTL', 'CIRCLE', 'POSITION', 'LAND', 'OF_LOITER', 'DRIFT', 'RESERVED_12', 'SPORT',
            'FLIP', 'AUTOTUNE', 'POS_HOLD', 'BRAKE', 'THROW', 'AVOID_ADSB', 'GUIDED_NOGPS', 'SAFE_RTL'],
        px4_mode_items: ['MANUAL', 'ALTCTL', 'POSCTL', 'AUTO', 'HOLD', 'LOITER',
            'RTL', 'CIRCLE', 'POSITION', 'LAND', 'OF_LOITER', 'DRIFT', 'RESERVED_12', 'SPORT',
            'FLIP', 'AUTOTUNE', 'POS_HOLD', 'BRAKE', 'THROW', 'AVOID_ADSB', 'GUIDED_NOGPS', 'SAFE_RTL'],
        command_tab_left_x: 0,
        command_tab_max_height: 640,
        command_tab_max_width: 640,
        currentCommandTab: 'virtual',
        // dronesChecked: {},

        curTargetedTempMarkerIndex: {},

        trackingLines: {},
        homeCircle: {},

        targetLines: {},
        missionLines: {},

        targetCircles: {},
        missionCircles: {},

        distanceTarget: {},

        client: {
            connected: false,
            loading: false
        },

        didIPublish: false,
        fs: false,
        enableVideo: true,
    },

    mutations: {
        // initTempMarkers(state, payload) {
        //     state.tempMarkers.unknown = null;
        //     state.tempMarkers.unknown = [];
        //     state.tempMarkers.unknown = JSON.parse(JSON.stringify(payload));
        // },
        //
        // setDroneColorMap(state, payload) {
        //     state.drone_infos[payload.pName].color = payload.color;
        // },

        updatePosition(state, payload) {
            console.log(payload);
            console.log(state.gotoMarkers[payload.mIndex].positions[payload.pIndex].lat);
            state.gotoMarkers[payload.mIndex].positions[payload.pIndex].lat = payload.lat;
            state.gotoMarkers[payload.mIndex].positions[payload.pIndex].lng = payload.lng;
        },

        updateFillColor(state, payload) {
            console.log(payload);
            state.gotoMarkers[payload.mIndex].m_icon.fillColor = payload.fillColor;
        },

        updateLabelText(state, payload) {
            console.log(payload);
            state.gotoMarkers[payload.mIndex].positions[payload.pIndex].m_label.fontSize = '14px';
            state.gotoMarkers[payload.mIndex].positions[payload.pIndex].m_label.text = String(payload.text) + ':' + String(state.gotoMarkers[payload.mIndex].positions[payload.pIndex].alt);
        },

        // initUnknownInfo(state, unknown) {
        //     state.unknown_info = null;
        //     state.unknown_info = {};
        //     state.unknown_info = JSON.parse(JSON.stringify(unknown));
        //
        //     // for (let idx in state.unknown_info.goto_positions) {
        //     //     if (Object.prototype.hasOwnProperty.call(state.unknown_info.goto_positions, idx)) {
        //     //         let pos_arr = state.unknown_info.goto_positions[idx].split(':');
        //     //
        //     //         let pos = JSON.parse(JSON.stringify(state.defaultPosition));
        //     //         pos.lat = parseFloat(pos_arr[0]);
        //     //         pos.lng = parseFloat(pos_arr[1]);
        //     //         pos.alt = parseFloat(pos_arr[2]);
        //     //         pos.speed = parseFloat(pos_arr[3]);
        //     //         pos.radius = parseFloat(pos_arr[4]);
        //     //         pos.turningSpeed = parseFloat(pos_arr[5]);
        //     //         pos.targetMavCmd = (typeof pos_arr[6] === 'undefined') ? 16 : parseInt(pos_arr[6]);
        //     //         pos.targetStayTime = (typeof pos_arr[7] === 'undefined') ? 1 : parseInt(pos_arr[7]);
        //     //         pos.elevation = (typeof pos_arr[8] === 'undefined') ? 0.0 : parseInt(pos_arr[8]);
        //     //         pos.type = (typeof pos_arr[9] === 'undefined') ? 0 : parseInt(pos_arr[9]);
        //     //         pos.color = 'grey';
        //     //         pos.m_icon.fillColor = 'grey';
        //     //         pos.m_label.fontSize = '14px';
        //     //         pos.m_label.text = 'T:' + String(pos.alt);
        //     //
        //     //         state.drone_infos.unknown.color = pos.color;
        //     //         state.tempMarkers.unknown.push(pos);
        //     //         pos = null;
        //     //     }
        //     // }
        // },

        updateTempPosition(state, payload) {
            console.log('vuex', 'updateTempPosition', payload);

            // let self = this;
            state.tempMarkers[payload.pName][payload.pIndex].lat = payload.lat;
            state.tempMarkers[payload.pName][payload.pIndex].lng = payload.lng;
            state.tempMarkers[payload.pName][payload.pIndex].targeted = payload.value;

            if(!Object.hasOwnProperty.call(state.tempMarkers[payload.pName][payload.pIndex], 'type')) {
                state.tempMarkers[payload.pName][payload.pIndex].type = 'Goto';
            }

            if(!Object.hasOwnProperty.call(state.tempMarkers[payload.pName][payload.pIndex], 'mavCmd')) {
                state.tempMarkers[payload.pName][payload.pIndex].targetMavCmd = 16;
            }

            if(!Object.hasOwnProperty.call(state.tempMarkers[payload.pName][payload.pIndex], 'targetStayTime')) {
                state.tempMarkers[payload.pName][payload.pIndex].targetStayTime = 1;
            }

            let temp = JSON.parse(JSON.stringify(state.tempMarkers));
            state.tempMarkers = null;
            state.tempMarkers = JSON.parse(JSON.stringify(temp));
            temp = null;

            let _temp = JSON.parse(JSON.stringify(state.drone_infos[payload.pName]));
            state.drone_infos[payload.pName] = null;
            state.drone_infos[payload.pName] = {};
            state.drone_infos[payload.pName] = JSON.parse(JSON.stringify(_temp));
            _temp = null;

            if (payload.pName === 'unknown') {
                state.unknown_info = null;
                state.unknown_info = {};
                state.unknown_info = JSON.parse(JSON.stringify(state.drone_infos.unknown));
            }
            else {
                this.commit('updateDroneInfosSelected');
            }

            let dName = payload.pName;
            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'post',
                url: 'http://' + state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + state.VUE_APP_MOBIUS_GCS + '/MarkerInfos/' + dName,
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json;ty=4'
                },
                data: {
                    'm2m:cin': {
                        con: state.tempMarkers[dName]
                    }
                }
            }).then(
                function (res) {
                    console.log('-------------------------------------------------------updateTempPosition-axios', res.data);
                }
            ).catch(
                function (err) {
                    console.log(err.message);
                }
            );
        },

        selectTempMarker(state, payload) {
            console.log(payload);

            state.tempMarkers[payload.pName].forEach((pos) => {
                pos.selected = false;
            });

            state.tempMarkers[payload.pName][payload.pIndex].selected = payload.selected;
        },

        setSelected(state, payload) {
            state.tempMarkers[payload.pName][payload.pIndex].selected = payload.value;

            payload.targeted = true;
            EventBus.$emit('do-targetTempMarker', payload);
        },

        setAllTempMarker(state, value) {
            console.log(value);

            if (value) {
                for (let pName in state.tempMarkers) {
                    if (Object.prototype.hasOwnProperty.call(state.tempMarkers, pName)) {
                        state.tempMarkers[pName].forEach((pos) => {
                            if (!pos.selected) {
                                pos.selected = true;
                                let temp = JSON.parse(JSON.stringify(pos.m_icon));
                                pos.m_icon = null;
                                pos.m_icon = JSON.parse(JSON.stringify(temp));
                                temp = null;
                                pos.m_icon.strokeWeight = 5;
                                pos.m_icon.strokeColor = 'springgreen';
                            }
                        });
                    }
                }
            }
            else {
                for (let pName in state.tempMarkers) {
                    if (Object.prototype.hasOwnProperty.call(state.tempMarkers, pName)) {
                        state.tempMarkers[pName].forEach((pos) => {
                            if (pos.selected) {
                                pos.selected = false;
                                let temp = JSON.parse(JSON.stringify(pos.m_icon));
                                pos.m_icon = null;
                                pos.m_icon = JSON.parse(JSON.stringify(temp));
                                temp = null
                                pos.m_icon.strokeWeight = 1;
                                pos.m_icon.strokeColor = 'grey';
                            }
                        });
                    }
                }
            }
        },

        initAllTempMarker(state) {
            for (let pName in state.tempMarkers) {
                if (Object.prototype.hasOwnProperty.call(state.tempMarkers, pName)) {
                    state.tempMarkers[pName].forEach((pos) => {
                        if (pos.selected) {
                            pos.selected = false;
                            let temp = JSON.parse(JSON.stringify(pos.m_icon));
                            pos.m_icon = null;
                            pos.m_icon = JSON.parse(JSON.stringify(temp));
                            temp = null
                            pos.m_icon.strokeWeight = 1;
                            pos.m_icon.strokeColor = 'grey';

                            pos.targeted = false;
                            state.curTargetedTempMarkerIndex[pName] = null;
                        }
                    });
                }
            }

            let temp = JSON.parse(JSON.stringify(state.tempMarkers));
            state.tempMarkers = null;
            state.tempMarkers = {};
            state.tempMarkers = JSON.parse(JSON.stringify(temp));
            temp = null;
        },

        setTargetAllTempMarker(state, payload) {
            console.log(payload);

            if (payload.value) {
                state.tempMarkers[payload.pName].forEach((pos, pIndex) => {
                    if (!pos.selected) {
                        if (!pos.targeted) {
                            pos.targeted = true;
                            let temp = JSON.parse(JSON.stringify(pos.m_icon));
                            pos.m_icon = null;
                            pos.m_icon = JSON.parse(JSON.stringify(temp));
                            temp = null;
                            pos.m_icon.strokeWeight = 4;
                            pos.m_icon.strokeColor = '#FFFF8D';

                            state.curTargetedTempMarkerIndex[payload.pName] = pIndex;
                        }
                    }
                });
            }
            else {
                state.tempMarkers[payload.pName].forEach((pos) => {
                    if (!pos.selected) {
                        if (pos.targeted) {
                            pos.targeted = false;
                            let temp = JSON.parse(JSON.stringify(pos.m_icon));
                            pos.m_icon = null;
                            pos.m_icon = JSON.parse(JSON.stringify(temp));
                            temp = null;
                            pos.m_icon.strokeWeight = 1;
                            pos.m_icon.strokeColor = 'grey';

                            state.curTargetedTempMarkerIndex[payload.pName] = null;
                        }
                    }
                });
            }
        },

        setTempMarker(state, payload) {
            console.log(payload);

            let value = payload.value;
            let pName = payload.pName;
            let pIndex = payload.pIndex;

            let temp = JSON.parse(JSON.stringify(state.tempMarkers[pName][pIndex].m_icon));

            if (value) {
                if (!state.tempMarkers[pName][pIndex].selected) {
                    state.tempMarkers[pName][pIndex].selected = true;
                    state.tempMarkers[pName][pIndex].m_icon = null;
                    state.tempMarkers[pName][pIndex].m_icon = JSON.parse(JSON.stringify(temp));
                    temp = null;
                    state.tempMarkers[pName][pIndex].m_icon.strokeWeight = 5;
                    state.tempMarkers[pName][pIndex].m_icon.strokeColor = 'springgreen';
                }
            }
            else {
                if (state.tempMarkers[pName][pIndex].selected) {
                    state.tempMarkers[pName][pIndex].selected = false;
                    state.tempMarkers[pName][pIndex].m_icon = null;
                    state.tempMarkers[pName][pIndex].m_icon = JSON.parse(JSON.stringify(temp));
                    temp = null;
                    state.tempMarkers[pName][pIndex].m_icon.strokeWeight = 1;
                    state.tempMarkers[pName][pIndex].m_icon.strokeColor = 'grey';
                }
            }
        },

        setTargetTempMarker(state, payload) {
            console.log(payload);

            let value = payload.value;
            let pName = payload.pName;
            let pIndex = payload.pIndex;

            let temp = JSON.parse(JSON.stringify(state.tempMarkers[pName][pIndex].m_icon));

            if (value) {
                if (!state.tempMarkers[pName][pIndex].targeted) {
                    state.tempMarkers[pName][pIndex].targeted = true;
                    state.tempMarkers[pName][pIndex].m_icon = null;
                    state.tempMarkers[pName][pIndex].m_icon = JSON.parse(JSON.stringify(temp));
                    temp = null;
                    state.tempMarkers[pName][pIndex].m_icon.strokeWeight = 4;
                    state.tempMarkers[pName][pIndex].m_icon.strokeColor = '#FFFF8D';

                    state.curTargetedTempMarkerIndex[pName] = pIndex;
                }
            }
            else {
                if (state.tempMarkers[pName][pIndex].targeted) {
                    state.tempMarkers[pName][pIndex].targeted = false;
                    state.tempMarkers[pName][pIndex].m_icon = null;
                    state.tempMarkers[pName][pIndex].m_icon = JSON.parse(JSON.stringify(temp));
                    temp = null;
                    state.tempMarkers[pName][pIndex].m_icon.strokeWeight = 1;
                    state.tempMarkers[pName][pIndex].m_icon.strokeColor = 'grey';

                    state.curTargetedTempMarkerIndex[pName] = null;
                }
            }


        },

        addTempMarker(state, payload) {
            if (!Object.prototype.hasOwnProperty.call(state.tempMarkers, payload.pName)) {
                state.tempMarkers[payload.pName] = [];
            }
            else {
                let temp = JSON.parse(JSON.stringify(state.tempMarkers[payload.pName]));
                state.tempMarkers[payload.pName] = null;
                state.tempMarkers[payload.pName] = [];
                state.tempMarkers[payload.pName] = JSON.parse(JSON.stringify(temp));
                temp = null;
            }

            let marker = JSON.parse(JSON.stringify(state.defaultPosition));
            marker.lat = payload.lat;
            marker.lng = payload.lng;
            marker.alt = payload.alt;
            marker.speed = payload.speed;
            marker.radius = payload.radius;
            marker.turningSpeed = payload.turningSpeed;
            marker.elevation = payload.elevation;
            marker.targetMavCmd = payload.targetMavCmd;
            marker.targetStayTime = payload.targetStayTime;
            marker.type = 'Goto';

            marker.m_icon.fillColor = payload.color;
            marker.m_label.fontSize = '14px';
            marker.m_label.text = ((payload.pName === 'unknown') ? 'T' : String(state.tempMarkers[payload.pName].length)) + ':' + String(marker.alt);

            state.tempMarkers[payload.pName].push(marker);

            marker = null;

            //console.log('addTempMarker', JSON.stringify(state.tempMarkers));
        },

        addingTempMarker(state, payload) {
            state.adding = true;
            this.commit('addTempMarker', payload);

            payload.pIndex = state.tempMarkers[payload.pName].length - 1;
            state.tempPayload = JSON.parse(JSON.stringify(payload));

            payload = null;
        },

        cancelTempMarker(state) {
            if (state.adding) {
                state.tempMarkers.unknown.pop();
                state.tempPayload = {};
            }

            state.adding = false;
        },

        confirmAddTempMarker(state) {
            let payload = state.tempPayload;

            console.log('confirmAddTempMarker', payload)
            console.log('confirmAddTempMarker', state.tempMarkers)
            console.log('confirmAddTempMarker', state.tempMarkers[payload.pName][payload.pIndex].lat)

            // state.drone_infos.unknown.goto_positions[payload.pIndex] = String(state.tempMarkers[payload.pName][payload.pIndex].lat) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].lng) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].alt) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].speed) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].radius) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].turningSpeed) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].targetMavCmd) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].targetStayTime) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].elevation) + ':0';

            // console.log('confirmAddTempMarker', payload.pName, payload.pIndex, state.drone_infos.unknown.goto_positions[payload.pIndex]);

            state.unknown_info = null;
            state.unknown_info = {};
            state.unknown_info = JSON.parse(JSON.stringify(state.drone_infos.unknown));

            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'post',
                url: 'http://' + state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + state.VUE_APP_MOBIUS_GCS + '/MarkerInfos/' + payload.pName,
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json;ty=4'
                },
                data: {
                    'm2m:cin': {
                        con: state.tempMarkers[payload.pName]
                    }
                }
            }).then(
                function (res) {
                    console.log('confirmAddTempMarker-axios', res.data);
                }
            ).catch(
                function (err) {
                    console.log(err.message);
                }
            );

            state.adding = false;
        },

        deleteMarker(state, payload) {
            console.log('deleteMarker', payload);

            let oldPos = JSON.parse(JSON.stringify(state.tempMarkers[payload.pName][payload.pIndex]));

            state.tempMarkers[payload.pName].splice(payload.pIndex, 1);

            state.tempMarkers[payload.pName].forEach((pos, pIndex) => {
                pos.m_label.fontSize = '14px';
                pos.m_label.text = ((payload.pName === 'unknown') ? 'T' : String(pIndex)) + ':' + String(pos.alt);
            });

            oldPos.m_icon.fillColor = 'grey';
            oldPos.m_label.text = 'T:' + String(oldPos.alt);

            let count = state.tempMarkers.unknown.push(oldPos);

            oldPos = null;

            let _payload = {};
            _payload.pOldName = payload.pName;
            _payload.pOldIndex = payload.pIndex;
            _payload.pName = 'unknown';
            _payload.pIndex = count - 1;

            this.commit('deleteMarkerDroneInfo', _payload);

            let temp = JSON.parse(JSON.stringify(state.tempMarkers));
            state.tempMarkers = null;
            state.tempMarkers = {};
            state.tempMarkers = JSON.parse(JSON.stringify(temp));
            temp = null;

        },

        removeMarker(state, payload) {
            console.log('removeMarker', payload);

            state.tempMarkers[payload.pName].splice(payload.pIndex, 1);

            let _payload = {};
            _payload.pOldName = payload.pName;
            _payload.pOldIndex = payload.pIndex;
            _payload.pName = payload.pName;
            _payload.pIndex = payload.pName;

            this.commit('removeMarkerDroneInfo', _payload);

            let temp = JSON.parse(JSON.stringify(state.tempMarkers));
            state.tempMarkers = null;
            state.tempMarkers = {};
            state.tempMarkers = JSON.parse(JSON.stringify(temp));
            temp = null;
        },

        removeAllMarker(state, payload) {
            console.log('removeAllMarker', payload);

            let unknownMarker = JSON.parse(JSON.stringify(state.tempMarkers.unknown));
            state.tempMarkers = null;
            state.tempMarkers = {};
            state.tempMarkers.unknown = JSON.parse(JSON.stringify(unknownMarker));
            unknownMarker = null;

            let temp = JSON.parse(JSON.stringify(state.tempMarkers));
            state.tempMarkers = null;
            state.tempMarkers = {};
            state.tempMarkers = JSON.parse(JSON.stringify(temp));
            temp = null;
        },

        registerMarker(state, payload) {
            console.log('registerMarker', payload);

            state.tempMarkers[payload.pOldName][payload.pOldIndex].alt = payload.targetAlt;
            state.tempMarkers[payload.pOldName][payload.pOldIndex].speed = payload.targetSpeed;
            state.tempMarkers[payload.pOldName][payload.pOldIndex].radius = payload.targetRadius;
            state.tempMarkers[payload.pOldName][payload.pOldIndex].turningSpeed = payload.targetTurningSpeed;
            state.tempMarkers[payload.pOldName][payload.pOldIndex].targetMavCmd = payload.targetMavCmd;
            state.tempMarkers[payload.pOldName][payload.pOldIndex].targetStayTime = payload.targetStayTime;

            let oldPos = JSON.parse(JSON.stringify(state.tempMarkers[payload.pOldName][payload.pOldIndex]));

            if (payload.pOldName !== payload.pName) {
                state.tempMarkers[payload.pOldName].splice(payload.pOldIndex, 1);

                state.tempMarkers[payload.pOldName].forEach((pos, pIndex) => {
                    pos.m_label.fontSize = '14px';
                    pos.m_label.text = ((payload.pOldName === 'unknown') ? 'T' : String(pIndex)) + ':' + String(pos.alt);
                });

                state.drone_infos[payload.pName].color = (payload.pName === 'unknown') ? 'grey' : payload.targetColor;
                oldPos.m_icon.fillColor = state.drone_infos[payload.pName].color;

                console.log('+++++++++++++++++++++++++++++++++++++++++ registerMarker', state.tempMarkers);
                console.log('+++++++++++++++++++++++++++++++++++++++++ registerMarker', state.tempMarkers[payload.pName]);

                let count = state.tempMarkers[payload.pName].push(oldPos);
                payload.pIndex = count - 1;

                oldPos.m_label.fontSize = '14px';
                if (payload.pName === 'unknown') {
                    oldPos.m_label.text = 'T' + ':' + String(oldPos.alt);
                }
                else {
                    oldPos.m_label.text = String(count - 1) + ':' + String(oldPos.alt);
                }

                // state.drone_infos[payload.pOldName].goto_positions.splice(payload.pOldIndex, 1);
                this.commit('regMarkerNameDroneInfo', payload);

                let payload2 = {};
                payload2.pName = payload.pOldName;
                this.commit('regMarkerNameDroneInfo', payload2);
            }

            else if (payload.pOldIndex !== payload.pIndex) {
                state.tempMarkers[payload.pOldName].splice(payload.pOldIndex, 1);

                console.log(state.tempMarkers[payload.pOldName]);

                state.tempMarkers[payload.pOldName].splice(payload.pIndex, 0, oldPos);

                state.tempMarkers[payload.pOldName].forEach((pos, pIndex) => {
                    pos.m_label.fontSize = '14px';
                    pos.m_label.text = ((payload.pOldName === 'unknown') ? 'T' : String(pIndex)) + ':' + String(pos.alt);
                });

                // state.drone_infos[payload.pName].goto_positions.splice(payload.pOldIndex, 1);
                this.commit('regMarkerIndexDroneInfo', payload);

                let payload2 = {};
                payload2.pName = payload.pOldName;
                this.commit('regMarkerNameDroneInfo', payload2);
            }

            else {
                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                state.tempMarkers[payload.pOldName].splice(payload.pOldIndex, 1);

                console.log(state.tempMarkers[payload.pOldName]);

                state.tempMarkers[payload.pOldName].splice(payload.pIndex, 0, oldPos);

                state.tempMarkers[payload.pOldName].forEach((pos, pIndex) => {
                    pos.m_label.fontSize = '14px';
                    pos.m_label.text = ((payload.pOldName === 'unknown') ? 'T' : String(pIndex)) + ':' + String(pos.alt);
                });

                // state.drone_infos[payload.pName].goto_positions.splice(payload.pOldIndex, 1);
                this.commit('regMarkerIndexDroneInfo', payload);

                let payload2 = {};
                payload2.pName = payload.pOldName;
                this.commit('regMarkerNameDroneInfo', payload2);
            }

            if(payload.pOldName === payload.pName && payload.pOldName === 'unknown') {
                state.tempMarkers[payload.pOldName][payload.pOldIndex].m_label.text = 'T:' + String(state.tempMarkers[payload.pOldName][payload.pOldIndex].alt);
            }

            oldPos = null;
            let temp = JSON.parse(JSON.stringify(state.tempMarkers));
            state.tempMarkers = null;
            state.tempMarkers = {};
            state.tempMarkers = JSON.parse(JSON.stringify(temp));
            temp = null;
        },

        removeMarkerDroneInfo(state, payload) {
            // state.drone_infos[payload.pOldName].goto_positions.splice(payload.pOldIndex, 1);

            console.log('removeMarkerDroneInfo', payload);

            // state.unknown_info = null;
            // state.unknown_info = {};
            // state.unknown_info = JSON.parse(JSON.stringify(state.drone_infos.unknown));
            //
            // let temp = JSON.parse(JSON.stringify(state.drone_infos[payload.pName]));
            // state.drone_infos[payload.pName] = null;
            // state.drone_infos[payload.pName] = {};
            // state.drone_infos[payload.pName] = JSON.parse(JSON.stringify(temp));
            // temp = null;

            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'post',
                url: 'http://' + state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + state.VUE_APP_MOBIUS_GCS + '/MarkerInfos/' + payload.pName,
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json;ty=4'
                },
                data: {
                    'm2m:cin': {
                        con: state.tempMarkers[payload.pName]
                    }
                }
            }).then(
                function (res) {
                    console.log('removeMarkerDroneInfo-axios', res.data);
                }
            ).catch(
                function (err) {
                    console.log(err.message);
                }
            );
        },

        deleteMarkerDroneInfo(state, payload) {
            // let oldPos = state.drone_infos[payload.pOldName].goto_positions.splice(payload.pOldIndex, 1);

            console.log('deleteMarkerDroneInfo', payload);

            // let pos_str = String(state.tempMarkers[payload.pName][payload.pIndex].lat) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].lng) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].alt) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].speed) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].radius) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].turningSpeed);

            // state.drone_infos[payload.pName].goto_positions.push(oldPos[0]);

            // let temp = JSON.parse(JSON.stringify(state.drone_infos[payload.pName]));
            // state.drone_infos[payload.pName] = null;
            // state.drone_infos[payload.pName] = {};
            // state.drone_infos[payload.pName] = JSON.parse(JSON.stringify(temp));
            // temp = null;

            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'post',
                url: 'http://' + state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + state.VUE_APP_MOBIUS_GCS + '/MarkerInfos/' + payload.pName,
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json;ty=4'
                },
                data: {
                    'm2m:cin': {
                        con: state.tempMarkers[payload.pName]
                    }
                }
            }).then(
                function (res) {
                    console.log('deleteMarkerDroneInfo-axios', res.data);
                }
            ).catch(
                function (err) {
                    console.log(err.message);
                }
            );
        },

        regMarkerNameDroneInfo(state, payload) {
            console.log('regMarkerNameDroneInfo', payload);

            // let pos_str = String(state.tempMarkers[payload.pName][payload.pIndex].lat) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].lng) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].alt) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].speed) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].radius) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].turningSpeed) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].targetMavCmd) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].targetStayTime) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].elevation);
            //
            // state.drone_infos[payload.pName].goto_positions.push(pos_str);
            //
            // let temp = JSON.parse(JSON.stringify(state.drone_infos[payload.pName]));
            // state.drone_infos[payload.pName] = null;
            // state.drone_infos[payload.pName] = {};
            // state.drone_infos[payload.pName] = JSON.parse(JSON.stringify(temp));
            // temp = null;

            // let _selected = [];
            // for(let dName in state.drone_infos) {
            //     if(Object.prototype.hasOwnProperty.call(state.drone_infos, dName)) {
            //         if(state.drone_infos[dName].selected) {
            //             _selected.push(state.drone_infos[dName]);
            //         }
            //     }
            // }

            this.commit('updateDroneInfosSelected');

            // state.dronesChecked[payload.dName] = null;
            // state.dronesChecked[payload.dName] = state.drone_infos[payload.dName];
            //
            // temp = JSON.parse(JSON.stringify(state.dronesChecked));
            // state.dronesChecked = null;
            // state.dronesChecked = JSON.parse(JSON.stringify(temp));
            // temp = null;

            EventBus.$emit('do-targetDroneMarker', payload.pName);

            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'post',
                url: 'http://' + state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + state.VUE_APP_MOBIUS_GCS + '/MarkerInfos/' + payload.pName,
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json;ty=4'
                },
                data: {
                    'm2m:cin': {
                        con: state.tempMarkers[payload.pName]
                    }
                }
            }).then(
                function (res) {
                    console.log('--------------------------------------------------------------------regMarkerNameDroneInfo-axios', res.data);
                }
            ).catch(
                function (err) {
                    console.log(err.message);
                }
            );
        },

        regMarkerDroneInfo(state, payload) {
            console.log('regMarkerDroneInfo', payload);

            // state.drone_infos[payload.pName].goto_positions[payload.pIndex] = String(state.tempMarkers[payload.pName][payload.pIndex].lat) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].lng) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].alt) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].speed) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].radius) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].turningSpeed) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].targetMavCmd) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].targetStayTime) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].elevation);
            //
            // let temp = JSON.parse(JSON.stringify(state.drone_infos[payload.pName]));
            // state.drone_infos[payload.pName] = null;
            // state.drone_infos[payload.pName] = {};
            // state.drone_infos[payload.pName] = JSON.parse(JSON.stringify(temp));
            // temp = null;

            // let _selected = [];
            // for(let dName in state.drone_infos) {
            //     if(Object.prototype.hasOwnProperty.call(state.drone_infos, dName)) {
            //         if(state.drone_infos[dName].selected) {
            //             _selected.push(state.drone_infos[dName]);
            //         }
            //     }
            // }

            this.commit('updateDroneInfosSelected');

            // state.dronesChecked[payload.dName] = null;
            // state.dronesChecked[payload.dName] = state.drone_infos[payload.dName];
            //
            // temp = JSON.parse(JSON.stringify(state.dronesChecked));
            // state.dronesChecked = null;
            // state.dronesChecked = JSON.parse(JSON.stringify(temp));
            // temp = null;

            EventBus.$emit('do-targetDroneMarker', payload.pName);

            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'post',
                url: 'http://' + state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + state.VUE_APP_MOBIUS_GCS + '/MarkerInfos/' + payload.pName,
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json;ty=4'
                },
                data: {
                    'm2m:cin': {
                        con: state.tempMarkers[payload.pName]
                    }
                }
            }).then(
                function (res) {
                    console.log('regMarkerDroneInfo-axios', res.data);
                }
            ).catch(
                function (err) {
                    console.log(err.message);
                }
            );
        },

        regMarkerIndexDroneInfo(state, payload) {
            console.log('regMarkerIndexDroneInfo', payload);

            // let pos_str = String(state.tempMarkers[payload.pName][payload.pIndex].lat) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].lng) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].alt) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].speed) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].radius) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].turningSpeed) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].targetMavCmd) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].targetStayTime) + ':' +
            //     String(state.tempMarkers[payload.pName][payload.pIndex].elevation);
            //
            // state.drone_infos[payload.pName].goto_positions.splice(payload.pIndex, 0, pos_str);
            //
            // let temp = JSON.parse(JSON.stringify(state.drone_infos[payload.pName]));
            // state.drone_infos[payload.pName] = null;
            // state.drone_infos[payload.pName] = {};
            // state.drone_infos[payload.pName] = JSON.parse(JSON.stringify(temp));
            // temp = null;

            // let _selected = [];
            // for(let dName in state.drone_infos) {
            //     if(Object.prototype.hasOwnProperty.call(state.drone_infos, dName)) {
            //         if(state.drone_infos[dName].selected) {
            //             _selected.push(state.drone_infos[dName]);
            //         }
            //     }
            // }

            this.commit('updateDroneInfosSelected');

            // state.dronesChecked[payload.dName] = null;
            // state.dronesChecked[payload.dName] = state.drone_infos[payload.dName];
            //
            // temp = JSON.parse(JSON.stringify(state.dronesChecked));
            // state.dronesChecked = null;
            // state.dronesChecked = {};
            // state.dronesChecked = JSON.parse(JSON.stringify(temp));
            // temp = null;

            EventBus.$emit('do-targetDroneMarker', payload.pName);

            axios({
                validateStatus: function (status) {
                    // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                    return status < 500;
                },
                method: 'post',
                url: 'http://' + state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + state.VUE_APP_MOBIUS_GCS + '/MarkerInfos/' + payload.pName,
                headers: {
                    'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                    'X-M2M-Origin': 'SVue',
                    'Content-Type': 'application/json;ty=4'
                },
                data: {
                    'm2m:cin': {
                        con: state.tempMarkers[payload.pName]
                    }
                }
            }).then(
                function (res) {
                    console.log('regMarkerIndexDroneInfo-axios', res.data);
                }
            ).catch(
                function (err) {
                    console.log(err.message);
                }
            );
        },

        resetDroneInfos(state, payload) {
            console.log('resetDroneInfos', payload);

            if (!Object.hasOwnProperty.call(payload, 'unknown')) {
                payload.unknown = {}
            }

            state.drone_infos = null;
            state.drone_infos = {};
            state.drone_infos = JSON.parse(JSON.stringify(payload));

            for(let name in state.drone_infos) {
                if(Object.hasOwnProperty.call(state.drone_infos, name)) {
                    if(name !== 'unknown') {
                        if(localStorage.getItem(name+'_selected')) {
                            state.drone_infos[name].selected = (localStorage.getItem(name + '_selected') === 'true');
                        }
                        else {
                            localStorage.setItem(name+'_selected', String(state.drone_infos[name].selected));
                        }
                    }
                }
            }

            // if (!Object.hasOwnProperty.call(state.drone_infos.unknown, 'goto_positions')) {
            //     state.drone_infos.unknown.goto_positions = [];
            // }

            // if (!Array.isArray(state.drone_infos.unknown.goto_positions)) {
            //     state.drone_infos.unknown.goto_positions = [];
            // }

            // for (let i = 0; i < state.drone_infos.unknown.goto_positions.length; i) {
            //     if (state.drone_infos.unknown.goto_positions[i] === null) {
            //         state.drone_infos.unknown.goto_positions.splice(i, 1);
            //     }
            //     else {
            //         i++;
            //     }
            // }
            //
            // console.log('resetDroneInfos', state.drone_infos);
        },

        updateDroneInfosSelected(state) {

            console.log('updateDroneInfosSelected', state.drone_infos);

            for (let dName in state.drone_infos) {
                if (Object.prototype.hasOwnProperty.call(state.drone_infos, dName)) {

                    if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'color')) {
                        state.drone_infos[dName].color = 'grey';
                    }

                    // if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'goto_positions')) {
                    //     state.drone_infos[dName].goto_positions = [];
                    // }

                    if (dName !== 'unknown') {
                        if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'targeted')) {
                            state.drone_infos[dName].targeted = false;
                        }
                        state.drone_infos[dName].targeted = false;
                        EventBus.$emit('do-drone-selected' + dName, state.drone_infos[dName].targeted);

                        if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'home_position')) {
                            state.drone_infos[dName].home_position = {lat: 37.4032072, lng: 127.1595933};
                        }

                        if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'gotoType')) {
                            state.drone_infos[dName].gotoType = 'alt_first';
                        }

                        if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'tagetModeSelection')) {
                            state.drone_infos[dName].tagetModeSelection = 'ALT_HOLD';
                        }

                        if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'targetSpeed')) {
                            state.drone_infos[dName].targetSpeed = 5;
                        }

                        if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'targetTurningSpeed')) {
                            state.drone_infos[dName].targetTurningSpeed = 5;
                        }

                        if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'targetRadius')) {
                            state.drone_infos[dName].targetRadius = 50;
                        }

                        if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'targetTakeoffAlt')) {
                            state.drone_infos[dName].targetTakeoffAlt = 20;
                        }

                        if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'circleType')) {
                            state.drone_infos[dName].circleType = 'cw';
                        }

                        if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'targetAlt')) {
                            state.drone_infos[dName].targetAlt = 20;
                        }

                        if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'lastFlightTime')) {
                            state.drone_infos[dName].lastFlightTime = 0;
                        }

                        if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'autoStartIndex')) {
                            state.drone_infos[dName].autoStartIndex = '0';
                        }

                        if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'autoEndIndex')) {
                            state.drone_infos[dName].autoEndIndex = '0';
                        }

                        if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'autoDelay')) {
                            state.drone_infos[dName].autoDelay = 1;
                        }

                        if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'autoSpeed')) {
                            state.drone_infos[dName].autoSpeed = 5;
                        }

                        if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'curArmStatus')) {
                            state.drone_infos[dName].curArmStatus = 'DISARMED';
                        }

                        if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'targeted')) {
                            state.drone_infos[dName].targeted = false;
                        }

                        if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'headingLine')) {
                            state.drone_infos[dName].headingLine = [];
                        }

                        if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'directionLine')) {
                            state.drone_infos[dName].directionLine = [];
                        }

                        if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'client')) {

                            state.drone_infos[dName].client = {
                                connected: false,
                                loading: false
                            };
                        }

                        // if(Object.hasOwnProperty.call(state.tempMarkers, dName)) {
                        //     var preTempMarkersArray = Array.from(state.tempMarkers[dName]);
                        //     console.log('updateDroneInfosSelected - preTempMarkersArray', dName, preTempMarkersArray);
                        //
                        //     state.tempMarkers[dName] = null;
                        //     state.tempMarkers[dName] = Array.from(preTempMarkersArray);
                        // }
                        // else {
                        //     state.tempMarkers[dName] = null;
                        //     state.tempMarkers[dName] = [];
                        //     // state.trackingLines[dName] = null;
                        //     // state.trackingLines[dName] = [];
                        // }
                        //
                        // if (state.drone_infos[dName].selected) {
                        //     let drone = state.drone_infos[dName];
                        //
                        //     console.log('---------------------------updateDroneInfosSelected - drone_infos', state.drone_infos[dName]);
                        //
                        //     for (let idx in drone.goto_positions) {
                        //         if (Object.prototype.hasOwnProperty.call(drone.goto_positions, idx)) {
                        //             let pos_arr = drone.goto_positions[idx].split(':');
                        //             if(typeof state.tempMarkers[dName][idx] === 'undefined') {
                        //                 var pos = JSON.parse(JSON.stringify(state.defaultPosition));
                        //             }
                        //             else {
                        //                 pos = JSON.parse(JSON.stringify(state.tempMarkers[dName][idx]));
                        //             }
                        //             pos.lat = parseFloat(pos_arr[0]);
                        //             pos.lng = parseFloat(pos_arr[1]);
                        //             pos.alt = parseFloat(pos_arr[2]);
                        //             pos.speed = parseFloat(pos_arr[3]);
                        //             pos.radius = parseFloat(pos_arr[4]);
                        //             pos.turningSpeed = parseFloat(pos_arr[5]);
                        //             pos.targetMavCmd = parseFloat(pos_arr[6]);
                        //             pos.targetStayTime = parseFloat(pos_arr[7]);
                        //             pos.elevation = parseFloat(pos_arr[8]);
                        //
                        //             const strType = ['Goto', 'Circle', 'Survey'];
                        //             pos.type = (typeof pos_arr[9] === 'undefined') ? 'Goto' : strType[parseInt(pos_arr[9])];
                        //             if(pos.type === 'Goto') {
                        //                 pos.m_icon = JSON.parse(JSON.stringify(state.defaultGotoMarkerIcon));
                        //             }
                        //             else if(pos.type === 'Circle') {
                        //                 pos.m_icon = JSON.parse(JSON.stringify(state.defaultCircleMarkerIcon));
                        //             }
                        //             else {
                        //                 pos.m_icon = JSON.parse(JSON.stringify(state.defaultGotoMarkerIcon));
                        //             }
                        //
                        //             pos.color = drone.color;
                        //             pos.m_icon.fillColor = drone.color;
                        //             pos.m_label.fontSize = '14px';
                        //             pos.m_label.text = ((drone.name === 'unknown') ? 'T' : String(idx)) + ':' + String(pos.alt);
                        //
                        //             state.tempMarkers[drone.name].splice(idx, 1, pos);
                        //             pos = null;
                        //         }
                        //     }
                        // }
                        // else {
                        //     delete state.tempMarkers[dName];
                        //     delete state.trackingLines[dName];
                        // }
                    }
                    // else {
                    //     if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'targeted')) {
                    //         state.drone_infos[dName].targeted = false;
                    //     }
                    //     state.drone_infos[dName].targeted = false;
                    //
                    //     if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'targetSpeed')) {
                    //         state.drone_infos[dName].targetSpeed = 5;
                    //     }
                    //
                    //     if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'targetTurningSpeed')) {
                    //         state.drone_infos[dName].targetTurningSpeed = 5;
                    //     }
                    //
                    //     if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'targetRadius')) {
                    //         state.drone_infos[dName].targetRadius = 50;
                    //     }
                    //
                    //     if (!Object.prototype.hasOwnProperty.call(state.drone_infos[dName], 'targetAlt')) {
                    //         state.drone_infos[dName].targetAlt = 20;
                    //     }
                    //
                    //     delete state.tempMarkers[dName];
                    //     state.tempMarkers[dName] = [];
                    //
                    //     let drone = state.drone_infos[dName];
                    //
                    //     console.log('unknown', drone);
                    //     console.log('tempMarkers[unknown]', state.tempMarkers[dName]);
                    //
                    //     for (let idx in drone.goto_positions) {
                    //         if (Object.prototype.hasOwnProperty.call(drone.goto_positions, idx)) {
                    //             let pos_arr = drone.goto_positions[idx].split(':');
                    //             let pos = JSON.parse(JSON.stringify(state.defaultPosition));
                    //             pos.lat = parseFloat(pos_arr[0]);
                    //             pos.lng = parseFloat(pos_arr[1]);
                    //             pos.alt = parseFloat(pos_arr[2]);
                    //             pos.speed = parseFloat(pos_arr[3]);
                    //             pos.radius = parseFloat(pos_arr[4]);
                    //             pos.turningSpeed = parseFloat(pos_arr[5]);
                    //             pos.color = drone.color;
                    //             pos.m_icon.fillColor = drone.color;
                    //             pos.m_label.fontSize = '14px';
                    //             pos.m_label.text = 'T';
                    //
                    //             state.tempMarkers[dName].push(pos);
                    //             pos = null;
                    //         }
                    //     }
                    // }
                }
            }

            EventBus.$emit('do-targetDrone');


            let temp = JSON.parse(JSON.stringify(state.tempMarkers));
            state.tempMarkers = null;
            state.tempMarkers = {};
            state.tempMarkers = JSON.parse(JSON.stringify(temp));
            temp = null;
        },

        addDroneInfos(state, payload) {
            state.drone_infos[payload.name] = payload;

            let temp = JSON.parse(JSON.stringify(state.drone_infos));
            state.drone_infos = null;
            state.drone_infos = {};
            state.drone_infos = JSON.parse(JSON.stringify(temp));
            temp = null;
        },

        delDroneInfo(state, name) {
            delete state.drone_infos[name];

            let temp = JSON.parse(JSON.stringify(state.drone_infos));
            state.drone_infos = null;
            state.drone_infos = {};
            state.drone_infos = JSON.parse(JSON.stringify(temp));
            temp = null;

            console.log('delDroneInfo', state.drone_infos);
        },

        updateDroneInfos(state, payload) {
            state.drone_infos[payload.name] = payload;

            let temp = JSON.parse(JSON.stringify(state.drone_infos));
            state.drone_infos = null;
            state.drone_infos = {};
            state.drone_infos = JSON.parse(JSON.stringify(temp));
            temp = null;
        },

        // setSelectedDrone(state, payload) {
        //
        //     state.selectedDrone[payload.drone_name] = payload.selected;
        //     let temp = JSON.parse(JSON.stringify(state.selectedDrone));
        //     state.selectedDrone = null;
        //     state.selectedDrone = {};
        //     state.selectedDrone = JSON.parse(JSON.stringify(temp));
        //     temp = null;
        //
        //     //EventBus.$emit('selected-drone', payload);
        // },

        setCommandTabLeftX(state, value) {
            state.command_tab_left_x = value;
        },

        setCommandTabMaxHeight(state, value) {
            state.command_tab_max_height = value;
        },

        // setSelectedDroneInfo(state, payload) {
        //     state.drone_infos[payload.dName].selected = payload.selected;
        // },

        setFlyingDroneInfo(state, payload) {
            state.drone_infos[payload.name].heading = payload.heading;
            state.drone_infos[payload.name].lat = payload.lat;
            state.drone_infos[payload.name].lng = payload.lng;

            // let temp = JSON.parse(JSON.stringify(state.drone_infos[payload.pName]));
            // state.drone_infos[payload.pName] = null;
            // state.drone_infos[payload.pName] = {};
            // state.drone_infos[payload.pName] = JSON.parse(JSON.stringify(temp));
            // temp = null;

            // state.drone_infos_selected = [];
            // for(let dName in state.drone_infos) {
            //     if(Object.prototype.hasOwnProperty.call(state.drone_infos, dName)) {
            //         if(state.drone_infos[dName].selected) {
            //             state.drone_infos_selected.push(state.drone_infos[dName]);
            //         }
            //     }
            // }

            state.countFlying++;
            if (state.countFlying >= 30) {
                state.countFlying = 0;

                // axios({
                //     validateStatus: function (status) {
                //         // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                //         return status < 500;
                //     },
                //     method: 'post',
                //     url: 'http://' + state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + state.VUE_APP_MOBIUS_GCS + '/Info',
                //     headers: {
                // 'X-M2M-RI': String(parseInt(Math.random()*10000)),
                //         'X-M2M-Origin': 'SVue',
                //         'Content-Type': 'application/json;ty=4'
                //     },
                //     data: {
                //         'm2m:cin': {
                //             con: state.drone_infos
                //         }
                //     }
                // }).then(
                //     function (res) {
                //         console.log('setFlyingDroneInfo-axios', res.data);
                //     }
                // ).catch(
                //     function (err) {
                //         console.log(err.message);
                //     }
                // );
            }
'/'
            payload = null;
        },

        saveCurrentDroneInfos(state, name) {
            if (state.MOBIUS_CONNECTION_CONNECTED) {
                axios({
                    validateStatus: function (status) {
                        // 상태 코드가 500 이상일 경우 거부. 나머지(500보다 작은)는 허용.
                        return status < 500;
                    },
                    method: 'post',
                    url: 'http://' + state.VUE_APP_MOBIUS_HOST + ':7579/Mobius/' + state.VUE_APP_MOBIUS_GCS + '/DroneInfos/' + name,
                    headers: {
                        'X-M2M-RI': String(parseInt(Math.random() * 10000)),
                        'X-M2M-Origin': 'SVue',
                        'Content-Type': 'application/json;ty=4'
                    },
                    data: {
                        'm2m:cin': {
                            con: state.drone_infos[name]
                        }
                    }
                }).then(
                    function (res) {
                        console.log('setFlyingDroneInfo-axios', res.data);
                    }
                ).catch(
                    function (err) {
                        console.log(err.message);
                    }
                );
            }
        },
    },
    actions: {},
    modules: {}
})
