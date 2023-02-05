<script setup>
import { ref } from 'vue';
import { darkTheme } from 'naive-ui';
import sleep from 'await-sleep';
import * as XLSX from 'xlsx/xlsx.mjs';
import moment from 'moment';

// 本地测试（开始）
import axios from 'axios';
// 本地测试（结束）

// 如果网页链接不是羊羊百科，自动进入测试模式
let isTesting = location.host === 'xyy.huijiwiki.com' ? false : true;

// 定义一些变量
let options = ref([]);
let btnLoading = ref(false);
let selectLoading = ref(false);
let value = ref(null);

// 加载配置页面的内容
async function focus() {

  // 如果已经加载过一次了就不再加载
  if (options.value.length !== 0) { return; }

  // 打开加载动画，强制欣赏加载动画一秒钟，防止加载速度太快出现“闪屏”
  selectLoading.value = true;
  await sleep(1000);

  // 本地测试（开始）
  await sleep(3000);
  options.value = [
    {
      "type": "group",
      "label": "动画正篇",
      "key": "动画正篇",
      "children": [
        {
          "label": "嘻哈闯世界",
          "value": "嘻哈闯世界"
        },
        {
          "label": "羊羊小侦探",
          "value": "羊羊小侦探"
        },
        {
          "label": "奇幻天空岛",
          "value": "奇幻天空岛"
        },
        {
          "label": "羊村守护者",
          "value": "羊村守护者"
        },
        {
          "label": "跨时空救兵",
          "value": "跨时空救兵"
        },
        {
          "label": "勇闯四季城",
          "value": "勇闯四季城"
        }
      ]
    },
    {
      "type": "group",
      "label": "动画短剧",
      "key": "动画短剧",
      "children": [
        {
          "label": "智趣羊学堂之动植物篇",
          "value": "动植物篇"
        },
        {
          "label": "智趣羊学堂之运动篇",
          "value": "运动篇"
        },
      ]
    }
  ];
  selectLoading.value = false;
  return;
  // 本地测试（结束）

  new mw.Api().postWithToken('csrf', {
    action: 'query',
    prop: 'revisions',
    titles: 'Data:导出数据表格.json',
    rvprop: 'content'
  }).fail((err) => {
    $message.error(`未知错误`);
    console.log(err);
  }).done((msg) => {
    let text = msg.query.pages[46592].revisions[0]['*'];
    options.value = (JSON.parse(text))['list'];
    selectLoading.value = false;
  });

}

// 导出表格的功能
async function getXlsx(title) {
  try {
    btnLoading.value = true;
    if (title === null) {
      isTesting ? console.log('请选择需要导出的内容') : $message.error('请选择需要导出的内容');
      btnLoading.value = false;
    } else {
      let filter = encodeURI(`{"系列1":"${title}"}`);
      let response = await axios.get(`https://xyy.huijiwiki.com/api/rest_v1/namespace/data?filter=${filter}&sort_by=%E9%9B%86%E6%95%B0&pagesize=530&${Date()}`);
      await sleep(500);
      await response[`data`][`_embedded`].forEach(element => {
        Object.keys(element).forEach(key => {
          if (typeof element[key] === 'object') {
            element[key] = JSON.stringify(element[key]);
          };
        });
      });
      let worksheet = XLSX.utils.json_to_sheet(response[`data`][`_embedded`]);
      XLSX.utils.sheet_add_aoa(worksheet, [[""]], { origin: "A1" });
      let workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      XLSX.writeFile(workbook, `${title}.xlsx`);
      XLSX.writeFile(workbook, `${title}（备份：${moment().format('lll')}）.xlsx`);
      btnLoading.value = false;
    }
  } catch (error) {
    isTesting ? console.log('未知错误') : $message.error('未知错误');
    console.error(error);
    btnLoading.value = false;
  }
}

</script>

<template>

  <!-- 添加 Material Symbol 系列图标 -->
  <!-- 本地测试（开始） -->
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0" />
  <!-- 本地测试（结束） -->

  <n-config-provider :theme="darkTheme">
    <n-card title="导出数据表格">
      <n-space vertical>
        <n-text>在此处选择动画系列即可导出剧集数据表格，方便对内容进行批量修改。修改后的表格需要使用“灰机Wiki数据更新器”上传，才能更新羊羊百科的数据。</n-text>
        <n-input-group>
          <n-select v-model:value="value" :options="options" :loading="selectLoading" @focus="focus" filterable>
            <template #empty>
              <n-empty description="正在加载">
                <template #icon>
                  <n-icon>
                    <material-symbol :size="32">hourglass_empty</material-symbol>
                  </n-icon>
                </template>
              </n-empty>
            </template>
          </n-select>
          <n-button @click="getXlsx(value)" :loading="btnLoading">导出</n-button>
        </n-input-group>
      </n-space>

      <!-- 底部footer -->
      <template #action>
        <n-space justify="space-between">
          <!-- 本地测试（开始） -->
          <n-p>当前为本地测试</n-p>
          <!-- 本地测试（结束） -->
          <n-p>最后编译时间：Feb 6, 2023 1:27 AM</n-p>
          <n-space justify="end">
            <n-a href="//xyy.huijiwiki.com/wiki/Data:导出数据表格.json" target="_blank">配置页面</n-a>
            <n-a href="//www.huijiwiki.com/wiki/帮助:灰机Wiki数据更新器" target="_blank">灰机Wiki数据更新器</n-a>
            <n-a href="//github.com/XYY-huijiwiki/XYY-huijiwiki-components" target="_blank">Github</n-a>
          </n-space>
        </n-space>
      </template>

    </n-card>
  </n-config-provider>
</template>