export type Inbox = { fresh: number; needsYou: number }

declare module 'claude-code' {
  interface PluginState {
    'inbox-band': { inbox: Inbox }
  }
}
