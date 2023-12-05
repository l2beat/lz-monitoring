import { ChangelogApiEntry, ChangelogCategory } from '@lz/libs'
import { useEffect, useState } from 'react'

export type Category = ChangelogCategory | 'ALL'

export const categories: Record<Category, string> = {
  CONTRACT_ADDED: 'Contract added',
  REMOTE_CHANGED: 'Remote config changed',
  REMOTE_ADDED: 'Remote config added',
  OTHER: 'Other',
  ALL: 'All',
}

// returns only the changes that match the selected category
export function useChangelogCategories(
  changelogPerDay: Map<number, ChangelogApiEntry[]>,
) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('ALL')
  const [filteredChangelog, setFilteredChangelog] = useState<
    Map<number, ChangelogApiEntry[]>
  >(new Map())

  useEffect(() => {
    if (selectedCategory === 'ALL') {
      setFilteredChangelog(changelogPerDay)
      return
    }

    const filtered = new Map<number, ChangelogApiEntry[]>()
    for (const [day, entries] of changelogPerDay) {
      for (const entry of entries) {
        const filteredChanges = entry.changes.filter(
          (change) => change.category === selectedCategory,
        )
        if (filteredChanges.length > 0) {
          const filteredEntry = {
            ...entry,
            changes: filteredChanges,
          }
          const filteredEntries = filtered.get(day)
          if (!filteredEntries) {
            filtered.set(day, [filteredEntry])
            continue
          }
          filteredEntries.push(filteredEntry)
        }
      }
    }
    setFilteredChangelog(filtered)
  }, [changelogPerDay, selectedCategory])

  return [filteredChangelog, selectedCategory, setSelectedCategory] as const
}
