-- OAuth Tokens Table for storing encrypted user tokens
CREATE TABLE IF NOT EXISTS social_media_connections (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  account_id VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  email VARCHAR(255),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at BIGINT,
  followers_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  last_refreshed_at BIGINT,
  connected_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  UNIQUE KEY unique_user_platform (user_id, platform),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_platform (platform),
  INDEX idx_expires_at (token_expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- OAuth State Table for CSRF protection
CREATE TABLE IF NOT EXISTS oauth_states (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  state_token VARCHAR(255) NOT NULL UNIQUE,
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_state_token (state_token),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
