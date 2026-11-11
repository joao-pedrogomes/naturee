import type { Env } from './env'

export const SETTING_KEYS = ['leadNotifyEmail', 'emailEnabled'] as const
export type SettingKey = (typeof SETTING_KEYS)[number]

export async function getSetting(env: Env, key: SettingKey): Promise<string | undefined> {
  const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?1').bind(key).first<{ value: string }>()
  return row?.value
}

export async function setSetting(env: Env, key: string, value: string): Promise<void> {
  await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = ?2')
    .bind(key, value)
    .run()
}
