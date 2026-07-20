# @marketfully/sanity-plugin

> Sanity Studio v5/v6 plugin for [Marketfully](https://marketfully.com) (formerly MotionPoint) translation integration.

Allows editors to send Sanity documents for translation, monitor progress in real-time, and import completed translations back into the studio.

## Installation

```sh
npm install @marketfully/sanity-plugin
```

## Setup

### 1. Add your Marketfully credentials to your dataset

Create a file called `populateMarketfullySecrets.js` in your Studio folder:

```javascript
// populateMarketfullySecrets.js
// Do not commit this file to your repository

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-01-01'})

client.createOrReplace({
  _id: 'motionPoint.secrets',
  _type: 'motionPointSettings',
  project_id: 'YOUR_PROJECT_ID',
  base_language: 'en',
  username: 'YOUR_USERNAME',
  api_token: 'YOUR_API_TOKEN',
  sanity_project_id: 'YOUR_SANITY_PROJECT_ID',
  sanity_dataset: 'production',
  sanity_api_key: 'YOUR_SANITY_API_KEY',
})
```

Run it:

```sh
npx sanity exec populateMarketfullySecrets.js --with-user-token
```

Verify it was created using Vision Tool: `*[_id == 'motionPoint.secrets']`

### 2. Add the Translations tab to your desk structure

```javascript
import {DefaultDocumentNodeResolver} from 'sanity/desk'
import {TranslationsTab, defaultDocumentLevelConfig} from '@marketfully/sanity-plugin'

export const getDefaultDocumentNode: DefaultDocumentNodeResolver = (S, {schemaType}) => {
  if (schemaType === 'myTranslatableDocumentType') {
    return S.document().views([
      S.view.form(),
      S.view
        .component(TranslationsTab)
        .title('Translations')
        .options(defaultDocumentLevelConfig)
    ])
  }
  return S.document()
}
```

## Studio Experience

After adding the `TranslationsTab` your editors will see a **Translations** tab on each document. From there they can:

- **Send** documents to Marketfully for translation
- **Monitor** translation progress in real-time
- **Import** completed or partial translations back into Sanity

## Configuration Options

`defaultDocumentLevelConfig` and `defaultFieldLevelConfig` are available. Both accept the following options:

- `exportForTranslation` — function that serializes your document for translation
- `importTranslation` — function that patches translated content back into Sanity
- `adapter` — the Marketfully adapter (do not override unless you know what you're doing)
- `secretsNamespace` — namespace for your credentials document (default: `motionPoint`)
- `workflowOptions` — array of workflow options (e.g. Machine Translation)

## Compatibility

| Plugin version | Sanity Studio |
|---------------|---------------|
| `1.x` | v5, v6 |

## License

[MIT](LICENSE) © Marketfully

## Develop & Test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit).

```sh
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run watch
```
