import{u as k,r as _,a as w,b as f,$ as E,c as M,d as n,e as o,w as s,f as g,t as S,g as b,h as D,i as a,o as B,E as v}from"./index-1M5D14Jb.js";import{M as C}from"./md5-l2P-XHN6.js";import{u as $}from"./index-Ovhxvo2H.js";const A="/element-plus-admin-mini/static/login-banner.png",F={class:"admin-login-container"},P={class:"admin-login"},T=n("div",{class:"admin-login-banner"},[n("img",{src:A})],-1),U={class:"admin-login-form"},j=n("h3",{class:"title"},"管理员登录",-1),O={__name:"login",setup(q){const y=k(),p=_(),r=w(),t=f({userName:"admin",passWord:"123456"}),N=f({userName:[E.required]}),m=_(!1);function V(){p.value.validate(d=>{if(d){let e=Object.assign({},t);e.passWord=C(e.passWord,32),m.value=!0,$(e).then(l=>{l.data.code==0?(r.login(l.data.data),y.replace("/")):v.error(l.data.msg)}).finally(()=>{m.value=!1})}else v.warning("请填写完整信息")})}return(d,e)=>{const l=a("Notification"),h=a("el-icon"),c=a("el-input"),u=a("el-form-item"),x=a("el-button"),W=a("el-form");return B(),M("div",F,[n("div",{class:"header",onClick:e[0]||(e[0]=(...i)=>b(r).increment&&b(r).increment(...i))},[o(h,{size:"40px"},{default:s(()=>[o(l)]),_:1}),g(" "+S(d.$env.VITE_APP_NAME),1)]),n("div",P,[T,n("div",U,[j,o(W,{model:t,rules:N,onSubmit:D(V,["prevent"]),ref_key:"postForm",ref:p},{default:s(()=>[o(u,{label:"",prop:"userName",style:{"margin-bottom":"40px"}},{default:s(()=>[o(c,{autocomplete:"off",modelValue:t.userName,"onUpdate:modelValue":e[1]||(e[1]=i=>t.userName=i),placeholder:"请输入登录账号"},null,8,["modelValue"])]),_:1}),o(u,{label:"",prop:"passWord",style:{"margin-bottom":"40px"}},{default:s(()=>[o(c,{modelValue:t.passWord,"onUpdate:modelValue":e[2]||(e[2]=i=>t.passWord=i),type:"password",placeholder:"请输入登录密码"},null,8,["modelValue"])]),_:1}),o(u,null,{default:s(()=>[o(x,{"native-type":"submit",autocomplete:"off",loading:m.value,type:"primary",class:"admin-block-button login-btn"},{default:s(()=>[g(" 登录 ")]),_:1},8,["loading"])]),_:1})]),_:1},8,["model","rules"])])])])}}};export{O as default};