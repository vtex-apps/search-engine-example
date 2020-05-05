import crypto from 'crypto'
import { compose, last, split, toLower, zip } from 'ramda'
import { Functions } from '@gocommerce/utils'

import { searchSlugify, Slugify } from '../../utils/slug'

export enum SearchCrossSellingTypes {
  whoboughtalsobought = 'whoboughtalsobought',
  similars = 'similars',
  whosawalsosaw = 'whosawalsosaw',
  whosawalsobought = 'whosawalsobought',
  accessories = 'accessories',
  suggestions = 'suggestions',
}

const pageTypeMapping: Record<string, string> = {
  Brand: 'brand',
  Department: 'department',
  Category: 'category',
  SubCategory: 'subcategory',
  NotFound: 'search',
  FullText: 'search',
  Search: 'search',
}

const lastSegment = compose<string, string[], string>(
  last,
  split('/')
)

export const zipQueryAndMap = (query?: string | null, map?: string | null) => {
  const cleanQuery = query || ''
  const cleanMap = map || ''
  return zip(
    cleanQuery
      .toLowerCase()
      .split('/')
      .map(decodeURIComponent),
    cleanMap.split(',')
  )
}

export function hashMD5(text: string) {
  const hash = crypto.createHash('md5')
  return hash.update(text).digest('hex')
}

export function findCategoryInTree(
  tree: CategoryTreeResponse[],
  values: string[],
  index = 0
): CategoryTreeResponse | null {
  for (const node of tree) {
    const slug = lastSegment(node.url)
    if (slug.toUpperCase() === values[index].toUpperCase()) {
      if (index === values.length - 1) {
        return node
      }
      return findCategoryInTree(node.children, values, index + 1)
    }
  }
  return null
}

export const getBrandFromSlug = async (
  brandSlug: string,
  search: Context['clients']['search']
) => {
  const brands = await search.brands()
  return brands.find(
    brand =>
      brand.isActive &&
      (toLower(searchSlugify(brand.name)) === brandSlug ||
        toLower(Slugify(brand.name)) === brandSlug)
  )
}

type CategoryMap = Record<string, CategoryTreeResponse>

/**
 * We are doing this because the `get category` API is not returning the values
 * for slug and href. So we get the whole category tree and get that info from
 * there instead until the Search team fixes this issue with the category API.
 */
export async function getCategoryInfo(
  search: Context['clients']['search'],
  id: number,
  levels: number
) {
  const categories = await search.categories(levels)
  const mapCategories = categories.reduce(appendToMap, {}) as CategoryMap

  const category = mapCategories[id] || { url: '' }

  return category
}

export function buildCategoryMap(categoryTree: CategoryTreeResponse[]) {
  return categoryTree.reduce(appendToMap, {}) as CategoryMap
}

/**
 * That's a recursive function to fill an object like { [categoryId]: Category }
 * It will go down the category.children appending its children and so on.
 */
function appendToMap(
  mapCategories: CategoryMap,
  category: CategoryTreeResponse
) {
  mapCategories[category.id] = category

  mapCategories = category.children.reduce(appendToMap, mapCategories)

  return mapCategories
}

export function translatePageType(searchPageType: string): string {
  return pageTypeMapping[searchPageType] || 'search'
}

export const searchEncodeURI = (account: string) => (str: string) => {
  if (!Functions.isGoCommerceAcc(account)) {
    return str.replace(/[%"'.()]/g, (c: string) => {
      switch(c) {
        case '%':
          return "@perc@"
        case '"':
          return "@quo@"
        case '\'':
          return "@squo@"
        case '.':
          return "@dot@"
        case '(':
          return "@lpar@"
        case ')':
          return "@rpar@"
        default: {
           return c
        }
     }
    })
  }
  return str
}

export const getMapAndPriceRangeFromSelectedFacets = (
  selectedFacets: SelectedFacets[]
) => {
  const priceRangeIndex = selectedFacets.findIndex(
    facet => facet.key === 'priceRange'
  )
  const priceRange =
    priceRangeIndex > -1
      ? selectedFacets.splice(priceRangeIndex, 1)[0].value
      : undefined

  const map = selectedFacets.map(facet => facet.key).join(',')

  return [map, priceRange]
}