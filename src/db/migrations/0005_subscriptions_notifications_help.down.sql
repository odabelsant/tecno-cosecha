-- Reversión de Migración 0005
DROP INDEX IF EXISTS idx_help_tutorials_category;
DROP TABLE IF EXISTS help_tutorials;

DROP INDEX IF EXISTS idx_notifications_dedup;
DROP INDEX IF EXISTS idx_notifications_read;
DROP INDEX IF EXISTS idx_notifications_user;
DROP TABLE IF EXISTS notifications;

DROP INDEX IF EXISTS idx_user_subscriptions_tier;
DROP INDEX IF EXISTS idx_user_subscriptions_user;
DROP TABLE IF EXISTS user_subscriptions;
