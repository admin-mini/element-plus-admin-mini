import{r as u,o as b,c as x,d as i,e as t,w as _,f as a,t as c,g as k,k as p,l as v,i as l,m as y}from"./index-1M5D14Jb.js";const E={class:"admin-view"},C={class:"admin-view-header"},L={class:"admin-view-body"},S={style:{display:"block","white-space":"pre-wrap",background:"var(--el-color-black)",color:"var(--el-color-white)","margin-top":"30px",padding:"20px"}},B={__name:"index",setup(V){const d=y(),s=u([]),n=u({username:"websir"});async function m(o){d(p((await v(()=>import("./post-SfX9udvn.js"),__vite__mapDeps([0,1,2]))).default,{row:o,onSuccess:e=>{n.value=e}}),{title:"编辑"})}async function w(){d(p((await v(()=>import("./choose-C716ov8X.js"),__vite__mapDeps([3,4,1,2]))).default,{row:s,onSuccess:o=>{console.log(o),s.value=o}}),{title:"选择",width:"1200px"})}let h=`async function openEdit(row) {
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
}`;return(o,e)=>{const f=l("admin-bread"),r=l("el-button"),D=l("el-divider");return b(),x("div",E,[i("div",C,[t(f)]),i("div",L,[t(r,{onClick:e[0]||(e[0]=g=>m(n.value))},{default:_(()=>[a("表单")]),_:1}),a(" "+c(n.value)+" ",1),t(D),t(r,{onClick:e[1]||(e[1]=g=>w())},{default:_(()=>[a("选择")]),_:1}),a(" "+c(s.value)+" ",1),i("code",S,c(k(h)),1)])])}}};export{B as default};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = ["assets/post-SfX9udvn.js","assets/index-1M5D14Jb.js","assets/index-IyBO_0ts.css","assets/choose-C716ov8X.js","assets/index-Ovhxvo2H.js"]
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
