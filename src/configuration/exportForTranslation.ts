import { TranslationFunctionContext } from 'sanity-translations-tab'

export const exportForTranslation = async (
  documentId: string,
  context: TranslationFunctionContext
): Promise<Record<string, any>> => {
  try {
    const doc = await context.client.fetch('*[_id == $id][0]', { id: documentId })
    console.log('Exporting document for translation: ', doc)
    return doc || {}
  } catch (error) {
    console.error('Error exporting document for translation:', error)
    throw error
  }
}
  