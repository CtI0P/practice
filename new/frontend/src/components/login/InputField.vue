<template>
  <div class="form-group">
    <label :for="fieldId">{{ label }}</label>
    <input 
      :type="type" 
      :id="fieldId" 
      class="input-field" 
      :class="{ 'input-error': hasError }"
      :placeholder="placeholder"
      :value="value" 
      @input="$emit('input', $event.target.value)"  
      @focus="$emit('focus')"
    >
    <div class="error-message" :class="{show: hasError}">{{ errorMessage }}</div>
  </div>
</template>

<script>
export default {
  name: 'InputField',
  props: {
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    value: {  // Vue 2 使用 value 而不是 modelValue
      type: String,
      default: ''
    },
    hasError: {
      type: Boolean,
      default: false
    },
    errorMessage: {
      type: String,
      default: ''
    }
  },
  emits: ['input', 'focus'],  // Vue 2 使用 input 事件
  computed: {
    fieldId() {
      return `field-${this.label.replace(/\s+/g, '-').toLowerCase()}`;
    }
  }
}
</script>

<style scoped>
.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.input-field {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  transition: all 0.3s;
}

.input-field:focus {
  border-color: #4776E6;
  box-shadow: 0 0 0 2px rgba(71, 118, 230, 0.2);
  outline: none;
}

/* 添加错误状态样式 */
.input-field.input-error {
  border-color: #e74c3c;
}

.input-field.input-error:focus {
  border-color: #e74c3c;
  box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  margin-top: 5px;
  display: none;
}

.error-message.show {
  display: block;
}
</style>