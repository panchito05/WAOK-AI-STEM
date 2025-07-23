/**
 * Data Migration Script: MathMinds → WAOK-AI-STEM
 * This script migrates user data from old localStorage keys to new ones
 */

export const migrateUserData = () => {
  console.log('🔄 Starting data migration from MathMinds to WAOK-AI-STEM...');
  
  const migrations = [
    { old: 'mathminds_practice_cards', new: 'waok_practice_cards' },
    { old: 'mathminds_preferences', new: 'waok_preferences' },
    { old: 'mathminds_exercise_pools', new: 'waok_exercise_pools' },
    { old: 'mathminds_practice_history', new: 'waok_practice_history' },
    { old: 'mathminds_achievements', new: 'waok_achievements' },
    { old: 'mathminds_multi_practice_session', new: 'waok_multi_practice_session' },
    { old: 'mathminds_profiles', new: 'waok_profiles' },
    { old: 'mathminds_active_profile', new: 'waok_active_profile' },
    { old: 'mathminds_search_filters', new: 'waok_search_filters' }
  ];

  let migratedCount = 0;

  migrations.forEach(({ old, new: newKey }) => {
    const data = localStorage.getItem(old);
    if (data) {
      // Check if new key already exists
      const existingData = localStorage.getItem(newKey);
      if (!existingData) {
        // Migrate data
        localStorage.setItem(newKey, data);
        console.log(`✅ Migrated: ${old} → ${newKey}`);
        migratedCount++;
        
        // Keep old data for 30 days as backup
        const backupKey = `${old}_backup_${Date.now()}`;
        localStorage.setItem(backupKey, data);
        
        // Remove original old key
        localStorage.removeItem(old);
      } else {
        console.log(`⚠️ Skipped ${old}: New key already exists`);
      }
    }
  });

  // Clean up old backups (older than 30 days)
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  Object.keys(localStorage).forEach(key => {
    if (key.includes('mathminds_') && key.includes('_backup_')) {
      const timestamp = parseInt(key.split('_backup_')[1]);
      if (timestamp < thirtyDaysAgo) {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed old backup: ${key}`);
      }
    }
  });

  console.log(`✨ Migration complete! Migrated ${migratedCount} keys.`);
  
  // Set migration flag
  localStorage.setItem('waok_migration_completed', new Date().toISOString());
  
  return migratedCount;
};

// Check if migration is needed
export const isMigrationNeeded = (): boolean => {
  const migrationCompleted = localStorage.getItem('waok_migration_completed');
  if (migrationCompleted) return false;
  
  // Check if any old keys exist
  const oldKeys = [
    'mathminds_practice_cards',
    'mathminds_preferences',
    'mathminds_exercise_pools',
    'mathminds_practice_history',
    'mathminds_achievements',
    'mathminds_multi_practice_session',
    'mathminds_profiles',
    'mathminds_active_profile',
    'mathminds_search_filters'
  ];
  
  return oldKeys.some(key => localStorage.getItem(key) !== null);
};