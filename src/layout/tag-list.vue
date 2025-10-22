<template>
  <div class="admin-tag-list" v-if="tagView.tagList.length">

    <el-tabs v-model="tagView.active" type="card" @tab-click="({ paneName }) => tagView.setActive(paneName)"
      @tab-remove="handleTabRemove" id="js-tag-list">

      <el-tab-pane v-for="item in tagView.tagList" :key="item.fullPath" :closable="!item.meta.affix"
        :name="item.fullPath">
        <template #label>
          <el-dropdown trigger="contextmenu" style="color:inherit">
            <div>
              {{ $t("route." + item.meta.name) }}
            </div>
            <!-- <el-button @click="tagView.refresh()">刷</el-button> -->
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="tagView.remove(item)">{{ $t('tagView.close') }}</el-dropdown-item>
                <el-dropdown-item @click="tagView.removeOther(item)">{{ $t('tagView.closeOthers') }}</el-dropdown-item>
                <el-dropdown-item @click="tagView.removeRight(item)">{{ $t('tagView.closeRight') }}</el-dropdown-item>
                <el-dropdown-item @click="tagView.refresh(item)">{{ $t('tagView.refresh') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
function command() {
  console.log(arguments)
}
onMounted(() => {
  try {
    const el = document.querySelector('#js-tag-list .el-tabs__nav')
    new Sortable(el, {
      animation: 150,
      onEnd: (evt) => {
        tagView.sort(evt.oldIndex, evt.newIndex)
      }
    })
  } catch (err) {
    console.warn(err)
  }
})

function handleTabRemove(fullPath) {
  tagView.remove(fullPath)
}
</script>

<style lang="scss">
.admin-tag-list {
  width: 100%;
  flex-shrink: 0;
  // border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  box-sizing: border-box;
  padding: 8px 10px;
  box-shadow: 10px 1px 4px rgba(113, 128, 166, .1);
  z-index: 2;

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
