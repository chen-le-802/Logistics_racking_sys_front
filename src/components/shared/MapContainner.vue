<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import AMapLoader from "@amap/amap-jsapi-loader";
import { addTrack, getTracks, getOrderById } from "@/apis/modules/order";
import { getCourierById } from '@/apis/modules/user';
import { h } from 'vue';
import { ElDialog } from 'element-plus';

let map: any = null;
let AMapInstance: any = null;
let mapClickListener: any = null;
let markers: any[] = [];
let polylines: any[] = [];
let infoWindows: any[] = [];

const props = defineProps<{ stringOrderId: string,role:number }>();
const orderId = computed(() => props.stringOrderId);

const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

interface LogisticsTrack {
  id: string;
  orderId: string;
  status: string;
  location: string;
  courierId: number;
  timestamp?: string;
}

const logisticsTracks = ref<LogisticsTrack[]>([]);
const loading = ref(false);
const mapLoading = ref(false);
const isSelectingLocation = ref(false);
const orderDetail = ref<any>(null);

// 物流状态配置
const statusConfig = {
  2: { label: "待揽件", color: "#E6A23C", icon: "📦" },
  3: { label: "运输中", color: "#409EFF", icon: "🚚" },
  4: { label: "派送中", color: "#67C23A", icon: "🛵" },
  5: { label: "已签收", color: "#67C23A", icon: "✅" },
};

const statusOptions = [
  { value: 2, label: "待揽件" },
  { value: 3, label: "运输中" },
  { value: 4, label: "派送中" },
  { value: 5, label: "已签收" },
];

const selectedStatus = ref(2);
const currentLocation = ref("");
const selectedLocationName = ref("");

// 计算属性
const currentStatus = computed(() => {
  if (logisticsTracks.value.length === 0) return null;
  return logisticsTracks.value[0];
});

const progressPercentage = computed(() => {
  if (logisticsTracks.value.length === 0) return 0;
  const latestStatus = logisticsTracks.value[0].status;
  const statusMap: { [key: string]: number } = {
    "待揽件": 40,
    "运输中": 60,
    "派送中": 80,
    "已签收": 100,
  };
  return statusMap[latestStatus] || 0;
});

// 格式化时间
const formatTime = (timestamp: string) => {
  if (!timestamp) return "未知时间";
  const date = new Date(timestamp);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 获取物流信息
const fetchLogistics = async () => {
  loading.value = true;
  try {
    const response = await getTracks(orderId.value);
    logisticsTracks.value = Array.isArray(response) ? response : [];
    logisticsTracks.value.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeB - timeA;
    });
  } catch (error) {
    ElMessage.error("获取物流信息失败");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 更新物流信息
const updateLogistics = async () => {
  if (!currentLocation.value) {
    ElMessage.warning("请选择当前位置");
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确认更新物流状态为"${statusOptions.find(s => s.value === selectedStatus.value)?.label}"？`,
      "确认更新",
      {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    
    loading.value = true;
    const response = await addTrack({
      orderId: orderId.value,
      statusCode: selectedStatus.value,
      location: currentLocation.value,
    });
    
    ElMessage.success("物流信息更新成功");
    await fetchLogistics();
    currentLocation.value = "";
    selectedLocationName.value = "";
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("物流信息更新失败");
      console.error(error);
    }
  } finally {
    loading.value = false;
  }
};

// 高德地图选点
const selectLocation = () => {
  if (!AMapInstance || !map) {
    ElMessage.error("地图未初始化完成");
    return;
  }
  
  isSelectingLocation.value = true;
  
  // 移除之前的监听，避免重复
  if (mapClickListener) {
    map.off("click", mapClickListener);
    mapClickListener = null;
  }
  
  AMapInstance.plugin("AMap.Geocoder", () => {
    const geocoder = new AMapInstance.Geocoder({ city: "全国" });
    
    mapClickListener = (e: any) => {
      const lnglat = e.lnglat;
      currentLocation.value = `${lnglat.lng},${lnglat.lat}`;
      
      geocoder.getAddress([lnglat.lng, lnglat.lat], (status: string, result: any) => {
        if (status === "complete" && result.regeocode) {
          selectedLocationName.value = result.regeocode.formattedAddress;
          ElMessage.success(`已选择位置: ${result.regeocode.formattedAddress}`);
        } else {
          selectedLocationName.value = `经度 ${lnglat.lng}, 纬度 ${lnglat.lat}`;
          ElMessage.success(`已选择位置: 经度 ${lnglat.lng}, 纬度 ${lnglat.lat}`);
        }
      });
      
      // 选中后自动移除监听
      map.off("click", mapClickListener);
      mapClickListener = null;
      isSelectingLocation.value = false;
    };
    
    map.on("click", mapClickListener);
    ElMessage.info("请在地图上点击选择当前位置");
  });
};

// 取消选点
const cancelSelectLocation = () => {
  if (mapClickListener && map) {
    map.off("click", mapClickListener);
    mapClickListener = null;
  }
  isSelectingLocation.value = false;
  ElMessage.info("已取消选点");
};

// 获取订单详情
const fetchOrderDetail = async () => {
  try {
    const res = await getOrderById(orderId.value);
    orderDetail.value = res;
  } catch (e) {
    orderDetail.value = null;
  }
};

// 初始化地图
const initMap = () => {
  mapLoading.value = true;
  // @ts-ignore
  window._AMapSecurityConfig = {
    securityJsCode: "76f474ae5205d86d65a7334103cf47b3",
  };
  
  AMapLoader.load({
    key: "517cd84e469d7b78bcfa910d5e83a3a7",
    version: "2.0",
    plugins: ["AMap.Scale", "AMap.Marker", "AMap.Polyline", "AMap.Geocoder", "AMap.ToolBar"],
  })
    .then((AMap: any) => {
      AMapInstance = AMap;
      map = new AMap.Map("container", {
        viewMode: "2D",
        zoom: 10,
        center: [116.397428, 39.90923], // 默认北京
      });
      
      // 添加地图控件
      map.addControl(new AMap.Scale());
      map.addControl(new AMap.ToolBar());
      
      if (logisticsTracks.value.length > 0) {
        renderLogisticsOnMap();
      }
      
      // 地图初始化后再批量请求地址和快递员信息
      logisticsTracks.value.forEach(track => {
        if (!addressMap[track.id]) fetchAddress(track);
        if (track.courierId && !courierInfoMap[track.courierId]) fetchCourierInfo(track.courierId);
      });
      mapLoading.value = false;
    })
    .catch((e: any) => {
      console.log(e);
      ElMessage.error("地图初始化失败");
      mapLoading.value = false;
    });
};

// 清理地图元素
const clearMapElements = () => {
  markers.forEach(marker => map?.remove(marker));
  polylines.forEach(polyline => map?.remove(polyline));
  infoWindows.forEach(infoWindow => infoWindow?.close());
  markers = [];
  polylines = [];
  infoWindows = [];
};

// 快递员信息弹窗
const courierDialogVisible = ref(false);
const courierInfo = ref<{ phone: string; name: string; email: string } | null>(null);
const courierLoading = ref(false);
const courierDialogTitle = ref('快递员信息');

const courierInfoMap = reactive<{ [id: number]: { name: string; phone: string; email: string } | null }>({});

const fetchCourierInfo = async (courierId: number) => {
  if (!courierId || courierInfoMap[courierId]) return;
  try {
    const res = await getCourierById(courierId);
    const info = (res && (res.data || res)) as any;
    courierInfoMap[courierId] = {
      name: info?.name || '',
      phone: info?.phone || '',
      email: info?.email || '',
    };
  } catch {
    courierInfoMap[courierId] = null;
  }
};

// 在地图上渲染物流轨迹
const renderLogisticsOnMap = () => {
  if (!map || !AMapInstance) return;
  
  clearMapElements();
  
  const sortedTracks = [...logisticsTracks.value].sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeA - timeB;
  });
  
  if (sortedTracks.length === 0) return;
  
  // 绘制轨迹线
  const path = sortedTracks.map((track) => {
    const [lng, lat] = track.location.split(",").map(Number);
    return new AMapInstance.LngLat(lng, lat);
  });
  
  if (path.length > 1) {
    const polyline = new AMapInstance.Polyline({
      path,
      strokeColor: "#409EFF",
      strokeWeight: 6,
      strokeStyle: "solid",
      strokeOpacity: 0.8,
    });
    map.add(polyline);
    polylines.push(polyline);
  }
  
  // 添加标记点
  sortedTracks.forEach((track, index) => {
    const [lng, lat] = track.location.split(",").map(Number);
    const position = new AMapInstance.LngLat(lng, lat);
    
    // 创建自定义标记
    const markerContent = `
      <div class="custom-marker ${index === sortedTracks.length - 1 ? 'latest' : ''}">
        <div class="marker-icon">${statusConfig[track.status as unknown as keyof typeof statusConfig]?.icon || '📍'}</div>
        <div class="marker-number">${index + 1}</div>
      </div>
    `;
    
    const marker = new AMapInstance.Marker({
      position,
      content: markerContent,
      offset: new AMapInstance.Pixel(-15, -15),
    });
    
    // 创建信息窗口
    const infoWindow = new AMapInstance.InfoWindow({
      content: `
        <div class="map-info-window">
          <div class="info-header">
            <span class="status-icon">${statusConfig[track.status as unknown as keyof typeof statusConfig]?.icon || '📍'}</span>
            <span class="status-text">${track.status}</span>
          </div>
          <div class="info-content">
            <p><strong>时间:</strong> ${formatTime(track.timestamp || '')}</p>
            <el-button class="el-button el-button--primary el-button--mini" id="courier-info-btn-${track.courierId}-${index}" :size="small">查看快递员信息</el-button>
            <div id="address-name-${index}" style="margin-top:4px;color:#409EFF;"></div>
          </div>
        </div>
      `,
      offset: new AMapInstance.Pixel(0, -30),
    });
    
    // 点击标记显示信息窗口
    marker.on("click", () => {
      infoWindows.forEach(w => w.close());
      infoWindow.open(map, position);
      // 绑定快递员信息按钮事件
      setTimeout(() => {
        const btn = document.getElementById(`courier-info-btn-${track.courierId}-${index}`);
        if (btn) {
          btn.onclick = async () => {
            courierDialogTitle.value = `快递员信息 (ID: ${track.courierId})`;
            courierLoading.value = true;
            try {
              const res = await getCourierById(track.courierId);
              // 兼容 res 直接为对象 或 res.data 为对象
              const info = (res && (res.data || res)) || {};
              const courier: any = info;
              courierInfo.value = {
                phone: courier.phone || '',
                name: courier.name || '',
                email: courier.email || '',
              };
              courierDialogVisible.value = true;
            } catch (e) {
              ElMessage.error('获取快递员信息失败');
            } finally {
              courierLoading.value = false;
            }
          };
        }
        // 逆地理编码显示地名
        if (AMapInstance && AMapInstance.Geocoder) {
          const geocoder = new AMapInstance.Geocoder({ city: '全国' });
          geocoder.getAddress([lng, lat], (status: any, result: any) => {
            if (status === 'complete' && result.regeocode) {
              const addrDiv = document.getElementById(`address-name-${index}`);
              if (addrDiv) {
                addrDiv.innerText = result.regeocode.formattedAddress;
              }
            }
          });
        }
      }, 100);
    });
    
    map.add(marker);
    markers.push(marker);
    infoWindows.push(infoWindow);
    // 渲染时请求地址和快递员信息
    if (!addressMap[track.id]) fetchAddress(track);
    if (track.courierId && !courierInfoMap[track.courierId]) fetchCourierInfo(track.courierId);
  });
  
  // 调整地图视野
  if (sortedTracks.length > 0) {
    const [lng, lat] = sortedTracks[sortedTracks.length - 1].location.split(",").map(Number);
    map.setCenter([lng, lat]);
    map.setZoom(12);
  }
};

// 刷新地图
const refreshMap = () => {
  if (logisticsTracks.value.length > 0) {
    renderLogisticsOnMap();
  }
};

const addressMap = reactive<{ [id: string]: string }>({});

const fetchAddress = (track: LogisticsTrack) => {
  if (!AMapInstance || !track.location) return;
  const [lng, lat] = track.location.split(",").map(Number);
  const geocoder = new AMapInstance.Geocoder({ city: "全国" });
  geocoder.getAddress([lng, lat], (status: string, result: any) => {
    if (status === "complete" && result.regeocode) {
      addressMap[track.id] = result.regeocode.formattedAddress;
    } else {
      addressMap[track.id] = track.location;
    }
  });
};

// 新增：快递员输入地名/地址快速定位
const searchInput = ref('');
const searchMarker = ref<any>(null);

const querySearch = (queryString: string, cb: Function) => {
  if (!queryString) {
    cb([]);
    return;
  }
  // 调用高德输入提示API
  fetch(`https://restapi.amap.com/v3/assistant/inputtips?key=52ae5ab5e09807e05c256e458929b23b&keywords=${encodeURIComponent(queryString)}&city=全国`)
    .then(res => res.json())
    .then(data => {
      console.log(data)
      if (data.tips) {
        cb(data.tips
          .filter((tip: any) => tip.location)
          .map((tip: any) => ({
            ...tip,
            value: tip.name + (tip.district ? `（${tip.district}）` : '')
          }))
        );
      } else {
        cb([]);
      }
    });
};

const handleSelectPlace = (item: any) => {
  if (item.location && map && AMapInstance) {
    const [lng, lat] = item.location.split(',').map(Number);
    map.setCenter([lng, lat]);
    map.setZoom(16);
    // 只保留一个marker
    if (searchMarker.value) {
      map.remove(searchMarker.value);
    }
    searchMarker.value = new AMapInstance.Marker({
      position: [lng, lat],
      content: '<div class="custom-marker">定位</div>',
      offset: new AMapInstance.Pixel(-15, -15),
    });
    map.add(searchMarker.value);
  }
};

onMounted(async () => {
  await fetchOrderDetail();
  await fetchLogistics();
  initMap();
});

onUnmounted(() => {
  if (mapClickListener && map) {
    map.off("click", mapClickListener);
    mapClickListener = null;
  }
  clearMapElements();
  map?.destroy();
});

watch(
  logisticsTracks,
  () => {
    if (map && logisticsTracks.value.length > 0) {
      renderLogisticsOnMap();
    }
  },
  { deep: true }
);
</script>

<template>
  <div class="logistics-container">
    <!-- 地图区域 -->
    <div class="map-section">
      <div class="map-header">
        <h3>物流轨迹地图</h3>
        <div class="map-controls">
          <!-- 新增：高德地点输入提示 -->
          <el-autocomplete
            v-model="searchInput"
            :fetch-suggestions="querySearch"
            placeholder="请输入地点/地址"
            @select="handleSelectPlace"
            style="width: 300px; margin-bottom: 0;"
          />
          <el-button 
            v-if="role"
            type="primary" 
            size="small" 
            @click="selectLocation"
            :disabled="isSelectingLocation"
          >
            {{ isSelectingLocation ? '选择中...' : '选择位置' }}
          </el-button>
          <el-button 
            v-if="isSelectingLocation" 
            size="small" 
            @click="cancelSelectLocation"
          >
            取消选点
          </el-button>
          <el-button size="small" @click="refreshMap">
            <i class="el-icon-refresh"></i> 刷新
          </el-button>
        </div>
      </div>
      
      <div class="map-container">
        <div v-if="mapLoading" class="map-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>地图加载中...</span>
        </div>
        <div id="container" :class="{ 'selecting': isSelectingLocation }"></div>
      </div>
    </div>

    <!-- 物流信息区域 -->
    <div class="logistics-info">
      <div class="info-header">
        <h3>物流信息</h3>
        <div class="order-id">订单号: {{ orderId }}</div>
      </div>
      
      <!-- 新增：起始地点和终点 -->
      <div v-if="orderDetail" class="order-address-info" style="padding: 0 24px 12px 24px;">
        <div><strong>起始地点：</strong>{{ orderDetail.senderAddr }}</div>
        <div><strong>终点：</strong>{{ orderDetail.receiverAddr }}</div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      
      <template v-else>
        <!-- 当前状态概览 -->
        <div v-if="currentStatus" class="status-overview">
          <div class="status-card">
            <div class="status-icon">
              {{ statusConfig[currentStatus.status as unknown as keyof typeof statusConfig]?.icon || '📦' }}
            </div>
            <div class="status-info">
              <div class="status-text">{{ currentStatus.status }}</div>
              <div class="status-time">{{ formatTime(currentStatus.timestamp || '') }}</div>
            </div>
          </div>
        </div>
        
        <!-- 快递员操作区域 -->
        <div v-if="role" class="courier-actions">
          <div class="action-header">
            <i class="el-icon-edit"></i>
            <span>更新物流信息</span>
          </div>
          
          <div class="action-form">
            <div class="form-item">
              <label>物流状态:</label>
              <el-select v-model="selectedStatus" placeholder="选择状态" style="width: 100%">
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
            
            <div class="form-item">
              <label>当前位置:</label>
              <div class="location-input">
                <el-button @click="selectLocation" :disabled="isSelectingLocation">
                  {{ isSelectingLocation ? '选择中...' : '选择位置' }}
                </el-button>
                <div v-if="selectedLocationName" class="location-display">
                  <i class="el-icon-location"></i>
                  {{ selectedLocationName }}
                </div>
              </div>
            </div>
            
            <el-button 
              type="primary" 
              @click="updateLogistics" 
              :loading="loading"
              :disabled="!currentLocation"
              style="width: 100%"
            >
              更新物流信息
            </el-button>
          </div>
        </div>
        
        <!-- 物流轨迹时间线 -->
        <div v-if="logisticsTracks.length > 0" class="timeline-section">
          <div class="timeline-header">
            <i class="el-icon-time"></i>
            <span>物流轨迹</span>
          </div>
          
          <div class="timeline">
            <div
              v-for="(track, index) in logisticsTracks"
              :key="track.id"
              class="timeline-item"
              :class="{ active: index === 0 }"
            >
              <div class="timeline-dot">
                <span class="dot-icon">
                  {{ statusConfig[track.status as unknown as keyof typeof statusConfig]?.icon || '📍' }}
                </span>
              </div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="status">{{ track.status }}</span>
                  <span class="time">{{ formatTime(track.timestamp || '') }}</span>
                </div>
                <div class="timeline-details">
                  <div class="detail-item">
                    <i class="el-icon-location"></i>
                    <span>地址: {{ addressMap[track.id] || '加载中...' }}</span>
                    <span>
                      快递员信息：
                      <template v-if="courierInfoMap[track.courierId]">
                        姓名：{{ courierInfoMap[track.courierId]?.name }}，
                        电话：{{ courierInfoMap[track.courierId]?.phone }}，
                        邮箱：{{ courierInfoMap[track.courierId]?.email }}
                      </template>
                      <template v-else>
                        加载中...
                      </template>
                    </span>
                  </div>
                  <div class="detail-item">
                    <i class="el-icon-user"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-else class="empty-state">
          <i class="el-icon-box"></i>
          <p>暂无物流信息</p>
          <p class="empty-desc">物流信息将在快递员更新后显示</p>
        </div>
      </template>
    </div>

    <el-dialog v-model="courierDialogVisible" :title="courierDialogTitle" width="400px" :close-on-click-modal="false">
      <div v-if="courierLoading" style="text-align:center;padding:32px 0;">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <div v-else-if="courierInfo">
        <p><strong>姓名：</strong>{{ courierInfo.name }}</p>
        <p><strong>电话：</strong>{{ courierInfo.phone }}</p>
        <p><strong>邮箱：</strong>{{ courierInfo.email }}</p>
      </div>
      <div v-else style="color:#999;text-align:center;">暂无快递员信息</div>
      <template #footer>
        <el-button @click="courierDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.logistics-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 地图区域样式 */
.map-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #FAFAFA;
  color: rgb(51, 51, 51);
}

.map-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.map-controls {
  display: flex;
  gap: 12px;
}

.map-container {
  position: relative;
  height: 500px;
}

#container {
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
}

#container.selecting {
  cursor: crosshair;
}

.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #666;
  z-index: 10;
}

/* 物流信息区域样式 */
.logistics-info {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.info-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.order-id {
  font-size: 14px;
  color: #666;
  background: #e8f4fd;
  padding: 6px 12px;
  border-radius: 6px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  color: #666;
}

/* 状态概览样式 */
.status-overview {
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #fdf6f8 0%, #E8F4FD 100%);
  border-radius: 12px;
  color: rgb(48, 47, 47);
}

.status-icon {
  font-size: 32px;
  background: rgba(255, 255, 255, 0.2);
  padding: 12px;
  border-radius: 50%;
}

.status-info {
  flex: 1;
}

.status-text {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.status-time {
  font-size: 14px;
  opacity: 0.9;
}

.progress-section {
  margin-top: 20px;
}

.progress-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

/* 快递员操作区域样式 */
.courier-actions {
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #f8f9fa;
}

.action-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.action-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.location-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.location-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #e8f4fd;
  border-radius: 6px;
  font-size: 14px;
  color: #409EFF;
}

/* 时间线样式 */
.timeline-section {
  padding: 24px;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.timeline {
  position: relative;
  padding-left: 24px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 11px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #409EFF, #67C23A);
}

.timeline-item {
  position: relative;
  padding-bottom: 24px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -24px;
  top: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid #409EFF;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.timeline-item.active .timeline-dot {
  border-color: #67C23A;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
}

.dot-icon {
  font-size: 12px;
}

.timeline-content {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
  transition: all 0.3s ease;
}

.timeline-item.active .timeline-content {
  background: #f0f9ff;
  border-left-color: #67C23A;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.1);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.timeline-header .status {
  font-weight: 600;
  color: #409EFF;
}

.timeline-item.active .timeline-header .status {
  color: #67C23A;
}

.timeline-header .time {
  font-size: 12px;
  color: #999;
}

.timeline-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.detail-item i {
  color: #409EFF;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 20px;
  color: #999;
}

.empty-state i {
  font-size: 48px;
  color: #ddd;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

.empty-desc {
  font-size: 14px !important;
  color: #bbb;
}

/* 地图标记样式 */
.custom-marker {
  position: relative;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #409EFF;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.custom-marker.latest {
  background: #67C23A;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
  transform: scale(1.2);
}

.marker-icon {
  font-size: 14px;
  color: white;
}

.marker-number {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ff4757;
  color: white;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

/* 地图信息窗口样式 */
.map-info-window {
  padding: 16px;
  min-width: 200px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.status-icon {
  font-size: 16px;
}

.status-text {
  font-weight: 600;
  color: #333;
}

.info-content p {
  margin: 6px 0;
  font-size: 12px;
  color: #666;
}

.info-content strong {
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .logistics-container {
    gap: 16px;
  }
  
  .map-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .map-controls {
    width: 100%;
    justify-content: flex-end;
  }
  
  .info-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .status-card {
    flex-direction: column;
    text-align: center;
  }
  
  .timeline {
    padding-left: 16px;
  }
  
  .timeline-dot {
    left: -16px;
  }
}

/* 提升 el-autocomplete 下拉建议高度 */
:deep(.el-autocomplete-suggestion) {
  max-height: 400px;
}
</style>
