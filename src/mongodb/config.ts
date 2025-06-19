import { MongoConnectionConfig } from '../types/index.js';

export function parseConnectionString(uri: string): MongoConnectionConfig {
  try {
    const url = new URL(uri);
    
    const config: MongoConnectionConfig = {
      uri,
      database: url.pathname.substring(1) || undefined,
      options: {},
    };

    url.searchParams.forEach((value, key) => {
      if (config.options) {
        switch (key) {
          case 'maxPoolSize':
          case 'minPoolSize':
          case 'maxIdleTimeMS':
          case 'serverSelectionTimeoutMS':
          case 'socketTimeoutMS':
            config.options[key] = parseInt(value, 10);
            break;
          case 'ssl':
          case 'tls':
            config.options[key] = value === 'true';
            break;
          default:
            config.options[key] = value;
        }
      }
    });

    return config;
  } catch (error) {
    throw new Error(`Invalid MongoDB connection string: ${error}`);
  }
}

export function getConnectionConfig(): MongoConnectionConfig {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  return parseConnectionString(uri);
}

export function validateConnectionConfig(config: MongoConnectionConfig): void {
  if (!config.uri) {
    throw new Error('MongoDB URI is required');
  }

  if (!config.uri.startsWith('mongodb://') && !config.uri.startsWith('mongodb+srv://')) {
    throw new Error('Invalid MongoDB URI format');
  }

  if (config.options) {
    if (config.options.maxPoolSize && config.options.maxPoolSize < 1) {
      throw new Error('maxPoolSize must be at least 1');
    }
    
    if (config.options.minPoolSize && config.options.minPoolSize < 0) {
      throw new Error('minPoolSize cannot be negative');
    }
    
    if (config.options.maxPoolSize && config.options.minPoolSize && 
        config.options.maxPoolSize < config.options.minPoolSize) {
      throw new Error('maxPoolSize must be greater than or equal to minPoolSize');
    }
  }
}