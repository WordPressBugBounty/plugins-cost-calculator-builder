<template>
  <label>
    <input class="toggle-checkbox" type="checkbox" v-model="theme" />
    <div class="toggle-slot">
      <div class="sun-icon-wrapper">
        <svg
          version="1.1"
          class="sun-icon"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          viewBox="0 0 32 32"
        >
          <path
            class="one"
            d="M16,26c1.1,0,2,0.9,2,2v2c0,1.1-0.9,2-2,2s-2-0.9-2-2v-2C14,26.9,14.9,26,16,26z"
          />
          <path
            class="one"
            d="M16,6c-1.1,0-2-0.9-2-2V2c0-1.1,0.9-2,2-2s2,0.9,2,2v2C18,5.1,17.1,6,16,6z"
          />
          <path
            class="one"
            d="M30,14c1.1,0,2,0.9,2,2s-0.9,2-2,2h-2c-1.1,0-2-0.9-2-2s0.9-2,2-2H30z"
          />
          <path
            class="one"
            d="M6,16 c0,1.1-0.9,2-2,2H2c-1.1,0-2-0.9-2-2s0.9-2,2-2h2C5.1,14,6,14.9,6,16z"
          />
          <path
            class="two"
            d="M25.9,23.1l1.4,1.4c0.8,0.8,0.8,2,0,2.8s-2,0.8-2.8,0l-1.4-1.4c-0.8-0.8-0.8-2,0-2.8S25.1,22.3,25.9,23.1z"
          />
          <path
            class="two"
            d=" M6.1,8.9L4.7,7.5c-0.8-0.8-0.8-2,0-2.8s2-0.8,2.8,0l1.4,1.4c0.8,0.8,0.8,2,0,2.8S6.9,9.7,6.1,8.9z"
          />
          <path
            class="two"
            d="M25.9,8.9c-0.8,0.8-2,0.8-2.8,0s-0.8-2,0-2.8l1.4-1.4c0.8-0.8,2-0.8,2.8,0s0.8,2,0,2.8L25.9,8.9z"
          />
          <path
            class="two"
            d="M6.1,23.1c0.8-0.8,2-0.8,2.8,0s0.8,2,0,2.8l-1.4,1.4c-0.8,0.8-2,0.8-2.8,0s-0.8-2,0-2.8C4.7,24.5,6.1,23.1,6.1,23.1z"
          />
          <path
            class="middle"
            d="M16,8c-4.4,0-8,3.6-8,8s3.6,8,8,8s8-3.6,8-8S20.4,8,16,8z M16,21c-2.8,0-5-2.2-5-5s2.2-5,5-5s5,2.2,5,5
            S18.8,21,16,21z"
          />
        </svg>
      </div>
      <div class="toggle-button"></div>
      <div class="moon-icon-wrapper">
        <svg
          version="1.1"
          class="moon-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 768 768"
        >
          <g id="icomoon-ignore"></g>
          <path
            fill="#fff"
            d="M703.872 412.224c0.704-7.456-1.216-15.232-6.016-21.792-10.4-14.272-30.432-17.408-44.704-7.008-30.4 22.176-65.92 34.752-102.016 37.184-43.776 2.944-88.48-9.056-126.4-37.056-42.656-31.52-68.448-77.28-75.744-125.92s3.968-99.968 35.488-142.592c4.544-6.112 6.912-13.92 6.112-22.112-1.696-17.6-17.344-30.464-34.944-28.736-72.256 7.040-138.048 37.76-188.64 84.832-55.552 51.68-92.864 123.104-100.384 204.352-8.128 87.968 20.192 170.976 72.512 233.952s128.704 106.016 216.704 114.144 170.976-20.192 233.952-72.512 106.016-128.704 114.144-216.704zM626.144 469.568c-15.68 43.616-42.72 81.376-77.312 110.112-50.432 41.888-116.736 64.512-187.136 58.016s-131.456-40.896-173.344-91.328-64.512-116.736-58.016-187.136c5.984-65.024 35.744-122.048 80.224-163.392 25.024-23.296 54.72-41.6 87.392-53.504-14.592 40.448-18.464 83.392-12.288 124.768 9.696 64.736 44.16 125.888 100.992 167.904 50.496 37.344 110.336 53.376 168.704 49.44 24.064-1.6 47.872-6.624 70.72-14.88z"
          ></path>
        </svg>
      </div>
    </div>
  </label>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const theme = ref<boolean>(false);

const toggleDarkTheme = (): void => {
  if (theme.value) {
    document.documentElement.setAttribute("ccb-theme", "dark");
  } else {
    document.documentElement.removeAttribute("ccb-theme");
  }
};

try {
  const stored = localStorage.getItem("ccb-theme");
  theme.value = stored === "dark";
} catch {
  theme.value = false;
}

toggleDarkTheme();

watch(
  theme,
  (isDark: boolean) => {
    toggleDarkTheme();
    try {
      localStorage.setItem("ccb-theme", isDark ? "dark" : "light");
    } catch {
      console.error("Error saving theme to localStorage");
    }
  },
  { flush: "post" },
);
</script>

<style scoped lang="scss">
.ccb-theme-toggle {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
}

.toggle-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.toggle-slot {
  position: relative;
  height: 24px;
  width: 45px;
  border: 1px solid #e4e7ec;
  border-radius: 10em;
  background-color: white;
  box-shadow: 0px 0px 10px #e4e7ec;
  transition: background-color 250ms;
  cursor: pointer;
}

.toggle-checkbox:checked ~ .toggle-slot {
  background-color: #374151;
}

.toggle-button {
  transform: translate(23px, 3px);
  position: absolute;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background-color: #ffeccf;
  box-shadow: inset 0px 0px 0px 1.8px #ffbb52;
  transition:
    background-color 250ms,
    border-color 250ms,
    transform 500ms cubic-bezier(0.26, 2, 0.46, 0.71);
}

.toggle-checkbox:checked ~ .toggle-slot .toggle-button {
  background-color: #485367;
  box-shadow: inset 0px 0px 0px 1.8px white;
  transform: translate(3px, 3px);
}

.sun-icon {
  position: absolute;
  height: 16px;
  width: 16px;
  fill: #ffbb52;
}

.sun-icon-wrapper {
  position: absolute;
  height: 16px;
  width: 16px;
  opacity: 1;
  transform: translate(3px, 3px) rotate(15deg);
  transform-origin: 50% 50%;
  transition:
    opacity 150ms,
    transform 500ms cubic-bezier(0.26, 2, 0.46, 0.71);
}

.toggle-checkbox:checked ~ .toggle-slot .sun-icon-wrapper {
  opacity: 0;
  transform: translate(23px, 3px) rotate(0deg);
}

.moon-icon {
  position: absolute;
  height: 16px;
  width: 16px;
  font-size: 6em;
  color: white;
}

.moon-icon-wrapper {
  position: absolute;
  height: 16px;
  width: 16px;
  opacity: 0;
  transform: translate(3px, 3px) rotate(0deg);
  transform-origin: 50% 50%;
  transition:
    opacity 150ms,
    transform 500ms cubic-bezier(0.26, 2.5, 0.46, 0.71);
}

.toggle-checkbox:checked ~ .toggle-slot .moon-icon-wrapper {
  opacity: 1;
  transform: translate(23px, 3px) rotate(-15deg);
}
</style>
