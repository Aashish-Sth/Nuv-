<script setup lang="ts">
useHead({
  title: "Contact — Nuvé",
  meta: [{ name: "description", content: "Get in touch with the Nuvé team." }],
});

const form = reactive({ name: "", email: "", subject: "", message: "" });
const submitted = ref(false);

function handleSubmit() {
  submitted.value = true;
}

const contactInfo = [
  { label: "Email", value: "hello@nuve.kitchen", icon: "mail" },
  { label: "Phone", value: "+1 (555) 234-5678", icon: "phone" },
  { label: "Location", value: "San Francisco, CA", icon: "pin" },
];
</script>

<template>
  <div class="pt-24 pb-16">
    <div class="nv-container">
      <div class="max-w-2xl mb-12">
        <span
          class="text-nv-green text-sm font-medium tracking-wider uppercase mb-3 block"
          >Get In Touch</span
        >
        <h1 class="nv-heading text-4xl sm:text-5xl mb-4">
          Let's <em class="text-nv-green italic">talk</em>
        </h1>
        <p class="text-nv-muted text-base">
          Have a question, want to partner with us, or just want to say hello?
          We'd love to hear from you.
        </p>
      </div>

      <div class="grid lg:grid-cols-5 gap-12">
        <!-- Form -->
        <div class="lg:col-span-3">
          <div v-if="!submitted" class="space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label for="name" class="block text-sm text-nv-muted mb-2"
                  >Name</label
                >
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  class="w-full bg-nv-surface border border-nv-border rounded-[10px] px-4 py-3 text-sm text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50 transition-colors duration-300"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label for="email" class="block text-sm text-nv-muted mb-2"
                  >Email</label
                >
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  class="w-full bg-nv-surface border border-nv-border rounded-[10px] px-4 py-3 text-sm text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50 transition-colors duration-300"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label for="subject" class="block text-sm text-nv-muted mb-2"
                >Subject</label
              >
              <input
                id="subject"
                v-model="form.subject"
                type="text"
                class="w-full bg-nv-surface border border-nv-border rounded-[10px] px-4 py-3 text-sm text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50 transition-colors duration-300"
                placeholder="What's this about?"
              />
            </div>
            <div>
              <label for="message" class="block text-sm text-nv-muted mb-2"
                >Message</label
              >
              <textarea
                id="message"
                v-model="form.message"
                rows="5"
                class="w-full bg-nv-surface border border-nv-border rounded-[10px] px-4 py-3 text-sm text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50 transition-colors duration-300 resize-none"
                placeholder="Your message…"
              ></textarea>
            </div>
            <button
              class="bg-nv-green hover:bg-nv-green-dk text-nv-void font-semibold text-sm px-8 py-3.5 rounded-[10px] transition-all duration-300 active:scale-[0.97]"
              @click="handleSubmit"
            >
              Send Message
            </button>
          </div>

          <!-- Success -->
          <div
            v-else
            class="bg-nv-surface border border-nv-green/30 rounded-[12px] p-10 text-center"
          >
            <div
              class="w-14 h-14 mx-auto mb-4 bg-nv-green/15 rounded-full flex items-center justify-center"
            >
              <svg
                class="w-7 h-7 text-nv-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h3 class="font-display text-xl text-nv-text mb-2">Message Sent</h3>
            <p class="text-sm text-nv-muted">
              Thanks for reaching out. We'll get back to you shortly.
            </p>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          <div
            v-for="info in contactInfo"
            :key="info.label"
            class="bg-nv-surface border border-nv-border rounded-[12px] p-6"
          >
            <p class="text-xs text-nv-dim uppercase tracking-wider mb-2">
              {{ info.label }}
            </p>
            <p class="text-nv-text font-medium">{{ info.value }}</p>
          </div>
          <div class="bg-nv-surface border border-nv-border rounded-[12px] p-6">
            <p class="text-xs text-nv-dim uppercase tracking-wider mb-2">
              Business Hours
            </p>
            <p class="text-nv-text font-medium">Mon – Fri: 9am – 6pm</p>
            <p class="text-sm text-nv-muted mt-1">Weekend support available</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
