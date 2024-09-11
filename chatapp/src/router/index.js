import { createRouter, createWebHistory } from "vue-router"
import Login from "../components/Login.vue"
import Register from "../components/Register.vue"
import Home from "../components/Home.vue"
import Weights from "../components/Weights.vue"
import Mealcontents from "../components/Mealcontents.vue"


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "login",
      component: Login
    },{
      path: "/register/",
      name: "register",
      component: Register,
      beforeEnter: (to, from, next) => {
        if(from.name === "login"){
          next()
        } else {
          next({ name:"home" })
        }
      }
    },{
      path: "/home/",
      name: "home",
      component: Home,
      beforeEnter: (to, from, next) => {
        if(from.name === "login" || from.name === "chat" || from.name === "weights" || from.name === "mealcontents" || from.name === "register"){
          next()
        } else {
          next({ name:"login" })
        }
      }
    },{
      path: "/weights/",
      name: "weights",
      component: Weights,
      beforeEnter: (to, from, next) => {
        if(from.name === "home"){
          next()
        }else{
          next({name:"login"})
        }
      }
    },{
      path: "/mealcontents/",
      name: "mealcontents",
      component: Mealcontents,
      beforeEnter: (to, from, next) => {
        if(from.name === "home"){
          next()
        }else{
          next({name:"login"})
        }
      }
    }
  ],
})

export default router