import {ExtendedSecrets} from './extendedTypes'

const DEVELOPMENT_URL = 'https://api.dev.motionpoint.com';
const PRODUCTION_URL = 'https://api.motionpoint.com';

export const getBaseURL = (secrets: ExtendedSecrets | null): string => {
  if (secrets?.proxy_url) {
    return secrets.proxy_url.replace(/\/$/, '')
  }
  if (secrets?.dev_mode) {
    return DEVELOPMENT_URL;
  }
  return PRODUCTION_URL;
}

export const getLocalesHeaders = (secrets: ExtendedSecrets | null): Record<string, string> => {
  if (!secrets?.api_token || !secrets?.username || !secrets?.project_id) {
    throw new Error('Missing required MotionPoint credentials: api_token, username, or project_id');
  }
  return {
    Authorization: secrets.api_token,
    'X-MotionCore-UserName': secrets.username,
    'X-MotionCore-ApiId': secrets.project_id,
    'Content-Type': 'application/json',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
}

export const getTranslationTaskHeaders = (secrets: ExtendedSecrets | null, targetLanguage: string): Record<string, string> => {
  if (!secrets?.api_token || !secrets?.username || !secrets?.base_language || !secrets?.project_id) {
    throw new Error('Missing required MotionPoint credentials: api_token, username, base_language, or project_id');
  }
  return {
    Authorization: secrets.api_token,
    'X-MotionCore-UserName': secrets.username,
    'X-MotionCore-Queue': `${secrets.base_language}.${targetLanguage}.${secrets.project_id}`,
    'Content-Type': 'application/json',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
}

export const getCreateTaskHeaders = (secrets: ExtendedSecrets | null, targetLanguage: string, transactionReferenceId: string): Record<string, string> => {
  if (!secrets?.api_token || !secrets?.username || !secrets?.base_language || !secrets?.project_id) {
    throw new Error('Missing required MotionPoint credentials: api_token, username, base_language, or project_id');
  }
  return {
    Authorization: secrets.api_token,
    'X-MotionCore-UserName': secrets.username,
    'X-MotionCore-Queue': `${secrets.base_language}.${targetLanguage}.${secrets.project_id}`,
    'Pragma': 'no-cache',
    'Expires': '0',
  };
}

export const getTranslationHeaders = (secrets: ExtendedSecrets | null, targetLanguage: string): Record<string,string> => {
  if (!secrets?.api_token || !secrets?.username || !secrets?.base_language || !secrets?.project_id) {
    throw new Error('Missing required MotionPoint credentials: api_token, username, base_language, or project_id');
  }
  return {
    Authorization: secrets.api_token,
    'X-MotionCore-UserName': secrets.username,
    'X-MotionCore-Queue': `${secrets.base_language}.${targetLanguage}.${secrets.project_id}`,
    'Pragma': 'no-cache',
    'Expires': '0',
  };
}



