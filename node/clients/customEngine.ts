import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

/**
 * The client used for connecting with the Search Engine external API.
 * 
 * Don't forget to also add the host on the manifest.json's policies as well!
 */
export class customSearchEngineClient extends ExternalClient {
  private store: string

  public constructor(context: IOContext, options?: InstanceOptions) {
    super('https://api.customsearchengine.com/v1', context, options)

    const { account } = context
    this.store = account
  }

  /**
   *  This is where will be implemented the appropriate methods to retrieve data from the search engine API.
   * 
   *  Clients on VTEX IO may have retries, timeouts and cache configured. Check it on our documentation about Clients.
   * 
   * Also, don't forget to add the `metric` option when fetching HTTP. It may be used for billing purposes or to track problematic connections.
   * 
   * Example method:
   */

  public async suggestionSearches(args: SuggestionSearchesArgs): Promise<any> {
    const { term } = args

    const result = await this.http.get<any>(
      `${this.store}/api/suggestion_searches`,
      {
        params: {
          term,
        },
        metric: 'suggestion-searches',
      }
    )

    return result
  }

}
