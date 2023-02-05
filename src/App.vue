<script setup>
import { ref } from 'vue';
import darkTheme from 'naive-ui';
import sleep from 'await-sleep';
// import { setLocaleMessage } from 'vue-i18n';

// 定义一些变量
let options = ref(null);
let data = ref(null);
let msg = ref(null);
let textLoading = ref(true);

(async function waitCHP() {
  if ((typeof CHP === 'undefined') || (typeof mw === 'undefined')) {
    await sleep(3000);
    waitCHP();
    console.log('[导出动画数据] 正在等待 CHP 和 Wiki api 就绪');
  } else {
    CHP.then(() => {
      getText();
    });
    console.log('[导出动画数据] CHP 和 Wiki api 已就绪');
  }
})();

// 加载表格的功能
async function getXlsx(title) {
  try {
    this.loading = true;
    if (title === null) {
      $message.error(t('blank'));
      this.loading = false;
    } else {
      let filter = encodeURI(`{"系列1":"${title}"}`);
      let response = await axios.get(`https://xyy.huijiwiki.com/api/rest_v1/namespace/data?filter=${filter}&sort_by=%E9%9B%86%E6%95%B0&pagesize=530&${Date()}`);
      await $cockpitUtil.sleep(500);
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
      XLSX.writeFile(workbook, `${title}（时间：${Date()}）（备份：发生意外状况时用这个文件还原）.xlsx`);
      this.loading = false;
    }
  } catch (error) {
    $message.error(t('unknown'));
    console.error(error);
    this.loading = false;
  }
}

// 加载[[Data:导出数据表格.json]]信息的功能
async function getText() {

  let a = await axios.get('https://xyy.huijiwiki.com/api/rest_v1/namespace/data?filter=%7B%22_id%22%3A%20%22Data%3A%E5%AF%BC%E5%87%BA%E6%95%B0%E6%8D%AE%E8%A1%A8%E6%A0%BC.json%22%7D');
  a = a['data']['_embedded'][0];
  options.value = a['list'];

  // 处理多语言
  Object.keys(a['messages']).forEach(element => {
    setLocaleMessage(element, a['messages'][element]);
  });

  let locale = mw.config.values.wgUserLanguage;

  // 结束加载状态
  textLoading.value = false;

};

</script>

<template>
  <n-config-provider :theme="darkTheme">

    <!-- 加载中展示的卡片 -->
    <n-card v-if="textLoading">
      <n-skeleton text :repeat="5" /> <n-skeleton text style="width: 60%" />
    </n-card>

    <!-- 加载完成后展示的卡片 -->
    <n-card v-else :title="t(`title`)">
      <n-p v-html="t('read_me')"></n-p>
      <template #footer>
        <n-a href="https://github.com/XYY-huijiwiki/XYY-huijiwiki-components" target="_blank">
          {{ t('github_link') }}
        </n-a>
        &nbsp;|&nbsp;
        <n-a href="//xyy.huijiwiki.com/wiki/Data:导出数据表格.json" target="_blank">{{ t('conf_page_link') }}</n-a>
        &nbsp;|&nbsp;
        <n-a href="//xyy.huijiwiki.com/wiki/Html:导出数据表格" target="_blank">{{ t('html_page_link') }}</n-a>
        &nbsp;|&nbsp;
        <n-a href="//www.huijiwiki.com/wiki/帮助:灰机Wiki数据更新器" target="_blank">{{ t('huiji_updater_link') }}</n-a>
      </template>
      <template #action>
        <n-input-group>
          <n-select v-model:value="value" :options="options" :placeholder="t(`placeholder`)" filterable></n-select>
          <n-button @click="getXlsx(value)" :loading="loading">{{ t(`btn_in`) }}</n-button>
        </n-input-group>
      </template>
    </n-card>

  </n-config-provider>
</template>