import BackgroundAgentsPlugin from "./plugin/background-agents.js"

const plugin = {
  id: "@chenxuan520/opencode-background-agents",
  server: async (input: Parameters<typeof BackgroundAgentsPlugin>[0]) => BackgroundAgentsPlugin(input),
}

export default plugin
