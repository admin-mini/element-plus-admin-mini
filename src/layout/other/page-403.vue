<template>
  <div>
    <el-alert type="warning">
      <div style="font-size: 18px; line-height: 1.8em">
        你无权访问该页面，请切换账号后重试！
        <br />
        page 403
        <br />
        将自动跳转至登录页面
      </div>
    </el-alert>
  </div>
</template>

<script>
export default {
  created() {
    setTimeout(() => {
      this.$store
        .dispatch('user/logout')
        .then(() => {
          this.$router.replace({name: 'login'});
        })
        .catch(() => {
          localStorage.clear();
          window.location.href = '';
        });
    }, 2000);
  },
};
</script>

<style></style>
