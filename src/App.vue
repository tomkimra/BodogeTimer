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

const soundMap = {
  60: './sound/sound_1min.mp3',
  30: './sound/sound_30.mp3',
  20: './sound/sound_20.mp3',
  10: './sound/sound_10.mp3',
  9: './sound/sound_9.mp3',
  8: './sound/sound_8.mp3',
  7: './sound/sound_7.mp3',
  6: './sound/sound_6.mp3',
  5: './sound/sound_5.mp3',
  4: './sound/sound_4.mp3',
  3: './sound/sound_3.mp3',
  2: './sound/sound_2.mp3',
  1: './sound/sound_1.mp3',
  0: './sound/start.mp3',
}

// Howlerを使った実装
import {Howl, Howler} from 'howler';
const audioCache = {}

// サウンドのバリアント（'A' または 'B'）
const soundVariant = ref('A')

function buildPath(key, variant){
  const base = soundMap[key]
  if (variant === 'B') return base.replace(/\.mp3$/, 'B.mp3')
  return base
}

function preloadAllSounds(variant = 'A') {
  Object.keys(soundMap).forEach((key) => {
    const path = buildPath(key, variant)
    const sound = new Howl({
      src: [path],
      preload: true,
    });
    audioCache[`${variant}_${key}`] = sound;
  });
}

onMounted(() => {
  preloadAllSounds(soundVariant.value)
})

watch(soundVariant, (v) => {
  preloadAllSounds(v)
})

function playSound(sec){ 
  const key = String(sec)
  const variant = soundVariant.value
  const cached = audioCache[`${variant}_${key}`]
  if (cached) {
    cached.play()
    return
  }
  // 万一キャッシュがなければ遅延ロードして再生
  const path = buildPath(key, variant)
  const s = new Howl({ src: [path] })
  audioCache[`${variant}_${key}`] = s
  s.play()
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
  playSound(0) // ボタン押下時に1分音声（variantに依存）
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
        <About v-model:soundVariant="soundVariant" />
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
      <v-container class="fill-height d-flex flex-column justify-center align-center bg-grey-darken-4 container">
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
          <v-col cols="12" class="text-center btn-col">
            <v-btn
              color="primary"
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
  width: 40vh;
  max-width: 360px;
  height: 40vh !important;
  max-height: 360px !important;
  font-size: 2rem;
}
.btn-col {
  margin-top: -2rem;
}
.container {
  padding-bottom: 50px;
}

</style>
