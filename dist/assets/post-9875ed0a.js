import{b,c as l,o as v,d as w,f as o,w as t,g as p}from"./index-8c6450b1.js";const k={__name:"post",props:["row"],emits:["end","success"],setup(c,{emit:r}){const a=c,n=b({username:""});a.row&&Object.assign(n,a.row);function i(){r("success",n)}return(_,e)=>{const d=l("el-input"),m=l("el-form-item"),u=l("el-button"),f=l("el-form");return v(),w("div",null,[o(f,null,{default:t(()=>[o(m,{label:"账号",prop:"username"},{default:t(()=>[o(d,{modelValue:n.username,"onUpdate:modelValue":e[0]||(e[0]=s=>n.username=s)},null,8,["modelValue"])]),_:1}),o(m,null,{default:t(()=>[o(u,{type:"primary",onClick:e[1]||(e[1]=s=>i(_.postForm))},{default:t(()=>[p("确定")]),_:1}),o(u,{onClick:e[2]||(e[2]=s=>r("end"))},{default:t(()=>[p("取消")]),_:1})]),_:1})]),_:1})])}}};export{k as default};