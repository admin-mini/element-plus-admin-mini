<template>
  <div class="admin-view">
    <el-tabs v-model="tab">
      <el-tab-pane label="短信模板" name="template">
        <admin-table :api="api.getTemplatePage" @init="initTemplate">
          <template #search>
            <el-form :inline="true" :model="$tableT.query" @submit.prevent="$tableT.search">
              <admin-grid :cols="4" :x-gap="20">
                <el-form-item label="通道编码">
                  <el-input v-model="$tableT.query.channelCode" clearable />
                </el-form-item>
                <el-form-item label="模板名称">
                  <el-input v-model="$tableT.query.name" clearable />
                </el-form-item>
                <el-form-item label="模板编码">
                  <el-input v-model="$tableT.query.code" clearable />
                </el-form-item>
                <template #last>
                  <el-button native-type="submit" type="primary" icon="Search">搜索</el-button>
                </template>
              </admin-grid>
            </el-form>
          </template>
          <template #btn>
            <el-button type="primary" icon="Plus" @click="open()">新增模板</el-button>
          </template>
          <template #table>
            <el-table :data="$tableT.data" v-loading="$tableT.loading">
              <el-table-column prop="name" label="模板名称" min-width="160" />
              <el-table-column prop="code" label="模板编码" min-width="160" />
              <el-table-column prop="channelCode" label="通道" width="120" />
              <el-table-column prop="apiTemplateId" label="通道模板ID" width="150" />
              <el-table-column prop="content" label="模板内容" min-width="240" show-overflow-tooltip />
              <el-table-column prop="status" label="状态" width="90">
                <template #default="{row}">
                  <el-tag :type="row.status===1?'success':'info'">{{row.status===1?'启用':'停用'}}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="{row}">
                  <el-button link type="primary" @click="open(row)">编辑</el-button>
                  <el-button link type="danger" @click="removeTemplate(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </admin-table>
      </el-tab-pane>
      <el-tab-pane label="发送记录" name="log">
        <admin-table :api="api.getLogPage" @init="initLog">
          <template #search>
            <el-form :inline="true" :model="$tableL.query" @submit.prevent="$tableL.search">
              <admin-grid :cols="4" :x-gap="20">
                <el-form-item label="通道">
                  <el-input v-model="$tableL.query.channelCode" clearable />
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input v-model="$tableL.query.phone" clearable />
                </el-form-item>
                <el-form-item label="模板编码">
                  <el-input v-model="$tableL.query.templateCode" clearable />
                </el-form-item>
                <template #last>
                  <el-button native-type="submit" type="primary" icon="Search">搜索</el-button>
                </template>
              </admin-grid>
            </el-form>
          </template>
          <template #table>
            <el-table :data="$tableL.data" v-loading="$tableL.loading">
              <el-table-column prop="phone" label="手机号" width="140" />
              <el-table-column prop="channelCode" label="通道" width="120" />
              <el-table-column prop="templateCode" label="模板编码" width="160" />
              <el-table-column prop="content" label="短信内容" min-width="240" show-overflow-tooltip />
              <el-table-column prop="apiResultCode" label="结果码" width="120" />
              <el-table-column prop="apiResultMsg" label="结果消息" min-width="160" show-overflow-tooltip />
              <el-table-column prop="sendTime" label="发送时间" width="180" />
              <el-table-column label="操作" width="100">
                <template #default="{row}">
                  <el-button link type="danger" @click="removeLog(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </admin-table>
      </el-tab-pane>
    </el-tabs>
    <el-dialog v-model="visible" :title="form.id?'编辑短信模板':'新增短信模板'" width="620px">
      <el-form ref="formRef" :model="form" label-width="100px">
        <el-form-item label="通道编码" prop="channelCode" :rules="[$rules.required]">
          <el-input v-model="form.channelCode" />
        </el-form-item>
        <el-form-item label="模板编码" prop="code" :rules="[$rules.required]">
          <el-input v-model="form.code" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="模板名称" prop="name" :rules="[$rules.required]">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="通道模板ID">
          <el-input v-model="form.apiTemplateId" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible=false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>

  import {reactive,ref} from 'vue';
  import {ElMessage,ElMessageBox} from 'element-plus';
  import * as api from '@/api/dev/sms-api'
  const tab=ref('template');
  let $tableT,$tableL;
  const visible=ref(false);
  const formRef=ref();
  const form=reactive({type:1,isSys:0,channelCode:'',code:'',name:'',apiTemplateId:'',status:1,remark:''})
  function initTemplate(t){$tableT=t}function initLog(t){$tableL=t}function open(row){Object.assign(form,row||{id:undefined,type:1,isSys:0,channelCode:'',code:'',name:'',apiTemplateId:'',status:1,remark:''});
  visible.value=true}
  async function save(){if(!(await formRef.value.validate().catch(()=>false)))return;
  await(form.id?api.editTemplate:api.addTemplate)(form);
  ElMessage.success('保存成功');
  visible.value=false;
  $tableT.getTable()}
  function removeTemplate(row){ElMessageBox.confirm('确定删除该短信模板吗？','提示').then(async()=>{await api.deleteTemplate([{templateId:row.id}]);
  ElMessage.success('删除成功');
  $tableT.getTable()}).catch(()=>{})}function removeLog(row){ElMessageBox.confirm('确定删除该发送记录吗？','提示').then(async()=>{await api.deleteLog([{id:row.id}]);
  ElMessage.success('删除成功');
  $tableL.getTable()}).catch(()=>{})}
  </script>
