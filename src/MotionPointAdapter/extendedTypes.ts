import {Secrets} from 'sanity-translations-tab';

export type ExtendedSecrets = Secrets & {
  project_id?: string  
  api_token?: string 
  base_language?: string
  sanity_project_id?: string
  sanity_dataset?: string
  sanity_api_key?: string
  dev_mode?: boolean
  callBack_url?: string
  proxy_url?: string
};
