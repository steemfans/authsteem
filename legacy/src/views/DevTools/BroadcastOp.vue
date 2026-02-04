<template>
  <div>
    <Header title="Broadcast Op Test" />
    <div class="p-4 after-header">
      <div class="container-sm mx-auto mb-4">
        <p class="mb-4">
          This is an online dev tools to test broadcast op quickly.
        </p>
        <form @submit.prevent="submitForm" method="post" class="text-left">
          <select v-model="op" class="form-select input-lg input-block mb-2">
            <option disabled value="">Select OP</option>
            <option v-for="op in ops" :key="op" :value="op">{{ op }}</option>
          </select>
          <OpFactory
            v-if="displayDetail"
            :opDetail="operations[op]"
            :onUpdate="onUpdate"
          />
          <div style="margin: 2px 0;">&nbsp;</div>
          <button
            v-if="displayDetail"
            :disabled="submitDisabled || isLoading"
            type="submit"
            class="btn btn-large btn-blue input-block mb-2"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { encodeOps } from 'steem-uri';
import operations from '@/helpers/operations.json';
import pkg from '@/../package.json';

export default {
  data() {
    return {
      op: null,
      isLoading: false,
      submitDisabled: false,
      ops: Object.keys(operations),
      operations,
      displayDetail: false,
      finalData: {},
    };
  },
  watch: {
    op() {
      this.displayDetail = true;
    },
  },
  methods: {
    onUpdate(data) {
      this.finalData = data;
    },
    submitForm() {
      // remove empty fields
      const opDetail = {};
      Object.keys(this.finalData).forEach(op => {
        if (this.finalData[op]) {
          opDetail[op] = this.finalData[op];
        }
      });
      // new ops
      const ops = [[
        this.op,
        opDetail,
      ]];
      // encode by steemuri
      const data = encodeOps(ops).replace('steem://', '');
      window.open(`${pkg.homepage}/${data}`);
    },
  },
};
</script>
