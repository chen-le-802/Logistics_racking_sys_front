<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";

let map = null;
const logisticsInfo = ref({
  status: "运输中",
  currentLocation: "北京市朝阳区",
  estimatedTime: "2023-12-20 18:00前",
  steps: [
    { time: "2023-12-15 08:30", location: "上海市浦东仓库", status: "已发货" },
    { time: "2023-12-15 14:20", location: "上海市转运中心", status: "运输中" },
    { time: "2023-12-16 09:15", location: "北京市转运中心", status: "运输中" },
    { time: "2023-12-17 10:30", location: "北京市朝阳区分拣中心", status: "派送中" }
  ]
});

// 物流路线坐标点（上海到北京）
const routePath = [
  [121.4737, 31.2304], // 上海
  [116.4074, 39.9042]  // 北京
];

onMounted(() => {
  window._AMapSecurityConfig = {
    securityJsCode: "76f474ae5205d86d65a7334103cf47b3",
  };
  AMapLoader.load({
    key: "517cd84e469d7b78bcfa910d5e83a3a7",
    version: "2.0",
    plugins: [
      "AMap.Scale",
      "AMap.Driving", // 路线规划插件
      "AMap.Marker",  // 点标记插件
      "AMap.Polyline" // 折线插件
    ],
  })
    .then((AMap) => {
      map = new AMap.Map("container", {
        viewMode: "3D",
        zoom: 5, // 缩小级别以显示完整路线
        center: [117.5, 36], // 居中显示在上海和北京之间
      });
      
      // 添加比例尺
      map.addControl(new AMap.Scale());
      
      // 绘制物流路线
      const polyline = new AMap.Polyline({
        path: routePath,
        strokeColor: "#3366FF", // 线颜色
        strokeWeight: 5,       // 线宽
        strokeStyle: "solid",  // 线样式
      });
      map.add([polyline]);
      
      // 添加起点和终点标记
      const startMarker = new AMap.Marker({
        position: routePath[0],
        content: '<div class="marker start-marker">起</div>',
        offset: new AMap.Pixel(-10, -10)
      });
      
      const endMarker = new AMap.Marker({
        position: routePath[1],
        content: '<div class="marker end-marker">终</div>',
        offset: new AMap.Pixel(-10, -10)
      });
      
      map.add([startMarker, endMarker]);
      
      // 添加物流节点标记
      logisticsInfo.value.steps.forEach((step, index) => {
        // 简单模拟位置，实际应用中应该使用真实坐标
        const position = index < 2 ? 
          [routePath[0][0] + Math.random() * 0.5, routePath[0][1] + Math.random() * 0.5] :
          [routePath[1][0] + Math.random() * 0.5, routePath[1][1] + Math.random() * 0.5];
          
        const marker = new AMap.Marker({
          position: position,
          content: `<div class="marker step-marker">${index + 1}</div>`,
          offset: new AMap.Pixel(-10, -10)
        });
        
        // 添加信息窗口
        marker.on('click', () => {
          const infoWindow = new AMap.InfoWindow({
            content: `<div class="info-window">
              <h4>物流信息</h4>
              <p>时间: ${step.time}</p>
              <p>地点: ${step.location}</p>
              <p>状态: ${step.status}</p>
            </div>`,
            offset: new AMap.Pixel(0, -30)
          });
          infoWindow.open(map, position);
        });
        
        map.add(marker);
      });
      
      // 自动定位到当前物流位置（最后一个节点）
      const lastStep = logisticsInfo.value.steps[logisticsInfo.value.steps.length - 1];
      map.setZoomAndCenter(12, [
        routePath[1][0] + Math.random() * 0.1, 
        routePath[1][1] + Math.random() * 0.1
      ]);
    })
    .catch((e) => {
      console.log(e);
    });
});

onUnmounted(() => {
  map?.destroy();
});
</script>

<template>
  <div class="logistics-container">
    <div id="container"></div>
    
    <div class="logistics-info">
      <h3>物流信息</h3>
      <div class="status-bar">
        <div class="status">{{ logisticsInfo.status }}</div>
        <div class="location">当前位置: {{ logisticsInfo.currentLocation }}</div>
        <div class="time">预计送达: {{ logisticsInfo.estimatedTime }}</div>
      </div>
      
      <div class="timeline">
        <div 
          v-for="(step, index) in logisticsInfo.steps" 
          :key="index" 
          class="timeline-item"
          :class="{active: index === logisticsInfo.steps.length - 1}"
        >
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="time">{{ step.time }}</div>
            <div class="location">{{ step.location }}</div>
            <div class="status">{{ step.status }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#container {
  width: 100%;
  height: 500px;
}

.logistics-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.logistics-info {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.status-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.status {
  font-weight: bold;
  color: #ff6700;
}

.timeline {
  position: relative;
  padding-left: 20px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #eee;
}

.timeline-item {
  position: relative;
  padding-bottom: 20px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -20px;
  top: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ccc;
  border: 2px solid #fff;
}

.timeline-item.active .timeline-dot {
  background: #ff6700;
}

.timeline-content {
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.timeline-item.active .timeline-content {
  background: #fff8f0;
  border-left: 3px solid #ff6700;
}

.time {
  font-size: 14px;
  color: #666;
}

.location {
  font-weight: bold;
  margin: 5px 0;
}

.status {
  color: #ff6700;
  font-size: 14px;
}

/* 地图标记样式 */
.marker {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  text-align: center;
  line-height: 20px;
  color: white;
  font-size: 12px;
}

.start-marker {
  background: #4CAF50;
}

.end-marker {
  background: #F44336;
}

.step-marker {
  background: #2196F3;
}

.info-window {
  padding: 10px;
  min-width: 150px;
}

.info-window h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.info-window p {
  margin: 5px 0;
  font-size: 12px;
  color: #666;
}
</style>