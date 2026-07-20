import {Adapter} from 'sanity-translations-tab'
import { ExtendedSecrets } from './extendedTypes'
import {getBaseURL, getLocalesHeaders} from './helpers'

export const getLocales: Adapter['getLocales'] = async (secrets: ExtendedSecrets | null) => {
  let locales: any = []
  const MAX_RETRIES = 5;
  const DELAY_MS = 1000;
  let retries = 0
  if (secrets) {
    // Get base URL
    const baseMotionPointUrl = getBaseURL(secrets);    
    
    const fetchData = async(): Promise<{enabled: boolean, description: string, localeId: string}[]> => {
      try{
          const response = await fetch(`${baseMotionPointUrl}/languages`, {
            headers: getLocalesHeaders(secrets),
          });

          if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const res = await response.json();
          locales = res.localeData.map((lang: Record<string, any>) => ({
            enabled: true,
            description: lang.targetLanguage.name,
            localeId: lang.targetLanguage.code,
          }));

          return locales;

      } catch(error){
        if (retries < MAX_RETRIES) {
          retries++;
          await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
          return await fetchData();
        } else {
          console.error('Failed to fetch data after retries:', error);
          throw error;
        }
      }
    }
    
    locales = await fetchData();
  } 

  return locales;
  
}
