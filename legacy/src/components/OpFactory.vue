<template>
  <div style="margin-top: 16px;">
    <div v-for="(schemaDetail, schemaName) in opDetail.schema" :key="schemaName">
      <label :for="schemaName">{{ schemaName }}</label>
      <template v-if="schemaDetail.type && schemaDetail.type === 'json'">
        <textarea
          v-model="opData[schemaName]"
          class="form-control input-lg input-block mb-4"
          rows="6"
        />
      </template>
      <template v-if="schemaDetail.type && inputDataType.indexOf(schemaDetail.type) !== -1">
        <input
          v-model="opData[schemaName]"
          type="text"
          class="form-control input-lg input-block mb-4"
        />
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: ['opDetail', 'onUpdate'],
  data() {
    return {
      inputDataType: [
        'string',
        'account',
        'amount',
        'int',
        'bool', // TODO
        'array', // TODO
        'time', // TODO
        'object', // TODO
      ],
      opData: {},
    };
  },
  beforeMount() {
    this.buildOpData(this.opDetail);
  },
  methods: {
    buildOpData(detail) {
      const data = {};
      Object.keys(detail.schema).forEach(op => {
        data[op] = null;
      });
      this.opData = data;
    },
  },
  watch: {
    opDetail(newDetail) {
      this.buildOpData(newDetail);
    },
    opData(newData) {
      this.onUpdate(newData);
    },
  },
};
</script>
