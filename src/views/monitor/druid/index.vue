<template>
   <div>
      <i-frame v-model:src="url"></i-frame>
   </div>
</template>

<script setup>
import iFrame from '@/components/iFrame/index.vue'
import SETTING from '@/utils/setting';


import { ref } from 'vue';

const url = ref(SETTING.apiUrl + '/druid/login.html');
</script>
