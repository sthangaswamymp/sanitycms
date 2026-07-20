import {
  baseDocumentLevelConfig,
  baseFieldLevelConfig,
  Adapter,
  TranslationFunctionContext,
} from 'sanity-translations-tab'
import {MotionPointAdapter} from './MotionPointAdapter'
import { newImportTranslation } from './configuration/importTranslation'
import { exportForTranslation } from './configuration/exportForTranslation'
import { LazyTranslationsTab } from './LazyTranslationsTab'

export {
  findLatestDraft,
  BaseDocumentDeserializer,
  BaseDocumentSerializer,
  BaseDocumentMerger,
  defaultStopTypes,
  customSerializers,
  documentLevelPatch,
  fieldLevelPatch,
  TranslationsTab,
} from 'sanity-translations-tab'

export { LazyTranslationsTab }

interface ConfigOptions {
  adapter: Adapter
  secretsNamespace: string | null
  exportForTranslation: (
    id: string,
    context: TranslationFunctionContext    
  ) => Promise<Record<string, any>>
  importTranslation: (
    id: string,
    localeId: string,
    doc: string,
    context: TranslationFunctionContext
  ) => Promise<void>
  workflowOptions: [    
    {
      workflowUid: string,
      workflowName: string
    }
  ]
}

const defaultDocumentLevelConfig: ConfigOptions = {
  ...baseDocumentLevelConfig,
  adapter: MotionPointAdapter,
  exportForTranslation,
  importTranslation: newImportTranslation,
  secretsNamespace: 'motionPoint',
  workflowOptions: [
    {
      workflowUid: 'mt',
      workflowName: 'Machine Translation'
    }
  ]
}

const defaultFieldLevelConfig: ConfigOptions = {
  ...baseFieldLevelConfig,
  adapter: MotionPointAdapter,
  exportForTranslation,
  importTranslation: newImportTranslation,
  secretsNamespace: 'motionPoint',
  workflowOptions: [
    {
      workflowUid: 'mt',
      workflowName: 'Machine Translation'
    }
  ]
}

export {MotionPointAdapter, defaultDocumentLevelConfig, defaultFieldLevelConfig}
