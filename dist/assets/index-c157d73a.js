import{r as u,c as i,o as b,d as x,e as c,f as t,w as _,g as a,t as l,h as k,k as p,l as v,m as y}from"./index-e28310cd.js";const E={class:"admin-view"},C={class:"admin-view-header"},L={class:"admin-view-body"},S={style:{display:"block","white-space":"pre-wrap",background:"var(--el-color-black)",color:"var(--el-color-white)","margin-top":"30px",padding:"20px"}},B={__name:"index",setup(V){const d=y(),s=u([]),n=u({username:"websir"});async function m(o){d(p((await v(()=>import("./post-76e761f5.js"),["assets/post-76e761f5.js","assets/index-e28310cd.js","assets/index-f282c8fd.css"])).default,{row:o,onSuccess:e=>{n.value=e}}),{title:"编辑"})}async function w(){d(p((await v(()=>import("./choose-3d2e5ef1.js"),["assets/choose-3d2e5ef1.js","assets/index-0a81c66f.js","assets/index-e28310cd.js","assets/index-f282c8fd.css"])).default,{row:s,onSuccess:o=>{console.log(o),s.value=o}}),{title:"选择",width:"1200px"})}let h=`async function openEdit(row) {
    adminDialog(
        h((await import('./post.vue')).default, {
            row: row,
            onSuccess: (eventData) => {
                //post.vue 触发的success事件
                editData.value = eventData
            }
        }),
        { title: '编辑' }
    )
}
async function openChoose() {
    adminDialog(
        h((await import('./choose.vue')).default, {
            row: chooseList,
            onSuccess: (eventData) => {
                //choose.vue 触发的success事件
                console.log(eventData)
                chooseList.value = eventData;
            }
        }),
        { title: '选择', width: "1200px" }
    )
}`;return(o,e)=>{const f=i("admin-bread"),r=i("el-button"),D=i("el-divider");return b(),x("div",E,[c("div",C,[t(f)]),c("div",L,[t(r,{onClick:e[0]||(e[0]=g=>m(n.value))},{default:_(()=>[a("表单")]),_:1}),a(" "+l(n.value)+" ",1),t(D),t(r,{onClick:e[1]||(e[1]=g=>w())},{default:_(()=>[a("选择")]),_:1}),a(" "+l(s.value)+" ",1),c("code",S,l(k(h)),1)])])}}};export{B as default};
