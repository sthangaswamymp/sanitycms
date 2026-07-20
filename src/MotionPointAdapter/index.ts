import {Adapter} from 'sanity-translations-tab'

import {getLocales} from './getLocales'
import {getTranslationTask} from './getTranslationTask'
import {getTranslation} from './getTranslation'
import {createTask} from './createTask'

export const MotionPointAdapter: Adapter = {
  getLocales,
  getTranslationTask,
  createTask,
  getTranslation,
}
