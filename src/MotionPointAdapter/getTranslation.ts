import { Adapter } from 'sanity-translations-tab'
import { ExtendedSecrets } from './extendedTypes'
import { getBaseURL, getTranslationHeaders } from './helpers'

export const getTranslation: Adapter['getTranslation'] = async (
    taskId: string,
    localeId: string,
    secrets: ExtendedSecrets | null
) => {
  try {      
    // Get base URL
    const baseMotionPointUrl = getBaseURL(secrets);
    
    const taskIdObj = JSON.parse(taskId);    
    const jobId = taskIdObj[localeId];    

    const response = await fetch(`${baseMotionPointUrl}/translations/jobs/${jobId}`, {
      method: 'POST',
      headers: getTranslationHeaders(secrets, localeId),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const taskData = await response.text();

    const result = {
      translation: taskData,
      targetLanguage: localeId,
      secrets: secrets
    }

    return result;

  } catch (error) {
    console.error('Error fetching translation task:', error)
    throw error
  }
}
