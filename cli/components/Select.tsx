import type { ReactNode } from 'react'
import React, { Children, cloneElement, isValidElement } from 'react'
import { Box, Text, useInput } from 'ink'
import { useItemList } from 'use-item-list'

// Move highlightedX/Y?

export function Select({
  children,
  onChange,
}: {
  children: ReactNode
  onChange: (value: any) => void
}) {
  const itemList = useItemList({
    onSelect: (item) => onChange(item.value),
  })

  useInput((input, key) => {
    if (key.upArrow) {
      itemList.moveHighlightedItem(-1)
    }
    if (key.downArrow) {
      itemList.moveHighlightedItem(1)
    }
    // if (key.upArrow) {
    //   itemList.moveHighlightedRow(-1);
    // }
    // if (key.downArrow) {
    //   itemList.moveHighlightedRow(1);
    // }
    // if (key.leftArrow) {
    //   itemList.moveHighlightedColumn(-1);
    // }
    // if (key.rightArrow) {
    //   itemList.moveHighlightedColumn(1);
    // }
    if (key.return) {
      itemList.selectHighlightedItem()
    }
  })

  return (
    <Box display="flex" flexDirection="column">
      {Children.map(children, (child) =>
        isValidElement(child) ? cloneElement(child, { itemList }) : child
      )}
    </Box>
  )
}

export function Option({
  children,
  value,
  itemList,
}: {
  children: ReactNode
  value?: any
  itemList?: any
}) {
  const { useHighlighted } = itemList.useItem({ value })
  const highlighted = useHighlighted()
  return <Text color={highlighted ? 'yellow' : 'blue'}>{children}</Text>
}
