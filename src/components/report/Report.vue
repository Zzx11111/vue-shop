<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <div id="main" style="width: 600px;height:400px;" ref="main"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from "echarts";
import _ from 'lodash'
export default {
  data() {
    return {
      //需要合并的数据
      options: {
        title: {
          text: "用户来源"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#E9EEF3"
            }
          }
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: "value"
          }
        ]
      }
    };
  },
  created() {},
  //此时页面上的元素已经被渲染完毕
  mounted() {
    var myChart = echarts.init(this.$refs.main);
    this.$http.get("reports/type/1").then(res => {
      if (res.data.meta.status !== 200)
        return this.$message.error("获取折线图失败！");
      console.log(res)
      const result = _.merge(res.data.data,this.options)
      myChart.setOption(result);
    });
  },
  methods: {}
};
</script>

<style lang="less" scoped>
</style>