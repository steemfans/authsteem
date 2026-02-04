<template>
  <pre class="mt-2 d-inline-block">{{ $filters.pretty(value) }}</pre>
</template>

<script>
export default {
  props: ['value'],
};
</script>
