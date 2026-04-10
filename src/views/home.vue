<template>
  <div class="dashboard-desktop">
    <el-row :gutter="16">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <div class="custom-card user-status-box">
            <el-row>
                <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                    <div class="user-profile">
                       <el-avatar :size="80" :src="userInfo?.avatar" >
                          {{ nickName.substring(0,1) }}
                          </el-avatar>
                        <div class="user-detail">
                            <div class="name">{{nickName}}</div>
                            <div class="org">研发部 | 负责人</div>
                        </div>
                    </div>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                    <div class="user-status-right">
                        <div class="task-stats">
                            <div class="stat-btn">
                            <span class="dot warning"></span>
                            <span class="label">待处理</span>
                            <span class="num">12</span>
                            </div>
                            <div class="stat-btn">
                            <span class="dot primary"></span>
                            <span class="label">进行中</span>
                            <span class="num">5</span>
                            </div>
                            <div class="stat-btn">
                            <span class="dot success"></span>
                            <span class="label">已完成</span>
                            <span class="num">28</span>
                            </div>
                        </div>
                    </div>
                </el-col>
            </el-row>
          
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8" class="xs-mt-16">
        <el-carousel height="120px" class="banner-slider" indicator-position="none">
          <el-carousel-item v-for="i in 3" :key="i">
            <div class="banner-content">
              <h4>系统通知</h4>
              <p>Nuocao 框架已更新至最新版本，请关注更新日志。</p>
            </div>
          </el-carousel-item>
        </el-carousel>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mt-16">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <div class="custom-card mb-16">
          <div class="card-title">业务数据</div>
          <el-row :gutter="10" class="data-grid">
            <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6" v-for="item in businessStats" :key="item.label">
              <div class="stat-group">
                <span class="label">{{ item.label }}</span>
                <span class="value">{{ item.value }}</span>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="custom-card mb-16 xs-mt-16">
          <div class="card-title">运维一览</div>
          <el-row class="data-grid small">
            <el-col :gutter="10" :xs="12" :sm="12" :md="6" :lg="6" :xl="6" v-for="item in devOpsStats" :key="item.label">
              <div class="stat-group">
                <span class="label">{{ item.label }}</span>
                <span class="value">{{ item.value }}</span>
              </div>
            </el-col>
          </el-row>
        </div>

        <el-row :gutter="16">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <div class="custom-card list-card">
              <div class="card-header"><span>访问记录</span><el-button link>更多</el-button></div>
              <el-scrollbar height="260px">
                <el-timeline>
                  <el-timeline-item v-for="i in 6" :key="i" timestamp="2026-04-02" :color="themeColor">
                    用户登录 <span class="sub">111.164.227.27 天津</span>
                  </el-timeline-item>
                </el-timeline>
              </el-scrollbar>
            </div>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="xs-mt-16">
            <div class="custom-card list-card">
              <div class="card-header"><span>操作记录</span><el-button link>更多</el-button></div>
              <el-scrollbar height="260px">
                <div v-for="i in 6" :key="i" class="op-log">
                  <span class="dot-warn"></span>
                  <span class="time">14:32:48</span>
                  <span class="txt">编辑数据转换规则</span>
                </div>
              </el-scrollbar>
            </div>
          </el-col>
        </el-row>
      </el-col>

      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8" class="xs-mt-16">
        <div class="custom-card mb-16 calendar-wrapper">
          <div class="card-title">日程日历</div>
          <el-calendar>
            <template #date-cell="{ data }">
              <div class="calendar-day">
                {{ data.day.split('-').slice(2).join() }}
                <div v-if="['02', '15', '20'].includes(data.day.split('-')[2])" class="task-dot"></div>
              </div>
            </template>
          </el-calendar>
        </div>

        <div class="custom-card">
          <div class="card-title">周访问量</div>
          <div ref="chartRef" class="echarts-dom"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted,computed } from 'vue'
import * as echarts from 'echarts'
import { useSystemStore } from '@/stores/index'
const systemStore = useSystemStore()


const userInfo = computed(()=>{
  return systemStore?.state?.user;
})
const nickName = computed(()=>{
  return systemStore?.state?.user?.name || systemStore?.state?.user?.nickName;
})


const themeColor = '#6366f1' // 对齐图2的蓝紫色
const currentTime = ref('2026年04月02日 16时34分01秒')
const chartRef = ref(null)
let myChart = null

const businessStats = [
  { label: '用户数量', value: 4 }, { label: '组织数量', value: 2 },
  { label: '职位数量', value: 1 }, { label: '角色数量', value: 5 }
]
const devOpsStats = [
  { label: '系统字典', value: 327 }, { label: '业务字典', value: 0 },
  { label: '后台在线', value: 3 }, { label: '前台在线', value: 2 }, { label: '三方用户', value: 0 }
]

const initChart = () => {
  if (!chartRef.value) return
  myChart = echarts.init(chartRef.value)
  const option = {
    grid: { left: '10%', right: '5%', bottom: '15%', top: '10%' },
    xAxis: {
      type: 'category',
      data: ['03-27', '03-28', '03-29', '03-30', '03-31', '04-01', '04-02'],
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#eee' } } },
    series: [{
      data: [1, 4, 3, 5, 4, 6, 8],
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: themeColor },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
          { offset: 1, color: 'rgba(99, 102, 241, 0)' }
        ])
      }
    }]
  }
  myChart.setOption(option)
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => myChart?.resize())
})

onUnmounted(() => {
  window.removeEventListener('resize', () => myChart?.resize())
})
</script>

<style lang="scss" scoped>
$primary-color: #6366f1;
$card-bg: var(--el-bg-color);
$text-main:var(--el-text-color-primary) ;
$text-sub: var(--el-text-color-regular);
.dashboard-desktop {
  padding: 16px;
  font-family: "PingFang SC", sans-serif;

  // 响应式移动端间距补偿
  @media (max-width: 768px) {
    .xs-mt-16 { margin-top: 16px; }
  }
  .mt-16 { margin-top: 16px; }
  .mb-16 { margin-bottom: 16px; }

  // 统一去边框卡片样式
  .custom-card {
    background: $card-bg;
    padding: 16px;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02); // 极轻微阴影代替边框
    border: none;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: $text-main;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      &::before {
        content: '';
        width: 4px;
        height: 14px;
        background: $primary-color;
        margin-right: 8px;
        border-radius: 2px;
      }
    }
  }

  // 个人状态
  .user-status-box {
    .user-profile {
      height: 90px;
      display: flex;
      align-items: center;
      width: 100%;
      .user-detail {
        margin-left: 16px;
        .name { font-size: 18px; font-weight: bold; color: $text-main; }
        .org { font-size: 14px; margin-top: 4px; margin-top: 5px;color:$text-sub }
      }
      .live-clock { margin-left: auto; color: $text-sub; font-size: 14px; }
    }

    .user-status-right {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: space-between;
        height: 100%;
        padding: 5px 0;

        .task-stats {
          display: flex;
          gap: 16px;
          .stat-btn {
            display: flex;
            align-items: center;
            background: var(--el-fill-color-blank);
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid var(--el-border-color-extra-light);
            cursor: pointer;
            transition: background 0.2s;
            
            &:hover { background: var(--el-fill-color); }
            
            .dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              margin-right: 6px;
              &.warning { background: var(--el-color-warning); }
              &.primary { background: var(--el-color-primary); }
              &.success { background: var(--el-color-success); }
            }
            .label { font-size: 14px; color: $text-sub; margin-right: 6px; }
            .num { font-size: 18px; font-weight: bold; color: $text-main; }
          }
        }
      }
  }

  // Banner
  .banner-slider {
    border-radius: 6px;
    .banner-content {
      height: 100%;
      background: linear-gradient(135deg, $primary-color 0%, #818cf8 100%);
      color: white;
      padding: 16px 24px;
      align-items: center;
      h4 { margin: 0 0 8px; font-size: 18px; }
      p { margin: 0; font-size: 14px; opacity: 0.9; }
    }
  }

  // 数据展示
  .data-grid {
    .stat-group {
      display: flex;
      flex-direction: column;
      padding-bottom: 8px;
      .label { font-size: 14px; color: $text-sub; margin-bottom: 4px; }
      .value { font-size: 22px; font-weight: 700; color: $text-main; }
    }
    &.small .value { font-size: 18px; }
  }

  // 记录列表
  .list-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      span { font-size: 14px; font-weight: 600; }
    }
    .sub { color: $text-sub; font-size: 14px; margin-left: 8px; }
    .op-log {
      padding: 10px 0;
      font-size: 14px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      .dot-warn { width: 6px; height: 6px; background: #fb7185; border-radius: 50%; margin-right: 12px; }
      .time { color: $text-sub; margin-right: 12px; width: 60px; }
      .txt { color: $text-main; }
    }
  }

  // 日历样式深度覆盖
  .calendar-wrapper :deep() {
    .el-calendar {
      --el-calendar-border: none;
      --el-calendar-cell-width: 40px;
      background: transparent;
    }
    .el-calendar-table thead th { padding: 0; color: $text-sub; }
    .el-calendar-day {
      height: 45px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      &:hover { background-color: var(--el-color-primary); }
    }
    .calendar-day {
      position: relative;
      font-size: 14px;
      .task-dot {
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 4px;
        height: 4px;
        background: $primary-color;
        border-radius: 50%;
      }
    }
    .el-calendar__header { display: none; } // 隐藏日历原生头部，保持紧凑
  }

  .echarts-dom {
    height: 220px;
    width: 100%;
  }
}
</style>