import type { UserSettings } from './settings'
import type { RecentDetection } from './domain'

export interface StorageSchema {
  settings: UserSettings
  recentDetections: RecentDetection[]
}

export type StorageKey = keyof StorageSchema
