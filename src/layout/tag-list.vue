<template>
  <div class="admin-tag-list">
    <el-tabs v-model="tagView.active" type="card" @tab-click="({ paneName }) => tagView.setActive(paneName)"
      @tab-remove="handleTabRemove" id="js-tag-list">
      <el-tab-pane v-for="item in tagView.tagList" :key="item.fullPath" :closable="tagView.tagList.length > 1"
        :name="item.fullPath">
        <template #label>
          <svg-icon class="_icon" :name="item.meta.icon" v-if="item.meta.icon"></svg-icon> {{ item.meta.name }}
          <!-- <el-button @click="tagView.refresh()">刷</el-button> -->
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { useTagView } from '@/stores/tag-view'
import Sortable from 'sortablejs'
import { onMounted } from 'vue'
const tagView = useTagView()

onMounted(() => {
  const el = document.querySelector('#js-tag-list .el-tabs__nav')
  new Sortable(el, {
    animation: 150,
    onEnd: (evt) => {
      tagView.sort(evt.oldIndex, evt.newIndex)
    }
  })
})

function handleTabRemove(fullPath) {
  tagView.remove(fullPath)
}
</script>

<style lang="scss">
.admin-tag-list {
  width: 100%;
  flex-shrink: 0;
  border-top: 1px solid var(--el-border-color);
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  box-sizing: border-box;
  padding: 8px 10px;

  .el-tabs__nav-next,
  .el-tabs__nav-prev {
    line-height: 34px;
  }

  .el-tabs__header {
    margin-bottom: 0;
  }

  .el-tabs--card>.el-tabs__header {
    border-bottom: 0;
  }

  .el-tabs--card>.el-tabs__header .el-tabs__item .is-icon-close {
    width: 14px !important;
  }

  .el-tabs__nav {
    border: none !important;
    // border-bottom: 1px solid var(--el-border-color-light) !important;
  }

  .el-tabs--card>.el-tabs__header .el-tabs__item {
    padding: 5px 13px !important;
    border-radius: 6px;
    --el-tabs-header-height: 30px;
    // border: 1px solid var(--el-border-color-light) !important;
    border: none !important;
    background: var(--el-color-info-light-9);
    margin-right: 10px;

    // font-weight: bold;
    ._icon {
      margin: -2px 3px 0 0;
    }

    &.is-active {
      background: var(--el-color-primary-light-9);
      // border: 1px solid var(--el-color-primary-light-7) !important;
    }
  }
}
</style>
