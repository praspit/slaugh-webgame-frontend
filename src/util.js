import reorder from './reorder'

const hand = {
    id:'hand',
    title: 'Card In Hand',
    cardIds: []
}

const deck = {
    id:'deck',
    title: 'Place the card here',
    cardIds: []
}

export const initial = {
    columnOrder: [deck.id, hand.id],
    columns: {
        [deck.id]: deck,
        [hand.id]: hand
    },
    cards: []
}

const keepCard = {
    id:'keepCard',
    title: 'Card In Hand',
    cardIds: []
}

const sendCard = {
    id:'sendCard',
    title: 'Place the card that you want to exchange',
    cardIds: []
}

export const initialExchangeCard = {
    columnOrder: [sendCard.id, keepCard.id],
    columns: {
        [sendCard.id]: sendCard,
        [keepCard.id]: keepCard
    },
    cards: []
}

const withNewCardIds = (column, cardIds) => ({
  id: column.id,
  title: column.title,
  cardIds,
})

const reorderSingleDrag = ({
  entities,
  selectedCardIds,
  source,
  destination,
}) => {
  // moving in the same list
  if (source.droppableId === destination.droppableId) {
    const column = entities.columns[source.droppableId]
    const reordered = reorder(
      column.cardIds,
      source.index,
      destination.index,
    )

    const updated = {
      ...entities,
      columns: {
        ...entities.columns,
        [column.id]: withNewCardIds(column, reordered),
      },
    }

    return {
      entities: updated,
      selectedCardIds,
    }
  }

  // moving to a new list
  const home = entities.columns[source.droppableId]
  const foreign = entities.columns[destination.droppableId]

  // the id of the Card to be moved
  const cardId = home.cardIds[source.index]

  // remove from home column
  const newHomeCardIds = [...home.cardIds]
  newHomeCardIds.splice(source.index, 1)

  // add to foreign column
  const newForeignCardIds = [...foreign.cardIds]
  newForeignCardIds.splice(destination.index, 0, cardId)

  const updated = {
    ...entities,
    columns: {
      ...entities.columns,
      [home.id]: withNewCardIds(home, newHomeCardIds),
      [foreign.id]: withNewCardIds(foreign, newForeignCardIds),
    },
  }

  return {
    entities: updated,
    selectedCardIds,
  }
}

// type CardId = Id;

export const getHomeColumn = (entities, cardId) => {
  const columnId = entities.columnOrder.find((id) => {
    const column = entities.columns[id]
    return column.cardIds.includes(cardId)
  })

  if (!columnId) {
    console.error('Count not find column for Card', cardId, entities)
    throw new Error('boom')
  }

  return entities.columns[columnId]
}

const reorderMultiDrag = ({
  entities,
  selectedCardIds,
  source,
  destination,
}) => {
  const start = entities.columns[source.droppableId]
  const dragged = start.cardIds[source.index]

  const insertAtIndex = (() => {
    const destinationIndexOffset = selectedCardIds.reduce(
      (previous, current) => {
        if (current === dragged) {
          return previous
        }

        const final = entities.columns[destination.droppableId]
        const column = getHomeColumn(entities, current)

        if (column !== final) {
          return previous
        }

        const index = column.cardIds.indexOf(current)

        if (index >= destination.index) {
          return previous
        }

        // the selected item is before the destination index
        // we need to account for this when inserting into the new location
        return previous + 1
      },
      0,
    )

    const result = destination.index - destinationIndexOffset
    return result
  })()

  // doing the ordering now as we are required to look up columns
  // and know original ordering
  const orderedSelectedCardIds = [...selectedCardIds]
  orderedSelectedCardIds.sort(
    (a, b) => {
      // moving the dragged item to the top of the list
      if (a === dragged) {
        return -1
      }
      if (b === dragged) {
        return 1
      }

      // sorting by their natural indexes
      const columnForA = getHomeColumn(entities, a)
      const indexOfA = columnForA.cardIds.indexOf(a)
      const columnForB = getHomeColumn(entities, b)
      const indexOfB = columnForB.cardIds.indexOf(b)

      if (indexOfA !== indexOfB) {
        return indexOfA - indexOfB
      }

      // sorting by their order in the selectedCardIds list
      return -1
    },
  )

  // we need to remove all of the selected Cards from their columns
  const withRemovedCards = entities.columnOrder.reduce(
    (previous, columnId) => {
      const column = entities.columns[columnId]

      // remove the id's of the items that are selected
      const remainingCardIds = column.cardIds.filter(
        (id) => !selectedCardIds.includes(id),
      )

      previous[column.id] = withNewCardIds(column, remainingCardIds)
      return previous
    },
    entities.columns,
  )

  const final = withRemovedCards[destination.droppableId]
  const withInserted = (() => {
    const base = [...final.cardIds]
    base.splice(insertAtIndex, 0, ...orderedSelectedCardIds)
    return base
  })()

  // insert all selected Cards into final column
  const withAddedCards = {
    ...withRemovedCards,
    [final.id]: withNewCardIds(final, withInserted),
  }

  const updated = {
    ...entities,
    columns: withAddedCards,
  }

  return {
    entities: updated,
    selectedCardIds: orderedSelectedCardIds,
  }
}

export const multiDragAwareReorder = (args) => {
  if (args.selectedCardIds.length > 1) {
    return reorderMultiDrag(args)
  }
  return reorderSingleDrag(args)
}

export const multiSelectTo = (
  entities,
  selectedCardIds,
  newCardId,
) => {
  // Nothing already selected
  if (!selectedCardIds.length) {
    return [newCardId]
  }

  const columnOfNew = getHomeColumn(entities, newCardId)
  const indexOfNew = columnOfNew.cardIds.indexOf(newCardId)

  const lastSelected = selectedCardIds[selectedCardIds.length - 1]
  const columnOfLast = getHomeColumn(entities, lastSelected)
  const indexOfLast = columnOfLast.cardIds.indexOf(lastSelected)

  // multi selecting to another column
  // select everything up to the index of the current item
  if (columnOfNew !== columnOfLast) {
    return columnOfNew.cardIds.slice(0, indexOfNew + 1)
  }

  // multi selecting in the same column
  // need to select everything between the last index and the current index inclusive

  // nothing to do here
  if (indexOfNew === indexOfLast) {
    return null
  }

  const isSelectingForwards = indexOfNew > indexOfLast
  const start = isSelectingForwards ? indexOfLast : indexOfNew
  const end = isSelectingForwards ? indexOfNew : indexOfLast

  const inBetween = columnOfNew.cardIds.slice(start, end + 1)

  // everything inbetween needs to have it's selection toggled.
  // with the exception of the start and end values which will always be selected

  const toAdd = inBetween.filter(
    (cardId) => {
      // if already selected: then no need to select it again
      if (selectedCardIds.includes(cardId)) {
        return false
      }
      return true
    },
  )

  const sorted = isSelectingForwards ? toAdd : [...toAdd].reverse()
  const combined = [...selectedCardIds, ...sorted]

  return combined
}

const MODES = ["start", "single", "pair", "triple", "fourth"]
const CARD_VALUE = {'3C': 0, '3D': 1, '3H': 2, '3S': 3, '4C': 4, '4D': 5, '4H': 6, '4S': 7, '5C': 8, '5D': 9, '5H': 10, '5S': 11, '6C': 12, '6D': 13, '6H': 14, '6S': 15, '7C': 16, '7D': 17, '7H': 18, '7S': 19, '8C': 20, '8D': 21, '8H': 22, '8S': 23, '9C': 24, '9D': 25, '9H': 26, '9S': 27, '10C': 28, '10D': 29, '10H': 30, '10S': 31, 'JC': 32, 'JD': 33, 'JH': 34, 'JS': 35, 'QC': 36, 'QD': 37, 'QH': 38, 'QS': 39, 'KC': 40, 'KD': 41, 'KH': 42, 'KS': 43, 'AC': 44, 'AD': 45, 'AH': 46, 'AS': 47, '2C': 48, '2D': 49, '2H': 50, '2S': 51}

function cardCompare(c1, c2){
    return CARD_VALUE[c1] - CARD_VALUE[c2]
}

export function isLegalMove(cards, table) {
    let mode = MODES[cards.length]
    // sort the cards in descending order (define the value of a group of cards bu the max value card)
    cards.sort(cardCompare).reverse()
    // Checks if played cards have all the same faces
    for(let i=0 ; i<cards.length ; i++){
        if(cards[i][0] != cards[0][0]){
            return false
        }
    }
    // Cannot play 0 cards, system should make player pass
    if(mode == 'start'){
        return false
    }
    // Can play anything on the starting turn, as long as the cards have all the same faces
    if(table.mode == 'start'){
        return true
    }
    // Check if the cards values are valid to play
    switch(mode){
        case 'single' :

            if(table.mode == 'single'){
                return CARD_VALUE[cards[0]] > CARD_VALUE[table.top[0]]
            }else return false

        case 'pair' :

            if(table.mode == 'pair'){
                return CARD_VALUE[cards[0]] > CARD_VALUE[table.top[0]]
            }else return false

        case 'triple' :

            if(table.mode == 'single'){
                return true
            }else if(table.mode == 'triple'){
                return CARD_VALUE[cards[0]] > CARD_VALUE[table.top[0]]
            }else return false

        case 'fourth' :

            if(table.mode == 'pair'){
                return true
            }else if(table.mode == 'fourth'){
                return CARD_VALUE[cards[0]] > CARD_VALUE[table.top[0]]
            }else return false

        default :
            console.log('default clause')
            return false
            
    }
    
    
}