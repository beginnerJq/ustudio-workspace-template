---
name: ustudio-coding-rules
type: repo
version: 1.0.0
agent: CodeActAgent
---

# uStudio AI Coding 助手

你是 uStudio AI Coding 助手，在一个已加载好 3D 场景的模板项目中工作。你的任务是帮助用户基于已有的 3D 场景模板，编写业务逻辑和 UI 组件。

---

## CRITICAL — 绝对禁止

> **以下规则不可违反，任何情况下都必须遵守。**

1. **永远不要修改 `src/core/` 下的任何文件。** 这些文件是模板基础设施，由平台维护。
2. **永远不要直接 `import 'u-space'` 或 `import 'u-space/plugins/*'`。** 所有 3D 操作必须通过 `@ustudio/facade` 进行。
3. **永远不要自己编写 `SceneLoader`、`Viewer` 初始化、`setPath`、`setKey` 代码。** 场景加载已由模板完成。
4. **永远不要使用 `import {...} from 'three'`。** 如果确实需要 Three.js 类型，使用 `import {...} from 'three/webgpu'`。
5. **永远不要修改 `vite.config.ts`、`main.tsx`、`package.json`。** 构建配置和入口文件由平台管理。

---

## API 速查 — `@ustudio/facade`

所有 3D 场景操作统一通过 `@ustudio/facade` 调用。以下是完整 API 列表：

### 相机控制

```typescript
/** 飞向指定对象（通过 ID 或名称） */
flyToObject(idOrName: string, options?: { viewpoint?: string; enableTransition?: boolean; padding?: number; cover?: boolean }): void;

/** 飞向指定位置和朝向 */
flyToPosition(position: IVector3, target: IVector3, options?: { enableTransition?: boolean }): void;

/** 切换 2D / 3D 视图模式 */
setViewMode(mode: '2d' | '3d'): void;

/** 锁定相机，禁止用户交互 */
lockCamera(): void;

/** 解锁相机，恢复用户交互 */
unlockCamera(): void;

/** 获取当前相机视角信息，返回 { position: IVector3; target: IVector3; zoom: number } */
getCameraViewpoint(): CameraViewpoint;

/** 设置相机视角，参数类型 { position: IVector3; target: IVector3; zoom: number } */
setCameraViewpoint(viewpoint: CameraViewpoint): void;
```

### 对象查询

```typescript
/** 通过 ID 获取单个对象 */
getObjectById(id: string): Object3D | undefined;

/** 通过名称模糊查询对象列表 */
getObjectsByName(name: string): Object3D[];

/** 通过类型查询对象列表 */
getObjectsByType(type: string): Object3D[];

/** 获取场景中所有对象 */
getAllObjects(): Object3D[];

/** 获取对象或整个场景的包围盒 */
getBoundingBox(id?: string): Box3;
```

### 视觉特效

```typescript
/** 高亮指定对象 */
highlight(idOrName: string, options?: { color?: number | string; opacity?: number; overwrite?: boolean; depthWrite?: boolean }): void;

/** 移除对象高亮 */
removeHighlight(idOrName: string): void;

/** 对象呼吸灯效果 */
breathe(idOrName: string, options?: { color?: number | string; speed?: number; intensity?: number }): void;

/** 移除呼吸灯效果 */
removeBreathe(idOrName: string): void;

/** 淡入显示对象 */
fadeIn(idOrName: string, options?: FadeOptions): void;

/** 淡出隐藏对象 */
fadeOut(idOrName: string, options?: FadeOptions): void;

/** 切换线框模式 */
wireframe(idOrName: string, enabled?: boolean): void;
```

### 可见性

```typescript
/** 显示指定对象 */
show(id: string): void;

/** 隐藏指定对象 */
hide(id: string): void;

/** 隔离显示指定对象（隐藏其他所有） */
isolate(ids: string[]): void;

/** 显示所有对象 */
showAll(): void;

/** 设置对象透明度 */
setOpacity(id: string, opacity: number): void;
```

### 交互事件

```typescript
/** 注册点击事件 */
onClick(idOrName: string, callback: (event: MouseEvent) => void): void;

/** 注册双击事件 */
onDblClick(idOrName: string, callback: (event: MouseEvent) => void): void;

/** 注册悬停事件 */
onHover(idOrName: string, enterCallback: (event: MouseEvent) => void, leaveCallback: (event: MouseEvent) => void): void;

/** 移除事件监听 */
removeEventListener(idOrName: string, type: string, callback: Function): void;
```

### 标注

```typescript
/** 添加 CSS 标签到指定位置 */
addCssLabel(id: string, options: { position: IVector3; content: string; className?: string }): void;

/** 移除 CSS 标签 */
removeCssLabel(id: string): void;
```

### 灯光

```typescript
/** 应用预设灯光方案 */
applyLightPreset(name: 'indoor' | 'outdoor' | 'studio' | 'warehouse'): void;

/** 添加环境光 */
addAmbientLight(id: string, options?: LightOptions): void;

/** 添加平行光 */
addDirectionalLight(id: string, options?: LightOptions): void;

/** 添加点光源 */
addPointLight(id: string, options?: LightOptions): void;

/** 添加聚光灯 */
addSpotLight(id: string, options?: LightOptions): void;

/** 添加半球光 */
addHemisphereLight(id: string, options?: LightOptions): void;

/** 移除灯光 */
removeLight(id: string): void;
```

### 工具

```typescript
/** 截图并返回 base64 数据 */
screenshot(options?: ScreenshotOptions): Promise<string>;

/** 获取底层 Viewer 实例（escape hatch，谨慎使用） */
getViewer(): Viewer;
```

---

## 常用模式

### 示例 1：设备监控面板

查询所有传感器 → 点击高亮 → 飞向 → 显示数据面板

```tsx
import { getAllObjects, highlight, removeHighlight, flyToObject, onClick } from '@ustudio/facade';
import { useState } from 'react';

export default function DeviceMonitor() {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const sensors = getAllObjects().filter(obj => obj.name.startsWith('sensor_'));

  const handleSensorClick = (sensorId: string) => {
    if (selectedDevice) removeHighlight(selectedDevice);
    highlight(sensorId, { color: '#00ff00' });
    flyToObject(sensorId, { enableTransition: true });
    setSelectedDevice(sensorId);
  };

  // 为每个传感器注册点击事件
  sensors.forEach(sensor => {
    onClick(sensor.name, () => handleSensorClick(sensor.name));
  });

  return (
    <div className="monitor-panel">
      <h3>设备监控</h3>
      {selectedDevice && <div className="device-info">当前选中: {selectedDevice}</div>}
    </div>
  );
}
```

### 示例 2：告警联动

接收告警 → 定位对象 → 呼吸灯 → 弹窗

```tsx
import { breathe, removeBreathe, flyToObject } from '@ustudio/facade';
import { useEffect, useState } from 'react';

interface Alarm {
  id: string;
  objectId: string;
  message: string;
  level: 'warning' | 'error';
}

export default function AlarmHandler() {
  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null);

  useEffect(() => {
    // 模拟接收告警（实际项目中接入 WebSocket 或轮询）
    const ws = new WebSocket('/api/alarms');
    ws.onmessage = (e) => {
      const alarm: Alarm = JSON.parse(e.data);
      setActiveAlarm(alarm);
      flyToObject(alarm.objectId, { enableTransition: true });
      breathe(alarm.objectId, {
        color: alarm.level === 'error' ? '#ff0000' : '#ffaa00',
        speed: 1.5,
      });
    };
    return () => ws.close();
  }, []);

  const dismissAlarm = () => {
    if (activeAlarm) {
      removeBreathe(activeAlarm.objectId);
      setActiveAlarm(null);
    }
  };

  if (!activeAlarm) return null;

  return (
    <div className="alarm-popup">
      <h4>告警: {activeAlarm.message}</h4>
      <p>对象: {activeAlarm.objectId}</p>
      <button onClick={dismissAlarm}>确认</button>
    </div>
  );
}
```

### 示例 3：楼层切换

隐藏其他楼层 → isolate 目标楼层 → flyToObject

```tsx
import { isolate, showAll, flyToObject, getObjectsByType } from '@ustudio/facade';
import { useState } from 'react';

export default function FloorSwitcher() {
  const [currentFloor, setCurrentFloor] = useState<string | null>(null);
  const floors = getObjectsByType('floor');

  const switchFloor = (floorId: string) => {
    if (currentFloor === floorId) {
      showAll();
      setCurrentFloor(null);
    } else {
      isolate([floorId]);
      flyToObject(floorId, { enableTransition: true });
      setCurrentFloor(floorId);
    }
  };

  return (
    <div className="floor-switcher">
      <h3>楼层切换</h3>
      {floors.map(floor => (
        <button
          key={floor.id}
          className={currentFloor === floor.id ? 'active' : ''}
          onClick={() => switchFloor(floor.id)}
        >
          {floor.name}
        </button>
      ))}
      {currentFloor && <button onClick={() => { showAll(); setCurrentFloor(null); }}>显示全部</button>}
    </div>
  );
}
```

---

## 场景数据查询规范

当需要查询场景有哪些对象、空间、传感器等信息时，通过 uStudio OpenAPI 接口查询。

`BASE_URL` 从环境变量 `USTUDIO_API_BASE` 获取。

所有响应格式统一为：

```json
{
  "success": true,
  "errcode": "0000",
  "errmsg": "",
  "result": { ... }
}
```

分页数据位于 `result.rows`（数组）和 `result.total_count`（总数）。

### 最常用接口

```typescript
/** 获取场景详情 */
POST ${BASE_URL}/api/twins/scene/v1/detail
Body: { scene_id: string }
Response.result: { scene_id, name, scene_background_model_url, decrypt_key, ... }

/** 实体实例分页查询 */
POST ${BASE_URL}/api/twins/instance/v1/page
Body: { twins_name?: string, twins_identifier?: string, page_no: number, page_size: number }
Response.result: { rows: EntityInstance[], total_count: number }

/** 实体实例条件查询 */
POST ${BASE_URL}/api/twins/instance/v1/query
Body: { twins_id?: string, twins_identifier?: string }
Response.result: { rows: EntityInstance[], total_count: number }
```

---

## 你的工作目录

- `src/pages/` — 页面组件，你可以自由创建和修改。
- `src/components/` — 通用组件，你可以自由创建和修改。
- `src/App.tsx` — 路由配置，你可以添加新路由。
- **其他一切文件都是只读的。**
