<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";

defineProps<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}>();
</script>

<template>
  <TransitionRoot :show="open" as="template">
    <Dialog as="div" class="relative z-50" @close="onCancel">
      <TransitionChild
        as="template"
        enter="ease-out duration-200"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-150"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25 backdrop-blur-sm" />
      </TransitionChild>
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <TransitionChild
          as="template"
          enter="ease-out duration-200"
          enter-from="opacity-0 translate-y-2"
          enter-to="opacity-100 translate-y-0"
          leave="ease-in duration-150"
          leave-from="opacity-100 translate-y-0"
          leave-to="opacity-0 translate-y-2"
        >
          <DialogPanel class="w-full max-w-md rounded-lg border border-admin-border bg-white p-6">
            <DialogTitle class="text-lg font-semibold text-admin-text">{{ title }}</DialogTitle>
            <p class="mt-2 text-sm text-admin-muted">{{ message }}</p>
            <div class="mt-6 flex justify-end gap-3">
              <button class="px-4 py-2 rounded-md border border-admin-border text-sm" @click="onCancel">Cancel</button>
              <button
                class="px-4 py-2 rounded-md text-sm text-white"
                :class="confirmVariant === 'danger' ? 'bg-admin-red' : 'bg-nv-green'"
                @click="onConfirm"
              >
                {{ confirmLabel }}
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
