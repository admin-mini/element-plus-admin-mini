<template>
  <div class="admin-view">
    <admin-table :api="api.getConfigPage" @init="init">
      <template #search>
        <el-form :inline="true" :model="$table.query" @submit.prevent="$table.search">
          <admin-grid :cols="4" :x-gap="20">
            <el-form-item label="配置键">
              <el-input v-model="$table.query.configKey" clearable />
            </el-form-item>
            <el-form-item label="配置分类">
              <el-input v-model="$table.query.configCategory" clearable />
            </el-form-item>
            <template #last>
              <el-button native-type="submit" type="primary" icon="Search">搜索</el-button>
            </template>
          </admin-grid>
        </el-form>
      </template>
      <template #btn>
        <el-button type="primary" icon="Plus" @click="open()">新增</el-button>
      </template>
      <template #table>
        <el-table :data="$table.data" v-loading="$table.loading">
          <el-table-column prop="configGroup" label="配置分组" width="130" />
          <el-table-column prop="configKey" label="配置键" min-width="180" />
          <el-table-column prop="configValue" label="配置值" min-width="220" show-overflow-tooltip />
          <el-table-column prop="configCategory" label="分类" width="120" />
          <el-table-column prop="sortCode" label="排序" width="80" />
          <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
          <el-table-column label="操作" width="120">
            <template #default="{row}">
              <el-button link type="primary" @click="open(row)">编辑</el-button>
              <el-button link type="danger" @click="remove(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </admin-table>
    <el-dialog v-model="visible" :title="form.id ? '编辑配置' : '新增配置'" width="600px">
      <el-form ref="formRef" :model="form" label-width="90px">
        <el-form-item label="配置键" prop="configKey" :rules="[$rules.required]">
          <el-input v-model="form.configKey" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="配置值" prop="configValue" :rules="[$rules.required]">
          <el-input v-model="form.configValue" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortCode" :min="0" />
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

  import { reactive, ref } from 'vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import * as api from '@/api/dev/config-api'
  let $table;
  const visible=ref(false);
  const formRef=ref();
  const form=reactive({configKey:'',configValue:'',sortCode:0,remark:''})
  function init(t){$table=t} function open(row){Object.assign(form,row||{id:undefined,configKey:'',configValue:'',sortCode:0,remark:''});
  visible.value=true}
  async function save(){if(!(await formRef.value.validate().catch(()=>false)))return;
  await (form.id?api.editConfig:api.addConfig)(form);
  ElMessage.success('保存成功');
  visible.value=false;
  $table.getTable()}
  function remove(row){ElMessageBox.confirm('确定删除该配置吗？','提示').then(async()=>{await api.deleteConfig([{id:row.id}]);
  ElMessage.success('删除成功');
  $table.getTable()}).catch(()=>{})}
  </script>
