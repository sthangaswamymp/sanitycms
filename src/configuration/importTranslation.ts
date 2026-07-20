import {ImportTranslation} from 'sanity-translations-tab'
import { getBaseURL } from '../MotionPointAdapter/helpers';

// Sanity API version - must be semantic (v1, v2) or ISO date (v2024-01-01)
// NOT a dynamic calendar date
const SANITY_API_VERSION = 'v2024-01-01';

export const newImportTranslation: ImportTranslation = async (
  documentId: string,
  localeId: string,
  translatedFields: any,
  context
) => { 
  // Get MotionPoint base URL
  const baseMotionPointUrl = getBaseURL(translatedFields.secrets);  
  
  const payload = JSON.parse(translatedFields.translation);
  const targetLanguage = translatedFields.targetLanguage;
  const sanity_api_key = translatedFields.secrets.sanity_api_key;
  const projectId = translatedFields.secrets.sanity_project_id;
  const dataset = translatedFields.secrets.sanity_dataset;
  
  const updatedPayload = {
    ...payload,
    _id: payload._id + "__i18n_" + targetLanguage.toUpperCase(),
    __i18n_lang: targetLanguage.toUpperCase(),
    language: targetLanguage.toLowerCase()
  }
  
  const mutations = [{
    createOrReplace: updatedPayload
  }]  
  
  const config = {
    headers: {
          Authorization: `Bearer ${sanity_api_key}`,
          "Content-Type": "application/json"
      }
  }
  
  // Push content to Sanity
  try {
    const response = await fetch(`https://${projectId}.api.sanity.io/${SANITY_API_VERSION}/data/mutate/${dataset}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sanity_api_key}`,
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ mutations })
    })    

    // TODO: Update MotionCore job status to APPROVED

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
} catch (error) {        
    console.error("Error while exporting translation:", (error as Error).message);
    return { failedExport: true, message: `Error while exporting translation: ${(error as Error).message}` };
}    
  
}
