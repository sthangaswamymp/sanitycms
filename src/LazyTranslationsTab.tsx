import React, {useState} from 'react'
import {Button, Card, Flex, Text} from '@sanity/ui'
import {TranslationsTab} from 'sanity-translations-tab'

export const LazyTranslationsTab = (props: any) => {
  const [loaded, setLoaded] = useState(false)

  if (!loaded) {
    return (
      <Card padding={4}>
        <Flex direction="column" gap={3} align="flex-start">
          <Text muted size={1}>
            Click below to load available languages and translation status.
          </Text>
          <Button
            tone="primary"
            text="Load Translations"
            onClick={() => setLoaded(true)}
          />
        </Flex>
      </Card>
    )
  }

  return <TranslationsTab {...props} />
}
