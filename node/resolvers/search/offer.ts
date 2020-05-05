import { propOr } from 'ramda'

const InstallmentsCriteria = {
  ALL: 'ALL',
  MAX: 'MAX',
  MIN: 'MIN',
  MAX_WITHOUT_INTEREST: 'MAX_WITHOUT_INTEREST',
  MAX_WITH_INTEREST: 'MAX_WITH_INTEREST',
}

const gte = (a: number, b: number) => a > b
const lte = (a: number, b: number) => a < b

export const resolvers = {
  Offer: {
    Installments: (
      { Installments }: CommertialOffer,
      { criteria, rates }: { criteria?: string; rates?: boolean }
    ) => {
      if (criteria === InstallmentsCriteria.ALL || Installments.length === 0) {
        return Installments
      }

      /** TODO: Transforms arguments for backwards-compatibility. Should be cleaned up in the future */
      if (criteria === InstallmentsCriteria.MAX_WITH_INTEREST || criteria === InstallmentsCriteria.MAX_WITHOUT_INTEREST){
        rates = criteria === InstallmentsCriteria.MAX_WITHOUT_INTEREST
        criteria = InstallmentsCriteria.MAX
      }

      const filteredInstallments = !rates
        ? Installments
        : Installments.filter(({ InterestRate }) => !InterestRate)

      const compareFunc = criteria === InstallmentsCriteria.MAX ? gte : lte
      const value = filteredInstallments.reduce(
        (acc, currentValue) =>
          compareFunc(
            currentValue.NumberOfInstallments,
            acc.NumberOfInstallments
          )
            ? currentValue
            : acc,
        filteredInstallments[0]
      )
      return [value]
    },
    teasers: propOr([], 'Teasers'),
    giftSkuIds: propOr([], 'GiftSkuIds'),
    gifts: async ({ GiftSkuIds }: CommertialOffer, _: any, ctx: Context) => {
      if (GiftSkuIds.length === 0) {
        return []
      }

      const catalogGiftProducts = await ctx.clients.search.productBySku(GiftSkuIds).catch(() => null)

      if (!catalogGiftProducts || catalogGiftProducts.length === 0) {
        return []
      }

      const giftProducts = GiftSkuIds.map(skuId => {
        let giftSku = null
        let giftProduct = null

        for (const currGiftProduct of catalogGiftProducts) {
          const currGiftSku = currGiftProduct.items.find(item => item.itemId === skuId)
          if (currGiftSku) {
            giftSku = currGiftSku
            giftProduct = currGiftProduct
            break
          }
        }
        if (!giftProduct || !giftSku) {
          return null
        }
        const {
          productName,
          brand,
          linkText,
          description,
        } = giftProduct
        return {
          productName,
          brand,
          linkText,
          description,
          skuName: giftSku?.nameComplete ?? '',
          images: giftSku?.images.map(({ imageLabel, imageUrl, imageText }) => ({
            imageUrl,
            imageLabel,
            imageText,
          })) ?? [],
        }
      })
      const filteredGiftProducts = giftProducts.filter(Boolean)

      return filteredGiftProducts
    },
    discountHighlights: propOr([], 'DiscountHighLight'),
    spotPrice: (offer: CommertialOffer) => {
      const sellingPrice = offer.Price
      const spotPrice: number | undefined = offer.Installments.find(({NumberOfInstallments, Value}) => {
        return (NumberOfInstallments === 1 && Value < sellingPrice)
      })?.Value;
      return spotPrice || sellingPrice
    }
  },
}
