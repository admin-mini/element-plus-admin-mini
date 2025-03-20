<template>
    <!-- 
     为了方便统一管理样式，将表格、分页器、按钮等放在一个容器中，通过插槽的方式展示
      -->
    <div class="admin-dialog-container">
        <div class="admin-dialog-body">
            <slot name="default"></slot>
        </div>
        <div class="admin-dialog-footer">
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<script setup>

</script>

<style lang="scss">
.admin-dialog-container {
    .admin-view-body {
        padding: 0;
        border: 0;
    }
}
</style>