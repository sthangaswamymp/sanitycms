> This plugin supports **Sanity Studio v5** and **Sanity Studio v6**.

![MotionPoint Sanity plugin](https://bytebucket.org/MotionPoint/motionpoint-sanity-plugin/raw/02675975a7b8e63e11d2c8fe5bafdbc61e5423db/motionpoint-sanity.gif)

## Package Installation

```sh
npm install sanity-plugin-motionpoint
```

This plugin integrates your Sanity Studio with [MotionPoint](https://motionpoint.com) and facilitates seamless translation management by enabling you to dispatch content for translation, oversee the progress, and effortlessly retrieve the finalized translations upon completion.

Both **Human Translation** and **Machine Translation** are fully supported by this tool, as well as **automatically publishing** the localized documents to your Sanity Studio once translation is completed.

# Table of Contents

- [Quickstart](#quickstart)
- [Assumptions](#assumptions)
- [Studio experience](#studio-experience)
- [Overriding defaults](#overriding-defaults)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Develop and test](#develop-and-test)

## Quickstart

### MotionPoint's Connector Requirements

The MotionPoint connector requires the following:
1. A MotionPoint username
2. An API ID and an API access token

Both can be requested by contacting MotionPoint [here](https://www.motionpoint.com/contact/) or sales@motionpoint.com. Someone from our team will contact you about your inquiry within one business day.

### Installation Instructions

1. Navigate to your Sanity Studio folder and run the following command:

```sh
npm install sanity-plugin-motionpoint
```

2. Ensure the plugin has access to your MotionPoint secrets. You'll want to create a document that includes your project name, organization name, and a token with appropriate access.

[Please refer to the MotionPoint documentation on creating a token if you don't have one already.](https://motionpoint.com)

In your Studio folder, create a file called `populateMotionPointSecrets.js` with the following contents:

```javascript
// ./populateMotionPointSecrets.js
// Do not commit this file to your repository

import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-01-01'})

client.createOrReplace({
  // The `.` in this _id will ensure the document is private
  // even in a public dataset!
  _id: 'motionPoint.secrets',
  _type: 'motionPointSettings',
  // Replace these with your values
  project_id: 'YOUR_MOTIONPOINT_PROJECT_ID_HERE',
  base_language: 'YOUR_MOTIONPOINT_ORIGIN_LANGUAGE_HERE',
  username: 'YOUR_MOTIONPOINT_USERNAME_HERE',
  api_token: 'YOUR_MOTIONPOINT_TOKEN_HERE',
  sanity_project_id: 'YOUR_SANITY_PROJECT_ID_HERE',
  sanity_dataset: 'YOUR_SANITY_DATASET_HERE',
  sanity_api_key: 'YOUR_SANITY_API_KEY_HERE',
})
```

On the command line, run the file:

```sh
npx sanity exec populateMotionPointSecrets.js --with-user-token
```

Verify that the document was created using the Vision Tool in the Studio and query `*[_id == 'motionPoint.secrets']`. Note: If you have multiple datasets, you'll have to do this across all of them.

If the document was found in your dataset(s), delete `populateMotionPointSecrets.js`.

If you have concerns about this being exposed to authenticated users of your studio, you can control access to this path with [role-based access control](https://www.sanity.io/docs/access-control).

3. Get the MotionPoint tab on your desired document type using the [desk structure](https://www.sanity.io/docs/structure-builder-introduction). Here's an example:

```javascript
import {DefaultDocumentNodeResolver} from 'sanity/desk'
//...your other desk structure imports...
import {TranslationsTab, defaultDocumentLevelConfig} from 'sanity-plugin-motionpoint'

export const getDefaultDocumentNode: DefaultDocumentNodeResolver = (S, {schemaType}) => {
  if (schemaType === 'myTranslatableDocumentType') {
    return S.document().views([
      S.view.form(),
      //...my other views -- for example, live preview, the i18n plugin, etc.,
      S.view.component(TranslationsTab).title('MotionPoint').options(defaultDocumentLevelConfig)
    ])
  }
  return S.document()
}
```

And that should do it! Go into your studio, click around, and check the document in MotionPoint (it should be under its Sanity `_id`). Once it's translated, check the import by clicking the `Import` button on your MotionPoint tab!

## Assumptions

To use the default config mentioned above, we assume that you are following the conventions we outline in [our documentation on localization](https://www.sanity.io/docs/localization).

### Document level translations

Since we often find users want to use the [Document internationalization plugin](https://www.sanity.io/plugins/document-internationalization) if they're using document-level translations, we assume that any documents you want in different languages will follow the pattern `{id-of-base-language-document}__i18n_{locale}`

### Final note

It's okay if your data doesn't follow these patterns and you don't want to change them! You will simply have to override how the plugin gets and patches back information from your documents. Please see [Overriding defaults](#overriding-defaults).

## Studio experience

By adding the `TranslationsTab` to your desk structure, your users will now have an additional view. The boxes at the top of the tab can be used to send translations off to MotionPoint, and once those jobs are started, they should see progress bars monitoring the progress of the jobs. They can import a partial or complete job back.

## Overriding defaults

To personalize this configuration it's useful to know what arguments go into `TranslationsTab` as options (the `defaultConfigs` are just wrappers for these):

- `exportForTranslation`: a function that takes your document id and returns an object with `name`: the field you want to use to identify your doc in MotionPoint (by default this is `_id`) and `content`: a serialized HTML string of all the fields in your document to be translated.
- `importTranslation`: a function that takes in `id` (your document id), `localeId` (the locale of the imported language) and `document` the translated HTML from MotionPoint. It will deserialize your document back into an object that can be patched into your Sanity data, and then executes that patch.
- `Adapter`: An interface with methods to send things over to MotionPoint. You likely don't want to override this!

There are several reasons to override these functions. More general cases are often around ensuring documents serialize and deserialize correctly. Since the serialization functions are used across all our translation plugins currently, you can find some frequently encountered scenarios at [their repository here](https://github.com/sanity-io/sanity-naive-html-serializer), along with code examples for new config.

## Troubleshooting

### CORS Error — API calls blocked by browser

If you see an error like:

```
Access to fetch at 'https://api.motionpoint.com/...' has been blocked by CORS policy
```

This means your Sanity Studio domain has not been added to MotionPoint's list of allowed origins. The MotionPoint API uses a CORS allowlist to control which domains can make browser-based requests.

**To resolve this**, contact MotionPoint support at [support@motionpoint.com](mailto:support@motionpoint.com) or through your account representative and provide the URL of your deployed Sanity Studio (e.g. `https://your-studio.sanity.studio`). They will add it to the allowed origins configuration.

Common domains to provide:
- Your production Studio URL (e.g. `https://your-studio.sanity.studio`)
- Your local development URL (e.g. `http://localhost:3333`) — for development environments

> **Note:** This is a one-time setup per Studio domain. Once added, API calls from your Studio will work without any code changes.

## License

[MIT](LICENSE) © MotionPoint

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.

### Release new version

```sh
cd plugin
npm run build
npm publish
```

Ensure you are logged in to npm as an authorized maintainer before publishing.
