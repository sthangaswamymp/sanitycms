import { Adapter } from 'sanity-translations-tab';
import { ExtendedSecrets } from './extendedTypes';
import {getBaseURL, getTranslationTaskHeaders} from './helpers'
import {getLocales} from './getLocales'

const fetchJobStats = async (
  jobId: string,
  locale: string,
  secrets: ExtendedSecrets | null,
  baseURL: string
) => {
  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const response = await fetch(`${baseURL}/translationjobstats/jobs/${jobId}`, {
        method: 'POST',
        headers: getTranslationTaskHeaders(secrets, locale),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Stats API error (${response.status}):`, errorText);

        if (response.status === 500 && retries < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          retries++;
          continue;
        }
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (retries < MAX_RETRIES - 1) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        throw error;
      }
    }
  }
};

export const getTranslationTask: Adapter['getTranslationTask'] = async (
  documentId: string,  
  secrets: ExtendedSecrets | null   
  ) => {    
    try {
      // Get base URL
      const baseMotionPointUrl = getBaseURL(secrets);

      // Function ran on page load with the Document ID
      if(documentId.match(/[a-z-]+/)){
        // Get locales
        const locales = await getLocales(secrets);

        // Get the job ids and progress per each locale and store them in a JSON object
        const jobIds: {[key: string]: string} = {};
        const returnLocales = [];
        const requestBody = {
          "statuses": [
            "COMPLETED",
            "QUEUED",
            "ON HOLD",
            "APPROVED",
            "REJECTED",
            "CANCELLED",
            "INVALID CONTENT"
          ],
          "transactionReferenceIds": ["sanity-" + documentId]
        }
        for(let i=0; i<locales.length; i++){
          try{
            let currentLocale = locales[i].localeId;

            // Get job ids
            const response = await fetch(`${baseMotionPointUrl}/translationjobs/list?page=0&size=1000&sort=id,desc`, {
              method: 'POST',
              headers: getTranslationTaskHeaders(secrets, currentLocale),
              body: JSON.stringify(requestBody),
            })

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Only run if there are existing job(s)
            if(data.content.length>0){
              // Get Translation job ID
              const currentTranslationJob = data.content[0];
              const currentJobId = (currentTranslationJob.id).toString();
              jobIds[currentLocale] = currentJobId
  
              // Get progress with retry logic
              let stats = await fetchJobStats(currentJobId, currentLocale, secrets, baseMotionPointUrl);

              if (stats) {

                // Use percentageTextTranslated directly
                const currentProgress = stats.translationStatistics?.percentageTextTranslated !== undefined
                  ? Math.floor(stats.translationStatistics.percentageTextTranslated)
                  : 0;


                returnLocales[i] = {
                  localeId: currentLocale,
                  progress: currentProgress,
                }
              }
            } 
          } catch (error){
            throw(error);
          } 
        }

        // If no jobs were found for any language, return a default empty locales object
        if(returnLocales.length == 0) {
          returnLocales[0] = {
            localeId: '',
            progress: 0,
          }
        }


        // Build link to first job in MotionPoint Control Center
        let vendorLink = "https://control.motionpoint.com/controlcenter#!/login";
        if (Object.keys(jobIds).length > 0) {
          const firstJobId = Object.values(jobIds)[0];
          vendorLink = `https://control.motionpoint.com/controlcenter#!/translationjob/view/${firstJobId}`;
        }

        // Return required object to pass to importTranslation
        const result = {
          taskId: JSON.stringify(jobIds),
          documentId: documentId,
          locales: returnLocales,
          linkToVendorTask: vendorLink,
        };

        return result;              
      
        // Function ran from createTask.ts to generate valid return object
        // Prop received is of type {"JA":"1959","ES":"1958"}
      } else {
        // Convert locale/jobId string to JSON object
        let jobIds;
        try {
          jobIds = JSON.parse(documentId);
          if (typeof jobIds !== 'object' || Array.isArray(jobIds)) {
            throw new Error('Task ID must be a JSON object, not array or primitive');
          }
          // Validate all values are strings (job IDs)
          Object.entries(jobIds).forEach(([key, value]) => {
            if (typeof value !== 'string') {
              throw new Error(`Invalid job ID for locale ${key}: expected string, got ${typeof value}`);
            }
          });
        } catch (error) {
          throw new Error(`Invalid task ID format: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        const returnLocales = [];
        let i = 0;
        
        for(let key in jobIds){
          if(jobIds.hasOwnProperty(key) && jobIds[key]){
            const jobId = String(jobIds[key]);
            const stats = await fetchJobStats(jobId, key, secrets, baseMotionPointUrl);

            if (stats) {

              // Use percentageTextTranslated directly
              const currentProgress = stats.translationStatistics?.percentageTextTranslated !== undefined
                ? Math.floor(stats.translationStatistics.percentageTextTranslated)
                : 0;


              returnLocales[i] = {
                localeId: key,
                progress: currentProgress,
              }
            }
            i++;
          }
        }

        // Return required object to pass to createTask.ts

        // Build link to first job in MotionPoint Control Center
        let vendorLink = "https://control.motionpoint.com/controlcenter#!/login";
        if (Object.keys(jobIds).length > 0) {
          const firstJobId = Object.values(jobIds)[0];
          vendorLink = `https://control.motionpoint.com/controlcenter#!/translationjob/view/${firstJobId}`;
        }

        const result = {
          taskId: JSON.stringify(jobIds),
          documentId: documentId,
          locales: returnLocales,
          linkToVendorTask: vendorLink,
        };

        return result; 
      }
      
      } catch (error) {
    console.error('Error fetching translation task:', error)
    throw error
  }
}


