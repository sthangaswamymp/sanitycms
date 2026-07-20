import {Adapter} from 'sanity-translations-tab'
import {getBaseURL, getCreateTaskHeaders} from './helpers'
import {getTranslationTask} from './getTranslationTask'
import { ExtendedSecrets } from './extendedTypes'


export const createTask: Adapter['createTask'] = async (
    documentId: string,
    document: Record<string, any>,
    localeIds: string[],
    secrets: ExtendedSecrets | null,
    workflowUid?: string
  ) => {      
        // Get base URL
        const baseMotionPointUrl = getBaseURL(secrets);
           
        // Extract text from Sanity document
        const doc = document.content || document;

        // Extract text from body blocks and images
        let bodyText = '';
        let imagesHTML = '';

        if (doc.body && Array.isArray(doc.body)) {
            const bodyContent = doc.body.map((block: any) => {
                if (block._type === 'block') {
                    // Extract text from block children
                    return block.children
                        ?.map((child: any) => child.text)
                        .join(' ') || '';
                } else if (block._type === 'image') {
                    // Extract image metadata for translation
                    const imageUrl = block.asset?.url || '';
                    const altText = block.alt || '';
                    const caption = block.caption || '';

                    if (imageUrl) {
                        imagesHTML += `
                        <div class="image-block">
                            <img src="${imageUrl}" alt="${altText}" />
                            ${altText ? `<p><strong>Alt Text:</strong> ${altText}</p>` : ''}
                            ${caption ? `<p><strong>Caption:</strong> ${caption}</p>` : ''}
                        </div>`;
                    }

                    return [altText, caption].filter(Boolean).join(' ');
                }
                return '';
            }).filter(Boolean).join('\n');

            bodyText = bodyContent;
        }

        // Create HTML content for MotionPoint
        const htmlContent = `
        <html>
            <head><title>${doc.title || 'Document'}</title></head>
            <body>
                <h1>${doc.title || ''}</h1>
                <p>${doc.description || ''}</p>
                <p><strong>Author:</strong> ${doc.author || ''}</p>
                <div class="body-content">${bodyText || ''}</div>
                ${imagesHTML ? `<div class="images-content">${imagesHTML}</div>` : ''}
            </body>
        </html>
        `;

        const deserializedString = htmlContent;

        // Create an empty JSON object to store the locale/jobId combinations
        const jobIds: {[key: string]: string} = {};

        // Create a Translation job for each locale and store them in jobIds
        for(let i=0; i<localeIds.length; i++){
            let currentLocale = localeIds[i];

            try{
                // Create NEW FormData for each request (FormData gets consumed after first use)
                const formData = new FormData();

                // Convert document to a Blob and append to FormData
                const documentBlob = new Blob([deserializedString], {type : 'text/html'});
                formData.append('file', documentBlob, 'document.html');

                // Add contentType to FormData
                formData.append('contentType', 'text/html');

                // Add transactionReferenceId to FormData
                const ref = 'sanity-' + documentId;
                formData.append('transactionReferenceId', ref)

                // Add callbackUrl to FormData
                if (secrets?.callBack_url){
                    formData.append('callbackUrl', secrets?.callBack_url);
                }

                // Check for MT flow
                if(workflowUid == 'mt'){
                    formData.append('translationType', 'MT');
                }

                const response = await fetch(`${baseMotionPointUrl}/translationjobs`, {
                    method: 'POST',
                    headers: getCreateTaskHeaders(secrets, currentLocale, documentId),
                    body: formData
                });

                if (!response.ok){
                    const errorText = await response.text();
                    console.error(`❌ MotionPoint API Error (${response.status}):`, errorText);
                    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
                }

                const createdJob = await response.json();
                const createdJobId = (createdJob.id).toString();

                jobIds[currentLocale] = createdJobId;

            } catch (error){
                throw(error);
            }

        }

        const jobIdsString = JSON.stringify(jobIds);        

        return getTranslationTask(jobIdsString, secrets);       
    
  }
  
