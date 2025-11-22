<template>
  <v-btn>
    <v-icon icon="mdi-help"></v-icon>

    <v-dialog activator="parent" width="480">
      <v-card>
        <div class="pa-4">
          <h3 class="mb-2">使い方</h3>
          <div class="mb-3">
            中央のボタンを押してタイマー開始<br/>
            もう一度押すと時間リセットして再開<br/>
            30秒・20秒と10秒以下毎秒ボイス
          </div>
          <v-divider class="my-2"></v-divider>
          <h3 class="my-2">Credit</h3>
          <div>
            音声素材: <a href="https://ondoku3.com" target="_blank">音読さん</a>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </v-btn>
</template>

<script setup>
import { ref } from 'vue';

</script>
