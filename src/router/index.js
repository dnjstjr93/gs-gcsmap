import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
// import store from "@/store"
import accountLogin from "@/views/account-login";
import accountRegister from "@/views/account-register";

Vue.use(VueRouter)

// // 만료 시간과 함께 데이터를 저장
// const setItemWithExpireTime = (keyName, keyValue, tts) => {
//     // localStorage에 저장할 객체
//     const obj = {
//         value : keyValue,
//         expire : Date.now() + tts
//     }
//
//     // 객체를 JSON 문자열로 변환
//     const objString = JSON.stringify(obj);
//
//     // setItem
//     window.localStorage.setItem(keyName, objString);
// }

// 만료 시간을 체크하며 데이터 읽기
const getItemWithExpireTime = (keyName) => {

    // localStorage 값 읽기 (문자열)
    const objString = window.localStorage.getItem(keyName);

    // null 체크
    if(!objString) {
        return null;
    }

    // 문자열을 객체로 변환
    const obj = JSON.parse(objString);

    // 현재 시간과 localStorage의 expire 시간 비교
    if(Date.now() > obj.expire) {
        // 만료시간이 지난 item 삭제
        window.localStorage.removeItem(keyName);

        // null 리턴
        return null;
    }

    // 만료기간이 남아있는 경우, value 값 리턴
    return obj.value;
}

const rejectAuthUser = (to, from, next) => {
    if(getItemWithExpireTime('loginEmail') === null) {
        next();
    }
    else {
        alert("이미 로그인 하였습니다.");
        next("/home");
    }

    // if (store.state.isLogin === true) {
    //     alert("이미 로그인 하였습니다.")
    //     next("/home")
    // } else {
    //     next()
    // }
}

const onlyAuthUser = (to, from, next) => {
    if(getItemWithExpireTime('loginEmail') !== null) {
        next()
    }
    else {
        alert("이미 로그인 하였습니다.")
        next("/home")
    }

    // if (store.state.isLogin === false) {
    //     alert("로그인이 필요합니다.")
    //     next("/login")
    // } else {
    //     next()
    // }
}

const routes = [
    {
        path: '/',
        name: 'login',
        beforeEnter: rejectAuthUser,
        component: accountLogin
    },
    {
        path: '/login',
        name: 'accountLogin',
        beforeEnter: rejectAuthUser,
        component: accountLogin
    },
    {
        path: '/register',
        name: 'register',
        beforeEnter: rejectAuthUser,
        component: accountRegister
    },
    {
        path: '/home',
        name: 'Home',
        beforeEnter: onlyAuthUser,
        component: Home
    },
]

const router = new VueRouter({
    // mode: "history",
    // base: process.env.BASE_URL,
    routes
})

export default router
