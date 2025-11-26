<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import About from './components/About.vue'

const minutes = ref(1)
const seconds = ref(0)
const totalSeconds = ref(60)
const timer = ref(null)
const remaining = ref(60)
const running = ref(false)

const drawer = ref(false)

import cuckooMp3 from '/sound/cuckoo.mp3'
import sound30 from '/sound/sound_30.mp3'
import sound20 from '/sound/sound_20.mp3'
import sound10 from '/sound/sound_10.mp3'
import sound9 from '/sound/sound_9.mp3'
import sound8 from '/sound/sound_8.mp3'
import sound7 from '/sound/sound_7.mp3'
import sound6 from '/sound/sound_6.mp3'
import sound5 from '/sound/sound_5.mp3'
import sound4 from '/sound/sound_4.mp3'
import sound3 from '/sound/sound_3.mp3'
import sound2 from '/sound/sound_2.mp3'
import sound1 from '/sound/sound_1.mp3'

const soundMap = {
  60: cuckooMp3,
  30: sound30,
  20: sound20,
  10: sound10,
  9: sound9,
  8: sound8,
  7: sound7,
  6: sound6,
  5: sound5,
  4: sound4,
  3: sound3,
  2: sound2,
  1: sound1,
  0: cuckooMp3,
}
const offsetMap = {
  30: 0.1,
  20: 0.1,
  10: 0.1,
  9: 0.1,
  8: 0.1,
  7: 0.1,
  6: 0.1,
  5: 0.1,
  4: 0.1,
  3: 0.1,
  2: 0.1,
  1: 0.1,
}

// キャッシュされた Audio インスタンス（プリロード用）
const audioCache = {}

function preloadAllSounds() {
  Object.entries(soundMap).forEach(([key, src]) => {
    try {
      const a = new Audio()
      a.preload = 'auto'
      a.src = src
      // 開始直後にロードを促す
      a.load()
      audioCache[key] = a
    } catch (e) {
      // 無視して続行
      console.error('audio preload failed', key, e)
    }
  })
}

onMounted(() => {
  preloadAllSounds()
})

function playSound(sec) {
  const key = String(sec)
  let src = null
  if (key in soundMap) src = soundMap[key]
  else if (sec === 0) src = cuckooMp3

  if (!src) return

  let offset = 0
  if (key in offsetMap) {
    offset = offsetMap[key]
  }

  // プリロード済みのキャッシュがあれば cloneNode して再生（再ダウンロードを避ける）
  const cached = audioCache[key]
  if (cached) {
    try {
      const instance = cached.cloneNode(true)
      instance.currentTime = offset // 開始直後の無音部分をスキップ
      instance.play().catch(() => {})
      return
    } catch (e) {
      // clone に失敗したらフォールバック
    }
  }

  // キャッシュがなければ通常再生
  const audio = new Audio(src)
  audio.currentTime = 0
  audio.play().catch(() => {})
}


const alertPoints = [60, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
let alerted = []

watch([minutes, seconds], () => {
  totalSeconds.value = minutes.value * 60 + seconds.value
  if (!running.value) remaining.value = totalSeconds.value
})

const display = computed(() => {
  const m = Math.floor(remaining.value / 60).toString().padStart(2, '0')
  const s = (remaining.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

function startTimer() {
  if (timer.value) clearInterval(timer.value)
  running.value = true
  remaining.value = totalSeconds.value
  alerted = []
  playSound(60) // ボタン押下時にcuckoo.mp3
  timer.value = setInterval(() => {
    if (remaining.value > 0) {
      remaining.value--
      if (alertPoints.includes(remaining.value) && !alerted.includes(remaining.value)) {
        playSound(remaining.value)
        alerted.push(remaining.value)
      }
    } else {
      if (!alerted.includes(0)) {
        playSound(0) // タイムアップ時
        alerted.push(0)
      }
      clearInterval(timer.value)
      running.value = false
    }
  }, 1000)
}

/** タイマーをリセットして停止 */
function resetStop() {
  if (timer.value) clearInterval(timer.value)
  running.value = false
  remaining.value = totalSeconds.value
}

/** ボタン押下時，タイマーを開始or値をリセットして再開 */
function onButtonClick() {
  startTimer()
}


</script>

<template>
  <v-app>
    <v-main>
      <v-app-bar app color="indigo" dark>
        <v-toolbar-title>Bodoge Timer</v-toolbar-title>
        <!-- <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon> -->
        <About />
      </v-app-bar>
      <v-navigation-drawer v-model="drawer" location="right">
        <div class="pa-4">
          <div class="font-weight-bold my-2">About</div>
          <div>
            中央のボタンを押してタイマー開始<br/>
            もう一度押すと時間リセットして再開<br/>
            30秒・20秒と10秒以下毎秒ボイス
          </div>
          <v-divider></v-divider>
          <div class="font-weight-bold my-2">Credit</div>
          <div>
            音声素材: <a href="https://ondoku3.com">音読さん</a>
          </div>
        </div>
      </v-navigation-drawer>
      <v-container class="fill-height d-flex flex-column justify-center align-center bg-grey-darken-4 ">
        <v-row class="mb-2" align="center" justify="center">
          <v-col cols="auto">
            <v-text-field
              v-model.number="minutes"
              label="Min"
              type="number"
              min="0"
              max="99"
              style="width: 80px"
            />
          </v-col>
          <v-col cols="auto">
            <v-text-field
              v-model.number="seconds"
              label="Sec"
              type="number"
              min="0"
              max="59"
              style="width: 80px"
            />
          </v-col>
        </v-row>
        <v-row align="center" justify="center">
          <v-col cols="12" class="text-center">
            <v-btn
              color="indigo"
              size="x-large"
              class="timer-btn"
              @click="onButtonClick"
            >
              {{ running ? 'Restart' : 'Start' }}
            </v-btn>
          </v-col>
        </v-row>
        <v-row align="center" justify="center">
          <v-col cols="auto" class="text-center">
            <v-btn class="bg-indigo-darken-2 text-white px-5" @click="resetStop">Reset</v-btn>
          </v-col>
        </v-row>
        <v-row align="center" justify="center">
          <v-col cols="12" class="text-center">
            <div class="timer-display">{{ display }}</div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.timer-display {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 2rem;
}
.timer-btn {
  width: 80vw;
  max-width: 360px;
  height: 80vw !important;
  max-height: 360px !important;
  font-size: 2rem;
}

</style>
